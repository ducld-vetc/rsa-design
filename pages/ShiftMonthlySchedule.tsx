import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Loader2,
  Settings2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  computeDailySummaryStats,
  computeSessionSummaryStats,
  MOCK_EXCEL_IMPORT_PREVIEW,
  formatShiftTimeLabel,
  getDaysInMonth,
  getStaffingShiftsForRole,
  type MonthlyEmployee,
  type ShiftDayWarning,
  type ShiftDefinition,
  type ShiftRole,
} from '../data/shiftConfigMockData';
import type { AutoScheduleResult } from '../data/autoScheduleEngine';
import { formatShiftUnits, getShiftWorkloadUnits, isOvertimeShift } from '../data/autoScheduleEngine';
import { useShiftConfig } from '../context/ShiftConfigContext';
import EmployeeShiftPreferenceModal from '../components/EmployeeShiftPreferenceModal';

const WARNING_META: Record<
  ShiftDayWarning['type'],
  { label: string; chip: string; cell: string; dot: string; summary: string }
> = {
  UNDERSTAFFED: {
    label: 'Thiếu',
    chip: 'bg-red-100 text-red-700 border-red-200',
    cell: 'bg-red-100 text-red-900 border-red-300 ring-1 ring-red-300',
    dot: 'bg-red-500',
    summary: 'bg-red-50 border-red-200 text-red-800',
  },
  OVERSTAFFED: {
    label: 'Thừa',
    chip: 'bg-orange-100 text-orange-700 border-orange-200',
    cell: 'bg-orange-100 text-orange-900 border-orange-300 ring-1 ring-orange-300',
    dot: 'bg-orange-500',
    summary: 'bg-orange-50 border-orange-200 text-orange-800',
  },
  ALL_NEW: {
    label: 'NV mới',
    chip: 'bg-purple-100 text-purple-700 border-purple-200',
    cell: 'bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-300',
    dot: 'bg-purple-500',
    summary: 'bg-purple-50 border-purple-200 text-purple-800',
  },
};

const primaryWarning = (warnings: ShiftDayWarning[]): ShiftDayWarning | null => {
  if (warnings.some((w) => w.type === 'UNDERSTAFFED')) {
    return warnings.find((w) => w.type === 'UNDERSTAFFED') ?? null;
  }
  if (warnings.some((w) => w.type === 'OVERSTAFFED')) {
    return warnings.find((w) => w.type === 'OVERSTAFFED') ?? null;
  }
  if (warnings.some((w) => w.type === 'ALL_NEW')) {
    return warnings.find((w) => w.type === 'ALL_NEW') ?? null;
  }
  return null;
};

