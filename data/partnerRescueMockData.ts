export type PartnerRole = 'BDH' | 'GDM' | 'GDCN' | 'QLVUNG' | 'GDTT' | 'NVCH' | 'KT';

export type OrgLevel = 1 | 2 | 3 | 4 | 5;

export interface OrgNode {
  id: string;
  name: string;
  level: OrgLevel;
  parentId: string | null;
  /** Level 5 = trạm = trung tâm = xưởng */
  isStation: boolean;
}

export interface PartnerPersona {
  id: string;
  role: PartnerRole;
  label: string;
  title: string;
  orgNodeId: string;
  /** Station ids in scope (empty = all) */
  stationIds: string[];
}

export type VehicleType = 'san_truot' | 'san_nang_truot' | 'san_truot_cau';

export interface VehicleToolItem {
  id: string;
  name: string;
  status: 0 | 1;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  hnl: number;
  brand: 'Isuzu' | 'Hino' | 'Dongfeng';
  modelLine: string;
  chassis: string;
  engineNo: string;
  year: number;
  stationId: string;
  driverId: string | null;
  type: VehicleType;
  loadCarry: string;
  loadCrane: string;
  loadLift: string;
  seats: string;
  runStatus: 'active' | 'repair';
  idleHours: number;
  inspectionDueDays: number;
  maintenanceDueDays: number;
  gplhDueDays: number;
  tndsDueDays: number;
  physicalInsDueDays: number;
  tools: VehicleToolItem[];
  revenueMonth: number;
}

export interface VehiclePhoto {
  id: string;
  label: string;
  url: string;
}

export interface VehicleDocument {
  id: string;
  name: string;
  type: string;
  issuedAt: string;
  expiryAt: string;
  fileName: string;
  fileUrl?: string;
}

export interface VehicleTransferHistory {
  id: string;
  vehicleId: string;
  fromStationId: string;
  toStationId: string;
  transferredAt: string;
  byName: string;
  reason: string;
}

export type StaffWorkStatus = 'active' | 'paused' | 'left';
export type StaffDutyStatus = 'on_duty' | 'on_order' | 'offline';

export interface PartnerStaffRecord {
  id: string;
  code: string;
  fullname: string;
  phone: string;
  cccd: string;
  address: string;
  role: PartnerRole;
  orgNodeId: string;
  stationId: string | null;
  licenseType: string;
  licenseIssued: string;
  licenseExpiry: string;
  craneCert: boolean;
  hasAccount: boolean;
  canQuote: boolean;
  canRescue: boolean;
  email?: string;
  mfaEnabled?: boolean;
  accountLocked?: boolean;
  /** Gọi SSO/Keycloak tạo TK thất bại — cho phép retry */
  accountCreateFailed?: boolean;
  workStatus?: StaffWorkStatus;
  dutyStatus?: StaffDutyStatus;
  contractType?: string;
  joinedAt?: string;
  lastLoginAt?: string;
  lastLoginDevice?: string;
  passwordChangedAt?: string;
  lockedAt?: string;
  lockedReason?: string;
}

export const STAFF_WORK_STATUS_LABEL: Record<StaffWorkStatus, string> = {
  active: 'Đang hoạt động',
  paused: 'Tạm dừng',
  left: 'Nghỉ việc',
};

export const STAFF_DUTY_STATUS_LABEL: Record<StaffDutyStatus, string> = {
  on_duty: 'Sẵn sàng',
  on_order: 'Đang nhận đơn',
  offline: 'Offline',
};

export const staffWorkStatusOf = (s: Pick<PartnerStaffRecord, 'workStatus'>) => s.workStatus ?? 'active';

export const staffDutyStatusOf = (s: Pick<PartnerStaffRecord, 'dutyStatus' | 'role'>) =>
  s.role === 'NVCH' ? (s.dutyStatus ?? 'offline') : undefined;

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  san_truot: 'Sàn trượt',
  san_nang_truot: 'Sàn nâng trượt',
  san_truot_cau: 'Sàn trượt, cẩu',
};

export const ROLE_LABEL: Record<PartnerRole, string> = {
  BDH: 'Ban điều hành',
  GDM: 'Giám đốc Miền',
  GDCN: 'Giám đốc Chi nhánh',
  QLVUNG: 'Quản lý Vùng chi nhánh',
  GDTT: 'Giám đốc Trung tâm (Điều phối)',
  NVCH: 'Nhân viên cứu hộ',
  KT: 'Kế toán',
};

export const CRANE_TOOLS = [
  'Dây tăng bánh',
  'Dây cáp vải',
  'Ma ní',
  'Xích',
  'Móc cẩu',
  'Cọc phản quang',
  'Dây câu bình',
  'Đèn pin',
  'Gòng cẩu',
  'Gỗ kê chân',
  'Bình chữa cháy',
];

