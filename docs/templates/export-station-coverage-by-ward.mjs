/**
 * Xuất Excel danh sách trạm đang hiển thị trên bản đồ độ phủ
 * (cùng filter: loại QS / excluded / tọa độ hợp lệ).
 *
 * Sheet 1: tổng hợp theo Xã/Phường — số trạm thuộc địa bàn + gần ≤30km
 * Sheet 2: chi tiết theo Xã/Phường — 1 dòng / trạm
 * Sheet 3: chi tiết theo Tỉnh — 1 dòng / trạm (thuộc tỉnh + gần tâm tỉnh ≤30km)
 *
 * Chạy: node docs/templates/export-station-coverage-by-ward.mjs
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { buildSync } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const outDir = path.resolve(root, '../rsa-docs/docs/rescue_station');
const outFile = path.join(outDir, 'stations_coverage_map_by_ward.xlsx');
const bundleFile = path.join('/tmp', 'station-coverage-export-bundle.cjs');

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
const wards = require(path.join(root, 'pages/station-coverage/wardCentroidsV1.json'));

const MODE = 'old';
const RADIUS_KM = cov.NEARBY_RADIUS_KM ?? 30;

const typeLabel = (type) => {
  if (type === 'rescue_internal') return 'Nội bộ';
  if (type === 'partner_with_contract') return 'Có HĐ';
  return 'Không có HĐ';
};

const stations = cov
  .getMapStationPoints(MODE)
  .filter((s) => s.hasValidPosition && s.provinceId !== cov.UNASSIGNED_PROVINCE_ID);

const provinceNameByCode = new Map();
for (const row of cov.getProvinceCoverageRows(MODE, stations)) {
  provinceNameByCode.set(row.code.toUpperCase(), row.name);
}

const sheet1 = [];
const sheet2 = [];

const t0 = Date.now();
for (const ward of wards) {
  const provinceCode = String(ward.p || '').toUpperCase();
  const districtCode = String(ward.d || '').toUpperCase();
  const precinctCode = String(ward.c || '').toUpperCase();
  const provinceName = provinceNameByCode.get(provinceCode) ?? provinceCode;
  const districtName = cov.districtDisplayName(MODE, provinceCode, districtCode);
  const wardName = ward.n || cov.precinctDisplayName(MODE, provinceCode, districtCode, precinctCode);
  const wardKey = cov.precinctFilterKey(provinceCode, districtCode, precinctCode);

  const inArea = [];
  const nearby = [];

  for (const station of stations) {
    const stationKey = cov.precinctFilterKey(
      station.provinceCode,
      station.districtCode,
      station.precinctCode,
    );
    const distanceKm = cov.haversineKm(ward.lat, ward.lng, station.position[0], station.position[1]);
    if (stationKey === wardKey) {
      inArea.push({ station, distanceKm });
      continue;
    }
    if (distanceKm <= RADIUS_KM) {
      nearby.push({ station, distanceKm });
    }
  }

  inArea.sort((a, b) => a.distanceKm - b.distanceKm || a.station.name.localeCompare(b.station.name, 'vi'));
  nearby.sort((a, b) => a.distanceKm - b.distanceKm || a.station.name.localeCompare(b.station.name, 'vi'));

  sheet1.push({
    'Tỉnh/Thành': provinceName,
    'Quận/Huyện': districtName,
    'Phường/Xã': wardName,
    'Mã tỉnh': provinceCode,
    'Mã huyện': districtCode,
    'Mã xã': precinctCode,
    'Số trạm thuộc địa bàn': inArea.length,
    'Số trạm gần địa bàn (<=30km)': nearby.length,
    Tổng: inArea.length + nearby.length,
  });

  const pushDetail = (list, viTri) => {
    for (const { station, distanceKm } of list) {
      sheet2.push({
        'Tỉnh/Thành': provinceName,
        'Quận/Huyện': districtName,
        'Phường/Xã': wardName,
        'Trạm cứu hộ': station.name,
        'Mã trạm': station.code,
        'Phân loại': typeLabel(station.stationType),
        'Vị trí': viTri,
        'Khoảng cách (km)': Math.round(distanceKm * 10) / 10,
      });
    }
  };
  pushDetail(inArea, 'Thuộc địa bàn');
  pushDetail(nearby, 'Gần địa bàn');
}

// Sheet 3: theo tỉnh — trạm thuộc tỉnh + trạm ngoài tỉnh trong 30km tâm tỉnh
const provinceCenters = cov.getProvinceCenters(MODE);
const provinceRows = cov.getProvinceCoverageRows(MODE, stations);
const sheet3 = [];

for (const prov of provinceRows) {
  const center = provinceCenters[prov.id];
  if (!center) continue;
  const [plat, plng] = center;
  const inProv = [];
  const nearProv = [];

  for (const station of stations) {
    const distanceKm = cov.haversineKm(plat, plng, station.position[0], station.position[1]);
    if (station.provinceId === prov.id) {
      inProv.push({ station, distanceKm });
      continue;
    }
    if (distanceKm <= RADIUS_KM) {
      nearProv.push({ station, distanceKm });
    }
  }

  inProv.sort((a, b) => a.distanceKm - b.distanceKm || a.station.name.localeCompare(b.station.name, 'vi'));
  nearProv.sort((a, b) => a.distanceKm - b.distanceKm || a.station.name.localeCompare(b.station.name, 'vi'));

  for (const { station, distanceKm } of inProv) {
    sheet3.push({
      'Tỉnh/Thành': prov.name,
      'Trạm cứu hộ': station.name,
      'Mã trạm': station.code,
      'Phân loại': typeLabel(station.stationType),
      'Vị trí': 'Thuộc địa bàn',
      'Khoảng cách (km)': Math.round(distanceKm * 10) / 10,
    });
  }
  for (const { station, distanceKm } of nearProv) {
    sheet3.push({
      'Tỉnh/Thành': prov.name,
      'Trạm cứu hộ': station.name,
      'Mã trạm': station.code,
      'Phân loại': typeLabel(station.stationType),
      'Vị trí': 'Gần địa bàn',
      'Khoảng cách (km)': Math.round(distanceKm * 10) / 10,
    });
  }
}

sheet1.sort((a, b) =>
  a['Tỉnh/Thành'].localeCompare(b['Tỉnh/Thành'], 'vi') ||
  a['Quận/Huyện'].localeCompare(b['Quận/Huyện'], 'vi') ||
  a['Phường/Xã'].localeCompare(b['Phường/Xã'], 'vi'),
);

const wb = XLSX.utils.book_new();
const ws1 = XLSX.utils.json_to_sheet(sheet1);
const ws2 = XLSX.utils.json_to_sheet(sheet2);
const ws3 = XLSX.utils.json_to_sheet(sheet3);
XLSX.utils.book_append_sheet(wb, ws1, 'TH theo xã');
XLSX.utils.book_append_sheet(wb, ws2, 'DS theo xã');
XLSX.utils.book_append_sheet(wb, ws3, 'DS theo tỉnh');

fs.mkdirSync(outDir, { recursive: true });
XLSX.writeFile(wb, outFile);

console.log(
  JSON.stringify(
    {
      outFile,
      stations: stations.length,
      wards: wards.length,
      sheet1Rows: sheet1.length,
      sheet2Rows: sheet2.length,
      sheet3Rows: sheet3.length,
      elapsedMs: Date.now() - t0,
    },
    null,
    2,
  ),
);
