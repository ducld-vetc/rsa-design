import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Phone,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
  Play,
  Pause,
  Search,
  FileWarning,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import AppSelect from '../shared/AppSelect';

const incidentIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#ef4444;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const vehicleIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#3b82f6;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const garageIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#00A859;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const stationIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;background:#00A859;border:2px solid white;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const DEMO_CALL_AUDIO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

const nearbyStations: { id: string; name: string; position: [number, number] }[] = [
  { id: 'ST-01', name: 'Trạm Long Biên', position: [21.0405, 105.8680] },
  { id: 'ST-02', name: 'Trạm Cầu Giấy', position: [21.0360, 105.7950] },
  { id: 'ST-03', name: 'Trạm Đống Đa', position: [21.0155, 105.8280] },
  { id: 'ST-04', name: 'Trạm Tây Hồ', position: [21.0680, 105.8230] },
];

const mapRoutes: {
  id: string;
  name: string;
  color: string;
  incident: [number, number];
  vehicle: [number, number];
  garage?: [number, number];
}[] = [
  {
    id: 'RS6250910000001', name: 'NGUYỄN VĂN A', color: '#EF4444',
    incident: [21.0329, 105.8706],
    vehicle:  [21.0435, 105.8640],
    garage:   [21.0180, 105.8510],
  },
  {
    id: 'RS6250910000002', name: 'TRẦN THỊ B', color: '#2563EB',
    incident: [21.0617, 105.8361],
    vehicle:  [21.0548, 105.8180],
    garage:   [21.0390, 105.8055],
  },
  {
    id: 'RS6250910000003', name: 'PHẠM VĂN C', color: '#16A34A',
    incident: [21.0181, 105.8406],
    vehicle:  [21.0265, 105.8285],
    garage:   [21.0065, 105.8340],
  },
  {
    id: 'RS6250910000005', name: 'HOÀNG VĂN E', color: '#7C3AED',
    incident: [21.0115, 105.8520],
    vehicle:  [21.0200, 105.8450],
  },
];

const RoutedPolyline: React.FC<{
  from: [number, number];
  to: [number, number];
  color: string;
  dashed?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
}> = ({ from, to, color, dashed, highlighted = false, dimmed = false }) => {
  const weight  = highlighted ? 8 : dimmed ? 3 : 5;
  const opacity = highlighted ? 1 : dimmed ? 0.2 : 0.9;
  const [positions, setPositions] = React.useState<[number, number][]>([from, to]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    )
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.routes?.[0]?.geometry?.coordinates) {
          setPositions(
            data.routes[0].geometry.coordinates.map(
              ([lon, lat]: [number, number]) => [lat, lon] as [number, number]
            )
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color, weight, dashArray: dashed ? '10 7' : undefined, opacity, lineCap: 'round', lineJoin: 'round' }}
    />
  );
};

const KpiChip: React.FC<{
  label: string;
  value: number;
  valueClass?: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, value, valueClass = 'text-gray-900', active = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-baseline justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
      active
        ? 'border-[#00A859] bg-emerald-50/60 shadow-sm'
        : 'border-gray-100 bg-white hover:bg-emerald-50/40'
    }`}
  >
    <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-[#00A859]' : 'text-gray-400'}`}>
      {label}
    </span>
    <span className={`text-lg font-black leading-none ${valueClass}`}>{value}</span>
  </button>
);

const FlyToOrder: React.FC<{ target: [number, number] | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target, 15, { duration: 0.7 });
  }, [target, map]);
  return null;
};

const InvalidateMapSize: React.FC<{ trigger: boolean }> = ({ trigger }) => {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [map, trigger]);
  return null;
};

const openGoogleMaps = (address: string) => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
};

type QuickFilter = 'all' | 'overdue' | 'receiving' | 'dispatch' | 'rescuing';

type SlaStage = {
  label: string;
  actual: string;
  target: string;
  overdue?: boolean;
  pending?: boolean;
};

const mapGlass =
  'border border-white/60 bg-white/25 shadow-[0_8px_32px_rgba(15,23,42,0.14)] backdrop-blur-2xl backdrop-saturate-150';
const mapGlassBtn =
  `inline-flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-white/45 ${mapGlass}`;

