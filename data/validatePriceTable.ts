import {
  isTimeSurchargeCriterion,
  usesRetailMarkupOnlyPricing,
  type CriterionValueType,
  type FeeCriterion,
  type FeeRuleCondition,
  type PriceTable,
  type ServicePriceRule,
} from './rescueFeeMockData';

export type PriceTableValidateTab =
  | 'general'
  | 'matrix'
  | 'scope'
  | 'services'
  | 'criteria'
  | 'surcharges';

export interface PriceTableValidationIssue {
  message: string;
  tab: PriceTableValidateTab;
}

export interface ConditionValidationIssue {
  /** Index trong mảng conditions được truyền vào (không phải index gốc trên rule). */
  rowIndex: number;
  message: string;
}

export interface ConditionsValidationResult {
  ok: boolean;
  message: string;
  rowErrors: ConditionValidationIssue[];
}

const DISTANCE_KEYS = new Set(['distanceKm', 'roadDistance']);

export const isConditionValueEmpty = (condition: FeeRuleCondition): boolean => {
  if (condition.operator === 'BETWEEN') {
    if (!Array.isArray(condition.value) || condition.value.length < 2) return true;
    return String(condition.value[0]).trim() === '' || String(condition.value[1]).trim() === '';
  }
  if (condition.operator === 'IN') {
    if (Array.isArray(condition.value)) {
      return (
        condition.value.length === 0 ||
        condition.value.every((item) => String(item).trim() === '')
      );
    }
    return String(condition.value ?? '').trim() === '';
  }
  if (Array.isArray(condition.value)) {
    return condition.value.every((item) => String(item).trim() === '');
  }
  return String(condition.value ?? '').trim() === '';
};

const operatorsForValueType = (
  valueType?: CriterionValueType
): FeeRuleCondition['operator'][] => {
  if (valueType === 'RANGE') return ['BETWEEN', '>=', '<='];
  if (valueType === 'TIME') return ['BETWEEN'];
  if (valueType === 'LIST') return ['=', 'IN'];
  return ['=', 'IN', 'BETWEEN', '>=', '<='];
};

export const allowedOperatorsForCriterion = (
  criterion?: Pick<FeeCriterion, 'valueType'> | null
): FeeRuleCondition['operator'][] => operatorsForValueType(criterion?.valueType);

const isNumericOperator = (operator: FeeRuleCondition['operator']): boolean =>
  operator === 'BETWEEN' || operator === '>=' || operator === '<=';

const validateSingleCondition = (
  condition: FeeRuleCondition,
  criterion: FeeCriterion | undefined,
  rowIndex: number,
  seenKeys: Map<string, number>
): ConditionValidationIssue | null => {
  if (!condition.criterionKey?.trim()) {
    return { rowIndex, message: 'Vui lòng chọn tiêu chí' };
  }

  const firstDup = seenKeys.get(condition.criterionKey);
  if (firstDup !== undefined) {
    return {
      rowIndex,
      message: `Tiêu chí "${condition.criterionLabel || condition.criterionKey}" bị trùng (dòng ${firstDup + 1})`,
    };
  }
  seenKeys.set(condition.criterionKey, rowIndex);

  const valueType = criterion?.valueType;
  const allowedOps = operatorsForValueType(valueType);
  if (!allowedOps.includes(condition.operator)) {
    const label = condition.criterionLabel || condition.criterionKey;
    if (valueType === 'RANGE') {
      return {
        rowIndex,
        message: `"${label}" là khoảng số — dùng Từ – Đến (≥ / ≤ nếu một biên)`,
      };
    }
    if (valueType === 'TIME') {
      return { rowIndex, message: `"${label}" bắt buộc toán tử Từ – Đến` };
    }
    if (valueType === 'LIST') {
      return { rowIndex, message: `"${label}" là danh sách — dùng Bằng hoặc Thuộc danh sách` };
    }
    return { rowIndex, message: `Toán tử không hợp lệ cho tiêu chí "${label}"` };
  }

  if (isConditionValueEmpty(condition)) {
    return {
      rowIndex,
      message: `Vui lòng nhập giá trị cho "${condition.criterionLabel || condition.criterionKey}"`,
    };
  }

  if (condition.operator === 'BETWEEN' && Array.isArray(condition.value)) {
    const fromRaw = String(condition.value[0]).trim();
    const toRaw = String(condition.value[1]).trim();
    if (valueType === 'TIME' || isTimeSurchargeCriterion(condition.criterionKey)) {
      return null;
    }
    const from = Number(fromRaw);
    const to = Number(toRaw);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      return { rowIndex, message: 'Khoảng Từ – Đến phải là số hợp lệ' };
    }
    if (from > to) {
      return { rowIndex, message: 'Giá trị Từ không được lớn hơn Đến' };
    }
    const fromInc = condition.fromInclusive !== false;
    const toInc = condition.toInclusive !== false;
    if (from === to && (!fromInc || !toInc)) {
      return {
        rowIndex,
        message: 'Khoảng rỗng: Từ = Đến nhưng có biên không bao gồm',
      };
    }
    return null;
  }

  if ((condition.operator === '>=' || condition.operator === '<=') && isNumericOperator(condition.operator)) {
    const raw = Array.isArray(condition.value)
      ? String(condition.value[0] ?? '').trim()
      : String(condition.value ?? '').trim();
    if (!Number.isFinite(Number(raw))) {
      return { rowIndex, message: 'Giá trị so sánh phải là số hợp lệ' };
    }
  }

  if (
    (condition.operator === '=' || condition.operator === 'IN') &&
    (criterion?.allowedValues?.length ?? 0) > 0
  ) {
    const allowed = new Set(criterion!.allowedValues!.map(String));
    const values = Array.isArray(condition.value)
      ? condition.value.map(String)
      : [String(condition.value ?? '')];
    const invalid = values.find((value) => value.trim() && !allowed.has(value));
    if (invalid) {
      return {
        rowIndex,
        message: `Giá trị "${invalid}" không thuộc danh sách cho phép`,
      };
    }
  }

  return null;
};

