import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Banknote,
  Bell,
  Loader2,
  QrCode,
  RefreshCw,
  Send,
  Upload,
  X
} from 'lucide-react';

export type CustomerPaymentType = 'deposit' | 'remaining';
export type PaymentMethodType = 'push' | 'qr' | 'cash';
export type PaymentPushStatus = 'pushing' | 'pushed' | 'success' | 'failed';
export type PaymentCheckStatus = 'pending' | 'checking' | 'paid' | 'unpaid';
export type CashPaymentStatus = 'pending' | 'confirmed';

export interface CustomerPaymentSession {
  method: PaymentMethodType | null;
  /** Số tiền của lần thanh toán này. Nhỏ hơn số còn phải thu là thu một phần. */
  partialAmount?: number;
  pushTime?: string;
  pushStatus?: PaymentPushStatus;
  qrData?: string;
  paymentCheckStatus?: PaymentCheckStatus;
  lastCheckedAt?: string;
  cashStatus?: CashPaymentStatus;
  cashConfirmedTime?: string;
  cashProofImages?: string[];
}

export type PaymentTxnState = 'PENDING' | 'SUCCESS' | 'CANCELLED';

export interface PaymentTransaction {
  id: string;
  paymentType: CustomerPaymentType;
  method: PaymentMethodType;
  amount: number;
  state: PaymentTxnState;
  createdAt: string;
  pushTime?: string;
  pushStatus?: PaymentPushStatus;
  qrData?: string;
  paymentCheckStatus?: PaymentCheckStatus;
  lastCheckedAt?: string;
  cashStatus?: CashPaymentStatus;
  cashConfirmedTime?: string;
  cashProofImages?: string[];
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethodType, string> = {
  push: 'Đẩy App',
  qr: 'QR',
  cash: 'Tiền mặt'
};

export const PAYMENT_TXN_STATE_LABEL: Record<PaymentTxnState, string> = {
  PENDING: 'Đang chờ',
  SUCCESS: 'Thành công',
  CANCELLED: 'Đã hủy'
};

export const PAYMENT_TYPE_LABEL: Record<CustomerPaymentType, string> = {
  deposit: 'Cọc',
  remaining: 'Còn lại'
};

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType: CustomerPaymentType;
  /** Phần chưa gán của cọc hoặc phần còn lại. Giao dịch đang chờ cũng chiếm phần này. */
  maxAmount: number;
  orderId?: string;
  transactions: PaymentTransaction[];
  onTransactionsChange: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
  onViewTransaction?: (id: string) => void;
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

const parseMoney = (value: string) => parseInt(value.replace(/\D/g, ''), 10) || 0;

const formatMoney = (value: number) => value.toLocaleString('en-US');

const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentType,
  maxAmount,
  orderId = 'RS12602020002',
  transactions,
  onTransactionsChange,
  onViewTransaction,
  allowCashPayment = false
}) => {
  const [amountText, setAmountText] = useState('');
  const [amountError, setAmountError] = useState('');
  const idSeq = useRef(0);

  const typeTransactions = transactions.filter((item) => item.paymentType === paymentType);
  const pendingMethods = new Set(
    typeTransactions.filter((item) => item.state === 'PENDING').map((item) => item.method)
  );

  useEffect(() => {
    if (!isOpen) return;
    setAmountError('');
  }, [isOpen, paymentType]);

  useEffect(() => {
    if (!isOpen) return;
    setAmountText(maxAmount > 0 ? formatMoney(maxAmount) : '');
  }, [isOpen, paymentType, maxAmount]);

  if (!isOpen) return null;

  const title = paymentType === 'deposit' ? 'Thanh toán tiền cọc' : 'Thanh toán phần còn lại';

  const resolvePayAmount = () => {
    const value = parseMoney(amountText);
    if (value <= 0) {
      setAmountError('Nhập số tiền thanh toán lớn hơn 0');
      return null;
    }
    if (value > maxAmount) {
      setAmountError(`Số tiền không được lớn hơn số còn phải thu (${formatMoney(maxAmount)} VNĐ)`);
      return null;
    }
    setAmountError('');
    return value;
  };

  const createTransaction = (method: PaymentMethodType, payAmount: number): string => {
    idSeq.current += 1;
    const id = `pt-${Date.now()}-${idSeq.current}`;
    const created: PaymentTransaction = {
      id,
      paymentType,
      method,
      amount: payAmount,
      state: 'PENDING',
      createdAt: formatDateTime(new Date()),
      pushStatus: method === 'push' ? 'pushing' : undefined,
      qrData: method === 'qr'
        ? `VETC_PAYMENT_${paymentType.toUpperCase()}_${orderId}_${payAmount}_${id}`
        : undefined,
      paymentCheckStatus: method === 'cash' ? undefined : 'pending',
      cashStatus: method === 'cash' ? 'pending' : undefined,
      cashProofImages: method === 'cash' ? [] : undefined
    };
    onTransactionsChange((current) => [created, ...current]);
    onViewTransaction?.(id);
    if (method === 'push') {
      setTimeout(() => {
        onTransactionsChange((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  pushStatus: 'pushed',
                  pushTime: formatDateTime(new Date()),
                  paymentCheckStatus: 'pending'
                }
              : item
          )
        );
      }, 1200);
    }
    return id;
  };

  const executePush = (payAmount: number) => {
    createTransaction('push', payAmount);
  };

  const executeQr = (payAmount: number) => {
    createTransaction('qr', payAmount);
  };

  const executeCash = (payAmount: number) => {
    createTransaction('cash', payAmount);
  };

  const handleSelectMethod = (method: PaymentMethodType) => {
    if (method === 'cash' && !allowCashPayment) return;
    if (pendingMethods.has(method)) {
      setAmountError(`Đã có giao dịch ${PAYMENT_METHOD_LABEL[method]} đang chờ. Hủy dòng đó trước khi tạo dòng mới cùng phương thức.`);
      return;
    }
    const payAmount = resolvePayAmount();
    if (payAmount == null) return;
    if (method === 'push') executePush(payAmount);
    else if (method === 'qr') executeQr(payAmount);
    else executeCash(payAmount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-lg max-h-[min(90vh,860px)] flex flex-col">
        <div className="bg-vetc-green p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <QrCode size={20} />
            <h3 className="font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Số còn phải thu</p>
              <p className="text-sm font-bold text-gray-500 mt-1">{formatMoney(maxAmount)} VNĐ</p>
            </div>
            {maxAmount <= 0 ? (
              <p className="text-center text-[11px] font-semibold text-gray-500">
                Đã gán hết số còn phải thu. Hủy giao dịch đang chờ nếu muốn tạo dòng khác.
              </p>
            ) : (
              <div className="text-left">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Số tiền giao dịch mới *
                </label>
                <input
                  inputMode="numeric"
                  value={amountText}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '');
                    setAmountText(digits ? formatMoney(parseInt(digits, 10)) : '');
                    setAmountError('');
                  }}
                  placeholder="Nhập số tiền"
                  className="w-full rounded-lg border px-3 py-2 text-right text-lg font-black text-vetc-green outline-none focus:border-vetc-green"
                />
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Mỗi lần chọn phương thức tạo thêm một giao dịch đang chờ. Có thể mở nhiều giao dịch cùng lúc, mỗi phương thức một dòng.
                </p>
                {amountError && (
                  <p className="mt-1 text-[11px] font-semibold text-red-600">{amountError}</p>
                )}
              </div>
            )}
          </div>

          {maxAmount > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold text-gray-500 text-center">Chọn phương thức thanh toán</p>
              <div className={`grid grid-cols-1 gap-3 ${allowCashPayment ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                <button
                  onClick={() => handleSelectMethod('push')}
                  disabled={pendingMethods.has('push')}
                  className="flex flex-col items-center p-5 border-2 border-gray-100 rounded-xl hover:border-vetc-green hover:bg-green-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:bg-white"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-vetc-green group-hover:text-white transition-colors">
                    <Send size={22} />
                  </div>
                  <span className="text-xs font-black text-gray-800">Đẩy KH thanh toán</span>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">Gửi yêu cầu TT lên app khách hàng</span>
                </button>
                <button
                  onClick={() => handleSelectMethod('qr')}
                  disabled={pendingMethods.has('qr')}
                  className="flex flex-col items-center p-5 border-2 border-gray-100 rounded-xl hover:border-vetc-green hover:bg-green-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-100 disabled:hover:bg-white"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 text-vetc-green flex items-center justify-center mb-3 group-hover:bg-vetc-green group-hover:text-white transition-colors">
                    <QrCode size={22} />
                  </div>
                  <span className="text-xs font-black text-gray-800">Gen QR Code</span>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">Tạo mã QR để KH quét thanh toán</span>
                </button>
                <button
                  onClick={() => handleSelectMethod('cash')}
                  disabled={!allowCashPayment || pendingMethods.has('cash')}
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


          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Giao dịch của {paymentType === 'deposit' ? 'tiền cọc' : 'phần còn lại'}
            </p>
            <p className="text-[11px] text-gray-400">Bấm một dòng để mở chi tiết giao dịch.</p>
            {typeTransactions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 px-3 py-3 text-[11px] text-gray-400">
                Chưa có giao dịch. Nhập số tiền và chọn phương thức để tạo dòng mới.
              </p>
            ) : (
              <div className="space-y-2">
                {typeTransactions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onViewTransaction?.(item.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-left hover:border-vetc-green hover:bg-green-50/40"
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold text-gray-800">
                        {PAYMENT_METHOD_LABEL[item.method]} · {formatMoney(item.amount)} VNĐ
                      </span>
                      <span className="block text-[10px] text-gray-400">{item.createdAt}</span>
                    </span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      item.state === 'SUCCESS'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : item.state === 'CANCELLED'
                          ? 'border-gray-200 bg-gray-50 text-gray-500'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}>
                      {PAYMENT_TXN_STATE_LABEL[item.state]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>

    </div>
  );
};

interface PaymentTransactionDetailModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
  onTransactionsChange: React.Dispatch<React.SetStateAction<PaymentTransaction[]>>;
}

export const PaymentTransactionDetailModal: React.FC<PaymentTransactionDetailModalProps> = ({
  transaction,
  onClose,
  onTransactionsChange
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  if (!transaction) return null;

  const cashProofImages = transaction.cashProofImages ?? [];
  const qrData = transaction.qrData || `VETC_PAYMENT_${transaction.paymentType.toUpperCase()}_${transaction.amount}_${transaction.id}`;

  const patch = (partial: Partial<PaymentTransaction>) => {
    const id = transaction.id;
    onTransactionsChange((current) => current.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  };

  const handleConfirmCancel = () => {
    if (transaction.state === 'PENDING') patch({ state: 'CANCELLED' });
    setShowCancelConfirm(false);
    onClose();
  };

  const handleRetryPush = () => {
    const id = transaction.id;
    patch({ pushStatus: 'pushing' });
    setTimeout(() => {
      onTransactionsChange((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, pushStatus: 'pushed', pushTime: formatDateTime(new Date()), paymentCheckStatus: 'pending' }
            : item
        )
      );
    }, 1200);
  };

  const handleCheckPaymentStatus = () => {
    const id = transaction.id;
    patch({ paymentCheckStatus: 'checking' });
    setTimeout(() => {
      onTransactionsChange((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, paymentCheckStatus: 'unpaid', lastCheckedAt: formatDateTime(new Date()) }
            : item
        )
      );
    }, 1500);
  };

  const handleProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const slotsLeft = MAX_CASH_PROOF_IMAGES - cashProofImages.length;
    const newUrls = Array.from(files)
      .slice(0, slotsLeft)
      .map((file) => URL.createObjectURL(file as Blob));
    patch({ cashProofImages: [...cashProofImages, ...newUrls] });
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-lg max-h-[min(90vh,860px)] flex flex-col">
        <div className="bg-vetc-green p-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold">Chi tiết giao dịch</h3>
            <p className="text-[11px] text-white/80 mt-0.5">
              {PAYMENT_TYPE_LABEL[transaction.paymentType]} · {PAYMENT_METHOD_LABEL[transaction.method]} · {formatMoney(transaction.amount)} VNĐ
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              transaction.state === 'SUCCESS'
                ? 'border-green-200 bg-green-50 text-green-700'
                : transaction.state === 'CANCELLED'
                  ? 'border-gray-200 bg-gray-50 text-gray-500'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}>
              {PAYMENT_TXN_STATE_LABEL[transaction.state]}
            </span>
            <span className="text-[10px] text-gray-400">{transaction.createdAt}</span>
          </div>

          {transaction.method === 'push' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    {transaction.pushStatus === 'pushing' ? <Loader2 size={20} className="animate-spin" /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-black text-gray-800">
                      {transaction.pushStatus === 'pushing' ? 'Đang đẩy thanh toán...' : 'Đã đẩy thanh toán cho khách hàng'}
                    </p>
                    {transaction.pushTime && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        <span className="font-bold">Thời điểm đẩy:</span> {transaction.pushTime}
                      </p>
                    )}
                  </div>
                  {transaction.state === 'PENDING' && transaction.pushStatus && transaction.pushStatus !== 'pushing' && (
                    <button
                      onClick={handleRetryPush}
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                    >
                      <RefreshCw size={11} />
                      <span>Đẩy lại</span>
                    </button>
                  )}
                </div>
                {transaction.pushStatus && transaction.pushStatus !== 'pushing' && (
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${pushStatusColor[transaction.pushStatus]}`}>
                    <Bell size={12} />
                    <span>{pushStatusLabel[transaction.pushStatus]}</span>
                  </div>
                )}
              </div>
              {transaction.lastCheckedAt && transaction.paymentCheckStatus === 'unpaid' && (
                <p className="text-[11px] text-center text-gray-500">
                  Kiểm tra lần cuối: <span className="font-bold">{transaction.lastCheckedAt}</span> — Chưa thanh toán
                </p>
              )}
              {transaction.state === 'PENDING' && transaction.pushStatus !== 'pushing' && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={transaction.paymentCheckStatus === 'checking'}
                  className="w-full flex items-center justify-center space-x-2 bg-vetc-green text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-green-700 disabled:opacity-70"
                >
                  {transaction.paymentCheckStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>Kiểm tra trạng thái thanh toán</span>
                </button>
              )}
            </div>
          )}

          {transaction.method === 'qr' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative p-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="w-44 h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
                      alt="Payment QR"
                      className="w-full h-full p-2"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-medium">Hướng dẫn khách hàng quét mã để thanh toán</p>
              </div>
              {transaction.lastCheckedAt && transaction.paymentCheckStatus === 'unpaid' && (
                <p className="text-[11px] text-center text-gray-500">
                  Kiểm tra lần cuối: <span className="font-bold">{transaction.lastCheckedAt}</span> — Chưa thanh toán
                </p>
              )}
              {transaction.state === 'PENDING' && (
                <button
                  onClick={handleCheckPaymentStatus}
                  disabled={transaction.paymentCheckStatus === 'checking'}
                  className="w-full flex items-center justify-center space-x-2 bg-vetc-green text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-green-700 disabled:opacity-70"
                >
                  {transaction.paymentCheckStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  <span>Kiểm tra trạng thái thủ công</span>
                </button>
              )}
            </div>
          )}

          {transaction.method === 'cash' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-left">
                <p className="text-sm font-black text-gray-800">
                  {transaction.cashStatus === 'confirmed' ? 'Đã ghi nhận thu tiền mặt' : 'Xác nhận thu tiền mặt từ khách hàng'}
                </p>
                {transaction.cashConfirmedTime && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    <span className="font-bold">Thời điểm ghi nhận:</span> {transaction.cashConfirmedTime}
                  </p>
                )}
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Ảnh bằng chứng thanh toán</span>
                  <span className="text-[9px] font-bold text-gray-400">{cashProofImages.length}/{MAX_CASH_PROOF_IMAGES}</span>
                </div>
                <input ref={proofInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleProofUpload} />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {transaction.state === 'PENDING' && cashProofImages.length < MAX_CASH_PROOF_IMAGES && (
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 hover:border-amber-400 flex flex-col items-center justify-center text-amber-600"
                    >
                      <Upload size={18} />
                      <span className="text-[8px] font-bold mt-1 uppercase">Tải ảnh</span>
                    </button>
                  )}
                  {cashProofImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden border border-gray-200 cursor-zoom-in"
                      onClick={() => setPreviewImage(src)}
                    >
                      <img src={src} alt={`Bằng chứng ${index + 1}`} className="w-full h-full object-cover" />
                      {transaction.state === 'PENDING' && (
                        <button
                          type="button"
                          className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full"
                          onClick={(event) => {
                            event.stopPropagation();
                            patch({ cashProofImages: cashProofImages.filter((_, imageIndex) => imageIndex !== index) });
                          }}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {transaction.state === 'PENDING' && (
                <button
                  onClick={() => patch({
                    cashStatus: 'confirmed',
                    cashConfirmedTime: formatDateTime(new Date()),
                    cashProofImages,
                    state: 'SUCCESS'
                  })}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-amber-600"
                >
                  <Banknote size={14} />
                  <span>Xác nhận đã thu tiền mặt</span>
                </button>
              )}
            </div>
          )}

          {transaction.state === 'PENDING' && (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="w-full border border-red-200 text-red-600 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50"
            >
              Hủy giao dịch này
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-amber-500 p-4 text-white flex items-center space-x-2">
              <AlertTriangle size={20} />
              <h4 className="font-bold text-sm">Hủy giao dịch đang chờ</h4>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Hệ thống sẽ hủy giao dịch này. Các giao dịch khác trên đơn vẫn giữ nguyên.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold text-xs text-gray-500 hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-6" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Xem trước bằng chứng" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default CustomerPaymentModal;