const orderSlaById: Record<string, SlaStage[]> = {
  RS6250910000001: [
    { label: 'Tiếp nhận', actual: '00:48', target: '01:00' },
    { label: 'Điều phối', actual: '08:12', target: '16:00' },
    { label: 'Cứu hộ', actual: '--:--', target: '30:00', pending: true },
    { label: 'SLA tổng', actual: '09:00', target: '77:00' },
  ],
  RS6250910000002: [
    { label: 'Tiếp nhận', actual: '00:42', target: '01:00' },
    { label: 'Điều phối', actual: '12:05', target: '16:00' },
    { label: 'Cứu hộ', actual: '08:20', target: '30:00' },
    { label: 'SLA tổng', actual: '43:17', target: '77:00' },
  ],
  RS6250910000003: [
    { label: 'Tiếp nhận', actual: '02:14', target: '01:00', overdue: true },
    { label: 'Điều phối', actual: '00:16', target: '16:00' },
    { label: 'Cứu hộ', actual: '--:--', target: '30:00', pending: true },
    { label: 'SLA tổng', actual: '83:50', target: '77:00', overdue: true },
  ],
  RS6250910000004: [
    { label: 'Tiếp nhận', actual: '00:35', target: '01:00' },
    { label: 'Điều phối', actual: '--:--', target: '16:00', pending: true },
    { label: 'Cứu hộ', actual: '--:--', target: '30:00', pending: true },
    { label: 'SLA tổng', actual: '00:35', target: '77:00' },
  ],
  RS6250910000005: [
    { label: 'Tiếp nhận', actual: '05:12', target: '01:00', overdue: true },
    { label: 'Điều phối', actual: '--:--', target: '16:00', pending: true },
    { label: 'Cứu hộ', actual: '--:--', target: '30:00', pending: true },
    { label: 'SLA tổng', actual: '05:12', target: '77:00' },
  ],
};

