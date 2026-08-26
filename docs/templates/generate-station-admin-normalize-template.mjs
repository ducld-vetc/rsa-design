/**
 * Sinh Excel chuẩn hóa quận/huyện/xã cho rescue_station (báo cáo độ phủ).
 * Pattern giống fee-table / import nhân viên: HuongDan + dữ liệu + danh mục.
 *
 * Chạy:
 *   node docs/templates/generate-station-admin-normalize-template.mjs
 *
 * Output:
 *   docs/templates/station-admin-normalize-template.xlsx
 *   public/templates/mau_chuan_hoa_quan_huyen_tram.xlsx
 *   ../rsa-docs/docs/rescue_station/mau_chuan_hoa_quan_huyen_tram.xlsx
 */
import * as XLSX from 'xlsx';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');

// Đọc snapshot + lookup dưới dạng text (tránh TS import).
function loadAreaLookup() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/areaNameLookup.ts'), 'utf8');
  const json = src.match(/=\s*(\{[\s\S]*\});?\s*$/)?.[1];
  if (!json) throw new Error('Không parse được AREA_NAME_LOOKUP');
  return Function(`"use strict"; return (${json});`)();
}

function loadStations() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationCoverageFromDb.ts'), 'utf8');
  const assign = src.indexOf('export const DB_STATIONS');
  const start = src.indexOf('[', assign);
  const castAt = src.indexOf('] as DbStationRow', start);
  const end = castAt >= 0 ? castAt : src.lastIndexOf(']');
  if (start < 0 || end < 0) throw new Error('Không tìm thấy mảng DB_STATIONS');
  return Function(`"use strict"; return (${src.slice(start, end + 1)});`)();
}

function loadOldProvinces() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationCoverageProvinces.ts'), 'utf8');
  const m = src.match(/export const AREA_PROVINCES[^=]*=\s*(\[[\s\S]*?\n\]);/);
  if (!m) throw new Error('Không parse được AREA_PROVINCES');
  const all = Function(`"use strict"; return (${m[1]});`)();
  const skip = new Set(['HTA', 'NHA', 'QK']);
  return all.filter((p) => !skip.has(p.code));
}

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
    .replace(/^(Quận|Huyện|Thị xã|Thị trấn|Phường|Xã|Q\.|H\.|TX\.|T\/X|P\.|X\.)\s*/i, '')
    .trim();
}

function buildAliasKeys(name) {
  const core = stripAdminPrefix(name);
  const keys = [
    ...new Set([
      normalizeKey(name),
      normalizeKey(core),
      normalizeKey(`quan ${core}`),
      normalizeKey(`huyen ${core}`),
      normalizeKey(`thi xa ${core}`),
      normalizeKey(`phuong ${core}`),
      normalizeKey(`xa ${core}`),
    ]),
  ].filter((k) => k.length >= 3);
  return { keys, coreLen: normalizeKey(core).length };
}

function isV2DummyDistrict(code) {
  return !!code && /^\d{1,2}$/.test(String(code).trim());
}

function isV2GsoPrecinct(code) {
  return !!code && /^\d{5}$/.test(String(code).trim());
}

function buildV1Index(AREA) {
  const map = new Map();
  const v2Precinct = new Map();
  for (const [key, name] of Object.entries(AREA)) {
    const [schema, province, district, precinct] = key.split('|');
    if (schema === 'V2' && province && district && precinct) {
      const id = `${province}|${precinct}`;
      const existing = v2Precinct.get(id);
      if (!existing || /^\d{2}$/.test(district)) v2Precinct.set(id, name);
    }
    if (schema !== 'V1' || !province || !district) continue;
    let bucket = map.get(province);
    if (!bucket) {
      bucket = { districts: [], precincts: [] };
      map.set(province, bucket);
    }
    const { keys, coreLen } = buildAliasKeys(name);
    if (!precinct) {
      bucket.districts.push({ code: district, districtCode: district, name, keys, coreLen });
    } else {
      bucket.precincts.push({ code: precinct, districtCode: district, name, keys, coreLen });
    }
  }
  for (const bucket of map.values()) {
    bucket.districts.sort((a, b) => b.coreLen - a.coreLen);
    bucket.precincts.sort((a, b) => b.coreLen - a.coreLen);
  }
  return { map, v2Precinct };
}

