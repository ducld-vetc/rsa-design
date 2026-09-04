import {
  MOCK_CORPORATE_CUSTOMERS,
  MOCK_RESCUE_SERVICES,
  getCorporateCustomerById,
  type PartnerStatus,
  type RescueServiceRecord,
} from './rescueServiceMockData';

export type PackageType = 'ALWAYS' | 'TRIP';
export type TargetCustomer = 'INDIVIDUAL' | 'BUSINESS' | 'MERCHANT';
export type SponsorType = 'RATE' | 'FIXED';
export type CorporateRole = 'CHANNEL' | 'SPONSOR' | 'CUSTOMER' | 'PARTNERSHIP';
export type CorporateFeeType = 'INCIDENTAL' | 'PERIODIC';

export const PACKAGE_TYPE_LABEL: Record<PackageType, string> = {
  ALWAYS: 'Gói kỳ hạn (ALWAYS)',
  TRIP: 'Bảo hiểm chuyến đi (TRIP)',
};

export const PACKAGE_TYPE_OPTIONS: { value: PackageType; label: string }[] = [
  { value: 'ALWAYS', label: PACKAGE_TYPE_LABEL.ALWAYS },
  { value: 'TRIP', label: PACKAGE_TYPE_LABEL.TRIP },
];

export const TARGET_CUSTOMER_LABEL: Record<TargetCustomer, string> = {
  INDIVIDUAL: 'Cá nhân',
  BUSINESS: 'Doanh nghiệp',
  MERCHANT: 'Merchant',
};

export const TARGET_CUSTOMER_OPTIONS: { value: TargetCustomer; label: string }[] = [
  { value: 'INDIVIDUAL', label: TARGET_CUSTOMER_LABEL.INDIVIDUAL },
  { value: 'BUSINESS', label: TARGET_CUSTOMER_LABEL.BUSINESS },
  { value: 'MERCHANT', label: TARGET_CUSTOMER_LABEL.MERCHANT },
];

export const SPONSOR_TYPE_LABEL: Record<SponsorType, string> = {
  RATE: 'Theo % (RATE)',
  FIXED: 'Số tiền cố định (FIXED)',
};

export const SPONSOR_TYPE_OPTIONS: { value: SponsorType; label: string }[] = [
  { value: 'RATE', label: SPONSOR_TYPE_LABEL.RATE },
  { value: 'FIXED', label: SPONSOR_TYPE_LABEL.FIXED },
];

export const CORPORATE_ROLE_LABEL: Record<CorporateRole, string> = {
  CHANNEL: 'Kênh bán',
  SPONSOR: 'Đơn vị trả chi phí cứu hộ',
  CUSTOMER: 'KH doanh nghiệp (fleet)',
  PARTNERSHIP: 'Hợp tác',
};

export const CORPORATE_ROLE_OPTIONS: { value: CorporateRole; label: string }[] = [
  { value: 'CHANNEL', label: `${CORPORATE_ROLE_LABEL.CHANNEL} (CHANNEL)` },
  { value: 'SPONSOR', label: `${CORPORATE_ROLE_LABEL.SPONSOR} (SPONSOR)` },
  { value: 'CUSTOMER', label: `${CORPORATE_ROLE_LABEL.CUSTOMER} (CUSTOMER)` },
  { value: 'PARTNERSHIP', label: `${CORPORATE_ROLE_LABEL.PARTNERSHIP} (PARTNERSHIP)` },
];

export const CORPORATE_FEE_TYPE_LABEL: Record<CorporateFeeType, string> = {
  INCIDENTAL: 'Phát sinh (mỗi lần kích hoạt)',
  PERIODIC: 'Theo kỳ gói (duration)',
};

export const CORPORATE_FEE_TYPE_OPTIONS: { value: CorporateFeeType; label: string }[] = [
  { value: 'INCIDENTAL', label: CORPORATE_FEE_TYPE_LABEL.INCIDENTAL },
  { value: 'PERIODIC', label: CORPORATE_FEE_TYPE_LABEL.PERIODIC },
];

export interface PackageServiceLine {
  id: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  unit: string;
  quotaLimit: number | null;
  quantity: number | null;
  status: boolean;
}

export interface CorporatePackageLine {
  id: string;
  corporateCustomerId: number;
  corporateCustomerCode: string;
  corporateCustomerName: string;
  role: CorporateRole;
  feeType: CorporateFeeType;
  status: boolean;
}

