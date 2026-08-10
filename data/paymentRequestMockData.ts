export type PaymentRequestStatus = 'not_created' | 'created' | 'pending' | 'approved' | 'rejected';
export type AttachmentStatus = 'no_files' | 'complete' | 'has_invoice' | 'has_transfer';
export type OrderType = 'single' | 'package';

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
  depositRefundAdvanceAmount: number;
  depositRefundAdvancer: string;
  supplierAdvanceAmount: number;
  supplierAdvancer: string;
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
    const isCreated = i % 5 === 0;
    const isRejected = i % 11 === 0;

    items.push({
      id: String(i),
      orderId: `RS1260702${String(i).padStart(4, '0')}`,
      orderType: i % 4 === 0 ? 'package' : 'single',
      attachmentStatus,
      status: isRejected ? 'rejected' : isCreated ? 'created' : 'not_created',
      rejectionReason: isRejected ? 'Thiếu hóa đơn hợp lệ' : undefined,
      rescueUnit: { name: provider, phone: '0988777999' },
      rescueStation: station,
      vehicle: { plate: PLATES[i % PLATES.length], owner: owner.name, phone: owner.phone },
      amount: 500000 + (i % 8) * 100000,
      updatedAt: isCreated ? '02/07/2026 10:30' : undefined,
      updatedBy: isCreated ? 'rsa_test1' : undefined,
      createdAt: isCreated ? '01/07/2026 15:20' : undefined,
      createdBy: isCreated ? 'rsa_test1' : undefined,
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
  not_created: { label: 'Chưa tạo', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  created: { label: 'Đã tạo', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt', className: 'bg-green-50 text-green-700 border-green-200' },
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
    orderCost: listItem.amount,
    totalCustomerReceivable: listItem.amount + (listItem.orderType === 'single' ? 50000 : 0),
    customerDeposit: listItem.orderType === 'single' ? 200000 : 0,
    depositRefundAdvanceAmount: listItem.orderType === 'single' ? 200000 : 0,
    depositRefundAdvancer: listItem.orderType === 'single' ? 'Nguyễn Văn An — rsa_test1' : '',
    supplierAdvanceAmount: listItem.amount,
    supplierAdvancer: 'Trần Thị Bình — rsa_test2',
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
