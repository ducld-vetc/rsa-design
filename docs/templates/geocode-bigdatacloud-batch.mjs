/**
 * Reverse geocode (BigDataCloud) cho trạm plottable VN + mã huyện/xã kiểu V2,
 * ưu tiên lat/lng khi khớp master. Bỏ ngoài VN / không có master.
 *
 * Chạy: node docs/templates/geocode-bigdatacloud-batch.mjs
 * Sau đó: node docs/templates/merge-overrides-prefer-latlng.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');
const outPath = join(__dirname, 'geocode-unmapped-results.json');

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

async function reverseBdc(lat, lon) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('localityLanguage', 'vi');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BDC ${res.status}`);
  return res.json();
}

function tokensFromBdc(geo) {
  const tokens = [];
  const push = (field, raw) => {
    if (raw) tokens.push(`${field}=${raw}`);
  };
  push('locality', geo.locality);
  push('city', geo.city);
  push('province', geo.principalSubdivision);
  push('country', geo.countryName);
  const admins = geo.localityInfo?.administrative || [];
  for (const a of admins) {
    if (a.adminLevel >= 5 && a.adminLevel <= 8) push(`admin${a.adminLevel}`, a.name);
    else if (a.name && a.adminLevel > 3) push('admin', a.name);
  }
  return tokens;
}

async function main() {
  // Keep successful Nominatim rows; drop fetch-failed stubs
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(outPath, 'utf8')).filter((r) => r.display_name && !r.error);
  } catch {
    existing = [];
  }
  const have = new Set(existing.map((r) => String(r.id)));
  const stations = loadStations();

  const todo = stations.filter((s) => {
    if (have.has(String(s.id))) return false;
    if (!isPlottableVn(s.latitude, s.longitude)) return false;
    const d = (s.districtCode || '').trim();
    const p = (s.precinctCode || '').trim();
    return !d || /^\d{1,2}$/.test(d) || /^\d{5}$/.test(p);
  });

  console.log(`Have OK: ${existing.length}; todo BDC: ${todo.length}`);
  const results = [...existing];

  for (let i = 0; i < todo.length; i += 1) {
    const s = todo[i];
    process.stdout.write(`[${i + 1}/${todo.length}] ${s.code} ... `);
    try {
      const geo = await reverseBdc(s.latitude, s.longitude);
      const cc = (geo.countryCode || '').toLowerCase();
      results.push({
        id: s.id,
        code: s.code,
        address: s.address,
        display_name: [geo.locality, geo.city, geo.principalSubdivision, geo.countryName]
          .filter(Boolean)
          .join(', '),
        tokens: tokensFromBdc(geo),
        country_code: cc,
        preferredProvince: s.provinceCode,
        provider: 'bigdatacloud',
      });
      console.log(`${cc || '?'} · ${geo.locality || '-'} / ${geo.city || '-'}`);
    } catch (e) {
      results.push({ id: s.id, code: s.code, error: String(e.message || e), provider: 'bigdatacloud' });
      console.log('ERR', e.message || e);
      await sleep(2000);
    }
    await sleep(200);
    if ((i + 1) % 100 === 0) {
      writeFileSync(outPath, JSON.stringify(results, null, 2));
      console.log(`checkpoint ${results.length}`);
    }
  }

  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify(
      {
        total: results.length,
        ok: results.filter((r) => r.display_name && !r.error).length,
        err: results.filter((r) => r.error).length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
