
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
import { OrderWarningBadge, FloodWarningBadge } from '../shared/OrderAlertBadges';
import { isPriorityCustomerPhone } from '../shared/priorityCustomer';
import {
  DEMO_ORDERS,
  orderRowToNavState,
  type DemoOrderRow,
  type OrderDetailsNavState,
  type OrderPaymentStatus,
  type OrderStatusDisplay,
  type StatusBadgeStyle,
} from '../data/orderListDemoData';

interface OrderManagementProps {
  onViewDetails?: (nav: OrderDetailsNavState) => void;
}

type OrderRow = DemoOrderRow;

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

  const displayOrders = useMemo(() => sortOrdersForDisplay(DEMO_ORDERS), []);

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

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span className="font-bold uppercase tracking-wide text-[11px] text-amber-700">Demo trạng thái</span>
        <p className="mt-1">
          Danh sách có <strong>{DEMO_ORDERS.length} đơn mẫu</strong> — mỗi dòng tương ứng một trạng thái portal.
          Bấm <strong>Xem chi tiết</strong> để mở đơn đúng trạng thái (Webview, cập nhật trạng thái, v.v.).
        </p>
      </div>

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
                          onClick={() => onViewDetails?.(orderRowToNavState(order))}
                          className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                          title={`Xem chi tiết — ${order.orderStatus.primary}${order.orderStatus.secondary ? ` / ${order.orderStatus.secondary}` : ''}`}
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
                                  : tag === 'DEMO'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                          {order.isFlooded && <FloodWarningBadge compact />}
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
                        {order.hasOrderWarning && <OrderWarningBadge compact />}
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
