import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Edit3,
  Link2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface BusinessRecord {
  id: number;
  code: string;
  name: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  taxId: string;
  customerGroup: 'OEM' | 'Tài chính' | 'Bảo hiểm' | 'Khác';
  customerType: 'B2B' | 'Phân phối' | 'Chiến lược';
  parentEnterprise: string | null;
  customerTier: 'Tiêu chuẩn' | 'VIP' | 'Hợp đồng';
  status: 'active' | 'inactive';
  updatedAt: string;
  updatedBy: string;
  createdAt: string;
  createdBy: string;
}

const BASE_MOCK_BUSINESSES: BusinessRecord[] = [
  {
    id: 1,
    code: 'DN001',
    name: 'CÔNG TY TNHH DỊCH VỤ VETC',
    address: 'Tầng 12, Tòa nhà VETC Tower, 18 Tam Trinh, Hai Bà Trưng, Hà Nội',
    contactName: 'NGUYỄN VĂN MINH',
    contactPhone: '0243 123 4567',
    contactEmail: 'minh.nv@vetc.com.vn',
    taxId: '0101234567',
    customerGroup: 'OEM',
    customerType: 'B2B',
    parentEnterprise: null,
    customerTier: 'VIP',
    status: 'active',
    updatedAt: '25/08/2025 14:30:12',
    updatedBy: 'admin_vetc',
    createdAt: '15/01/2025 09:00:00',
    createdBy: 'system',
  },
  {
    id: 2,
    code: 'DN002',
    name: 'FORD VIỆT NAM',
    address: 'Lô B2, KCN Long Bình, Phường Long Bình, TP. Thủ Đức, TP. HCM',
    contactName: 'TRẦN THỊ HƯƠNG',
    contactPhone: '0283 456 7890',
    contactEmail: 'huong.tt@ford.com.vn',
    taxId: '0309876543',
    customerGroup: 'OEM',
    customerType: 'Chiến lược',
    parentEnterprise: 'FORD MOTOR COMPANY',
    customerTier: 'Hợp đồng',
    status: 'active',
    updatedAt: '24/08/2025 16:45:00',
    updatedBy: 'rsa_test1',
    createdAt: '20/02/2025 10:15:30',
    createdBy: 'admin_vetc',
  },
  {
    id: 3,
    code: 'DN003',
    name: 'TOYOTA VIỆT NAM',
    address: 'Phường Phúc Thắng, Thành phố Phúc Yên, Vĩnh Phúc',
    contactName: 'LÊ VĂN ĐỨC',
    contactPhone: '0211 567 8901',
    contactEmail: 'duc.lv@toyota.com.vn',
    taxId: '2500123456',
    customerGroup: 'OEM',
    customerType: 'Chiến lược',
    parentEnterprise: 'TOYOTA MOTOR CORPORATION',
    customerTier: 'Hợp đồng',
    status: 'active',
    updatedAt: '23/08/2025 11:20:45',
    updatedBy: 'rsa_test1',
    createdAt: '10/03/2025 08:30:00',
    createdBy: 'admin_vetc',
  },
  {
    id: 4,
    code: 'DN004',
    name: 'HONDA VIỆT NAM',
    address: 'KCN Phúc Thắng, Phường Phúc Thắng, Vĩnh Phúc',
    contactName: 'PHẠM THỊ LAN',
    contactPhone: '0211 678 9012',
    contactEmail: 'lan.pt@honda.com.vn',
    taxId: '2500654321',
    customerGroup: 'OEM',
    customerType: 'Phân phối',
    parentEnterprise: 'HONDA MOTOR CO., LTD.',
    customerTier: 'VIP',
    status: 'active',
    updatedAt: '22/08/2025 09:10:22',
    updatedBy: 'hieund2',
    createdAt: '05/04/2025 14:00:00',
    createdBy: 'admin_vetc',
  },
  {
    id: 5,
    code: 'DN005',
    name: 'CÔNG TY TNHH ABC LOGISTICS',
    address: 'Số 45 Nguyễn Xiển, Thanh Xuân, Hà Nội',
    contactName: 'HOÀNG VĂN NAM',
    contactPhone: '0901 234 567',
    contactEmail: 'nam.hv@abc-logistics.vn',
    taxId: '0108765432',
    customerGroup: 'Khác',
    customerType: 'B2B',
    parentEnterprise: null,
    customerTier: 'Tiêu chuẩn',
    status: 'inactive',
    updatedAt: '20/08/2025 17:00:00',
    updatedBy: 'admin_vetc',
    createdAt: '01/06/2025 11:30:00',
    createdBy: 'rsa_test1',
  },
];

const MOCK_BUSINESSES: BusinessRecord[] = Array.from({ length: 126 }, (_, index) => {
  const base = BASE_MOCK_BUSINESSES[index % BASE_MOCK_BUSINESSES.length];
  const id = index + 1;
  return {
    ...base,
    id,
    code: `DN${String(id).padStart(3, '0')}`,
    name: index < BASE_MOCK_BUSINESSES.length ? base.name : `${base.name} - CN ${id}`,
    taxId: `${base.taxId.slice(0, -3)}${String(id).padStart(3, '0')}`,
  };
});

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const buildPageItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

