import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Building2, Check, Copy, Edit3, Eye, FileText, MapPin, Pencil, Save, User, Wrench, X } from 'lucide-react';
import {
  ADMIN_PROVINCES,
  PROVIDER_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  getProviderById,
  getStaffByStationId,
  getStationsByProviderId,
  getVehiclesByStationId,
  getWardsByProvince,
  stationContactsOf,
  type ProviderType,
  type RescueProviderRecord,
} from '../../data/rescuePartnerAdminMockData';
import {
  FieldLabel,
  SectionHeader,
  StatusBadge,
  ToggleChipGrid,
  dataTableClass,
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
type ProviderTab = 'general' | 'stations';

type FormState = Omit<
  RescueProviderRecord,
  'id' | 'stationCount' | 'userCount' | 'avgRating' | 'avgResponseTime' | 'totalOrders' | 'completedOrders' | 'cancelledOrders' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
> & {
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: FormState = {
  code: '',
  name: '',
  type: 'THIRD_PARTY',
  status: 'active',
  companyName: '',
  taxCode: '',
  businessLicense: '',
  charterCapital: '',
  address: '',
  province: '',
  district: '',
  ward: '',
  specificAddress: '',
  latitude: '',
  longitude: '',
  serviceTypes: [],
  contactName: '',
  contactPhone: '',
  otherPhone: '',
  email: '',
  contractNumber: '',
  contractSignedAt: '',
  contractStaff: '',
  contractStaffId: '',
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

const RescueProviderForm: React.FC<{ mode: FormMode }> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const existing = useMemo(() => (id ? getProviderById(id) : undefined), [id]);
  const readOnly = mode === 'view';

  const [form, setForm] = useState<FormState>(() => {
    if (!existing) return EMPTY_FORM;
    const {
      id: _id,
      stationCount,
      userCount,
      avgRating,
      avgResponseTime,
      totalOrders,
      completedOrders,
      cancelledOrders,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      ...rest
    } = existing;
    return { ...rest, latitude: '', longitude: '' };
  });
  const [error, setError] = useState('');
  const [tab, setTab] = useState<ProviderTab>('general');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const wards = useMemo(() => getWardsByProvince(form.province), [form.province]);
  const providerStations = useMemo(
    () => (existing ? getStationsByProviderId(existing.id) : []),
    [existing],
  );
  const stats = useMemo(() => {
    const vehicleCount = providerStations.reduce((sum, s) => sum + getVehiclesByStationId(s.id).length, 0);
    const staffCount = providerStations.reduce((sum, s) => sum + getStaffByStationId(s.id).length, 0);
    const completed = existing?.completedOrders ?? 0;
    return {
      stationCount: providerStations.length,
      vehicleCount,
      staffCount,
      completedOrders: completed,
      successfulQuotes: existing ? Math.max(completed, existing.totalOrders - existing.cancelledOrders) : 0,
    };
  }, [existing, providerStations]);

  const title =
    mode === 'create' ? 'Thêm mới NCC dịch vụ' : mode === 'edit' ? 'Chỉnh sửa NCC dịch vụ' : 'Xem chi tiết NCC dịch vụ';

  const tabs: { id: ProviderTab; label: string }[] = [
    { id: 'general', label: 'Thông tin chung' },
    { id: 'stations', label: stats.stationCount ? `Danh sách trạm cứu hộ (${stats.stationCount})` : 'Danh sách trạm cứu hộ' },
  ];

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

  const coordText = formatCoordinate(form.latitude, form.longitude);

  const handleCoordChange = (raw: string) => {
    const parsed = parseCoordinate(raw);
    setForm((prev) => ({ ...prev, latitude: parsed.latitude, longitude: parsed.longitude }));
  };

  const handleCopyCoord = async () => {
    const text = coordText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.contactName.trim() || !form.contactPhone.trim()) {
      setError('Vui lòng nhập Tên NCC, Người liên hệ và SĐT liên hệ.');
      setTab('general');
      return;
    }
    navigate('/admin/rescue-providers');
  };

  const actionButtons = (
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={() => navigate('/admin/rescue-providers')} className={outlineBtnClass}>
        <X size={16} />
        <span>Đóng</span>
      </button>
      {mode === 'view' && existing && (
        <button type="button" onClick={() => navigate(`/admin/rescue-providers/${existing.id}/edit`)} className={primaryBtnClass}>
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
        <p className="text-sm text-gray-500">Không tìm thấy nhà cung cấp.</p>
        <button type="button" onClick={() => navigate('/admin/rescue-providers')} className="text-vetc-green font-bold text-sm hover:underline">
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

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
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

        {tab === 'general' && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Thông tin chung" icon={<Building2 size={16} />} />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <FieldLabel>Mã NCC dịch vụ</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.code}
                    disabled={readOnly || mode === 'edit'}
                    placeholder={mode === 'create' ? 'Hệ thống tự sinh sau khi lưu' : ''}
                    onChange={(e) => update('code', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel required>Tên NCC dịch vụ</FieldLabel>
                  <input className={inputClass} value={form.name} disabled={readOnly} onChange={(e) => update('name', e.target.value)} />
                </div>
                <div className="min-w-0">
                  <FieldLabel>Loại nhà cung cấp</FieldLabel>
                  <select
                    className={selectClass}
                    value={form.type}
                    disabled={readOnly}
                    onChange={(e) => update('type', e.target.value as ProviderType)}
                  >
                    {PROVIDER_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-0">
                  <FieldLabel>Tên công ty</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.companyName}
                    disabled={readOnly}
                    onChange={(e) => update('companyName', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel>Mã số thuế</FieldLabel>
                  <input className={inputClass} value={form.taxCode} disabled={readOnly} onChange={(e) => update('taxCode', e.target.value)} />
                </div>
                <div className="min-w-0">
                  <FieldLabel>GPKD</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.businessLicense}
                    disabled={readOnly}
                    onChange={(e) => update('businessLicense', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel>Vốn điều lệ</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.charterCapital}
                    disabled={readOnly}
                    onChange={(e) => update('charterCapital', e.target.value)}
                  />
                </div>
                <div className="min-w-0 sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <FieldLabel>Địa chỉ cụ thể</FieldLabel>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <input
                        className={inputClass}
                        value={form.specificAddress}
                        disabled={readOnly}
                        onChange={(e) => update('specificAddress', e.target.value)}
                      />
                    </div>
                    {mode === 'edit' && (
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="h-[34px] shrink-0 bg-vetc-green text-white px-3 rounded text-[11px] font-bold inline-flex items-center justify-center hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                        title="Bản đồ"
                      >
                        <MapPin size={14} />
                        <span>&nbsp;Bản đồ</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <FieldLabel>Tọa độ (vĩ độ, kinh độ)</FieldLabel>
                  <div className="flex items-center gap-1.5">
                    <input
                      className={inputClass}
                      value={coordText}
                      disabled={readOnly}
                      placeholder="Vĩ độ, kinh độ"
                      onChange={(e) => handleCoordChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleCopyCoord}
                      disabled={!coordText.trim()}
                      title={copied ? 'Đã copy' : 'Copy tọa độ'}
                      className="h-[34px] w-[34px] shrink-0 inline-flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {copied ? <Check size={15} className="text-vetc-green" /> : <Copy size={15} />}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full min-w-0">
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0 flex flex-col">
              <SectionHeader title="Thông tin liên hệ" icon={<User size={16} />} />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="min-w-0">
                  <FieldLabel required>Người liên hệ</FieldLabel>
                  <input className={inputClass} value={form.contactName} disabled={readOnly} onChange={(e) => update('contactName', e.target.value)} />
                </div>
                <div className="min-w-0">
                  <FieldLabel required>SĐT liên hệ</FieldLabel>
                  <input className={inputClass} value={form.contactPhone} disabled={readOnly} onChange={(e) => update('contactPhone', e.target.value)} />
                </div>
                <div className="min-w-0">
                  <FieldLabel>SĐT liên hệ khác</FieldLabel>
                  <input className={inputClass} value={form.otherPhone} disabled={readOnly} onChange={(e) => update('otherPhone', e.target.value)} />
                </div>
                <div className="min-w-0">
                  <FieldLabel>Email</FieldLabel>
                  <input className={inputClass} value={form.email} disabled={readOnly} onChange={(e) => update('email', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0 flex flex-col">
              <SectionHeader title="Thông tin hợp đồng" icon={<FileText size={16} />} />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div className="min-w-0">
                  <FieldLabel required>Số HĐ</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.contractNumber}
                    disabled={readOnly}
                    onChange={(e) => update('contractNumber', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel>Ngày ký</FieldLabel>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={form.contractSignedAt}
                    disabled={readOnly}
                    onChange={(e) => update('contractSignedAt', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel>NV ký HĐ</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.contractStaff}
                    disabled={readOnly}
                    onChange={(e) => update('contractStaff', e.target.value)}
                  />
                </div>
                <div className="min-w-0">
                  <FieldLabel>CCCD của NV ký HĐ</FieldLabel>
                  <input
                    className={inputClass}
                    value={form.contractStaffId}
                    disabled={readOnly}
                    onChange={(e) => update('contractStaffId', e.target.value)}
                  />
                </div>
              </div>
            </div>
            </div>

            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Loại hình dịch vụ" icon={<Wrench size={16} />} />
              <div className="p-4">
                <ToggleChipGrid
                  values={form.serviceTypes}
                  options={SERVICE_TYPE_OPTIONS}
                  onChange={(values) => update('serviceTypes', values)}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Thống kê" icon={<BarChart3 size={16} />} />
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatField
                  label="Số trạm cứu hộ"
                  value={String(stats.stationCount)}
                  onClick={() => setTab('stations')}
                />
                <StatField label="Số phương tiện cứu hộ" value={String(stats.vehicleCount)} />
                <StatField label="Số nhân viên" value={String(stats.staffCount)} />
                <StatField label="Số đơn cứu hộ hoàn thành" value={String(stats.completedOrders)} />
                <StatField label="Số lần báo giá thành công" value={String(stats.successfulQuotes)} />
              </div>
            </div>
          </div>
        )}

        {tab === 'stations' && (
          <div className="space-y-4 bg-gray-50 p-4">
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white w-full min-w-0">
              <SectionHeader title="Danh sách trạm cứu hộ" icon={<MapPin size={16} />} />
              <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
                <table className={`${dataTableClass} min-w-[1100px]`}>
                  <thead>
                    <tr className={dataTheadRowClass}>
                      <th className={`${dataThClass('center')} w-10`}>STT</th>
                      <th className={`${dataThClass('center')} w-24`}>Thao tác</th>
                      <th className={dataThClass('left')}>Trạm cứu hộ</th>
                      <th className={`${dataThClass('center')} w-20`}>SL user</th>
                      <th className={`${dataThClass('center')} w-20`}>SL xe</th>
                      <th className={dataThClass('left')}>Địa chỉ</th>
                      <th className={`${dataThClass('center')} w-28`}>Trạng thái</th>
                      <th className={dataThClass('left')}>Người liên hệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerStations.map((s, index) => {
                      const contacts = stationContactsOf(s);
                      const c1 = contacts[0];
                      const vehicleCount = getVehiclesByStationId(s.id).length;
                      return (
                        <tr key={s.id} className={dataTbodyRowClass}>
                          <td className={`${dataTdClass('center')} font-medium`}>{index + 1}</td>
                          <td className={dataTdClass('center')}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/rescue-stations/${s.id}/edit`)}
                                className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                                className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                          <td className={dataTdClass('left')}>
                            <div className="font-bold text-gray-800">{s.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{s.code}</div>
                          </td>
                          <td className={dataTdClass('center')}>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              {s.userCount}
                            </button>
                          </td>
                          <td className={dataTdClass('center')}>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/rescue-stations/${s.id}`)}
                              className="text-blue-600 font-bold hover:underline"
                            >
                              {vehicleCount}
                            </button>
                          </td>
                          <td className={`${dataTdClass('left')} text-gray-600 leading-relaxed`}>{s.address}</td>
                          <td className={dataTdClass('center')}>
                            <StatusBadge status={s.status} />
                          </td>
                          <td className={dataTdClass('left')}>
                            {c1?.name || c1?.phone ? (
                              <>
                                <div className="font-bold text-gray-800">{c1.name || '—'}</div>
                                <div className="text-[10px] text-gray-500 whitespace-nowrap">{c1.phone || '—'}</div>
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {providerStations.length === 0 && (
                      <tr>
                        <td colSpan={8} className={`${dataTdClass('center')} py-8 text-gray-400`}>
                          Chưa có trạm cứu hộ thuộc nhà cung cấp này
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <MapSelectionModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onConfirm={readOnly ? () => setIsMapModalOpen(false) : handleConfirmLocation}
        initialAddress={form.specificAddress || form.address}
        initialCoords={formatCoordinate(form.latitude, form.longitude)}
        title="Chọn vị trí nhà cung cấp"
        pinLabel="Vị trí NCC tại đây"
        overlayClassName="z-[120]"
      />
    </div>
  );
};

const StatField: React.FC<{ label: string; value: string; onClick?: () => void }> = ({ label, value, onClick }) => (
  <div className="min-w-0">
    <FieldLabel>{label}</FieldLabel>
    {onClick ? (
      <button type="button" onClick={onClick} className={`${inputClass} bg-gray-100 text-left text-blue-600 font-bold`}>
        {value}
      </button>
    ) : (
      <input className={inputClass} value={value} disabled />
    )}
  </div>
);

export const RescueProviderCreate = () => <RescueProviderForm mode="create" />;
export const RescueProviderView = () => <RescueProviderForm mode="view" />;
export const RescueProviderEdit = () => <RescueProviderForm mode="edit" />;

export default RescueProviderForm;
