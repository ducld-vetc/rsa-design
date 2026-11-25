import { ADVANCE_PAYER_LABEL, type AdvancePayer } from './advanceRequestStore';

export type { AdvancePayer };
export { ADVANCE_PAYER_LABEL };

export interface PaymentRequestHistoryEntry {
  createdAt: string;
  createdBy: string;
  status: PaymentRequestStatus;
  rejectionReason: string;
}

export const buildPaymentRequestHistory = (
  record: Pick<
    PaymentRequestListItem,
    'status' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'rejectionReason'
  >,
  currentStatus?: PaymentRequestStatus,
): PaymentRequestHistoryEntry[] => {
  const status = currentStatus ?? record.status;
  return [
    {
      createdAt: record.createdAt || '—',
      createdBy: record.createdBy || '—',
      status,
      rejectionReason: status === 'rejected' ? record.rejectionReason || '' : '',
    },
  ];
};

export const formatAdvancePayers = (payers: Array<AdvancePayer | null | undefined>) => {
  const labels = payers
    .filter((payer): payer is AdvancePayer => Boolean(payer))
    .map((payer) => ADVANCE_PAYER_LABEL[payer]);
  const unique = Array.from(new Set(labels));
  return unique.length > 0 ? unique.join(', ') : '';
};

export type PaymentRequestStatus =
  | 'not_created'
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'awaiting_payment'
  | 'paid'
  | 'rejected';
export type AttachmentStatus = 'no_files' | 'complete' | 'has_invoice' | 'has_transfer';
export type OrderType = 'single' | 'package';
export type AdvancePurpose = 'refund_customer' | 'pay_supplier';

export const ADVANCE_PURPOSE_LABEL: Record<AdvancePurpose, string> = {
  refund_customer: 'Hoàn cho khách',
  pay_supplier: 'Trả NCC',
};

export interface PaymentAdvanceLine {
  id: string;
  advancerName: string;
  purpose: AdvancePurpose;
  reimburseBy: AdvancePayer;
  reason: string;
  requestedAmount: number;
  actualAmount: number;
  proofLabel: string;
}

export interface PaymentRequestListItem {
  id: string;
  orderId: string;
  orderType: OrderType;
  attachmentStatus: AttachmentStatus;
  status: PaymentRequestStatus;
  rejectionReason?: string;
  rescueUnit: { name: string; phone: string };
  rescueStation: { name: string; phone: string };
  vehicle: { plate: string; owner: string; phone: string };
  amount: number;
  supplierCost: number;
  refundAmount: number;
  advancedRefund: number;
  advancedSupplier: number;
  customerPayable: number;
  advancerPayable: number;
  nccPayable: number;
  refundReimburseBy: AdvancePayer | null;
  supplierReimburseBy: AdvancePayer | null;
  hasPendingAdvance: boolean;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
  paymentDueDate?: string;
  transferAmount?: number | null;
  rescueCrew?: {
    plate: string;
    brand: string;
    line: string;
    driverName: string;
    driverPhone: string;
  };
  providerType?: string;
  provider?: string;
  phone?: string;
}

export interface PaymentRequestDetail {
  orderId: string;
  status: PaymentRequestStatus;
  orderType: OrderType;
  service: string;
  quantity: number;
  customer: string;
  customerPhone: string;
  plate: string;
  customerType: string;
  enterpriseCustomerName: string;
  customerSource: string;
  packageCode: string;
  rescueAddress: string;
  towingDestination: string;
  rescueDistanceKm: number;
  orderCost: number;
  totalCustomerReceivable: number;
  customerDeposit: number;
  refundAmount: number;
  advancedRefund: number;
  advancedSupplier: number;
  customerPayable: number;
  advancerPayable: number;
  nccPayable: number;
  hasPendingAdvance: boolean;
  advances: PaymentAdvanceLine[];
  provider: string;
  providerTaxId: string;
  rescueStation: string;
  rescueStationPhone: string;
  rescueVehiclePlate: string;
  stationAddress: string;
  paymentDeadline: string;
  invoiceLink: string;
  invoiceNumber: string;
  contractNumber: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  beneficiaryBank: string;
  stationTaxId: string;
  note: string;
  evidencePhotos: {
    scene: string[];
    process: string[];
    result: string[];
  };
}

const PROVIDERS = [
  'Carpla Service Hà Nội',
  'Cứu hộ 116 Hà Nội',
  'Garage Thăng Long',
  'CARPLA - CARPLA SERVICE',
];

