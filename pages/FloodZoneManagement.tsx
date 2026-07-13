import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Plus,
  Upload,
  Download,
  List,
  Map as MapIcon,
  Waves,
  X,
  Trash2,
  Eye,
  Loader2,
  MapPin,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  INITIAL_FLOOD_ZONES,
  FLOOD_RADIUS_OPTIONS,
  FLOOD_SEVERITY_LABELS,
  FLOOD_SOURCE_LABELS,
  FLOOD_STATUS_LABELS,
  FLOOD_MAP_DEFAULT_CENTER,
  FLOOD_MAP_DEFAULT_ZOOM,
  FLOOD_EXCEL_TEMPLATE_COLUMNS,
  FLOOD_EXCEL_TEMPLATE_NOTE,
  MOCK_FLOOD_EXCEL_PREVIEW,
  type FloodZone,
  type FloodSeverity,
  type FloodZoneSource,
  type FloodZoneStatus,
  type FloodExcelPreviewRow,
  type LatLngTuple,
  severityCircleColor,
  formatFloodDateTime,
  defaultValidToIso,
} from '../data/floodZoneMockData';

type ViewMode = 'list' | 'map';

const GREEN = '#00A859';

const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode; right?: React.ReactNode }> = ({
  title,
  icon,
  right,
}) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center justify-between font-bold text-sm uppercase tracking-wide">
    <div className="flex items-center space-x-2">
      {icon}
      <span>{title}</span>
    </div>
    {right}
  </div>
);

const SeverityBadge: React.FC<{ severity: FloodSeverity }> = ({ severity }) => {
  const styles =
    severity === 'high'
      ? 'bg-red-50 text-red-700 border-red-200'
      : severity === 'medium'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wide whitespace-nowrap shrink-0 leading-none ${styles}`}
    >
      {FLOOD_SEVERITY_LABELS[severity]}
    </span>
  );
};

const StatusBadge: React.FC<{ status: FloodZoneStatus }> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black border whitespace-nowrap shrink-0 leading-none bg-green-50 text-green-700 border-green-200">
        {FLOOD_STATUS_LABELS.active}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-black border whitespace-nowrap shrink-0 leading-none bg-gray-100 text-gray-600 border-gray-200">
      {FLOOD_STATUS_LABELS.expired}
    </span>
  );
};

const centerMarkerIcon = L.divIcon({
  html: `<div style="position:relative;width:28px;height:28px">
    <div style="width:22px;height:22px;background:${GREEN};border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);position:absolute;left:3px;top:0;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 26],
});

const pickMarkerIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#DC2626;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapResizeFix: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t1 = setTimeout(fix, 100);
    const t2 = setTimeout(fix, 400);
    window.addEventListener('resize', fix);
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', fix);
      ro.disconnect();
    };
  }, [map]);
  return null;
};

