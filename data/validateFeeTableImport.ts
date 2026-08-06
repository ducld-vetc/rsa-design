import type { FeeObjectType, FeeOrderType, FeeTarget } from './rescueFeeMockData';

export type FeeTableImportSheet = 'File' | 'ThongTin' | 'DichVu' | 'PhuPhi';

export interface FeeTableImportIssue {
  sheet: FeeTableImportSheet;
  /** 1-based data row (Excel/JSON array index + 1). Omit for field-level ThongTin / File. */
  row?: number;
  field: string;
  message: string;
}

/** Mã dịch vụ hợp lệ trong template import (đồng bộ RescueFeeForm). */
export const IMPORT_SERVICE_CODES: Record<string, string> = {
  ONSITE_BATTERY: 'Kích bình ắc quy',
  ONSITE_SPARE_TIRE: 'Thay lốp dự phòng',
  TOWING_GARAGE: 'Kéo xe về gara',
  TOWING_LONG_DISTANCE: 'Kéo xe đường dài',
  CRANE_ROAD: 'Cẩu xe mặt đường',
  CRANE_BELOW_ROAD: 'Cẩu xe dưới mặt đường',
};

/** Mã phụ phí → tên catalog (đồng bộ RescueFeeForm). */
export const IMPORT_SURCHARGE_CODES: Record<string, string> = {
  TIME_REQUEST: 'Thời gian yêu cầu cứu hộ',
  TIME_EXECUTION: 'Thời gian thực hiện cứu hộ',
  HIGHWAY_ROUTE: 'Tuyến cao tốc',
  WEATHER_STORM: 'Thời tiết',
  HOLIDAY: 'Lễ/Tết',
};

const VALID_TARGETS = new Set<FeeTarget>(['CUSTOMER', 'SUPPLIER']);
const VALID_OBJECT_TYPES = new Set<FeeObjectType>([
  'SUPPLIER_INTERNAL',
  'SUPPLIER_EXTERNAL',
  'CUSTOMER_INDIVIDUAL',
  'CUSTOMER_BUSINESS',
]);
const VALID_ORDER_TYPES = new Set<FeeOrderType>(['PACKAGE', 'SINGLE', 'PACKAGE_SINGLE']);
const OBJECT_TYPES_BY_TARGET: Record<FeeTarget, Set<string>> = {
  SUPPLIER: new Set(['SUPPLIER_INTERNAL', 'SUPPLIER_EXTERNAL']),
  CUSTOMER: new Set(['CUSTOMER_INDIVIDUAL', 'CUSTOMER_BUSINESS']),
};
const VALID_BOUND_OPERATORS = new Set([
  '',
  '<',
  '≤',
  '<=',
  '>',
  '≥',
  '>=',
  'true',
  'false',
  '0',
  '1',
  'open',
  'close',
]);
const VALID_SURCHARGE_OPERATORS = new Set(['=', 'BETWEEN', '']);

const isBlankRow = (row: Record<string, unknown>): boolean =>
  Object.values(row).every((value) => String(value ?? '').trim() === '');

const isPresentNumber = (raw: unknown): boolean => {
  const text = String(raw ?? '').trim();
  if (!text) return false;
  return Number.isFinite(Number(text));
};

const pushIssue = (
  issues: FeeTableImportIssue[],
  issue: FeeTableImportIssue
): void => {
  issues.push(issue);
};

export const formatFeeTableImportIssue = (issue: FeeTableImportIssue): string => {
  if (issue.sheet === 'File' || issue.row == null) {
    if (issue.sheet === 'ThongTin') {
      return `[ThongTin] ${issue.field}: ${issue.message}`;
    }
    if (issue.sheet === 'File') {
      return issue.field === 'file'
        ? `[File] ${issue.message}`
        : `[File] ${issue.field}: ${issue.message}`;
    }
    return `[${issue.sheet}] ${issue.field}: ${issue.message}`;
  }
  return `[${issue.sheet}] Dòng ${issue.row} · ${issue.field}: ${issue.message}`;
};

