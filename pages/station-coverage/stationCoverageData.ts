import { DB_STATIONS, type DbStationRow } from './stationCoverageFromDb';
import { INTERNAL_VEHICLE_STATIONS } from './stationCoverageInternalVehicles';
import { STATION_ADMIN_OVERRIDES } from './stationAdminOverrides';
import { PARTNER_SIGNING_DATES } from './partnerSigningDates';
import {
  ADDRESS_SCHEMA_OPTIONS,
  AREA_PROVINCES,
  NEW_PROVINCE_CODES,
  OLD_NON_PROVINCE_CODES,
  OLD_PROVINCES,
  V1_TO_BOTH_PROVINCE,
  type AddressSchemaMode,
  type AreaProvinceRow,
} from './stationCoverageProvinces';
import { AREA_NAME_LOOKUP } from './areaNameLookup';
import {
  SERVICE_RADIUS_KM,
  areaCoveragePercent,
  evaluateWardCoverage,
  getWardCentroidRows,
  metricsFromWards,
  type WardCoverageResult,
} from './stationAreaCoverage';

export {
  SERVICE_RADIUS_KM,
  areaCoveragePercent,
  evaluateWardCoverage,
  getWardCentroidRows,
  metricsFromWards,
  resolveAdminAreaCenter,
} from './stationAreaCoverage';
export type { AreaCoverageMetrics, WardCoverageResult, WardCentroidRow } from './stationAreaCoverage';

export type CoverageLevel = 'cao' | 'trung_binh' | 'thap';
export type AreaType = 'HIGHWAY' | 'URBAN' | 'MOUNTAIN';
export type RegionId = 'bac' | 'trung' | 'nam';
export type MapDisplayMode = 'stations' | 'heatmap';
export type StationType = 'rescue_internal' | 'partner_with_contract' | 'partner_no_contract';
export type ProvinceSource = 'code' | 'address' | 'unassigned';
export type { AddressSchemaMode };
export { ADDRESS_SCHEMA_OPTIONS };

export interface ProvinceCoverageRow {
  id: string;
  code: string;
  name: string;
  region: RegionId;
  stations: number;
  orders90: number;
  covered90: number;
  avgKm90: number | null;
  orders12: number;
  covered12: number;
  avgKm12: number | null;
}

export interface CoverageStation {
  id: string;
  name: string;
  code: string;
  areaType: AreaType | null;
  partner: string;
  stationType: StationType;
  address: string;
  provinceSource: ProvinceSource;
  hasValidPosition: boolean;
}

export interface MapStationPoint extends CoverageStation {
  provinceId: string;
  provinceName: string;
  provinceCode: string;
  districtCode: string | null;
  precinctCode: string | null;
  position: [number, number];
}

export interface UncoveredOrder {
  orderId: string;
  address: string;
  distanceKm: number;
}

interface ProvinceDef {
  id: string;
  code: string;
  name: string;
  region: RegionId;
  center: [number, number];
  aliases: string[];
}

export const LEVEL_META: Record<
  CoverageLevel,
  { label: string; fill: string; badge: string; text: string }
> = {
  cao: {
    label: 'Cao',
    fill: '#047857',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'text-emerald-800',
  },
  trung_binh: {
    label: 'Trung bình',
    fill: '#1D4ED8',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    text: 'text-blue-800',
  },
  thap: {
    label: 'Thấp',
    fill: '#C2410C',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    text: 'text-orange-800',
  },
};

export const LEVEL_SORT: Record<CoverageLevel, number> = {
  thap: 0,
  trung_binh: 1,
  cao: 2,
};

export const REGION_OPTIONS: { id: RegionId | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả miền' },
  { id: 'bac', label: 'Miền Bắc' },
  { id: 'trung', label: 'Miền Trung' },
  { id: 'nam', label: 'Miền Nam' },
];

export const MAP_MODE_OPTIONS: { id: MapDisplayMode; label: string }[] = [
  { id: 'stations', label: 'Trạm' },
  { id: 'heatmap', label: 'Heatmap' },
];

export const AREA_TYPE_OPTIONS: { id: AreaType | 'all'; label: string }[] = [
  { id: 'all', label: 'Mọi loại khu vực' },
  { id: 'HIGHWAY', label: 'Cao tốc' },
  { id: 'URBAN', label: 'Nội đô' },
  { id: 'MOUNTAIN', label: 'Vùng núi' },
];

export const STATION_TYPE_OPTIONS: { id: StationType | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả loại trạm' },
  { id: 'rescue_internal', label: 'Trạm nội bộ' },
  { id: 'partner_with_contract', label: 'Đối tác có HĐ' },
  { id: 'partner_no_contract', label: 'Đối tác không HĐ' },
];

export function stationTypeLabel(type: StationType): string {
  if (type === 'rescue_internal') return 'Trạm nội bộ';
  if (type === 'partner_with_contract') return 'Đối tác có HĐ';
  return 'Đối tác không HĐ';
}

export function matchesStationTypeFilter(
  type: StationType,
  filter: StationType | StationType[] | 'all',
): boolean {
  if (filter === 'all') return true;
  if (Array.isArray(filter)) return filter.length === 0 || filter.includes(type);
  return type === filter;
}

/** Key lọc huyện: provinceCode|districtCode */
export function districtFilterKey(provinceCode: string, districtCode: string | null | undefined): string {
  return `${provinceCode}|${districtCode?.trim() || '__none__'}`;
}

/** Key lọc xã: provinceCode|districtCode|precinctCode */
export function precinctFilterKey(
  provinceCode: string,
  districtCode: string | null | undefined,
  precinctCode: string | null | undefined,
): string {
  return `${provinceCode}|${districtCode?.trim() || '__none__'}|${precinctCode?.trim() || '__none__'}`;
}

export const COVERAGE_RADIUS_M: Record<AreaType, number> = {
  URBAN: 5_000,
  HIGHWAY: 20_000,
  MOUNTAIN: 45_000,
};

export const DEFAULT_COVERAGE_RADIUS_M = 20_000;

export function coverageRadiusM(areaType: AreaType | null): number {
  if (!areaType) return DEFAULT_COVERAGE_RADIUS_M;
  return COVERAGE_RADIUS_M[areaType];
}

export const UNASSIGNED_PROVINCE_ID = 'unassigned';

