/** Hệ thống cấu hình phí cứu hộ — model, mock data, engine chọn bảng & tính từng dòng */

export type CustomerType = 'PACKAGE' | 'RETAIL' | 'RETAIL_BUSINESS';
export type PartnerType = 'INTERNAL' | 'EXTERNAL';
export type ServiceType = 'ONSITE' | 'TOWING' | 'CRANE';
export type SurchargeType = 'FIXED' | 'COEFFICIENT';
export type FeeTarget = 'CUSTOMER' | 'PARTNER';
export type FeeObjectType =
  | 'PARTNER_INTERNAL'
  | 'PARTNER_EXTERNAL'
  | 'CUSTOMER_INDIVIDUAL'
  | 'CUSTOMER_BUSINESS';
export type FeeOrderType = 'PACKAGE' | 'SINGLE' | 'PACKAGE_SINGLE';
export type FeeTableStatus = 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
export type FeeSourceLabel = 'VETC' | 'NCC' | 'Thủ công' | string;
export type RoundMode = 'NEAREST_1000' | 'NEAREST_100' | 'NONE';
export type CriterionRole = 'PRICE' | 'SURCHARGE' | 'BOTH';
export type CriterionValueType = 'LIST' | 'RANGE' | 'TIME';
export type ServicePricingMode = 'FIXED' | 'PER_UNIT';

export interface FeeRuleCondition {
  criterionKey: string;
  criterionLabel: string;
  operator: '=' | 'IN' | 'BETWEEN' | '>=' | '<=';
  value: string | number | [number, number] | string[];
  /** Biên dưới BETWEEN: true = bao gồm (≥), false = không bao gồm (>). Mặc định true khi thiếu. */
  fromInclusive?: boolean;
  /** Biên trên BETWEEN: true = bao gồm (≤), false = không bao gồm (<). Mặc định true khi thiếu. */
  toInclusive?: boolean;
}

export interface FeeCriterion {
  id: string;
  key: string;
  label: string;
  operator: '=' | 'IN' | 'BETWEEN' | '>=' | '<=';
  value: string | number | [number, number] | string[];
  group?: 'AND' | 'OR';
  role?: CriterionRole;
  allowedValues?: string[];
  valueType?: CriterionValueType;
}

export interface SurchargeRule {
  id: string;
  name: string;
  type: SurchargeType;
  value: number;
  activeWhen: string;
  /** Phụ phí bắt buộc gắn ít nhất một tiêu chí phụ có cấu trúc. */
  conditions: FeeRuleCondition[];
  stackable?: boolean;
  exclusiveGroup?: string;
  capAmount?: number;
  /** Ngày lễ/Tết áp dụng phụ phí, định dạng YYYY-MM-DD. */
  holidayDates?: string[];
}

export interface ServicePriceRule {
  id: string;
  serviceType: ServiceType;
  serviceDetail: string;
  basePrice: number;
  /** FIXED: thu một lần khi đi vào bậc; PER_UNIT: nhân số đơn vị nằm trong bậc. */
  pricingMode?: ServicePricingMode;
  /** Kéo xe: số km bao gồm trong giá mở cửa */
  includedKm?: number;
  /** Kéo xe: đơn giá mỗi km vượt */
  pricePerExtraKm?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Cẩu: vị trí so với mặt đường */
  roadPosition?: 'ROAD' | 'BELOW_ROAD' | 'SLOPE';
  unit?: string;
  /** Ma trận giá: cùng dịch vụ nhưng bộ giá trị tiêu chí khác nhau sẽ có giá khác nhau. */
  conditions?: FeeRuleCondition[];
}

export interface PriceTableScope {
  corporateCustomerId?: string;
  partnerId?: string;
  partnerName?: string;
  areas?: string[];
  serviceTypes?: ServiceType[];
  vehicleTypes?: string[];
}

export interface PriceTable {
  id: string;
  code: string;
  name: string;
  target: FeeTarget;
  objectType: FeeObjectType;
  orderType: FeeOrderType;
  applyFor: string;
  version: number;
  status: FeeTableStatus;
  validFrom: string;
  validTo: string;
  scope: PriceTableScope;
  /** Tiêu chí chọn bảng (doanh nghiệp/NCC/loại khách). */
  criteria: FeeCriterion[];
  /** Danh mục tiêu chí dùng để tạo ma trận giá bên trong bảng. */
  priceCriteria?: FeeCriterion[];
  serviceRules: ServicePriceRule[];
  surchargeRules: SurchargeRule[];
  settings: FeeTableSettings;
  updatedAt: string;
  updatedBy: string;
}

export interface FeeVersionHistoryItem {
  id: string;
  tableId: string;
  version: number;
  status: FeeTableStatus;
  activatedAt?: string;
  activatedBy?: string;
  note: string;
  changes: string[];
}

export interface FeeTableSettings {
  retailMarkupFactor: number;
  roundMode: RoundMode;
  isFallback: boolean;
  stackSurcharges: boolean;
  /** Giá trong bảng đã bao gồm VAT hay chưa (cờ cấu hình; không tự tách/cộng VAT khi tính). */
  includesVat: boolean;
}

export interface FeeServiceLineInput {
  serviceName: string;
  serviceType: ServiceType;
  serviceDetail?: string;
  distanceKm?: number;
  roadPosition?: 'ROAD' | 'BELOW_ROAD' | 'SLOPE';
  quantity?: number;
  /** Giá trị tiêu chí thực tế của dòng dịch vụ. */
  criteria?: Record<string, string | number | boolean>;
}

export interface FeeCalculationInput {
  customerType: CustomerType;
  partnerType: PartnerType;
  corporateCustomerId?: string;
  partnerId?: string;
  partnerName?: string;
  weather?: 'NORMAL' | 'RAIN' | 'STORM';
  isNight?: boolean;
  /** Giờ yêu cầu cứu hộ (HH:mm) — khớp tiêu chí timeWindow From–To */
  requestTime?: string;
  /** Giờ thực hiện cứu hộ (HH:mm) — khớp tiêu chí executionTimeWindow From–To */
  executionTime?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  locationType?: 'ROAD' | 'BASEMENT' | 'ALLEY' | 'SLOPE';
  isHighway?: boolean;
  /** Tuyến cao tốc cụ thể (CT.01 … CT.42) — dùng khớp tiêu chí Vị trí trên cao tốc */
  highwayRoute?: string;
  packageBenefitAmount?: number;
  asOfDate?: string;
  lines: FeeServiceLineInput[];
}

export interface SurchargeBreakdownItem {
  name: string;
  type: SurchargeType;
  /** Hệ số (COEFFICIENT) hoặc số tiền (FIXED) */
  value: number;
}

export interface SurchargeApplicationResult {
  amount: number;
  labels: string[];
  coefficient: number;
  items: SurchargeBreakdownItem[];
  /** Mô tả cách ghép hệ số: nhân / lấy max */
  coefficientFormula: string;
  fixedTotal: number;
}

export interface CalculatedFeeLine {
  serviceName: string;
  serviceType: ServiceType;
  partnerAmount: number;
  customerAmount: number;
  fixedPrice: number;
  /** Hệ số phụ phí phía KH (hoặc markup khách lẻ) */
  coefficient: number;
  /** Hệ số phụ phí phía NCC */
  partnerCoefficient: number;
  discount: number;
  adjustmentLabels: string[];
  partnerAdjustmentLabels?: string[];
  customerSurchargeItems?: SurchargeBreakdownItem[];
  partnerSurchargeItems?: SurchargeBreakdownItem[];
  customerCoefficientFormula?: string;
  partnerCoefficientFormula?: string;
  partnerSource: FeeSourceLabel;
  customerSource: FeeSourceLabel;
  formulaNote: string;
}

export interface FeeSnapshot {
  partnerTableId: string;
  partnerTableCode: string;
  partnerTableName: string;
  partnerVersion: number;
  customerTableId?: string;
  customerTableCode?: string;
  customerTableName?: string;
  customerVersion?: number;
  retailMarkupFactor?: number;
  customerFeeMode: 'PUBLIC' | 'RETAIL' | 'RETAIL_MARKUP' | 'BUSINESS' | 'PACKAGE_PUBLIC';
  calculatedAt: string;
  input: FeeCalculationInput;
}

export interface FeeBreakdown {
  lines: CalculatedFeeLine[];
  partnerFee: number;
  customerFee: number;
  margin: number;
  snapshot: FeeSnapshot;
  error?: string;
}

export const CRITERIA_CATALOG = [
  'Trọng tải',
  'Số chỗ',
  'Loại phương tiện gặp sự cố',
  'Loại phương tiện cứu hộ',
  'Khoảng cách so với mặt đất',
  'Tư thế xe cẩu (>150m)',
  'Quãng đường kéo',
  'Địa hình khu vực',
  'Cao tốc',
  'Giờ yêu cầu cứu hộ',
  'Thời tiết / thiên tai',
  'Vị trí đặc biệt',
  'Thiết bị thêm',
] as const;

export const CRITERIA_SYSTEM_CONFIG: Record<
  (typeof CRITERIA_CATALOG)[number],
  { key: string; valueType: CriterionValueType; values: string[] }
> = {
  /** Alias legacy — cùng nghĩa load_capacity (bảng cũ còn dùng key payload) */
  'Trọng tải': { key: 'payload', valueType: 'RANGE', values: [] },
  'Số chỗ': { key: 'seats', valueType: 'RANGE', values: [] },
  'Loại phương tiện gặp sự cố': {
    key: 'vehicleType',
    valueType: 'LIST',
    values: ['Xe chở người', 'Xe chở hàng'],
  },
  'Loại phương tiện cứu hộ': {
    key: 'rescueVehicleType',
    valueType: 'LIST',
    values: ['Xe máy', 'Xe van', 'Xe sàn trượt', 'Xe cẩu, kéo'],
  },
  'Khoảng cách so với mặt đất': { key: 'roadDistance', valueType: 'RANGE', values: [] },
  'Tư thế xe cẩu (>150m)': {
    key: 'cranePosture',
    valueType: 'LIST',
    values: ['Nghiêng', 'Ngửa'],
  },
  'Quãng đường kéo': { key: 'distanceKm', valueType: 'RANGE', values: [] },
  'Địa hình khu vực': {
    key: 'areaTerrain',
    valueType: 'LIST',
    values: ['NORMAL', 'SUBURBAN', 'MOUNTAIN'],
  },
  'Cao tốc': { key: 'isHighway', valueType: 'LIST', values: ['YES', 'NO'] },
  'Giờ yêu cầu cứu hộ': { key: 'timeWindow', valueType: 'TIME', values: [] },
  'Thời tiết / thiên tai': {
    key: 'weather',
    valueType: 'LIST',
    values: ['Bình thường', 'Mưa', 'Thiên tai / ngập lụt diện rộng', 'Bão'],
  },
  'Vị trí đặc biệt': { key: 'locationType', valueType: 'LIST', values: ['ROAD', 'BASEMENT'] },
  'Thiết bị thêm': {
    key: 'extraEquipment',
    valueType: 'LIST',
    values: ['DOLLY', 'DOUBLE_JACK'],
  },
};

