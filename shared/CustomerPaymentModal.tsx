import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Bell,
  CheckCircle2,
  Camera,
  ImageIcon,
  Loader2,
  QrCode,
  RefreshCw,
  Send,
  Upload,
  X,
  ZoomIn
} from 'lucide-react';

export type CustomerPaymentType = 'deposit' | 'remaining';
export type PaymentMethodType = 'push' | 'qr' | 'cash';
export type PaymentPushStatus = 'pushing' | 'pushed' | 'success' | 'failed';
export type PaymentCheckStatus = 'pending' | 'checking' | 'paid' | 'unpaid';
export type CashPaymentStatus = 'pending' | 'confirmed';

export interface CustomerPaymentSession {
  method: PaymentMethodType | null;
  pushTime?: string;
  pushStatus?: PaymentPushStatus;
  qrData?: string;
  paymentCheckStatus?: PaymentCheckStatus;
  lastCheckedAt?: string;
  cashStatus?: CashPaymentStatus;
  cashConfirmedTime?: string;
  cashProofImages?: string[];
}

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: CustomerPaymentType;
  amount: string;
  orderId?: string;
  session: CustomerPaymentSession;
  onSessionChange: (session: CustomerPaymentSession) => void;
  allowCashPayment?: boolean;
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

const MAX_CASH_PROOF_IMAGES = 5;

