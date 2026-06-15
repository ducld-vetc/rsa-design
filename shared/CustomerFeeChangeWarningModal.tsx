import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, X } from 'lucide-react';

export type CustomerFeeWarningType = 'decrease' | 'increase';

interface CustomerFeeChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: CustomerFeeWarningType;
  oldTotal: number;
  newTotal: number;
  excessRefund?: number;
  additionalAmount?: number;
}

const formatAmount = (amount: number) => amount.toLocaleString('en-US');

const CustomerFeeChangeWarningModal: React.FC<CustomerFeeChangeWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  oldTotal,
  newTotal,
  excessRefund = 0,
  additionalAmount = 0
}) => {
  if (!isOpen) return null;

  const isDecrease = type === 'decrease';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`p-4 text-white flex items-center justify-between ${isDecrease ? 'bg-amber-500' : 'bg-blue-600'}`}>
          <div className="flex items-center space-x-2">
            {isDecrease ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
            <h3 className="font-bold text-sm">
              {isDecrease ? 'Cảnh báo giảm phí khách hàng' : 'Cảnh báo tăng phí khách hàng'}
            </h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className={`p-4 rounded-xl border space-y-3 ${isDecrease ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start space-x-2">
              <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${isDecrease ? 'text-amber-600' : 'text-blue-600'}`} />
              {isDecrease ? (
                <p className="text-xs text-gray-700 leading-relaxed">
                  Đơn hàng đã thực hiện thanh toán một phần. Phí khách hàng mới{' '}
                  <span className="font-black text-red-600">{formatAmount(newTotal)} VNĐ</span> thấp hơn số tiền đã thu.
                  Hệ thống sẽ <span className="font-bold">tự động cập nhật tiền hoàn</span> bằng số tiền khách hàng cọc/thanh toán dư.
                </p>
              ) : (
                <p className="text-xs text-gray-700 leading-relaxed">
                  Phí khách hàng tăng từ{' '}
                  <span className="font-bold">{formatAmount(oldTotal)} VNĐ</span> lên{' '}
                  <span className="font-black text-blue-700">{formatAmount(newTotal)} VNĐ</span>.
                  Thay đổi này <span className="font-bold">ảnh hưởng tới tổng phí</span> và sẽ{' '}
                  <span className="font-bold">yêu cầu khách hàng thanh toán thêm</span> khi kết thúc đơn.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-gray-400 font-bold uppercase mb-1">Phí hiện tại</p>
                <p className="font-black text-gray-800">{formatAmount(oldTotal)} VNĐ</p>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-gray-400 font-bold uppercase mb-1">Phí sau điều chỉnh</p>
                <p className={`font-black ${isDecrease ? 'text-amber-700' : 'text-blue-700'}`}>{formatAmount(newTotal)} VNĐ</p>
              </div>
            </div>

            {isDecrease && excessRefund > 0 && (
              <div className="bg-white rounded-lg p-3 border border-amber-300">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tiền hoàn dự kiến</p>
                <p className="text-lg font-black text-amber-700">{formatAmount(excessRefund)} VNĐ</p>
              </div>
            )}

            {!isDecrease && additionalAmount > 0 && (
              <div className="bg-white rounded-lg p-3 border border-blue-300">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Phí tăng thêm</p>
                <p className="text-lg font-black text-blue-700">+{formatAmount(additionalAmount)} VNĐ</p>
              </div>
            )}
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
              className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs active:scale-95 transition-all ${
                isDecrease ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Xác nhận thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeeChangeWarningModal;
