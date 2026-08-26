/**
 * Reverse-map địa chỉ mới (V2) → địa chỉ cũ (V1):
 * - NQ 1654/NQ-UBTVQH15 (An Giang mới ← An Giang + Kiên Giang cũ)
 * - Heuristic tên xã V2 → xã V1 trong các tỉnh nguồn (V1_TO_BOTH reverse)
 * - Phường không xác định: random ổn định theo rescue_station_id
 *
 * Chạy: node docs/templates/build-station-admin-overrides-reverse-map.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');
const nqPath = join(
  designRoot,
  '../rsa-docs/docs/master_data/ref/nq-1654-UBTVQH15-an-giang.txt',
);

const V1_TO_BOTH = {
  '01': 'HNO', BDI: 'GLA', BDU: 'HCM', BGI: 'BNI', BKA: 'TNG', BLI: 'CMA', BPH: 'DNI',
  BRV: 'HCM', BTH: 'LDO', BTR: 'VLO', DNO: 'LDO', HBI: 'PTH', HDU: 'HPH', HGA: 'TQU',
  HGI: 'CTH', HNA: 'NBI', HNO1: 'HNO', HTA: 'HNO', KGI: 'AGI', KON: 'QNG', LAN: 'TNI',
  NDI: 'NBI', NHA: 'NBI', NTH: 'KHO', PYE: 'DLA', QBI: 'QTR', QK: 'CTH', QNA: 'DNA',
  STR: 'CTH', TBI: 'HYE', TGI: 'DTH', TVI: 'VLO', VPH: 'PTH', YBA: 'LCA',
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
    .replace(
      /^(?:đặc khu|thị trấn|thị xã|thành phố|quận|huyện|phường|xã)\s+/i,
      '',
    )
    .replace(/^(?:q|h|tx|t\/x|p|x)\.?\s*/i, '')
    .trim();
}

function seededPick(items, seed) {
  if (!items.length) return null;
  let h = 2166136261;
  for (let i = 0; i < String(seed).length; i += 1) {
    h ^= String(seed).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return items[Math.abs(h) % items.length];
}

function loadAreaLookup() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/areaNameLookup.ts'), 'utf8');
  const json = src.match(/=\s*(\{[\s\S]*\});?\s*$/)?.[1];
  if (!json) throw new Error('AREA_NAME_LOOKUP');
  return Function(`"use strict"; return (${json});`)();
}

function loadStations() {
  const src = readFileSync(join(designRoot, 'pages/station-coverage/stationCoverageFromDb.ts'), 'utf8');
  const start = src.indexOf('[', src.indexOf('export const DB_STATIONS'));
  const end = src.indexOf('] as DbStationRow', start);
  return Function(`"use strict"; return (${src.slice(start, end + 1)});`)();
}

function isV2DummyDistrict(code) {
  return !!code && /^\d{1,2}$/.test(String(code).trim());
}
function isV2GsoPrecinct(code) {
  return !!code && /^\d{5}$/.test(String(code).trim());
}

/** BOTH province → [V1-only provinces that merged into it] + itself if BOTH kept */
function buildReverseProvinces() {
  const map = new Map();
  for (const [v1, both] of Object.entries(V1_TO_BOTH)) {
    if (/^\d+$/.test(v1) || ['HNO1', 'HTA', 'NHA', 'QK'].includes(v1)) continue;
    if (!map.has(both)) map.set(both, new Set([both]));
    map.get(both).add(v1);
  }
  // BOTH provinces with no V1-only children still include themselves
  return map;
}

function buildV1Indexes(AREA) {
  /** coreName → [{province, district, precinct, name, districtName}] */
  const byPrecinctCore = new Map();
  /** province|districtCore → {province, district, name} */
  const districts = [];
  const v2ByPrecinct = new Map();

  for (const [key, name] of Object.entries(AREA)) {
    const [schema, province, district, precinct] = key.split('|');
    if (!province || !district) continue;
    if (schema === 'V2' && precinct) {
      const id = `${province}|${precinct}`;
      if (!v2ByPrecinct.has(id) || /^\d{2}$/.test(district)) v2ByPrecinct.set(id, name);
    }
    if (schema !== 'V1') continue;
    const core = normalizeKey(stripAdminPrefix(name));
    if (!precinct) {
      districts.push({ province, district, name, core });
      continue;
    }
    const list = byPrecinctCore.get(core) ?? [];
    list.push({
      province,
      district,
      precinct,
      name,
      core,
    });
    byPrecinctCore.set(core, list);
  }
  return { byPrecinctCore, districts, v2ByPrecinct };
}