/**
 * Validate danh sách tiêu chí bổ sung trên một dòng giá (modal cấu hình).
 * `conditions` = các điều kiện đang chỉnh (đã loại primary nếu cần).
 */
export const validateAdditionalCriteriaConditions = (
  conditions: FeeRuleCondition[],
  priceCriteria: FeeCriterion[] = []
): ConditionsValidationResult => {
  const rowErrors: ConditionValidationIssue[] = [];
  const seenKeys = new Map<string, number>();
  const byKey = new Map(priceCriteria.map((item) => [item.key, item]));

  conditions.forEach((condition, rowIndex) => {
    const issue = validateSingleCondition(
      condition,
      byKey.get(condition.criterionKey),
      rowIndex,
      seenKeys
    );
    if (issue) rowErrors.push(issue);
  });

  if (rowErrors.length === 0) {
    return { ok: true, message: '', rowErrors: [] };
  }
  return {
    ok: false,
    message: rowErrors[0]?.message ?? 'Cấu hình tiêu chí bổ sung chưa hợp lệ',
    rowErrors,
  };
};

const normalizeConditionValue = (value: FeeRuleCondition['value']): string => {
  if (Array.isArray(value)) return value.map(String).join('|');
  return String(value ?? '');
};

const conditionFingerprint = (conditions: FeeRuleCondition[] | undefined): string => {
  const parts = (conditions ?? [])
    .filter((condition) => !DISTANCE_KEYS.has(condition.criterionKey))
    .map(
      (condition) =>
        `${condition.criterionKey}:${condition.operator}:${normalizeConditionValue(condition.value)}`
    )
    .sort();
  return parts.join(';');
};

const extractBetweenRange = (
  conditions: FeeRuleCondition[] | undefined,
  key: string
): { from: number; to: number } | null => {
  const condition = (conditions ?? []).find(
    (item) => item.criterionKey === key && item.operator === 'BETWEEN'
  );
  if (!condition || !Array.isArray(condition.value) || condition.value.length < 2) return null;
  const from = Number(condition.value[0]);
  const to = Number(condition.value[1]);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return { from, to };
};

