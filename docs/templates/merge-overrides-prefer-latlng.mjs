/**
 * Merge overrides theo rule Ops:
 * 1) Có lat/lng hợp lệ (trong VN, không placeholder) + Nominatim khớp master V1
 *    → ƯU TIÊN hơn map từ address
 * 2) Tọa độ ngoài VN / Nominatim country ≠ vn / placeholder → BỎ (không override từ geo)
 * 3) Không khớp master V1 → BỎ
 *
 * Input:
 *  - stationAdminOverrides.ts (reverse-map address) — rebuild trước khi chạy
 *  - geocode-unmapped-results.json (Nominatim đã chạy)
 *  - (tuỳ chọn) geocode thêm các điểm plottable còn thiếu
 *
 * Chạy: node docs/templates/merge-overrides-prefer-latlng.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');

const V1_TO_BOTH = {
  BDI: 'GLA', BDU: 'HCM', BGI: 'BNI', BKA: 'TNG', BLI: 'CMA', BPH: 'DNI', BRV: 'HCM',
  BTH: 'LDO', BTR: 'VLO', DNO: 'LDO', HBI: 'PTH', HDU: 'HPH', HGA: 'TQU', HGI: 'CTH',
  HNA: 'NBI', KGI: 'AGI', KON: 'QNG', LAN: 'TNI', NDI: 'NBI', NTH: 'KHO', PYE: 'DLA',
  QBI: 'QTR', QNA: 'DNA', STR: 'CTH', TBI: 'HYE', TGI: 'DTH', TVI: 'VLO', VPH: 'PTH',
  YBA: 'LCA', HTA: 'HNO', NHA: 'NBI', QK: 'CTH', '01': 'HNO', HNO1: 'HNO',
};

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stripAdminPrefix(name) {
  return String(name || '')
    .replace(/^(?:đặc khu|thị trấn|thị xã|thành phố|quận|huyện|phường|xã)\s+/i, '')
    .replace(/^(?:q|h|tx|t\/x|p|x)\.?\s*/i, '')
    .trim();
}

function isPlottableVn(lat, lng) {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < 8.35 || lat > 23.45 || lng < 102.12 || lng > 109.55) return false;
  if (Math.abs(lat - Math.round(lat)) < 1e-6 && Math.abs(lng - Math.round(lng)) < 1e-6) return false;
  return true;
}

function loadStations() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationCoverageFromDb.ts'), 'utf8');
  const start = src.indexOf('[', src.indexOf('export const DB_STATIONS'));
  const end = src.indexOf('] as DbStationRow', start);
  return Function(`"use strict"; return (${src.slice(start, end + 1)});`)();
}

function loadOverrides() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts'), 'utf8');
  const i = src.indexOf('{', src.indexOf('STATION_ADMIN_OVERRIDES'));
  let json = src.slice(i).trim();
  if (json.endsWith(';')) json = json.slice(0, -1);
  return JSON.parse(json);
}

function loadArea() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/areaNameLookup.ts'), 'utf8');
  const json = src.match(/=\s*(\{[\s\S]*\});?\s*$/)?.[1];
  return Function(`"use strict"; return (${json});`)();
}

function buildIndexes(AREA) {
  const districtOk = new Set();
  const precinctOk = new Set();
  const districts = [];
  const byPrecinctCore = new Map();
  for (const [key, name] of Object.entries(AREA)) {
    if (!key.startsWith('V1|')) continue;
    const [, province, district, precinct] = key.split('|');
    if (!province || !district) continue;
    const core = normalizeKey(stripAdminPrefix(name));
    if (!precinct) {
      districtOk.add(`${province}|${district}`);
      districts.push({ province, district, name, core });
    } else {
      precinctOk.add(`${province}|${district}|${precinct}`);
      const list = byPrecinctCore.get(core) ?? [];
      list.push({ province, district, precinct, name, core });
      byPrecinctCore.set(core, list);
    }
  }
  districts.sort((a, b) => b.core.length - a.core.length);
  return { districtOk, precinctOk, districts, byPrecinctCore };
}

function allowedProvinces(code) {
  const set = new Set();
  let c = (code || '').trim().toUpperCase();
  if (c === '01' || c === 'HNO1') c = 'HNO';
  if (!c || /^\d+$/.test(c)) return set;
  set.add(c);
  if (V1_TO_BOTH[c]) set.add(V1_TO_BOTH[c]);
  for (const [v1, both] of Object.entries(V1_TO_BOTH)) {
    if (both === c && !/^\d+$/.test(v1) && !['HNO1', 'HTA', 'NHA', 'QK'].includes(v1)) set.add(v1);
  }
  return set;
}

