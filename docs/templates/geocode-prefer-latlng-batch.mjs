/**
 * Nominatim reverse cho trạm: plottable VN + (thiếu huyện / huyện GSO / xã GSO)
 * và chưa có trong geocode-unmapped-results.json.
 * Rate limit 1 req/s.
 *
 * Chạy: node docs/templates/geocode-prefer-latlng-batch.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');
const UA = 'RSA-StationCoverage/1.0 (internal ops reverse-geocode; contact: rsa-docs)';

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
    'suburb', 'neighbourhood', 'quarter', 'city_district', 'borough', 'municipality',
    'city', 'town', 'village', 'hamlet', 'county', 'state', 'province', 'district',
  ];
  const out = [];
  for (const k of keys) {
    if (addr[k]) out.push(`${k}=${addr[k]}`);
  }
  return out;
}

async function main() {
  const existingPath = join(__dirname, 'geocode-unmapped-results.json');
  const existing = JSON.parse(readFileSync(existingPath, 'utf8'));
  const have = new Set(existing.map((r) => String(r.id)));
  const stations = loadStations();

  const todo = stations.filter((s) => {
    if (have.has(String(s.id))) return false;
    if (!isPlottableVn(s.latitude, s.longitude)) return false;
    const d = (s.districtCode || '').trim();
    const p = (s.precinctCode || '').trim();
    return !d || /^\d{1,2}$/.test(d) || /^\d{5}$/.test(p);
  });

  console.log(`Todo geocode: ${todo.length} (existing ${existing.length})`);
  const results = [...existing];

  for (let i = 0; i < todo.length; i += 1) {
    const s = todo[i];
    process.stdout.write(`[${i + 1}/${todo.length}] ${s.code} ... `);
    try {
      const geo = await reverseNominatim(s.latitude, s.longitude);
      results.push({
        id: s.id,
        code: s.code,
        address: s.address,
        display_name: geo.display_name,
        tokens: tokensFromNominatim(geo.address || {}),
        country_code: geo.address?.country_code || null,
        preferredProvince: s.provinceCode,
      });
      console.log((geo.address?.country_code || '?') + ' · ' + String(geo.display_name || '').slice(0, 60));
    } catch (e) {
      results.push({ id: s.id, code: s.code, error: String(e.message || e) });
      console.log('ERR', e.message || e);
    }
    await sleep(1100);
    if ((i + 1) % 50 === 0) {
      writeFileSync(existingPath, JSON.stringify(results, null, 2));
      console.log(`… checkpoint saved (${results.length})`);
    }
  }

  writeFileSync(existingPath, JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ totalGeoResults: results.length, newly: todo.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
