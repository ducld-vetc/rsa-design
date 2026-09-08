import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Info, Package, Pencil, Plus, Save, Trash2, Wrench, X } from 'lucide-react';
import {
  CORPORATE_ROLE_OPTIONS,
  PACKAGE_TYPE_OPTIONS,
  SPONSOR_TYPE_OPTIONS,
  TARGET_CUSTOMER_OPTIONS,
  catalogServiceOptions,
  corporateOptions,
  createMockPackage,
  getPackageById,
  isPackageCodeTaken,
  updateMockPackage,
  type CorporateFeeType,
  type CorporatePackageLine,
  type CorporateRole,
  type FixedSponsorRule,
  type PackageServiceLine,
  type PackageType,
  type RescuePackageFormPayload,
  type SponsorCategory,
  type SponsorType,
  type TargetCustomer,
} from '../../data/rescuePackageMockData';
import {
  MOCK_RESCUE_SERVICES,
  SERVICE_CATEGORY_LABEL,
  SERVICE_UNIT_LABEL,
  type PartnerStatus,
  type ServiceUnit,
} from '../../data/rescueServiceMockData';
import {
  DEFAULT_REPAIR_SPONSOR_FIXED,
  DEFAULT_RESCUE_TOW_SPONSOR_FIXED,
} from '../../data/tripSponsorApply';
import AppMultiSelect from '../../shared/AppMultiSelect';
import AppSelect from '../../shared/AppSelect';
import {
  FieldLabel,
  SectionHeader,
  inputClass,
  outlineBtnClass,
  primaryBtnClass,
  selectClass,
} from '../rescue-partner-admin/adminUi';

type FormMode = 'view' | 'edit' | 'create';

type ServiceDraft = {
  key: string;
  serviceId: string;
  quotaLimit: string;
  quantity: string;
  status: boolean;
};

type FixedSponsorRuleDraft = {
  key: string;
  categories: SponsorCategory[];
  serviceId: string;
  amount: string;
};

type CorporateDraft = {
  key: string;
  corporateCustomerId: string;
  role: CorporateRole | '';
  status: boolean;
  sponsorType: SponsorType | '';
  /** RATE: một % chung cho mọi loại dịch vụ. */
  rateSponsorValue: string;
  fixedSponsorRules: FixedSponsorRuleDraft[];
};

type FormState = {
  packageCode: string;
  name: string;
  description: string;
  targetCustomer: TargetCustomer;
  price: string;
  vat: string;
  durationValue: string;
  prefixPurchaseCode: string;
  isGift: boolean;
  status: PartnerStatus;
  packageType: PackageType;
  services: ServiceDraft[];
  corporates: CorporateDraft[];
};