const findActiveConflict = (
  form: PriceTable,
  existing: PriceTable[]
): PriceTable | null => {
  if (form.status !== 'ACTIVE') return null;
  const others = existing.filter((table) => table.id !== form.id && table.status === 'ACTIVE');

  const enterpriseCode = form.scope.enterpriseCode?.trim();
  if (enterpriseCode) {
    const conflict = others.find((table) => table.scope.enterpriseCode === enterpriseCode);
    if (conflict) return conflict;
  }

  const supplierId = form.scope.supplierId?.trim();
  if (supplierId) {
    const conflict = others.find((table) => table.scope.supplierId === supplierId);
    if (conflict) return conflict;
  }

  if (!enterpriseCode && !supplierId) {
    const conflict = others.find(
      (table) =>
        !table.scope.enterpriseCode &&
        !table.scope.supplierId &&
        table.target === form.target &&
        table.kind === form.kind
    );
    if (conflict) return conflict;
  }

  return null;
};

const validateDistanceContinuity = (
  rules: ServicePriceRule[]
): PriceTableValidationIssue | null => {
  type GroupItem = { serviceDetail: string; key: string; from: number; to: number };
  const groups = new Map<string, GroupItem[]>();

  for (const rule of rules) {
    for (const key of DISTANCE_KEYS) {
      const range = extractBetweenRange(rule.conditions, key);
      if (!range) continue;
      const groupKey = `${rule.serviceDetail}::${key}::${conditionFingerprint(rule.conditions)}`;
      const list = groups.get(groupKey) ?? [];
      list.push({
        serviceDetail: rule.serviceDetail,
        key,
        from: range.from,
        to: range.to,
      });
      groups.set(groupKey, list);
    }
  }

  for (const items of groups.values()) {
    if (items.length < 2) continue;
    const sorted = [...items].sort((a, b) => a.from - b.from || a.to - b.to);
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.to === next.from) continue;
      const criterionLabel =
        current.key === 'distanceKm' ? 'khoảng cách kéo' : 'khoảng cách so với mặt đất';
      const relation = current.to > next.from ? 'overlap' : 'gap';
      return {
        tab: 'matrix',
        message:
          relation === 'gap'
            ? `Dịch vụ "${current.serviceDetail}": ${criterionLabel} bị gap giữa [${current.from},${current.to}] và [${next.from},${next.to}]`
            : `Dịch vụ "${current.serviceDetail}": ${criterionLabel} bị overlap giữa [${current.from},${current.to}] và [${next.from},${next.to}]`,
      };
    }
  }

  return null;
};

/**
 * Validate khi Lưu bảng phí (create/edit). Fail-fast, trả issue đầu tiên.
 */
