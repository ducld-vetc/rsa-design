import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Info, Pencil, Save, Wrench, X } from 'lucide-react';
import {
  MOCK_CORPORATE_CUSTOMERS,
  RESCUE_SERVICE_TYPE_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_SCOPE_OPTIONS,
  SERVICE_UNIT_OPTIONS,
  SUPPORT_VEHICLE_TYPE_OPTIONS,
  createMockService,
  getServiceById,
  isServiceCodeTaken,
  serviceScopeOf,
  snapshotCorporateLink,
  updateMockService,
  type PartnerStatus,
  type RescueServiceFormPayload,
  type RescueServiceType,
  type ServiceCategory,
  type ServiceScope,
  type ServiceUnit,
} from '../../data/rescueServiceMockData';
import {
  FieldLabel,
  SectionHeader,
  TagMultiSelect,
  ToggleChipGrid,
  inputClass,
  outlineBtnClass,
  primaryBtnClass,
  selectClass,
} from '../rescue-partner-admin/adminUi';

type FormMode = 'view' | 'edit' | 'create';

type FormState = {
  serviceCode: string;
  name: string;
  description: string;
  category: ServiceCategory | '';
  serviceType: RescueServiceType | '';
  unit: ServiceUnit | '';
  baseDurationMinutes: string;
  specialEquipment: string;
  supportVehicleTypes: string[];
  prefixServiceCode: string;
  status: PartnerStatus;
  scope: ServiceScope;
  corporateCustomerIds: string[];
};

const EMPTY_FORM: FormState = {
  serviceCode: '',
  name: '',
  description: '',
  category: 'RESCUE_SERVICE',
  serviceType: 'ONSITE',
  unit: 'TIMES',
  baseDurationMinutes: '30',
  specialEquipment: '',
  supportVehicleTypes: [],
  prefixServiceCode: 'RS1',
  status: 'active',
  scope: 'CATALOG',
  corporateCustomerIds: [],
};

const toPayload = (form: FormState): RescueServiceFormPayload => ({
  serviceCode: form.serviceCode,
  name: form.name,
  description: form.description,
  category: form.category,
  serviceType: form.serviceType,
  unit: (form.unit || 'TIMES') as ServiceUnit,
  baseDurationMinutes: form.baseDurationMinutes.trim() ? Number(form.baseDurationMinutes) : null,
  specialEquipment: form.specialEquipment.trim(),
  supportVehicleTypes: form.supportVehicleTypes,
  prefixServiceCode: form.prefixServiceCode.trim(),
  status: form.status,
  corporateCustomers:
    form.scope === 'INCIDENTAL'
      ? form.corporateCustomerIds.filter(Boolean).map((id) => snapshotCorporateLink(Number(id)))
      : [],
});

