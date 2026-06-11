export interface DashboardFilterValues {
  createdFrom: string;
  createdTo: string;
  partner: string;
  station: string;
  province: string;
  ward: string;
}

export const defaultDashboardFilters: DashboardFilterValues = {
  createdFrom: '2026-06-01',
  createdTo: '2026-06-09',
  partner: '',
  station: '',
  province: '',
  ward: '',
};

export const partnerOptions = [
  { value: '', label: 'Tất cả đối tác' },
  { value: 'carpla', label: 'CARPLA - CARPLA SERVICE' },
  { value: 'gara24h', label: 'Gara 24h' },
  { value: 'vetc-partner', label: 'VETC Partner Network' },
];

export const allStationOptions = [
  { value: '', label: 'Tất cả trạm cứu hộ' },
  { value: 'carpla-hn', label: 'Carpla Service - CN Hà Nội' },
  { value: 'carpla-hcm', label: 'Carpla Service - CN TP.HCM' },
  { value: 'gara24h-cg', label: 'Gara 24h - Cầu Giấy' },
  { value: 'gara24h-q1', label: 'Gara 24h - Quận 1' },
  { value: 'vetc-lb', label: 'VETC Rescue - Long Biên' },
  { value: 'vetc-td', label: 'VETC Rescue - Thủ Đức' },
];

export const stationOptions: Record<string, { value: string; label: string }[]> = {
  '': allStationOptions,
  carpla: [
    { value: '', label: 'Tất cả trạm CARPLA' },
    { value: 'carpla-hn', label: 'Carpla Service - CN Hà Nội' },
    { value: 'carpla-hcm', label: 'Carpla Service - CN TP.HCM' },
  ],
  gara24h: [
    { value: '', label: 'Tất cả trạm Gara 24h' },
    { value: 'gara24h-cg', label: 'Gara 24h - Cầu Giấy' },
    { value: 'gara24h-q1', label: 'Gara 24h - Quận 1' },
  ],
  'vetc-partner': [
    { value: '', label: 'Tất cả trạm VETC' },
    { value: 'vetc-lb', label: 'VETC Rescue - Long Biên' },
    { value: 'vetc-td', label: 'VETC Rescue - Thủ Đức' },
  ],
};

export const provinceOptions = [
  { value: '', label: 'Tất cả Tỉnh/Thành phố' },
  { value: 'hn', label: 'Hà Nội' },
  { value: 'hcm', label: 'TP. Hồ Chí Minh' },
  { value: 'dn', label: 'Đà Nẵng' },
];

export const wardOptions: Record<string, { value: string; label: string }[]> = {
  '': [{ value: '', label: 'Tất cả Phường/Xã' }],
  hn: [
    { value: '', label: 'Tất cả Phường/Xã' },
    { value: 'long-bien', label: 'Phường Long Biên' },
    { value: 'cau-giay', label: 'Phường Cầu Giấy' },
    { value: 'dong-da', label: 'Phường Đống Đa' },
  ],
  hcm: [
    { value: '', label: 'Tất cả Phường/Xã' },
    { value: 'q1', label: 'Phường Bến Nghé' },
    { value: 'thu-duc', label: 'Phường Thủ Đức' },
    { value: 'q7', label: 'Phường Tân Phú' },
  ],
  dn: [
    { value: '', label: 'Tất cả Phường/Xã' },
    { value: 'hai-chau', label: 'Phường Hải Châu' },
    { value: 'thanh-khe', label: 'Phường Thanh Khê' },
  ],
};

export const countActiveFilters = (filters: DashboardFilterValues): number => {
  let count = 0;
  if (filters.partner) count += 1;
  if (filters.station) count += 1;
  if (filters.province) count += 1;
  if (filters.ward) count += 1;
  return count;
};