/** 34 tỉnh/thành từ 01/07/2025 (NQ 202/2025/QH15). Alias gồm mã VETC + tên tỉnh cũ để map địa chỉ/province_code cũ. */
const PROVINCE_DEFS: ProvinceDef[] = [
  {
    id: 'hn', code: 'HNO', name: 'Hà Nội', region: 'bac', center: [21.0285, 105.8542],
    aliases: ['HNO', 'HNO1', 'HN', 'Thành phố Hà Nội', 'Ha Noi', 'Hà Nội'],
  },
  {
    id: 'hue', code: 'TTH', name: 'Huế', region: 'trung', center: [16.4637, 107.5909],
    aliases: ['TTH', 'HUE', 'Thừa Thiên Huế', 'Thua Thien Hue', 'Thành phố Huế', 'TP Hue', 'Huế'],
  },
  {
    id: 'cbg', code: 'CBG', name: 'Cao Bằng', region: 'bac', center: [22.666, 106.258],
    aliases: ['CBG', 'CBA', 'Cao Bang', 'Cao Bằng'],
  },
  {
    id: 'dbi', code: 'DBI', name: 'Điện Biên', region: 'bac', center: [21.387, 103.016],
    aliases: ['DBI', 'DBN', 'Dien Bien', 'Điện Biên'],
  },
  {
    id: 'ht', code: 'HTI', name: 'Hà Tĩnh', region: 'trung', center: [18.3559, 105.8877],
    aliases: ['HTI', 'HTH', 'HT', 'Ha Tinh', 'Hà Tĩnh'],
  },
  {
    id: 'lch', code: 'LCH', name: 'Lai Châu', region: 'bac', center: [22.396, 103.459],
    aliases: ['LCH', 'LCU', 'Lai Chau', 'Lai Châu'],
  },
  {
    id: 'lsn', code: 'LSN', name: 'Lạng Sơn', region: 'bac', center: [21.853, 106.761],
    aliases: ['LSN', 'LSO', 'Lang Son', 'Lạng Sơn'],
  },
  {
    id: 'na', code: 'NAN', name: 'Nghệ An', region: 'trung', center: [18.673, 105.681],
    aliases: ['NAN', 'NA', 'Nghe An', 'Nghệ An'],
  },
  {
    id: 'qn', code: 'QNI', name: 'Quảng Ninh', region: 'bac', center: [21.0064, 107.2925],
    aliases: ['QNI', 'QNH', 'QN', 'Quang Ninh', 'Quảng Ninh'],
  },
  {
    id: 'th', code: 'THO', name: 'Thanh Hóa', region: 'trung', center: [19.8067, 105.7852],
    aliases: ['THO', 'THA', 'TH', 'Thanh Hoa', 'Thanh Hóa'],
  },
  {
    id: 'sla', code: 'SLA', name: 'Sơn La', region: 'bac', center: [21.327, 103.914],
    aliases: ['SLA', 'Son La', 'Sơn La'],
  },
  {
    id: 'tqu', code: 'TQU', name: 'Tuyên Quang', region: 'bac', center: [22.15, 105.0],
    aliases: ['TQU', 'TQG', 'Tuyen Quang', 'Tuyên Quang', 'HGI', 'HGG', 'Ha Giang', 'Hà Giang'],
  },
  {
    id: 'ls', code: 'LCA', name: 'Lào Cai', region: 'bac', center: [22.15, 104.4],
    aliases: ['LCA', 'LCI', 'LC', 'Lao Cai', 'Lào Cai', 'YBA', 'YBI', 'Yen Bai', 'Yên Bái'],
  },
  {
    id: 'tng', code: 'TNG', name: 'Thái Nguyên', region: 'bac', center: [21.7, 105.85],
    aliases: ['TNG', 'TNN', 'Thai Nguyen', 'Thái Nguyên', 'BKA', 'BKN', 'Bac Kan', 'Bắc Kạn'],
  },
  {
    id: 'pth', code: 'PTH', name: 'Phú Thọ', region: 'bac', center: [21.3, 105.4],
    aliases: ['PTH', 'PTO', 'Phu Tho', 'Phú Thọ', 'VPH', 'VPC', 'Vinh Phuc', 'Vĩnh Phúc', 'HBI', 'HBH', 'Hoa Binh', 'Hòa Bình'],
  },
  {
    id: 'bni', code: 'BNI', name: 'Bắc Ninh', region: 'bac', center: [21.23, 106.15],
    aliases: ['BNI', 'BNH', 'Bac Ninh', 'Bắc Ninh', 'BGI', 'BGG', 'Bac Giang', 'Bắc Giang'],
  },
  {
    id: 'hye', code: 'HYE', name: 'Hưng Yên', region: 'bac', center: [20.55, 106.2],
    aliases: ['HYE', 'HYN', 'Hung Yen', 'Hưng Yên', 'TBH', 'TBI', 'Thai Binh', 'Thái Bình'],
  },
  {
    id: 'hp', code: 'HPH', name: 'Hải Phòng', region: 'bac', center: [20.85, 106.5],
    aliases: ['HPH', 'HP', 'Thành phố Hải Phòng', 'Hai Phong', 'Hải Phòng', 'HDU', 'HDG', 'Hai Duong', 'Hải Dương'],
  },
  {
    id: 'nb', code: 'NBI', name: 'Ninh Bình', region: 'bac', center: [20.25, 106.0],
    aliases: ['NBI', 'NBH', 'NB', 'Ninh Binh', 'Ninh Bình', 'HNM', 'Ha Nam', 'Hà Nam', 'NDI', 'NDH', 'Nam Dinh', 'Nam Định'],
  },
  {
    id: 'qt', code: 'QTR', name: 'Quảng Trị', region: 'trung', center: [17.1, 106.7],
    aliases: ['QTR', 'QTI', 'QT', 'Quang Tri', 'Quảng Trị', 'QBI', 'QBH', 'Quang Binh', 'Quảng Bình'],
  },
  {
    id: 'dn', code: 'DNA', name: 'Đà Nẵng', region: 'trung', center: [15.9, 108.1],
    aliases: ['DNA', 'DNG', 'DN', 'Thành phố Đà Nẵng', 'Da Nang', 'Đà Nẵng', 'QNM', 'Quang Nam', 'Quảng Nam'],
  },
  {
    id: 'qna', code: 'QNA', name: 'Quảng Ngãi', region: 'trung', center: [14.8, 108.4],
    aliases: ['QNA', 'QNG', 'Quang Ngai', 'Quảng Ngãi', 'KTU', 'KTM', 'Kon Tum'],
  },
  {
    id: 'gli', code: 'GLI', name: 'Gia Lai', region: 'trung', center: [13.9, 108.3],
    aliases: ['GLI', 'GLA', 'Gia Lai', 'BDI', 'BDH', 'Binh Dinh', 'Bình Định'],
  },
  {
    id: 'kh', code: 'KHO', name: 'Khánh Hòa', region: 'trung', center: [12.0, 109.0],
    aliases: ['KHO', 'KHA', 'KH', 'Khanh Hoa', 'Khánh Hòa', 'NTH', 'NTN', 'Ninh Thuan', 'Ninh Thuận'],
  },
  {
    id: 'dla', code: 'DLA', name: 'Đắk Lắk', region: 'trung', center: [12.8, 108.2],
    aliases: ['DLA', 'DLK', 'Dak Lak', 'Đắk Lắk', 'Daklak', 'PYE', 'PYN', 'Phu Yen', 'Phú Yên'],
  },
  {
    id: 'dl', code: 'LDG', name: 'Lâm Đồng', region: 'nam', center: [11.7, 108.2],
    aliases: ['LDG', 'LDO', 'LD', 'Lam Dong', 'Lâm Đồng', 'DNO', 'Dak Nong', 'Đắk Nông', 'BTN', 'BTH', 'Binh Thuan', 'Bình Thuận'],
  },
  {
    id: 'hcm', code: 'HCM', name: 'Hồ Chí Minh', region: 'nam', center: [10.82, 106.75],
    aliases: [
      'HCM', 'TP HCM', 'TPHCM', 'Thành phố Hồ Chí Minh', 'Tp. Hồ Chí Minh', 'Ho Chi Minh', 'Hồ Chí Minh',
      'BDU', 'BDG', 'BD', 'Binh Duong', 'Bình Dương',
      'BRV', 'BVT', 'Ba Ria', 'Vung Tau', 'Bà Rịa', 'Vũng Tàu', 'Bà Rịa - Vũng Tàu', 'Ba Ria Vung Tau',
    ],
  },
  {
    id: 'dnai', code: 'DNI', name: 'Đồng Nai', region: 'nam', center: [11.1, 107.0],
    aliases: ['DNI', 'DNAI', 'Dong Nai', 'Đồng Nai', 'BPH', 'BPC', 'Binh Phuoc', 'Bình Phước'],
  },
  {
    id: 'tni', code: 'TNI', name: 'Tây Ninh', region: 'nam', center: [11.0, 106.2],
    aliases: ['TNI', 'TNH', 'Tay Ninh', 'Tây Ninh', 'LAN', 'LTO', 'Long An'],
  },
  {
    id: 'ct', code: 'CTH', name: 'Cần Thơ', region: 'nam', center: [9.9, 105.7],
    aliases: ['CTH', 'CT', 'Thành phố Cần Thơ', 'Can Tho', 'Cần Thơ', 'STR', 'STG', 'Soc Trang', 'Sóc Trăng', 'HAG', 'HUG', 'Hau Giang', 'Hậu Giang'],
  },
  {
    id: 'vlo', code: 'VLO', name: 'Vĩnh Long', region: 'nam', center: [10.1, 106.2],
    aliases: ['VLO', 'Vinh Long', 'Vĩnh Long', 'BTR', 'BTE', 'Ben Tre', 'Bến Tre', 'TVH', 'Tra Vinh', 'Trà Vinh'],
  },
  {
    id: 'dth', code: 'DTH', name: 'Đồng Tháp', region: 'nam', center: [10.4, 105.9],
    aliases: ['DTH', 'DTP', 'Dong Thap', 'Đồng Tháp', 'TGI', 'TGG', 'Tien Giang', 'Tiền Giang'],
  },
  {
    id: 'cm', code: 'CMU', name: 'Cà Mau', region: 'nam', center: [9.1, 105.1],
    aliases: ['CMU', 'CMA', 'CM', 'Ca Mau', 'Cà Mau', 'BLI', 'BLU', 'Bac Lieu', 'Bạc Liêu'],
  },
  {
    id: 'ag', code: 'AGI', name: 'An Giang', region: 'nam', center: [10.3, 105.0],
    aliases: ['AGI', 'AGG', 'AG', 'An Giang', 'KGI', 'KGG', 'Kien Giang', 'Kiên Giang'],
  },
];

