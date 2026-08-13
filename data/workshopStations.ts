import { haversineKm, RESCUE_STATIONS } from './locationSearchMockData';

export interface WorkshopStation {
  id: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface GeoStation {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

/** Khoảng cách < 5m → trùng trạm đã tồn tại */
export const WORKSHOP_DUPLICATE_RADIUS_M = 5;

export const INITIAL_WORKSHOP_STATIONS: WorkshopStation[] = [
  { id: 'ws-1', name: 'Carpla Service Thái Bình', address: 'Lý Bôn, TP. Thái Bình', lat: 20.45, lng: 106.34 },
  { id: 'ws-2', name: 'Carpla Service Hà Nội', address: 'Hoàn Kiếm, Hà Nội', lat: 21.0285, lng: 105.8452 },
  { id: 'ws-3', name: 'Carpla Service Hải Phòng', address: 'Lê Chân, Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { id: 'ws-4', name: 'Carpla Service Đà Nẵng', address: 'Hải Châu, Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { id: 'ws-5', name: 'Carpla Service TP. Hồ Chí Minh', address: 'Quận 1, TP.HCM', lat: 10.7769, lng: 106.7009 },
  { id: 'ws-6', name: 'Carpla Service Cần Thơ', address: 'Ninh Kiều, Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { id: 'ws-7', name: 'Carpla Service Nha Trang', address: 'Nha Trang, Khánh Hòa', lat: 12.2388, lng: 109.1967 },
  { id: 'ws-8', name: 'Carpla Service Huế', address: 'TP. Huế', lat: 16.4637, lng: 107.5909 },
];

export function parseLatLng(latStr: string, lngStr: string): { lat: number; lng: number } | null {
  const lat = Number(String(latStr).trim());
  const lng = Number(String(lngStr).trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  return haversineKm([a.lat, a.lng], [b.lat, b.lng]) * 1000;
}

export function collectNearbyStations(workshops: WorkshopStation[]): GeoStation[] {
  const fromWorkshops: GeoStation[] = workshops
    .filter((s): s is WorkshopStation & { lat: number; lng: number } => s.lat != null && s.lng != null)
    .map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
    }));

  const seen = new Set(fromWorkshops.map((s) => s.id));
  const fromRescue: GeoStation[] = RESCUE_STATIONS.filter((s) => !seen.has(s.id)).map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.position[0],
    lng: s.position[1],
  }));

  return [...fromWorkshops, ...fromRescue];
}

export function findDuplicateStation(
  lat: number,
  lng: number,
  workshops: WorkshopStation[],
  radiusM = WORKSHOP_DUPLICATE_RADIUS_M
): { station: GeoStation; distanceM: number } | null {
  let best: { station: GeoStation; distanceM: number } | null = null;
  for (const station of collectNearbyStations(workshops)) {
    const d = distanceMeters({ lat, lng }, station);
    if (d < radiusM && (!best || d < best.distanceM)) {
      best = { station, distanceM: d };
    }
  }
  return best;
}

export function formatDistanceM(distanceM: number): string {
  if (distanceM < 0.1) return '0 m';
  if (distanceM < 1) return `${distanceM.toFixed(1)} m`;
  return `${Math.round(distanceM * 10) / 10} m`;
}