const validateThongTin = (
  payload: Record<string, unknown>,
  issues: FeeTableImportIssue[]
): void => {
  const targetRaw = String(payload.target ?? '').trim();
  if (targetRaw && !VALID_TARGETS.has(targetRaw as FeeTarget)) {
    pushIssue(issues, {
      sheet: 'ThongTin',
      field: 'target',
      message: 'Giá trị không hợp lệ (CUSTOMER | SUPPLIER)',
    });
  }

  const scope = (payload.scope as Record<string, unknown> | undefined) ?? {};
  const objectType = String(scope.objectType ?? payload.objectType ?? '').trim();
  if (objectType) {
    if (!VALID_OBJECT_TYPES.has(objectType as FeeObjectType)) {
      pushIssue(issues, {
        sheet: 'ThongTin',
        field: 'scope.objectType',
        message: 'Giá trị không hợp lệ',
      });
    } else if (targetRaw && VALID_TARGETS.has(targetRaw as FeeTarget)) {
      const allowed = OBJECT_TYPES_BY_TARGET[targetRaw as FeeTarget];
      if (!allowed.has(objectType)) {
        pushIssue(issues, {
          sheet: 'ThongTin',
          field: 'scope.objectType',
          message: `Không khớp target=${targetRaw}`,
        });
      }
    }
  }

  const orderType = String(scope.orderType ?? payload.orderType ?? '').trim();
  if (orderType && !VALID_ORDER_TYPES.has(orderType as FeeOrderType)) {
    pushIssue(issues, {
      sheet: 'ThongTin',
      field: 'scope.orderType',
      message: 'Giá trị không hợp lệ (PACKAGE | SINGLE | PACKAGE_SINGLE)',
    });
  }

  const settings = (payload.settings as Record<string, unknown> | undefined) ?? {};
  const roundMode = String(settings.roundMode ?? payload.roundMode ?? '').trim();
  if (roundMode && !['NEAREST_1000', 'NEAREST_100', 'NONE'].includes(roundMode)) {
    pushIssue(issues, {
      sheet: 'ThongTin',
      field: 'roundMode',
      message: 'Giá trị không hợp lệ (NEAREST_1000 | NEAREST_100 | NONE)',
    });
  }
};

const validateBoundOperator = (
  issues: FeeTableImportIssue[],
  sheet: 'DichVu' | 'PhuPhi',
  row: number,
  field: string,
  raw: unknown
): void => {
  const text = String(raw ?? '').trim();
  if (!VALID_BOUND_OPERATORS.has(text)) {
    pushIssue(issues, {
      sheet,
      row,
      field,
      message: 'Toán tử biên không hợp lệ (< | ≤)',
    });
  }
};

