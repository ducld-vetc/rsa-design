/**
 * Báo cáo tổng hợp trạm theo tỉnh (template Ops):
 * Theo tỉnh | Nội bộ | Đối tác ngoài (Có HĐ / Chưa có HĐ) | Tổng
 *
 * Nội bộ gộp 1 cột (không tách Carpla/Savico).
 * Nguồn: trạm đang hiển thị trên bản đồ độ phủ (mode địa chỉ cũ).
 *
 * Chạy: node docs/templates/export-station-coverage-summary-by-province.mjs
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { buildSync } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outFile = path.resolve(root, '../rsa-docs/docs/rescue_station/stations_coverage_summary_by_province.xlsx');
const bundleFile = '/tmp/station-coverage-summary-bundle.cjs';

buildSync({
  entryPoints: [path.join(root, 'pages/station-coverage/stationCoverageData.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: bundleFile,
  logLevel: 'error',
});

const require = createRequire(import.meta.url);
const cov = require(bundleFile);
const MODE = 'old';

const stations = cov
  .getMapStationPoints(MODE)
  .filter((s) => s.hasValidPosition && s.provinceId !== cov.UNASSIGNED_PROVINCE_ID);

const provinceRows = cov.getProvinceCoverageRows(MODE, stations);
const byProvince = new Map(
  provinceRows.map((p) => [p.id, { name: p.name, internal: 0, withContract: 0, noContract: 0 }]),
);

for (const s of stations) {
  const target = byProvince.get(s.provinceId);
  if (!target) continue;
  if (s.stationType === 'rescue_internal') target.internal += 1;
  else if (s.stationType === 'partner_with_contract') target.withContract += 1;
  else target.noContract += 1;
}

const rows = [...byProvince.values()]
  .map((r) => ({ ...r, total: r.internal + r.withContract + r.noContract }))
  .filter((r) => r.total > 0)
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

const totals = rows.reduce(
  (acc, r) => {
    acc.internal += r.internal;
    acc.withContract += r.withContract;
    acc.noContract += r.noContract;
    acc.total += r.total;
    return acc;
  },
  { internal: 0, withContract: 0, noContract: 0, total: 0 },
);

const aoa = [
  ['Theo tỉnh', 'Nội bộ', 'Đối tác ngoài', null, 'Tổng'],
  [null, null, 'Có HĐ', 'Chưa có HĐ', null],
];
for (const r of rows) aoa.push([r.name, r.internal, r.withContract, r.noContract, r.total]);
aoa.push(['Tổng cộng', totals.internal, totals.withContract, totals.noContract, totals.total]);

const ws = XLSX.utils.aoa_to_sheet(aoa);
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
  { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
  { s: { r: 0, c: 2 }, e: { r: 0, c: 3 } },
  { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
];
ws['!cols'] = [{ wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'TH theo tỉnh');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
XLSX.writeFile(wb, outFile);

console.log(JSON.stringify({ outFile, provinces: rows.length, totals }, null, 2));
