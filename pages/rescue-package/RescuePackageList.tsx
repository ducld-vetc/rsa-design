import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit3, Eye, FileSpreadsheet, Package, Plus, Search, Trash2 } from 'lucide-react';
import {
  CORPORATE_ROLE_LABEL,
  MOCK_RESCUE_PACKAGES,
  PACKAGE_TYPE_LABEL,
  PACKAGE_TYPE_OPTIONS,
  TARGET_CUSTOMER_LABEL,
  TARGET_CUSTOMER_OPTIONS,
  formatVnd,
  type CorporateRole,
  type RescuePackageRecord,
  type TargetCustomer,
} from '../../data/rescuePackageMockData';
import { MOCK_CORPORATE_CUSTOMERS } from '../../data/rescueServiceMockData';
import {
  CombinedSearchBar,
  PAGE_SIZE_OPTIONS,
  PaginationBar,
  SectionHeader,
  StatusBadge,
  dataTableClass,
  dataTdClass,
  dataThClass,
  dataTheadRowClass,
  dataTbodyRowClass,
  filterLabelClass,
  outlineBtnClass,
  primaryBtnClass,
  selectClass,
} from '../rescue-partner-admin/adminUi';

const compact = (value: string) => value.toLowerCase().replace(/[\s.\-_]/g, '');

const includesText = (haystack: string, needle: string) => {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystack.toLowerCase().includes(n) || compact(haystack).includes(compact(needle));
};

type SearchField = 'code' | 'name' | 'description';

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: 'code', label: 'Mã gói' },
  { value: 'name', label: 'Tên gói' },
  { value: 'description', label: 'Mô tả' },
];

const fieldHaystack = (row: RescuePackageRecord, field: SearchField): string => {
  if (field === 'code') return row.packageCode;
  if (field === 'name') return row.name;
  return row.description;
};

const roleChipClass = (role: CorporateRole) => {
  if (role === 'CHANNEL') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (role === 'SPONSOR') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (role === 'CUSTOMER') return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-green-50 text-green-800 border-green-200';
};

