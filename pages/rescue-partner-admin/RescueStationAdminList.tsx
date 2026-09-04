import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit3, Eye, FileSpreadsheet, Plus, Search, Trash2 } from 'lucide-react';
import {
  ADMIN_PROVINCES,
  MOCK_RESCUE_PROVIDERS,
  MOCK_RESCUE_STATIONS_ADMIN,
  getStaffByStationId,
  getVehiclesByStationId,
  getWardsByProvince,
  stationContactsOf,
  type RescueStationAdminRecord,
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
import AppMultiSelect from '../../shared/AppMultiSelect';

const compact = (value: string) => value.toLowerCase().replace(/[\s.\-_]/g, '');

const includesText = (haystack: string, needle: string) => {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return haystack.toLowerCase().includes(n) || compact(haystack).includes(compact(needle));
};

type SearchField = 'name' | 'code' | 'username' | 'plate' | 'phone' | 'tax';

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: 'name', label: 'Tên trạm' },
  { value: 'code', label: 'Mã trạm' },
  { value: 'username', label: 'Username' },
  { value: 'plate', label: 'BSX' },
  { value: 'phone', label: 'SĐT liên hệ' },
  { value: 'tax', label: 'MST' },
];

const stationFieldHaystack = (s: RescueStationAdminRecord, field: SearchField): string => {
  if (field === 'name') return s.name;
  if (field === 'code') return s.code;
  if (field === 'tax') return s.taxCode;
  if (field === 'plate') return getVehiclesByStationId(s.id).map((v) => v.plate).join(' ');
  if (field === 'phone') {
    const contacts = stationContactsOf(s);
    const staffPhones = getStaffByStationId(s.id).map((st) => st.phone);
    return [s.contactPhone, s.otherPhone, ...contacts.map((c) => c.phone), ...staffPhones].join(' ');
  }
  const staff = getStaffByStationId(s.id);
  return staff
    .flatMap((st) => [st.code, st.code.toLowerCase().replace('-', '.'), st.fullname])
    .concat(s.createdBy, s.updatedBy)
    .join(' ');
};

const matchesSearchSlot = (s: RescueStationAdminRecord, field: SearchField | '', value: string) => {
  if (!field || !value.trim()) return true;
  return includesText(stationFieldHaystack(s, field), value);
};

