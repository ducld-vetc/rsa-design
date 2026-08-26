/**
 * Làm sạch stations_chua_gan_huyen.xlsx + map address_new → area V1 + ghi STATION_ADMIN_OVERRIDES.
 *
 * Rules:
 * - Bỏ lat/lng nguyên (placeholder)
 * - Bỏ dòng không có address_new
 * - Parse Xã/Phường + Quận/Huyện/TP từ address_new
 * - Gán huyện trước; xã chỉ khi thuộc đúng huyện đó (không “mượn” xã huyện khác)
 */
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const XLSX_PATH = resolve(ROOT, '../rsa-docs/docs/rescue_station/stations_chua_gan_huyen.xlsx');
const OVERRIDES_PATH = resolve(ROOT, 'pages/station-coverage/stationAdminOverrides.ts');
const AREA_PATH = resolve(ROOT, 'pages/station-coverage/areaNameLookup.ts');
const JSON_OUT = resolve(__dirname, 'stations_chua_gan_huyen.json');

const AREA = Function(
  `return (${readFileSync(AREA_PATH, 'utf8').match(/=\s*(\{[\s\S]*\});?\s*$/)[1]})`,
)();

function normalizeKey(v) {
  return String(v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function strip(n) {
  return String(n || '')
    .replace(/^(?:đặc khu|thị trấn|thị xã|thành phố|tp\.?|quận|huyện|phường|xã)\s+/i, '')
    .replace(/^(?:t\.?\s*trấn|tt\.?)\s+/i, '')
    .replace(/^(?:tx|t\/x)\.?\s*/i, '')
    .replace(/^(?:q|h|p|x)\.\s*/i, '')
    .replace(/^(?:q|h|p|x)\s*(?=\d)/i, '')
    .trim();
}

function isIntCoord(n) {
  return (
    n !== '' &&
    n != null &&
    Number.isFinite(Number(n)) &&
    Math.abs(Number(n) - Math.round(Number(n))) < 1e-9
  );
}

const PROV_ALIASES = [];
for (const [k, name] of Object.entries(AREA)) {
  if (!(k.startsWith('BOTH|') || k.startsWith('V1|'))) continue;
  const [, code, d, p] = k.split('|');
  if (d || p) continue;
  PROV_ALIASES.push({ code, key: normalizeKey(name), core: normalizeKey(strip(name)) });
}
for (const [code, ...als] of [
  ['HCM', 'ho chi minh', 'tp hcm', 'tphcm', 'sai gon'],
  ['HNO', 'ha noi', 'thanh pho ha noi'],
  ['DNA', 'da nang'],
  ['CTH', 'can tho'],
  ['TTH', 'thua thien hue', 'hue'],
  ['HDU', 'hai duong'],
  ['HPH', 'hai phong'],
  ['TGI', 'tien giang'],
  ['BTH', 'binh thuan'],
  ['LDO', 'lam dong'],
]) {
  for (const a of als) PROV_ALIASES.push({ code, key: a, core: a });
}

const districts = [];
const precincts = [];
for (const [k, name] of Object.entries(AREA)) {
  if (!k.startsWith('V1|')) continue;
  const [, prov, dist, prec] = k.split('|');
  if (!prov || !dist) continue;
  const core = normalizeKey(strip(name));
  const keys = new Set([normalizeKey(name), core]);
  const num = name.match(/(?:quận|q\.?)\s*(\d+)/i)?.[1] ?? (/^\d+$/.test(core) ? core : null);
  if (num) {
    keys.add('quan ' + num);
    keys.add(String(Number(num)));
    keys.add(num.padStart(2, '0'));
  }
  const code = prec || dist;
  const row = {
    province: prov,
    district: dist,
    precinct: prec || null,
    name,
    keys: [...keys],
    core,
    coreLen: core.length,
    codeLen: code.length,
  };
  if (!prec) districts.push(row);
  else precincts.push(row);
}

function resolveProvince(addrKey) {
  let best = null;
  for (const p of PROV_ALIASES) {
    const score = Math.max(p.key?.length || 0, p.core?.length || 0);
    if (score < 4) continue;
    if ((p.key && addrKey.includes(p.key)) || (p.core && addrKey.includes(p.core))) {
      if (!best || score > best.score) best = { code: p.code, score };
    }
  }
  return best?.code || null;
}

function extractParts(addressNew) {
  const text = String(addressNew || '');
  const precinctNames = [];
  const districtsFound = [];
  let m;
  const pre = /(?:^|[,;]\s*)(?:phường|xã|thị trấn)\s+([^,;/]+)/gi;
  while ((m = pre.exec(text))) precinctNames.push(strip(m[1].replace(/\)+$/g, '').trim()));
  const di = /(?:^|[,;]\s*)(quận|huyện|thị xã|thành phố|tp\.?)\s+([^,;/]+)/gi;
  while ((m = di.exec(text))) {
    districtsFound.push({
      type: normalizeKey(m[1]),
      name: strip(m[2].replace(/\)+$/g, '').trim()),
    });
  }
  return { precinctNames, districtsFound };
}