const validateDichVuRow = (
  item: Record<string, unknown>,
  row: number,
  issues: FeeTableImportIssue[]
): boolean => {
  if (isBlankRow(item)) return false;

  const serviceCode = String(item.serviceCode ?? '').trim();
  const serviceDetail = String(
    item.service ?? item.DichVu ?? item.serviceDetail ?? ''
  ).trim();
  const resolvedDetail =
    serviceDetail || (serviceCode ? IMPORT_SERVICE_CODES[serviceCode] ?? '' : '');

  if (!serviceCode && !serviceDetail) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'serviceCode',
      message: 'Bắt buộc nhập mã dịch vụ',
    });
  } else if (serviceCode && !IMPORT_SERVICE_CODES[serviceCode]) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'serviceCode',
      message: 'Mã dịch vụ không thuộc catalog',
    });
  } else if (!resolvedDetail) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'serviceCode',
      message: 'Không suy được dịch vụ từ mã/tên',
    });
  }

  const pricingRaw = String(item.pricingMode ?? item.CachTinh ?? '').trim();
  if (
    pricingRaw &&
    !/^(FIXED|PER_UNIT)$/i.test(pricingRaw) &&
    !/per[_\s-]?unit|đơn vị|don vi|theo lượt|fixed/i.test(pricingRaw)
  ) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'pricingMode',
      message: 'Giá trị không hợp lệ (FIXED | PER_UNIT)',
    });
  }

  const baseRaw = item.basePrice ?? item.MucGia ?? item.price;
  if (baseRaw !== undefined && String(baseRaw).trim() !== '' && !isPresentNumber(baseRaw)) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'basePrice',
      message: 'Phải là số',
    });
  }

  const fromValue = item.from ?? item.Tu;
  const toValue = item.to ?? item.Den;
  const fromText = String(fromValue ?? '').trim();
  const toText = String(toValue ?? '').trim();
  if (fromText && !isPresentNumber(fromValue)) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'from',
      message: 'Phải là số',
    });
  }
  if (toText && !isPresentNumber(toValue)) {
    pushIssue(issues, {
      sheet: 'DichVu',
      row,
      field: 'to',
      message: 'Phải là số',
    });
  }
  if (fromText && toText && isPresentNumber(fromValue) && isPresentNumber(toValue)) {
    if (Number(fromValue) >= Number(toValue)) {
      pushIssue(issues, {
        sheet: 'DichVu',
        row,
        field: 'from/to',
        message: 'from ≥ to',
      });
    }
  }

  validateBoundOperator(
    issues,
    'DichVu',
    row,
    'fromOperator',
    item.fromOperator ?? item.fromInclusive ?? item.tuOperator
  );
  validateBoundOperator(
    issues,
    'DichVu',
    row,
    'toOperator',
    item.toOperator ?? item.toInclusive ?? item.denOperator
  );

  return true;
};

const validatePhuPhiRow = (
  item: Record<string, unknown>,
  row: number,
  issues: FeeTableImportIssue[],
  surchargeNameToCriterion: Map<string, string>
): boolean => {
  if (isBlankRow(item)) return false;

  const surchargeCode = String(item.surchargeCode ?? '').trim();
  const name = String(
    item.name ?? item.TenPhuPhi ?? (surchargeCode ? IMPORT_SURCHARGE_CODES[surchargeCode] ?? '' : '')
  ).trim();

  if (!surchargeCode && !name) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'surchargeCode',
      message: 'Bắt buộc nhập mã phụ phí',
    });
  } else if (surchargeCode && !IMPORT_SURCHARGE_CODES[surchargeCode]) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'surchargeCode',
      message: 'Mã phụ phí không thuộc catalog',
    });
  } else if (!name) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'surchargeCode',
      message: 'Không suy được phụ phí từ mã',
    });
  } else {
    const criterionKey = surchargeNameToCriterion.get(name) ?? '';
    if (!criterionKey) {
      pushIssue(issues, {
        sheet: 'PhuPhi',
        row,
        field: 'surchargeCode',
        message: 'Không suy được tiêu chí từ catalog',
      });
    }
  }

  const typeRaw = String(item.type ?? item.Kieu ?? '').trim();
  if (
    typeRaw &&
    !/^(FIXED|COEFFICIENT)$/i.test(typeRaw) &&
    !/coeff|hệ số|he so|cố định|co dinh|fixed/i.test(typeRaw)
  ) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'type',
      message: 'Giá trị không hợp lệ (FIXED | COEFFICIENT)',
    });
  }

  const valueRaw = item.value ?? item.GiaTri;
  if (valueRaw !== undefined && String(valueRaw).trim() !== '' && !isPresentNumber(valueRaw)) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'value',
      message: 'Phải là số',
    });
  }

  const operator = String(item.operator ?? item.criterionOperator ?? '')
    .trim()
    .toUpperCase();
  if (operator && !VALID_SURCHARGE_OPERATORS.has(operator)) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      row,
      field: 'operator',
      message: 'Giá trị không hợp lệ (= | BETWEEN)',
    });
  }

  const criterionFrom = String(item.criterionFrom ?? item.from ?? '').trim();
  const criterionTo = String(item.criterionTo ?? item.to ?? '').trim();
  if (operator === 'BETWEEN') {
    if (!criterionFrom || !criterionTo) {
      pushIssue(issues, {
        sheet: 'PhuPhi',
        row,
        field: 'criterionFrom/criterionTo',
        message: 'BETWEEN bắt buộc có criterionFrom và criterionTo',
      });
    }
  }

  validateBoundOperator(
    issues,
    'PhuPhi',
    row,
    'fromOperator',
    item.fromOperator ?? item.fromInclusive ?? item.criterionFromOperator
  );
  validateBoundOperator(
    issues,
    'PhuPhi',
    row,
    'toOperator',
    item.toOperator ?? item.toInclusive ?? item.criterionToOperator
  );

  return true;
};