const CustomerTierBadge: React.FC<{ tier: BusinessRecord['customerTier'] }> = ({ tier }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
      tier === 'VIP'
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : tier === 'Hợp đồng'
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200'
    }`}
  >
    {tier}
  </span>
);

const BusinessInfoCell: React.FC<{ business: BusinessRecord }> = ({ business }) => (
  <div className="space-y-1.5">
    <div className="text-[12px] leading-tight">
      <span className="font-mono font-semibold text-gray-500">{business.code}</span>
      <span className="mx-1.5 text-gray-300">·</span>
      <span className="font-bold text-gray-900">{business.name}</span>
    </div>
    <div className="flex flex-wrap gap-1">
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        {business.customerGroup}
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
        {business.customerType}
      </span>
      <CustomerTierBadge tier={business.customerTier} />
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: BusinessRecord['status'] }> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
      Không hoạt động
    </span>
  );
};

const BusinessManagement: React.FC = () => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [status, setStatus] = useState('Hoạt động');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [goToPage, setGoToPage] = useState('');

  const hasActiveFilters = code || name || taxId || status !== 'Hoạt động';

  useEffect(() => {
    setCurrentPage(1);
  }, [code, name, taxId, status]);

  const filteredData = useMemo(() => {
    return MOCK_BUSINESSES.filter((b) => {
      if (code && !b.code.toLowerCase().includes(code.toLowerCase())) return false;
      if (name && !b.name.toLowerCase().includes(name.toLowerCase())) return false;
      if (taxId && !b.taxId.includes(taxId)) return false;
      if (status === 'Hoạt động' && b.status !== 'active') return false;
      if (status === 'Không hoạt động' && b.status !== 'inactive') return false;
      return true;
    });
  }, [code, name, taxId, status]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const pageItems = buildPageItems(currentPage, totalPages);

  const handleGoToPage = () => {
    const page = Number.parseInt(goToPage, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setGoToPage('');
  };

  const handleClearFilters = () => {
    setCode('');
    setName('');
    setTaxId('');
    setStatus('Hoạt động');
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  const inputClass = 'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Quản lý doanh nghiệp</h1>

      {/* Tra cứu */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <label className={labelClass}>Mã doanh nghiệp</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã doanh nghiệp"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Tên doanh nghiệp</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên doanh nghiệp"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Mã số thuế</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Nhập mã số thuế"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <Plus size={16} />
                <span>Thêm mới</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <FileSpreadsheet size={16} />
                <span>Xuất Excel</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
              >
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center space-x-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded font-bold text-sm hover:border-vetc-green hover:text-vetc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600"
              >
                <Trash2 size={14} className="text-blue-500" />
                <span>Xóa lọc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kết quả tìm kiếm */}
      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[1480px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                <th className="px-3 py-2 text-center w-20 font-bold border-r">Thao tác</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[220px]">Doanh nghiệp</th>
                <th className="px-3 py-2 text-center w-28 font-bold border-r">Trạng thái</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Địa chỉ</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Doanh nghiệp cha</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Liên hệ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Mã số thuế</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Ngày cập nhật</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Người cập nhật</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Ngày tạo</th>
                <th className="px-3 py-2 text-left font-bold w-28">Người tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((b, index) => (
                <tr
                  key={b.id}
                  className={`hover:bg-green-50/30 transition-colors ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}
                >
                  <td className="px-3 py-3 text-center border-r font-bold text-gray-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="px-3 py-3 text-center border-r">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Liên kết"
                      >
                        <Link2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <BusinessInfoCell business={b} />
                  </td>
                  <td className="px-3 py-3 text-center border-r align-top">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-3 py-3 border-r text-[11px] text-gray-600 leading-relaxed align-top">
                    {b.address}
                  </td>
                  <td className="px-3 py-3 border-r text-[11px] text-gray-600 align-top">
                    {b.parentEnterprise ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <div className="font-bold text-gray-900 text-[12px]">{b.contactName}</div>
                    <div className="text-gray-500 mt-1 text-[11px]">
                      <span className="text-gray-400">SĐT:</span> {b.contactPhone}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      <span className="text-gray-400">Email:</span> {b.contactEmail}
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r font-mono text-[11px] text-gray-700 align-top">{b.taxId}</td>
                  <td className="px-3 py-3 border-r text-[11px] text-gray-600 whitespace-nowrap align-top">{b.updatedAt}</td>
                  <td className="px-3 py-3 border-r text-[11px] text-gray-600 align-top">{b.updatedBy}</td>
                  <td className="px-3 py-3 border-r text-[11px] text-gray-600 whitespace-nowrap align-top">{b.createdAt}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-600 align-top">{b.createdBy}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-gray-400 text-sm">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-white flex flex-col xl:flex-row items-center justify-between gap-4 rounded-b-lg">
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {rangeStart}-{rangeEnd} của {totalItems} doanh nghiệp
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="min-w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {pageItems.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`min-w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                      currentPage === item
                        ? 'bg-green-50 text-vetc-green border border-vetc-green'
                        : 'text-gray-600 hover:border-vetc-green hover:text-vetc-green border border-transparent'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="min-w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none border border-gray-200 rounded pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-white outline-none focus:border-vetc-green cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Go to</span>
              <input
                type="text"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                className="w-12 border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none focus:border-vetc-green"
              />
              <span>Page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessManagement;
