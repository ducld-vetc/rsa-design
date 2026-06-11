export interface HeatmapStatCard {
  key: string;
  label: string;
  value: number;
  trend?: number;
  subLabel?: string;
  progressPercent?: number;
  barChart?: number[];
  variant: 'total' | 'progress' | 'subtext';
}

export interface HeatmapDensityRow {
  rank: number;
  name: string;
  value: number | string;
}

export interface ProvinceHeatPoint {
  id: string;
  name: string;
  position: [number, number];
  intensity: number;
}

export interface RescueOrderMarker {
  id: string;
  orderId: string;
  position: [number, number];
  province: string;
  status: string;
}

export interface HeatmapStationMarker {
  id: string;
  name: string;
  position: [number, number];
  drivers: number;
}

export const heatmapStatCards: HeatmapStatCard[] = [
  {
    key: 'total',
    label: 'Tổng đơn',
    value: 80,
    trend: 2.1,
    barChart: [35, 48, 42, 55, 62, 70, 85],
    variant: 'total',
  },
  {
    key: 'rescuing',
    label: 'Đang cứu hộ',
    value: 35,
    progressPercent: 65,
    variant: 'progress',
  },
  {
    key: 'completed',
    label: 'Hoàn thành',
    value: 1189,
    subLabel: 'Hôm nay: 145',
    variant: 'subtext',
  },
];

export const orderDensityRows: HeatmapDensityRow[] = [
  { rank: 1, name: 'Hà Nội', value: 20 },
  { rank: 2, name: 'Hồ Chí Minh', value: 30 },
  { rank: 3, name: 'Đà Nẵng', value: '12.5%' },
  { rank: 4, name: 'Nghệ An', value: '12.5%' },
  { rank: 5, name: 'Hải Phòng', value: '8.2%' },
];

export const stationDensityRows: HeatmapDensityRow[] = [
  { rank: 1, name: 'Hồ Chí Minh', value: 45 },
  { rank: 2, name: 'Hà Nội', value: 38 },
  { rank: 3, name: 'Đà Nẵng', value: 14 },
  { rank: 4, name: 'Nghệ An', value: 12 },
  { rank: 5, name: 'Bình Dương', value: 11 },
];

export const provinceHeatPoints: ProvinceHeatPoint[] = [
  { id: 'hn', name: 'Hà Nội', position: [21.0285, 105.8542], intensity: 0.95 },
  { id: 'hcm', name: 'Hồ Chí Minh', position: [10.7769, 106.7009], intensity: 1 },
  { id: 'dn', name: 'Đà Nẵng', position: [16.0544, 108.2022], intensity: 0.7 },
  { id: 'na', name: 'Nghệ An', position: [18.673, 105.681], intensity: 0.55 },
  { id: 'hp', name: 'Hải Phòng', position: [20.8449, 106.6881], intensity: 0.5 },
  { id: 'ct', name: 'Cần Thơ', position: [10.0452, 105.7469], intensity: 0.4 },
  { id: 'bd', name: 'Bình Dương', position: [11.3254, 106.477], intensity: 0.65 },
  { id: 'qn', name: 'Quảng Ninh', position: [21.0064, 107.2925], intensity: 0.35 },
  { id: 'kh', name: 'Khánh Hòa', position: [12.2388, 109.1967], intensity: 0.45 },
  { id: 'dl', name: 'Lâm Đồng', position: [11.9404, 108.4583], intensity: 0.3 },
  { id: 'hue', name: 'Huế', position: [16.4637, 107.5909], intensity: 0.42 },
  { id: 'dnai', name: 'Đồng Nai', position: [10.9574, 106.8427], intensity: 0.58 },
];

/** Intensity keyed by province id for GeoJSON fill. */
export const provinceIntensityMap: Record<string, number> = {
  ls: 0.15,
  qn: 0.35,
  hp: 0.5,
  hn: 0.95,
  nb: 0.25,
  th: 0.3,
  na: 0.55,
  ht: 0.28,
  hue: 0.42,
  dn: 0.7,
  qt: 0.32,
  kh: 0.45,
  dl: 0.3,
  bd: 0.65,
  dnai: 0.58,
  hcm: 1,
  ct: 0.4,
  ag: 0.22,
  cm: 0.12,
};

