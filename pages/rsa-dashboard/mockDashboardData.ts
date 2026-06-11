export interface StatusCard {
  key: string;
  label: string;
  value: number;
  subLabel?: string;
  trend?: number;
  progressPercent?: number;
  progressColor?: string;
  barChart?: number[];
  variant: 'total' | 'progress' | 'subtext';
}

export interface SlaWarningRow {
  metric: string;
  quantity: number;
  status: 'warning' | 'risk';
}

export interface MapTrip {
  id: string;
  orderId: string;
  vehiclePlate: string;
  vehicleModel: string;
  statusLabel: string;
  eta: string;
  distance: string;
  incident: [number, number];
  vehicle: [number, number];
  garage?: [number, number];
  color: string;
}

export interface WeeklyOrderDay {
  day: string;
  count: number;
  highlighted?: boolean;
}

export interface FunnelStep {
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface MiniBarItem {
  height: number;
  tone: 'red' | 'light-red' | 'light-green' | 'medium-green' | 'dark-green';
}

export interface SatisfactionSegment {
  percent: number;
  color: string;
}

export interface KpiMetricCard {
  key: string;
  label: string;
  value: string;
  valueMax?: string;
  trend?: number;
  variant: 'sla' | 'csat' | 'station' | 'driver';
  miniBars?: MiniBarItem[];
  stars?: number;
  satisfactionLabel?: string;
  satisfactionSegments?: SatisfactionSegment[];
}

export interface DriverRow {
  id: string;
  name: string;
  vehicle: string;
  kpi: number;
}

export interface AlertItem {
  id: string;
  orderId: string;
  type: string;
  delay: string;
  cskh: string;
}

export const statusCards: StatusCard[] = [
  {
    key: 'total',
    label: 'Tổng đơn',
    value: 1000,
    trend: 2.1,
    barChart: [35, 48, 42, 55, 62, 70, 85],
    variant: 'total',
  },
  {
    key: 'received',
    label: 'Tiếp nhận',
    value: 42,
    progressPercent: 30,
    progressColor: '#00A859',
    variant: 'progress',
  },
  {
    key: 'dispatch',
    label: 'Điều phối',
    value: 18,
    progressPercent: 20,
    progressColor: '#F59E0B',
    variant: 'progress',
  },
  {
    key: 'rescuing',
    label: 'Đang cứu hộ',
    value: 35,
    progressPercent: 60,
    progressColor: '#166534',
    variant: 'progress',
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    value: 1189,
    subLabel: 'Hôm nay: 145',
    variant: 'subtext',
  },
  {
    key: 'cancelled',
    label: 'Huỷ',
    value: 1189,
    subLabel: 'Hôm nay: 145',
    variant: 'subtext',
  },
];

export const slaWarnings: SlaWarningRow[] = [
  { metric: 'Tiếp nhận chậm', quantity: 15, status: 'warning' },
  { metric: 'Điều phối chậm', quantity: 8, status: 'warning' },
  { metric: 'Quá thời gian cứu hộ', quantity: 3, status: 'risk' },
];

export const mapTrips: MapTrip[] = [
  {
    id: 'trip-1',
    orderId: 'RS12605010004',
    vehiclePlate: '99A97026',
    vehicleModel: 'Volvo XC90',
    statusLabel: 'Đang tới điểm',
    eta: '20 phút',
    distance: '5 km',
    incident: [21.0329, 105.8706],
    vehicle: [21.0435, 105.8640],
    garage: [21.0180, 105.8510],
    color: '#00A859',
  },
  {
    id: 'trip-2',
    orderId: 'RS12605010012',
    vehiclePlate: '30A-12345',
    vehicleModel: 'Ford Ranger',
    statusLabel: 'Đang cứu hộ',
    eta: '12 phút',
    distance: '3.2 km',
    incident: [21.0617, 105.8361],
    vehicle: [21.0548, 105.8180],
    garage: [21.0390, 105.8055],
    color: '#2563EB',
  },
  {
    id: 'trip-3',
    orderId: 'RS12605010018',
    vehiclePlate: '29B-67890',
    vehicleModel: 'Isuzu NPR',
    statusLabel: 'Đang kéo xe',
    eta: '25 phút',
    distance: '8.5 km',
    incident: [21.0181, 105.8406],
    vehicle: [21.0265, 105.8285],
    garage: [21.0065, 105.8340],
    color: '#F59E0B',
  },
];

export const slaMiniBars: MiniBarItem[] = [
  { height: 44, tone: 'red' },
  { height: 56, tone: 'light-green' },
  { height: 28, tone: 'light-red' },
  { height: 62, tone: 'light-green' },
  { height: 44, tone: 'red' },
  { height: 82, tone: 'medium-green' },
  { height: 100, tone: 'dark-green' },
];

export const funnelSteps: FunnelStep[] = [
  { label: 'Tiếp nhận', count: 2450, percent: 100, color: '#166534' },
  { label: 'Xác minh', count: 2156, percent: 88, color: '#15803D' },
  { label: 'Điều phối', count: 1812, percent: 74, color: '#16A34A' },
  { label: 'Cứu hộ', count: 1519, percent: 62, color: '#4ADE80' },
  { label: 'Hoàn thành', count: 1519, percent: 60, color: '#86EFAC' },
];

export const kpiMetrics: KpiMetricCard[] = [
  { key: 'sla', label: 'SLA Tổng quát', value: '98.4%', trend: 2.1, variant: 'sla', miniBars: slaMiniBars },
  {
    key: 'csat',
    label: 'Mức độ CSAT',
    value: '4.82',
    valueMax: '5.0',
    variant: 'csat',
    stars: 4.82,
    satisfactionLabel: '82% Rất tốt',
    satisfactionSegments: [
      { percent: 82, color: '#1B7A45' },
      { percent: 10, color: '#6BBF9A' },
      { percent: 5, color: '#F5C4C4' },
      { percent: 3, color: '#E5E7EB' },
    ],
  },
  { key: 'station', label: 'Tỷ lệ trạm đạt SLA', value: '50.4%', trend: 2.1, variant: 'station', miniBars: slaMiniBars },
  { key: 'driver', label: 'Tỷ lệ tài xế đạt KPI', value: '98.4%', trend: 2.1, variant: 'driver', miniBars: slaMiniBars },
];

export const weeklyOrders: WeeklyOrderDay[] = [
  { day: 'T2', count: 42 },
  { day: 'T3', count: 55 },
  { day: 'T4', count: 38 },
  { day: 'T5', count: 61 },
  { day: 'T6', count: 72, highlighted: true },
  { day: 'T7', count: 48 },
  { day: 'CN', count: 35 },
];

export const orderChartFilters = ['7 ngày qua', '30 ngày qua', 'Tháng này'] as const;

export const drivers: DriverRow[] = [
  { id: '1', name: 'Trần Hữu Dũng', vehicle: 'Xe cẩu 02', kpi: 98 },
  { id: '2', name: 'Lê Văn Nam', vehicle: 'Xe CH-12', kpi: 85 },
  { id: '3', name: 'Phạm Minh Tuấn', vehicle: 'Xe CH-08', kpi: 62 },
];

export const resources = {
  stations: 24,
  vehicles: 156,
  drivers: 208,
  activePercent: 94,
};

const alertTemplate: AlertItem = {
  id: 'template',
  orderId: 'RS4HNO25010001',
  type: 'KHỞI TẠO',
  delay: 'Trễ: 14m',
  cskh: 'Hungnq2',
};

export const alerts: AlertItem[] = Array.from({ length: 10 }, (_, i) => ({
  ...alertTemplate,
  id: `alert-${i + 1}`,
}));

