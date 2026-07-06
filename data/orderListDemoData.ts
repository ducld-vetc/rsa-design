import { STATUS_OPTIONS } from '../shared/StatusUpdateModal';

export type OrderPaymentStatus = 'PENDING' | 'DEPOSITED' | 'PAID';

export type StatusBadgeStyle =
  | 'outline-blue'
  | 'outline-orange'
  | 'outline-green'
  | 'solid-red'
  | 'solid-green'
  | 'solid-blue'
  | 'solid-orange';

export type OrderStatusDisplay = {
  primary: string;
  primaryStyle: StatusBadgeStyle;
  secondary?: string;
  secondaryStyle?: StatusBadgeStyle;
};

export type DemoOrderRow = {
  id: string;
  orderId: string;
  portalStatusId: string;
  tags: string[];
  dispatchType: string;
  mainService: string;
  waitingTime: string;
  orderStatus: OrderStatusDisplay;
  paymentStatus: OrderPaymentStatus;
  supporter: { role: string; name: string; roleClass: string };
  invoiceCode: string;
  customer: { name: string; phone: string };
  vehicle: { plate: string; model: string };
  address: string;
  partner: string;
  driver: { name: string; phone: string };
  updatedAt: string;
  updatedBy: string;
  packageUsage?: { packageName: string; used: number; limit: number };
  hasOrderWarning?: boolean;
  isFlooded?: boolean;
};

export type OrderDetailsNavState = {
  orderId: string;
  portalStatusId: string;
  customerName: string;
  customerPhone: string;
  plate: string;
  address: string;
  mainService: string;
};

const DEMO_CUSTOMERS = [
  { name: 'NGUYỄN VĂN A', phone: '0909888777' },
  { name: 'TRẦN THỊ B', phone: '0967419411' },
  { name: 'LÊ VĂN C', phone: '0903456789' },
  { name: 'PHẠM VĂN D', phone: '0944556677' },
  { name: 'HOÀNG THỊ E', phone: '0922334455' },
  { name: 'VŨ ĐỨC F', phone: '0933445566' },
  { name: 'ĐỖ MINH G', phone: '0977888999' },
  { name: 'BÙI THỊ H', phone: '0912345678' },
  { name: 'CAO VĂN I', phone: '0987654321' },
  { name: 'DƯƠNG THỊ K', phone: '0901122334' },
  { name: 'HÀ VĂN L', phone: '0933221144' },
  { name: 'LÝ THỊ M', phone: '0944332255' },
  { name: 'MAI VĂN N', phone: '0955443366' },
];

const DEMO_VEHICLES = [
  { plate: '30A-123.45', model: 'Toyota Vios' },
  { plate: '29B-888.88', model: 'Honda City' },
  { plate: '30H-555.66', model: 'Mazda CX-5' },
  { plate: '51G-111.22', model: 'Hyundai Accent' },
  { plate: '30G-777.88', model: 'Kia Seltos' },
  { plate: '29C-333.44', model: 'Ford Ranger' },
  { plate: '30F-222.11', model: 'VinFast VF8' },
  { plate: '29D-444.55', model: 'Mitsubishi Xpander' },
  { plate: '30K-666.77', model: 'Mercedes C200' },
  { plate: '51H-888.99', model: 'BMW 320i' },
  { plate: '30L-101.20', model: 'Honda CR-V' },
  { plate: '29E-303.40', model: 'Toyota Camry' },
  { plate: '30M-505.60', model: 'Kia Carnival' },
];

const DEMO_ADDRESSES = [
  '210 Phố Xã Đàn, Đống Đa, Hà Nội',
  'Cầu Chương Dương, Long Biên, Hà Nội',
  'Hầm Kim Liên, Hai Bà Trưng, Hà Nội',
  'Đường vành đai 3, Thanh Xuân, Hà Nội',
  'Trần Duy Hưng, Cầu Giấy, Hà Nội',
  'Nguyễn Trãi, Thanh Xuân, Hà Nội',
  '192 Phố Hào Nam, Ô Chợ Dừa, Đống Đa, Hà Nội',
  'Láng Hạ, Ba Đình, Hà Nội',
  'Giảng Võ, Ba Đình, Hà Nội',
  'Phạm Hùng, Nam Từ Liêm, Hà Nội',
  'Mỹ Đình, Nam Từ Liêm, Hà Nội',
  'Võ Chí Công, Tây Hồ, Hà Nội',
  'Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
];

const DEMO_SERVICES = [
  'Cung cấp nhiên liệu khẩn cấp',
  'Thay lốp dự phòng',
  'Kích bình ắc quy',
  'Cứu hộ kéo xe',
  'Sửa chữa tại chỗ',
  'Mở khóa xe',
  'Nạp ắc quy',
  'Cứu hộ xe ngập nước',
  'Thay lốp trên cao tốc',
  'Hỗ trợ ắc quy yếu',
  'Kéo xe về xưởng',
  'Cấp cứu hộp số',
  'Kiểm tra điện xe',
];

const PAYMENT_BY_INDEX: OrderPaymentStatus[] = [
  'PENDING',
  'DEPOSITED',
  'PAID',
  'PENDING',
  'DEPOSITED',
  'PAID',
  'PENDING',
  'DEPOSITED',
  'PAID',
  'PENDING',
  'DEPOSITED',
  'PAID',
  'PAID',
];

function statusToDisplay(id: string, label: string): OrderStatusDisplay {
  switch (id) {
    case 'FINISH-COMPLETED':
      return {
        primary: 'Hoàn thành',
        primaryStyle: 'outline-green',
        secondary: label,
        secondaryStyle: 'solid-green',
      };
    case 'FINISH-CANCELLED':
      return {
        primary: 'Hủy',
        primaryStyle: 'outline-blue',
        secondary: label,
        secondaryStyle: 'solid-red',
      };
    case 'WAITING_PROVIDER_ACCEPT':
    case 'WAITING_DRIVER_ACCEPT':
    case 'DISPATCH-SEARCHING':
    case 'DISPATCH-ASSIGNED':
      return {
        primary: 'Điều phối',
        primaryStyle: 'outline-blue',
        secondary: label,
        secondaryStyle: 'solid-orange',
      };
    case 'EXECUTE-MOVING':
    case 'EXECUTE-ARRIVED':
    case 'EXECUTE-RESCUING':
      return { primary: label, primaryStyle: 'outline-orange' };
    default:
      return { primary: label, primaryStyle: 'outline-blue' };
  }
}

function buildDemoOrder(
  portalStatusId: string,
  label: string,
  index: number
): DemoOrderRow {
  const customer = DEMO_CUSTOMERS[index % DEMO_CUSTOMERS.length];
  const vehicle = DEMO_VEHICLES[index % DEMO_VEHICLES.length];
  const address = DEMO_ADDRESSES[index % DEMO_ADDRESSES.length];
  const mainService = DEMO_SERVICES[index % DEMO_SERVICES.length];
  const orderNum = String(index + 1).padStart(2, '0');
  const isPackage = index % 4 === 0;
  const isClosed =
    portalStatusId === 'FINISH-COMPLETED' || portalStatusId === 'FINISH-CANCELLED';
  const hasDriver = !isClosed && !portalStatusId.startsWith('RECEIVE') && portalStatusId !== 'WAITING_CONFIRM';

  return {
    id: `demo-${portalStatusId}`,
    orderId: `RS1260203${orderNum}`,
    portalStatusId,
    tags: [isPackage ? 'Đơn gói' : 'Đơn lẻ', 'DEMO'],
    dispatchType: index % 2 === 0 ? 'Điều phối: Thủ công' : 'Điều phối: Tự động',
    mainService,
    waitingTime: `${Math.floor(index / 3)} giờ ${(index * 7) % 60} phút`,
    orderStatus: statusToDisplay(portalStatusId, label),
    paymentStatus: PAYMENT_BY_INDEX[index % PAYMENT_BY_INDEX.length],
    supporter: {
      role: index % 2 === 0 ? 'SUPPORT' : 'OPERATOR',
      name: index % 2 === 0 ? 'rsa_test1' : 'hieund2',
      roleClass:
        index % 2 === 0
          ? 'bg-purple-50 text-purple-600 border-purple-100'
          : 'bg-green-50 text-green-600 border-green-100',
    },
    invoiceCode: isClosed && portalStatusId === 'FINISH-COMPLETED' ? `INV-20260203-${orderNum}` : '-',
    customer,
    vehicle,
    address,
    partner: isClosed && portalStatusId === 'FINISH-CANCELLED' ? '-' : 'CARPLA - CARPLA SERVICE',
    driver: hasDriver
      ? { name: 'Nguyễn Văn Tài', phone: '0911222333' }
      : { name: '-', phone: '-' },
    updatedAt: `03/02/2026 ${String(8 + index).padStart(2, '0')}:${String((index * 5) % 60).padStart(2, '0')}`,
    updatedBy: index % 2 === 0 ? 'rsa_test1' : 'hieund2',
    packageUsage: isPackage
      ? { packageName: 'Gói cơ bản 10 dịch vụ', used: index + 1, limit: 100 }
      : undefined,
    hasOrderWarning: index === 1 || index === 6,
    isFlooded: index === 2 || index === 7,
  };
}

/** Mỗi dòng = 1 trạng thái portal để demo nhanh Webview & chi tiết đơn */
export const DEMO_ORDERS: DemoOrderRow[] = STATUS_OPTIONS.flatMap((group) => group.items).map(
  (item, index) => buildDemoOrder(item.id, item.label, index)
);

export function orderRowToNavState(order: DemoOrderRow): OrderDetailsNavState {
  return {
    orderId: order.orderId,
    portalStatusId: order.portalStatusId,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    plate: order.vehicle.plate,
    address: order.address,
    mainService: order.mainService,
  };
}