/** Parse NQ 1654: new ward core → old ward core names[] */
function parseNq1654(text) {
  const map = new Map();
  const blocks = text.split(/\n(?=\d+\.\s*S)/);

  for (const block of blocks) {
    const head = block.match(/^(\d+)\.\s*Sắp\s+xếp([\s\S]+)$/i) ||
      block.match(/^(\d+)\.\s*Sắp\s+xếp([\s\S]+)$/i);
    if (!head) continue;
    const bodyAll = head[2];

    const newMatch =
      bodyAll.match(
        /thành\s+(?:phường|xã|đặc khu)\s+mới có tên gọi là\s+(?:phường|xã|đặc khu)\s+([^.]+)/i,
      ) ||
      bodyAll.match(
        /th[aà]̀nh\s+đặc khu[\s\S]*?là\s+(?:đặc khu|đặc khu)\s+([^.]+)/i,
      ) ||
      bodyAll.match(
        /thành\s+đặc khu[\s\S]*?là\s+đặc khu\s+([^.]+)/i,
      );
    if (!newMatch) continue;
    const newCore = normalizeKey(stripAdminPrefix(newMatch[1].replace(/\s+/g, ' ').trim()));
    if (!newCore || newCore.length < 3) continue;

    const before = bodyAll.slice(0, newMatch.index);
    const oldCores = extractOldUnitCores(before);
    if (oldCores.length) map.set(newCore, oldCores);
  }
  return map;
}

function extractOldUnitCores(before) {
  const cores = [];
  const pushName = (raw) => {
    let n = String(raw || '')
      .replace(/\([^)]*\)/g, ' ')
      .replace(/^(?:toàn bộ diện tích tự nhiên,?\s*quy mô dân số của|một phần diện tích tự nhiên,?\s*quy mô dân số của|phần còn lại của)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!n || /sắp xếp|quy định|khoản|diện tích|sau khi/i.test(n)) return;
    const core = normalizeKey(stripAdminPrefix(n));
    if (core.length >= 3) cores.push(core);
  };

  // "các phường A, B, C và D" / "các xã A, B và C"
  const groupRe =
    /các\s+(?:phường|xã|thị trấn)\s+(.+?)(?=(?:thành\s+|;\s*|$))/gi;
  let gm;
  const text = before;
  while ((gm = groupRe.exec(text))) {
    const parts = gm[1].split(/\s*,\s*|\s+và\s+/i);
    for (const p of parts) pushName(p);
  }

  // "phường A, phường B và xã C" / "thị trấn X và xã Y"
  const unitRe =
    /(?:phường|xã|thị trấn|thị xã)\s+([^,;]+?)(?=(?:\s*,\s*|\s+và\s+|\s+thành\s+|$))/gi;
  let um;
  while ((um = unitRe.exec(text))) {
    pushName(um[1]);
  }

  // "huyện Kiên Hải" (toàn huyện → đặc khu)
  const huyenRe = /huyện\s+([^,;]+?)(?=(?:\s+thành\s+|$))/gi;
  let hm;
  while ((hm = huyenRe.exec(text))) {
    pushName(hm[1]);
  }

  return [...new Set(cores)];
}

function resolveOldCandidates(oldCores, indexes, candidateProvinces) {
  const out = [];
  for (const core of oldCores) {
    const list = indexes.byPrecinctCore.get(core) ?? [];
    for (const item of list) {
      if (candidateProvinces.has(item.province)) out.push(item);
    }
  }
  return out;
}

