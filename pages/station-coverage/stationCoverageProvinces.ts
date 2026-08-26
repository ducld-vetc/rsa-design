/** Master tỉnh từ area (prod-rsa) — Địa chỉ cũ 63 tỉnh, Địa chỉ mới 34 BOTH. */
export type AddressSchemaMode = 'old' | 'new';

export interface AreaProvinceRow {
  id: string;
  code: string;
  name: string;
  region: 'bac' | 'trung' | 'nam';
  center: [number, number];
  schemaVersion: 'V1' | 'BOTH';
  kind: 'kept' | 'merged_away';
}

/** Không thuộc 63 tỉnh chính thức trước sáp nhập 2025. */
export const OLD_NON_PROVINCE_CODES = new Set(['HTA', 'NHA', 'QK']);

/** Map mã tỉnh V1-only / lịch sử → BOTH (tạm, đến khi có area_code_mapping). */
export const V1_TO_BOTH_PROVINCE: Record<string, string> = {
  '01': 'HNO',
  'BDI': 'GLA',
  'BDU': 'HCM',
  'BGI': 'BNI',
  'BKA': 'TNG',
  'BLI': 'CMA',
  'BPH': 'DNI',
  'BRV': 'HCM',
  'BTH': 'LDO',
  'BTR': 'VLO',
  'DNO': 'LDO',
  'HBI': 'PTH',
  'HDU': 'HPH',
  'HGA': 'TQU',
  'HGI': 'CTH',
  'HNA': 'NBI',
  'HNO1': 'HNO',
  'HTA': 'HNO',
  'KGI': 'AGI',
  'KON': 'QNG',
  'LAN': 'TNI',
  'NDI': 'NBI',
  'NHA': 'NBI',
  'NTH': 'KHO',
  'PYE': 'DLA',
  'QBI': 'QTR',
  'QK': 'CTH',
  'QNA': 'DNA',
  'STR': 'CTH',
  'TBI': 'HYE',
  'TGI': 'DTH',
  'TVI': 'VLO',
  'VPH': 'PTH',
  'YBA': 'LCA',
};