export const validatePriceTableForSave = (
  form: PriceTable,
  existing: PriceTable[]
): PriceTableValidationIssue | null => {
  if (!form.code.trim() || !form.name.trim()) {
    return { message: 'Vui lòng nhập mã và tên bảng phí', tab: 'general' };
  }

  if (!String(form.validFrom ?? '').trim()) {
    return { message: 'Vui lòng nhập ngày hiệu lực từ (validFrom)', tab: 'general' };
  }

  const validTo = String(form.validTo ?? '').trim();
  if (validTo && form.validFrom > validTo) {
    return {
      message: 'Ngày hiệu lực Từ không được lớn hơn Đến',
      tab: 'general',
    };
  }

  if (form.kind === 'CUSTOMER_BUSINESS' && !form.scope.enterpriseCode?.trim()) {
    return {
      message: 'Bảng CUSTOMER_BUSINESS bắt buộc chọn doanh nghiệp áp dụng',
      tab: 'general',
    };
  }

  if (form.kind === 'SUPPLIER_EXTERNAL' && !form.scope.supplierId?.trim()) {
    return {
      message: 'Bảng SUPPLIER_EXTERNAL bắt buộc chọn NCC áp dụng',
      tab: 'general',
    };
  }

  const conflict = findActiveConflict(form, existing);
  if (conflict) {
    if (form.scope.enterpriseCode?.trim()) {
      return {
        tab: 'general',
        message: `Đã có bảng phí ACTIVE cho doanh nghiệp ${form.scope.enterpriseCode} (mã ${conflict.code})`,
      };
    }
    if (form.scope.supplierId?.trim()) {
      return {
        tab: 'general',
        message: `Đã có bảng phí ACTIVE cho NCC ${form.scope.supplierId} (mã ${conflict.code})`,
      };
    }
    return {
      tab: 'general',
      message: `Đã có bảng phí ACTIVE cùng target/kind (mã ${conflict.code})`,
    };
  }

  const markupOnly = usesRetailMarkupOnlyPricing(form);

  if (form.kind !== 'CUSTOMER_RETAIL' && Number(form.settings.retailMarkupFactor) > 0) {
    return {
      tab: 'general',
      message:
        'Hệ số giá khách lẻ chỉ áp dụng khi bật chế độ chỉ hệ số trên loại bảng Khách hàng lẻ',
    };
  }

  if (markupOnly) {
    if (!(Number(form.settings.retailMarkupFactor) > 0)) {
      return {
        tab: 'general',
        message: 'Chế độ chỉ hệ số giá khách lẻ bắt buộc nhập hệ số > 0',
      };
    }
    if (form.serviceRules.length > 0 || form.surchargeRules.length > 0) {
      return {
        tab: 'general',
        message:
          'Bảng áp dụng hệ số giá khách lẻ không được cấu hình dòng giá hoặc phụ phí',
      };
    }
    return null;
  }

  if (form.serviceRules.length === 0) {
    return {
      message: 'Vui lòng cấu hình ít nhất một dòng giá dịch vụ',
      tab: 'matrix',
    };
  }

  const serviceHeads = Array.from(new Set(form.serviceRules.map((rule) => rule.serviceDetail)));
  for (const serviceDetail of serviceHeads) {
    const rules = form.serviceRules.filter((rule) => rule.serviceDetail === serviceDetail);
    if (rules.length === 0) {
      return {
        tab: 'matrix',
        message: `Dịch vụ "${serviceDetail}" đã chọn nhưng chưa có dòng giá`,
      };
    }
    if (rules.some((rule) => !(Number(rule.basePrice) > 0))) {
      return {
        tab: 'matrix',
        message: `Dịch vụ "${serviceDetail}" bắt buộc cấu hình mức phí (basePrice > 0) cho mọi dòng giá`,
      };
    }
  }

  const emptyCondition = form.serviceRules.some((rule) =>
    (rule.conditions ?? []).some((condition) => isConditionValueEmpty(condition))
  );
  if (emptyCondition) {
    return {
      message: 'Vui lòng nhập đủ giá trị cho tất cả tiêu chí (không được để trống)',
      tab: 'matrix',
    };
  }

  for (const rule of form.serviceRules) {
    const conditionIssue = validateAdditionalCriteriaConditions(
      rule.conditions ?? [],
      form.priceCriteria ?? []
    );
    if (!conditionIssue.ok) {
      return {
        message: `${rule.serviceDetail}: ${conditionIssue.message}`,
        tab: 'matrix',
      };
    }
  }

  const continuityIssue = validateDistanceContinuity(form.serviceRules);
  if (continuityIssue) return continuityIssue;

  if (
    (form.priceCriteria ?? []).some(
      (c) => (c.valueType ?? 'LIST') === 'LIST' && !c.allowedValues?.length
    )
  ) {
    return {
      message: 'Mỗi tiêu chí của ma trận phải có ít nhất một giá trị cho phép',
      tab: 'general',
    };
  }

  if (form.surchargeRules.some((s) => !s.conditions.length)) {
    return {
      message: 'Mỗi phụ phí bắt buộc phải chọn ít nhất một tiêu chí phụ',
      tab: 'surcharges',
    };
  }

  if (form.surchargeRules.some((s) => !(Number(s.value) > 0))) {
    return {
      message: 'Mỗi phụ phí đã chọn bắt buộc cấu hình mức phí / hệ số (> 0)',
      tab: 'surcharges',
    };
  }

  if (
    form.surchargeRules.some((s) => {
      const condition = s.conditions[0];
      if (!condition || !isTimeSurchargeCriterion(condition.criterionKey)) return false;
      if (!Array.isArray(condition.value) || condition.value.length < 2) return true;
      return !String(condition.value[0]).trim() || !String(condition.value[1]).trim();
    })
  ) {
    return {
      message: 'Phụ phí thời gian bắt buộc nhập đủ khoảng Từ – Đến',
      tab: 'surcharges',
    };
  }

  if (
    form.surchargeRules.some(
      (s) =>
        (s.name === 'Lễ/Tết' || s.conditions[0]?.criterionKey === 'holiday') &&
        !(s.holidayDates ?? []).some((date) => date.trim())
    )
  ) {
    return {
      message: 'Phụ phí Lễ/Tết bắt buộc cấu hình ít nhất một ngày holiday',
      tab: 'surcharges',
    };
  }

  return null;
};