/** Tiêu chí bổ sung (key schema PTI) — song song seats/payload legacy */
export const EXTRA_FEE_CRITERION_DEFINITIONS: Array<{
  id: string;
  key: string;
  label: string;
  valueType: CriterionValueType;
  values: string[];
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}> = [
  {
    id: 'FEE-CRITERION-SEAT-NUMBER',
    key: 'seat_number',
    label: 'Số chỗ (seat_number)',
    valueType: 'RANGE',
    values: [],
    status: 'ACTIVE',
    updatedAt: '2026-08-03 15:00',
  },
  {
    id: 'FEE-CRITERION-LOAD-CAPACITY',
    key: 'load_capacity',
    label: 'Trọng tải tấn (load_capacity)',
    valueType: 'RANGE',
    values: [],
    status: 'ACTIVE',
    updatedAt: '2026-08-03 15:00',
  },
];

export interface FeeCriterionDefinition {
  id: string;
  key: string;
  label: string;
  valueType: CriterionValueType;
  values: string[];
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}

export let feeCriterionDefinitions: FeeCriterionDefinition[] = [
  ...CRITERIA_CATALOG.map((label, index) => ({
    id: `FEE-CRITERION-${index + 1}`,
    label,
    ...CRITERIA_SYSTEM_CONFIG[label],
    status: 'ACTIVE' as const,
    updatedAt: '2026-07-30 10:00',
  })),
  ...EXTRA_FEE_CRITERION_DEFINITIONS,
];

export const upsertFeeCriterionDefinition = (definition: FeeCriterionDefinition): void => {
  const index = feeCriterionDefinitions.findIndex((item) => item.id === definition.id);
  feeCriterionDefinitions =
    index >= 0
      ? [
          ...feeCriterionDefinitions.slice(0, index),
          definition,
          ...feeCriterionDefinitions.slice(index + 1),
        ]
      : [...feeCriterionDefinitions, definition];
};

/** Danh mục phí phát sinh — chọn khi thêm “Dịch vụ khác” trên đơn */
export interface IncidentalFeeDefinition {
  id: string;
  code: string;
  name: string;
  suggestedPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  /** Mục “Khác” — luôn hiện cuối danh sách chọn */
  isCatchAll?: boolean;
  updatedAt: string;
}

const INITIAL_INCIDENTAL_FEES: IncidentalFeeDefinition[] = [
  {
    id: 'INCIDENTAL-1',
    code: 'night-support',
    name: 'Hỗ trợ ngoài giờ',
    suggestedPrice: 250000,
    status: 'ACTIVE',
    updatedAt: '2026-07-30 10:00',
  },
  {
    id: 'INCIDENTAL-2',
    code: 'highway-support',
    name: 'Phụ phí cao tốc',
    suggestedPrice: 300000,
    status: 'ACTIVE',
    updatedAt: '2026-07-30 10:00',
  },
  {
    id: 'INCIDENTAL-3',
    code: 'rain-storm-support',
    name: 'Phụ phí mưa bão',
    suggestedPrice: 350000,
    status: 'ACTIVE',
    updatedAt: '2026-07-30 10:00',
  },
  {
    id: 'INCIDENTAL-4',
    code: 'remote-area-support',
    name: 'Phụ phí khu vực xa',
    suggestedPrice: 400000,
    status: 'ACTIVE',
    updatedAt: '2026-07-30 10:00',
  },
  {
    id: 'INCIDENTAL-5',
    code: 'parking-basement-support',
    name: 'Hỗ trợ tầng hầm/bãi đỗ',
    suggestedPrice: 280000,
    status: 'ACTIVE',
    updatedAt: '2026-07-30 10:00',
  },
  {
    id: 'INCIDENTAL-6',
    code: 'custom-other',
    name: 'Khác',
    suggestedPrice: 200000,
    status: 'ACTIVE',
    isCatchAll: true,
    updatedAt: '2026-07-30 10:00',
  },
];

export let incidentalFeeDefinitions: IncidentalFeeDefinition[] = [...INITIAL_INCIDENTAL_FEES];

export const upsertIncidentalFeeDefinition = (definition: IncidentalFeeDefinition): void => {
  const index = incidentalFeeDefinitions.findIndex((item) => item.id === definition.id);
  incidentalFeeDefinitions =
    index >= 0
      ? [
          ...incidentalFeeDefinitions.slice(0, index),
          definition,
          ...incidentalFeeDefinitions.slice(index + 1),
        ]
      : [...incidentalFeeDefinitions, definition];
};

/** Options ACTIVE cho droplist đơn hàng (Khác luôn cuối) */
export const getActiveIncidentalFeeOptions = (): Array<{
  value: string;
  label: string;
  suggestedPrice: number;
}> => {
  const active = incidentalFeeDefinitions.filter((item) => item.status === 'ACTIVE');
  const normal = active.filter((item) => !item.isCatchAll);
  const catchAll = active.filter((item) => item.isCatchAll);
  return [...normal, ...catchAll].map((item) => ({
    value: item.code,
    label: item.name,
    suggestedPrice: item.suggestedPrice,
  }));
};

export const FEE_SERVICE_CATALOG: Array<{
  value: string;
  type: ServiceType;
  /** Dịch vụ con — áp dụng cho Kéo xe / Cẩu xe */
  children?: readonly string[];
}> = [
  { value: 'Kích bình ắc quy', type: 'ONSITE' },
  { value: 'Kích bình', type: 'ONSITE' },
  { value: 'Vá lốp tại chỗ', type: 'ONSITE' },
  { value: 'Thay lốp dự phòng', type: 'ONSITE' },
  { value: 'Cung cấp nhiên liệu khẩn cấp (xăng, dầu, nước làm mát)', type: 'ONSITE' },
  { value: 'Cung cấp nhiên liệu (xăng, dầu, nước làm mát)', type: 'ONSITE' },
  { value: 'Thủy kích', type: 'ONSITE' },
  {
    value: 'Kéo xe',
    type: 'TOWING',
    children: [
      'Kéo xe về gara',
      'Kéo xe đường dài',
      'Kéo xe bằng sàn trượt',
      'Kéo xe không giới hạn khoảng cách',
    ],
  },
  {
    value: 'Cẩu xe',
    type: 'CRANE',
    children: [
      'Cẩu xe mặt đường',
      'Cẩu xe dưới mặt đường',
      'Cẩu xe taluy/mương',
      'Cẩu xe từ tầng hầm',
    ],
  },
];

/** Resolve loại dịch vụ từ tên đầu dịch vụ hoặc dịch vụ con */
export const resolveFeeServiceType = (serviceDetail: string): ServiceType | undefined => {
  const direct = FEE_SERVICE_CATALOG.find((item) => item.value === serviceDetail);
  if (direct) return direct.type;
  const parent = FEE_SERVICE_CATALOG.find((item) => item.children?.includes(serviceDetail));
  return parent?.type;
};

export const FEE_SURCHARGE_CATALOG = [
  {
    name: 'Hủy đơn',
    criterionKey: 'orderCancelled',
    criterionLabel: 'Hủy đơn',
    value: 'Có',
  },
  {
    name: 'Bánh phụ',
    criterionKey: 'spareWheel',
    criterionLabel: 'Bánh phụ',
    value: 'Có',
  },
  {
    name: 'Khu vực',
    criterionKey: 'area',
    criterionLabel: 'Khu vực',
    value: 'Ngoại thành',
  },
  {
    name: 'Thời tiết',
    criterionKey: 'weather',
    criterionLabel: 'Thời tiết',
    value: 'Bão',
  },
  {
    name: 'Mức độ nghiêm trọng',
    criterionKey: 'severity',
    criterionLabel: 'Mức độ nghiêm trọng',
    value: 'Nặng',
  },
  {
    name: 'Thời gian yêu cầu cứu hộ',
    criterionKey: 'timeWindow',
    criterionLabel: 'Thời gian yêu cầu cứu hộ',
    value: '22:00-06:00',
  },
  {
    name: 'Thời gian thực hiện cứu hộ',
    criterionKey: 'executionTimeWindow',
    criterionLabel: 'Thời gian thực hiện cứu hộ',
    value: '22:00-06:00',
  },
  {
    name: 'Khu vực đặc biệt (Hầm)',
    criterionKey: 'locationType',
    criterionLabel: 'Loại vị trí',
    value: 'Tầng hầm',
  },
  {
    name: 'Tuyến cao tốc',
    criterionKey: 'isHighway',
    criterionLabel: 'Vị trí trên cao tốc',
    value: 'Cao tốc Bắc – Nam phía Đông (CT.01)',
  },
  {
    name: 'Lễ/Tết',
    criterionKey: 'holiday',
    criterionLabel: 'Lễ/Tết',
    value: 'Có',
    requiresHolidayDates: true,
  },
] as const;

/** Danh mục tuyến cao tốc — giá trị tiêu chí Vị trí trên cao tốc */
export const HIGHWAY_ROUTE_VALUES = [
  'Cao tốc Bắc – Nam phía Đông (CT.01)',
  'Cao tốc Bắc – Nam phía Tây (CT.02)',
  'Hà Nội – Hòa Bình – Sơn La – Điện Biên (CT.03)',
  'Hà Nội – Hải Phòng (CT.04)',
  'Nội Bài – Hạ Long – Móng Cái (CT.05)',
  'Hà Nội – Lào Cai (CT.06)',
  'Tuyên Quang – Phú Thọ (CT.07)',
  'Ninh Bình – Hải Phòng (CT.08)',
  'Ninh Bình – Thanh Hóa (CT.09)',
  'Thanh Hóa – Hà Tĩnh (CT.10)',
  'Phủ Lý – Nam Định (CT.11)',
  'Tuyến nối Hà Nội – Lào Cai với Hà Giang (CT.12)',
  'Bảo Hà – Lai Châu (CT.13)',
  'Chợ Bến – Yên Mỹ (CT.14)',
  'Tuyên Quang – Hà Giang (CT.15)',
  'Hưng Yên – Thái Bình (CT.16)',
  'Vinh – Thanh Thủy (CT.17)',
  'Vũng Áng – Cha Lo (CT.18)',
  'Cam Lộ – Lao Bảo (CT.19)',
  'Quy Nhơn – Pleiku – Lệ Thanh (CT.20)',
  'Đà Nẵng – Thạch Mỹ – Ngọc Hồi – Bờ Y (CT.21)',
  'Quảng Ngãi – Kon Tum (CT.22)',
  'Quảng Ngãi – Quy Nhơn (CT.23)',
  'Quy Nhơn – Nha Trang (CT.24)',
  'Nha Trang – Liên Khương (CT.25)',
  'Nha Trang – Buôn Ma Thuột (CT.26)',
  'Dầu Giây – Liên Khương (CT.27)',
  'Biên Hòa – Vũng Tàu (CT.28)',
  'Thành phố Hồ Chí Minh – Chơn Thành – Hoa Lư (CT.29)',
  'Thành phố Hồ Chí Minh – Mộc Bài (CT.30)',
  'Thành phố Hồ Chí Minh – Trung Lương – Mỹ Thuận – Cần Thơ – Cà Mau (CT.31)',
  'Châu Đốc – Cần Thơ – Sóc Trăng (CT.32)',
  'Hà Tiên – Rạch Giá – Bạc Liêu (CT.33)',
  'Hồng Ngự – Trà Vinh (CT.34)',
  'Thành phố Hồ Chí Minh – Tiền Giang – Bến Tre – Trà Vinh – Sóc Trăng (CT.35)',
  'Cần Thơ – Cà Mau (CT.36)',
  'Vành đai 3 Hà Nội (CT.37)',
  'Vành đai 4 Hà Nội (CT.38)',
  'Vành đai 5 Hà Nội (CT.39)',
  'Vành đai 3 Thành phố Hồ Chí Minh (CT.40)',
  'Vành đai 4 Thành phố Hồ Chí Minh (CT.41)',
  'Vành đai 5 Thành phố Hồ Chí Minh (CT.42)',
] as const;