export interface RescuePackageRecord {
  id: number;
  packageCode: string;
  name: string;
  description: string;
  targetCustomer: TargetCustomer;
  price: number;
  vat: number | null;
  durationValue: number | null;
  prefixPurchaseCode: string;
  isGift: boolean;
  status: PartnerStatus;
  packageType: PackageType;
  sponsorType: SponsorType | '';
  sponsorValue: number | null;
  maxSponsorAmount: number | null;
  services: PackageServiceLine[];
  corporates: CorporatePackageLine[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

const svc = (id: number): RescueServiceRecord | undefined => MOCK_RESCUE_SERVICES.find((s) => s.id === id);

const ps = (
  lineId: string,
  serviceId: number,
  quotaLimit: number | null,
  quantity: number | null = null,
  status = true,
): PackageServiceLine => {
  const s = svc(serviceId);
  return {
    id: lineId,
    serviceId,
    serviceCode: s?.serviceCode ?? String(serviceId),
    serviceName: s?.name ?? '',
    unit: s?.unit ?? '',
    quotaLimit,
    quantity,
    status,
  };
};

const cp = (
  lineId: string,
  corporateCustomerId: number,
  role: CorporateRole,
  feeType: CorporateFeeType,
  status = true,
): CorporatePackageLine => {
  const c = getCorporateCustomerById(corporateCustomerId);
  return {
    id: lineId,
    corporateCustomerId,
    corporateCustomerCode: c?.code ?? '',
    corporateCustomerName: c?.name ?? '',
    role,
    feeType,
    status,
  };
};

export const MOCK_RESCUE_PACKAGES: RescuePackageRecord[] = [
  {
    id: 26,
    packageCode: 'RSA_BASIC',
    name: 'Cứu hộ RSA Cơ bản',
    description: 'Gói dịch vụ dành cho xe cá nhân',
    targetCustomer: 'INDIVIDUAL',
    price: 200000,
    vat: 8,
    durationValue: 12,
    prefixPurchaseCode: 'RS2',
    isGift: false,
    status: 'active',
    packageType: 'ALWAYS',
    sponsorType: '',
    sponsorValue: null,
    maxSponsorAmount: null,
    services: [
      ps('ps-26-2', 2, null),
      ps('ps-26-3', 3, null),
      ps('ps-26-5', 5, null),
      ps('ps-26-1', 1, 100),
      ps('ps-26-4', 4, 100),
      ps('ps-26-7', 7, 100),
      ps('ps-26-8', 8, 100),
      ps('ps-26-6', 6, 100),
    ],
    corporates: [],
    createdAt: '10/08/2025 09:00:00',
    createdBy: 'system',
    updatedAt: '21/08/2025 15:00:00',
    updatedBy: 'rsa_admin',
  },
  {
    id: 27,
    packageCode: 'RSA_ADVANCED',
    name: 'Cứu hộ RSA Nâng cao',
    description: 'Gói nâng cao — hạn mức nhiên liệu 5 lít',
    targetCustomer: 'INDIVIDUAL',
    price: 299000,
    vat: 8,
    durationValue: 12,
    prefixPurchaseCode: 'RS3',
    isGift: false,
    status: 'active',
    packageType: 'ALWAYS',
    sponsorType: '',
    sponsorValue: null,
    maxSponsorAmount: null,
    services: [
      ps('ps-27-3', 3, 5),
      ps('ps-27-2', 2, null),
      ps('ps-27-5', 5, null),
      ps('ps-27-1', 1, 100),
      ps('ps-27-4', 4, 100),
      ps('ps-27-7', 7, null),
      ps('ps-27-8', 8, 100),
      ps('ps-27-6', 6, null),
    ],
    corporates: [cp('cp-27-1', 20, 'CUSTOMER', 'PERIODIC')],
    createdAt: '10/08/2025 09:10:00',
    createdBy: 'system',
    updatedAt: '04/09/2026 10:00:00',
    updatedBy: 'rsa_admin',
  },
  {
    id: 17,
    packageCode: 'INSURANCE_12',
    name: 'Gói cứu hộ bảo hiểm 12 tháng',
    description: 'Gói cứu hộ bảo hiểm 12 tháng',
    targetCustomer: 'INDIVIDUAL',
    price: 299000,
    vat: 8,
    durationValue: 12,
    prefixPurchaseCode: 'RS4VCX',
    isGift: false,
    status: 'active',
    packageType: 'ALWAYS',
    sponsorType: '',
    sponsorValue: null,
    maxSponsorAmount: null,
    services: [
      ps('ps-17-2', 2, 1, 1),
      ps('ps-17-5', 5, 3, 3),
      ps('ps-17-1', 1, 100, 1),
    ],
    corporates: [cp('cp-17-1', 15, 'PARTNERSHIP', 'PERIODIC')],
    createdAt: '20/08/2025 11:00:00',
    createdBy: 'rsa_admin',
    updatedAt: '20/08/2025 11:00:00',
    updatedBy: 'rsa_admin',
  },
  {
    id: 101,
    packageCode: 'BH_CHUYEN_DI',
    name: 'Bảo hiểm chuyến đi DIG + CHUBB',
    description: 'Gói TRIP — đăng ký rồi kích hoạt mỗi lần qua trạm. DIG bán, CHUBB trả cứu hộ.',
    targetCustomer: 'INDIVIDUAL',
    price: 0,
    vat: 8,
    durationValue: 1,
    prefixPurchaseCode: 'TRIP',
    isGift: false,
    status: 'active',
    packageType: 'TRIP',
    sponsorType: 'RATE',
    sponsorValue: 100,
    maxSponsorAmount: 2000000,
    services: [
      ps('ps-101-2', 2, null),
      ps('ps-101-5', 5, 1),
      ps('ps-101-1', 1, 50),
      ps('ps-101-7', 7, 1),
    ],
    corporates: [
      cp('cp-101-1', 16, 'CHANNEL', 'INCIDENTAL'),
      cp('cp-101-2', 99, 'SPONSOR', 'PERIODIC'),
    ],
    createdAt: '04/09/2026 09:00:00',
    createdBy: 'rsa_admin',
    updatedAt: '04/09/2026 09:00:00',
    updatedBy: 'rsa_admin',
  },
  {
    id: 4,
    packageCode: 'PKG_PLX_001',
    name: 'Gói dịch vụ dành cho Petrolimex',
    description: 'Gói cứu hộ 11 tháng',
    targetCustomer: 'MERCHANT',
    price: 1500000,
    vat: null,
    durationValue: 11,
    prefixPurchaseCode: 'RSA3',
    isGift: false,
    status: 'active',
    packageType: 'ALWAYS',
    sponsorType: '',
    sponsorValue: null,
    maxSponsorAmount: null,
    services: [ps('ps-4-8', 8, 100, 1)],
    corporates: [cp('cp-4-1', 2, 'CHANNEL', 'PERIODIC')],
    createdAt: '15/01/2025 08:00:00',
    createdBy: 'system',
    updatedAt: '02/02/2026 09:00:00',
    updatedBy: 'rsa_test1',
  },
];

export const formatVnd = (n: number | null | undefined): string => {
  if (n == null || Number.isNaN(n)) return '—';
  return `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;
};

export const getPackageById = (id: number | string): RescuePackageRecord | undefined => {
  const n = typeof id === 'number' ? id : Number(id);
  if (Number.isNaN(n)) return undefined;
  return MOCK_RESCUE_PACKAGES.find((p) => p.id === n);
};

export const catalogServiceOptions = (): { value: string; label: string; unit: string }[] =>
  MOCK_RESCUE_SERVICES.map((s) => ({
    value: String(s.id),
    label: `${s.serviceCode} — ${s.name}`,
    unit: s.unit,
  }));

export const corporateOptions = () =>
  MOCK_CORPORATE_CUSTOMERS.map((c) => ({ value: String(c.id), label: `${c.code} — ${c.name}` }));

const adminNowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const snapshotServices = (lines: PackageServiceLine[]): PackageServiceLine[] =>
  lines.map((line) => {
    const s = svc(line.serviceId);
    return {
      ...line,
      serviceCode: s?.serviceCode ?? line.serviceCode,
      serviceName: s?.name ?? line.serviceName,
      unit: s?.unit ?? line.unit,
    };
  });

const snapshotCorporates = (lines: CorporatePackageLine[]): CorporatePackageLine[] =>
  lines.map((line) => {
    const c = getCorporateCustomerById(line.corporateCustomerId);
    return {
      ...line,
      corporateCustomerCode: c?.code ?? '',
      corporateCustomerName: c?.name ?? '',
    };
  });

export type RescuePackageFormPayload = Omit<
  RescuePackageRecord,
  'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
>;

export const isPackageCodeTaken = (code: string, excludeId?: number): boolean => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  return MOCK_RESCUE_PACKAGES.some(
    (p) => p.packageCode.trim().toUpperCase() === normalized && p.id !== excludeId,
  );
};

export const createMockPackage = (payload: RescuePackageFormPayload): RescuePackageRecord => {
  const stamp = adminNowStamp();
  const nextId = Math.max(0, ...MOCK_RESCUE_PACKAGES.map((p) => p.id)) + 1;
  const row: RescuePackageRecord = {
    ...payload,
    services: snapshotServices(payload.services),
    corporates: snapshotCorporates(payload.corporates),
    id: nextId,
    packageCode: payload.packageCode.trim(),
    name: payload.name.trim(),
    createdAt: stamp,
    createdBy: 'rsa_test1',
    updatedAt: stamp,
    updatedBy: 'rsa_test1',
  };
  MOCK_RESCUE_PACKAGES.unshift(row);
  return row;
};

export const updateMockPackage = (
  id: number,
  payload: RescuePackageFormPayload,
): RescuePackageRecord | undefined => {
  const idx = MOCK_RESCUE_PACKAGES.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  const prev = MOCK_RESCUE_PACKAGES[idx];
  const next: RescuePackageRecord = {
    ...prev,
    ...payload,
    services: snapshotServices(payload.services),
    corporates: snapshotCorporates(payload.corporates),
    id: prev.id,
    packageCode: payload.packageCode.trim(),
    name: payload.name.trim(),
    createdAt: prev.createdAt,
    createdBy: prev.createdBy,
    updatedAt: adminNowStamp(),
    updatedBy: 'rsa_test1',
  };
  MOCK_RESCUE_PACKAGES[idx] = next;
  return next;
};