function typeBoost(type, itemName) {
  const n = normalizeKey(itemName);
  if (type === 'thi xa' || type === 'tx') {
    if (/^(thi xa|tx)\b/.test(n) || /^t\/x\b/.test(normalizeKey(itemName))) return 50;
    if (/^huyen\b|^h\b/.test(n)) return -40;
  }
  if (type === 'huyen') {
    if (/^huyen\b|^h\b/.test(n)) return 50;
    if (/^(thi xa|tx)\b/.test(n)) return -40;
  }
  if (type === 'thanh pho' || type === 'tp') {
    if (/^thanh pho\b|^tp\b/.test(n) || !/^(huyen|quan|thi xa)\b/.test(n)) return 30;
  }
  if (type === 'quan') {
    if (/^quan\b|^q\b/.test(n)) return 50;
  }
  return 0;
}

function matchDistrict(districtsFound, province) {
  const cands = [];
  for (const { type, name: raw } of districtsFound) {
    const core = normalizeKey(raw);
    if (!core) continue;
    const asNum = core.match(/^(?:quan\s*)?(\d+)$/)?.[1];
    for (const item of districts) {
      if (item.province !== province) continue;
      let score = 0;
      if (item.core === core || item.keys.includes(core)) score = 1000 + item.coreLen;
      else if (asNum && (item.keys.includes(asNum) || item.keys.includes(String(Number(asNum))) || item.core === asNum)) {
        score = 900 + item.coreLen;
      } else if (item.core.length >= 4 && (core.includes(item.core) || item.core.includes(core))) {
        score = 100 + item.coreLen;
      } else continue;
      score += typeBoost(type, item.name);
      score -= item.codeLen > 5 ? item.codeLen : 0;
      cands.push({ item, score });
    }
  }
  cands.sort((a, b) => b.score - a.score || a.item.codeLen - b.item.codeLen);
  return cands[0]?.item || null;
}

function padNumKeys(core) {
  const n = core.match(/^0*(\d+)$/)?.[1];
  if (!n) return [core];
  return [core, n, n.padStart(2, '0'), n.padStart(4, '0'), 'phuong ' + n, 'phuong ' + n.padStart(2, '0')];
}

function matchPrecinct(names, province, districtCode) {
  if (!districtCode) return null;
  const cands = [];
  for (const raw of names) {
    const core = normalizeKey(raw);
    if (!core) continue;
    const variants = padNumKeys(core);
    for (const item of precincts) {
      if (item.province !== province || item.district !== districtCode) continue;
      let score = 0;
      if (item.core === core || item.keys.includes(core) || variants.some((v) => item.core === v || item.keys.includes(v))) {
        score = 1000 + item.coreLen;
      } else if (item.core.length >= 4 && (core.includes(item.core) || item.core.includes(core))) {
        score = 100 + item.coreLen;
      } else continue;
      cands.push({ item, score: score - (item.codeLen > 5 ? item.codeLen : 0) });
    }
  }
  cands.sort((a, b) => b.score - a.score || a.item.codeLen - b.item.codeLen);
  return cands[0]?.item || null;
}

