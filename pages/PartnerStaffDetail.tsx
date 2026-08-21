import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Check,
  ClipboardList,
  Eye,
  FileText,
  KeyRound,
  Lock,
  Pencil,
  RefreshCw,
  Shield,
  Truck,
  Unlock,
  UserRound,
  X,
} from 'lucide-react';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import { FileDrop, PartnerModal, partnerBtnBrand, partnerBtnNeutral, partnerInputClass as inputClass, partnerLabelClass } from '../components/PartnerModal';
import {
  ORG_NODES,
  PARTNER_STAFF,
  ROLE_LABEL,
  STAFF_DOC_TYPES,
  STAFF_DUTY_STATUS_LABEL,
  STAFF_LOG_KIND_LABEL,
  STAFF_TRANSFER_HISTORY,
  STAFF_WORK_STATUS_LABEL,
  STATION_OPTIONS,
  VEHICLE_TYPE_LABEL,
  VEHICLES,
  assignDriverToVehicle,
  dueBadge,
  formatVnd,
  inScope,
  nextStaffCode,
  orgName,
  registerStaff,
  registerStaffLog,
  registerStaffTransfer,
  saveStaffDocs,
  staffAccountLabel,
  staffDocsOf,
  staffDutyStatusOf,
  staffKpiOf,
  staffLogsOf,
  staffUsername,
  staffWorkStatusOf,
  updateStaff,
  vehiclesOfDriver,
  type PartnerPersona,
  type PartnerRole,
  type PartnerStaffRecord,
  type StaffDocument,
  type StaffDutyStatus,
  type StaffTransferHistory,
  type StaffUserLog,
  type StaffWorkStatus,
} from '../data/partnerRescueMockData';

const emptyDoc = { name: '', type: 'Bằng lái', issuedAt: '', expiryAt: '', fileName: '', fileUrl: '' };

const parseViDate = (raw: string) => {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
};

