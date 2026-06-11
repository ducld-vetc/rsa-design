import type { MiniBarItem } from './mockDashboardData';

export interface ResourceStatCard {
  key: string;
  label: string;
  value: number;
  trend?: number;
  subLabel?: string;
  barChart?: number[];
  variant: 'total' | 'subtext';
}

export interface StationDensityRegion {
  label: string;
  percent: number;
  color: string;
}

export interface StationDistributionRow {
  id: number;
  area: string;
  stations: number;
  vehicles: number;
  drivers: number;
  warning?: boolean;
}

export interface ResourceKpiCard {
  key: string;
  label: string;
  value: string;
  trend: number;
  positive: boolean;
  miniBars: MiniBarItem[];
}

export interface ResourceMapStation {
  id: string;
  name: string;
  drivers: number;
  position: [number, number];
  active: boolean;
}

export const resourceStatCards: ResourceStatCard[] = [
  {
    key: 'partner',
    label: 'Đối tác',
    value: 433,
    trend: 2.1,
    barChart: [35, 48, 42, 55, 62, 70, 85],
    variant: 'total',
  },
  {
    key: 'station',
    label: 'Trạm cứu hộ',
    value: 823,
    trend: 2.1,
    barChart: [40, 52, 48, 58, 65, 72, 88],
    variant: 'total',
  },
  {
    key: 'vehicle',
    label: 'Xe cứu hộ',
    value: 1189,
    subLabel: 'Hôm nay: 145',
    variant: 'subtext',
  },
  {
    key: 'driver',
    label: 'Tài xế',
    value: 1102,
    subLabel: 'Hôm nay: 145',
    variant: 'subtext',
  },
];

export const stationDensityTotal = 823;

export const stationDensityRegions: StationDensityRegion[] = [
  { label: 'Miền Bắc', percent: 35, color: '#00A859' },
  { label: 'Miền Trung', percent: 25, color: '#34D399' },
  { label: 'Miền Nam', percent: 15, color: '#A7F3D0' },
  { label: 'Khác', percent: 25, color: '#E5E7EB' },
];

export const providerCsat = {
  score: 4.82,
  max: 5.0,
  stars: 4.82,
  satisfactionLabel: '82% Rất tốt',
  satisfactionSegments: [
    { percent: 82, color: '#1B7A45' },
    { percent: 10, color: '#6BBF9A' },
    { percent: 5, color: '#F5C4C4' },
    { percent: 3, color: '#E5E7EB' },
  ],
};

export const stationDistributionRows: StationDistributionRow[] = [
  { id: 1, area: 'Hồ Chí Minh', stations: 45, vehicles: 120, drivers: 98 },
  { id: 2, area: 'Nghệ An', stations: 12, vehicles: 28, drivers: 24, warning: true },
  { id: 3, area: 'Hà Nội', stations: 38, vehicles: 95, drivers: 82 },
  { id: 4, area: 'Đà Nẵng', stations: 14, vehicles: 32, drivers: 28 },
  { id: 5, area: 'Hải Phòng', stations: 10, vehicles: 22, drivers: 18 },
  { id: 6, area: 'Cần Thơ', stations: 8, vehicles: 18, drivers: 15 },
  { id: 7, area: 'Bình Dương', stations: 11, vehicles: 25, drivers: 20 },
  { id: 8, area: 'Khánh Hòa', stations: 7, vehicles: 16, drivers: 14 },
];

const resourceMiniBars: MiniBarItem[] = [
  { height: 44, tone: 'red' },
  { height: 56, tone: 'light-green' },
  { height: 28, tone: 'light-red' },
  { height: 62, tone: 'light-green' },
  { height: 44, tone: 'red' },
  { height: 82, tone: 'medium-green' },
  { height: 100, tone: 'dark-green' },
];

export const resourceKpiCards: ResourceKpiCard[] = [
  { key: 'completion', label: 'KPI hoàn thành cứu hộ', value: '98.4%', trend: 2.1, positive: true, miniBars: resourceMiniBars },
  { key: 'arrival', label: 'KPI tới hiện trường', value: '38.4%', trend: -2.1, positive: false, miniBars: resourceMiniBars },
  { key: 'towing', label: 'KPI kéo xe', value: '98.4%', trend: 2.1, positive: true, miniBars: resourceMiniBars },
  { key: 'onsite', label: 'KPI xử lý tại chỗ', value: '90.4%', trend: 20.1, positive: true, miniBars: resourceMiniBars },
];

export const resourceMapStations: ResourceMapStation[] = [
  { id: 's1', name: 'Cửa hàng Nghệ An', drivers: 3, position: [18.673, 105.681], active: true },
  { id: 's2', name: 'Carpla Hà Nội', drivers: 8, position: [21.0285, 105.8542], active: true },
  { id: 's3', name: 'VETC Rescue HCM', drivers: 12, position: [10.7769, 106.7009], active: true },
  { id: 's4', name: 'Cứu hộ 24H Đà Nẵng', drivers: 5, position: [16.0544, 108.2022], active: true },
  { id: 's5', name: 'Fast Tow Hải Phòng', drivers: 4, position: [20.8449, 106.6881], active: true },
  { id: 's6', name: 'Rescue Pro Cần Thơ', drivers: 3, position: [10.0452, 105.7469], active: true },
  { id: 's7', name: 'Auto Rescue Huế', drivers: 2, position: [16.4637, 107.5909], active: true },
  { id: 's8', name: 'SOS Roadside Nha Trang', drivers: 4, position: [12.2388, 109.1967], active: true },
  { id: 's9', name: 'Gara 24h Bình Dương', drivers: 6, position: [11.3254, 106.4770], active: true },
  { id: 's10', name: 'Cứu hộ 24/7 Quảng Ninh', drivers: 3, position: [21.0064, 107.2925], active: true },
  { id: 's11', name: 'Carpla Đồng Nai', drivers: 5, position: [10.9574, 106.8427], active: true },
  { id: 's12', name: 'VETC Rescue Thủ Đức', drivers: 7, position: [10.8494, 106.7717], active: true },
];