export const SLIDE_TOOLS = CRANE_TOOLS.filter((n) => n !== 'Gòng cẩu' && n !== 'Gỗ kê chân');

export const TOOL_CATALOG: Record<VehicleType, string[]> = {
  san_truot: SLIDE_TOOLS,
  san_nang_truot: SLIDE_TOOLS,
  san_truot_cau: CRANE_TOOLS,
};

export const ORG_NODES: OrgNode[] = [
  { id: 'bdh', name: 'Ban điều hành Carpla', level: 1, parentId: null, isStation: false },
  { id: 'mien-bac', name: 'Miền Bắc', level: 2, parentId: 'bdh', isStation: false },
  { id: 'mien-nam', name: 'Miền Nam', level: 2, parentId: 'bdh', isStation: false },
  { id: 'cn-hn', name: 'Chi nhánh Hà Nội', level: 3, parentId: 'mien-bac', isStation: false },
  { id: 'cn-hp', name: 'Chi nhánh Hải Phòng', level: 3, parentId: 'mien-bac', isStation: false },
  { id: 'cn-hcm', name: 'Chi nhánh TP.HCM', level: 3, parentId: 'mien-nam', isStation: false },
  { id: 'vung-hn', name: 'Vùng Hà Nội', level: 4, parentId: 'cn-hn', isStation: false },
  { id: 'vung-hp', name: 'Vùng Hải Phòng', level: 4, parentId: 'cn-hp', isStation: false },
  { id: 'vung-hcm', name: 'Vùng TP.HCM', level: 4, parentId: 'cn-hcm', isStation: false },
  { id: 'tt-hm', name: 'Trạm Hoàng Mai', level: 5, parentId: 'vung-hn', isStation: true },
  { id: 'tt-hd', name: 'Trạm Hà Đông', level: 5, parentId: 'vung-hn', isStation: true },
  { id: 'tt-hp', name: 'Trạm Hải Phòng', level: 5, parentId: 'vung-hp', isStation: true },
  { id: 'tt-bt', name: 'Trạm Bình Thạnh', level: 5, parentId: 'vung-hcm', isStation: true },
];

const stationIdsUnder = (nodeId: string): string[] => {
  const collect = (id: string): string[] => {
    const node = ORG_NODES.find((n) => n.id === id);
    if (!node) return [];
    if (node.isStation) return [node.id];
    return ORG_NODES.filter((n) => n.parentId === id).flatMap((n) => collect(n.id));
  };
  return collect(nodeId);
};

export const PERSONAS: PartnerPersona[] = [
  { id: 'p-bdh', role: 'BDH', label: 'BDH — toàn quốc', title: 'Nguyễn Văn Bình', orgNodeId: 'bdh', stationIds: [] },
  { id: 'p-gdm', role: 'GDM', label: 'GĐ Miền Bắc', title: 'Trần Minh Đức', orgNodeId: 'mien-bac', stationIds: stationIdsUnder('mien-bac') },
  { id: 'p-gdcn', role: 'GDCN', label: 'GĐ CN Hà Nội', title: 'Lê Thị Hoa', orgNodeId: 'cn-hn', stationIds: stationIdsUnder('cn-hn') },
  { id: 'p-qlv', role: 'QLVUNG', label: 'QL Vùng Hà Nội', title: 'Phạm Quốc Huy', orgNodeId: 'vung-hn', stationIds: stationIdsUnder('cn-hn') },
  { id: 'p-gdtt', role: 'GDTT', label: 'GĐTT Hoàng Mai', title: 'Đỗ Văn Long', orgNodeId: 'tt-hm', stationIds: ['tt-hm'] },
  { id: 'p-nv', role: 'NVCH', label: 'NV cứu hộ — Hoàng Mai', title: 'Ngô Đức Anh', orgNodeId: 'tt-hm', stationIds: ['tt-hm'] },
  { id: 'p-kt', role: 'KT', label: 'KT — Hoàng Mai', title: 'Vũ Thanh Hà', orgNodeId: 'tt-hm', stationIds: ['tt-hm'] },
];

export const toolsFor = (type: VehicleType, broken?: string[]): VehicleToolItem[] =>
  TOOL_CATALOG[type].map((name, i) => ({
    id: `${type}-${i}`,
    name,
    status: broken?.includes(name) ? 0 : 1,
  }));

