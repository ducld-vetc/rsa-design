/**
 * Độ phủ địa bàn theo trung tâm xã/phường (V1 centroid).
 *
 * - Xã: D = khoảng cách tới trạm gần nhất; D < R (30km) → 100%, ngược lại 0%.
 * - Huyện / Tỉnh: số xã phủ 100% / tổng số xã có centroid.
 *
 * Nguồn centroid: rsa-docs/.../geo_v1_63_tinh/xa_63_centroid.csv
 * → regenerate: python script ghi wardCentroidsV1.json (chỉ xã có tọa độ + mã RSA huyện/xã).
 */
import wardCentroidsV1 from './wardCentroidsV1.json';
import {
  AREA_PROVINCES,
  NEW_PROVINCE_CODES,
  OLD_PROVINCES,
  V1_TO_BOTH_PROVINCE,
  type AddressSchemaMode,
} from './stationCoverageProvinces';

export const SERVICE_RADIUS_KM = 30;

type WardCentroidRow = {
  p: string;
  d: string;
  c: string;
  n: string;
  lat: number;
  lng: number;
};

const WARDS = wardCentroidsV1 as WardCentroidRow[];

export interface AreaCoverageMetrics {
  wardTotal: number;
  wardCovered: number;
  /** % độ phủ = covered / total */
  cr: number;
}

export interface WardCoverageResult {
  provinceCode: string;
  districtCode: string;
  precinctCode: string;
  name: string;
  lat: number;
  lng: number;
  nearestKm: number | null;
  covered: boolean;
  cr: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function areaCoveragePercent(covered: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((covered / total) * 1000) / 10;
}

function toBothProvinceCode(v1Code: string): string {
  const code = v1Code.trim().toUpperCase();
  if (NEW_PROVINCE_CODES.has(code)) return code;
  return V1_TO_BOTH_PROVINCE[code] ?? code;
}

/** Mã tỉnh hiển thị theo mode địa chỉ (V1 giữ nguyên; mới → BOTH). */
export function wardDisplayProvinceCode(mode: AddressSchemaMode, v1ProvinceCode: string): string {
  if (mode === 'old') return v1ProvinceCode.trim().toUpperCase();
  return toBothProvinceCode(v1ProvinceCode);
}

/**
 * Map mã tỉnh bất kỳ (V1 / BOTH / alias UI) → provinceId dùng trong báo cáo.
 * `defs`: danh sách { id, code, aliases? } từ getProvinceCoverageRows.
 */
export function buildProvinceCodeToIdMap(
  defs: Array<{ id: string; code: string; aliases?: string[] }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const def of defs) {
    map.set(def.code.trim().toUpperCase(), def.id);
    for (const alias of def.aliases ?? []) {
      map.set(alias.trim().toUpperCase(), def.id);
    }
  }
  // BOTH master codes → id (vd CBA → cbg khi UI dùng CBG)
  for (const row of AREA_PROVINCES) {
    const code = row.code.toUpperCase();
    if (map.has(code)) continue;
    const hit = defs.find(
      (d) =>
        d.code.toUpperCase() === code ||
        (d.aliases ?? []).some((a) => a.trim().toUpperCase() === code),
    );
    if (hit) map.set(code, hit.id);
  }
  // V1 merged → BOTH id (mode mới)
  for (const [v1, both] of Object.entries(V1_TO_BOTH_PROVINCE)) {
    const id = map.get(both.toUpperCase());
    if (id) map.set(v1.toUpperCase(), id);
  }
  for (const row of OLD_PROVINCES) {
    if (!map.has(row.code.toUpperCase())) map.set(row.code.toUpperCase(), row.id);
  }
  return map;
}

function nearestStationKm(
  lat: number,
  lng: number,
  stations: Array<{ position: [number, number]; hasValidPosition?: boolean }>,
): number | null {
  let best = Infinity;
  const latPad = 0.35;
  const lngPad = 0.4;
  for (const station of stations) {
    if (station.hasValidPosition === false) continue;
    const [sLat, sLng] = station.position;
    if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) continue;
    if (Math.abs(sLat - lat) > latPad || Math.abs(sLng - lng) > lngPad) continue;
    const d = haversineKm(lat, lng, sLat, sLng);
    if (d < best) best = d;
  }
  if (best === Infinity) {
    for (const station of stations) {
      if (station.hasValidPosition === false) continue;
      const [sLat, sLng] = station.position;
      if (!Number.isFinite(sLat) || !Number.isFinite(sLng)) continue;
      const d = haversineKm(lat, lng, sLat, sLng);
      if (d < best) best = d;
    }
  }
  return best === Infinity ? null : best;
}

/** D < R → phủ 100%; D ≥ R hoặc không có trạm → 0%. */
export function isWardCovered(nearestKm: number | null, radiusKm: number = SERVICE_RADIUS_KM): boolean {
  return nearestKm != null && nearestKm < radiusKm;
}

export function evaluateWardCoverage(
  mode: AddressSchemaMode,
  stations: Array<{ position: [number, number]; hasValidPosition?: boolean }>,
  radiusKm: number = SERVICE_RADIUS_KM,
): WardCoverageResult[] {
  const plottable = stations.filter((s) => s.hasValidPosition !== false);
  return WARDS.map((ward) => {
    const nearestKm = nearestStationKm(ward.lat, ward.lng, plottable);
    const covered = isWardCovered(nearestKm, radiusKm);
    return {
      provinceCode: wardDisplayProvinceCode(mode, ward.p),
      districtCode: ward.d,
      precinctCode: ward.c,
      name: ward.n,
      lat: ward.lat,
      lng: ward.lng,
      nearestKm,
      covered,
      cr: covered ? 100 : 0,
    };
  });
}

export function metricsFromWards(wards: Array<{ covered: boolean }>): AreaCoverageMetrics {
  const wardTotal = wards.length;
  const wardCovered = wards.reduce((sum, w) => sum + (w.covered ? 1 : 0), 0);
  const cr = areaCoveragePercent(wardCovered, wardTotal);
  return { wardTotal, wardCovered, cr };
}

/** % độ phủ theo provinceId (map mã → id qua codeToId). */
export function computeProvinceAreaCoverage(
  mode: AddressSchemaMode,
  stations: Array<{ position: [number, number]; hasValidPosition?: boolean }>,
  codeToId: Map<string, string>,
  radiusKm: number = SERVICE_RADIUS_KM,
): Map<string, AreaCoverageMetrics> {
  const wards = evaluateWardCoverage(mode, stations, radiusKm);
  const byProvince = new Map<string, WardCoverageResult[]>();
  for (const ward of wards) {
    const provinceId = codeToId.get(ward.provinceCode.toUpperCase());
    if (!provinceId) continue;
    const list = byProvince.get(provinceId) ?? [];
    list.push(ward);
    byProvince.set(provinceId, list);
  }
  const out = new Map<string, AreaCoverageMetrics>();
  for (const [provinceId, list] of byProvince) {
    out.set(provinceId, metricsFromWards(list));
  }
  return out;
}

export function wardCoverageKey(provinceCode: string, districtCode: string, precinctCode: string): string {
  return `${provinceCode}|${districtCode}|${precinctCode}`;
}
