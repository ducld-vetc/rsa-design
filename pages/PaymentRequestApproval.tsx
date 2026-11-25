import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  History,
  FileSpreadsheet,
  Paperclip,
  Printer,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { CombinedSearchBar } from './rescue-partner-admin/adminUi';
import {
  applyPaymentRequestStatus,
  ATTACHMENT_STATUS_CONFIG,
  getPaymentRequestPatchVersion,
  listPaymentRequests,
  ORDER_TYPE_CONFIG,
  PAYMENT_REQUEST_STATUS_CONFIG,
  PaymentRequestListItem,
  PaymentRequestStatus,
  subscribePaymentRequestPatches,
  formatAdvancePayers,
  buildPaymentRequestHistory,
} from '../data/paymentRequestMockData';
import PaymentRequestHistoryModal from '../shared/PaymentRequestHistoryModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const SERVICE_TYPES = ['Cứu hộ sự cố', 'Kéo xe', 'Sửa chữa lưu động'];
const ENTERPRISES = ['CÔNG TY TNHH Ô TÔ VINFAST', 'Công ty Cổ phần bảo hiểm Bưu điện - PTI'];
const DISTANCES = [0.11, 1.28, 6.1, 7, 3.4, 12];
const DEFAULT_FROM = '01/11/2026';
const DEFAULT_TO = '30/11/2026';

type QuickSearchField = 'orderId' | 'taxId' | 'invoice' | 'plate';

const QUICK_SEARCH_OPTIONS: { value: QuickSearchField; label: string }[] = [
  { value: 'orderId', label: 'Mã đơn hàng' },
  { value: 'taxId', label: 'Mã số thuế' },
  { value: 'invoice', label: 'Hóa đơn' },
  { value: 'plate', label: 'Biển số xe' },
];

const buildPageItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

const parseDisplayDate = (value: string) => {
  const [day, month, year] = value.trim().split('/').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day).getTime();
};

const recordDate = (value?: string) => (value ? parseDisplayDate(value.slice(0, 10)) : null);

interface ApprovalView {
  taxId: string;
  invoiceNumber: string;
  customerType: 'Cá nhân' | 'Doanh nghiệp';
  enterpriseName: string;
  rescueCode: string;
  distanceKm: number;
  serviceType: string;
}

const approvalView = (record: PaymentRequestListItem): ApprovalView => {
  const index = Number(record.id);
  const customerType = record.orderType === 'package' ? 'Doanh nghiệp' : 'Cá nhân';
  return {
    taxId: `011093849${index % 10}`,
    invoiceNumber: index % 3 === 0 ? '' : `HD${String(index).padStart(6, '0')}`,
    customerType,
    enterpriseName: customerType === 'Doanh nghiệp' ? ENTERPRISES[index % ENTERPRISES.length] : '',
    rescueCode: `2505241${index}`,
    distanceKm: DISTANCES[index % DISTANCES.length],
    serviceType: SERVICE_TYPES[index % SERVICE_TYPES.length],
  };
};

const downloadText = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const formatMoney = (value: number) => value.toLocaleString('vi-VN');

const formatCreatedAt = (value?: string) => {
  if (!value) return { date: '—', time: '' };
  const [date, time] = value.split(' ');
  return { date: `${date} -`, time: time ?? '' };
};

