export const PACKAGE_IMPORT_CODES = [
  { value: 'RSA_PREMIUM', label: 'RSA_PREMIUM — Nâng cao 3 năm' },
  { value: 'RSA_PREMIUM2', label: 'RSA_PREMIUM2 — Nâng cao 2 năm' },
  { value: 'RSA_PREMIUM3', label: 'RSA_PREMIUM3 — Nâng cao 1 năm' },
] as const;

export const PACKAGE_IMPORT_PARTNERS = [
  { value: 'TASCO', label: 'TASCO — Bảo hiểm Tasco' },
  { value: 'PTI', label: 'PTI — Bảo hiểm Bưu điện' },
  { value: 'CARPLA', label: 'CARPLA' },
  { value: 'VETC', label: 'VETC' },
] as const;

export const PACKAGE_IMPORT_VEHICLE_KINDS = [
  { value: 'Xe chở người', label: 'Xe chở người' },
  { value: 'Xe chở hàng', label: 'Xe chở hàng' },
] as const;

export const PACKAGE_IMPORT_HEADERS = [
  'Mã đối tác',
  'Mã gói',
  'Tên người thụ hưởng',
  'Số điện thoại',
  'Địa chỉ',
  'Biển số xe',
  'Số khung',
  'Dòng xe',
  'Hãng xe',
  'Trọng tải',
  'Số chỗ',
  'Loại xe',
  'Ngày bắt đầu hiệu lực',
] as const;

export type PackageImportField = 'partnerCode' | 'packageCode' | 'beneficiaryName' | 'phone' | 'address' | 'plate' | 'vin' | 'model' | 'brand' | 'payload' | 'seats' | 'vehicleKind' | 'effectiveDate';

export const FIELD_TO_HEADER: Record<PackageImportField, string> = {
  partnerCode: 'Mã đối tác',
  packageCode: 'Mã gói',
  beneficiaryName: 'Tên người thụ hưởng',
  phone: 'Số điện thoại',
  address: 'Địa chỉ',
  plate: 'Biển số xe',
  vin: 'Số khung',
  model: 'Dòng xe',
  brand: 'Hãng xe',
  payload: 'Trọng tải',
  seats: 'Số chỗ',
  vehicleKind: 'Loại xe',
  effectiveDate: 'Ngày bắt đầu hiệu lực',
};

export const HEADER_ALIASES: Record<PackageImportField, string[]> = {
  partnerCode: ['Mã đối tác', 'Ma doi tac', 'partner_code', 'x-partner-code'],
  packageCode: ['Mã gói', 'Ma goi', 'package_code'],
  beneficiaryName: ['Tên người thụ hưởng', 'Ten nguoi thu huong', 'cust_name'],
  phone: ['Số điện thoại', 'So dien thoai', 'cust_phone', 'SĐT'],
  address: ['Địa chỉ', 'Dia chi'],
  plate: ['Biển số xe', 'Bien so xe', 'plate', 'BSX'],
  vin: ['Số khung', 'So khung', 'vin'],
  model: ['Dòng xe', 'Dong xe', 'model'],
  brand: ['Hãng xe', 'Hang xe', 'brand'],
  payload: ['Trọng tải', 'Trong tai', 'load_capacity'],
  seats: ['Số chỗ', 'So cho', 'seat_number'],
  vehicleKind: ['Loại xe', 'Loai xe'],
  effectiveDate: ['Ngày bắt đầu hiệu lực', 'Ngay bat dau hieu luc', 'effective_date'],
};

export type PackageImportStatus = 'active' | 'expired';

export interface ImportedPackageRecord {
  id: string;
  purchaseCode: string;
  importCode: string;
  partnerCode: string;
  packageCode: string;
  beneficiaryName: string;
  phone: string;
  address: string;
  plate: string;
  vin: string;
  model: string;
  brand: string;
  payload: string;
  seats: string;
  vehicleKind: string;
  effectiveDate: string;
  expiryDate: string;
  status: PackageImportStatus;
  createdAt: string;
  createdBy: string;
}

export type PackageImportBatchStatus = 'completed' | 'partial';

export interface PackageImportBatch {
  id: string;
  importCode: string;
  fileName: string;
  createdAt: string;
  createdBy: string;
  totalRows: number;
  successRows: number;
  errorRows: number;
  status: PackageImportBatchStatus;
}

export type PackageImportValues = Record<PackageImportField, string>;

export type ImportLineResult = 'success' | 'failed';