const UNASSIGNED_DEF: ProvinceDef = {
  id: UNASSIGNED_PROVINCE_ID,
  code: 'UNK',
  name: 'Chưa gán tỉnh',
  region: 'bac',
  center: [16.2, 106.5],
  aliases: [],
};

const PROVINCE_BY_ID = new Map(PROVINCE_DEFS.map((item) => [item.id, item]));
const PROVINCE_BY_ALIAS = new Map<string, ProvinceDef>();
for (const def of PROVINCE_DEFS) {
  for (const alias of def.aliases) {
    PROVINCE_BY_ALIAS.set(normalizeKey(alias), def);
  }
}

const ADDRESS_ALIASES = PROVINCE_DEFS.flatMap((def) =>
  def.aliases
    .filter((alias) => alias.length >= 3 && /[a-zA-Zà-ỹÀ-Ỹ]/.test(alias) && alias !== def.code)
    .map((alias) => ({ key: normalizeKey(alias), def })),
).sort((a, b) => b.key.length - a.key.length);

export const PROVINCE_CENTERS: Record<string, [number, number]> = Object.fromEntries(
  [...PROVINCE_DEFS, UNASSIGNED_DEF].map((item) => [item.id, item.center]),
);

const MOCK_ORDERS: Record<
  string,
  { orders90: number; covered90: number; avgKm90: number | null; orders12: number; covered12: number; avgKm12: number | null }
> = {
  hcm: { orders90: 768, covered90: 665, avgKm90: 7.1, orders12: 2416, covered12: 2081, avgKm12: 7.3 },
  hn: { orders90: 420, covered90: 383, avgKm90: 5.1, orders12: 1310, covered12: 1192, avgKm12: 5.3 },
  dn: { orders90: 95, covered90: 78, avgKm90: 8.4, orders12: 302, covered12: 248, avgKm12: 8.7 },
  hp: { orders90: 72, covered90: 55, avgKm90: 11.2, orders12: 228, covered12: 171, avgKm12: 11.8 },
  dnai: { orders90: 64, covered90: 44, avgKm90: 12.4, orders12: 201, covered12: 136, avgKm12: 12.9 },
  na: { orders90: 110, covered90: 60, avgKm90: 18.6, orders12: 348, covered12: 188, avgKm12: 19.2 },
  kh: { orders90: 48, covered90: 30, avgKm90: 14.1, orders12: 152, covered12: 94, avgKm12: 14.8 },
  ct: { orders90: 41, covered90: 24, avgKm90: 15.7, orders12: 129, covered12: 74, avgKm12: 16.2 },
  hue: { orders90: 36, covered90: 17, avgKm90: 22.4, orders12: 114, covered12: 52, avgKm12: 23.1 },
  qn: { orders90: 40, covered90: 17, avgKm90: 24.8, orders12: 126, covered12: 52, avgKm12: 25.4 },
  th: { orders90: 52, covered90: 20, avgKm90: 28.3, orders12: 164, covered12: 61, avgKm12: 29.0 },
  ls: { orders90: 19, covered90: 6, avgKm90: 38.5, orders12: 61, covered12: 18, avgKm12: 39.2 },
  ht: { orders90: 28, covered90: 6, avgKm90: 41.2, orders12: 88, covered12: 17, avgKm12: 42.0 },
  qt: { orders90: 18, covered90: 2, avgKm90: 48.6, orders12: 57, covered12: 6, avgKm12: 49.1 },
  nb: { orders90: 22, covered90: 2, avgKm90: 31.4, orders12: 70, covered12: 6, avgKm12: 32.0 },
  dl: { orders90: 15, covered90: 0, avgKm90: 62.0, orders12: 48, covered12: 0, avgKm12: 64.5 },
  ag: { orders90: 12, covered90: 0, avgKm90: 71.2, orders12: 39, covered12: 0, avgKm12: 73.0 },
  cm: { orders90: 0, covered90: 0, avgKm90: null, orders12: 0, covered12: 0, avgKm12: null },
};

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function resolveProvinceFromCode(code: string | null): ProvinceDef | null {
  if (!code) return null;
  return PROVINCE_BY_ALIAS.get(normalizeKey(code)) ?? null;
}

function resolveProvinceFromAddress(address: string): ProvinceDef | null {
  const key = normalizeKey(address);
  if (!key) return null;
  for (const item of ADDRESS_ALIASES) {
    if (item.key.length >= 4 && key.includes(item.key)) return item.def;
  }
  return null;
}

export function resolveStationType(row: DbStationRow): StationType {
  const raw = (row.partnerType ?? '').trim().toUpperCase();
  if (raw === 'INTERNAL') return 'rescue_internal';
  // THIRD_PARTY (+ biến thể) theo signing_date
  const signed = hasPartnerSigningDate(row);
  return signed ? 'partner_with_contract' : 'partner_no_contract';
}

function hasPartnerSigningDate(row: DbStationRow): boolean {
  const fromRow = row.signingDate?.trim();
  if (fromRow) return true;
  if (row.partnerId == null) return false;
  return Boolean(PARTNER_SIGNING_DATES[row.partnerId]);
}

function isQuickServicePartner(row: DbStationRow): boolean {
  return (row.partnerType ?? '').trim().toUpperCase() === 'QUICK_SERVICE';
}

export function resolveAreaType(value: string | null): AreaType | null {
  if (value === 'HIGHWAY' || value === 'URBAN' || value === 'MOUNTAIN') return value;
  return null;
}

/** Lat/lng placeholder kiểu số nguyên (vd. 21,105 · 10,106). */
export function isIntegerLatLng(lat: number | null, lng: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  const latWhole = Math.abs(lat - Math.round(lat)) < 1e-6;
  const lngWhole = Math.abs(lng - Math.round(lng)) < 1e-6;
  return latWhole && lngWhole;
}

export function hasPlottablePosition(lat: number | null, lng: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  // Trong khung bản đồ Việt Nam (cùng VIETNAM_BOUNDS).
  if (lat < 8.35 || lat > 23.45 || lng < 102.12 || lng > 109.55) return false;
  // Tọa độ giả / làm tròn thô — không plot lên map.
  if (isIntegerLatLng(lat, lng)) return false;
  return true;
}

const EXCLUDED_STATION_IDS = new Set<string>([
  '1721', // PTA8868E2E_7245 — hỗ trợ từ xa, address chỉ "Hà Nội"
]);

/**
 * Loại khỏi báo cáo độ phủ:
 * - EXCLUDED_STATION_IDS (Ops)
 * - Quick Service
 * - Không có tọa độ hợp lệ (null / ngoài VN / lat·lng số nguyên giả)
 */
function shouldIncludeStationInCoverage(row: DbStationRow): boolean {
  if (EXCLUDED_STATION_IDS.has(String(row.id))) return false;
  if (isQuickServicePartner(row)) return false;
  return hasPlottablePosition(row.latitude, row.longitude);
}

function partnerLabel(row: DbStationRow): string {
  const name = row.partnerName?.trim();
  return name ? name : 'Chưa gán đối tác';
}

const AREA_BY_CODE = new Map(AREA_PROVINCES.map((item) => [item.code.toUpperCase(), item]));

