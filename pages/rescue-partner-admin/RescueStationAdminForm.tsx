import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Banknote, Car, Edit3, Inbox, KeyRound, Lock, MapPin, Pencil, Plus, RefreshCw, Save, Trash2, Unlock, User, Users, Wrench, X } from 'lucide-react';
import {
  ADMIN_PROVINCES,
  MOCK_RESCUE_PROVIDERS,
  SERVICE_TYPE_OPTIONS,
  STATION_CATEGORY_OPTIONS,
  STATION_STAFF_ROLE_LABEL,
  STATION_STAFF_ROLE_OPTIONS,
  STATION_VEHICLE_STATUS_LABEL,
  STATION_VEHICLE_STATUS_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  emptyStationContact,
  getStaffByStationId,
  getVehiclesByStationId,
  getWardsByProvince,
  getStationById,
  providerDisplayName,
  stationContactsOf,
  vehicleLabel,
  type PartnerStatus,
  type RescueStationAdminRecord,
  type StationCategory,
  type StationContact,
  type StationRescueVehicle,
  type StationStaffRecord,
  type StationStaffRole,
  type StationVehicleStatus,
} from '../../data/rescuePartnerAdminMockData';
import {
  AdminDialog,
  FieldLabel,
  SectionHeader,
  StatusBadge,
  ToggleChipGrid,
  dataTableClass,
  dataTableWrapClass,
  dataTdClass,
  dataThClass,
  dataTheadRowClass,
  dataTbodyRowClass,
  inputClass,
  outlineBtnClass,
  primaryBtnClass,
  selectClass,
} from './adminUi';
import MapSelectionModal from '../../shared/MapSelectionModal';

type FormMode = 'view' | 'edit' | 'create';
type StationTab = 'general' | 'staff' | 'vehicles';

type FormState = Omit<RescueStationAdminRecord, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'contacts'> & {
  contacts: StationContact[];
};

const MAX_CONTACTS = 2;

const ensureTwoContacts = (contacts: StationContact[]): StationContact[] => {
  const next = contacts.slice(0, MAX_CONTACTS);
  while (next.length < MAX_CONTACTS) next.push(emptyStationContact());
  return next;
};

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  providerId: '',
  providerCode: '',
  providerName: '',
  status: 'active',
  stationCategory: 'STORE',
  address: '',
  province: '',
  district: '',
  ward: '',
  specificAddress: '',
  longitude: '',
  latitude: '',
  contactName: '',
  contactPhone: '',
  otherPhone: '',
  email: '',
  contacts: ensureTwoContacts([]),
  bankAccount: '',
  accountName: '',
  bankName: '',
  taxCode: '',
  capacity: 1,
  services: [],
  vehicleTypes: [],
  userCount: 0,
  operatingAreas: [],
};

const formatCoordinate = (lat: string, lng: string): string => {
  const a = lat.trim();
  const b = lng.trim();
  if (!a && !b) return '';
  if (!b) return a;
  return `${a}, ${b}`;
};

const parseCoordinate = (raw: string): { latitude: string; longitude: string } => {
  const trimmed = raw.trim();
  if (!trimmed) return { latitude: '', longitude: '' };
  const comma = trimmed.indexOf(',');
  if (comma === -1) return { latitude: trimmed, longitude: '' };
  return {
    latitude: trimmed.slice(0, comma).trim(),
    longitude: trimmed.slice(comma + 1).trim(),
  };
};

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

const emptyStaff = (stationId: string): StationStaffRecord => ({
  id: newId('ss'),
  stationId,
  code: '',
  fullname: '',
  phone: '',
  role: 'RESCUE',
  status: 'active',
  hasAccount: true,
  accountLocked: false,
});

const emptyVehicle = (stationId: string): StationRescueVehicle => ({
  id: newId('sv'),
  stationId,
  plate: '',
  type: 'TOW_TRUCK',
  brand: '',
  model: '',
  chassis: '',
  maxRescueLoad: '',
  driverName: '',
  status: 'active',
});