export const VEHICLES: VehicleRecord[] = [
  {
    id: 'v1', plate: '29C-123.45', hnl: 21, brand: 'Isuzu', modelLine: 'NPR 400', chassis: 'JALC4B16X07001234', engineNo: '4HK1-123456',
    year: 2022, stationId: 'tt-hm', driverId: 's6',
    type: 'san_truot_cau', loadCarry: '5 tấn', loadCrane: '8 tấn', loadLift: '—', seats: '3', runStatus: 'active',
    idleHours: 6, inspectionDueDays: 22, maintenanceDueDays: 12, gplhDueDays: 40, tndsDueDays: 18, physicalInsDueDays: 9,
    tools: toolsFor('san_truot_cau', ['Xích']), revenueMonth: 48_500_000,
  },
  {
    id: 'v2', plate: '29C-678.90', hnl: 22, brand: 'Hino', modelLine: 'XZU 720', chassis: 'JHHFC2J5XK0002211', engineNo: 'N04C-778899',
    year: 2021, stationId: 'tt-hm', driverId: 's7',
    type: 'san_truot', loadCarry: '3.5 tấn', loadCrane: '—', loadLift: '—', seats: '3', runStatus: 'active',
    idleHours: 80, inspectionDueDays: 45, maintenanceDueDays: 4, gplhDueDays: 5, tndsDueDays: 60, physicalInsDueDays: 20,
    tools: toolsFor('san_truot'), revenueMonth: 12_200_000,
  },
  {
    id: 'v3', plate: '30F-111.22', hnl: 31, brand: 'Dongfeng', modelLine: 'Captain C', chassis: 'LGAX4B123D0003311', engineNo: 'CY4102-331122',
    year: 2023, stationId: 'tt-hd', driverId: 's9',
    type: 'san_nang_truot', loadCarry: '4 tấn', loadCrane: '—', loadLift: '3 tấn', seats: '2', runStatus: 'repair',
    idleHours: 200, inspectionDueDays: 8, maintenanceDueDays: 2, gplhDueDays: 90, tndsDueDays: 3, physicalInsDueDays: 50,
    tools: toolsFor('san_nang_truot', ['Dây tăng bánh', 'Đèn pin']), revenueMonth: 0,
  },
  {
    id: 'v4', plate: '15B-333.44', hnl: 41, brand: 'Isuzu', modelLine: 'FRR 90', chassis: 'JALC4B16X07004411', engineNo: '4HK1-441122',
    year: 2020, stationId: 'tt-hp', driverId: null,
    type: 'san_truot_cau', loadCarry: '5 tấn', loadCrane: '8 tấn', loadLift: '—', seats: '3', runStatus: 'active',
    idleHours: 10, inspectionDueDays: 70, maintenanceDueDays: 20, gplhDueDays: 15, tndsDueDays: 25, physicalInsDueDays: 40,
    tools: toolsFor('san_truot_cau'), revenueMonth: 31_000_000,
  },
  {
    id: 'v5', plate: '51C-555.66', hnl: 51, brand: 'Hino', modelLine: 'XZU 650', chassis: 'JHHFC2J5XK0005511', engineNo: 'N04C-551133',
    year: 2024, stationId: 'tt-bt', driverId: null,
    type: 'san_truot', loadCarry: '3.5 tấn', loadCrane: '—', loadLift: '—', seats: '2', runStatus: 'active',
    idleHours: 4, inspectionDueDays: 100, maintenanceDueDays: 30, gplhDueDays: 80, tndsDueDays: 40, physicalInsDueDays: 12,
    tools: toolsFor('san_truot'), revenueMonth: 55_800_000,
  },
];