const MapClickPicker: React.FC<{ enabled: boolean; onPick: (latlng: LatLngTuple) => void }> = ({
  enabled,
  onPick,
}) => {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const FlyToSelected: React.FC<{ zone: FloodZone | null }> = ({ zone }) => {
  const map = useMap();
  useEffect(() => {
    if (zone) {
      map.flyTo(zone.center, 15, { duration: 0.7 });
    }
  }, [zone, map]);
  return null;
};

interface CreateFormState {
  name: string;
  address: string;
  lat: string;
  lng: string;
  radius_m: 200 | 300 | 500;
  severity: FloodSeverity;
  valid_to: string;
  note: string;
}

const emptyCreateForm = (): CreateFormState => ({
  name: '',
  address: '',
  lat: '',
  lng: '',
  radius_m: 300,
  severity: 'medium',
  valid_to: defaultValidToIso(12),
  note: '',
});

const FloodZoneManagement: React.FC = () => {
  const [zones, setZones] = useState<FloodZone[]>(INITIAL_FLOOD_ZONES);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const [searchDraft, setSearchDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<'all' | FloodZoneStatus>('active');
  const [severityDraft, setSeverityDraft] = useState<'all' | FloodSeverity>('all');
  const [sourceDraft, setSourceDraft] = useState<'all' | FloodZoneSource>('all');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FloodZoneStatus>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | FloodSeverity>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | FloodZoneSource>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm());
  const [createError, setCreateError] = useState('');

  const [detailZone, setDetailZone] = useState<FloodZone | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<FloodZone | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [previewRows, setPreviewRows] = useState<FloodExcelPreviewRow[] | null>(null);

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return zones.filter((z) => {
      if (statusFilter !== 'all' && z.status !== statusFilter) return false;
      if (severityFilter !== 'all' && z.severity !== severityFilter) return false;
      if (sourceFilter !== 'all' && z.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        z.id.toLowerCase().includes(q) ||
        z.name.toLowerCase().includes(q) ||
        z.address.toLowerCase().includes(q) ||
        (z.note ?? '').toLowerCase().includes(q)
      );
    });
  }, [zones, search, statusFilter, severityFilter, sourceFilter]);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedId) ?? null,
    [zones, selectedId]
  );

  const activeCount = zones.filter((z) => z.status === 'active').length;

  const applyFilters = () => {
    setSearch(searchDraft);
    setStatusFilter(statusDraft);
    setSeverityFilter(severityDraft);
    setSourceFilter(sourceDraft);
  };

  const clearFilters = () => {
    setSearchDraft('');
    setStatusDraft('active');
    setSeverityDraft('all');
    setSourceDraft('all');
    setSearch('');
    setStatusFilter('active');
    setSeverityFilter('all');
    setSourceFilter('all');
  };

  const openCreate = () => {
    setCreateForm(emptyCreateForm());
    setCreateError('');
    setIsCreateOpen(true);
  };

  const handleCreatePick = (latlng: LatLngTuple) => {
    setCreateForm((prev) => ({
      ...prev,
      lat: latlng[0].toFixed(6),
      lng: latlng[1].toFixed(6),
      address: prev.address || `Điểm ${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}`,
    }));
  };

  const handleSaveCreate = () => {
    const lat = Number.parseFloat(createForm.lat);
    const lng = Number.parseFloat(createForm.lng);
    if (!createForm.name.trim()) {
      setCreateError('Vui lòng nhập tên khu vực ngập.');
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCreateError('Vui lòng chọn điểm trên bản đồ hoặc nhập tọa độ hợp lệ.');
      return;
    }
    if (!createForm.valid_to) {
      setCreateError('Vui lòng chọn thời hạn hiệu lực.');
      return;
    }

    const id = `FZ-CMS-${Date.now().toString().slice(-6)}`;
    const newZone: FloodZone = {
      id,
      name: createForm.name.trim(),
      address: createForm.address.trim() || `Lat ${lat}, Lng ${lng}`,
      center: [lat, lng],
      radius_m: createForm.radius_m,
      severity: createForm.severity,
      source: 'cms',
      status: 'active',
      valid_to: createForm.valid_to.length === 16 ? `${createForm.valid_to}:00` : createForm.valid_to,
      report_count: 0,
      created_at: new Date().toISOString().slice(0, 19),
      created_by: 'ops_demo',
      note: createForm.note.trim() || undefined,
    };

    setZones((prev) => [newZone, ...prev]);
    setSelectedId(id);
    setIsCreateOpen(false);
    setViewMode('map');
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    const now = new Date().toISOString().slice(0, 19);
    setZones((prev) =>
      prev.map((z) =>
        z.id === deactivateTarget.id
          ? { ...z, status: 'expired', expired_at: now, expired_by: 'ops_manual' }
          : z
      )
    );
    if (selectedId === deactivateTarget.id) setSelectedId(null);
    if (detailZone?.id === deactivateTarget.id) setDetailZone(null);
    setDeactivateTarget(null);
  };

  const handleDownloadTemplate = () => {
    const header = FLOOD_EXCEL_TEMPLATE_COLUMNS.join(',');
    const sample = [
      'Ngập mẫu — Nguyễn Trãi,21.0012,105.8145,300,high,2026-07-14T18:00:00,Ghi chú demo',
      'Ngập mẫu — Vĩnh Tuy,21.0158,105.8751,200,medium,2026-07-14T12:00:00,',
    ].join('\n');
    const blob = new Blob([`# ${FLOOD_EXCEL_TEMPLATE_NOTE}\n${header}\n${sample}\n`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flood_zone_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = async (file: File) => {
    setUploadFileName(file.name);
    setIsUploadProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setPreviewRows(MOCK_FLOOD_EXCEL_PREVIEW.map((r) => ({ ...r })));
    } finally {
      setIsUploadProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewRows) return;
    const valid = previewRows.filter((r) => !r.error);
    if (valid.length === 0) {
      window.alert('Không có dòng hợp lệ để import.');
      return;
    }
    const now = new Date().toISOString().slice(0, 19);
    const imported: FloodZone[] = valid.map((r, idx) => ({
      id: `FZ-XLS-${Date.now().toString().slice(-5)}${idx}`,
      name: r.name,
      address: `Import Excel · ${r.lat}, ${r.lng}`,
      center: [r.lat, r.lng] as LatLngTuple,
      radius_m: r.radius_m,
      severity: r.severity,
      source: 'cms' as const,
      status: 'active' as const,
      valid_to: r.valid_to,
      report_count: 0,
      created_at: now,
      created_by: 'excel_import',
      note: r.note,
    }));
    setZones((prev) => [...imported, ...prev]);
    setPreviewRows(null);
    setUploadFileName('');
    setViewMode('list');
    setStatusFilter('active');
  };

  const inputClass =
    'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';

  const createCenter: LatLngTuple | null =
    createForm.lat && createForm.lng && !Number.isNaN(Number(createForm.lat)) && !Number.isNaN(Number(createForm.lng))
      ? [Number(createForm.lat), Number(createForm.lng)]
      : null;

  const renderZoneCircles = (list: FloodZone[], interactive = true) =>
    list.map((z) => {
      const color = severityCircleColor(z.severity);
      const opacity = z.status === 'active' ? 0.22 : 0.08;
      return (
        <React.Fragment key={z.id}>
          <Circle
            center={z.center}
            radius={z.radius_m}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: opacity,
              weight: selectedId === z.id ? 3 : 1.5,
              dashArray: z.status === 'expired' ? '6 6' : undefined,
            }}
            eventHandlers={
              interactive
                ? {
                    click: () => setSelectedId(z.id),
                  }
                : undefined
            }
          />
          <Marker
            position={z.center}
            icon={centerMarkerIcon}
            eventHandlers={
              interactive
                ? {
                    click: () => setSelectedId(z.id),
                  }
                : undefined
            }
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                <div className="font-bold text-gray-900">{z.name}</div>
                <div className="text-gray-500">{z.id} · {z.radius_m}m</div>
                <div className="flex items-center gap-1 pt-1">
                  <SeverityBadge severity={z.severity} />
                  <StatusBadge status={z.status} />
                </div>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      );
    });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full h-[calc(100vh-180px)] min-h-[560px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            <Waves size={20} className="text-blue-600" />
            Quản lý khu vực ngập lụt
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Khu vực = tâm điểm + bán kính cố định · {activeCount} khu vực đang hiệu lực
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden shadow-sm self-start">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors ${
              viewMode === 'list' ? 'bg-vetc-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List size={15} />
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold transition-colors border-l ${
              viewMode === 'map' ? 'bg-vetc-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapIcon size={15} />
            Bản đồ
          </button>
        </div>
      </div>

      {/* Tra cứu — 1 hàng */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-3 py-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 min-w-[240px] items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
                placeholder="Tìm khu vực..."
                className="w-full h-8 border border-gray-200 rounded-md pl-8 pr-2.5 text-xs outline-none focus:border-vetc-green bg-gray-50 focus:bg-white"
              />
            </div>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value as typeof statusDraft)}
              className="flex-1 min-w-0 h-8 border border-gray-200 rounded-md px-2 text-xs bg-gray-50 outline-none focus:border-vetc-green focus:bg-white"
              title="Trạng thái"
            >
              <option value="all">Tất cả TT</option>
              <option value="active">Đang hiệu lực</option>
              <option value="expired">Đã hết hạn</option>
            </select>
            <select
              value={severityDraft}
              onChange={(e) => setSeverityDraft(e.target.value as typeof severityDraft)}
              className="flex-1 min-w-0 h-8 border border-gray-200 rounded-md px-2 text-xs bg-gray-50 outline-none focus:border-vetc-green focus:bg-white"
              title="Mức độ"
            >
              <option value="all">Mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
            <select
              value={sourceDraft}
              onChange={(e) => setSourceDraft(e.target.value as typeof sourceDraft)}
              className="flex-1 min-w-0 h-8 border border-gray-200 rounded-md px-2 text-xs bg-gray-50 outline-none focus:border-vetc-green focus:bg-white"
              title="Nguồn"
            >
              <option value="all">Nguồn</option>
              <option value="cms">CMS</option>
              <option value="ihanoi">iHanoi</option>
              <option value="order_cluster">Cụm đơn</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="inline-flex items-center justify-center gap-1.5 h-8 bg-vetc-green text-white px-3 rounded-md font-bold text-xs hover:bg-green-700 shadow-sm shrink-0"
          >
            <Search size={13} />
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green shrink-0"
            title="Xóa lọc"
          >
            <Trash2 size={13} />
          </button>

          <div className="hidden md:block w-px h-5 bg-gray-200 shrink-0" aria-hidden />

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-1.5 h-8 bg-vetc-green text-white px-3 rounded-md font-bold text-xs hover:bg-green-700 shadow-sm"
            >
              <Plus size={13} />
              Tạo điểm
            </button>
            <button
              type="button"
              disabled={isUploadProcessing}
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md font-bold text-xs border transition-all ${
                isUploadProcessing
                  ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-wait'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green hover:text-vetc-green'
              }`}
            >
              {isUploadProcessing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              Excel
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
              title="Tải template Excel"
            >
              <Download size={13} />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileSelected(file);
          e.target.value = '';
        }}
      />

      {/* List view */}
      {viewMode === 'list' && (
        <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden flex flex-col flex-1 min-h-0">
          <SectionHeader
            title={`Danh sách khu vực (${filteredZones.length})`}
            icon={<FileSpreadsheet size={16} />}
          />
          <div className="w-full flex-1 min-h-0 overflow-auto overscroll-contain custom-scrollbar">
            <table className="w-full text-xs border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600">
                  <th className="px-3 py-2 text-center w-10 font-bold border-r">STT</th>
                  <th className="px-3 py-2 text-center w-28 font-bold border-r">Thao tác</th>
                  <th className="px-3 py-2 text-left font-bold border-r">Mã khu vực</th>
                  <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Tên / Địa chỉ</th>
                  <th className="px-3 py-2 text-center font-bold border-r">Tâm (lat, lng)</th>
                  <th className="px-3 py-2 text-center font-bold border-r">Bán kính</th>
                  <th className="px-3 py-2 text-center font-bold border-r">Mức độ</th>
                  <th className="px-3 py-2 text-center font-bold border-r">Nguồn</th>
                  <th className="px-3 py-2 text-center font-bold border-r">Report</th>
                  <th className="px-3 py-2 text-left font-bold border-r">Hết hạn</th>
                  <th className="px-3 py-2 text-center font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-gray-400 font-medium">
                      Không có khu vực phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredZones.map((z, idx) => (
                    <tr
                      key={z.id}
                      className={`border-b hover:bg-green-50/40 transition-colors ${
                        selectedId === z.id ? 'bg-green-50' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center border-r text-gray-500">{idx + 1}</td>
                      <td className="px-2 py-2 border-r">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Xem chi tiết"
                            onClick={() => {
                              setDetailZone(z);
                              setSelectedId(z.id);
                            }}
                            className="p-1.5 rounded border border-gray-200 text-gray-600 hover:border-vetc-green hover:text-vetc-green"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            title="Xem trên bản đồ"
                            onClick={() => {
                              setSelectedId(z.id);
                              setViewMode('map');
                            }}
                            className="p-1.5 rounded border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                          >
                            <MapPin size={13} />
                          </button>
                          {z.status === 'active' && (
                            <button
                              type="button"
                              title="Gỡ cảnh báo"
                              onClick={() => setDeactivateTarget(z)}
                              className="p-1.5 rounded border border-red-100 text-red-600 hover:bg-red-50"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 border-r font-mono font-semibold text-gray-700">{z.id}</td>
                      <td className="px-3 py-2.5 border-r">
                        <div className="font-bold text-gray-900">{z.name}</div>
                        <div className="text-gray-500 mt-0.5">{z.address}</div>
                      </td>
                      <td className="px-3 py-2.5 text-center border-r font-mono text-gray-600">
                        {z.center[0].toFixed(5)}, {z.center[1].toFixed(5)}
                      </td>
                      <td className="px-3 py-2.5 text-center border-r font-bold">{z.radius_m}m</td>
                      <td className="px-3 py-2.5 text-center border-r">
                        <SeverityBadge severity={z.severity} />
                      </td>
                      <td className="px-3 py-2.5 text-center border-r text-gray-700">
                        {FLOOD_SOURCE_LABELS[z.source]}
                      </td>
                      <td className="px-3 py-2.5 text-center border-r font-bold">{z.report_count}</td>
                      <td className="px-3 py-2.5 border-r text-gray-600 whitespace-nowrap">
                        {formatFloodDateTime(z.valid_to)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge status={z.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col flex-1 min-h-0">
          <SectionHeader
            title="Bản đồ cảnh báo ngập"
            icon={<MapIcon size={16} />}
            right={
              <span className="text-[10px] font-medium normal-case tracking-normal opacity-90">
                Click marker / vòng tròn để chọn khu vực
              </span>
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] flex-1 min-h-0">
            <div className="border-r overflow-y-auto min-h-0 max-h-[280px] lg:max-h-none bg-white">
              <div className="sticky top-0 z-10 px-3 py-2 bg-gray-50/95 backdrop-blur border-b text-[10px] font-bold uppercase tracking-wide text-gray-500">
                Khu vực ({filteredZones.length})
              </div>
              {filteredZones.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">Không có khu vực</div>
              ) : (
                filteredZones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedId(z.id)}
                    className={`w-full text-left px-3 py-2.5 border-b border-gray-100 transition-colors ${
                      selectedId === z.id
                        ? 'bg-emerald-50 border-l-[3px] border-l-vetc-green'
                        : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono text-gray-400">{z.id}</div>
                        <div className="text-xs font-bold text-gray-900 truncate leading-snug">{z.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {z.radius_m}m · {FLOOD_SOURCE_LABELS[z.source]}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <SeverityBadge severity={z.severity} />
                          {z.status === 'expired' && <StatusBadge status={z.status} />}
                        </div>
                      </div>
                      {z.status === 'active' && (
                        <button
                          type="button"
                          title="Gỡ cảnh báo"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeactivateTarget(z);
                          }}
                          className="inline-flex items-center justify-center h-6 w-6 shrink-0 rounded border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="relative min-h-[360px] h-full lg:min-h-0">
              <MapContainer
                center={selectedZone?.center ?? FLOOD_MAP_DEFAULT_CENTER}
                zoom={selectedZone ? 14 : FLOOD_MAP_DEFAULT_ZOOM}
                className="h-full w-full z-0"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapResizeFix />
                <FlyToSelected zone={selectedZone} />
                {renderZoneCircles(filteredZones)}
              </MapContainer>
              {selectedZone && (
                <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur border rounded-xl shadow-lg p-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-gray-900 text-sm">{selectedZone.name}</div>
                      <div className="text-gray-500 mt-0.5">{selectedZone.address}</div>
                      <div className="mt-2 flex flex-wrap gap-2 items-center">
                        <SeverityBadge severity={selectedZone.severity} />
                        <StatusBadge status={selectedZone.status} />
                        <span className="text-gray-500">
                          {selectedZone.radius_m}m · report {selectedZone.report_count} · hết hạn{' '}
                          {formatFloodDateTime(selectedZone.valid_to)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailZone(selectedZone)}
                      className="shrink-0 px-3 py-1.5 rounded bg-vetc-green text-white font-bold text-[11px] hover:bg-green-700"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-vetc-green p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center space-x-3">
                <Plus size={20} />
                <h3 className="font-bold text-lg">Tạo điểm ngập lụt</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 min-h-0">
              <div className="p-4 space-y-3 border-r">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-vetc-green" />
                  Click trên bản đồ để chọn tâm khu vực (không vẽ polygon). Bán kính preset 200 / 300 / 500m.
                </p>
                <div>
                  <label className={labelClass}>
                    Tên khu vực <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="VD: Ngập phố Huế"
                  />
                </div>
                <div>
                  <label className={labelClass}>Địa chỉ / mô tả vị trí</label>
                  <input
                    className={inputClass}
                    value={createForm.address}
                    onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Địa chỉ tham chiếu"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Lat <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={createForm.lat}
                      onChange={(e) => setCreateForm((p) => ({ ...p, lat: e.target.value }))}
                      placeholder="21.0285"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Lng <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={inputClass}
                      value={createForm.lng}
                      onChange={(e) => setCreateForm((p) => ({ ...p, lng: e.target.value }))}
                      placeholder="105.8452"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Mức độ</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as FloodSeverity[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCreateForm((p) => ({ ...p, severity: s }))}
                        className={`flex-1 py-2 rounded border text-xs font-bold transition-all ${
                          createForm.severity === s
                            ? s === 'high'
                              ? 'bg-red-50 border-red-400 text-red-700'
                              : s === 'medium'
                                ? 'bg-amber-50 border-amber-400 text-amber-700'
                                : 'bg-blue-50 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {FLOOD_SEVERITY_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Bán kính</label>
                  <div className="flex gap-2">
                    {FLOOD_RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCreateForm((p) => ({ ...p, radius_m: r }))}
                        className={`flex-1 py-2 rounded border text-xs font-bold transition-all ${
                          createForm.radius_m === r
                            ? 'bg-vetc-green text-white border-vetc-green'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-vetc-green'
                        }`}
                      >
                        {r}m
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    Thời hạn (valid_to) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={createForm.valid_to}
                    onChange={(e) => setCreateForm((p) => ({ ...p, valid_to: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ghi chú</label>
                  <textarea
                    className={`${inputClass} min-h-[72px] resize-y`}
                    value={createForm.note}
                    onChange={(e) => setCreateForm((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Mức nước, nguồn tin..."
                  />
                </div>
                {createError && (
                  <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    {createError}
                  </div>
                )}
              </div>

              <div className="relative min-h-[320px] h-full bg-gray-100">
                <MapContainer
                  center={createCenter ?? FLOOD_MAP_DEFAULT_CENTER}
                  zoom={createCenter ? 15 : FLOOD_MAP_DEFAULT_ZOOM}
                  className="h-full w-full min-h-[320px] z-0"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; OSM'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapResizeFix />
                  <MapClickPicker enabled onPick={handleCreatePick} />
                  {createCenter && (
                    <>
                      <Marker position={createCenter} icon={pickMarkerIcon} />
                      <Circle
                        center={createCenter}
                        radius={createForm.radius_m}
                        pathOptions={{
                          color: severityCircleColor(createForm.severity),
                          fillColor: severityCircleColor(createForm.severity),
                          fillOpacity: 0.2,
                          weight: 2,
                        }}
                      />
                    </>
                  )}
                </MapContainer>
                <div className="absolute top-3 left-3 z-[400] bg-white/90 text-[10px] font-bold text-gray-600 px-2.5 py-1.5 rounded shadow border">
                  Click bản đồ để chọn tâm
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2 shrink-0 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCreate}
                className="px-5 py-2 rounded bg-vetc-green text-white text-sm font-bold hover:bg-green-700 shadow-sm"
              >
                Tạo cảnh báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detailZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
              <div>
                <div className="text-[11px] opacity-80 font-mono">{detailZone.id}</div>
                <h3 className="font-bold text-lg">{detailZone.name}</h3>
              </div>
              <button type="button" onClick={() => setDetailZone(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X size={22} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <SeverityBadge severity={detailZone.severity} />
                <StatusBadge status={detailZone.status} />
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border bg-slate-50 text-slate-600 border-slate-200">
                  {FLOOD_SOURCE_LABELS[detailZone.source]}
                </span>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-xs">
                <dt className="text-gray-500 font-semibold">Địa chỉ</dt>
                <dd className="text-gray-800">{detailZone.address}</dd>
                <dt className="text-gray-500 font-semibold">Tâm</dt>
                <dd className="font-mono text-gray-800">
                  {detailZone.center[0].toFixed(6)}, {detailZone.center[1].toFixed(6)}
                </dd>
                <dt className="text-gray-500 font-semibold">Bán kính</dt>
                <dd className="font-bold text-gray-800">{detailZone.radius_m}m</dd>
                <dt className="text-gray-500 font-semibold">Report gắn</dt>
                <dd className="font-bold text-gray-800">{detailZone.report_count}</dd>
                <dt className="text-gray-500 font-semibold">Hết hạn</dt>
                <dd className="text-gray-800">{formatFloodDateTime(detailZone.valid_to)}</dd>
                <dt className="text-gray-500 font-semibold">Tạo lúc</dt>
                <dd className="text-gray-800">{formatFloodDateTime(detailZone.created_at)}</dd>
                {detailZone.note && (
                  <>
                    <dt className="text-gray-500 font-semibold">Ghi chú</dt>
                    <dd className="text-gray-800">{detailZone.note}</dd>
                  </>
                )}
                {detailZone.expired_by && (
                  <>
                    <dt className="text-gray-500 font-semibold">Gỡ bởi</dt>
                    <dd className="text-gray-800">
                      {detailZone.expired_by === 'ops_manual' ? 'Ops thủ công' : 'Hệ thống (TTL)'}
                      {detailZone.expired_at ? ` · ${formatFloodDateTime(detailZone.expired_at)}` : ''}
                    </dd>
                  </>
                )}
              </dl>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(detailZone.id);
                  setDetailZone(null);
                  setViewMode('map');
                }}
                className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white"
              >
                Xem trên bản đồ
              </button>
              <div className="flex gap-2">
                {detailZone.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeactivateTarget(detailZone);
                      setDetailZone(null);
                    }}
                    className="px-4 py-2 rounded bg-red-600 text-white text-sm font-bold hover:bg-red-700"
                  >
                    Gỡ cảnh báo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailZone(null)}
                  className="px-4 py-2 rounded bg-vetc-green text-white text-sm font-bold hover:bg-green-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirm */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Gỡ cảnh báo ngập?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Khu vực <strong>{deactivateTarget.name}</strong> ({deactivateTarget.id}) sẽ chuyển sang{' '}
                  <strong>expired</strong>. Cảnh báo không còn hiển thị khi tìm vị trí.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeactivate}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                Xác nhận gỡ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel preview */}
      {previewRows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-vetc-green p-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="font-bold text-lg">Preview import Excel</h3>
                <p className="text-xs opacity-90 mt-0.5 break-all">{uploadFileName}</p>
              </div>
              <button type="button" onClick={() => setPreviewRows(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600">
                    <th className="px-2 py-2 text-left font-bold border-r">Dòng</th>
                    <th className="px-2 py-2 text-left font-bold border-r">Tên</th>
                    <th className="px-2 py-2 text-left font-bold border-r">Lat / Lng</th>
                    <th className="px-2 py-2 text-center font-bold border-r">Radius</th>
                    <th className="px-2 py-2 text-center font-bold border-r">Severity</th>
                    <th className="px-2 py-2 text-left font-bold">Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r) => (
                    <tr key={r.row} className={`border-b ${r.error ? 'bg-red-50/60' : ''}`}>
                      <td className="px-2 py-2 border-r font-mono">{r.row}</td>
                      <td className="px-2 py-2 border-r font-bold">{r.name}</td>
                      <td className="px-2 py-2 border-r font-mono text-gray-600">
                        {r.lat}, {r.lng}
                      </td>
                      <td className="px-2 py-2 text-center border-r">{r.radius_m}m</td>
                      <td className="px-2 py-2 text-center border-r">
                        <SeverityBadge severity={r.severity} />
                      </td>
                      <td className="px-2 py-2">
                        {r.error ? (
                          <span className="text-red-600 font-bold">{r.error}</span>
                        ) : (
                          <span className="text-green-700 font-bold">Hợp lệ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-gray-500 mt-3">
                Chỉ các dòng hợp lệ được import · source = cms · status = active ngay sau khi xác nhận.
              </p>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewRows(null)}
                className="px-4 py-2 rounded border border-gray-200 text-sm font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded bg-vetc-green text-white text-sm font-bold hover:bg-green-700"
              >
                Import {previewRows.filter((r) => !r.error).length} điểm
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadProcessing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl px-6 py-5 flex items-center gap-3">
            <Loader2 size={22} className="animate-spin text-vetc-green" />
            <div>
              <p className="text-sm font-bold text-gray-800">Đang xử lý file upload...</p>
              <p className="text-xs text-gray-500 mt-0.5 break-all">{uploadFileName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloodZoneManagement;
