import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, MapPin, User, Save, X, ArrowLeft } from 'lucide-react';
import { BusinessRecord, getBusinessById } from '../data/businessMockData';

type FormState = Omit<BusinessRecord, 'id' | 'updatedAt' | 'updatedBy' | 'createdAt' | 'createdBy'>;

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  address: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  taxId: '',
  customerGroup: 'OEM',
  customerType: 'B2B',
  parentEnterprise: null,
  customerTier: 'Tiêu chuẩn',
  status: 'active',
};

const BusinessForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const existing = useMemo(() => {
    if (!id) return undefined;
    return getBusinessById(Number(id));
  }, [id]);

  const [form, setForm] = useState<FormState>(() => {
    if (existing) {
      const { id: _id, updatedAt, updatedBy, createdAt, createdBy, ...rest } = existing;
      return rest;
    }
    return EMPTY_FORM;
  });

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

      {/* Thông tin doanh nghiệp — grid giống phần Tra cứu màn danh sách */}
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
              <label className={labelClass}>Hạng khách hàng</label>
              <select
                value={form.customerTier}
                onChange={(e) => updateField('customerTier', e.target.value as FormState['customerTier'])}
                className={`${inputClass} bg-white`}
              >
                <option value="Tiêu chuẩn">Tiêu chuẩn</option>
                <option value="VIP">VIP</option>
                <option value="Hợp đồng">Hợp đồng</option>
              </select>
            </div>
            <div className="min-w-0 sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Doanh nghiệp cha</label>
              <input
                type="text"
                value={form.parentEnterprise ?? ''}
                onChange={(e) => updateField('parentEnterprise', e.target.value || null)}
                placeholder="Nhập tên doanh nghiệp cha (nếu có)"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Địa chỉ" icon={<MapPin size={16} />} />
        <div className="p-4">
          <label className={labelClass}>Địa chỉ</label>
          <textarea
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Nhập địa chỉ doanh nghiệp"
            rows={3}
            className={`${inputClass} resize-y min-h-[80px]`}
          />
        </div>
      </div>

      {/* Liên hệ */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin liên hệ" icon={<User size={16} />} />
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className={labelClass}>Người liên hệ</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => updateField('contactName', e.target.value)}
                placeholder="Nhập tên người liên hệ"
                className={inputClass}
              />
            </div>
            <div className="min-w-0">
              <label className={labelClass}>Số điện thoại</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder="Nhập số điện thoại"
                className={inputClass}
              />
            </div>
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="Nhập email liên hệ"
                className={inputClass}
              />
            </div>
          </div>
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