export const SURCHARGE_CRITERIA_CATALOG = [
  {
    key: 'orderCancelled',
    label: 'Hủy đơn',
    values: ['Có', 'Không'],
  },
  {
    key: 'spareWheel',
    label: 'Bánh phụ',
    values: ['Có', 'Không'],
  },
  {
    key: 'area',
    label: 'Khu vực',
    values: ['Nội thành', 'Ngoại thành', 'Tỉnh lân cận'],
  },
  {
    key: 'weather',
    label: 'Thời tiết',
    values: ['Bình thường', 'Mưa', 'Mưa lớn', 'Bão'],
  },
  {
    key: 'severity',
    label: 'Mức độ nghiêm trọng',
    values: ['Nhẹ', 'Trung bình', 'Nặng', 'Đặc biệt nghiêm trọng'],
  },
  {
    key: 'timeWindow',
    label: 'Thời gian yêu cầu cứu hộ',
    valueType: 'TIME_RANGE' as const,
    values: ['22:00', '06:00'],
  },
  {
    key: 'executionTimeWindow',
    label: 'Thời gian thực hiện cứu hộ',
    valueType: 'TIME_RANGE' as const,
    values: ['22:00', '06:00'],
  },
  {
    key: 'locationType',
    label: 'Loại vị trí',
    values: ['Mặt đường', 'Tầng hầm', 'Ngõ hẹp', 'Taluy/mương'],
  },
  {
    key: 'isHighway',
    label: 'Vị trí trên cao tốc',
    values: [...HIGHWAY_ROUTE_VALUES],
  },
  {
    key: 'holiday',
    label: 'Lễ/Tết',
    values: ['Có', 'Không'],
  },
] as const;

export const TIME_SURCHARGE_CRITERION_KEYS = new Set([
  'timeWindow',
  'executionTimeWindow',
]);

export const isTimeSurchargeCriterion = (key?: string): boolean =>
  Boolean(key && TIME_SURCHARGE_CRITERION_KEYS.has(key));

export const DEFAULT_TIME_RANGE: [string, string] = ['22:00', '06:00'];

export const parseTimeToMinutes = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time).trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
};

/** Khoảng giờ có thể qua đêm (VD 22:00–06:00). */
export const isTimeInRange = (
  actual: string | number | undefined,
  from: string,
  to: string
): boolean => {
  const actualMin =
    typeof actual === 'number' && Number.isFinite(actual)
      ? actual
      : parseTimeToMinutes(String(actual ?? ''));
  const fromMin = parseTimeToMinutes(from);
  const toMin = parseTimeToMinutes(to);
  if (actualMin == null || fromMin == null || toMin == null) return false;
  if (fromMin <= toMin) return actualMin >= fromMin && actualMin <= toMin;
  return actualMin >= fromMin || actualMin <= toMin;
};

export const formatTimeRangeLabel = (value: FeeRuleCondition['value']): string => {
  if (Array.isArray(value) && value.length >= 2) {
    return `${value[0] || '—'} – ${value[1] || '—'}`;
  }
  return String(value ?? '');
};

export const FEE_OBJECT_TYPE_LABELS: Record<FeeObjectType, string> = {
  CUSTOMER_INDIVIDUAL: 'KH cá nhân',
  CUSTOMER_BUSINESS: 'KH doanh nghiệp',
  PARTNER_INTERNAL: 'NCC nội bộ',
  PARTNER_EXTERNAL: 'NCC bên ngoài',
};

export const FEE_ORDER_TYPE_LABELS: Record<FeeOrderType, string> = {
  PACKAGE: 'Đơn gói',
  SINGLE: 'Đơn lẻ',
  PACKAGE_SINGLE: 'Đơn gói / đơn lẻ',
};

/** Catalog mã DN dùng cho droplist form / filter */
export const FEE_CORPORATE_CUSTOMER_OPTIONS: Array<{ code: string; name: string }> = [
  { code: 'PTI', name: 'PTI' },
  { code: 'FORD', name: 'Ford Vietnam' },
  { code: 'TOYOTA', name: 'Toyota Vietnam' },
  { code: 'DN001', name: 'Công ty TNHH ABC Logistics' },
  { code: 'DN002', name: 'Công ty Cổ phần XYZ Transport' },
  { code: 'DN003', name: 'Tập đoàn DEF Holdings' },
  { code: 'DN004', name: 'Công ty TNHH GHI Services' },
  { code: 'DN005', name: 'Công ty Cổ phần JKL Group' },
];

/** Catalog NCC dùng cho droplist form / filter */
export const FEE_PARTNER_OPTIONS: Array<{ id: string; name: string }> = [
  { id: 'PARTNER-RESCUEPRO', name: 'RescuePro Partner' },
  { id: 'PARTNER-SAFETYGO', name: 'SafetyGo Partner' },
  { id: 'PARTNER-FASTTOW', name: 'FastTow Partner' },
  { id: 'INTERNAL-VETC', name: 'VETC Rescue nội bộ' },
];

export const FEE_STATUS_LABELS: Record<FeeTableStatus, string> = {
  ACTIVE: 'Đang hiệu lực',
  EXPIRED: 'Hết hiệu lực',
  INACTIVE: 'Ngừng hiệu lực',
};

export const FEE_TARGET_LABELS: Record<FeeTarget, string> = {
  CUSTOMER: 'Khách hàng',
  PARTNER: 'Đối tác cứu hộ',
};

const sharedSurcharges: SurchargeRule[] = [
  {
    id: 'time-window',
    name: 'Thời gian yêu cầu cứu hộ',
    type: 'COEFFICIENT',
    value: 1.15,
    activeWhen: 'timeWindow=22:00-06:00',
    conditions: [
      {
        criterionKey: 'timeWindow',
        criterionLabel: 'Thời gian yêu cầu cứu hộ',
        operator: 'BETWEEN',
        value: ['22:00', '06:00'],
      },
    ],
    stackable: true,
  },
  {
    id: 'weather',
    name: 'Thời tiết',
    type: 'FIXED',
    value: 250000,
    activeWhen: 'weather=Bão',
    conditions: [
      {
        criterionKey: 'weather',
        criterionLabel: 'Thời tiết',
        operator: '=',
        value: 'Bão',
      },
    ],
    stackable: true,
  },
  {
    id: 'holiday',
    name: 'Lễ/Tết',
    type: 'FIXED',
    value: 300000,
    activeWhen: 'holiday=Có',
    conditions: [
      {
        criterionKey: 'holiday',
        criterionLabel: 'Lễ/Tết',
        operator: '=',
        value: 'Có',
      },
    ],
    holidayDates: ['2026-01-01', '2026-02-17', '2026-04-30', '2026-05-01', '2026-09-02'],
    stackable: true,
  },
];

/** Danh sách ngày lễ/Tết hệ thống (mock) — dùng nút “Lấy từ hệ thống” trên form phụ phí. */
export const SYSTEM_HOLIDAY_DATES: string[] = [
  '2026-01-01',
  '2026-02-14',
  '2026-02-15',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-04-30',
  '2026-05-01',
  '2026-09-02',
];

const DEFAULT_TABLE_SETTINGS: FeeTableSettings = {
  retailMarkupFactor: 0,
  roundMode: 'NEAREST_1000',
  isFallback: false,
  stackSurcharges: true,
  includesVat: false,
};

/** Bảng chỉ áp dụng hệ số × giá (không cấu hình ma trận dòng giá / phụ phí). */
export const usesRetailMarkupOnlyPricing = (
  table: Pick<PriceTable, 'objectType' | 'orderType' | 'settings'>
): boolean =>
  table.objectType === 'CUSTOMER_INDIVIDUAL' &&
  table.orderType === 'SINGLE' &&
  Number(table.settings.retailMarkupFactor) > 0;

export const RETAIL_MARKUP_DEFAULT_FACTOR = 1.5;