const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentType,
  amount,
  orderId = 'RS12602020002',
  session,
  onSessionChange,
  allowCashPayment = false
}) => {
  const [showSwitchWarning, setShowSwitchWarning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const cashProofImages = session.cashProofImages ?? [];

  useEffect(() => {
    if (!isOpen) {
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

  const executeCash = () => {
    onSessionChange({
      ...session,
      method: 'cash',
      cashStatus: 'pending',
      cashProofImages: session.cashProofImages ?? []
    });
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const slotsLeft = MAX_CASH_PROOF_IMAGES - cashProofImages.length;
    const newUrls = Array.from(files)
      .slice(0, slotsLeft)
      .map(file => URL.createObjectURL(file));

    onSessionChange({
      ...session,
      method: 'cash',
      cashProofImages: [...cashProofImages, ...newUrls]
    });
    e.target.value = '';
  };

  const handleRemoveProofImage = (index: number) => {
    onSessionChange({
      ...session,
      cashProofImages: cashProofImages.filter((_, i) => i !== index)
    });
  };

  const handleConfirmCash = () => {
    onSessionChange({
      ...session,
      method: 'cash',
      cashStatus: 'confirmed',
      cashConfirmedTime: formatDateTime(new Date()),
      cashProofImages
    });
  };

  const handleSelectMethod = (method: PaymentMethodType) => {
    if (method === 'cash' && !allowCashPayment) return;
    if (method === 'push') executePush();
    else if (method === 'qr') executeQr();
    else executeCash();
  };

  const handleRequestChangeMethod = () => {
    setShowSwitchWarning(true);
  };

  const handleConfirmChangeMethod = () => {
    setShowSwitchWarning(false);
    onSessionChange({ method: null });
  };

  const renderChangeMethodButton = () => (
    <button
      type="button"
      onClick={handleRequestChangeMethod}
      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
    >
      Đổi phương thức
    </button>
  );

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
              <div className={`grid grid-cols-1 gap-3 ${allowCashPayment ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
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
                <button
                  onClick={() => handleSelectMethod('cash')}
                  disabled={!allowCashPayment}
                  title={allowCashPayment ? 'Xác nhận thu tiền mặt' : 'Chỉ vai trò Admin được sử dụng tiền mặt'}
                  className={`flex flex-col items-center p-5 border-2 rounded-xl transition-all group ${
                    allowCashPayment
                      ? 'border-gray-100 hover:border-vetc-green hover:bg-green-50/50'
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                    allowCashPayment
                      ? 'bg-amber-50 text-amber-600 group-hover:bg-vetc-green group-hover:text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Banknote size={22} />
                  </div>
                  <span className={`text-xs font-black ${allowCashPayment ? 'text-gray-800' : 'text-gray-400'}`}>Tiền mặt</span>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">
                    {allowCashPayment ? 'Ghi nhận thu tiền mặt tại quầy' : 'Chỉ dành cho Admin'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {session.method === 'push' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phương thức: Đẩy KH thanh toán</span>
                {renderChangeMethodButton()}
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
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phương thức: Gen QR Code</span>
                {renderChangeMethodButton()}
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

          {session.method === 'cash' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phương thức: Tiền mặt</span>
                {renderChangeMethodButton()}
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    {session.cashStatus === 'confirmed' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Banknote size={20} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black text-gray-800">
                      {session.cashStatus === 'confirmed'
                        ? 'Đã ghi nhận thu tiền mặt'
                        : 'Xác nhận thu tiền mặt từ khách hàng'}
                    </p>
                    {session.cashConfirmedTime && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        <span className="font-bold">Thời điểm ghi nhận:</span> {session.cashConfirmedTime}
                      </p>
                    )}
                    {session.cashStatus !== 'confirmed' && (
                      <p className="text-[11px] text-amber-700 mt-2 font-medium">
                        Vui lòng kiểm tra số tiền mặt trước khi xác nhận. Hành động này chỉ dành cho Admin.
                      </p>
                    )}
                  </div>
                </div>

                {session.cashStatus === 'confirmed' && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 size={12} />
                    <span>Đã thanh toán bằng tiền mặt</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera size={14} className="text-amber-600" />
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Ảnh bằng chứng thanh toán</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">
                    {cashProofImages.length}/{MAX_CASH_PROOF_IMAGES}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Đính kèm ảnh biên lai, ảnh chụp tiền mặt hoặc chứng từ thu tiền làm bằng chứng.
                </p>

                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleProofUpload}
                />

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {cashProofImages.length < MAX_CASH_PROOF_IMAGES && (
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50 transition-all flex flex-col items-center justify-center text-amber-600 group"
                    >
                      <Upload size={18} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[8px] font-bold mt-1 uppercase">Tải ảnh</span>
                    </button>
                  )}

                  {cashProofImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="aspect-square rounded-xl bg-gray-100 relative group overflow-hidden border border-gray-200 cursor-zoom-in"
                      onClick={() => setPreviewImage(src)}
                    >
                      <img src={src} alt={`Bằng chứng ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn size={16} className="text-white drop-shadow-md" />
                      </div>
                      {session.cashStatus !== 'confirmed' && (
                        <button
                          type="button"
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveProofImage(index);
                          }}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {cashProofImages.length === 0 && (
                  <p className="text-[10px] text-gray-400 italic flex items-center space-x-1">
                    <ImageIcon size={12} />
                    <span>Chưa có ảnh bằng chứng — vui lòng tải ảnh trước khi xác nhận</span>
                  </p>
                )}
              </div>

              {session.cashStatus !== 'confirmed' ? (
                <button
                  onClick={handleConfirmCash}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-amber-600 transition-all active:scale-95"
                >
                  <Banknote size={14} />
                  <span>Xác nhận đã thu tiền mặt</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmCash}
                  className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-amber-400 text-amber-700 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-50 transition-all active:scale-95"
                >
                  <RefreshCw size={14} />
                  <span>Ghi nhận lại</span>
                </button>
              )}
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
                Hệ thống sẽ <span className="font-bold text-red-600">hủy yêu cầu thanh toán cũ</span>. Bạn sẽ quay lại màn hình chọn phương thức để tạo{' '}
                <span className="font-bold text-vetc-green">yêu cầu thanh toán mới</span>.
                Bạn có chắc chắn muốn tiếp tục?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSwitchWarning(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold text-xs text-gray-500 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmChangeMethod}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 active:scale-95 transition-all"
                >
                  Xác nhận đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X size={22} />
          </button>
          <img
            src={previewImage}
            alt="Xem trước bằng chứng"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentModal;