function normalizeProvinceCode(code: string | null): string | null {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed || trimmed === 'N/A' || trimmed === 'NULL') return null;
  return trimmed;
}

function areaToProvinceDef(row: AreaProvinceRow): ProvinceDef {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    region: row.region,
    center: row.center,
    aliases: [row.code, row.name],
  };
}

/** Địa chỉ cũ: 63 tỉnh; mã lịch sử HTA/NHA/QK map về tỉnh kế thừa. */
function resolveProvinceOld(row: DbStationRow): { def: ProvinceDef; source: ProvinceSource } {
  let code = normalizeProvinceCode(row.provinceCode);
  if (code && OLD_NON_PROVINCE_CODES.has(code)) {
    code = V1_TO_BOTH_PROVINCE[code] ?? code;
  }
  const mappedJunk = code ? V1_TO_BOTH_PROVINCE[code] : null;
  // Chỉ dùng map junk (HNO1, 01) — không gộp tỉnh V1-only vào BOTH ở mode cũ.
  const junkOnly = code && ['HNO1', '01'].includes(code) ? mappedJunk : null;
  const lookupCode = junkOnly ?? code;
  const lookup = lookupCode ? AREA_BY_CODE.get(lookupCode) : null;
  if (lookup && !OLD_NON_PROVINCE_CODES.has(lookup.code)) {
    return { def: areaToProvinceDef(lookup), source: 'code' };
  }
  const fromAddress = resolveProvinceFromAddress(row.address);
  if (fromAddress) {
    const byCode = AREA_BY_CODE.get(fromAddress.code);
    if (byCode && !OLD_NON_PROVINCE_CODES.has(byCode.code)) {
      return { def: areaToProvinceDef(byCode), source: 'address' };
    }
  }
  return { def: UNASSIGNED_DEF, source: 'unassigned' };
}

/** Địa chỉ mới: về 34 tỉnh BOTH (map V1-only / junk code). */
function resolveProvinceNew(row: DbStationRow): { def: ProvinceDef; source: ProvinceSource } {
  const code = normalizeProvinceCode(row.provinceCode);
  if (code) {
    const bothCode = NEW_PROVINCE_CODES.has(code) ? code : V1_TO_BOTH_PROVINCE[code] ?? code;
    const fromLegacy = resolveProvinceFromCode(bothCode) ?? resolveProvinceFromCode(code);
    if (fromLegacy) return { def: fromLegacy, source: 'code' };
  }
  const fromAddress = resolveProvinceFromAddress(row.address);
  if (fromAddress) return { def: fromAddress, source: 'address' };
  return { def: UNASSIGNED_DEF, source: 'unassigned' };
}

export function resolveProvince(
  row: DbStationRow,
  mode: AddressSchemaMode = 'new',
): { def: ProvinceDef; source: ProvinceSource } {
  return mode === 'old' ? resolveProvinceOld(row) : resolveProvinceNew(row);
}

/** Map tỉnh V1 → mã BOTH (34 tỉnh). */
function toBothProvinceCode(v1Code: string): string {
  const code = v1Code.trim().toUpperCase();
  if (NEW_PROVINCE_CODES.has(code)) return code;
  return V1_TO_BOTH_PROVINCE[code] ?? code;
}

/**
 * BOTH province → các mã tỉnh V1 hợp thành (để tra tên huyện/xã V1 sau sáp nhập).
 * Ví dụ HPH ← HPH + HDU.
 */
const BOTH_TO_V1_PROVINCES: Map<string, string[]> = (() => {
  const map = new Map<string, Set<string>>();
  for (const code of NEW_PROVINCE_CODES) {
    map.set(code, new Set([code]));
  }
  for (const [v1, both] of Object.entries(V1_TO_BOTH_PROVINCE)) {
    const set = map.get(both) ?? new Set<string>();
    set.add(both);
    set.add(v1.toUpperCase());
    map.set(both, set);
  }
  return new Map([...map.entries()].map(([k, v]) => [k, [...v]]));
})();

/**
 * Mã tỉnh trên PROVINCE_DEFS (UI Địa chỉ mới) đôi khi khác mã BOTH master
 * (LDG↔LDO, GLI↔GLA, CMU↔CMA, QNA↔QNG). Map về mã BOTH để tra V1.
 */
const UI_PROVINCE_TO_BOTH: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const def of PROVINCE_DEFS) {
    const bothAlias = [def.code, ...def.aliases]
      .map((a) => a.trim().toUpperCase())
      .find((a) => NEW_PROVINCE_CODES.has(a));
    if (bothAlias) map.set(def.code.toUpperCase(), bothAlias);
  }
  return map;
})();

function provinceCodesForAreaLookup(mode: AddressSchemaMode, provinceCode: string): string[] {
  if (mode === 'old') return [provinceCode];
  const both = UI_PROVINCE_TO_BOTH.get(provinceCode.toUpperCase()) ?? toBothProvinceCode(provinceCode);
  return [...new Set([provinceCode, both, ...(BOTH_TO_V1_PROVINCES.get(both) ?? [])])];
}

/** Gán huyện/xã chuẩn (override + remap address) — nguồn sự thật chung 2 mode. */
function resolveAdminDistrictPrecinct(
  row: DbStationRow,
  provinceCode: string,
): { districtCode: string | null; precinctCode: string | null } {
  let districtCode = row.districtCode?.trim() || null;
  let precinctCode = row.precinctCode?.trim() || null;
  const override = STATION_ADMIN_OVERRIDES[String(row.id)];
  if (override) {
    // districtCode: '' = Ops clear huyện (chỉ giữ tỉnh)
    if (typeof override.districtCode === 'string') {
      const d = override.districtCode.trim();
      if (!d) {
        return { districtCode: null, precinctCode: null };
      }
      districtCode = d;
      if (Object.prototype.hasOwnProperty.call(override, 'precinctCode')) {
        const p = (override.precinctCode ?? '').trim();
        precinctCode = p || null;
      } else if (isV2GsoPrecinct(precinctCode) || isV2DummyDistrict(row.districtCode)) {
        const remapped = remapOldAdminFromAddress(provinceCode, row.address, districtCode, precinctCode);
        precinctCode = remapped.precinctCode;
      }
      return { districtCode, precinctCode };
    }
  }
  if (hasPlottablePosition(row.latitude, row.longitude)) {
    const remapped = remapOldAdminFromAddress(provinceCode, row.address, districtCode, precinctCode);
    districtCode = remapped.districtCode;
    precinctCode = remapped.precinctCode;
  } else {
    const remapped = remapOldAdminFromAddress(provinceCode, row.address, districtCode, precinctCode);
    districtCode = remapped.districtCode;
    precinctCode = remapped.precinctCode;
  }
  return { districtCode, precinctCode };
}

function toMapPoint(row: DbStationRow, mode: AddressSchemaMode): MapStationPoint {
  // 1) Luôn resolve theo địa chỉ cũ (63 tỉnh + override) làm nguồn sự thật huyện/xã
  let { def, source } = resolveProvinceOld(row);
  const override = STATION_ADMIN_OVERRIDES[String(row.id)];
  if (override?.provinceCode) {
    const byCode = AREA_BY_CODE.get(override.provinceCode.toUpperCase());
    if (byCode && !OLD_NON_PROVINCE_CODES.has(byCode.code)) {
      def = areaToProvinceDef(byCode);
      source = 'address';
    }
  }
  const v1ProvinceCode = def.code;
  const { districtCode, precinctCode } = resolveAdminDistrictPrecinct(row, v1ProvinceCode);

  // 2) Mode mới: chỉ đổi lớp tỉnh → 34 BOTH; giữ huyện/xã đã chuẩn hóa
  if (mode === 'new' && def.id !== UNASSIGNED_PROVINCE_ID) {
    const bothCode = toBothProvinceCode(v1ProvinceCode);
    const bothDef =
      resolveProvinceFromCode(bothCode) ??
      (() => {
        const area = AREA_BY_CODE.get(bothCode);
        return area && area.schemaVersion === 'BOTH' ? areaToProvinceDef(area) : null;
      })();
    if (bothDef) {
      def = bothDef;
    }
  }

  return {
    id: String(row.id),
    name: row.name,
    code: row.code,
    areaType: resolveAreaType(row.areaType),
    partner: partnerLabel(row),
    stationType: resolveStationType(row),
    address: row.address,
    provinceSource: source,
    hasValidPosition: hasPlottablePosition(row.latitude, row.longitude),
    provinceId: def.id,
    provinceName: def.name,
    provinceCode: def.code,
    districtCode,
    precinctCode,
    position: [row.latitude ?? def.center[0], row.longitude ?? def.center[1]],
  };
}