const newKey = () => `k-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const EMPTY_SERVICE = (): ServiceDraft => ({
  key: newKey(),
  serviceId: '',
  quotaLimit: '',
  quantity: '',
  status: true,
});

const SPONSOR_CATEGORY_OPTIONS: { value: SponsorCategory; label: string }[] = [
  { value: 'RESCUE_SERVICE', label: SERVICE_CATEGORY_LABEL.RESCUE_SERVICE },
  { value: 'TOW_SERVICE', label: SERVICE_CATEGORY_LABEL.TOW_SERVICE },
  { value: 'REPAIR_SERVICE', label: SERVICE_CATEGORY_LABEL.REPAIR_SERVICE },
];

const EMPTY_CORPORATE = (): CorporateDraft => ({
  key: newKey(),
  corporateCustomerId: '',
  role: '',
  status: true,
  sponsorType: '',
  rateSponsorValue: '',
  fixedSponsorRules: [],
});

const EMPTY_FIXED_RULE = (): FixedSponsorRuleDraft => ({
  key: newKey(),
  categories: [],
  serviceId: '',
  amount: '',
});

const clearSponsorDraft = (row: CorporateDraft): CorporateDraft => ({
  ...row,
  sponsorType: '',
  rateSponsorValue: '',
  fixedSponsorRules: [],
});

const packageServicesByCategory = (services: ServiceDraft[], categories: SponsorCategory[]) => {
  const seen = new Set<string>();
  return services.flatMap((row) => {
    if (!row.serviceId || seen.has(row.serviceId)) return [];
    const svc = MOCK_RESCUE_SERVICES.find((item) => item.id === Number(row.serviceId));
    if (!svc || !categories.includes(svc.category as SponsorCategory)) return [];
    seen.add(row.serviceId);
    return [{ value: row.serviceId, label: svc.name }];
  });
};

const defaultFixedRules = (services: ServiceDraft[]): FixedSponsorRuleDraft[] => {
  const repairIds: string[] = [];
  for (const row of services) {
    if (!row.serviceId) continue;
    const svc = MOCK_RESCUE_SERVICES.find((item) => item.id === Number(row.serviceId));
    if (svc?.category === 'REPAIR_SERVICE' && !repairIds.includes(row.serviceId)) repairIds.push(row.serviceId);
  }
  return [
    {
      key: newKey(),
      categories: ['RESCUE_SERVICE', 'TOW_SERVICE'],
      serviceId: '',
      amount: String(DEFAULT_RESCUE_TOW_SPONSOR_FIXED),
    },
    ...repairIds.map((serviceId) => ({
      key: newKey(),
      categories: ['REPAIR_SERVICE'] as SponsorCategory[],
      serviceId,
      amount: String(DEFAULT_REPAIR_SPONSOR_FIXED),
    })),
  ];
};

const applySponsorType = (
  row: CorporateDraft,
  sponsorType: SponsorType | '',
  services: ServiceDraft[],
): CorporateDraft => {
  const next = { ...row, sponsorType };
  if (sponsorType === 'FIXED' && next.fixedSponsorRules.length === 0) {
    next.fixedSponsorRules = defaultFixedRules(services);
  }
  return next;
};

/** Cách thu phí theo loại gói — không cấu hình trên từng DN. */
const feeTypeForPackage = (packageType: PackageType): CorporateFeeType =>
  packageType === 'TRIP' ? 'INCIDENTAL' : 'PERIODIC';

const EMPTY_FORM: FormState = {
  packageCode: '',
  name: '',
  description: '',
  targetCustomer: 'INDIVIDUAL',
  price: '',
  vat: '8',
  durationValue: '12',
  prefixPurchaseCode: '',
  isGift: false,
  status: 'active',
  packageType: 'ALWAYS',
  services: [EMPTY_SERVICE()],
  corporates: [],
};

const optionalNumber = (raw: string): number | null => {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const toPayload = (form: FormState): RescuePackageFormPayload => {
  const services: PackageServiceLine[] = form.services
    .filter((row) => row.serviceId)
    .map((row) => {
      const svc = MOCK_RESCUE_SERVICES.find((s) => s.id === Number(row.serviceId));
      return {
        id: row.key,
        serviceId: Number(row.serviceId),
        serviceCode: svc?.serviceCode ?? '',
        serviceName: svc?.name ?? '',
        unit: svc?.unit ?? '',
        quotaLimit: optionalNumber(row.quotaLimit),
        quantity: optionalNumber(row.quantity),
        status: row.status,
      };
    });

  const tripSponsor = form.packageType === 'TRIP';
  const corporates: CorporatePackageLine[] = form.corporates
    .filter((row) => row.corporateCustomerId && row.role)
    .map((row) => {
      const isSponsor = tripSponsor && row.role === 'SPONSOR';
      const isFixed = isSponsor && row.sponsorType === 'FIXED';
      const fixedSponsorRules: FixedSponsorRule[] = isFixed
        ? row.fixedSponsorRules.flatMap((rule) => {
            const amount = optionalNumber(rule.amount);
            if (!rule.categories.length || amount == null) return [];
            return [
              {
                categories: rule.categories,
                serviceId: rule.serviceId ? Number(rule.serviceId) : null,
                amount,
              },
            ];
          })
        : [];
      return {
        id: row.key,
        corporateCustomerId: Number(row.corporateCustomerId),
        corporateCustomerCode: '',
        corporateCustomerName: '',
        role: row.role as CorporateRole,
        feeType: feeTypeForPackage(form.packageType),
        status: row.status,
        sponsorType: isSponsor ? (row.sponsorType as SponsorType) : '',
        rateSponsorValue: isSponsor && row.sponsorType === 'RATE' ? optionalNumber(row.rateSponsorValue) : null,
        fixedSponsorRules,
      };
    });

  return {
    packageCode: form.packageCode,
    name: form.name,
    description: form.description,
    targetCustomer: form.targetCustomer,
    price: Number(form.price || 0),
    vat: optionalNumber(form.vat),
    durationValue: optionalNumber(form.durationValue),
    prefixPurchaseCode: form.prefixPurchaseCode.trim(),
    isGift: form.isGift,
    status: form.status,
    packageType: form.packageType,
    sponsorType: '',
    sponsorValue: null,
    maxSponsorAmount: null,
    services,
    corporates,
  };
};

const RescuePackageForm: React.FC<{ mode: FormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existing = useMemo(() => (id ? getPackageById(id) : undefined), [id]);
  const readOnly = mode === 'view';

  const [form, setForm] = useState<FormState>(() => {
    if (!existing) {
      return { ...EMPTY_FORM, services: [EMPTY_SERVICE()], corporates: [] };
    }
    return {
      packageCode: existing.packageCode,
      name: existing.name,
      description: existing.description,
      targetCustomer: existing.targetCustomer,
      price: String(existing.price),
      vat: existing.vat == null ? '' : String(existing.vat),
      durationValue: existing.durationValue == null ? '' : String(existing.durationValue),
      prefixPurchaseCode: existing.prefixPurchaseCode,
      isGift: existing.isGift,
      status: existing.status,
      packageType: existing.packageType,
      services:
        existing.services.length > 0
          ? existing.services.map((row) => ({
              key: row.id,
              serviceId: String(row.serviceId),
              quotaLimit: row.quotaLimit == null ? '' : String(row.quotaLimit),
              quantity: row.quantity == null ? '' : String(row.quantity),
              status: row.status,
            }))
          : [EMPTY_SERVICE()],
      corporates: existing.corporates.map((row) => {
        const isSponsor = existing.packageType === 'TRIP' && row.role === 'SPONSOR';
        const sponsorType = isSponsor ? row.sponsorType || '' : '';
        return {
          key: row.id,
          corporateCustomerId: String(row.corporateCustomerId),
          role: row.role,
          status: row.status,
          sponsorType,
          rateSponsorValue: isSponsor && row.rateSponsorValue != null ? String(row.rateSponsorValue) : '',
          fixedSponsorRules:
            isSponsor && sponsorType === 'FIXED'
              ? (row.fixedSponsorRules ?? []).map((rule) => ({
                  key: newKey(),
                  categories: rule.categories,
                  serviceId: rule.serviceId == null ? '' : String(rule.serviceId),
                  amount: String(rule.amount),
                }))
              : [],
        };
      }),
    };
  });
  const [error, setError] = useState('');

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const serviceCatalog = useMemo(() => catalogServiceOptions(), []);
  const corpOptions = useMemo(() => corporateOptions(), []);

  const title =
    mode === 'create'
      ? 'Thêm mới gói cứu hộ'
      : mode === 'edit'
        ? 'Chỉnh sửa gói cứu hộ'
        : 'Xem chi tiết gói cứu hộ';

  const handlePackageTypeChange = (next: PackageType) => {
    setForm((prev) => ({
      ...prev,
      packageType: next,
      corporates:
        next === 'TRIP'
          ? prev.corporates.map((row) =>
              row.role === 'SPONSOR' && !row.sponsorType ? applySponsorType(row, 'FIXED', prev.services) : row,
            )
          : prev.corporates.map((row) => (row.role === 'SPONSOR' ? clearSponsorDraft(row) : row)),
    }));
  };

  const updateService = (key: string, patch: Partial<ServiceDraft>) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));
  };

  const updateCorporate = (key: string, patch: Partial<CorporateDraft>) => {
    setForm((prev) => ({
      ...prev,
      corporates: prev.corporates.map((row) => {
        if (row.key !== key) return row;
        if (patch.role && patch.role !== 'SPONSOR') return clearSponsorDraft({ ...row, ...patch });
        let next = { ...row, ...patch };
        if (prev.packageType === 'TRIP' && patch.role === 'SPONSOR' && !next.sponsorType) {
          next = applySponsorType(next, 'FIXED', prev.services);
        }
        if (patch.sponsorType && patch.sponsorType !== row.sponsorType) {
          next = applySponsorType(
            {
              ...next,
              rateSponsorValue: '',
              fixedSponsorRules: [],
            },
            patch.sponsorType,
            prev.services,
          );
        } else if (patch.sponsorType) {
          next = applySponsorType(next, patch.sponsorType, prev.services);
        }
        return next;
      }),
    }));
  };

  const handleSave = () => {
    if (!form.packageCode.trim() || !form.name.trim()) {
      setError('Vui lòng nhập Mã gói và Tên gói.');
      return;
    }
    if (form.price.trim() === '' || Number(form.price) < 0 || !Number.isFinite(Number(form.price))) {
      setError('Giá gói phải là số ≥ 0.');
      return;
    }
    if (form.vat.trim()) {
      const vat = Number(form.vat);
      if (!Number.isFinite(vat) || vat < 0 || vat > 100) {
        setError('VAT phải là số từ 0 đến 100.');
        return;
      }
    }
    if (form.durationValue.trim()) {
      const d = Number(form.durationValue);
      if (!Number.isInteger(d) || d < 0) {
        setError('Thời hạn (tháng) phải là số nguyên ≥ 0.');
        return;
      }
    }
    if (isPackageCodeTaken(form.packageCode, existing?.id)) {
      setError(`Mã gói "${form.packageCode.trim()}" đã tồn tại.`);
      return;
    }

    const filledServices = form.services.filter((row) => row.serviceId);
    if (filledServices.length === 0) {
      setError('Gói phải có ít nhất một dịch vụ.');
      return;
    }
    const serviceIds = filledServices.map((row) => row.serviceId);
    if (new Set(serviceIds).size !== serviceIds.length) {
      setError('Mỗi dịch vụ chỉ được gắn một lần trong gói.');
      return;
    }
    for (const row of filledServices) {
      if (row.quotaLimit.trim() && (!Number.isFinite(Number(row.quotaLimit)) || Number(row.quotaLimit) < 0)) {
        setError('Hạn mức dịch vụ phải là số ≥ 0.');
        return;
      }
      if (row.quantity.trim() && (!Number.isFinite(Number(row.quantity)) || Number(row.quantity) < 0)) {
        setError('Số lượng dịch vụ phải là số ≥ 0.');
        return;
      }
    }

    const filledCorps = form.corporates.filter((row) => row.corporateCustomerId || row.role);
    for (const row of filledCorps) {
      if (!row.corporateCustomerId || !row.role) {
        setError('Mỗi dòng doanh nghiệp phải chọn đủ Doanh nghiệp và Vai trò.');
        return;
      }
    }
    const corpKeys = filledCorps.map((row) => `${row.corporateCustomerId}:${row.role}`);
    if (new Set(corpKeys).size !== corpKeys.length) {
      setError('Không được trùng cặp Doanh nghiệp + Vai trò.');
      return;
    }

    if (form.packageType === 'TRIP') {
      for (const row of filledCorps) {
        if (row.role !== 'SPONSOR') continue;
        const corpName = corpOptions.find((opt) => opt.value === row.corporateCustomerId)?.label ?? 'doanh nghiệp';
        if (!row.sponsorType) {
          setError(`Vai trò SPONSOR (${corpName}) bắt buộc chọn Hình thức bảo lãnh.`);
          return;
        }
        if (row.sponsorType === 'RATE') {
          const rate = optionalNumber(row.rateSponsorValue);
          if (rate == null || rate < 1 || rate > 100) {
            setError(`Vai trò SPONSOR (${corpName}) bắt buộc nhập giá trị bảo lãnh từ 1 đến 100%.`);
            return;
          }
          continue;
        }
        if (row.fixedSponsorRules.length === 0) {
          setError(`Vai trò SPONSOR (${corpName}) bắt buộc có ít nhất một dòng bảo lãnh FIXED.`);
          return;
        }
        for (const rule of row.fixedSponsorRules) {
          if (rule.categories.length === 0) {
            setError(`Vai trò SPONSOR (${corpName}) phải chọn ít nhất một nhóm dịch vụ.`);
            return;
          }
          const amount = optionalNumber(rule.amount);
          if (amount == null || amount <= 0) {
            setError(`Vai trò SPONSOR (${corpName}) bắt buộc nhập số tiền bảo lãnh > 0.`);
            return;
          }
          if (rule.serviceId) {
            const svc = MOCK_RESCUE_SERVICES.find((item) => item.id === Number(rule.serviceId));
            if (!svc || !rule.categories.includes(svc.category as SponsorCategory)) {
              setError(`Dịch vụ đã chọn phải thuộc nhóm dịch vụ của dòng bảo lãnh.`);
              return;
            }
          }
        }
      }
    }

    if (form.packageType === 'TRIP') {
      const activeCorps = filledCorps.filter((row) => row.status);
      const hasChannel = activeCorps.some((row) => row.role === 'CHANNEL');
      const hasSponsor = activeCorps.some((row) => row.role === 'SPONSOR');
      if (!hasChannel || !hasSponsor) {
        setError('Gói TRIP phải có ít nhất 1 DN vai trò Kênh bán (CHANNEL) và 1 DN vai trò SPONSOR đang hoạt động.');
        return;
      }
    }

    const payload = toPayload(form);
    if (mode === 'create') {
      const created = createMockPackage(payload);
      navigate('/admin/rescue-packages', {
        state: { notice: `Đã tạo gói ${created.name} (${created.packageCode}).` },
      });
      return;
    }
    if (existing) {
      updateMockPackage(existing.id, payload);
      navigate('/admin/rescue-packages', {
        state: { notice: `Đã cập nhật gói ${form.name.trim()}.` },
      });
    }
  };

  const actionButtons = (
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={() => navigate('/admin/rescue-packages')} className={outlineBtnClass}>
        <X size={16} />
        <span>Đóng</span>
      </button>
      {mode === 'view' && existing && (
        <button
          type="button"
          onClick={() => navigate(`/admin/rescue-packages/${existing.id}/edit`)}
          className={primaryBtnClass}
        >
          <Pencil size={16} />
          <span>Chỉnh sửa</span>
        </button>
      )}
      {mode !== 'view' && (
        <button type="button" onClick={handleSave} className={primaryBtnClass}>
          <Save size={16} />
          <span>{mode === 'edit' ? 'Lưu thay đổi' : 'Tạo mới'}</span>
        </button>
      )}
    </div>
  );

  if ((mode === 'view' || mode === 'edit') && !existing) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Không tìm thấy gói cứu hộ.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/rescue-packages')}
          className="text-vetc-green font-bold text-sm hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const disabled = readOnly;
  const isTrip = form.packageType === 'TRIP';

  const unitOf = (serviceId: string) => {
    const svc = MOCK_RESCUE_SERVICES.find((s) => s.id === Number(serviceId));
    if (!svc) return '—';
    return SERVICE_UNIT_LABEL[svc.unit as ServiceUnit] ?? svc.unit;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight min-w-0">{title}</h1>
        {actionButtons}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

      <div className="border rounded-lg shadow-sm overflow-visible bg-white w-full min-w-0">
        <div className="overflow-hidden rounded-t-lg">
          <SectionHeader title="Thông tin gói" icon={<Package size={16} />} />
        </div>
        <div className="p-4 space-y-4 overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <FieldLabel required>Mã gói</FieldLabel>
              <input
                className={inputClass}
                value={form.packageCode}
                disabled={disabled || mode === 'edit'}
                placeholder="VD: RSA_BASIC"
                onChange={(e) => update('packageCode', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <FieldLabel required>Tên gói</FieldLabel>
              <input
                className={inputClass}
                value={form.name}
                disabled={disabled}
                placeholder="Nhập tên gói"
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Prefix mã mua</FieldLabel>
              <input
                className={inputClass}
                value={form.prefixPurchaseCode}
                disabled={disabled}
                placeholder="RS2"
                onChange={(e) => update('prefixPurchaseCode', e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              className="w-full min-w-0 box-border min-h-[72px] border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-600"
              value={form.description}
              disabled={disabled}
              placeholder="Mô tả quyền lợi / điều kiện gói"
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <FieldLabel required>Loại gói</FieldLabel>
              <select
                className={selectClass}
                value={form.packageType}
                disabled={disabled}
                onChange={(e) => handlePackageTypeChange(e.target.value as PackageType)}
              >
                {PACKAGE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel required>Đối tượng</FieldLabel>
              <select
                className={selectClass}
                value={form.targetCustomer}
                disabled={disabled}
                onChange={(e) => update('targetCustomer', e.target.value as TargetCustomer)}
              >
                {TARGET_CUSTOMER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel required>Giá gói (VND)</FieldLabel>
              <input
                className={inputClass}
                value={form.price}
                disabled={disabled}
                inputMode="numeric"
                placeholder="200000"
                onChange={(e) => update('price', e.target.value.replace(/[^\d]/g, ''))}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>VAT (%)</FieldLabel>
              <input
                className={inputClass}
                value={form.vat}
                disabled={disabled}
                inputMode="decimal"
                placeholder="8"
                onChange={(e) => update('vat', e.target.value.replace(/[^\d.]/g, ''))}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Thời hạn (tháng)</FieldLabel>
              <input
                className={inputClass}
                value={form.durationValue}
                disabled={disabled}
                inputMode="numeric"
                placeholder="12"
                onChange={(e) => update('durationValue', e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Trạng thái</FieldLabel>
              <select
                className={selectClass}
                value={form.status}
                disabled={disabled}
                onChange={(e) => update('status', e.target.value as PartnerStatus)}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div className="min-w-0 flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-vetc-green"
                  checked={form.isGift}
                  disabled={disabled}
                  onChange={(e) => update('isGift', e.target.checked)}
                />
                Gói tặng (is_gift)
              </label>
            </div>
          </div>

        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-visible">
        <div className="overflow-hidden rounded-t-lg">
          <SectionHeader title="Dịch vụ trong gói" icon={<Wrench size={16} />} />
        </div>
        <div className="p-4 space-y-3 overflow-visible">
          <p className="flex items-start gap-2 text-[12px] text-gray-500 leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
            <span>
              Mỗi dịch vụ chỉ gắn một lần. Hạn mức theo đơn vị của dịch vụ (km / lít / lần). Để trống = không giới hạn.
            </span>
          </p>
          <div className="space-y-3">
            {form.services.map((row, index) => {
              const used = new Set(form.services.filter((s) => s.key !== row.key && s.serviceId).map((s) => s.serviceId));
              const options = serviceCatalog.map((opt) => ({
                ...opt,
                disabled: used.has(opt.value),
              }));
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end rounded-lg border border-gray-100 bg-gray-50/40 p-3 overflow-visible"
                >
                  <div className="lg:col-span-4 min-w-0">
                    <FieldLabel required={index === 0}>Dịch vụ</FieldLabel>
                    <AppSelect
                      searchable
                      value={row.serviceId}
                      options={options}
                      disabled={disabled}
                      placeholder="Chọn dịch vụ"
                      onChange={(value) => updateService(row.key, { serviceId: value })}
                    />
                  </div>
                  <div className="lg:col-span-1 min-w-0">
                    <FieldLabel>Đơn vị</FieldLabel>
                    <input className={inputClass} value={unitOf(row.serviceId)} disabled />
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <FieldLabel>Hạn mức</FieldLabel>
                    <input
                      className={inputClass}
                      value={row.quotaLimit}
                      disabled={disabled}
                      inputMode="decimal"
                      placeholder="Không giới hạn"
                      onChange={(e) => updateService(row.key, { quotaLimit: e.target.value.replace(/[^\d.]/g, '') })}
                    />
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <FieldLabel>Số lượng</FieldLabel>
                    <input
                      className={inputClass}
                      value={row.quantity}
                      disabled={disabled}
                      inputMode="numeric"
                      placeholder="—"
                      onChange={(e) => updateService(row.key, { quantity: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <FieldLabel>Trạng thái</FieldLabel>
                    <select
                      className={selectClass}
                      value={row.status ? 'active' : 'inactive'}
                      disabled={disabled}
                      onChange={(e) => updateService(row.key, { status: e.target.value === 'active' })}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                  <div className="lg:col-span-1 flex items-center justify-end pb-0.5">
                    {!disabled && (
                      <button
                        type="button"
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                        title="Xóa dòng"
                        onClick={() =>
                          setForm((prev) => {
                            const services =
                              prev.services.length === 1 ? [EMPTY_SERVICE()] : prev.services.filter((s) => s.key !== row.key);
                            return { ...prev, services };
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!disabled && (
            <button
              type="button"
              className={`${outlineBtnClass} mt-1`}
              onClick={() => setForm((prev) => ({ ...prev, services: [...prev.services, EMPTY_SERVICE()] }))}
            >
              <Plus size={14} />
              <span>Thêm dịch vụ</span>
            </button>
          )}
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-visible">
        <div className="overflow-hidden rounded-t-lg">
          <SectionHeader title="Doanh nghiệp khai thác" icon={<Building2 size={16} />} />
        </div>
        <div className="p-4 space-y-3 overflow-visible">
          <p className="flex items-start gap-2 text-[12px] text-gray-500 leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
            <span>
              Một DN có thể gắn nhiều vai trò (CHANNEL / SPONSOR / CUSTOMER / PARTNERSHIP). Cách thu phí theo loại gói
              (ALWAYS: theo kỳ, TRIP: phát sinh mỗi lần kích hoạt). Gói TRIP: vai trò SPONSOR chọn hình thức bảo lãnh
              chung. FIXED thêm dòng: chọn nhóm dịch vụ, dịch vụ để trống thì dùng chung, có chọn thì tính từng dịch vụ. Gói ALWAYS không bắt buộc gắn DN.
              {isTrip ? ' Gói TRIP bắt buộc có CHANNEL và SPONSOR đang hoạt động.' : ''}
            </span>
          </p>
          {form.corporates.length === 0 && (
            <p className="text-[12px] text-gray-400 italic">Chưa gắn doanh nghiệp.</p>
          )}
          <div className="space-y-3">
            {form.corporates.map((row) => {
              const usedPairs = new Set(
                form.corporates
                  .filter((item) => item.key !== row.key && item.corporateCustomerId && item.role)
                  .map((item) => `${item.corporateCustomerId}:${item.role}`),
              );
              return (
                <div
                  key={row.key}
                  className="rounded-lg border border-gray-100 bg-gray-50/40 p-3 overflow-visible space-y-3"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
                    <div className="lg:col-span-5 min-w-0">
                      <FieldLabel required={isTrip || row.role === 'SPONSOR'}>Doanh nghiệp</FieldLabel>
                      <AppSelect
                        searchable
                        value={row.corporateCustomerId}
                        options={corpOptions}
                        disabled={disabled}
                        placeholder="Chọn doanh nghiệp"
                        onChange={(value) => updateCorporate(row.key, { corporateCustomerId: value })}
                      />
                    </div>
                    <div className="lg:col-span-4 min-w-0">
                      <FieldLabel required={isTrip || row.role === 'SPONSOR'}>Vai trò</FieldLabel>
                      <select
                        className={selectClass}
                        value={row.role}
                        disabled={disabled}
                        onChange={(e) => updateCorporate(row.key, { role: e.target.value as CorporateRole | '' })}
                      >
                        <option value="">— Chọn —</option>
                        {CORPORATE_ROLE_OPTIONS.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={usedPairs.has(`${row.corporateCustomerId}:${opt.value}`)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="lg:col-span-2 min-w-0">
                      <FieldLabel>Trạng thái</FieldLabel>
                      <select
                        className={selectClass}
                        value={row.status ? 'active' : 'inactive'}
                        disabled={disabled}
                        onChange={(e) => updateCorporate(row.key, { status: e.target.value === 'active' })}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                    </div>
                    <div className="lg:col-span-1 flex items-center justify-end pb-0.5">
                      {!disabled && (
                        <button
                          type="button"
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                          title="Xóa dòng"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              corporates: prev.corporates.filter((item) => item.key !== row.key),
                            }))
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  {isTrip && row.role === 'SPONSOR' && (
                    <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-3 space-y-3">
                      <p className="flex items-start gap-2 text-[12px] text-violet-800 leading-relaxed">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        <span>
                          Hình thức bảo lãnh áp dụng chung. FIXED cấu hình từng dòng: chọn một hoặc nhiều nhóm dịch
                          vụ. Không chọn dịch vụ thì số tiền dùng chung cho cả nhóm; có chọn dịch vụ thì tính riêng
                          dịch vụ đó.
                        </span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="min-w-0">
                          <FieldLabel required>Hình thức bảo lãnh</FieldLabel>
                          <select
                            className={selectClass}
                            value={row.sponsorType}
                            disabled={disabled}
                            onChange={(e) =>
                              updateCorporate(row.key, { sponsorType: e.target.value as SponsorType | '' })
                            }
                          >
                            <option value="">— Chọn —</option>
                            {SPONSOR_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {row.sponsorType === 'RATE' && (
                          <div className="min-w-0">
                            <FieldLabel required>Giá trị bảo lãnh (%)</FieldLabel>
                            <input
                              className={inputClass}
                              value={row.rateSponsorValue}
                              disabled={disabled}
                              inputMode="decimal"
                              placeholder="100"
                              onChange={(e) =>
                                updateCorporate(row.key, {
                                  rateSponsorValue: e.target.value.replace(/[^\d.]/g, ''),
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                      {row.sponsorType === 'FIXED' && (
                        <div className="space-y-2">
                          {row.fixedSponsorRules.map((rule) => {
                            const serviceOptions = packageServicesByCategory(form.services, rule.categories);
                            return (
                              <div
                                key={rule.key}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end rounded-md border border-violet-100 bg-white/70 p-2"
                              >
                                <div className="lg:col-span-4 min-w-0">
                                  <FieldLabel required>Nhóm dịch vụ</FieldLabel>
                                  <AppMultiSelect
                                    values={rule.categories}
                                    options={SPONSOR_CATEGORY_OPTIONS}
                                    disabled={disabled}
                                    summary="values"
                                    placeholder="Chọn nhóm dịch vụ"
                                    onChange={(values) => {
                                      const categories = values as SponsorCategory[];
                                      const stillValid =
                                        categories.length === 1 &&
                                        packageServicesByCategory(form.services, categories).some(
                                          (opt) => opt.value === rule.serviceId,
                                        );
                                      updateCorporate(row.key, {
                                        fixedSponsorRules: row.fixedSponsorRules.map((item) =>
                                          item.key === rule.key
                                            ? { ...item, categories, serviceId: stillValid ? item.serviceId : '' }
                                            : item,
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="lg:col-span-4 min-w-0">
                                  <FieldLabel>Dịch vụ</FieldLabel>
                                  <AppSelect
                                    searchable
                                    value={rule.serviceId || '__SHARED__'}
                                    options={[{ value: '__SHARED__', label: 'Dùng chung nhóm' }, ...serviceOptions]}
                                    disabled={disabled || rule.categories.length !== 1}
                                    placeholder="Dùng chung nhóm"
                                    onChange={(value) =>
                                      updateCorporate(row.key, {
                                        fixedSponsorRules: row.fixedSponsorRules.map((item) =>
                                          item.key === rule.key
                                            ? { ...item, serviceId: value === '__SHARED__' ? '' : value }
                                            : item,
                                        ),
                                      })
                                    }
                                  />
                                </div>
                                <div className="lg:col-span-3 min-w-0">
                                  <FieldLabel required>Bảo lãnh (VND)</FieldLabel>
                                  <input
                                    className={inputClass}
                                    value={rule.amount}
                                    disabled={disabled}
                                    inputMode="numeric"
                                    placeholder="1500000"
                                    onChange={(e) => {
                                      const amount = e.target.value.replace(/\D/g, '');
                                      updateCorporate(row.key, {
                                        fixedSponsorRules: row.fixedSponsorRules.map((item) =>
                                          item.key === rule.key ? { ...item, amount } : item,
                                        ),
                                      });
                                    }}
                                  />
                                </div>
                                <div className="lg:col-span-1 flex items-center justify-end pb-0.5">
                                  {!disabled && (
                                    <button
                                      type="button"
                                      className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                      title="Xóa dòng bảo lãnh"
                                      onClick={() =>
                                        updateCorporate(row.key, {
                                          fixedSponsorRules: row.fixedSponsorRules.filter((item) => item.key !== rule.key),
                                        })
                                      }
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {!disabled && (
                            <button
                              type="button"
                              className={outlineBtnClass}
                              onClick={() =>
                                updateCorporate(row.key, {
                                  fixedSponsorRules: [...row.fixedSponsorRules, EMPTY_FIXED_RULE()],
                                })
                              }
                            >
                              <Plus size={14} />
                              <span>Thêm dòng bảo lãnh</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!disabled && (
            <button
              type="button"
              className={`${outlineBtnClass} mt-1`}
              onClick={() => setForm((prev) => ({ ...prev, corporates: [...prev.corporates, EMPTY_CORPORATE()] }))}
            >
              <Plus size={14} />
              <span>Thêm doanh nghiệp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const RescuePackageCreate = () => <RescuePackageForm mode="create" />;
export const RescuePackageView = () => <RescuePackageForm mode="view" />;
export const RescuePackageEdit = () => <RescuePackageForm mode="edit" />;

export default RescuePackageForm;
