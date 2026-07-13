/** Mock data — Quản lý khu vực ngập úng (Flood Zone CMS) */

export type FloodSeverity = 'low' | 'medium' | 'high';
export type FloodZoneSource = 'cms' | 'ihanoi' | 'order_cluster';
export type FloodZoneStatus = 'active' | 'expired';

export type LatLngTuple = [number, number];

export interface FloodZone {
  id: string;
  name: string;
  address: string;
  center: LatLngTuple;
  radius_m: 200 | 300 | 500;
  severity: FloodSeverity;
  source: FloodZoneSource;
  status: FloodZoneStatus;
  valid_to: string;
  report_count: number;
  created_at: string;
  created_by?: string;
  note?: string;
  expired_at?: string;
  expired_by?: 'system_ttl' | 'ops_manual';
}

export interface FloodExcelPreviewRow {
  row: number;
  name: string;
  lat: number;
  lng: number;
  radius_m: 200 | 300 | 500;
  severity: FloodSeverity;
  valid_to: string;
  note?: string;
  error?: string;
}

export const FLOOD_RADIUS_OPTIONS = [200, 300, 500] as const;

export const FLOOD_SEVERITY_LABELS: Record<FloodSeverity, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const FLOOD_SOURCE_LABELS: Record<FloodZoneSource, string> = {
  cms: 'CMS',
  ihanoi: 'iHanoi',
  order_cluster: 'Cụm đơn',
};

export const FLOOD_STATUS_LABELS: Record<FloodZoneStatus, string> = {
  active: 'Đang hiệu lực',
  expired: 'Đã hết hạn',
};

export const FLOOD_MAP_DEFAULT_CENTER: LatLngTuple = [21.0285, 105.8452];
export const FLOOD_MAP_DEFAULT_ZOOM = 12;

export const FLOOD_EXCEL_TEMPLATE_COLUMNS = [
  'name',
  'lat',
  'lng',
  'radius_m',
  'severity',
  'valid_to',
  'note',
] as const;

export const FLOOD_EXCEL_TEMPLATE_NOTE =
  'severity: low | medium | high · radius_m: 200 | 300 | 500 · valid_to: YYYY-MM-DDTHH:mm:ss';

/** Demo rows khi upload Excel (không parse file thật) */
export const MOCK_FLOOD_EXCEL_PREVIEW: FloodExcelPreviewRow[] = [
  {
    row: 2,
    name: 'Ngập đường Nguyễn Trãi (Excel)',
    lat: 21.0012,
    lng: 105.8145,
    radius_m: 300,
    severity: 'high',
    valid_to: '2026-07-14T18:00:00',
    note: 'Import từ iHanoi batch',
  },
  {
    row: 3,
    name: 'Ngập cầu Vĩnh Tuy (Excel)',
    lat: 21.0158,
    lng: 105.8751,
    radius_m: 200,
    severity: 'medium',
    valid_to: '2026-07-14T12:00:00',
  },
  {
    row: 4,
    name: 'Ngập Láng Hạ — thiếu tọa độ',
    lat: 0,
    lng: 0,
    radius_m: 300,
    severity: 'low',
    valid_to: '2026-07-13T23:59:00',
    error: 'lat/lng không hợp lệ',
  },
];

const hoursFromNow = (h: number): string => {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString().slice(0, 19);
};

export const INITIAL_FLOOD_ZONES: FloodZone[] = [
  {
    id: 'FZ-HN-001',
    name: 'Ngập phố Huế — Hai Bà Trưng',
    address: 'Phố Huế, Hai Bà Trưng, Hà Nội',
    center: [21.0115, 105.8512],
    radius_m: 300,
    severity: 'high',
    source: 'cms',
    status: 'active',
    valid_to: hoursFromNow(10),
    report_count: 5,
    created_at: hoursFromNow(-6),
    created_by: 'ops_lan',
    note: 'Nước sâu ~40cm theo báo cáo hiện trường',
  },
  {
    id: 'FZ-HN-002',
    name: 'Ngập đường Giải Phóng',
    address: 'Giải Phóng, Hoàng Mai, Hà Nội',
    center: [20.9958, 105.841],
    radius_m: 500,
    severity: 'medium',
    source: 'ihanoi',
    status: 'active',
    valid_to: hoursFromNow(8),
    report_count: 2,
    created_at: hoursFromNow(-4),
  },
  {
    id: 'FZ-HN-003',
    name: 'Ngập Ngã Tư Sở',
    address: 'Ngã Tư Sở, Đống Đa, Hà Nội',
    center: [21.0024, 105.8228],
    radius_m: 200,
    severity: 'low',
    source: 'order_cluster',
    status: 'active',
    valid_to: hoursFromNow(5),
    report_count: 3,
    created_at: hoursFromNow(-2),
    note: 'Tạo từ ≥3 report trong 150m / 2h',
  },
  {
    id: 'FZ-HN-004',
    name: 'Ngập Cầu Giấy (đã gỡ)',
    address: 'Cầu Giấy, Hà Nội',
    center: [21.033, 105.7945],
    radius_m: 300,
    severity: 'medium',
    source: 'cms',
    status: 'expired',
    valid_to: hoursFromNow(-2),
    report_count: 1,
    created_at: hoursFromNow(-14),
    expired_at: hoursFromNow(-1),
    expired_by: 'ops_manual',
  },
  {
    id: 'FZ-HN-005',
    name: 'Ngập Tây Hồ — đường Thanh Niên',
    address: 'Thanh Niên, Tây Hồ, Hà Nội',
    center: [21.0432, 105.838],
    radius_m: 300,
    severity: 'high',
    source: 'cms',
    status: 'active',
    valid_to: hoursFromNow(12),
    report_count: 0,
    created_at: hoursFromNow(-1),
    created_by: 'ops_minh',
  },
];

export const severityCircleColor = (severity: FloodSeverity): string => {
  if (severity === 'high') return '#DC2626';
  if (severity === 'medium') return '#D97706';
  return '#2563EB';
};

export const formatFloodDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const defaultValidToIso = (ttlHours = 12): string => {
  const d = new Date();
  d.setHours(d.getHours() + ttlHours);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