export const PARTNER_STAFF: PartnerStaffRecord[] = [
  { id: 's1', code: 'CP-0001', fullname: 'Nguyễn Văn Bình', phone: '0901 111 111', cccd: '001080011111', address: 'Hà Nội', role: 'BDH', orgNodeId: 'bdh', stationId: null, licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: true, canRescue: false, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '01/01/2018', mfaEnabled: true, lastLoginAt: '20/08/2026 09:02', lastLoginDevice: 'Web Portal', passwordChangedAt: '12/01/2026' },
  { id: 's2', code: 'CP-0010', fullname: 'Trần Minh Đức', phone: '0902 222 222', cccd: '001080022222', address: 'Hà Nội', role: 'GDM', orgNodeId: 'mien-bac', stationId: null, licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: true, canRescue: false, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '01/03/2019', mfaEnabled: true, lastLoginAt: '20/08/2026 08:40', lastLoginDevice: 'Web Portal', passwordChangedAt: '03/02/2026' },
  { id: 's3', code: 'CP-0020', fullname: 'Lê Thị Hoa', phone: '0903 333 333', cccd: '001080033333', address: 'Hà Nội', role: 'GDCN', orgNodeId: 'cn-hn', stationId: null, licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: true, canRescue: false, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '15/06/2020', mfaEnabled: true, lastLoginAt: '20/08/2026 08:45', lastLoginDevice: 'App iOS · Chi nhánh Hà Nội', passwordChangedAt: '18/04/2026' },
  { id: 's4', code: 'CP-0021', fullname: 'Phạm Quốc Huy', phone: '0904 444 444', cccd: '001080044444', address: 'Hà Nội', role: 'QLVUNG', orgNodeId: 'vung-hn', stationId: null, licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: true, canRescue: false, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '01/09/2021', mfaEnabled: false, lastLoginAt: '19/08/2026 17:20', lastLoginDevice: 'Web Portal', passwordChangedAt: '01/08/2026' },
  { id: 's5', code: 'CP-0101', fullname: 'Đỗ Văn Long', phone: '0905 555 555', cccd: '001080055555', address: 'Hoàng Mai', role: 'GDTT', orgNodeId: 'tt-hm', stationId: 'tt-hm', licenseType: 'C', licenseIssued: '12/03/2020', licenseExpiry: '12/03/2030', craneCert: true, hasAccount: true, canQuote: true, canRescue: true, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '12/03/2020', mfaEnabled: true, lastLoginAt: '20/08/2026 08:01', lastLoginDevice: 'App Android · Trạm Hoàng Mai', passwordChangedAt: '10/05/2026' },
  { id: 's6', code: 'CP-0201', fullname: 'Ngô Đức Anh', phone: '0906 666 666', cccd: '001080066666', address: 'Hoàng Mai', role: 'NVCH', orgNodeId: 'tt-hm', stationId: 'tt-hm', licenseType: 'C', licenseIssued: '01/06/2019', licenseExpiry: '01/06/2029', craneCert: true, hasAccount: true, canQuote: false, canRescue: true, workStatus: 'active', dutyStatus: 'on_duty', contractType: 'Toàn thời gian', joinedAt: '01/06/2019', mfaEnabled: true, lastLoginAt: '20/08/2026 07:12', lastLoginDevice: 'App iOS · Trạm Hoàng Mai', passwordChangedAt: '01/07/2026' },
  { id: 's7', code: 'CP-0202', fullname: 'Bùi Văn Tâm', phone: '0907 777 777', cccd: '001080077777', address: 'Hoàng Mai', role: 'NVCH', orgNodeId: 'tt-hm', stationId: 'tt-hm', licenseType: 'C', licenseIssued: '08/01/2021', licenseExpiry: '08/01/2031', craneCert: false, hasAccount: false, canQuote: false, canRescue: true, accountCreateFailed: true, workStatus: 'active', dutyStatus: 'offline', contractType: 'Toàn thời gian', joinedAt: '08/01/2021' },
  { id: 's8', code: 'CP-0301', fullname: 'Vũ Thanh Hà', phone: '0908 888 888', cccd: '001080088888', address: 'Hoàng Mai', role: 'KT', orgNodeId: 'tt-hm', stationId: 'tt-hm', licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: false, canRescue: false, workStatus: 'active', contractType: 'Toàn thời gian', joinedAt: '02/02/2022', mfaEnabled: true, lastLoginAt: '20/08/2026 09:10', lastLoginDevice: 'App Android · Trạm Hoàng Mai', passwordChangedAt: '20/03/2026' },
  { id: 's9', code: 'CP-0210', fullname: 'Hoàng Gia Bảo', phone: '0909 999 999', cccd: '001080099999', address: 'Hà Đông', role: 'NVCH', orgNodeId: 'tt-hd', stationId: 'tt-hd', licenseType: 'C', licenseIssued: '03/11/2018', licenseExpiry: '03/11/2028', craneCert: false, hasAccount: true, canQuote: false, canRescue: true, workStatus: 'active', dutyStatus: 'on_order', contractType: 'Toàn thời gian', joinedAt: '03/11/2018', mfaEnabled: false, lastLoginAt: '20/08/2026 06:40', lastLoginDevice: 'App Android · Trạm Hà Đông', passwordChangedAt: '11/11/2025' },
  { id: 's10', code: 'CP-0401', fullname: 'Mai Thị Lan', phone: '0910 101 010', cccd: '001080010101', address: 'Bình Thạnh', role: 'KT', orgNodeId: 'tt-bt', stationId: 'tt-bt', licenseType: '—', licenseIssued: '—', licenseExpiry: '—', craneCert: false, hasAccount: true, canQuote: false, canRescue: false, accountLocked: true, workStatus: 'paused', contractType: 'Thời vụ', joinedAt: '01/04/2025', mfaEnabled: false, lastLoginAt: '14/08/2026 16:02', lastLoginDevice: 'Web Portal', lockedAt: '15/08/2026 09:00', lockedReason: 'Sai mật khẩu quá số lần cho phép' },
];

export const driverName = (driverId: string | null) =>
  PARTNER_STAFF.find((s) => s.id === driverId)?.fullname ?? 'Chưa gán';

export const driversAtStation = (stationId: string) =>
  PARTNER_STAFF.filter((s) => s.role === 'NVCH' && s.stationId === stationId);

