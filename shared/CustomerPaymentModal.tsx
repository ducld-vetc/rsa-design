import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Loader2,
  QrCode,
  RefreshCw,
  Send,
  X
} from 'lucide-react';

export type CustomerPaymentType = 'deposit' | 'remaining';
export type PaymentMethodType = 'push' | 'qr';
export type PaymentPushStatus = 'pushing' | 'pushed' | 'success' | 'failed';
export type PaymentCheckStatus = 'pending' | 'checking' | 'paid' | 'unpaid';

export interface CustomerPaymentSession {
  method: PaymentMethodType | null;
  pushTime?: string;
  pushStatus?: PaymentPushStatus;
  qrData?: string;
  paymentCheckStatus?: PaymentCheckStatus;
  lastCheckedAt?: string;
}

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: CustomerPaymentType;
  amount: string;
  orderId?: string;
  session: CustomerPaymentSession;
  onSessionChange: (session: CustomerPaymentSession) => void;
}

const formatDateTime = (date: Date) =>
  date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const pushStatusLabel: Record<PaymentPushStatus, string> = {
  pushing: 'Đang đẩy...',
  pushed: 'Đã đẩy — chờ KH thanh toán',
  success: 'Khách hàng đã thanh toán',
  failed: 'Đẩy thất bại'
};

const pushStatusColor: Record<PaymentPushStatus, string> = {
  pushing: 'bg-blue-50 text-blue-700 border-blue-200',
  pushed: 'bg-amber-50 text-amber-700 border-amber-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200'
};

