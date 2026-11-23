export type AdvancePurpose = 'refund_customer' | 'pay_supplier';
export type AdvanceRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface AdvanceReason {
  id: string;
  label: string;
  purpose: AdvancePurpose;
}

export const ADVANCE_REASONS: AdvanceReason[] = [
  { id: 'kh_overpay', label: 'Khách thanh toán dư so với phí', purpose: 'refund_customer' },
  { id: 'kh_fee_down', label: 'Hoàn cọc khi điều chỉnh giảm phí', purpose: 'refund_customer' },
  { id: 'kh_urgent', label: 'Khách yêu cầu hoàn trước khi chốt đề nghị thanh toán', purpose: 'refund_customer' },
  { id: 'ncc_before_invoice', label: 'Nhà cung cấp yêu cầu thu trước khi xuất hóa đơn', purpose: 'pay_supplier' },
  { id: 'ncc_onsite', label: 'Ứng chi phí phát sinh tại hiện trường', purpose: 'pay_supplier' },
  { id: 'ncc_hold', label: 'Ứng giữ xe, cẩu hoặc phụ phí chưa có trong phí chốt', purpose: 'pay_supplier' },
];

export const reasonById = (id: string) => ADVANCE_REASONS.find((item) => item.id === id);

export interface AdvanceRequest {
  id: string;
  orderId: string;
  advancerName: string;
  purpose: AdvancePurpose;
  reasonId: string;
  requestedAmount: number;
  actualAmount: number | null;
  status: AdvanceRequestStatus;
  note: string;
  rejectReason: string;
  proofLabel: string;
  proofUrl: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: string;
  updatedAt: string;
}

export const ADVANCE_PURPOSE_LABEL: Record<AdvancePurpose, string> = {
  refund_customer: 'Hoàn cho khách',
  pay_supplier: 'Trả NCC',
};

export const ADVANCE_STATUS_LABEL: Record<AdvanceRequestStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã tạm ứng',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

export const ADVANCE_USERS: { name: string; balance: number }[] = [
  { name: 'Nguyễn Văn An', balance: 2_500_000 },
  { name: 'Trần Thị Bình', balance: 1_800_000 },
  { name: 'Lê Hoàng Nam', balance: 950_000 },
];

export const ADVANCE_BANKS = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'MB Bank',
  'Techcombank',
  'ACB',
  'VPBank',
  'TPBank',
  'Sacombank',
  'HDBank',
  'SHB',
  'VIB',
  'MSB',
  'OCB',
];

const listeners = new Set<() => void>();

let requests: AdvanceRequest[] = [];
const seededOrders = new Set<string>();
const lockedOrders = new Set<string>();
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const subscribeAdvanceRequests = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getAdvanceRequestVersion = () => version;

export const getAdvanceRequests = (orderId: string) =>
  requests.filter((item) => item.orderId === orderId);

export const isAdvanceLocked = (orderId: string) => lockedOrders.has(orderId);

export const lockAdvanceRequests = (orderId: string) => {
  if (lockedOrders.has(orderId)) return;
  lockedOrders.add(orderId);
  emit();
};

const reservedAmount = (orderId: string, purpose: AdvancePurpose) =>
  requests
    .filter((item) => item.orderId === orderId && item.purpose === purpose)
    .reduce((sum, item) => {
      if (item.status === 'confirmed') return sum + (item.actualAmount ?? 0);
      if (item.status === 'pending') return sum + item.requestedAmount;
      return sum;
    }, 0);

export const confirmedAmount = (orderId: string, purpose: AdvancePurpose) =>
  requests
    .filter(
      (item) =>
        item.orderId === orderId && item.purpose === purpose && item.status === 'confirmed'
    )
    .reduce((sum, item) => sum + (item.actualAmount ?? 0), 0);

export const remainingAdvanceCap = (
  orderId: string,
  purpose: AdvancePurpose,
  refundAmount: number,
  supplierCost: number
) => {
  const cap = purpose === 'refund_customer' ? refundAmount : supplierCost;
  return Math.max(0, cap - reservedAmount(orderId, purpose));
};

