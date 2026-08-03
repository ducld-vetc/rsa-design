import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  GripVertical,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AppSelect from '../shared/AppSelect';
import {
  CRITERIA_CATALOG,
  CRITERIA_SYSTEM_CONFIG,
  feeCriterionDefinitions,
  FEE_SERVICE_CATALOG,
  FEE_SURCHARGE_CATALOG,
  SURCHARGE_CRITERIA_CATALOG,
  FEE_KIND_LABELS,
  FEE_STATUS_LABELS,
  FEE_TARGET_LABELS,
  FEE_ENTERPRISE_OPTIONS,
  FEE_SUPPLIER_OPTIONS,
  emptyPriceTable,
  rescueFeeTables,
  upsertPriceTable,
  resolveFeeServiceType,
  isTimeSurchargeCriterion,
  DEFAULT_TIME_RANGE,
  type FeeCriterion,
  type FeeRuleCondition,
  type FeeTableKind,
  type FeeTableStatus,
  type FeeTarget,
  type PriceTable,
  type ServicePriceRule,
  type ServiceType,
  type SurchargeRule,
  type SurchargeType,
  type RoundMode,
  type ServicePricingMode,
} from '../data/rescueFeeMockData';

type TabId = 'general' | 'matrix' | 'scope' | 'services' | 'criteria' | 'surcharges';

const TABS: { id: TabId; label: string }[] = [
  { id: 'general', label: '1. Thông tin & tham số' },
  { id: 'matrix', label: '2. Dòng giá theo tiêu chí' },
  { id: 'surcharges', label: '3. Phụ phí có điều kiện' },
];

const SectionHeader: React.FC<{
  title: string;
  number?: number;
  actions?: React.ReactNode;
}> = ({ title, number, actions }) => (
  <div className="bg-vetc-green text-white px-4 py-2 rounded-t-lg font-bold text-sm flex items-center justify-between">
    <div className="flex items-center space-x-2">
      {number != null && (
        <span className="bg-white/20 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
          {number}
        </span>
      )}
      <span>{title}</span>
    </div>
    {actions}
  </div>
);

const inputClass =
  'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
const SERVICE_CONFIG: Record<ServiceType, { label: string; unit: string }> = {
  ONSITE: { label: 'Kích bình ắc quy', unit: 'lượt' },
  TOWING: { label: 'Kéo xe', unit: 'km' },
  CRANE: { label: 'Cẩu xe', unit: 'lượt' },
};
const SERVICE_OPTIONS = FEE_SERVICE_CATALOG;
const SURCHARGE_HEAD_OPTIONS = FEE_SURCHARGE_CATALOG;
const PRIMARY_CRITERION_BY_SERVICE: Partial<Record<ServiceType, string>> = {
  TOWING: 'Khoảng cách kéo xe',
  CRANE: 'Khoảng cách so với mặt đường',
};
const PRIMARY_CRITERION_CONFIG: Record<
  string,
  { key: string; valueType: 'LIST' | 'RANGE'; values: string[] }
> = {
  'Khoảng cách kéo xe': { key: 'distanceKm', valueType: 'RANGE', values: [] },
  'Khoảng cách so với mặt đường': {
    key: 'roadDistance',
    valueType: 'RANGE',
    values: [],
  },
};
const getCriterionConfig = (label: string) =>
  feeCriterionDefinitions.find((definition) => definition.label === label) ??
  PRIMARY_CRITERION_CONFIG[label];

const formatConditionSummary = (condition: FeeRuleCondition): string => {
  const values = Array.isArray(condition.value)
    ? condition.value.map(String).map((value) => value.trim()).filter(Boolean)
    : [String(condition.value ?? '').trim()].filter(Boolean);
  const separator = condition.operator === 'BETWEEN' ? ' – ' : ', ';
  const formattedValue = values.join(separator);
  return formattedValue
    ? `${condition.criterionLabel}: ${formattedValue}`
    : condition.criterionLabel;
};

const parseMoneyInput = (value: string): number =>
  parseInt(value.replace(/\D/g, ''), 10) || 0;

const isConditionValueEmpty = (condition: FeeRuleCondition): boolean => {
  if (condition.operator === 'BETWEEN') {
    if (!Array.isArray(condition.value) || condition.value.length < 2) return true;
    return String(condition.value[0]).trim() === '' || String(condition.value[1]).trim() === '';
  }
  if (condition.operator === 'IN') {
    if (Array.isArray(condition.value)) {
      return condition.value.length === 0 || condition.value.every((item) => String(item).trim() === '');
    }
    return String(condition.value ?? '').trim() === '';
  }
  if (Array.isArray(condition.value)) {
    return condition.value.every((item) => String(item).trim() === '');
  }
  return String(condition.value ?? '').trim() === '';
};

const defaultValueForOperator = (
  operator: FeeRuleCondition['operator'],
  allowedValues?: string[]
): FeeRuleCondition['value'] => {
  if (operator === 'BETWEEN') return ['', ''];
  if (operator === 'IN') return [];
  return allowedValues?.[0] ?? '';
};

const buildCriterion = (
  label: string,
  id = `cr-${Date.now()}`
): FeeCriterion => {
  const config = getCriterionConfig(label);
  if (!config) throw new Error(`Không tìm thấy cấu hình tiêu chí: ${label}`);
  return {
    id,
    key: config.key,
    label,
    operator: config.valueType === 'RANGE' ? 'BETWEEN' : 'IN',
    value: config.valueType === 'RANGE' ? ['', ''] : config.values,
    group: 'AND',
    role: 'PRICE',
    allowedValues: config.values,
    valueType: config.valueType,
  };
};

const buildPrimaryCondition = (serviceType: ServiceType): FeeRuleCondition | null => {
  const label = PRIMARY_CRITERION_BY_SERVICE[serviceType];
  if (!label) return null;
  const config = PRIMARY_CRITERION_CONFIG[label];
  return {
    criterionKey: config.key,
    criterionLabel: label,
    operator: config.valueType === 'RANGE' ? 'BETWEEN' : '=',
    value: config.valueType === 'RANGE' ? ['', ''] : config.values[0] ?? '',
  };
};

const ONSITE_SAMPLE_PRICES: Record<string, number> = {
  'Kích bình ắc quy': 350000,
  'Thay lốp dự phòng': 400000,
  'Cung cấp nhiên liệu khẩn cấp (xăng, dầu, nước làm mát)': 300000,
  'Thủy kích': 1200000,
};

const createDemoServiceRules = (
  serviceDetail: string,
  serviceType: ServiceType
): ServicePriceRule[] => {
  const idPrefix = `sr-demo-${Date.now()}`;
  const vehicleCondition = (value: string): FeeRuleCondition => ({
    criterionKey: 'vehicleType',
    criterionLabel: 'Loại phương tiện gặp sự cố',
    operator: '=',
    value,
  });

  if (serviceType === 'TOWING') {
    return [
      { from: 0, to: 10, mode: 'FIXED' as const, price: 100000 },
      { from: 10, to: 20, mode: 'PER_UNIT' as const, price: 10000 },
      { from: 20, to: 50, mode: 'PER_UNIT' as const, price: 20000 },
    ].map((tier, index) => ({
      id: `${idPrefix}-${index}`,
      serviceType,
      serviceDetail,
      basePrice: tier.price,
      pricingMode: tier.mode,
      unit: 'km',
      conditions: [
        {
          criterionKey: 'distanceKm',
          criterionLabel: 'Khoảng cách kéo xe',
          operator: 'BETWEEN',
          value: [tier.from, tier.to],
        },
        vehicleCondition(index === 0 ? 'Xe chở người' : 'Xe chở hàng'),
      ],
    }));
  }

  if (serviceType === 'CRANE') {
    return [
      { from: 0, to: 1, price: 900000, vehicle: 'Xe chở người' },
      { from: 1, to: 3, price: 1500000, vehicle: 'Xe chở hàng' },
      { from: 3, to: 5, price: 2000000, vehicle: 'Xe chở hàng' },
    ].map((tier, index) => ({
      id: `${idPrefix}-${index}`,
      serviceType,
      serviceDetail,
      basePrice: tier.price,
      pricingMode: 'FIXED',
      unit: 'lượt',
      conditions: [
        {
          criterionKey: 'roadDistance',
          criterionLabel: 'Khoảng cách so với mặt đường',
          operator: 'BETWEEN',
          value: [tier.from, tier.to],
        },
        vehicleCondition(tier.vehicle),
      ],
    }));
  }

  const basePrice = ONSITE_SAMPLE_PRICES[serviceDetail] ?? 450000;
  return [
    { vehicle: 'Xe chở người', price: basePrice },
    { vehicle: 'Xe chở hàng', price: Math.round(basePrice * 1.2) },
  ].map((sample, index) => ({
    id: `${idPrefix}-${index}`,
    serviceType,
    serviceDetail,
    basePrice: sample.price,
    pricingMode: 'FIXED',
    unit: 'lượt',
    conditions: [vehicleCondition(sample.vehicle)],
  }));
};

const ensureRequiredCriteria = (table: PriceTable): PriceTable => {
  const activeKeys = new Set(
    feeCriterionDefinitions
      .filter((definition) => definition.status === 'ACTIVE')
      .map((definition) => definition.key)
  );
  return {
    ...table,
    priceCriteria: (table.priceCriteria ?? []).filter((criterion) =>
      activeKeys.has(criterion.key)
    ),
  };
};

const RescueFeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const initial = useMemo(() => {
    if (id) {
      return ensureRequiredCriteria(
        rescueFeeTables.find((t) => t.id === id) ?? emptyPriceTable()
      );
    }
    return ensureRequiredCriteria(
      emptyPriceTable({
        code: 'FEE-NEW',
        name: 'Bảng phí mới',
        applyFor: '',
      })
    );
  }, [id]);

  const [form, setForm] = useState<PriceTable>(initial);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [error, setError] = useState('');
  const [expandedRuleIds, setExpandedRuleIds] = useState<string[]>([]);
  const [criteriaRuleId, setCriteriaRuleId] = useState<string | null>(null);
  const [criteriaModalError, setCriteriaModalError] = useState('');
  const [importServiceDetail, setImportServiceDetail] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const [tableImportOpen, setTableImportOpen] = useState(false);
  const [tableImportMode, setTableImportMode] = useState<'json' | 'excel'>('json');
  const [tableImportJsonText, setTableImportJsonText] = useState('');
  const [tableImportError, setTableImportError] = useState('');
  const [tableImportFileName, setTableImportFileName] = useState('');
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [draggedPriceRuleId, setDraggedPriceRuleId] = useState<string | null>(null);
  const [dragOverPriceRuleId, setDragOverPriceRuleId] = useState<string | null>(null);

  const update = <K extends keyof PriceTable>(key: K, value: PriceTable[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncKindWithTarget = (target: FeeTarget, kind: FeeTableKind): FeeTableKind => {
    if (target === 'CUSTOMER') {
      if (
        kind === 'CUSTOMER_PUBLIC' ||
        kind === 'CUSTOMER_RETAIL' ||
        kind === 'CUSTOMER_BUSINESS'
      ) {
        return kind;
      }
      return 'CUSTOMER_PUBLIC';
    }
    if (
      kind === 'SUPPLIER_INTERNAL' ||
      kind === 'SUPPLIER_EXTERNAL' ||
      kind === 'SUPPLIER_EXTERNAL_FALLBACK'
    ) {
      return kind;
    }
    return 'SUPPLIER_INTERNAL';
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Vui lòng nhập mã và tên bảng phí');
      setActiveTab('general');
      return;
    }

    const isRetailMarkupTable =
      form.kind === 'CUSTOMER_RETAIL' && Number(form.settings.retailMarkupFactor) > 0;

    if (!isRetailMarkupTable && form.serviceRules.length === 0) {
      setError('Vui lòng cấu hình ít nhất một dòng giá dịch vụ');
      setActiveTab('matrix');
      return;
    }
    if (!isRetailMarkupTable) {
      const emptyCondition = form.serviceRules.some((rule) =>
        (rule.conditions ?? []).some((condition) => isConditionValueEmpty(condition))
      );
      if (emptyCondition) {
        setError('Vui lòng nhập đủ giá trị cho tất cả tiêu chí (không được để trống)');
        setActiveTab('matrix');
        return;
      }
      const invalidRange = form.serviceRules.some((rule) =>
        (rule.conditions ?? []).some((condition) => {
          if (condition.operator !== 'BETWEEN' || !Array.isArray(condition.value)) return false;
          const [from, to] = condition.value;
          return Number(from) > Number(to);
        })
      );
      if (invalidRange) {
        setError('Khoảng Từ – Đến: giá trị Từ không được lớn hơn Đến');
        setActiveTab('matrix');
        return;
      }
      if (
        (form.priceCriteria ?? []).some(
          (c) => (c.valueType ?? 'LIST') === 'LIST' && !c.allowedValues?.length
        )
      ) {
        setError('Mỗi tiêu chí của ma trận phải có ít nhất một giá trị cho phép');
        setActiveTab('general');
        return;
      }
      if (form.surchargeRules.some((s) => !s.conditions.length)) {
        setError('Mỗi phụ phí bắt buộc phải chọn ít nhất một tiêu chí phụ');
        setActiveTab('surcharges');
        return;
      }
      if (
        form.surchargeRules.some((s) => {
          const condition = s.conditions[0];
          if (!condition || !isTimeSurchargeCriterion(condition.criterionKey)) return false;
          if (!Array.isArray(condition.value) || condition.value.length < 2) return true;
          return !String(condition.value[0]).trim() || !String(condition.value[1]).trim();
        })
      ) {
        setError('Phụ phí thời gian bắt buộc nhập đủ khoảng Từ – Đến');
        setActiveTab('surcharges');
        return;
      }
      if (
        form.surchargeRules.some(
          (s) =>
            (s.name === 'Lễ/Tết' || s.conditions[0]?.criterionKey === 'holiday') &&
            !(s.holidayDates ?? []).some((date) => date.trim())
        )
      ) {
        setError('Phụ phí Lễ/Tết bắt buộc cấu hình ít nhất một ngày holiday');
        setActiveTab('surcharges');
        return;
      }
    }
    setError('');
    upsertPriceTable({
      ...form,
      updatedAt: new Date().toLocaleString('vi-VN'),
      updatedBy: 'admin',
    });
    navigate('/rescue-fee-config');
  };

  const addServiceRule = () => {
    const rule: ServicePriceRule = {
      id: `sr-${Date.now()}`,
      serviceType: 'ONSITE',
      serviceDetail: SERVICE_CONFIG.ONSITE.label,
      basePrice: 0,
      pricingMode: 'FIXED',
      unit: SERVICE_CONFIG.ONSITE.unit,
      conditions: [],
    };
    update('serviceRules', [...form.serviceRules, rule]);
  };

  const addServiceHead = (serviceDetail: string) => {
    if (form.serviceRules.some((rule) => rule.serviceDetail === serviceDetail)) return;
    const serviceType = resolveFeeServiceType(serviceDetail);
    if (!serviceType) return;
    setForm((prev) => {
      if (prev.serviceRules.some((rule) => rule.serviceDetail === serviceDetail)) return prev;
      return {
        ...prev,
        serviceRules: [
          ...prev.serviceRules,
          ...createDemoServiceRules(serviceDetail, serviceType),
        ],
      };
    });
  };

  const removeServiceHead = (serviceDetail: string) => {
    update(
      'serviceRules',
      form.serviceRules.filter((rule) => rule.serviceDetail !== serviceDetail)
    );
  };

  const toggleServiceHead = (serviceDetail: string, checked: boolean) => {
    if (checked) addServiceHead(serviceDetail);
    else removeServiceHead(serviceDetail);
  };

  const toggleServiceParent = (parentValue: string, checked: boolean) => {
    const parent = SERVICE_OPTIONS.find((item) => item.value === parentValue);
    if (!parent?.children?.length) return;
    if (checked) {
      setForm((prev) => {
        let nextRules = [...prev.serviceRules];
        parent.children!.forEach((child, childIndex) => {
          if (nextRules.some((rule) => rule.serviceDetail === child)) return;
          const generated = createDemoServiceRules(child, parent.type).map((rule, index) => ({
            ...rule,
            id: `sr-demo-${Date.now()}-${childIndex}-${index}`,
          }));
          nextRules = [...nextRules, ...generated];
        });
        return { ...prev, serviceRules: nextRules };
      });
      return;
    }
    const removeSet = new Set<string>([parentValue, ...parent.children]);
    update(
      'serviceRules',
      form.serviceRules.filter((rule) => !removeSet.has(rule.serviceDetail))
    );
  };

  const selectAllServiceHeads = () => {
    const leafServices = SERVICE_OPTIONS.flatMap((option) =>
      option.children?.length ? [...option.children] : [option.value]
    );
    setForm((prev) => {
      let nextRules = [...prev.serviceRules];
      const selected = new Set(nextRules.map((rule) => rule.serviceDetail));
      leafServices.forEach((serviceDetail, serviceIndex) => {
        if (selected.has(serviceDetail)) return;
        const serviceType = resolveFeeServiceType(serviceDetail);
        if (!serviceType) return;
        const generated = createDemoServiceRules(serviceDetail, serviceType).map((rule, index) => ({
          ...rule,
          id: `sr-demo-${Date.now()}-${serviceIndex}-${index}`,
        }));
        nextRules = [...nextRules, ...generated];
        selected.add(serviceDetail);
      });
      return { ...prev, serviceRules: nextRules };
    });
  };

  const clearAllServiceHeads = () => {
    update('serviceRules', []);
  };

  const selectAllSurchargeHeads = () => {
    setForm((prev) => {
      const existing = new Set(prev.surchargeRules.map((rule) => rule.name));
      const additions: SurchargeRule[] = [];
      SURCHARGE_HEAD_OPTIONS.forEach((head, index) => {
        if (existing.has(head.name)) return;
        const isTime = isTimeSurchargeCriterion(head.criterionKey);
        const timeRange: [string, string] = [...DEFAULT_TIME_RANGE];
        additions.push({
          id: `su-${Date.now()}-${index}`,
          name: head.name,
          type: 'FIXED',
          value: 0,
          activeWhen: isTime
            ? `${head.criterionKey}=${timeRange[0]}-${timeRange[1]}`
            : `${head.criterionKey}=${head.value}`,
          conditions: [
            {
              criterionKey: head.criterionKey,
              criterionLabel: head.criterionLabel,
              operator: isTime ? 'BETWEEN' : '=',
              value: isTime ? timeRange : head.value,
            },
          ],
          holidayDates:
            'requiresHolidayDates' in head && head.requiresHolidayDates ? [] : undefined,
          stackable: true,
        });
      });
      if (!additions.length) return prev;
      return { ...prev, surchargeRules: [...prev.surchargeRules, ...additions] };
    });
  };

  const clearAllSurchargeHeads = () => {
    update('surchargeRules', []);
  };

  const addPriceLineForService = (serviceDetail: string) => {
    const serviceType =
      form.serviceRules.find((rule) => rule.serviceDetail === serviceDetail)?.serviceType ??
      resolveFeeServiceType(serviceDetail) ??
      'ONSITE';
    const primary = buildPrimaryCondition(serviceType);
    const rule: ServicePriceRule = {
      id: `sr-${Date.now()}`,
      serviceType,
      serviceDetail,
      basePrice: 0,
      pricingMode: 'FIXED',
      unit: SERVICE_CONFIG[serviceType].unit,
      conditions: primary ? [primary] : [],
    };
    update('serviceRules', [...form.serviceRules, rule]);
  };

  const updateServiceRule = (ruleId: string, patch: Partial<ServicePriceRule>) => {
    update(
      'serviceRules',
      form.serviceRules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r))
    );
  };

  const removeServiceRule = (ruleId: string) => {
    update(
      'serviceRules',
      form.serviceRules.filter((r) => r.id !== ruleId)
    );
  };

  const duplicateServiceRule = (ruleId: string) => {
    const source = form.serviceRules.find((rule) => rule.id === ruleId);
    if (!source) return;
    const copy: ServicePriceRule = {
      ...source,
      id: `sr-${Date.now()}`,
      conditions: (source.conditions ?? []).map((condition) => ({ ...condition })),
    };
    const index = form.serviceRules.findIndex((rule) => rule.id === ruleId);
    const next = [...form.serviceRules];
    next.splice(Math.max(index, 0) + 1, 0, copy);
    update('serviceRules', next);
  };

  const reorderServiceRules = (
    serviceDetail: string,
    fromId: string,
    toId: string
  ) => {
    if (fromId === toId) return;
    setForm((prev) => {
      const fromIndex = prev.serviceRules.findIndex((rule) => rule.id === fromId);
      const toIndex = prev.serviceRules.findIndex((rule) => rule.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const fromRule = prev.serviceRules[fromIndex];
      const toRule = prev.serviceRules[toIndex];
      if (
        fromRule.serviceDetail !== serviceDetail ||
        toRule.serviceDetail !== serviceDetail
      ) {
        return prev;
      }
      const next = [...prev.serviceRules];
      const [moved] = next.splice(fromIndex, 1);
      const insertAt = next.findIndex((rule) => rule.id === toId);
      next.splice(insertAt < 0 ? next.length : insertAt, 0, moved);
      return { ...prev, serviceRules: next };
    });
  };

  const buildConditionsSample = (): Record<string, unknown> => ({
    payload: [1.5, 3.5],
    seats: [4, 7],
    vehicleType: 'Xe chở người',
    rescueVehicleType: '',
  });

  const buildImportSample = (serviceDetail: string, serviceType: ServiceType) => {
    const conditions = buildConditionsSample();
    if (serviceType === 'TOWING') {
      return [
        {
          service: serviceDetail,
          primaryCriterion: {
            key: 'distanceKm',
            label: 'Khoảng cách kéo xe',
            unit: 'km',
            from: 0,
            to: 10,
            operator: '0 < x ≤ 10',
          },
          pricingMode: 'FIXED',
          basePrice: 100000,
          conditions,
        },
        {
          service: serviceDetail,
          primaryCriterion: {
            key: 'distanceKm',
            label: 'Khoảng cách kéo xe',
            unit: 'km',
            from: 10,
            to: 20,
            operator: '10 < x ≤ 20',
          },
          pricingMode: 'PER_UNIT',
          basePrice: 10000,
          conditions: {
            payload: [],
            seats: null,
            vehicleType: '',
            rescueVehicleType: 'Xe sàn trượt',
          },
        },
        {
          service: serviceDetail,
          primaryCriterion: {
            key: 'distanceKm',
            label: 'Khoảng cách kéo xe',
            unit: 'km',
            from: 20,
            to: 50,
            operator: '20 < x ≤ 50',
          },
          pricingMode: 'PER_UNIT',
          basePrice: 20000,
          conditions: {
            payload: [],
            seats: null,
            vehicleType: '',
            rescueVehicleType: '',
          },
        },
      ];
    }
    if (serviceType === 'CRANE') {
      return [
        {
          service: serviceDetail,
          primaryCriterion: {
            key: 'roadDistance',
            label: 'Khoảng cách so với mặt đường',
            unit: 'm',
            from: 0,
            to: 1,
            operator: '0 < x ≤ 1',
          },
          pricingMode: 'FIXED',
          basePrice: 900000,
          conditions,
        },
        {
          service: serviceDetail,
          primaryCriterion: {
            key: 'roadDistance',
            label: 'Khoảng cách so với mặt đường',
            unit: 'm',
            from: 1,
            to: 3,
            operator: '1 < x ≤ 3',
          },
          pricingMode: 'FIXED',
          basePrice: 1500000,
          conditions: {
            payload: [3.5, 7],
            seats: null,
            vehicleType: 'Xe chở hàng',
            rescueVehicleType: 'Xe cẩu, kéo',
          },
        },
      ];
    }
    return [
      {
        service: serviceDetail,
        primaryCriterion: null,
        pricingMode: 'FIXED',
        basePrice: 450000,
        conditions,
      },
      {
        service: serviceDetail,
        primaryCriterion: null,
        pricingMode: 'FIXED',
        basePrice: 650000,
        conditions: {
          payload: [],
          seats: [7, 16],
          vehicleType: 'Xe chở hàng',
          rescueVehicleType: '',
        },
      },
    ];
  };

  const openImportJson = (serviceDetail: string) => {
    const serviceType =
      form.serviceRules.find((rule) => rule.serviceDetail === serviceDetail)?.serviceType ??
      resolveFeeServiceType(serviceDetail) ??
      'ONSITE';
    setImportServiceDetail(serviceDetail);
    setImportJsonText(JSON.stringify(buildImportSample(serviceDetail, serviceType), null, 2));
    setImportError('');
  };

  const parseImportedConditions = (
    raw: Record<string, unknown> | undefined
  ): FeeRuleCondition[] => {
    if (!raw || typeof raw !== 'object') return [];
    return Object.entries(raw).flatMap(([key, value]) => {
      if (value === null || value === undefined || value === '') return [];
      if (Array.isArray(value) && value.length === 0) return [];
      const criterion =
        (form.priceCriteria ?? []).find((item) => item.key === key) ??
        feeCriterionDefinitions.find((item) => item.key === key);
      const label = criterion?.label ?? key;
      if (Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === 'number' || item === '' || !Number.isNaN(Number(item)))) {
        return [
          {
            criterionKey: key,
            criterionLabel: label,
            operator: 'BETWEEN' as const,
            value: [value[0] as string | number, value[1] as string | number],
          },
        ];
      }
      if (Array.isArray(value)) {
        return [
          {
            criterionKey: key,
            criterionLabel: label,
            operator: 'IN' as const,
            value: value.map(String),
          },
        ];
      }
      return [
        {
          criterionKey: key,
          criterionLabel: label,
          operator: '=' as const,
          value: value as string | number,
        },
      ];
    });
  };

  const applyImportJson = () => {
    if (!importServiceDetail) return;
    try {
      const parsed = JSON.parse(importJsonText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (rows.length === 0) {
        setImportError('JSON phải chứa ít nhất một dòng cấu hình');
        return;
      }
      const serviceType =
        form.serviceRules.find((rule) => rule.serviceDetail === importServiceDetail)?.serviceType ??
        resolveFeeServiceType(importServiceDetail) ??
        'ONSITE';
      const primaryConditionBase = buildPrimaryCondition(serviceType);
      const importedRules: ServicePriceRule[] = rows.map((row, index) => {
        const item = (row ?? {}) as Record<string, unknown>;
        const pricingMode =
          item.pricingMode === 'PER_UNIT' ? 'PER_UNIT' : ('FIXED' as ServicePricingMode);
        const basePrice = Number(item.basePrice ?? item.price ?? 0) || 0;
        const conditions = parseImportedConditions(
          (item.conditions as Record<string, unknown> | undefined) ??
            (typeof item === 'object' && !Array.isArray(item)
              ? (item as Record<string, unknown>)
              : undefined)
        ).filter(
          (condition) =>
            condition.criterionKey !== 'distanceKm' &&
            condition.criterionKey !== 'roadDistance' &&
            condition.criterionKey !== 'from' &&
            condition.criterionKey !== 'to' &&
            condition.criterionKey !== 'basePrice' &&
            condition.criterionKey !== 'pricingMode' &&
            condition.criterionKey !== 'price'
        );
        const primarySource =
          (item.primaryCriterion as { from?: string | number; to?: string | number } | null | undefined) ??
          (item.primary as { from?: string | number; to?: string | number } | undefined);
        const fromValue = item.from ?? primarySource?.from;
        const toValue = item.to ?? primarySource?.to;
        const primary =
          primaryConditionBase && (fromValue !== undefined || toValue !== undefined || primarySource)
            ? {
                ...primaryConditionBase,
                operator: 'BETWEEN' as const,
                value: [(fromValue ?? '') as string | number, (toValue ?? '') as string | number],
              }
            : primaryConditionBase;
        return {
          id: `sr-import-${Date.now()}-${index}`,
          serviceType,
          serviceDetail: importServiceDetail,
          basePrice,
          pricingMode,
          unit: SERVICE_CONFIG[serviceType].unit,
          conditions: primary ? [primary, ...conditions] : conditions,
        };
      });
      update('serviceRules', [
        ...form.serviceRules.filter((rule) => rule.serviceDetail !== importServiceDetail),
        ...importedRules,
      ]);
      setImportServiceDetail(null);
      setImportError('');
      setError('');
    } catch {
      setImportError('JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.');
    }
  };

  const buildPartnerTableSample = () => ({
    code: form.code || 'SUP-EXT-PARTNER',
    name: form.name || 'Bảng phí đối tác',
    target: 'SUPPLIER',
    kind: 'SUPPLIER_EXTERNAL',
    applyFor: form.applyFor || 'NCC đối tác',
    status: form.status || 'DRAFT',
    settings: {
      retailMarkupFactor: form.settings.retailMarkupFactor,
      roundMode: form.settings.roundMode,
      stackSurcharges: form.settings.stackSurcharges,
    },
    priceCriteria: ['payload', 'seats', 'vehicleType', 'rescueVehicleType'],
    services: [
      ...buildImportSample('Kích bình ắc quy', 'ONSITE'),
      ...buildImportSample('Kéo xe', 'TOWING'),
      ...buildImportSample('Cẩu xe', 'CRANE'),
    ],
    surcharges: [
      {
        name: 'Thời gian yêu cầu cứu hộ',
        type: 'COEFFICIENT',
        value: 1.15,
        criterionKey: 'timeWindow',
        criterionValue: '22:00-06:00',
      },
      {
        name: 'Tuyến cao tốc',
        type: 'FIXED',
        value: 150000,
        criterionKey: 'isHighway',
        criterionValue: 'Cao tốc Bắc – Nam phía Đông (CT.01)',
      },
    ],
  });

  const mapRowToServiceRule = (
    item: Record<string, unknown>,
    index: number
  ): ServicePriceRule | null => {
    const serviceDetail = String(
      item.service ?? item.DichVu ?? item.serviceDetail ?? ''
    ).trim();
    if (!serviceDetail) return null;
    const serviceType =
      (item.serviceType as ServiceType | undefined) ??
      resolveFeeServiceType(serviceDetail) ??
      (String(item.LoaiDichVu ?? '').includes('Kéo')
        ? 'TOWING'
        : String(item.LoaiDichVu ?? '').includes('Cẩu')
          ? 'CRANE'
          : 'ONSITE');
    const pricingRaw = String(item.pricingMode ?? item.CachTinh ?? 'FIXED');
    const pricingMode: ServicePricingMode = /per[_\s-]?unit|đơn vị|don vi/i.test(pricingRaw)
      ? 'PER_UNIT'
      : 'FIXED';
    const basePrice = Number(item.basePrice ?? item.MucGia ?? item.price ?? 0) || 0;
    const conditionsRaw =
      (item.conditions as Record<string, unknown> | undefined) ??
      ({
        payload:
          item.payload ??
          (item.TrongTaiTu !== undefined || item.TrongTaiDen !== undefined
            ? [item.TrongTaiTu ?? '', item.TrongTaiDen ?? '']
            : undefined),
        seats: item.seats ?? item.SoCho,
        vehicleType: item.vehicleType ?? item.LoaiPTGapSuCo,
        rescueVehicleType: item.rescueVehicleType ?? item.LoaiPTCuuHo,
      } as Record<string, unknown>);
    const conditions = parseImportedConditions(conditionsRaw).filter(
      (condition) =>
        !['distanceKm', 'roadDistance', 'from', 'to', 'basePrice', 'pricingMode', 'price'].includes(
          condition.criterionKey
        )
    );
    const primaryConditionBase = buildPrimaryCondition(serviceType);
    const primarySource =
      (item.primaryCriterion as { from?: string | number; to?: string | number } | null | undefined) ??
      undefined;
    const fromValue = item.from ?? item.Tu ?? primarySource?.from;
    const toValue = item.to ?? item.Den ?? primarySource?.to;
    const primary =
      primaryConditionBase && (fromValue !== undefined || toValue !== undefined || primarySource)
        ? {
            ...primaryConditionBase,
            operator: 'BETWEEN' as const,
            value: [(fromValue ?? '') as string | number, (toValue ?? '') as string | number],
          }
        : primaryConditionBase;
    return {
      id: `sr-table-import-${Date.now()}-${index}`,
      serviceType,
      serviceDetail,
      basePrice,
      pricingMode,
      unit: SERVICE_CONFIG[serviceType].unit,
      conditions: primary ? [primary, ...conditions] : conditions,
    };
  };

  const mapRowToSurcharge = (
    item: Record<string, unknown>,
    index: number
  ): SurchargeRule | null => {
    const name = String(item.name ?? item.TenPhuPhi ?? '').trim();
    if (!name) return null;
    const catalog = SURCHARGE_HEAD_OPTIONS.find((entry) => entry.name === name);
    const typeRaw = String(item.type ?? item.Kieu ?? 'FIXED');
    const type: SurchargeType = /coeff|hệ số|he so/i.test(typeRaw) ? 'COEFFICIENT' : 'FIXED';
    const criterionKey = String(
      item.criterionKey ?? item.TieuChi ?? catalog?.criterionKey ?? ''
    ).trim();
    const criterionMeta =
      SURCHARGE_CRITERIA_CATALOG.find((entry) => entry.key === criterionKey) ??
      SURCHARGE_CRITERIA_CATALOG.find((entry) => entry.label === criterionKey);
    const rawCriterionValue = String(
      item.criterionValue ?? item.GiaTriTieuChi ?? catalog?.value ?? criterionMeta?.values[0] ?? ''
    ).trim();
    const isTime = isTimeSurchargeCriterion(criterionMeta?.key ?? criterionKey);
    const timeParts = rawCriterionValue.includes('-')
      ? rawCriterionValue.split('-').map((part) => part.trim())
      : [];
    const criterionValue = isTime
      ? ([
          timeParts[0] || criterionMeta?.values[0] || DEFAULT_TIME_RANGE[0],
          timeParts[1] || criterionMeta?.values[1] || DEFAULT_TIME_RANGE[1],
        ] as [string, string])
      : rawCriterionValue || criterionMeta?.values[0] || '';
    return {
      id: `su-table-import-${Date.now()}-${index}`,
      name,
      type,
      value: Number(item.value ?? item.GiaTri ?? 0) || 0,
      activeWhen: criterionMeta
        ? isTime
          ? `${criterionMeta.key}=${criterionValue[0]}-${criterionValue[1]}`
          : `${criterionMeta.key}=${criterionValue}`
        : `${criterionKey}=${rawCriterionValue}`,
      conditions: criterionMeta
        ? [
            {
              criterionKey: criterionMeta.key,
              criterionLabel: criterionMeta.label,
              operator: isTime ? 'BETWEEN' : '=',
              value: criterionValue,
            },
          ]
        : [],
      holidayDates: name === 'Lễ/Tết' ? [] : undefined,
      stackable: true,
    };
  };

  const syncCriteriaFromRules = (rules: ServicePriceRule[]): FeeCriterion[] => {
    const keys = new Set<string>();
    rules.forEach((rule) => {
      (rule.conditions ?? []).forEach((condition) => {
        if (
          condition.criterionKey === 'distanceKm' ||
          condition.criterionKey === 'roadDistance'
        ) {
          return;
        }
        keys.add(condition.criterionKey);
      });
    });
    return Array.from(keys).flatMap((key) => {
      const definition = feeCriterionDefinitions.find((item) => item.key === key);
      if (!definition) return [];
      return [buildCriterion(definition.label, `cr-import-${key}`)];
    });
  };

  const openTableImport = (mode: 'json' | 'excel') => {
    setTableImportMode(mode);
    setTableImportOpen(true);
    setTableImportError('');
    setTableImportFileName('');
    if (mode === 'json') {
      setTableImportJsonText(JSON.stringify(buildPartnerTableSample(), null, 2));
    } else {
      setTableImportJsonText('');
    }
  };

  const applyTableImportPayload = (payload: Record<string, unknown>) => {
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
    const importedRules = serviceRows
      .map((row, index) => mapRowToServiceRule((row ?? {}) as Record<string, unknown>, index))
      .filter((row): row is ServicePriceRule => Boolean(row));
    const importedSurcharges = surchargeRows
      .map((row, index) => mapRowToSurcharge((row ?? {}) as Record<string, unknown>, index))
      .filter((row): row is SurchargeRule => Boolean(row));

    if (importedRules.length === 0 && importedSurcharges.length === 0) {
      throw new Error('Không tìm thấy dòng dịch vụ hoặc phụ phí hợp lệ');
    }

    const criteriaKeys = Array.isArray(payload.priceCriteria)
      ? payload.priceCriteria.map(String)
      : [];
    const nextCriteria =
      criteriaKeys.length > 0
        ? criteriaKeys.flatMap((key) => {
            const definition =
              feeCriterionDefinitions.find((item) => item.key === key) ??
              feeCriterionDefinitions.find((item) => item.label === key);
            return definition ? [buildCriterion(definition.label, `cr-import-${definition.key}`)] : [];
          })
        : syncCriteriaFromRules(importedRules);

    const target = (payload.target as FeeTarget | undefined) ?? form.target;
    const kindRaw = String(payload.kind ?? form.kind);
    const kind = (Object.keys(FEE_KIND_LABELS) as FeeTableKind[]).includes(kindRaw as FeeTableKind)
      ? (kindRaw as FeeTableKind)
      : syncKindWithTarget(target, form.kind);

    setForm((prev) => ({
      ...prev,
      code: String(payload.code ?? prev.code),
      name: String(payload.name ?? prev.name),
      applyFor: String(payload.applyFor ?? prev.applyFor),
      target,
      kind,
      status: (payload.status as FeeTableStatus | undefined) ?? prev.status,
      settings: {
        ...prev.settings,
        retailMarkupFactor: Number(
          (payload.settings as { retailMarkupFactor?: number } | undefined)?.retailMarkupFactor ??
            prev.settings.retailMarkupFactor
        ),
        roundMode:
          ((payload.settings as { roundMode?: RoundMode } | undefined)?.roundMode as RoundMode) ??
          prev.settings.roundMode,
        stackSurcharges:
          (payload.settings as { stackSurcharges?: boolean } | undefined)?.stackSurcharges ??
          prev.settings.stackSurcharges,
      },
      priceCriteria: nextCriteria,
      serviceRules: importedRules.length ? importedRules : prev.serviceRules,
      surchargeRules: importedSurcharges.length ? importedSurcharges : prev.surchargeRules,
    }));
    setTableImportOpen(false);
    setActiveTab('matrix');
    setError('');
  };

  const applyTableImportJson = () => {
    try {
      const parsed = JSON.parse(tableImportJsonText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setTableImportError('JSON bảng phí phải là một object');
        return;
      }
      applyTableImportPayload(parsed as Record<string, unknown>);
    } catch (err) {
      setTableImportError(
        err instanceof Error ? err.message : 'JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.'
      );
    }
  };

  const downloadPartnerExcelTemplate = () => {
    const wb = XLSX.utils.book_new();
    const guideSheet = XLSX.utils.aoa_to_sheet([
      ['Sheet', 'MoTa'],
      ['ThongTin', 'Thông tin chung bảng phí (mỗi dòng = 1 trường)'],
      ['DichVu', 'Các dòng giá dịch vụ — mỗi dòng Excel = 1 dòng giá'],
      ['PhuPhi', 'Các dòng phụ phí có điều kiện — mỗi dòng Excel = 1 dòng phụ phí'],
      [],
      ['Cot DichVu', 'Y Nghia'],
      ['DichVu', 'Tên dịch vụ / dịch vụ con (VD: Kích bình ắc quy, Kéo xe về gara, Cẩu xe mặt đường)'],
      ['CachTinh', 'Theo lượt | Theo đơn vị'],
      ['MucGia', 'Mức giá (VNĐ)'],
      ['Tu', 'Tiêu chí chính Từ (km/m) — để trống nếu dịch vụ tại chỗ'],
      ['Den', 'Tiêu chí chính Đến (km/m)'],
      ['TrongTaiTu', 'Trọng tải từ (tấn) — tùy chọn'],
      ['TrongTaiDen', 'Trọng tải đến (tấn) — tùy chọn'],
      ['SoCho', 'Số chỗ — tùy chọn'],
      ['LoaiPTGapSuCo', 'Xe chở người | Xe chở hàng'],
      ['LoaiPTCuuHo', 'Xe máy | Xe van | Xe sàn trượt | Xe cẩu, kéo'],
      [],
      ['Cot PhuPhi', 'Y Nghia'],
      ['TenPhuPhi', 'Tên đầu phụ phí (VD: Thời gian yêu cầu cứu hộ, Tuyến cao tốc, Thời tiết)'],
      ['Kieu', 'Cố định | Hệ số'],
      ['GiaTri', 'Số tiền (Cố định) hoặc hệ số (VD: 1.15)'],
      ['TieuChi', 'Key tiêu chí: timeWindow | executionTimeWindow | isHighway | weather | holiday | ...'],
      [
        'GiaTriTieuChi',
        'Giá trị tiêu chí. Thời gian: 22:00-06:00. Cao tốc: tên tuyến (CT.xx). Khác: giá trị danh sách',
      ],
    ]);
    const infoSheet = XLSX.utils.aoa_to_sheet([
      ['Truong', 'GiaTri'],
      ['code', form.code || 'SUP-EXT-PARTNER'],
      ['name', form.name || 'Bảng phí đối tác mẫu'],
      ['target', form.target || 'SUPPLIER'],
      ['kind', form.kind || 'SUPPLIER_EXTERNAL'],
      ['status', form.status || 'DRAFT'],
      ['retailMarkupFactor', form.settings.retailMarkupFactor],
      ['roundMode', form.settings.roundMode],
      ['stackSurcharges', form.settings.stackSurcharges ? 'Nhân hệ số' : 'Hệ số cao nhất'],
    ]);
    const serviceSheet = XLSX.utils.json_to_sheet([
      {
        DichVu: 'Kích bình ắc quy',
        CachTinh: 'Theo lượt',
        MucGia: 350000,
        Tu: '',
        Den: '',
        TrongTaiTu: 1.5,
        TrongTaiDen: 3.5,
        SoCho: '5',
        LoaiPTGapSuCo: 'Xe chở người',
        LoaiPTCuuHo: '',
      },
      {
        DichVu: 'Thay lốp dự phòng',
        CachTinh: 'Theo lượt',
        MucGia: 400000,
        Tu: '',
        Den: '',
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở người',
        LoaiPTCuuHo: '',
      },
      {
        DichVu: 'Kéo xe về gara',
        CachTinh: 'Theo lượt',
        MucGia: 100000,
        Tu: 0,
        Den: 10,
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở người',
        LoaiPTCuuHo: 'Xe sàn trượt',
      },
      {
        DichVu: 'Kéo xe về gara',
        CachTinh: 'Theo đơn vị',
        MucGia: 10000,
        Tu: 10,
        Den: 20,
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở hàng',
        LoaiPTCuuHo: 'Xe sàn trượt',
      },
      {
        DichVu: 'Kéo xe đường dài',
        CachTinh: 'Theo đơn vị',
        MucGia: 15000,
        Tu: 20,
        Den: 50,
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở hàng',
        LoaiPTCuuHo: 'Xe sàn trượt',
      },
      {
        DichVu: 'Cẩu xe mặt đường',
        CachTinh: 'Theo lượt',
        MucGia: 900000,
        Tu: 0,
        Den: 1,
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở người',
        LoaiPTCuuHo: 'Xe cẩu, kéo',
      },
      {
        DichVu: 'Cẩu xe dưới mặt đường',
        CachTinh: 'Theo lượt',
        MucGia: 1500000,
        Tu: 1,
        Den: 3,
        TrongTaiTu: '',
        TrongTaiDen: '',
        SoCho: '',
        LoaiPTGapSuCo: 'Xe chở hàng',
        LoaiPTCuuHo: 'Xe cẩu, kéo',
      },
    ]);
    const surchargeSheet = XLSX.utils.json_to_sheet([
      {
        TenPhuPhi: 'Thời gian yêu cầu cứu hộ',
        Kieu: 'Hệ số',
        GiaTri: 1.15,
        TieuChi: 'timeWindow',
        GiaTriTieuChi: '22:00-06:00',
      },
      {
        TenPhuPhi: 'Thời gian thực hiện cứu hộ',
        Kieu: 'Hệ số',
        GiaTri: 1.1,
        TieuChi: 'executionTimeWindow',
        GiaTriTieuChi: '18:00-22:00',
      },
      {
        TenPhuPhi: 'Tuyến cao tốc',
        Kieu: 'Cố định',
        GiaTri: 150000,
        TieuChi: 'isHighway',
        GiaTriTieuChi: 'Cao tốc Bắc – Nam phía Đông (CT.01)',
      },
      {
        TenPhuPhi: 'Tuyến cao tốc',
        Kieu: 'Cố định',
        GiaTri: 180000,
        TieuChi: 'isHighway',
        GiaTriTieuChi: 'Hà Nội – Hải Phòng (CT.04)',
      },
      {
        TenPhuPhi: 'Thời tiết',
        Kieu: 'Cố định',
        GiaTri: 250000,
        TieuChi: 'weather',
        GiaTriTieuChi: 'Bão',
      },
      {
        TenPhuPhi: 'Lễ/Tết',
        Kieu: 'Hệ số',
        GiaTri: 1.2,
        TieuChi: 'holiday',
        GiaTriTieuChi: 'Có',
      },
    ]);
    XLSX.utils.book_append_sheet(wb, guideSheet, 'HuongDan');
    XLSX.utils.book_append_sheet(wb, infoSheet, 'ThongTin');
    XLSX.utils.book_append_sheet(wb, serviceSheet, 'DichVu');
    XLSX.utils.book_append_sheet(wb, surchargeSheet, 'PhuPhi');
    XLSX.writeFile(wb, 'mau_bang_phi_doi_tac.xlsx');
  };

  const parseExcelWorkbook = (workbook: XLSX.WorkBook): Record<string, unknown> => {
    const readSheet = (name: string) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) return [];
      return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    };
    const infoRows = readSheet('ThongTin');
    const info: Record<string, unknown> = {};
    infoRows.forEach((row) => {
      const key = String(row.Truong ?? row.Field ?? row.key ?? '').trim();
      const value = row.GiaTri ?? row.Value ?? row.value;
      if (key) info[key] = value;
    });
    const stackRaw = String(info.stackSurcharges ?? '').toLowerCase();
    return {
      code: info.code,
      name: info.name,
      target: info.target || 'SUPPLIER',
      kind: info.kind || 'SUPPLIER_EXTERNAL',
      status: info.status || 'DRAFT',
      settings: {
        retailMarkupFactor: Number(info.retailMarkupFactor) || form.settings.retailMarkupFactor,
        roundMode: info.roundMode || form.settings.roundMode,
        stackSurcharges: !(
          stackRaw.includes('cao nhất') ||
          stackRaw.includes('cao nhat') ||
          stackRaw === 'false' ||
          stackRaw === '0'
        ),
      },
      services: readSheet('DichVu'),
      surcharges: readSheet('PhuPhi'),
    };
  };

  const handleExcelFileSelected = async (file: File) => {
    setTableImportFileName(file.name);
    setTableImportError('');
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const payload = parseExcelWorkbook(workbook);
      setTableImportJsonText(JSON.stringify(payload, null, 2));
      setTableImportMode('json');
      setTableImportError('');
    } catch {
      setTableImportError('Không đọc được file Excel. Vui lòng dùng đúng template.');
    }
  };

  const toggleRule = (ruleId: string) => {
    setExpandedRuleIds((ids) =>
      ids.includes(ruleId) ? ids.filter((id) => id !== ruleId) : [...ids, ruleId]
    );
  };

  const addCriterion = () => {
    const selectedKeys = new Set((form.priceCriteria ?? []).map((criterion) => criterion.key));
    const available = feeCriterionDefinitions.find(
      (definition) =>
        definition.status === 'ACTIVE' && !selectedKeys.has(definition.key)
    );
    if (!available) return;
    const c = buildCriterion(available.label);
    update('priceCriteria', [...(form.priceCriteria ?? []), c]);
  };

  const toggleMatrixCriterion = (label: string, key: string, checked: boolean) => {
    const selected = (form.priceCriteria ?? []).find((criterion) => criterion.key === key);
    if (checked && !selected) {
      const criterion = buildCriterion(label);
      update('priceCriteria', [...(form.priceCriteria ?? []), criterion]);
      return;
    }
    if (!checked && selected) removeCriterion(selected.id);
  };

  const updateCriterion = (cid: string, patch: Partial<FeeCriterion>) => {
    update(
      'priceCriteria',
      (form.priceCriteria ?? []).map((c) => (c.id === cid ? { ...c, ...patch } : c))
    );
  };

  const changeCriterionDefinition = (
    cid: string,
    label: string
  ) => {
    const config = getCriterionConfig(label);
    if (!config) return;
    setForm((prev) => {
      const current = (prev.priceCriteria ?? []).find((criterion) => criterion.id === cid);
      if (!current) return prev;
      const duplicate = (prev.priceCriteria ?? []).some(
        (criterion) => criterion.id !== cid && criterion.key === config.key
      );
      if (duplicate) return prev;
      const nextCriterion: FeeCriterion = {
        ...current,
        label,
        key: config.key,
        valueType: config.valueType,
        allowedValues: config.values,
        operator: config.valueType === 'RANGE' ? 'BETWEEN' : 'IN',
        value: config.valueType === 'RANGE' ? ['', ''] : config.values,
      };
      return {
        ...prev,
        priceCriteria: (prev.priceCriteria ?? []).map((criterion) =>
          criterion.id === cid ? nextCriterion : criterion
        ),
        serviceRules: prev.serviceRules.map((rule) => ({
          ...rule,
          conditions: (rule.conditions ?? []).map((condition) =>
            condition.criterionKey === current.key
              ? {
                  criterionKey: config.key,
                  criterionLabel: label,
                  operator: config.valueType === 'RANGE' ? 'BETWEEN' : '=',
                  value: config.valueType === 'RANGE' ? ['', ''] : config.values[0] ?? '',
                }
              : condition
          ),
        })),
      };
    });
  };

  const removeCriterion = (cid: string) => {
    const removed = (form.priceCriteria ?? []).find((criterion) => criterion.id === cid);
    update('priceCriteria', (form.priceCriteria ?? []).filter((c) => c.id !== cid));
    if (removed) {
      update(
        'serviceRules',
        form.serviceRules.map((rule) => ({
          ...rule,
          conditions: (rule.conditions ?? []).filter(
            (condition) => condition.criterionKey !== removed.key
          ),
        }))
      );
    }
  };

  const isPrimaryCriterionInUse = (_criterionKey: string): boolean => false;

  const addSurchargeHead = (name: string) => {
    const head = SURCHARGE_HEAD_OPTIONS.find((item) => item.name === name);
    if (!head || form.surchargeRules.some((rule) => rule.name === name)) return;
    const isTime = isTimeSurchargeCriterion(head.criterionKey);
    const timeRange: [string, string] = [...DEFAULT_TIME_RANGE];
    const criterionValue = isTime ? timeRange : head.value;
    const rule: SurchargeRule = {
      id: `su-${Date.now()}`,
      name: head.name,
      type: 'FIXED',
      value: 0,
      activeWhen: isTime
        ? `${head.criterionKey}=${timeRange[0]}-${timeRange[1]}`
        : `${head.criterionKey}=${head.value}`,
      conditions: [
        {
          criterionKey: head.criterionKey,
          criterionLabel: head.criterionLabel,
          operator: isTime ? 'BETWEEN' : '=',
          value: criterionValue,
        },
      ],
      holidayDates: 'requiresHolidayDates' in head && head.requiresHolidayDates ? [] : undefined,
      stackable: true,
    };
    update('surchargeRules', [...form.surchargeRules, rule]);
  };

  const removeSurchargeHead = (name: string) => {
    update(
      'surchargeRules',
      form.surchargeRules.filter((rule) => rule.name !== name)
    );
  };

  const updateSurcharge = (sid: string, patch: Partial<SurchargeRule>) => {
    update(
      'surchargeRules',
      form.surchargeRules.map((s) => (s.id === sid ? { ...s, ...patch } : s))
    );
  };

  const removeSurcharge = (sid: string) => {
    update(
      'surchargeRules',
      form.surchargeRules.filter((s) => s.id !== sid)
    );
  };

  const duplicateSurcharge = (sid: string) => {
    const source = form.surchargeRules.find((rule) => rule.id === sid);
    if (!source) return;
    const copy: SurchargeRule = {
      ...source,
      id: `su-${Date.now()}`,
      conditions: source.conditions.map((condition) => ({ ...condition })),
      holidayDates: source.holidayDates ? [...source.holidayDates] : undefined,
    };
    const index = form.surchargeRules.findIndex((rule) => rule.id === sid);
    const next = [...form.surchargeRules];
    next.splice(Math.max(index, 0) + 1, 0, copy);
    update('surchargeRules', next);
  };

  const addSurchargeLine = (name: string) => {
    const source = form.surchargeRules.find((rule) => rule.name === name);
    if (source) {
      duplicateSurcharge(source.id);
      return;
    }
    addSurchargeHead(name);
  };

  const toggleSurchargeHead = (name: string, checked: boolean) => {
    if (checked) addSurchargeHead(name);
    else removeSurchargeHead(name);
  };

  const addPriceCondition = (ruleId: string) => {
    const rule = form.serviceRules.find((item) => item.id === ruleId);
    if (!rule) return;
    const primaryLabel = PRIMARY_CRITERION_BY_SERVICE[rule.serviceType];
    const primaryKey = primaryLabel ? PRIMARY_CRITERION_CONFIG[primaryLabel].key : '';
    const usedKeys = new Set((rule.conditions ?? []).map((condition) => condition.criterionKey));
    const criterion = (form.priceCriteria ?? []).find(
      (item) =>
        item.role !== 'SURCHARGE' &&
        item.key !== primaryKey &&
        !usedKeys.has(item.key)
    );
    if (!criterion) return;
    const condition: FeeRuleCondition = {
      criterionKey: criterion.key,
      criterionLabel: criterion.label,
      operator: criterion.valueType === 'RANGE' ? 'BETWEEN' : '=',
      value: defaultValueForOperator(
        criterion.valueType === 'RANGE' ? 'BETWEEN' : '=',
        criterion.allowedValues
      ),
    };
    updateServiceRule(ruleId, {
      conditions: [...(rule.conditions ?? []), condition],
    });
  };

  const syncServiceRule = (ruleId: string, serviceDetail: string) => {
    const serviceType = resolveFeeServiceType(serviceDetail);
    if (!serviceType) return;
    setForm((prev) => {
      return {
        ...prev,
        serviceRules: prev.serviceRules.map((rule) => {
          if (rule.id !== ruleId) return rule;
          const additionalConditions = (rule.conditions ?? []).filter(
            (condition) =>
              condition.criterionKey !== 'distanceKm' &&
              condition.criterionKey !== 'roadDistance' &&
              condition.criterionKey !== 'roadPosition'
          );
          const primaryCondition = buildPrimaryCondition(serviceType);
          return {
            ...rule,
            serviceType,
            serviceDetail,
            unit: SERVICE_CONFIG[serviceType].unit,
            pricingMode: serviceType === 'ONSITE' ? 'FIXED' : rule.pricingMode ?? 'FIXED',
            includedKm: undefined,
            pricePerExtraKm: undefined,
            conditions: primaryCondition
              ? [primaryCondition, ...additionalConditions]
              : additionalConditions,
          };
        }),
      };
    });
  };

  const updatePrimaryCondition = (
    ruleId: string,
    primaryKey: string,
    patch: Partial<FeeRuleCondition>
  ) => {
    const rule = form.serviceRules.find((item) => item.id === ruleId);
    if (!rule) return;
    const existingIndex = (rule.conditions ?? []).findIndex(
      (condition) => condition.criterionKey === primaryKey
    );
    if (existingIndex >= 0) {
      updatePriceCondition(ruleId, existingIndex, patch);
      return;
    }
    const primary = buildPrimaryCondition(rule.serviceType);
    if (!primary) return;
    updateServiceRule(ruleId, {
      conditions: [{ ...primary, ...patch }, ...(rule.conditions ?? [])],
    });
  };

  const updatePriceCondition = (
    ruleId: string,
    index: number,
    patch: Partial<FeeRuleCondition>
  ) => {
    const rule = form.serviceRules.find((r) => r.id === ruleId);
    const next = [...(rule?.conditions ?? [])];
    next[index] = { ...next[index], ...patch };
    updateServiceRule(ruleId, { conditions: next });
  };

  const removePriceCondition = (ruleId: string, index: number) => {
    const rule = form.serviceRules.find((r) => r.id === ruleId);
    updateServiceRule(ruleId, {
      conditions: (rule?.conditions ?? []).filter((_, i) => i !== index),
    });
  };

  const setSurchargeCriterion = (sid: string, criterionKey: string) => {
    const meta = SURCHARGE_CRITERIA_CATALOG.find((c) => c.key === criterionKey);
    if (!meta) {
      updateSurcharge(sid, { conditions: [] });
      return;
    }
    const isTime = isTimeSurchargeCriterion(meta.key);
    const timeRange: [string, string] = [
      meta.values[0] ?? DEFAULT_TIME_RANGE[0],
      meta.values[1] ?? DEFAULT_TIME_RANGE[1],
    ];
    const value = isTime ? timeRange : meta.values[0] ?? '';
    updateSurcharge(sid, {
      name:
        FEE_SURCHARGE_CATALOG.find((item) => item.criterionKey === criterionKey)?.name ??
        meta.label,
      activeWhen: isTime
        ? `${criterionKey}=${timeRange[0]}-${timeRange[1]}`
        : `${criterionKey}=${meta.values[0]}`,
      conditions: [
        {
          criterionKey: meta.key,
          criterionLabel: meta.label,
          operator: isTime ? 'BETWEEN' : '=',
          value,
        },
      ],
      holidayDates: criterionKey === 'holiday' ? [] : undefined,
    });
  };

  const setSurchargeConditionValue = (sid: string, value: string) => {
    const surcharge = form.surchargeRules.find((s) => s.id === sid);
    const current = surcharge?.conditions[0];
    if (!current) return;
    updateSurcharge(sid, {
      activeWhen: `${current.criterionKey}=${value}`,
      conditions: [{ ...current, value }],
    });
  };

  const setSurchargeTimeRange = (sid: string, from: string, to: string) => {
    const surcharge = form.surchargeRules.find((s) => s.id === sid);
    const current = surcharge?.conditions[0];
    if (!current) return;
    updateSurcharge(sid, {
      activeWhen: `${current.criterionKey}=${from}-${to}`,
      conditions: [
        {
          ...current,
          operator: 'BETWEEN',
          value: [from, to],
        },
      ],
    });
  };

  const kindOptions = (Object.keys(FEE_KIND_LABELS) as FeeTableKind[]).filter((k) =>
    form.target === 'CUSTOMER' ? k.startsWith('CUSTOMER_') : k.startsWith('SUPPLIER_')
  );
  const isRetailKind = form.kind === 'CUSTOMER_RETAIL';
  const hasRetailMarkupConfig = isRetailKind && Number(form.settings.retailMarkupFactor) > 0;
  const skipsPriceMatrixTabs = hasRetailMarkupConfig;
  const visibleTabs = skipsPriceMatrixTabs
    ? TABS.filter((tab) => tab.id === 'general')
    : TABS;
  const selectedServiceHeads: string[] = Array.from(
    new Set<string>(form.serviceRules.map((rule) => rule.serviceDetail))
  );
  const catalogLeafServices = SERVICE_OPTIONS.flatMap((option) =>
    option.children?.length ? [...option.children] : [option.value]
  );
  const orphanServiceHeads = selectedServiceHeads.filter(
    (service) => !catalogLeafServices.includes(service)
  );
  const selectableServiceCount = catalogLeafServices.length + orphanServiceHeads.length;
  const selectedSurchargeHeads: string[] = Array.from(
    new Set<string>(form.surchargeRules.map((rule) => rule.name))
  );
  const allCatalogServicesSelected =
    catalogLeafServices.length > 0 &&
    catalogLeafServices.every((service) => selectedServiceHeads.includes(service));
  const allSurchargesSelected =
    SURCHARGE_HEAD_OPTIONS.length > 0 &&
    SURCHARGE_HEAD_OPTIONS.every((option) => selectedSurchargeHeads.includes(option.name));
  const surchargeGroups = selectedSurchargeHeads.map((name) => ({
    name,
    rules: form.surchargeRules.filter((rule) => rule.name === name),
  }));
  const criteriaRule = form.serviceRules.find((rule) => rule.id === criteriaRuleId);
  const criteriaRulePrimaryLabel = criteriaRule
    ? PRIMARY_CRITERION_BY_SERVICE[criteriaRule.serviceType]
    : undefined;
  const criteriaRulePrimaryKey = criteriaRulePrimaryLabel
    ? PRIMARY_CRITERION_CONFIG[criteriaRulePrimaryLabel].key
    : '';
  const criteriaRuleConditions = (criteriaRule?.conditions ?? [])
    .map((condition, index) => ({ condition, index }))
    .filter(({ condition }) => condition.criterionKey !== criteriaRulePrimaryKey);
  const criteriaRuleUsedKeys = new Set(
    criteriaRuleConditions.map(({ condition }) => condition.criterionKey)
  );
  const canAddCriteriaRuleCondition = (form.priceCriteria ?? []).some(
    (criterion) =>
      criterion.role !== 'SURCHARGE' &&
      criterion.key !== criteriaRulePrimaryKey &&
      !criteriaRuleUsedKeys.has(criterion.key)
  );

  useEffect(() => {
    if (skipsPriceMatrixTabs && activeTab !== 'general') {
      setActiveTab('general');
    }
  }, [skipsPriceMatrixTabs, activeTab]);

  const completeCriteriaModal = () => {
    const hasEmpty = criteriaRuleConditions.some(({ condition }) =>
      isConditionValueEmpty(condition)
    );
    if (hasEmpty) {
      setCriteriaModalError('Vui lòng nhập giá trị cho tất cả tiêu chí bổ sung');
      return;
    }
    const invalidRange = criteriaRuleConditions.some(({ condition }) => {
      if (condition.operator !== 'BETWEEN' || !Array.isArray(condition.value)) return false;
      return Number(condition.value[0]) > Number(condition.value[1]);
    });
    if (invalidRange) {
      setCriteriaModalError('Khoảng Từ – Đến: giá trị Từ không được lớn hơn Đến');
      return;
    }
    setCriteriaModalError('');
    setCriteriaRuleId(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/rescue-fee-config')}
            className="p-2 border rounded hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">
            {isEdit ? 'Chỉnh sửa bảng phí' : 'Tạo bảng phí'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openTableImport('json')}
            className="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-vetc-green hover:text-vetc-green"
          >
            <FileJson size={15} />
            Import JSON bảng
          </button>
          <button
            type="button"
            onClick={() => openTableImport('excel')}
            className="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-vetc-green hover:text-vetc-green"
          >
            <FileSpreadsheet size={15} />
            Import Excel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 shadow-sm"
          >
            <Save size={16} />
            Lưu bảng phí
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleExcelFileSelected(file);
          e.target.value = '';
        }}
      />

      {tableImportOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Import bảng phí đối tác</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Nạp toàn bộ dịch vụ, tiêu chí và phụ phí vào bảng hiện tại.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTableImportOpen(false)}
                className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 border-b bg-gray-50 px-5 py-3">
              <button
                type="button"
                onClick={() => {
                  setTableImportMode('json');
                  if (!tableImportJsonText) {
                    setTableImportJsonText(JSON.stringify(buildPartnerTableSample(), null, 2));
                  }
                }}
                className={`rounded px-3 py-1.5 text-xs font-bold ${
                  tableImportMode === 'json'
                    ? 'bg-vetc-green text-white'
                    : 'border bg-white text-gray-600'
                }`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setTableImportMode('excel')}
                className={`rounded px-3 py-1.5 text-xs font-bold ${
                  tableImportMode === 'excel'
                    ? 'bg-vetc-green text-white'
                    : 'border bg-white text-gray-600'
                }`}
              >
                Excel
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {tableImportMode === 'json' ? (
                <>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-gray-600">
                    JSON bảng phí <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={tableImportJsonText}
                    onChange={(e) => {
                      setTableImportJsonText(e.target.value);
                      setTableImportError('');
                    }}
                    rows={18}
                    spellCheck={false}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-gray-700 outline-none focus:border-vetc-green"
                  />
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                    Object gồm <code>code</code>, <code>name</code>, <code>target</code> (
                    {FEE_TARGET_LABELS.SUPPLIER}), <code>services[]</code>, <code>surcharges[]</code>,{' '}
                    <code>priceCriteria[]</code>. Import sẽ thay thế dòng giá/phụ phí tương ứng.
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <FileSpreadsheet size={28} className="mx-auto text-vetc-green" />
                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      Chọn file Excel bảng phí đối tác
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Hỗ trợ .xlsx, .xls, .csv · Sheet bắt buộc: ThongTin, DichVu, PhuPhi (HuongDan tùy chọn)
                    </p>
                    {tableImportFileName && (
                      <p className="mt-2 text-xs font-semibold text-vetc-green">
                        Đã chọn: {tableImportFileName}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => excelInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded bg-vetc-green px-4 py-2 text-xs font-bold text-white"
                      >
                        <Upload size={14} /> Chọn file
                      </button>
                      <button
                        type="button"
                        onClick={downloadPartnerExcelTemplate}
                        className="inline-flex items-center gap-2 rounded border bg-white px-4 py-2 text-xs font-bold text-gray-600"
                      >
                        <Download size={14} /> Tải template
                      </button>
                    </div>
                  </div>
                  {tableImportJsonText && (
                    <div>
                      <label className="mb-1 block text-[11px] font-bold uppercase text-gray-600">
                        Dữ liệu đã đọc từ Excel
                      </label>
                      <textarea
                        value={tableImportJsonText}
                        onChange={(e) => setTableImportJsonText(e.target.value)}
                        rows={12}
                        spellCheck={false}
                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-gray-700 outline-none focus:border-vetc-green"
                      />
                    </div>
                  )}
                </>
              )}
              {tableImportError && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {tableImportError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setTableImportOpen(false)}
                className="rounded border bg-white px-4 py-2 text-xs font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={applyTableImportJson}
                disabled={!tableImportJsonText.trim()}
                className="rounded bg-vetc-green px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Áp dụng vào bảng phí
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="flex items-center overflow-x-auto border-b bg-gray-50/80">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-vetc-green text-vetc-green bg-green-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader title="Thông tin chung" number={1} />
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Mã bảng *</label>
                  <input
                    className={inputClass}
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tên bảng *</label>
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Đối tượng tính</label>
                  <AppSelect
                    value={form.target}
                    options={[
                      { value: 'CUSTOMER', label: 'Khách hàng' },
                      { value: 'SUPPLIER', label: 'Nhà cung cấp' },
                    ]}
                    onChange={(value) => {
                      const target = value as FeeTarget;
                      setForm((prev) => ({
                        ...prev,
                        target,
                        kind: syncKindWithTarget(target, prev.kind),
                        scope: {
                          ...prev.scope,
                          ...(target === 'CUSTOMER'
                            ? { supplierId: undefined, supplierName: undefined }
                            : { enterpriseCode: undefined }),
                        },
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Loại bảng</label>
                  <AppSelect
                    value={form.kind}
                    options={kindOptions.map((kind) => ({
                      value: kind,
                      label: FEE_KIND_LABELS[kind],
                    }))}
                    onChange={(value) => {
                      const kind = value as FeeTableKind;
                      update('kind', kind);
                      if (kind === 'CUSTOMER_RETAIL' && activeTab !== 'general') {
                        setActiveTab('general');
                      }
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Trạng thái</label>
                  <AppSelect
                    value={form.status}
                    options={(Object.keys(FEE_STATUS_LABELS) as FeeTableStatus[]).map((status) => ({
                      value: status,
                      label: FEE_STATUS_LABELS[status],
                    }))}
                    onChange={(value) => update('status', value as FeeTableStatus)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phiên bản</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.version}
                    onChange={(e) => update('version', Number(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hiệu lực từ</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.validFrom}
                    onChange={(e) => update('validFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hiệu lực đến</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.validTo}
                    onChange={(e) => update('validTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader title="Phạm vi áp dụng" number={2} />
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Doanh nghiệp</label>
                  <AppSelect
                    value={form.scope.enterpriseCode ?? ''}
                    placeholder="Chọn doanh nghiệp"
                    disabled={form.target === 'SUPPLIER'}
                    options={[
                      ...FEE_ENTERPRISE_OPTIONS.map((item) => ({
                        value: item.code,
                        label: `${item.code} — ${item.name}`,
                      })),
                      ...(form.scope.enterpriseCode &&
                      !FEE_ENTERPRISE_OPTIONS.some((item) => item.code === form.scope.enterpriseCode)
                        ? [
                            {
                              value: form.scope.enterpriseCode,
                              label: form.scope.enterpriseCode,
                            },
                          ]
                        : []),
                    ]}
                    onChange={(value) =>
                      update('scope', {
                        ...form.scope,
                        enterpriseCode: value || undefined,
                      })
                    }
                  />
                  {form.target === 'SUPPLIER' && (
                    <p className="mt-1 text-[10px] text-gray-400">
                      Chỉ áp dụng khi Đối tượng tính = Khách hàng.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Nhà cung cấp</label>
                  <AppSelect
                    value={form.scope.supplierId ?? ''}
                    placeholder="Chọn nhà cung cấp"
                    disabled={form.target === 'CUSTOMER'}
                    options={[
                      ...FEE_SUPPLIER_OPTIONS.map((item) => ({
                        value: item.id,
                        label: `${item.id} — ${item.name}`,
                      })),
                      ...(form.scope.supplierId &&
                      !FEE_SUPPLIER_OPTIONS.some((item) => item.id === form.scope.supplierId)
                        ? [
                            {
                              value: form.scope.supplierId,
                              label: `${form.scope.supplierId}${
                                form.scope.supplierName ? ` — ${form.scope.supplierName}` : ''
                              }`,
                            },
                          ]
                        : []),
                    ]}
                    onChange={(value) => {
                      const selected = FEE_SUPPLIER_OPTIONS.find((item) => item.id === value);
                      update('scope', {
                        ...form.scope,
                        supplierId: value || undefined,
                        supplierName: selected?.name ?? (value ? form.scope.supplierName : undefined),
                      });
                    }}
                  />
                  {form.target === 'CUSTOMER' && (
                    <p className="mt-1 text-[10px] text-gray-400">
                      Chỉ áp dụng khi Đối tượng tính = Nhà cung cấp.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Tên NCC</label>
                  <input
                    className={`${inputClass} bg-gray-50`}
                    value={form.scope.supplierName ?? ''}
                    readOnly
                    placeholder="Tự điền khi chọn NCC"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader title="Tham số tính của bảng phí" number={3} />
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className={labelClass}>Hệ số giá khách lẻ</label>
                  <input
                    type="number"
                    min="1"
                    step="0.05"
                    disabled={!isRetailKind}
                    className={`${inputClass} ${!isRetailKind ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
                    value={form.settings.retailMarkupFactor}
                    onChange={(e) =>
                      update('settings', {
                        ...form.settings,
                        retailMarkupFactor: Number(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="mt-1 text-[10px] text-gray-400">
                    {isRetailKind
                      ? 'Áp dụng khi lấy giá Public x Hệ số'
                      : 'Chỉ enable khi Loại bảng = Khách hàng lẻ'}
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Quy tắc làm tròn</label>
                  <AppSelect
                    value={form.settings.roundMode}
                    options={[
                      { value: 'NEAREST_1000', label: 'Đến 1.000 đồng' },
                      { value: 'NEAREST_100', label: 'Đến 100 đồng' },
                      { value: 'NONE', label: 'Không làm tròn' },
                    ]}
                    onChange={(value) =>
                      update('settings', {
                        ...form.settings,
                        roundMode: value as RoundMode,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Cách tính hệ số phụ phí</label>
                  <AppSelect
                    value={form.settings.stackSurcharges ? 'STACK' : 'MAX'}
                    options={[
                      { value: 'STACK', label: 'Nhân hệ số' },
                      { value: 'MAX', label: 'Hệ số cao nhất' },
                    ]}
                    onChange={(value) =>
                      update('settings', {
                        ...form.settings,
                        stackSurcharges: value === 'STACK',
                      })
                    }
                    disabled={skipsPriceMatrixTabs}
                  />
                  {skipsPriceMatrixTabs && (
                    <p className="mt-1 text-[10px] text-gray-400">
                      Không áp dụng — bảng KH lẻ nhân hệ số theo giá Public.
                    </p>
                  )}
                </div>
              </div>
              {skipsPriceMatrixTabs && (
                <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 text-[11px] leading-relaxed text-amber-900">
                  <span className="font-bold">Khách hàng lẻ + hệ số:</span> không cần cấu hình{' '}
                  <span className="font-semibold">Dòng giá theo tiêu chí</span> và{' '}
                  <span className="font-semibold">Phụ phí có điều kiện</span>. Phí KH = giá Public × hệ số{' '}
                  <span className="font-bold">{form.settings.retailMarkupFactor}</span>.
                </div>
              )}
            </div>

            {!skipsPriceMatrixTabs && (
            <>
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader title="Danh mục áp dụng trong bảng phí" number={4} />
              <div className="space-y-4 p-4">
                <p className="text-xs text-gray-500">
                  Chọn trước các đầu dịch vụ và phụ phí. Hệ thống sẽ tạo dòng cấu hình tương ứng
                  tại tab 2 và tab 3.
                </p>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-lg border bg-gray-50/50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-gray-700">Đầu dịch vụ</div>
                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {selectedServiceHeads.length}/{selectableServiceCount} dịch vụ đã chọn
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          allCatalogServicesSelected
                            ? clearAllServiceHeads()
                            : selectAllServiceHeads()
                        }
                        className="shrink-0 rounded border border-vetc-green bg-white px-2.5 py-1 text-[10px] font-bold text-vetc-green hover:bg-green-50"
                      >
                        {allCatalogServicesSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {SERVICE_OPTIONS.filter((option) => !option.children?.length).map(
                          (option) => {
                            const checked = selectedServiceHeads.includes(option.value);
                            return (
                              <label
                                key={option.value}
                                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                                  checked
                                    ? 'border-green-200 bg-green-50 text-green-800'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="accent-vetc-green"
                                  checked={checked}
                                  onChange={(e) =>
                                    toggleServiceHead(option.value, e.target.checked)
                                  }
                                />
                                <span className="font-semibold">{option.value}</span>
                              </label>
                            );
                          }
                        )}
                      </div>

                      {SERVICE_OPTIONS.filter((option) => option.children?.length).map(
                        (option) => {
                          const children = [...(option.children ?? [])];
                          const selectedChildren = children.filter((child) =>
                            selectedServiceHeads.includes(child)
                          );
                          const legacyParentSelected = selectedServiceHeads.includes(
                            option.value
                          );
                          const allSelected =
                            children.length > 0 && selectedChildren.length === children.length;
                          const someSelected =
                            selectedChildren.length > 0 || legacyParentSelected;
                          const orphanChildren = orphanServiceHeads.filter(
                            (service) =>
                              resolveFeeServiceType(service) === option.type &&
                              !children.includes(service) &&
                              service !== option.value
                          );
                          const displayChildren = [...children, ...orphanChildren];

                          return (
                            <div
                              key={option.value}
                              className={`rounded-lg border p-3 ${
                                someSelected
                                  ? 'border-green-200 bg-green-50/40'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-800">
                                <input
                                  type="checkbox"
                                  className="accent-vetc-green"
                                  checked={allSelected}
                                  ref={(el) => {
                                    if (el) {
                                      el.indeterminate = someSelected && !allSelected;
                                    }
                                  }}
                                  onChange={(e) =>
                                    toggleServiceParent(option.value, e.target.checked)
                                  }
                                />
                                <span className="font-bold">{option.value}</span>
                                <span className="text-[10px] font-medium text-gray-500">
                                  {selectedChildren.length}/{children.length} dịch vụ con
                                </span>
                              </label>
                              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {displayChildren.map((child) => {
                                  const checked = selectedServiceHeads.includes(child);
                                  return (
                                    <label
                                      key={child}
                                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                                        checked
                                          ? 'border-green-200 bg-green-50 text-green-800'
                                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="accent-vetc-green"
                                        checked={checked}
                                        onChange={(e) =>
                                          toggleServiceHead(child, e.target.checked)
                                        }
                                      />
                                      <span className="font-semibold">{child}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              {legacyParentSelected && (
                                <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                  <input
                                    type="checkbox"
                                    className="accent-vetc-green"
                                    checked
                                    onChange={(e) =>
                                      toggleServiceHead(option.value, e.target.checked)
                                    }
                                  />
                                  <span className="font-semibold">
                                    {option.value} (cấu hình cũ)
                                  </span>
                                </label>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-gray-50/50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-gray-700">Đầu phụ phí</div>
                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {selectedSurchargeHeads.length}/{SURCHARGE_HEAD_OPTIONS.length} phụ phí đã chọn
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          allSurchargesSelected
                            ? clearAllSurchargeHeads()
                            : selectAllSurchargeHeads()
                        }
                        className="shrink-0 rounded border border-blue-500 bg-white px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50"
                      >
                        {allSurchargesSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SURCHARGE_HEAD_OPTIONS.map((option) => {
                        const checked = selectedSurchargeHeads.includes(option.name);
                        return (
                          <label
                            key={option.name}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                              checked
                                ? 'border-blue-200 bg-blue-50 text-blue-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="accent-vetc-green"
                              checked={checked}
                              onChange={(e) => toggleSurchargeHead(option.name, e.target.checked)}
                            />
                            <span className="font-semibold">{option.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader
                title="Tiêu chí của ma trận giá"
                number={5}
                actions={
                  <button
                    type="button"
                    onClick={() => navigate('/rescue-fee-criteria')}
                    className="rounded border border-white/40 bg-white/10 px-3 py-1 text-[10px] font-bold text-white hover:bg-white/20"
                  >
                    Quản lý danh mục
                  </button>
                }
              />
              <div className="space-y-3 p-4">
                <p className="text-xs text-gray-500">
                  Khai báo các chiều tiêu chí dùng cho dòng giá và phụ phí ở các tab tiếp theo.
                  Giá trị lấy từ danh mục hệ thống.
                </p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {feeCriterionDefinitions
                    .filter((definition) => definition.status === 'ACTIVE')
                    .map((definition) => {
                      const selected = (form.priceCriteria ?? []).find(
                        (criterion) => criterion.key === definition.key
                      );
                      return (
                        <div
                          key={definition.id}
                          className={`rounded-lg border p-3 transition-colors ${
                            selected
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                            <input
                              type="checkbox"
                              className="accent-vetc-green"
                              checked={Boolean(selected)}
                              onChange={(e) =>
                                toggleMatrixCriterion(
                                  definition.label,
                                  definition.key,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="min-w-0 flex-1 font-semibold leading-snug">
                              {definition.label}
                            </span>
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {activeTab === 'matrix' && !skipsPriceMatrixTabs && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader
                title="Dòng giá theo tổ hợp tiêu chí"
                number={1}
              />
              <div className="space-y-4 p-4">
                {selectedServiceHeads.map((serviceDetail, serviceIndex) => {
                  const serviceRules = form.serviceRules.filter(
                    (rule) => rule.serviceDetail === serviceDetail
                  );
                  const serviceType = serviceRules[0]?.serviceType ?? 'ONSITE';
                  return (
                    <div key={serviceDetail} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-vetc-green text-xs font-black text-white">
                            {serviceIndex + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{serviceDetail}</div>
                            <div className="text-[10px] text-gray-500">
                              {SERVICE_CONFIG[serviceType].label} · {serviceRules.length} dòng giá
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addPriceLineForService(serviceDetail)}
                            className="inline-flex items-center gap-1 rounded border border-vetc-green bg-white px-3 py-1.5 text-[10px] font-bold text-vetc-green hover:bg-green-50"
                            title="Thêm dòng phí mới cho dịch vụ này"
                          >
                            <Plus size={13} />
                            Thêm dòng
                          </button>
                          <button
                            type="button"
                            onClick={() => openImportJson(serviceDetail)}
                            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green"
                          >
                            <FileJson size={13} />
                            Import JSON
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px] border-collapse text-xs">
                          <thead>
                            <tr className="bg-white text-[10px] font-bold uppercase tracking-wide text-gray-600">
                              <th className="w-[40px] border-b border-r px-2 py-2 text-center" title="Kéo thả để sắp xếp">
                                <GripVertical size={12} className="mx-auto text-gray-400" />
                              </th>
                              <th className="w-[340px] border-b border-r px-3 py-2 text-left">Tiêu chí chính</th>
                              <th className="w-[190px] border-b border-r px-3 py-2 text-left">Cách tính</th>
                              <th className="w-[150px] border-b border-r px-3 py-2 text-right">Mức giá</th>
                              <th className="border-b border-r px-3 py-2 text-left">Tiêu chí bổ sung</th>
                              <th className="w-[112px] border-b px-3 py-2 text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                    {serviceRules.map((rule) => {
                      const primaryLabel = PRIMARY_CRITERION_BY_SERVICE[rule.serviceType];
                      const primaryConfig = primaryLabel
                        ? PRIMARY_CRITERION_CONFIG[primaryLabel]
                        : null;
                      const configuredPrimary = primaryConfig
                        ? (rule.conditions ?? []).find(
                            (condition) => condition.criterionKey === primaryConfig.key
                          )
                        : null;
                      const fallbackPrimary = primaryConfig
                        ? buildPrimaryCondition(rule.serviceType)
                        : null;
                      const primaryCondition = configuredPrimary ?? fallbackPrimary;
                      const additionalConditions = (rule.conditions ?? [])
                        .map((condition, index) => ({ condition, index }))
                        .filter(({ condition }) => condition.criterionKey !== primaryConfig?.key);
                      const primaryUnit = rule.serviceType === 'CRANE' ? 'm' : 'km';
                      const isDragging = draggedPriceRuleId === rule.id;
                      const isDragOver =
                        dragOverPriceRuleId === rule.id && draggedPriceRuleId !== rule.id;

                      return (
                        <tr
                          key={rule.id}
                          draggable
                          onDragStart={() => setDraggedPriceRuleId(rule.id)}
                          onDragEnd={() => {
                            setDraggedPriceRuleId(null);
                            setDragOverPriceRuleId(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverPriceRuleId !== rule.id) {
                              setDragOverPriceRuleId(rule.id);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedPriceRuleId) {
                              reorderServiceRules(serviceDetail, draggedPriceRuleId, rule.id);
                            }
                            setDraggedPriceRuleId(null);
                            setDragOverPriceRuleId(null);
                          }}
                          className={`align-top even:bg-gray-50/40 ${
                            isDragging ? 'opacity-50' : ''
                          } ${isDragOver ? 'bg-green-50 ring-1 ring-inset ring-vetc-green/40' : ''}`}
                        >
                          <td className="border-b border-r p-2">
                            <div
                              className="mx-auto flex h-[34px] w-full cursor-grab items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                              title="Kéo để sắp xếp dòng giá"
                            >
                              <GripVertical size={14} />
                            </div>
                          </td>
                          <td className="border-b border-r p-2">
                            {!primaryConfig || !primaryCondition ? (
                              <div className="flex h-[34px] items-center rounded bg-gray-50 px-3 text-gray-400">
                                Không áp dụng
                              </div>
                            ) : (
                              <div className="grid grid-cols-[1fr_30px_auto_30px_1fr] items-center gap-1.5">
                                <div className="relative">
                                  <input
                                    type="number"
                                    className={`${inputClass} pr-8 text-right`}
                                    placeholder="Từ"
                                    value={
                                      Array.isArray(primaryCondition.value)
                                        ? primaryCondition.value[0] ?? ''
                                        : primaryCondition.value ?? ''
                                    }
                                    onChange={(e) => {
                                      const current = Array.isArray(primaryCondition.value)
                                        ? primaryCondition.value
                                        : [primaryCondition.value ?? '', ''];
                                      updatePrimaryCondition(rule.id, primaryConfig.key, {
                                        operator: 'BETWEEN',
                                        value: [e.target.value, current[1] ?? ''],
                                      });
                                    }}
                                  />
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                    {primaryUnit}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  className="h-[30px] rounded border bg-gray-50 text-xs font-bold text-gray-600"
                                  title="Giá trị bắt đầu không bao gồm"
                                >
                                  &lt;
                                </button>
                                <span className="text-xs font-bold text-gray-400">~</span>
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  className="h-[30px] rounded bg-vetc-green text-xs font-bold text-white"
                                  title="Giá trị kết thúc có bao gồm"
                                >
                                  ≤
                                </button>
                                <div className="relative">
                                  <input
                                    type="number"
                                    className={`${inputClass} pr-8 text-right`}
                                    placeholder="Đến"
                                    value={
                                      Array.isArray(primaryCondition.value)
                                        ? primaryCondition.value[1] ?? ''
                                        : ''
                                    }
                                    onChange={(e) => {
                                      const current = Array.isArray(primaryCondition.value)
                                        ? primaryCondition.value
                                        : [primaryCondition.value ?? '', ''];
                                      updatePrimaryCondition(rule.id, primaryConfig.key, {
                                        operator: 'BETWEEN',
                                        value: [current[0] ?? '', e.target.value],
                                      });
                                    }}
                                  />
                                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                                    {primaryUnit}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="border-b border-r p-2">
                            <AppSelect
                              value={rule.serviceType === 'ONSITE' ? 'FIXED' : rule.pricingMode ?? 'FIXED'}
                              disabled={rule.serviceType === 'ONSITE'}
                              options={[
                                { value: 'FIXED', label: 'Theo lượt' },
                                { value: 'PER_UNIT', label: 'Theo đơn vị' },
                              ]}
                              onChange={(value) =>
                                updateServiceRule(rule.id, {
                                  pricingMode: value as ServicePricingMode,
                                  unit: SERVICE_CONFIG[rule.serviceType].unit,
                                })
                              }
                            />
                          </td>
                          <td className="border-b border-r p-2">
                            <input
                              type="text"
                              inputMode="numeric"
                              className={`${inputClass} text-right font-semibold`}
                              value={rule.basePrice ? rule.basePrice.toLocaleString('en-US') : ''}
                              onChange={(e) =>
                                updateServiceRule(rule.id, {
                                  basePrice: parseMoneyInput(e.target.value),
                                })
                              }
                              placeholder="0"
                            />
                          </td>
                          <td className="border-b border-r p-2">
                            <div className="flex min-h-[34px] items-center justify-between gap-2">
                              <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                {additionalConditions.slice(0, 3).map(({ condition, index }) => (
                                  <span
                                    key={`${rule.id}-summary-${index}`}
                                    className="max-w-[320px] whitespace-normal break-words rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
                                    title={formatConditionSummary(condition)}
                                  >
                                    {formatConditionSummary(condition)}
                                  </span>
                                ))}
                                {additionalConditions.length > 3 && (
                                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                                    +{additionalConditions.length - 3}
                                  </span>
                                )}
                                {additionalConditions.length === 0 && (
                                  <span className="text-[10px] text-gray-400">Chưa có tiêu chí bổ sung</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setCriteriaModalError('');
                                  setCriteriaRuleId(rule.id);
                                }}
                                className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green"
                              >
                                <SlidersHorizontal size={12} />
                                Cấu hình ({additionalConditions.length})
                              </button>
                            </div>
                          </td>
                          <td className="border-b p-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => duplicateServiceRule(rule.id)}
                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                                title="Nhân bản dòng"
                              >
                                <Copy size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeServiceRule(rule.id)}
                                className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                title="Xóa dòng"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
                {form.serviceRules.length === 0 && (
                  <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-gray-400">
                    Chưa có đầu dịch vụ. Vui lòng chọn tại tab 1.
                  </div>
                )}
              </div>
              {importServiceDetail && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
                  <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">
                          Import JSON — {importServiceDetail}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Dữ liệu import sẽ thay thế toàn bộ dòng giá của dịch vụ này.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImportServiceDetail(null)}
                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto p-5">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase text-gray-600">
                          Điều kiện tính phí <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={importJsonText}
                          onChange={(e) => {
                            setImportJsonText(e.target.value);
                            setImportError('');
                          }}
                          rows={16}
                          spellCheck={false}
                          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 font-mono text-xs leading-6 text-gray-700 outline-none focus:border-vetc-green"
                          placeholder={`[\n  {\n    "basePrice": 100000,\n    "pricingMode": "FIXED",\n    "from": 0,\n    "to": 10,\n    "conditions": {\n      "payload": [],\n      "seats": null,\n      "vehicleType": ""\n    }\n  }\n]`}
                        />
                      </div>
                      <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                        Mỗi dòng gồm: <code>primaryCriterion</code> (tiêu chí chính),{' '}
                        <code>pricingMode</code> (<code>FIXED</code>=Theo lượt,{' '}
                        <code>PER_UNIT</code>=Theo đơn vị), <code>basePrice</code> (mức giá),{' '}
                        <code>conditions</code> (tiêu chí bổ sung). Giá trị rỗng (
                        <code>[]</code>, <code>null</code>, <code>""</code>) sẽ bị bỏ qua.
                      </div>
                      {importError && (
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                          {importError}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setImportServiceDetail(null)}
                        className="rounded border bg-white px-4 py-2 text-xs font-bold text-gray-600"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={applyImportJson}
                        className="rounded bg-vetc-green px-4 py-2 text-xs font-bold text-white"
                      >
                        Import dữ liệu
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {criteriaRule && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4">
                  <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b px-5 py-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">
                          Tiêu chí bổ sung — {criteriaRule.serviceDetail}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Các tiêu chí trong cùng dòng được kết hợp theo điều kiện AND.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCriteriaModalError('');
                          setCriteriaRuleId(null);
                        }}
                        className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="mb-3 hidden grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1.5fr)_36px] gap-3 px-3 text-[10px] font-bold uppercase text-gray-500 md:grid">
                        <div>Tiêu chí</div>
                        <div>Toán tử</div>
                        <div>Giá trị</div>
                        <div />
                      </div>
                      <div className="space-y-2">
                        {criteriaRuleConditions.map(({ condition, index }, rowIndex) => {
                          const criterion = (form.priceCriteria ?? []).find(
                            (item) => item.key === condition.criterionKey
                          );
                          const hasListValues = (criterion?.allowedValues?.length ?? 0) > 0;
                          const selectedInValues = Array.isArray(condition.value)
                            ? condition.value.map(String)
                            : String(condition.value ?? '').trim()
                              ? [String(condition.value)]
                              : [];
                          const singleValue = Array.isArray(condition.value)
                            ? String(condition.value[0] ?? '')
                            : String(condition.value ?? '');
                          return (
                            <div
                              key={`${criteriaRule.id}-modal-${index}`}
                              className="grid grid-cols-1 gap-3 rounded-lg border bg-gray-50/50 p-3 md:grid-cols-[minmax(0,1.4fr)_100px_minmax(0,1.5fr)_36px] md:items-center"
                            >
                              <div className="min-w-0">
                                <div className="mb-1 text-[10px] font-bold uppercase text-gray-400 md:hidden">
                                  Tiêu chí
                                </div>
                                <AppSelect
                                  value={condition.criterionKey}
                                  options={(form.priceCriteria ?? [])
                                    .filter(
                                      (item) =>
                                        item.role !== 'SURCHARGE' &&
                                        item.key !== criteriaRulePrimaryKey
                                    )
                                    .map((item) => ({
                                      value: item.key,
                                      label: item.label,
                                      disabled:
                                        item.key !== condition.criterionKey &&
                                        criteriaRuleUsedKeys.has(item.key),
                                    }))}
                                  onChange={(value) => {
                                    const next = (form.priceCriteria ?? []).find(
                                      (item) => item.key === value
                                    );
                                    if (!next) return;
                                    const operator: FeeRuleCondition['operator'] =
                                      next.valueType === 'RANGE' ? 'BETWEEN' : '=';
                                    updatePriceCondition(criteriaRule.id, index, {
                                      criterionKey: next.key,
                                      criterionLabel: next.label,
                                      operator,
                                      value: defaultValueForOperator(operator, next.allowedValues),
                                    });
                                    setCriteriaModalError('');
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1 text-[10px] font-bold uppercase text-gray-400 md:hidden">
                                  Toán tử
                                </div>
                                <AppSelect
                                  value={condition.operator}
                                  options={[
                                    { value: '=', label: 'Bằng' },
                                    { value: 'IN', label: 'Thuộc danh sách' },
                                    { value: 'BETWEEN', label: 'Từ – Đến' },
                                    { value: '>=', label: '≥' },
                                    { value: '<=', label: '≤' },
                                  ]}
                                  onChange={(value) => {
                                    const operator = value as FeeRuleCondition['operator'];
                                    updatePriceCondition(criteriaRule.id, index, {
                                      operator,
                                      value: defaultValueForOperator(
                                        operator,
                                        criterion?.allowedValues
                                      ),
                                    });
                                    setCriteriaModalError('');
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1 text-[10px] font-bold uppercase text-gray-400 md:hidden">
                                  Giá trị
                                </div>
                                {condition.operator === 'BETWEEN' ? (
                                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                    <input
                                      type="number"
                                      className={inputClass}
                                      placeholder="Từ"
                                      value={
                                        Array.isArray(condition.value)
                                          ? condition.value[0] ?? ''
                                          : ''
                                      }
                                      onChange={(e) => {
                                        const current = Array.isArray(condition.value)
                                          ? condition.value
                                          : ['', ''];
                                        updatePriceCondition(criteriaRule.id, index, {
                                          operator: 'BETWEEN',
                                          value: [e.target.value, current[1] ?? ''],
                                        });
                                        setCriteriaModalError('');
                                      }}
                                    />
                                    <span className="text-gray-400">–</span>
                                    <input
                                      type="number"
                                      className={inputClass}
                                      placeholder="Đến"
                                      value={
                                        Array.isArray(condition.value)
                                          ? condition.value[1] ?? ''
                                          : ''
                                      }
                                      onChange={(e) => {
                                        const current = Array.isArray(condition.value)
                                          ? condition.value
                                          : ['', ''];
                                        updatePriceCondition(criteriaRule.id, index, {
                                          operator: 'BETWEEN',
                                          value: [current[0] ?? '', e.target.value],
                                        });
                                        setCriteriaModalError('');
                                      }}
                                    />
                                  </div>
                                ) : condition.operator === 'IN' ? (
                                  hasListValues ? (
                                    <AppSelect
                                      value={selectedInValues[0] ?? ''}
                                      placeholder="Chọn giá trị từ danh sách"
                                      options={(criterion?.allowedValues ?? []).map((value) => ({
                                        value,
                                        label: value,
                                      }))}
                                      onChange={(value) => {
                                        updatePriceCondition(criteriaRule.id, index, {
                                          value: value ? [value] : [],
                                        });
                                        setCriteriaModalError('');
                                      }}
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      className={inputClass}
                                      placeholder="Nhập giá trị"
                                      value={selectedInValues.join(', ')}
                                      onChange={(e) => {
                                        const parts = e.target.value
                                          .split(',')
                                          .map((item) => item.trim())
                                          .filter(Boolean);
                                        updatePriceCondition(criteriaRule.id, index, {
                                          value: parts,
                                        });
                                        setCriteriaModalError('');
                                      }}
                                    />
                                  )
                                ) : (
                                  <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Nhập giá trị"
                                    value={singleValue}
                                    onChange={(e) => {
                                      updatePriceCondition(criteriaRule.id, index, {
                                        value: e.target.value,
                                      });
                                      setCriteriaModalError('');
                                    }}
                                  />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removePriceCondition(criteriaRule.id, index)}
                                className="flex h-8 w-8 items-center justify-center justify-self-end rounded text-red-500 hover:bg-red-50 md:justify-self-center"
                                title={`Xóa tiêu chí ${rowIndex + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                        {criteriaRuleConditions.length === 0 && (
                          <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-gray-400">
                            Chưa có tiêu chí bổ sung cho dòng giá này.
                          </div>
                        )}
                      </div>
                      {criteriaModalError && (
                        <p className="mt-3 text-xs font-semibold text-red-600">{criteriaModalError}</p>
                      )}
                      <button
                        type="button"
                        disabled={!canAddCriteriaRuleCondition}
                        onClick={() => addPriceCondition(criteriaRule.id)}
                        className="mt-4 inline-flex items-center gap-1 rounded border border-vetc-green px-3 py-2 text-xs font-bold text-vetc-green disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                      >
                        <Plus size={14} />
                        Thêm tiêu chí
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t bg-gray-50 px-5 py-3">
                      <span className="text-xs text-gray-500">
                        Đã cấu hình {criteriaRuleConditions.length} tiêu chí bổ sung
                      </span>
                      <button
                        type="button"
                        onClick={completeCriteriaModal}
                        className="rounded bg-vetc-green px-5 py-2 text-xs font-bold text-white hover:bg-green-700"
                      >
                        Hoàn tất
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {false && form.serviceRules.map((rule, ruleIndex) => (
                <div key={rule.id} className="rounded-lg border shadow-sm overflow-hidden">
                  <div className="flex flex-col gap-2 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => toggleRule(rule.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <ChevronDown
                        size={15}
                        className={`shrink-0 transition-transform ${
                          expandedRuleIds.includes(rule.id) ? 'rotate-180' : ''
                        }`}
                      />
                      <span className="w-7 shrink-0 text-xs font-bold text-gray-400">
                        #{ruleIndex + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold text-gray-700">
                        {rule.serviceDetail || 'Chưa chọn dịch vụ'}
                      </span>
                      <span className="shrink-0 text-xs font-black text-gray-800">
                        {rule.basePrice.toLocaleString('en-US')} đ
                        {rule.pricingMode === 'PER_UNIT' ? `/${rule.unit || 'đơn vị'}` : ''}
                      </span>
                      <span className="hidden max-w-[380px] flex-1 truncate text-[10px] text-blue-700 lg:block">
                        {(rule.conditions ?? []).length
                          ? (rule.conditions ?? [])
                              .map((condition) => {
                                const value = Array.isArray(condition.value)
                                  ? condition.value.join(' → ')
                                  : String(condition.value);
                                return `${condition.criterionLabel}: ${value}`;
                              })
                              .join(' · ')
                          : 'Giá mặc định'}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center justify-end gap-1 border-t pt-2 sm:border-0 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => duplicateServiceRule(rule.id)}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-gray-600 hover:bg-white"
                        title="Nhân bản dòng"
                      >
                        <Copy size={13} /> Nhân bản
                      </button>
                      <button
                        type="button"
                        onClick={() => removeServiceRule(rule.id)}
                        className="p-1.5 text-red-500"
                        title="Xóa dòng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedRuleIds.includes(rule.id) && (
                  <div className="p-4 space-y-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Dịch vụ</label>
                        <select
                          className={`${inputClass} bg-white`}
                          value={rule.serviceDetail}
                          onChange={(e) => {
                            const option = SERVICE_OPTIONS.find((item) => item.value === e.target.value);
                            if (!option) return;
                            updateServiceRule(rule.id, {
                              serviceType: option.type,
                              serviceDetail: option.value,
                              unit: SERVICE_CONFIG[option.type].unit,
                              includedKm: undefined,
                              pricePerExtraKm: undefined,
                            });
                          }}
                        >
                          {SERVICE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.value}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Cách tính</label>
                        <select
                          className={`${inputClass} bg-white`}
                          value={rule.pricingMode ?? 'FIXED'}
                          onChange={(e) =>
                            updateServiceRule(rule.id, {
                              pricingMode: e.target.value as ServicePricingMode,
                              unit: SERVICE_CONFIG[rule.serviceType].unit,
                            })
                          }
                        >
                          <option value="FIXED">Theo lượt</option>
                          <option value="PER_UNIT">Theo đơn vị</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>
                          {rule.pricingMode === 'PER_UNIT' ? 'Đơn giá' : 'Giá trọn gói'}
                        </label>
                        <input
                          type="number"
                          className={`${inputClass} text-right`}
                          value={rule.basePrice}
                          onChange={(e) =>
                            updateServiceRule(rule.id, { basePrice: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-dashed bg-gray-50/50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-gray-700">Tổ hợp tiêu chí áp dụng</div>
                          <div className="text-[10px] text-gray-400">
                            Để trống nếu đây là mức giá mặc định.
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={!(form.priceCriteria ?? []).some((c) => c.role !== 'SURCHARGE')}
                          onClick={() => addPriceCondition(rule.id)}
                          className="text-xs font-bold text-vetc-green disabled:text-gray-300"
                        >
                          + Thêm điều kiện
                        </button>
                      </div>
                      {(rule.conditions ?? []).map((condition, conditionIndex) => {
                        const criterion = (form.priceCriteria ?? []).find(
                          (c) => c.key === condition.criterionKey
                        );
                        return (
                          <div
                            key={`${rule.id}-${conditionIndex}`}
                            className="mb-2 grid grid-cols-1 sm:grid-cols-[1fr_130px_1.5fr_36px] gap-2"
                          >
                            <select
                              className={`${inputClass} bg-white`}
                              value={condition.criterionKey}
                              onChange={(e) => {
                                const next = (form.priceCriteria ?? []).find((c) => c.key === e.target.value);
                                if (!next) return;
                                updatePriceCondition(rule.id, conditionIndex, {
                                  criterionKey: next.key,
                                  criterionLabel: next.label,
                                  operator: next.valueType === 'RANGE' ? 'BETWEEN' : '=',
                                  value: next.valueType === 'RANGE' ? ['', ''] : next.allowedValues?.[0] ?? '',
                                });
                              }}
                            >
                              {(form.priceCriteria ?? [])
                                .filter((c) => c.role !== 'SURCHARGE')
                                .map((c) => <option key={c.id} value={c.key}>{c.label}</option>)}
                            </select>
                            <select
                              className={`${inputClass} bg-white`}
                              value={condition.operator}
                              onChange={(e) => {
                                const operator = e.target.value as FeeRuleCondition['operator'];
                                updatePriceCondition(rule.id, conditionIndex, {
                                  operator,
                                  value:
                                    operator === 'BETWEEN'
                                      ? ['', '']
                                      : criterion?.allowedValues?.[0] ?? '',
                                });
                              }}
                            >
                              <option value="=">=</option>
                              <option value="IN">IN</option>
                              <option value="BETWEEN">Từ – Đến</option>
                              <option value=">=">&gt;=</option>
                              <option value="<=">&lt;=</option>
                            </select>
                            {condition.operator === 'BETWEEN' ? (
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <input
                                  type="number"
                                  className={inputClass}
                                  placeholder="Từ"
                                  value={Array.isArray(condition.value) ? condition.value[0] ?? '' : ''}
                                  onChange={(e) => {
                                    const current = Array.isArray(condition.value)
                                      ? condition.value
                                      : ['', ''];
                                    updatePriceCondition(rule.id, conditionIndex, {
                                      value: [e.target.value, current[1] ?? ''],
                                    });
                                  }}
                                />
                                <span className="text-xs text-gray-400">đến</span>
                                <input
                                  type="number"
                                  className={inputClass}
                                  placeholder="Đến"
                                  value={Array.isArray(condition.value) ? condition.value[1] ?? '' : ''}
                                  onChange={(e) => {
                                    const current = Array.isArray(condition.value)
                                      ? condition.value
                                      : ['', ''];
                                    updatePriceCondition(rule.id, conditionIndex, {
                                      value: [current[0] ?? '', e.target.value],
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <select
                                className={`${inputClass} bg-white`}
                                value={String(condition.value)}
                                onChange={(e) =>
                                  updatePriceCondition(rule.id, conditionIndex, { value: e.target.value })
                                }
                              >
                                {(criterion?.allowedValues ?? []).map((value) => (
                                  <option key={value} value={value}>{value}</option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              onClick={() => removePriceCondition(rule.id, conditionIndex)}
                              className="p-2 text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                      {(rule.conditions ?? []).length === 0 && (
                        <span className="inline-flex rounded-full bg-gray-200 px-2 py-1 text-[10px] font-semibold text-gray-600">
                          Giá mặc định
                        </span>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Giá dịch vụ" />
              <button
                type="button"
                onClick={addServiceRule}
                className="inline-flex items-center gap-1 bg-vetc-green text-white px-3 py-1.5 rounded text-xs font-bold"
              >
                <Plus size={14} /> Thêm dòng
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600">
                    <th className="p-2 border text-left">Loại DV</th>
                    <th className="p-2 border text-left">Chi tiết</th>
                    <th className="p-2 border text-right">Giá cơ bản</th>
                    <th className="p-2 border text-right">Km bao gồm</th>
                    <th className="p-2 border text-right">Giá/km vượt</th>
                    <th className="p-2 border text-left">Vị trí cẩu</th>
                    <th className="p-2 border w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.serviceRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="p-2 border">
                        <select
                          className={`${inputClass} bg-white`}
                          value={rule.serviceType}
                          onChange={(e) =>
                            updateServiceRule(rule.id, { serviceType: e.target.value as ServiceType })
                          }
                        >
                          <option value="ONSITE">Tại chỗ</option>
                          <option value="TOWING">Kéo xe</option>
                          <option value="CRANE">Cẩu</option>
                        </select>
                      </td>
                      <td className="p-2 border">
                        <input
                          className={inputClass}
                          value={rule.serviceDetail}
                          onChange={(e) => updateServiceRule(rule.id, { serviceDetail: e.target.value })}
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          className={`${inputClass} text-right`}
                          value={rule.basePrice}
                          onChange={(e) =>
                            updateServiceRule(rule.id, { basePrice: Number(e.target.value) || 0 })
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          className={`${inputClass} text-right`}
                          value={rule.includedKm ?? ''}
                          onChange={(e) =>
                            updateServiceRule(rule.id, {
                              includedKm: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          className={`${inputClass} text-right`}
                          value={rule.pricePerExtraKm ?? ''}
                          onChange={(e) =>
                            updateServiceRule(rule.id, {
                              pricePerExtraKm: e.target.value ? Number(e.target.value) : undefined,
                            })
                          }
                        />
                      </td>
                      <td className="p-2 border">
                        <select
                          className={`${inputClass} bg-white`}
                          value={rule.roadPosition ?? ''}
                          onChange={(e) =>
                            updateServiceRule(rule.id, {
                              roadPosition: (e.target.value || undefined) as
                                | ServicePriceRule['roadPosition']
                                | undefined,
                            })
                          }
                        >
                          <option value="">—</option>
                          <option value="ROAD">Mặt đường</option>
                          <option value="BELOW_ROAD">Dưới mặt đường</option>
                          <option value="SLOPE">Taluy/mương</option>
                        </select>
                      </td>
                      <td className="p-2 border text-center">
                        <button type="button" onClick={() => removeServiceRule(rule.id)} className="text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'criteria' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Tiêu chí linh động" />
              <button
                type="button"
                onClick={addCriterion}
                className="inline-flex items-center gap-1 bg-vetc-green text-white px-3 py-1.5 rounded text-xs font-bold"
              >
                <Plus size={14} /> Thêm tiêu chí
              </button>
            </div>
            <div className="space-y-2">
              {form.criteria.length === 0 && (
                <p className="text-sm text-gray-400">Chưa có tiêu chí. Thêm tiêu chí để thu hẹp phạm vi bảng.</p>
              )}
              {form.criteria.map((c) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border rounded p-3">
                  <div>
                    <label className={labelClass}>Nhãn</label>
                    <select
                      className={`${inputClass} bg-white`}
                      value={c.label}
                      onChange={(e) => updateCriterion(c.id, { label: e.target.value, key: e.target.value })}
                    >
                      {CRITERIA_CATALOG.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Toán tử</label>
                    <select
                      className={`${inputClass} bg-white`}
                      value={c.operator}
                      onChange={(e) =>
                        updateCriterion(c.id, { operator: e.target.value as FeeCriterion['operator'] })
                      }
                    >
                      <option value="=">=</option>
                      <option value="IN">IN</option>
                      <option value="BETWEEN">BETWEEN</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Giá trị</label>
                    <input
                      className={inputClass}
                      value={Array.isArray(c.value) ? c.value.join(',') : String(c.value)}
                      onChange={(e) => updateCriterion(c.id, { value: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nhóm</label>
                    <select
                      className={`${inputClass} bg-white`}
                      value={c.group ?? 'AND'}
                      onChange={(e) =>
                        updateCriterion(c.id, { group: e.target.value as 'AND' | 'OR' })
                      }
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeCriterion(c.id)} className="text-red-500 p-2">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'surcharges' && !skipsPriceMatrixTabs && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <SectionHeader
                title="Phụ phí có điều kiện"
                number={1}
                actions={
                  <span className="text-[10px] font-medium text-white/80">
                    Đầu phụ phí được chọn tại tab 1
                  </span>
                }
              />
              <div className="p-4">
            {form.surchargeRules.length === 0 ? (
              <div className="rounded border border-dashed px-4 py-8 text-center text-sm text-gray-400">
                Chưa có đầu phụ phí. Vui lòng chọn tại tab 1.
              </div>
            ) : (
              <div className="space-y-4">
                {surchargeGroups.map((group, groupIndex) => {
                  const first = group.rules[0];
                  const groupCriterionKey = first?.conditions[0]?.criterionKey;
                  const groupCriterionLabel =
                    first?.conditions[0]?.criterionLabel || 'Chưa gắn tiêu chí';
                  const isHolidayGroup =
                    group.name === 'Lễ/Tết' || groupCriterionKey === 'holiday';
                  const isTimeGroup = isTimeSurchargeCriterion(groupCriterionKey);
                  return (
                    <div
                      key={group.name}
                      className="overflow-hidden rounded-lg border bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-vetc-green text-xs font-black text-white">
                            {groupIndex + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{group.name}</div>
                            <div className="text-[10px] text-gray-500">
                              {groupCriterionLabel} · {group.rules.length} dòng điều kiện
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addSurchargeLine(group.name)}
                            className="inline-flex items-center gap-1 rounded border border-vetc-green bg-white px-3 py-1.5 text-[10px] font-bold text-vetc-green hover:bg-green-50"
                            title="Thêm dòng điều kiện cùng loại"
                          >
                            <Plus size={13} />
                            Thêm dòng
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSurchargeHead(group.name)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-white px-3 py-1.5 text-[10px] font-bold text-red-600 hover:bg-red-50"
                            title="Xóa nhóm phụ phí"
                          >
                            <Trash2 size={13} />
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] border-collapse text-xs">
                          <thead>
                            <tr className="bg-white text-[10px] font-bold uppercase tracking-wide text-gray-600">
                              <th className="w-[160px] border-b border-r px-3 py-2 text-left">Kiểu</th>
                              <th className="w-[140px] border-b border-r px-3 py-2 text-right">
                                Giá trị / Hệ số
                              </th>
                              <th className="w-[220px] border-b border-r px-3 py-2 text-left">
                                Tiêu chí phụ
                              </th>
                              <th className="border-b border-r px-3 py-2 text-left">
                                {isTimeGroup ? 'Khoảng thời gian' : 'Giá trị tiêu chí'}
                              </th>
                              <th className="w-[100px] border-b px-3 py-2 text-center">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rules.map((s) => {
                              const isHoliday =
                                s.name === 'Lễ/Tết' || s.conditions[0]?.criterionKey === 'holiday';
                              const isTimeCriterion = isTimeSurchargeCriterion(
                                s.conditions[0]?.criterionKey
                              );
                              const timeFrom = Array.isArray(s.conditions[0]?.value)
                                ? String(s.conditions[0]?.value[0] ?? '')
                                : '';
                              const timeTo = Array.isArray(s.conditions[0]?.value)
                                ? String(s.conditions[0]?.value[1] ?? '')
                                : '';
                              return (
                                <React.Fragment key={s.id}>
                                  <tr className="align-top even:bg-gray-50/40">
                                    <td className="border-b border-r p-2">
                                      <AppSelect
                                        value={s.type}
                                        options={[
                                          { value: 'FIXED', label: 'Cố định' },
                                          { value: 'COEFFICIENT', label: 'Hệ số' },
                                        ]}
                                        onChange={(value) =>
                                          updateSurcharge(s.id, {
                                            type: value as SurchargeType,
                                          })
                                        }
                                      />
                                    </td>
                                    <td className="border-b border-r p-2">
                                      <input
                                        type="number"
                                        step="0.01"
                                        className={`${inputClass} text-right font-semibold`}
                                        value={s.value}
                                        onChange={(e) =>
                                          updateSurcharge(s.id, {
                                            value: Number(e.target.value) || 0,
                                          })
                                        }
                                      />
                                    </td>
                                    <td className="border-b border-r p-2">
                                      <AppSelect
                                        value={s.conditions[0]?.criterionKey ?? ''}
                                        placeholder="Chọn tiêu chí"
                                        className={!s.conditions.length ? 'border-red-300' : ''}
                                        options={SURCHARGE_CRITERIA_CATALOG.map((criterion) => ({
                                          value: criterion.key,
                                          label: criterion.label,
                                          disabled: form.surchargeRules.some(
                                            (item) =>
                                              item.name !== s.name &&
                                              item.conditions[0]?.criterionKey === criterion.key
                                          ),
                                        }))}
                                        onChange={(value) => setSurchargeCriterion(s.id, value)}
                                      />
                                    </td>
                                    <td className="border-b border-r p-2">
                                      {isTimeCriterion ? (
                                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                          <input
                                            type="time"
                                            className={inputClass}
                                            value={timeFrom}
                                            onChange={(e) =>
                                              setSurchargeTimeRange(
                                                s.id,
                                                e.target.value,
                                                timeTo
                                              )
                                            }
                                          />
                                          <span className="text-xs font-semibold text-gray-400">
                                            –
                                          </span>
                                          <input
                                            type="time"
                                            className={inputClass}
                                            value={timeTo}
                                            onChange={(e) =>
                                              setSurchargeTimeRange(
                                                s.id,
                                                timeFrom,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <AppSelect
                                          disabled={!s.conditions.length || isHoliday}
                                          value={String(s.conditions[0]?.value ?? '')}
                                          placeholder="Chọn giá trị"
                                          options={(SURCHARGE_CRITERIA_CATALOG.find(
                                            (criterion) =>
                                              criterion.key === s.conditions[0]?.criterionKey
                                          )?.values ?? []).map((value) => ({
                                            value,
                                            label: value,
                                          }))}
                                          onChange={(value) =>
                                            setSurchargeConditionValue(s.id, value)
                                          }
                                        />
                                      )}
                                    </td>
                                    <td className="border-b p-2">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => duplicateSurcharge(s.id)}
                                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
                                          title="Nhân bản dòng"
                                        >
                                          <Copy size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => removeSurcharge(s.id)}
                                          disabled={group.rules.length <= 1}
                                          className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300"
                                          title={
                                            group.rules.length <= 1
                                              ? 'Giữ ít nhất 1 dòng — dùng nút Xóa nhóm'
                                              : 'Xóa dòng'
                                          }
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  {isHoliday && (
                                    <tr className="bg-amber-50/40">
                                      <td colSpan={5} className="border-b px-3 py-3">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                          <div>
                                            <div className="text-xs font-bold text-amber-800">
                                              Ngày holiday áp dụng
                                            </div>
                                            <div className="text-[10px] text-amber-700">
                                              Chỉ thu phụ phí Lễ/Tết khi ngày đơn thuộc danh sách
                                              này.
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateSurcharge(s.id, {
                                                holidayDates: [...(s.holidayDates ?? []), ''],
                                              })
                                            }
                                            className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-2 py-1 text-[10px] font-bold text-amber-700"
                                          >
                                            <Plus size={12} /> Thêm ngày
                                          </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {(s.holidayDates ?? []).map((date, index) => (
                                            <div
                                              key={`${s.id}-holiday-${index}`}
                                              className="flex items-center gap-1"
                                            >
                                              <input
                                                type="date"
                                                className={`${inputClass} w-auto`}
                                                value={date}
                                                onChange={(e) => {
                                                  const next = [...(s.holidayDates ?? [])];
                                                  next[index] = e.target.value;
                                                  updateSurcharge(s.id, { holidayDates: next });
                                                }}
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  updateSurcharge(s.id, {
                                                    holidayDates: (s.holidayDates ?? []).filter(
                                                      (_, i) => i !== index
                                                    ),
                                                  })
                                                }
                                                className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          ))}
                                          {(s.holidayDates ?? []).length === 0 && (
                                            <div className="text-xs text-amber-700">
                                              Chưa có ngày holiday. Nhấn “Thêm ngày” để cấu hình.
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {isHolidayGroup && group.rules.length > 1 && (
                        <div className="border-t bg-amber-50/50 px-4 py-2 text-[10px] text-amber-700">
                          Mỗi dòng Lễ/Tết có thể cấu hình danh sách ngày riêng.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescueFeeForm;