export const nextHnl = (list: { hnl: number }[]) =>
  (list.reduce((max, v) => Math.max(max, v.hnl), 0) || 0) + 1;

/** Giữ xe mới trên mock để màn chi tiết tìm được sau khi Thêm xe. */
export const registerVehicle = (v: VehicleRecord) => {
  VEHICLES.unshift(v);
};

export const saveVehicleMedia = (id: string, photos: VehiclePhoto[], docs: VehicleDocument[]) => {
  VEHICLE_PHOTOS[id] = photos;
  VEHICLE_DOCUMENTS[id] = docs;
};

export const updateVehicle = (id: string, patch: Partial<VehicleRecord>) => {
  const row = VEHICLES.find((v) => v.id === id);
  if (row) Object.assign(row, patch);
};

export const nextStaffCode = () => {
  const max = PARTNER_STAFF.reduce((acc, s) => {
    const n = Number(s.code.replace(/\D/g, '')) || 0;
    return Math.max(acc, n);
  }, 0);
  return `CP-${String(max + 1).padStart(4, '0')}`;
};

export const registerStaff = (s: PartnerStaffRecord) => {
  PARTNER_STAFF.unshift(s);
};

export const updateStaff = (id: string, patch: Partial<PartnerStaffRecord>) => {
  const row = PARTNER_STAFF.find((s) => s.id === id);
  if (row) Object.assign(row, patch);
};

export const vehiclesOfDriver = (staffId: string) => VEHICLES.filter((v) => v.driverId === staffId);

export const assignDriverToVehicle = (staffId: string, vehicleId: string | null) => {
  VEHICLES.forEach((v) => {
    if (v.driverId === staffId) v.driverId = null;
  });
  if (!vehicleId) return;
  const target = VEHICLES.find((v) => v.id === vehicleId);
  if (target) target.driverId = staffId;
};

export interface StaffTransferHistory {
  id: string;
  staffId: string;
  fromStationId: string;
  toStationId: string;
  transferredAt: string;
  byName: string;
  reason: string;
}

export const STAFF_TRANSFER_HISTORY: StaffTransferHistory[] = [
  { id: 'st1', staffId: 's6', fromStationId: 'tt-hd', toStationId: 'tt-hm', transferredAt: '01/03/2026 09:15', byName: 'Lê Thị Hoa', reason: 'Bổ sung tài xế xe cẩu cho Trạm Hoàng Mai' },
  { id: 'st2', staffId: 's9', fromStationId: 'tt-hm', toStationId: 'tt-hd', transferredAt: '12/01/2026 10:20', byName: 'Phạm Quốc Huy', reason: 'Điều chuyển theo nhu cầu phủ sóng Hà Đông' },
  { id: 'st3', staffId: 's5', fromStationId: 'tt-hd', toStationId: 'tt-hm', transferredAt: '20/06/2026 08:00', byName: 'Lê Thị Hoa', reason: 'Bổ nhiệm GĐTT Hoàng Mai' },
];

export const registerStaffTransfer = (t: StaffTransferHistory) => {
  STAFF_TRANSFER_HISTORY.unshift(t);
};

export interface StaffKpiSummary {
  staffId: string;
  completed: number;
  cancelled: number;
  rejected: number;
  avgResponseMin: number;
  avgApproachMin: number;
  revenue: number;
  rating: number;
}

export const STAFF_KPI: StaffKpiSummary[] = [
  { staffId: 's6', completed: 42, cancelled: 3, rejected: 1, avgResponseMin: 4.2, avgApproachMin: 18, revenue: 48_500_000, rating: 4.7 },
  { staffId: 's7', completed: 28, cancelled: 2, rejected: 0, avgResponseMin: 6.1, avgApproachMin: 22, revenue: 12_200_000, rating: 4.4 },
  { staffId: 's9', completed: 15, cancelled: 5, rejected: 2, avgResponseMin: 8.0, avgApproachMin: 25, revenue: 7_800_000, rating: 4.1 },
];

export const staffKpiOf = (id: string) => STAFF_KPI.find((k) => k.staffId === id);

export const staffUsername = (code: string) => code.toLowerCase().replace('-', '.');

export const staffAccountLabel = (s: Pick<PartnerStaffRecord, 'hasAccount' | 'accountLocked' | 'accountCreateFailed'>) => {
  if (s.accountCreateFailed) return 'Lỗi tạo TK';
  if (!s.hasAccount) return 'Chưa cấp';
  if (s.accountLocked) return 'Khóa';
  return 'Active';
};

export const registerTransfer = (t: VehicleTransferHistory) => {
  VEHICLE_TRANSFER_HISTORY.unshift(t);
};

export const orgName = (id: string) => ORG_NODES.find((n) => n.id === id)?.name ?? id;

export const stationName = (id: string) => orgName(id);