function inMaster(indexes, o) {
  if (!o?.districtCode || !o?.provinceCode) return false;
  const dKey = `${o.provinceCode}|${o.districtCode}`;
  if (!indexes.districtOk.has(dKey)) return false;
  if (o.precinctCode) {
    return indexes.precinctOk.has(`${o.provinceCode}|${o.districtCode}|${o.precinctCode}`);
  }
  return true;
}

function parseTokens(row) {
  return (row.tokens || [])
    .map((s) => {
      const [field, ...rest] = String(s).split('=');
      const raw = rest.join('=');
      return { field, raw, core: normalizeKey(stripAdminPrefix(raw)) };
    })
    .filter((t) => t.core.length >= 3);
}

function matchGeoToMaster(station, tokens, indexes, displayName) {
  // country check via display_name
  const dn = normalizeKey(displayName || '');
  if (dn.includes('campuchia') || dn.includes('cambodia') || dn.includes('lao ') || dn.endsWith(' lao') || dn.includes(' thailand') || dn.includes(' trung quoc') || dn.includes('china')) {
    return null;
  }

  const allowed = allowedProvinces(station.provinceCode);
  // Nếu không có province_code: vẫn cho match master theo tên, nhưng phải có đúng 1 tỉnh trong hits
  const precinctHits = [];
  for (const t of tokens) {
    for (const item of indexes.byPrecinctCore.get(t.core) ?? []) {
      if (allowed.size && !allowed.has(item.province)) continue;
      const score =
        t.core.length +
        (['suburb', 'neighbourhood', 'quarter', 'city_district', 'village', 'hamlet'].includes(t.field)
          ? 8
          : 0);
      precinctHits.push({ ...item, score, via: t.field });
    }
  }
  precinctHits.sort((a, b) => b.score - a.score);
  if (precinctHits.length) {
    // Nếu không có allowed: chỉ nhận khi mọi hit top cùng province
    if (!allowed.size) {
      const top = precinctHits.filter((h) => h.score === precinctHits[0].score);
      const provs = new Set(top.map((h) => h.province));
      if (provs.size > 1) return null;
    }
    const hit = precinctHits[0];
    return {
      provinceCode: hit.province,
      districtCode: hit.district,
      precinctCode: hit.precinct,
      source: 'GEO_LATLNG',
      matched: hit.name,
    };
  }

  const distHits = [];
  for (const t of tokens) {
    for (const d of indexes.districts) {
      if (allowed.size && !allowed.has(d.province)) continue;
      if (d.core.length < 4) continue;
      if (d.core === t.core || t.core.includes(d.core) || d.core.includes(t.core)) {
        distHits.push({ ...d, score: d.core.length, via: t.field });
      }
    }
  }
  distHits.sort((a, b) => b.score - a.score);
  if (distHits.length) {
    if (!allowed.size) {
      const top = distHits.filter((h) => h.score === distHits[0].score);
      if (new Set(top.map((h) => h.province)).size > 1) return null;
    }
    const d = distHits[0];
    // Chỉ gán huyện nếu có trong master — không random xã nếu không chắc
    return {
      provinceCode: d.province,
      districtCode: d.district,
      source: 'GEO_LATLNG_DISTRICT',
      matched: d.name,
    };
  }
  return null;
}

