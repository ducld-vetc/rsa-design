import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft,
  Download,
  FileSpreadsheet,
  Info,
  Plus,
  Search,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PartnerScopeBar, { getStoredPersona } from '../components/PartnerScopeBar';
import { FileDrop, PartnerModal, partnerBtnBrand, partnerBtnNeutral, partnerInputClass as inputClass, partnerLabelClass } from '../components/PartnerModal';
import {
  PARTNER_STAFF,
  STATION_OPTIONS,
  VEHICLES,
  VEHICLE_TYPE_LABEL,
  driverName,
  inScope,
  nextHnl,
  orgName,
  registerTransfer,
  registerVehicle,
  toolsFor,
  updateVehicle,
  type PartnerPersona,
  type VehicleRecord,
  type VehicleType,
} from '../data/partnerRescueMockData';

type ListTab = 'all' | 'due' | 'idle' | 'tools';

const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

const filterBtnClass = (active: boolean) =>
  `px-4 py-1.5 rounded text-xs font-bold border transition-all ${
    active
      ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green hover:text-vetc-green'
  }`;

const fieldClass = 'flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green bg-white';

const IMPORT_HEADERS = [
  'Biển số',
  'Hãng',
  'Dòng xe',
  'Số khung',
  'Số máy',
  'Năm SX',
  'Loại xe',
  'Trạm',
  'Tài xế',
  'Trọng tải',
  'Số chỗ',
  'Trọng tải cẩu kéo tối đa',
  'Tải trọng cầu nâng',
  'Tình trạng',
] as const;

type ImportPreviewRow = {
  plate: string;
  brand: VehicleRecord['brand'];
  modelLine: string;
  chassis: string;
  engineNo: string;
  year: number;
  type: VehicleType;
  stationId: string;
  driverId: string | null;
  loadCarry: string;
  loadCrane: string;
  loadLift: string;
  seats: string;
  runStatus: VehicleRecord['runStatus'];
  error?: string;
};

const TYPE_BY_LABEL: Record<string, VehicleType> = Object.fromEntries(
  (Object.entries(VEHICLE_TYPE_LABEL) as [VehicleType, string][]).map(([k, v]) => [v.toLowerCase(), k])
);

const cell = (row: Record<string, unknown>, ...keys: string[]) => {
  const map = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), v])
  );
  for (const key of keys) {
    const v = map[key.toLowerCase()];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const isBlankImportRow = (row: Record<string, unknown>) =>
  Object.values(row).every((v) => String(v ?? '').trim() === '');

const parseBrand = (raw: string): VehicleRecord['brand'] => {
  const v = raw.toLowerCase();
  if (v.includes('hino')) return 'Hino';
  if (v.includes('dongfeng')) return 'Dongfeng';
  if (v.includes('isuzu')) return 'Isuzu';
  return 'Isuzu';
};

const parseType = (raw: string): VehicleType | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return 'san_truot';
  if (TYPE_BY_LABEL[v]) return TYPE_BY_LABEL[v];
  if (v === 'san_truot' || v === 'san_nang_truot' || v === 'san_truot_cau') return v;
  return null;
};

const parseStation = (raw: string): string | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  const hit = STATION_OPTIONS.find((s) => s.id === raw.trim() || s.name.toLowerCase() === v || s.name.toLowerCase().includes(v));
  return hit?.id ?? null;
};

const parseDriver = (raw: string, stationId: string): string | null => {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  return PARTNER_STAFF.find((s) => s.role === 'NVCH' && s.stationId === stationId && s.fullname.toLowerCase() === v)?.id ?? null;
};