const PaymentRequestApproval: React.FC = () => {
  const navigate = useNavigate();
  useSyncExternalStore(subscribePaymentRequestPatches, getPaymentRequestPatchVersion);
  const records = listPaymentRequests();

  const [draftField, setDraftField] = useState<QuickSearchField>('orderId');
  const [draftValue, setDraftValue] = useState('');
  const [searchField, setSearchField] = useState<QuickSearchField>('orderId');
  const [searchValue, setSearchValue] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Chờ phê duyệt');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [enterpriseFilter, setEnterpriseFilter] = useState('');
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);
  const [orderFromDate, setOrderFromDate] = useState('');
  const [orderToDate, setOrderToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [rejectIds, setRejectIds] = useState<string[] | null>(null);
  const [historyRecord, setHistoryRecord] = useState<PaymentRequestListItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const providers = useMemo(
    () => Array.from(new Set(records.map((record) => record.rescueUnit.name))),
    [records],
  );
  const stations = useMemo(
    () => Array.from(new Set(records.map((record) => record.rescueStation.name))),
    [records],
  );

  const advancedCount = [
    statusFilter !== 'Chờ phê duyệt',
    customerTypeFilter,
    serviceTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
    enterpriseFilter,
    fromDate !== DEFAULT_FROM,
    toDate !== DEFAULT_TO,
    orderFromDate,
    orderToDate,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(searchValue || advancedCount);

  const filteredData = useMemo(() => {
    const from = parseDisplayDate(fromDate);
    const to = parseDisplayDate(toDate);
    const orderFrom = parseDisplayDate(orderFromDate);
    const orderTo = parseDisplayDate(orderToDate);
    const query = searchValue.trim().toLowerCase();
    return records.filter((record) => {
      const view = approvalView(record);
      const created = recordDate(record.createdAt);
      if (query) {
        const haystack =
          searchField === 'orderId'
            ? record.orderId
            : searchField === 'taxId'
              ? view.taxId
              : searchField === 'invoice'
                ? view.invoiceNumber
                : record.vehicle.plate;
        if (!haystack.toLowerCase().includes(query)) return false;
      }
      if (statusFilter && PAYMENT_REQUEST_STATUS_CONFIG[record.status].label !== statusFilter) return false;
      if (customerTypeFilter && view.customerType !== customerTypeFilter) return false;
      if (serviceTypeFilter && view.serviceType !== serviceTypeFilter) return false;
      if (providerFilter && record.rescueUnit.name !== providerFilter) return false;
      if (stationFilter && record.rescueStation.name !== stationFilter) return false;
      if (orderTypeFilter && ORDER_TYPE_CONFIG[record.orderType].label !== orderTypeFilter) return false;
      if (enterpriseFilter && view.enterpriseName !== enterpriseFilter) return false;
      if ((from || to) && created == null) return false;
      if (from && created != null && created < from) return false;
      if (to && created != null && created > to) return false;
      if ((orderFrom || orderTo) && created == null) return false;
      if (orderFrom && created != null && created < orderFrom) return false;
      if (orderTo && created != null && created > orderTo) return false;
      return true;
    });
  }, [
    records,
    searchField,
    searchValue,
    statusFilter,
    customerTypeFilter,
    serviceTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
    enterpriseFilter,
    fromDate,
    toDate,
    orderFromDate,
    orderToDate,
  ]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [
    searchField,
    searchValue,
    statusFilter,
    customerTypeFilter,
    serviceTypeFilter,
    providerFilter,
    stationFilter,
    orderTypeFilter,
    enterpriseFilter,
    fromDate,
    toDate,
    orderFromDate,
    orderToDate,
    pageSize,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);
  const pageItems = buildPageItems(currentPage, totalPages);
  const pageIds = paginatedData.map((record) => record.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const selectedRecords = records.filter((record) => selectedIds.includes(record.id));

  const togglePage = () => {
    setSelectedIds((current) =>
      allPageSelected ? current.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...current, ...pageIds])),
    );
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const resetAdvanced = () => {
    setStatusFilter('Chờ phê duyệt');
    setCustomerTypeFilter('');
    setServiceTypeFilter('');
    setProviderFilter('');
    setStationFilter('');
    setOrderTypeFilter('');
    setEnterpriseFilter('');
    setFromDate(DEFAULT_FROM);
    setToDate(DEFAULT_TO);
    setOrderFromDate('');
    setOrderToDate('');
  };

  const clearFilters = () => {
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

  const rowsOf = (source: PaymentRequestListItem[]) =>
    source.map((record) => {
      const view = approvalView(record);
      const crew = record.rescueCrew;
      return [
        record.orderId,
        PAYMENT_REQUEST_STATUS_CONFIG[record.status].label,
        record.rejectionReason ?? '',
        record.rescueUnit.name,
        crew?.plate ?? '',
        crew?.line ?? '',
        crew?.brand ?? '',
        view.customerType,
        `${view.distanceKm} km`,
        record.transferAmount == null ? '' : formatMoney(record.transferAmount),
        formatAdvancePayers([record.refundReimburseBy, record.supplierReimburseBy]),
        record.paymentDueDate ?? '',
        record.createdAt ?? '',
        record.createdBy ?? '',
      ];
    });

  const exportRows = (filename: string, source: PaymentRequestListItem[]) => {
    const header = [
      'Mã đơn hàng',
      'Trạng thái',
      'Lý do từ chối',
      'Nhà cung cấp',
      'Biển số xe cứu hộ',
      'Dòng xe',
      'Hãng xe',
      'Phân loại KH',
      'Khoảng cách cứu hộ',
      'Số tiền',
      'Người hoàn ứng',
      'Hạn đi tiền',
      'Ngày tạo',
      'Người tạo',
    ];
    const body = [header, ...rowsOf(source)].map((row) => row.map(csvCell).join(',')).join('\n');
    downloadText(filename, `\uFEFF${body}`);
    setNotice(`Đã xuất ${source.length} đơn.`);
  };

  const exportByPartner = () => {
    const groups = new Map<string, PaymentRequestListItem[]>();
    filteredData.forEach((record) => {
      const name = record.rescueUnit.name;
      groups.set(name, [...(groups.get(name) ?? []), record]);
    });
    const lines = ['Đối tác,Mã đơn hàng,Trạng thái,Phân loại KH,Khoảng cách cứu hộ,Người hoàn ứng'];
    groups.forEach((items, partner) => {
      items.forEach((record) => {
        const view = approvalView(record);
        lines.push(
          [partner, record.orderId, PAYMENT_REQUEST_STATUS_CONFIG[record.status].label, view.customerType, `${view.distanceKm} km`, formatAdvancePayers([record.refundReimburseBy, record.supplierReimburseBy])]
            .map(csvCell)
            .join(','),
        );
      });
    });
    downloadText('duyet-de-nghi-theo-doi-tac.csv', `\uFEFF${lines.join('\n')}`);
    setNotice(`Đã xuất Excel theo ${groups.size} đối tác.`);
  };

  const requireSelection = () => {
    if (selectedRecords.length === 0) {
      setNotice('Chọn ít nhất một đơn trong danh sách.');
      return false;
    }
    return true;
  };

  const applyStatus = (source: PaymentRequestListItem[], status: PaymentRequestStatus, reason?: string) => {
    const allowed: PaymentRequestStatus = status === 'paid' ? 'awaiting_payment' : 'pending_approval';
    const eligible = source.filter((record) => record.status === allowed);
    if (eligible.length === 0) {
      setNotice(
        status === 'paid'
          ? 'Chỉ xác nhận thanh toán với đơn đang Chờ thanh toán.'
          : 'Chỉ thao tác với đơn đang Chờ phê duyệt.',
      );
      return;
    }
    applyPaymentRequestStatus(
      eligible.map((record) => record.id),
      status,
      reason,
    );
    setSelectedIds((current) => current.filter((id) => !eligible.some((record) => record.id === id)));
    const label = PAYMENT_REQUEST_STATUS_CONFIG[status].label;
    setNotice(`Đã chuyển ${eligible.length} đơn sang ${label}.`);
  };

  const downloadAttachments = () => {
    if (!requireSelection()) return;
    const lines = ['Mã đơn hàng,File đính kèm'];
    selectedRecords.forEach((record) => {
      lines.push([record.orderId, ATTACHMENT_STATUS_CONFIG[record.attachmentStatus].label].map(csvCell).join(','));
    });
    downloadText('file-dinh-kem-de-nghi.csv', `\uFEFF${lines.join('\n')}`);
    setNotice(`Đã tải danh sách file của ${selectedRecords.length} đơn.`);
  };

  const printSlip = (record: PaymentRequestListItem) => {
    const crew = record.rescueCrew;
    const amount = record.transferAmount == null ? '—' : `${formatMoney(record.transferAmount)} đ`;
    const reimburseBy = formatAdvancePayers([record.refundReimburseBy, record.supplierReimburseBy]) || '—';
    const html = `<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><title>Phiếu đề nghị thanh toán ${record.orderId}</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; margin: 32px; }
  h1 { font-size: 18px; text-align: center; margin: 0 0 4px; }
  p.sub { text-align: center; color: #555; margin: 0 0 20px; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #ccc; padding: 8px 10px; text-align: left; }
  th { width: 220px; background: #f5f5f5; }
</style></head><body>
<h1>PHIẾU ĐỀ NGHỊ THANH TOÁN</h1>
<p class="sub">${record.orderId}</p>
<table>
<tr><th>Mã đơn hàng</th><td>${record.orderId}</td></tr>
<tr><th>Trạng thái</th><td>${PAYMENT_REQUEST_STATUS_CONFIG[record.status].label}</td></tr>
<tr><th>Nhà cung cấp</th><td>${record.rescueUnit.name}</td></tr>
<tr><th>Xe cứu hộ</th><td>${crew ? `${crew.plate} — ${crew.brand} | ${crew.line}` : '—'}</td></tr>
<tr><th>Số tiền</th><td>${amount}</td></tr>
<tr><th>Người hoàn ứng</th><td>${reimburseBy}</td></tr>
<tr><th>Hạn đi tiền</th><td>${record.paymentDueDate || '—'}</td></tr>
<tr><th>Ngày tạo</th><td>${record.createdAt || '—'}</td></tr>
<tr><th>Người tạo</th><td>${record.createdBy || '—'}</td></tr>
</table>
</body></html>`;
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=820,height=720');
    if (!popup) {
      setNotice('Trình duyệt đang chặn cửa sổ in phiếu.');
      return;
    }
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const openReject = (ids: string[]) => {
    const eligible = records.filter((record) => ids.includes(record.id) && record.status === 'pending_approval');
    if (eligible.length === 0) {
      setNotice('Chỉ từ chối đơn đang Chờ phê duyệt.');
      return;
    }
    setRejectIds(eligible.map((record) => record.id));
    setRejectReason('');
  };

  const confirmReject = () => {
    if (!rejectIds) return;
    if (!rejectReason.trim()) {
      setNotice('Nhập lý do từ chối.');
      return;
    }
    applyPaymentRequestStatus(rejectIds, 'rejected', rejectReason.trim());
    setSelectedIds((current) => current.filter((id) => !rejectIds.includes(id)));
    setNotice(`Đã từ chối ${rejectIds.length} đơn.`);
    setRejectIds(null);
    setRejectReason('');
  };

  const inputClass =
    'w-full h-[34px] border rounded px-3 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
  const selectClass = `${inputClass} bg-white`;
  const compactPrimary =
    'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded bg-vetc-green px-3 text-xs font-bold text-white hover:bg-green-700';
  const compactOutline =
    'inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green disabled:cursor-not-allowed disabled:opacity-40';

  const DateField = ({
    label,
    value,
    onChange,
    required,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
  }) => (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        <input value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} pr-8`} />
        <Calendar size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-3 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Duyệt đề nghị thanh toán</h1>
      </div>

      {notice && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800">
          {notice}
        </div>
      )}

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
        <button type="button" onClick={clearFilters} disabled={!hasActiveFilters} className={compactOutline}>
          <Trash2 size={14} />
          <span>Xóa lọc</span>
        </button>
        <button
          type="button"
          onClick={() => exportRows('duyet-de-nghi-thanh-toan.csv', filteredData)}
          className={compactPrimary}
        >
          <FileSpreadsheet size={14} />
          <span>Xuất Excel</span>
        </button>
        <button type="button" onClick={exportByPartner} className={compactOutline}>
          <FileSpreadsheet size={14} />
          <span>Theo đối tác</span>
        </button>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
        <div className="bg-vetc-green text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
          Danh sách đơn hàng
        </div>
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-separate border-spacing-0 min-w-[1840px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r">
                  <input type="checkbox" checked={allPageSelected} onChange={togglePage} aria-label="Chọn tất cả" />
                </th>
                <th className="px-3 py-2 text-center w-12 font-bold border-r">STT</th>
                <th className="px-3 py-2 text-center w-28 font-bold border-r">Thao tác</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[150px]">Mã đơn hàng</th>
                <th className="px-3 py-2 text-center font-bold border-r w-32">Trạng thái</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[140px]">Lý do từ chối</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Nhà cung cấp</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Thông tin cứu hộ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Phân loại KH</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">Khoảng cách cứu hộ</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">Số tiền</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Người hoàn ứng</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Hạn đi tiền</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Ngày tạo</th>
                <th className="px-3 py-2 text-left font-bold w-28">Người tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((record, index) => {
                const view = approvalView(record);
                const statusConfig = PAYMENT_REQUEST_STATUS_CONFIG[record.status];
                const orderTypeConfig = ORDER_TYPE_CONFIG[record.orderType];
                return (
                  <tr key={record.id} className="align-top hover:bg-gray-50">
                    <td className="px-3 py-2 text-center border-r">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => toggleRow(record.id)}
                        aria-label={`Chọn ${record.orderId}`}
                      />
                    </td>
                    <td className="px-3 py-2 text-center border-r text-gray-600">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-3 py-2 border-r">
                      <div className="flex items-center justify-center gap-2 text-blue-500">
                        <button
                          type="button"
                          title="Lịch sử"
                          className="hover:text-blue-700"
                          onClick={() => setHistoryRecord(record)}
                        >
                          <History size={15} />
                        </button>
                        <button
                          type="button"
                          title="Xem đề nghị thanh toán"
                          className="hover:text-blue-700"
                          onClick={() =>
                            navigate(`/payment-request-management/${record.orderId}?view=1`, {
                              state: { viewOnly: true },
                            })
                          }
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Phê duyệt"
                          className="hover:text-green-700"
                          onClick={() => applyStatus([record], 'awaiting_payment')}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          title="Từ chối"
                          className="hover:text-red-600"
                          onClick={() => openReject([record.id])}
                        >
                          <X size={15} />
                        </button>
                        <button
                          type="button"
                          title="In phiếu"
                          className="hover:text-blue-700"
                          onClick={() => printSlip(record)}
                        >
                          <Printer size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r">
                      <button
                        type="button"
                        className="font-bold text-blue-600 hover:underline"
                        onClick={() =>
                          navigate(`/payment-request-management/${record.orderId}?view=1`, {
                            state: { viewOnly: true },
                          })
                        }
                      >
                        {record.orderId}
                      </button>
                      <div className="mt-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black border ${orderTypeConfig.className}`}>
                          {orderTypeConfig.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-r text-gray-600">{record.rejectionReason || '—'}</td>
                    <td className="px-3 py-2 border-r">
                      <div className="font-medium text-gray-800">{record.rescueUnit.name}</div>
                      <div className="text-gray-500 mt-0.5">Số điện thoại: {record.rescueUnit.phone}</div>
                    </td>
                    <td className="px-3 py-2 border-r">
                      <div className="font-medium text-gray-800">{record.rescueCrew?.plate}</div>
                      <div className="text-gray-600 mt-0.5">
                        {record.rescueCrew?.brand} | {record.rescueCrew?.line}
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r text-gray-700">{view.customerType}</td>
                    <td className="px-3 py-2 border-r text-right text-gray-700">{view.distanceKm} km</td>
                    <td className="px-3 py-2 border-r text-right tabular-nums text-gray-800">
                      {record.transferAmount == null ? '—' : formatMoney(record.transferAmount)}
                    </td>
                    <td className="px-3 py-2 border-r text-gray-700">
                      {formatAdvancePayers([record.refundReimburseBy, record.supplierReimburseBy]) || '—'}
                    </td>
                    <td className="px-3 py-2 border-r text-gray-700">{record.paymentDueDate || '—'}</td>
                    <td className="px-3 py-2 border-r text-gray-700">
                      <div>{formatCreatedAt(record.createdAt).date}</div>
                      <div>{formatCreatedAt(record.createdAt).time}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{record.createdBy || '—'}</td>
                  </tr>
                );
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={15} className="px-4 py-8 text-center text-gray-400">
                    Không có đơn phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadAttachments}
              className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded text-xs font-bold text-gray-700 hover:border-vetc-green hover:text-vetc-green"
            >
              <Paperclip size={14} />
              Tải file đính kèm
            </button>
            <button
              type="button"
              onClick={() => requireSelection() && applyStatus(selectedRecords, 'awaiting_payment')}
              className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded text-xs font-bold text-gray-700 hover:border-vetc-green hover:text-vetc-green"
            >
              <Check size={14} />
              Phê duyệt
            </button>
            <button
              type="button"
              onClick={() => requireSelection() && openReject(selectedIds)}
              className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded text-xs font-bold text-gray-700 hover:border-red-300 hover:text-red-600"
            >
              <X size={14} />
              Từ chối
            </button>
            <button
              type="button"
              onClick={() => requireSelection() && applyStatus(selectedRecords, 'paid')}
              className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded text-xs font-bold text-gray-700 hover:border-vetc-green hover:text-vetc-green"
            >
              <Download size={14} />
              Xác nhận thanh toán
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-gray-500 mr-2">
              Đang xem {rangeStart} đến {rangeEnd} trong {totalItems} mục
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green"
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
                  className={`w-8 h-8 rounded-full text-xs font-bold ${
                    currentPage === item ? 'bg-vetc-green text-white' : 'bg-white border text-gray-600 hover:border-vetc-green'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green"
            >
              <ChevronRight size={16} />
            </button>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
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
                <label className={labelClass}>Trạng thái</label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                  <option value="Chờ thanh toán">Chờ thanh toán</option>
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Loại KH</label>
                <select
                  value={customerTypeFilter}
                  onChange={(event) => setCustomerTypeFilter(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Tất cả</option>
                  <option value="Cá nhân">Cá nhân</option>
                  <option value="Doanh nghiệp">Doanh nghiệp</option>
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
              <div>
                <label className={labelClass}>Trạm cứu hộ</label>
                <select value={stationFilter} onChange={(event) => setStationFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  {stations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nhà cung cấp</label>
                <select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)} className={selectClass}>
                  <option value="">Tất cả</option>
                  {providers.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Loại NCC/dịch vụ</label>
                <select
                  value={serviceTypeFilter}
                  onChange={(event) => setServiceTypeFilter(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Tất cả</option>
                  {SERVICE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Doanh nghiệp</label>
                <select
                  value={enterpriseFilter}
                  onChange={(event) => setEnterpriseFilter(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Tất cả</option>
                  {ENTERPRISES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DateField label="Từ ngày" value={fromDate} onChange={setFromDate} required />
                <DateField label="Đến ngày" value={toDate} onChange={setToDate} required />
                <DateField label="Ngày tạo đơn từ" value={orderFromDate} onChange={setOrderFromDate} />
                <DateField label="Ngày tạo đơn đến" value={orderToDate} onChange={setOrderToDate} />
              </div>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button type="button" onClick={resetAdvanced} className={`${compactOutline} flex-1 justify-center`}>
                Xóa lọc
              </button>
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className={`${compactPrimary} flex-1 justify-center`}
              >
                Áp dụng
              </button>
            </div>
          </aside>
        </div>
      )}

      {rejectIds && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-black text-gray-900">Từ chối đề nghị thanh toán</p>
              <p className="mt-1 text-xs text-gray-500">Nhập lý do trước khi chuyển {rejectIds.length} đơn sang Từ chối.</p>
            </div>
            <div className="p-4">
              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
                className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-vetc-green"
                placeholder="Nhập lý do từ chối"
              />
            </div>
            <div className="flex justify-end gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={() => setRejectIds(null)}
                className="rounded border px-4 py-2 text-sm font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
      {historyRecord && (
        <PaymentRequestHistoryModal
          orderId={historyRecord.orderId}
          rows={buildPaymentRequestHistory(historyRecord)}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </div>
  );
};

export default PaymentRequestApproval;