function matchAliasInText(textKey, aliases) {
  for (const item of aliases) {
    if (item.keys.some((k) => k.length >= 4 && textKey.includes(k))) return item;
  }
  return null;
}

function matchAliasByCoreName(coreKey, aliases) {
  if (coreKey.length < 4) return null;
  for (const item of aliases) {
    const core = normalizeKey(stripAdminPrefix(item.name));
    if (core.length < 4) continue;
    if (coreKey === core || coreKey.includes(core) || core.includes(coreKey)) return item;
  }
  return null;
}

function suggestV1(AREA_INDEX, provinceCode, address, districtCode, precinctCode) {
  const index = AREA_INDEX.map.get(provinceCode);
  if (!index) return { districtCode: null, districtName: null, precinctCode: null, precinctName: null };

  const needs =
    isV2DummyDistrict(districtCode) ||
    isV2GsoPrecinct(precinctCode) ||
    !districtCode;

  // Đã có mã huyện chữ V1 hợp lệ → giữ, chỉ gợi ý xã nếu thiếu
  if (districtCode && !isV2DummyDistrict(districtCode) && !isV2GsoPrecinct(precinctCode)) {
    const dName =
      AREA_INDEX.map.get(provinceCode)?.districts.find((d) => d.code === districtCode)?.name ?? null;
    const pName = precinctCode
      ? AREA_INDEX.map.get(provinceCode)?.precincts.find(
          (p) => p.code === precinctCode && p.districtCode === districtCode,
        )?.name ?? null
      : null;
    return {
      districtCode,
      districtName: dName,
      precinctCode: precinctCode || null,
      precinctName: pName,
      auto: false,
    };
  }

  if (!needs && districtCode && !isV2DummyDistrict(districtCode)) {
    return { districtCode, districtName: null, precinctCode, precinctName: null, auto: false };
  }

  const addrKey = normalizeKey(address);
  let dist = matchAliasInText(addrKey, index.districts);
  let prec = matchAliasInText(addrKey, index.precincts);
  if (!dist && prec) dist = index.districts.find((d) => d.code === prec.districtCode) ?? null;

  if ((!dist || !prec) && precinctCode && isV2GsoPrecinct(precinctCode)) {
    const v2Name = AREA_INDEX.v2Precinct.get(`${provinceCode}|${precinctCode}`);
    if (v2Name) {
      const coreKey = normalizeKey(stripAdminPrefix(v2Name));
      if (!dist) dist = matchAliasByCoreName(coreKey, index.districts);
      if (!prec) {
        prec = matchAliasByCoreName(coreKey, index.precincts);
        if (prec && !dist) dist = index.districts.find((d) => d.code === prec.districtCode) ?? null;
      }
    }
  }

  return {
    districtCode: dist?.code ?? null,
    districtName: dist?.name ?? null,
    precinctCode: prec?.code ?? null,
    precinctName: prec?.name ?? null,
    auto: true,
  };
}

function flagOf(districtCode, precinctCode) {
  if (!districtCode) return 'THIEU_HUYEN';
  if (isV2DummyDistrict(districtCode)) return 'HUYEN_GIA_V2';
  if (precinctCode && isV2GsoPrecinct(precinctCode)) return 'XA_GSO_MIX';
  return 'OK';
}

