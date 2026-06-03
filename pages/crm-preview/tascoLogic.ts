import type { ServiceVehicleRow } from './mockData';

/** Kết quả / lý do liên hệ — theo dropdown Tasco DMS */
export const CONTACT_RESULTS = [
  'L/H Thành công',
  'L/H không thành công',
  'Không liên hệ',
] as const;

export const CONTACT_REASONS = [
  'Hài lòng',
  'Không nhấc máy',
  'Yêu cầu gọi lại',
  'Khác',
] as const;

export const LIEN_LAC_OPTIONS = ['Gọi điện CS/KH', 'SMS', 'Zalo', 'Email', 'Trực tiếp'] as const;
export const DANH_GIA_OPTIONS = ['', 'Hài lòng', 'Bình thường', 'Không hài lòng', 'Chưa đánh giá'] as const;
export const GIAO_XE_OPTIONS = ['', 'Đã giao', 'Chưa giao', 'Chờ giao'] as const;
export const RATING_OPTIONS = ['5*', '4*', '3*', '2*', '1*', 'Chưa đánh giá'] as const;

export type ContactResult = (typeof CONTACT_RESULTS)[number] | '';
export type ContactReason = (typeof CONTACT_REASONS)[number] | '';
export type ContactFilterTab = 'ALL' | 'CHUA_LIEN_HE' | 'THANH_CONG' | 'CAN_GOI_LAI' | 'QUA_HAN';

/** SLA: gọi CSKH trong vòng N ngày sau ngày xe ra (Tasco after-service) */
export const CONTACT_SLA_DAYS_AFTER_EXIT = 3;

export interface ContactAttempt {
  attemptNo: 1 | 2 | 3;
  date: string;
  time: string;
  result: ContactResult;
  reason: ContactReason;
  note: string;
}

export interface CriterionRating {
  code: string;
  label: string;
  rating: string;
  note: string;
}

export interface RepairOrderEvaluation {
  soRO: string;
  khachHang: string;
  diaChi: string;
  nguoiLienHe: string;
  dienThoai: string;
  ghiChu: string;
  dienGiai: string;
  cskh: string;
  email: string;
  soKm: string;
  cvdv: string;
  loaiXe: string;
  mauXe: string;
  soKhung: string;
  soMay: string;
  bienSo: string;
  lenhNgay: string;
  nghiemThu: string;
  ngayXeRa: string;
  lienLac: string;
  danhGia: string;
  giaoXe: string;
  vrc: string;
  contacts: ContactAttempt[];
  criteria: CriterionRating[];
}

export function parseDateDDMMYYYY(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / (86400000));
}

/** Số ngày kể từ ngày xe ra đến hôm nay (demo: cố định 26/05/2026) */
export function daysSinceVehicleExit(ngayXeRa: string, today = new Date(2026, 4, 26)): number {
  const exit = parseDateDDMMYYYY(ngayXeRa);
  if (!exit) return 0;
  return daysBetween(exit, today);
}

export function isContactOverdue(row: ServiceVehicleRow, today = new Date(2026, 4, 26)): boolean {
  if (row.call1.trim()) return false;
  return daysSinceVehicleExit(row.ngayXeRa, today) > CONTACT_SLA_DAYS_AFTER_EXIT;
}

export type TascoContactStatus = 'HOAN_THANH' | 'CAN_GOI_LAI' | 'CHUA_LIEN_HE' | 'QUA_HAN';

export function getTascoContactStatus(row: ServiceVehicleRow, today = new Date(2026, 4, 26)): TascoContactStatus {
  if (isContactOverdue(row, today)) return 'QUA_HAN';
  if (!row.call1.trim() && !row.ketQuaLienHe.trim()) return 'CHUA_LIEN_HE';
  if (
    row.ketQuaLienHe.includes('không thành') ||
    row.lyDoLienHe.includes('gọi lại') ||
    row.lyDoLienHe.includes('Không nhấc')
  ) {
    return 'CAN_GOI_LAI';
  }
  if (row.ketQuaLienHe.includes('Thành công') || row.danhGiaKH) return 'HOAN_THANH';
  if (!row.call1.trim()) return 'CHUA_LIEN_HE';
  return 'CAN_GOI_LAI';
}

export function matchesContactFilter(row: ServiceVehicleRow, tab: ContactFilterTab): boolean {
  const status = getTascoContactStatus(row);
  switch (tab) {
    case 'CHUA_LIEN_HE':
      return status === 'CHUA_LIEN_HE';
    case 'THANH_CONG':
      return status === 'HOAN_THANH';
    case 'CAN_GOI_LAI':
      return status === 'CAN_GOI_LAI';
    case 'QUA_HAN':
      return status === 'QUA_HAN';
    default:
      return true;
  }
}