export const inScope = (persona: PartnerPersona, stationId: string | null) => {
  if (persona.stationIds.length === 0) return true;
  if (!stationId) return persona.role === 'BDH' || persona.role === 'GDM' || persona.role === 'GDCN' || persona.role === 'QLVUNG';
  return persona.stationIds.includes(stationId);
};

export const dueBadge = (days: number, warn: number) => {
  if (days < 0) return { text: `Quá hạn ${Math.abs(days)} ngày`, tone: 'red' as const };
  if (days <= warn) return { text: `Còn ${days} ngày`, tone: 'amber' as const };
  return { text: `Còn ${days} ngày`, tone: 'green' as const };
};

export type StaffDocument = VehicleDocument;

export const STAFF_DOC_TYPES = [
  'Bằng lái',
  'Chứng chỉ cẩu',
  'Giấy phép hành nghề',
  'Chứng chỉ sơ cấp cứu',
  'Chứng nhận ATGT',
  'Khác',
] as const;

export const STAFF_DOCUMENTS: Record<string, StaffDocument[]> = {
  s5: [
    { id: 'sd-s5-1', name: 'Bằng lái hạng C', type: 'Bằng lái', issuedAt: '12/03/2020', expiryAt: '12/03/2030', fileName: 'bang-lai-cp0101.pdf', fileUrl: 'https://picsum.photos/seed/sd-s5-1/800/1100' },
    { id: 'sd-s5-2', name: 'Chứng chỉ vận hành cẩu', type: 'Chứng chỉ cẩu', issuedAt: '20/04/2021', expiryAt: '20/04/2027', fileName: 'chung-chi-cau-cp0101.pdf', fileUrl: 'https://picsum.photos/seed/sd-s5-2/800/1100' },
  ],
  s6: [
    { id: 'sd-s6-1', name: 'Bằng lái hạng C', type: 'Bằng lái', issuedAt: '01/06/2019', expiryAt: '01/06/2029', fileName: 'bang-lai-cp0201.pdf', fileUrl: 'https://picsum.photos/seed/sd-s6-1/800/1100' },
    { id: 'sd-s6-2', name: 'Chứng chỉ vận hành cẩu', type: 'Chứng chỉ cẩu', issuedAt: '15/08/2020', expiryAt: '15/08/2026', fileName: 'chung-chi-cau-cp0201.pdf', fileUrl: 'https://picsum.photos/seed/sd-s6-2/800/1100' },
    { id: 'sd-s6-3', name: 'Chứng chỉ sơ cấp cứu', type: 'Chứng chỉ sơ cấp cứu', issuedAt: '10/01/2025', expiryAt: '10/01/2027', fileName: 'so-cap-cuu-cp0201.pdf', fileUrl: 'https://picsum.photos/seed/sd-s6-3/800/1100' },
  ],
  s7: [
    { id: 'sd-s7-1', name: 'Bằng lái hạng C', type: 'Bằng lái', issuedAt: '08/01/2021', expiryAt: '08/01/2031', fileName: 'bang-lai-cp0202.pdf' },
  ],
  s9: [
    { id: 'sd-s9-1', name: 'Bằng lái hạng C', type: 'Bằng lái', issuedAt: '03/11/2018', expiryAt: '03/11/2028', fileName: 'bang-lai-cp0210.pdf' },
    { id: 'sd-s9-2', name: 'Chứng nhận an toàn giao thông', type: 'Chứng nhận ATGT', issuedAt: '01/02/2024', expiryAt: '01/02/2027', fileName: 'atgt-cp0210.pdf' },
  ],
};

export const saveStaffDocs = (id: string, docs: StaffDocument[]) => {
  STAFF_DOCUMENTS[id] = docs;
};

export const staffDocsOf = (id: string) => STAFF_DOCUMENTS[id] ?? [];

export type StaffLogKind = 'login' | 'transfer' | 'quote';

export interface StaffUserLog {
  id: string;
  staffId: string;
  kind: StaffLogKind;
  at: string;
  summary: string;
}

export const STAFF_LOG_KIND_LABEL: Record<StaffLogKind, string> = {
  login: 'Đăng nhập app',
  transfer: 'Điều chuyển',
  quote: 'Báo giá',
};