function mapAddressNew(addressNew) {
  const raw = String(addressNew || '').trim();
  if (!raw) return { error: 'NO_ADDRESS_NEW' };
  const addrKey = normalizeKey(raw);
  const province = resolveProvince(addrKey);
  if (!province) return { error: 'NO_PROVINCE', addressNew: raw };
  const { precinctNames, districtsFound } = extractParts(raw);
  const district = matchDistrict(districtsFound, province);
  if (!district) {
    return { error: 'NO_DISTRICT', provinceCode: province, addressNew: raw, districtsFound };
  }
  const precinct = matchPrecinct(precinctNames, province, district.district);
  return {
    provinceCode: province,
    districtCode: district.district,
    ...(precinct ? { precinctCode: precinct.precinct } : {}),
    provinceName: AREA[`V1|${province}||`] || AREA[`BOTH|${province}||`] || province,
    districtName: district.name,
    precinctName: precinct?.name || '',
    addressNew: raw,
  };
}

function loadRows() {
  const wb = XLSX.read(readFileSync(XLSX_PATH), { type: 'buffer' });
  const sheets = wb.SheetNames.flatMap((n) => XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '' }));
  // Nếu file đã lọc sẵn, dùng luôn; nếu còn bản cũ thì filter
  return sheets;
}

function loadOverrides() {
  const src = readFileSync(OVERRIDES_PATH, 'utf8');
  const i = src.indexOf('{', src.indexOf('STATION_ADMIN_OVERRIDES'));
  return JSON.parse(src.slice(i).trim().replace(/;\s*$/, ''));
}

const rows = loadRows();
const overrides = loadOverrides();
const mapped = [];
const dropped = [];
const failed = [];

for (const r of rows) {
  if (isIntCoord(r.latitude) && isIntCoord(r.longitude)) {
    dropped.push({ id: r.rescue_station_id, reason: 'INT_LATLNG' });
    continue;
  }
  const addressNew = String(r.address_new || '').trim();
  if (!addressNew) {
    dropped.push({ id: r.rescue_station_id, reason: 'NO_ADDRESS_NEW' });
    continue;
  }
  // tránh trùng khi đọc nhiều sheet
  if (mapped.some((m) => String(m.rescue_station_id) === String(r.rescue_station_id))) continue;

  const m = mapAddressNew(addressNew);
  if (!m.districtCode) {
    failed.push({ ...r, address_new: addressNew, map_error: m.error });
    continue;
  }
  overrides[String(r.rescue_station_id)] = {
    provinceCode: m.provinceCode,
    districtCode: m.districtCode,
    ...(m.precinctCode ? { precinctCode: m.precinctCode } : {}),
  };
  mapped.push({
    rescue_station_id: r.rescue_station_id,
    rescue_station_code: r.rescue_station_code,
    station_name: r.station_name,
    address: r.address,
    address_new: addressNew,
    latitude: r.latitude,
    longitude: r.longitude,
    province_code: m.provinceCode,
    province_name: m.provinceName,
    district_code: m.districtCode,
    district_name: m.districtName,
    precinct_code: m.precinctCode || '',
    precinct_name: m.precinctName || '',
    partner_code: r.partner_code,
    partner_name: r.partner_name,
    partner_type: r.partner_type,
  });
}

writeFileSync(
  OVERRIDES_PATH,
  `/**
 * Override Địa chỉ cũ (reverse-map + address_new cho Chưa gán huyện).
 * key = String(rescue_station_id)
 */
export interface StationAdminOverride {
  provinceCode?: string;
  districtCode: string;
  precinctCode?: string;
}

export const STATION_ADMIN_OVERRIDES: Record<string, StationAdminOverride> = ${JSON.stringify(overrides, null, 2)};
`,
);

const outWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(outWb, XLSX.utils.json_to_sheet(mapped), 'ChuaGanHuyen');
if (failed.length) {
  XLSX.utils.book_append_sheet(outWb, XLSX.utils.json_to_sheet(failed), 'MapLoi');
}
XLSX.writeFile(outWb, XLSX_PATH);
writeFileSync(JSON_OUT, JSON.stringify(mapped, null, 2));

console.log(
  JSON.stringify(
    {
      mapped: mapped.length,
      failed: failed.length,
      dropped: dropped.length,
      failedRows: failed.map((f) => ({ code: f.rescue_station_code, err: f.map_error, an: f.address_new })),
      areas: mapped.map(
        (r) =>
          `${r.rescue_station_code}: ${r.province_name} > ${r.district_name} > ${r.precinct_name || '—'} [${r.province_code}/${r.district_code}/${r.precinct_code || ''}]`,
      ),
    },
    null,
    2,
  ),
);