export function getMapStationPoints(mode: AddressSchemaMode): MapStationPoint[] {
  // Giữ toàn bộ trạm snapshot + bổ sung mỗi xe INTERNAL (temp_rescue_station) như 1 trạm nội bộ.
  const merged = [...DB_STATIONS, ...INTERNAL_VEHICLE_STATIONS];
  return merged.filter(shouldIncludeStationInCoverage).map((row) => toMapPoint(row, mode));
}

export function getProvinceCenters(mode: AddressSchemaMode): Record<string, [number, number]> {
  if (mode === 'old') {
    return Object.fromEntries(OLD_PROVINCES.map((item) => [item.id, item.center]));
  }
  return PROVINCE_CENTERS;
}

/** Bán kính mặc định (km) quanh tâm area khi search/chọn 1 đơn vị hành chính. */
export const NEARBY_RADIUS_KM = 30;

/** Khoảng cách haversine (km) giữa 2 điểm [lat, lng]. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Trung bình lat/lng các trạm có tọa độ hợp lệ — dùng làm tâm huyện/xã. */
export function averageStationCenter(
  stations: Array<{ position: [number, number]; hasValidPosition?: boolean }>,
): [number, number] | null {
  const pts = stations.filter((s) => s.hasValidPosition !== false && Number.isFinite(s.position[0]) && Number.isFinite(s.position[1]));
  if (pts.length === 0) return null;
  const lat = pts.reduce((sum, s) => sum + s.position[0], 0) / pts.length;
  const lng = pts.reduce((sum, s) => sum + s.position[1], 0) / pts.length;
  return [lat, lng];
}

