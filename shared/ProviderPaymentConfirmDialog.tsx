import React from 'react';
import { CreditCard, Info } from 'lucide-react';

interface ProviderPaymentConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partnerName: string;
}

const ProviderPaymentConfirmDialog: React.FC<ProviderPaymentConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  partnerName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md">
        <div className="bg-blue-600 p-4 text-white flex items-center space-x-3">
          <CreditCard size={22} />
          <h3 className="font-bold">Xác nhận thanh toán</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p>Bạn có chắc chắn muốn xác nhận thanh toán chi phí cứu hộ cho đối tác cứu hộ <strong>{partnerName}</strong>?</p>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderPaymentConfirmDialog;