export let rescueFeeTables: PriceTable[] = [
  {
    id: 'SUP-INTERNAL-001',
    code: 'SUP-INT-001',
    name: 'Bảng giá NCC nội bộ',
    target: 'PARTNER',
    objectType: 'PARTNER_INTERNAL',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'NCC nội bộ',
    version: 3,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: { serviceTypes: ['ONSITE', 'TOWING', 'CRANE'] },
    criteria: [
      { id: 'c1', key: 'partnerType', label: 'Loại NCC', operator: '=', value: 'INTERNAL', group: 'AND' },
    ],
    priceCriteria: [
      {
        id: 'pc-payload',
        key: 'payload',
        label: 'Trọng tải',
        operator: 'BETWEEN',
        value: ['', ''],
        role: 'PRICE',
        valueType: 'RANGE',
        allowedValues: [],
      },
      {
        id: 'pc-vehicle',
        key: 'vehicleType',
        label: 'Loại phương tiện gặp sự cố',
        operator: 'IN',
        value: ['Xe chở người', 'Xe chở hàng'],
        role: 'PRICE',
        allowedValues: ['Xe chở người', 'Xe chở hàng'],
      },
    ],
    serviceRules: [
      {
        id: 'sr1',
        serviceType: 'ONSITE',
        serviceDetail: 'Kích bình ắc quy',
        basePrice: 300000,
      },
      {
        id: 'sr1-heavy',
        serviceType: 'ONSITE',
        serviceDetail: 'Kích bình ắc quy',
        basePrice: 450000,
        conditions: [
          {
            criterionKey: 'payload',
            criterionLabel: 'Trọng tải',
            operator: 'BETWEEN',
            value: [3.5, 7],
          },
        ],
      },
      {
        id: 'sr2',
        serviceType: 'ONSITE',
        serviceDetail: 'Xe hết pin',
        basePrice: 500000,
      },
      {
        id: 'sr3',
        serviceType: 'ONSITE',
        serviceDetail: 'Đâm, tai nạn, lật',
        basePrice: 1000000,
      },
      {
        id: 'sr4',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 100000,
        pricingMode: 'FIXED',
        unit: 'lượt',
        conditions: [
          {
            criterionKey: 'distanceKm',
            criterionLabel: 'Khoảng cách kéo xe',
            operator: 'BETWEEN',
            value: [1, 10],
          },
        ],
      },
      {
        id: 'sr4-tier-2',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 10000,
        pricingMode: 'PER_UNIT',
        unit: 'km',
        conditions: [
          {
            criterionKey: 'distanceKm',
            criterionLabel: 'Khoảng cách kéo xe',
            operator: 'BETWEEN',
            value: [10, 20],
          },
        ],
      },
      {
        id: 'sr4-tier-3',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 20000,
        pricingMode: 'PER_UNIT',
        unit: 'km',
        conditions: [
          {
            criterionKey: 'distanceKm',
            criterionLabel: 'Khoảng cách kéo xe',
            operator: 'BETWEEN',
            value: [20, 30],
          },
        ],
      },
      {
        id: 'sr5',
        serviceType: 'CRANE',
        serviceDetail: 'Cẩu xe',
        basePrice: 900000,
        roadPosition: 'ROAD',
        conditions: [
          {
            criterionKey: 'roadDistance',
            criterionLabel: 'Khoảng cách so với mặt đường',
            operator: 'BETWEEN',
            value: [0, 1],
          },
        ],
      },
      {
        id: 'sr6',
        serviceType: 'CRANE',
        serviceDetail: 'Cẩu xe',
        basePrice: 1500000,
        roadPosition: 'BELOW_ROAD',
        conditions: [
          {
            criterionKey: 'roadDistance',
            criterionLabel: 'Khoảng cách so với mặt đường',
            operator: 'BETWEEN',
            value: [1, 3],
          },
        ],
      },
      {
        id: 'sr7',
        serviceType: 'CRANE',
        serviceDetail: 'Cẩu xe',
        basePrice: 2000000,
        roadPosition: 'SLOPE',
        conditions: [
          {
            criterionKey: 'roadDistance',
            criterionLabel: 'Khoảng cách so với mặt đường',
            operator: 'BETWEEN',
            value: [3, 5],
          },
        ],
      },
    ],
    surchargeRules: sharedSurcharges,
    settings: { ...DEFAULT_TABLE_SETTINGS },
    updatedAt: '2026-07-01 10:00',
    updatedBy: 'admin',
  },
  {
    id: 'SUP-EXTERNAL-FALLBACK-001',
    code: 'SUP-EXT-FB-001',
    name: 'Bảng giá fallback NCC bên ngoài',
    target: 'PARTNER',
    objectType: 'PARTNER_EXTERNAL',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'NCC bên ngoài không có bảng riêng',
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: { serviceTypes: ['ONSITE', 'TOWING', 'CRANE'] },
    criteria: [
      { id: 'c1', key: 'partnerType', label: 'Loại NCC', operator: '=', value: 'EXTERNAL', group: 'AND' },
    ],
    priceCriteria: [],
    serviceRules: [
      { id: 'sr1', serviceType: 'ONSITE', serviceDetail: 'Hỗ trợ tại chỗ', basePrice: 350000 },
      { id: 'sr2', serviceType: 'ONSITE', serviceDetail: 'Kích bình ắc quy', basePrice: 350000 },
      { id: 'sr3', serviceType: 'ONSITE', serviceDetail: 'Xe hết pin', basePrice: 550000 },
      {
        id: 'sr4',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 550000,
        includedKm: 10,
        pricePerExtraKm: 35000,
        unit: '10km đầu',
      },
      {
        id: 'sr5',
        serviceType: 'CRANE',
        serviceDetail: 'Cẩu xe',
        basePrice: 1100000,
        roadPosition: 'ROAD',
      },
    ],
    surchargeRules: sharedSurcharges,
    settings: { ...DEFAULT_TABLE_SETTINGS, isFallback: true },
    updatedAt: '2026-06-15 09:00',
    updatedBy: 'admin',
  },
  {
    id: 'SUP-EXTERNAL-PARTNER-A',
    code: 'SUP-EXT-A-001',
    name: 'Bảng giá riêng đối tác RescuePro',
    target: 'PARTNER',
    objectType: 'PARTNER_EXTERNAL',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'RescuePro',
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: {
      partnerId: 'PARTNER-RESCUEPRO',
      partnerName: 'RescuePro',
      serviceTypes: ['ONSITE', 'TOWING', 'CRANE'],
    },
    criteria: [
      { id: 'c1', key: 'partnerId', label: 'Mã NCC', operator: '=', value: 'PARTNER-RESCUEPRO', group: 'AND' },
    ],
    priceCriteria: [],
    serviceRules: [
      { id: 'sr1', serviceType: 'ONSITE', serviceDetail: 'Kích bình ắc quy', basePrice: 320000 },
      { id: 'sr2', serviceType: 'ONSITE', serviceDetail: 'Xe hết pin', basePrice: 480000 },
      {
        id: 'sr3',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 520000,
        includedKm: 10,
        pricePerExtraKm: 32000,
      },
    ],
    surchargeRules: sharedSurcharges,
    settings: { ...DEFAULT_TABLE_SETTINGS },
    updatedAt: '2026-05-20 14:00',
    updatedBy: 'admin',
  },
  {
    id: 'CUS-PUBLIC-001',
    code: 'CUS-PUB-001',
    name: 'Bảng phí chung khách hàng (Public)',
    target: 'CUSTOMER',
    objectType: 'CUSTOMER_INDIVIDUAL',
    orderType: 'PACKAGE',
    applyFor: 'Khách hàng gói — phần ngoài quyền lợi',
    version: 4,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: { serviceTypes: ['ONSITE', 'TOWING', 'CRANE'] },
    criteria: [
      { id: 'c1', key: 'customerType', label: 'Loại khách', operator: '=', value: 'PACKAGE', group: 'AND' },
    ],
    priceCriteria: [
      {
        id: 'pc-payload',
        key: 'payload',
        label: 'Trọng tải',
        operator: 'BETWEEN',
        value: ['', ''],
        role: 'PRICE',
        valueType: 'RANGE',
        allowedValues: [],
      },
    ],
    serviceRules: [
      { id: 'sr1', serviceType: 'ONSITE', serviceDetail: 'Kích bình ắc quy', basePrice: 450000 },
      { id: 'sr2', serviceType: 'ONSITE', serviceDetail: 'Xe hết pin', basePrice: 700000 },
      { id: 'sr3', serviceType: 'ONSITE', serviceDetail: 'Đâm, tai nạn, lật', basePrice: 1500000 },
      {
        id: 'sr4',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 700000,
        includedKm: 10,
        pricePerExtraKm: 35000,
      },
      {
        id: 'sr5',
        serviceType: 'CRANE',
        serviceDetail: 'Cẩu xe mặt đường',
        basePrice: 1500000,
        roadPosition: 'ROAD',
      },
    ],
    surchargeRules: sharedSurcharges,
    settings: { ...DEFAULT_TABLE_SETTINGS },
    updatedAt: '2026-07-10 11:00',
    updatedBy: 'admin',
  },
  {
    id: 'CUS-BUSINESS-FORD',
    code: 'CUS-DN-FORD-001',
    name: 'Bảng phí riêng Ford Việt Nam',
    target: 'CUSTOMER',
    objectType: 'CUSTOMER_BUSINESS',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'Ford Việt Nam',
    version: 2,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: {
      corporateCustomerId: 'FORD',
      serviceTypes: ['ONSITE', 'TOWING', 'CRANE'],
    },
    criteria: [
      { id: 'c1', key: 'corporateCustomerId', label: 'Mã DN', operator: '=', value: 'FORD', group: 'AND' },
    ],
    priceCriteria: [
      {
        id: 'pc-vehicle',
        key: 'vehicleType',
        label: 'Loại phương tiện gặp sự cố',
        operator: 'IN',
        value: ['Xe chở người', 'Xe chở hàng'],
        role: 'PRICE',
        allowedValues: ['Xe chở người', 'Xe chở hàng'],
      },
    ],
    serviceRules: [
      { id: 'sr1', serviceType: 'ONSITE', serviceDetail: 'Kích bình ắc quy', basePrice: 580000 },
      { id: 'sr2', serviceType: 'ONSITE', serviceDetail: 'Xe hết pin', basePrice: 850000 },
      { id: 'sr3', serviceType: 'ONSITE', serviceDetail: 'Đâm, tai nạn, lật', basePrice: 1800000 },
      {
        id: 'sr4',
        serviceType: 'TOWING',
        serviceDetail: 'Kéo xe',
        basePrice: 950000,
        includedKm: 10,
        pricePerExtraKm: 40000,
      },
    ],
    surchargeRules: sharedSurcharges,
    settings: { ...DEFAULT_TABLE_SETTINGS },
    updatedAt: '2026-04-01 08:30',
    updatedBy: 'admin',
  },
  {
    id: 'CUS-BUSINESS-TOYOTA',
    code: 'CUS-DN-TOYOTA-001',
    name: 'Bảng phí riêng Toyota Việt Nam',
    target: 'CUSTOMER',
    objectType: 'CUSTOMER_BUSINESS',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'Toyota Việt Nam',
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-08-01',
    validTo: '2026-12-31',
    scope: { corporateCustomerId: 'TOYOTA' },
    criteria: [
      { id: 'c1', key: 'corporateCustomerId', label: 'Mã DN', operator: '=', value: 'TOYOTA', group: 'AND' },
    ],
    priceCriteria: [],
    serviceRules: [
      { id: 'sr1', serviceType: 'ONSITE', serviceDetail: 'Kích bình ắc quy', basePrice: 560000 },
    ],
    surchargeRules: [],
    settings: { ...DEFAULT_TABLE_SETTINGS },
    updatedAt: '2026-07-20 16:00',
    updatedBy: 'admin',
  },
  {
    id: 'CUS-BUSINESS-PTI',
    code: 'CUS-DN-PTI-2026',
    name: 'Bảng phí KH DN — PTI (VETC × PTI)',
    target: 'CUSTOMER',
    objectType: 'CUSTOMER_BUSINESS',
    orderType: 'PACKAGE_SINGLE',
    applyFor: 'PTI',
    version: 1,
    status: 'ACTIVE',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    scope: {
      corporateCustomerId: 'PTI',
      serviceTypes: ['ONSITE', 'TOWING', 'CRANE'],
    },
    criteria: [
      { id: 'c-pti', key: 'corporateCustomerId', label: 'Mã DN', operator: '=', value: 'PTI', group: 'AND' },
    ],
    priceCriteria: [
      {
        id: 'pc-vtype',
        key: 'vehicleType',
        label: 'Loại xe khách',
        operator: 'IN',
        value: ['Xe chở người', 'Xe chở hàng'],
        role: 'PRICE',
        allowedValues: ['Xe chở người', 'Xe chở hàng'],
        valueType: 'LIST',
      },
      {
        id: 'pc-seat',
        key: 'seat_number',
        label: 'Số chỗ',
        operator: 'BETWEEN',
        value: [2, 80],
        role: 'PRICE',
        valueType: 'RANGE',
      },
      {
        id: 'pc-load',
        key: 'load_capacity',
        label: 'Trọng tải (tấn)',
        operator: 'BETWEEN',
        value: [0, 999],
        role: 'PRICE',
        valueType: 'RANGE',
      },
      {
        id: 'pc-rescue-veh',
        key: 'rescueVehicleType',
        label: 'Loại xe cứu hộ',
        operator: 'IN',
        value: ['Xe máy', 'Xe van', 'Xe sàn trượt', 'Xe cẩu, kéo'],
        role: 'PRICE',
        allowedValues: ['Xe máy', 'Xe van', 'Xe sàn trượt', 'Xe cẩu, kéo'],
        valueType: 'LIST',
      },
      {
        id: 'pc-distance',
        key: 'distanceKm',
        label: 'Quãng đường kéo',
        operator: 'BETWEEN',
        value: [0, 9999],
        role: 'PRICE',
        valueType: 'RANGE',
      },
      {
        id: 'pc-road-distance',
        key: 'roadDistance',
        label: 'Khoảng cách so với mặt đất',
        operator: 'BETWEEN',
        value: [0, 9999],
        role: 'PRICE',
        valueType: 'RANGE',
      },
      {
        id: 'pc-crane-posture',
        key: 'cranePosture',
        label: 'Tư thế xe cẩu (>150m)',
        operator: 'IN',
        value: ['Nghiêng', 'Ngửa'],
        role: 'PRICE',
        allowedValues: ['Nghiêng', 'Ngửa'],
        valueType: 'LIST',
      },
    ],
    serviceRules: [
      { id: 'pti-o1', serviceType: 'ONSITE', serviceDetail: 'Kích bình', basePrice: 400000 },
      { id: 'pti-o2', serviceType: 'ONSITE', serviceDetail: 'Vá lốp tại chỗ', basePrice: 400000 },
      { id: 'pti-o3', serviceType: 'ONSITE', serviceDetail: 'Thay lốp dự phòng', basePrice: 400000 },
      {
        id: 'pti-o4',
        serviceType: 'ONSITE',
        serviceDetail: 'Cung cấp nhiên liệu (xăng, dầu, nước làm mát)',
        basePrice: 300000,
      },
      ...(
        [
          { slug: '2-12', seats: [2, 12] as [number, number], load: [0, 1.4] as [number, number], base: 600000, perKm: 20000 },
          { slug: '13-30', seats: [13, 30] as [number, number], load: [1.41, 3] as [number, number], base: 1000000, perKm: 25000 },
          { slug: '31-39', seats: [31, 39] as [number, number], load: [3.01, 5] as [number, number], base: 1300000, perKm: 25000 },
          { slug: '40-45', seats: [40, 45] as [number, number], load: [5.01, 8] as [number, number], base: 1400000, perKm: 35000 },
          { slug: '46-54', seats: [46, 54] as [number, number], load: [8.01, 13] as [number, number], base: 1400000, perKm: 35000 },
          { slug: '55-80', seats: [55, 80] as [number, number], load: [13.01, 18] as [number, number], base: 1800000, perKm: 35000 },
          { slug: 'gt18', seats: null, load: [18.01, 999] as [number, number], base: 2500000, perKm: 50000 },
        ] as const
      ).flatMap((col) => {
        const vehiclePass = {
          criterionKey: 'vehicleType',
          criterionLabel: 'Loại xe khách',
          operator: '=' as const,
          value: 'Xe chở người',
        };
        const vehicleCargo = {
          criterionKey: 'vehicleType',
          criterionLabel: 'Loại xe khách',
          operator: '=' as const,
          value: 'Xe chở hàng',
        };
        const seatCond = col.seats
          ? {
              criterionKey: 'seat_number',
              criterionLabel: 'Số chỗ',
              operator: 'BETWEEN' as const,
              value: col.seats,
            }
          : null;
        const loadCond = {
          criterionKey: 'load_capacity',
          criterionLabel: 'Trọng tải (tấn)',
          operator: 'BETWEEN' as const,
          value: col.load,
        };
        const distLe10 = {
          criterionKey: 'distanceKm',
          criterionLabel: 'Quãng đường kéo',
          operator: 'BETWEEN' as const,
          value: [0, 10] as [number, number],
        };
        const distFrom11 = {
          criterionKey: 'distanceKm',
          criterionLabel: 'Quãng đường kéo',
          operator: 'BETWEEN' as const,
          value: [10, 9999] as [number, number],
        };
        const rows: Array<{
          id: string;
          serviceType: 'TOWING';
          serviceDetail: string;
          basePrice: number;
          pricingMode: 'FIXED' | 'PER_UNIT';
          unit: string;
          conditions: FeeRuleCondition[];
        }> = [];
        if (col.seats && seatCond) {
          rows.push({
            id: `pti-tow-pass-${col.slug}-le10`,
            serviceType: 'TOWING',
            serviceDetail: 'Kéo xe',
            basePrice: col.base,
            pricingMode: 'FIXED',
            unit: 'chuyến',
            conditions: [vehiclePass, seatCond, distLe10],
          });
          rows.push({
            id: `pti-tow-pass-${col.slug}-from11`,
            serviceType: 'TOWING',
            serviceDetail: 'Kéo xe',
            basePrice: col.perKm,
            pricingMode: 'PER_UNIT',
            unit: 'km',
            conditions: [vehiclePass, seatCond, distFrom11],
          });
        }
        const cargoSlug =
          col.slug === 'gt18' ? 'gt18' : col.load.join('-').replace(/\./g, '_');
        rows.push({
          id: `pti-tow-cargo-${cargoSlug}-le10`,
          serviceType: 'TOWING',
          serviceDetail: 'Kéo xe',
          basePrice: col.base,
          pricingMode: 'FIXED',
          unit: 'chuyến',
          conditions: [vehicleCargo, loadCond, distLe10],
        });
        rows.push({
          id: `pti-tow-cargo-${cargoSlug}-from11`,
          serviceType: 'TOWING',
          serviceDetail: 'Kéo xe',
          basePrice: col.perKm,
          pricingMode: 'PER_UNIT',
          unit: 'km',
          conditions: [vehicleCargo, loadCond, distFrom11],
        });
        return rows;
      }),
      ...(
        [
          { slug: '0-5', range: [0, 5] as [number, number], posture: null as string | null, prices: [1000000, 1200000, 2900000, 4000000, 4600000, 5100000, 6200000] },
          { slug: '5-10', range: [5, 10] as [number, number], posture: null, prices: [1650000, 2700000, 3800000, 5500000, 6600000, 7100000, 7500000] },
          { slug: '10-30', range: [10, 30] as [number, number], posture: null, prices: [2700000, 3800000, 4900000, 8200000, 9500000, 11000000, 12000000] },
          { slug: '30-50', range: [30, 50] as [number, number], posture: null, prices: [3300000, 5500000, 7100000, 11000000, 14000000, 14000000, 17500000] },
          { slug: '50-100', range: [50, 100] as [number, number], posture: null, prices: [5500000, 7700000, 9300000, 14000000, 16500000, 19800000, 24000000] },
          { slug: '100-150', range: [100, 150] as [number, number], posture: null, prices: [8000000, 13000000, 13000000, 19000000, 22000000, 27000000, 33000000] },
          { slug: 'gt150-side', range: [150, 9999] as [number, number], posture: 'Nghiêng', prices: [15500000, 19800000, 19800000, 24000000, 27000000, 33000000, 38500000] },
          { slug: 'gt150-upright', range: [150, 9999] as [number, number], posture: 'Ngửa', prices: [19000000, 24000000, 27000000, 30000000, 38500000, 49500000, 60500000] },
        ] as const
      ).flatMap((tier) =>
        (
          [
            { pass: '2-12', cargo: '0-2', seats: [2, 12] as [number, number], load: [0, 2] as [number, number] },
            { pass: '13-30', cargo: '2.01-3.5', seats: [13, 30] as [number, number], load: [2.01, 3.5] as [number, number] },
            { pass: '31-39', cargo: '3.51-5', seats: [31, 39] as [number, number], load: [3.51, 5] as [number, number] },
            { pass: '40-45', cargo: '5.01-8', seats: [40, 45] as [number, number], load: [5.01, 8] as [number, number] },
            { pass: '46-54', cargo: '8.01-13', seats: [46, 54] as [number, number], load: [8.01, 13] as [number, number] },
            { pass: '55-65', cargo: '13.01-18', seats: [55, 65] as [number, number], load: [13.01, 18] as [number, number] },
            { pass: '66-80', cargo: '18.01-25', seats: [66, 80] as [number, number], load: [18.01, 25] as [number, number] },
          ] as const
        ).flatMap((col, i) => {
          const depthCond = {
            criterionKey: 'roadDistance',
            criterionLabel: 'Khoảng cách so với mặt đất',
            operator: 'BETWEEN' as const,
            value: tier.range,
          };
          const postureConds = tier.posture
            ? [
                {
                  criterionKey: 'cranePosture',
                  criterionLabel: 'Tư thế xe cẩu (>150m)',
                  operator: '=' as const,
                  value: tier.posture,
                },
              ]
            : [];
          return [
            {
              id: `pti-crane-${tier.slug}-pass-${col.pass}`,
              serviceType: 'CRANE' as const,
              serviceDetail: 'Cẩu xe',
              basePrice: tier.prices[i],
              pricingMode: 'FIXED' as const,
              conditions: [
                {
                  criterionKey: 'vehicleType',
                  criterionLabel: 'Loại xe khách',
                  operator: '=' as const,
                  value: 'Xe chở người',
                },
                {
                  criterionKey: 'seat_number',
                  criterionLabel: 'Số chỗ',
                  operator: 'BETWEEN' as const,
                  value: col.seats,
                },
                depthCond,
                ...postureConds,
              ],
            },
            {
              id: `pti-crane-${tier.slug}-cargo-${col.cargo}`,
              serviceType: 'CRANE' as const,
              serviceDetail: 'Cẩu xe',
              basePrice: tier.prices[i],
              pricingMode: 'FIXED' as const,
              conditions: [
                {
                  criterionKey: 'vehicleType',
                  criterionLabel: 'Loại xe khách',
                  operator: '=' as const,
                  value: 'Xe chở hàng',
                },
                {
                  criterionKey: 'load_capacity',
                  criterionLabel: 'Trọng tải (tấn)',
                  operator: 'BETWEEN' as const,
                  value: col.load,
                },
                depthCond,
                ...postureConds,
              ],
            },
          ];
        })
      ),
    ],
    surchargeRules: [
      {
        id: 'pti-su-mountain',
        name: 'Miền núi',
        type: 'COEFFICIENT',
        value: 1.5,
        activeWhen: 'areaTerrain=MOUNTAIN',
        conditions: [
          {
            criterionKey: 'areaTerrain',
            criterionLabel: 'Địa hình khu vực',
            operator: '=',
            value: 'MOUNTAIN',
          },
        ],
        stackable: true,
        exclusiveGroup: 'AREA',
      },
      {
        id: 'pti-su-suburban',
        name: 'Ngoại thành',
        type: 'COEFFICIENT',
        value: 1.1,
        activeWhen: 'areaTerrain=SUBURBAN',
        conditions: [
          {
            criterionKey: 'areaTerrain',
            criterionLabel: 'Địa hình khu vực',
            operator: '=',
            value: 'SUBURBAN',
          },
        ],
        stackable: true,
        exclusiveGroup: 'AREA',
      },
      {
        id: 'pti-su-highway',
        name: 'Cao tốc',
        type: 'COEFFICIENT',
        value: 1.3,
        activeWhen: 'isHighway=YES',
        conditions: [
          { criterionKey: 'isHighway', criterionLabel: 'Cao tốc', operator: '=', value: 'YES' },
        ],
        stackable: true,
      },
      {
        id: 'pti-su-night',
        name: 'Cứu hộ đêm',
        type: 'COEFFICIENT',
        value: 1.2,
        activeWhen: 'timeWindow=18:00-06:00',
        conditions: [
          {
            criterionKey: 'timeWindow',
            criterionLabel: 'Giờ yêu cầu cứu hộ',
            operator: 'BETWEEN',
            value: ['18:00', '06:00'],
          },
        ],
        stackable: true,
      },
      {
        id: 'pti-su-disaster',
        name: 'Thiên tai / ngập lụt diện rộng',
        type: 'COEFFICIENT',
        value: 1.3,
        activeWhen: 'weather=Thiên tai / ngập lụt diện rộng',
        conditions: [
          {
            criterionKey: 'weather',
            criterionLabel: 'Thời tiết / thiên tai',
            operator: '=',
            value: 'Thiên tai / ngập lụt diện rộng',
          },
        ],
        stackable: true,
      },
      {
        id: 'pti-su-basement',
        name: 'Cứu hộ dưới hầm',
        type: 'FIXED',
        value: 500000,
        activeWhen: 'locationType=BASEMENT',
        conditions: [
          {
            criterionKey: 'locationType',
            criterionLabel: 'Vị trí đặc biệt',
            operator: '=',
            value: 'BASEMENT',
          },
        ],
        stackable: true,
      },
      {
        id: 'pti-su-dolly',
        name: 'Kích kép / Dolly',
        type: 'FIXED',
        value: 200000,
        activeWhen: 'extraEquipment=DOLLY|DOUBLE_JACK',
        conditions: [
          {
            criterionKey: 'extraEquipment',
            criterionLabel: 'Thiết bị thêm',
            operator: 'IN',
            value: ['DOLLY', 'DOUBLE_JACK'],
          },
        ],
        stackable: true,
      },
    ],
    settings: { ...DEFAULT_TABLE_SETTINGS, stackSurcharges: true },
    updatedAt: '2026-08-03 14:00',
    updatedBy: 'admin',
  },
];

