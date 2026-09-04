import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Copy,
  Eye,
  Edit3,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  rescueFeeTables,
  FEE_OBJECT_TYPE_LABELS,
  FEE_ORDER_TYPE_LABELS,
  FEE_STATUS_LABELS,
  FEE_TARGET_LABELS,
  FEE_CORPORATE_CUSTOMER_OPTIONS,
  FEE_PARTNER_OPTIONS,
  clonePriceTable,
  type FeeObjectType,
  type FeeTableStatus,
  type FeeTarget,
  type PriceTable,
} from '../data/rescueFeeMockData';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

const StatusBadge: React.FC<{ status: FeeTableStatus }> = ({ status }) => {
  const styles =
    status === 'ACTIVE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'EXPIRED'
        ? 'bg-gray-100 text-gray-600 border-gray-200'
        : 'bg-red-50 text-red-700 border-red-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${styles}`}>
      {FEE_STATUS_LABELS[status]}
    </span>
  );
};

const formatTableTypeLabel = (table: PriceTable): string => {
  const objectLabel = FEE_OBJECT_TYPE_LABELS[table.objectType];
  const orderLabel = FEE_ORDER_TYPE_LABELS[table.orderType];
  if (table.settings.isFallback) {
    return `${objectLabel} (fallback) · ${orderLabel}`;
  }
  return `${objectLabel} · ${orderLabel}`;
};

const RescueFeeConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<PriceTable[]>(rescueFeeTables);

  const [targetDraft, setTargetDraft] = useState<'all' | FeeTarget>('all');
  const [objectTypeDraft, setObjectTypeDraft] = useState<'all' | FeeObjectType>('all');
  const [statusDraft, setStatusDraft] = useState<'all' | FeeTableStatus>('all');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [corporateCustomerDraft, setCorporateCustomerDraft] = useState('all');
  const [partnerDraft, setPartnerDraft] = useState('all');

  const [target, setTarget] = useState<'all' | FeeTarget>('all');
  const [objectType, setObjectType] = useState<'all' | FeeObjectType>('all');
  const [status, setStatus] = useState<'all' | FeeTableStatus>('all');
  const [keyword, setKeyword] = useState('');
  const [corporateCustomer, setCorporateCustomer] = useState('all');
  const [partner, setPartner] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const inputClass =
    'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  const corporateCustomerFilterOptions = useMemo(() => {
    const map = new Map(FEE_CORPORATE_CUSTOMER_OPTIONS.map((item) => [item.code, item.name]));
    tables.forEach((table) => {
      const code = table.scope.corporateCustomerId;
      if (code && !map.has(code)) map.set(code, code);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [tables]);

  const partnerFilterOptions = useMemo(() => {
    const map = new Map(FEE_PARTNER_OPTIONS.map((item) => [item.id, item.name]));
    tables.forEach((table) => {
      const id = table.scope.partnerId;
      if (id && !map.has(id)) map.set(id, table.scope.partnerName ?? id);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tables]);

  const filtered = useMemo(() => {
    return tables.filter((t) => {
      if (target !== 'all' && t.target !== target) return false;
      if (objectType !== 'all' && t.objectType !== objectType) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (corporateCustomer !== 'all' && t.scope.corporateCustomerId !== corporateCustomer) return false;
      if (partner !== 'all' && t.scope.partnerId !== partner) return false;
      if (keyword) {
        const q = keyword.toLowerCase();
        if (
          !t.code.toLowerCase().includes(q) &&
          !t.name.toLowerCase().includes(q) &&
          !t.applyFor.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tables, target, objectType, status, keyword, corporateCustomer, partner]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [target, objectType, status, keyword, corporateCustomer, partner, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleSearch = () => {
    setTarget(targetDraft);
    setObjectType(objectTypeDraft);
    setStatus(statusDraft);
    setKeyword(keywordDraft.trim());
    setCorporateCustomer(corporateCustomerDraft);
    setPartner(partnerDraft);
  };

  const handleClear = () => {
    setTargetDraft('all');
    setObjectTypeDraft('all');
    setStatusDraft('all');
    setKeywordDraft('');
    setCorporateCustomerDraft('all');
    setPartnerDraft('all');
    setTarget('all');
    setObjectType('all');
    setStatus('all');
    setKeyword('');
    setCorporateCustomer('all');
    setPartner('all');
  };

  const handleDuplicate = (id: string) => {
    const copy = clonePriceTable(id);
    if (copy) {
      navigate('/rescue-fee-config/create', { state: { clonedTable: copy } });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cấu hình phí cứu hộ</h1>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className={labelClass}>Đối tượng tính</label>
              <select
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value as 'all' | FeeTarget)}
                className={`${inputClass} bg-white`}
              >
                <option value="all">Tất cả</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="PARTNER">Đối tác cứu hộ</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Loại đối tượng</label>
              <select
                value={objectTypeDraft}
                onChange={(e) => setObjectTypeDraft(e.target.value as 'all' | FeeObjectType)}
                className={`${inputClass} bg-white`}
              >
                <option value="all">Tất cả</option>
                {(Object.keys(FEE_OBJECT_TYPE_LABELS) as FeeObjectType[]).map((k) => (
                  <option key={k} value={k}>
                    {FEE_OBJECT_TYPE_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Mã/Tên bảng phí</label>
              <input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                className={inputClass}
                placeholder="Nhập mã hoặc tên bảng phí"
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Trạng thái</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as 'all' | FeeTableStatus)}
                className={`${inputClass} bg-white`}
              >
                <option value="all">Tất cả</option>
                {(Object.keys(FEE_STATUS_LABELS) as FeeTableStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {FEE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Doanh nghiệp</label>
              <select
                value={corporateCustomerDraft}
                onChange={(e) => setCorporateCustomerDraft(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="all">Tất cả</option>
                {corporateCustomerFilterOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Đối tác cứu hộ</label>
              <select
                value={partnerDraft}
                onChange={(e) => setPartnerDraft(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="all">Tất cả</option>
                {partnerFilterOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} — {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/rescue-fee-config/create')}
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Tạo bảng phí</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <FileSpreadsheet size={16} />
                <span>Xuất Excel</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 rounded border border-gray-300 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 text-xs uppercase tracking-wide">
                <th className="px-3 py-3 text-center font-bold w-20">Thao tác</th>
                <th className="px-3 py-3 text-left font-bold">Mã bảng</th>
                <th className="px-3 py-3 text-left font-bold">Tên bảng</th>
                <th className="px-3 py-3 text-left font-bold">Đối tượng</th>
                <th className="px-3 py-3 text-left font-bold">Loại bảng</th>
                <th className="px-3 py-3 text-left font-bold">Áp dụng</th>
                <th className="px-3 py-3 text-center font-bold">Phiên bản</th>
                <th className="px-3 py-3 text-center font-bold">Trạng thái</th>
                <th className="px-3 py-3 text-left font-bold">Hiệu lực</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    Không có bảng phí phù hợp
                  </td>
                </tr>
              ) : (
                paginated.map((table) => (
                  <tr key={table.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Xem"
                          onClick={() => navigate(`/rescue-fee-config/${table.id}`)}
                          className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          title="Sửa"
                          onClick={() => navigate(`/rescue-fee-config/edit/${table.id}`)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          title="Nhân bản phiên bản"
                          onClick={() => handleDuplicate(table.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{table.code}</td>
                    <td className="px-3 py-3 text-gray-700">{table.name}</td>
                    <td className="px-3 py-3 text-gray-700">{FEE_TARGET_LABELS[table.target]}</td>
                    <td className="px-3 py-3 text-gray-700">{formatTableTypeLabel(table)}</td>
                    <td className="px-3 py-3 text-gray-700">{table.applyFor}</td>
                    <td className="px-3 py-3 text-center text-gray-700">v{table.version}</td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={table.status} />
                    </td>
                    <td className="px-3 py-3 text-gray-700 whitespace-nowrap">
                      {table.validFrom} — {table.validTo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {totalItems === 0
              ? '0 bảng phí'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalItems)} của ${totalItems} bảng phí`}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 border rounded disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold">{currentPage}/{totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 border rounded disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescueFeeConfiguration;