function extractNewWardCoreFromAddress(address) {
  const m = String(address || '').match(
    /(?:Phường|Xã|Đặc khu|Thị trấn)\s+([^,]+)/i,
  );
  if (!m) return null;
  return normalizeKey(stripAdminPrefix(m[1]));
}

function main() {
  const AREA = loadAreaLookup();
  const stations = loadStations();
  const indexes = buildV1Indexes(AREA);
  const reverseProv = buildReverseProvinces();

  let nqText = '';
  try {
    nqText = readFileSync(nqPath, 'utf8');
  } catch {
    console.warn('NQ file missing — chỉ dùng heuristic tên');
  }
  const nq1654 = nqText ? parseNq1654(nqText) : new Map();
  console.log('NQ 1654 new wards parsed:', nq1654.size);
  console.log('sample Rạch Giá:', nq1654.get(normalizeKey('Rạch Giá')));

  /** @type {Record<string, { provinceCode: string; districtCode: string; precinctCode?: string; source: string }>} */
  const overrides = {};
  const stats = {
    nq1654: 0,
    heuristicPrecinct: 0,
    heuristicDistrict: 0,
    keepV1: 0,
    unmapped: 0,
  };

  for (const s of stations) {
    const id = String(s.id);
    const provAsis = (s.provinceCode || '').trim().toUpperCase() || null;
    const distAsis = (s.districtCode || '').trim() || null;
    const precAsis = (s.precinctCode || '').trim() || null;

    const bothCode =
      (provAsis && (V1_TO_BOTH[provAsis] || (reverseProv.has(provAsis) ? provAsis : null))) ||
      null;
    // effective BOTH for candidate set
    let both =
      provAsis && reverseProv.has(provAsis)
        ? provAsis
        : provAsis && V1_TO_BOTH[provAsis]
          ? V1_TO_BOTH[provAsis]
          : provAsis;

    // Infer BOTH from address tỉnh name if needed
    const addr = s.address || '';

    const candidateSet = new Set(reverseProv.get(both) ?? (both ? [both] : []));
    if (provAsis) candidateSet.add(provAsis);
    // An Giang address but code KGI or vice versa
    if (/an giang/i.test(addr)) {
      for (const c of reverseProv.get('AGI') ?? []) candidateSet.add(c);
      both = both || 'AGI';
    }
    if (/kien giang|kiên giang/i.test(addr)) {
      candidateSet.add('KGI');
      candidateSet.add('AGI');
    }

    // Already clean V1 district under a real old province — keep unless V2 precinct needs refresh
    const cleanV1 =
      distAsis &&
      !isV2DummyDistrict(distAsis) &&
      !isV2GsoPrecinct(precAsis) &&
      provAsis &&
      !isV2DummyDistrict(provAsis);

    // New ward core
    let newWardCore = extractNewWardCoreFromAddress(addr);
    if (!newWardCore && precAsis && isV2GsoPrecinct(precAsis) && both) {
      const v2Name = indexes.v2ByPrecinct.get(`${both}|${precAsis}`);
      if (v2Name) newWardCore = normalizeKey(stripAdminPrefix(v2Name));
    }

    let picked = null;
    let source = '';

    // 1) NQ 1654 reverse (An Giang)
    if (newWardCore && (both === 'AGI' || candidateSet.has('AGI') || candidateSet.has('KGI'))) {
      const oldCores = nq1654.get(newWardCore);
      if (oldCores?.length) {
        const cands = resolveOldCandidates(oldCores, indexes, candidateSet.size ? candidateSet : new Set(['AGI', 'KGI']));
        // Prefer district token in address
        const addrKey = normalizeKey(addr);
        const districtBoosted = cands.filter((c) => {
          const dName = AREA[`V1|${c.province}|${c.district}|`];
          const dCore = normalizeKey(stripAdminPrefix(dName || ''));
          return dCore.length >= 4 && addrKey.includes(dCore);
        });
        const pool = districtBoosted.length ? districtBoosted : cands;
        picked = seededPick(pool, id);
        if (picked) {
          source = 'NQ1654';
          stats.nq1654 += 1;
        }
      }
    }

    // 2) Heuristic: V2 ward name = V1 precinct name in candidate provinces
    if (!picked && newWardCore) {
      const cands = (indexes.byPrecinctCore.get(newWardCore) ?? []).filter((c) =>
        candidateSet.size ? candidateSet.has(c.province) : true,
      );
      const addrKey = normalizeKey(addr);
      const districtBoosted = cands.filter((c) => {
        const dName = AREA[`V1|${c.province}|${c.district}|`];
        const dCore = normalizeKey(stripAdminPrefix(dName || ''));
        return dCore.length >= 4 && addrKey.includes(dCore);
      });
      const pool = districtBoosted.length ? districtBoosted : cands;
      picked = seededPick(pool, id);
      if (picked) {
        source = 'NAME_PRECINCT';
        stats.heuristicPrecinct += 1;
      }
    }

    // 3) District from address token among candidate provinces + random precinct
    if (!picked) {
      const addrKey = normalizeKey(addr);
      const distHits = indexes.districts.filter((d) => {
        if (candidateSet.size && !candidateSet.has(d.province)) return false;
        return d.core.length >= 4 && addrKey.includes(d.core);
      });
      // Prefer longer district name match
      distHits.sort((a, b) => b.core.length - a.core.length);
      if (distHits.length) {
        const d = distHits[0];
        const precincts = [...indexes.byPrecinctCore.values()]
          .flat()
          .filter((p) => p.province === d.province && p.district === d.district);
        const prec = seededPick(precincts, id);
        picked = prec || {
          province: d.province,
          district: d.district,
          precinct: undefined,
          name: d.name,
        };
        source = 'NAME_DISTRICT';
        stats.heuristicDistrict += 1;
      }
    }

    // 4) Keep existing clean V1
    if (!picked && cleanV1) {
      overrides[id] = {
        provinceCode: provAsis,
        districtCode: distAsis,
        ...(precAsis ? { precinctCode: precAsis } : {}),
        source: 'KEEP_V1',
      };
      stats.keepV1 += 1;
      continue;
    }

    if (!picked) {
      stats.unmapped += 1;
      continue;
    }

    overrides[id] = {
      provinceCode: picked.province,
      districtCode: picked.district,
      ...(picked.precinct ? { precinctCode: picked.precinct } : {}),
      source,
    };
  }

  // Write TS overrides (strip source from runtime export? keep for debug in separate json)
  const runtime = {};
  for (const [id, o] of Object.entries(overrides)) {
    runtime[id] = {
      provinceCode: o.provinceCode,
      districtCode: o.districtCode,
      ...(o.precinctCode ? { precinctCode: o.precinctCode } : {}),
    };
  }

  const outTs = join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts');
  writeFileSync(
    outTs,
    `/**
 * Reverse-map Địa chỉ mới → Địa chỉ cũ (NQ 1654 + heuristic tên).
 * key = String(rescue_station_id)
 * Sinh: node docs/templates/build-station-admin-overrides-reverse-map.mjs
 */
export interface StationAdminOverride {
  provinceCode?: string;
  districtCode: string;
  precinctCode?: string;
}

export const STATION_ADMIN_OVERRIDES: Record<string, StationAdminOverride> = ${JSON.stringify(
      runtime,
      null,
      2,
    )};
`,
  );

  writeFileSync(
    join(__dirname, 'station-admin-reverse-map.summary.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        nq1654Wards: nq1654.size,
        stats,
        overrideCount: Object.keys(runtime).length,
        sampleRachGia: Object.entries(overrides)
          .filter(([, o]) => o.districtCode === 'RGI' && o.provinceCode === 'KGI')
          .slice(0, 8)
          .map(([id, o]) => ({ id, ...o, address: stations.find((s) => String(s.id) === id)?.address })),
      },
      null,
      2,
    ),
  );

  // Save NQ map for docs
  const nqObj = Object.fromEntries([...nq1654.entries()]);
  writeFileSync(join(__dirname, 'nq1654-new-to-old-wards.json'), JSON.stringify(nqObj, null, 2));

  console.log(JSON.stringify({ stats, overrideCount: Object.keys(runtime).length }, null, 2));
}

main();