export const seedOrderAdvances = (
  orderId: string,
  refundAmount: number,
  supplierCost: number
) => {
  if (seededOrders.has(orderId)) return;
  if (refundAmount <= 0 && supplierCost <= 0) return;
  seededOrders.add(orderId);
  const now = '23/11/2026 09:15';
  if (supplierCost >= 400000) {
    requests.push({
      id: `${orderId}-sup`,
      orderId,
      advancerName: 'Trần Thị Bình',
      purpose: 'pay_supplier',
      reasonId: 'ncc_before_invoice',
      requestedAmount: 400000,
      actualAmount: 400000,
      status: 'confirmed',
      note: 'Ứng trả nhà cung cấp',
      rejectReason: '',
      proofLabel: 'UNC_tra_ncc.jpg',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      cccdFrontUrl: '',
      cccdBackUrl: '',
      bankName: 'Vietcombank',
      accountNumber: '0123456789',
      accountHolder: 'TRAN THI BINH',
      createdAt: now,
      updatedAt: '23/11/2026 09:42',
    });
  }
  if (refundAmount >= 200000) {
    requests.push({
      id: `${orderId}-ref`,
      orderId,
      advancerName: 'Nguyễn Văn An',
      purpose: 'refund_customer',
      reasonId: 'kh_overpay',
      requestedAmount: 200000,
      actualAmount: 200000,
      status: 'confirmed',
      note: 'Ứng hoàn cho khách',
      rejectReason: '',
      proofLabel: 'UNC_hoan_khach.jpg',
      proofUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      cccdFrontUrl: '',
      cccdBackUrl: '',
      bankName: 'MB Bank',
      accountNumber: '9988776655',
      accountHolder: 'NGUYEN VAN AN',
      createdAt: now,
      updatedAt: '23/11/2026 09:48',
    });
  }
  if (supplierCost - confirmedAmount(orderId, 'pay_supplier') >= 100000) {
    requests.push({
      id: `${orderId}-wait`,
      orderId,
      advancerName: 'Lê Hoàng Nam',
      purpose: 'pay_supplier',
      reasonId: 'ncc_onsite',
      requestedAmount: 100000,
      actualAmount: null,
      status: 'pending',
      note: '',
      rejectReason: '',
      proofLabel: '',
      proofUrl: '',
      cccdFrontUrl: '',
      cccdBackUrl: '',
      bankName: 'Techcombank',
      accountNumber: '190345678901',
      accountHolder: 'LE HOANG NAM',
      createdAt: '23/11/2026 10:05',
      updatedAt: '23/11/2026 10:05',
    });
  }
  emit();
};

export const createAdvanceRequest = (input: {
  orderId: string;
  advancerName: string;
  purpose: AdvancePurpose;
  reasonId: string;
  requestedAmount: number;
  note: string;
  proofLabel: string;
  proofUrl: string;
  cccdFrontUrl: string;
  cccdBackUrl: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}) => {
  requests = [
    {
      id: `${input.orderId}-${Date.now()}`,
      orderId: input.orderId,
      advancerName: input.advancerName,
      purpose: input.purpose,
      reasonId: input.reasonId,
      requestedAmount: input.requestedAmount,
      actualAmount: null,
      status: 'pending',
      note: input.note,
      rejectReason: '',
      proofLabel: input.proofLabel,
      proofUrl: input.proofUrl,
      cccdFrontUrl: input.cccdFrontUrl,
      cccdBackUrl: input.cccdBackUrl,
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      accountHolder: input.accountHolder,
      createdAt: new Date().toLocaleString('vi-VN', { hour12: false }),
      updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
    },
    ...requests,
  ];
  emit();
};

export const cancelAdvanceRequest = (id: string) => {
  const updatedAt = new Date().toLocaleString('vi-VN', { hour12: false });
  requests = requests.map((item) =>
    item.id === id && item.status === 'pending' ? { ...item, status: 'cancelled', updatedAt } : item
  );
  emit();
};
