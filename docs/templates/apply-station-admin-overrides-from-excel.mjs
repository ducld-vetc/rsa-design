/**
 * Đọc mau_chuan_hoa_quan_huyen_tram.xlsx → stationAdminOverrides.ts
 * Chạy: node docs/templates/apply-station-admin-overrides-from-excel.mjs
 */
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const designRoot = join(__dirname, '../..');
const xlsxPath = join(
  designRoot,
  '../rsa-docs/docs/rescue_station/mau_chuan_hoa_quan_huyen_tram.xlsx',
);
const outPath = join(designRoot, 'pages/station-coverage/stationAdminOverrides.ts');

const wb = XLSX.read(readFileSync(xlsxPath), { type: 'buffer' });
const rows = XLSX.utils.sheet_to_json(wb.Sheets.Tram, { defval: '' });

/** @type {Record<string, { districtCode: string; precinctCode?: string }>} */
const overrides = {};
let withDistrict = 0;
let withPrecinct = 0;

for (const r of rows) {
  const id = String(r.rescue_station_id ?? '').trim();
  if (!id) continue;
  const district = String(r.district_code_CHUAN || r.district_code_GOIY || '').trim();
  const precinct = String(r.precinct_code_CHUAN || r.precinct_code_GOIY || '').trim();
  if (!district || /^\d{1,2}$/.test(district)) continue;

  /** @type {{ districtCode: string; precinctCode?: string }} */
  const item = { districtCode: district };
  if (precinct && !/^\d{5}$/.test(precinct)) {
    item.precinctCode = precinct;
    withPrecinct += 1;
  }
  overrides[id] = item;
  withDistrict += 1;
}

const body = `/**
 * Đề xuất chuẩn hóa quận/huyện (cấp 2) từ Excel mau_chuan_hoa_quan_huyen_tram.xlsx.
 * Dùng preview Địa chỉ cũ — key = String(rescue_station_id).
 * Sinh: node docs/templates/apply-station-admin-overrides-from-excel.mjs
 */
export interface StationAdminOverride {
  districtCode: string;
  precinctCode?: string;
}

export const STATION_ADMIN_OVERRIDES: Record<string, StationAdminOverride> = ${JSON.stringify(
  overrides,
  null,
  2,
)};
`;

writeFileSync(outPath, body);
console.log(
  JSON.stringify(
    {
      stationsInExcel: rows.length,
      overrides: withDistrict,
      withPrecinct,
      outPath,
    },
    null,
    2,
  ),
);
