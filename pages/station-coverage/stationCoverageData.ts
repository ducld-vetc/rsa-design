import { DB_STATIONS, type DbStationRow } from './stationCoverageFromDb';

export type CoverageLevel = 'cao' | 'trung_binh' | 'thap';
export type AreaType = 'HIGHWAY' | 'URBAN' | 'MOUNTAIN';
export type RegionId = 'bac' | 'trung' | 'nam';
export type MapDisplayMode = 'stations' | 'heatmap';
export type StationType = 'rescue_internal' | 'rescue_external';
export type ProvinceSource = 'code' | 'address' | 'unassigned';

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
  { id: 'rescue_internal', label: 'Trạm nội bộ (Carpla)' },
  { id: 'rescue_external', label: 'Trạm bên ngoài' },
];

export function stationTypeLabel(type: StationType): string {
  if (type === 'rescue_internal') return 'Trạm nội bộ (Carpla)';
  return 'Trạm bên ngoài';
}

export function matchesStationTypeFilter(type: StationType, filter: StationType | 'all'): boolean {
  if (filter === 'all') return true;
  return type === filter;
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
    aliases: ['LSN', 'Lang Son', 'Lạng Sơn'],
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

export function resolveProvince(row: DbStationRow): { def: ProvinceDef; source: ProvinceSource } {
  const fromCode = resolveProvinceFromCode(row.provinceCode);
  if (fromCode) return { def: fromCode, source: 'code' };
  const fromAddress = resolveProvinceFromAddress(row.address);
  if (fromAddress) return { def: fromAddress, source: 'address' };
  return { def: UNASSIGNED_DEF, source: 'unassigned' };
}

export function resolveStationType(row: DbStationRow): StationType {
  if ((row.partnerType ?? '').toUpperCase() === 'INTERNAL') return 'rescue_internal';
  return 'rescue_external';
}

export function resolveAreaType(value: string | null): AreaType | null {
  if (value === 'HIGHWAY' || value === 'URBAN' || value === 'MOUNTAIN') return value;
  return null;
}

export function hasPlottablePosition(lat: number | null, lng: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  // Trong khung bản đồ Việt Nam (cùng VIETNAM_BOUNDS).
  if (lat < 8.35 || lat > 23.45 || lng < 102.12 || lng > 109.55) return false;
  // Tọa độ giả / làm tròn thô (vd. 21,105 · 10,106) — không plot lên map.
  const latWhole = Math.abs(lat - Math.round(lat)) < 1e-6;
  const lngWhole = Math.abs(lng - Math.round(lng)) < 1e-6;
  if (latWhole && lngWhole) return false;
  return true;
}

function partnerLabel(row: DbStationRow): string {
  const name = row.partnerName?.trim();
  return name ? name : 'Chưa gán đối tác';
}

function toMapPoint(row: DbStationRow): MapStationPoint {
  const { def, source } = resolveProvince(row);
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
    position: [row.latitude ?? def.center[0], row.longitude ?? def.center[1]],
  };
}

export const mapStationPoints: MapStationPoint[] = DB_STATIONS.map(toMapPoint);

export const stationsByProvince: Record<string, CoverageStation[]> = mapStationPoints.reduce(
  (acc, station) => {
    const list = acc[station.provinceId] ?? [];
    list.push(station);
    acc[station.provinceId] = list;
    return acc;
  },
  {} as Record<string, CoverageStation[]>,
);

const stationCountByProvince = mapStationPoints.reduce((acc, station) => {
  acc.set(station.provinceId, (acc.get(station.provinceId) ?? 0) + 1);
  return acc;
}, new Map<string, number>());

const GEO_PROVINCE_IDS = PROVINCE_DEFS.map((item) => item.id);

export const provinceCoverageRows: ProvinceCoverageRow[] = GEO_PROVINCE_IDS
  .map((id) => {
    const def = PROVINCE_BY_ID.get(id);
    if (!def) return null;
    const mock = MOCK_ORDERS[id];
    return {
      id: def.id,
      code: def.code,
      name: def.name,
      region: def.region,
      stations: stationCountByProvince.get(id) ?? 0,
      orders90: mock?.orders90 ?? 0,
      covered90: mock?.covered90 ?? 0,
      avgKm90: mock?.avgKm90 ?? null,
      orders12: mock?.orders12 ?? 0,
      covered12: mock?.covered12 ?? 0,
      avgKm12: mock?.avgKm12 ?? null,
    };
  })
  .filter((row): row is ProvinceCoverageRow => row != null)
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

export const unassignedBucket = {
  stations: stationCountByProvince.get(UNASSIGNED_PROVINCE_ID) ?? 0,
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

/**
 * Mục tiêu số trạm active / tỉnh để đạt 100% mật độ (cấu hình sẵn).
 * Chọn 50 theo snapshot prod (~median 33, mean ~40 trên 34 tỉnh):
 * Cao ≥ 40 trạm · Trung bình ≥ 25 · Thấp < 25.
 */
export const TARGET_STATIONS_PER_PROVINCE = 50;

/** Preview: % mật độ = số trạm / mục tiêu cấu hình (trần 100%). */
export function stationCoveragePercent(
  stations: number,
  targetStations: number = TARGET_STATIONS_PER_PROVINCE,
): number {
  if (targetStations <= 0 || stations <= 0) return 0;
  return Math.min(100, Math.round((stations / targetStations) * 1000) / 10);
}

export function resolveCoverageLevelFromStations(
  stations: number,
  targetStations: number = TARGET_STATIONS_PER_PROVINCE,
): CoverageLevel {
  if (targetStations <= 0 || stations <= 0) return 'thap';
  const pct = (stations / targetStations) * 100;
  if (pct >= 80) return 'cao';
  if (pct >= 50) return 'trung_binh';
  return 'thap';
}

/** Giữ API cũ cho mock đơn — chỉ còn 3 mức. */
export function resolveCoverageLevel(orders: number, covered: number): CoverageLevel {
  if (orders === 0) return 'thap';
  const cr = (covered / orders) * 100;
  if (cr >= 80) return 'cao';
  if (cr >= 50) return 'trung_binh';
  return 'thap';
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
