import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  User,
  Save,
  X,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Info,
} from 'lucide-react';
import { BusinessRecord, getBusinessById, getParentEnterpriseOptions } from '../data/businessMockData';
import { PROVINCES, getWardsByProvince } from '../data/businessLocationData';

type FormState = Omit<BusinessRecord, 'id' | 'updatedAt' | 'updatedBy' | 'createdAt' | 'createdBy'>;

interface BusinessContract {
  id: number;
  code: string;
  status: string;
  signedAt: string;
  packageType: string;
  quantity: number;
  value: string;
  effectiveDate: string;
  expiryDate: string;
  attachmentName: string;
}

const EMPTY_CONTRACT = (): BusinessContract => ({
  id: Date.now(),
  code: '',
  status: '',
  signedAt: '',
  packageType: '',
  quantity: 0,
  value: '',
  effectiveDate: '',
  expiryDate: '',
  attachmentName: '',
});

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  address: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  reconciliationContactName: '',
  reconciliationContactPhone: '',
  reconciliationContactEmail: '',
  taxId: '',
  customerGroup: 'OEM',
  customerType: 'B2B',
  parentEnterprise: null,
  customerTier: 'Tiêu chuẩn',
  rescueOrderCustomerTier: 'Tiêu chuẩn',
  status: 'active',
};

const CUSTOMER_TIER_OPTIONS = ['Tiêu chuẩn', 'VIP', 'Hợp đồng'] as const;

const subSectionClass = 'border-t border-gray-100 pt-4 space-y-4';
const subSectionTitleClass = 'text-xs font-bold text-gray-500 uppercase tracking-wide';

const FormSubSection: React.FC<{ title: string; children: React.ReactNode; bordered?: boolean }> = ({
  title,
  children,
  bordered = true,
}) => (
  <div className={bordered ? subSectionClass : 'space-y-4 pb-4'}>
    <h3 className={subSectionTitleClass}>{title}</h3>
    {children}
  </div>
);

const ContactFields: React.FC<{
  title: string;
  name: string;
  phone: string;
  email: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  inputClass: string;
  labelClass: string;
  bordered?: boolean;
}> = ({
  title,
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  inputClass,
  labelClass,
  bordered = true,
}) => (
  <FormSubSection title={title} bordered={bordered}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="min-w-0">
        <label className={labelClass}>Người liên hệ</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nhập tên người liên hệ"
          className={inputClass}
        />
      </div>
      <div className="min-w-0">
        <label className={labelClass}>Số điện thoại</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Nhập số điện thoại"
          className={inputClass}
        />
      </div>
      <div className="min-w-0">
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Nhập email liên hệ"
          className={inputClass}
        />
      </div>
    </div>
  </FormSubSection>
);

const BusinessForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const existing = useMemo(() => {
    if (!id) return undefined;
    return getBusinessById(Number(id));
  }, [id]);

  const parentOptions = useMemo(
    () => getParentEnterpriseOptions(isEdit ? Number(id) : undefined),
    [isEdit, id],
  );

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      const { id: _id, updatedAt, updatedBy, createdAt, createdBy, ...rest } = existing;
      return rest;
    }
    return EMPTY_FORM;
  });

  const [province, setProvince] = useState(() => {
    const address = existing?.address ?? '';
    return PROVINCES.find((p) => address.includes(p)) ?? '';
  });
  const [ward, setWard] = useState(() => {
    const address = existing?.address ?? '';
    const matchedProvince = PROVINCES.find((p) => address.includes(p)) ?? '';
    if (!matchedProvince) return '';
    return getWardsByProvince(matchedProvince).find((w) => address.includes(w)) ?? '';
  });

  const wardOptions = useMemo(() => getWardsByProvince(province), [province]);

  const [contracts, setContracts] = useState<BusinessContract[]>(() =>
    isEdit
      ? [
          {
            id: 1,
            code: 'HD-2025-001',
            status: 'active',
            signedAt: '2025-01-15T09:00',
            packageType: 'Gói cơ bản',
            quantity: 100,
            value: '500000000',
            effectiveDate: '2025-01-15T00:00',
            expiryDate: '2026-01-14T23:59',
            attachmentName: '',
          },
        ]
      : [],
  );

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateContract = <K extends keyof BusinessContract>(contractId: number, field: K, value: BusinessContract[K]) => {
    setContracts((prev) => prev.map((c) => (c.id === contractId ? { ...c, [field]: value } : c)));
  };

  const addContract = () => {
    setContracts((prev) => [...prev, EMPTY_CONTRACT()]);
  };

  const removeContract = (contractId: number) => {
    setContracts((prev) => prev.filter((c) => c.id !== contractId));
  };

  const inputClass =
    'w-full min-w-0 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span className="min-w-0">{title}</span>
    </div>
  );

  const handleCancel = () => navigate('/business-management');

  const handleSave = () => {
    navigate('/business-management');
  };

  if (isEdit && !existing) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0">
        <p className="text-sm text-gray-500">Không tìm thấy doanh nghiệp.</p>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center space-x-2 text-vetc-green font-bold text-sm hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Quay lại danh sách</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight min-w-0">
          {isEdit ? 'Chỉnh sửa doanh nghiệp' : 'Thêm mới doanh nghiệp'}
        </h1>
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center self-start sm:self-auto space-x-2 text-gray-500 hover:text-vetc-green text-sm font-bold transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>

      {/* Thông tin doanh nghiệp */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin doanh nghiệp" icon={<Building2 size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <label className={labelClass}>
                Mã doanh nghiệp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => updateField('code', e.target.value)}
                placeholder="Nhập mã doanh nghiệp"
                className={inputClass}
                disabled={isEdit}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>
                Tên doanh nghiệp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nhập tên doanh nghiệp"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>
                Mã số thuế <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => updateField('taxId', e.target.value)}
                placeholder="Nhập mã số thuế"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as FormState['status'])}
                className={`${inputClass} bg-white`}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Nhóm khách hàng</label>
              <select
                value={form.customerGroup}
                onChange={(e) => updateField('customerGroup', e.target.value as FormState['customerGroup'])}
                className={`${inputClass} bg-white`}
              >
                <option value="OEM">OEM</option>
                <option value="Tài chính">Tài chính</option>
                <option value="Bảo hiểm">Bảo hiểm</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Loại khách hàng</label>
              <select
                value={form.customerType}
                onChange={(e) => updateField('customerType', e.target.value as FormState['customerType'])}
                className={`${inputClass} bg-white`}
              >
                <option value="B2B">B2B</option>
                <option value="Phân phối">Phân phối</option>
                <option value="Chiến lược">Chiến lược</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Hạng khách hàng (Gói cứu hộ)</label>
              <select
                value={form.customerTier}
                onChange={(e) => updateField('customerTier', e.target.value as FormState['customerTier'])}
                className={`${inputClass} bg-white`}
              >
                {CUSTOMER_TIER_OPTIONS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Hạng khách hàng (Đơn cứu hộ)</label>
              <select
                value={form.rescueOrderCustomerTier}
                onChange={(e) =>
                  updateField('rescueOrderCustomerTier', e.target.value as FormState['rescueOrderCustomerTier'])
                }
                className={`${inputClass} bg-white`}
              >
                {CUSTOMER_TIER_OPTIONS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0 sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Doanh nghiệp cha</label>
              <select
                value={form.parentEnterprise ?? ''}
                onChange={(e) => updateField('parentEnterprise', e.target.value || null)}
                className={`${inputClass} bg-white`}
              >
                <option value="">-- Chọn doanh nghiệp cha --</option>
                {form.parentEnterprise &&
                  !parentOptions.some((b) => b.name === form.parentEnterprise) && (
                    <option value={form.parentEnterprise}>{form.parentEnterprise}</option>
                  )}
                {parentOptions.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.code} · {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormSubSection title="Địa chỉ">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="min-w-0">
                <label className={labelClass}>Tỉnh / TP</label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setWard('');
                  }}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">-- Chọn Tỉnh/TP --</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0">
                <label className={labelClass}>Phường / Xã</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={!province}
                  className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wardOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 lg:col-span-2">
                <label className={labelClass}>Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Số nhà, đường, tòa nhà..."
                  className={inputClass}
                />
              </div>
            </div>
          </FormSubSection>
        </div>
      </div>

      {/* Liên hệ — Quản lý & Đối soát */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin liên hệ" icon={<User size={16} />} />
        <div className="p-4">
          <ContactFields
            bordered={false}
            title="Quản lý"
            name={form.contactName}
            phone={form.contactPhone}
            email={form.contactEmail}
            onNameChange={(v) => updateField('contactName', v)}
            onPhoneChange={(v) => updateField('contactPhone', v)}
            onEmailChange={(v) => updateField('contactEmail', v)}
            inputClass={inputClass}
            labelClass={labelClass}
          />
          <ContactFields
            title="Đối soát"
            name={form.reconciliationContactName}
            phone={form.reconciliationContactPhone}
            email={form.reconciliationContactEmail}
            onNameChange={(v) => updateField('reconciliationContactName', v)}
            onPhoneChange={(v) => updateField('reconciliationContactPhone', v)}
            onEmailChange={(v) => updateField('reconciliationContactEmail', v)}
            inputClass={inputClass}
            labelClass={labelClass}
          />
        </div>
      </div>

      {/* Danh sách hợp đồng */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <div className="bg-vetc-green text-white px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-sm uppercase tracking-wide min-w-0">
            <Info size={16} className="shrink-0" />
            <span>Danh sách hợp đồng</span>
          </div>
          <button
            type="button"
            onClick={addContract}
            className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Thêm hợp đồng</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {contracts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có hợp đồng. Nhấn &quot;Thêm hợp đồng&quot; để bổ sung.</p>
          )}

          {contracts.map((contract, index) => (
            <div key={contract.id} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50/50">
              <div className="flex items-center justify-between gap-3">
                <h3 className={subSectionTitleClass}>Hợp đồng {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeContract(contract.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Xóa hợp đồng"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <label className={labelClass}>
                    Mã hợp đồng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contract.code}
                    onChange={(e) => updateContract(contract.id, 'code', e.target.value)}
                    placeholder="Nhập mã hợp đồng"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={contract.status}
                    onChange={(e) => updateContract(contract.id, 'status', e.target.value)}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Hiệu lực</option>
                    <option value="pending">Chờ ký</option>
                    <option value="expired">Hết hạn</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Ngày ký HĐ</label>
                  <input
                    type="datetime-local"
                    value={contract.signedAt}
                    onChange={(e) => updateContract(contract.id, 'signedAt', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Loại gói RSA</label>
                  <select
                    value={contract.packageType}
                    onChange={(e) => updateContract(contract.id, 'packageType', e.target.value)}
                    className={`${inputClass} bg-white`}
                  >
                    <option value="">Chọn loại gói</option>
                    <option value="Gói cơ bản">Gói cơ bản</option>
                    <option value="Gói nâng cao">Gói nâng cao</option>
                    <option value="Gói VIP">Gói VIP</option>
                    <option value="Gói tùy chỉnh">Gói tùy chỉnh</option>
                  </select>
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Số lượng</label>
                  <input
                    type="number"
                    min={0}
                    value={contract.quantity}
                    onChange={(e) => updateContract(contract.id, 'quantity', Number(e.target.value) || 0)}
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>
                    Giá trị hợp đồng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contract.value}
                    onChange={(e) => updateContract(contract.id, 'value', e.target.value)}
                    placeholder="Nhập giá trị hợp đồng"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Ngày hiệu lực</label>
                  <input
                    type="datetime-local"
                    value={contract.effectiveDate}
                    onChange={(e) => updateContract(contract.id, 'effectiveDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Ngày hết hạn</label>
                  <input
                    type="datetime-local"
                    value={contract.expiryDate}
                    onChange={(e) => updateContract(contract.id, 'expiryDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Khác</label>
                  <label className="inline-flex items-center space-x-2 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white hover:border-vetc-green hover:text-vetc-green cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        updateContract(contract.id, 'attachmentName', file?.name ?? '');
                      }}
                    />
                  </label>
                  {contract.attachmentName && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{contract.attachmentName}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit info — chỉ hiện khi edit */}
      {isEdit && existing && (
        <div className="border rounded-lg shadow-sm overflow-hidden bg-gray-50 w-full min-w-0">
          <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide border-b bg-gray-100">
            Thông tin hệ thống
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <span className="text-gray-400 text-xs block mb-0.5">Ngày tạo</span>
              <span className="text-gray-700 text-sm break-words">{existing.createdAt}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 text-xs block mb-0.5">Người tạo</span>
              <span className="text-gray-700 text-sm break-words">{existing.createdBy}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 text-xs block mb-0.5">Ngày cập nhật</span>
              <span className="text-gray-700 text-sm break-words">{existing.updatedAt}</span>
            </div>
            <div className="min-w-0">
              <span className="text-gray-400 text-xs block mb-0.5">Người cập nhật</span>
              <span className="text-gray-700 text-sm break-words">{existing.updatedBy}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded font-bold text-sm hover:border-vetc-green hover:text-vetc-green transition-all"
        >
          <X size={16} />
          <span>Hủy</span>
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
        >
          <Save size={16} />
          <span>{isEdit ? 'Lưu thay đổi' : 'Tạo mới'}</span>
        </button>
      </div>
    </div>
  );
};

export default BusinessForm;
