import React from 'react';
import { AlertTriangle, CreditCard, X } from 'lucide-react';

interface UnpaidDepositRemainingWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  depositAmount: number;
  totalAmount: number;
  remainingAmount: number;
}

const formatAmount = (amount: number) => amount.toLocaleString('en-US');

const UnpaidDepositRemainingWarningModal: React.FC<UnpaidDepositRemainingWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  depositAmount,
  totalAmount,
  remainingAmount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 text-white flex items-center justify-between bg-amber-500">
          <div className="flex items-center space-x-2">
            <CreditCard size={20} />
            <h3 className="font-bold text-sm">Cảnh báo thanh toán phần còn lại</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <p className="text-xs text-gray-700 leading-relaxed">
                Đơn hàng có <span className="font-bold">giao dịch tiền cọc chưa thanh toán</span>.
                Nếu tiếp tục thanh toán phần còn lại, số tiền thu sẽ{' '}
                <span className="font-bold text-red-600">bao gồm cả khoản cọc</span>.
                Vui lòng kiểm tra lại trước khi xác nhận.
              </p>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="bg-white rounded-lg p-3 border flex items-center justify-between">
                <p className="text-gray-400 font-bold uppercase">Tiền cọc chưa thanh toán</p>
                <p className="font-black text-amber-700">{formatAmount(depositAmount)} VNĐ</p>
              </div>
              <div className="bg-white rounded-lg p-3 border flex items-center justify-between">
                <p className="text-gray-400 font-bold uppercase">Tổng phí khách hàng</p>
                <p className="font-black text-gray-800">{formatAmount(totalAmount)} VNĐ</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-300 flex items-center justify-between">
                <p className="text-gray-500 font-bold uppercase">Số tiền cần thanh toán</p>
                <p className="font-black text-red-600">{formatAmount(remainingAmount)} VNĐ</p>
              </div>
            </div>

            <p className="text-[10px] text-amber-700 leading-relaxed bg-white/60 rounded-lg p-2 border border-amber-100">
              Lưu ý: Thanh toán phần còn lại khi chưa thu cọc sẽ gộp cọc (
              <span className="font-bold">{formatAmount(depositAmount)} VNĐ</span>) vào một giao dịch duy nhất.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border font-bold text-xs text-gray-500 hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs active:scale-95 transition-all bg-amber-500 hover:bg-amber-600"
            >
              Tiếp tục thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnpaidDepositRemainingWarningModal;
