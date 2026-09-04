export type ServiceCategory = 'RESCUE_SERVICE' | 'REPAIR_SERVICE' | 'TOW_SERVICE' | 'RESCUE_TERM';
export type ServiceUnit = 'KM' | 'LITERS' | 'TIMES';
export type RescueServiceType = 'ONSITE' | 'TOWING' | 'CRANE';
export type ServiceScope = 'CATALOG' | 'INCIDENTAL';
export type PartnerStatus = 'active' | 'inactive';

export interface CorporateCustomerOption {
  id: number;
  code: string;
  name: string;
}

/** DN gắn dịch vụ phát sinh — một dịch vụ nhiều DN, không có role */
export interface ServiceCorporateLink {
  corporateCustomerId: number;
  corporateCustomerCode: string;
  corporateCustomerName: string;
}

export interface RescueServiceRecord {
  id: number;
  serviceCode: string;
  name: string;
  description: string;
  category: ServiceCategory | '';
  serviceType: RescueServiceType | '';
  unit: ServiceUnit;
  baseDurationMinutes: number | null;
  specialEquipment: string;
  supportVehicleTypes: string[];
  prefixServiceCode: string;
  status: PartnerStatus;
  /** Rỗng = catalog chung. ≥ 1 DN = dịch vụ phát sinh gắn doanh nghiệp */
  corporateCustomers: ServiceCorporateLink[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  RESCUE_SERVICE: 'Dịch vụ cứu hộ',
  REPAIR_SERVICE: 'Dịch vụ sửa chữa',
  TOW_SERVICE: 'Dịch vụ cẩu kéo',
  RESCUE_TERM: 'Điều khoản gói',
};

export const SERVICE_CATEGORY_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: 'RESCUE_SERVICE', label: SERVICE_CATEGORY_LABEL.RESCUE_SERVICE },
  { value: 'REPAIR_SERVICE', label: SERVICE_CATEGORY_LABEL.REPAIR_SERVICE },
  { value: 'TOW_SERVICE', label: SERVICE_CATEGORY_LABEL.TOW_SERVICE },
  { value: 'RESCUE_TERM', label: SERVICE_CATEGORY_LABEL.RESCUE_TERM },
];

export const SERVICE_UNIT_LABEL: Record<ServiceUnit, string> = {
  KM: 'Kilomet',
  LITERS: 'Lít',
  TIMES: 'Lần',
};

export const SERVICE_UNIT_OPTIONS: { value: ServiceUnit; label: string }[] = [
  { value: 'KM', label: 'KM — Kilomet' },
  { value: 'LITERS', label: 'LITERS — Lít' },
  { value: 'TIMES', label: 'TIMES — Lần' },
];

export const RESCUE_SERVICE_TYPE_LABEL: Record<RescueServiceType, string> = {
  ONSITE: 'Tại chỗ',
  TOWING: 'Kéo xe',
  CRANE: 'Cẩu',
};

export const RESCUE_SERVICE_TYPE_OPTIONS: { value: RescueServiceType; label: string }[] = [
  { value: 'ONSITE', label: 'ONSITE — Tại chỗ' },
  { value: 'TOWING', label: 'TOWING — Kéo xe' },
  { value: 'CRANE', label: 'CRANE — Cẩu' },
];

export const SERVICE_SCOPE_LABEL: Record<ServiceScope, string> = {
  CATALOG: 'Catalog chung',
  INCIDENTAL: 'Phát sinh theo DN',
};

export const SERVICE_SCOPE_OPTIONS: { value: ServiceScope; label: string }[] = [
  { value: 'CATALOG', label: 'Catalog chung' },
  { value: 'INCIDENTAL', label: 'Phát sinh theo DN' },
];

export const SUPPORT_VEHICLE_TYPE_OPTIONS = [
  { value: 'TOW_TRUCK', label: 'Xe kéo (TOW_TRUCK)' },
  { value: 'CRANE_TRUCK', label: 'Xe cẩu (CRANE_TRUCK)' },
  { value: 'CAR_CARRIER_TRUCK', label: 'Xe chở xe (CAR_CARRIER_TRUCK)' },
  { value: 'HEAVY_WRECKER', label: 'Xe trục vớt / nâng hạ nặng' },
  { value: 'OTO_7_CHO', label: 'Ô tô ≤ 7 chỗ' },
  { value: 'OTO_16_CHO', label: 'Ô tô ≤ 16 chỗ' },
  { value: 'XE_MOTO', label: 'Xe máy' },
];

export const MOCK_CORPORATE_CUSTOMERS: CorporateCustomerOption[] = [
  { id: 16, code: 'DIG', name: 'CÔNG TY TNHH VETC DIGITAL' },
  { id: 99, code: 'CHUBB', name: 'CHUBB BẢO HIỂM' },
  { id: 15, code: 'TIC', name: 'CÔNG TY TNHH BẢO HIỂM TASCO' },
  { id: 1, code: 'VOLVO', name: 'CÔNG TY TNHH SWEDEN AUTO' },
  { id: 2, code: 'PLX', name: 'PLX' },
  { id: 18, code: 'TPB', name: 'NGÂN HÀNG TMCP TIÊN PHONG' },
  { id: 19, code: 'MSB', name: 'NGÂN HÀNG TMCP HÀNG HẢI VIỆT NAM' },
  { id: 20, code: 'GEELY_TASCO', name: 'CÔNG TY TNHH PHÂN PHỐI Ô TÔ TASCO' },
  { id: 3, code: 'TANHUNG', name: 'CÔNG TY TNHH VẬN TẢI VÀ THƯƠNG MẠI TẤN HƯNG' },
];

export const getCorporateCustomerById = (id: number | null | ''): CorporateCustomerOption | undefined => {
  if (id === null || id === '') return undefined;
  return MOCK_CORPORATE_CUSTOMERS.find((c) => c.id === Number(id));
};

export const snapshotCorporateLink = (corporateCustomerId: number): ServiceCorporateLink => {
  const corp = getCorporateCustomerById(corporateCustomerId);
  return {
    corporateCustomerId,
    corporateCustomerCode: corp?.code ?? '',
    corporateCustomerName: corp?.name ?? '',
  };
};

const catalog = (row: Omit<RescueServiceRecord, 'corporateCustomers'>): RescueServiceRecord => ({
  ...row,
  corporateCustomers: [],
});

export const MOCK_RESCUE_SERVICES: RescueServiceRecord[] = [
  catalog({
    id: 1,
    serviceCode: 'CAU_KEO',
    name: 'Đổ nhầm nhiên liệu',
    description: 'Hỗ trợ kéo xe do đổ nhầm nhiên liệu',
    category: 'RESCUE_SERVICE',
    serviceType: 'TOWING',
    unit: 'KM',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['OTO_7_CHO', 'OTO_16_CHO', 'XE_MOTO'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '10/08/2025 15:03:26',
    createdBy: 'system',
    updatedAt: '21/08/2025 15:38:33',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 2,
    serviceCode: 'KICH_BINH',
    name: 'Kích bình ắc quy',
    description: 'Kích bình ắc quy',
    category: 'REPAIR_SERVICE',
    serviceType: 'ONSITE',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['CRANE_TRUCK', 'TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '10/08/2025 15:03:26',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 3,
    serviceCode: 'NHIEN_LIEU',
    name: 'Cung cấp nhiên liệu khẩn cấp (xăng, dầu, nước làm mát)',
    description: 'Cung cấp nhiên liệu khẩn cấp (xăng, dầu, nước làm mát,...)',
    category: 'REPAIR_SERVICE',
    serviceType: 'ONSITE',
    unit: 'LITERS',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: [],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '10/08/2025 22:08:21',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 4,
    serviceCode: 'DAM_LAT',
    name: 'Đâm, lật, tai nạn',
    description: 'Đâm, lật, tai nạn (chỉ hỗ trợ cẩu kéo khi có xác nhận xử lý từ cơ quan có thẩm quyền)',
    category: 'TOW_SERVICE',
    serviceType: 'CRANE',
    unit: 'KM',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['CRANE_TRUCK', 'TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '20/08/2025 17:19:12',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 5,
    serviceCode: 'THAY_LOP',
    name: 'Thay lốp dự phòng',
    description: 'Thay lốp dự phòng',
    category: 'REPAIR_SERVICE',
    serviceType: 'ONSITE',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['CRANE_TRUCK', 'TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '20/08/2025 09:55:46',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 6,
    serviceCode: 'THUY_KICH',
    name: 'Thủy kích',
    description: 'Thủy kích (thời gian hỗ trợ căn cứ theo điều kiện thực tế)',
    category: 'REPAIR_SERVICE',
    serviceType: 'CRANE',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['CRANE_TRUCK', 'TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '20/08/2025 16:27:47',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 7,
    serviceCode: 'HET_PIN',
    name: 'Xe hết pin',
    description: 'Xe hết pin',
    category: 'RESCUE_SERVICE',
    serviceType: 'ONSITE',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: ['CRANE_TRUCK', 'TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '20/08/2025 16:29:31',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 8,
    serviceCode: 'SU_CO',
    name: 'Sự cố kỹ thuật khác khiến xe không di chuyển',
    description: 'Xe gặp vấn đề về sự cố kỹ thuật khiến xe không hoạt động được',
    category: 'RESCUE_SERVICE',
    serviceType: 'ONSITE',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: [],
    prefixServiceCode: 'RS1',
    status: 'active',
    createdAt: '20/08/2025 16:31:06',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: 'rsa_admin',
  }),
  catalog({
    id: 57,
    serviceCode: 'TERM1',
    name: 'Hỗ trợ 24/7, không giới hạn số lần sử dụng',
    description: 'Chính sách hỗ trợ',
    category: 'RESCUE_TERM',
    serviceType: '',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: [],
    prefixServiceCode: 'RS1',
    status: 'inactive',
    createdAt: '20/08/2025 16:29:31',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: '',
  }),
  catalog({
    id: 58,
    serviceCode: 'TERM2',
    name: 'Áp dụng cho xe đang lưu thông trên đường',
    description: 'Chính sách hỗ trợ',
    category: 'RESCUE_TERM',
    serviceType: '',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: [],
    prefixServiceCode: 'RS1',
    status: 'inactive',
    createdAt: '20/08/2025 16:29:31',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: '',
  }),
  catalog({
    id: 59,
    serviceCode: 'TERM3',
    name: 'Miễn phí kéo xe trong phạm vi 100 km',
    description: 'Chính sách hỗ trợ',
    category: 'RESCUE_TERM',
    serviceType: '',
    unit: 'TIMES',
    baseDurationMinutes: 30,
    specialEquipment: '',
    supportVehicleTypes: [],
    prefixServiceCode: 'RS1',
    status: 'inactive',
    createdAt: '20/08/2025 16:29:31',
    createdBy: 'system',
    updatedAt: '',
    updatedBy: '',
  }),
  {
    id: 101,
    serviceCode: 'DIG_ONSITE_EXTRA',
    name: 'Sửa chữa tại chỗ ngoài gói',
    description: 'DV phát sinh gắn DIG và CHUBB',
    category: 'REPAIR_SERVICE',
    serviceType: 'ONSITE',
    unit: 'TIMES',
    baseDurationMinutes: 45,
    specialEquipment: '',
    supportVehicleTypes: ['TOW_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    corporateCustomers: [snapshotCorporateLink(16), snapshotCorporateLink(99)],
    createdAt: '04/09/2026 09:00:00',
    createdBy: 'rsa_admin',
    updatedAt: '04/09/2026 09:00:00',
    updatedBy: 'rsa_admin',
  },
  {
    id: 102,
    serviceCode: 'TIC_TOW_EXTRA',
    name: 'Kéo xe phát sinh ngoài quyền lợi gói',
    description: 'DV phát sinh gắn DIG, TIC và VOLVO',
    category: 'TOW_SERVICE',
    serviceType: 'TOWING',
    unit: 'KM',
    baseDurationMinutes: 60,
    specialEquipment: 'Xe sàn trượt',
    supportVehicleTypes: ['TOW_TRUCK', 'CAR_CARRIER_TRUCK'],
    prefixServiceCode: 'RS1',
    status: 'active',
    corporateCustomers: [snapshotCorporateLink(16), snapshotCorporateLink(15), snapshotCorporateLink(1)],
    createdAt: '04/09/2026 09:15:00',
    createdBy: 'rsa_admin',
    updatedAt: '04/09/2026 09:15:00',
    updatedBy: 'rsa_admin',
  },
];

export const serviceScopeOf = (row: Pick<RescueServiceRecord, 'corporateCustomers'>): ServiceScope =>
  row.corporateCustomers.length === 0 ? 'CATALOG' : 'INCIDENTAL';

export const getServiceById = (id: number | string): RescueServiceRecord | undefined => {
  const n = typeof id === 'number' ? id : Number(id);
  if (Number.isNaN(n)) return undefined;
  return MOCK_RESCUE_SERVICES.find((s) => s.id === n);
};

const adminNowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export type RescueServiceFormPayload = Omit<
  RescueServiceRecord,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;

const withCorporateSnapshots = (links: ServiceCorporateLink[]): ServiceCorporateLink[] =>
  links.map((row) => snapshotCorporateLink(row.corporateCustomerId));

export const isServiceCodeTaken = (code: string, excludeId?: number): boolean => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  return MOCK_RESCUE_SERVICES.some(
    (s) => s.serviceCode.trim().toUpperCase() === normalized && s.id !== excludeId,
  );
};

export const createMockService = (payload: RescueServiceFormPayload): RescueServiceRecord => {
  const stamp = adminNowStamp();
  const nextId = Math.max(0, ...MOCK_RESCUE_SERVICES.map((s) => s.id)) + 1;
  const row: RescueServiceRecord = {
    ...payload,
    corporateCustomers: withCorporateSnapshots(payload.corporateCustomers),
    id: nextId,
    serviceCode: payload.serviceCode.trim(),
    name: payload.name.trim(),
    createdAt: stamp,
    createdBy: 'rsa_test1',
    updatedAt: stamp,
    updatedBy: 'rsa_test1',
  };
  MOCK_RESCUE_SERVICES.unshift(row);
  return row;
};

export const updateMockService = (id: number, payload: RescueServiceFormPayload): RescueServiceRecord | undefined => {
  const idx = MOCK_RESCUE_SERVICES.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  const prev = MOCK_RESCUE_SERVICES[idx];
  const next: RescueServiceRecord = {
    ...prev,
    ...payload,
    corporateCustomers: withCorporateSnapshots(payload.corporateCustomers),
    id: prev.id,
    serviceCode: payload.serviceCode.trim(),
    name: payload.name.trim(),
    createdAt: prev.createdAt,
    createdBy: prev.createdBy,
    updatedAt: adminNowStamp(),
    updatedBy: 'rsa_test1',
  };
  MOCK_RESCUE_SERVICES[idx] = next;
  return next;
};
