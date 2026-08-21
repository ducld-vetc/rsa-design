import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Truck,
  MapPin,
  Wrench,
  X,
} from 'lucide-react';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import { FileDrop, PartnerModal, partnerBtnBrand, partnerBtnDanger, partnerBtnNeutral, partnerInputClass as inputClass, partnerLabelClass } from '../components/PartnerModal';
import {
  STATION_OPTIONS,
  TOOL_CATALOG,
  VEHICLES,
  VEHICLE_DOCUMENTS,
  VEHICLE_PHOTOS,
  VEHICLE_TRANSFER_HISTORY,
  VEHICLE_TYPE_LABEL,
  driversAtStation,
  dueBadge,
  formatVnd,
  inScope,
  nextHnl,
  orgName,
  registerTransfer,
  registerVehicle,
  saveVehicleMedia,
  toolsFor,
  updateVehicle,
  type PartnerPersona,
  type VehicleDocument,
  type VehiclePhoto,
  type VehicleRecord,
  type VehicleToolItem,
  type VehicleTransferHistory,
} from '../data/partnerRescueMockData';
import RescueOrderGpsJourney from '../shared/RescueOrderGpsJourney';

const Section: React.FC<{
  title: string;
  number: number;
  icon?: React.ReactNode;
  flush?: boolean;
  children: React.ReactNode;
}> = ({ title, number, icon, flush, children }) => (
  <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
    <div className="flex items-center justify-between rounded-t-lg bg-vetc-green px-4 py-2 text-sm font-bold text-white">
      <div className="flex items-center space-x-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">{number}</span>
        <span>{title}</span>
      </div>
      {icon && <div className="opacity-80">{icon}</div>}
    </div>
    <div className={flush ? '' : 'p-4'}>{children}</div>
  </section>
);

const SubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-500">{children}</h3>
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

const emptyDoc = { name: '', type: 'Đăng kiểm', issuedAt: '', expiryAt: '', fileName: '', fileUrl: '' };

const docWarn = (doc: VehicleDocument, vehicle: VehicleRecord) => {
  const name = `${doc.name} ${doc.type}`.toLowerCase();
  if (name.includes('đăng kiểm')) return { days: vehicle.inspectionDueDays, warn: 30 };
  if (name.includes('tnds')) return { days: vehicle.tndsDueDays, warn: 7 };
  if (name.includes('vật chất')) return { days: vehicle.physicalInsDueDays, warn: 15 };
  if (name.includes('gplh') || name.includes('lưu hành')) return { days: vehicle.gplhDueDays, warn: 7 };
  if (name.includes('bảo dưỡng')) return { days: vehicle.maintenanceDueDays, warn: 7 };
  return null;
};

const PartnerVehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isCreate = id === 'new';
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [record, setRecord] = useState(() => (isCreate ? undefined : VEHICLES.find((v) => v.id === id)));

  const [tools, setTools] = useState<VehicleToolItem[]>(isCreate ? toolsFor('san_truot') : (record?.tools ?? []));
  const [docs, setDocs] = useState<VehicleDocument[]>(isCreate ? [] : (VEHICLE_DOCUMENTS[id ?? ''] ?? []));
  const [photos, setPhotos] = useState<VehiclePhoto[]>(isCreate ? [] : (VEHICLE_PHOTOS[id ?? ''] ?? []));
  const [history, setHistory] = useState<VehicleTransferHistory[]>(
    isCreate ? [] : VEHICLE_TRANSFER_HISTORY.filter((t) => t.vehicleId === id)
  );

  const [transferOpen, setTransferOpen] = useState(false);
  const [editing, setEditing] = useState(isCreate);
  const [docOpen, setDocOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [statusTool, setStatusTool] = useState<VehicleToolItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VehicleDocument | null>(null);

  const [transferTo, setTransferTo] = useState('');
  const [reason, setReason] = useState('');
  const [docForm, setDocForm] = useState(emptyDoc);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [photoLabel, setPhotoLabel] = useState('Góc trước');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [replaceOf, setReplaceOf] = useState('');
  const [editForm, setEditForm] = useState({
    plate: '',
    brand: 'Isuzu' as VehicleRecord['brand'],
    modelLine: '',
    chassis: '',
    engineNo: '',
    year: String(new Date().getFullYear()),
    driverId: '',
    stationId: 'tt-hm',
    type: 'san_truot' as VehicleRecord['type'],
    loadCarry: '',
    loadCrane: '',
    loadLift: '',
    seats: '',
    runStatus: 'active' as VehicleRecord['runStatus'],
  });

  const canTransfer = persona.role !== 'NVCH' && persona.role !== 'KT';
  const catalog = useMemo(
    () => TOOL_CATALOG[record?.type ?? editForm.type] ?? [],
    [record, editForm.type]
  );
  const photoPreviewUrl = useMemo(() => (photoFile ? URL.createObjectURL(photoFile) : ''), [photoFile]);
  useEffect(() => () => { if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl); }, [photoPreviewUrl]);

  if (!isCreate && !record) {
    return (
      <div>
        <p className="text-sm text-gray-500">Không tìm thấy xe.</p>
        <button type="button" onClick={() => navigate('/partner/vehicles')} className="mt-3 text-[12px] font-bold text-[#00A859]">
          ← Về danh sách
        </button>
      </div>
    );
  }

  const vehicle: VehicleRecord = record ?? {
    id: 'new',
    plate: editForm.plate,
    hnl: nextHnl(VEHICLES),
    brand: editForm.brand,
    modelLine: editForm.modelLine,
    chassis: editForm.chassis,
    engineNo: editForm.engineNo,
    year: Number(editForm.year) || new Date().getFullYear(),
    stationId: editForm.stationId,
    driverId: editForm.driverId || null,
    type: editForm.type,
    loadCarry: editForm.loadCarry,
    loadCrane: editForm.loadCrane,
    loadLift: editForm.loadLift,
    seats: editForm.seats,
    runStatus: editForm.runStatus,
    idleHours: 0,
    inspectionDueDays: 365,
    maintenanceDueDays: 30,
    gplhDueDays: 365,
    tndsDueDays: 365,
    physicalInsDueDays: 365,
    tools,
    revenueMonth: 0,
  };
  const idle72 = vehicle.idleHours > 72;
  const idle7d = vehicle.idleHours > 168;
  const broken = tools.filter((t) => t.status === 0);

  const closeTransfer = () => {
    setTransferOpen(false);
    setTransferTo('');
    setReason('');
  };

  const confirmTransfer = () => {
    if (!transferTo) return;
    const entry = {
      id: `t-${Date.now()}`,
      vehicleId: vehicle.id,
      fromStationId: vehicle.stationId,
      toStationId: transferTo,
      transferredAt: new Date().toLocaleString('vi-VN'),
      byName: persona.title,
      reason: reason || 'Điều chuyển trạm',
    };
    registerTransfer(entry);
    updateVehicle(vehicle.id, { stationId: transferTo, driverId: null });
    setRecord({ ...vehicle, stationId: transferTo, driverId: null });
    setHistory((prev) => [entry, ...prev]);
    closeTransfer();
  };

  const openEdit = () => {
    setEditForm({
      plate: vehicle.plate,
      brand: vehicle.brand,
      modelLine: vehicle.modelLine,
      chassis: vehicle.chassis,
      engineNo: vehicle.engineNo,
      year: String(vehicle.year),
      driverId: vehicle.driverId ?? '',
      stationId: vehicle.stationId,
      type: vehicle.type,
      loadCarry: vehicle.loadCarry,
      loadCrane: vehicle.loadCrane,
      loadLift: vehicle.loadLift,
      seats: vehicle.seats,
      runStatus: vehicle.runStatus,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    if (isCreate) navigate('/partner/vehicles');
    else setEditing(false);
  };

  const confirmEdit = () => {
    if (!editForm.plate.trim()) return;
    const patch: Partial<VehicleRecord> = {
      plate: editForm.plate.trim(),
      brand: editForm.brand,
      modelLine: editForm.modelLine.trim() || '—',
      chassis: editForm.chassis.trim() || '—',
      engineNo: editForm.engineNo.trim() || '—',
      year: Number(editForm.year) || vehicle.year,
      driverId: editForm.driverId || null,
      type: editForm.type,
      loadCarry: editForm.loadCarry.trim() || '—',
      loadCrane: editForm.loadCrane.trim() || '—',
      loadLift: editForm.loadLift.trim() || '—',
      seats: editForm.seats.trim() || '—',
      runStatus: editForm.runStatus,
    };
    if (isCreate) {
      const newId = `v-${Date.now()}`;
      const next: VehicleRecord = {
        id: newId,
        hnl: nextHnl(VEHICLES),
        stationId: editForm.stationId,
        idleHours: 0,
        inspectionDueDays: 365,
        maintenanceDueDays: 30,
        gplhDueDays: 365,
        tndsDueDays: 365,
        physicalInsDueDays: 365,
        tools,
        revenueMonth: 0,
        plate: patch.plate!,
        brand: patch.brand!,
        modelLine: patch.modelLine!,
        chassis: patch.chassis!,
        engineNo: patch.engineNo!,
        year: patch.year!,
        driverId: patch.driverId ?? null,
        type: patch.type!,
        loadCarry: patch.loadCarry!,
        loadCrane: patch.loadCrane!,
        loadLift: patch.loadLift!,
        seats: patch.seats!,
        runStatus: patch.runStatus!,
      };
      registerVehicle(next);
      saveVehicleMedia(newId, photos, docs);
      navigate(`/partner/vehicles/${newId}`);
      return;
    }
    updateVehicle(vehicle.id, patch);
    setRecord({ ...vehicle, ...patch });
    setEditing(false);
  };

  const openAddDoc = () => {
    setEditingDocId(null);
    setDocForm(emptyDoc);
    setDocFile(null);
    setDocOpen(true);
  };

  const openEditDoc = (d: VehicleDocument) => {
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
    const payload: VehicleDocument = {
      id: editingDocId ?? `d-${Date.now()}`,
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

  const confirmPhoto = () => {
    const url = photoFile ? URL.createObjectURL(photoFile) : '';
    if (!url) return;
    setPhotos((prev) => [...prev, { id: `p-${Date.now()}`, label: photoLabel, url }]);
    setPhotoFile(null);
    setPhotoOpen(false);
  };

  const confirmTool = () => {
    const name = newToolName.trim();
    if (!name) return;
    if (replaceOf) setTools((prev) => prev.map((t) => (t.id === replaceOf ? { ...t, name, status: 1 } : t)));
    else if (!tools.some((t) => t.name === name)) setTools((prev) => [...prev, { id: `tool-${Date.now()}`, name, status: 1 }]);
    setNewToolName('');
    setReplaceOf('');
    setToolOpen(false);
  };

  const applyToolStatus = (status: 0 | 1) => {
    if (!statusTool) return;
    setTools((prev) => prev.map((t) => (t.id === statusTool.id ? { ...t, status } : t)));
    setStatusTool(null);
  };

  const locked = !editing;

  return (
    <div className="space-y-4">
      <PartnerScopeBar persona={persona} onChange={setPersona} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => navigate('/partner/vehicles')} className="inline-flex items-center gap-1 text-[12px] font-bold text-gray-500 hover:text-[#00A859]">
          <ArrowLeft size={14} /> Danh sách phương tiện
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
            canTransfer && (
              <>
                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#00A859] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#00A859] hover:bg-emerald-50"
                >
                  <Pencil size={14} /> Cập nhật
                </button>
                <button type="button" onClick={() => setTransferOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00A859] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white">
                  <ArrowRightLeft size={14} /> Điều chuyển
                </button>
              </>
            )
          )}
        </div>
      </div>

      {(idle72 || idle7d) && !isCreate && (
        <div className={`rounded-lg border px-4 py-3 ${idle7d ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider ${idle7d ? 'text-red-800' : 'text-amber-800'}`}>
            <AlertTriangle size={13} /> Cảnh báo vận hành
          </div>
          <p className={`text-[12px] font-semibold ${idle7d ? 'text-red-800' : 'text-amber-800'}`}>
            Xe không di chuyển {vehicle.idleHours} giờ{idle7d ? ' — vượt 7 ngày' : ' — vượt 72 giờ'}.
          </p>
        </div>
      )}

      <Section title="Thông tin xe" number={1} icon={<Truck size={16} />}>
        <SubTitle>Thông tin</SubTitle>
        {editing && (
          <p className="mb-3 text-[11px] text-emerald-700">
            {isCreate
              ? 'Mã HNL hệ thống tự cấp. Chọn trạm khi tạo xe.'
              : 'Đang sửa trên màn chi tiết. Mã HNL, trạm và doanh thu không đổi tại đây — đổi trạm dùng Điều chuyển.'}
          </p>
        )}
        <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label required>Biển số</Label>
            <input
              value={editing ? editForm.plate : vehicle.plate}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, plate: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Mã HNL</Label>
            <input value={String(isCreate ? nextHnl(VEHICLES) : vehicle.hnl)} readOnly className={fieldControlClass(true)} />
          </div>
          <div>
            <Label>Tình trạng</Label>
            <select
              value={editing ? editForm.runStatus : vehicle.runStatus}
              disabled={locked}
              onChange={(e) => setEditForm({ ...editForm, runStatus: e.target.value as VehicleRecord['runStatus'] })}
              className={fieldControlClass(locked)}
            >
              <option value="active">Đang hoạt động</option>
              <option value="repair">Đang sửa chữa</option>
            </select>
          </div>
          <div>
            <Label>Hãng</Label>
            <select
              value={editing ? editForm.brand : vehicle.brand}
              disabled={locked}
              onChange={(e) => setEditForm({ ...editForm, brand: e.target.value as VehicleRecord['brand'] })}
              className={fieldControlClass(locked)}
            >
              <option>Isuzu</option>
              <option>Hino</option>
              <option>Dongfeng</option>
            </select>
          </div>
          <div>
            <Label>Dòng xe</Label>
            <input
              value={editing ? editForm.modelLine : vehicle.modelLine}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, modelLine: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Năm SX</Label>
            <input
              value={editing ? editForm.year : String(vehicle.year)}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Số khung</Label>
            <input
              value={editing ? editForm.chassis : vehicle.chassis}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, chassis: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Số máy</Label>
            <input
              value={editing ? editForm.engineNo : vehicle.engineNo}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, engineNo: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label required={isCreate}>Trạm (xưởng)</Label>
            {isCreate ? (
              <select
                value={editForm.stationId}
                onChange={(e) => setEditForm({ ...editForm, stationId: e.target.value, driverId: '' })}
                className={fieldControlClass(false)}
              >
                {STATION_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            ) : (
              <input value={orgName(vehicle.stationId)} readOnly className={fieldControlClass(true)} />
            )}
          </div>
          <div>
            <Label>Loại xe</Label>
            <select
              value={editing ? editForm.type : vehicle.type}
              disabled={locked}
              onChange={(e) => {
                const nextType = e.target.value as VehicleRecord['type'];
                setEditForm({ ...editForm, type: nextType });
                if (isCreate) setTools(toolsFor(nextType));
              }}
              className={fieldControlClass(locked)}
            >
              {(Object.keys(VEHICLE_TYPE_LABEL) as VehicleRecord['type'][]).map((t) => (
                <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Trọng tải</Label>
            <input
              value={editing ? editForm.loadCarry : vehicle.loadCarry}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, loadCarry: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Số chỗ</Label>
            <input
              value={editing ? editForm.seats : vehicle.seats}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Trọng tải cẩu kéo tối đa</Label>
            <input
              value={editing ? editForm.loadCrane : vehicle.loadCrane}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, loadCrane: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Tải trọng cầu nâng</Label>
            <input
              value={editing ? editForm.loadLift : vehicle.loadLift}
              readOnly={locked}
              onChange={(e) => setEditForm({ ...editForm, loadLift: e.target.value })}
              className={fieldControlClass(locked)}
            />
          </div>
          <div>
            <Label>Tài xế chịu trách nhiệm</Label>
            <select
              value={editing ? editForm.driverId : (vehicle.driverId ?? '')}
              disabled={locked}
              onChange={(e) => setEditForm({ ...editForm, driverId: e.target.value })}
              className={fieldControlClass(locked)}
            >
              <option value="">Chưa gán</option>
              {driversAtStation(isCreate ? editForm.stationId : vehicle.stationId).map((d) => (
                <option key={d.id} value={d.id}>{d.fullname}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Doanh thu tháng</Label>
            <input value={formatVnd(vehicle.revenueMonth)} readOnly className={fieldControlClass(true)} />
          </div>
        </div>

        <SubTitle>Hình ảnh</SubTitle>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-lg border border-gray-200">
              <button type="button" onClick={() => setPreview(p.url)} className="block w-full text-left">
                <img src={p.url} alt={p.label} className="h-28 w-full object-cover" />
                <div className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-gray-600">
                  <ImageIcon size={12} /> {p.label}
                </div>
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                  title="Xóa ảnh"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {editing && (
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPhotoOpen(true); }}
              className="flex h-[148px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-[11px] font-bold text-gray-400 hover:border-[#00A859] hover:text-[#00A859]"
            >
              <Plus size={16} /> Thêm ảnh
            </button>
          )}
        </div>

        <SubTitle>Giấy tờ đính kèm xe</SubTitle>
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
                const w = docWarn(d, vehicle);
                const b = w ? dueBadge(w.days, w.warn) : null;
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
              {(() => {
                const b = dueBadge(vehicle.maintenanceDueDays, 7);
                return (
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-gray-800">Bảo dưỡng định kỳ</div>
                      <div className="text-[10px] text-gray-400">Nhắc hạn xe</div>
                    </td>
                    <td className="px-3 py-2.5 font-semibold">—</td>
                    <td className="px-3 py-2.5 font-semibold">Theo lịch BD</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${b.tone === 'red' ? 'bg-red-50 text-red-700' : b.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'}`}>
                        {b.text}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-400">Không đính kèm</td>
                    {editing && <td />}
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
        {editing && (
          <button type="button" onClick={openAddDoc} className="mt-3 rounded-lg border-2 border-dashed border-gray-200 px-3 py-2 text-[11px] font-bold text-gray-500 hover:border-[#00A859] hover:text-[#00A859]">
            + Đính kèm giấy tờ
          </button>
        )}
      </Section>

      {!isCreate && (
        <Section title="Lịch sử hành trình" number={2} icon={<MapPin size={16} />} flush>
          <RescueOrderGpsJourney plate={vehicle.plate} />
        </Section>
      )}

      <Section title="Điều chuyển" number={isCreate ? 2 : 3} icon={<ArrowRightLeft size={16} />}>
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
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{h.transferredAt}</td>
                    <td className="px-3 py-2 font-semibold text-gray-700">{orgName(h.fromStationId)}</td>
                    <td className="px-3 py-2 font-semibold text-gray-800">{orgName(h.toStationId)}</td>
                    <td className="px-3 py-2 text-gray-600">{h.byName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Công cụ theo xe và tình trạng" number={isCreate ? 3 : 4} icon={<Wrench size={16} />}>
        <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-green-50 px-2.5 py-1 font-bold text-green-700">{tools.filter((t) => t.status === 1).length} sẵn sàng</span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 font-bold text-red-700">{broken.length} chưa sẵn sàng</span>
        </div>
        {broken.length > 0 && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-800">
            Công cụ chưa sẵn sàng: {broken.map((t) => t.name).join(', ')}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusTool(t)}
              className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left hover:border-[#00A859] ${
                t.status === 0 ? 'border-red-200 bg-red-50/60' : 'border-gray-100'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-gray-800">
                <Wrench size={13} className={t.status === 0 ? 'text-red-500' : 'text-gray-400'} />
                <span className="truncate">{t.name}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${t.status === 1 ? 'bg-green-50 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {t.status === 1 ? '1 · Sẵn sàng' : '0 · Chưa sẵn sàng'}
              </span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setToolOpen(true)} className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-200 py-2 text-[11px] font-bold text-gray-500 hover:border-[#00A859] hover:text-[#00A859]">
          + Thay thế / bổ sung thiết bị
        </button>
      </Section>

      <PartnerModal
        open={transferOpen}
        title="Điều chuyển xe"
        icon={<ArrowRightLeft size={20} />}
        onClose={closeTransfer}
        footer={(
          <>
            <button type="button" onClick={closeTransfer} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmTransfer} className={partnerBtnBrand}>Xác nhận chuyển trạm</button>
          </>
        )}
      >
        <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">Chỉ chuyển <strong>trạm → trạm</strong>.</p>
        <div className="space-y-3">
          <div>
            <label className={partnerLabelClass}>Từ trạm</label>
            <input readOnly value={orgName(vehicle.stationId)} className={`${inputClass} bg-gray-50 text-gray-400`} />
          </div>
          <div>
            <label className={partnerLabelClass}>Đến trạm <span className="text-[#da2c39]">*</span></label>
            <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className={inputClass}>
              <option value="">Chọn trạm đích...</option>
              {STATION_OPTIONS.filter((s) => s.id !== vehicle.stationId && inScope(persona, s.id)).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={partnerLabelClass}>Lý do <span className="text-[#da2c39]">*</span></label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do điều chuyển..." className={`${inputClass} resize-none`} />
          </div>
        </div>
      </PartnerModal>

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
            <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} className={inputClass} placeholder="VD: Giấy đăng kiểm" />
          </div>
          <div>
            <label className={partnerLabelClass}>Loại</label>
            <select value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value })} className={inputClass}>
              <option>Đăng kiểm</option>
              <option>Bảo hiểm</option>
              <option>GPLH</option>
              <option>Khác</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={partnerLabelClass}>Ngày cấp</label>
              <input type="date" value={docForm.issuedAt} onChange={(e) => setDocForm({ ...docForm, issuedAt: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={partnerLabelClass}>Hết hạn</label>
              <input type="date" value={docForm.expiryAt} onChange={(e) => setDocForm({ ...docForm, expiryAt: e.target.value })} className={inputClass} />
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
            {previewDoc.fileUrl && previewDoc.fileUrl.match(/\.(png|jpe?g|gif|webp)/i) ? (
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
        open={photoOpen}
        title="Thêm ảnh xe"
        icon={<ImageIcon size={20} />}
        onClose={() => setPhotoOpen(false)}
        footer={(
          <>
            <button type="button" onClick={() => setPhotoOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmPhoto} className={partnerBtnBrand}>Thêm ảnh</button>
          </>
        )}
      >
        <div className="space-y-3">
          <div>
            <label className={partnerLabelClass}>Góc chụp</label>
            <select value={photoLabel} onChange={(e) => setPhotoLabel(e.target.value)} className={inputClass}>
              <option>Góc trước</option>
              <option>Góc sau</option>
              <option>Bên trái</option>
              <option>Bên phải</option>
              <option>Cabin</option>
            </select>
          </div>
          <div>
            <label className={partnerLabelClass}>Ảnh <span className="text-[#da2c39]">*</span></label>
            <FileDrop accept="image/*" file={photoFile} hint="JPG, PNG" onFile={setPhotoFile} />
          </div>
          {photoPreviewUrl && (
            <img src={photoPreviewUrl} alt="" className="max-h-40 w-full rounded-lg object-contain" />
          )}
        </div>
      </PartnerModal>

      <PartnerModal
        open={toolOpen}
        title="Thay thế / bổ sung thiết bị"
        icon={<Wrench size={20} />}
        onClose={() => { setToolOpen(false); setNewToolName(''); setReplaceOf(''); }}
        footer={(
          <>
            <button type="button" onClick={() => setToolOpen(false)} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={confirmTool} className={partnerBtnBrand}>Lưu thiết bị</button>
          </>
        )}
      >
        <div className="space-y-3">
          <div>
            <label className={partnerLabelClass}>Thay thế món hiện có</label>
            <select value={replaceOf} onChange={(e) => setReplaceOf(e.target.value)} className={inputClass}>
              <option value="">— Chỉ bổ sung mới —</option>
              {tools.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={partnerLabelClass}>Tên thiết bị <span className="text-[#da2c39]">*</span></label>
            <input list="tool-catalog" value={newToolName} onChange={(e) => setNewToolName(e.target.value)} className={inputClass} placeholder="Chọn hoặc nhập tên..." />
            <datalist id="tool-catalog">
              {catalog.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
        </div>
      </PartnerModal>

      <PartnerModal
        open={!!statusTool}
        title="Đổi trạng thái công cụ"
        icon={<Wrench size={20} />}
        onClose={() => setStatusTool(null)}
        footer={(
          <>
            <button type="button" onClick={() => setStatusTool(null)} className={partnerBtnNeutral}>Hủy</button>
            <button type="button" onClick={() => applyToolStatus(0)} className={partnerBtnDanger}>0 · Chưa sẵn sàng</button>
            <button type="button" onClick={() => applyToolStatus(1)} className={partnerBtnBrand}>1 · Sẵn sàng</button>
          </>
        )}
      >
        <p className="text-[12px] font-semibold text-gray-700">
          {statusTool?.name} — hiện tại: <strong>{statusTool?.status === 1 ? 'Sẵn sàng' : 'Chưa sẵn sàng'}</strong>
        </p>
      </PartnerModal>

      {preview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-full max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default PartnerVehicleDetail;
