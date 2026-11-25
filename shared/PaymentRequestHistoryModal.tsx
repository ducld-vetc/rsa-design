import React from 'react';
import { X } from 'lucide-react';
import {
  PAYMENT_REQUEST_STATUS_CONFIG,
  PaymentRequestHistoryEntry,
} from '../data/paymentRequestMockData';

interface PaymentRequestHistoryModalProps {
  orderId: string;
  rows: PaymentRequestHistoryEntry[];
  onClose: () => void;
}

const PaymentRequestHistoryModal: React.FC<PaymentRequestHistoryModalProps> = ({
  orderId,
  rows,
  onClose,
}) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
    <div
      className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">Lịch sử đề nghị thanh toán</h3>
          <p className="mt-0.5 text-[11px] text-gray-400">{orderId}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100" aria-label="Đóng">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-auto p-5">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
            Chưa có lịch sử đề nghị thanh toán.
          </p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b text-[10px] font-bold uppercase text-gray-400">
                <th className="py-2 pr-3">Thời gian tạo</th>
                <th className="py-2 pr-3">Người tạo</th>
                <th className="py-2 pr-3">Trạng thái</th>
                <th className="py-2">Lý do từ chối</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const status = PAYMENT_REQUEST_STATUS_CONFIG[row.status];
                return (
                  <tr key={`${row.createdAt}-${row.status}-${index}`} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap text-gray-700">{row.createdAt}</td>
                    <td className="py-2 pr-3 text-gray-800">{row.createdBy}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{row.rejectionReason || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </div>
);

export default PaymentRequestHistoryModal;
