export type PurchaseRole = 'buyer' | 'owner' | 'buyer_owner';

export interface CustomerPurchase {
  purchaseCode: string;
  status: string;
  packageName: string;
  finalPrice: number;
  activatedAt: string | null;
  expiredAt: string | null;
  plate: string | null;
  role: PurchaseRole;
  voucherCode: string | null;
}

export interface CustomerRescue {
  rescueOrderCode: string;
  status: string;
  plate: string | null;
  services: string | null;
  amount: number | null;
  createdAt: string;
  osa: string | null;
}

export interface CustomerRecord {
  customerId: number;
  ecomCustomerId: string | null;
  name: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  customerTiering: string | null;
  createdAt: string;
  purchaseCount: number;
  rescueCount: number;
  purchases: CustomerPurchase[];
  rescues: CustomerRescue[];
}

export const PURCHASE_STATUS_LABEL: Record<string, string> = {
  '0': 'Nháp',
  '1': 'Hoạt động',
  '2': 'Chưa kích hoạt',
  '3': 'Tạm dừng',
  '4': 'Hết hạn',
  '5': 'Đã kết thúc',
  '6': 'Đã hủy',
};

export const RESCUE_STATUS_LABEL: Record<string, string> = {
  INITIAL: 'Khởi tạo',
  ASSIGNING: 'Đang điều phối',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const PURCHASE_ROLE_LABEL: Record<PurchaseRole, string> = {
  buyer: 'Người mua',
  owner: 'Người sở hữu',
  buyer_owner: 'Người mua, Người sở hữu',
};

const extraCustomer = (
  customerId: number,
  name: string,
  phone: string,
  createdAt: string,
  purchaseCount: number,
  rescueCount: number,
  address: string | null = null,
  ecomCustomerId: string | null = null,
): CustomerRecord => ({
  customerId,
  ecomCustomerId,
  name,
  phone,
  email: null,
  address,
  customerTiering: null,
  createdAt,
  purchaseCount,
  rescueCount,
  purchases: [],
  rescues: [],
});

/** Khách bổ sung từ dev-rsa.customer, chưa nạp lịch sử chi tiết. */
const EXTRA_CUSTOMERS: CustomerRecord[] = [
  extraCustomer(40769, 'nguyễn ngọc hòa', '0903317680', '30/09/2026 15:47', 1, 0),
  extraCustomer(40768, 'Tung', '0975615870', '30/09/2026 14:29', 0, 129),
  extraCustomer(40767, 'PHÙNG VĂN THÁI', '0828631618', '30/09/2026 09:20', 3, 0),
  extraCustomer(40766, 'TEST DVKH BAO LANH', '0900000001', '29/09/2026 17:35', 0, 3),
  extraCustomer(40765, 'thảo', '0923520625', '29/09/2026 15:00', 0, 3),
  extraCustomer(40764, 'Nguyen Van Dat', '0979845676', '29/09/2026 14:49', 3, 0, null, 'daste'),
  extraCustomer(40763, 'Người gặp sự cố', '0342392042', '29/09/2026 13:24', 0, 4),
  extraCustomer(40762, 'hientt', '0329389018', '29/09/2026 11:26', 2, 0),
  extraCustomer(40744, 'NEW CUSTOMER', '0980951979', '28/09/2026 16:20', 1, 0),
  extraCustomer(40743, 'HOANG VAN DAO', '0904247921', '28/09/2026 09:10', 2, 0),
  extraCustomer(40742, 'HOANG VAN DAO', '0904247920', '28/09/2026 09:10', 2, 0, 'Phường Cầu Giấy - Hà Nội'),
  extraCustomer(40741, 'ĐOÀN  HUỲNH MAI', '0931777066', '26/09/2026 13:42', 2, 0),
  extraCustomer(40740, 'NGUYỄN THỊ MỸ LỆ', '0911234567', '25/09/2026 15:55', 1, 0),
  extraCustomer(40739, 'Ngô Xuân Hòa', '0978072777', '25/09/2026 15:51', 1, 0),
  extraCustomer(40738, 'trần thị a', '0976876852', '25/09/2026 15:47', 1, 0),
  extraCustomer(40737, 'Vu Gap Su Co', '03423920452', '25/09/2026 15:35', 0, 1),
  extraCustomer(40736, 'Vũ hải A2', '0342392049', '25/09/2026 15:26', 0, 1),
  extraCustomer(40735, 'ĐỖ THỊ M', '0945121952', '25/09/2026 14:36', 0, 1),
  extraCustomer(40734, 'Quang Vinh WB', '0978667674', '25/09/2026 14:18', 1, 0),
  extraCustomer(40733, 'HỒ KHẮC TIÊN', '0903548968', '25/09/2026 10:01', 2, 0),
  extraCustomer(40732, 'Trịnh Thị Hợp', '0979971536', '25/09/2026 09:34', 1, 0),
  extraCustomer(40731, 'TÔ LÂM', '0914992491', '25/09/2026 09:26', 2, 0),
  extraCustomer(40730, 'Hoàng Thị Thúy Ngân', '0989273573', '24/09/2026 16:30', 1, 0),
  extraCustomer(40729, 'Bùi Thị Thanh Dung', '0987722238', '24/09/2026 15:10', 1, 0),
  extraCustomer(40728, 'BÙI ĐỨC BAN', '0867189657', '24/09/2026 14:22', 1, 0),
  extraCustomer(40727, 'NGUYỄN THỊ HIẾU', '0986888006', '24/09/2026 10:49', 1, 0),
  extraCustomer(40725, 'Nguyễn Văn Anh', '0923456789', '24/09/2026 10:40', 1, 0),
  extraCustomer(40724, 'Đỗ Minh Ngọc', '0343560101', '24/09/2026 09:18', 3, 0),
  extraCustomer(40723, 'Giang Linh test định danh 059', '0775220059', '23/09/2026 17:23', 1, 0),
  extraCustomer(40722, 'Lã Thảo', '0399796192', '23/09/2026 11:05', 1, 2),
  extraCustomer(40721, 'Tran Thi Test', '0922222222', '23/09/2026 11:04', 0, 1),
  extraCustomer(40720, 'Lã Thảo', '0919729813', '23/09/2026 09:55', 0, 0),
  extraCustomer(40719, 'HO THI CAM LY', '0908099002', '22/09/2026 14:27', 1, 0),
  extraCustomer(40716, 'Lã Thảo', '0344410197', '21/09/2026 09:31', 6, 0),
  extraCustomer(40715, 'Nguyen Van Abc@', '0912345671', '21/09/2026 09:24', 4, 0),
];

/** Mẫu đối chiếu từ dev-rsa: customer, package_purchase, rescue_order_v2. Lịch sử chi tiết lấy 3 dòng gần nhất cho nhóm khách đầu. */
export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    customerId: 55,
    ecomCustomerId: 'OWNER-001',
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: null,
    address: 'To 7, Ba Xuyên, TP Thái Bình',
    customerTiering: null,
    createdAt: '22/08/2025 15:43',
    purchaseCount: 246,
    rescueCount: 44,
    purchases: [
      { purchaseCode: 'RS32610050004', status: '1', packageName: 'Cứu hộ RSA Nâng cao', finalPrice: 299000, activatedAt: '08/10/2026', expiredAt: '08/10/2027', plate: '30A12345', role: 'buyer_owner', voucherCode: '30430973bd7d4ba4a2f8697fc2ae8750' },
      { purchaseCode: 'RS32610050003', status: '2', packageName: 'Cứu hộ RSA Nâng cao', finalPrice: 299000, activatedAt: null, expiredAt: null, plate: '30A12345', role: 'buyer_owner', voucherCode: '30430973bd7d4ba4a2f8697fc2ae8750' },
      { purchaseCode: 'RS32610050002', status: '2', packageName: 'Cứu hộ RSA Nâng cao', finalPrice: 299000, activatedAt: null, expiredAt: null, plate: '30A12345', role: 'buyer_owner', voucherCode: '30430973bd7d4ba4a2f8697fc2ae8750' },
    ],
    rescues: [
      { rescueOrderCode: 'RS12610050014', status: 'INITIAL', plate: '99B12390', services: 'Sự cố kỹ thuật khác khiến xe không di chuyển, Xe hết pin', amount: 0, createdAt: '05/10/2026 11:04', osa: null },
      { rescueOrderCode: 'RS12610050013', status: 'INITIAL', plate: '99B12390', services: 'Sự cố kỹ thuật khác khiến xe không di chuyển, Xe hết pin', amount: 0, createdAt: '05/10/2026 11:04', osa: null },
      { rescueOrderCode: 'rsa2610050012', status: 'CANCELLED', plate: '71T123456', services: 'Dịch vụ 11, Đâm, lật, tai nạn', amount: 0, createdAt: '05/10/2026 10:58', osa: null },
    ],
  },
  {
    customerId: 56,
    ecomCustomerId: null,
    name: 'Nguyen Van A',
    phone: '0336688980',
    email: null,
    address: 'P.Bạch Đằng - Hạ Long - Quảng Ninh',
    customerTiering: null,
    createdAt: '22/08/2025 15:55',
    purchaseCount: 495,
    rescueCount: 39,
    purchases: [
      { purchaseCode: 'RRC2609250007', status: '1', packageName: 'Bảo hiểm RoadCate', finalPrice: 5000, activatedAt: '14/09/2026', expiredAt: '14/10/2026', plate: '11A08730', role: 'owner', voucherCode: null },
      { purchaseCode: 'RS62609240006', status: '4', packageName: 'RSA_CHAOMUNG', finalPrice: 299000, activatedAt: '02/11/2024', expiredAt: '02/11/2025', plate: '80K1235', role: 'owner', voucherCode: null },
      { purchaseCode: 'RS52609180006', status: '1', packageName: 'Dịch vụ cứu hộ', finalPrice: 200000, activatedAt: '18/09/2026', expiredAt: '18/09/2027', plate: '99D47575', role: 'owner', voucherCode: null },
    ],
    rescues: [
      { rescueOrderCode: 'rsaHNO2609280003', status: 'COMPLETED', plate: '30A12345', services: 'Dịch vụ 11, Kích bình ắc quy', amount: 1080000, createdAt: '28/09/2026 10:12', osa: 'Nguyễn Văn ABC' },
      { rescueOrderCode: 'RS1HNO2609280002', status: 'INITIAL', plate: '30A12345', services: 'Kích bình ắc quy', amount: 0, createdAt: '28/09/2026 10:10', osa: null },
      { rescueOrderCode: 'RS1HNO2608100028', status: 'COMPLETED', plate: '11A11001', services: 'Kích bình ắc quy, Thay lốp dự phòng, Cung cấp nhiên liệu khẩn cấp, Thủy kích, Đổ nhầm nhiên liệu', amount: 0, createdAt: '10/08/2026 16:17', osa: 'Nguyễn Văn ABC' },
    ],
  },
  {
    customerId: 76,
    ecomCustomerId: null,
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: null,
    address: null,
    customerTiering: null,
    createdAt: '18/09/2025 11:02',
    purchaseCount: 348,
    rescueCount: 2,
    purchases: [
      { purchaseCode: 'RSH12609150001', status: '1', packageName: 'Cứu hộ toàn quốc 24/7 nâng cao (2 năm)', finalPrice: 589000, activatedAt: '01/09/2026', expiredAt: '01/09/2027', plate: '30A99999', role: 'buyer_owner', voucherCode: null },
      { purchaseCode: 'RS62609140051', status: '1', packageName: 'Cứu hộ 589K', finalPrice: 589000, activatedAt: '01/09/2500', expiredAt: '01/09/2502', plate: '30A99999', role: 'buyer_owner', voucherCode: null },
      { purchaseCode: 'RS62609140050', status: '1', packageName: 'Cứu hộ 589K', finalPrice: 589000, activatedAt: '01/09/2500', expiredAt: '01/09/2502', plate: '30A99999', role: 'buyer_owner', voucherCode: null },
    ],
    rescues: [
      { rescueOrderCode: 'RS1HNO2609110011', status: 'CONFIRMED', plate: '99A9702', services: 'Xe hết pin, Sự cố kỹ thuật khác khiến xe không di chuyển, Đổ nhầm nhiên liệu', amount: 0, createdAt: '11/09/2026 15:32', osa: 'Nguyễn Văn ABC' },
      { rescueOrderCode: 'RS1HNO2609100003', status: 'CONFIRMED', plate: '99A97026', services: 'Kích bình ắc quy, Cung cấp nhiên liệu khẩn cấp, Đổ nhầm nhiên liệu, Xe hết pin, Đâm, lật, tai nạn', amount: 0, createdAt: '10/09/2026 16:09', osa: 'Nguyễn Văn ABC' },
    ],
  },
  {
    customerId: 23974,
    ecomCustomerId: null,
    name: 'Nguyễn Văn A',
    phone: '0964879671',
    email: null,
    address: null,
    customerTiering: null,
    createdAt: '24/02/2026 14:58',
    purchaseCount: 228,
    rescueCount: 1,
    purchases: [
      { purchaseCode: 'RS62608210050', status: '1', packageName: 'Cứu hộ 299K', finalPrice: 299000, activatedAt: '24/08/2027', expiredAt: '24/08/2028', plate: '12A2345', role: 'buyer_owner', voucherCode: null },
      { purchaseCode: 'RS32608210047', status: '1', packageName: 'Cứu hộ RSA Nâng cao', finalPrice: 299000, activatedAt: '24/08/2026', expiredAt: '24/08/2027', plate: '12A2345', role: 'buyer_owner', voucherCode: null },
      { purchaseCode: 'RS22608210034', status: '1', packageName: 'Cứu hộ RSA Cơ bản', finalPrice: 200000, activatedAt: '24/08/2026', expiredAt: '24/08/2027', plate: '50A23232', role: 'buyer_owner', voucherCode: null },
    ],
    rescues: [
      { rescueOrderCode: 'RS12608050024', status: 'CONFIRMED', plate: '17G18097', services: 'Xe hết pin, Kích bình ắc quy', amount: 0, createdAt: '05/08/2026 16:55', osa: 'Lee Chi Hun' },
    ],
  },
  {
    customerId: 24507,
    ecomCustomerId: null,
    name: 'Phùng Thị Mai',
    phone: '0338358418',
    email: null,
    address: null,
    customerTiering: null,
    createdAt: '21/04/2026 11:03',
    purchaseCount: 221,
    rescueCount: 19,
    purchases: [
      { purchaseCode: 'RS22606090038', status: '1', packageName: 'Cứu hộ RSA Cơ bản', finalPrice: 200000, activatedAt: '12/06/2026', expiredAt: '12/06/2027', plate: '29A57757', role: 'owner', voucherCode: null },
      { purchaseCode: 'RS22606040008', status: '1', packageName: 'Cứu hộ RSA Cơ bản', finalPrice: 200000, activatedAt: '07/06/2026', expiredAt: '07/06/2027', plate: '30A00223', role: 'owner', voucherCode: null },
      { purchaseCode: 'RS32606040007', status: '1', packageName: 'Cứu hộ RSA Cơ bản', finalPrice: 299000, activatedAt: '07/06/2026', expiredAt: '07/06/2027', plate: '36A88800', role: 'buyer_owner', voucherCode: null },
    ],
    rescues: [
      { rescueOrderCode: 'RS12609250017', status: 'ASSIGNING', plate: '36A0027', services: 'Kích bình ắc quy, Thay lốp dự phòng, Xe hết pin, Đâm, lật, tai nạn, Thủy kích', amount: 0, createdAt: '25/09/2026 18:20', osa: 'Nguyễn Văn ABC' },
      { rescueOrderCode: 'RS1HNO2609250013', status: 'COMPLETED', plate: '30A11122', services: 'Kích bình ắc quy, Xe hết pin', amount: 0, createdAt: '25/09/2026 17:20', osa: 'Nguyễn Văn ABC' },
      { rescueOrderCode: 'RS1HNO2609250011', status: 'COMPLETED', plate: '30A11122', services: 'Cung cấp nhiên liệu khẩn cấp, Thay lốp dự phòng', amount: 0, createdAt: '25/09/2026 16:27', osa: 'Nguyễn Văn ABC' },
    ],
  },
  {
    customerId: 90001,
    ecomCustomerId: null,
    name: 'Trần Thu Hà',
    phone: '0988123456',
    email: 'thuha@example.com',
    address: 'Số 8 phố Huế, Hà Nội',
    customerTiering: null,
    createdAt: '05/10/2026 09:00',
    purchaseCount: 0,
    rescueCount: 0,
    purchases: [],
    rescues: [],
  },
  ...EXTRA_CUSTOMERS,
];
