export type KpiDetailTab = 'region' | 'partner' | 'station' | 'driver';

export interface KpiValues {
  arrival: number;
  onsite: number;
  towing: number;
  completion: number;
}

export interface KpiDetailRow {
  id: number;
  name: string;
  warning?: boolean;
  stations?: number;
  vehicles?: number;
  drivers?: number;
  stationName?: string;
  kpis: KpiValues;
}

export const kpiDetailTabs: { id: KpiDetailTab; label: string }[] = [
  { id: 'region', label: 'Khu vực (Tỉnh)' },
  { id: 'partner', label: 'Đối tác' },
  { id: 'station', label: 'Trạm cứu hộ' },
  { id: 'driver', label: 'Tài xế' },
];

export const kpiSummaryCards = [
  {
    key: 'receive',
    label: 'KPI Tiếp nhận',
    value: 50.4,
    target: 80,
    trend: 2.1,
    met: false,
    subLabel: 'Mục tiêu: 80%',
  },
  {
    key: 'dispatch',
    label: 'KPI Điều phối',
    value: 80.4,
    target: 80,
    trend: 2.1,
    met: true,
    subLabel: 'Mục tiêu: 80%',
  },
  {
    key: 'rescue',
    label: 'KPI Cứu hộ',
    value: 50.4,
    target: 90,
    trend: 2.1,
    met: false,
    avgMinutes: 12.4,
    subLabel: 'Mục tiêu: 90.0%',
  },
];

const sampleKpis = {
  bad: { arrival: 20, onsite: 10, towing: 90, completion: 90 },
  mid: { arrival: 85, onsite: 80, towing: 75, completion: 80 },
  ok: { arrival: 88, onsite: 85, towing: 80, completion: 82 },
  good: { arrival: 90, onsite: 90, towing: 90, completion: 90 },
};