function loadOverrides() {
  try {
    const src = readFileSync(
      join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts'),
      'utf8',
    );
    const marker = 'export const STATION_ADMIN_OVERRIDES';
    const i = src.indexOf('{', src.indexOf(marker));
    if (i < 0) return {};
    let json = src.slice(i).trim();
    if (json.endsWith(';')) json = json.slice(0, -1);
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function districtNameOf(province, districtCode) {
  if (!province || !districtCode) return '';
  return AREA[`V1|${province}|${districtCode}|`] || '';
}

function precinctNameOf(province, districtCode, precinctCode) {
  if (!province || !districtCode || !precinctCode) return '';
  return AREA[`V1|${province}|${districtCode}|${precinctCode}`] || '';
}

const AREA = loadAreaLookup();
const AREA_INDEX = buildV1Index(AREA);
const stations = loadStations();
const oldProvinces = loadOldProvinces();
const overrides = loadOverrides();

const guideRows = [
  ['Muc', 'NoiDung'],
  ['MucDich', 'Chuẩn hóa province / district / precinct của rescue_station để báo cáo Độ phủ hiển thị đúng theo Quận–Huyện (Địa chỉ cũ) và Phường–Xã (Địa chỉ mới).'],
  ['CachLam', '1) Điền sheet Tram cột *_CHUAN. 2) Tra mã ở DM_Tinh / DM_Huyen_V1 / DM_Xa_V1. 3) Gửi file lại BA/Dev để import snapshot UI + cập nhật DB.'],
  ['CotBatBuoc', 'rescue_station_id, province_code_CHUAN, district_code_CHUAN (Địa chỉ cũ). precinct_code_CHUAN khuyến nghị.'],
  ['KhongSua', 'Không đổi rescue_station_code / station_name trừ khi Ops yêu cầu riêng.'],
  ['GoiY', 'Cột *_GOIY do hệ thống suy từ address + master area — Ops phải xác nhận hoặc sửa.'],
  ['VanDe', 'OK = mã huyện chữ V1 ổn · HUYEN_GIA_V2 = district số (Không Quận Huyện) · THIEU_HUYEN = thiếu huyện · XA_GSO_MIX = huyện V1 nhưng xã mã GSO 5 số'],
  ['CanDuyet', 'Lọc can_duyet = CAN_DUYET để làm các dòng còn thiếu huyện chuẩn. Dòng đã apply preview / OK đã XAC_NHAN.'],
  ['TrangThaiDong', 'Để trống = chưa duyệt · XAC_NHAN = dùng giá trị CHUAN · BO_QUA = giữ nguyên AS-IS'],
  [],
  ['Cot Tram', 'Y Nghia'],
  ['rescue_station_id', 'PK — khóa import'],
  ['rescue_station_code', 'Mã trạm (không đổi)'],
  ['station_name', 'Tên trạm'],
  ['address', 'Địa chỉ text hiện có'],
  ['province_code_ASIS / district_code_ASIS / precinct_code_ASIS', 'Mã đang lưu trên DB'],
  ['van_de', 'Nhãn chất lượng dữ liệu'],
  ['can_duyet', 'CAN_DUYET = còn cần Ops gán huyện · trống = đã có huyện chuẩn / đã apply preview'],
  ['province_code_GOIY / district_code_GOIY / …', 'Gợi ý tự động'],
  ['province_code_CHUAN / district_code_CHUAN / precinct_code_CHUAN', 'Ops điền / xác nhận — nguồn sự thật import'],
  ['district_name_CHUAN / precinct_name_CHUAN', 'Tên tiếng Việt (tuỳ chọn) nếu chưa nhớ mã'],
  ['trang_thai', 'XAC_NHAN | BO_QUA | trống'],
  ['ghi_chu', 'Ghi chú Ops'],
];

const tramHeaders = [
  'rescue_station_id',
  'rescue_station_code',
  'station_name',
  'address',
  'latitude',
  'longitude',
  'partner_code',
  'partner_name',
  'partner_type',
  'province_code_ASIS',
  'district_code_ASIS',
  'precinct_code_ASIS',
  'van_de',
  'can_duyet',
  'province_code_GOIY',
  'district_code_GOIY',
  'district_name_GOIY',
  'precinct_code_GOIY',
  'precinct_name_GOIY',
  'province_code_CHUAN',
  'district_code_CHUAN',
  'district_name_CHUAN',
  'precinct_code_CHUAN',
  'precinct_name_CHUAN',
  'trang_thai',
  'ghi_chu',
];

const tramRows = [tramHeaders];

for (const s of stations) {
  const province = (s.provinceCode || '').trim() || null;
  const district = (s.districtCode || '').trim() || null;
  const precinct = (s.precinctCode || '').trim() || null;
  const flag = flagOf(district, precinct);
  const suggest = suggestV1(AREA_INDEX, province || '', s.address || '', district, precinct);
  const ov = overrides[String(s.id)];

  const districtChuan = ov?.districtCode || suggest.districtCode || '';
  const precinctChuan = ov?.precinctCode || suggest.precinctCode || '';
  const provinceChuan = province || '';
  const applied = Boolean(ov?.districtCode);
  const confirmed = flag === 'OK' || applied;
  const canDuyet =
    !confirmed || !districtChuan
      ? 'CAN_DUYET'
      : '';

  tramRows.push([
    s.id,
    s.code,
    s.name,
    s.address,
    s.latitude,
    s.longitude,
    s.partnerCode,
    s.partnerName,
    s.partnerType,
    province,
    district,
    precinct,
    flag,
    canDuyet,
    province,
    suggest.districtCode,
    suggest.districtName,
    suggest.precinctCode,
    suggest.precinctName,
    provinceChuan,
    districtChuan,
    districtNameOf(provinceChuan, districtChuan) || suggest.districtName || '',
    precinctChuan,
    precinctNameOf(provinceChuan, districtChuan, precinctChuan) || suggest.precinctName || '',
    confirmed && districtChuan ? 'XAC_NHAN' : '',
    applied ? 'Da apply preview tu de xuat cap 2' : '',
  ]);
}

const dmTinh = [['province_code', 'province_name', 'schema_note']];
for (const p of oldProvinces) {
  dmTinh.push([p.code, p.name, 'Địa chỉ cũ (63 tỉnh)']);
}

const dmHuyen = [['province_code', 'district_code', 'district_name']];
const dmXa = [['province_code', 'district_code', 'precinct_code', 'precinct_name']];
for (const [key, name] of Object.entries(AREA)) {
  if (!key.startsWith('V1|')) continue;
  const [, province, district, precinct] = key.split('|');
  if (!province || !district) continue;
  if (!precinct) dmHuyen.push([province, district, name]);
  else dmXa.push([province, district, precinct, name]);
}
dmHuyen.sort((a, b) => String(a[0]).localeCompare(String(b[0])) || String(a[1]).localeCompare(String(b[1])));
dmXa.sort(
  (a, b) =>
    String(a[0]).localeCompare(String(b[0])) ||
    String(a[1]).localeCompare(String(b[1])) ||
    String(a[2]).localeCompare(String(b[2])),
);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(guideRows), 'HuongDan');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tramRows), 'Tram');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dmTinh), 'DM_Tinh');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dmHuyen), 'DM_Huyen_V1');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dmXa), 'DM_Xa_V1');

