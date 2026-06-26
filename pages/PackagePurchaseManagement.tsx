import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Edit3,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
} from 'lucide-react';
import {
  MOCK_PACKAGE_PURCHASES,
  PackagePurchaseRecord,
  PackagePurchaseStatus,
} from '../data/packagePurchaseMockData';

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

const formatCurrency = (value: number): string =>
  value.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const STATUS_CONFIG: Record<PackagePurchaseStatus, { label: string; className: string }> = {
  active: {
    label: 'Hoạt động',
    className: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  unpaid: {
    label: 'Chưa thanh toán',
    className: 'bg-red-50 text-red-600 border-red-200',
  },
  expired: {
    label: 'Hết hạn',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const StatusBadge: React.FC<{ status: PackagePurchaseStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const formatDisplayDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getDefaultToDate = (): string => formatDisplayDate(new Date());

const getDefaultFromDate = (): string => {
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return formatDisplayDate(from);
};

const VehicleInfoCell: React.FC<{ record: PackagePurchaseRecord }> = ({ record }) => (
  <div className="space-y-1">
    <div className="font-bold text-gray-800">
      {record.brand} · {record.model}
    </div>
    <div className="text-[10px] text-gray-500">
      <span className="text-gray-400">VIN:</span> {record.vin}
    </div>
    <div className="text-[10px] text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5">
      <span>
        <span className="text-gray-400">Chỗ:</span> {record.seats}
      </span>
      {record.payload > 0 && (
        <span>
          <span className="text-gray-400">Tải trọng:</span> {record.payload} tấn
        </span>
      )}
    </div>
  </div>
);

const CustomerTypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
      type === 'Doanh nghiệp'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-slate-50 text-slate-600 border-slate-200'
    }`}
  >
    {type}
  </span>
);

const PackagePurchaseManagement: React.FC = () => {
  const [packageFilter, setPackageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [salesSourceFilter, setSalesSourceFilter] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [phone, setPhone] = useState('');
  const [fromDate, setFromDate] = useState(getDefaultFromDate);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [plate, setPlate] = useState('');
  const [toDate, setToDate] = useState(getDefaultToDate);
  const [partnerFilter, setPartnerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [goToPage, setGoToPage] = useState('');

  const hasActiveFilters =
    packageFilter ||
    statusFilter ||
    salesSourceFilter ||
    registrationCode ||
    invoiceStatusFilter ||
    customerTypeFilter ||
    phone ||
    paymentMethodFilter ||
    plate ||
    partnerFilter ||
    fromDate !== getDefaultFromDate() ||
    toDate !== getDefaultToDate();

  const filteredData = useMemo(() => {
    return MOCK_PACKAGE_PURCHASES.filter((record) => {
      if (packageFilter && record.packageName !== packageFilter) return false;
      if (statusFilter) {
        const statusLabel = STATUS_CONFIG[record.status].label;
        if (statusLabel !== statusFilter) return false;
      }
      if (salesSourceFilter && record.salesSource !== salesSourceFilter) return false;
      if (registrationCode && !record.registrationCode.toLowerCase().includes(registrationCode.toLowerCase())) {
        return false;
      }
      if (invoiceStatusFilter && record.invoiceStatus !== invoiceStatusFilter) return false;
      if (customerTypeFilter && record.customerType !== customerTypeFilter) return false;
      if (phone && !record.buyerPhone.includes(phone) && !record.ownerPhone.includes(phone)) return false;
      if (paymentMethodFilter && record.paymentMethod !== paymentMethodFilter) return false;
      if (plate && !record.plate.toLowerCase().includes(plate.toLowerCase())) return false;
      if (partnerFilter && (record.partner ?? '') !== partnerFilter) return false;
      return true;
    });
  }, [
    packageFilter,
    statusFilter,
    salesSourceFilter,
    registrationCode,
    invoiceStatusFilter,
    customerTypeFilter,
    phone,
    paymentMethodFilter,
    plate,
    partnerFilter,
  ]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [
    packageFilter,
    statusFilter,
    salesSourceFilter,
    registrationCode,
    invoiceStatusFilter,
    customerTypeFilter,
    phone,
    paymentMethodFilter,
    plate,
    partnerFilter,
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

  const handleGoToPage = () => {
    const page = Number.parseInt(goToPage, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
    setGoToPage('');
  };

  const handleClearFilters = () => {
    setPackageFilter('');
    setStatusFilter('');
    setSalesSourceFilter('');
    setRegistrationCode('');
    setInvoiceStatusFilter('');
    setCustomerTypeFilter('');
    setPhone('');
    setFromDate(getDefaultFromDate());
    setPaymentMethodFilter('');
    setPlate('');
    setToDate(getDefaultToDate());
    setPartnerFilter('');
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  const inputClass =
    'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
  const selectClass = `${inputClass} bg-white`;

  const renderCell = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '' || value === '—') {
      return <span className="text-gray-400">—</span>;
    }
    return <span className="text-gray-600">{value}</span>;
  };

  const renderMoney = (value: number) => (
    <span className="text-gray-700 tabular-nums whitespace-nowrap">{formatCurrency(value)}</span>
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Quản lý mua gói</h1>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <label className={labelClass}>Gói dịch vụ</label>
              <select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)} className={selectClass}>
                <option value="">Tất cả</option>
                <option value="Cứu hộ RSA Nâng cao">Cứu hộ RSA Nâng cao</option>
                <option value="Cứu hộ RSA Tiêu chuẩn">Cứu hộ RSA Tiêu chuẩn</option>
                <option value="Gói cơ bản 10 dịch vụ">Gói cơ bản 10 dịch vụ</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Mã mua gói</label>
              <input
                type="text"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                placeholder="Nhập mã mua gói"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Số điện thoại</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Biển số xe</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="Nhập biển số xe"
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label className={labelClass}>Trạng thái</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                <option value="">Tất cả</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Trạng thái HĐ</label>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">Tất cả</option>
                <option value="Đã xuất">Đã xuất</option>
                <option value="Chưa xuất">Chưa xuất</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Từ ngày</label>
              <div className="relative">
                <input
                  type="text"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`${inputClass} pr-8`}
                />
                <Calendar size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Đến ngày</label>
              <div className="relative">
                <input
                  type="text"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`${inputClass} pr-8`}
                />
                <Calendar size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="min-w-0">
              <label className={labelClass}>Nguồn bán</label>
              <select
                value={salesSourceFilter}
                onChange={(e) => setSalesSourceFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">Tất cả</option>
                <option value="App VETC">App VETC</option>
                <option value="Portal">Portal</option>
                <option value="Đối tác">Đối tác</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Loại khách hàng</label>
              <select
                value={customerTypeFilter}
                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">Tất cả</option>
                <option value="Cá nhân">Cá nhân</option>
                <option value="Doanh nghiệp">Doanh nghiệp</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Phương thức thanh toán</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className={selectClass}
              >
                <option value="">Tất cả</option>
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Ví VETC">Ví VETC</option>
                <option value="Thẻ ngân hàng">Thẻ ngân hàng</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Đối tác</label>
              <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className={selectClass}>
                <option value="">Tất cả</option>
                <option value="CÔNG TY TNHH BẢO HIỂM TASCO">CÔNG TY TNHH BẢO HIỂM TASCO</option>
                <option value="CÔNG TY CỔ PHẦN BẢO HIỂM PJICO">CÔNG TY CỔ PHẦN BẢO HIỂM PJICO</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
            >
              <FileSpreadsheet size={16} />
              <span>Xuất Excel</span>
            </button>
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

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[2950px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r sticky left-0 bg-gray-50 z-10">STT</th>
                <th className="px-3 py-2 text-center w-24 font-bold border-r sticky left-10 bg-gray-50 z-10">Thao tác</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[170px]">Mã mua gói</th>
                <th className="px-3 py-2 text-left font-bold border-r w-24">BSX</th>
                <th className="px-3 py-2 text-center font-bold border-r w-28">Số lượt sử dụng</th>
                <th className="px-3 py-2 text-center font-bold border-r w-32">Trạng thái</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Người mua</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Chủ xe</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Đối tác</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[160px]">Gói dịch vụ</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">Giá gốc</th>
                <th className="px-3 py-2 text-right font-bold border-r w-20">VAT</th>
                <th className="px-3 py-2 text-right font-bold border-r w-24">Giảm giá</th>
                <th className="px-3 py-2 text-right font-bold border-r w-28">Giá cuối</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Ngày kích hoạt</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Ngày hết hạn</th>
                <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Thông tin xe</th>
                <th className="px-3 py-2 text-left font-bold border-r w-40">Hóa đơn</th>
                <th className="px-3 py-2 text-left font-bold border-r w-24">Nguồn bán</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Phương thức thanh toán</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Mã giao dịch</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Thời điểm tạo</th>
                <th className="px-3 py-2 text-left font-bold w-28">Người tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((record: PackagePurchaseRecord, index) => (
                <tr
                  key={record.id}
                  className={`transition-colors align-top hover:bg-gray-50/80 ${
                    index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                  }`}
                >
                  <td
                    className={`px-3 py-3 text-center border-r text-gray-600 sticky left-0 z-10 ${
                      index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                    }`}
                  >
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td
                    className={`px-3 py-3 border-r sticky left-10 z-10 ${
                      index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Chi tiết"
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Xem"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <div className="font-bold text-gray-800">{record.registrationCode}</div>
                    <div className="mt-1.5">
                      <CustomerTypeBadge type={record.customerType} />
                    </div>
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <span className="font-bold text-gray-800">{record.plate}</span>
                  </td>
                  <td className="px-3 py-3 border-r align-top text-center">
                    {record.rescueUsage ? (
                      <div className="space-y-0.5">
                        <div
                          className={`font-black tracking-wide ${
                            record.rescueUsage.used >= record.rescueUsage.limit
                              ? 'text-red-600'
                              : 'text-gray-800'
                          }`}
                        >
                          {record.rescueUsage.used}/{record.rescueUsage.limit}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium">lượt cứu hộ</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 border-r align-top text-center">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <div className="font-bold text-blue-600 uppercase text-[11px] truncate" title={record.buyerName}>
                      {record.buyerName}
                    </div>
                    <div className="text-gray-500 mt-1">{record.buyerPhone}</div>
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <div className="font-bold text-blue-600 uppercase text-[11px] truncate" title={record.ownerName}>
                      {record.ownerName}
                    </div>
                    <div className="text-gray-500 mt-1">{record.ownerPhone}</div>
                  </td>
                  <td className="px-3 py-3 border-r align-top text-gray-700 font-medium">
                    {record.partner ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <button
                      type="button"
                      className="font-bold text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {record.packageName}
                    </button>
                  </td>
                  <td className="px-3 py-3 border-r align-top text-right">{renderMoney(record.basePrice)}</td>
                  <td className="px-3 py-3 border-r align-top text-right">{renderMoney(record.vat)}</td>
                  <td className="px-3 py-3 border-r align-top text-right">{renderMoney(record.discount)}</td>
                  <td className="px-3 py-3 border-r align-top text-right font-semibold">
                    {renderMoney(record.finalPrice)}
                  </td>
                  <td className="px-3 py-3 border-r align-top whitespace-nowrap">{renderCell(record.activationDate)}</td>
                  <td className="px-3 py-3 border-r align-top whitespace-nowrap">{renderCell(record.expiryDate)}</td>
                  <td className="px-3 py-3 border-r align-top">
                    <VehicleInfoCell record={record} />
                  </td>
                  <td className="px-3 py-3 border-r align-top">
                    <div className="text-gray-700">{record.invoiceStatus}</div>
                    <div className="text-gray-500 mt-1">{renderCell(record.invoiceCode)}</div>
                  </td>
                  <td className="px-3 py-3 border-r align-top">{renderCell(record.salesSource)}</td>
                  <td className="px-3 py-3 border-r align-top">{renderCell(record.paymentMethod)}</td>
                  <td className="px-3 py-3 border-r align-top text-gray-500">{renderCell(record.transactionCode)}</td>
                  <td className="px-3 py-3 border-r align-top whitespace-nowrap text-gray-500">{renderCell(record.createdAt)}</td>
                  <td className="px-3 py-3 align-top text-gray-700 font-medium">{renderCell(record.createdBy)}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={23} className="px-3 py-8 text-center text-gray-400 text-sm">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-white flex flex-col xl:flex-row items-center justify-between gap-4 rounded-b-lg">
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {rangeStart}-{rangeEnd} của {totalItems} gói đã bán
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
                  <span
                    key={`ellipsis-${idx}`}
                    className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
                  >
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

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1.5 text-xs bg-white outline-none focus:border-vetc-green"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Đến trang</span>
              <input
                type="text"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                className="w-12 border rounded px-2 py-1 text-center outline-none focus:border-vetc-green"
              />
              <button
                type="button"
                onClick={handleGoToPage}
                className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:border-vetc-green hover:text-vetc-green text-xs font-medium transition-colors"
              >
                Đi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagePurchaseManagement;