export const STAFF_USER_LOGS: StaffUserLog[] = [
  { id: 'lg-s6-1', staffId: 's6', kind: 'login', at: '20/08/2026 07:12', summary: 'App iOS · Trạm Hoàng Mai' },
  { id: 'lg-s6-2', staffId: 's6', kind: 'quote', at: '19/08/2026 16:40', summary: 'RS-29C123-260819-4412 · 1.250.000đ · Đã gửi' },
  { id: 'lg-s6-3', staffId: 's6', kind: 'login', at: '19/08/2026 06:58', summary: 'App iOS · Trạm Hoàng Mai' },
  { id: 'lg-s6-4', staffId: 's6', kind: 'quote', at: '18/08/2026 11:05', summary: 'RS-30F111-260818-2201 · 890.000đ · Khách đồng ý' },
  { id: 'lg-s6-5', staffId: 's6', kind: 'transfer', at: '01/03/2026 09:15', summary: 'Trạm Hà Đông → Trạm Hoàng Mai · Duyệt: Lê Thị Hoa' },
  { id: 'lg-s5-1', staffId: 's5', kind: 'login', at: '20/08/2026 08:01', summary: 'App Android · Trạm Hoàng Mai' },
  { id: 'lg-s5-2', staffId: 's5', kind: 'quote', at: '20/08/2026 09:22', summary: 'RS-29C678-260820-1188 · 2.100.000đ · Đã gửi' },
  { id: 'lg-s5-3', staffId: 's5', kind: 'quote', at: '19/08/2026 14:10', summary: 'RS-15B333-260819-0903 · 3.450.000đ · Hủy' },
  { id: 'lg-s5-4', staffId: 's5', kind: 'transfer', at: '20/06/2026 08:00', summary: 'Xe 29C-678.90 · Trạm Hà Đông → Trạm Hoàng Mai' },
  { id: 'lg-s9-1', staffId: 's9', kind: 'login', at: '20/08/2026 06:40', summary: 'App Android · Trạm Hà Đông' },
  { id: 'lg-s9-2', staffId: 's9', kind: 'quote', at: '17/08/2026 15:33', summary: 'RS-29C999-260817-5510 · 760.000đ · Đã gửi' },
  { id: 'lg-s9-3', staffId: 's9', kind: 'transfer', at: '12/01/2026 10:20', summary: 'Trạm Hoàng Mai → Trạm Hà Đông · Duyệt: Phạm Quốc Huy' },
  { id: 'lg-s3-1', staffId: 's3', kind: 'login', at: '20/08/2026 08:45', summary: 'App iOS · Chi nhánh Hà Nội' },
  { id: 'lg-s3-2', staffId: 's3', kind: 'transfer', at: '01/03/2026 09:15', summary: 'Duyệt điều chuyển xe 29C-123.45 · Hà Đông → Hoàng Mai' },
  { id: 'lg-s8-1', staffId: 's8', kind: 'login', at: '20/08/2026 09:10', summary: 'App Android · Trạm Hoàng Mai' },
];

export const staffLogsOf = (id: string) => STAFF_USER_LOGS.filter((l) => l.staffId === id);

export const registerStaffLog = (log: StaffUserLog) => {
  STAFF_USER_LOGS.unshift(log);
};

export const formatVnd = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

const PHOTO = (seed: string, label: string): VehiclePhoto => ({
  id: seed,
  label,
  url: `https://picsum.photos/seed/${seed}/480/320`,
});

export const VEHICLE_PHOTOS: Record<string, VehiclePhoto[]> = {
  v1: [
    PHOTO('v1-front', 'Góc trước'),
    PHOTO('v1-rear', 'Góc sau'),
    PHOTO('v1-left', 'Bên trái'),
    PHOTO('v1-right', 'Bên phải'),
  ],
  v2: [
    PHOTO('v2-front', 'Góc trước'),
    PHOTO('v2-rear', 'Góc sau'),
    PHOTO('v2-left', 'Bên trái'),
  ],
  v3: [
    PHOTO('v3-front', 'Góc trước'),
    PHOTO('v3-cabin', 'Cabin'),
  ],
  v4: [
    PHOTO('v4-front', 'Góc trước'),
    PHOTO('v4-rear', 'Góc sau'),
    PHOTO('v4-left', 'Bên trái'),
    PHOTO('v4-right', 'Bên phải'),
  ],
  v5: [
    PHOTO('v5-front', 'Góc trước'),
    PHOTO('v5-rear', 'Góc sau'),
  ],
};

const expiryFromDays = (days: number) => {
  const d = new Date(2026, 7, 20);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('vi-VN');
};