const parseImportRows = (rows: Record<string, unknown>[], existingPlates: Set<string>): ImportPreviewRow[] =>
  rows.filter((row) => !isBlankImportRow(row)).map((row) => {
    const plate = cell(row, 'Biển số', 'Bien so', 'plate');
    const type = parseType(cell(row, 'Loại xe', 'Loai xe'));
    const stationId = parseStation(cell(row, 'Trạm', 'Tram'));
    const runRaw = cell(row, 'Tình trạng', 'Tinh trang').toLowerCase();
    const runStatus: VehicleRecord['runStatus'] = runRaw.includes('sửa') || runRaw === 'repair' ? 'repair' : 'active';
    const year = Number(cell(row, 'Năm SX', 'Nam SX')) || new Date().getFullYear();
    let error = '';
    if (!plate) error = 'Thiếu biển số';
    else if (existingPlates.has(plate.toLowerCase())) error = 'Biển số đã tồn tại';
    else if (!type) error = 'Loại xe không hợp lệ';
    else if (!stationId) error = 'Không khớp trạm';
    return {
      plate,
      brand: parseBrand(cell(row, 'Hãng', 'Hang xe', 'Hãng xe')),
      modelLine: cell(row, 'Dòng xe', 'Dong xe') || '—',
      chassis: cell(row, 'Số khung', 'So khung') || '—',
      engineNo: cell(row, 'Số máy', 'So may') || '—',
      year,
      type: type ?? 'san_truot',
      stationId: stationId ?? '',
      driverId: stationId ? parseDriver(cell(row, 'Tài xế', 'Tai xe'), stationId) : null,
      loadCarry: cell(row, 'Trọng tải', 'Tai trọng chở', 'Tải trọng chở') || '—',
      loadCrane: cell(row, 'Trọng tải cẩu kéo tối đa', 'Tải trọng cẩu', 'Tai trọng cẩu') || '—',
      loadLift: cell(row, 'Tải trọng cầu nâng') || '—',
      seats: cell(row, 'Số chỗ', 'So cho') || '—',
      runStatus,
      error: error || undefined,
    };
  });

