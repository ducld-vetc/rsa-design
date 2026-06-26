
import React, { useMemo, useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Edit,
  Info,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowRightLeft,
  Pin
} from 'lucide-react';
import PriorityCustomerBadge from '../shared/PriorityCustomerBadge';
import { isPriorityCustomerPhone } from '../shared/priorityCustomer';

interface OrderManagementProps {
  onViewDetails?: (orderId: string) => void;
}

type OrderPaymentStatus = 'PENDING' | 'DEPOSITED' | 'PAID';

type StatusBadgeStyle =
  | 'outline-blue'
  | 'outline-orange'
  | 'outline-green'
  | 'solid-red'
  | 'solid-green'
  | 'solid-blue'
  | 'solid-orange';

type OrderStatusDisplay = {
  primary: string;
  primaryStyle: StatusBadgeStyle;
  secondary?: string;
  secondaryStyle?: StatusBadgeStyle;
};

type OrderRow = {
  id: string;
  orderId: string;
  tags: string[];
  dispatchType: string;
  mainService: string;
  waitingTime: string;
  orderStatus: OrderStatusDisplay;
  paymentStatus: OrderPaymentStatus;
  supporter: { role: string; name: string; roleClass: string };
  invoiceCode: string;
  customer: { name: string; phone: string };
  vehicle: { plate: string; model: string };
  address: string;
  partner: string;
  driver: { name: string; phone: string };
  updatedAt: string;
  updatedBy: string;
  packageUsage?: { packageName: string; used: number; limit: number };
};

const PAYMENT_STATUS_CONFIG: Record<OrderPaymentStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  DEPOSITED: { label: 'Đã cọc tiền', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAID: { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border-green-200' }
};

const STATUS_BADGE_STYLES: Record<StatusBadgeStyle, string> = {
  'outline-blue': 'bg-blue-50 text-blue-600 border border-blue-300',
  'outline-orange': 'bg-orange-50 text-orange-600 border border-orange-300',
  'outline-green': 'bg-green-50 text-green-600 border border-green-300',
  'solid-red': 'bg-red-500 text-white border border-red-500',
  'solid-green': 'bg-green-600 text-white border border-green-600',
  'solid-blue': 'bg-blue-600 text-white border border-blue-600',
  'solid-orange': 'bg-orange-500 text-white border border-orange-500'
};

const OrderStatusBadges: React.FC<{ status: OrderStatusDisplay }> = ({ status }) => (
  <div className="flex flex-col items-center gap-1.5 py-0.5">
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_BADGE_STYLES[status.primaryStyle]}`}
    >
      {status.primary}
    </span>
    {status.secondary && (
      <span
        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${STATUS_BADGE_STYLES[status.secondaryStyle || 'solid-red']}`}
      >
        {status.secondary}
      </span>
    )}
  </div>
);

const isPackageOrder = (order: OrderRow): boolean => order.tags.includes('Đơn gói');

