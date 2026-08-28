import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Eye, FileSpreadsheet, Plus, Search, Trash2 } from 'lucide-react';
import {
  MOCK_RESCUE_PROVIDERS,
  PROVIDER_TYPE_LABEL,
  PROVIDER_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  type ProviderType,
  type RescueProviderRecord,
} from '../../data/rescuePartnerAdminMockData';
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
} from './adminUi';

const compact = (value: string) => value.toLowerCase().replace(/[\s.\-_]/g, '');

const includesText = (haystack: string, needle: string) => {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystack.toLowerCase().includes(n) || compact(haystack).includes(compact(needle));
};

type SearchField = 'name' | 'code' | 'phone' | 'tax' | 'company' | 'username';

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: 'name', label: 'Tên NCC' },
  { value: 'code', label: 'Mã NCC' },
  { value: 'phone', label: 'SĐT liên hệ' },
  { value: 'tax', label: 'MST' },
  { value: 'company', label: 'Công ty' },
  { value: 'username', label: 'Username' },
];

const providerFieldHaystack = (p: RescueProviderRecord, field: SearchField): string => {
  if (field === 'name') return p.name;
  if (field === 'code') return p.code;
  if (field === 'tax') return p.taxCode;
  if (field === 'company') return p.companyName;
  if (field === 'phone') return [p.contactPhone, p.otherPhone].join(' ');
  return [p.createdBy, p.updatedBy, p.contactName].join(' ');
};

const matchesSearchSlot = (p: RescueProviderRecord, field: SearchField, value: string) => {
  if (!value.trim()) return true;
  return includesText(providerFieldHaystack(p, field), value);
};

const RescueProviderList: React.FC = () => {
  const navigate = useNavigate();
  const [draftSearchField, setDraftSearchField] = useState<SearchField>('name');
  const [draftSearchValue, setDraftSearchValue] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftType, setDraftType] = useState('');
  const [draftService, setDraftService] = useState('');

  const [searchField, setSearchField] = useState<SearchField>('name');
  const [searchValue, setSearchValue] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [service, setService] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [goToPage, setGoToPage] = useState('');

  const hasActiveFilters = Boolean(searchValue.trim()) || status || type || service;

  const applySearch = () => {
    setSearchField(draftSearchField);
    setSearchValue(draftSearchValue);
    setStatus(draftStatus);
    setType(draftType);
    setService(draftService);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDraftSearchField('name');
    setDraftSearchValue('');
    setDraftStatus('');
    setDraftType('');
    setDraftService('');
    setSearchField('name');
    setSearchValue('');
    setStatus('');
    setType('');
    setService('');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return MOCK_RESCUE_PROVIDERS.filter((p) => {
      if (!matchesSearchSlot(p, searchField, searchValue)) return false;
      if (status && p.status !== status) return false;
      if (type && p.type !== type) return false;
      if (service && !p.serviceTypes.includes(service)) return false;
      return true;
    });
  }, [searchField, searchValue, status, type, service]);

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
      'Mã NCC',
      'Tên NCC',
      'Loại NCC',
      'Trạng thái',
      'Công ty',
      'Địa chỉ',
      'Người liên hệ',
      'SĐT',
      'SĐT khác',
      'Ngày tạo',
      'Người tạo',
      'Ngày cập nhật',
      'Người cập nhật',
    ];
    const rows = filteredData.map((p) =>
      [
        p.code,
        p.name,
        PROVIDER_TYPE_LABEL[p.type],
        p.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
        p.companyName,
        p.address,
        p.contactName,
        p.contactPhone,
        p.otherPhone,
        p.createdAt,
        p.createdBy,
        p.updatedAt,
        p.updatedBy,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh-sach-nha-cung-cap.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Nhà cung cấp</h1>

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
              <label className={filterLabelClass}>Loại NCC</label>
              <select value={draftType} onChange={(e) => setDraftType(e.target.value)} className={`${selectClass} flex-1`}>
                <option value="">Tất cả</option>
                {PROVIDER_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Loại hình DV</label>
              <select value={draftService} onChange={(e) => setDraftService(e.target.value)} className={`${selectClass} flex-1`}>
                <option value="">Tất cả</option>
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
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
              <button type="button" onClick={() => navigate('/admin/rescue-providers/new')} className={primaryBtnClass}>
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
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className={`${dataTableClass} min-w-[1280px]`}>
            <thead>
              <tr className={dataTheadRowClass}>
                <th className={`${dataThClass('center')} w-10`}>STT</th>
                <th className={`${dataThClass('center')} w-24`}>Thao tác</th>
                <th className={dataThClass('left')}>Nhà cung cấp</th>
                <th className={dataThClass('left')}>Loại NCC</th>
                <th className={`${dataThClass('center')} w-24`}>SL trạm</th>
                <th className={dataThClass('left')}>Địa chỉ</th>
                <th className={`${dataThClass('center')} w-28`}>Trạng thái</th>
                <th className={dataThClass('left')}>Người liên hệ</th>
                <th className={dataThClass('left')}>Ngày tạo</th>
                <th className={dataThClass('left')}>Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((p: RescueProviderRecord, index) => (
                <tr key={p.id} className={dataTbodyRowClass}>
                  <td className={`${dataTdClass('center')} font-medium`}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className={dataTdClass('center')}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-providers/${p.id}/edit`)}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-providers/${p.id}`)}
                        className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="font-bold text-gray-800">{p.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{p.code}</div>
                  </td>
                  <td className={dataTdClass('left')}>{PROVIDER_TYPE_LABEL[p.type as ProviderType]}</td>
                  <td className={dataTdClass('center')}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/rescue-stations?provider=${p.id}`)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {p.stationCount}
                    </button>
                  </td>
                  <td className={`${dataTdClass('left')} text-gray-600 leading-relaxed`}>{p.address}</td>
                  <td className={dataTdClass('center')}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className={dataTdClass('left')}>
                    {p.contactName || p.contactPhone ? (
                      <>
                        <div className="font-bold text-gray-800">{p.contactName || '—'}</div>
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">{p.contactPhone || '—'}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{p.createdAt}</div>
                    <div className="text-[10px] text-gray-500">{p.createdBy}</div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{p.updatedAt || '—'}</div>
                    <div className="text-[10px] text-gray-500">{p.updatedBy || '—'}</div>
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
          unitLabel="nhà cung cấp"
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

export default RescueProviderList;