export const rescueOrderMarkers: RescueOrderMarker[] = [
  { id: 'o1', orderId: 'RS12605010004', position: [21.045, 105.842], province: 'Hà Nội', status: 'Đang cứu hộ' },
  { id: 'o2', orderId: 'RS12605010012', position: [21.018, 105.878], province: 'Hà Nội', status: 'Đang tới điểm' },
  { id: 'o3', orderId: 'RS12605010018', position: [21.062, 105.821], province: 'Hà Nội', status: 'Đang cứu hộ' },
  { id: 'o4', orderId: 'RS12605010022', position: [20.985, 105.905], province: 'Hà Nội', status: 'Khởi tạo' },
  { id: 'o5', orderId: 'RS12605010031', position: [21.088, 105.865], province: 'Hà Nội', status: 'Đang cứu hộ' },
  { id: 'o6', orderId: 'RS12605010045', position: [21.032, 105.912], province: 'Hà Nội', status: 'Đang kéo xe' },
  { id: 'o7', orderId: 'RS12605010052', position: [20.912, 105.768], province: 'Hà Nội', status: 'Đang cứu hộ' },
  { id: 'o8', orderId: 'RS12605010061', position: [21.105, 105.798], province: 'Hà Nội', status: 'Đang tới điểm' },
  { id: 'o9', orderId: 'RS12605020004', position: [10.792, 106.682], province: 'Hồ Chí Minh', status: 'Đang cứu hộ' },
  { id: 'o10', orderId: 'RS12605020012', position: [10.758, 106.721], province: 'Hồ Chí Minh', status: 'Đang cứu hộ' },
  { id: 'o11', orderId: 'RS12605020018', position: [10.812, 106.655], province: 'Hồ Chí Minh', status: 'Khởi tạo' },
  { id: 'o12', orderId: 'RS12605020025', position: [10.735, 106.698], province: 'Hồ Chí Minh', status: 'Đang tới điểm' },
  { id: 'o13', orderId: 'RS12605020033', position: [10.845, 106.712], province: 'Hồ Chí Minh', status: 'Đang cứu hộ' },
  { id: 'o14', orderId: 'RS12605020041', position: [10.768, 106.745], province: 'Hồ Chí Minh', status: 'Đang kéo xe' },
  { id: 'o15', orderId: 'RS12605020048', position: [10.802, 106.668], province: 'Hồ Chí Minh', status: 'Đang cứu hộ' },
  { id: 'o16', orderId: 'RS12605030008', position: [16.068, 108.212], province: 'Đà Nẵng', status: 'Đang cứu hộ' },
  { id: 'o17', orderId: 'RS12605030015', position: [18.682, 105.692], province: 'Nghệ An', status: 'Đang tới điểm' },
  { id: 'o18', orderId: 'RS12605030022', position: [20.852, 106.698], province: 'Hải Phòng', status: 'Đang cứu hộ' },
];

export const heatmapStationMarkers: HeatmapStationMarker[] = [
  { id: 's1', name: 'Carpla Hà Nội', position: [21.0285, 105.8542], drivers: 8 },
  { id: 's2', name: 'VETC Rescue HCM', position: [10.7769, 106.7009], drivers: 12 },
  { id: 's3', name: 'Cứu hộ 24H Đà Nẵng', position: [16.0544, 108.2022], drivers: 5 },
  { id: 's4', name: 'Cửa hàng Nghệ An', position: [18.673, 105.681], drivers: 3 },
  { id: 's5', name: 'Fast Tow Hải Phòng', position: [20.8449, 106.6881], drivers: 4 },
  { id: 's6', name: 'Rescue Pro Cần Thơ', position: [10.0452, 105.7469], drivers: 3 },
  { id: 's7', name: 'Gara 24h Bình Dương', position: [11.3254, 106.477], drivers: 6 },
  { id: 's8', name: 'Cứu hộ 24/7 Quảng Ninh', position: [21.0064, 107.2925], drivers: 3 },
  { id: 's9', name: 'SOS Roadside Nha Trang', position: [12.2388, 109.1967], drivers: 4 },
  { id: 's10', name: 'Carpla Đồng Nai', position: [10.9574, 106.8427], drivers: 5 },
];

export const heatIntensityColor = (intensity: number): string => {
  if (intensity >= 0.85) return '#EF4444';
  if (intensity >= 0.65) return '#F97316';
  if (intensity >= 0.45) return '#EAB308';
  if (intensity >= 0.3) return '#22C55E';
  return '#3B82F6';
};