const downloadVehicleTemplate = () => {
  const sample = [
    {
      'Biển số': '29C-999.01',
      'Hãng': 'Isuzu',
      'Dòng xe': 'NPR 400',
      'Số khung': 'JALC4B16X07009901',
      'Số máy': '4HK1-990011',
      'Năm SX': 2024,
      'Loại xe': 'Sàn trượt, cẩu',
      'Trạm': 'Trạm Hoàng Mai',
      'Tài xế': 'Ngô Đức Anh',
      'Trọng tải': '5 tấn',
      'Số chỗ': '3',
      'Trọng tải cẩu kéo tối đa': '8 tấn',
      'Tải trọng cầu nâng': '',
      'Tình trạng': 'Đang hoạt động',
    },
    {
      'Biển số': '30F-888.02',
      'Hãng': 'Hino',
      'Dòng xe': 'XZU 720',
      'Số khung': 'JHHFC2J5XK0008802',
      'Số máy': 'N04C-880022',
      'Năm SX': 2023,
      'Loại xe': 'Sàn trượt',
      'Trạm': 'Trạm Hà Đông',
      'Tài xế': '',
      'Trọng tải': '3.5 tấn',
      'Số chỗ': '2',
      'Trọng tải cẩu kéo tối đa': '5 tấn',
      'Tải trọng cầu nâng': '',
      'Tình trạng': 'Đang sửa chữa',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: [...IMPORT_HEADERS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachXe');
  XLSX.writeFile(wb, 'mau_import_phuong_tien.xlsx');
};

const PartnerVehicleList: React.FC = () => {
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PartnerPersona>(getStoredPersona);
  const [listTab, setListTab] = useState<ListTab>('all');
  const [plate, setPlate] = useState('');
  const [hnl, setHnl] = useState('');
  const [modelLine, setModelLine] = useState('');
  const [stationId, setStationId] = useState('');
  const [type, setType] = useState('');
  const [runStatus, setRunStatus] = useState('');

  const [vehicles, setVehicles] = useState<VehicleRecord[]>(VEHICLES);
  const [transferOf, setTransferOf] = useState<VehicleRecord | null>(null);
  const [transferTo, setTransferTo] = useState('');
  const [reason, setReason] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importError, setImportError] = useState('');
  const canTransfer = persona.role !== 'NVCH' && persona.role !== 'KT';

  const scoped = useMemo(() => {
    let rows = vehicles.filter((v) => inScope(persona, v.stationId));
    if (persona.role === 'NVCH') rows = rows.filter((v) => v.id === 'v1');
    if (plate.trim()) rows = rows.filter((v) => v.plate.toLowerCase().includes(plate.trim().toLowerCase()));
    if (hnl.trim()) rows = rows.filter((v) => String(v.hnl).includes(hnl.trim()));
    if (modelLine.trim()) rows = rows.filter((v) => v.modelLine.toLowerCase().includes(modelLine.trim().toLowerCase()));
    if (stationId) rows = rows.filter((v) => v.stationId === stationId);
    if (type) rows = rows.filter((v) => v.type === type);
    if (runStatus) rows = rows.filter((v) => v.runStatus === runStatus);
    if (listTab === 'due') {
      rows = rows.filter(
        (v) =>
          v.inspectionDueDays < 30 ||
          v.maintenanceDueDays < 7 ||
          v.gplhDueDays < 7 ||
          v.tndsDueDays < 7 ||
          v.physicalInsDueDays < 15
      );
    }
    if (listTab === 'idle') rows = rows.filter((v) => v.idleHours > 72);
    if (listTab === 'tools') rows = rows.filter((v) => v.tools.some((t) => t.status === 0));
    return rows;
  }, [persona, plate, hnl, modelLine, stationId, type, runStatus, listTab, vehicles]);

  const openDetail = (id: string) => navigate(`/partner/vehicles/${id}`);

  const closeTransfer = () => {
    setTransferOf(null);
    setTransferTo('');
    setReason('');
  };

  const confirmTransfer = () => {
    if (!transferOf || !transferTo) return;
    registerTransfer({
      id: `t-${Date.now()}`,
      vehicleId: transferOf.id,
      fromStationId: transferOf.stationId,
      toStationId: transferTo,
      transferredAt: new Date().toLocaleString('vi-VN'),
      byName: persona.title,
      reason: reason || 'Điều chuyển trạm',
    });
    updateVehicle(transferOf.id, { stationId: transferTo, driverId: null });
    setVehicles((prev) => prev.map((v) => (v.id === transferOf.id ? { ...v, stationId: transferTo, driverId: null } : v)));
    closeTransfer();
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportRows([]);
    setImportError('');
  };

  const onImportFile = async (file: File | null) => {
    setImportFile(file);
    setImportRows([]);
    setImportError('');
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        setImportError('File không có sheet dữ liệu.');
        return;
      }
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' }).filter((row) => !isBlankImportRow(row));
      if (json.length === 0) {
        setImportError('Không có dòng dữ liệu. Dùng file mẫu để xem cột bắt buộc.');
        return;
      }
      const existing = new Set(vehicles.map((v) => v.plate.toLowerCase()));
      const parsed = parseImportRows(json, existing);
      const seen = new Set<string>();
      parsed.forEach((r) => {
        const key = r.plate.toLowerCase();
        if (r.plate && seen.has(key) && !r.error) r.error = 'Trùng biển số trong file';
        if (r.plate) seen.add(key);
      });
      setImportRows(parsed);
    } catch {
      setImportError('Không đọc được file. Chỉ hỗ trợ .xlsx, .xls, .csv.');
    }
  };

  const confirmImport = () => {
    const valid = importRows.filter((r) => !r.error);
    if (valid.length === 0) return;
    let hnl = nextHnl(vehicles);
    const created: VehicleRecord[] = valid.map((r, i) => ({
      id: `v-imp-${Date.now()}-${i}`,
      plate: r.plate,
      hnl: hnl++,
      brand: r.brand,
      modelLine: r.modelLine,
      chassis: r.chassis,
      engineNo: r.engineNo,
      year: r.year,
      stationId: r.stationId,
      driverId: r.driverId,
      type: r.type,
      loadCarry: r.loadCarry,
      loadCrane: r.loadCrane,
      loadLift: r.loadLift,
      seats: r.seats,
      runStatus: r.runStatus,
      idleHours: 0,
      inspectionDueDays: 365,
      maintenanceDueDays: 30,
      gplhDueDays: 365,
      tndsDueDays: 365,
      physicalInsDueDays: 365,
      tools: toolsFor(r.type),
      revenueMonth: 0,
    }));
    created.slice().reverse().forEach(registerVehicle);
    setVehicles((prev) => [...created, ...prev]);
    closeImport();
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Danh sách phương tiện</h1>

      <PartnerScopeBar persona={persona} onChange={setPersona} />

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Biển số</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="29C-123.45"
                className={fieldClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Mã HNL</label>
              <input
                type="text"
                value={hnl}
                onChange={(e) => setHnl(e.target.value)}
                placeholder="21"
                className={fieldClass}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Trạm cứu hộ</label>
              <select value={stationId} onChange={(e) => setStationId(e.target.value)} className={fieldClass}>
                <option value="">Tất cả</option>
                {STATION_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Loại xe</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
                <option value="">Tất cả</option>
                {(Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]).map((t) => (
                  <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Tình trạng</label>
              <select value={runStatus} onChange={(e) => setRunStatus(e.target.value)} className={fieldClass}>
                <option value="">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="repair">Đang sửa chữa</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="w-28 shrink-0 text-xs font-semibold text-gray-600">Dòng xe</label>
              <input
                type="text"
                value={modelLine}
                onChange={(e) => setModelLine(e.target.value)}
                placeholder="NPR 400"
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm">
                <FileSpreadsheet size={16} />
                <span>Xuất Excel</span>
              </button>
              {persona.role !== 'NVCH' && (
                <>
                  <button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    className="flex items-center space-x-2 border border-vetc-green bg-white text-vetc-green px-5 py-2 rounded font-bold text-sm hover:bg-green-50 transition-all shadow-sm"
                  >
                    <Download size={16} />
                    <span>Import Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/partner/vehicles/new')}
                    className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    <span>Thêm xe</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {(
                [
                  ['all', 'Tất cả'],
                  ['due', 'Nhắc hạn'],
                  ['idle', 'Không chạy'],
                  ['tools', 'Công cụ lỗi'],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setListTab(id)} className={filterBtnClass(listTab === id)}>
                  {label}
                </button>
              ))}
              <button type="button" className="flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm ml-1">
                <Search size={16} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white w-full min-w-0">
        <SectionHeader title="Kết quả tìm kiếm" />
        <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar">
          <table className="w-full text-xs border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600">
                <th className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                <th className="px-3 py-2 text-center w-24 font-bold border-r">Hành động</th>
                <th className="px-3 py-2 text-left font-bold border-r">Xe</th>
                <th className="px-3 py-2 text-left font-bold border-r">Trạm</th>
                <th className="px-3 py-2 text-left font-bold border-r">Loại</th>
                <th className="px-3 py-2 text-left font-bold border-r">Tài xế</th>
                <th className="px-3 py-2 text-center font-bold border-r">Tình trạng</th>
                <th className="px-3 py-2 text-left font-bold border-r">Nhắc hạn</th>
                <th className="px-3 py-2 text-left font-bold border-r">Không chạy</th>
                <th className="px-3 py-2 text-left font-bold">Công cụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scoped.map((v, index) => {
                const worstDue = Math.min(
                  v.inspectionDueDays,
                  v.maintenanceDueDays,
                  v.gplhDueDays,
                  v.tndsDueDays,
                  v.physicalInsDueDays
                );
                const broken = v.tools.filter((t) => t.status === 0).length;
                return (
                  <tr key={v.id} className="hover:bg-gray-50/80 align-top">
                    <td className="px-3 py-3 text-center border-r text-gray-600">{index + 1}</td>
                    <td className="px-3 py-3 border-r">
                      <div className="flex items-center justify-center gap-2">
                        {canTransfer && (
                          <button
                            type="button"
                            onClick={() => { setTransferOf(v); setTransferTo(''); setReason(''); }}
                            className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
                            title="Điều chuyển"
                          >
                            <ArrowRightLeft size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetail(v.id)}
                          className="text-orange-500 hover:bg-orange-50 p-1 rounded transition-colors"
                          title="Xem chi tiết"
                        >
                          <Info size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r">
                      <div className="font-bold text-gray-800">{v.plate}</div>
                      <div className="text-[10px] text-gray-400">HNL {v.hnl} · {v.brand} {v.modelLine}</div>
                    </td>
                    <td className="px-3 py-3 border-r font-medium text-gray-700">{orgName(v.stationId)}</td>
                    <td className="px-3 py-3 border-r">{VEHICLE_TYPE_LABEL[v.type]}</td>
                    <td className="px-3 py-3 border-r text-gray-700">{driverName(v.driverId)}</td>
                    <td className="px-3 py-3 border-r text-center">
                      {v.runStatus === 'active' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-green-50 text-green-700 border-green-200">Đang hoạt động</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">Đang sửa chữa</span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r">
                      {worstDue < 30 ? (
                        <span className="font-bold text-amber-600">Còn {worstDue} ngày</span>
                      ) : (
                        <span className="text-gray-500">Ổn</span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r">
                      {v.idleHours > 168 ? (
                        <span className="font-bold text-red-600">{v.idleHours}h</span>
                      ) : v.idleHours > 72 ? (
                        <span className="font-bold text-amber-600">{v.idleHours}h</span>
                      ) : (
                        <span className="text-gray-500">{v.idleHours}h</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-bold">
                      {broken > 0 ? <span className="text-red-600">{broken} món lỗi</span> : <span className="text-emerald-600">OK</span>}
                    </td>
                  </tr>
                );
              })}
              {scoped.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-gray-400">Không có xe trong phạm vi đăng nhập</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PartnerModal
        open={!!transferOf}
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
        <p className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
          Chỉ chuyển <strong>trạm → trạm</strong>{transferOf ? ` · ${transferOf.plate}` : ''}.
        </p>
        <div className="space-y-3">
          <div>
            <label className={partnerLabelClass}>Từ trạm</label>
            <input readOnly value={transferOf ? orgName(transferOf.stationId) : ''} className={`${inputClass} bg-gray-50 text-gray-400`} />
          </div>
          <div>
            <label className={partnerLabelClass}>Đến trạm <span className="text-[#da2c39]">*</span></label>
            <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className={inputClass}>
              <option value="">Chọn trạm đích...</option>
              {STATION_OPTIONS.filter((s) => s.id !== transferOf?.stationId && inScope(persona, s.id)).map((s) => (
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
        open={importOpen}
        title="Import Excel phương tiện"
        icon={<FileSpreadsheet size={20} />}
        wide
        xl
        onClose={closeImport}
        footer={(
          <>
            <button type="button" onClick={closeImport} className={partnerBtnNeutral}>Hủy</button>
            <button
              type="button"
              onClick={confirmImport}
              disabled={importRows.filter((r) => !r.error).length === 0}
              className={partnerBtnBrand}
            >
              Nạp {importRows.filter((r) => !r.error).length} xe
            </button>
          </>
        )}
      >
        <p className="mb-3 text-[11px] text-gray-500">
          Tải file mẫu, điền danh sách xe rồi upload. HNL hệ thống tự cấp. Dòng lỗi sẽ bị bỏ qua khi nạp.
        </p>
        <button
          type="button"
          onClick={downloadVehicleTemplate}
          className="mb-4 inline-flex items-center gap-1.5 rounded border border-vetc-green px-3 py-1.5 text-[11px] font-bold text-vetc-green hover:bg-green-50"
        >
          <Download size={14} /> Tải file mẫu
        </button>
        <FileDrop accept=".xlsx,.xls,.csv" file={importFile} hint="xlsx, xls, csv" onFile={(f) => { void onImportFile(f); }} />
        {importError && <p className="mt-3 text-[12px] font-semibold text-red-600">{importError}</p>}
        {importRows.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-2 py-1.5 whitespace-nowrap">Biển số</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Hãng</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Dòng xe</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Số khung</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Trọng tải</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Số chỗ</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Cẩu kéo tối đa</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Trạm</th>
                  <th className="px-2 py-1.5 whitespace-nowrap">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {importRows.map((r, i) => (
                  <tr key={`${r.plate}-${i}`} className="border-t border-gray-100">
                    <td className="px-2 py-1.5 font-bold whitespace-nowrap">{r.plate || '—'}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.brand}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.modelLine}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.chassis}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.loadCarry}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.seats}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.loadCrane}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{r.stationId ? orgName(r.stationId) : '—'}</td>
                    <td className={`px-2 py-1.5 font-bold whitespace-nowrap ${r.error ? 'text-red-600' : 'text-emerald-600'}`}>
                      {r.error ?? 'Hợp lệ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PartnerModal>
    </div>
  );
};

export default PartnerVehicleList;