const MOCK_ORDERS: OrderRow[] = [
  {
    id: '3',
    orderId: 'RS12602020003',
    tags: ['Đơn gói', 'PORTAL'],
    dispatchType: 'Điều phối: Thủ công',
    mainService: 'Kích bình ắc quy',
    waitingTime: '1 giờ 5 phút',
    orderStatus: { primary: 'Hoàn thành', primaryStyle: 'outline-green', secondary: 'Hoàn thành', secondaryStyle: 'solid-green' },
    paymentStatus: 'PAID',
    supporter: { role: 'SUPPORT', name: 'rsa_test1', roleClass: 'bg-purple-50 text-purple-600 border-purple-100' },
    invoiceCode: 'INV-20260202-003',
    customer: { name: 'LÊ VĂN C', phone: '0903456789' },
    vehicle: { plate: '30H-555.66', model: 'Mazda CX-5' },
    address: 'Hầm Kim Liên, Hai Bà Trưng, Hà Nội',
    partner: 'Garage Thăng Long',
    driver: { name: 'Lê Văn Hùng', phone: '0944555111' },
    updatedAt: '02/02/2026 13:10',
    updatedBy: 'rsa_test1',
    packageUsage: { packageName: 'Gói cơ bản 10 dịch vụ', used: 1, limit: 100 }
  },
  {
    id: '4',
    orderId: 'RS12602020004',
    tags: ['Đơn lẻ', 'PORTAL'],
    dispatchType: 'Điều phối: Tự động',
    mainService: 'Cứu hộ kéo xe',
    waitingTime: '2 giờ 30 phút',
    orderStatus: { primary: 'Hủy', primaryStyle: 'outline-blue', secondary: 'Khách hủy', secondaryStyle: 'solid-red' },
    paymentStatus: 'DEPOSITED',
    supporter: { role: 'OPERATOR', name: 'QuynhOSA', roleClass: 'bg-green-50 text-green-600 border-green-100' },
    invoiceCode: '-',
    customer: { name: 'PHẠM VĂN D', phone: '0944556677' },
    vehicle: { plate: '51G-111.22', model: 'Hyundai Accent' },
    address: 'Đường vành đai 3, Thanh Xuân, Hà Nội',
    partner: 'Cứu hộ ABC',
    driver: { name: '-', phone: '-' },
    updatedAt: '02/02/2026 12:00',
    updatedBy: 'QuynhOSA'
  },
  {
    id: '1',
    orderId: 'RS12602020001',
    tags: ['Đơn lẻ', 'PORTAL'],
    dispatchType: 'Điều phối: Thủ công',
    mainService: 'Cung cấp nhiên liệu khẩn cấp',
    waitingTime: '0 giờ 6 phút',
    orderStatus: { primary: 'Điều phối', primaryStyle: 'outline-blue' },
    paymentStatus: 'PENDING',
    supporter: { role: 'SUPPORT', name: 'rsa_test1', roleClass: 'bg-purple-50 text-purple-600 border-purple-100' },
    invoiceCode: '-',
    customer: { name: 'NGUYỄN VĂN A', phone: '0909888777' },
    vehicle: { plate: '30A-123.45', model: 'Toyota Vios' },
    address: '210 Phố Xã Đàn, Đống Đa, Hà Nội',
    partner: 'CARPLA - CARPLA SERVICE',
    driver: { name: 'Nguyễn Văn Tài', phone: '0911222333' },
    updatedAt: '02/02/2026 14:30',
    updatedBy: 'rsa_test1'
  },
  {
    id: '2',
    orderId: 'RS12602020002',
    tags: ['Đơn lẻ', 'PORTAL'],
    dispatchType: 'Điều phối: Tự động',
    mainService: 'Thay lốp dự phòng',
    waitingTime: '0 giờ 12 phút',
    orderStatus: { primary: 'Chờ đối tác tiếp nhận', primaryStyle: 'outline-orange' },
    paymentStatus: 'DEPOSITED',
    supporter: { role: 'OPERATOR', name: 'hieund2', roleClass: 'bg-green-50 text-green-600 border-green-100' },
    invoiceCode: '-',
    customer: { name: 'TRẦN THỊ B', phone: '0967419411' },
    vehicle: { plate: '29B-888.88', model: 'Honda City' },
    address: 'Cầu Chương Dương, Long Biên, Hà Nội',
    partner: 'Cứu hộ 116 Hà Nội',
    driver: { name: 'Trần Minh Quang', phone: '0988777666' },
    updatedAt: '02/02/2026 14:25',
    updatedBy: 'hieund2'
  },
  {
    id: '5',
    orderId: 'RS12602020005',
    tags: ['Đơn gói', 'PORTAL'],
    dispatchType: 'Điều phối: Thủ công',
    mainService: 'Sửa chữa tại chỗ',
    waitingTime: '0 giờ 45 phút',
    orderStatus: { primary: 'Hoàn thành', primaryStyle: 'outline-green', secondary: 'Hoàn thành bởi CSA', secondaryStyle: 'solid-green' },
    paymentStatus: 'PAID',
    supporter: { role: 'SUPPORT', name: 'rsa_test1', roleClass: 'bg-purple-50 text-purple-600 border-purple-100' },
    invoiceCode: 'INV-20260202-005',
    customer: { name: 'HOÀNG THỊ E', phone: '0922334455' },
    vehicle: { plate: '30G-777.88', model: 'Kia Seltos' },
    address: 'Trần Duy Hưng, Cầu Giấy, Hà Nội',
    partner: 'Carpla Service - CN Hà Nội',
    driver: { name: 'Phạm Đức Anh', phone: '0900111222' },
    updatedAt: '02/02/2026 11:45',
    updatedBy: 'rsa_test1',
    packageUsage: { packageName: 'Gói nâng cao Premium', used: 2, limit: 100 }
  },
  {
    id: '6',
    orderId: 'RS12602020006',
    tags: ['Đơn lẻ', 'PORTAL'],
    dispatchType: 'Điều phối: Tự động',
    mainService: 'Mở khóa xe',
    waitingTime: '0 giờ 20 phút',
    orderStatus: { primary: 'Hủy', primaryStyle: 'outline-blue', secondary: 'Khách hủy', secondaryStyle: 'solid-red' },
    paymentStatus: 'PENDING',
    supporter: { role: 'OPERATOR', name: 'hieund2', roleClass: 'bg-green-50 text-green-600 border-green-100' },
    invoiceCode: '-',
    customer: { name: 'VŨ ĐỨC F', phone: '0933445566' },
    vehicle: { plate: '29C-333.44', model: 'Ford Ranger' },
    address: 'Nguyễn Trãi, Thanh Xuân, Hà Nội',
    partner: '-',
    driver: { name: '-', phone: '-' },
    updatedAt: '02/02/2026 10:30',
    updatedBy: 'hieund2'
  }
];