const ShiftMonthlySchedule: React.FC = () => {
  const {
    getShiftDefinitionsForRole,
    computeWarnings,
    computeSlotStats,
    buildEmployees,
    runAutoScheduleForMonth,
    getMinShiftUnitsFromBe,
    updateShiftMonthPreference,
    getShiftMonthPreferenceFor,
  } = useShiftConfig();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<ShiftRole>('OSA');
  const [yearMonth, setYearMonth] = useState('2026-07');
  const [employees, setEmployees] = useState<MonthlyEmployee[]>(() =>
    buildEmployees('OSA', '2026-07')
  );
  const [previewEmployees, setPreviewEmployees] = useState<MonthlyEmployee[] | null>(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const [uploadProcessingFileName, setUploadProcessingFileName] = useState('');
  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    day: number;
    anchorTop: number;
    anchorLeft: number;
  } | null>(null);
  const [autoResult, setAutoResult] = useState<AutoScheduleResult | null>(null);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [autoStep, setAutoStep] = useState<'idle' | 'action1_done' | 'action2_done'>('idle');
  const [pendingAutoAction, setPendingAutoAction] = useState<1 | 2 | null>(null);

  const minShiftUnits = getMinShiftUnitsFromBe(role);

  const daysInMonth = getDaysInMonth(yearMonth);
  const dayNumbers = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = yearMonth === currentYearMonth;
  const weekdayLabels = useMemo(() => {
    const [y, m] = yearMonth.split('-').map(Number);
    const map = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const out = new Map<number, string>();
    dayNumbers.forEach((d) => {
      out.set(d, map[new Date(y, m - 1, d).getDay()]);
    });
    return out;
  }, [dayNumbers, yearMonth]);

  const shiftDefinitions = useMemo(() => getShiftDefinitionsForRole(role), [getShiftDefinitionsForRole, role]);
  const staffingShifts = useMemo(() => getStaffingShiftsForRole(role), [role]);
  const fullShifts = useMemo(() => staffingShifts.filter((s) => s.staffingGroup === 'FULL'), [staffingShifts]);
  const requiredBySession = useMemo(() => {
    const c1 = fullShifts.find((s) => s.shiftKey === 'C1')?.minStaff ?? 0;
    const c2 = fullShifts.find((s) => s.shiftKey === 'C2')?.minStaff ?? 0;
    const c3 = fullShifts.find((s) => s.shiftKey === 'C3')?.minStaff ?? 0;
    return { morning: c1, afternoon: c2, night: c3, total: c1 + c2 + c3 };
  }, [fullShifts]);
  const shiftKeys = useMemo(() => shiftDefinitions.map((s) => s.shiftKey), [shiftDefinitions]);
  const shiftByKey = useMemo(
    () => new Map(shiftDefinitions.map((s) => [s.shiftKey, s])),
    [shiftDefinitions]
  );
  const hasOvertimeShift = useMemo(
    () => shiftDefinitions.some((s) => isOvertimeShift(s)),
    [shiftDefinitions]
  );

  const countEmployeeUnits = (emp: MonthlyEmployee) => {
    let total = 0;
    Object.values(emp.assignments).forEach((key) => {
      if (!key) return;
      const shift = shiftByKey.get(key);
      if (shift) total += getShiftWorkloadUnits(shift);
    });
    return total;
  };

  const getShiftCellClass = (shiftKey: string | null, warn: ShiftDayWarning | null) => {
    if (!shiftKey) return 'text-gray-300 hover:bg-gray-100 border border-transparent';
    if (warn) return WARNING_META[warn.type].cell;
    const primaryKey = shiftKey.split('+')[0]?.trim();
    const def = primaryKey ? shiftByKey.get(primaryKey) : undefined;
    if (isOvertimeShift(def)) {
      return 'bg-orange-100 text-orange-900 border border-orange-300 hover:bg-orange-200 ring-1 ring-orange-200';
    }
    if (def?.isNightShift) {
      return 'bg-indigo-100 text-indigo-900 border border-indigo-200 hover:bg-indigo-200';
    }
    return 'bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100';
  };

  const warnings = useMemo(
    () => computeWarnings(role, yearMonth, employees),
    [computeWarnings, role, yearMonth, employees]
  );

  const shiftCoverageStats = useMemo(
    () => computeSlotStats(role, yearMonth, employees),
    [computeSlotStats, role, yearMonth, employees]
  );
  const dailySummaryStats = useMemo(
    () => computeDailySummaryStats(role, yearMonth, employees),
    [role, yearMonth, employees]
  );
  const sessionSummaryStats = useMemo(
    () => computeSessionSummaryStats(role, yearMonth, employees),
    [role, yearMonth, employees]
  );

  const sessionSummaryChips = useMemo(() => {
    let understaffed = 0;
    let overstaffed = 0;
    let ok = 0;
    dayNumbers.forEach((day) => {
      const stat = sessionSummaryStats.get(day);
      if (!stat) return;
      const sessions = [
        { value: stat.morning, required: stat.requiredMorning },
        { value: stat.afternoon, required: stat.requiredAfternoon },
        { value: stat.night, required: stat.requiredNight },
      ];
      sessions.forEach(({ value, required }) => {
        if (value < required) understaffed += 1;
        else if (value > required) overstaffed += 1;
        else ok += 1;
      });
    });
    return { understaffed, overstaffed, ok };
  }, [dayNumbers, sessionSummaryStats]);

  const handleRoleChange = (r: ShiftRole) => {
    setRole(r);
    setEmployees(buildEmployees(r, yearMonth));
    setEditingCell(null);
    setAutoStep('idle');
  };

  const handleMonthChange = (value: string) => {
    setYearMonth(value);
    setEmployees(buildEmployees(role, value));
    setEditingCell(null);
    setAutoStep('idle');
  };

  const handleRunAutoSchedule = (action: 1 | 2) => {
    const result = runAutoScheduleForMonth(
      role,
      yearMonth,
      employees,
      action === 1 ? 'ACTION1_DEFAULT' : 'ACTION2_SPLIT_TOPUP'
    );
    setPendingAutoAction(action);
    setAutoResult(result);
    setIsAutoModalOpen(true);
  };

  const handleConfirmAutoSchedule = () => {
    if (autoResult) setEmployees(autoResult.employees);
    if (pendingAutoAction === 1) setAutoStep('action1_done');
    if (pendingAutoAction === 2) setAutoStep('action2_done');
    setIsAutoModalOpen(false);
    setAutoResult(null);
    setPendingAutoAction(null);
  };

  const handleFileSelected = async (file: File) => {
    setUploadProcessingFileName(file.name);
    setIsUploadProcessing(true);
    try {
      setPreviewFileName(file.name);
      const mockRows = MOCK_EXCEL_IMPORT_PREVIEW[role];
      // Demo preview theo đầy đủ roster hiện tại (không còn chỉ 2 dòng mock),
      // giữ số lượng NV thực tế để người dùng dễ đối chiếu trước khi confirm.
      const merged = employees.map((emp, idx) => {
        const mock = mockRows[idx % mockRows.length];
        return {
          ...emp,
          assignments: { ...mock.assignments },
        };
      });
      await new Promise((resolve) => setTimeout(resolve, 700));
      setPreviewEmployees(merged);
      setIsPreviewOpen(true);
    } finally {
      setIsUploadProcessing(false);
      setUploadProcessingFileName('');
    }
  };

  const handleConfirmImport = () => {
    const baseWarning =
      `Bạn sắp áp dụng lịch upload lên hệ thống.\n` +
      `Thao tác này sẽ ảnh hưởng đến ca hiện tại của nhân viên (${previewImpact.changedEmployees} NV, ${previewImpact.changedCells} ô thay đổi).`;
    if (previewImpact.changedPastOrToday > 0) {
      const ok = window.confirm(
        `${baseWarning}\n` +
        `Có ${previewImpact.changedPastOrToday} thay đổi vào ngày đã/đang diễn ra. Bạn vẫn muốn tiếp tục?`
      );
      if (!ok) return;
    } else {
      const ok = window.confirm(`${baseWarning}\nBạn có chắc muốn xác nhận import?`);
      if (!ok) return;
    }
    if (previewEmployees) setEmployees(previewEmployees);
    setIsPreviewOpen(false);
    setPreviewEmployees(null);
    setAutoStep('idle');
  };

  const updateAssignment = (
    employeeId: string,
    day: number,
    shiftKey: string | null,
    closeEditor = true
  ) => {
    if (isCurrentMonth && day <= now.getDate()) {
      const ok = window.confirm(
        `Ngày ${day} là ngày đã/đang diễn ra. Bạn có chắc muốn điều chỉnh ca?`
      );
      if (!ok) return;
    }
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, assignments: { ...e.assignments, [day]: shiftKey || null } }
          : e
      )
    );
    if (closeEditor) setEditingCell(null);
    setAutoStep('idle');
  };

  const parseAssignmentKeys = (raw: string | null): string[] =>
    raw ? raw.split('+').map((s) => s.trim()).filter(Boolean) : [];

  const previewImpact = useMemo(() => {
    if (!previewEmployees) return { changedEmployees: 0, changedCells: 0, changedPastOrToday: 0 };
    const currentByCode = new Map(employees.map((e) => [e.code, e]));
    let changedEmployees = 0;
    let changedCells = 0;
    let changedPastOrToday = 0;
    previewEmployees.forEach((p) => {
      const current = currentByCode.get(p.code);
      if (!current) return;
      let empChanged = false;
      dayNumbers.forEach((day) => {
        const before = current.assignments[day] ?? null;
        const after = p.assignments[day] ?? null;
        if (before !== after) {
          changedCells += 1;
          empChanged = true;
          if (isCurrentMonth && day <= now.getDate()) changedPastOrToday += 1;
        }
      });
      if (empChanged) changedEmployees += 1;
    });
    return { changedEmployees, changedCells, changedPastOrToday };
  }, [previewEmployees, employees, dayNumbers, isCurrentMonth, now]);

  const previewDailyByShiftKey = useMemo(() => {
    if (!previewEmployees) return [];
    const keys = shiftKeys.filter((k) => k !== 'OT');
    return dayNumbers.map((day) => {
      const counts: Record<string, number> = {};
      keys.forEach((k) => {
        counts[k] = 0;
      });
      previewEmployees.forEach((emp) => {
        const raw = emp.assignments[day];
        if (!raw) return;
        raw
          .split('+')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((k) => {
            if (counts[k] !== undefined) counts[k] += 1;
          });
      });
      return { day, counts };
    });
  }, [previewEmployees, dayNumbers, shiftKeys]);

  const previewSessionSummary = useMemo(() => {
    return dayNumbers.map((day) => {
      const dayData = previewDailyByShiftKey.find((x) => x.day === day)?.counts ?? {};
      const morning =
        (dayData.C1 ?? 0) +
        ((dayData.CG1 ?? 0) + (dayData.CG2 ?? 0)) * 0.5;
      const afternoon =
        (dayData.C2 ?? 0) +
        ((dayData.CG3 ?? 0) + (dayData.CG4 ?? 0) + (dayData.CG5 ?? 0) + (dayData.CG6 ?? 0)) * 0.5;
      const night = dayData.C3 ?? 0;
      return { day, morning, afternoon, night, total: morning + afternoon + night };
    });
  }, [dayNumbers, previewDailyByShiftKey]);

  const getShiftCoverageStat = (day: number, shiftKey: string) =>
    shiftCoverageStats.get(`${day}-${shiftKey}`);

  const getDailySummaryStat = (day: number) => dailySummaryStats.get(day);
  const getSessionSummaryStat = (day: number) => sessionSummaryStats.get(day);

  const renderCoverageCell = (shift: ShiftDefinition, day: number) => {
    const stat = getShiftCoverageStat(day, shift.shiftKey);
    if (!stat) return <td key={day} className="border-r" />;

    const warn = primaryWarning(stat.warnings);
    const delta =
      warn?.type === 'UNDERSTAFFED'
        ? stat.assigned - stat.minStaff
        : warn?.type === 'OVERSTAFFED'
          ? stat.assigned - stat.maxStaff
          : 0;
    const isOk = !warn && stat.assigned >= stat.minStaff && stat.assigned <= stat.maxStaff;

    return (
      <td key={day} className="border-r px-0.5 py-0.5">
        <div
          className={`h-9 rounded flex flex-col items-center justify-center leading-none ${
            warn
              ? `${WARNING_META[warn.type].summary} border`
              : isOk
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : stat.assigned === 0
                  ? 'bg-gray-50 text-gray-300 border border-gray-100'
                  : 'bg-white text-gray-600 border border-gray-200'
          }`}
          title={
            stat.warnings.map((w) => w.message).join('\n') ||
            `${shift.shiftKey}: ${stat.assigned} người (cần ${stat.minStaff}–${stat.maxStaff})`
          }
        >
          <span className="font-mono text-[11px] font-black">{stat.assigned}</span>
          {warn ? (
            <span className="flex items-center gap-0.5 mt-0.5 text-[8px] font-bold">
              <AlertTriangle size={8} />
              {delta > 0 ? `+${delta}` : delta}
            </span>
          ) : isOk ? (
            <span className="text-[7px] text-emerald-600 mt-0.5">OK</span>
          ) : stat.assigned > 0 ? (
            <span className="text-[7px] text-gray-400 mt-0.5">
              /{stat.minStaff}
            </span>
          ) : null}
        </div>
      </td>
    );
  };

  const renderDailySummaryCell = (day: number) => {
    const stat = getDailySummaryStat(day);
    if (!stat) return <td key={day} className="border-r" />;
    const hasShortage = stat.shortage > 0;
    return (
      <td key={day} className="border-r px-0.5 py-0.5">
        <div
          className={`h-9 rounded flex flex-col items-center justify-center leading-none border ${
            hasShortage
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}
          title={
            hasShortage
              ? `Tổng quy đổi thiếu ${formatShiftUnits(stat.shortage)} (${formatShiftUnits(stat.totalEquivalent)}/${formatShiftUnits(stat.totalRequired)})`
              : `Đủ tổng quy đổi (${formatShiftUnits(stat.totalEquivalent)}/${formatShiftUnits(stat.totalRequired)})`
          }
        >
          <span className="font-mono text-[10px] font-black">
            {formatShiftUnits(stat.totalEquivalent)}/{formatShiftUnits(stat.totalRequired)}
          </span>
          <span className="text-[8px] mt-0.5">
            {hasShortage ? `-${formatShiftUnits(stat.shortage)}` : 'OK'}
          </span>
        </div>
      </td>
    );
  };

  const monthLabel = `${yearMonth.slice(5, 7)}/${yearMonth.slice(0, 4)}`;

  const handleReloadDemo = () => {
    setEmployees(buildEmployees(role, yearMonth));
    setEditingCell(null);
    setAutoStep('idle');
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 w-full min-w-0 max-w-full font-['Inter']">
      {/* Compact header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">
            Lịch ca tháng {monthLabel}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Tổng hợp theo buổi: ca gãy = 0.5, ca nguyên = 1
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:border-vetc-green"
          >
            <Download size={13} />
            Tải mẫu
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadProcessing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
              isUploadProcessing
                ? 'bg-green-400 text-white cursor-not-allowed'
                : 'bg-vetc-green text-white hover:bg-green-700'
            }`}
          >
            {isUploadProcessing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {isUploadProcessing ? 'Đang xử lý...' : 'Upload Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <EmployeeShiftPreferenceModal
        open={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        role={role}
        yearMonth={yearMonth}
        shiftKeys={shiftKeys}
        roster={employees}
        getPreference={(employeeId, shiftKey) =>
          getShiftMonthPreferenceFor(role, yearMonth, employeeId, shiftKey)
        }
        onUpdatePreference={(employeeId, shiftKey, patch) =>
          updateShiftMonthPreference(role, yearMonth, employeeId, shiftKey, patch)
        }
      />

      {/* Main grid card */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        {/* Toolbar: filters + compact stats */}
        <div className="px-3 py-2 border-b bg-gray-50 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5">
            {(['OSA', 'CSKH'] as ShiftRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black border transition-all ${
                  role === r
                    ? 'bg-vetc-green text-white border-vetc-green'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <input
            type="month"
            value={yearMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="border rounded px-2 py-1 text-xs outline-none focus:border-vetc-green bg-white"
          />

          <button
            type="button"
            onClick={() => setIsPrefModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black border border-gray-200 bg-white text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-all"
          >
            <Settings2 size={11} />
            Mong muốn theo ca
          </button>
          <button
            type="button"
            onClick={() => handleRunAutoSchedule(1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <Sparkles size={11} />
            Sắp xếp ca mặc định
          </button>
          <button
            type="button"
            onClick={() => handleRunAutoSchedule(2)}
            disabled={autoStep !== 'action1_done'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black transition-all ${
              autoStep === 'action1_done'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={autoStep === 'action1_done' ? 'Bù ca gãy cho phần còn thiếu' : 'Cần áp dụng Action 1 trước'}
          >
            <Sparkles size={11} />
            Bổ sung ca gãy
          </button>

          <div className="h-4 w-px bg-gray-300 hidden sm:block ml-auto" />

          {/* Compact inline stats */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${WARNING_META.UNDERSTAFFED.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${WARNING_META.UNDERSTAFFED.dot}`} />
              Thiếu {sessionSummaryChips.understaffed}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${WARNING_META.OVERSTAFFED.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${WARNING_META.OVERSTAFFED.dot}`} />
              Thừa {sessionSummaryChips.overstaffed}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${WARNING_META.ALL_NEW.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${WARNING_META.ALL_NEW.dot}`} />
              Đủ {sessionSummaryChips.ok}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="px-3 py-1.5 border-b flex flex-wrap items-center gap-3 text-[9px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${WARNING_META.UNDERSTAFFED.summary}`} /> Thiếu người
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-sm ${WARNING_META.OVERSTAFFED.summary}`} /> Thừa người
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-indigo-200 border border-indigo-300" /> Ca đêm
          </span>
          {hasOvertimeShift && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-orange-200 border border-orange-300" /> Ca OT
            </span>
          )}
          <span className="text-gray-400">| Tổng buổi = ca gãy x 0.5 + ca nguyên x 1</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-220px)]">
          <table className="text-xs min-w-max border-collapse">
            <thead className="sticky top-0 z-30">
              <tr className="bg-gray-100 text-[10px] font-black text-gray-500 uppercase">
                <th className="sticky left-0 z-40 bg-gray-100 border-b border-r px-3 py-2 min-w-[160px] text-left">
                  Nhân viên
                </th>
                {dayNumbers.map((day) => (
                  <th key={day} className="border-b border-r px-0.5 py-1 min-w-[52px] text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{day}</span>
                      <span className="text-[8px] text-gray-400">{weekdayLabels.get(day)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Employee rows */}
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50/40">
                  <td className="sticky left-0 z-20 bg-white border-r px-3 py-1.5">
                    <div className="font-bold text-gray-800 text-[11px] leading-tight">{emp.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono text-[9px] text-gray-400">{emp.code}</span>
                      {emp.isNewEmployee && (
                        <span className="px-1 rounded bg-purple-50 text-purple-600 text-[7px] font-black border border-purple-100">
                          MỚI
                        </span>
                      )}
                      <span className="px-1 rounded bg-slate-100 text-slate-600 text-[7px] font-bold border border-slate-200">
                        {formatShiftUnits(countEmployeeUnits(emp))}/{formatShiftUnits(minShiftUnits)} ca
                      </span>
                    </div>
                  </td>
                      {dayNumbers.map((day) => {
                        const shiftKey = emp.assignments[day];
                        const warn: ShiftDayWarning | null = null;
                    const isEditing =
                      editingCell?.employeeId === emp.id && editingCell?.day === day;

                    return (
                      <td key={day} className="border-r px-0.5 py-0.5 p-0">
                        {isEditing ? null : (
                          <button
                            type="button"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setEditingCell({
                                employeeId: emp.id,
                                day,
                                anchorTop: Math.max(8, rect.top - 140),
                                anchorLeft: rect.left,
                              });
                            }}
                            className={`relative w-full h-9 rounded font-mono font-bold text-[10px] transition-colors ${getShiftCellClass(shiftKey, warn)}`}
                            title={
                              shiftKey
                                ? `${(() => {
                                    const first = shiftByKey.get(shiftKey.split('+')[0]?.trim() ?? '');
                                    return `${first?.isOvertime ? 'Ca OT — ' : ''}${first?.isNightShift ? 'Ca đêm — ' : ''}`;
                                  })()}Ca ${shiftKey} — bấm để sửa`
                                : 'Bấm để gán ca'
                            }
                          >
                            {shiftKey ?? '·'}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Tổng hợp theo buổi */}
              <tr>
                <td
                  colSpan={dayNumbers.length + 1}
                  className="sticky left-0 bg-slate-100 border-y border-slate-200 px-3 py-1 text-[9px] font-black text-slate-600 uppercase tracking-wider"
                >
                  Tổng hợp theo buổi / ngày
                  <span className="ml-2 font-normal normal-case text-slate-500">
                    — cộng cả ca gãy và ca nguyên (0.5 / 1)
                  </span>
                </td>
              </tr>

              {[
                {
                  key: 'morning',
                  label: 'Buổi sáng',
                  requiredKey: 'requiredMorning',
                  shortageKey: 'shortageMorning',
                },
                {
                  key: 'afternoon',
                  label: 'Buổi chiều',
                  requiredKey: 'requiredAfternoon',
                  shortageKey: 'shortageAfternoon',
                },
                {
                  key: 'night',
                  label: 'Buổi đêm',
                  requiredKey: 'requiredNight',
                  shortageKey: 'shortageNight',
                },
              ].map((session) => (
                <tr key={session.key} className="border-b bg-slate-50/40">
                  <td className="sticky left-0 z-20 bg-slate-50 border-r px-3 py-1">
                    <div className="font-black text-[10px] text-slate-800">{session.label}</div>
                    <div className="text-[8px] text-slate-500">Ca gãy = 0.5, ca nguyên = 1</div>
                  </td>
                  {dayNumbers.map((day) => {
                    const stat = getSessionSummaryStat(day);
                    const value = stat?.[session.key as keyof typeof stat] ?? 0;
                    const required = stat?.[session.requiredKey as keyof typeof stat] ?? 0;
                    const shortage = stat?.[session.shortageKey as keyof typeof stat] ?? 0;
                    const hasShortage = Number(shortage) > 0;
                    const over = Number(value) - Number(required);
                    const hasOver = !hasShortage && over > 0;
                    return (
                      <td key={day} className="border-r px-0.5 py-0.5">
                        <div
                          className={`h-9 rounded border flex flex-col items-center justify-center font-mono text-[10px] font-black ${
                            hasShortage
                              ? 'bg-red-50 border-red-200 text-red-800'
                              : hasOver
                                ? 'bg-orange-50 border-orange-200 text-orange-800'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                          title={
                            hasShortage
                              ? `${session.label}: thiếu ${formatShiftUnits(Number(shortage))} (${formatShiftUnits(Number(value))}/${formatShiftUnits(Number(required))})`
                              : hasOver
                                ? `${session.label}: thừa ${formatShiftUnits(over)} (${formatShiftUnits(Number(value))}/${formatShiftUnits(Number(required))})`
                              : `${session.label}: ${formatShiftUnits(Number(value))}/${formatShiftUnits(Number(required))}`
                          }
                        >
                          <span>{formatShiftUnits(Number(value))}</span>
                          <span className="text-[8px] mt-0.5">
                            {hasShortage
                              ? `-${formatShiftUnits(Number(shortage))}`
                              : hasOver
                                ? `+${formatShiftUnits(over)}`
                              : `/${formatShiftUnits(Number(required))}`}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="border-b bg-amber-50/60">
                <td className="sticky left-0 z-20 bg-amber-50 border-r px-3 py-1">
                  <div className="font-black text-[10px] text-amber-800">Tổng quy đổi</div>
                  <div className="text-[8px] text-amber-700">C1+C2+C3 + (ca gãy x 0.5)</div>
                  <div className="text-[8px] text-amber-700/80">Mẫu hiển thị: thực tế / định mức ngày</div>
                </td>
                {dayNumbers.map((day) => renderDailySummaryCell(day))}
              </tr>

              <tr className="border-b bg-slate-50">
                <td className="sticky left-0 z-20 bg-slate-50 border-r px-3 py-1">
                  <div className="font-black text-[10px] text-slate-700">Số NV OFF</div>
                  <div className="text-[8px] text-slate-500">Không phân ca trong ngày</div>
                </td>
                {dayNumbers.map((day) => {
                  const stat = getDailySummaryStat(day);
                  return (
                    <td key={day} className="border-r px-0.5 py-0.5">
                      <div className="h-9 rounded border border-slate-200 bg-white flex items-center justify-center font-mono text-[10px] font-bold text-slate-600">
                        {stat?.offCount ?? 0}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {editingCell && (() => {
        const targetEmp = employees.find((e) => e.id === editingCell.employeeId);
        const current = targetEmp?.assignments[editingCell.day] ?? null;
        const selectedKeys = parseAssignmentKeys(current);
        return (
          <div
            className="fixed z-[95] w-44 bg-white border-2 border-vetc-green rounded p-1 shadow-xl"
            style={{ top: editingCell.anchorTop, left: editingCell.anchorLeft }}
          >
            <div className="max-h-24 overflow-auto space-y-0.5">
              {shiftKeys.map((k) => {
                const checked = selectedKeys.includes(k);
                return (
                  <label key={k} className="flex items-center gap-1 text-[10px] font-mono cursor-pointer px-1 py-0.5 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? selectedKeys.filter((x) => x !== k)
                          : [...selectedKeys, k];
                        updateAssignment(
                          editingCell.employeeId,
                          editingCell.day,
                          next.length ? next.join('+') : null,
                          false
                        );
                      }}
                    />
                    <span>{k}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAssignment(editingCell.employeeId, editingCell.day, null, false)}
                className="text-[9px] text-gray-500 hover:text-red-600"
              >
                Xóa ca
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditingCell(null)}
                className="text-[9px] text-vetc-green hover:underline"
              >
                Đóng
              </button>
            </div>
          </div>
        );
      })()}

      {/* Excel preview modal */}
      {isPreviewOpen && previewEmployees && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden font-['Inter']">
            <div className="bg-vetc-green text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold">Preview lịch ca sau upload</h3>
                <p className="text-xs text-white/80 mt-0.5">{previewFileName}</p>
              </div>
              <button type="button" onClick={() => setIsPreviewOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 custom-scrollbar">
              <div className="mb-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {role} · {monthLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {previewEmployees.length} NV
                </span>
                {(() => {
                  const pw = computeWarnings(role, yearMonth, previewEmployees);
                  const ps = {
                    u: pw.filter((w) => w.type === 'UNDERSTAFFED').length,
                    o: pw.filter((w) => w.type === 'OVERSTAFFED').length,
                  };
                  return (
                    <>
                      <span className={`px-2 py-0.5 rounded-full border ${WARNING_META.UNDERSTAFFED.chip}`}>
                        Thiếu {ps.u}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${WARNING_META.OVERSTAFFED.chip}`}>
                        Thừa {ps.o}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 mb-3 text-xs text-slate-700">
                <p>
                  Ảnh hưởng dự kiến: <strong>{previewImpact.changedEmployees}</strong> NV, <strong>{previewImpact.changedCells}</strong> ô ca thay đổi.
                </p>
                {previewImpact.changedPastOrToday > 0 && (
                  <p className="mt-1 text-red-600 font-semibold">
                    Cảnh báo: có {previewImpact.changedPastOrToday} thay đổi rơi vào ngày đã/đang diễn ra trong tháng hiện tại.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-3 py-2 mb-3">
                <p className="text-xs font-bold text-emerald-700 mb-2">Tổng hợp theo buổi / ngày (ca gãy = 0.5, ca nguyên = 1)</p>
                <div className="overflow-x-auto border rounded bg-white">
                  <table className="text-[10px] min-w-max w-full">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-800">
                        <th className="border px-2 py-1 text-left sticky left-0 bg-emerald-50">Buổi</th>
                        {dayNumbers.map((d) => (
                          <th key={d} className="border px-1.5 py-1 text-center font-mono">{d}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'morning', label: 'Buổi sáng' },
                        { key: 'afternoon', label: 'Buổi chiều' },
                        { key: 'night', label: 'Buổi đêm' },
                        { key: 'total', label: 'TỔNG' },
                      ].map((row) => (
                        <tr key={row.key}>
                          <td className="border px-2 py-1 font-mono font-bold sticky left-0 bg-white">
                            {row.label}
                          </td>
                          {dayNumbers.map((day) => {
                            const dayData = previewSessionSummary.find((x) => x.day === day);
                            const value = dayData ? dayData[row.key as 'morning' | 'afternoon' | 'night' | 'total'] : 0;
                            const required = requiredBySession[row.key as 'morning' | 'afternoon' | 'night' | 'total'];
                            const isUnder = value < required;
                            const isOver = value > required;
                            return (
                              <td
                                key={`${row.key}-${day}`}
                                className={`border px-1.5 py-1 text-center font-mono ${
                                  isUnder
                                    ? 'bg-red-50 text-red-700'
                                    : isOver
                                      ? 'bg-orange-50 text-orange-700'
                                      : ''
                                }`}
                                title={
                                  isUnder
                                    ? `Thiếu ${formatShiftUnits(required - value)} (${formatShiftUnits(value)}/${formatShiftUnits(required)})`
                                    : isOver
                                      ? `Thừa ${formatShiftUnits(value - required)} (${formatShiftUnits(value)}/${formatShiftUnits(required)})`
                                      : `Đủ (${formatShiftUnits(value)}/${formatShiftUnits(required)})`
                                }
                              >
                                {formatShiftUnits(value)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <table className="text-xs min-w-max w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left">Họ tên</th>
                      {dayNumbers.map((d) => (
                        <th key={d} className="border px-2 py-2 text-center font-mono">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewEmployees.map((emp) => (
                      <tr key={emp.id}>
                        <td className="border px-3 py-2 font-medium">{emp.name}</td>
                        {dayNumbers.map((d) => (
                          <td key={d} className="border px-2 py-2 text-center font-mono">
                            {emp.assignments[d] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 py-2 rounded-xl border font-bold text-gray-500 hover:bg-white text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="flex-1 py-2 rounded-xl bg-vetc-green text-white font-bold inline-flex items-center justify-center gap-2 text-sm"
              >
                <Check size={16} />
                Xác nhận import
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadProcessing && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 font-['Inter']">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-vetc-green" />
              <div>
                <p className="text-sm font-bold text-gray-800">Đang xử lý file upload...</p>
                <p className="text-xs text-gray-500 mt-0.5 break-all">{uploadProcessingFileName}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAutoModalOpen && autoResult && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-indigo-600 text-white px-5 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <h3 className="font-bold">
                  {pendingAutoAction === 1
                    ? 'Kết quả Action 1 (ca mặc định)'
                    : pendingAutoAction === 2
                      ? 'Kết quả Action 2 (bù ca gãy)'
                      : 'Kết quả sắp xếp ca tự động'} — {role} {monthLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAutoModalOpen(false);
                  setAutoResult(null);
                  setPendingAutoAction(null);
                }}
                className="p-1 hover:bg-white/20 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-sm">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-bold text-amber-800">
                  {pendingAutoAction === 1
                    ? 'Xác nhận chạy tự động sắp xếp ca mặc định (C1/C2/C3).'
                    : 'Xác nhận bổ sung ca gãy để bù phần thiếu còn lại.'}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Sau khi xác nhận, hệ thống sẽ cập nhật lịch ca hiện tại theo rule tự động.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-800">Tổng quan cách xếp:</p>
                <p>- Action 1: phân ca mặc định C1/C2/C3 theo định mức tháng từ BE.</p>
                <p>- Action 2: bổ sung ca gãy để bù phần thiếu, ưu tiên cân bằng tải và tôn trọng mong muốn nghỉ.</p>
                <p>- Giới hạn trong ngày: tối đa 2 ca mặc định hoặc 4 ca gãy cho mỗi nhân sự.</p>
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAutoModalOpen(false);
                  setAutoResult(null);
                }}
                className="flex-1 py-2 rounded-xl border font-bold text-gray-500 hover:bg-white text-sm"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAutoSchedule}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold inline-flex items-center justify-center gap-2 text-sm hover:bg-indigo-700"
              >
                <Check size={16} />
                Áp dụng lịch ca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftMonthlySchedule;