export interface PackageImportLine {
  id: string;
  importCode: string;
  result: ImportLineResult;
  values: PackageImportValues;
  errors: Partial<Record<PackageImportField, string>>;
  purchaseCode: string;
  expiryDate: string;
  status: PackageImportStatus | null;
  createdAt: string;
  createdBy: string;
}

export const recordToValues = (r: Pick<ImportedPackageRecord, PackageImportField>): PackageImportValues => ({
  partnerCode: r.partnerCode,
  packageCode: r.packageCode,
  beneficiaryName: r.beneficiaryName,
  phone: r.phone,
  address: r.address,
  plate: r.plate,
  vin: r.vin,
  model: r.model,
  brand: r.brand,
  payload: r.payload,
  seats: r.seats,
  vehicleKind: r.vehicleKind,
  effectiveDate: r.effectiveDate,
});

export interface PackageImportPreviewRow {
  id: string;
  values: PackageImportValues;
  errors: Partial<Record<PackageImportField, string>>;
  warnings?: Partial<Record<PackageImportField, string>>;
}

export const EXISTING_PACKAGE_PLATE_WARNING = 'Đã tồn tại gói cứu hộ';

export const normalizePlate = (plate: string) => plate.trim().toLowerCase().replace(/[\s.\-]/g, '');

export const applyExistingPlateWarnings = (
  rows: PackageImportPreviewRow[],
  existingPlates: Set<string>,
): PackageImportPreviewRow[] =>
  rows.map((row) => {
    const warnings = { ...(row.warnings || {}) };
    const plateKey = normalizePlate(row.values.plate);
    if (plateKey && existingPlates.has(plateKey)) warnings.plate = EXISTING_PACKAGE_PLATE_WARNING;
    else delete warnings.plate;
    return { ...row, warnings };
  });

export const rowHasWarning = (row: PackageImportPreviewRow) =>
  Boolean(row.warnings && Object.keys(row.warnings).length > 0);

export const emptyImportValues = (): PackageImportValues => ({
  partnerCode: '',
  packageCode: '',
  beneficiaryName: '',
  phone: '',
  address: '',
  plate: '',
  vin: '',
  model: '',
  brand: '',
  payload: '',
  seats: '',
  vehicleKind: '',
  effectiveDate: '',
});

const PARTNER_SET = new Set(PACKAGE_IMPORT_PARTNERS.map((p) => p.value.toUpperCase()));
const PACKAGE_SET = new Set(PACKAGE_IMPORT_CODES.map((p) => p.value.toUpperCase()));
const KIND_SET = new Set(PACKAGE_IMPORT_VEHICLE_KINDS.map((p) => p.value.toLowerCase()));

const compactPhone = (raw: string) => raw.replace(/[\s.\-]/g, '');

export const isValidVnPhone = (raw: string) => {
  const p = compactPhone(raw);
  if (/^0\d{9}$/.test(p)) return true;
  if (/^\+?84\d{9}$/.test(p)) return true;
  return false;
};