const isOrderClosed = (status: OrderStatusDisplay): boolean => {
  const primary = status.primary.trim().toLowerCase();
  return primary === 'hoàn thành' || primary === 'hủy';
};

const shouldPinPriorityOrder = (order: OrderRow): boolean =>
  isPriorityCustomerPhone(order.customer.phone) && !isOrderClosed(order.orderStatus);

const sortOrdersForDisplay = (orders: OrderRow[]): OrderRow[] =>
  [...orders].sort((a, b) => {
    const aPinned = shouldPinPriorityOrder(a);
    const bPinned = shouldPinPriorityOrder(b);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return orders.indexOf(a) - orders.indexOf(b);
  });

const OrderManagement: React.FC<OrderManagementProps> = ({ onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [supportFilter, setSupportFilter] = useState<'supporting' | 'not-supporting' | 'all'>('all');

  const displayOrders = useMemo(() => sortOrdersForDisplay(MOCK_ORDERS), []);

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  const filterBtnClass = (active: boolean) =>
    `px-4 py-1.5 rounded text-xs font-bold border transition-all ${
      active
        ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
        : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green hover:text-vetc-green'
    }`;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Quản lý yêu cầu cứu hộ</h1>

      {/* Search Section */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Mã đơn hàng</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Số điện thoại</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Biển số xe</label>
              <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" />
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Dịch vụ</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Đối tác</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Trạm cứu hộ</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Tình trạng</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Trạng thái</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Người hỗ trợ</label>
              <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white">
                <option>Tất cả</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Từ ngày</label>
              <div className="relative flex-1">
                <input type="text" defaultValue="01/02/2026" className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-8 focus:border-vetc-green" />
                <Calendar size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Đến ngày</label>
              <div className="relative flex-1">
                <input type="text" defaultValue="28/02/2026" className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-8 focus:border-vetc-green" />
                <Calendar size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <button className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
              <FileSpreadsheet size={16} />
              <span>Xuất Excel</span>
            </button>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button className={filterBtnClass(supportFilter === 'supporting')} onClick={() => setSupportFilter('supporting')}>
                Đang hỗ trợ
              </button>
              <button className={filterBtnClass(supportFilter === 'not-supporting')} onClick={() => setSupportFilter('not-supporting')}>
                Chưa hỗ trợ
              </button>
              <button className={filterBtnClass(supportFilter === 'all')} onClick={() => setSupportFilter('all')}>
                Tất cả
              </button>
              <button className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm ml-1">
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[1680px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th rowSpan={2} className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                <th rowSpan={2} className="px-3 py-2 text-center w-20 font-bold border-r">Hành động</th>
                <th colSpan={7} className="px-3 py-1.5 text-center font-bold border-r bg-gray-100/70">Thông tin yêu cầu</th>
                <th colSpan={4} className="px-3 py-1.5 text-center font-bold border-r bg-gray-100/70">Thông tin đối tượng cứu hộ</th>
                <th colSpan={2} className="px-3 py-1.5 text-center font-bold border-r bg-gray-100/70">Thông tin đối tác hỗ trợ</th>
                <th colSpan={2} className="px-3 py-1.5 text-center font-bold bg-gray-100/70">Thông tin hệ thống</th>
              </tr>
              <tr className="bg-gray-50 border-b text-gray-500 text-[10px] uppercase">
                <th className="px-3 py-2 text-left font-bold border-r w-44">Mã đơn</th>
                <th className="px-3 py-2 text-left font-bold border-r w-40">Dịch vụ chính</th>
                <th className="px-3 py-2 text-center font-bold border-r w-28">Lượt sử dụng gói</th>
                <th className="px-3 py-2 text-center font-bold border-r w-28">Thời gian chờ</th>
                <th className="px-3 py-2 text-center font-bold border-r w-36">Trạng thái đơn</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Trạng thái thanh toán</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Người hỗ trợ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-24">Mã hóa đơn</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Khách hàng</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Phương tiện</th>
                <th className="px-3 py-2 text-left font-bold border-r w-48">Địa chỉ cứu hộ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-36">Đối tác thực hiện</th>
                <th className="px-3 py-2 text-left font-bold border-r w-32">Tài xế/Đội ngũ</th>
                <th className="px-3 py-2 text-left font-bold border-r w-28">Ngày cập nhật</th>
                <th className="px-3 py-2 text-left font-bold w-24">Người cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayOrders.map((order, index) => {
                const paymentInfo = PAYMENT_STATUS_CONFIG[order.paymentStatus];
                const isPinned = shouldPinPriorityOrder(order);
                return (
                  <tr
                    key={order.id}
                    className={`transition-colors align-top ${
                      isPinned
                        ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-l-amber-400'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <td className="px-3 py-3 text-center border-r text-gray-600">{index + 1}</td>
                    <td className="px-3 py-3 border-r">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors" title="Chỉnh sửa">
                          <Edit size={15} />
                        </button>
                        <button className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Chuyển tiếp">
                          <ArrowRightLeft size={15} />
                        </button>
                        <button
                          onClick={() => onViewDetails?.(order.orderId)}
                          className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Info size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          <span className="font-bold text-gray-800">{order.orderId}</span>
                          {isPinned && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-amber-700" title="Đơn ưu tiên được ghim">
                              <Pin size={10} className="text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {order.tags.map(tag => (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                                tag === 'Đơn gói'
                                  ? 'bg-green-50 text-green-600 border-green-100'
                                  : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="block text-[9px] text-gray-400 font-medium">{order.dispatchType}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r max-w-[10rem]">
                      <span
                          className="block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-medium truncate"
                          title={order.mainService}
                      >
                        {order.mainService}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r text-center align-top">
                      {isPackageOrder(order) && order.packageUsage ? (
                        <div className="space-y-0.5">
                          <div className="font-black text-gray-800 tracking-wide">
                            {order.packageUsage.used}/{order.packageUsage.limit}
                          </div>
                          <div
                            className="text-[9px] text-gray-400 truncate max-w-[6.5rem] mx-auto"
                            title={order.packageUsage.packageName}
                          >
                            {order.packageUsage.packageName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center border-r font-medium text-gray-700 whitespace-nowrap">
                      {order.waitingTime}
                    </td>
                    <td className="px-3 py-3 border-r align-top text-center">
                      <OrderStatusBadges status={order.orderStatus} />
                    </td>
                    <td className="px-3 py-3 border-r">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${paymentInfo.className}`}>
                        {paymentInfo.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r">
                      <div className="space-y-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${order.supporter.roleClass}`}>
                          {order.supporter.role}
                        </span>
                        <span className="block text-[10px] font-bold text-gray-700">{order.supporter.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r text-gray-500">{order.invoiceCode}</td>
                    <td className="px-3 py-3 border-r max-w-[9rem]">
                      <div
                          className="font-bold text-blue-600 uppercase text-[11px] truncate"
                          title={order.customer.name}
                      >
                        {order.customer.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-gray-500">{order.customer.phone}</span>
                        {isPriorityCustomerPhone(order.customer.phone) && (
                          <PriorityCustomerBadge compact />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r max-w-[8rem]">
                      <div
                          className="inline-flex max-w-full px-2 py-1 bg-white border-2 border-gray-800 rounded text-[11px] font-black text-gray-900 mb-1 truncate"
                          title={order.vehicle.plate}
                      >
                        {order.vehicle.plate}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate" title={order.vehicle.model}>
                        {order.vehicle.model}
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r max-w-[12rem]">
                      <span className="block text-gray-600 truncate" title={order.address}>
                        {order.address}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r max-w-[9rem]">
                      <span className="block text-gray-700 font-medium truncate" title={order.partner}>
                        {order.partner}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r max-w-[8rem]">
                      {order.driver.name !== '-' ? (
                        <>
                          <div
                              className="font-bold text-blue-600 text-[11px] truncate"
                              title={order.driver.name}
                          >
                            {order.driver.name}
                          </div>
                          <div className="text-gray-500">{order.driver.phone}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r text-gray-500 whitespace-nowrap">{order.updatedAt}</td>
                    <td className="px-3 py-3 text-gray-700 font-medium">{order.updatedBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500">1–{displayOrders.length} của {displayOrders.length} yêu cầu</div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-vetc-green text-white font-bold text-xs shadow-sm">
                {currentPage}
              </button>
              <button className="p-1 hover:bg-white rounded border border-gray-200 text-gray-400 cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
            <select className="border rounded px-2 py-1 text-xs bg-white outline-none">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
