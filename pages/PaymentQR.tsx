import React, {useEffect, useState} from 'react';
import {ArrowLeft, CheckCircle2, Copy, CreditCard, QrCode, RefreshCw, ShieldCheck, X} from 'lucide-react';
import {FormData, Step} from '../types';
import PaymentConfirmDialog from '../shared/PaymentConfirmDialog';
import CancellationDialog from '../shared/CancellationDialog';

const CANCEL_REASONS = [
  "Không còn cần dịch vụ",
  "Tìm được dịch vụ khác",
  "Tài xế đến quá chậm",
  "Giá cả không phù hợp",
  "Lý do khác"
];

interface PaymentQRProps {
  data: FormData;
  onConfirm: () => void;
  onHandover?: (step? : Step) => void;
  onBack: () => void;
  onCancel: () => void;
  role?: 'OSA' | 'CSKH' | 'STATION' | 'DRIVER';
}

const PaymentQR: React.FC<PaymentQRProps> = ({ data, onConfirm, onHandover, onBack, onCancel, role = 'CSKH' }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [qrKey, setQrKey] = useState(0); // To force refresh QR code
  
  // Modal states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  // Timer state (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // CSKH Handlers
  const handleOpenPaymentConfirm = () => {
    setIsPaymentConfirmOpen(true);
  };

  const handleFinalConfirmPayment = () => {
    // Khi Dialog confirm gọi onConfirm (sau khi success)
    setIsPaymentConfirmOpen(false);
    handleCSKHHandover();
  };

  const handleCSKHHandover = () => {
    setIsVerifying(true);
    setActiveAction('cskh-handover');
    setTimeout(() => {
      setIsVerifying(false);
      setActiveAction(null);
      if (onHandover) onHandover(Step.SUCCESS);
    }, 1500);
  };

  // OSA Handlers
  const handleOSAAutoDispatch = () => {
    setIsVerifying(true);
    setActiveAction('osa-auto');
    setTimeout(() => {
      setIsVerifying(false);
      setActiveAction(null);
      onConfirm(); 
    }, 1500);
  };

  const handleOSAManualDispatch = () => {
    setIsVerifying(true);
    setActiveAction('osa-manual');
    setTimeout(() => {
      setIsVerifying(false);
      setActiveAction(null);
      if (onHandover) onHandover(); 
    }, 1500);
  };

  const handleRegenerateQR = () => {
    setQrKey(prev => prev + 1);
    setTimeLeft(900); // Reset timer to 15 minutes
  };

  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    onCancel();
  };

  const InfoRow = ({ label, value, canCopy = false }: { label: string, value: string, canCopy?: boolean }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 group">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-800">{value}</span>
          {canCopy && (
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-blue-500"
              title="Sao chép"
            >
              {copied ? <CheckCircle2 size={14} className="text-vetc-green" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <QrCode size={24} />
            <h2 className="font-bold">Thanh toán dịch vụ cứu hộ</h2>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm border border-white/20">
            MÃ ĐƠN: {data.orderId}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-56 h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden group">
                <img 
                  key={qrKey}
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VETC_PAYMENT_${data.orderId}_${data.pricing.estimatedPrice.replace(/,/g, '')}&refresh=${qrKey}`} 
                  alt="Payment QR" 
                  className="w-full h-full p-2"
                />
                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-4">
                  <ShieldCheck className="text-vetc-green mb-2" size={32} />
                  <span className="text-[10px] font-bold text-gray-600 uppercase">Thanh toán an toàn qua VietQR</span>
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-vetc-green -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-vetc-green -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-vetc-green -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-vetc-green -mb-1 -mr-1"></div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-vetc-green">
                <div className="w-2 h-2 bg-vetc-green rounded-full animate-pulse"></div>
                <span className="text-sm font-bold uppercase tracking-wider">Đang chờ thanh toán...</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleRegenerateQR}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border-2 border-blue-500 text-blue-600 text-[11px] font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                >
                  <RefreshCw size={14} />
                  <span>Tạo lại mã</span>
                </button>
                <button 
                  onClick={() => setIsCancelModalOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border-2 border-red-500 text-red-600 text-[11px] font-bold hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                >
                  <X size={14} />
                  <span>Hủy đơn</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl space-y-1 relative">
              <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm">
                <RefreshCw size={12} className={timeLeft <= 300 ? "animate-spin" : ""} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Thông tin chuyển khoản</h3>
              
              <InfoRow label="Số tiền" value={`${data.pricing.estimatedPrice} đ`} canCopy={true} />
              <InfoRow label="Nội dung cọc" value={`CỌC ĐƠN LẺ - ${data.customer.plate}`} canCopy={true} />
              <InfoRow label="Mã giao dịch" value={data.orderId} canCopy={true} />
            </div>

            <div className="text-xs text-gray-500 italic flex items-start space-x-2">
              <CheckCircle2 size={14} className="shrink-0 text-vetc-green mt-0.5" />
              <p>Hệ thống sẽ tự động xác nhận sau 1-3 phút kể từ khi khách hàng chuyển khoản thành công. Nếu quá thời gian vui lòng nhấn nút xác nhận bên dưới.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 border-t flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-white transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>
          
          {role === 'CSKH' ? (
            <>
              <button 
                onClick={handleOpenPaymentConfirm}
                disabled={isVerifying}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl bg-vetc-green text-white font-bold hover:bg-green-700 transition-all shadow-lg w-full sm:w-auto justify-center ${isVerifying && activeAction === 'cskh-confirm' ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <CreditCard size={18} />
                <span>Xác nhận thanh toán</span>
              </button>
            </>
          ) : (
            // <>
            //   <button
            //     onClick={handleOSAAutoDispatch}
            //     disabled={isVerifying}
            //     className={`flex items-center space-x-2 px-8 py-3 rounded-xl bg-[#00703C] text-white font-bold hover:bg-[#005a30] transition-all shadow-lg w-full sm:w-auto justify-center ${isVerifying && activeAction === 'osa-auto' ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            //   >
            //     {isVerifying && activeAction === 'osa-auto' ? (
            //       <Loader2 size={18} className="animate-spin" />
            //     ) : (
            //       <RefreshCw size={18} />
            //     )}
            //     <span>{isVerifying && activeAction === 'osa-auto' ? 'Đang xử lý...' : 'Xác nhận & điều phối tự động'}</span>
            //   </button>
            //
            //   <button
            //     onClick={handleOSAManualDispatch}
            //     disabled={isVerifying}
            //     className={`flex items-center space-x-2 px-8 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all shadow-lg w-full sm:w-auto justify-center ${isVerifying && activeAction === 'osa-manual' ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            //   >
            //     {isVerifying && activeAction === 'osa-manual' ? (
            //       <Loader2 size={18} className="animate-spin" />
            //     ) : (
            //       <Send size={18} />
            //     )}
            //     <span>{isVerifying && activeAction === 'osa-manual' ? 'Đang xử lý...' : 'Xác nhận & điều phối thủ công'}</span>
            //   </button>
            // </>
              <>
                <button
                    onClick={handleOSAAutoDispatch}
                    disabled={isVerifying}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl bg-vetc-green text-white font-bold hover:bg-green-700 transition-all shadow-lg w-full sm:w-auto justify-center ${isVerifying && activeAction === 'cskh-confirm' ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                >
                  <CreditCard size={18} />
                  <span>Xác nhận thanh toán</span>
                </button>
              </>
          )}
        </div>
      </div>

      {/* Cancellation Dialog */}
      <CancellationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        selectedReason={selectedCancelReason}
        setSelectedReason={setSelectedCancelReason}
        otherReason={cancelReason}
        setOtherReason={setCancelReason}
        cancelReasons={CANCEL_REASONS}
      />

      {/* Payment Confirmation Dialog */}
      <PaymentConfirmDialog 
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        onConfirm={handleFinalConfirmPayment}
        depositAmount={data.service.deposit || 200000}
      />
    </div>
  );
};

export default PaymentQR;