const STATIONS = [
  { name: 'Carpla Service Hà Đông', phone: '0787455456' },
  { name: 'Carpla Service - CN Hà Nội', phone: '0396121790' },
  { name: 'Trạm cứu hộ Long Biên', phone: '0912345678' },
  { name: 'Trạm cứu hộ Thanh Xuân', phone: '0987654321' },
];

const OWNERS = [
  { name: 'Nguyễn Văn Lộc', phone: '0979990141' },
  { name: 'Trần Thị Mai', phone: '0968123456' },
  { name: 'Lê Văn Hùng', phone: '0944555111' },
  { name: 'Phạm Văn Đức', phone: '0933445566' },
  { name: 'Hoàng Thị Lan', phone: '0922334455' },
];

const PLATES = ['30F42275', '30A12345', '29B88888', '51G11122', '30H55566', '38A58531'];

const RESCUE_CREWS = [
  { plate: '51H29447', brand: 'KIA', line: 'Sedona', driverName: 'Võ Thanh Sơn', driverPhone: '0967502639' },
  { plate: '30E77821', brand: 'MAZDA', line: 'TRANSIT', driverName: 'Nguyễn Văn Hùng', driverPhone: '0988777999' },
  { plate: '29C15602', brand: 'HYUNDAI', line: 'Solati', driverName: 'Trần Minh Tuấn', driverPhone: '0912345678' },
  { plate: '51G44018', brand: 'FORD', line: 'Transit', driverName: 'Lê Thị Mai', driverPhone: '0903123456' },
  { plate: '30A90211', brand: 'TOYOTA', line: 'Hiace', driverName: 'Phạm Quốc Bảo', driverPhone: '0978123001' },
  { plate: '43A22190', brand: 'THACO', line: 'Towner', driverName: 'Đỗ Văn Khoa', driverPhone: '0936554412' },
  { plate: '60C11834', brand: 'KIA', line: 'Carnival', driverName: 'Hoàng Thị Lan', driverPhone: '0966112233' },
  { plate: '15B67320', brand: 'MERCEDES', line: 'Sprinter', driverName: 'Bùi Anh Dũng', driverPhone: '0988221100' },
];

const CREATORS = ['rsa_test1', 'rsa_test2', 'nguyen.lan', 'tran.hung'];
const TRANSFER_AMOUNTS = [4_002_000, null, null, 2_884_000, 1_500_000, 6_750_000, null, 3_200_000];

const pad = (value: number) => String(value).padStart(2, '0');