export function getProvinceCoverageRows(
  mode: AddressSchemaMode,
  points: MapStationPoint[] = getMapStationPoints(mode),
): ProvinceCoverageRow[] {
  const counts = points.reduce((acc, station) => {
    acc.set(station.provinceId, (acc.get(station.provinceId) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const defs: ProvinceDef[] =
    mode === 'old' ? OLD_PROVINCES.map(areaToProvinceDef) : PROVINCE_DEFS;

  return defs
    .map((def) => {
      const mock = MOCK_ORDERS[def.id];
      return {
        id: def.id,
        code: def.code,
        name: def.name,
        region: def.region,
        stations: counts.get(def.id) ?? 0,
        orders90: mock?.orders90 ?? 0,
        covered90: mock?.covered90 ?? 0,
        avgKm90: mock?.avgKm90 ?? null,
        orders12: mock?.orders12 ?? 0,
        covered12: mock?.covered12 ?? 0,
        avgKm12: mock?.avgKm12 ?? null,
      };
    })
    .sort((a, b) => {
      const byStations = (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
      if (byStations !== 0) return byStations;
      return a.name.localeCompare(b.name, 'vi');
    });
}

/**
 * Tra tên đơn vị từ master area.
 * Không trả tên cấp tỉnh (district+precinct rỗng) — tránh hiện "Hà Nội" ở cấp huyện.
 * Mode mới: thử thêm các tỉnh V1 đã sáp nhập vào tỉnh BOTH (vd HPH ← HDU).
 */
export function lookupAreaName(
  mode: AddressSchemaMode,
  provinceCode: string,
  districtCode: string | null,
  precinctCode: string | null,
): string | null {
  const distRaw = (districtCode ?? '').trim();
  const precRaw = (precinctCode ?? '').trim();
  // Chỉ resolve khi có ít nhất huyện hoặc xã — không resolve node tỉnh.
  if (!distRaw && !precRaw) return null;

  const distCandidates = distRaw
    ? /^\d+$/.test(distRaw)
      ? Array.from(new Set([distRaw.padStart(2, '0'), distRaw]))
      : [distRaw]
    : [''];

  const provinceCandidates = provinceCodesForAreaLookup(mode, provinceCode);

  const schemas =
    mode === 'old' ? (['V1', 'V2', 'BOTH'] as const) : (['V1', 'V2', 'BOTH'] as const);

  for (const schema of schemas) {
    for (const prov of provinceCandidates) {
      for (const dist of distCandidates) {
        const key = `${schema}|${prov}|${dist}|${precRaw}`;
        const name = AREA_NAME_LOOKUP[key];
        if (name) return name;
      }
    }
  }
  return null;
}

function isV2DummyDistrict(code: string | null | undefined): boolean {
  return !!code && /^\d{1,2}$/.test(code.trim());
}

function isV2GsoPrecinct(code: string | null | undefined): boolean {
  return !!code && /^\d{5}$/.test(code.trim());
}

function stripAdminPrefix(name: string): string {
  return name
    .replace(/^(?:đặc khu|thị trấn|thị xã|thành phố|quận|huyện|phường|xã)\s+/i, '')
    .replace(/^(?:q|h|tx|t\/x|p|x)\.?\s*/i, '')
    .trim();
}

interface V1AreaAlias {
  code: string;
  districtCode: string;
  name: string;
  keys: string[];
  coreLen: number;
}

interface V1ProvinceIndex {
  districts: V1AreaAlias[];
  precincts: V1AreaAlias[];
}

function buildAliasKeys(name: string): { keys: string[]; coreLen: number } {
  const core = stripAdminPrefix(name);
  const keys = [
    ...new Set([
      normalizeKey(name),
      normalizeKey(core),
      normalizeKey(`quan ${core}`),
      normalizeKey(`huyen ${core}`),
      normalizeKey(`thi xa ${core}`),
      normalizeKey(`phuong ${core}`),
      normalizeKey(`xa ${core}`),
    ]),
  ].filter((k) => k.length >= 3);
  return { keys, coreLen: normalizeKey(core).length };
}

/** Index huyện/xã V1 theo tỉnh — dùng remap Địa chỉ cũ từ address / tên V2. */
const V1_AREA_BY_PROVINCE: Map<string, V1ProvinceIndex> = (() => {
  const map = new Map<string, { districts: V1AreaAlias[]; precincts: V1AreaAlias[] }>();
  for (const [key, name] of Object.entries(AREA_NAME_LOOKUP)) {
    if (!key.startsWith('V1|')) continue;
    const [, province, district, precinct] = key.split('|');
    if (!province || !district) continue;
    let bucket = map.get(province);
    if (!bucket) {
      bucket = { districts: [], precincts: [] };
      map.set(province, bucket);
    }
    const { keys, coreLen } = buildAliasKeys(name);
    if (!precinct) {
      bucket.districts.push({ code: district, districtCode: district, name, keys, coreLen });
    } else {
      bucket.precincts.push({ code: precinct, districtCode: district, name, keys, coreLen });
    }
  }
  for (const bucket of map.values()) {
    bucket.districts.sort((a, b) => b.coreLen - a.coreLen);
    bucket.precincts.sort((a, b) => b.coreLen - a.coreLen);
  }
  return map;
})();

function matchAliasInText(textKey: string, aliases: V1AreaAlias[]): V1AreaAlias | null {
  for (const item of aliases) {
    if (item.keys.some((k) => k.length >= 4 && textKey.includes(k))) return item;
  }
  return null;
}

function matchAliasByCoreName(coreKey: string, aliases: V1AreaAlias[]): V1AreaAlias | null {
  if (coreKey.length < 4) return null;
  for (const item of aliases) {
    const core = normalizeKey(stripAdminPrefix(item.name));
    if (core.length < 4) continue;
    if (coreKey === core || coreKey.includes(core) || core.includes(coreKey)) return item;
  }
  return null;
}

/** V2: province|precinctGso5 → tên xã (ưu tiên dưới huyện dummy GSO 2 số). */
const V2_PRECINCT_NAME = (() => {
  const map = new Map<string, string>();
  for (const [key, name] of Object.entries(AREA_NAME_LOOKUP)) {
    if (!key.startsWith('V2|')) continue;
    const [, province, district, precinct] = key.split('|');
    if (!province || !district || !precinct) continue;
    const id = `${province}|${precinct}`;
    const existing = map.get(id);
    // Ưu tiên node dưới huyện giả mã 2 số; không ghi đè nếu đã có
    if (!existing || /^\d{2}$/.test(district)) {
      map.set(id, name);
    }
  }
  return map;
})();

function lookupV2PrecinctName(provinceCode: string, precinctCode: string): string | null {
  return V2_PRECINCT_NAME.get(`${provinceCode}|${precinctCode}`) ?? null;
}

/**
 * Mode Địa chỉ cũ: trạm đã gắn huyện giả V2 ("Không Quận Huyện" / mã GSO 2 số)
 * → suy huyện/xã V1 từ chuỗi address (+ tên xã V2 nếu có).
 */
function remapOldAdminFromAddress(
  provinceCode: string,
  address: string,
  districtCode: string | null,
  precinctCode: string | null,
): { districtCode: string | null; precinctCode: string | null } {
  const needsRemap =
    !districtCode || isV2DummyDistrict(districtCode) || isV2GsoPrecinct(precinctCode);
  if (!needsRemap) {
    return { districtCode, precinctCode };
  }

  const index = V1_AREA_BY_PROVINCE.get(provinceCode);
  if (!index) {
    return {
      districtCode: isV2DummyDistrict(districtCode) ? null : districtCode,
      precinctCode: isV2GsoPrecinct(precinctCode) ? null : precinctCode,
    };
  }

  const addrKey = normalizeKey(address);
  let dist = matchAliasInText(addrKey, index.districts);
  let prec = matchAliasInText(addrKey, index.precincts);

  if (!dist && prec) {
    dist = index.districts.find((d) => d.code === prec!.districtCode) ?? null;
  }

  // Tên xã/phường V2 (vd "Phường Bồ Đề") → map về xã/huyện V1 cùng tên lõi
  if ((!dist || !prec) && precinctCode && isV2GsoPrecinct(precinctCode)) {
    const v2Name = lookupV2PrecinctName(provinceCode, precinctCode);
    if (v2Name) {
      const coreKey = normalizeKey(stripAdminPrefix(v2Name));
      if (!dist) {
        dist = matchAliasByCoreName(coreKey, index.districts);
      }
      if (!prec) {
        prec = matchAliasByCoreName(coreKey, index.precincts);
        if (prec && !dist) {
          dist = index.districts.find((d) => d.code === prec!.districtCode) ?? null;
        }
      }
    }
  }

  return {
    districtCode: dist?.code ?? (isV2DummyDistrict(districtCode) || !districtCode ? null : districtCode),
    precinctCode: prec?.code ?? (isV2GsoPrecinct(precinctCode) ? null : precinctCode),
  };
}

export function districtDisplayName(
  mode: AddressSchemaMode,
  provinceCode: string,
  districtCode: string | null,
): string {
  if (!districtCode) return 'Chưa gán huyện';
  const looked = lookupAreaName(mode, provinceCode, districtCode, null);
  if (looked) {
    // Không hiện nhãn giả V2 ở cả 2 mode (đã chuẩn hóa chung về huyện V1)
    if (/không quận huyện/i.test(looked)) return 'Chưa gán huyện';
    return looked;
  }
  // V2: district = mã GSO 2 số của tỉnh (vd HNO → 01) = node giả "Không Quận Huyện"
  if (isV2DummyDistrict(districtCode)) {
    return 'Chưa gán huyện';
  }
  return `Mã ${districtCode}`;
}

export function precinctDisplayName(
  mode: AddressSchemaMode,
  provinceCode: string,
  districtCode: string | null,
  precinctCode: string | null,
): string {
  if (!precinctCode) return 'Chưa gán xã/phường';
  const looked = lookupAreaName(mode, provinceCode, districtCode, precinctCode);
  if (looked) return looked;
  if (mode === 'old' && isV2GsoPrecinct(precinctCode)) {
    const v2Name = lookupV2PrecinctName(provinceCode, precinctCode);
    if (v2Name) return v2Name;
  }
  return `Mã ${precinctCode}`;
}

/**
 * Droplist huyện/xã từ master area (V1) + centroid xã — không phụ thuộc trạm đã gán.
 * Key cùng format districtFilterKey / precinctFilterKey; mode mới map mã tỉnh → BOTH.
 */
export function getMasterAdminFilterOptions(
  mode: AddressSchemaMode,
  opts?: { provinceCodes?: string[]; districtKeys?: string[] },
): {
  districts: Array<{ value: string; label: string; provinceCode: string; districtCode: string }>;
  precincts: Array<{
    value: string;
    label: string;
    provinceCode: string;
    districtCode: string;
    precinctCode: string;
  }>;
} {
  const provinceFilter = opts?.provinceCodes?.length
    ? new Set(opts.provinceCodes.map((c) => c.trim().toUpperCase()))
    : null;
  const districtFilter = opts?.districtKeys?.length ? new Set(opts.districtKeys) : null;

  const displayProvince = (v1: string) =>
    mode === 'new' ? toBothProvinceCode(v1) : v1.trim().toUpperCase();

  const districtNames = new Map<string, string>(); // displayProv|dist → name
  const precinctNames = new Map<string, string>(); // displayProv|dist|prec → name

  for (const [key, name] of Object.entries(AREA_NAME_LOOKUP)) {
    const [schema, prov, dist, prec] = key.split('|');
    if (schema !== 'V1' || !prov || !dist) continue;
    if (isV2DummyDistrict(dist)) continue;
    const pCode = displayProvince(prov);
    if (provinceFilter && !provinceFilter.has(pCode) && !provinceFilter.has(prov.toUpperCase())) continue;
    const dKey = `${pCode}|${dist}`;
    if (!prec) {
      if (!districtNames.has(dKey) || name.length > (districtNames.get(dKey)?.length ?? 0)) {
        districtNames.set(dKey, name);
      }
    } else {
      const pKey = `${pCode}|${dist}|${prec}`;
      if (!precinctNames.has(pKey)) precinctNames.set(pKey, name);
      if (!districtNames.has(dKey)) {
        const dName = lookupAreaName('old', prov, dist, null);
        if (dName && !/không quận huyện/i.test(dName)) districtNames.set(dKey, dName);
      }
    }
  }

  for (const ward of getWardCentroidRows()) {
    const pCode = displayProvince(ward.p);
    if (provinceFilter && !provinceFilter.has(pCode) && !provinceFilter.has(ward.p.toUpperCase())) continue;
    const dKey = `${pCode}|${ward.d}`;
    if (!districtNames.has(dKey)) {
      const dName = lookupAreaName('old', ward.p, ward.d, null);
      districtNames.set(dKey, dName && !/không quận huyện/i.test(dName) ? dName : `Mã ${ward.d}`);
    }
    const pKey = `${pCode}|${ward.d}|${ward.c}`;
    if (!precinctNames.has(pKey)) precinctNames.set(pKey, ward.n);
  }

  const provinceName = (code: string) => {
    const row =
      (mode === 'old' ? OLD_PROVINCES : AREA_PROVINCES.filter((p) => p.schemaVersion === 'BOTH' || p.kind === 'kept')).find(
        (p) => p.code.toUpperCase() === code,
      ) ?? AREA_PROVINCES.find((p) => p.code.toUpperCase() === code);
    return row?.name ?? code;
  };

  const districts = [...districtNames.entries()]
    .map(([dKey, name]) => {
      const [provinceCode, districtCode] = dKey.split('|');
      return {
        value: districtFilterKey(provinceCode, districtCode),
        label: `${name} (${provinceName(provinceCode)})`,
        provinceCode,
        districtCode,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));

  const precincts = [...precinctNames.entries()]
    .filter(([pKey]) => {
      if (!districtFilter) return true;
      const [provinceCode, districtCode] = pKey.split('|');
      return districtFilter.has(districtFilterKey(provinceCode, districtCode));
    })
    .map(([pKey, name]) => {
      const [provinceCode, districtCode, precinctCode] = pKey.split('|');
      const districtName =
        districtNames.get(`${provinceCode}|${districtCode}`) ??
        districtDisplayName(mode, provinceCode, districtCode);
      return {
        value: precinctFilterKey(provinceCode, districtCode, precinctCode),
        label: `${name} · ${districtName}`,
        provinceCode,
        districtCode,
        precinctCode,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'vi'));

  return { districts, precincts };
}

export interface HierarchyStationStats {
  total: number;
  internal: number;
  withContract: number;
  noContract: number;
}

export interface PrecinctHierarchyNode extends HierarchyStationStats {
  code: string;
  name: string;
  /** % độ phủ xã: 100 | 0 | null (không có centroid). */
  cr: number | null;
  nearestKm: number | null;
  hasCentroid: boolean;
}

export interface DistrictHierarchyNode extends HierarchyStationStats {
  code: string;
  name: string;
  wardTotal: number;
  wardCovered: number;
  cr: number | null;
  level: CoverageLevel | null;
  precincts: PrecinctHierarchyNode[];
}

export interface ProvinceHierarchyNode extends HierarchyStationStats {
  provinceId: string;
  code: string;
  name: string;
  wardTotal: number;
  wardCovered: number;
  cr: number;
  level: CoverageLevel;
  districts: DistrictHierarchyNode[];
}

function emptyStats(): HierarchyStationStats {
  return { total: 0, internal: 0, withContract: 0, noContract: 0 };
}

function addStationStat(stats: HierarchyStationStats, station: MapStationPoint) {
  stats.total += 1;
  if (station.stationType === 'rescue_internal') stats.internal += 1;
  else if (station.stationType === 'partner_with_contract') stats.withContract += 1;
  else stats.noContract += 1;
}

function sortByCoverageThenStations<T extends { cr: number | null; total: number; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aCr = a.cr ?? -1;
    const bCr = b.cr ?? -1;
    if (aCr !== bCr) return aCr - bCr;
    if (b.total !== a.total) return b.total - a.total;
    return a.name.localeCompare(b.name, 'vi');
  });
}

function provinceDefsForMode(mode: AddressSchemaMode): ProvinceDef[] {
  return mode === 'old' ? OLD_PROVINCES.map(areaToProvinceDef) : PROVINCE_DEFS;
}

function buildCodeToProvinceId(mode: AddressSchemaMode): Map<string, string> {
  const map = new Map<string, string>();
  for (const def of provinceDefsForMode(mode)) {
    map.set(def.code.toUpperCase(), def.id);
    for (const alias of def.aliases) map.set(alias.trim().toUpperCase(), def.id);
  }
  for (const row of AREA_PROVINCES) {
    const code = row.code.toUpperCase();
    if (map.has(code)) continue;
    const hit = provinceDefsForMode(mode).find(
      (d) =>
        d.code.toUpperCase() === code ||
        d.aliases.some((a) => a.trim().toUpperCase() === code),
    );
    if (hit) map.set(code, hit.id);
  }
  if (mode === 'new') {
    for (const [v1, both] of Object.entries(V1_TO_BOTH_PROVINCE)) {
      const id = map.get(both.toUpperCase());
      if (id) map.set(v1.toUpperCase(), id);
    }
  }
  return map;
}

/**
 * Cây 3 cấp tỉnh → huyện → xã/phường + % độ phủ địa bàn.
 * @param stations — trạm sau lọc (đếm số trạm trên cây)
 * @param coverageStations — tập trạm để tìm trạm gần nhất (thường = lọc loại/đối tác, không theo tỉnh)
 */
export function buildProvinceHierarchy(
  mode: AddressSchemaMode,
  provinceRows: ProvinceCoverageRow[],
  stations: MapStationPoint[],
  coverageStations: MapStationPoint[] = stations,
): ProvinceHierarchyNode[] {
  const codeToId = buildCodeToProvinceId(mode);
  const wardResults = evaluateWardCoverage(mode, coverageStations, SERVICE_RADIUS_KM);

  const wardsByProvince = new Map<string, WardCoverageResult[]>();
  for (const ward of wardResults) {
    const provinceId = codeToId.get(ward.provinceCode.toUpperCase());
    if (!provinceId) continue;
    const list = wardsByProvince.get(provinceId) ?? [];
    list.push(ward);
    wardsByProvince.set(provinceId, list);
  }

  const byProvince = new Map<string, MapStationPoint[]>();
  for (const station of stations) {
    if (station.provinceId === UNASSIGNED_PROVINCE_ID) continue;
    const list = byProvince.get(station.provinceId) ?? [];
    list.push(station);
    byProvince.set(station.provinceId, list);
  }

  const nodes: ProvinceHierarchyNode[] = provinceRows.map((row) => {
    const provinceStations = byProvince.get(row.id) ?? [];
    const provinceWards = wardsByProvince.get(row.id) ?? [];
    const provinceMetrics = metricsFromWards(provinceWards);

    type DistBucket = {
      districtCode: string | null;
      stations: MapStationPoint[];
      wards: WardCoverageResult[];
    };
    const districtMap = new Map<string, DistBucket>();

    const ensureDistrict = (dKey: string, districtCode: string | null): DistBucket => {
      let bucket = districtMap.get(dKey);
      if (!bucket) {
        bucket = { districtCode, stations: [], wards: [] };
        districtMap.set(dKey, bucket);
      }
      return bucket;
    };

    for (const station of provinceStations) {
      const dKey = station.districtCode || '__none__';
      ensureDistrict(dKey, station.districtCode).stations.push(station);
    }
    for (const ward of provinceWards) {
      ensureDistrict(ward.districtCode, ward.districtCode).wards.push(ward);
    }

    const districts: DistrictHierarchyNode[] = [...districtMap.entries()].map(([, bucket]) => {
      const districtCode = bucket.districtCode;
      type PrecBucket = {
        precinctCode: string | null;
        name: string;
        stations: MapStationPoint[];
        ward: WardCoverageResult | null;
      };
      const precinctMap = new Map<string, PrecBucket>();

      const ensurePrecinct = (pKey: string, precinctCode: string | null, name: string): PrecBucket => {
        let pb = precinctMap.get(pKey);
        if (!pb) {
          pb = { precinctCode, name, stations: [], ward: null };
          precinctMap.set(pKey, pb);
        }
        return pb;
      };

      for (const station of bucket.stations) {
        const pKey = station.precinctCode || '__none__';
        const name = precinctDisplayName(mode, row.code, districtCode, station.precinctCode);
        ensurePrecinct(pKey, station.precinctCode, name).stations.push(station);
      }
      for (const ward of bucket.wards) {
        const pb = ensurePrecinct(ward.precinctCode, ward.precinctCode, ward.name);
        pb.ward = ward;
        if (!pb.name || pb.name.startsWith('Mã ')) pb.name = ward.name;
      }

      const precincts: PrecinctHierarchyNode[] = [...precinctMap.values()].map((pb) => {
        const stats = emptyStats();
        pb.stations.forEach((s) => addStationStat(stats, s));
        const covered = pb.ward?.covered ?? null;
        return {
          code: pb.precinctCode ?? '—',
          name: pb.name,
          ...stats,
          cr: covered == null ? null : covered ? 100 : 0,
          nearestKm: pb.ward?.nearestKm ?? null,
          hasCentroid: pb.ward != null,
        };
      });

      const dStats = emptyStats();
      bucket.stations.forEach((s) => addStationStat(dStats, s));
      const dMetrics = metricsFromWards(bucket.wards);
      return {
        code: districtCode ?? '—',
        name: districtDisplayName(mode, row.code, districtCode),
        ...dStats,
        wardTotal: dMetrics.wardTotal,
        wardCovered: dMetrics.wardCovered,
        cr: dMetrics.wardTotal > 0 ? dMetrics.cr : null,
        level: dMetrics.wardTotal > 0 ? resolveCoverageLevelFromPercent(dMetrics.cr) : null,
        precincts: sortByCoverageThenStations(precincts),
      };
    });

    const pStats = emptyStats();
    provinceStations.forEach((s) => addStationStat(pStats, s));
    return {
      provinceId: row.id,
      code: row.code,
      name: row.name,
      ...pStats,
      wardTotal: provinceMetrics.wardTotal,
      wardCovered: provinceMetrics.wardCovered,
      cr: provinceMetrics.cr,
      level: resolveCoverageLevelFromPercent(provinceMetrics.cr),
      districts: sortByCoverageThenStations(districts),
    };
  });

  return sortByCoverageThenStations(nodes);
}

/** Lọc xã theo key huyện/xã (cùng format districtFilterKey / precinctFilterKey). */
export function filterWardsByAdminKeys(
  wards: WardCoverageResult[],
  opts: { districtKeys?: string[]; precinctKeys?: string[]; provinceCodes?: string[] },
): WardCoverageResult[] {
  const precinctSet = opts.precinctKeys?.length ? new Set(opts.precinctKeys) : null;
  const districtSet = opts.districtKeys?.length ? new Set(opts.districtKeys) : null;
  const provinceSet = opts.provinceCodes?.length
    ? new Set(opts.provinceCodes.map((c) => c.trim().toUpperCase()))
    : null;

  return wards.filter((ward) => {
    if (provinceSet && !provinceSet.has(ward.provinceCode.toUpperCase())) return false;
    if (precinctSet) {
      return precinctSet.has(
        precinctFilterKey(ward.provinceCode, ward.districtCode, ward.precinctCode),
      );
    }
    if (districtSet) {
      return districtSet.has(districtFilterKey(ward.provinceCode, ward.districtCode));
    }
    return true;
  });
}

/** % độ phủ theo tỉnh — dùng KPI / sidebar (trạm gần nhất từ coverageStations). */
export function getProvinceAreaCoverageMap(
  mode: AddressSchemaMode,
  coverageStations: MapStationPoint[],
): Map<string, { wardTotal: number; wardCovered: number; cr: number; level: CoverageLevel }> {
  const codeToId = buildCodeToProvinceId(mode);
  const wards = evaluateWardCoverage(mode, coverageStations, SERVICE_RADIUS_KM);
  const byProvince = new Map<string, WardCoverageResult[]>();
  for (const ward of wards) {
    const provinceId = codeToId.get(ward.provinceCode.toUpperCase());
    if (!provinceId) continue;
    const list = byProvince.get(provinceId) ?? [];
    list.push(ward);
    byProvince.set(provinceId, list);
  }
  const out = new Map<string, { wardTotal: number; wardCovered: number; cr: number; level: CoverageLevel }>();
  for (const [provinceId, list] of byProvince) {
    const m = metricsFromWards(list);
    out.set(provinceId, { ...m, level: resolveCoverageLevelFromPercent(m.cr) });
  }
  return out;
}

/** Mặc định địa chỉ mới — tương thích import cũ (init sau V1_AREA_BY_PROVINCE). */
export const mapStationPoints: MapStationPoint[] = getMapStationPoints('new');

export const stationsByProvince: Record<string, CoverageStation[]> = mapStationPoints.reduce(
  (acc, station) => {
    const list = acc[station.provinceId] ?? [];
    list.push(station);
    acc[station.provinceId] = list;
    return acc;
  },
  {} as Record<string, CoverageStation[]>,
);

export const provinceCoverageRows: ProvinceCoverageRow[] = getProvinceCoverageRows('new');

export const unassignedBucket = {
  stations: mapStationPoints.filter((station) => station.provinceId === UNASSIGNED_PROVINCE_ID).length,
  orders90: 0,
  orders12: 0,
};

const partnerNames = [...new Set(mapStationPoints.map((station) => station.partner))]
  .filter((name) => name !== 'Chưa gán đối tác')
  .sort((a, b) => a.localeCompare(b, 'vi'));

export const PARTNER_OPTIONS: string[] = ['Tất cả đối tác', ...partnerNames];

export const uncoveredOrdersByProvince: Record<string, UncoveredOrder[]> = {
  na: [
    { orderId: 'RS12605030015', address: 'QL 48, Quỳ Châu, Nghệ An', distanceKm: 28.4 },
    { orderId: 'RS12605030041', address: 'Huyện Kỳ Sơn, Nghệ An', distanceKm: 46.2 },
  ],
  hue: [{ orderId: 'RS12605040008', address: 'A Lưới, Huế', distanceKm: 38.1 }],
  th: [{ orderId: 'RS12605030062', address: 'Mường Lát, Thanh Hóa', distanceKm: 52.0 }],
  ht: [{ orderId: 'RS12605040022', address: 'Hương Sơn, Hà Tĩnh', distanceKm: 44.7 }],
  qt: [{ orderId: 'RS12605040031', address: 'Hướng Hóa, Quảng Trị', distanceKm: 61.3 }],
  ls: [{ orderId: 'RS12605050004', address: 'Bát Xát, Lào Cai', distanceKm: 41.8 }],
  qn: [{ orderId: 'RS12605020061', address: 'Bình Liêu, Quảng Ninh', distanceKm: 36.5 }],
  nb: [{ orderId: 'RS12605020088', address: 'Kim Sơn, Ninh Bình', distanceKm: 31.4 }],
  dl: [
    { orderId: 'RS12605060011', address: 'Đà Lạt, Lâm Đồng', distanceKm: 62.0 },
    { orderId: 'RS12605060018', address: 'Bảo Lộc, Lâm Đồng', distanceKm: 78.4 },
  ],
  ag: [{ orderId: 'RS12605070009', address: 'Tịnh Biên, An Giang', distanceKm: 71.2 }],
};

export function coveragePercent(covered: number, orders: number): number | null {
  if (orders === 0) return null;
  return Math.round((covered / orders) * 1000) / 10;
}

/** Mức độ phủ theo % xã được phủ (Cao ≥80 · TB ≥50 · Thấp <50). */
export function resolveCoverageLevelFromPercent(pct: number): CoverageLevel {
  if (pct <= 0) return 'thap';
  if (pct >= 80) return 'cao';
  if (pct >= 50) return 'trung_binh';
  return 'thap';
}

/** @deprecated Giữ tương thích — dùng resolveCoverageLevelFromPercent. */
export const TARGET_STATIONS_PER_PROVINCE = 50;

/** @deprecated Thay bằng areaCoveragePercent / độ phủ xã. */
export function stationCoveragePercent(
  stations: number,
  targetStations: number = TARGET_STATIONS_PER_PROVINCE,
): number {
  if (targetStations <= 0 || stations <= 0) return 0;
  return Math.min(100, Math.round((stations / targetStations) * 1000) / 10);
}

/** @deprecated Thay bằng resolveCoverageLevelFromPercent. */
export function resolveCoverageLevelFromStations(
  stations: number,
  targetStations: number = TARGET_STATIONS_PER_PROVINCE,
): CoverageLevel {
  if (targetStations <= 0 || stations <= 0) return 'thap';
  const pct = (stations / targetStations) * 100;
  return resolveCoverageLevelFromPercent(pct);
}

/** Giữ API cũ cho mock đơn — chỉ còn 3 mức. */
export function resolveCoverageLevel(orders: number, covered: number): CoverageLevel {
  if (orders === 0) return 'thap';
  const cr = (covered / orders) * 100;
  return resolveCoverageLevelFromPercent(cr);
}

export function formatCoverage(value: number | null): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

export function areaTypeLabel(type: AreaType | null): string {
  if (type === 'HIGHWAY') return 'Cao tốc';
  if (type === 'URBAN') return 'Nội đô';
  if (type === 'MOUNTAIN') return 'Vùng núi';
  return 'Chưa gán';
}

export function matchesProvinceRegion(row: ProvinceCoverageRow, region: RegionId | 'all'): boolean {
  if (region === 'all') return true;
  if (row.id === UNASSIGNED_PROVINCE_ID) return false;
  return row.region === region;
}