const daysUntil = (expiryAt: string) => {
  const d = parseViDate(expiryAt);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

const syncLicenseFields = (docs: StaffDocument[]): Pick<PartnerStaffRecord, 'licenseType' | 'licenseIssued' | 'licenseExpiry' | 'craneCert'> => {
  const license = docs.find((d) => d.type === 'Bằng lái');
  return {
    licenseType: license?.name || '—',
    licenseIssued: license?.issuedAt || '—',
    licenseExpiry: license?.expiryAt || '—',
    craneCert: docs.some((d) => d.type === 'Chứng chỉ cẩu'),
  };
};

const Section: React.FC<{ title: string; number: number; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  number,
  icon,
  children,
}) => (
  <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
    <div className="flex items-center justify-between rounded-t-lg bg-vetc-green px-4 py-2 text-sm font-bold text-white">
      <div className="flex items-center space-x-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">{number}</span>
        <span>{title}</span>
      </div>
      {icon && <div className="opacity-80">{icon}</div>}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="mb-1 flex items-center text-[11px] font-bold uppercase text-gray-600">
    {children}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

const fieldControlClass = (locked: boolean) =>
  `w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green transition-all ${
    locked ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100' : 'bg-white'
  }`;

const workStatusBadgeClass = (status: StaffWorkStatus) => {
  if (status === 'paused') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (status === 'left') return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-green-50 text-green-700 border-green-200';
};

const dutyBadgeClass = (status: StaffDutyStatus) => {
  if (status === 'on_order') return 'bg-blue-50 text-blue-800';
  if (status === 'on_duty') return 'bg-emerald-50 text-emerald-800';
  return 'bg-gray-100 text-gray-500';
};

const logKindClass = (kind: StaffUserLog['kind']) => {
  if (kind === 'quote') return 'bg-blue-50 text-blue-700';
  if (kind === 'transfer') return 'bg-violet-50 text-violet-700';
  return 'bg-gray-100 text-gray-600';
};

const usernameOf = (code: string) => staffUsername(code);

const emailOf = (s: Pick<PartnerStaffRecord, 'code' | 'email'>) =>
  s.email || `${usernameOf(s.code)}@carpla.vn`;

const PartnerStaffDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreate = id === 'new';
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [record, setRecord] = useState(() => (isCreate ? undefined : PARTNER_STAFF.find((s) => s.id === id)));
  const [editing, setEditing] = useState(isCreate);
  const [docs, setDocs] = useState<StaffDocument[]>(isCreate ? [] : staffDocsOf(id ?? ''));
  const [docsSnapshot, setDocsSnapshot] = useState<StaffDocument[]>(docs);
  const [docOpen, setDocOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState(emptyDoc);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StaffDocument | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [notice, setNotice] = useState('');
  const [vehicleRev, setVehicleRev] = useState(0);
  const [history, setHistory] = useState<StaffTransferHistory[]>(
    isCreate ? [] : STAFF_TRANSFER_HISTORY.filter((t) => t.staffId === id)
  );
  const [logs, setLogs] = useState<StaffUserLog[]>(isCreate ? [] : staffLogsOf(id ?? ''));
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone: '',
    cccd: '',
    email: '',
    address: '',
    role: 'NVCH' as PartnerRole,
    orgNodeId: 'tt-hm',
    stationId: 'tt-hm',
    hasAccount: false,
    accountLocked: false,
    canQuote: false,
    canRescue: true,
    workStatus: 'active' as StaffWorkStatus,
    dutyStatus: 'offline' as StaffDutyStatus,
    contractType: 'Toàn thời gian',
    joinedAt: '',
    mfaEnabled: false,
    vehicleId: '',
  });

  const canEdit = persona.role !== 'NVCH' && persona.role !== 'KT';

  if (!isCreate && !record) {
    return (
      <div>
        <p className="text-sm text-gray-500">Không tìm thấy nhân viên.</p>
        <button type="button" onClick={() => navigate('/partner/staff')} className="mt-3 text-[12px] font-bold text-[#00A859]">
          ← Về danh sách
        </button>
      </div>
    );
  }

  const staff: PartnerStaffRecord = record ?? {
    id: 'new',
    code: nextStaffCode(),
    fullname: editForm.fullname,
    phone: editForm.phone,
    cccd: editForm.cccd,
    address: editForm.address,
    role: editForm.role,
    orgNodeId: editForm.orgNodeId,
    stationId: editForm.stationId || null,
    ...syncLicenseFields(docs),
    hasAccount: editForm.hasAccount,
    email: editForm.email,
    accountLocked: editForm.accountLocked,
    canQuote: editForm.canQuote,
    canRescue: editForm.canRescue,
    workStatus: editForm.workStatus,
    dutyStatus: editForm.dutyStatus,
    contractType: editForm.contractType,
    joinedAt: editForm.joinedAt,
    mfaEnabled: editForm.mfaEnabled,
  };

  const locked = !editing;
  const shown = editing ? editForm : {
    fullname: staff.fullname,
    phone: staff.phone,
    cccd: staff.cccd,
    email: emailOf(staff),
    address: staff.address,
    role: staff.role,
    orgNodeId: staff.orgNodeId,
    stationId: staff.stationId ?? '',
    hasAccount: staff.hasAccount,
    accountLocked: staff.accountLocked ?? false,
    canQuote: staff.canQuote,
    canRescue: staff.canRescue,
    workStatus: staffWorkStatusOf(staff),
    dutyStatus: staffDutyStatusOf(staff) ?? 'offline',
    contractType: staff.contractType || 'Toàn thời gian',
    joinedAt: staff.joinedAt || '—',
    mfaEnabled: staff.mfaEnabled ?? false,
    vehicleId: '',
  };
  const code = isCreate ? nextStaffCode() : staff.code;
  const accountStatus = !shown.hasAccount ? 'none' : shown.accountLocked ? 'locked' : 'active';
  const workStatus = staffWorkStatusOf(staff);
  const dutyStatus = staffDutyStatusOf(staff);
  const assignedVehicles = !isCreate && vehicleRev >= 0 ? vehiclesOfDriver(staff.id) : [];
  const assignedVehicle = assignedVehicles[0] ?? null;
  const stationForAssign = editing ? (editForm.stationId || staff.stationId) : staff.stationId;
  const assignableVehicles = VEHICLES.filter(
    (v) => v.stationId === stationForAssign && (v.driverId == null || v.driverId === staff.id)
  );
  const kpi = isCreate ? undefined : staffKpiOf(staff.id);
  const expiringDocs = docs
    .map((d) => ({ doc: d, days: daysUntil(d.expiryAt) }))
    .filter((x) => x.days != null && x.days <= 30);
  const craneWarn = Boolean(assignedVehicle && assignedVehicle.type === 'san_truot_cau' && !staff.craneCert);

  const openEdit = () => {
    if (!record) return;
    setEditForm({
      fullname: record.fullname,
      phone: record.phone,
      cccd: record.cccd,
      email: emailOf(record),
      address: record.address,
      role: record.role,
      orgNodeId: record.orgNodeId,
      stationId: record.stationId ?? '',
      hasAccount: record.hasAccount,
      accountLocked: record.accountLocked ?? false,
      canQuote: record.canQuote,
      canRescue: record.canRescue,
      workStatus: staffWorkStatusOf(record),
      dutyStatus: staffDutyStatusOf(record) ?? 'offline',
      contractType: record.contractType || 'Toàn thời gian',
      joinedAt: record.joinedAt || '',
      mfaEnabled: record.mfaEnabled ?? false,
      vehicleId: vehiclesOfDriver(record.id)[0]?.id ?? '',
    });
    setDocsSnapshot(docs);
    setEditing(true);
  };

  const cancelEdit = () => {
    if (isCreate) navigate('/partner/staff');
    else {
      setDocs(docsSnapshot);
      setEditing(false);
    }
  };

  const openAddDoc = () => {
    setEditingDocId(null);
    setDocForm(emptyDoc);
    setDocFile(null);
    setDocOpen(true);
  };

  const openEditDoc = (d: StaffDocument) => {
    setEditingDocId(d.id);
    setDocForm({
      name: d.name,
      type: d.type,
      issuedAt: d.issuedAt,
      expiryAt: d.expiryAt,
      fileName: d.fileName,
      fileUrl: d.fileUrl ?? '',
    });
    setDocFile(null);
    setDocOpen(true);
  };

  const confirmDoc = () => {
    if (!docForm.name.trim()) return;
    const fileName = docFile?.name || docForm.fileName || 'tai-lieu.pdf';
    const fileUrl = docFile ? URL.createObjectURL(docFile) : docForm.fileUrl;
    const payload: StaffDocument = {
      id: editingDocId ?? `sd-${Date.now()}`,
      name: docForm.name.trim(),
      type: docForm.type,
      issuedAt: docForm.issuedAt || '—',
      expiryAt: docForm.expiryAt || '—',
      fileName,
      fileUrl,
    };
    setDocs((prev) => (editingDocId ? prev.map((d) => (d.id === editingDocId ? payload : d)) : [...prev, payload]));
    setDocOpen(false);
    setDocFile(null);
    setEditingDocId(null);
  };

  const confirmEdit = () => {
    if (!editForm.fullname.trim()) return;
    const org = ORG_NODES.find((n) => n.id === editForm.orgNodeId);
    const stationId = org?.isStation ? editForm.orgNodeId : (editForm.stationId || null);
    const patch: Partial<PartnerStaffRecord> = {
      fullname: editForm.fullname.trim(),
      phone: editForm.phone.trim() || '—',
      cccd: editForm.cccd.trim() || '—',
      email: editForm.email.trim() || emailOf({ code, email: '' }),
      address: editForm.address.trim() || '—',
      role: editForm.role,
      orgNodeId: editForm.orgNodeId,
      stationId,
      ...syncLicenseFields(docs),
      hasAccount: editForm.hasAccount,
      accountLocked: editForm.hasAccount ? editForm.accountLocked : false,
      canQuote: editForm.canQuote,
      canRescue: editForm.canRescue,
      workStatus: editForm.workStatus,
      dutyStatus: editForm.role === 'NVCH' ? editForm.dutyStatus : undefined,
      contractType: editForm.contractType.trim() || 'Toàn thời gian',
      joinedAt: editForm.joinedAt.trim() || undefined,
      mfaEnabled: editForm.hasAccount ? editForm.mfaEnabled : false,
    };
    const applyVehicle = (staffId: string) => {
      assignDriverToVehicle(staffId, editForm.role === 'NVCH' ? editForm.vehicleId || null : null);
      setVehicleRev((n) => n + 1);
    };
    if (isCreate) {
      const newId = `s-${Date.now()}`;
      const next: PartnerStaffRecord = {
        id: newId,
        code,
        fullname: patch.fullname!,
        phone: patch.phone!,
        cccd: patch.cccd!,
        address: patch.address!,
        role: patch.role!,
        orgNodeId: patch.orgNodeId!,
        stationId: patch.stationId ?? null,
        licenseType: patch.licenseType!,
        licenseIssued: patch.licenseIssued!,
        licenseExpiry: patch.licenseExpiry!,
        craneCert: patch.craneCert!,
        hasAccount: patch.hasAccount!,
        email: patch.email,
        accountLocked: patch.accountLocked,
        canQuote: patch.canQuote!,
        canRescue: patch.canRescue!,
        workStatus: patch.workStatus,
        dutyStatus: patch.dutyStatus,
        contractType: patch.contractType,
        joinedAt: patch.joinedAt,
        mfaEnabled: patch.mfaEnabled,
      };
      registerStaff(next);
      saveStaffDocs(newId, docs);
      applyVehicle(newId);
      navigate(`/partner/staff/${newId}`);
      return;
    }
    updateStaff(staff.id, patch);
    saveStaffDocs(staff.id, docs);
    applyVehicle(staff.id);
    setRecord({ ...staff, ...patch });
    setEditing(false);
  };

  const closeTransfer = () => {
    setTransferOpen(false);
    setTransferTo('');
    setTransferReason('');
  };

  const confirmTransfer = () => {
    if (!transferTo || !staff.stationId) return;
    const at = new Date().toLocaleString('vi-VN');
    const entry: StaffTransferHistory = {
      id: `st-${Date.now()}`,
      staffId: staff.id,
      fromStationId: staff.stationId,
      toStationId: transferTo,
      transferredAt: at,
      byName: persona.title,
      reason: transferReason || 'Điều chuyển trạm',
    };
    registerStaffTransfer(entry);
    const log: StaffUserLog = {
      id: `lg-${Date.now()}`,
      staffId: staff.id,
      kind: 'transfer',
      at,
      summary: `${orgName(staff.stationId)} → ${orgName(transferTo)} · Duyệt: ${persona.title}`,
    };
    registerStaffLog(log);
    assignDriverToVehicle(staff.id, null);
    const patch = { stationId: transferTo, orgNodeId: transferTo, dutyStatus: 'offline' as StaffDutyStatus };
    updateStaff(staff.id, patch);
    setRecord({ ...staff, ...patch });
    setHistory((prev) => [entry, ...prev]);
    setLogs((prev) => [log, ...prev]);
    setVehicleRev((n) => n + 1);
    closeTransfer();
    setNotice('Đã điều chuyển nhân viên. Xe đang gán (nếu có) đã được bỏ gán.');
  };

  const confirmLockToggle = () => {
    const nextLocked = !staff.accountLocked;
    const patch: Partial<PartnerStaffRecord> = nextLocked
      ? {
          accountLocked: true,
          lockedAt: new Date().toLocaleString('vi-VN'),
          lockedReason: 'Khóa từ Chi tiết nhân viên',
        }
      : { accountLocked: false, lockedAt: undefined, lockedReason: undefined };
    updateStaff(staff.id, patch);
    setRecord({ ...staff, ...patch });
    setLockOpen(false);
    setNotice(nextLocked ? `Đã khóa tài khoản ${staff.fullname}.` : `Đã mở khóa tài khoản ${staff.fullname}.`);
  };

  return (
    <div className="space-y-4">
      <PartnerScopeBar persona={persona} onChange={setPersona} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/partner/staff')} className="inline-flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#00A859]">
          <ArrowLeft size={14} /> Danh sách nhân viên
        </button>
        <div className="flex items-center gap-2">
          {(isCreate || editing) ? (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-gray-500 hover:bg-gray-50"
              >
                <X size={14} /> Hủy
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A859] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white"
              >
                <Check size={14} /> Lưu
              </button>
            </>
          ) : (
            canEdit && (
              <>
                {staff.hasAccount && (
                  <button
                    type="button"
                    onClick={() => setResetOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-gray-600 hover:bg-gray-50"
                  >
                    <KeyRound size={14} /> Reset mật khẩu
                  </button>
                )}
                {staff.hasAccount && (
                  <button
                    type="button"
                    onClick={() => setLockOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-gray-600 hover:bg-gray-50"
                  >
                    {staff.accountLocked ? <Unlock size={14} /> : <Lock size={14} />}
                    {staff.accountLocked ? 'Mở khóa' : 'Khóa TK'}
                  </button>
                )}
                {staff.accountCreateFailed && (
                  <button
                    type="button"
                    onClick={() => setRetryOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-amber-700 hover:bg-amber-100"
                  >
                    <RefreshCw size={14} /> Retry tạo TK
                  </button>
                )}
                {staff.stationId && (
                  <button
                    type="button"
                    onClick={() => setTransferOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A859] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white"
                  >
                    <ArrowRightLeft size={14} /> Điều chuyển
                  </button>
                )}
                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#00A859] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#00A859] hover:bg-emerald-50"
                >
                  <Pencil size={14} /> Cập nhật
                </button>
              </>
            )
          )}
        </div>
      </div>

      {(workStatus !== 'active' || craneWarn || expiringDocs.length > 0) && !isCreate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800">
            <AlertTriangle size={13} /> Cảnh báo nhân sự
          </div>
          <ul className="space-y-0.5 text-[12px] font-semibold text-amber-800">
            {workStatus !== 'active' && (
              <li>Trạng thái: {STAFF_WORK_STATUS_LABEL[workStatus]} — không nên điều phối cuốc mới.</li>
            )}
            {craneWarn && (
              <li>Xe đang gán là sàn trượt + cẩu nhưng chưa có chứng chỉ cẩu.</li>
            )}
            {expiringDocs.map(({ doc, days }) => (
              <li key={doc.id}>
                {doc.type} “{doc.name}” {days != null && days < 0 ? `quá hạn ${Math.abs(days)} ngày` : `còn ${days} ngày`}.
              </li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Thông tin nhân viên" number={1} icon={<UserRound size={16} />}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Mã NV</Label>
            <input value={code} readOnly className={fieldControlClass(true)} />
          </div>
          <div>
            <Label required>Họ tên</Label>
            <input
              value={shown.fullname}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, fullname: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>CCCD</Label>
            <input
              value={shown.cccd}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, cccd: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>SĐT</Label>
            <input
              value={shown.phone}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Email</Label>
            <input
              value={shown.email}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Địa chỉ</Label>
            <input
              value={shown.address}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Trạng thái HĐ</Label>
            {editing ? (
              <select
                value={shown.workStatus}
                onChange={(e) => setEditForm({ ...editForm, workStatus: e.target.value as StaffWorkStatus })}
                className={fieldControlClass(false)}
              >
                {(Object.keys(STAFF_WORK_STATUS_LABEL) as StaffWorkStatus[]).map((k) => (
                  <option key={k} value={k}>{STAFF_WORK_STATUS_LABEL[k]}</option>
                ))}
              </select>
            ) : (
              <div className="flex h-[34px] items-center">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black ${workStatusBadgeClass(workStatus)}`}>
                  {STAFF_WORK_STATUS_LABEL[workStatus]}
                </span>
              </div>
            )}
          </div>
          {(shown.role === 'NVCH' || staff.role === 'NVCH') && (
            <div>
              <Label>Sẵn sàng ca</Label>
              {editing ? (
                <select
                  value={shown.dutyStatus}
                  onChange={(e) => setEditForm({ ...editForm, dutyStatus: e.target.value as StaffDutyStatus })}
                  className={fieldControlClass(false)}
                >
                  {(Object.keys(STAFF_DUTY_STATUS_LABEL) as StaffDutyStatus[]).map((k) => (
                    <option key={k} value={k}>{STAFF_DUTY_STATUS_LABEL[k]}</option>
                  ))}
                </select>
              ) : (
                <div className="flex h-[34px] items-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ${dutyBadgeClass(dutyStatus ?? 'offline')}`}>
                    {STAFF_DUTY_STATUS_LABEL[dutyStatus ?? 'offline']}
                  </span>
                </div>
              )}
            </div>
          )}
          <div>
            <Label>Loại hợp đồng</Label>
            {editing ? (
              <select
                value={shown.contractType}
                onChange={(e) => setEditForm({ ...editForm, contractType: e.target.value })}
                className={fieldControlClass(false)}
              >
                <option>Toàn thời gian</option>
                <option>Thời vụ</option>
                <option>Cộng tác viên</option>
              </select>
            ) : (
              <input value={shown.contractType} readOnly className={fieldControlClass(true)} />
            )}
          </div>
          <div>
            <Label>Ngày vào</Label>
            <input
              value={shown.joinedAt}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, joinedAt: e.target.value })}
              className={fieldControlClass(locked)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <Label>Vai trò</Label>
            <select
              value={shown.role}
              disabled={locked}
              onChange={(e) => {
                const role = e.target.value as PartnerRole;
                setEditForm({
                  ...editForm,
                  role,
                  vehicleId: role === 'NVCH' ? editForm.vehicleId : '',
                  dutyStatus: role === 'NVCH' ? editForm.dutyStatus : 'offline',
                });
              }}
              className={fieldControlClass(locked)}
            >
              {(Object.keys(ROLE_LABEL) as PartnerRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <Label required={isCreate}>Đơn vị</Label>
            <select
              value={shown.orgNodeId}
              disabled={locked}
              onChange={(e) => {
                const orgNodeId = e.target.value;
                const org = ORG_NODES.find((n) => n.id === orgNodeId);
                setEditForm({ ...editForm, orgNodeId, stationId: org?.isStation ? orgNodeId : '' });
              }}
              className={fieldControlClass(locked)}
            >
              {ORG_NODES.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Trạm</Label>
            <input
              value={shown.stationId ? orgName(shown.stationId) : (editing ? '' : '— (không gắn trạm)')}
              readOnly
              className={fieldControlClass(true)}
            />
          </div>
          <div>
            <Label>Báo giá</Label>
            <select
              value={shown.canQuote ? '1' : '0'}
              disabled={locked}
              onChange={(e) => setEditForm({ ...editForm, canQuote: e.target.value === '1' })}
              className={fieldControlClass(locked)}
            >
              <option value="0">Không</option>
              <option value="1">Có</option>
            </select>
          </div>
          <div>
            <Label>Cứu hộ</Label>
            <select
              value={shown.canRescue ? '1' : '0'}
              disabled={locked}
              onChange={(e) => setEditForm({ ...editForm, canRescue: e.target.value === '1' })}
              className={fieldControlClass(locked)}
            >
              <option value="0">Không</option>
              <option value="1">Có</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="Tài khoản" number={2} icon={<KeyRound size={16} />}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Username</Label>
            <input value={shown.hasAccount || staff.accountCreateFailed ? usernameOf(code) : '—'} readOnly className={fieldControlClass(true)} />
          </div>
          <div>
            <Label>Trạng thái</Label>
            {editing ? (
              <select
                value={accountStatus}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditForm({
                    ...editForm,
                    hasAccount: v !== 'none',
                    accountLocked: v === 'locked',
                  });
                }}
                className={fieldControlClass(false)}
              >
                <option value="none">Chưa cấp</option>
                <option value="active">Active</option>
                <option value="locked">Khóa</option>
              </select>
            ) : (
              <input
                value={staffAccountLabel(staff)}
                readOnly
                className={fieldControlClass(true)}
              />
            )}
          </div>
          <div>
            <Label>MFA</Label>
            {editing && shown.hasAccount ? (
              <select
                value={shown.mfaEnabled ? '1' : '0'}
                onChange={(e) => setEditForm({ ...editForm, mfaEnabled: e.target.value === '1' })}
                className={fieldControlClass(false)}
              >
                <option value="0">Tắt</option>
                <option value="1">Bật</option>
              </select>
            ) : (
              <div className="flex h-[34px] items-center gap-1.5 text-[12px] font-semibold text-gray-700">
                <Shield size={13} className={staff.mfaEnabled ? 'text-emerald-600' : 'text-gray-400'} />
                {shown.hasAccount ? (staff.mfaEnabled || (editing && shown.mfaEnabled) ? 'Đã bật' : 'Chưa bật') : '—'}
              </div>
            )}
          </div>
          <div>
            <Label>Đăng nhập gần nhất</Label>
            <input value={staff.lastLoginAt || '—'} readOnly className={fieldControlClass(true)} />
          </div>
          <div className="lg:col-span-2">
            <Label>Thiết bị / vị trí</Label>
            <input value={staff.lastLoginDevice || '—'} readOnly className={fieldControlClass(true)} />
          </div>
          <div>
            <Label>Đổi mật khẩu lần cuối</Label>
            <input value={staff.passwordChangedAt || '—'} readOnly className={fieldControlClass(true)} />
          </div>
          {staff.accountLocked && (
            <>
              <div>
                <Label>Khóa lúc</Label>
                <input value={staff.lockedAt || '—'} readOnly className={fieldControlClass(true)} />
              </div>
              <div className="lg:col-span-2">
                <Label>Lý do khóa</Label>
                <input value={staff.lockedReason || '—'} readOnly className={fieldControlClass(true)} />
              </div>
            </>
          )}
        </div>
      </Section>

      <Section title="Bằng cấp, giấy phép" number={3} icon={<FileText size={16} />}>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-3 py-2">Loại giấy tờ</th>
                <th className="px-3 py-2">Ngày cấp</th>
                <th className="px-3 py-2">Hết hạn</th>
                <th className="px-3 py-2">Cảnh báo</th>
                <th className="px-3 py-2">File</th>
                {editing && <th className="px-3 py-2 w-24">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const days = daysUntil(d.expiryAt);
                const b = days == null ? null : dueBadge(days, 30);
                const cls =
                  b?.tone === 'red' ? 'bg-red-50 text-red-700' : b?.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600';
                return (
                  <tr key={d.id} className="border-t border-gray-100">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-gray-800">{d.name}</div>
                      <div className="text-[10px] text-gray-400">{d.type}</div>
                    </td>
                    <td className="px-3 py-2.5 font-semibold">{d.issuedAt}</td>
                    <td className="px-3 py-2.5 font-semibold">{d.expiryAt}</td>
                    <td className="px-3 py-2.5">
                      {b ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ${cls}`}>
                          {b.tone !== 'green' && <AlertTriangle size={10} className="mr-1" />}
                          {b.text}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(d)}
                        className="inline-flex items-center gap-1 font-semibold text-[#00A859] hover:underline"
                      >
                        <FileText size={13} /> {d.fileName}
                      </button>
                    </td>
                    {editing && (
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setPreviewDoc(d)} className="rounded p-1 text-gray-500 hover:bg-gray-100" title="Xem">
                            <Eye size={14} />
                          </button>
                          <button type="button" onClick={() => openEditDoc(d)} className="rounded p-1 text-gray-500 hover:bg-gray-100" title="Sửa">
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={editing ? 6 : 5} className="px-3 py-8 text-center text-gray-400">Chưa có giấy tờ đính kèm</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {editing && (
          <button type="button" onClick={openAddDoc} className="mt-3 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-500 hover:border-[#00A859] hover:text-[#00A859]">
            + Đính kèm giấy tờ
          </button>
        )}
      </Section>

      <Section title="Xe đang gán" number={4} icon={<Truck size={16} />}>
        {editing && shown.role === 'NVCH' ? (
          <div className="max-w-md">
            <Label>Xe tại trạm</Label>
            <select
              value={editForm.vehicleId}
              onChange={(e) => setEditForm({ ...editForm, vehicleId: e.target.value })}
              className={fieldControlClass(false)}
            >
              <option value="">Chưa gán</option>
              {assignableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} · {VEHICLE_TYPE_LABEL[v.type]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[10px] text-gray-400">Một nhân viên gán tối đa 1 xe. Điều chuyển trạm sẽ bỏ gán xe.</p>
          </div>
        ) : assignedVehicle ? (
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
            <div>
              <p className="text-[13px] font-black text-[#091b37]">{assignedVehicle.plate}</p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {VEHICLE_TYPE_LABEL[assignedVehicle.type]} · {assignedVehicle.brand} {assignedVehicle.modelLine} · {orgName(assignedVehicle.stationId)}
              </p>
              {craneWarn && (
                <p className="mt-1 text-[11px] font-semibold text-amber-700">Thiếu chứng chỉ cẩu cho loại xe này.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate(`/partner/vehicles/${assignedVehicle.id}`)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#00A859] bg-white px-3 py-1.5 text-[11px] font-bold text-[#00A859] hover:bg-emerald-50"
            >
              Chi tiết xe
            </button>
          </div>
        ) : (
          <p className="text-[12px] text-gray-400">Chưa gán xe. {shown.role === 'NVCH' ? 'Dùng Cập nhật để chọn xe cùng trạm.' : 'Chỉ tài xế cứu hộ được gán xe.'}</p>
        )}
      </Section>

      {!isCreate && (
        <Section title="Điều chuyển" number={5} icon={<ArrowRightLeft size={16} />}>
          {history.length === 0 ? (
            <p className="text-[12px] text-gray-400">Chưa có lịch sử điều chuyển.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2">Từ trạm</th>
                    <th className="px-3 py-2">Đến trạm</th>
                    <th className="px-3 py-2">Người thực hiện</th>
                    <th className="px-3 py-2">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{h.transferredAt}</td>
                      <td className="px-3 py-2 font-semibold text-gray-700">{orgName(h.fromStationId)}</td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{orgName(h.toStationId)}</td>
                      <td className="px-3 py-2 text-gray-600">{h.byName}</td>
                      <td className="px-3 py-2 text-gray-600">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {!isCreate && staff.role === 'NVCH' && (
        <Section title="Hiệu suất cứu hộ" number={6} icon={<ClipboardList size={16} />}>
          {kpi ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
              {[
                ['Hoàn thành', String(kpi.completed)],
                ['Hủy', String(kpi.cancelled)],
                ['Từ chối', String(kpi.rejected)],
                ['Phản hồi TB', `${kpi.avgResponseMin} phút`],
                ['Tiếp cận TB', `${kpi.avgApproachMin} phút`],
                ['Doanh thu', formatVnd(kpi.revenue)],
                ['Đánh giá KH', `${kpi.rating.toFixed(1)} / 5`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-0.5 text-[13px] font-black text-[#091b37]">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">Chưa có số liệu hiệu suất.</p>
          )}
        </Section>
      )}

      {!isCreate && (
        <Section title="Nhật ký hoạt động" number={staff.role === 'NVCH' ? 7 : 6} icon={<ClipboardList size={16} />}>
          {logs.length === 0 ? (
            <p className="text-[12px] text-gray-400">Chưa có nhật ký.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2">Loại</th>
                    <th className="px-3 py-2">Nội dung</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{log.at}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${logKindClass(log.kind)}`}>
                          {STAFF_LOG_KIND_LABEL[log.kind]}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold text-gray-700">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      <PartnerModal
        open={docOpen}
        title={editingDocId ? 'Sửa giấy tờ' : 'Đính kèm giấy tờ'}
        icon={<FileText size={20} />}
        onClose={() => setDocOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setDocOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmDoc} className={partnerBtnBrand}>Lưu giấy tờ</button>
          </>
        )}
      >
        <div className="space-y-3">
          <div>
            <label className={partnerLabelClass}>Tên giấy tờ <span className="text-[#da2c39]">*</span></label>
            <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} className={inputClass} placeholder="VD: Bằng lái hạng C" />
          </div>
          <div>
            <label className={partnerLabelClass}>Loại</label>
            <select value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })} className={inputClass}>
              {STAFF_DOC_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={partnerLabelClass}>Ngày cấp</label>
              <input value={docForm.issuedAt} onChange={(e) => setDocForm({ ...docForm, issuedAt: e.target.value })} className={inputClass} placeholder="dd/mm/yyyy" />
            </div>
            <div>
              <label className={partnerLabelClass}>Hết hạn</label>
              <input value={docForm.expiryAt} onChange={(e) => setDocForm({ ...docForm, expiryAt: e.target.value })} className={inputClass} placeholder="dd/mm/yyyy" />
            </div>
          </div>
          <div>
            <label className={partnerLabelClass}>File đính kèm <span className="text-[#da2c39]">*</span></label>
            <FileDrop accept="image/*,.pdf,application/pdf" file={docFile} hint="PDF, JPG, PNG" onFile={setDocFile} />
            {!docFile && docForm.fileName && (
              <p className="mt-1 text-[11px] text-gray-500">File hiện tại: {docForm.fileName}</p>
            )}
          </div>
        </div>
      </PartnerModal>

      <PartnerModal
        open={!!previewDoc}
        title="Xem giấy tờ"
        icon={<Eye size={20} />}
        onClose={() => setPreviewDoc(null)}
        footer={(
          <button type="button" onClick={() => setPreviewDoc(null)} className={partnerBtnBrand}>Đóng</button>
        )}
      >
        {previewDoc && (
          <div className="space-y-3">
            <p className="text-[12px] font-bold text-gray-800">{previewDoc.name} · {previewDoc.fileName}</p>
            {previewDoc.fileUrl && (previewDoc.fileUrl.match(/\.(png|jpe?g|gif|webp)/i) || previewDoc.fileUrl.includes('picsum.photos')) ? (
              <img src={previewDoc.fileUrl} alt="" className="max-h-80 w-full rounded-lg object-contain" />
            ) : previewDoc.fileUrl ? (
              <iframe title="preview" src={previewDoc.fileUrl} className="h-80 w-full rounded-lg border" />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-[12px] text-gray-500">
                Chưa có file xem trước. Mở Sửa và upload file để xem.
              </div>
            )}
          </div>
        )}
      </PartnerModal>

      <PartnerModal
        open={resetOpen}
        title="Reset mật khẩu"
        icon={<KeyRound size={20} />}
        onClose={() => setResetOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setResetOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={() => {
                setResetOpen(false);
                setNotice(`Đã gửi mật khẩu mới tới ${staff.phone}.`);
              }}
              className={partnerBtnBrand}
            >
              Gửi mật khẩu mới
            </button>
          </>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">
          Hệ thống sẽ reset mật khẩu SSO của <strong>{staff.fullname}</strong> ({usernameOf(code)}) và gửi thông tin đăng nhập mới qua SĐT <strong>{staff.phone}</strong>.
        </p>
      </PartnerModal>

      <PartnerModal
        open={retryOpen}
        title="Retry tạo tài khoản"
        icon={<RefreshCw size={20} />}
        onClose={() => setRetryOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setRetryOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={() => {
                const patch = { hasAccount: true, accountCreateFailed: false, accountLocked: false };
                updateStaff(staff.id, patch);
                setRecord({ ...staff, ...patch });
                setRetryOpen(false);
                setNotice('Tạo tài khoản SSO thành công. Thông tin đăng nhập đã gửi qua SĐT.');
              }}
              className={partnerBtnBrand}
            >
              Gọi lại SSO
            </button>
          </>
        )}
      >
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          Lần gọi Keycloak/SSO trước đó bị lỗi. Retry sẽ tạo lại tài khoản và gửi mật khẩu qua SĐT.
        </p>
        <p className="text-[12px] font-semibold text-gray-700">
          {staff.fullname} · {usernameOf(code)} · {staff.phone}
        </p>
      </PartnerModal>

      <PartnerModal
        open={transferOpen}
        title="Điều chuyển nhân viên"
        icon={<ArrowRightLeft size={20} />}
        onClose={closeTransfer}
        footer={(
          <>
            <button type="button" onClick={closeTransfer} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmTransfer} disabled={!transferTo} className={partnerBtnBrand}>
              Xác nhận điều chuyển
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          <p className="text-[12px] text-gray-600">
            {staff.fullname} hiện tại: <strong>{staff.stationId ? orgName(staff.stationId) : '—'}</strong>.
            Xe đang gán sẽ được bỏ gán.
          </p>
          <div>
            <label className={partnerLabelClass}>Đến trạm <span className="text-[#da2c39]">*</span></label>
            <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className={inputClass}>
              <option value="">Chọn trạm</option>
              {STATION_OPTIONS.filter((s) => s.id !== staff.stationId && inScope(persona, s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={partnerLabelClass}>Lý do</label>
            <textarea
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className={`${inputClass} min-h-[72px]`}
              placeholder="Lý do điều chuyển"
            />
          </div>
        </div>
      </PartnerModal>

      <PartnerModal
        open={lockOpen}
        title={staff.accountLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        icon={staff.accountLocked ? <Unlock size={20} /> : <Lock size={20} />}
        onClose={() => setLockOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setLockOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmLockToggle} className={partnerBtnBrand}>Xác nhận</button>
          </>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">
          {staff.accountLocked
            ? `Mở khóa SSO cho ${staff.fullname} (${usernameOf(code)})?`
            : `Khóa tài khoản ${staff.fullname}? Người dùng sẽ không đăng nhập được đến khi mở khóa.`}
        </p>
      </PartnerModal>

      <PartnerModal
        title="Thông báo"
        icon={<Check size={20} />}
        onClose={() => setNotice('')}
        footer={(
          <button type="button" onClick={() => setNotice('')} className={partnerBtnBrand}>Đóng</button>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">{notice}</p>
      </PartnerModal>
    </div>
  );
};

export default PartnerStaffDetail;