const generateListItems = (): PaymentRequestListItem[] => {
  const items: PaymentRequestListItem[] = [];
  for (let i = 1; i <= 72; i++) {
    const owner = OWNERS[i % OWNERS.length];
    const station = STATIONS[i % STATIONS.length];
    const provider = PROVIDERS[i % PROVIDERS.length];
    const attachmentStatuses: AttachmentStatus[] = [
      'no_files',
      'has_invoice',
      'has_transfer',
      'complete',
    ];
    const attachmentStatus = attachmentStatuses[i % attachmentStatuses.length];
    const statuses: PaymentRequestStatus[] = [
      'pending_approval',
      'pending_approval',
      'awaiting_payment',
      'pending_approval',
      'paid',
      'rejected',
      'pending_approval',
      'approved',
    ];
    const status = statuses[i % statuses.length];
    const createdDay = 1 + (i % 23);
    const dueDay = Math.min(30, createdDay + 5);
    const createdAt = `${pad(createdDay)}/11/2026 ${pad(8 + (i % 10))}:${pad((i * 7) % 60)}:${pad((i * 13) % 60)}`;
    const paymentDueDate = `${pad(dueDay)}/11/2026`;
    const transferAmount = TRANSFER_AMOUNTS[i % TRANSFER_AMOUNTS.length];
    const isPackage = i % 4 === 0;
    const supplierCost = i === 1 ? 1_000_000 : 500000 + (i % 8) * 100000;
    const refundAmount = isPackage ? 0 : 300000;
    const advancedRefund = isPackage ? 0 : i === 5 ? 300000 : 200000;
    const advancedSupplier = i === 2 ? 0 : Math.min(400000, supplierCost);
    const customerPayable = Math.max(0, refundAmount - advancedRefund);
    const advancerPayable = advancedRefund + advancedSupplier;
    const nccPayable = Math.max(0, supplierCost - advancedSupplier);
    const refundReimburseBy: AdvancePayer | null = advancedRefund > 0 ? (i % 2 === 0 ? 'accountant' : 'customer') : null;
    const supplierReimburseBy: AdvancePayer | null = advancedSupplier > 0 ? (i % 3 === 0 ? 'supplier' : 'accountant') : null;

    items.push({
      id: String(i),
      orderId: `RS1260702${String(i).padStart(4, '0')}`,
      orderType: isPackage ? 'package' : 'single',
      supplierCost,
      refundAmount,
      advancedRefund,
      advancedSupplier,
      customerPayable,
      advancerPayable,
      nccPayable,
      refundReimburseBy,
      supplierReimburseBy,
      hasPendingAdvance: i === 2,
      attachmentStatus,
      status,
      rejectionReason: status === 'rejected' ? 'Thiếu hóa đơn hợp lệ' : undefined,
      rescueUnit: { name: provider, phone: '0988777999' },
      rescueStation: station,
      vehicle: { plate: PLATES[i % PLATES.length], owner: owner.name, phone: owner.phone },
      rescueCrew: RESCUE_CREWS[i % RESCUE_CREWS.length],
      amount: supplierCost,
      transferAmount,
      paymentDueDate,
      updatedAt: createdAt,
      updatedBy: CREATORS[i % CREATORS.length],
      createdAt,
      createdBy: CREATORS[i % CREATORS.length],
      providerType: i % 2 === 0 ? 'Đối tác' : 'Nội bộ',
      provider,
      phone: owner.phone,
    });
  }

  const prepareSamples: { status: PaymentRequestStatus; code: string }[] = [
    { status: 'not_created', code: 'RS12607029001' },
    { status: 'not_created', code: 'RS12607029002' },
    { status: 'draft', code: 'RS12607029003' },
    { status: 'draft', code: 'RS12607029004' },
  ];
  const prepared = prepareSamples.map((sample, index) => {
    const source = items[index];
    return {
      ...source,
      id: `prepare-${index + 1}`,
      orderId: sample.code,
      status: sample.status,
      rejectionReason: undefined,
      hasPendingAdvance: false,
      orderType: 'single' as const,
      createdAt: `25/11/2026 09:0${index}:00`,
      updatedAt: `25/11/2026 09:0${index}:00`,
    };
  });
  items.unshift(...prepared);

  return items;
};

export const MOCK_PAYMENT_REQUEST_LIST = generateListItems();

export const findPaymentRequest = (orderId: string) =>
  MOCK_PAYMENT_REQUEST_LIST.find((item) => item.orderId === orderId);

export const PAYMENT_REQUEST_STATUS_CONFIG: Record<
  PaymentRequestStatus,
  { label: string; className: string }