function main() {
  const stations = loadStations();
  const indexes = buildIndexes(loadArea());
  let overrides = loadOverrides();
  const geoResults = JSON.parse(
    readFileSync(join(__dirname, 'geocode-unmapped-results.json'), 'utf8'),
  );
  const geoById = Object.fromEntries(geoResults.map((r) => [String(r.id), r]));

  const stats = {
    addressKept: 0,
    geoPreferred: 0,
    geoAdded: 0,
    droppedOutVnOrBadCoord: 0,
    droppedNoMaster: 0,
    droppedGeoNoMaster: 0,
    skippedPlaceholderCoord: 0,
  };

  const discarded = [];

  // 1) Drop overrides không có trong master
  for (const [id, o] of Object.entries(overrides)) {
    if (!inMaster(indexes, o)) {
      delete overrides[id];
      stats.droppedNoMaster += 1;
      discarded.push({ id, reason: 'NO_MASTER', o });
    }
  }

  // 2) Drop overrides của trạm tọa độ ngoài VN / placeholder — nếu chỉ dựa geo trước đó
  //    Rule: placeholder/out-bbox → không dùng latlng; giữ address override nếu còn master
  for (const s of stations) {
    const id = String(s.id);
    const plot = isPlottableVn(s.latitude, s.longitude);
    if (plot) continue;
    // ngoài khung hoặc placeholder
    stats.skippedPlaceholderCoord += 1;
  }

  // 3) Ưu tiên lat/lng: áp Nominatim (đã có) khi plottable + khớp master
  for (const s of stations) {
    const id = String(s.id);
    const geo = geoById[id];
    if (!geo || geo.error) continue;

    if (!isPlottableVn(s.latitude, s.longitude)) {
      // bỏ kết quả geo cho điểm tọa độ xấu
      stats.droppedOutVnOrBadCoord += 1;
      discarded.push({ id, code: s.code, reason: 'BAD_OR_OUT_COORD', display: geo.display_name });
      continue;
    }

    // Nominatim ngoài VN
    const dn = String(geo.display_name || '').toLowerCase();
    const countryCode = geo.country_code || geo.address?.country_code;
    if (countryCode && countryCode !== 'vn') {
      stats.droppedOutVnOrBadCoord += 1;
      discarded.push({ id, code: s.code, reason: 'GEO_OUTSIDE_VN', display: geo.display_name, countryCode });
      delete overrides[id];
      continue;
    }
    if (
      /campuchia|cambodia|ລາວ|\blaos\b|borikhamxay|thailand|中国/.test(dn) 
    ) {
      stats.droppedOutVnOrBadCoord += 1;
      discarded.push({ id, code: s.code, reason: 'GEO_OUTSIDE_VN', display: geo.display_name });
      delete overrides[id];
      continue;
    }
    // display-based outside
    if (/campuchia|cambodia|lao\b|lào|thailand/.test(normalizeKey(geo.display_name || ''))) {
      stats.droppedOutVnOrBadCoord += 1;
      discarded.push({ id, code: s.code, reason: 'GEO_OUTSIDE_VN', display: geo.display_name });
      delete overrides[id];
      continue;
    }

    const tokens = parseTokens(geo);
    const hit = matchGeoToMaster(s, tokens, indexes, geo.display_name);
    if (!hit || !inMaster(indexes, hit)) {
      stats.droppedGeoNoMaster += 1;
      discarded.push({ id, code: s.code, reason: 'GEO_NO_MASTER', display: geo.display_name, tokens: geo.tokens });
      continue;
    }

    const prev = overrides[id];
    overrides[id] = {
      provinceCode: hit.provinceCode,
      districtCode: hit.districtCode,
      ...(hit.precinctCode ? { precinctCode: hit.precinctCode } : {}),
    };
    if (prev) stats.geoPreferred += 1;
    else stats.geoAdded += 1;
  }

  // 4) Đếm address kept
  for (const id of Object.keys(overrides)) {
    if (!geoById[id]?.hit && !geoById[id]?.display_name) stats.addressKept += 1;
  }
  // recount properly
  stats.overrideCount = Object.keys(overrides).length;
  stats.addressOnly = Object.keys(overrides).filter((id) => !geoById[id] || geoById[id].error).length;

  writeFileSync(
    join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts'),
    `/**
 * Override Địa chỉ cũ:
 * - Ưu tiên lat/lng (Nominatim) khi tọa độ trong VN + khớp master V1
 * - Address reverse-map (NQ 1654 / heuristic) khi không có geo hợp lệ
 * - Bỏ: ngoài VN / placeholder coord / không có master
 * key = String(rescue_station_id)
 */
export interface StationAdminOverride {
  provinceCode?: string;
  districtCode: string;
  precinctCode?: string;
}

export const STATION_ADMIN_OVERRIDES: Record<string, StationAdminOverride> = ${JSON.stringify(
      overrides,
      null,
      2,
    )};
`,
  );

  writeFileSync(
    join(__dirname, 'merge-prefer-latlng-summary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), stats, discarded: discarded.slice(0, 40) }, null, 2),
  );

  console.log(JSON.stringify(stats, null, 2));
}

main();
