/**
 * Seed demo — bảng phí KH DN PTI theo schema mới (fee_*).
 * Nguồn: khung giá VETC × PTI. Giá chưa VAT.
 *
 * Model: không dùng nhóm G. Mỗi cột Excel “chỗ / tải” → 2 fee_price_line độc lập
 * (Xe chở người + seat_number) và (Xe chở hàng + load_capacity); conditions trên line = AND.
 */

export type SeedCriterionDef = {
  id: string;
  key: string;
  label: string;
  value_type: 'LIST' | 'RANGE' | 'TIME';
  values_json: string[];
  status: 'ACTIVE';
};

export type SeedFieldMap = {
  id: string;
  criterion_key: string;
  source_path: string;
  transform: string | null;
  transform_params_json: unknown | null;
  scope: 'ORDER' | 'LINE' | 'VEHICLE';
  status: 'ACTIVE';
};

export type SeedServiceCatalog = {
  id: number;
  code: string;
  name: string;
  service_type: 'ONSITE' | 'TOWING' | 'CRANE';
  parent_id: number | null;
  status: 'ACTIVE';
};

export type SeedPriceLine = {
  id: string;
  fee_table_version_id: string;
  service_catalog_id: number;
  service_name: string;
  base_price: number;
  pricing_mode: 'FIXED' | 'PER_UNIT';
  unit: string | null;
  included_qty: number | null;
  price_per_extra: number | null;
  sort_order: number;
  conditions: Array<{
    criterion_key: string;
    operator: '=' | 'BETWEEN' | 'IN' | '>=' | '<=';
    value_json: string | number | [number, number] | string[];
  }>;
};

export type SeedSurcharge = {
  id: string;
  fee_table_version_id: string;
  name: string;
  type: 'FIXED' | 'COEFFICIENT';
  value: number;
  stackable: boolean;
  exclusive_group: string | null;
  holiday_dates_json: string[] | null;
  sort_order: number;
  apply_service_types: Array<'ONSITE' | 'TOWING' | 'CRANE'> | null;
  conditions: Array<{
    criterion_key: string;
    operator: '=' | 'BETWEEN' | 'IN';
    value_json: string | number | [string, string] | string[];
  }>;
};

export const PTI_FEE_TABLE_VERSION_ID = 'ftv-pti-v1';

const VT_PASS = 'Xe chở người';
const VT_CARGO = 'Xe chở hàng';