export const AREA_PROVINCES: AreaProvinceRow[] = [
  { id: 'agi', code: 'AGI', name: 'An Giang', region: 'nam', center: [10.3, 105.0], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'bdi', code: 'BDI', name: 'Bình Định', region: 'nam', center: [14.16, 109.0], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bdu', code: 'BDU', name: 'Bình Dương', region: 'nam', center: [11.17, 106.67], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bgi', code: 'BGI', name: 'Bắc Giang', region: 'bac', center: [21.28, 106.19], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bka', code: 'BKA', name: 'Bắc Cạn', region: 'bac', center: [22.14, 105.83], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bli', code: 'BLI', name: 'Bạc Liêu', region: 'nam', center: [9.29, 105.72], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bni', code: 'BNI', name: 'Bắc Ninh', region: 'bac', center: [21.23, 106.15], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'bph', code: 'BPH', name: 'Bình Phước', region: 'nam', center: [11.65, 106.9], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'brv', code: 'BRV', name: 'Bà Rịa - Vũng Tàu', region: 'nam', center: [10.5, 107.2], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'bth', code: 'BTH', name: 'Bình Thuận', region: 'nam', center: [11.0, 108.1], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'btr', code: 'BTR', name: 'Bến Tre', region: 'nam', center: [10.24, 106.37], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'cba', code: 'CBA', name: 'Cao Bằng', region: 'bac', center: [22.666, 106.258], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'cma', code: 'CMA', name: 'Cà Mau', region: 'nam', center: [9.1, 105.1], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'cth', code: 'CTH', name: 'Thành phố Cần Thơ', region: 'nam', center: [9.9, 105.7], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'dbi', code: 'DBI', name: 'Điện Biên', region: 'bac', center: [21.387, 103.016], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'dla', code: 'DLA', name: 'Tỉnh Đắk Lắk', region: 'nam', center: [12.8, 108.2], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'dna', code: 'DNA', name: 'Thành phố Đà Nẵng', region: 'nam', center: [15.9, 108.1], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'dni', code: 'DNI', name: 'Đồng Nai', region: 'nam', center: [11.1, 107.0], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'dno', code: 'DNO', name: 'Đắk Nông', region: 'nam', center: [12.0, 107.7], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'dth', code: 'DTH', name: 'Đồng Tháp', region: 'nam', center: [10.4, 105.9], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'gla', code: 'GLA', name: 'Gia Lai', region: 'nam', center: [13.9, 108.3], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'hbi', code: 'HBI', name: 'Hòa Bình', region: 'bac', center: [20.8, 105.3], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hcm', code: 'HCM', name: 'Hồ Chí Minh', region: 'nam', center: [10.82, 106.75], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'hdu', code: 'HDU', name: 'Hải Dương', region: 'bac', center: [20.94, 106.33], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hga', code: 'HGA', name: 'Hà Giang', region: 'bac', center: [22.8, 104.98], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hgi', code: 'HGI', name: 'Hậu Giang', region: 'nam', center: [9.78, 105.47], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hna', code: 'HNA', name: 'Hà Nam', region: 'bac', center: [20.54, 105.91], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hno', code: 'HNO', name: 'Hà Nội', region: 'bac', center: [21.0285, 105.8542], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'hph', code: 'HPH', name: 'Hải Phòng', region: 'bac', center: [20.85, 106.5], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'hta', code: 'HTA', name: 'Hà Tây', region: 'bac', center: [20.97, 105.78], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'hti', code: 'HTI', name: 'Hà Tĩnh', region: 'trung', center: [18.3559, 105.8877], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'hye', code: 'HYE', name: 'Hưng Yên', region: 'bac', center: [20.55, 106.2], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'kgi', code: 'KGI', name: 'Kiên Giang', region: 'nam', center: [10.0, 105.08], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'kho', code: 'KHO', name: 'Khánh Hòa', region: 'nam', center: [12.0, 109.0], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'kon', code: 'KON', name: 'KonTum', region: 'nam', center: [14.35, 108.0], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'lan', code: 'LAN', name: 'Long An', region: 'nam', center: [10.6, 106.4], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'lca', code: 'LCA', name: 'Lào Cai', region: 'bac', center: [22.15, 104.4], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'lch', code: 'LCH', name: 'Lai Châu', region: 'bac', center: [22.396, 103.459], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'ldo', code: 'LDO', name: 'Lâm Đồng', region: 'nam', center: [11.7, 108.2], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'lso', code: 'LSO', name: 'Lạng Sơn', region: 'bac', center: [21.853, 106.761], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'nan', code: 'NAN', name: 'Nghệ An', region: 'trung', center: [18.673, 105.681], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'nbi', code: 'NBI', name: 'Ninh Bình', region: 'bac', center: [20.25, 106.0], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'ndi', code: 'NDI', name: 'Nam Định', region: 'bac', center: [20.42, 106.16], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'nha', code: 'NHA', name: 'Nam Hà', region: 'bac', center: [20.4, 106.0], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'nth', code: 'NTH', name: 'Ninh Thuận', region: 'nam', center: [11.6, 108.9], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'pth', code: 'PTH', name: 'Phú Thọ', region: 'bac', center: [21.3, 105.4], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'pye', code: 'PYE', name: 'Phú Yên', region: 'nam', center: [13.1, 109.3], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'qbi', code: 'QBI', name: 'Quảng Bình', region: 'trung', center: [17.5, 106.3], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'qk', code: 'QK', name: 'Quân khu 9', region: 'nam', center: [10.0, 105.8], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'qna', code: 'QNA', name: 'Quảng Nam', region: 'nam', center: [15.5, 108.1], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'qng', code: 'QNG', name: 'Quảng Ngãi', region: 'nam', center: [14.8, 108.4], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'qni', code: 'QNI', name: 'Quảng Ninh', region: 'bac', center: [21.0064, 107.2925], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'qtr', code: 'QTR', name: 'Quảng Trị', region: 'trung', center: [17.1, 106.7], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'sla', code: 'SLA', name: 'Sơn La', region: 'bac', center: [21.327, 103.914], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'str', code: 'STR', name: 'Sóc Trăng', region: 'nam', center: [9.6, 105.97], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'tbi', code: 'TBI', name: 'Thái Bình', region: 'bac', center: [20.45, 106.34], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'tgi', code: 'TGI', name: 'Tiền Giang', region: 'nam', center: [10.35, 106.36], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'tho', code: 'THO', name: 'Thanh Hóa', region: 'trung', center: [19.8067, 105.7852], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'tng', code: 'TNG', name: 'Thái Nguyên', region: 'bac', center: [21.7, 105.85], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'tni', code: 'TNI', name: 'Tây Ninh', region: 'nam', center: [11.0, 106.2], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'tqu', code: 'TQU', name: 'Tuyên Quang', region: 'bac', center: [22.15, 105.0], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'tth', code: 'TTH', name: 'Thành phố Huế', region: 'trung', center: [16.4637, 107.5909], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'tvi', code: 'TVI', name: 'Trà Vinh', region: 'nam', center: [9.93, 106.34], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'vlo', code: 'VLO', name: 'Vĩnh Long', region: 'nam', center: [10.1, 106.2], schemaVersion: 'BOTH', kind: 'kept' },
  { id: 'vph', code: 'VPH', name: 'Vĩnh Phúc', region: 'bac', center: [21.3, 105.6], schemaVersion: 'V1', kind: 'merged_away' },
  { id: 'yba', code: 'YBA', name: 'Yên Bái', region: 'bac', center: [21.7, 104.87], schemaVersion: 'V1', kind: 'merged_away' },
];

export const NEW_PROVINCE_CODES = new Set(
  AREA_PROVINCES.filter((p) => p.schemaVersion === 'BOTH').map((p) => p.code),
);

/** 63 tỉnh/thành địa chỉ cũ (loại Hà Tây, Nam Hà, Quân khu 9). */
export const OLD_PROVINCES: AreaProvinceRow[] = AREA_PROVINCES.filter(
  (p) => !OLD_NON_PROVINCE_CODES.has(p.code),
);

export const ADDRESS_SCHEMA_OPTIONS: { id: AddressSchemaMode; label: string; hint: string }[] = [
  { id: 'new', label: 'Địa chỉ mới', hint: '34 tỉnh · huyện/xã đồng bộ từ chuẩn hóa địa chỉ cũ' },
  { id: 'old', label: 'Địa chỉ cũ', hint: '3 cấp · 63 tỉnh/thành' },
];
