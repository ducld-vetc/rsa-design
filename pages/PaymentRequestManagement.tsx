import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  FileSpreadsheet,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { CombinedSearchBar } from './rescue-partner-admin/adminUi';
import {
  MOCK_PAYMENT_REQUEST_LIST,
  PaymentRequestListItem,
  PAYMENT_REQUEST_STATUS_CONFIG,
  ATTACHMENT_STATUS_CONFIG,
  ORDER_TYPE_CONFIG,
  formatAdvancePayers,
} from '../data/paymentRequestMockData';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type QuickSearchField = 'orderId' | 'plate' | 'phone';

const QUICK_SEARCH_OPTIONS: { value: QuickSearchField; label: string }[] = [
  { value: 'orderId', label: 'Mã đơn hàng' },
  { value: 'plate', label: 'Biển số xe' },
  { value: 'phone', label: 'Số điện thoại' },
];

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

const formatCurrency = (value: number): string =>
  value.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDisplayDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDefaultToDate = (): string => formatDisplayDate(new Date());

const getDefaultFromDate = (): string => {
  const from = new Date();
  from.setDate(from.getDate() - 1);
  return formatDisplayDate(from);
};

const PaymentRequestManagement: React.FC = () => {
  const navigate = useNavigate();

  const [draftField, setDraftField] = useState<QuickSearchField>('orderId');
  const [draftValue, setDraftValue] = useState('');
  const [searchField, setSearchField] = useState<QuickSearchField>('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [attachmentFilter, setAttachmentFilter] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [paymentRequestStatusFilter, setPaymentRequestStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [toDate, setToDate] = useState(getDefaultToDate);
  const [providerTypeFilter, setProviderTypeFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const advancedCount = [
    attachmentFilter,
    requestStatusFilter,
    paymentRequestStatusFilter,
    providerTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
    fromDate !== getDefaultFromDate() ? fromDate : '',
    toDate !== getDefaultToDate() ? toDate : '',
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(searchValue) || advancedCount > 0;

  const filteredData = useMemo(() => {
    const keyword = searchValue.toLowerCase();
    return MOCK_PAYMENT_REQUEST_LIST.filter((record) => {
      if (keyword) {
        if (searchField === 'orderId' && !record.orderId.toLowerCase().includes(keyword)) return false;
        if (searchField === 'plate' && !record.vehicle.plate.toLowerCase().includes(keyword)) return false;
        if (
          searchField === 'phone' &&
          !record.vehicle.phone.includes(searchValue) &&
          !(record.phone?.includes(searchValue))
        ) {
          return false;
        }
      }
      if (attachmentFilter) {
        const label = ATTACHMENT_STATUS_CONFIG[record.attachmentStatus].label;
        if (label !== attachmentFilter) return false;
      }
      if (requestStatusFilter) {
        const label = PAYMENT_REQUEST_STATUS_CONFIG[record.status].label;
        if (label !== requestStatusFilter) return false;
      }
      if (paymentRequestStatusFilter) {
        const label = PAYMENT_REQUEST_STATUS_CONFIG[record.status].label;
        if (label !== paymentRequestStatusFilter) return false;
      }
      if (providerTypeFilter && record.providerType !== providerTypeFilter) return false;
      if (providerFilter && record.provider !== providerFilter) return false;
      if (stationFilter && record.rescueStation.name !== stationFilter) return false;
      if (orderTypeFilter) {
        const label = ORDER_TYPE_CONFIG[record.orderType].label;
        if (label !== orderTypeFilter && (orderTypeFilter === 'ĐƠN LẺ' ? record.orderType !== 'single' : record.orderType !== 'package')) {
          return false;
        }
      }
      return true;
    });
  }, [
    searchField,
    searchValue,
    attachmentFilter,
    requestStatusFilter,
    paymentRequestStatusFilter,
    providerTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
  ]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchField,
    searchValue,
    attachmentFilter,
    requestStatusFilter,
    paymentRequestStatusFilter,
    providerTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
    pageSize,
  ]);

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

  const resetAdvanced = () => {
    setAttachmentFilter('');
    setRequestStatusFilter('');
    setPaymentRequestStatusFilter('');
    setFromDate(getDefaultFromDate());
    setToDate(getDefaultToDate());
    setProviderTypeFilter('');
    setProviderFilter('');
    setStationFilter('');
    setOrderTypeFilter('');
  };

  const handleClearFilters = () => {
    setDraftField('orderId');
    setDraftValue('');
    setSearchField('orderId');
    setSearchValue('');
    resetAdvanced();
  };

  const applySearch = () => {
    setSearchField(draftField);
    setSearchValue(draftValue.trim());
  };

  const handleViewDetail = (record: PaymentRequestListItem) => {
    navigate(`/payment-request-management/${record.orderId}`);
  };

  const handleViewPaymentRequest = (record: PaymentRequestListItem) => {
    navigate(`/payment-request-management/${record.orderId}?view=1`, { state: { viewOnly: true } });
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  const inputClass =
    'w-full h-[34px] border rounded px-3 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
  const selectClass = `${inputClass} bg-white`;
  const compactPrimary =
    'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded bg-vetc-green px-3 text-xs font-bold text-white hover:bg-green-700';
  const compactOutline =
    'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green disabled:cursor-not-allowed disabled:opacity-40';

  const renderCell = (value: string | null | undefined) => {
    if (!value) return <span className="text-gray-400">—</span>;
    return <span className="text-gray-600">{value}</span>;
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Tạo đề nghị thanh toán</h1>

      <div className="flex flex-wrap items-center gap-2">
        <CombinedSearchBar
          field={draftField}
          value={draftValue}
          options={QUICK_SEARCH_OPTIONS}
          onFieldChange={(next) => {
            setDraftField(next);
            setDraftValue('');
          }}
          onValueChange={setDraftValue}
          onSubmit={applySearch}
        />
        <button type="button" onClick={() => setAdvancedOpen(true)} className={compactOutline}>
          <SlidersHorizontal size={14} />
          <span>Nâng cao</span>
          {advancedCount > 0 && (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-vetc-green px-1 text-[10px] text-white">
              {advancedCount}
            </span>
          )}
        </button>
        <button type="button" onClick={applySearch} className={compactPrimary}>
          <Search size={14} />
          <span>Tìm kiếm</span>
        </button>
        <button type="button" onClick={handleClearFilters} disabled={!hasActiveFilters} className={compactOutline}>
          <Trash2 size={14} />
          <span>Xóa lọc</span>
        </button>
        <button type="button" className={compactPrimary}>
          <FileSpreadsheet size={14} />
          <span>Xuất Excel</span>
        </button>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
        <SectionHeader title="Danh sách đơn hàng" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
          <table className="w-full text-xs border-separate border-spacing-0 min-w-[1840px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r sticky left-0 z-20 bg-gray-50">STT</th>
                <th className="px-3 py-2 text-center w-20 min-w-[80px] font-bold border-r sticky left-10 z-30 bg-gray-50 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">Thao tác</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Mã đơn hàng</th>
                <th className="px-3 py-2 text-center font-bold border-r w-28">Trạng thái</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[140px]">Lý do từ chối</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Đơn vị cứu hộ</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Trạm cứu hộ</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Phương tiện được cứu hộ</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">NCC</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">Khách hàng</th>
                <th className="px-3 py-2 text-right font-bold border-r w-32">Người tạm ứng</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Người hoàn ứng</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Ngày cập nhật</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Người cập nhật</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Ngày tạo</th>
                <th className="px-3 py-2 text-left font-bold w-28">Người tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((record, index) => {
                const statusConfig = PAYMENT_REQUEST_STATUS_CONFIG[record.status];
                const orderTypeConfig = ORDER_TYPE_CONFIG[record.orderType];
                const isOddRow = index % 2 === 1;
                const rowBgClass = isOddRow ? 'bg-gray-50' : 'bg-white';
                const stickyCellClass = `${rowBgClass} group-hover:bg-gray-100`;

                return (
                  <tr
                    key={record.id}
                    className={`group transition-colors align-top hover:bg-gray-100 ${rowBgClass}`}
                  >
                    <td
                      className={`px-3 py-3 text-center border-r text-gray-600 sticky left-0 z-20 ${stickyCellClass}`}
                    >
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td
                      className={`px-3 py-3 border-r sticky left-10 z-30 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${stickyCellClass}`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(record)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Tạo/Chỉnh sửa đề nghị thanh toán"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleViewPaymentRequest(record)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Xem chi tiết đề nghị thanh toán"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r align-top">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(record)}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {record.orderId}
                      </button>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border whitespace-nowrap ${orderTypeConfig.className}`}
                        >
                          {orderTypeConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r align-top text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r align-top">{renderCell(record.rejectionReason)}</td>
                    <td className="px-3 py-3 border-r align-top">
                      <div className="font-medium text-gray-800">{record.rescueUnit.name}</div>
                      <div className="text-gray-500 mt-0.5">{record.rescueUnit.phone}</div>
                    </td>
                    <td className="px-3 py-3 border-r align-top">
                      <div className="font-medium text-gray-800">{record.rescueStation.name}</div>
                      <div className="text-gray-500 mt-0.5">{record.rescueStation.phone}</div>
                    </td>
                    <td className="px-3 py-3 border-r align-top">
                      <div className="font-bold text-gray-800">{record.vehicle.plate}</div>
                      <div className="text-gray-600 mt-0.5">
                        {record.vehicle.owner} | {record.vehicle.phone}
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r align-top text-right tabular-nums font-medium text-gray-800">
                      {record.nccPayable > 0 ? formatCurrency(record.nccPayable) : renderCell('')}
                    </td>
                    <td className="px-3 py-3 border-r align-top text-right tabular-nums font-medium text-gray-800">
                      {record.customerPayable > 0 ? formatCurrency(record.customerPayable) : renderCell('')}
                    </td>
                    <td className="px-3 py-3 border-r align-top text-right tabular-nums font-medium text-gray-800">
                      {record.advancerPayable > 0 ? formatCurrency(record.advancerPayable) : renderCell('')}
                    </td>
                    <td className="px-3 py-3 border-r align-top text-gray-700">
                      {renderCell(formatAdvancePayers([record.refundReimburseBy, record.supplierReimburseBy]))}
                    </td>
                    <td className="px-3 py-3 border-r align-top">{renderCell(record.updatedAt)}</td>
                    <td className="px-3 py-3 border-r align-top">{renderCell(record.updatedBy)}</td>
                    <td className="px-3 py-3 border-r align-top">{renderCell(record.createdAt)}</td>
                    <td className="px-3 py-3 align-top">{renderCell(record.createdBy)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Đang xem {rangeStart} đến {rangeEnd} trong {totalItems} mục
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {pageItems.map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage(item)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    currentPage === item
                      ? 'bg-vetc-green text-white shadow-sm'
                      : 'bg-white border text-gray-600 hover:border-vetc-green'
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1 text-xs bg-white outline-none focus:border-vetc-green"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {advancedOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/30" onClick={() => setAdvancedOpen(false)}>
          <aside
            className="flex h-full w-full max-w-sm flex-col bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            aria-label="Lọc nâng cao"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-black text-gray-900">Lọc nâng cao</p>
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div>
                <label className={labelClass}>File đính kèm</label>
                <select value={attachmentFilter} onChange={(event) => setAttachmentFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Chưa có file">Chưa có file</option>
                  <option value="Đã đủ file">Đã đủ file</option>
                  <option value="Đã có hóa đơn">Đã có hóa đơn</option>
                  <option value="Đã có hình ảnh CK">Đã có hình ảnh CK</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tình trạng yêu cầu</label>
                <select value={requestStatusFilter} onChange={(event) => setRequestStatusFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Chưa tạo">Chưa tạo</option>
                  <option value="Nháp">Nháp</option>
                  <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                  <option value="Chờ thanh toán">Chờ thanh toán</option>
                  <option value="Đã phê duyệt">Đã phê duyệt</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Trạng thái ĐNTT</label>
                <select
                  value={paymentRequestStatusFilter}
                  onChange={(event) => setPaymentRequestStatusFilter(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Tất cả</option>
                  <option value="Chưa tạo">Chưa tạo</option>
                  <option value="Nháp">Nháp</option>
                  <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                  <option value="Chờ thanh toán">Chờ thanh toán</option>
                  <option value="Đã phê duyệt">Đã phê duyệt</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Từ ngày</label>
                  <div className="relative">
                    <input value={fromDate} onChange={(event) => setFromDate(event.target.value)} className={`${inputClass} pr-8`} />
                    <Calendar size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Đến ngày</label>
                  <div className="relative">
                    <input value={toDate} onChange={(event) => setToDate(event.target.value)} className={`${inputClass} pr-8`} />
                    <Calendar size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Loại đối tác cứu hộ</label>
                <select value={providerTypeFilter} onChange={(event) => setProviderTypeFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Đối tác">Đối tác</option>
                  <option value="Nội bộ">Nội bộ</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Đối tác cứu hộ</label>
                <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Carpla Service Hà Nội">Carpla Service Hà Nội</option>
                  <option value="Cứu hộ 116 Hà Nội">Cứu hộ 116 Hà Nội</option>
                  <option value="Garage Thăng Long">Garage Thăng Long</option>
                  <option value="CARPLA - CARPLA SERVICE">CARPLA - CARPLA SERVICE</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Trạm cứu hộ</label>
                <select value={stationFilter} onChange={(event) => setStationFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Carpla Service Hà Đông">Carpla Service Hà Đông</option>
                  <option value="Carpla Service - CN Hà Nội">Carpla Service - CN Hà Nội</option>
                  <option value="Trạm cứu hộ Long Biên">Trạm cứu hộ Long Biên</option>
                  <option value="Trạm cứu hộ Thanh Xuân">Trạm cứu hộ Thanh Xuân</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Loại đơn</label>
                <select value={orderTypeFilter} onChange={(event) => setOrderTypeFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="ĐƠN LẺ">Đơn lẻ</option>
                  <option value="ĐƠN GÓI">Đơn gói</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button type="button" onClick={resetAdvanced} className={`${compactOutline} flex-1 justify-center`}>
                Xóa lọc
              </button>
              <button type="button" onClick={() => setAdvancedOpen(false)} className={`${compactPrimary} flex-1 justify-center`}>
                Áp dụng
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default PaymentRequestManagement;