export const feeVersionHistory: FeeVersionHistoryItem[] = [
  {
    id: 'vh1',
    tableId: 'SUP-INTERNAL-001',
    version: 3,
    status: 'ACTIVE',
    activatedAt: '2026-07-01 10:00',
    activatedBy: 'admin',
    note: 'Cập nhật giá kéo xe và phụ phí đêm',
    changes: ['Tăng giá kéo xe mở cửa lên 500,000', 'Phụ phí đêm hệ số 1.15'],
  },
  {
    id: 'vh2',
    tableId: 'SUP-INTERNAL-001',
    version: 2,
    status: 'EXPIRED',
    activatedAt: '2026-03-01 09:00',
    activatedBy: 'admin',
    note: 'Phiên bản Q1',
    changes: ['Thêm rule cẩu dưới mặt đường'],
  },
  {
    id: 'vh3',
    tableId: 'CUS-PUBLIC-001',
    version: 4,
    status: 'ACTIVE',
    activatedAt: '2026-07-10 11:00',
    activatedBy: 'admin',
    note: 'Đồng bộ bảng Public với chính sách mới',
    changes: ['Cập nhật đơn giá hỗ trợ tại chỗ'],
  },
  {
    id: 'vh4',
    tableId: 'CUS-BUSINESS-FORD',
    version: 2,
    status: 'ACTIVE',
    activatedAt: '2026-04-01 08:30',
    activatedBy: 'admin',
    note: 'Hiệu lực hợp đồng Ford 2026',
    changes: ['Áp dụng bảng DN riêng'],
  },
];