const RescueStationAdminList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillProvider = searchParams.get('provider') ?? '';

  const [draftSearchField, setDraftSearchField] = useState<SearchField>('name');
  const [draftSearchValue, setDraftSearchValue] = useState('');
  const [draftPartners, setDraftPartners] = useState<string[]>(prefillProvider ? [prefillProvider] : []);
  const [draftStatus, setDraftStatus] = useState('');
  const [draftProvince, setDraftProvince] = useState('');
  const [draftWard, setDraftWard] = useState('');

  const [searchField, setSearchField] = useState<SearchField>('name');
  const [searchValue, setSearchValue] = useState('');
  const [partnerIds, setPartnerIds] = useState<string[]>(prefillProvider ? [prefillProvider] : []);
  const [status, setStatus] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [goToPage, setGoToPage] = useState('');

  useEffect(() => {
    if (prefillProvider) {
      setDraftPartners([prefillProvider]);
      setPartnerIds([prefillProvider]);
    }
  }, [prefillProvider]);

  const wards = useMemo(() => getWardsByProvince(draftProvince), [draftProvince]);

  const partnerOptions = useMemo(
    () => MOCK_RESCUE_PROVIDERS.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` })),
    [],
  );

  const hasActiveFilters =
    Boolean(searchValue.trim()) ||
    partnerIds.length > 0 ||
    status ||
    province ||
    ward;

  const applySearch = () => {
    setSearchField(draftSearchField);
    setSearchValue(draftSearchValue);
    setPartnerIds(draftPartners);
    setStatus(draftStatus);
    setProvince(draftProvince);
    setWard(draftWard);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDraftSearchField('name');
    setDraftSearchValue('');
    setDraftPartners([]);
    setDraftStatus('');
    setDraftProvince('');
    setDraftWard('');
    setSearchField('name');
    setSearchValue('');
    setPartnerIds([]);
    setStatus('');
    setProvince('');
    setWard('');
    setCurrentPage(1);
    navigate('/admin/rescue-stations', { replace: true });
  };

  const filteredData = useMemo(() => {
    return MOCK_RESCUE_STATIONS_ADMIN.filter((s) => {
      if (!matchesSearchSlot(s, searchField, searchValue)) return false;
      if (partnerIds.length > 0 && !partnerIds.includes(s.providerId)) return false;
      if (status && s.status !== status) return false;
      if (province && s.province !== province) return false;
      if (ward && s.ward !== ward) return false;
      return true;
    });
  }, [searchField, searchValue, partnerIds, status, province, ward]);

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
      'Mã trạm',
      'Tên trạm',
      'Đối tác cứu hộ',
      'SL user',
      'SL xe',
      'Địa chỉ',
      'Trạng thái',
      'Người liên hệ',
      'SĐT liên hệ',
      'Người liên hệ 2',
      'SĐT liên hệ 2',
      'Ngày tạo',
      'Người tạo',
      'Ngày cập nhật',
      'Người cập nhật',
    ];
    const rows = filteredData.map((s) => {
      const contacts = stationContactsOf(s);
      const c1 = contacts[0];
      const c2 = contacts[1];
      return [
        s.code,
        s.name,
        s.providerName,
        s.userCount,
        getVehiclesByStationId(s.id).length,
        s.address,
        s.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
        c1?.name ?? s.contactName,
        c1?.phone ?? s.contactPhone,
        c2?.name ?? '',
        c2?.phone ?? '',
        s.createdAt,
        s.createdBy,
        s.updatedAt,
        s.updatedBy,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danh-sach-tram-cuu-ho.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Trạm cứu hộ</h1>

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
              <label className={filterLabelClass}>Đối tác</label>
              <div className="relative min-w-0 flex-1">
                <AppMultiSelect
                  values={draftPartners}
                  options={partnerOptions}
                  onChange={setDraftPartners}
                  placeholder="Tất cả đối tác"
                  searchPlaceholder="Tìm đối tác..."
                />
              </div>
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
              <label className={filterLabelClass}>Tỉnh/TP</label>
              <select
                value={draftProvince}
                onChange={(e) => {
                  setDraftProvince(e.target.value);
                  setDraftWard('');
                }}
                className={`${selectClass} flex-1`}
              >
                <option value="">Tất cả</option>
                {ADMIN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <label className={filterLabelClass}>Xã/Phường</label>
              <select
                value={draftWard}
                disabled={!draftProvince}
                onChange={(e) => setDraftWard(e.target.value)}
                className={`${selectClass} flex-1`}
              >
                <option value="">Tất cả</option>
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
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
              <button type="button" onClick={() => navigate('/admin/rescue-stations/new')} className={primaryBtnClass}>
                <Plus size={16} />
                <span>Thêm mới</span>
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button type="button" onClick={handleClearFilters} disabled={!hasActiveFilters} className={`${outlineBtnClass} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600`}>
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
                <th className={dataThClass('left')}>Trạm cứu hộ</th>
                <th className={dataThClass('left')}>Đối tác cứu hộ</th>
                <th className={`${dataThClass('center')} w-20`}>SL user</th>
                <th className={`${dataThClass('center')} w-20`}>SL xe</th>
                <th className={dataThClass('left')}>Địa chỉ</th>
                <th className={`${dataThClass('center')} w-28`}>Trạng thái</th>
                <th className={dataThClass('left')}>Người liên hệ</th>
                <th className={dataThClass('left')}>Người liên hệ 2</th>
                <th className={dataThClass('left')}>Ngày tạo</th>
                <th className={dataThClass('left')}>Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((s: RescueStationAdminRecord, index) => {
                const contacts = stationContactsOf(s);
                const c1 = contacts[0];
                const c2 = contacts[1];
                const vehicleCount = getVehiclesByStationId(s.id).length;
                return (
                <tr key={s.id} className={dataTbodyRowClass}>
                  <td className={`${dataTdClass('center')} font-medium`}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className={dataTdClass('center')}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-stations/${s.id}/edit`)}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                        className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="font-bold text-gray-800">{s.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{s.code}</div>
                  </td>
                  <td className={dataTdClass('left')}>{s.providerName}</td>
                  <td className={dataTdClass('center')}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {s.userCount}
                    </button>
                  </td>
                  <td className={dataTdClass('center')}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {vehicleCount}
                    </button>
                  </td>
                  <td className={`${dataTdClass('left')} text-gray-600 leading-relaxed`}>{s.address}</td>
                  <td className={dataTdClass('center')}>
                    <StatusBadge status={s.status} />
                  </td>
                  <td className={dataTdClass('left')}>
                    {c1?.name || c1?.phone ? (
                      <>
                        <div className="font-bold text-gray-800">{c1.name || '—'}</div>
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">{c1.phone || '—'}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={dataTdClass('left')}>
                    {c2?.name || c2?.phone ? (
                      <>
                        <div className="font-bold text-gray-800">{c2.name || '—'}</div>
                        <div className="text-[10px] text-gray-500 whitespace-nowrap">{c2.phone || '—'}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{s.createdAt}</div>
                    <div className="text-[10px] text-gray-500">{s.createdBy}</div>
                  </td>
                  <td className={dataTdClass('left')}>
                    <div className="whitespace-nowrap">{s.updatedAt || '—'}</div>
                    <div className="text-[10px] text-gray-500">{s.updatedBy || '—'}</div>
                  </td>
                </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={12} className={`${dataTdClass('center')} py-8 text-gray-400`}>
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
          unitLabel="trạm cứu hộ"
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

export default RescueStationAdminList;