export function countByStatus(rows: ServiceVehicleRow[]): Record<TascoContactStatus, number> {
  const init: Record<TascoContactStatus, number> = {
    HOAN_THANH: 0,
    CAN_GOI_LAI: 0,
    CHUA_LIEN_HE: 0,
    QUA_HAN: 0,
  };
  rows.forEach((r) => {
    init[getTascoContactStatus(r)] += 1;
  });
  return init;
}

export function canEditContactAttempt(contacts: ContactAttempt[], attemptNo: 1 | 2 | 3): boolean {
  if (attemptNo === 1) return true;
  const prev = contacts.find((c) => c.attemptNo === attemptNo - 1);
  if (!prev?.date.trim()) return false;
  if (prev.result === 'L/H không thành công' || prev.result === 'Không liên hệ') return true;
  if (prev.result === 'L/H Thành công') return false;
  return !!prev.date;
}

export function validateContactAttempt(c: ContactAttempt): string[] {
  const errors: string[] = [];
  const hasAny = c.date || c.time || c.result || c.reason || c.note;
  if (!hasAny) return errors;
  if (!c.date) errors.push(`Lần ${c.attemptNo}: nhập ngày liên hệ`);
  if (!c.result) errors.push(`Lần ${c.attemptNo}: chọn kết quả liên hệ`);
  if (c.result === 'L/H Thành công' && !c.reason) {
    errors.push(`Lần ${c.attemptNo}: chọn lý do khi liên hệ thành công`);
  }
  return errors;
}

export function validateEvaluationSave(form: RepairOrderEvaluation): string[] {
  const errors: string[] = [];
  const filled = form.contacts.filter((c) => c.date || c.result);
  if (filled.length === 0) {
    errors.push('Tasco: Bắt buộc ghi nhận ít nhất 1 lần liên hệ sau sửa chữa');
  }
  form.contacts.forEach((c) => errors.push(...validateContactAttempt(c)));
  if (form.giaoXe === 'Đã giao' && form.danhGia === '') {
    errors.push('Xe đã giao — cần chọn đánh giá tổng thể khách hàng');
  }
  const missingCriteria = form.criteria.filter((c) => !c.rating || c.rating === 'Chưa đánh giá');
  if (form.danhGia === 'Hài lòng' && missingCriteria.length > 0) {
    errors.push('Khi KH hài lòng — hoàn thiện 4 tiêu chí đánh giá chi tiết');
  }
  return errors;
}

export function rowToEvaluation(row: ServiceVehicleRow, criteriaLabels: { code: string; label: string }[]): RepairOrderEvaluation {
  const contacts: ContactAttempt[] = [
    {
      attemptNo: 1,
      date: row.call1 || '',
      time: row.call1 ? '08:53' : '',
      result: row.ketQuaLienHe as ContactResult,
      reason: row.lyDoLienHe as ContactReason,
      note: row.ghiChuLan1,
    },
    {
      attemptNo: 2,
      date: row.call2 || '',
      time: '',
      result: '',
      reason: '',
      note: row.ghiChuLan2,
    },
    {
      attemptNo: 3,
      date: row.call3 || '',
      time: '',
      result: '',
      reason: '',
      note: row.ghiChuLan3,
    },
  ];

  return {
    soRO: row.soRO,
    khachHang: row.tenKhachHang,
    diaChi: row.diaChi,
    nguoiLienHe: row.nguoiLienLac,
    dienThoai: row.dtNguoiLienLac,
    ghiChu: row.noiDungCV,
    dienGiai: row.noiDungCV,
    cskh: `${row.nguoiChamSoc} | Tasco`,
    email: '',
    soKm: row.soKm,
    cvdv: row.cvdv,
    loaiXe: row.loaiXe,
    mauXe: '—',
    soKhung: row.soKhung,
    soMay: row.soKhung.slice(-7) || '—',
    bienSo: row.bienKiemSoat,
    lenhNgay: row.ngayVao,
    nghiemThu: row.ngayNghiemThu,
    ngayXeRa: row.ngayXeRa,
    lienLac: 'Gọi điện CS/KH',
    danhGia: row.danhGiaKH || (row.lyDoLienHe === 'Hài lòng' ? 'Hài lòng' : ''),
    giaoXe: row.ngayXeRa ? 'Đã giao' : '',
    vrc: '',
    contacts,
    criteria: criteriaLabels.map((c) => ({
      code: c.code,
      label: c.label,
      rating: row.danhGiaKH === 'Hài lòng' ? '5*' : '',
      note: '',
    })),
  };
}

export const STATUS_LABELS: Record<TascoContactStatus, { label: string; className: string }> = {
  HOAN_THANH: { label: 'Đã liên hệ — Hài lòng', className: 'bg-green-100 text-vetc-green border-green-300' },
  CAN_GOI_LAI: { label: 'Cần gọi lại', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  CHUA_LIEN_HE: { label: 'Chưa liên hệ', className: 'bg-gray-100 text-gray-600 border-gray-300' },
  QUA_HAN: { label: 'Quá hạn SLA', className: 'bg-red-100 text-red-700 border-red-300' },
};
