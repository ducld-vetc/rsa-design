import React, { useMemo } from 'react';
import { X, History, Calendar, FileQuestion, AlertTriangle } from 'lucide-react';
import { OrderHistory } from '../types';

/** Parse DD/MM/YYYY → timestamp (0 nếu không hợp lệ) */
export const parseOrderDate = (dateStr: string): number => {
  const parts = dateStr.trim().split(/[/.-]/);
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
};

/** Format hôm nay theo DD/MM/YYYY */
export const formatTodayVi = (d = new Date()): string => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const hasOrderCreatedToday = (orders: OrderHistory[], today = formatTodayVi()): boolean =>
  orders.some((o) => o.date === today);

export const sortOrdersNewestFirst = (orders: OrderHistory[]): OrderHistory[] =>
  [...orders].sort((a, b) => parseOrderDate(b.date) - parseOrderDate(a.date));

const statusLabel = (status: OrderHistory['status']) => {
  if (status === 'Completed') return 'Hoàn thành';
  if (status === 'Cancelled') return 'Đã hủy';
  return 'Đang xử lý';
};

const statusClass = (status: OrderHistory['status']) => {
  if (status === 'Completed') return 'bg-green-100 text-green-700';
  if (status === 'Cancelled') return 'bg-red-100 text-red-700';
  return 'bg-blue-100 text-blue-700';
};

/** Mock đơn theo gói — có ít nhất 1 đơn trong ngày để demo cảnh báo */
export const DEFAULT_PACKAGE_ORDERS: OrderHistory[] = [
  { id: 'RS-12088', date: formatTodayVi(), service: 'Kích bình ắc quy', status: 'In Progress' },
  { id: 'RS-10234', date: '20/01/2026', service: 'Kích bình ắc quy', status: 'Completed' },
  { id: 'RS-09852', date: '15/12/2025', service: 'Cứu hộ kéo xe', status: 'Cancelled' },
  { id: 'RS-08765', date: '10/11/2025', service: 'Thay lốp dự phòng', status: 'Completed' },
  { id: 'RS-07654', date: '05/10/2025', service: 'Cung cấp nhiên liệu', status: 'Completed' },
  { id: 'RS-06543', date: '20/09/2025', service: 'Sửa chữa tại chỗ', status: 'Completed' },
];

interface UsageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage: string;
  customerPlate: string;
  /** Danh sách đơn gắn gói/KH — mặc định mock */
  orders?: OrderHistory[];
  /** Giữ tương thích caller cũ (không còn dùng để chọn gói) */
  onApply?: (pkg: string) => void;
}

const UsageHistoryModal: React.FC<UsageHistoryModalProps> = ({
  isOpen,
  onClose,
  currentPackage,
  customerPlate,
  orders = DEFAULT_PACKAGE_ORDERS,
}) => {
  const sortedOrders = useMemo(() => sortOrdersNewestFirst(orders), [orders]);
  const hasToday = useMemo(() => hasOrderCreatedToday(sortedOrders), [sortedOrders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-vetc-green text-white px-6 py-4 flex items-center justify-between font-black text-xl uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-2">
            <History size={22} />
            <span>Danh sách đơn cứu hộ</span>
          </div>
          <button type="button" onClick={onClose} className="hover:bg-white/20 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          <div className="bg-[#f8fcf9] p-4 rounded-xl border border-green-100 flex items-center justify-between gap-4 shadow-sm">
            <div className="text-left min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Gói cứu hộ</p>
              <p className="text-base font-black text-gray-800 truncate">{currentPackage || '---'}</p>
            </div>
            <div className="text-right pl-4 border-l border-green-200 shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-0.5">Biển số xe</p>
              <p className="text-base font-black text-gray-800 uppercase tracking-wide">
                {customerPlate || '---'}
              </p>
            </div>
          </div>

          {hasToday && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-snug">
                Đã phát sinh đơn trong ngày — vui lòng kiểm tra trước khi tạo đơn mới.
              </p>
            </div>
          )}

          {sortedOrders.length > 0 ? (
            <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f0f9f4] text-gray-600 font-bold text-xs uppercase border-b">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Dịch vụ</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-800">{order.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-700">{order.service}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${statusClass(order.status)}`}
                        >
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={14} className="mr-1.5 text-gray-400 shrink-0" />
                          <span>{order.date}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border rounded-xl shadow-sm bg-white p-12 text-center flex flex-col items-center justify-center space-y-3 text-gray-400">
              <FileQuestion size={48} className="opacity-20" />
              <span className="font-bold text-lg text-gray-500">Chưa có đơn cứu hộ</span>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-16 py-2.5 rounded-xl font-black uppercase text-sm shadow-md transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageHistoryModal;
