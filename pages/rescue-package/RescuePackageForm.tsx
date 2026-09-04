import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Info, Package, Pencil, Plus, Save, Trash2, Wrench, X } from 'lucide-react';
import {
  CORPORATE_FEE_TYPE_OPTIONS,
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
  type PackageServiceLine,
  type PackageType,
  type RescuePackageFormPayload,
  type SponsorType,
  type TargetCustomer,
} from '../../data/rescuePackageMockData';
import { MOCK_RESCUE_SERVICES, SERVICE_UNIT_LABEL, type PartnerStatus, type ServiceUnit } from '../../data/rescueServiceMockData';
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

type CorporateDraft = {
  key: string;
  corporateCustomerId: string;
  role: CorporateRole | '';
  feeType: CorporateFeeType | '';
  status: boolean;
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
  sponsorType: SponsorType | '';
  sponsorValue: string;
  maxSponsorAmount: string;
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

const EMPTY_CORPORATE = (): CorporateDraft => ({
  key: newKey(),
  corporateCustomerId: '',
  role: '',
  feeType: 'PERIODIC',
  status: true,
});

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
  sponsorType: '',
  sponsorValue: '',
  maxSponsorAmount: '',
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

  const corporates: CorporatePackageLine[] = form.corporates
    .filter((row) => row.corporateCustomerId && row.role)
    .map((row) => ({
      id: row.key,
      corporateCustomerId: Number(row.corporateCustomerId),
      corporateCustomerCode: '',
      corporateCustomerName: '',
      role: row.role as CorporateRole,
      feeType: (row.feeType || 'PERIODIC') as CorporateFeeType,
      status: row.status,
    }));

  const isTrip = form.packageType === 'TRIP';

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
    sponsorType: isTrip ? (form.sponsorType as SponsorType) : form.sponsorType,
    sponsorValue: isTrip || form.sponsorValue.trim() ? optionalNumber(form.sponsorValue) : null,
    maxSponsorAmount: isTrip || form.maxSponsorAmount.trim() ? optionalNumber(form.maxSponsorAmount) : null,
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
      sponsorType: existing.sponsorType,
      sponsorValue: existing.sponsorValue == null ? '' : String(existing.sponsorValue),
      maxSponsorAmount: existing.maxSponsorAmount == null ? '' : String(existing.maxSponsorAmount),
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
      corporates: existing.corporates.map((row) => ({
        key: row.id,
        corporateCustomerId: String(row.corporateCustomerId),
        role: row.role,
        feeType: row.feeType,
        status: row.status,
      })),
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
      sponsorType: next === 'TRIP' ? prev.sponsorType || 'RATE' : prev.sponsorType,
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
      corporates: prev.corporates.map((row) => (row.key === key ? { ...row, ...patch } : row)),
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
      if (!form.sponsorType) {
        setError('Gói TRIP bắt buộc chọn Hình thức sponsor.');
        return;
      }
      const sponsorValue = optionalNumber(form.sponsorValue);
      if (sponsorValue == null || sponsorValue <= 0) {
        setError('Gói TRIP bắt buộc nhập Giá trị sponsor > 0.');
        return;
      }
      if (form.sponsorType === 'RATE' && (sponsorValue < 1 || sponsorValue > 100)) {
        setError('Sponsor theo % phải nằm trong khoảng 1–100.');
        return;
      }
      const maxAmount = optionalNumber(form.maxSponsorAmount);
      if (maxAmount == null || maxAmount <= 0) {
        setError('Gói TRIP bắt buộc nhập Trần sponsor / lần kích hoạt > 0.');
        return;
      }
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

          {isTrip && (
            <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-4 space-y-3">
              <p className="flex items-start gap-2 text-[12px] text-violet-800 leading-relaxed">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  Gói TRIP: cấu hình trần sponsor trên gói. Kênh bán và đơn vị trả cứu hộ gắn ở mục Doanh nghiệp khai
                  thác (CHANNEL + SPONSOR).
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <FieldLabel required>Hình thức sponsor</FieldLabel>
                  <select
                    className={selectClass}
                    value={form.sponsorType}
                    disabled={disabled}
                    onChange={(e) => update('sponsorType', e.target.value as SponsorType | '')}
                  >
                    <option value="">— Chọn —</option>
                    {SPONSOR_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <FieldLabel required>
                    {form.sponsorType === 'FIXED' ? 'Số tiền sponsor (VND)' : 'Giá trị sponsor (%)'}
                  </FieldLabel>
                  <input
                    className={inputClass}
                    value={form.sponsorValue}
                    disabled={disabled}
                    inputMode="decimal"
                    placeholder={form.sponsorType === 'FIXED' ? '500000' : '100'}
                    onChange={(e) => update('sponsorValue', e.target.value.replace(/[^\d.]/g, ''))}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel required>Trần sponsor / lần kích hoạt (VND)</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.maxSponsorAmount}
                    disabled={disabled}
                    inputMode="numeric"
                    placeholder="2000000"
                    onChange={(e) => update('maxSponsorAmount', e.target.value.replace(/[^\d]/g, ''))}
                  />
                </div>
              </div>
            </div>
          )}
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
                          setForm((prev) => ({
                            ...prev,
                            services: prev.services.length === 1 ? [EMPTY_SERVICE()] : prev.services.filter((s) => s.key !== row.key),
                          }))
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
              Một DN có thể gắn nhiều vai trò (CHANNEL / SPONSOR / CUSTOMER / PARTNERSHIP). Cách thu phí là phí gói,
              không phải chi phí cứu hộ. Gói ALWAYS không bắt buộc gắn DN.
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
                  className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end rounded-lg border border-gray-100 bg-gray-50/40 p-3 overflow-visible"
                >
                  <div className="lg:col-span-4 min-w-0">
                    <FieldLabel required={isTrip}>Doanh nghiệp</FieldLabel>
                    <AppSelect
                      searchable
                      value={row.corporateCustomerId}
                      options={corpOptions}
                      disabled={disabled}
                      placeholder="Chọn doanh nghiệp"
                      onChange={(value) => updateCorporate(row.key, { corporateCustomerId: value })}
                    />
                  </div>
                  <div className="lg:col-span-3 min-w-0">
                    <FieldLabel required={isTrip}>Vai trò</FieldLabel>
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
                    <FieldLabel>Cách thu phí</FieldLabel>
                    <select
                      className={selectClass}
                      value={row.feeType}
                      disabled={disabled}
                      onChange={(e) => updateCorporate(row.key, { feeType: e.target.value as CorporateFeeType })}
                    >
                      {CORPORATE_FEE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
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