export const parseDisplayDate = (raw: string): Date | null => {
  const v = raw.trim();
  if (!v) return null;
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const vn = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (vn) {
    const d = new Date(Number(vn[3]), Number(vn[2]) - 1, Number(vn[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(v);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const formatVnDate = (date: Date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
};

export const validateImportValues = (values: PackageImportValues): Partial<Record<PackageImportField, string>> => {
  const errors: Partial<Record<PackageImportField, string>> = {};
  if (!values.partnerCode.trim()) errors.partnerCode = 'Bắt buộc';
  else if (!PARTNER_SET.has(values.partnerCode.trim().toUpperCase())) errors.partnerCode = 'Mã đối tác không tồn tại';

  if (!values.packageCode.trim()) errors.packageCode = 'Bắt buộc';
  else if (!PACKAGE_SET.has(values.packageCode.trim().toUpperCase())) errors.packageCode = 'Mã gói không hợp lệ';

  if (!values.beneficiaryName.trim()) errors.beneficiaryName = 'Bắt buộc';
  else if (values.beneficiaryName.trim().length < 2) errors.beneficiaryName = 'Tối thiểu 2 ký tự';

  if (!values.phone.trim()) errors.phone = 'Bắt buộc';
  else if (!isValidVnPhone(values.phone)) errors.phone = 'SĐT không hợp lệ';

  if (!values.address.trim()) errors.address = 'Bắt buộc';

  if (!values.plate.trim()) errors.plate = 'Bắt buộc';

  const vin = values.vin.trim().toUpperCase();
  if (!vin) errors.vin = 'Bắt buộc';
  else if (vin.length < 6 || vin.length > 17) errors.vin = 'Số khung 6–17 ký tự';
  else if (!/^[A-HJ-NPR-Z0-9]+$/.test(vin)) errors.vin = 'Số khung không hợp lệ';

  if (!values.model.trim()) errors.model = 'Bắt buộc';
  if (!values.brand.trim()) errors.brand = 'Bắt buộc';

  if (!values.payload.trim()) errors.payload = 'Bắt buộc';
  else if (Number.isNaN(Number(String(values.payload).replace(',', '.'))) || Number(String(values.payload).replace(',', '.')) < 0) {
    errors.payload = 'Phải là số ≥ 0';
  }

  if (!values.seats.trim()) errors.seats = 'Bắt buộc';
  else if (!/^\d+$/.test(values.seats.trim()) || Number(values.seats) < 1 || Number(values.seats) > 60) {
    errors.seats = 'Số chỗ 1–60';
  }

  if (!values.vehicleKind.trim()) errors.vehicleKind = 'Bắt buộc';
  else if (!KIND_SET.has(values.vehicleKind.trim().toLowerCase())) errors.vehicleKind = 'Chọn Xe chở người / Xe chở hàng';

  if (!values.effectiveDate.trim()) errors.effectiveDate = 'Bắt buộc';
  else if (!parseDisplayDate(values.effectiveDate)) errors.effectiveDate = 'Ngày không hợp lệ (dd/MM/yyyy)';

  return errors;
};

export const rowHasError = (row: PackageImportPreviewRow) => Object.keys(row.errors).length > 0;

export const packageDurationYears = (packageCode: string): number => {
  const code = packageCode.trim().toUpperCase();
  if (code === 'RSA_PREMIUM') return 3;
  if (code === 'RSA_PREMIUM2') return 2;
  if (code === 'RSA_PREMIUM3') return 1;
  return 1;
};

export const addYearsToVnDate = (raw: string, years: number): string => {
  const d = parseDisplayDate(raw);
  if (!d) return '';
  d.setFullYear(d.getFullYear() + years);
  return formatVnDate(d);
};

export const resolvePackageStatus = (expiryDate: string): PackageImportStatus => {
  const d = parseDisplayDate(expiryDate);
  if (!d) return 'active';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < today ? 'expired' : 'active';
};

const cloneValues = (values: PackageImportValues): PackageImportValues => ({ ...values });

/** Dữ liệu demo: mọi file upload đều ra các dòng này để sửa trên bảng. */
export const MOCK_IMPORT_PREVIEW_SEED: PackageImportValues[] = [
  {
    partnerCode: 'TASCO',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'Nguyen Van A',
    phone: '0912345678',
    address: 'Số 12, Phố Láng, Đống Đa, Hà Nội',
    plate: '30A12345',
    vin: 'RLH12345678901234',
    model: 'Vios',
    brand: 'Toyota',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '01/09/2026',
  },
  {
    partnerCode: 'PTI',
    packageCode: 'RSA_PREMIUM2',
    beneficiaryName: 'Tran Thi B',
    phone: '0987654321',
    address: 'Phường Long Biên, Hà Nội',
    plate: '29C-555.12',
    vin: 'KMHDN45D86U654321',
    model: 'Porter',
    brand: 'Hyundai',
    payload: '1.5',
    seats: '3',
    vehicleKind: 'Xe chở hàng',
    effectiveDate: '15/09/2026',
  },
  {
    partnerCode: 'ABC',
    packageCode: 'RSA_PREMIUM',
    beneficiaryName: 'Le Van C',
    phone: '0900111222',
    address: 'Nguyễn Trãi, Thanh Xuân, Hà Nội',
    plate: '51C99999',
    vin: 'RLSS4D26F0H123456',
    model: 'Accent',
    brand: 'Hyundai',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '10/09/2026',
  },
  {
    partnerCode: 'CARPLA',
    packageCode: 'RSA_XXX',
    beneficiaryName: 'Pham Duc D',
    phone: '0933444555',
    address: 'Quận 7, TP.HCM',
    plate: '51G-123.45',
    vin: 'MHKXXA7A0P0123456',
    model: 'City',
    brand: 'Honda',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '20/09/2026',
  },
  {
    partnerCode: 'VETC',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'Hoang Thi E',
    phone: '12345',
    address: 'Cầu Giấy, Hà Nội',
    plate: '30H88888',
    vin: 'ABC',
    model: 'Ranger',
    brand: 'Ford',
    payload: 'abc',
    seats: '99',
    vehicleKind: '',
    effectiveDate: '32/13/2026',
  },
  {
    partnerCode: 'TASCO',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: '',
    phone: '',
    address: '',
    plate: '30A12345',
    vin: '',
    model: '',
    brand: '',
    payload: '',
    seats: '',
    vehicleKind: 'Xe máy',
    effectiveDate: '',
  },
  {
    partnerCode: 'VETC',
    packageCode: 'RSA_PREMIUM',
    beneficiaryName: 'Nguyen Thi F',
    phone: '0944555666',
    address: 'Hai Bà Trưng, Hà Nội',
    plate: '29B-111.22',
    vin: 'JMZDK6W7A01234567',
    model: 'CX-5',
    brand: 'Mazda',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '05/10/2026',
  },
  {
    partnerCode: 'PTI',
    packageCode: 'RSA_PREMIUM2',
    beneficiaryName: 'Tran Van G',
    phone: '0977888999',
    address: 'Lê Văn Sỹ, Quận 3, TP.HCM',
    plate: '51F-678.90',
    vin: 'WBA3A51060E123456',
    model: '320i',
    brand: 'BMW',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '12/10/2026',
  },
  {
    partnerCode: 'CARPLA',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'Le Thi H',
    phone: '0901234567',
    address: 'Đống Đa, Hà Nội',
    plate: '30K-222.33',
    vin: 'MR0KA3CD0K0123456',
    model: 'Hilux',
    brand: 'Toyota',
    payload: '1.0',
    seats: '5',
    vehicleKind: 'Xe chở hàng',
    effectiveDate: '01/11/2026',
  },
  {
    partnerCode: 'TASCO',
    packageCode: 'RSA_PREMIUM',
    beneficiaryName: 'Pham Van I',
    phone: '0911222333',
    address: 'Thanh Xuân, Hà Nội',
    plate: '30E-444.55',
    vin: 'KMHXX00XXXX123456',
    model: 'Santa Fe',
    brand: 'Hyundai',
    payload: '0.5',
    seats: '7',
    vehicleKind: 'Xe chở người',
    effectiveDate: '15/11/2026',
  },
  {
    partnerCode: 'VETC',
    packageCode: 'RSA_PREMIUM2',
    beneficiaryName: 'Vo Thi K',
    phone: '0988777666',
    address: 'Nha Trang, Khánh Hòa',
    plate: '79A-12345',
    vin: 'VF1RFA00061234567',
    model: 'Captur',
    brand: 'Renault',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '20/11/2026',
  },
  {
    partnerCode: 'PTI',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'Dang Van L',
    phone: '0933111222',
    address: 'Hải Châu, Đà Nẵng',
    plate: '43C-98765',
    vin: 'NMTKN3AE0R0123456',
    model: 'Innova',
    brand: 'Toyota',
    payload: '0.5',
    seats: '7',
    vehicleKind: 'Xe chở người',
    effectiveDate: '25/11/2026',
  },
  {
    partnerCode: 'CARPLA',
    packageCode: 'RSA_PREMIUM',
    beneficiaryName: 'Bui Thi M',
    phone: '0922333444',
    address: 'Bình Thạnh, TP.HCM',
    plate: '59B-54321',
    vin: 'WDDGF4HB0CA123456',
    model: 'C200',
    brand: 'Mercedes',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '01/12/2026',
  },
  {
    partnerCode: 'TASCO',
    packageCode: 'RSA_PREMIUM2',
    beneficiaryName: 'Hoang Van N',
    phone: '0966555444',
    address: 'Long Biên, Hà Nội',
    plate: '29A-77788',
    vin: 'INVALID',
    model: 'F-150',
    brand: 'Ford',
    payload: '-1',
    seats: '0',
    vehicleKind: 'Xe tải',
    effectiveDate: 'abc',
  },
];

export const buildMockImportPreview = (): PackageImportPreviewRow[] => {
  const seen = new Map<string, number>();
  return MOCK_IMPORT_PREVIEW_SEED.map((seed, index) => {
    const values = cloneValues(seed);
    const errors = validateImportValues(values);
    const key = `${values.partnerCode}|${values.plate}`.toLowerCase();
    if (values.partnerCode && values.plate) {
      if (seen.has(key)) errors.plate = 'Trùng biển số + đối tác trong file';
      else seen.set(key, 1);
    }
    return { id: `row-${index + 1}`, values, errors };
  });
};

export const MOCK_IMPORT_BATCHES: PackageImportBatch[] = [
  {
    id: 'batch-1',
    importCode: 'IMP-260828-001',
    fileName: 'tasco_goi_thang8.xlsx',
    createdAt: '28/08/2026 14:20:11',
    createdBy: 'tasco.import',
    totalRows: 2,
    successRows: 1,
    errorRows: 1,
    status: 'partial',
  },
  {
    id: 'batch-2',
    importCode: 'IMP-260820-001',
    fileName: 'pti_import_0820.xlsx',
    createdAt: '20/08/2026 09:05:44',
    createdBy: 'pti.ops',
    totalRows: 1,
    successRows: 1,
    errorRows: 0,
    status: 'completed',
  },
  {
    id: 'batch-3',
    importCode: 'IMP-260712-001',
    fileName: 'carpla_goi_t7.xlsx',
    createdAt: '12/07/2026 16:41:02',
    createdBy: 'carpla.admin',
    totalRows: 1,
    successRows: 1,
    errorRows: 0,
    status: 'completed',
  },
];

export const MOCK_IMPORTED_PACKAGES: ImportedPackageRecord[] = [
  {
    id: 'imp-1',
    purchaseCode: 'RS32608280000081',
    importCode: 'IMP-260828-001',
    partnerCode: 'TASCO',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'NGUYỄN VĂN A',
    phone: '0912345678',
    address: 'Số 12, Phố Láng, Đống Đa, Hà Nội',
    plate: '30A12345',
    vin: 'RLH12345678901234',
    model: 'Vios',
    brand: 'Toyota',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '01/09/2026',
    expiryDate: '01/09/2027',
    status: 'active',
    createdAt: '28/08/2026 14:20:11',
    createdBy: 'tasco.import',
  },
  {
    id: 'imp-2',
    purchaseCode: 'RS32608200000079',
    importCode: 'IMP-260820-001',
    partnerCode: 'PTI',
    packageCode: 'RSA_PREMIUM2',
    beneficiaryName: 'TRẦN THỊ B',
    phone: '0987654321',
    address: 'Phường Long Biên, Hà Nội',
    plate: '29B88888',
    vin: 'KMHDN45D86U123456',
    model: 'Accent',
    brand: 'Hyundai',
    payload: '0.5',
    seats: '5',
    vehicleKind: 'Xe chở người',
    effectiveDate: '15/08/2026',
    expiryDate: '15/08/2028',
    status: 'active',
    createdAt: '20/08/2026 09:05:44',
    createdBy: 'pti.ops',
  },
  {
    id: 'imp-3',
    purchaseCode: 'RS32607120000075',
    importCode: 'IMP-260712-001',
    partnerCode: 'CARPLA',
    packageCode: 'RSA_PREMIUM3',
    beneficiaryName: 'PHẠM ĐỨC CƯỜNG',
    phone: '0900111222',
    address: 'Nguyễn Trãi, Thanh Xuân, Hà Nội',
    plate: '51C99999',
    vin: 'RLSS4D26F0H123456',
    model: 'Porter',
    brand: 'Hyundai',
    payload: '1.5',
    seats: '3',
    vehicleKind: 'Xe chở hàng',
    effectiveDate: '10/07/2025',
    expiryDate: '10/07/2026',
    status: 'expired',
    createdAt: '12/07/2026 16:41:02',
    createdBy: 'carpla.admin',
  },
];

const MOCK_FAILED_LINE_VALUES: PackageImportValues = {
  partnerCode: 'TASCO',
  packageCode: 'RSA_PREMIUM3',
  beneficiaryName: 'Le Van Loi',
  phone: '12345',
  address: 'Hoàng Mai, Hà Nội',
  plate: '30K11111',
  vin: 'AB',
  model: 'City',
  brand: 'Honda',
  payload: '0.5',
  seats: '5',
  vehicleKind: 'Xe chở người',
  effectiveDate: '01/09/2026',
};

export const MOCK_IMPORT_LINES: PackageImportLine[] = [
  ...MOCK_IMPORTED_PACKAGES.map((r) => ({
    id: `line-${r.id}`,
    importCode: r.importCode,
    result: 'success' as const,
    values: recordToValues(r),
    errors: {},
    purchaseCode: r.purchaseCode,
    expiryDate: r.expiryDate,
    status: r.status,
    createdAt: r.createdAt,
    createdBy: r.createdBy,
  })),
  {
    id: 'line-fail-1',
    importCode: 'IMP-260828-001',
    result: 'failed',
    values: MOCK_FAILED_LINE_VALUES,
    errors: validateImportValues(MOCK_FAILED_LINE_VALUES),
    purchaseCode: '',
    expiryDate: '',
    status: null,
    createdAt: '28/08/2026 14:20:11',
    createdBy: 'tasco.import',
  },
];