const RescuePackageList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(() => (location.state as { notice?: string } | null)?.notice ?? '');

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if ((location.state as { notice?: string } | null)?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const [draftSearchField, setDraftSearchField] = useState<SearchField>('name');
  const [draftSearchValue, setDraftSearchValue] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftPackageType, setDraftPackageType] = useState('');
  const [draftTargetCustomer, setDraftTargetCustomer] = useState('');
  const [draftCorporateId, setDraftCorporateId] = useState('');

  const [searchField, setSearchField] = useState<SearchField>('name');
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('');
  const [packageType, setPackageType] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [corporateId, setCorporateId] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [goToPage, setGoToPage] = useState('');

  const hasActiveFilters =
    Boolean(searchValue.trim()) || status || packageType || targetCustomer || corporateId;

  const applySearch = () => {
    setSearchField(draftSearchField);
    setSearchValue(draftSearchValue);
    setStatus(draftStatus);
    setPackageType(draftPackageType);
    setTargetCustomer(draftTargetCustomer);
    setCorporateId(draftCorporateId);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDraftSearchField('name');
    setDraftSearchValue('');
    setDraftStatus('');
    setDraftPackageType('');
    setDraftTargetCustomer('');
    setDraftCorporateId('');
    setSearchField('name');
    setSearchValue('');
    setStatus('');
    setPackageType('');
    setTargetCustomer('');
    setCorporateId('');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return MOCK_RESCUE_PACKAGES.filter((row) => {
      if (searchValue.trim() && !includesText(fieldHaystack(row, searchField), searchValue)) return false;
      if (status && row.status !== status) return false;
      if (packageType && row.packageType !== packageType) return false;
      if (targetCustomer && row.targetCustomer !== targetCustomer) return false;
      if (corporateId && !row.corporates.some((item) => String(item.corporateCustomerId) === corporateId)) {
        return false;
      }
      return true;
    });
  }, [searchField, searchValue, status, packageType, targetCustomer, corporateId]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const handleGoToPage = () => {
    const page = Number.parseInt(goToPage, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) setCurrentPage(page);
    setGoToPage('');
  };

  const exportExcel = () => {
    const header = [
      'Mã gói',
      'Tên gói',
      'Loại gói',
      'Đối tượng',
      'Giá',
      'VAT (%)',
      'Thời hạn (tháng)',
      'Số dịch vụ',
      'Doanh nghiệp khai thác',
      'Trạng thái',
      'Prefix',
      'Ngày tạo',
      'Người tạo',
      'Ngày cập nhật',
      'Người cập nhật',
    ];
    const rows = filteredData.map((row) =>
      [
        row.packageCode,
        row.name,
        PACKAGE_TYPE_LABEL[row.packageType],
        TARGET_CUSTOMER_LABEL[row.targetCustomer],
        row.price,
        row.vat ?? '',
        row.durationValue ?? '',
        row.services.length,
        row.corporates
          .map((item) => `${item.corporateCustomerCode}/${item.role}`)
          .join('; '),
        row.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
        row.prefixPurchaseCode,
        row.createdAt,
        row.createdBy,
        row.updatedAt,
        row.updatedBy,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh-sach-goi-cuu-ho.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Cấu hình gói cứu hộ</h1>

      {notice && (
        <p className="text-sm text-vetc-green bg-green-50 border border-green-100 rounded px-3 py-2">{notice}</p>
      )}

      <div className="border rounded-lg shadow-sm bg-white overflow-visible">
        <div className="rounded-t-lg overflow-hidden">
          <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
            <div className="flex items-center gap-3 min-w-0 lg:col-span-2">
              <label className={filterLabelClass}>Tìm kiếm</label>
              <CombinedSearchBar
                field={draftSearchField}
                value={draftSearchValue}
                options={SEARCH_FIELD_OPTIONS}
                onFieldChange={(next) => {
                  setDraftSearchField(next);
                  setDraftSearchValue('');
                }}
                onValueChange={setDraftSearchValue}
                onSubmit={applySearch}
              />
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Trạng thái</label>
              <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} className={`${selectClass} flex-1`}>
                <option value="">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Loại gói</label>
              <select
                value={draftPackageType}
                onChange={(e) => setDraftPackageType(e.target.value)}
                className={`${selectClass} flex-1`}
              >
                <option value="">Tất cả</option>
                {PACKAGE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Đối tượng</label>
              <select
                value={draftTargetCustomer}
                onChange={(e) => setDraftTargetCustomer(e.target.value)}
                className={`${selectClass} flex-1`}
              >
                <option value="">Tất cả</option>
                {TARGET_CUSTOMER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Doanh nghiệp</label>
              <select
                value={draftCorporateId}
                onChange={(e) => setDraftCorporateId(e.target.value)}
                className={`${selectClass} flex-1`}
              >
                <option value="">Tất cả</option>
                {MOCK_CORPORATE_CUSTOMERS.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={exportExcel} className={primaryBtnClass}>
                <FileSpreadsheet size={16} />
                <span>Xuất Excel</span>
              </button>
              <button type="button" onClick={() => navigate('/admin/rescue-packages/new')} className={primaryBtnClass}>
                <Plus size={16} />
                <span>Thêm mới</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className={`${outlineBtnClass} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600`}
              >
                <Trash2 size={14} className="text-blue-500" />
                <span>Xóa lọc</span>
              </button>
              <button type="button" onClick={applySearch} className={primaryBtnClass}>
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
        <SectionHeader title="Kết quả tìm kiếm" icon={<Package size={16} />} />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className={`${dataTableClass} min-w-[1360px]`}>
            <thead>
              <tr className={dataTheadRowClass}>
                <th className={`${dataThClass('center')} w-10`}>STT</th>
                <th className={`${dataThClass('center')} w-24`}>Thao tác</th>
                <th className={dataThClass('left')}>Gói</th>
                <th className={dataThClass('left')}>Loại / đối tượng</th>
                <th className={`${dataThClass('right')} w-28`}>Giá</th>
                <th className={`${dataThClass('center')} w-24`}>Thời hạn</th>
                <th className={dataThClass('left')}>Dịch vụ / DN khai thác</th>
                <th className={`${dataThClass('center')} w-28`}>Trạng thái</th>
                <th className={dataThClass('left')}>Ngày tạo</th>
                <th className={dataThClass('left')}>Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={row.id} className={dataTbodyRowClass}>
                  <td className={`${dataTdClass('center')} font-medium`}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className={dataTdClass('center')}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-packages/${row.id}/edit`)}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-packages/${row.id}`)}
                        className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="font-bold text-gray-800">{row.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{row.packageCode}</div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.packageType === 'TRIP'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {row.packageType === 'TRIP' ? 'TRIP' : 'ALWAYS'}
                    </span>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {TARGET_CUSTOMER_LABEL[row.targetCustomer as TargetCustomer]}
                    </div>
                  </td>
                  <td className={`${dataTdClass('right')} whitespace-nowrap font-semibold`}>{formatVnd(row.price)}</td>
                  <td className={dataTdClass('center')}>
                    {row.durationValue != null ? `${row.durationValue} tháng` : '—'}
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="text-[11px] text-gray-700">
                      {row.services.length} dịch vụ
                    </div>
                    {row.corporates.length === 0 ? (
                      <div className="text-[10px] text-gray-400 mt-0.5">Chưa gắn DN</div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {row.corporates.map((item) => (
                          <span
                            key={item.id}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${roleChipClass(item.role)}`}
                          >
                            <span className="font-mono">{item.corporateCustomerCode}</span>
                            <span className="font-medium">{CORPORATE_ROLE_LABEL[item.role]}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={dataTdClass('center')}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{row.createdAt}</div>
                    <div className="text-[10px] text-gray-500">{row.createdBy || '—'}</div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{row.updatedAt || '—'}</div>
                    <div className="text-[10px] text-gray-500">{row.updatedBy || '—'}</div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className={`${dataTdClass('center')} py-8 text-gray-400`}>
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationBar
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalItems={totalItems}
          unitLabel="gói"
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          goToPage={goToPage}
          onGoToPageChange={setGoToPage}
          onGoToPage={handleGoToPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default RescuePackageList;
