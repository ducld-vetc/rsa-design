/**
 * Thử map 121 trạm unmapped bằng Nominatim reverse geocode (lat/lng)
 * → khớp master V1. Không tin nguyên văn Google; chỉ lấy gợi ý tên rồi match RSA.
 *
 * Chạy: node docs/templates/geocode-unmapped-stations.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');
const UA = 'RSA-StationCoverage/1.0 (internal ops reverse-geocode; contact: rsa-docs)';

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

function loadArea() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/areaNameLookup.ts'), 'utf8');
  const json = src.match(/=\s*(\{[\s\S]*\});?\s*$/)?.[1];
  return Function(`"use strict"; return (${json});`)();
}

function loadOverrides() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts'), 'utf8');
  const i = src.indexOf('{', src.indexOf('STATION_ADMIN_OVERRIDES'));
  let json = src.slice(i).trim();
  if (json.endsWith(';')) json = json.slice(0, -1);
  return JSON.parse(json);
}

function buildIndexes(AREA) {
  const districts = [];
  const byPrecinctCore = new Map();
  const provinceByName = new Map();
  for (const [key, name] of Object.entries(AREA)) {
    const [schema, province, district, precinct] = key.split('|');
    if (schema === 'BOTH' && province && !district) {
      provinceByName.set(normalizeKey(name), province);
      provinceByName.set(normalizeKey(stripAdminPrefix(name)), province);
    }
    if (schema === 'V1' && province && !district && !precinct) {
      provinceByName.set(normalizeKey(name), province);
    }
    if (schema !== 'V1' || !province || !district) continue;
    const core = normalizeKey(stripAdminPrefix(name));
    if (!precinct) {
      districts.push({ province, district, name, core });
    } else {
      const list = byPrecinctCore.get(core) ?? [];
      list.push({ province, district, precinct, name, core });
      byPrecinctCore.set(core, list);
    }
  }
  districts.sort((a, b) => b.core.length - a.core.length);
  return { districts, byPrecinctCore, provinceByName };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function reverseNominatim(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'vi');
  url.searchParams.set('zoom', '18');
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

function tokensFromNominatim(addr) {
  if (!addr) return [];
  const keys = [
    'suburb',
    'neighbourhood',
    'quarter',
    'city_district',
    'borough',
    'municipality',
    'city',
    'town',
    'village',
    'hamlet',
    'county',
    'state',
    'province',
    'district',
  ];
  const out = [];
  for (const k of keys) {
    if (addr[k]) out.push({ field: k, raw: addr[k], core: normalizeKey(stripAdminPrefix(addr[k])) });
  }
  return out.filter((t) => t.core.length >= 3);
}

function matchV1(tokens, indexes, preferredProvince) {
  // 1) precinct by name
  const precinctHits = [];
  for (const t of tokens) {
    const list = indexes.byPrecinctCore.get(t.core) ?? [];
    for (const item of list) {
      if (preferredProvince && item.province !== preferredProvince) continue;
      precinctHits.push({ ...item, via: t.field, score: t.core.length + (t.field === 'suburb' ? 10 : 0) });
    }
  }
  // if preferredProvince filtered empty, retry without
  let pool = precinctHits;
  if (!pool.length) {
    for (const t of tokens) {
      const list = indexes.byPrecinctCore.get(t.core) ?? [];
      for (const item of list) {
        pool.push({ ...item, via: t.field, score: t.core.length });
      }
    }
  }
  pool.sort((a, b) => b.score - a.score);
  if (pool.length) {
    return {
      provinceCode: pool[0].province,
      districtCode: pool[0].district,
      precinctCode: pool[0].precinct,
      confidence: pool.length === 1 || pool[0].score > pool[1]?.score ? 'GEO_PRECINCT' : 'GEO_PRECINCT_AMBIG',
      matched: pool[0].name,
    };
  }

  // 2) district by name
  const distHits = [];
  for (const t of tokens) {
    for (const d of indexes.districts) {
      if (preferredProvince && d.province !== preferredProvince) continue;
      if (d.core === t.core || (d.core.length >= 4 && t.core.includes(d.core)) || (t.core.length >= 4 && d.core.includes(t.core))) {
        distHits.push({ ...d, via: t.field, score: Math.min(d.core.length, t.core.length) });
      }
    }
  }
  distHits.sort((a, b) => b.score - a.score);
  if (distHits.length) {
    const d = distHits[0];
    // random-ish pick first precinct under district for display hierarchy
    const precincts = [...indexes.byPrecinctCore.values()].flat().filter((p) => p.province === d.province && p.district === d.district);
    const prec = precincts[0];
    return {
      provinceCode: d.province,
      districtCode: d.district,
      ...(prec ? { precinctCode: prec.precinct } : {}),
      confidence: 'GEO_DISTRICT',
      matched: d.name,
    };
  }

  // 3) province only — not enough for hierarchy
  return null;
}

function inferPreferredProvince(station, indexes, tokens) {
  const code = (station.provinceCode || '').trim().toUpperCase();
  if (code && !/^\d+$/.test(code)) return code === '01' ? 'HNO' : code;
  for (const t of tokens) {
    const p = indexes.provinceByName.get(t.core);
    if (p) return p;
  }
  return null;
}

async function main() {
  const unmapped = JSON.parse(readFileSync(join(__dirname, 'unmapped-stations.json'), 'utf8'));
  const AREA = loadArea();
  const indexes = buildIndexes(AREA);
  const overrides = loadOverrides();

  const results = [];
  let mapped = 0;
  let failed = 0;

  for (let i = 0; i < unmapped.length; i += 1) {
    const s = unmapped[i];
    process.stdout.write(`[${i + 1}/${unmapped.length}] ${s.code} ... `);
    try {
      const geo = await reverseNominatim(s.latitude, s.longitude);
      const tokens = tokensFromNominatim(geo.address || {});
      const preferred = inferPreferredProvince(s, indexes, tokens);
      const hit = matchV1(tokens, indexes, preferred);
      const row = {
        id: s.id,
        code: s.code,
        address: s.address,
        display_name: geo.display_name,
        tokens: tokens.map((t) => `${t.field}=${t.raw}`),
        preferredProvince: preferred,
        hit,
      };
      results.push(row);
      if (hit) {
        overrides[String(s.id)] = {
          provinceCode: hit.provinceCode,
          districtCode: hit.districtCode,
          ...(hit.precinctCode ? { precinctCode: hit.precinctCode } : {}),
        };
        mapped += 1;
        console.log(`OK ${hit.confidence} → ${hit.provinceCode}/${hit.districtCode}/${hit.precinctCode || '-'} (${hit.matched})`);
      } else {
        failed += 1;
        console.log('NO_MATCH', geo.display_name?.slice(0, 80));
      }
    } catch (e) {
      failed += 1;
      results.push({ id: s.id, code: s.code, error: String(e.message || e) });
      console.log('ERR', e.message || e);
    }
    await sleep(1100); // Nominatim 1 req/s
  }

  writeFileSync(join(__dirname, 'geocode-unmapped-results.json'), JSON.stringify(results, null, 2));

  const outTs = join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts');
  writeFileSync(
    outTs,
    `/**
 * Reverse-map Địa chỉ mới → Địa chỉ cũ (+ Nominatim geocode cho phần còn thiếu).
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
    join(__dirname, 'geocode-unmapped-summary.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: unmapped.length,
        mapped,
        failed,
        overrideCount: Object.keys(overrides).length,
      },
      null,
      2,
    ),
  );

  console.log(JSON.stringify({ mapped, failed, overrideCount: Object.keys(overrides).length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
