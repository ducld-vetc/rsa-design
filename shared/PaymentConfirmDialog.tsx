
import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, CreditCard, Wallet, Loader2, PartyPopper, AlertCircle } from 'lucide-react';

interface PaymentConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  depositAmount: number;
}

const PaymentConfirmDialog: React.FC<PaymentConfirmDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  depositAmount 
}) => {
  const [status, setStatus] = useState<'initial' | 'loading' | 'success'>('initial');

  useEffect(() => {
    if (!isOpen) {
      setStatus('initial');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = () => {
    setStatus('loading');
    
    // Giả lập quá trình kiểm tra thanh toán
    setTimeout(() => {
      setStatus('success');
      
      // Tự động chuyển bước sau khi hiển thị thành công 1.5s
      setTimeout(() => {
        onConfirm();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between transition-colors duration-500 ${status === 'success' ? 'bg-green-600' : 'bg-vetc-green'}`}>
          <div className="flex items-center space-x-2">
            {status === 'success' ? <PartyPopper size={20} /> : <CheckCircle2 size={20} />}
            <h3 className="font-bold">
              {status === 'initial' && 'Xác nhận thanh toán'}
              {status === 'loading' && 'Đang xác minh...'}
              {status === 'success' && 'Thanh toán thành công'}
            </h3>
          </div>
          {status === 'initial' && (
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'initial' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-center w-20 h-20 bg-red-50 text-red-500 rounded-full mx-auto shadow-inner">
                <AlertCircle size={40} />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-black text-red-600 uppercase tracking-tight mb-2">Khách hàng chưa thanh toán</h4>
                <p className="text-sm text-gray-500">Hệ thống ghi nhận đơn hàng chưa được thanh toán cọc. Vui lòng thu tiền mặt hoặc hướng dẫn khách hàng chuyển khoản số tiền:</p>
                <div className="mt-4 p-5 bg-red-50 border-2 border-red-100 rounded-2xl shadow-sm">
                  <p className="text-[10px] text-red-800 font-black uppercase tracking-widest mb-1">Số tiền cần thanh toán</p>
                  <p className="text-3xl font-black text-red-700">{depositAmount.toLocaleString()} VNĐ</p>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={onClose}
                  className="w-1/3 px-4 py-3.5 rounded-xl border-2 border-gray-100 font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAction}
                  className="w-2/3 bg-blue-600 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard size={18} />
                  <span>Chuyển điều phối</span>
                </button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="py-10 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
              <div className="relative">
                <Loader2 size={60} className="text-vetc-green animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-vetc-green rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-800">Đang kiểm tra thông tin...</h4>
                <p className="text-xs text-gray-500 mt-2">Hệ thống đang đối soát giao dịch với ngân hàng</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
                <CheckCircle2 size={50} />
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-black text-green-700">Đã thanh toán cọc</h4>
                <p className="text-sm text-gray-500 mt-2 font-medium">Giao dịch đã được ghi nhận trên hệ thống VETC</p>
                <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-200 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Đang chuyển sang bước tiếp theo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmDialog;