export const roundMoney = (value: number, mode: RoundMode = 'NEAREST_1000'): number => {
  if (mode === 'NONE') return Math.round(value);
  if (mode === 'NEAREST_100') return Math.round(value / 100) * 100;
  return Math.round(value / 1000) * 1000;
};

export const formatMoneyVi = (value: number): string =>
  value.toLocaleString('en-US');

export const parseMoneyVi = (value: string): number =>
  parseFloat(String(value).replace(/,/g, '')) || 0;

export const getRetailMarkupFactor = (): number => {
  const markupTable = rescueFeeTables.find(
    (table) => table.status === 'ACTIVE' && usesRetailMarkupOnlyPricing(table)
  );
  if (markupTable) return Number(markupTable.settings.retailMarkupFactor);

  const internal = rescueFeeTables.find(
    (table) => table.objectType === 'PARTNER_INTERNAL' && table.status === 'ACTIVE'
  );
  const legacyFactor = Number(internal?.settings.retailMarkupFactor);
  return legacyFactor > 0 ? legacyFactor : RETAIL_MARKUP_DEFAULT_FACTOR;
};

const isDateInRange = (asOf: string, from: string, to: string): boolean => {
  const d = asOf.slice(0, 10);
  return d >= from && d <= to;
};

const matchCriterion = (
  criterion: FeeCriterion,
  ctx: Record<string, string | number | boolean | undefined>
): boolean => {
  const raw = ctx[criterion.key];
  if (raw === undefined || raw === null) return false;
  const value = typeof raw === 'boolean' ? String(raw) : raw;

  switch (criterion.operator) {
    case '=':
      return String(value) === String(criterion.value);
    case 'IN':
      return Array.isArray(criterion.value) && criterion.value.map(String).includes(String(value));
    case '>=':
      return Number(value) >= Number(criterion.value);
    case '<=':
      return Number(value) <= Number(criterion.value);
    case 'BETWEEN':
      if (!Array.isArray(criterion.value) || criterion.value.length !== 2) return false;
      return Number(value) >= Number(criterion.value[0]) && Number(value) <= Number(criterion.value[1]);
    default:
      return false;
  }
};

const tableMatchesContext = (
  table: PriceTable,
  ctx: Record<string, string | number | boolean | undefined>
): boolean => {
  if (table.criteria.length === 0) return true;
  const andCriteria = table.criteria.filter((c) => (c.group ?? 'AND') === 'AND');
  const orCriteria = table.criteria.filter((c) => c.group === 'OR');
  const andOk = andCriteria.every((c) => matchCriterion(c, ctx));
  const orOk = orCriteria.length === 0 || orCriteria.some((c) => matchCriterion(c, ctx));
  return andOk && orOk;
};

const specificityScore = (table: PriceTable): number => {
  let score = table.criteria.length * 10;
  if (table.scope.corporateCustomerId) score += 50;
  if (table.scope.partnerId) score += 50;
  if (table.scope.areas?.length) score += table.scope.areas.length * 5;
  return score;
};

export const selectPriceTable = (
  tables: PriceTable[],
  opts: {
    target: FeeTarget;
    objectTypes?: FeeObjectType[];
    orderTypes?: FeeOrderType[];
    requireFallback?: boolean;
    asOfDate?: string;
    context: Record<string, string | number | boolean | undefined>;
  }
): PriceTable | null => {
  const asOf = opts.asOfDate ?? new Date().toISOString().slice(0, 10);
  const candidates = tables.filter((t) => {
    if (t.target !== opts.target) return false;
    if (t.status !== 'ACTIVE') return false;
    if (!isDateInRange(asOf, t.validFrom, t.validTo)) return false;
    if (opts.objectTypes && !opts.objectTypes.includes(t.objectType)) return false;
    if (opts.orderTypes && !opts.orderTypes.includes(t.orderType)) return false;
    if (opts.requireFallback === true && !t.settings.isFallback) return false;
    if (opts.requireFallback === false && t.settings.isFallback) return false;
    if (opts.context.corporateCustomerId && t.scope.corporateCustomerId) {
      if (t.scope.corporateCustomerId !== opts.context.corporateCustomerId) return false;
    }
    if (opts.context.partnerId && t.scope.partnerId) {
      if (t.scope.partnerId !== opts.context.partnerId) return false;
    }
    return tableMatchesContext(t, opts.context);
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const specDiff = specificityScore(b) - specificityScore(a);
    if (specDiff !== 0) return specDiff;
    return b.version - a.version;
  });

  return candidates[0];
};

const valueMatchesCondition = (
  actual: string | number | boolean | undefined,
  condition: FeeRuleCondition
): boolean => {
  if (actual === undefined) return false;
  if (condition.operator === '=') return String(actual) === String(condition.value);
  if (condition.operator === 'IN') {
    return Array.isArray(condition.value) && condition.value.map(String).includes(String(actual));
  }
  if (condition.operator === '>=') return Number(actual) >= Number(condition.value);
  if (condition.operator === '<=') return Number(actual) <= Number(condition.value);
  if (condition.operator === 'BETWEEN' && Array.isArray(condition.value)) {
    if (isTimeSurchargeCriterion(condition.criterionKey)) {
      return isTimeInRange(
        typeof actual === 'boolean' ? undefined : actual,
        String(condition.value[0] ?? ''),
        String(condition.value[1] ?? '')
      );
    }
    const num = Number(actual);
    const from = Number(condition.value[0]);
    const to = Number(condition.value[1]);
    const fromOk = condition.fromInclusive === false ? num > from : num >= from;
    const toOk = condition.toInclusive === false ? num < to : num <= to;
    return fromOk && toOk;
  }
  return false;
};

const buildRuleContext = (
  input: FeeCalculationInput,
  line?: FeeServiceLineInput
): Record<string, string | number | boolean | undefined> => ({
  weather:
    input.weather === 'STORM' ? 'Bão' : input.weather === 'RAIN' ? 'Mưa' : 'Bình thường',
  locationType:
    input.locationType === 'BASEMENT'
      ? 'Tầng hầm'
      : input.locationType === 'ALLEY'
        ? 'Ngõ hẹp'
        : input.locationType === 'SLOPE'
          ? 'Taluy/mương'
          : 'Mặt đường',
  severity:
    input.severity === 'CRITICAL'
      ? 'Đặc biệt nghiêm trọng'
      : input.severity === 'HIGH'
        ? 'Nặng'
        : input.severity === 'MEDIUM'
          ? 'Trung bình'
          : 'Nhẹ',
  timeWindow: input.requestTime ?? (input.isNight ? '23:00' : '10:00'),
  executionTimeWindow: input.executionTime ?? (input.isNight ? '23:00' : '10:00'),
  isHighway: input.highwayRoute ?? (input.isHighway ? HIGHWAY_ROUTE_VALUES[0] : undefined),
  distanceKm: line?.distanceKm,
  roadPosition:
    line?.roadPosition === 'BELOW_ROAD'
      ? 'Dưới mặt đường'
      : line?.roadPosition === 'SLOPE'
        ? 'Taluy/mương'
        : line?.roadPosition === 'ROAD'
          ? 'Mặt đường'
          : undefined,
  ...(line?.criteria ?? {}),
});