> = {
  not_created: { label: 'Chưa tạo', className: 'bg-white text-gray-500 border-gray-300' },
  draft: { label: 'Nháp', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending_approval: { label: 'Chờ phê duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã phê duyệt', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  awaiting_payment: { label: 'Chờ thanh toán', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Từ chối', className: 'bg-red-50 text-red-600 border-red-200' },
};

export const ATTACHMENT_STATUS_CONFIG: Record<
  AttachmentStatus,
  { label: string; className: string }
> = {
  no_files: { label: 'Chưa có file', className: 'bg-red-50 text-red-600 border-red-200' },
  complete: { label: 'Đã đủ file', className: 'bg-green-50 text-green-700 border-green-200' },
  has_invoice: { label: 'Đã có hóa đơn', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  has_transfer: {
    label: 'Đã có hình ảnh CK',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

export const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; className: string }> = {
  single: { label: 'ĐƠN LẺ', className: 'bg-amber-50 text-amber-700 border-amber-300' },
  package: { label: 'ĐƠN GÓI', className: 'bg-purple-50 text-purple-700 border-purple-300' },
};

const statusPatches = new Map<string, { status: PaymentRequestStatus; rejectionReason?: string }>();
let patchVersion = 0;
const patchListeners = new Set<() => void>();

export const subscribePaymentRequestPatches = (listener: () => void) => {
  patchListeners.add(listener);
  return () => patchListeners.delete(listener);
};

export const getPaymentRequestPatchVersion = () => patchVersion;

export const resolvePaymentRequest = (item: PaymentRequestListItem): PaymentRequestListItem => {
  const patch = statusPatches.get(item.id);
  if (!patch) return item;
  return {
    ...item,
    status: patch.status,
    rejectionReason: patch.status === 'rejected' ? patch.rejectionReason : item.rejectionReason,
  };
};

export const listPaymentRequests = () => MOCK_PAYMENT_REQUEST_LIST.map(resolvePaymentRequest);

export const applyPaymentRequestStatus = (
  ids: string[],
  status: PaymentRequestStatus,
  rejectionReason?: string,
) => {
  ids.forEach((id) => {
    statusPatches.set(id, { status, rejectionReason });
  });
  patchVersion += 1;
  patchListeners.forEach((listener) => listener());
};

export const getPaymentRequestDetail = (orderId: string): PaymentRequestDetail | undefined => {
  const listItem = MOCK_PAYMENT_REQUEST_LIST.find((item) => item.orderId === orderId);
  if (!listItem) return undefined;
  const resolved = resolvePaymentRequest(listItem);

  return {
    orderId: resolved.orderId,
    status: resolved.status,
    orderType: listItem.orderType,
    service: 'Sự cố kỹ thuật Khác khiến xe không di chuyển',
    quantity: 1,
    customer: listItem.vehicle.owner,
    customerPhone: listItem.vehicle.phone,
    plate: listItem.vehicle.plate,
    customerType: listItem.orderType === 'package' ? 'Doanh nghiệp' : 'Cá nhân',
    enterpriseCustomerName:
      listItem.orderType === 'package'
        ? 'CÔNG TY TNHH Ô TÔ VINFAST'
        : 'Công ty Cổ phần bảo hiểm Bưu điện - PTI',
    customerSource: 'API',
    packageCode: listItem.orderType === 'package' ? 'PKG-RSA-001' : '',
    rescueAddress: 'Xã Tam Hưng, Thành phố Hà Nội, Việt Nam',
    towingDestination:
      'VinFast, 948, Đường Quang Trung, Phường Yên Nghĩa, Thành phố Hà Nội, 10189, Việt Nam',
    rescueDistanceKm: 8 + (Number(listItem.id) % 5) * 2,
    orderCost: listItem.supplierCost,
    totalCustomerReceivable: listItem.supplierCost + (listItem.orderType === 'single' ? 50000 : 0),
    customerDeposit: listItem.orderType === 'single' ? 200000 : 0,
    refundAmount: listItem.refundAmount,
    advancedRefund: listItem.advancedRefund,
    advancedSupplier: listItem.advancedSupplier,
    customerPayable: listItem.customerPayable,
    advancerPayable: listItem.advancerPayable,
    nccPayable: listItem.nccPayable,
    hasPendingAdvance: listItem.hasPendingAdvance,
    advances: [
      ...(listItem.advancedRefund > 0
        ? [
            {
              id: `${listItem.orderId}-refund`,
              advancerName: 'Nguyễn Văn An',
              purpose: 'refund_customer' as const,
              reimburseBy: listItem.refundReimburseBy ?? 'accountant',
              reason: 'Khách thanh toán dư so với phí',
              requestedAmount: listItem.advancedRefund,
              actualAmount: listItem.advancedRefund,
              proofLabel: 'UNC_hoan_khach.jpg',
            },
          ]
        : []),
      ...(listItem.advancedSupplier > 0
        ? [
            {
              id: `${listItem.orderId}-supplier`,
              advancerName: 'Trần Thị Bình',
              purpose: 'pay_supplier' as const,
              reimburseBy: listItem.supplierReimburseBy ?? 'supplier',
              reason: 'Nhà cung cấp yêu cầu thu trước khi xuất hóa đơn',
              requestedAmount: listItem.advancedSupplier,
              actualAmount: listItem.advancedSupplier,
              proofLabel: 'UNC_tra_ncc.jpg',
            },
          ]
        : []),
    ],
    provider: listItem.rescueUnit.name,
    providerTaxId: '0110938494-004',
    rescueStation: listItem.rescueStation.name,
    rescueStationPhone: listItem.rescueStation.phone,
    rescueVehiclePlate: resolved.rescueCrew?.plate ?? '',
    paymentDeadline: resolved.paymentDueDate ?? '07/11/2026',
    stationAddress:
      'Mazda, Đường Quang Trung, Phường Yên Nghĩa, Hà Nội, 10189, Việt Nam',
    invoiceLink: '',
    invoiceNumber: '',
    contractNumber: '',
    beneficiaryAccount: '1025987848',
    beneficiaryName: 'CONG TY TNHH DICH VU O TO CARPLA - CHI NHANH HA NOI',
    beneficiaryBank: 'Tại Ngân hàng SHB - CN Thăng Long',
    stationTaxId: '0110938494-004',
    note: '',
    evidencePhotos: {
      scene: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop',
      ],
      process: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=150&fit=crop',
        'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=200&h=150&fit=crop',
      ],
      result: [],
    },
  };
};
