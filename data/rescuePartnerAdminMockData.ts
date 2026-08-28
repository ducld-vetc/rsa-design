export type ProviderType = 'QUICK_SERVICE' | 'THIRD_PARTY' | 'INTERNAL';
export type PartnerStatus = 'active' | 'inactive';

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  INTERNAL: 'Nội bộ',
  THIRD_PARTY: 'Bên ngoài',
  QUICK_SERVICE: 'Quick Service',
};

export const PARTNER_KIND_LABEL: Record<ProviderType, string> = {
  INTERNAL: 'Nội bộ',
  THIRD_PARTY: 'Bên ngoài',
  QUICK_SERVICE: 'Quick Service',
};

export const PROVIDER_TYPE_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: 'INTERNAL', label: 'Nội bộ' },
  { value: 'THIRD_PARTY', label: 'Bên ngoài' },
  { value: 'QUICK_SERVICE', label: 'Quick Service' },
];

export const SERVICE_TYPE_OPTIONS = [
  { value: 'KICH_BINH', label: 'Kích bình ắc quy' },
  { value: 'THAY_LOP', label: 'Thay lốp dự phòng' },
  { value: 'NHIEN_LIEU', label: 'Cung cấp nhiên liệu khẩn cấp (xăng, dầu...)' },
  { value: 'CAU_KEO', label: 'CAU_KEO - Đổ nhầm nhiên liệu' },
  { value: 'DAM_LAT', label: 'DAM_LAT - Đâm, lật, tai nạn' },
  { value: 'HET_PIN', label: 'Hết pin' },
  { value: 'SU_CO', label: 'Sự cố kỹ thuật' },
  { value: 'THUY_KICH', label: 'Thủy kích' },
];

export const VEHICLE_TYPE_OPTIONS = [
  { value: 'WRECKER', label: 'Xe cẩu' },
  { value: 'TOW_TRUCK', label: 'Xe kéo' },
  { value: 'FLATBED_TRUCK', label: 'Xe chở xe' },
  { value: 'HEAVY_WRECKER', label: 'Xe trục vớt / nâng hạ nặng' },
];

export type StationCategory = 'STORE' | 'GARAGE' | 'MOBILE';

export const STATION_CATEGORY_LABEL: Record<StationCategory, string> = {
  STORE: 'Cửa hàng',
  GARAGE: 'Garage',
  MOBILE: 'Điểm lưu động',
};

export const STATION_CATEGORY_OPTIONS: { value: StationCategory; label: string }[] = [
  { value: 'STORE', label: 'Cửa hàng' },
  { value: 'GARAGE', label: 'Garage' },
  { value: 'MOBILE', label: 'Điểm lưu động' },
];

export const ADMIN_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Hà Nội': {
    'Không Quận Huyện': ['Phường Dương Nội', 'Phường Hà Đông', 'Phường Long Biên'],
    'Quận Long Biên': ['Phường Việt Hưng', 'Phường Bồ Đề'],
    'Quận Thanh Xuân': ['Phường Nhân Chính', 'Phường Thanh Xuân Trung'],
  },
  'Tỉnh Vĩnh Phúc': {
    'Vĩnh Yên': ['Phường Định Trung', 'Phường Hội Hợp'],
    'Phúc Yên': ['Phường Phúc Thắng', 'Phường Hùng Vương'],
  },
  'Hải Phòng': {
    'Quận Hồng Bàng': ['Phường Hoàng Văn Thụ', 'Phường Minh Khai'],
    'Quận Ngô Quyền': ['Phường Máy Chai', 'Phường Lạch Tray'],
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Hải Châu I', 'Phường Thanh Bình'],
    'Quận Thanh Khê': ['Phường Chính Gián', 'Phường Xuân Hà'],
  },
  'TP. Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Nguyễn Thái Bình'],
    'TP. Thủ Đức': ['Phường Long Bình', 'Phường Hiệp Bình Chánh'],
  },
};

export const ADMIN_PROVINCES = Object.keys(ADMIN_LOCATIONS);

export const getDistrictsByProvince = (province: string): string[] =>
  Object.keys(ADMIN_LOCATIONS[province] ?? {});

export const getWardsByDistrict = (province: string, district: string): string[] =>
  ADMIN_LOCATIONS[province]?.[district] ?? [];

/** Địa chỉ 2 cấp (Tỉnh/TP → Xã/Phường) sau sáp nhập đơn vị hành chính */
export const getWardsByProvince = (province: string): string[] => {
  const districts = ADMIN_LOCATIONS[province] ?? {};
  return Object.values(districts).flat();
};

export interface StationContact {
  id: string;
  name: string;
  phone: string;
  otherPhone: string;
  email: string;
}

export const emptyStationContact = (): StationContact => ({
  id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  phone: '',
  otherPhone: '',
  email: '',
});