const conditionsMatch = (
  conditions: FeeRuleCondition[] | undefined,
  context: Record<string, string | number | boolean | undefined>
): boolean => !conditions?.length || conditions.every((c) => valueMatchesCondition(context[c.criterionKey], c));

const findServiceRule = (
  table: PriceTable,
  line: FeeServiceLineInput,
  input: FeeCalculationInput
): ServicePriceRule | undefined => {
  const detail = line.serviceDetail ?? line.serviceName;
  const context = buildRuleContext(input, line);
  const candidates = table.serviceRules.filter(
    (r) =>
      r.serviceType === line.serviceType &&
      (r.serviceDetail === detail || r.serviceDetail === line.serviceName) &&
      conditionsMatch(r.conditions, context)
  );
  if (candidates.length) {
    return candidates.sort((a, b) => (b.conditions?.length ?? 0) - (a.conditions?.length ?? 0))[0];
  }

  if (line.serviceType === 'CRANE' && line.roadPosition) {
    const byPos = table.serviceRules.find(
      (r) =>
        r.serviceType === 'CRANE' &&
        r.roadPosition === line.roadPosition &&
        conditionsMatch(r.conditions, context)
    );
    if (byPos) return byPos;
  }

  return table.serviceRules.find(
    (r) => r.serviceType === line.serviceType && conditionsMatch(r.conditions, context)
  );
};

const calcBaseFromRule = (rule: ServicePriceRule | undefined, line: FeeServiceLineInput): number => {
  if (!rule) return 0;
  let amount = rule.basePrice;

  if (rule.serviceType === 'TOWING') {
    const km = line.distanceKm ?? 0;
    const included = rule.includedKm ?? 10;
    const extraRate = rule.pricePerExtraKm ?? 0;
    if (km > included) {
      amount += (km - included) * extraRate;
    }
  }

  if (rule.minPrice != null) amount = Math.max(amount, rule.minPrice);
  if (rule.maxPrice != null) amount = Math.min(amount, rule.maxPrice);
  return amount;
};

const isDistanceRange = (condition: FeeRuleCondition): boolean =>
  condition.operator === 'BETWEEN' && condition.criterionKey === 'distanceKm';

const calcProgressiveBase = (
  table: PriceTable,
  line: FeeServiceLineInput,
  input: FeeCalculationInput
): number | null => {
  /**
   * Chỉ kéo xe theo distanceKm.
   * Nếu cùng tổ hợp có cả FIXED và PER_UNIT: chọn FIXED gần nhất (from lớn nhất với km >= from),
   * cộng FIXED đó + các bậc PER_UNIT có from >= to của FIXED đó; bỏ qua bậc trước FIXED gần nhất.
   * Chỉ FIXED → lấy FIXED gần nhất. Chỉ PER_UNIT → cộng dồn đơn vị từng bậc.
   */
  if (line.serviceType !== 'TOWING') return null;
  const detail = line.serviceDetail ?? line.serviceName;
  const context = buildRuleContext(input, line);
  const tierRules = table.serviceRules.filter((rule) => {
    if (rule.serviceType !== line.serviceType) return false;
    if (rule.serviceDetail !== detail && rule.serviceDetail !== line.serviceName) return false;
    const rangeCondition = (rule.conditions ?? []).find(isDistanceRange);
    if (!rangeCondition || !rule.pricingMode) return false;
    const otherConditions = (rule.conditions ?? []).filter((condition) => condition !== rangeCondition);
    return conditionsMatch(otherConditions, context);
  });

  if (tierRules.length === 0) return null;

  const distance = line.distanceKm ?? 0;
  type Tier = {
    mode: ServicePricingMode;
    from: number;
    to: number;
    basePrice: number;
  };
  const tiers: Tier[] = [];
  for (const rule of tierRules) {
    const range = (rule.conditions ?? []).find(isDistanceRange);
    if (!range || !Array.isArray(range.value) || !rule.pricingMode) continue;
    const from = Number(range.value[0]);
    const to = Number(range.value[1]);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) continue;
    tiers.push({
      mode: rule.pricingMode,
      from,
      to,
      basePrice: rule.basePrice,
    });
  }
  if (tiers.length === 0) return null;

  const hasFixed = tiers.some((tier) => tier.mode === 'FIXED');
  const hasPerUnit = tiers.some((tier) => tier.mode === 'PER_UNIT');
  const applicableFixed = tiers.filter(
    (tier) => tier.mode === 'FIXED' && distance >= tier.from
  );

  if (hasFixed && applicableFixed.length > 0) {
    const nearestFixed = applicableFixed.reduce((best, tier) =>
      tier.from > best.from ? tier : best
    );
    let total = nearestFixed.basePrice;
    if (hasPerUnit) {
      for (const tier of tiers) {
        if (tier.mode !== 'PER_UNIT' || tier.from < nearestFixed.to) continue;
        const unitsInTier = Math.max(0, Math.min(distance, tier.to) - tier.from);
        total += unitsInTier * tier.basePrice;
      }
    }
    return total;
  }

  return tiers.reduce((total, tier) => {
    if (tier.mode === 'FIXED') return total;
    const unitsInTier = Math.max(0, Math.min(distance, tier.to) - tier.from);
    return total + unitsInTier * tier.basePrice;
  }, 0);
};

const calcServiceBase = (
  table: PriceTable,
  line: FeeServiceLineInput,
  input: FeeCalculationInput
): number => {
  const progressive = calcProgressiveBase(table, line, input);
  if (progressive != null) return progressive;
  return calcBaseFromRule(findServiceRule(table, line, input), line);
};

const isSurchargeActive = (rule: SurchargeRule, input: FeeCalculationInput): boolean => {
  if (rule.holidayDates?.length) {
    const asOf = (input.asOfDate ?? new Date().toISOString()).slice(0, 10);
    return rule.holidayDates.includes(asOf);
  }
  if (rule.conditions.length > 0) {
    return conditionsMatch(rule.conditions, buildRuleContext(input));
  }
  const when = rule.activeWhen || '*';
  if (when === '*' || when === '') return true;
  if (when === 'night=true' || when.includes('night') || when.includes('Ban đêm')) {
    return Boolean(input.isNight);
  }
  if (when.includes('Bão') || when.includes('STORM')) return input.weather === 'STORM';
  if (when.includes('Mưa') || when.includes('RAIN')) {
    return input.weather === 'RAIN' || input.weather === 'STORM';
  }
  return false;
};

const applySurchargesToBase = (
  base: number,
  rules: SurchargeRule[],
  input: FeeCalculationInput,
  multiplyCoefficients = true
): SurchargeApplicationResult => {
  let fixedExtra = 0;
  let coefficient = 1;
  const labels: string[] = [];
  const items: SurchargeBreakdownItem[] = [];
  const usedExclusive = new Set<string>();
  const activeCoefficients: number[] = [];

  for (const rule of rules) {
    if (!isSurchargeActive(rule, input)) continue;

    if (rule.exclusiveGroup) {
      if (usedExclusive.has(rule.exclusiveGroup)) continue;
      usedExclusive.add(rule.exclusiveGroup);
    }

    labels.push(rule.name);
    items.push({ name: rule.name, type: rule.type, value: rule.value });
    if (rule.type === 'FIXED') {
      fixedExtra += rule.value;
    } else {
      activeCoefficients.push(rule.value);
    }
  }

  let coefficientFormula = 'Không có hệ số phụ phí (×1)';
  if (activeCoefficients.length > 0) {
    if (multiplyCoefficients) {
      coefficient = activeCoefficients.reduce((product, value) => product * value, 1);
      coefficientFormula =
        activeCoefficients.length === 1
          ? `Hệ số = ${activeCoefficients[0]}`
          : `Nhân các hệ số: ${activeCoefficients.join(' × ')} = ${Number(coefficient.toFixed(4))}`;
    } else {
      coefficient = Math.max(...activeCoefficients);
      coefficientFormula =
        activeCoefficients.length === 1
          ? `Hệ số = ${activeCoefficients[0]}`
          : `Lấy hệ số lớn nhất: max(${activeCoefficients.join(', ')}) = ${coefficient}`;
    }
  }

  let amount = Math.round(base * coefficient) + fixedExtra;
  for (const rule of rules) {
    if (!isSurchargeActive(rule, input) || rule.capAmount == null) continue;
    amount = Math.min(amount, base + rule.capAmount);
  }

  return {
    amount,
    labels,
    coefficient,
    items,
    coefficientFormula,
    fixedTotal: fixedExtra,
  };
};

export const resolvePartnerTable = (input: FeeCalculationInput): PriceTable | null => {
  const asOf = input.asOfDate ?? new Date().toISOString().slice(0, 10);
  const context: Record<string, string | number | boolean | undefined> = {
    partnerType: input.partnerType,
    partnerId: input.partnerId,
    partnerName: input.partnerName,
  };

  if (input.partnerType === 'INTERNAL') {
    return (
      selectPriceTable(rescueFeeTables, {
        target: 'PARTNER',
        objectTypes: ['PARTNER_INTERNAL'],
        asOfDate: asOf,
        context,
      }) ??
      rescueFeeTables.find(
        (t) => t.objectType === 'PARTNER_INTERNAL' && t.status === 'ACTIVE'
      ) ??
      null
    );
  }

  const own = selectPriceTable(rescueFeeTables, {
    target: 'PARTNER',
    objectTypes: ['PARTNER_EXTERNAL'],
    requireFallback: false,
    asOfDate: asOf,
    context: { ...context, partnerId: input.partnerId },
  });
  if (own) return own;

  return (
    selectPriceTable(rescueFeeTables, {
      target: 'PARTNER',
      objectTypes: ['PARTNER_EXTERNAL'], requireFallback: true,
      asOfDate: asOf,
      context,
    }) ??
    rescueFeeTables.find(
      (t) =>
        t.objectType === 'PARTNER_EXTERNAL' &&
        t.settings.isFallback &&
        t.status === 'ACTIVE'
    ) ??
    null
  );
};

