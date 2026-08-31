import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Copy, Download, Eye, FileSpreadsheet, Search, Trash2, Upload, X } from 'lucide-react';
import AppSelect from '../shared/AppSelect';
import {
  FIELD_TO_HEADER,
  MOCK_IMPORT_BATCHES,
  MOCK_IMPORT_LINES,
  MOCK_IMPORTED_PACKAGES,
  PACKAGE_IMPORT_CODES,
  PACKAGE_IMPORT_HEADERS,
  PACKAGE_IMPORT_PARTNERS,
  PACKAGE_IMPORT_VEHICLE_KINDS,
  addYearsToVnDate,
  buildMockImportPreview,
  applyExistingPlateWarnings,
  normalizePlate,
  packageDurationYears,
  parseDisplayDate,
  formatVnDate,
  resolvePackageStatus,
  rowHasError,
  validateImportValues,
  type ImportedPackageRecord,
  type PackageImportBatch,
  type PackageImportField,
  type PackageImportLine,
  type PackageImportPreviewRow,
  type PackageImportStatus,
  type PackageImportValues,
} from '../data/packageImportMockData';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const isStampInDateRange = (stamp: string, fromRaw: string, toRaw: string) => {
  const created = parseDisplayDate(stamp.trim().split(/\s+/)[0] || '');
  if (!created) return true;
  created.setHours(0, 0, 0, 0);
  const from = fromRaw.trim() ? parseDisplayDate(fromRaw.trim()) : null;
  const to = toRaw.trim() ? parseDisplayDate(toRaw.trim()) : null;
  if (from) {
    from.setHours(0, 0, 0, 0);
    if (created < from) return false;
  }
  if (to) {
    to.setHours(0, 0, 0, 0);
    if (created > to) return false;
  }
  return true;
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const DateRangeField: React.FC<{
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}> = ({ from, to, onChange }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseDisplayDate(from) || new Date());
  const [draftFrom, setDraftFrom] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 288 });

  const fromDate = parseDisplayDate(from);
  const toDate = parseDisplayDate(to);
  const display = from && to ? `${from} – ${to}` : from ? `${from} – …` : to ? `… – ${to}` : '';

  const updatePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 288) });
  };

  useEffect(() => {
    if (!open) return;
    setDraftFrom(null);
    setView(fromDate || new Date());
    updatePos();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const pickDay = (day: Date) => {
    if (!draftFrom) {
      setDraftFrom(day);
      return;
    }
    const start = draftFrom <= day ? draftFrom : day;
    const end = draftFrom <= day ? day : draftFrom;
    onChange(formatVnDate(start), formatVnDate(end));
    setOpen(false);
  };

  const inRange = (day: Date) => {
    const start = draftFrom || fromDate;
    const end = draftFrom ? null : toDate;
    if (start && end) return day >= start && day <= end;
    if (start && !end) return sameDay(day, start);
    return false;
  };

  const isEdge = (day: Date) => {
    const start = draftFrom || fromDate;
    const end = draftFrom ? null : toDate;
    return Boolean((start && sameDay(day, start)) || (end && sameDay(day, end)));
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-[34px] w-full min-w-0 items-center justify-between gap-2 rounded border bg-white px-3 text-left text-sm outline-none transition-colors focus:border-vetc-green ${
          display ? 'text-gray-700' : 'text-gray-400'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{display || 'Từ ngày – Đến ngày'}</span>
        <span className="flex shrink-0 items-center gap-1">
          {display && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Xóa khoảng ngày"
              onClick={(event) => {
                event.stopPropagation();
                onChange('', '');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange('', '');
                }
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={12} />
            </span>
          )}
          <Calendar size={14} className="text-gray-400" />
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-[200] rounded-lg border bg-white p-3 shadow-xl"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Tháng trước"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-xs font-bold text-gray-800">
                Tháng {month + 1}/{year}
              </p>
              <button
                type="button"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Tháng sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="py-1 text-[10px] font-bold text-gray-400">
                  {label}
                </div>
              ))}
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;
                const selected = isEdge(day);
                const ranged = inRange(day);
                return (
                  <button
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    type="button"
                    onClick={() => pickDay(day)}
                    className={`h-8 rounded text-xs font-semibold ${
                      selected
                        ? 'bg-vetc-green text-white'
                        : ranged
                          ? 'bg-green-50 text-vetc-green'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-gray-400">
              {draftFrom ? 'Chọn ngày kết thúc' : 'Chọn ngày bắt đầu, rồi ngày kết thúc'}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
};

const fieldInputClass =
  'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400';

const DatePickerField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  title?: string;
}> = ({ value, onChange, placeholder = 'dd/MM/yyyy', inputClassName = '', title }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseDisplayDate(value) || new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 288 });

  const selectedDate = parseDisplayDate(value);

  const updatePos = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 288) });
  };

  useEffect(() => {
    if (!open) return;
    setView(selectedDate || new Date());
    updatePos();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const pickDay = (day: Date) => {
    onChange(formatVnDate(day));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex items-stretch gap-1">
        <input
          className={`${fieldInputClass} min-w-0 flex-1 ${inputClassName}`}
          value={value}
          placeholder={placeholder}
          title={title}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex shrink-0 items-center justify-center rounded border border-gray-200 bg-white px-2 text-gray-500 transition-colors hover:border-vetc-green hover:text-vetc-green"
          title="Chọn ngày"
          aria-label="Chọn ngày"
        >
          <Calendar size={14} />
        </button>
      </div>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-[200] rounded-lg border bg-white p-3 shadow-xl"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView(new Date(year, month - 1, 1))}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Tháng trước"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-xs font-bold text-gray-800">
                Tháng {month + 1}/{year}
              </p>
              <button
                type="button"
                onClick={() => setView(new Date(year, month + 1, 1))}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Tháng sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="py-1 text-[10px] font-bold text-gray-400">
                  {label}
                </div>
              ))}
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;
                const selected = selectedDate ? sameDay(day, selectedDate) : false;
                return (
                  <button
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    type="button"
                    onClick={() => pickDay(day)}
                    className={`h-8 rounded text-xs font-semibold ${
                      selected ? 'bg-vetc-green text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const ScreenTabs = <T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
}) => (
  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onChange(item.id)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
          value === item.id ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {item.label}
      </button>
    ))}
  </div>
);

const buildPageItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

type ScreenTab = 'import' | 'list';
type PageView = 'main' | 'upload' | 'batch-detail';
type DetailTab = 'failed' | 'success';
type LineDialog = {
  mode: 'view' | 'copy';
  values: PackageImportValues;
  errors: Partial<Record<PackageImportField, string>>;
};

const IMPORT_FIELDS: PackageImportField[] = [
  'partnerCode',
  'packageCode',
  'beneficiaryName',
  'phone',
  'address',
  'plate',
  'vin',
  'model',
  'brand',
  'payload',
  'seats',
  'vehicleKind',
  'effectiveDate',
];

const importFieldColClass = (field: PackageImportField) => {
  if (field === 'address') return 'min-w-[280px]';
  if (field === 'packageCode' || field === 'vehicleKind' || field === 'beneficiaryName' || field === 'vin') {
    return 'min-w-[200px]';
  }
  return 'min-w-[140px]';
};

const STATUS_CONFIG: Record<PackageImportStatus, { label: string; className: string }> = {
  active: { label: 'Hiệu lực', className: 'bg-green-50 text-vetc-green border-green-200' },
  expired: { label: 'Hết hạn', className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const BATCH_STATUS_CONFIG: Record<PackageImportBatch['status'], { label: string; className: string }> = {
  completed: { label: 'Hoàn tất', className: 'bg-green-50 text-vetc-green border-green-200' },
  partial: { label: 'Một phần', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const BATCH_STATUS_OPTIONS = [
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'partial', label: 'Một phần' },
];

const PARTNER_OPTIONS = PACKAGE_IMPORT_PARTNERS.map((p) => ({ value: p.value, label: p.label }));
const PACKAGE_CODE_OPTIONS = PACKAGE_IMPORT_CODES.map((p) => ({ value: p.value, label: p.label }));
const VEHICLE_KIND_OPTIONS = PACKAGE_IMPORT_VEHICLE_KINDS.map((p) => ({ value: p.value, label: p.label }));

const applyDuplicateErrors = (rows: PackageImportPreviewRow[]) => {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const key = `${row.values.partnerCode}|${row.values.plate}`.toLowerCase();
    const next = { ...row, errors: { ...row.errors } };
    if (row.values.partnerCode && row.values.plate) {
      if (seen.has(key)) next.errors.plate = 'Trùng biển số + đối tác trong file';
      else seen.set(key, 1);
    }
    return next;
  });
};

const enrichPreviewRows = (rows: PackageImportPreviewRow[], existingPlates: Set<string>) =>
  applyExistingPlateWarnings(
    applyDuplicateErrors(rows.map((row) => ({ ...row, errors: validateImportValues(row.values) }))),
    existingPlates,
  );

const downloadTemplate = () => {
  const sample = [
    {
      'Mã đối tác': 'TASCO',
      'Mã gói': 'RSA_PREMIUM3',
      'Tên người thụ hưởng': 'Nguyen Van A',
      'Số điện thoại': '0912345678',
      'Địa chỉ': 'Số 12, Phố Láng, Đống Đa, Hà Nội',
      'Biển số xe': '30A12345',
      'Số khung': 'RLH12345678901234',
      'Dòng xe': 'Vios',
      'Hãng xe': 'Toyota',
      'Trọng tải': '0.5',
      'Số chỗ': '5',
      'Loại xe': 'Xe chở người',
      'Ngày bắt đầu hiệu lực': '01/09/2026',
    },
    {
      'Mã đối tác': 'PTI',
      'Mã gói': 'RSA_PREMIUM2',
      'Tên người thụ hưởng': 'Tran Thi B',
      'Số điện thoại': '0987654321',
      'Địa chỉ': 'Phường Long Biên, Hà Nội',
      'Biển số xe': '29C-555.12',
      'Số khung': 'KMHDN45D86U654321',
      'Dòng xe': 'Porter',
      'Hãng xe': 'Hyundai',
      'Trọng tải': '1.5',
      'Số chỗ': '3',
      'Loại xe': 'Xe chở hàng',
      'Ngày bắt đầu hiệu lực': '15/09/2026',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: [...PACKAGE_IMPORT_HEADERS] });
  ws['!cols'] = PACKAGE_IMPORT_HEADERS.map((h) => ({ wch: Math.max(16, h.length + 4) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ImportGoiCuuHo');
  XLSX.writeFile(wb, 'mau_import_goi_cuu_ho.xlsx');
};

const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const makeImportCode = (existingCount: number) => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `IMP-${y}${m}${day}-${String(existingCount + 1).padStart(3, '0')}`;
};

const makePurchaseCode = (index: number) => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const seq = String(Date.now()).slice(-6) + String(index + 1).padStart(2, '0');
  return `RS3${y}${m}${day}${seq}`;
};

const PackageImportManagement: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<ScreenTab>('import');
  const [pageView, setPageView] = useState<PageView>('main');
  const [records, setRecords] = useState<ImportedPackageRecord[]>(MOCK_IMPORTED_PACKAGES);
  const [batches, setBatches] = useState<PackageImportBatch[]>(MOCK_IMPORT_BATCHES);
  const [lines, setLines] = useState<PackageImportLine[]>(MOCK_IMPORT_LINES);
  const [selectedBatch, setSelectedBatch] = useState<PackageImportBatch | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('failed');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PackageImportPreviewRow[]>([]);
  const [fileError, setFileError] = useState('');
  const [notice, setNotice] = useState('');

  const [purchaseCode, setPurchaseCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');

  const [batchImportCode, setBatchImportCode] = useState('');
  const [batchFileName, setBatchFileName] = useState('');
  const [batchStatus, setBatchStatus] = useState('');
  const [batchFromDate, setBatchFromDate] = useState('');
  const [batchToDate, setBatchToDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [lineDialog, setLineDialog] = useState<LineDialog | null>(null);

  const validCount = previewRows.filter((r) => !rowHasError(r)).length;
  const errorCount = previewRows.length - validCount;
  const warningCount = previewRows.filter((r) => !rowHasError(r) && r.warnings?.plate).length;

  const existingPlates = useMemo(
    () => new Set(records.map((record) => normalizePlate(record.plate)).filter(Boolean)),
    [records],
  );

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  const onPickFile = (file: File | null) => {
    setImportFile(file);
    setFileError('');
    if (!file) {
      setPreviewRows([]);
      return;
    }
    setPreviewRows(enrichPreviewRows(buildMockImportPreview(), existingPlates));
    setPageView('upload');
    setTab('import');
  };

  const patchRow = (id: string, field: PackageImportField, value: string) => {
    setPreviewRows((prev) =>
      enrichPreviewRows(
        prev.map((row) => {
          if (row.id !== id) return row;
          const values = { ...row.values, [field]: value };
          return { ...row, values };
        }),
        existingPlates,
      ),
    );
  };

  const deletePreviewRow = (id: string) => {
    setPreviewRows((prev) => enrichPreviewRows(prev.filter((row) => row.id !== id), existingPlates));
  };

  const confirmImport = () => {
    const valid = previewRows.filter((r) => !rowHasError(r));
    if (valid.length === 0) return;
    const warnedImported = valid.filter((r) => r.warnings?.plate).length;
    const stamp = nowStamp();
    const nextImportCode = makeImportCode(batches.length);
    const created: ImportedPackageRecord[] = valid.map((r, i) => {
      const pkg = r.values.packageCode.trim().toUpperCase();
      const effectiveDate = r.values.effectiveDate.trim();
      const expiryDate = addYearsToVnDate(effectiveDate, packageDurationYears(pkg));
      return {
        id: `imp-${Date.now()}-${i}`,
        purchaseCode: makePurchaseCode(i),
        importCode: nextImportCode,
        ...r.values,
        partnerCode: r.values.partnerCode.trim().toUpperCase(),
        packageCode: pkg,
        expiryDate,
        status: resolvePackageStatus(expiryDate),
        createdAt: stamp,
        createdBy: 'doi_tac_rsa',
      };
    });
    const nextLines: PackageImportLine[] = previewRows.map((r, i) => {
      const failed = rowHasError(r);
      const matched = created.find(
        (c) =>
          c.plate === r.values.plate &&
          c.partnerCode === r.values.partnerCode.trim().toUpperCase() &&
          c.beneficiaryName === r.values.beneficiaryName,
      );
      return {
        id: failed ? `fail-${Date.now()}-${i}` : matched?.id || `line-${Date.now()}-${i}`,
        importCode: nextImportCode,
        result: failed ? 'failed' : 'success',
        values: { ...r.values },
        errors: failed ? { ...r.errors } : {},
        purchaseCode: matched?.purchaseCode || '',
        expiryDate: matched?.expiryDate || '',
        status: matched?.status ?? null,
        createdAt: stamp,
        createdBy: 'doi_tac_rsa',
      };
    });
    setRecords((prev) => [...created, ...prev]);
    setLines((prev) => [...nextLines, ...prev]);
    const nextBatch: PackageImportBatch = {
      id: `batch-${Date.now()}`,
      importCode: nextImportCode,
      fileName: importFile?.name || 'import.xlsx',
      createdAt: stamp,
      createdBy: 'doi_tac_rsa',
      totalRows: previewRows.length,
      successRows: created.length,
      errorRows: errorCount,
      status: errorCount > 0 ? 'partial' : 'completed',
    };
    setBatches((prev) => [nextBatch, ...prev]);
    setPreviewRows([]);
    setImportFile(null);
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
    setSelectedBatch(nextBatch);
    setDetailTab(errorCount > 0 ? 'failed' : 'success');
    setPageView('batch-detail');
    flash(
      `Đã tạo ${created.length} gói cứu hộ (${nextImportCode}).${
        warnedImported ? ` ${warnedImported} dòng có cảnh báo đã tồn tại gói cứu hộ (BSX).` : ''
      }${errorCount ? ` ${errorCount} dòng lỗi có thể xem hoặc sao chép thành bản ghi mới.` : ''}`,
    );
  };

  const validateCopiedValues = (values: PackageImportValues) => {
    const errors = validateImportValues(values);
    const partner = values.partnerCode.trim().toUpperCase();
    const plate = values.plate.trim().toLowerCase();
    if (
      partner &&
      plate &&
      records.some((item) => item.partnerCode.toUpperCase() === partner && item.plate.toLowerCase() === plate)
    ) {
      errors.plate = 'Trùng biển số + đối tác';
    }
    return errors;
  };

  const openFailedLine = (line: PackageImportLine, mode: LineDialog['mode']) => {
    const values = { ...line.values };
    setLineDialog({
      mode,
      values,
      errors: mode === 'copy' ? validateCopiedValues(values) : { ...line.errors },
    });
  };

  const patchDraft = (_id: string, field: PackageImportField, value: string) => {
    setLineDialog((prev) => {
      if (!prev || prev.mode !== 'copy') return prev;
      const values = { ...prev.values, [field]: value };
      return { ...prev, values, errors: validateCopiedValues(values) };
    });
  };

  const saveCopiedRecord = () => {
    if (!lineDialog || lineDialog.mode !== 'copy' || !selectedBatch) return;
    const errors = validateCopiedValues(lineDialog.values);
    if (Object.keys(errors).length > 0) {
      setLineDialog({ ...lineDialog, errors });
      return;
    }
    const stamp = nowStamp();
    const pkg = lineDialog.values.packageCode.trim().toUpperCase();
    const effectiveDate = lineDialog.values.effectiveDate.trim();
    const expiryDate = addYearsToVnDate(effectiveDate, packageDurationYears(pkg));
    const purchaseCode = makePurchaseCode(0);
    const values: PackageImportValues = {
      ...lineDialog.values,
      partnerCode: lineDialog.values.partnerCode.trim().toUpperCase(),
      packageCode: pkg,
    };
    const status = resolvePackageStatus(expiryDate);
    const record: ImportedPackageRecord = {
      id: `imp-${Date.now()}`,
      purchaseCode,
      importCode: selectedBatch.importCode,
      ...values,
      expiryDate,
      status,
      createdAt: stamp,
      createdBy: 'doi_tac_rsa',
    };
    const successLine: PackageImportLine = {
      id: `line-${record.id}`,
      importCode: selectedBatch.importCode,
      result: 'success',
      values,
      errors: {},
      purchaseCode,
      expiryDate,
      status,
      createdAt: stamp,
      createdBy: 'doi_tac_rsa',
    };
    const nextBatch: PackageImportBatch = {
      ...selectedBatch,
      totalRows: selectedBatch.totalRows + 1,
      successRows: selectedBatch.successRows + 1,
      status: selectedBatch.errorRows > 0 ? 'partial' : 'completed',
    };
    setRecords((prev) => [record, ...prev]);
    setLines((prev) => [successLine, ...prev]);
    setBatches((prev) => prev.map((batch) => (batch.id === selectedBatch.id ? nextBatch : batch)));
    setSelectedBatch(nextBatch);
    setLineDialog(null);
    flash(`Đã tạo bản ghi mới ${purchaseCode}. Bản ghi thất bại gốc được giữ nguyên.`);
  };

  const hasActiveFilters =
    Boolean(purchaseCode.trim()) ||
    Boolean(importCode.trim()) ||
    Boolean(phone.trim()) ||
    Boolean(plate.trim());

  const handleClearFilters = () => {
    setPurchaseCode('');
    setImportCode('');
    setPhone('');
    setPlate('');
  };

  const viewBatch = (batch: PackageImportBatch) => {
    setSelectedBatch(batch);
    setDetailTab(batch.errorRows > 0 ? 'failed' : 'success');
    setPreviewRows([]);
    setPageView('batch-detail');
  };

  const openUpload = () => {
    setPageView('upload');
    setTab('import');
  };

  const closeUpload = () => {
    setPreviewRows([]);
    setImportFile(null);
    setFileError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const backToMain = () => {
    setPageView('main');
    setSelectedBatch(null);
    setLineDialog(null);
    closeUpload();
  };

  const copyFailedToImport = (batch: PackageImportBatch) => {
    const failed = lines.filter((item) => item.importCode === batch.importCode && item.result === 'failed');
    if (failed.length === 0) {
      flash('Không có bản ghi lỗi để sao chép.');
      return;
    }
    const preview = enrichPreviewRows(
      failed.map((item, index) => ({
        id: `copy-${Date.now()}-${index}`,
        values: { ...item.values },
        errors: validateImportValues(item.values),
      })),
      existingPlates,
    );
    const base = batch.fileName.replace(/\.[^.]+$/, '') || batch.importCode;
    setImportFile(new File([], `loi_${base}.xlsx`));
    setPreviewRows(preview);
    setFileError('');
    setLineDialog(null);
    setSelectedBatch(null);
    setPageView('upload');
    setTab('import');
    flash(`Đã sao chép ${failed.length} bản ghi thất bại sang kiểm tra dữ liệu.`);
  };

  const hasBatchFilters =
    Boolean(batchImportCode.trim()) ||
    Boolean(batchFileName.trim()) ||
    Boolean(batchStatus) ||
    Boolean(batchFromDate.trim()) ||
    Boolean(batchToDate.trim());

  const handleClearBatchFilters = () => {
    setBatchImportCode('');
    setBatchFileName('');
    setBatchStatus('');
    setBatchFromDate('');
    setBatchToDate('');
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      if (batchImportCode && !batch.importCode.toLowerCase().includes(batchImportCode.trim().toLowerCase())) return false;
      if (batchFileName && !batch.fileName.toLowerCase().includes(batchFileName.trim().toLowerCase())) return false;
      if (batchStatus && batch.status !== batchStatus) return false;
      if (!isStampInDateRange(batch.createdAt, batchFromDate, batchToDate)) return false;
      return true;
    });
  }, [batches, batchImportCode, batchFileName, batchStatus, batchFromDate, batchToDate]);

  const batchLines = useMemo(
    () => (selectedBatch ? lines.filter((line) => line.importCode === selectedBatch.importCode) : []),
    [lines, selectedBatch],
  );
  const failedLines = useMemo(() => batchLines.filter((line) => line.result === 'failed'), [batchLines]);
  const successLines = useMemo(() => batchLines.filter((line) => line.result === 'success'), [batchLines]);

  const filteredData = useMemo(() => {
    return records.filter((r) => {
      if (purchaseCode && !r.purchaseCode.toLowerCase().includes(purchaseCode.trim().toLowerCase())) return false;
      if (importCode && !r.importCode.toLowerCase().includes(importCode.trim().toLowerCase())) return false;
      if (phone && !r.phone.includes(phone.trim())) return false;
      if (plate && !r.plate.toLowerCase().includes(plate.trim().toLowerCase())) return false;
      return true;
    });
  }, [records, purchaseCode, importCode, phone, plate]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = buildPageItems(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [purchaseCode, importCode, phone, plate, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const exportExcel = () => {
    const rows = filteredData.map((r) => ({
      'Mã mua gói': r.purchaseCode,
      'Mã Import': r.importCode,
      'Mã đối tác': r.partnerCode,
      'Mã gói': r.packageCode,
      'Tên người thụ hưởng': r.beneficiaryName,
      'Số điện thoại': r.phone,
      'Địa chỉ': r.address,
      'Biển số xe': r.plate,
      'Số khung': r.vin,
      'Dòng xe': r.model,
      'Hãng xe': r.brand,
      'Trọng tải': r.payload,
      'Số chỗ': r.seats,
      'Loại xe': r.vehicleKind,
      'Ngày hiệu lực': r.effectiveDate,
      'Ngày hết hạn': r.expiryDate,
      'Trạng thái': STATUS_CONFIG[r.status].label,
      'Ngày tạo': r.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GoiDaImport');
    XLSX.writeFile(wb, 'danh-sach-goi-import.xlsx');
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
      {icon}
      <span>{title}</span>
    </div>
  );

  const inputClass = fieldInputClass;
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
  const primaryBtnClass =
    'flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const outlineBtnClass =
    'flex items-center space-x-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded font-bold text-sm hover:border-vetc-green hover:text-vetc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const renderFieldInput = (
    row: {
      id: string;
      values: PackageImportPreviewRow['values'];
      errors: PackageImportPreviewRow['errors'];
      warnings?: PackageImportPreviewRow['warnings'];
    },
    field: PackageImportField,
    onPatch: (id: string, field: PackageImportField, value: string) => void,
  ) => {
    const err = row.errors[field];
    const warn = !err ? row.warnings?.[field] : undefined;
    const common = err
      ? 'border-red-400 bg-red-50 focus:border-red-500'
      : warn
        ? 'border-amber-400 bg-amber-50 focus:border-amber-500'
        : '';
    if (field === 'partnerCode' || field === 'packageCode' || field === 'vehicleKind') {
      const options =
        field === 'partnerCode' ? PARTNER_OPTIONS : field === 'packageCode' ? PACKAGE_CODE_OPTIONS : VEHICLE_KIND_OPTIONS;
      return (
        <AppSelect
          searchable
          searchPlaceholder="Tìm kiếm..."
          options={options}
          value={row.values[field]}
          onChange={(next) => onPatch(row.id, field, next)}
          placeholder="Chọn giá trị"
          title={err || warn || FIELD_TO_HEADER[field]}
          className={common}
        />
      );
    }
    if (field === 'effectiveDate') {
      return (
        <DatePickerField
          value={row.values.effectiveDate}
          onChange={(next) => onPatch(row.id, field, next)}
          placeholder="dd/MM/yyyy"
          title={err || warn || FIELD_TO_HEADER[field]}
          inputClassName={common}
        />
      );
    }
    return (
      <input
        className={`${inputClass} ${common}`}
        value={row.values[field]}
        title={err || warn || FIELD_TO_HEADER[field]}
        onChange={(e) => onPatch(row.id, field, e.target.value)}
      />
    );
  };

  const renderPreviewInput = (row: PackageImportPreviewRow, field: PackageImportField) =>
    renderFieldInput(row, field, patchRow);

  const displayFieldValue = (field: PackageImportField, value: string) => {
    if (!value) return '—';
    const options =
      field === 'partnerCode' ? PARTNER_OPTIONS : field === 'packageCode' ? PACKAGE_CODE_OPTIONS : field === 'vehicleKind' ? VEHICLE_KIND_OPTIONS : null;
    return options?.find((item) => item.value === value)?.label || value;
  };

  const renderReadonlyField = (line: PackageImportLine, field: PackageImportField) => {
    const err = line.errors[field];
    return (
      <>
        <div className={`text-xs ${err ? 'text-red-700 font-semibold' : 'text-gray-800'}`} title={err || FIELD_TO_HEADER[field]}>
          {displayFieldValue(field, line.values[field])}
        </div>
        {err && <div className="text-[10px] text-red-600 font-semibold mt-0.5">{err}</div>}
      </>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          {(pageView === 'batch-detail' || pageView === 'upload') && (
            <button
              type="button"
              onClick={backToMain}
              className="mb-2 flex items-center gap-2 text-vetc-green font-bold text-sm hover:underline"
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </button>
          )}
          <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">
            {pageView === 'batch-detail'
              ? `Chi tiết lượt import ${selectedBatch?.importCode ?? ''}`
              : pageView === 'upload'
                ? previewRows.length > 0
                  ? 'Kiểm tra dữ liệu'
                  : 'Tải file Excel'
                : 'Import gói cứu hộ'}
          </h1>
          {pageView === 'upload' && previewRows.length > 0 && importFile && (
            <p className="text-xs text-gray-500 mt-0.5">{importFile.name}</p>
          )}
          {notice && <p className="text-sm text-vetc-green mt-1">{notice}</p>}
        </div>
        {pageView === 'main' && (
          <ScreenTabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'import', label: 'Import Excel' },
              { id: 'list', label: 'Gói cứu hộ' },
            ]}
          />
        )}
        {pageView === 'batch-detail' && selectedBatch && (
          <ScreenTabs
            value={detailTab}
            onChange={setDetailTab}
            items={[
              { id: 'failed', label: `Thất bại (${failedLines.length})` },
              { id: 'success', label: `Thành công (${successLines.length})` },
            ]}
          />
        )}
        {pageView === 'upload' && previewRows.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={downloadTemplate} className={outlineBtnClass}>
              <Download size={16} />
              <span>Tải file mẫu</span>
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} className={primaryBtnClass}>
              <Upload size={16} />
              <span>Chọn file Excel</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="*"
        className="hidden"
        onChange={(e) => {
          void onPickFile(e.target.files?.[0] ?? null);
        }}
      />

      {pageView === 'main' && tab === 'import' && (
        <>
          <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
            <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <label className={labelClass}>Mã Import</label>
                  <input
                    type="text"
                    value={batchImportCode}
                    onChange={(e) => setBatchImportCode(e.target.value)}
                    placeholder="Nhập mã import"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Tên file</label>
                  <input
                    type="text"
                    value={batchFileName}
                    onChange={(e) => setBatchFileName(e.target.value)}
                    placeholder="Nhập tên file"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Trạng thái</label>
                  <AppSelect
                    searchable
                    options={BATCH_STATUS_OPTIONS}
                    value={batchStatus}
                    onChange={setBatchStatus}
                    placeholder="Tất cả"
                    searchPlaceholder="Tìm trạng thái..."
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Ngày tạo</label>
                  <DateRangeField
                    from={batchFromDate}
                    to={batchToDate}
                    onChange={(nextFrom, nextTo) => {
                      setBatchFromDate(nextFrom);
                      setBatchToDate(nextTo);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={openUpload} className={primaryBtnClass}>
                  <Upload size={16} />
                  <span>Import Excel</span>
                </button>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button type="button" className={primaryBtnClass}>
                    <Search size={16} />
                    <span>Tìm kiếm</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearBatchFilters}
                    disabled={!hasBatchFilters}
                    className={outlineBtnClass}
                  >
                    <Trash2 size={14} />
                    <span>Xóa lọc</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
            <SectionHeader title="Danh sách lượt import" icon={<FileSpreadsheet size={16} />} />
            <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
              <table className="w-full text-xs border-separate border-spacing-0 min-w-[980px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600">
                    <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r">STT</th>
                    <th className="px-3 py-2 text-center w-24 font-bold border-r">Thao tác</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[140px]">Mã Import</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[220px]">Tên file</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-24">Tổng dòng</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-24">Hợp lệ</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-20">Lỗi</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-28">Trạng thái</th>
                    <th className="px-3 py-2 text-left font-bold w-40">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBatches.map((batch, index) => {
                    const batchStatusCfg = BATCH_STATUS_CONFIG[batch.status];
                    const isOddRow = index % 2 === 1;
                    const rowBgClass = isOddRow ? 'bg-gray-50' : 'bg-white';
                    return (
                      <tr
                        key={batch.id}
                        className={`transition-colors align-top hover:bg-gray-100 ${rowBgClass}`}
                      >
                        <td className="px-3 py-2 text-center border-r text-gray-600">{index + 1}</td>
                        <td className="px-3 py-2 border-r">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => viewBatch(batch)}
                              className="text-blue-500 hover:text-blue-700 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void copyFailedToImport(batch);
                              }}
                              disabled={batch.errorRows === 0}
                              className="text-blue-500 hover:text-blue-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                              title={batch.errorRows === 0 ? 'Không có bản ghi lỗi' : 'Sao chép bản ghi lỗi để import lại'}
                            >
                              <Copy size={15} />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r align-top">
                          <button
                            type="button"
                            onClick={() => viewBatch(batch)}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {batch.importCode}
                          </button>
                        </td>
                        <td className="px-3 py-2 border-r align-top font-medium text-gray-800">{batch.fileName}</td>
                        <td className="px-3 py-2 border-r align-top text-center">{batch.totalRows}</td>
                        <td className="px-3 py-2 border-r align-top text-center font-bold text-vetc-green">
                          {batch.successRows}
                        </td>
                        <td className="px-3 py-2 border-r align-top text-center font-bold text-red-600">
                          {batch.errorRows}
                        </td>
                        <td className="px-3 py-2 border-r align-top text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${batchStatusCfg.className}`}
                          >
                            {batchStatusCfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div>{batch.createdAt}</div>
                          <div className="text-gray-500 mt-0.5">{batch.createdBy}</div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBatches.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                        Không tìm thấy dữ liệu phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {pageView === 'batch-detail' && selectedBatch && (
        <>
          {detailTab === 'failed' && (
            <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
              <SectionHeader title="Danh sách thất bại" />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-600">
                  File <span className="font-bold">{selectedBatch.fileName}</span>
                  {failedLines.length > 0
                    ? ' — bản ghi thất bại chỉ xem. Sao chép để mở lại trên màn kiểm tra dữ liệu rồi import, hoặc sao chép từng dòng để tạo bản ghi mới.'
                    : ' — không còn bản ghi thất bại.'}
                </p>
                <button
                  type="button"
                  onClick={() => copyFailedToImport(selectedBatch)}
                  disabled={failedLines.length === 0}
                  className={outlineBtnClass}
                >
                  <Copy size={16} />
                  <span>Sao chép</span>
                </button>
              </div>
              <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
                <table className="w-full text-xs border-separate border-spacing-0 min-w-[1960px]">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600">
                      <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r sticky left-0 z-20 bg-gray-50">
                        STT
                      </th>
                      <th className="px-3 py-2 text-center w-24 font-bold border-r sticky left-10 z-20 bg-gray-50">
                        Thao tác
                      </th>
                      {IMPORT_FIELDS.map((field) => (
                        <th
                          key={field}
                          className={`px-3 py-2 text-left font-bold border-r whitespace-nowrap ${importFieldColClass(field)}`}
                        >
                          {FIELD_TO_HEADER[field]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {failedLines.map((line, index) => {
                      const rowBgClass = 'bg-red-50/40';
                      return (
                        <tr key={line.id} className={`transition-colors align-top ${rowBgClass}`}>
                          <td className={`px-3 py-2 text-center border-r text-gray-600 sticky left-0 z-20 ${rowBgClass}`}>
                            {index + 1}
                          </td>
                          <td className={`px-3 py-2 border-r sticky left-10 z-20 ${rowBgClass}`}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openFailedLine(line, 'view')}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                title="Xem"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => openFailedLine(line, 'copy')}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                                title="Sao chép thành bản ghi mới"
                              >
                                <Copy size={15} />
                              </button>
                            </div>
                          </td>
                          {IMPORT_FIELDS.map((field) => (
                            <td key={field} className={`px-3 py-2 border-r align-top ${importFieldColClass(field)}`}>
                              {renderReadonlyField(line, field)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                    {failedLines.length === 0 && (
                      <tr>
                        <td colSpan={15} className="px-3 py-8 text-center text-gray-400">
                          Không có bản ghi thất bại
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {detailTab === 'success' && (
            <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
              <SectionHeader title="Danh sách thành công" />
              <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
                <table className="w-full text-xs border-separate border-spacing-0 min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600">
                      <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r sticky left-0 z-20 bg-gray-50">
                        STT
                      </th>
                      <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Mã</th>
                      <th className="px-3 py-2 text-left font-bold border-r min-w-[120px]">Đối tác</th>
                      <th className="px-3 py-2 text-left font-bold border-r min-w-[140px]">Mã gói</th>
                      <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Người thụ hưởng</th>
                      <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Phương tiện</th>
                      <th className="px-3 py-2 text-center font-bold border-r w-28">Ngày hiệu lực</th>
                      <th className="px-3 py-2 text-center font-bold border-r w-28">Ngày hết hạn</th>
                      <th className="px-3 py-2 text-center font-bold border-r w-28">Trạng thái</th>
                      <th className="px-3 py-2 text-left font-bold w-36">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {successLines.map((line, index) => {
                      const statusKey = line.status ?? 'active';
                      const statusConfig = STATUS_CONFIG[statusKey];
                      const isOddRow = index % 2 === 1;
                      const rowBgClass = isOddRow ? 'bg-gray-50' : 'bg-white';
                      const stickyCellClass = `${rowBgClass} group-hover:bg-gray-100`;
                      return (
                        <tr
                          key={line.id}
                          className={`group transition-colors align-top hover:bg-gray-100 ${rowBgClass}`}
                        >
                          <td className={`px-3 py-2 text-center border-r text-gray-600 sticky left-0 z-20 ${stickyCellClass}`}>
                            {index + 1}
                          </td>
                          <td className="px-3 py-2 border-r align-top">
                            <div className="font-bold text-gray-800">{line.purchaseCode || '—'}</div>
                            <div className="text-[11px] text-blue-600 font-mono mt-0.5">{line.importCode}</div>
                          </td>
                          <td className="px-3 py-2 border-r align-top">
                            <div className="font-medium text-gray-800">{line.values.partnerCode}</div>
                          </td>
                          <td className="px-3 py-2 border-r align-top font-mono text-[11px]">{line.values.packageCode}</td>
                          <td className="px-3 py-2 border-r align-top">
                            <div className="font-medium text-gray-800">{line.values.beneficiaryName}</div>
                            <div className="text-gray-500 mt-0.5">{line.values.phone}</div>
                          </td>
                          <td className="px-3 py-2 border-r align-top">
                            <div className="font-bold text-gray-800">{line.values.plate}</div>
                            <div className="text-gray-600 mt-0.5">
                              {line.values.brand} · {line.values.model} · {line.values.vehicleKind} · {line.values.seats} chỗ · {line.values.payload} tấn
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r align-top text-center whitespace-nowrap">
                            {line.values.effectiveDate}
                          </td>
                          <td className="px-3 py-2 border-r align-top text-center whitespace-nowrap">{line.expiryDate}</td>
                          <td className="px-3 py-2 border-r align-top text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusConfig.className}`}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div>{line.createdAt}</div>
                            <div className="text-gray-500 mt-0.5">{line.createdBy}</div>
                          </td>
                        </tr>
                      );
                    })}
                    {successLines.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                          Không có bản ghi thành công
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {pageView === 'main' && tab === 'list' && (
        <>
          <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
            <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <label className={labelClass}>Mã mua gói</label>
                  <input
                    type="text"
                    value={purchaseCode}
                    onChange={(e) => setPurchaseCode(e.target.value)}
                    placeholder="Nhập mã mua gói"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Mã Import</label>
                  <input
                    type="text"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="Nhập mã import"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <label className={labelClass}>Biển số xe</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="Nhập biển số xe"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={exportExcel} className={primaryBtnClass}>
                  <FileSpreadsheet size={16} />
                  <span>Xuất Excel</span>
                </button>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button type="button" className={primaryBtnClass}>
                    <Search size={16} />
                    <span>Tìm kiếm</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className={outlineBtnClass}
                  >
                    <Trash2 size={14} />
                    <span>Xóa lọc</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
            <SectionHeader title="Danh sách gói thành công" />
            <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
              <table className="w-full text-xs border-separate border-spacing-0 min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-600">
                    <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r sticky left-0 z-20 bg-gray-50">
                      STT
                    </th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Mã</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[120px]">Đối tác</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[140px]">Mã gói</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[180px]">Người thụ hưởng</th>
                    <th className="px-3 py-2 text-left font-bold border-r min-w-[200px]">Phương tiện</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-28">Ngày hiệu lực</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-28">Ngày hết hạn</th>
                    <th className="px-3 py-2 text-center font-bold border-r w-28">Trạng thái</th>
                    <th className="px-3 py-2 text-left font-bold w-36">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((record, index) => {
                    const statusConfig = STATUS_CONFIG[record.status];
                    const isOddRow = index % 2 === 1;
                    const rowBgClass = isOddRow ? 'bg-gray-50' : 'bg-white';
                    const stickyCellClass = `${rowBgClass} group-hover:bg-gray-100`;
                    return (
                      <tr
                        key={record.id}
                        className={`group transition-colors align-top hover:bg-gray-100 ${rowBgClass}`}
                      >
                        <td className={`px-3 py-2 text-center border-r text-gray-600 sticky left-0 z-20 ${stickyCellClass}`}>
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-3 py-2 border-r align-top">
                          <div className="font-bold text-gray-800">{record.purchaseCode}</div>
                          <div className="text-[11px] text-blue-600 font-mono mt-0.5">{record.importCode}</div>
                        </td>
                        <td className="px-3 py-2 border-r align-top">
                          <div className="font-medium text-gray-800">{record.partnerCode}</div>
                        </td>
                        <td className="px-3 py-2 border-r align-top font-mono text-[11px]">{record.packageCode}</td>
                        <td className="px-3 py-2 border-r align-top">
                          <div className="font-medium text-gray-800">{record.beneficiaryName}</div>
                          <div className="text-gray-500 mt-0.5">{record.phone}</div>
                        </td>
                        <td className="px-3 py-2 border-r align-top">
                          <div className="font-bold text-gray-800">{record.plate}</div>
                          <div className="text-gray-600 mt-0.5">
                            {record.brand} · {record.model} · {record.vehicleKind} · {record.seats} chỗ · {record.payload} tấn
                          </div>
                        </td>
                        <td className="px-3 py-2 border-r align-top text-center whitespace-nowrap">{record.effectiveDate}</td>
                        <td className="px-3 py-2 border-r align-top text-center whitespace-nowrap">{record.expiryDate}</td>
                        <td className="px-3 py-2 border-r align-top text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div>{record.createdAt}</div>
                          <div className="text-gray-500 mt-0.5">{record.createdBy}</div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                        Không tìm thấy dữ liệu phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50/50">
              <span className="text-xs text-gray-500">
                Đang xem {rangeStart} đến {rangeEnd} trong {totalItems} mục
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {pageItems.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                        currentPage === item
                          ? 'bg-vetc-green text-white shadow-sm'
                          : 'bg-white border text-gray-600 hover:border-vetc-green'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border bg-white disabled:opacity-40 hover:border-vetc-green transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-xs bg-white outline-none focus:border-vetc-green"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {pageView === 'upload' && (
        <>
          {previewRows.length === 0 && (
            <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
              <SectionHeader title="Tải file Excel" icon={<Upload size={16} />} />
              <div className="p-4 space-y-4">
                <p className="text-xs text-gray-500">
                  Cột bắt buộc: {PACKAGE_IMPORT_HEADERS.join(', ')}. Mã gói hợp lệ:{' '}
                  {PACKAGE_IMPORT_CODES.map((p) => p.value).join(', ')}. Mã đối tác:{' '}
                  {PACKAGE_IMPORT_PARTNERS.map((p) => p.value).join(', ')}.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <button type="button" onClick={downloadTemplate} className={outlineBtnClass}>
                    <Download size={16} />
                    <span>Tải file mẫu</span>
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()} className={primaryBtnClass}>
                    <Upload size={16} />
                    <span>Chọn file Excel</span>
                  </button>
                </div>
                {fileError && (
                  <p className="rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{fileError}</p>
                )}
              </div>
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="border rounded-lg shadow-sm bg-white w-full min-w-0 overflow-hidden">
              {fileError && (
                <p className="mx-4 mt-4 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{fileError}</p>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-vetc-green">{validCount} dòng hợp lệ</span>
                  {errorCount > 0 && (
                    <>
                      {' · '}
                      <span className="font-bold text-red-600">{errorCount} dòng lỗi</span>
                    </>
                  )}
                  {warningCount > 0 && (
                    <>
                      {' · '}
                      <span className="font-bold text-amber-600">{warningCount} dòng cảnh báo BSX</span>
                    </>
                  )}
                  {(errorCount > 0 || warningCount > 0) && (
                    <span className="text-gray-500"> — cảnh báo BSX vẫn có thể tạo gói nếu giữ nguyên.</span>
                  )}
                </p>
                <button type="button" onClick={confirmImport} disabled={validCount === 0} className={primaryBtnClass}>
                  <FileSpreadsheet size={16} />
                  <span>Tạo gói cứu hộ</span>
                </button>
              </div>
              <div className="w-full overflow-x-auto overscroll-x-contain custom-scrollbar isolate">
                <table className="w-full text-xs border-separate border-spacing-0 min-w-[2280px]">
                  <thead>
                    <tr className="bg-gray-50 border-b text-gray-600">
                      <th className="px-3 py-2 text-center w-10 min-w-[40px] font-bold border-r sticky left-0 z-30 bg-gray-50">
                        STT
                      </th>
                      <th className="px-3 py-2 text-center w-20 min-w-[72px] font-bold border-r sticky left-10 z-30 bg-gray-50 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">
                        Kết quả
                      </th>
                      <th className="px-3 py-2 text-center w-16 min-w-[56px] font-bold border-r sticky left-[112px] z-30 bg-gray-50 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">
                        Thao tác
                      </th>
                      {IMPORT_FIELDS.map((field) => (
                        <th
                          key={field}
                          className={`px-3 py-2 text-left font-bold border-r whitespace-nowrap ${importFieldColClass(field)}`}
                        >
                          {FIELD_TO_HEADER[field]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, index) => {
                      const invalid = rowHasError(row);
                      const hasWarning = Boolean(!invalid && row.warnings?.plate);
                      const isOddRow = index % 2 === 1;
                      const rowBgClass = invalid
                        ? 'bg-red-50/40'
                        : hasWarning
                          ? 'bg-amber-50/30'
                          : isOddRow
                            ? 'bg-gray-50'
                            : 'bg-white';
                      const stickyCellClass = `${rowBgClass} group-hover:bg-gray-100`;
                      return (
                        <tr key={row.id} className={`group transition-colors align-top hover:bg-gray-100 ${rowBgClass}`}>
                          <td className={`px-3 py-2 text-center border-r text-gray-600 sticky left-0 z-20 ${stickyCellClass}`}>
                            {index + 1}
                          </td>
                          <td
                            className={`px-3 py-2 border-r text-center whitespace-nowrap font-bold sticky left-10 z-20 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${stickyCellClass} ${
                              invalid ? 'text-red-600' : hasWarning ? 'text-amber-600' : 'text-vetc-green'
                            }`}
                          >
                            {invalid ? 'Lỗi' : hasWarning ? 'Cảnh báo' : 'Hợp lệ'}
                          </td>
                          <td
                            className={`px-3 py-2 border-r text-center sticky left-[112px] z-20 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] ${stickyCellClass}`}
                          >
                            <button
                              type="button"
                              onClick={() => deletePreviewRow(row.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Xóa dòng"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                          {IMPORT_FIELDS.map((field) => (
                            <td key={field} className={`px-3 py-2 border-r align-top ${importFieldColClass(field)}`}>
                              {renderPreviewInput(row, field)}
                              {row.errors[field] && (
                                <div className="text-[10px] text-red-600 font-semibold mt-0.5">{row.errors[field]}</div>
                              )}
                              {!row.errors[field] && row.warnings?.[field] && (
                                <div className="text-[10px] text-amber-600 font-semibold mt-0.5">{row.warnings[field]}</div>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {lineDialog && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setLineDialog(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                {lineDialog.mode === 'view' ? 'Chi tiết bản ghi thất bại' : 'Tạo bản ghi mới'}
              </h2>
              <button type="button" onClick={() => setLineDialog(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {lineDialog.mode === 'copy' && (
                <p className="text-xs text-gray-500 mb-4">
                  Dữ liệu được sao chép từ bản ghi thất bại. Sửa các trường lỗi rồi tạo bản ghi mới — bản ghi gốc không đổi.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {IMPORT_FIELDS.map((field) => {
                  const err = lineDialog.errors[field];
                  return (
                    <div key={field} className={field === 'address' ? 'sm:col-span-2 lg:col-span-3' : ''}>
                      <label className={labelClass}>{FIELD_TO_HEADER[field]}</label>
                      {lineDialog.mode === 'copy' ? (
                        <>
                          {renderFieldInput(
                            { id: 'draft', values: lineDialog.values, errors: lineDialog.errors },
                            field,
                            patchDraft,
                          )}
                          {err && <div className="text-[10px] text-red-600 font-semibold mt-0.5">{err}</div>}
                        </>
                      ) : (
                        <>
                          <div
                            className={`w-full border rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-800 min-h-[34px] ${
                              err ? 'border-red-400 text-red-700' : 'border-gray-200'
                            }`}
                          >
                            {displayFieldValue(field, lineDialog.values[field])}
                          </div>
                          {err && <div className="text-[10px] text-red-600 font-semibold mt-0.5">{err}</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
              <button type="button" onClick={() => setLineDialog(null)} className={outlineBtnClass}>
                <span>{lineDialog.mode === 'view' ? 'Đóng' : 'Hủy'}</span>
              </button>
              {lineDialog.mode === 'copy' && (
                <button
                  type="button"
                  onClick={saveCopiedRecord}
                  disabled={Object.keys(lineDialog.errors).length > 0}
                  className={primaryBtnClass}
                >
                  <Copy size={16} />
                  <span>Tạo bản ghi mới</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PackageImportManagement;