export const stationContactsOf = (s: Pick<RescueStationAdminRecord, 'id' | 'contactName' | 'contactPhone' | 'otherPhone' | 'email' | 'contacts'>): StationContact[] => {
  if (s.contacts && s.contacts.length > 0) return s.contacts;
  return [
    {
      id: `${s.id}-c1`,
      name: s.contactName,
      phone: s.contactPhone,
      otherPhone: s.otherPhone,
      email: s.email,
    },
  ];
};

export const serviceLabel = (code: string): string =>
  SERVICE_TYPE_OPTIONS.find((s) => s.value === code)?.label ?? code;

export const vehicleLabel = (code: string): string =>
  VEHICLE_TYPE_OPTIONS.find((s) => s.value === code)?.label ?? code;

export interface OperatingArea {
  id: string;
  province: string;
  district: string;
  ward: string;
}

export interface RescueProviderRecord {
  id: string;
  code: string;
  name: string;
  type: ProviderType;
  status: PartnerStatus;
  companyName: string;
  taxCode: string;
  businessLicense: string;
  charterCapital: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  serviceTypes: string[];
  contactName: string;
  contactPhone: string;
  otherPhone: string;
  email: string;
  contractNumber: string;
  contractSignedAt: string;
  contractStaff: string;
  contractStaffId: string;
  stationCount: number;
  userCount: number;
  avgRating: string;
  avgResponseTime: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface RescueStationAdminRecord {
  id: string;
  code: string;
  name: string;
  providerId: string;
  providerCode: string;
  providerName: string;
  status: PartnerStatus;
  stationCategory: StationCategory;
  address: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  longitude: string;
  latitude: string;
  contactName: string;
  contactPhone: string;
  otherPhone: string;
  email: string;
  contacts?: StationContact[];
  bankAccount: string;
  accountName: string;
  bankName: string;
  taxCode: string;
  capacity: number;
  services: string[];
  vehicleTypes: string[];
  userCount: number;
  operatingAreas: OperatingArea[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export const MOCK_RESCUE_PROVIDERS: RescueProviderRecord[] = [
  {
    id: 'pv-1',
    code: 'PT3ACE6E0D',
    name: 'Điểm VETC Phường Dương Nội 5',
    type: 'QUICK_SERVICE',
    status: 'active',
    companyName: 'Điểm VETC Phường Dương Nội 5',
    taxCode: '036088008244',
    businessLicense: '',
    charterCapital: '',
    address: 'Đường Dương Nội, Phường Dương Nội, Hà Nội, Việt Nam',
    province: 'Hà Nội',
    district: 'Không Quận Huyện',
    ward: 'Phường Dương Nội',
    specificAddress: 'Đường Dương Nội, Phường Dương Nội, Phường Dương Nội, Hà Nội',
    serviceTypes: ['KICH_BINH', 'THAY_LOP', 'NHIEN_LIEU'],
    contactName: 'Đặng VĂN QUÂN',
    contactPhone: '0982620261',
    otherPhone: '',
    email: 'mrquan.auto@gmail.com',
    contractNumber: '',
    contractSignedAt: '',
    contractStaff: '',
    contractStaffId: '',
    stationCount: 1,
    userCount: 1,
    avgRating: '0/5',
    avgResponseTime: '0 giây',
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    createdAt: '28/08/2024 - 11:39:06',
    createdBy: 'AGENCY',
    updatedAt: '28/08/2024 - 11:39:06',
    updatedBy: 'AGENCY',
  },
  {
    id: 'pv-2',
    code: 'CAR-TBB',
    name: 'Carpla Service Tây Bắc Bộ',
    type: 'THIRD_PARTY',
    status: 'active',
    companyName: 'CÔNG TY TNHH DỊCH VỤ Ô TÔ CARPLA - CHI NHÁNH TÂY BẮC BỘ',
    taxCode: '0110938494',
    businessLicense: '0110938494-001',
    charterCapital: '5.000.000.000',
    address: 'Đường Nguyễn Tất Thành, Vĩnh Yên, Tỉnh Phú Thọ, Việt Nam',
    province: 'Tỉnh Vĩnh Phúc',
    district: 'Vĩnh Yên',
    ward: 'Phường Định Trung',
    specificAddress: 'Đường Nguyễn Tất Thành, Vĩnh Yên',
    serviceTypes: ['CAU_KEO', 'DAM_LAT', 'KICH_BINH', 'THAY_LOP'],
    contactName: 'Phan Thanh Phương',
    contactPhone: '0325932111',
    otherPhone: '0912345001',
    email: 'phuongpt@carpla.vn',
    contractNumber: 'HĐ-CAR-TBB-2024',
    contractSignedAt: '2024-03-15T09:00',
    contractStaff: 'Nguyễn Văn Cường',
    contractStaffId: '001234567890',
    stationCount: 3,
    userCount: 8,
    avgRating: '4.6/5',
    avgResponseTime: '8 phút',
    totalOrders: 412,
    completedOrders: 389,
    cancelledOrders: 12,
    createdAt: '12/03/2024 - 09:12:44',
    createdBy: 'cuongnv5',
    updatedAt: '08/09/2025 - 16:43:46',
    updatedBy: 'cuongnv5',
  },
  {
    id: 'pv-3',
    code: 'PT66718BAB',
    name: 'Garage Thăng Long',
    type: 'THIRD_PARTY',
    status: 'active',
    companyName: 'Công ty TNHH Garage Thăng Long',
    taxCode: '0108123456',
    businessLicense: '0108123456',
    charterCapital: '2.000.000.000',
    address: 'Phường Việt Hưng, Quận Long Biên, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'Phường Việt Hưng',
    specificAddress: 'Số 18, đường Việt Hưng',
    serviceTypes: ['CAU_KEO', 'THAY_LOP', 'SU_CO'],
    contactName: 'Lê Minh Tuấn',
    contactPhone: '0904123789',
    otherPhone: '',
    email: 'tuanlm@thanglong.vn',
    contractNumber: 'HĐ-GTL-2025',
    contractSignedAt: '2025-01-10T08:30',
    contractStaff: 'Trần Thị Hoa',
    contractStaffId: '001198765432',
    stationCount: 2,
    userCount: 5,
    avgRating: '4.2/5',
    avgResponseTime: '12 phút',
    totalOrders: 186,
    completedOrders: 171,
    cancelledOrders: 8,
    createdAt: '10/01/2025 - 08:30:11',
    createdBy: 'hoatt',
    updatedAt: '20/06/2026 - 14:02:18',
    updatedBy: 'hoatt',
  },
  {
    id: 'pv-4',
    code: 'CARPLA-HN',
    name: 'Carpla Service Hà Nội',
    type: 'INTERNAL',
    status: 'active',
    companyName: 'CARPLA - CARPLA SERVICE',
    taxCode: '0101234567',
    businessLicense: '0101234567',
    charterCapital: '20.000.000.000',
    address: 'Phường Nhân Chính, Quận Thanh Xuân, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Thanh Xuân',
    ward: 'Phường Nhân Chính',
    specificAddress: 'Tòa nhà Carpla, Nguyễn Trãi',
    serviceTypes: ['CAU_KEO', 'DAM_LAT', 'KICH_BINH', 'THAY_LOP', 'NHIEN_LIEU', 'THUY_KICH'],
    contactName: 'Lê Vũ Long',
    contactPhone: '1900998865',
    otherPhone: '0936499296',
    email: 'longlv@carpla.vn',
    contractNumber: 'HĐ-NỘI-BỘ-HN',
    contractSignedAt: '2023-01-02T08:00',
    contractStaff: 'Ban điều hành',
    contractStaffId: '',
    stationCount: 4,
    userCount: 22,
    avgRating: '4.8/5',
    avgResponseTime: '6 phút',
    totalOrders: 1280,
    completedOrders: 1211,
    cancelledOrders: 34,
    createdAt: '02/01/2023 - 08:00:00',
    createdBy: 'system',
    updatedAt: '15/08/2026 - 10:21:05',
    updatedBy: 'admin',
  },
  {
    id: 'pv-5',
    code: 'PT9F2C11AA',
    name: 'Điểm VETC Phường Long Biên 2',
    type: 'QUICK_SERVICE',
    status: 'inactive',
    companyName: 'Điểm VETC Phường Long Biên 2',
    taxCode: '036088009001',
    businessLicense: '',
    charterCapital: '',
    address: 'Phường Việt Hưng, Quận Long Biên, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'Phường Việt Hưng',
    specificAddress: 'Ngõ 12, đường Việt Hưng',
    serviceTypes: ['KICH_BINH', 'NHIEN_LIEU'],
    contactName: 'Nguyễn Thị Lan',
    contactPhone: '0978123456',
    otherPhone: '',
    email: 'lannt.qs@gmail.com',
    contractNumber: '',
    contractSignedAt: '',
    contractStaff: '',
    contractStaffId: '',
    stationCount: 1,
    userCount: 0,
    avgRating: '0/5',
    avgResponseTime: '0 giây',
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    createdAt: '04/11/2025 - 15:08:22',
    createdBy: 'AGENCY',
    updatedAt: '12/02/2026 - 09:44:10',
    updatedBy: 'AGENCY',
  },
  {
    id: 'pv-6',
    code: 'CH116-HN',
    name: 'Cứu hộ 116 Hà Nội',
    type: 'THIRD_PARTY',
    status: 'active',
    companyName: 'Công ty CP Cứu hộ 116',
    taxCode: '0109988776',
    businessLicense: '0109988776',
    charterCapital: '8.000.000.000',
    address: 'Phường Thanh Xuân Trung, Quận Thanh Xuân, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Thanh Xuân',
    ward: 'Phường Thanh Xuân Trung',
    specificAddress: '116 Nguyễn Trãi',
    serviceTypes: ['CAU_KEO', 'DAM_LAT', 'THUY_KICH'],
    contactName: 'Hoàng Đức Anh',
    contactPhone: '0911888116',
    otherPhone: '0243555116',
    email: 'contact@cuuho116.vn',
    contractNumber: 'HĐ-116-2024',
    contractSignedAt: '2024-06-01T10:00',
    contractStaff: 'Phạm Quốc Việt',
    contractStaffId: '001087654321',
    stationCount: 2,
    userCount: 11,
    avgRating: '4.4/5',
    avgResponseTime: '9 phút',
    totalOrders: 540,
    completedOrders: 501,
    cancelledOrders: 21,
    createdAt: '01/06/2024 - 10:00:00',
    createdBy: 'vietpq',
    updatedAt: '01/07/2026 - 11:18:33',
    updatedBy: 'vietpq',
  },
];

export const MOCK_RESCUE_STATIONS_ADMIN: RescueStationAdminRecord[] = [
  {
    id: 'st-1',
    code: 'CAR-HN-02',
    name: 'Carpla Service Vĩnh Phúc',
    providerId: 'pv-2',
    providerCode: 'CAR-TBB',
    providerName: 'CAR-TBB - Carpla Service Tây Bắc Bộ',
    status: 'active',
    stationCategory: 'GARAGE',
    address: 'Đường Nguyễn Tất Thành, Vĩnh Yên, Phường Vĩnh Phúc, Tỉnh Phú Thọ, Việt Nam',
    province: 'Tỉnh Vĩnh Phúc',
    district: 'Vĩnh Yên',
    ward: 'Phường Định Trung',
    specificAddress: 'Đường Nguyễn Tất Thành, Vĩnh Yên, Phường Vĩnh Phúc, Tỉnh Phú Thọ, Việt Nam',
    longitude: '105.592914',
    latitude: '21.319819',
    contactName: 'Phan Thanh Phương',
    contactPhone: '0325932111',
    otherPhone: '',
    email: '',
    contacts: [
      { id: 'st-1-c1', name: 'Phan Thanh Phương', phone: '0325932111', otherPhone: '', email: 'phuongpt@carpla.vn' },
      { id: 'st-1-c2', name: 'Trần Quốc Huy', phone: '0988112233', otherPhone: '02113888999', email: 'huytq@carpla.vn' },
    ],
    bankAccount: '1026084300',
    accountName: 'CONG TY TNHH DICH VU O TO CARPLA - CHI NHANH TAY BAC BO',
    bankName: 'Tại Ngân hàng SHB - CN Thăng Long',
    taxCode: '0110938494-006',
    capacity: 1,
    services: ['CAU_KEO', 'DAM_LAT', 'KICH_BINH', 'THAY_LOP'],
    vehicleTypes: ['WRECKER', 'TOW_TRUCK', 'FLATBED_TRUCK'],
    userCount: 5,
    operatingAreas: [],
    createdAt: '08/09/2025 - 16:43:46',
    createdBy: 'cuongnv5',
    updatedAt: '08/09/2025 - 16:43:46',
    updatedBy: 'cuongnv5',
  },
  {
    id: 'st-2',
    code: 'PT3ACE6E0D_01',
    name: 'Điểm VETC Phường Dương Nội 5',
    providerId: 'pv-1',
    providerCode: 'PT3ACE6E0D',
    providerName: 'PT3ACE6E0D - Điểm VETC Phường Dương Nội 5',
    status: 'active',
    stationCategory: 'STORE',
    address: 'Đường Dương Nội, Phường Dương Nội, Hà Nội, Việt Nam',
    province: 'Hà Nội',
    district: 'Không Quận Huyện',
    ward: 'Phường Dương Nội',
    specificAddress: 'Đường Dương Nội, Phường Dương Nội',
    longitude: '105.745210',
    latitude: '20.980112',
    contactName: 'Đặng VĂN QUÂN',
    contactPhone: '0982620261',
    otherPhone: '',
    email: 'mrquan.auto@gmail.com',
    bankAccount: '',
    accountName: '',
    bankName: '',
    taxCode: '036088008244',
    capacity: 3,
    services: ['KICH_BINH', 'THAY_LOP', 'NHIEN_LIEU'],
    vehicleTypes: [],
    userCount: 1,
    operatingAreas: [
      { id: 'oa-1', province: 'Hà Nội', district: 'Không Quận Huyện', ward: 'Phường Dương Nội' },
      { id: 'oa-2', province: 'Hà Nội', district: 'Không Quận Huyện', ward: 'Phường Hà Đông' },
    ],
    createdAt: '28/08/2024 - 11:39:06',
    createdBy: 'AGENCY',
    updatedAt: '28/08/2024 - 11:39:06',
    updatedBy: 'AGENCY',
  },
  {
    id: 'st-3',
    code: 'PT66718BAB_1154',
    name: 'Garage Thăng Long - Long Biên',
    providerId: 'pv-3',
    providerCode: 'PT66718BAB',
    providerName: 'PT66718BAB - Garage Thăng Long',
    status: 'active',
    stationCategory: 'GARAGE',
    address: 'Số 18, đường Việt Hưng, Phường Việt Hưng, Quận Long Biên, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'Phường Việt Hưng',
    specificAddress: 'Số 18, đường Việt Hưng',
    longitude: '105.901200',
    latitude: '21.045800',
    contactName: 'Lê Minh Tuấn',
    contactPhone: '0904123789',
    otherPhone: '',
    email: 'tuanlm@thanglong.vn',
    bankAccount: '1234567890',
    accountName: 'CONG TY TNHH GARAGE THANG LONG',
    bankName: 'Vietcombank - CN Long Biên',
    taxCode: '0108123456',
    capacity: 2,
    services: ['CAU_KEO', 'THAY_LOP', 'SU_CO'],
    vehicleTypes: ['TOW_TRUCK', 'FLATBED_TRUCK'],
    userCount: 3,
    operatingAreas: [
      { id: 'oa-3', province: 'Hà Nội', district: 'Quận Long Biên', ward: 'Phường Việt Hưng' },
      { id: 'oa-4', province: 'Hà Nội', district: 'Quận Long Biên', ward: 'Phường Bồ Đề' },
    ],
    createdAt: '10/01/2025 - 08:40:00',
    createdBy: 'hoatt',
    updatedAt: '20/06/2026 - 14:02:18',
    updatedBy: 'hoatt',
  },
  {
    id: 'st-4',
    code: 'CAR-HN-01',
    name: 'Carpla Service - CN Hà Nội',
    providerId: 'pv-4',
    providerCode: 'CARPLA-HN',
    providerName: 'CARPLA-HN - Carpla Service Hà Nội',
    status: 'active',
    stationCategory: 'GARAGE',
    address: 'Phường Nhân Chính, Quận Thanh Xuân, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Thanh Xuân',
    ward: 'Phường Nhân Chính',
    specificAddress: 'Tòa nhà Carpla, Nguyễn Trãi',
    longitude: '105.809100',
    latitude: '21.001400',
    contactName: 'Lê Vũ Long',
    contactPhone: '1900998865',
    otherPhone: '0936499296',
    email: 'hanoi@carpla.vn',
    contacts: [
      { id: 'st-4-c1', name: 'Lê Vũ Long', phone: '1900998865', otherPhone: '0936499296', email: 'hanoi@carpla.vn' },
      { id: 'st-4-c2', name: 'Mr. Hoàn', phone: '0936499296', otherPhone: '', email: 'hoanmv@carpla.vn' },
    ],
    bankAccount: '001100112233',
    accountName: 'CARPLA SERVICE HA NOI',
    bankName: 'Vietcombank - CN Hà Nội',
    taxCode: '0101234567-001',
    capacity: 8,
    services: ['CAU_KEO', 'DAM_LAT', 'KICH_BINH', 'THAY_LOP', 'NHIEN_LIEU', 'THUY_KICH'],
    vehicleTypes: ['WRECKER', 'TOW_TRUCK', 'FLATBED_TRUCK', 'HEAVY_WRECKER'],
    userCount: 12,
    operatingAreas: [
      { id: 'oa-5', province: 'Hà Nội', district: 'Quận Thanh Xuân', ward: 'Phường Nhân Chính' },
      { id: 'oa-6', province: 'Hà Nội', district: 'Quận Thanh Xuân', ward: 'Phường Thanh Xuân Trung' },
      { id: 'oa-7', province: 'Hà Nội', district: 'Quận Long Biên', ward: 'Phường Việt Hưng' },
    ],
    createdAt: '02/01/2023 - 08:15:00',
    createdBy: 'system',
    updatedAt: '15/08/2026 - 10:21:05',
    updatedBy: 'admin',
  },
  {
    id: 'st-5',
    code: 'CH116-HN-01',
    name: 'Trạm cứu hộ 116 Thanh Xuân',
    providerId: 'pv-6',
    providerCode: 'CH116-HN',
    providerName: 'CH116-HN - Cứu hộ 116 Hà Nội',
    status: 'active',
    stationCategory: 'MOBILE',
    address: '116 Nguyễn Trãi, Phường Thanh Xuân Trung, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Thanh Xuân',
    ward: 'Phường Thanh Xuân Trung',
    specificAddress: '116 Nguyễn Trãi',
    longitude: '105.815400',
    latitude: '20.995200',
    contactName: 'Hoàng Đức Anh',
    contactPhone: '0911888116',
    otherPhone: '0243555116',
    email: 'thanxuan@cuuho116.vn',
    bankAccount: '116000116000',
    accountName: 'CONG TY CP CUU HO 116',
    bankName: 'MB Bank - CN Thanh Xuân',
    taxCode: '0109988776-001',
    capacity: 5,
    services: ['CAU_KEO', 'DAM_LAT', 'THUY_KICH'],
    vehicleTypes: ['WRECKER', 'TOW_TRUCK', 'HEAVY_WRECKER'],
    userCount: 7,
    operatingAreas: [
      { id: 'oa-8', province: 'Hà Nội', district: 'Quận Thanh Xuân', ward: 'Phường Thanh Xuân Trung' },
    ],
    createdAt: '01/06/2024 - 10:20:00',
    createdBy: 'vietpq',
    updatedAt: '01/07/2026 - 11:18:33',
    updatedBy: 'vietpq',
  },
  {
    id: 'st-6',
    code: 'PT9F2C11AA_01',
    name: 'Điểm VETC Phường Long Biên 2',
    providerId: 'pv-5',
    providerCode: 'PT9F2C11AA',
    providerName: 'PT9F2C11AA - Điểm VETC Phường Long Biên 2',
    status: 'inactive',
    stationCategory: 'STORE',
    address: 'Ngõ 12, đường Việt Hưng, Quận Long Biên, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'Phường Việt Hưng',
    specificAddress: 'Ngõ 12, đường Việt Hưng',
    longitude: '105.898800',
    latitude: '21.043100',
    contactName: 'Nguyễn Thị Lan',
    contactPhone: '0978123456',
    otherPhone: '',
    email: 'lannt.qs@gmail.com',
    bankAccount: '',
    accountName: '',
    bankName: '',
    taxCode: '036088009001',
    capacity: 1,
    services: ['KICH_BINH', 'NHIEN_LIEU'],
    vehicleTypes: [],
    userCount: 0,
    operatingAreas: [],
    createdAt: '04/11/2025 - 15:08:22',
    createdBy: 'AGENCY',
    updatedAt: '12/02/2026 - 09:44:10',
    updatedBy: 'AGENCY',
  },
  {
    id: 'st-7',
    code: 'CAR-TBB-03',
    name: 'Carpla Service Phúc Yên',
    providerId: 'pv-2',
    providerCode: 'CAR-TBB',
    providerName: 'CAR-TBB - Carpla Service Tây Bắc Bộ',
    status: 'active',
    stationCategory: 'MOBILE',
    address: 'Phường Phúc Thắng, Phúc Yên, Tỉnh Vĩnh Phúc',
    province: 'Tỉnh Vĩnh Phúc',
    district: 'Phúc Yên',
    ward: 'Phường Phúc Thắng',
    specificAddress: 'Km 5, quốc lộ 2',
    longitude: '105.704100',
    latitude: '21.237800',
    contactName: 'Trần Quốc Huy',
    contactPhone: '0988112233',
    otherPhone: '',
    email: 'huytq@carpla.vn',
    bankAccount: '1026084301',
    accountName: 'CONG TY TNHH DICH VU O TO CARPLA - CHI NHANH TAY BAC BO',
    bankName: 'SHB - CN Thăng Long',
    taxCode: '0110938494-007',
    capacity: 2,
    services: ['CAU_KEO', 'KICH_BINH'],
    vehicleTypes: ['TOW_TRUCK', 'FLATBED_TRUCK'],
    userCount: 2,
    operatingAreas: [
      { id: 'oa-9', province: 'Tỉnh Vĩnh Phúc', district: 'Phúc Yên', ward: 'Phường Phúc Thắng' },
    ],
    createdAt: '18/11/2025 - 09:05:12',
    createdBy: 'cuongnv5',
    updatedAt: '03/04/2026 - 13:22:40',
    updatedBy: 'cuongnv5',
  },
  {
    id: 'st-8',
    code: 'PT66718BAB_02',
    name: 'Garage Thăng Long - Bồ Đề',
    providerId: 'pv-3',
    providerCode: 'PT66718BAB',
    providerName: 'PT66718BAB - Garage Thăng Long',
    status: 'active',
    stationCategory: 'GARAGE',
    address: 'Phường Bồ Đề, Quận Long Biên, Hà Nội',
    province: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'Phường Bồ Đề',
    specificAddress: 'Số 5, đường Bồ Đề',
    longitude: '105.871900',
    latitude: '21.038600',
    contactName: 'Ngô Văn Nam',
    contactPhone: '0909888777',
    otherPhone: '',
    email: '',
    bankAccount: '1234567891',
    accountName: 'CONG TY TNHH GARAGE THANG LONG',
    bankName: 'Vietcombank - CN Long Biên',
    taxCode: '0108123456-002',
    capacity: 1,
    services: ['CAU_KEO', 'THAY_LOP'],
    vehicleTypes: ['TOW_TRUCK'],
    userCount: 2,
    operatingAreas: [],
    createdAt: '22/03/2025 - 11:11:11',
    createdBy: 'hoatt',
    updatedAt: '22/03/2025 - 11:11:11',
    updatedBy: 'hoatt',
  },
];

export const getProviderById = (id: string): RescueProviderRecord | undefined =>
  MOCK_RESCUE_PROVIDERS.find((p) => p.id === id);

export const getStationById = (id: string): RescueStationAdminRecord | undefined =>
  MOCK_RESCUE_STATIONS_ADMIN.find((s) => s.id === id);

export const getStationsByProviderId = (providerId: string): RescueStationAdminRecord[] =>
  MOCK_RESCUE_STATIONS_ADMIN.filter((s) => s.providerId === providerId);

export const providerDisplayName = (p: Pick<RescueProviderRecord, 'code' | 'name'>): string =>
  `${p.code} - ${p.name}`;

export type StationVehicleStatus = 'active' | 'repair' | 'idle';

export interface StationRescueVehicle {
  id: string;
  stationId: string;
  plate: string;
  type: string;
  brand: string;
  model: string;
  chassis: string;
  maxRescueLoad: string;
  driverName: string;
  status: StationVehicleStatus;
}

export const STATION_VEHICLE_STATUS_LABEL: Record<StationVehicleStatus, string> = {
  active: 'Hoạt động',
  repair: 'Đang sửa chữa',
  idle: 'Nhàn rỗi',
};

export const STATION_VEHICLE_STATUS_OPTIONS: { value: StationVehicleStatus; label: string }[] = (
  Object.keys(STATION_VEHICLE_STATUS_LABEL) as StationVehicleStatus[]
).map((value) => ({ value, label: STATION_VEHICLE_STATUS_LABEL[value] }));

export const MOCK_STATION_RESCUE_VEHICLES: StationRescueVehicle[] = [
  { id: 'sv-1', stationId: 'st-1', plate: '88C-123.45', type: 'WRECKER', brand: 'Isuzu', model: 'NPR 400', chassis: 'JALC4B16X07001234', maxRescueLoad: '8 tấn', driverName: 'Trần Quốc Huy', status: 'active' },
  { id: 'sv-2', stationId: 'st-1', plate: '88C-678.90', type: 'TOW_TRUCK', brand: 'Hino', model: 'XZU 720', chassis: 'JHHFC2J5XK0002211', maxRescueLoad: '5 tấn', driverName: 'Phan Thanh Phương', status: 'active' },
  { id: 'sv-3', stationId: 'st-1', plate: '88C-246.80', type: 'FLATBED_TRUCK', brand: 'Dongfeng', model: 'Captain C', chassis: 'LGAX4B123D0003311', maxRescueLoad: '3.5 tấn', driverName: '—', status: 'idle' },
  { id: 'sv-4', stationId: 'st-3', plate: '29C-555.12', type: 'TOW_TRUCK', brand: 'Isuzu', model: 'NQR 75', chassis: 'JALC4B16X07004411', maxRescueLoad: '5 tấn', driverName: 'Lê Minh Tuấn', status: 'active' },
  { id: 'sv-5', stationId: 'st-3', plate: '29C-555.13', type: 'FLATBED_TRUCK', brand: 'Hino', model: 'XZU 650', chassis: 'JHHFC2J5XK0005511', maxRescueLoad: '3.5 tấn', driverName: 'Ngô Văn Nam', status: 'repair' },
  { id: 'sv-6', stationId: 'st-4', plate: '29C-123.45', type: 'WRECKER', brand: 'Isuzu', model: 'NPR 400', chassis: 'JALC4B16X07001234', maxRescueLoad: '8 tấn', driverName: 'Ngô Đức Anh', status: 'active' },
  { id: 'sv-7', stationId: 'st-4', plate: '29C-678.90', type: 'FLATBED_TRUCK', brand: 'Hino', model: 'XZU 720', chassis: 'JHHFC2J5XK0002211', maxRescueLoad: '3.5 tấn', driverName: 'Bùi Văn Tâm', status: 'active' },
  { id: 'sv-8', stationId: 'st-4', plate: '30F-111.22', type: 'HEAVY_WRECKER', brand: 'Dongfeng', model: 'Captain C', chassis: 'LGAX4B123D0003311', maxRescueLoad: '15 tấn', driverName: 'Hoàng Gia Bảo', status: 'repair' },
  { id: 'sv-9', stationId: 'st-4', plate: '29C-901.33', type: 'TOW_TRUCK', brand: 'Isuzu', model: 'FRR 90', chassis: 'JALC4B16X07009901', maxRescueLoad: '5 tấn', driverName: '—', status: 'idle' },
  { id: 'sv-10', stationId: 'st-5', plate: '30F-116.01', type: 'WRECKER', brand: 'Hino', model: '500 Series', chassis: 'JHHFC2J5XK0008802', maxRescueLoad: '8 tấn', driverName: 'Hoàng Đức Anh', status: 'active' },
  { id: 'sv-11', stationId: 'st-5', plate: '30F-116.02', type: 'TOW_TRUCK', brand: 'Isuzu', model: 'FRR 90', chassis: 'JALC4B16X07008811', maxRescueLoad: '5 tấn', driverName: '—', status: 'active' },
  { id: 'sv-12', stationId: 'st-7', plate: '88C-301.11', type: 'TOW_TRUCK', brand: 'Hino', model: 'XZU 650', chassis: 'JHHFC2J5XK0006611', maxRescueLoad: '5 tấn', driverName: 'Trần Quốc Huy', status: 'active' },
  { id: 'sv-13', stationId: 'st-8', plate: '29C-802.22', type: 'TOW_TRUCK', brand: 'Isuzu', model: 'NQR 75', chassis: 'JALC4B16X07007722', maxRescueLoad: '5 tấn', driverName: 'Ngô Văn Nam', status: 'active' },
];

export const getVehiclesByStationId = (stationId: string): StationRescueVehicle[] =>
  MOCK_STATION_RESCUE_VEHICLES.filter((v) => v.stationId === stationId);

export type StationStaffRole = 'MANAGER' | 'DISPATCHER' | 'RESCUE' | 'ACCOUNTANT';

export const STATION_STAFF_ROLE_LABEL: Record<StationStaffRole, string> = {
  MANAGER: 'Quản lý trạm',
  DISPATCHER: 'Điều phối',
  RESCUE: 'Nhân viên cứu hộ',
  ACCOUNTANT: 'Kế toán',
};

export const STATION_STAFF_ROLE_OPTIONS: { value: StationStaffRole; label: string }[] = (
  Object.keys(STATION_STAFF_ROLE_LABEL) as StationStaffRole[]
).map((value) => ({ value, label: STATION_STAFF_ROLE_LABEL[value] }));

export interface StationStaffRecord {
  id: string;
  stationId: string;
  code: string;
  fullname: string;
  phone: string;
  role: StationStaffRole;
  status: PartnerStatus;
  hasAccount: boolean;
  accountLocked: boolean;
}

export const MOCK_STATION_STAFF: StationStaffRecord[] = [
  { id: 'ss-1-1', stationId: 'st-1', code: 'NV-0001', fullname: 'Phan Thanh Phương', phone: '0325932111', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-1-2', stationId: 'st-1', code: 'NV-0002', fullname: 'Trần Quốc Huy', phone: '0988112233', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-1-3', stationId: 'st-1', code: 'NV-0003', fullname: 'Lê Minh Tuấn', phone: '0912345678', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-1-4', stationId: 'st-1', code: 'NV-0004', fullname: 'Ngô Văn Nam', phone: '0987654321', role: 'DISPATCHER', status: 'active', hasAccount: false, accountLocked: false },
  { id: 'ss-1-5', stationId: 'st-1', code: 'NV-0005', fullname: 'Vũ Thị Hoa', phone: '0908123456', role: 'ACCOUNTANT', status: 'inactive', hasAccount: true, accountLocked: true },
  { id: 'ss-2-1', stationId: 'st-2', code: 'NV-0101', fullname: 'Đặng Văn Quân', phone: '0982620261', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-3-1', stationId: 'st-3', code: 'NV-0201', fullname: 'Lê Minh Tuấn', phone: '0911223344', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-3-2', stationId: 'st-3', code: 'NV-0202', fullname: 'Ngô Văn Nam', phone: '0922334455', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-3-3', stationId: 'st-3', code: 'NV-0203', fullname: 'Phạm Thị Lan', phone: '0933445566', role: 'DISPATCHER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-4-1', stationId: 'st-4', code: 'NV-0301', fullname: 'Lê Vũ Long', phone: '1900998865', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-4-2', stationId: 'st-4', code: 'NV-0302', fullname: 'Mr. Hoàn', phone: '0936499296', role: 'DISPATCHER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-4-3', stationId: 'st-4', code: 'NV-0303', fullname: 'Ngô Đức Anh', phone: '0906666666', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-4-4', stationId: 'st-4', code: 'NV-0304', fullname: 'Bùi Văn Tâm', phone: '0907777777', role: 'RESCUE', status: 'active', hasAccount: false, accountLocked: false },
  { id: 'ss-4-5', stationId: 'st-4', code: 'NV-0305', fullname: 'Hoàng Gia Bảo', phone: '0909999999', role: 'RESCUE', status: 'inactive', hasAccount: true, accountLocked: true },
  { id: 'ss-4-6', stationId: 'st-4', code: 'NV-0306', fullname: 'Mai Thị Lan', phone: '0910101010', role: 'ACCOUNTANT', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-5-1', stationId: 'st-5', code: 'NV-0401', fullname: 'Hoàng Đức Anh', phone: '0911221100', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-5-2', stationId: 'st-5', code: 'NV-0402', fullname: 'Nguyễn Văn Khoa', phone: '0911332200', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-7-1', stationId: 'st-7', code: 'NV-0501', fullname: 'Trần Quốc Huy', phone: '0988112233', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-7-2', stationId: 'st-7', code: 'NV-0502', fullname: 'Phan Thanh Phương', phone: '0325932111', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-8-1', stationId: 'st-8', code: 'NV-0601', fullname: 'Ngô Văn Nam', phone: '0987654321', role: 'RESCUE', status: 'active', hasAccount: true, accountLocked: false },
  { id: 'ss-8-2', stationId: 'st-8', code: 'NV-0602', fullname: 'Lê Minh Tuấn', phone: '0912345678', role: 'MANAGER', status: 'active', hasAccount: true, accountLocked: false },
];

export const getStaffByStationId = (stationId: string): StationStaffRecord[] =>
  MOCK_STATION_STAFF.filter((s) => s.stationId === stationId);