export const resolveCustomerTable = (
  input: FeeCalculationInput
): { table: PriceTable | null; mode: FeeSnapshot['customerFeeMode'] } => {
  const asOf = input.asOfDate ?? new Date().toISOString().slice(0, 10);

  if (input.customerType === 'RETAIL') {
    const table = selectPriceTable(rescueFeeTables, {
      target: 'CUSTOMER',
      objectTypes: ['CUSTOMER_INDIVIDUAL'], orderTypes: ['SINGLE'],
      asOfDate: asOf,
      context: { customerType: 'RETAIL' },
    });
    if (table) {
      if (usesRetailMarkupOnlyPricing(table)) {
        return { table, mode: 'RETAIL_MARKUP' };
      }
      return { table, mode: 'RETAIL' };
    }
    return { table: null, mode: 'RETAIL_MARKUP' };
  }

  if (input.customerType === 'RETAIL_BUSINESS' || input.corporateCustomerId) {
    const table = selectPriceTable(rescueFeeTables, {
      target: 'CUSTOMER',
      objectTypes: ['CUSTOMER_BUSINESS'],
      asOfDate: asOf,
      context: {
        corporateCustomerId: input.corporateCustomerId,
        customerType: 'RETAIL_BUSINESS',
        isEnterprise: 'true',
      },
    });
    return { table, mode: 'BUSINESS' };
  }

  const table =
    selectPriceTable(rescueFeeTables, {
      target: 'CUSTOMER',
      objectTypes: ['CUSTOMER_INDIVIDUAL'], orderTypes: ['PACKAGE'],
      asOfDate: asOf,
      context: { customerType: 'PACKAGE' },
    }) ??
    rescueFeeTables.find(
      (t) => t.objectType === 'CUSTOMER_INDIVIDUAL' && t.orderType === 'PACKAGE' && t.status === 'ACTIVE'
    ) ??
    null;

  return { table, mode: 'PACKAGE_PUBLIC' };
};

export const calculateRescueFees = (input: FeeCalculationInput): FeeBreakdown => {
  const partnerTable = resolvePartnerTable(input);
  const { table: customerTable, mode } = resolveCustomerTable(input);

  if (!partnerTable) {
    return {
      lines: [],
      partnerFee: 0,
      customerFee: 0,
      margin: 0,
      snapshot: {
        partnerTableId: '',
        partnerTableCode: '',
        partnerTableName: '',
        partnerVersion: 0,
        customerFeeMode: mode,
        calculatedAt: new Date().toISOString(),
        input,
      },
      error: 'Không tìm thấy bảng phí NCC phù hợp (thiếu fallback)',
    };
  }

  if ((mode === 'BUSINESS' || mode === 'PACKAGE_PUBLIC') && !customerTable && mode === 'BUSINESS') {
    return {
      lines: [],
      partnerFee: 0,
      customerFee: 0,
      margin: 0,
      snapshot: {
        partnerTableId: partnerTable.id,
        partnerTableCode: partnerTable.code,
        partnerTableName: partnerTable.name,
        partnerVersion: partnerTable.version,
        customerFeeMode: mode,
        calculatedAt: new Date().toISOString(),
        input,
      },
      error: `Không tìm thấy bảng phí doanh nghiệp cho mã ${input.corporateCustomerId ?? ''}`,
    };
  }

  const markup =
    mode === 'RETAIL_MARKUP' && customerTable && usesRetailMarkupOnlyPricing(customerTable)
      ? customerTable.settings.retailMarkupFactor
      : partnerTable.settings.retailMarkupFactor || RETAIL_MARKUP_DEFAULT_FACTOR;
  const partnerSource: FeeSourceLabel =
    partnerTable.objectType === 'PARTNER_INTERNAL' ? 'VETC' : 'NCC';
  const customerSource: FeeSourceLabel =
    mode === 'BUSINESS' ? input.corporateCustomerId || 'VETC' : 'VETC';

  let packageRemaining = input.packageBenefitAmount ?? 0;

  const lines: CalculatedFeeLine[] = input.lines.map((line) => {
    const partnerBase = calcServiceBase(partnerTable, line, input);
    const partnerWithSurcharge = applySurchargesToBase(
      partnerBase,
      partnerTable.surchargeRules,
      input,
      partnerTable.settings.stackSurcharges
    );
    const partnerAmount = roundMoney(
      partnerWithSurcharge.amount,
      partnerTable.settings.roundMode
    );

    let customerAmount = 0;
    let formulaNote = '';
    let customerCoef = 1;
    let customerFixed = partnerBase;
    let customerLabels: string[] = [];
    let customerItems: SurchargeBreakdownItem[] = [];
    let customerCoefFormula = 'Không có hệ số phụ phí (×1)';

    if (mode === 'RETAIL_MARKUP') {
      customerAmount = roundMoney(
        partnerAmount * markup,
        partnerTable.settings.roundMode
      );
      formulaNote = `Khách lẻ: dòng NCC × ${markup}`;
      customerFixed = partnerAmount;
      customerCoef = markup;
      customerLabels = ['Markup khách lẻ'];
      customerItems = [{ name: 'Markup khách lẻ', type: 'COEFFICIENT', value: markup }];
      customerCoefFormula = `Hệ số markup khách lẻ = ${markup}`;
    } else if ((mode === 'BUSINESS' || mode === 'RETAIL') && customerTable) {
      const base = calcServiceBase(customerTable, line, input);
      const withSur = applySurchargesToBase(
        base,
        customerTable.surchargeRules,
        input,
        customerTable.settings.stackSurcharges
      );
      customerAmount = roundMoney(withSur.amount, customerTable.settings.roundMode);
      customerFixed = base;
      customerCoef = withSur.coefficient;
      customerLabels = withSur.labels;
      customerItems = withSur.items;
      customerCoefFormula = withSur.coefficientFormula;
      formulaNote =
        mode === 'RETAIL' ? `Bảng KH lẻ ${customerTable.code}` : `Bảng DN ${customerTable.code}`;
    } else if (customerTable) {
      const base = calcServiceBase(customerTable, line, input);
      const withSur = applySurchargesToBase(
        base,
        customerTable.surchargeRules,
        input,
        customerTable.settings.stackSurcharges
      );
      const gross = roundMoney(withSur.amount, customerTable.settings.roundMode);
      const covered = Math.min(packageRemaining, gross);
      packageRemaining = Math.max(0, packageRemaining - covered);
      customerAmount = Math.max(0, gross - covered);
      customerFixed = base;
      customerCoef = withSur.coefficient;
      customerLabels = withSur.labels;
      customerItems = withSur.items;
      customerCoefFormula = withSur.coefficientFormula;
      formulaNote =
        covered > 0
          ? `Public ${customerTable.code}; trừ quyền lợi ${formatMoneyVi(covered)}`
          : `Public ${customerTable.code}`;
    }

    const discount = Math.round(customerFixed * customerCoef - customerAmount);

    return {
      serviceName: line.serviceName,
      serviceType: line.serviceType,
      partnerAmount,
      customerAmount,
      fixedPrice: customerFixed || partnerBase,
      coefficient: customerCoef || 1,
      partnerCoefficient: partnerWithSurcharge.coefficient || 1,
      discount,
      adjustmentLabels: customerLabels,
      partnerAdjustmentLabels: partnerWithSurcharge.labels,
      customerSurchargeItems: customerItems,
      partnerSurchargeItems: partnerWithSurcharge.items,
      customerCoefficientFormula: customerCoefFormula,
      partnerCoefficientFormula: partnerWithSurcharge.coefficientFormula,
      partnerSource,
      customerSource,
      formulaNote,
    };
  });

  const partnerFee = lines.reduce((s, l) => s + l.partnerAmount, 0);
  const customerFee = lines.reduce((s, l) => s + l.customerAmount, 0);

  return {
    lines,
    partnerFee,
    customerFee,
    margin: customerFee - partnerFee,
    snapshot: {
      partnerTableId: partnerTable.id,
      partnerTableCode: partnerTable.code,
      partnerTableName: partnerTable.name,
      partnerVersion: partnerTable.version,
      customerTableId: customerTable?.id,
      customerTableCode: customerTable?.code,
      customerTableName: customerTable?.name,
      customerVersion: customerTable?.version,
      retailMarkupFactor: mode === 'RETAIL_MARKUP' ? markup : undefined,
      customerFeeMode: mode,
      calculatedAt: new Date().toISOString(),
      input,
    },
  };
};

/** Map tên dịch vụ UI → loại dịch vụ engine */
export const inferServiceType = (serviceName: string): ServiceType => {
  const n = serviceName.toLowerCase();
  if (n.includes('kéo') || n.includes('keo') || n.includes('tow')) return 'TOWING';
  if (n.includes('cẩu') || n.includes('cau') || n.includes('crane')) return 'CRANE';
  return 'ONSITE';
};

export const upsertPriceTable = (table: PriceTable): void => {
  const idx = rescueFeeTables.findIndex((t) => t.id === table.id);
  if (idx >= 0) {
    rescueFeeTables = [...rescueFeeTables.slice(0, idx), table, ...rescueFeeTables.slice(idx + 1)];
  } else {
    rescueFeeTables = [...rescueFeeTables, table];
  }
};

/**
 * Sao chép bảng phí chỉ trên FE (không ghi vào danh sách).
 * User cấu hình trên form; bấm Lưu mới upsert với status ACTIVE.
 */
export const clonePriceTable = (tableId: string): PriceTable | null => {
  const source = rescueFeeTables.find((t) => t.id === tableId);
  if (!source) return null;
  return {
    ...source,
    id: `${source.id}-COPY-${Date.now()}`,
    code: `${source.code}-V${source.version + 1}`,
    name: `${source.name} (bản sao)`,
    version: source.version + 1,
    status: 'ACTIVE',
    updatedAt: new Date().toLocaleString('vi-VN'),
    updatedBy: 'admin',
    criteria: source.criteria.map((c) => ({ ...c, id: `${c.id}-c` })),
    priceCriteria: (source.priceCriteria ?? []).map((c) => ({
      ...c,
      id: `${c.id}-c`,
      allowedValues: [...(c.allowedValues ?? [])],
    })),
    serviceRules: source.serviceRules.map((r) => ({ ...r, id: `${r.id}-c` })),
    surchargeRules: source.surchargeRules.map((r) => ({
      ...r,
      id: `${r.id}-c`,
      holidayDates: r.holidayDates ? [...r.holidayDates] : undefined,
    })),
  };
};

/** @deprecated Dùng clonePriceTable — không persist vào danh sách trước khi Lưu. */
export const duplicatePriceTable = clonePriceTable;

export const emptyPriceTable = (partial?: Partial<PriceTable>): PriceTable => ({
  id: `FEE-${Date.now()}`,
  code: '',
  name: '',
  target: 'PARTNER',
  objectType: 'PARTNER_INTERNAL',
  orderType: 'PACKAGE_SINGLE',
  applyFor: '',
  version: 1,
  status: 'ACTIVE',
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: '2099-12-31',
  scope: {},
  criteria: [],
  priceCriteria: [],
  serviceRules: [],
  surchargeRules: [],
  settings: { ...DEFAULT_TABLE_SETTINGS },
  updatedAt: new Date().toLocaleString('vi-VN'),
  updatedBy: 'admin',
  ...partial,
});

/** Tương thích cũ — giữ export RETAIL_MARKUP_FACTOR */
export const RETAIL_MARKUP_FACTOR = RETAIL_MARKUP_DEFAULT_FACTOR;