export const feeCriterionDefPti: SeedCriterionDef[] = [
  {
    id: 'fcd-vehicle-type',
    key: 'vehicleType',
    label: 'Loại xe khách',
    value_type: 'LIST',
    values_json: [VT_PASS, VT_CARGO],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-seat',
    key: 'seat_number',
    label: 'Số chỗ',
    value_type: 'RANGE',
    values_json: [],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-load',
    key: 'load_capacity',
    label: 'Trọng tải (tấn)',
    value_type: 'RANGE',
    values_json: [],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-rescue-veh',
    key: 'rescueVehicleType',
    label: 'Loại xe cứu hộ',
    value_type: 'LIST',
    values_json: ['Xe máy', 'Xe van', 'Xe sàn trượt', 'Xe cẩu, kéo'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-distance',
    key: 'distanceKm',
    label: 'Quãng đường kéo',
    value_type: 'RANGE',
    values_json: [],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-road-distance',
    key: 'roadDistance',
    label: 'Khoảng cách so với mặt đất',
    value_type: 'RANGE',
    values_json: [],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-crane-posture',
    key: 'cranePosture',
    label: 'Tư thế xe (cẩu >150m)',
    value_type: 'LIST',
    values_json: ['Nghiêng', 'Ngửa'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-terrain',
    key: 'areaTerrain',
    label: 'Địa hình khu vực',
    value_type: 'LIST',
    values_json: ['NORMAL', 'SUBURBAN', 'MOUNTAIN'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-highway',
    key: 'isHighway',
    label: 'Cao tốc',
    value_type: 'LIST',
    values_json: ['YES', 'NO'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-time',
    key: 'timeWindow',
    label: 'Giờ yêu cầu cứu hộ',
    value_type: 'TIME',
    values_json: [],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-weather',
    key: 'weather',
    label: 'Thời tiết / thiên tai',
    value_type: 'LIST',
    values_json: ['Bình thường', 'Mưa', 'Thiên tai / ngập lụt diện rộng'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-location',
    key: 'locationType',
    label: 'Vị trí đặc biệt',
    value_type: 'LIST',
    values_json: ['ROAD', 'BASEMENT'],
    status: 'ACTIVE',
  },
  {
    id: 'fcd-equip',
    key: 'extraEquipment',
    label: 'Thiết bị thêm',
    value_type: 'LIST',
    values_json: ['DOLLY', 'DOUBLE_JACK'],
    status: 'ACTIVE',
  },
];

export const feeCriterionFieldMapPti: SeedFieldMap[] = [
  {
    id: 'fmap-vtype',
    criterion_key: 'vehicleType',
    source_path: 'vehicle.vehicleType',
    transform: null,
    transform_params_json: null,
    scope: 'VEHICLE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-seat',
    criterion_key: 'seat_number',
    source_path: 'vehicle.seat_number',
    transform: null,
    transform_params_json: null,
    scope: 'VEHICLE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-load',
    criterion_key: 'load_capacity',
    source_path: 'vehicle.load_capacity',
    transform: null,
    transform_params_json: null,
    scope: 'VEHICLE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-rescue-veh',
    criterion_key: 'rescueVehicleType',
    source_path: 'order.rescueVehicleType',
    transform: null,
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-km',
    criterion_key: 'distanceKm',
    source_path: 'line.distanceKm',
    transform: null,
    transform_params_json: null,
    scope: 'LINE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-road-distance',
    criterion_key: 'roadDistance',
    source_path: 'line.roadDistance',
    transform: null,
    transform_params_json: null,
    scope: 'LINE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-crane-posture',
    criterion_key: 'cranePosture',
    source_path: 'line.cranePosture',
    transform: null,
    transform_params_json: null,
    scope: 'LINE',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-terrain',
    criterion_key: 'areaTerrain',
    source_path: 'order.areaTerrain',
    transform: null,
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-hw',
    criterion_key: 'isHighway',
    source_path: 'order.highwayRoute',
    transform: 'BOOL_OR_ROUTE_TO_YES_NO',
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-time',
    criterion_key: 'timeWindow',
    source_path: 'order.requestTime',
    transform: null,
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-weather',
    criterion_key: 'weather',
    source_path: 'order.weather',
    transform: 'UI_WEATHER_TO_LABEL',
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-loc',
    criterion_key: 'locationType',
    source_path: 'order.locationType',
    transform: null,
    transform_params_json: null,
    scope: 'ORDER',
    status: 'ACTIVE',
  },
  {
    id: 'fmap-eq',
    criterion_key: 'extraEquipment',
    source_path: 'line.extraEquipment',
    transform: null,
    transform_params_json: null,
    scope: 'LINE',
    status: 'ACTIVE',
  },
];

export const feeServiceCatalogPti: SeedServiceCatalog[] = [
  { id: 101, code: 'ONSITE_JUMP', name: 'Kích bình', service_type: 'ONSITE', parent_id: null, status: 'ACTIVE' },
  { id: 102, code: 'ONSITE_PATCH', name: 'Vá lốp tại chỗ', service_type: 'ONSITE', parent_id: null, status: 'ACTIVE' },
  { id: 103, code: 'ONSITE_SPARE', name: 'Thay lốp dự phòng', service_type: 'ONSITE', parent_id: null, status: 'ACTIVE' },
  {
    id: 104,
    code: 'ONSITE_FUEL',
    name: 'Cung cấp nhiên liệu (xăng, dầu, nước làm mát)',
    service_type: 'ONSITE',
    parent_id: null,
    status: 'ACTIVE',
  },
  { id: 201, code: 'TOW_GENERIC', name: 'Kéo xe', service_type: 'TOWING', parent_id: null, status: 'ACTIVE' },
  { id: 301, code: 'CRANE_GENERIC', name: 'Cẩu xe', service_type: 'CRANE', parent_id: null, status: 'ACTIVE' },
];

export const feeTablePti = {
  id: 'ft-pti-001',
  code: 'CUS-DN-PTI-2026',
  name: 'Bảng phí KH DN — PTI (VETC × PTI)',
  target: 'CUSTOMER' as const,
  kind: 'CUSTOMER_BUSINESS' as const,
  current_version: 1,
  status: 'ACTIVE' as const,
};

export const feeTableVersionPti = {
  id: PTI_FEE_TABLE_VERSION_ID,
  fee_table_id: feeTablePti.id,
  version: 1,
  valid_from: '2026-01-01',
  valid_to: '2026-12-31',
  priority: 200,
  status: 'ACTIVE' as const,
  note: 'Seed từ khung giá VETC × PTI — pass/cargo AND, không nhóm G',
  activated_at: '2026-01-01T00:00:00+07:00',
};

export const feeTableScopePti = {
  fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
  enterprise_code: 'PTI',
  supplier_id: null as string | null,
  supplier_name: null as string | null,
  areas_json: null as null,
  service_types_json: ['ONSITE', 'TOWING', 'CRANE'] as string[],
  vehicle_types_json: null as null,
};

export const feeTableSettingsPti = {
  fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
  retail_markup_factor: null as number | null,
  round_mode: 'NEAREST_1000' as const,
  stack_surcharges: true,
  is_fallback: false,
};

/** Cột Excel kéo: chỗ và/hoặc tải + giá */
type TowCol = {
  idSlug: string;
  seats: [number, number] | null;
  loadTons: [number, number] | null;
  base: number;
  perKm: number;
};

const TOW_COLS: TowCol[] = [
  { idSlug: '2-12', seats: [2, 12], loadTons: [0, 1.4], base: 600_000, perKm: 20_000 },
  { idSlug: '13-30', seats: [13, 30], loadTons: [1.41, 3], base: 1_000_000, perKm: 25_000 },
  { idSlug: '31-39', seats: [31, 39], loadTons: [3.01, 5], base: 1_300_000, perKm: 25_000 },
  { idSlug: '40-45', seats: [40, 45], loadTons: [5.01, 8], base: 1_400_000, perKm: 35_000 },
  { idSlug: '46-54', seats: [46, 54], loadTons: [8.01, 13], base: 1_400_000, perKm: 35_000 },
  { idSlug: '55-80', seats: [55, 80], loadTons: [13.01, 18], base: 1_800_000, perKm: 35_000 },
  { idSlug: 'gt18t', seats: null, loadTons: [18.01, 999], base: 2_500_000, perKm: 50_000 },
];

type CraneCol = {
  idSlugPass: string;
  idSlugCargo: string;
  seats: [number, number];
  loadTons: [number, number];
};

const CRANE_COLS: CraneCol[] = [
  { idSlugPass: '2-12', idSlugCargo: '0-2', seats: [2, 12], loadTons: [0, 2] },
  { idSlugPass: '13-30', idSlugCargo: '2.01-3.5', seats: [13, 30], loadTons: [2.01, 3.5] },
  { idSlugPass: '31-39', idSlugCargo: '3.51-5', seats: [31, 39], loadTons: [3.51, 5] },
  { idSlugPass: '40-45', idSlugCargo: '5.01-8', seats: [40, 45], loadTons: [5.01, 8] },
  { idSlugPass: '46-54', idSlugCargo: '8.01-13', seats: [46, 54], loadTons: [8.01, 13] },
  { idSlugPass: '55-65', idSlugCargo: '13.01-18', seats: [55, 65], loadTons: [13.01, 18] },
  { idSlugPass: '66-80', idSlugCargo: '18.01-25', seats: [66, 80], loadTons: [18.01, 25] },
];

/** Bậc khoảng cách so với mặt đất (m) + tư thế khi >150m. prices[colIndex]. */
const CRANE_DEPTH_TIERS: Array<{
  slug: string;
  range: [number, number];
  posture: 'Nghiêng' | 'Ngửa' | null;
  prices: number[];
}> = [
  {
    slug: '0-5',
    range: [0, 5],
    posture: null,
    prices: [1_000_000, 1_200_000, 2_900_000, 4_000_000, 4_600_000, 5_100_000, 6_200_000],
  },
  {
    slug: '5-10',
    range: [5, 10],
    posture: null,
    prices: [1_650_000, 2_700_000, 3_800_000, 5_500_000, 6_600_000, 7_100_000, 7_500_000],
  },
  {
    slug: '10-30',
    range: [10, 30],
    posture: null,
    prices: [2_700_000, 3_800_000, 4_900_000, 8_200_000, 9_500_000, 11_000_000, 12_000_000],
  },
  {
    slug: '30-50',
    range: [30, 50],
    posture: null,
    prices: [3_300_000, 5_500_000, 7_100_000, 11_000_000, 14_000_000, 14_000_000, 17_500_000],
  },
  {
    slug: '50-100',
    range: [50, 100],
    posture: null,
    prices: [5_500_000, 7_700_000, 9_300_000, 14_000_000, 16_500_000, 19_800_000, 24_000_000],
  },
  {
    slug: '100-150',
    range: [100, 150],
    posture: null,
    prices: [8_000_000, 13_000_000, 13_000_000, 19_000_000, 22_000_000, 27_000_000, 33_000_000],
  },
  {
    slug: 'gt150-side',
    range: [150, 9999],
    posture: 'Nghiêng',
    prices: [15_500_000, 19_800_000, 19_800_000, 24_000_000, 27_000_000, 33_000_000, 38_500_000],
  },
  {
    slug: 'gt150-upright',
    range: [150, 9999],
    posture: 'Ngửa',
    prices: [19_000_000, 24_000_000, 27_000_000, 30_000_000, 38_500_000, 49_500_000, 60_500_000],
  },
];

function buildCraneLines(): SeedPriceLine[] {
  const lines: SeedPriceLine[] = [];
  let sort = 200;
  CRANE_DEPTH_TIERS.forEach((tier) => {
    CRANE_COLS.forEach((col, ci) => {
      const price = tier.prices[ci];
      const depthCond = {
        criterion_key: 'roadDistance' as const,
        operator: 'BETWEEN' as const,
        value_json: tier.range,
      };
      const postureConds = tier.posture
        ? [
            {
              criterion_key: 'cranePosture' as const,
              operator: '=' as const,
              value_json: tier.posture,
            },
          ]
        : [];
      lines.push({
        id: `fpl-pti-crane-${tier.slug}-pass-${col.idSlugPass}`,
        fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
        service_catalog_id: 301,
        service_name: 'Cẩu xe',
        base_price: price,
        pricing_mode: 'FIXED',
        unit: null,
        included_qty: null,
        price_per_extra: null,
        sort_order: sort++,
        conditions: [
          { criterion_key: 'vehicleType', operator: '=', value_json: VT_PASS },
          { criterion_key: 'seat_number', operator: 'BETWEEN', value_json: col.seats },
          depthCond,
          ...postureConds,
        ],
      });
      lines.push({
        id: `fpl-pti-crane-${tier.slug}-cargo-${col.idSlugCargo}`,
        fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
        service_catalog_id: 301,
        service_name: 'Cẩu xe',
        base_price: price,
        pricing_mode: 'FIXED',
        unit: null,
        included_qty: null,
        price_per_extra: null,
        sort_order: sort++,
        conditions: [
          { criterion_key: 'vehicleType', operator: '=', value_json: VT_CARGO },
          { criterion_key: 'load_capacity', operator: 'BETWEEN', value_json: col.loadTons },
          depthCond,
          ...postureConds,
        ],
      });
    });
  });
  return lines;
}

function buildOnsiteLines(): SeedPriceLine[] {
  const rows: Array<[number, string, number]> = [
    [101, 'Kích bình', 400_000],
    [102, 'Vá lốp tại chỗ', 400_000],
    [103, 'Thay lốp dự phòng', 400_000],
    [104, 'Cung cấp nhiên liệu (xăng, dầu, nước làm mát)', 300_000],
  ];
  return rows.map(([service_catalog_id, service_name, base_price], i) => ({
    id: `fpl-pti-onsite-${i + 1}`,
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    service_catalog_id,
    service_name,
    base_price,
    pricing_mode: 'FIXED' as const,
    unit: null,
    included_qty: null,
    price_per_extra: null,
    sort_order: i + 1,
    conditions: [],
  }));
}

function buildTowLines(): SeedPriceLine[] {
  const lines: SeedPriceLine[] = [];
  let sort = 100;

  const pushPair = (
    kind: 'pass' | 'cargo',
    slug: string,
    vehicleType: string,
    dimKey: 'seat_number' | 'load_capacity',
    dimRange: [number, number],
    base: number,
    perKm: number
  ) => {
    const vehicleCond = {
      criterion_key: 'vehicleType' as const,
      operator: '=' as const,
      value_json: vehicleType,
    };
    const dimCond = {
      criterion_key: dimKey,
      operator: 'BETWEEN' as const,
      value_json: dimRange,
    };
    lines.push({
      id: `fpl-pti-tow-${kind}-${slug}-le10`,
      fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
      service_catalog_id: 201,
      service_name: 'Kéo xe',
      base_price: base,
      pricing_mode: 'FIXED',
      unit: 'chuyến',
      included_qty: null,
      price_per_extra: null,
      sort_order: sort++,
      conditions: [
        vehicleCond,
        dimCond,
        { criterion_key: 'distanceKm', operator: 'BETWEEN', value_json: [0, 10] },
      ],
    });
    lines.push({
      id: `fpl-pti-tow-${kind}-${slug}-from11`,
      fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
      service_catalog_id: 201,
      service_name: 'Kéo xe',
      base_price: perKm,
      pricing_mode: 'PER_UNIT',
      unit: 'km',
      included_qty: null,
      price_per_extra: null,
      sort_order: sort++,
      conditions: [
        vehicleCond,
        dimCond,
        /** from=10 để engine progressive: units = km − 10 (khớp “từ km 11”) */
        { criterion_key: 'distanceKm', operator: 'BETWEEN', value_json: [10, 9999] },
      ],
    });
  };

  for (const col of TOW_COLS) {
    if (col.seats) {
      pushPair('pass', col.idSlug, VT_PASS, 'seat_number', col.seats, col.base, col.perKm);
    }
    if (col.loadTons) {
      const loadSlug =
        col.idSlug === 'gt18t'
          ? 'gt18'
          : `${col.loadTons[0]}-${col.loadTons[1]}`.replace(/\./g, '_');
      pushPair('cargo', loadSlug, VT_CARGO, 'load_capacity', col.loadTons, col.base, col.perKm);
    }
  }
  return lines;
}

export const feePriceLinePti: SeedPriceLine[] = [
  ...buildOnsiteLines(),
  ...buildTowLines(),
  ...buildCraneLines(),
];

export const feeSurchargeRulePti: SeedSurcharge[] = [
  {
    id: 'fsr-pti-mountain',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Miền núi',
    type: 'COEFFICIENT',
    value: 1.5,
    stackable: true,
    exclusive_group: 'AREA',
    holiday_dates_json: null,
    sort_order: 1,
    apply_service_types: null,
    conditions: [{ criterion_key: 'areaTerrain', operator: '=', value_json: 'MOUNTAIN' }],
  },
  {
    id: 'fsr-pti-suburban',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Ngoại thành',
    type: 'COEFFICIENT',
    value: 1.1,
    stackable: true,
    exclusive_group: 'AREA',
    holiday_dates_json: null,
    sort_order: 2,
    apply_service_types: null,
    conditions: [{ criterion_key: 'areaTerrain', operator: '=', value_json: 'SUBURBAN' }],
  },
  {
    id: 'fsr-pti-highway',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Cao tốc',
    type: 'COEFFICIENT',
    value: 1.3,
    stackable: true,
    exclusive_group: null,
    holiday_dates_json: null,
    sort_order: 3,
    apply_service_types: null,
    conditions: [{ criterion_key: 'isHighway', operator: '=', value_json: 'YES' }],
  },
  {
    id: 'fsr-pti-night',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Cứu hộ đêm',
    type: 'COEFFICIENT',
    value: 1.2,
    stackable: true,
    exclusive_group: null,
    holiday_dates_json: null,
    sort_order: 4,
    apply_service_types: null,
    conditions: [
      { criterion_key: 'timeWindow', operator: 'BETWEEN', value_json: ['18:00', '06:00'] },
    ],
  },
  {
    id: 'fsr-pti-disaster',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Thiên tai / ngập lụt diện rộng',
    type: 'COEFFICIENT',
    value: 1.3,
    stackable: true,
    exclusive_group: null,
    holiday_dates_json: null,
    sort_order: 5,
    apply_service_types: null,
    conditions: [
      {
        criterion_key: 'weather',
        operator: '=',
        value_json: 'Thiên tai / ngập lụt diện rộng',
      },
    ],
  },
  {
    id: 'fsr-pti-basement',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Cứu hộ dưới hầm',
    type: 'FIXED',
    value: 500_000,
    stackable: true,
    exclusive_group: null,
    holiday_dates_json: null,
    sort_order: 6,
    apply_service_types: ['TOWING', 'CRANE'],
    conditions: [{ criterion_key: 'locationType', operator: '=', value_json: 'BASEMENT' }],
  },
  {
    id: 'fsr-pti-dolly',
    fee_table_version_id: PTI_FEE_TABLE_VERSION_ID,
    name: 'Kích kép / Dolly',
    type: 'FIXED',
    value: 200_000,
    stackable: true,
    exclusive_group: null,
    holiday_dates_json: null,
    sort_order: 7,
    apply_service_types: null,
    conditions: [
      { criterion_key: 'extraEquipment', operator: 'IN', value_json: ['DOLLY', 'DOUBLE_JACK'] },
    ],
  },
];

/** Ví dụ snapshot: xe chở người 5 chỗ · kéo 15km · đêm */
export const rescueOrderFeeSnapshotPtiDemo = {
  id: 'rofs-demo-001',
  rescue_order_v2_id: 900001,
  supplier_table_id: null as string | null,
  supplier_table_code: null as string | null,
  supplier_version: null as number | null,
  customer_table_id: feeTablePti.id,
  customer_table_code: feeTablePti.code,
  customer_version: 1,
  customer_fee_mode: 'BUSINESS' as const,
  retail_markup_factor: null as number | null,
  input_context_json: {
    enterpriseCode: 'PTI',
    vehicleType: VT_PASS,
    seat_number: 5,
    distanceKm: 15,
    timeWindow: '22:00',
    areaTerrain: 'NORMAL',
    isHighway: 'NO',
    weather: 'Bình thường',
  },
  calculated_at: '2026-08-03T14:00:00+07:00',
};

/**
 * Kéo · xe chở người · 5 chỗ · 15km · đêm:
 * FIXED ≤10: 600_000 + PER_UNIT (15−10)×20_000 = 700_000
 * × 1.2 đêm = 840_000
 */
export const rescueOrderFeeLinePtiDemo = {
  id: 'rofl-demo-001',
  snapshot_id: rescueOrderFeeSnapshotPtiDemo.id,
  rescue_order_service_id: 800001,
  service_name: 'Kéo xe',
  supplier_amount: 0,
  customer_amount: 840_000,
  customer_individual_amount: 840_000,
  customer_enterprise_amount: 0,
  fixed_price: 700_000,
  customer_coefficient: 1.2,
  supplier_coefficient: 1,
  customer_source: 'VETC',
  supplier_source: '—',
  is_customer_manual: false,
  is_supplier_manual: false,
  matched_customer_line_id: 'fpl-pti-tow-pass-2-12-le10+from11',
  matched_supplier_line_id: null as string | null,
  breakdown_json: {
    formula: 'FIXED 600000 + PER_UNIT 20000*(15-10) = 700000; ×1.2 (đêm) = 840000',
    matched_lines: ['fpl-pti-tow-pass-2-12-le10', 'fpl-pti-tow-pass-2-12-from11'],
    surcharges: [{ name: 'Cứu hộ đêm', type: 'COEFFICIENT', value: 1.2 }],
  },
  sort_order: 1,
};

export const ptiSeedStats = {
  criterion_defs: feeCriterionDefPti.length,
  field_maps: feeCriterionFieldMapPti.length,
  services: feeServiceCatalogPti.length,
  price_lines: feePriceLinePti.length,
  price_lines_onsite: feePriceLinePti.filter((l) => l.service_catalog_id < 200).length,
  price_lines_tow: feePriceLinePti.filter((l) => l.service_catalog_id === 201).length,
  price_lines_crane: feePriceLinePti.filter((l) => l.service_catalog_id === 301).length,
  surcharge_rules: feeSurchargeRulePti.length,
  condition_rows: feePriceLinePti.reduce((n, l) => n + l.conditions.length, 0),
};
