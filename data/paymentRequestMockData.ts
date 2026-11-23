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
  hasPendingAdvance: boolean;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
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

const generateListItems = (): PaymentRequestListItem[] => {
  const items: PaymentRequestListItem[] = [];
  for (let i = 1; i <= 47; i++) {
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
      'draft',
      'pending_approval',
      'awaiting_payment',
      'paid',
      'rejected',
      'approved',
      'not_created',
    ];
    const status = statuses[i % statuses.length];
    const isPackage = i % 4 === 0;
    const supplierCost = i === 1 ? 1_000_000 : 500000 + (i % 8) * 100000;
    const refundAmount = isPackage ? 0 : 300000;
    const advancedRefund = isPackage ? 0 : i === 5 ? 300000 : 200000;
    const advancedSupplier = i === 2 ? 0 : Math.min(400000, supplierCost);
    const customerPayable = Math.max(0, refundAmount - advancedRefund);
    const advancerPayable = advancedRefund + advancedSupplier;
    const nccPayable = Math.max(0, supplierCost - advancedSupplier);

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
      hasPendingAdvance: i === 2,
      attachmentStatus,
      status,
      rejectionReason: status === 'rejected' ? 'Thiếu hóa đơn hợp lệ' : undefined,
      rescueUnit: { name: provider, phone: '0988777999' },
      rescueStation: station,
      vehicle: { plate: PLATES[i % PLATES.length], owner: owner.name, phone: owner.phone },
      amount: supplierCost,
      updatedAt: status === 'draft' || status === 'not_created' ? undefined : '02/07/2026 10:30',
      updatedBy: status === 'draft' || status === 'not_created' ? undefined : 'rsa_test1',
      createdAt: status === 'draft' || status === 'not_created' ? undefined : '01/07/2026 15:20',
      createdBy: status === 'draft' || status === 'not_created' ? undefined : 'rsa_test1',
      providerType: i % 2 === 0 ? 'Đối tác' : 'Nội bộ',
      provider,
      phone: owner.phone,
    });
  }
  return items;
};

export const MOCK_PAYMENT_REQUEST_LIST = generateListItems();

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

export const getPaymentRequestDetail = (orderId: string): PaymentRequestDetail | undefined => {
  const listItem = MOCK_PAYMENT_REQUEST_LIST.find((item) => item.orderId === orderId);
  if (!listItem) return undefined;

  return {
    orderId: listItem.orderId,
    status: listItem.status,
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
    rescueVehiclePlate: '',
    stationAddress:
      'Mazda, Đường Quang Trung, Phường Yên Nghĩa, Hà Nội, 10189, Việt Nam',
    paymentDeadline: '07/07/2026',
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