const outPrimary = join(__dirname, 'station-admin-normalize-template.xlsx');
XLSX.writeFile(wb, outPrimary);

const publicDir = join(designRoot, 'public/templates');
mkdirSync(publicDir, { recursive: true });
const outPublic = join(publicDir, 'mau_chuan_hoa_quan_huyen_tram.xlsx');
copyFileSync(outPrimary, outPublic);

const docsDir = join(designRoot, '../rsa-docs/docs/rescue_station');
mkdirSync(docsDir, { recursive: true });
const outDocs = join(docsDir, 'mau_chuan_hoa_quan_huyen_tram.xlsx');
copyFileSync(outPrimary, outDocs);

const summary = {
  generatedAt: new Date().toISOString(),
  stationCount: stations.length,
  overridesApplied: Object.keys(overrides).length,
  flags: tramRows.slice(1).reduce((acc, row) => {
    const f = row[12];
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {}),
  canDuyet: tramRows.slice(1).filter((r) => r[13] === 'CAN_DUYET').length,
  xacNhan: tramRows.slice(1).filter((r) => r[24] === 'XAC_NHAN').length,
  suggestedDistrictFilled: tramRows.slice(1).filter((r) => r[20]).length,
  outputs: [outPrimary, outPublic, outDocs],
};
writeFileSync(join(__dirname, 'station-admin-normalize-template.summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