export const kpiDetailRows: Record<KpiDetailTab, KpiDetailRow[]> = {
  region: [
    { id: 1, name: 'Hồ Chí Minh', warning: true, stations: 45, vehicles: 120, drivers: 98, kpis: sampleKpis.bad },
    { id: 2, name: 'Hà Nội', stations: 38, vehicles: 95, drivers: 82, kpis: sampleKpis.mid },
    { id: 3, name: 'Đà Nẵng', warning: true, stations: 12, vehicles: 28, drivers: 24, kpis: sampleKpis.ok },
    { id: 4, name: 'Hải Phòng', stations: 10, vehicles: 22, drivers: 18, kpis: sampleKpis.good },
    { id: 5, name: 'Cần Thơ', stations: 8, vehicles: 18, drivers: 15, kpis: sampleKpis.mid },
    { id: 6, name: 'Bình Dương', stations: 14, vehicles: 32, drivers: 28, kpis: sampleKpis.ok },
    { id: 7, name: 'Đồng Nai', warning: true, stations: 11, vehicles: 25, drivers: 20, kpis: sampleKpis.bad },
    { id: 8, name: 'Khánh Hòa', stations: 7, vehicles: 16, drivers: 14, kpis: sampleKpis.good },
    { id: 9, name: 'Lâm Đồng', stations: 6, vehicles: 14, drivers: 12, kpis: sampleKpis.mid },
    { id: 10, name: 'Quảng Ninh', stations: 9, vehicles: 20, drivers: 17, kpis: sampleKpis.ok },
  ],
  partner: [
    { id: 1, name: 'Carpla Service Hà Nội', warning: true, stations: 10, vehicles: 10, drivers: 10, kpis: sampleKpis.bad },
    { id: 2, name: 'Carpla Service Hồ Chí Minh', stations: 20, vehicles: 15, drivers: 12, kpis: sampleKpis.mid },
    { id: 3, name: 'Cứu hộ 24H', stations: 15, vehicles: 20, drivers: 18, kpis: sampleKpis.ok },
    { id: 4, name: 'Cứu hộ 24/7', warning: true, stations: 10, vehicles: 10, drivers: 10, kpis: sampleKpis.good },
    { id: 5, name: 'VETC Rescue Network', stations: 18, vehicles: 22, drivers: 20, kpis: sampleKpis.mid },
    { id: 6, name: 'Gara 24h', stations: 12, vehicles: 14, drivers: 11, kpis: sampleKpis.ok },
    { id: 7, name: 'Rescue Pro', warning: true, stations: 8, vehicles: 10, drivers: 9, kpis: sampleKpis.bad },
    { id: 8, name: 'Auto Rescue VN', stations: 14, vehicles: 16, drivers: 14, kpis: sampleKpis.good },
    { id: 9, name: 'SOS Roadside', stations: 9, vehicles: 11, drivers: 10, kpis: sampleKpis.mid },
    { id: 10, name: 'Fast Tow', stations: 7, vehicles: 9, drivers: 8, kpis: sampleKpis.ok },
  ],
  station: [
    { id: 1, name: 'Carpla Service Hà Nội', warning: true, vehicles: 10, drivers: 10, kpis: sampleKpis.bad },
    { id: 2, name: 'Carpla Service Hồ Chí Minh', vehicles: 15, drivers: 12, kpis: sampleKpis.mid },
    { id: 3, name: 'Cứu hộ 24H - Q1', vehicles: 20, drivers: 18, kpis: sampleKpis.ok },
    { id: 4, name: 'Cứu hộ 24/7 Long Biên', warning: true, vehicles: 10, drivers: 10, kpis: sampleKpis.good },
    { id: 5, name: 'VETC Rescue - Thủ Đức', vehicles: 12, drivers: 11, kpis: sampleKpis.mid },
    { id: 6, name: 'Gara 24h Cầu Giấy', vehicles: 8, drivers: 7, kpis: sampleKpis.ok },
    { id: 7, name: 'Rescue Pro Đống Đa', warning: true, vehicles: 6, drivers: 5, kpis: sampleKpis.bad },
    { id: 8, name: 'Auto Rescue Hai Bà Trưng', vehicles: 9, drivers: 8, kpis: sampleKpis.good },
    { id: 9, name: 'SOS Roadside Tây Hồ', vehicles: 7, drivers: 6, kpis: sampleKpis.mid },
    { id: 10, name: 'Fast Tow Ba Đình', vehicles: 5, drivers: 4, kpis: sampleKpis.ok },
  ],
  driver: [
    { id: 1, name: 'Ngô Quang Hùng', warning: true, stationName: 'Carpla Service Hà Nội', kpis: sampleKpis.bad },
    { id: 2, name: 'Trần Hữu Dũng', stationName: 'Carpla Service Hà Nội', kpis: sampleKpis.mid },
    { id: 3, name: 'Lê Văn Nam', stationName: 'Carpla Service Hồ Chí Minh', kpis: sampleKpis.ok },
    { id: 4, name: 'Phạm Minh Tuấn', warning: true, stationName: 'Cứu hộ 24H', kpis: sampleKpis.good },
    { id: 5, name: 'Hoàng Văn Đức', warning: true, stationName: 'Cứu hộ 24/7', kpis: sampleKpis.mid },
    { id: 6, name: 'Vũ Thị Lan', warning: true, stationName: 'VETC Rescue - Thủ Đức', kpis: sampleKpis.bad },
    { id: 7, name: 'Đặng Văn Tới', warning: true, stationName: 'Gara 24h Cầu Giấy', kpis: sampleKpis.ok },
    { id: 8, name: 'Bùi Quốc Huy', warning: true, stationName: 'Rescue Pro Đống Đa', kpis: sampleKpis.mid },
    { id: 9, name: 'Nguyễn Thị Mai', stationName: 'Auto Rescue Hai Bà Trưng', kpis: sampleKpis.good },
    { id: 10, name: 'Phan Văn Sơn', stationName: 'Fast Tow Ba Đình', kpis: sampleKpis.ok },
  ],
};

export const getKpiTone = (value: number): 'danger' | 'warn' | 'good' | 'neutral' => {
  if (value < 50) return 'danger';
  if (value < 85) return 'warn';
  if (value >= 90) return 'good';
  return 'neutral';
};

export const getPrimaryColumnLabel = (tab: KpiDetailTab): string => {
  switch (tab) {
    case 'region': return 'Khu vực';
    case 'partner': return 'Đối tác';
    case 'station': return 'Trạm cứu hộ';
    case 'driver': return 'Tài xế';
  }
};