export interface ValidateFeeTableImportOptions {
  /** Map tên phụ phí catalog → criterionKey */
  surchargeNameToCriterion?: Map<string, string> | Record<string, string>;
}

/**
 * Validate payload import bảng phí (JSON đã parse / Excel đã map).
 * Thu thập tất cả lỗi — không fail-fast.
 */
export const validateFeeTableImportPayload = (
  payload: Record<string, unknown>,
  options: ValidateFeeTableImportOptions = {}
): FeeTableImportIssue[] => {
  const issues: FeeTableImportIssue[] = [];

  const surchargeNameToCriterion = (() => {
    if (options.surchargeNameToCriterion instanceof Map) {
      return options.surchargeNameToCriterion;
    }
    if (options.surchargeNameToCriterion) {
      return new Map(Object.entries(options.surchargeNameToCriterion));
    }
    return new Map<string, string>();
  })();

  validateThongTin(payload, issues);

  const serviceRows = Array.isArray(payload.services)
    ? payload.services
    : Array.isArray(payload.DichVu)
      ? payload.DichVu
      : [];
  const surchargeRows = Array.isArray(payload.surcharges)
    ? payload.surcharges
    : Array.isArray(payload.PhuPhi)
      ? payload.PhuPhi
      : [];

  if (!Array.isArray(serviceRows)) {
    pushIssue(issues, {
      sheet: 'DichVu',
      field: 'services',
      message: 'Phải là mảng',
    });
  }
  if (!Array.isArray(surchargeRows)) {
    pushIssue(issues, {
      sheet: 'PhuPhi',
      field: 'surcharges',
      message: 'Phải là mảng',
    });
  }

  let serviceDataRows = 0;
  if (Array.isArray(serviceRows)) {
    serviceRows.forEach((row, index) => {
      const item = (row ?? {}) as Record<string, unknown>;
      if (validateDichVuRow(item, index + 1, issues)) serviceDataRows += 1;
    });
  }

  let surchargeDataRows = 0;
  if (Array.isArray(surchargeRows)) {
    surchargeRows.forEach((row, index) => {
      const item = (row ?? {}) as Record<string, unknown>;
      if (validatePhuPhiRow(item, index + 1, issues, surchargeNameToCriterion)) {
        surchargeDataRows += 1;
      }
    });
  }

  if (serviceDataRows === 0 && surchargeDataRows === 0) {
    pushIssue(issues, {
      sheet: 'File',
      field: 'payload',
      message: 'Không tìm thấy dòng dịch vụ hoặc phụ phí hợp lệ',
    });
  }

  return issues;
};

/** Kiểm tra workbook Excel có đủ sheet bắt buộc. */
export const validateFeeTableImportWorkbookSheets = (
  sheetNames: string[]
): FeeTableImportIssue[] => {
  const required = ['ThongTin', 'DichVu', 'PhuPhi'] as const;
  const present = new Set(sheetNames);
  return required
    .filter((name) => !present.has(name))
    .map((name) => ({
      sheet: 'File' as const,
      field: 'sheet',
      message: `Thiếu sheet bắt buộc: ${name}`,
    }));
};