const IconAction: React.FC<{
  title: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, className, onClick, children }) => (
  <button type="button" title={title} onClick={onClick} className={`p-1 rounded transition-colors ${className}`}>
    {children}
  </button>
);

const RescueStationAdminForm: React.FC<{ mode: FormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existing = useMemo(() => (id ? getStationById(id) : undefined), [id]);
  const readOnly = mode === 'view';
  const isViewMode = mode === 'view';
  const showTabs = isViewMode;

  const [form, setForm] = useState<FormState>(() => {
    if (!existing) return EMPTY_FORM;
    const { id: _id, createdAt, createdBy, updatedAt, updatedBy, contacts, ...rest } = existing;
    return { ...rest, contacts: ensureTwoContacts(stationContactsOf(existing)) };
  });
  const [error, setError] = useState('');
  const [tab, setTab] = useState<StationTab>('general');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [staffRows, setStaffRows] = useState<StationStaffRecord[]>(() =>
    existing ? getStaffByStationId(existing.id).map((s) => ({ ...s })) : [],
  );
  const [vehicleRows, setVehicleRows] = useState<StationRescueVehicle[]>(() =>
    existing ? getVehiclesByStationId(existing.id).map((v) => ({ ...v })) : [],
  );
  const [notice, setNotice] = useState('');
  const [staffDraft, setStaffDraft] = useState<StationStaffRecord | null>(null);
  const [staffEditingId, setStaffEditingId] = useState<string | null>(null);
  const [staffConfirm, setStaffConfirm] = useState<{ type: 'delete' | 'reset' | 'lock'; row: StationStaffRecord } | null>(null);
  const [vehicleDraft, setVehicleDraft] = useState<StationRescueVehicle | null>(null);
  const [vehicleEditingId, setVehicleEditingId] = useState<string | null>(null);
  const [vehicleConfirm, setVehicleConfirm] = useState<{ type: 'delete' | 'status'; row: StationRescueVehicle } | null>(null);
  const [vehicleStatusDraft, setVehicleStatusDraft] = useState<StationVehicleStatus>('active');

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const wards = useMemo(() => getWardsByProvince(form.province), [form.province]);
  const stationId = existing?.id ?? 'new';

  const title =
    mode === 'create' ? 'Thêm mới trạm cứu hộ' : mode === 'edit' ? 'Chỉnh sửa trạm cứu hộ' : 'Xem chi tiết điểm dịch vụ';

  const tabs: { id: StationTab; label: string }[] = [
    { id: 'general', label: 'Thông tin chung' },
    { id: 'staff', label: staffRows.length ? `Nhân viên (${staffRows.length})` : 'Nhân viên' },
    { id: 'vehicles', label: vehicleRows.length ? `Phương tiện cứu hộ (${vehicleRows.length})` : 'Phương tiện cứu hộ' },
  ];

  const handleProviderChange = (providerId: string) => {
    const provider = MOCK_RESCUE_PROVIDERS.find((p) => p.id === providerId);
    setForm((prev) => ({
      ...prev,
      providerId,
      providerCode: provider?.code ?? '',
      providerName: provider ? providerDisplayName(provider) : '',
    }));
  };

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2200);
  };

  const openCreateStaff = () => {
    setStaffEditingId(null);
    setStaffDraft(emptyStaff(stationId));
  };

  const openEditStaff = (row: StationStaffRecord) => {
    setStaffEditingId(row.id);
    setStaffDraft({ ...row });
  };

  const saveStaffDraft = () => {
    if (!staffDraft) return;
    if (!staffDraft.fullname.trim() || !staffDraft.phone.trim()) {
      setError('Vui lòng nhập Họ tên và SĐT nhân viên.');
      return;
    }
    const code = staffDraft.code.trim() || `NV-${String(staffRows.length + 1).padStart(4, '0')}`;
    const next = { ...staffDraft, code, stationId };
    if (staffEditingId) {
      setStaffRows((prev) => prev.map((s) => (s.id === staffEditingId ? next : s)));
      flash('Đã cập nhật nhân viên.');
    } else {
      setStaffRows((prev) => [...prev, next]);
      flash('Đã thêm nhân viên.');
    }
    setError('');
    setStaffDraft(null);
    setStaffEditingId(null);
  };

  const confirmStaffAction = () => {
    if (!staffConfirm) return;
    const { type, row } = staffConfirm;
    if (type === 'delete') {
      setStaffRows((prev) => prev.filter((s) => s.id !== row.id));
      flash('Đã xóa nhân viên.');
    } else if (type === 'reset') {
      flash(`Đã gửi reset mật khẩu cho ${row.fullname}.`);
    } else {
      setStaffRows((prev) =>
        prev.map((s) => (s.id === row.id ? { ...s, accountLocked: !s.accountLocked } : s)),
      );
      flash(row.accountLocked ? `Đã mở khóa tài khoản ${row.fullname}.` : `Đã khóa tài khoản ${row.fullname}.`);
    }
    setStaffConfirm(null);
  };

  const openCreateVehicle = () => {
    setVehicleEditingId(null);
    setVehicleDraft(emptyVehicle(stationId));
  };

  const openEditVehicle = (row: StationRescueVehicle) => {
    setVehicleEditingId(row.id);
    setVehicleDraft({ ...row });
  };

  const saveVehicleDraft = () => {
    if (!vehicleDraft) return;
    if (!vehicleDraft.plate.trim()) {
      setError('Vui lòng nhập biển số xe.');
      return;
    }
    const next = { ...vehicleDraft, stationId, plate: vehicleDraft.plate.trim() };
    if (vehicleEditingId) {
      setVehicleRows((prev) => prev.map((v) => (v.id === vehicleEditingId ? next : v)));
      flash('Đã cập nhật phương tiện.');
    } else {
      setVehicleRows((prev) => [...prev, next]);
      flash('Đã thêm phương tiện.');
    }
    setError('');
    setVehicleDraft(null);
    setVehicleEditingId(null);
  };

  const confirmVehicleAction = () => {
    if (!vehicleConfirm) return;
    const { type, row } = vehicleConfirm;
    if (type === 'delete') {
      setVehicleRows((prev) => prev.filter((v) => v.id !== row.id));
      flash('Đã xóa phương tiện.');
    } else {
      setVehicleRows((prev) => prev.map((v) => (v.id === row.id ? { ...v, status: vehicleStatusDraft } : v)));
      flash(`Đã cập nhật trạng thái ${row.plate}.`);
    }
    setVehicleConfirm(null);
  };

  const updateContact = (contactId: string, patch: Partial<StationContact>) => {
    update(
      'contacts',
      form.contacts.map((c) => (c.id === contactId ? { ...c, ...patch } : c)),
    );
  };

  const handleConfirmLocation = (address: string, coords: string) => {
    const parsed = parseCoordinate(coords);
    setForm((prev) => ({
      ...prev,
      specificAddress: address,
      address: address || prev.address,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    }));
    setIsMapModalOpen(false);
  };

  const handleSave = () => {
    const primary = form.contacts[0];
    if (!form.name.trim() || !form.providerId || !primary?.name.trim() || !primary?.phone.trim()) {
      setError('Vui lòng nhập Tên trạm, Đối tác cứu hộ, và ít nhất một Người liên hệ + SĐT.');
      setTab('general');
      return;
    }
    navigate('/admin/rescue-stations');
  };

  const actionButtons = (
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={() => navigate('/admin/rescue-stations')} className={outlineBtnClass}>
        <X size={16} />
        <span>Đóng</span>
      </button>
      {mode === 'view' && existing && (
        <button type="button" onClick={() => navigate(`/admin/rescue-stations/${existing.id}/edit`)} className={primaryBtnClass}>
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
        <p className="text-sm text-gray-500">Không tìm thấy trạm cứu hộ.</p>
        <button type="button" onClick={() => navigate('/admin/rescue-stations')} className="text-vetc-green font-bold text-sm hover:underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight min-w-0">{title}</h1>
        {actionButtons}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
      {notice && <p className="text-sm text-vetc-green bg-green-50 border border-green-100 rounded px-3 py-2">{notice}</p>}

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        {showTabs && (
          <div className="flex items-center overflow-x-auto border-b bg-gray-50/80">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  tab === item.id
                    ? 'border-vetc-green text-vetc-green bg-green-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {(!isViewMode || tab === 'general') && (
          <div className="space-y-4 bg-gray-50 p-4">
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin chung" icon={<MapPin size={16} />} />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="min-w-0">
            <FieldLabel required>Tên trạm</FieldLabel>
            <input
              className={inputClass}
              value={form.name}
              disabled={readOnly}
              placeholder="Nhập tên trạm cứu hộ"
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel required>Đối tác cứu hộ</FieldLabel>
            <select
              className={selectClass}
              value={form.providerId}
              disabled={readOnly}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              <option value="">-- Chọn đối tác cứu hộ --</option>
              {MOCK_RESCUE_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <FieldLabel>Phân loại trạm cứu hộ</FieldLabel>
            <select
              className={selectClass}
              value={form.stationCategory}
              disabled={readOnly}
              onChange={(e) => update('stationCategory', e.target.value as StationCategory)}
            >
              {STATION_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <FieldLabel>Địa chỉ cụ thể</FieldLabel>
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <input
                  className={inputClass}
                  value={form.specificAddress}
                  disabled={readOnly}
                  placeholder="Nhập địa chỉ chi tiết"
                  onChange={(e) => update('specificAddress', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="h-[34px] shrink-0 bg-vetc-green text-white px-3 rounded text-[11px] font-bold inline-flex items-center justify-center hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                title="Bản đồ"
              >
                <MapPin size={14} />
                <span>&nbsp;Bản đồ</span>
              </button>
            </div>
          </div>
          <div className="min-w-0">
            <FieldLabel>Tỉnh/TP</FieldLabel>
            <select
              className={selectClass}
              value={form.province}
              disabled={readOnly}
              onChange={(e) => {
                update('province', e.target.value);
                update('district', '');
                update('ward', '');
              }}
            >
              <option value="">-- Chọn Tỉnh/TP --</option>
              {ADMIN_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <FieldLabel>Xã/Phường</FieldLabel>
            <select
              className={selectClass}
              value={form.ward}
              disabled={readOnly || !form.province}
              onChange={(e) => update('ward', e.target.value)}
            >
              <option value="">-- Chọn Xã/Phường --</option>
              {wards.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0 flex flex-col">
        <SectionHeader title="Thông tin liên hệ" icon={<User size={16} />} />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          {form.contacts.map((contact, index) => (
            <React.Fragment key={contact.id}>
              <div className="min-w-0">
                <FieldLabel required={index === 0}>{index === 0 ? 'Tên' : 'Tên 2'}</FieldLabel>
                <input
                  className={inputClass}
                  value={contact.name}
                  disabled={readOnly}
                  placeholder={index === 0 ? 'Nhập họ tên người liên hệ' : 'Nhập họ tên liên hệ phụ'}
                  onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                />
              </div>
              <div className="min-w-0">
                <FieldLabel required={index === 0}>{index === 0 ? 'SĐT' : 'SĐT 2'}</FieldLabel>
                <input
                  className={inputClass}
                  value={contact.phone}
                  disabled={readOnly}
                  placeholder={index === 0 ? 'Nhập số điện thoại' : 'Nhập SĐT liên hệ phụ'}
                  onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0 flex flex-col">
        <SectionHeader title="Thông tin thanh toán" icon={<Banknote size={16} />} />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <div className="min-w-0">
            <FieldLabel>STK thụ hưởng</FieldLabel>
            <input
              className={inputClass}
              value={form.bankAccount}
              disabled={readOnly}
              placeholder="Nhập số tài khoản thụ hưởng"
              onChange={(e) => update('bankAccount', e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Tên tài khoản</FieldLabel>
            <input
              className={inputClass}
              value={form.accountName}
              disabled={readOnly}
              placeholder="Nhập tên chủ tài khoản"
              onChange={(e) => update('accountName', e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Ngân hàng thụ hưởng</FieldLabel>
            <input
              className={inputClass}
              value={form.bankName}
              disabled={readOnly}
              placeholder="Nhập tên ngân hàng"
              onChange={(e) => update('bankName', e.target.value)}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Mã số thuế</FieldLabel>
            <input
              className={inputClass}
              value={form.taxCode}
              disabled={readOnly}
              placeholder="Nhập mã số thuế"
              onChange={(e) => update('taxCode', e.target.value)}
            />
          </div>
        </div>
      </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
        <SectionHeader title="Thông tin dịch vụ" icon={<Wrench size={16} />} />
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="min-w-0">
              <FieldLabel>Sức chứa (đơn hàng)</FieldLabel>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.capacity}
                disabled={readOnly}
                placeholder="Nhập số đơn tối đa"
                onChange={(e) => update('capacity', Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="min-w-0">
            <FieldLabel>Dịch vụ cung cấp</FieldLabel>
            <ToggleChipGrid
              values={form.services}
              options={SERVICE_TYPE_OPTIONS}
              onChange={(values) => update('services', values)}
              disabled={readOnly}
            />
          </div>
          <div className="min-w-0">
            <FieldLabel>Loại xe hỗ trợ</FieldLabel>
            <ToggleChipGrid
              values={form.vehicleTypes}
              options={VEHICLE_TYPE_OPTIONS}
              onChange={(values) => update('vehicleTypes', values)}
              disabled={readOnly}
            />
          </div>
        </div>
      </div>
          </div>
        )}

        {isViewMode && tab === 'staff' && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Danh sách nhân viên" icon={<Users size={16} />} />
              <div className="p-4 space-y-3">
                <div className="flex justify-end">
                  <button type="button" onClick={openCreateStaff} className={primaryBtnClass}>
                    <Plus size={16} />
                    <span>Thêm nhân viên</span>
                  </button>
                </div>
                <div className={dataTableWrapClass}>
                  <table className={dataTableClass}>
                    <thead>
                      <tr className={dataTheadRowClass}>
                        <th className={`${dataThClass('center')} w-10`}>STT</th>
                        <th className={`${dataThClass('center')} w-40`}>Thao tác</th>
                        <th className={`${dataThClass('left')} w-28`}>Mã NV</th>
                        <th className={dataThClass('left')}>Họ tên</th>
                        <th className={dataThClass('left')}>SĐT</th>
                        <th className={dataThClass('left')}>Vai trò</th>
                        <th className={`${dataThClass('center')} w-32`}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffRows.map((s, index) => (
                        <tr key={s.id} className={dataTbodyRowClass}>
                          <td className={`${dataTdClass('center')} font-medium`}>{index + 1}</td>
                          <td className={dataTdClass('center')}>
                            <div className="flex items-center justify-center gap-1">
                              <IconAction title="Chỉnh sửa" className="text-blue-500 hover:bg-blue-50" onClick={() => openEditStaff(s)}>
                                <Edit3 size={15} />
                              </IconAction>
                              <IconAction title="Xóa" className="text-red-500 hover:bg-red-50" onClick={() => setStaffConfirm({ type: 'delete', row: s })}>
                                <Trash2 size={15} />
                              </IconAction>
                              {s.hasAccount && (
                                <IconAction title="Reset mật khẩu" className="text-blue-600 hover:bg-blue-50" onClick={() => setStaffConfirm({ type: 'reset', row: s })}>
                                  <KeyRound size={15} />
                                </IconAction>
                              )}
                              {s.hasAccount && !s.accountLocked && (
                                <IconAction title="Khóa tài khoản" className="text-red-500 hover:bg-red-50" onClick={() => setStaffConfirm({ type: 'lock', row: s })}>
                                  <Lock size={15} />
                                </IconAction>
                              )}
                              {s.hasAccount && s.accountLocked && (
                                <IconAction title="Mở khóa tài khoản" className="text-emerald-600 hover:bg-emerald-50" onClick={() => setStaffConfirm({ type: 'lock', row: s })}>
                                  <Unlock size={15} />
                                </IconAction>
                              )}
                            </div>
                          </td>
                          <td className={`${dataTdClass('left')} font-bold text-gray-800`}>{s.code}</td>
                          <td className={dataTdClass('left')}>{s.fullname}</td>
                          <td className={dataTdClass('left')}>{s.phone}</td>
                          <td className={dataTdClass('left')}>{STATION_STAFF_ROLE_LABEL[s.role]}</td>
                          <td className={dataTdClass('center')}>
                            <StatusBadge status={s.status} />
                          </td>
                        </tr>
                      ))}
                      {staffRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className={`${dataTdClass('center')} py-10 text-gray-400`}>
                            <div className="flex flex-col items-center gap-2">
                              <Inbox size={28} className="text-gray-300" />
                              <span>Chưa gắn nhân viên</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {isViewMode && tab === 'vehicles' && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Phương tiện cứu hộ" icon={<Car size={16} />} />
              <div className="p-4 space-y-3">
                <div className="flex justify-end">
                  <button type="button" onClick={openCreateVehicle} className={primaryBtnClass}>
                    <Plus size={16} />
                    <span>Thêm phương tiện</span>
                  </button>
                </div>
                <div className={dataTableWrapClass}>
                  <table className={dataTableClass}>
                    <thead>
                      <tr className={dataTheadRowClass}>
                        <th className={`${dataThClass('center')} w-10`}>STT</th>
                        <th className={`${dataThClass('center')} w-32`}>Thao tác</th>
                        <th className={`${dataThClass('left')} w-28`}>Biển số</th>
                        <th className={dataThClass('left')}>Loại xe</th>
                        <th className={dataThClass('left')}>Hãng xe</th>
                        <th className={dataThClass('left')}>Dòng xe</th>
                        <th className={dataThClass('left')}>Số khung</th>
                        <th className={dataThClass('left')}>Trọng tải cứu hộ tối đa</th>
                        <th className={dataThClass('left')}>Tài xế phụ trách</th>
                        <th className={`${dataThClass('center')} w-28`}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleRows.map((v, index) => (
                        <tr key={v.id} className={dataTbodyRowClass}>
                          <td className={`${dataTdClass('center')} font-medium`}>{index + 1}</td>
                          <td className={dataTdClass('center')}>
                            <div className="flex items-center justify-center gap-1">
                              <IconAction title="Chỉnh sửa" className="text-blue-500 hover:bg-blue-50" onClick={() => openEditVehicle(v)}>
                                <Edit3 size={15} />
                              </IconAction>
                              <IconAction title="Xóa" className="text-red-500 hover:bg-red-50" onClick={() => setVehicleConfirm({ type: 'delete', row: v })}>
                                <Trash2 size={15} />
                              </IconAction>
                              <IconAction
                                title="Cập nhật trạng thái"
                                className="text-amber-600 hover:bg-amber-50"
                                onClick={() => {
                                  setVehicleStatusDraft(v.status);
                                  setVehicleConfirm({ type: 'status', row: v });
                                }}
                              >
                                <RefreshCw size={15} />
                              </IconAction>
                            </div>
                          </td>
                          <td className={`${dataTdClass('left')} font-bold text-gray-800`}>{v.plate}</td>
                          <td className={dataTdClass('left')}>{vehicleLabel(v.type)}</td>
                          <td className={dataTdClass('left')}>{v.brand}</td>
                          <td className={dataTdClass('left')}>{v.model}</td>
                          <td className={dataTdClass('left')}>{v.chassis}</td>
                          <td className={dataTdClass('left')}>{v.maxRescueLoad}</td>
                          <td className={dataTdClass('left')}>{v.driverName}</td>
                          <td className={dataTdClass('center')}>
                            <span
                              className={`font-bold ${
                                v.status === 'active'
                                  ? 'text-vetc-green'
                                  : v.status === 'repair'
                                    ? 'text-amber-600'
                                    : 'text-gray-500'
                              }`}
                            >
                              {STATION_VEHICLE_STATUS_LABEL[v.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {vehicleRows.length === 0 && (
                        <tr>
                          <td colSpan={10} className={`${dataTdClass('center')} py-10 text-gray-400`}>
                            <div className="flex flex-col items-center gap-2">
                              <Inbox size={28} className="text-gray-300" />
                              <span>Chưa gắn phương tiện cứu hộ</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminDialog
        open={!!staffDraft}
        title={staffEditingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}
        onClose={() => setStaffDraft(null)}
        footer={(
          <>
            <button type="button" onClick={() => setStaffDraft(null)} className={outlineBtnClass}>Hủy</button>
            <button type="button" onClick={saveStaffDraft} className={primaryBtnClass}>Lưu</button>
          </>
        )}
      >
        {staffDraft && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <FieldLabel>Mã NV</FieldLabel>
              <input
                className={inputClass}
                value={staffDraft.code}
                placeholder="Hệ thống tự sinh nếu để trống"
                onChange={(e) => setStaffDraft({ ...staffDraft, code: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel required>Họ tên</FieldLabel>
              <input
                className={inputClass}
                value={staffDraft.fullname}
                placeholder="Nhập họ tên nhân viên"
                onChange={(e) => setStaffDraft({ ...staffDraft, fullname: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel required>SĐT</FieldLabel>
              <input
                className={inputClass}
                value={staffDraft.phone}
                placeholder="Nhập số điện thoại"
                onChange={(e) => setStaffDraft({ ...staffDraft, phone: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Vai trò</FieldLabel>
              <select
                className={selectClass}
                value={staffDraft.role}
                onChange={(e) => setStaffDraft({ ...staffDraft, role: e.target.value as StationStaffRole })}
              >
                {STATION_STAFF_ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel>Trạng thái</FieldLabel>
              <select
                className={selectClass}
                value={staffDraft.status}
                onChange={(e) => setStaffDraft({ ...staffDraft, status: e.target.value as PartnerStatus })}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        )}
      </AdminDialog>

      <AdminDialog
        open={!!staffConfirm}
        title={
          staffConfirm?.type === 'delete'
            ? 'Xóa nhân viên'
            : staffConfirm?.type === 'reset'
              ? 'Reset mật khẩu'
              : staffConfirm?.row.accountLocked
                ? 'Mở khóa tài khoản'
                : 'Khóa tài khoản'
        }
        onClose={() => setStaffConfirm(null)}
        footer={(
          <>
            <button type="button" onClick={() => setStaffConfirm(null)} className={outlineBtnClass}>Hủy</button>
            <button type="button" onClick={confirmStaffAction} className={primaryBtnClass}>Xác nhận</button>
          </>
        )}
      >
        <p className="text-sm text-gray-700">
          {staffConfirm?.type === 'delete' && `Xóa nhân viên ${staffConfirm.row.fullname}?`}
          {staffConfirm?.type === 'reset' && `Gửi reset mật khẩu cho ${staffConfirm.row.fullname}?`}
          {staffConfirm?.type === 'lock' &&
            (staffConfirm.row.accountLocked
              ? `Mở khóa tài khoản ${staffConfirm.row.fullname}?`
              : `Khóa tài khoản ${staffConfirm.row.fullname}? Người dùng sẽ không đăng nhập được đến khi mở khóa.`)}
        </p>
      </AdminDialog>

      <AdminDialog
        open={!!vehicleDraft}
        title={vehicleEditingId ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện'}
        onClose={() => setVehicleDraft(null)}
        footer={(
          <>
            <button type="button" onClick={() => setVehicleDraft(null)} className={outlineBtnClass}>Hủy</button>
            <button type="button" onClick={saveVehicleDraft} className={primaryBtnClass}>Lưu</button>
          </>
        )}
      >
        {vehicleDraft && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <FieldLabel required>Biển số</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.plate}
                placeholder="Nhập biển số xe"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, plate: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Loại xe</FieldLabel>
              <select className={selectClass} value={vehicleDraft.type} onChange={(e) => setVehicleDraft({ ...vehicleDraft, type: e.target.value })}>
                {VEHICLE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <FieldLabel>Hãng xe</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.brand}
                placeholder="Nhập hãng xe"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, brand: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Dòng xe</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.model}
                placeholder="Nhập dòng xe"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, model: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Số khung</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.chassis}
                placeholder="Nhập số khung (VIN)"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, chassis: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Trọng tải cứu hộ tối đa</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.maxRescueLoad}
                placeholder="VD: 5 tấn"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, maxRescueLoad: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Tài xế phụ trách</FieldLabel>
              <input
                className={inputClass}
                value={vehicleDraft.driverName}
                placeholder="Nhập họ tên tài xế"
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, driverName: e.target.value })}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel>Trạng thái</FieldLabel>
              <select
                className={selectClass}
                value={vehicleDraft.status}
                onChange={(e) => setVehicleDraft({ ...vehicleDraft, status: e.target.value as StationVehicleStatus })}
              >
                {STATION_VEHICLE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </AdminDialog>

      <AdminDialog
        open={!!vehicleConfirm}
        title={vehicleConfirm?.type === 'delete' ? 'Xóa phương tiện' : 'Cập nhật trạng thái'}
        onClose={() => setVehicleConfirm(null)}
        footer={(
          <>
            <button type="button" onClick={() => setVehicleConfirm(null)} className={outlineBtnClass}>Hủy</button>
            <button type="button" onClick={confirmVehicleAction} className={primaryBtnClass}>Xác nhận</button>
          </>
        )}
      >
        {vehicleConfirm?.type === 'delete' && (
          <p className="text-sm text-gray-700">Xóa phương tiện {vehicleConfirm.row.plate}?</p>
        )}
        {vehicleConfirm?.type === 'status' && (
          <div>
            <FieldLabel>Trạng thái</FieldLabel>
            <select className={selectClass} value={vehicleStatusDraft} onChange={(e) => setVehicleStatusDraft(e.target.value as StationVehicleStatus)}>
              {STATION_VEHICLE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </AdminDialog>

      <MapSelectionModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={readOnly ? () => setIsMapModalOpen(false) : handleConfirmLocation}
        initialAddress={form.specificAddress || form.address}
        initialCoords={formatCoordinate(form.latitude, form.longitude)}
        title="Chọn vị trí trạm cứu hộ"
        pinLabel="Vị trí trạm tại đây"
        overlayClassName="z-[120]"
      />
    </div>
  );
};

export const RescueStationAdminCreate = () => <RescueStationAdminForm mode="create" />;
export const RescueStationAdminView = () => <RescueStationAdminForm mode="view" />;
export const RescueStationAdminEdit = () => <RescueStationAdminForm mode="edit" />;

export default RescueStationAdminForm;