const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentType,
  amount,
  orderId = 'RS12602020002',
  session,
  onSessionChange
}) => {
  const [pendingMethod, setPendingMethod] = useState<PaymentMethodType | null>(null);
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPendingMethod(null);
      setShowSwitchWarning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const title = paymentType === 'deposit' ? 'Thanh toán tiền cọc' : 'Thanh toán phần còn lại';
  const qrData = session.qrData || `VETC_PAYMENT_${paymentType.toUpperCase()}_${orderId}_${amount.replace(/,/g, '')}`;

  const executePush = () => {
    onSessionChange({
      method: 'push',
      pushStatus: 'pushing'
    });
    setTimeout(() => {
      onSessionChange({
        method: 'push',
        pushStatus: 'pushed',
        pushTime: formatDateTime(new Date())
      });
    }, 1200);
  };

  const executeQr = () => {
    onSessionChange({
      method: 'qr',
      qrData: `VETC_PAYMENT_${paymentType.toUpperCase()}_${orderId}_${amount.replace(/,/g, '')}_${Date.now()}`,
      paymentCheckStatus: 'pending'
    });
  };

  const handleSelectMethod = (method: PaymentMethodType) => {
    if (session.method && session.method !== method) {
      setPendingMethod(method);
      setShowSwitchWarning(true);
      return;
    }
    if (method === 'push') executePush();
    else executeQr();
  };

  const handleConfirmSwitch = () => {
    if (!pendingMethod) return;
    setShowSwitchWarning(false);
    if (pendingMethod === 'push') executePush();
    else executeQr();
    setPendingMethod(null);
  };

  const handleRetryPush = () => executePush();

  const handleCheckPaymentStatus = () => {
    onSessionChange({
      ...session,
      paymentCheckStatus: 'checking'
    });
    setTimeout(() => {
      onSessionChange({
        ...session,
        paymentCheckStatus: 'unpaid',
        lastCheckedAt: formatDateTime(new Date())
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-lg">
        <div className="bg-vetc-green p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode size={20} />
            <h3 className="font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Số tiền cần thanh toán</p>
            <p className="text-2xl font-black text-vetc-green mt-1">{amount} VNĐ</p>
          </div>

          {!session.method && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold text-gray-500 text-center">Chọn phương thức thanh toán</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectMethod('push')}
                  className="flex flex-col items-center p-5 border-2 border-gray-100 rounded-xl hover:border-vetc-green hover:bg-green-50/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-vetc-green group-hover:text-white transition-colors">
                    <Send size={22} />
                  </div>
                  <span className="text-xs font-black text-gray-800">Đẩy KH thanh toán</span>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">Gửi yêu cầu TT lên app khách hàng</span>
                </button>
                <button
                  onClick={() => handleSelectMethod('qr')}
                  className="flex flex-col items-center p-5 border-2 border-gray-100 rounded-xl hover:border-vetc-green hover:bg-green-50/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 text-vetc-green flex items-center justify-center mb-3 group-hover:bg-vetc-green group-hover:text-white transition-colors">
                    <QrCode size={22} />
                  </div>
                  <span className="text-xs font-black text-gray-800">Gen QR Code</span>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">Tạo mã QR để KH quét thanh toán</span>
                </button>
              </div>
            </div>
          )}

          {session.method === 'push' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phương thức: Đẩy KH thanh toán</span>
                <button
                  onClick={() => {
                    setPendingMethod('qr');
                    setShowSwitchWarning(true);
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Đổi sang QR Code
                </button>
              </div>

              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    {session.pushStatus === 'pushing' ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black text-gray-800">
                      {session.pushStatus === 'pushing' ? 'Đang đẩy thanh toán...' : 'Đã đẩy thanh toán cho khách hàng'}
                    </p>
                    {session.pushTime && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        <span className="font-bold">Thời điểm đẩy:</span> {session.pushTime}
                      </p>
                    )}
                  </div>
                </div>

                {session.pushStatus && session.pushStatus !== 'pushing' && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${pushStatusColor[session.pushStatus]}`}>
                    {session.pushStatus === 'success' ? <CheckCircle2 size={12} /> : <Bell size={12} />}
                    <span>{pushStatusLabel[session.pushStatus]}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleRetryPush}
                disabled={session.pushStatus === 'pushing'}
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-vetc-green text-vetc-green py-2.5 rounded-xl text-xs font-bold hover:bg-green-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={14} className={session.pushStatus === 'pushing' ? 'animate-spin' : ''} />
                <span>Đẩy lại</span>
              </button>
            </div>
          )}

          {session.method === 'qr' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phương thức: Gen QR Code</span>
                <button
                  onClick={() => {
                    setPendingMethod('push');
                    setShowSwitchWarning(true);
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Đổi sang đẩy KH
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative p-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="w-44 h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
                      alt="Payment QR"
                      className="w-full h-full p-2"
                    />
                  </div>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-vetc-green -mt-0.5 -ml-0.5" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-vetc-green -mt-0.5 -mr-0.5" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-vetc-green -mb-0.5 -ml-0.5" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-vetc-green -mb-0.5 -mr-0.5" />
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-medium">Hướng dẫn khách hàng quét mã để thanh toán</p>
              </div>

              {session.lastCheckedAt && session.paymentCheckStatus === 'unpaid' && (
                <p className="text-[11px] text-center text-gray-500">
                  Kiểm tra lần cuối: <span className="font-bold">{session.lastCheckedAt}</span> — Chưa thanh toán
                </p>
              )}
              {session.paymentCheckStatus === 'paid' && (
                <div className="flex items-center justify-center space-x-2 text-green-600 text-xs font-bold">
                  <CheckCircle2 size={14} />
                  <span>Khách hàng đã thanh toán</span>
                </div>
              )}

              <button
                onClick={handleCheckPaymentStatus}
                disabled={session.paymentCheckStatus === 'checking'}
                className="w-full flex items-center justify-center space-x-2 bg-vetc-green text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-green-700 transition-all active:scale-95 disabled:opacity-70"
              >
                {session.paymentCheckStatus === 'checking' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Kiểm tra trạng thái thủ công</span>
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>

      {showSwitchWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="bg-amber-500 p-4 text-white flex items-center space-x-2">
              <AlertTriangle size={20} />
              <h4 className="font-bold text-sm">Đổi phương thức thanh toán</h4>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Hệ thống sẽ <span className="font-bold text-red-600">hủy yêu cầu thanh toán cũ</span> và tạo{' '}
                <span className="font-bold text-vetc-green">yêu cầu thanh toán mới</span> theo phương thức bạn chọn.
                Bạn có chắc chắn muốn tiếp tục?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSwitchWarning(false);
                    setPendingMethod(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border font-bold text-xs text-gray-500 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmSwitch}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 active:scale-95 transition-all"
                >
                  Xác nhận đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentModal;