const OrderSlaBar: React.FC<{ stages: SlaStage[] }> = ({ stages }) => (
  <div className="pointer-events-none absolute left-4 right-16 top-4 z-[90]">
    <div className={`pointer-events-auto flex max-w-full items-stretch gap-4 overflow-x-auto rounded-2xl px-3.5 py-2 ${mapGlass}`}>
      {stages.map((stage) => (
        <div key={stage.label} className="min-w-[72px] shrink-0">
          <p className="text-[11px] font-medium text-gray-500">{stage.label}</p>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className={`text-sm font-medium leading-none ${
              stage.overdue ? 'text-red-500' : stage.pending ? 'text-gray-600' : 'text-[#00A859]'
            }`}>
              {stage.actual}
            </span>
            <span className="text-[11px] font-normal text-gray-400">/ {stage.target}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HANDLE_GROUP_OPTIONS = [
  { value: 'van_hanh', label: 'Vận hành' },
  { value: 'khieu_nai', label: 'Khiếu nại' },
  { value: 'ky_thuat', label: 'Kỹ thuật' },
  { value: 'doi_tac', label: 'Đối tác' },
  { value: 'thanh_toan', label: 'Thanh toán' },
];

const HANDLE_TYPE_OPTIONS = [
  { value: 'ghi_nhan', label: 'Ghi nhận' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'boi_thuong', label: 'Bồi thường' },
  { value: 'dieu_chinh', label: 'Điều chỉnh' },
  { value: 'huy_doi', label: 'Hủy / đổi' },
];

const HANDLE_TARGET_OPTIONS = [
  { value: 'khach_hang', label: 'Khách hàng' },
  { value: 'tai_xe', label: 'Tài xế' },
  { value: 'tram', label: 'Trạm' },
  { value: 'doi_tac', label: 'Đối tác' },
  { value: 'he_thong', label: 'Hệ thống' },
  { value: 'noi_bo', label: 'Nội bộ' },
];

type HandlingReport = {
  id: string;
  orderId: string;
  group: string;
  type: string;
  target: string;
  content: string;
  createdAt: string;
  createdBy: string;
};

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

const RescueSupervision: React.FC<{ role?: 'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER' }> = ({
  role = 'CSKH',
}) => {
  const isAdmin = role === 'ADMIN';
  const [rightInfoTab, setRightInfoTab] = useState<'incident' | 'dispatch' | 'calls' | 'reports'>('incident');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [showNearbyStations, setShowNearbyStations] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);
  const [playingCallId, setPlayingCallId] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [dateFrom, setDateFrom] = useState('2026-09-10');
  const [dateTo, setDateTo] = useState('2026-09-10');
  const [plateQuery, setPlateQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [handlingReports, setHandlingReports] = useState<HandlingReport[]>([
    {
      id: 'hr-1',
      orderId: 'RS6250910000003',
      group: 'van_hanh',
      type: 'escalation',
      target: 'doi_tac',
      content: 'Đối tác chậm xác nhận đơn quá 15 phút, đã escalate OSA phụ trách miền Bắc.',
      createdAt: '10/09/2026 11:05',
      createdBy: 'admin_rsa',
    },
  ]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportGroup, setReportGroup] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportTarget, setReportTarget] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportError, setReportError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const rescueAddress = 'Đường Nguyễn Văn Cừ, Long Biên, Hà Nội';
  const towAddress = '123 Đường Láng, Đống Đa, Hà Nội';
  const customerPhone = '0912345678';

  const commandQueue = [
    { id: 'RS6250910000001', routeId: 'RS6250910000001', plate: '29A-123.45', osa: 'Nguyễn Thị Hoa', address: 'Đường Nguyễn Văn Cừ, Long Biên, Hà Nội', time: '8P 19S', status: 'ĐIỀU PHỐI', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200', filter: 'dispatch' as QuickFilter, overdue: false },
    { id: 'RS6250910000002', routeId: 'RS6250910000002', plate: '30H-456.78', osa: 'Trần Văn Nam', address: 'Cầu Nhật Tân, Tây Hồ, Hà Nội', time: '13P 45S', status: 'CỨU HỘ', statusColor: 'bg-blue-100 text-blue-800 border-blue-200', filter: 'rescuing' as QuickFilter, overdue: false },
    { id: 'RS6250910000003', routeId: 'RS6250910000003', plate: '51G-999.11', osa: 'Lê Minh Tuấn', address: 'Hầm Kim Liên, Đống Đa, Hà Nội', time: '25P 00S', status: 'CỨU HỘ', statusColor: 'bg-blue-100 text-blue-800 border-blue-200', filter: 'rescuing' as QuickFilter, overdue: true },
    { id: 'RS6250910000004', routeId: 'RS6250910000004', plate: '15B-222.33', osa: 'Phạm Thu Hà', address: 'Cầu Giấy, Hà Nội', time: '15P 30S', status: 'CHỜ TIẾP NHẬN', statusColor: 'bg-orange-100 text-orange-700 border-orange-200', filter: 'receiving' as QuickFilter, overdue: false },
    { id: 'RS6250910000005', routeId: 'RS6250910000005', plate: '29C-888.99', osa: 'Hoàng Anh', address: 'Phố Huế, Hai Bà Trưng, Hà Nội', time: '5P 12S', status: 'CHỜ TIẾP NHẬN', statusColor: 'bg-orange-100 text-orange-600 border-orange-200', filter: 'receiving' as QuickFilter, overdue: false },
  ];

  const relatedCalls = [
    { id: 1, date: '10/09/2026', time: '10:52:18', direction: 'Đến', party: 'Khách hàng', phone: '0912345678', duration: '01:42', audioUrl: DEMO_CALL_AUDIO },
    { id: 2, date: '10/09/2026', time: '10:55:03', direction: 'Đi', party: 'Khách hàng', phone: '0912345678', duration: '00:48', audioUrl: DEMO_CALL_AUDIO },
    { id: 3, date: '10/09/2026', time: '11:02:41', direction: 'Đi', party: 'Trạm cứu hộ', phone: '0243xxx1122', duration: '02:15', audioUrl: DEMO_CALL_AUDIO },
  ];

  const kpiFilters: { key: QuickFilter; label: string; value: number; valueClass?: string }[] = [
    { key: 'all', label: 'Tổng cộng', value: commandQueue.length },
    { key: 'overdue', label: 'Quá hạn', value: commandQueue.filter((o) => o.overdue).length, valueClass: 'text-red-600' },
    { key: 'receiving', label: 'Chờ tiếp nhận', value: commandQueue.filter((o) => o.filter === 'receiving').length, valueClass: 'text-orange-500' },
    { key: 'dispatch', label: 'Điều phối', value: commandQueue.filter((o) => o.filter === 'dispatch').length, valueClass: 'text-[#00A859]' },
    { key: 'rescuing', label: 'Cứu hộ', value: commandQueue.filter((o) => o.filter === 'rescuing').length, valueClass: 'text-blue-600' },
  ];

  const filteredQueue = useMemo(() => {
    const q = plateQuery.trim().toLowerCase().replace(/\s+/g, '');
    return commandQueue.filter((order) => {
      if (quickFilter === 'overdue') {
        if (!order.overdue) return false;
      } else if (quickFilter !== 'all' && order.filter !== quickFilter) {
        return false;
      }
      if (q && !order.plate.toLowerCase().replace(/\s+/g, '').includes(q) && !order.id.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [plateQuery, quickFilter]);

  const activeRouteId = hoveredRouteId ?? focusedRouteId;
  const focusedIncident = focusedRouteId
    ? mapRoutes.find((r) => r.id === focusedRouteId)?.incident ?? null
    : null;
  const focusedSla = focusedRouteId ? orderSlaById[focusedRouteId] : null;
  const orderReports = useMemo(
    () => (focusedRouteId ? handlingReports.filter((r) => r.orderId === focusedRouteId) : []),
    [focusedRouteId, handlingReports]
  );
  const coverageCenter = mapRoutes.find((r) => r.id === activeRouteId)?.incident ?? mapRoutes[0].incident;
  const fieldLabel = 'mb-1 block text-[11px] font-semibold text-gray-600';
  const fieldValue = 'rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2 text-xs font-semibold text-gray-800';
  const iconBtn = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50';
  const dateInputClass = 'h-[34px] rounded border border-gray-200 bg-white px-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-[#00A859]';

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const formatAudioTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.addEventListener('timeupdate', () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
        setAudioCurrent(audio.currentTime);
        setAudioDuration(duration);
        setAudioProgress(duration > 0 ? audio.currentTime / duration : 0);
      });
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      });
      audio.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        setAudioProgress(1);
      });
      audio.addEventListener('pause', () => setIsAudioPlaying(false));
      audio.addEventListener('play', () => setIsAudioPlaying(true));
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const toggleCallPlayback = (callId: number, audioUrl: string) => {
    const audio = ensureAudio();
    if (playingCallId === callId) {
      if (audio.paused) {
        void audio.play().then(() => setIsAudioPlaying(true)).catch(() => setIsAudioPlaying(false));
      } else {
        audio.pause();
        setIsAudioPlaying(false);
      }
      return;
    }
    audio.pause();
    audio.src = audioUrl;
    audio.currentTime = 0;
    setPlayingCallId(callId);
    setAudioProgress(0);
    setAudioCurrent(0);
    setAudioDuration(0);
    void audio.play().then(() => setIsAudioPlaying(true)).catch(() => {
      setIsAudioPlaying(false);
      setPlayingCallId(null);
    });
  };

  const seekCallAudio = (ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const next = Math.min(1, Math.max(0, ratio)) * audio.duration;
    audio.currentTime = next;
    setAudioCurrent(next);
    setAudioProgress(next / audio.duration);
  };

  const selectOrder = (routeId: string) => {
    setFocusedRouteId(routeId);
    setRightPanelCollapsed(false);
  };

  const resetReportForm = () => {
    setReportGroup('');
    setReportType('');
    setReportTarget('');
    setReportContent('');
    setReportError('');
  };

  const openReportModal = () => {
    if (!focusedRouteId) {
      setReportError('Vui lòng chọn một đơn trước khi báo cáo xử lý.');
      setReportModalOpen(true);
      return;
    }
    resetReportForm();
    setReportModalOpen(true);
  };

  const submitHandlingReport = () => {
    if (!focusedRouteId) {
      setReportError('Vui lòng chọn một đơn trước khi báo cáo xử lý.');
      return;
    }
    if (!reportGroup || !reportType || !reportTarget || !reportContent.trim()) {
      setReportError('Vui lòng nhập đủ Nhóm xử lý, Loại xử lý, Đối tượng và Nội dung chi tiết.');
      return;
    }
    const now = new Date();
    const createdAt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setHandlingReports((prev) => [
      {
        id: `hr-${Date.now()}`,
        orderId: focusedRouteId,
        group: reportGroup,
        type: reportType,
        target: reportTarget,
        content: reportContent.trim(),
        createdAt,
        createdBy: 'admin_rsa',
      },
      ...prev,
    ]);
    setReportModalOpen(false);
    resetReportForm();
    setRightInfoTab('reports');
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[80] flex flex-col gap-4 bg-white p-4 sm:p-6'
          : 'flex h-full min-h-0 flex-col gap-4'
      }
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-black uppercase tracking-wide text-gray-800">Giám sát cứu hộ</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={plateQuery}
              onChange={(e) => setPlateQuery(e.target.value)}
              placeholder="Tìm biển số xe..."
              className="h-[34px] w-[180px] rounded border border-gray-200 bg-white pl-8 pr-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#00A859]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={dateInputClass}
              aria-label="Từ ngày"
            />
            <span className="text-xs font-semibold text-gray-400">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={dateInputClass}
              aria-label="Đến ngày"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setPlateQuery('');
              setDateFrom('2026-09-10');
              setDateTo('2026-09-10');
              setQuickFilter('all');
            }}
            disabled={!plateQuery && dateFrom === '2026-09-10' && dateTo === '2026-09-10' && quickFilter === 'all'}
            aria-label="Xóa lọc"
            title="Xóa lọc"
            className="inline-flex h-[34px] items-center gap-1.5 rounded border border-gray-200 bg-white px-2.5 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Xóa lọc</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình'}
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {kpiFilters.map((kpi) => (
          <KpiChip
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            valueClass={kpi.valueClass}
            active={quickFilter === kpi.key}
            onClick={() => setQuickFilter((prev) => (prev === kpi.key ? 'all' : kpi.key))}
          />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row xl:items-stretch">
        {/* Queue panel */}
        <aside className="flex max-h-[280px] w-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:max-h-none xl:w-[300px] xl:shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wide text-gray-800">Hàng đợi</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00A859]" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#00A859]">Live</span>
            </div>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 space-y-1.5 overflow-y-auto">
            {filteredQueue.length === 0 && (
              <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-[11px] font-semibold text-gray-400">
                Không có đơn phù hợp bộ lọc
              </p>
            )}
            {filteredQueue.map((order) => {
              const isActive = focusedRouteId === order.routeId;
              return (
                <div
                  key={order.id}
                  onClick={() => selectOrder(order.routeId)}
                  onMouseEnter={() => setHoveredRouteId(order.routeId)}
                  onMouseLeave={() => setHoveredRouteId(null)}
                  className={`cursor-pointer rounded-lg border px-2.5 py-2 transition-colors ${
                    order.overdue ? 'border-l-[3px] border-l-red-400' : ''
                  } ${
                    isActive
                      ? 'border-emerald-100 bg-emerald-50/40'
                      : 'border-gray-100 bg-white hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-all text-[11px] font-bold text-[#00A859]">{order.id}</p>
                      <p className="text-[10px] font-semibold text-gray-500">{order.plate}</p>
                    </div>
                    {order.status && (
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${order.statusColor}`}>
                        {order.status}
                      </span>
                    )}
                  </div>
                  <p className="mb-1 line-clamp-1 text-[10px] text-gray-500">{order.address}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold ${order.overdue ? 'text-red-500' : 'text-gray-400'}`}>
                      {order.time}{order.overdue ? ' · QH' : ''}
                    </span>
                    <span className="truncate text-[10px] font-semibold text-gray-500">OSA: {order.osa}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Map */}
        <div className="relative min-h-[320px] min-w-0 flex-1 xl:min-h-0">
          <div className="rsa-dashboard-map relative z-0 isolate h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <MapContainer
              center={[21.028, 105.854]}
              zoom={13}
              className="absolute inset-0 z-0 h-full w-full"
              zoomControl={false}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <FlyToOrder target={focusedIncident} />
              <InvalidateMapSize trigger={isFullscreen} />
              {showCoverage && (
                <Circle
                  center={coverageCenter}
                  radius={5000}
                  pathOptions={{
                    color: '#00A859',
                    weight: 2,
                    dashArray: '6 4',
                    fillColor: '#00A859',
                    fillOpacity: 0.08,
                  }}
                />
              )}
              {showNearbyStations && nearbyStations.map((station) => (
                <Marker key={station.id} position={station.position} icon={stationIcon}>
                  <Popup>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                      <div style={{ color: '#00A859', marginBottom: 2 }}>Trạm xung quanh</div>
                      <div>{station.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: 11 }}>{station.id}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {mapRoutes.map((route) => {
                const highlighted = !!activeRouteId && activeRouteId === route.id;
                const dimmed = !!activeRouteId && activeRouteId !== route.id;
                return (
                  <React.Fragment key={route.id}>
                    <RoutedPolyline from={route.vehicle} to={route.incident} color={route.color} dashed highlighted={highlighted} dimmed={dimmed} />
                    {route.garage && (
                      <RoutedPolyline from={route.incident} to={route.garage} color={route.color} highlighted={highlighted} dimmed={dimmed} />
                    )}
                    <Marker position={route.incident} icon={incidentIcon}>
                      <Popup>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                          <div style={{ color: '#ef4444', marginBottom: 2 }}>⚠ Vị trí sự cố</div>
                          <div>{route.name}</div>
                          <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                        </div>
                      </Popup>
                    </Marker>
                    <Marker position={route.vehicle} icon={vehicleIcon}>
                      <Popup>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                          <div style={{ color: '#3b82f6', marginBottom: 2 }}>🚛 Xe cứu hộ</div>
                          <div>Đang di chuyển đến hiện trường</div>
                          <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                        </div>
                      </Popup>
                    </Marker>
                    {route.garage && (
                      <Marker position={route.garage} icon={garageIcon}>
                        <Popup>
                          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                            <div style={{ color: '#00A859', marginBottom: 2 }}>🔧 Gara đích đến</div>
                            <div>Điểm kéo xe về</div>
                            <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>

            {focusedSla && <OrderSlaBar stages={focusedSla} />}

            <div className="pointer-events-none absolute bottom-4 left-4 z-20">
              <div className={`pointer-events-auto flex flex-col gap-0.5 rounded-xl p-1 ${mapGlass}`}>
                <button
                  type="button"
                  title="Trạm xung quanh"
                  aria-pressed={showNearbyStations}
                  onClick={() => setShowNearbyStations((v) => !v)}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-[11px] font-medium transition-all ${
                    showNearbyStations ? 'bg-[#00A859]/85 text-white shadow-sm' : 'text-gray-700 hover:bg-white/40'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showNearbyStations ? 'bg-white' : 'bg-gray-400/70'}`} />
                  Trạm
                </button>
                <button
                  type="button"
                  title="Độ phủ"
                  aria-pressed={showCoverage}
                  onClick={() => setShowCoverage((v) => !v)}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-[11px] font-medium transition-all ${
                    showCoverage ? 'bg-[#00A859]/85 text-white shadow-sm' : 'text-gray-700 hover:bg-white/40'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${showCoverage ? 'bg-white' : 'bg-gray-400/70'}`} />
                  Độ phủ
                </button>
              </div>
            </div>

            {focusedRouteId && (
              <div className="absolute right-4 top-4 z-[100] flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  title={rightPanelCollapsed ? 'Mở panel' : 'Ẩn panel'}
                  aria-label={rightPanelCollapsed ? 'Mở panel' : 'Ẩn panel'}
                  className={`h-9 w-9 ${mapGlassBtn}`}
                >
                  {rightPanelCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
                </button>
              </div>
            )}

            <div className={`absolute bottom-4 right-4 z-20 flex flex-col gap-0.5 rounded-xl p-1 ${mapGlass}`}>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-gray-700 transition-colors hover:bg-white/40">+</button>
              <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-gray-700 transition-colors hover:bg-white/40">−</button>
            </div>
          </div>
        </div>

        {/* Coordination panel */}
        {focusedRouteId && !rightPanelCollapsed && (
          <aside className="flex w-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:w-[340px] xl:shrink-0">
            <div className="mb-3 flex shrink-0 rounded-lg border border-gray-200 bg-gray-100 p-0.5">
              {([
                { key: 'incident', label: 'Sự cố' },
                { key: 'dispatch', label: 'Cứu hộ' },
                { key: 'calls', label: 'Cuộc gọi' },
                { key: 'reports', label: 'Báo cáo' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRightInfoTab(tab.key)}
                  className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-md px-1.5 py-2 text-xs font-bold transition-all ${
                    rightInfoTab === tab.key
                      ? 'border border-gray-200 bg-white text-[#00A859] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.key === 'reports' && orderReports.length > 0 && (
                    <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#00A859] px-1 text-[9px] font-bold leading-none text-white">
                      {orderReports.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto">
              {rightInfoTab === 'dispatch' ? (
                <>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Chi tiết cứu hộ</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={fieldLabel}>Đối tác thực hiện</label>
                      <div className={`${fieldValue} text-gray-500`}>Chưa có đơn vị</div>
                    </div>
                    <div>
                      <label className={fieldLabel}>Trạm cứu hộ</label>
                      <div className={`${fieldValue} text-gray-500`}>Chưa có đơn vị</div>
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Xe cứu hộ</label>
                    <div className={`${fieldValue} text-gray-500`}>Chưa có · ---</div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Tài xế tiếp nhận</label>
                    <div className={`${fieldValue} text-gray-500`}>Chưa có tài xế · ---</div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Điểm kéo về</label>
                    <div className="flex items-center gap-1.5">
                      <div className={`min-w-0 flex-1 ${fieldValue}`}>{towAddress}</div>
                      <button
                        type="button"
                        title="Mở Google Maps"
                        aria-label="Mở Google Maps"
                        onClick={() => openGoogleMaps(towAddress)}
                        className={`${iconBtn} text-[#00A859]`}
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Khoảng cách kéo xe</label>
                    <div className={fieldValue}>4.5 km</div>
                  </div>
                </>
              ) : rightInfoTab === 'calls' ? (
                <>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Cuộc gọi liên quan</h3>
                  <div className="space-y-1.5">
                    {relatedCalls.map((call) => {
                      const isActive = playingCallId === call.id;
                      const isPlaying = isActive && isAudioPlaying;
                      const progress = isActive ? audioProgress : 0;
                      return (
                        <div key={call.id} className="rounded-lg border border-gray-100 px-2.5 py-2">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${
                                call.direction === 'Đến'
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              }`}>
                                {call.direction}
                              </span>
                              <span className="text-xs font-bold text-gray-800">{call.party}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400">{call.date} {call.time}</span>
                          </div>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <a href={`tel:${call.phone}`} className="text-[11px] font-semibold text-blue-600 hover:underline">{call.phone}</a>
                            <span className="text-[10px] font-bold text-gray-400">{call.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCallPlayback(call.id, call.audioUrl)}
                              aria-label={isPlaying ? 'Tạm dừng' : isActive ? 'Phát tiếp' : 'Nghe lại'}
                              title={isPlaying ? 'Tạm dừng' : isActive ? 'Phát tiếp' : 'Nghe lại'}
                              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                                isPlaying
                                  ? 'border-[#00A859] bg-emerald-50 text-[#00A859]'
                                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div
                                role="slider"
                                aria-label="Tiến trình âm thanh"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(progress * 100)}
                                tabIndex={0}
                                onClick={(e) => {
                                  if (!isActive) {
                                    toggleCallPlayback(call.id, call.audioUrl);
                                    return;
                                  }
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  seekCallAudio((e.clientX - rect.left) / rect.width);
                                }}
                                className="h-1.5 cursor-pointer rounded-full bg-gray-100"
                              >
                                <div
                                  className={`h-full rounded-full transition-[width] duration-100 ${
                                    isActive ? 'bg-[#00A859]' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                                />
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-gray-400">
                                <span>{isActive ? formatAudioTime(audioCurrent) : '00:00'}</span>
                                <span>{isActive && audioDuration > 0 ? formatAudioTime(audioDuration) : call.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : rightInfoTab === 'reports' ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Báo cáo xử lý</h3>
                    {focusedRouteId && (
                      <span className="text-[10px] font-semibold text-gray-400">{focusedRouteId}</span>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={openReportModal}
                      className="inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-lg bg-[#00A859] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#008f4c]"
                    >
                      <FileWarning size={16} />
                      Báo cáo xử lý
                    </button>
                  )}
                  {!focusedRouteId ? (
                    <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-[11px] font-semibold text-gray-400">
                      Chọn một đơn để xem báo cáo xử lý
                    </p>
                  ) : orderReports.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-[11px] font-semibold text-gray-400">
                      Chưa có báo cáo xử lý cho đơn này
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {orderReports.map((report) => (
                        <div key={report.id} className="rounded-lg border border-amber-100 bg-amber-50/40 px-2.5 py-2">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              <span className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                {labelOf(HANDLE_GROUP_OPTIONS, report.group)}
                              </span>
                              <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                                {labelOf(HANDLE_TYPE_OPTIONS, report.type)}
                              </span>
                              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                {labelOf(HANDLE_TARGET_OPTIONS, report.target)}
                              </span>
                            </div>
                            <span className="shrink-0 text-[10px] font-semibold text-gray-400">{report.createdAt}</span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed text-gray-700">{report.content}</p>
                          <p className="mt-1 text-[10px] text-gray-400">bởi {report.createdBy}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-gray-400">Chi tiết sự cố</h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={fieldLabel}>Loại đơn</label>
                      <div className={fieldValue}>Đơn gói</div>
                    </div>
                    <div>
                      <label className={fieldLabel}>Doanh nghiệp</label>
                      <div className={fieldValue}>VETC Mobility</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={fieldLabel}>Tên khách hàng</label>
                      <div className={fieldValue}>Nguyễn Văn A</div>
                    </div>
                    <div>
                      <label className={fieldLabel}>Số điện thoại</label>
                      <div className="flex items-center gap-1.5">
                        <div className={`min-w-0 flex-1 ${fieldValue} text-blue-600`}>{customerPhone}</div>
                        <a
                          href={`tel:${customerPhone}`}
                          title="Gọi ngay"
                          aria-label="Gọi ngay"
                          className={`${iconBtn} text-[#00A859]`}
                        >
                          <Phone size={14} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Thông tin phương tiện</label>
                    <div className={`${fieldValue} flex flex-wrap items-center gap-x-2 gap-y-0.5`}>
                      <span>Mazda CX-5</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[#00A859]">29A-123.45</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-medium text-gray-500">SUV · 5 chỗ · 1,500 kg</span>
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Vị trí cứu hộ</label>
                    <div className="flex items-center gap-1.5">
                      <div className={`min-w-0 flex-1 ${fieldValue}`}>{rescueAddress}</div>
                      <button
                        type="button"
                        title="Mở Google Maps"
                        aria-label="Mở Google Maps"
                        onClick={() => openGoogleMaps(rescueAddress)}
                        className={`${iconBtn} text-[#00A859]`}
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={fieldLabel}>Loại vị trí</label>
                      <div className={fieldValue}>Đường phố</div>
                    </div>
                    <div>
                      <label className={fieldLabel}>Thời tiết</label>
                      <div className={fieldValue}>Mưa nhẹ</div>
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Mô tả sự cố</label>
                    <div className={`${fieldValue} font-medium leading-relaxed text-gray-600`}>
                      Xe chết máy giữa đường, không khởi động được. Pin yếu, cần kích bình tại chỗ.
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabel}>Dịch vụ yêu cầu</label>
                    <div className={fieldValue}>Kích bình ắc quy</div>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Báo cáo xử lý</h3>
                <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
                  {focusedRouteId ? `Đơn ${focusedRouteId}` : 'Chưa chọn đơn'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setReportModalOpen(false); resetReportForm(); }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={fieldLabel}>Nhóm xử lý</label>
                <AppSelect
                  value={reportGroup}
                  options={HANDLE_GROUP_OPTIONS}
                  onChange={setReportGroup}
                  placeholder="Chọn nhóm xử lý"
                />
              </div>
              <div>
                <label className={fieldLabel}>Loại xử lý</label>
                <AppSelect
                  value={reportType}
                  options={HANDLE_TYPE_OPTIONS}
                  onChange={setReportType}
                  placeholder="Chọn loại xử lý"
                />
              </div>
              <div>
                <label className={fieldLabel}>Đối tượng</label>
                <AppSelect
                  value={reportTarget}
                  options={HANDLE_TARGET_OPTIONS}
                  onChange={setReportTarget}
                  placeholder="Chọn đối tượng"
                />
              </div>
              <div>
                <label className={fieldLabel}>Nội dung chi tiết</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  rows={4}
                  placeholder="Mô tả vấn đề đơn gặp phải trong quá trình vận hành..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#00A859]"
                />
              </div>
              {reportError && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
                  {reportError}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setReportModalOpen(false); resetReportForm(); }}
                className="inline-flex h-[38px] flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitHandlingReport}
                className="inline-flex h-[38px] flex-1 items-center justify-center rounded-lg bg-[#00A859] text-sm font-semibold text-white hover:bg-[#008f4c]"
              >
                Ghi nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueSupervision;