export const VEHICLE_DOCUMENTS: Record<string, VehicleDocument[]> = {
  v1: [
    { id: 'd1', name: 'Giấy đăng kiểm', type: 'Đăng kiểm', issuedAt: '20/08/2025', expiryAt: expiryFromDays(22), fileName: 'dang-kiem-29C12345.pdf', fileUrl: 'https://picsum.photos/seed/doc-d1/800/1100' },
    { id: 'd2', name: 'BH TNDS bắt buộc', type: 'Bảo hiểm', issuedAt: '20/08/2025', expiryAt: expiryFromDays(18), fileName: 'tnds-29C12345.pdf', fileUrl: 'https://picsum.photos/seed/doc-d2/800/1100' },
    { id: 'd3', name: 'BH vật chất xe', type: 'Bảo hiểm', issuedAt: '05/09/2025', expiryAt: expiryFromDays(9), fileName: 'vat-chat-29C12345.pdf', fileUrl: 'https://picsum.photos/seed/doc-d3/800/1100' },
    { id: 'd4', name: 'Giấy phép lưu hành', type: 'GPLH', issuedAt: '01/01/2026', expiryAt: expiryFromDays(40), fileName: 'gplh-29C12345.pdf', fileUrl: 'https://picsum.photos/seed/doc-d4/800/1100' },
  ],
  v2: [
    { id: 'd5', name: 'Giấy đăng kiểm', type: 'Đăng kiểm', issuedAt: '01/02/2026', expiryAt: expiryFromDays(45), fileName: 'dang-kiem-29C67890.pdf' },
    { id: 'd6', name: 'BH TNDS bắt buộc', type: 'Bảo hiểm', issuedAt: '01/02/2026', expiryAt: expiryFromDays(60), fileName: 'tnds-29C67890.pdf' },
    { id: 'd7', name: 'Giấy phép lưu hành', type: 'GPLH', issuedAt: '15/01/2026', expiryAt: expiryFromDays(5), fileName: 'gplh-29C67890.pdf' },
  ],
  v3: [
    { id: 'd8', name: 'Giấy đăng kiểm', type: 'Đăng kiểm', issuedAt: '10/03/2026', expiryAt: expiryFromDays(8), fileName: 'dang-kiem-30F11122.pdf' },
    { id: 'd9', name: 'BH TNDS bắt buộc', type: 'Bảo hiểm', issuedAt: '10/03/2026', expiryAt: expiryFromDays(3), fileName: 'tnds-30F11122.pdf' },
  ],
  v4: [
    { id: 'd10', name: 'Giấy đăng kiểm', type: 'Đăng kiểm', issuedAt: '12/12/2025', expiryAt: expiryFromDays(70), fileName: 'dang-kiem-15B33344.pdf' },
    { id: 'd11', name: 'BH vật chất xe', type: 'Bảo hiểm', issuedAt: '12/12/2025', expiryAt: expiryFromDays(40), fileName: 'vat-chat-15B33344.pdf' },
  ],
  v5: [
    { id: 'd12', name: 'Giấy đăng kiểm', type: 'Đăng kiểm', issuedAt: '01/06/2026', expiryAt: expiryFromDays(100), fileName: 'dang-kiem-51C55566.pdf' },
    { id: 'd13', name: 'BH vật chất xe', type: 'Bảo hiểm', issuedAt: '01/06/2026', expiryAt: expiryFromDays(12), fileName: 'vat-chat-51C55566.pdf' },
  ],
};

export const VEHICLE_TRANSFER_HISTORY: VehicleTransferHistory[] = [
  { id: 't1', vehicleId: 'v1', fromStationId: 'tt-hd', toStationId: 'tt-hm', transferredAt: '01/03/2026 09:15', byName: 'Lê Thị Hoa', reason: 'Bổ sung xe cẩu cho Trạm Hoàng Mai' },
  { id: 't2', vehicleId: 'v1', fromStationId: 'tt-hp', toStationId: 'tt-hd', transferredAt: '12/11/2025 14:40', byName: 'Trần Minh Đức', reason: 'Điều chỉnh phủ sóng Miền Bắc' },
  { id: 't3', vehicleId: 'v2', fromStationId: 'tt-hd', toStationId: 'tt-hm', transferredAt: '20/06/2026 08:00', byName: 'Đỗ Văn Long', reason: 'Xe sàn trượt hỗ trợ nội thành' },
  { id: 't4', vehicleId: 'v3', fromStationId: 'tt-hm', toStationId: 'tt-hd', transferredAt: '05/07/2026 11:20', byName: 'Lê Thị Hoa', reason: 'Xe đang sửa chữa, chuyển về xưởng Hà Đông' },
];

export const STATION_OPTIONS = [
  { id: 'tt-hm', name: 'Trạm Hoàng Mai' },
  { id: 'tt-hd', name: 'Trạm Hà Đông' },
  { id: 'tt-hp', name: 'Trạm Hải Phòng' },
  { id: 'tt-bt', name: 'Trạm Bình Thạnh' },
];

export const vehicleReminders = (v: VehicleRecord) =>
  [
    { label: 'Đăng kiểm', days: v.inspectionDueDays, warn: 30 },
    { label: 'Bảo dưỡng định kỳ', days: v.maintenanceDueDays, warn: 7 },
    { label: 'GPLH', days: v.gplhDueDays, warn: 7 },
    { label: 'BH TNDS', days: v.tndsDueDays, warn: 7 },
    { label: 'BH vật chất', days: v.physicalInsDueDays, warn: 15 },
  ] as const;

