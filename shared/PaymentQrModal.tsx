import React from 'react';
import { QrCode, X } from 'lucide-react';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: string;
  bankName?: string;
  accountNumber?: string;
  content?: string;
  qrData?: string;
}

const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  amount = "50,000",
  bankName = "BIDV",
  accountNumber = "1234567890",
  content = "THANH TOAN COC",
  qrData = "VETC_PAYMENT_DEPOSIT_50000"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-sm">
        <div className="bg-vetc-green p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode size={20} />
            <h3 className="font-bold">Mã QR Thanh toán</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 flex flex-col items-center space-y-6">
          <div className="relative p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="w-48 h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`}
                alt="Payment QR"
                className="w-full h-full p-2"
              />
            </div>
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-vetc-green -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-vetc-green -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-vetc-green -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-vetc-green -mb-1 -mr-1"></div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Số tiền cần thanh toán</p>
            <p className="text-2xl font-black text-vetc-green">{amount} VNĐ</p>
          </div>

          <div className="w-full bg-gray-50 p-4 rounded-xl space-y-2 text-left">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 font-bold uppercase">Ngân hàng</span>
              <span className="text-gray-700 font-bold">{bankName}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 font-bold uppercase">Số tài khoản</span>
              <span className="text-gray-700 font-bold">{accountNumber}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400 font-bold uppercase">Nội dung</span>
              <span className="text-gray-700 font-bold">{content}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-vetc-green text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentQrModal;
