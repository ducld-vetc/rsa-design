/**
 * Sinh shift-monthly-schedule-import-template.xlsx — mẫu import Lịch ca theo tháng
 * Chạy: node docs/templates/generate-shift-monthly-schedule-import-template.mjs
 */
import * as XLSX from 'xlsx';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, 'shift-monthly-schedule-import-template.xlsx');

const MAX_DAYS = 31;

const dayHeaders = Array.from({ length: MAX_DAYS }, (_, i) => `Ngày ${i + 1}`);

const SCHEDULE_HEADERS = ['Mã NV', 'Họ tên', 'Role', ...dayHeaders, 'Ghi chú'];

const SHIFT_CATALOG = [
  ['KEY', 'Tên ca', 'Loại', 'Khung giờ', 'Role', 'Quy đổi công'],
  ['CG1', 'Ca gãy 1', 'SPLIT', '07:00–11:00', 'OSA / CSKH', '0.5'],
  ['CG2', 'Ca gãy 2', 'SPLIT', '08:00–12:00', 'OSA / CSKH', '0.5'],
  ['CG3', 'Ca gãy 3', 'SPLIT', '13:00–17:00', 'OSA / CSKH', '0.5'],
  ['CG4', 'Ca gãy 4', 'SPLIT', '15:00–19:00', 'OSA / CSKH', '0.5'],
  ['CG5', 'Ca gãy 5', 'SPLIT', '17:00–21:00', 'OSA / CSKH', '0.5'],
  ['CG6', 'Ca gãy 6', 'SPLIT', '17:30–21:30', 'OSA / CSKH', '0.5'],
  ['C1', 'Ca 1', 'FULL', '07:00–15:00', 'OSA / CSKH', '1'],
  ['C2', 'Ca 2', 'FULL', '13:30–21:30', 'OSA / CSKH', '1'],
  ['C3', 'Ca 3 (đêm)', 'FULL', '21:30–07:00', 'OSA / CSKH', '1'],
  ['OT', 'Ca OT', 'OT', '00:00–23:59', 'Chỉ CSKH', '1'],
];

const GUIDE_ROWS = [
  ['Mục', 'Mô tả'],
  ['Chức năng', 'Import lịch phân ca theo tháng — màn Quản trị hệ thống > Lịch ca theo tháng'],
  ['Sheet ThongTin', 'Tháng áp dụng (YYYY-MM). Mỗi file import cho một tháng.'],
  ['Sheet LichCa', 'Mỗi dòng = 1 nhân viên. Cột Ngày 1…31 = KEY ca trong ngày đó.'],
  ['Sheet DanhMucCa', 'Tra cứu KEY ca hợp lệ (lấy từ Cấu hình ca làm việc).'],
  [],
  ['Cột LichCa', 'Ý nghĩa'],
  ['Mã NV', 'Mã nhân viên hệ thống (VD: OSA-001, CSKH-001). Bắt buộc.'],
  ['Họ tên', 'Tên hiển thị — dùng đối chiếu, không bắt buộc nếu mã NV đúng.'],
  ['Role', 'OSA hoặc CSKH. Phải khớp nhóm ca được cấu hình.'],
  ['Ngày 1 … Ngày 31', 'KEY ca: CG1–CG6, C1–C3. CSKH thêm OT. Nhiều ca: nối bằng + (VD: C1+CG1).'],
  ['(trống / OFF)', 'Không xếp ca trong ngày.'],
  ['Ghi chú', 'Ghi chú tùy chọn cho dòng NV.'],
  [],
  ['Quy tắc nhập', 'Chi tiết'],
  ['BR-01', 'KEY ca phải tồn tại và active theo Role trên màn Cấu hình ca làm việc.'],
  ['BR-02', 'Ca nguyên (C1/C2/C3/OT) = 1 công; ca gãy (CG*) = 0.5 công.'],
  ['BR-04', 'Một ô tối đa 4 KEY, tối đa 2 FULL, tối đa 4 SPLIT, không trùng KEY.'],
  ['BR-08', 'Định mức công tháng: OSA 16, CSKH 18 (BE cấu hình).'],
  ['Import', 'Upload → preview impact → Xác nhận import → ghi draft → Lưu lịch ca để commit.'],
  [],
  ['Ví dụ ô', 'Giá trị'],
  ['Ca sáng nguyên', 'C1'],
  ['Ca chiều gãy', 'CG3'],
  ['Ca kép', 'C1+CG1'],
  ['Nghỉ', 'OFF hoặc để trống'],
];

const INFO_ROWS = [
  ['field', 'value'],
  ['yearMonth', '2026-07'],
  ['note', 'Đổi yearMonth trước khi import. Chỉ điền cột Ngày 1…N (N = số ngày trong tháng).'],
];

/** Demo pattern: Chủ nhật nghỉ, luân phiên ca */
function buildDayAssignments(seed, role) {
  const keys =
    role === 'CSKH'
      ? ['C1', 'C2', 'CG1', 'CG3', 'C3', 'OT']
      : ['C1', 'C2', 'CG1', 'CG3', 'C3'];
  return Array.from({ length: MAX_DAYS }, (_, i) => {
    const day = i + 1;
    if (day % 7 === 0) return '';
    if (day === 5 && seed === 0) return 'C1+CG1';
    if (day === 15 && seed === 1 && role === 'OSA') return 'CG2+CG3';
    return keys[(day + seed) % keys.length];
  });
}

const SAMPLE_EMPLOYEES = [
  {
    code: 'OSA-001',
    name: 'Nguyễn Văn A',
    role: 'OSA',
    note: 'Mẫu OSA — ca kép ngày 5',
    seed: 0,
  },
  {
    code: 'OSA-002',
    name: 'Trần Thị B',
    role: 'OSA',
    note: '',
    seed: 1,
  },
  {
    code: 'OSA-003',
    name: 'Lê Văn C',
    role: 'OSA',
    note: 'NV mới',
    seed: 2,
  },
  {
    code: 'CSKH-001',
    name: 'Vũ Thị F',
    role: 'CSKH',
    note: 'Mẫu CSKH',
    seed: 0,
  },
  {
    code: 'CSKH-002',
    name: 'Đỗ Văn G',
    role: 'CSKH',
    note: '',
    seed: 1,
  },
];

const scheduleRows = SAMPLE_EMPLOYEES.map((emp) => {
  const days = buildDayAssignments(emp.seed, emp.role);
  return [emp.code, emp.name, emp.role, ...days, emp.note];
});

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(GUIDE_ROWS), 'HuongDan');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(INFO_ROWS), 'ThongTin');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(SHIFT_CATALOG), 'DanhMucCa');

const scheduleSheet = XLSX.utils.aoa_to_sheet([SCHEDULE_HEADERS, ...scheduleRows]);

// Freeze header row + first 3 columns
scheduleSheet['!freeze'] = { xSplit: 3, ySplit: 1, topLeftCell: 'D2', activePane: 'bottomRight' };

// Column widths
scheduleSheet['!cols'] = [
  { wch: 12 },
  { wch: 22 },
  { wch: 8 },
  ...Array(MAX_DAYS).fill({ wch: 9 }),
  { wch: 24 },
];

XLSX.utils.book_append_sheet(wb, scheduleSheet, 'LichCa');
XLSX.writeFile(wb, outPath);
console.log('Wrote', outPath);