const RescueServiceForm: React.FC<{ mode: FormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existing = useMemo(() => (id ? getServiceById(id) : undefined), [id]);
  const readOnly = mode === 'view';

  const [form, setForm] = useState<FormState>(() => {
    if (!existing) return EMPTY_FORM;
    return {
      serviceCode: existing.serviceCode,
      name: existing.name,
      description: existing.description,
      category: existing.category,
      serviceType: existing.serviceType,
      unit: existing.unit,
      baseDurationMinutes: existing.baseDurationMinutes == null ? '' : String(existing.baseDurationMinutes),
      specialEquipment: existing.specialEquipment,
      supportVehicleTypes: existing.supportVehicleTypes,
      prefixServiceCode: existing.prefixServiceCode,
      status: existing.status,
      scope: serviceScopeOf(existing),
      corporateCustomerIds: existing.corporateCustomers.map((row) => String(row.corporateCustomerId)),
    };
  });
  const [error, setError] = useState('');

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const title =
    mode === 'create' ? 'Thêm mới dịch vụ cứu hộ' : mode === 'edit' ? 'Chỉnh sửa dịch vụ cứu hộ' : 'Xem chi tiết dịch vụ cứu hộ';

  const corporateOptions = useMemo(
    () => MOCK_CORPORATE_CUSTOMERS.map((c) => ({ value: String(c.id), label: `${c.code} — ${c.name}` })),
    [],
  );

  const handleScopeChange = (scope: ServiceScope) => {
    setForm((prev) => ({
      ...prev,
      scope,
      corporateCustomerIds: scope === 'CATALOG' ? [] : prev.corporateCustomerIds,
    }));
  };

  const handleSave = () => {
    if (!form.serviceCode.trim() || !form.name.trim()) {
      setError('Vui lòng nhập Mã dịch vụ và Tên dịch vụ.');
      return;
    }
    if (!form.unit) {
      setError('Vui lòng chọn Đơn vị tính.');
      return;
    }
    if (form.scope === 'INCIDENTAL' && form.corporateCustomerIds.length === 0) {
      setError('Dịch vụ phát sinh phải gắn ít nhất một doanh nghiệp.');
      return;
    }
    const duration = form.baseDurationMinutes.trim();
    if (duration && (!Number.isInteger(Number(duration)) || Number(duration) < 0)) {
      setError('Thời gian xử lý (phút) phải là số nguyên ≥ 0.');
      return;
    }
    if (isServiceCodeTaken(form.serviceCode, existing?.id)) {
      setError(`Mã dịch vụ "${form.serviceCode.trim()}" đã tồn tại.`);
      return;
    }

    const payload = toPayload(form);
    if (mode === 'create') {
      const created = createMockService(payload);
      navigate('/admin/rescue-services', {
        state: { notice: `Đã tạo dịch vụ ${created.name} (${created.serviceCode}).` },
      });
      return;
    }
    if (existing) {
      updateMockService(existing.id, payload);
      navigate('/admin/rescue-services', {
        state: { notice: `Đã cập nhật dịch vụ ${form.name.trim()}.` },
      });
    }
  };

  const actionButtons = (
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={() => navigate('/admin/rescue-services')} className={outlineBtnClass}>
        <X size={16} />
        <span>Đóng</span>
      </button>
      {mode === 'view' && existing && (
        <button
          type="button"
          onClick={() => navigate(`/admin/rescue-services/${existing.id}/edit`)}
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
        <p className="text-sm text-gray-500">Không tìm thấy dịch vụ cứu hộ.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/rescue-services')}
          className="text-vetc-green font-bold text-sm hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const disabled = readOnly;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight min-w-0">{title}</h1>
        {actionButtons}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin dịch vụ" icon={<Wrench size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <FieldLabel required>Mã dịch vụ</FieldLabel>
              <input
                className={inputClass}
                value={form.serviceCode}
                disabled={disabled || mode === 'edit'}
                placeholder="VD: KICH_BINH"
                onChange={(e) => update('serviceCode', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <FieldLabel required>Tên dịch vụ</FieldLabel>
              <input
                className={inputClass}
                value={form.name}
                disabled={disabled}
                placeholder="Nhập tên dịch vụ"
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Prefix mã</FieldLabel>
              <input
                className={inputClass}
                value={form.prefixServiceCode}
                disabled={disabled}
                placeholder="RS1"
                onChange={(e) => update('prefixServiceCode', e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              className="w-full min-w-0 box-border min-h-[72px] border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-600"
              value={form.description}
              disabled={disabled}
              placeholder="Mô tả quyền lợi / điều kiện hỗ trợ"
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <FieldLabel>Nhóm dịch vụ</FieldLabel>
              <select
                className={selectClass}
                value={form.category}
                disabled={disabled}
                onChange={(e) => update('category', e.target.value as ServiceCategory | '')}
              >
                <option value="">— Chọn —</option>
                {SERVICE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel>Loại dịch vụ</FieldLabel>
              <select
                className={selectClass}
                value={form.serviceType}
                disabled={disabled}
                onChange={(e) => update('serviceType', e.target.value as RescueServiceType | '')}
              >
                <option value="">— Chọn —</option>
                {RESCUE_SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel required>Đơn vị tính</FieldLabel>
              <select
                className={selectClass}
                value={form.unit}
                disabled={disabled}
                onChange={(e) => update('unit', e.target.value as ServiceUnit | '')}
              >
                <option value="">— Chọn —</option>
                {SERVICE_UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel>Thời gian xử lý (phút)</FieldLabel>
              <input
                className={inputClass}
                value={form.baseDurationMinutes}
                disabled={disabled}
                inputMode="numeric"
                placeholder="30"
                onChange={(e) => update('baseDurationMinutes', e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <FieldLabel>Thiết bị đặc biệt</FieldLabel>
              <input
                className={inputClass}
                value={form.specialEquipment}
                disabled={disabled}
                placeholder="Nếu có — vd. xe sàn trượt"
                onChange={(e) => update('specialEquipment', e.target.value)}
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
          </div>

          <div className="min-w-0">
            <FieldLabel>Loại xe hỗ trợ</FieldLabel>
            <ToggleChipGrid
              values={form.supportVehicleTypes}
              options={SUPPORT_VEHICLE_TYPE_OPTIONS}
              onChange={(values) => update('supportVehicleTypes', values)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0">
        <div className="overflow-hidden rounded-t-lg">
          <SectionHeader title="Phạm vi khai thác" icon={<Building2 size={16} />} />
        </div>
        <div className="p-4 space-y-4 overflow-visible">
          <p className="flex items-start gap-2 text-[12px] text-gray-500 leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
            <span>
              Catalog chung: không gắn DN. Phát sinh theo DN: chọn <span className="font-semibold">một hoặc nhiều</span>{' '}
              doanh nghiệp — dùng để lọc / tính phí phát sinh khi tạo đơn.
            </span>
          </p>
          <div className="max-w-md min-w-0">
            <FieldLabel required>Phạm vi</FieldLabel>
            <select
              className={selectClass}
              value={form.scope}
              disabled={disabled}
              onChange={(e) => handleScopeChange(e.target.value as ServiceScope)}
            >
              {SERVICE_SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {form.scope === 'INCIDENTAL' && (
            <div className="min-w-0">
              <FieldLabel required>Doanh nghiệp</FieldLabel>
              <TagMultiSelect
                values={form.corporateCustomerIds}
                options={corporateOptions}
                onChange={(values) => update('corporateCustomerIds', values)}
                placeholder="Chọn một hoặc nhiều doanh nghiệp"
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RescueServiceCreate = () => <RescueServiceForm mode="create" />;
export const RescueServiceView = () => <RescueServiceForm mode="view" />;
export const RescueServiceEdit = () => <RescueServiceForm mode="edit" />;

export default RescueServiceForm;
