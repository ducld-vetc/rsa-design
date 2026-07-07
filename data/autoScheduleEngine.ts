import type {
  MonthlyEmployee,
  ShiftDefinition,
  ShiftRole,
  TimeSlotStaffingRule,
} from './shiftConfigMockData';
import {
  countStaffOnShiftKey,
  getDaysInMonth,
} from './shiftConfigMockData';

/** Mong muốn nghỉ / đi làm theo từng NV × ca × tháng */
export type EmployeeShiftMonthPreference = {
  employeeId: string;
  role: ShiftRole;
  yearMonth: string;
  shiftKey: string;
  offDays: number[];
  preferredWorkDays: number[];
};

export type AutoScheduleResult = {
  employees: MonthlyEmployee[];
  logs: string[];
  unmetSlots: { day: number; slotLabel: string; shortage: number }[];
  quotaShortfalls: { employeeId: string; name: string; assigned: number; required: number }[];
  otAssignments: number;
};

export type AutoScheduleActionMode = 'FULL' | 'ACTION1_DEFAULT' | 'ACTION2_SPLIT_TOPUP';

export function prefKey(
  role: ShiftRole,
  yearMonth: string,
  employeeId: string,
  shiftKey: string
): string {
  return `${role}|${yearMonth}|${employeeId}|${shiftKey}`;
}

function seedPrefs(
  role: ShiftRole,
  yearMonth: string,
  entries: { employeeId: string; shiftKey: string; offDays: number[]; preferredWorkDays: number[] }[]
): EmployeeShiftMonthPreference[] {
  return entries.map((e) => ({ role, yearMonth, ...e }));
}

export const DEFAULT_EMPLOYEE_SHIFT_PREFS: EmployeeShiftMonthPreference[] = [
  ...seedPrefs('OSA', '2026-07', [
    { employeeId: 'e1', shiftKey: 'C1', offDays: [7, 14, 21, 28], preferredWorkDays: [1, 2, 3, 4, 5] },
    { employeeId: 'e1', shiftKey: 'C3', offDays: [6, 13], preferredWorkDays: [] },
    { employeeId: 'e2', shiftKey: 'C1', offDays: [6, 13, 20, 27], preferredWorkDays: [1, 2, 3] },
    { employeeId: 'e2', shiftKey: 'C3', offDays: [1, 15], preferredWorkDays: [10, 11, 12] },
    { employeeId: 'e3', shiftKey: 'C1', offDays: [1, 15], preferredWorkDays: [2, 3, 4, 5, 6] },
    { employeeId: 'e4', shiftKey: 'CG3', offDays: [8, 22], preferredWorkDays: [10, 11, 12] },
  ]),
  ...seedPrefs('CSKH', '2026-07', [
    { employeeId: 'c1', shiftKey: 'C1', offDays: [7, 14, 21, 28], preferredWorkDays: [1, 2, 3, 4, 5] },
    { employeeId: 'c2', shiftKey: 'C1', offDays: [6, 13, 20, 27], preferredWorkDays: [] },
    { employeeId: 'c3', shiftKey: 'CG1', offDays: [5, 10, 15], preferredWorkDays: [1, 2, 3] },
    { employeeId: 'c5', shiftKey: 'C1', offDays: [], preferredWorkDays: [6, 7, 8] },
  ]),
];

export function getShiftMonthPreference(
  preferences: EmployeeShiftMonthPreference[],
  role: ShiftRole,
  yearMonth: string,
  employeeId: string,
  shiftKey: string
): EmployeeShiftMonthPreference {
  const found = preferences.find(
    (p) =>
      p.role === role &&
      p.yearMonth === yearMonth &&
      p.employeeId === employeeId &&
      p.shiftKey === shiftKey
  );
  return (
    found ?? {
      employeeId,
      role,
      yearMonth,
      shiftKey,
      offDays: [],
      preferredWorkDays: [],
    }
  );
}

export function getPreferencesForMonth(
  preferences: EmployeeShiftMonthPreference[],
  role: ShiftRole,
  yearMonth: string
): EmployeeShiftMonthPreference[] {
  return preferences.filter((p) => p.role === role && p.yearMonth === yearMonth);
}

export function parseDayList(raw: string): number[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 31);
}

export function formatDayList(days: number[]): string {
  return days.length ? days.join(', ') : '';
}

export function getShiftWorkloadUnits(shift: ShiftDefinition): number {
  if (shift.isOvertime) return 1;
  return shift.type === 'SPLIT' ? 0.5 : 1;
}

export function isNightShiftDefinition(shift: ShiftDefinition | undefined): boolean {
  return shift?.isNightShift === true;
}

export function isOvertimeShift(shift: ShiftDefinition | undefined): boolean {
  return shift?.isOvertime === true;
}

export function restDayAfterShift(shift: ShiftDefinition | undefined): boolean {
  return isNightShiftDefinition(shift) && shift?.restDayAfterShift !== false;
}

function emptyAssignments(daysInMonth: number): Record<number, string | null> {
  const a: Record<number, string | null> = {};
  for (let d = 1; d <= daysInMonth; d += 1) a[d] = null;
  return a;
}

function countMonthlyUnits(
  emp: MonthlyEmployee,
  shiftByKey: Map<string, ShiftDefinition>
): number {
  let total = 0;
  Object.values(emp.assignments).forEach((raw) => {
    if (!raw) return;
    raw.split('+').map((s) => s.trim()).forEach((key) => {
      const shift = shiftByKey.get(key);
      if (shift) total += getShiftWorkloadUnits(shift);
    });
  });
  return total;
}

function assignmentKeys(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split('+').map((s) => s.trim()).filter(Boolean);
}

function hasShiftKey(raw: string | null | undefined, shiftKey: string): boolean {
  return assignmentKeys(raw).includes(shiftKey);
}

function addShiftKey(raw: string | null | undefined, shiftKey: string): string {
  const keys = assignmentKeys(raw);
  if (keys.includes(shiftKey)) return keys.join('+');
  keys.push(shiftKey);
  return keys.join('+');
}

function staffingShiftsFromDefs(shiftDefinitions: ShiftDefinition[]): ShiftDefinition[] {
  return shiftDefinitions.filter((s) => s.minStaff != null && !s.isOvertime && s.status === 'active');
}

function splitFallbackKeysForFullShift(shiftKey: string): string[] {
  if (shiftKey === 'C1') return ['CG1', 'CG2'];
  if (shiftKey === 'C2') return ['CG3', 'CG4', 'CG5', 'CG6'];
  return [];
}

function equivalentCoverageForFullShift(
  day: number,
  fullShift: ShiftDefinition,
  employees: MonthlyEmployee[]
): number {
  const splitKeys = new Set(splitFallbackKeysForFullShift(fullShift.shiftKey));
  let fullCount = 0;
  let splitCount = 0;
  employees.forEach((emp) => {
    const keys = assignmentKeys(emp.assignments[day]);
    if (keys.includes(fullShift.shiftKey)) fullCount += 1;
    splitCount += keys.filter((k) => splitKeys.has(k)).length;
  });
  return fullCount + splitCount * 0.5;
}

function equivalentContributionToFullShift(fullShiftKey: string, assignedKey: string): number {
  if (assignedKey === fullShiftKey) return 1;
  if (fullShiftKey === 'C1' && ['CG1', 'CG2'].includes(assignedKey)) return 0.5;
  if (fullShiftKey === 'C2' && ['CG3', 'CG4', 'CG5', 'CG6'].includes(assignedKey)) return 0.5;
  return 0;
}

function countDayShiftTypes(
  emp: MonthlyEmployee,
  day: number,
  shiftByKey: Map<string, ShiftDefinition>
): { full: number; split: number; total: number } {
  const keys = assignmentKeys(emp.assignments[day]);
  let full = 0;
  let split = 0;
  keys.forEach((k) => {
    const shift = shiftByKey.get(k);
    if (!shift) return;
    if (shift.staffingGroup === 'FULL') full += 1;
    if (shift.staffingGroup === 'SPLIT') split += 1;
  });
  return { full, split, total: keys.length };
}

function canAppendShift(
  emp: MonthlyEmployee,
  day: number,
  shift: ShiftDefinition,
  shiftByKey: Map<string, ShiftDefinition>
): boolean {
  if (hasShiftKey(emp.assignments[day], shift.shiftKey)) return false;
  const c = countDayShiftTypes(emp, day, shiftByKey);
  if (c.total >= 4) return false;
  if (shift.staffingGroup === 'FULL' && c.full >= 2) return false;
  if (shift.staffingGroup === 'SPLIT' && c.split >= 4) return false;
  return true;
}

function scoreEmployee(
  emp: MonthlyEmployee,
  day: number,
  shiftKey: string,
  pref: EmployeeShiftMonthPreference | undefined,
  globalMinUnits: number,
  currentUnits: number,
  blocked: boolean,
  isOt: boolean
): number {
  if (blocked && !isOt) return -10000;
  if (!isOt && pref?.offDays.includes(day)) return -5000;
  let score = 0;
  if (!isOt && pref?.preferredWorkDays.includes(day)) score += 80;
  if (currentUnits < globalMinUnits) score += (globalMinUnits - currentUnits) * 15;
  if (!emp.isNewEmployee) score += 5;
  if (isOt) score -= 10;
  return score;
}

function assignShift(
  emp: MonthlyEmployee,
  day: number,
  shift: ShiftDefinition,
  recoveryBlock: Map<string, Set<number>>,
  logs: string[],
  label: string,
  daysInMonth: number,
  append = false
) {
  emp.assignments[day] = append
    ? addShiftKey(emp.assignments[day], shift.shiftKey)
    : shift.shiftKey;
  logs.push(label);
  if (restDayAfterShift(shift) && day < daysInMonth) {
    const set = recoveryBlock.get(emp.id) ?? new Set<number>();
    set.add(day + 1);
    recoveryBlock.set(emp.id, set);
  }
}

/**
 * Sắp xếp ca tự động:
 * - Lấp đủ mọi khung giờ trong ngày (kể cả ca đêm 22h→6h sáng)
 * - Đảm bảo mỗi loại ca chính có ít nhất 1 NV/ngày (nếu còn người)
 * - Thiếu người → xếp ca OT
 */
export function runAutoSchedule(input: {
  role: ShiftRole;
  yearMonth: string;
  employees: MonthlyEmployee[];
  shiftDefinitions: ShiftDefinition[];
  timeSlotRules: TimeSlotStaffingRule[];
  minShiftUnitsPerMonth: number;
  preferences: EmployeeShiftMonthPreference[];
  actionMode?: AutoScheduleActionMode;
}): AutoScheduleResult {
  const {
    yearMonth,
    employees,
    shiftDefinitions,
    timeSlotRules,
    minShiftUnitsPerMonth: globalMin,
    preferences,
    actionMode = 'FULL',
  } = input;

  const daysInMonth = getDaysInMonth(yearMonth);
  const shiftByKey = new Map(shiftDefinitions.map((s) => [s.shiftKey, s]));
  const regularShifts = shiftDefinitions.filter((s) => !s.isOvertime && s.status === 'active');
  const fullShifts = regularShifts.filter((s) => s.staffingGroup === 'FULL');
  const splitShifts = regularShifts.filter((s) => s.staffingGroup === 'SPLIT');
  const otShift = shiftDefinitions.find((s) => s.isOvertime);
  const logs: string[] = [];
  let otAssignments = 0;

  const getPref = (employeeId: string, shiftKey: string) =>
    getShiftMonthPreference(preferences, input.role, yearMonth, employeeId, shiftKey);

  const scheduled: MonthlyEmployee[] = employees.map((e) => ({
    ...e,
    assignments: actionMode === 'ACTION2_SPLIT_TOPUP' ? { ...e.assignments } : emptyAssignments(daysInMonth),
  }));

  const recoveryBlock = new Map<string, Set<number>>();

  const isBlocked = (empId: string, day: number, shiftKey: string): boolean => {
    if (recoveryBlock.get(empId)?.has(day)) return true;
    return getPref(empId, shiftKey).offDays.includes(day);
  };

  const applyNightRecovery = (day: number) => {
    if (day >= daysInMonth) return;
    scheduled.forEach((emp) => {
      const key = assignmentKeys(emp.assignments[day])[0];
      const shift = key ? shiftByKey.get(key) : undefined;
      if (shift && restDayAfterShift(shift)) {
        const set = recoveryBlock.get(emp.id) ?? new Set<number>();
        if (!set.has(day + 1)) {
          set.add(day + 1);
          recoveryBlock.set(emp.id, set);
          logs.push(`${emp.name}: ca đêm ${shift.shiftKey} ngày ${day} → nghỉ ngày ${day + 1}`);
        }
      }
    });
  };

  const tryAssign = (
    day: number,
    shift: ShiftDefinition,
    allowOt: boolean
  ): boolean => {
    const candidates = scheduled
      .filter((emp) => !emp.assignments[day])
      .map((emp) => ({
        emp,
        score: scoreEmployee(
          emp,
          day,
          shift.shiftKey,
          getPref(emp.id, shift.shiftKey),
          globalMin,
          countMonthlyUnits(emp, shiftByKey),
          isBlocked(emp.id, day, shift.shiftKey),
          false
        ),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      const { emp } = candidates[0];
      assignShift(
        emp,
        day,
        shift,
        recoveryBlock,
        logs,
        `Ngày ${day} [${shift.shiftKey}]: ${emp.name} → ${shift.shiftKey}`,
        daysInMonth
      );
      return true;
    }

    if (allowOt && otShift) {
      const otPool = scheduled
        .filter((emp) => !emp.assignments[day])
        .sort(
          (a, b) =>
            countMonthlyUnits(a, shiftByKey) - countMonthlyUnits(b, shiftByKey)
        );
      if (otPool.length > 0) {
        const emp = otPool[0];
        assignShift(
          emp,
          day,
          otShift,
          recoveryBlock,
          logs,
          `Ngày ${day} [${shift.shiftKey}]: ${emp.name} → OT (thiếu người)`,
          daysInMonth
        );
        otAssignments += 1;
        return true;
      }
    }
    return false;
  };

  const tryAssignSplitForDefaultShortage = (day: number, fullShift: ShiftDefinition): boolean => {
    const fallbackSplits = splitFallbackKeysForFullShift(fullShift.shiftKey)
      .map((key) => splitShifts.find((s) => s.shiftKey === key))
      .filter((s): s is ShiftDefinition => Boolean(s));
    if (fallbackSplits.length === 0) return false;

    const splitByBalance = [...fallbackSplits].sort((a, b) => {
      const countA = scheduled.reduce((acc, emp) => acc + (Object.values(emp.assignments).filter((k) => k === a.shiftKey).length), 0);
      const countB = scheduled.reduce((acc, emp) => acc + (Object.values(emp.assignments).filter((k) => k === b.shiftKey).length), 0);
      return countA - countB;
    });

    for (const split of splitByBalance) {
      const candidates = scheduled
      .filter((emp) =>
        !isBlocked(emp.id, day, split.shiftKey) &&
        canAppendShift(emp, day, split, shiftByKey)
      )
        .map((emp) => ({
          emp,
          pref: getPref(emp.id, split.shiftKey),
          units: countMonthlyUnits(emp, shiftByKey),
        }))
        .sort((a, b) => {
          const prefA = a.pref.preferredWorkDays.includes(day) ? 1 : 0;
          const prefB = b.pref.preferredWorkDays.includes(day) ? 1 : 0;
          if (prefA !== prefB) return prefB - prefA;
          if (a.units !== b.units) return a.units - b.units;
          return a.emp.name.localeCompare(b.emp.name);
        });
      if (candidates.length === 0) continue;
      const picked = candidates[0].emp;
      assignShift(
        picked,
        day,
        split,
        recoveryBlock,
        logs,
        `Action 2: bù thiếu ${fullShift.shiftKey} ngày ${day} bằng ${split.shiftKey} (${picked.name})`,
        daysInMonth,
        true
      );
      return true;
    }

    // Không còn ai trống -> tái cân bằng từ ca khác nhưng không phá ngưỡng tối thiểu.
    const fullShiftByKey = new Map(fullShifts.map((s) => [s.shiftKey, s]));
    for (const split of splitByBalance) {
      const rebalanceCandidates = scheduled
        .filter((emp) => {
          const currentKey = assignmentKeys(emp.assignments[day])[0];
          if (!currentKey) return false;
          if (!canAppendShift(emp, day, split, shiftByKey)) return false;
          if (isBlocked(emp.id, day, split.shiftKey)) return false;
          const currentShift = shiftByKey.get(currentKey);
          if (!currentShift || currentShift.isNightShift) return false;
          const touched = fullShifts.filter(
            (f) => equivalentContributionToFullShift(f.shiftKey, currentKey) > 0
          );
          if (touched.length === 0) return false;
          // Không rút người đang đóng góp cho chính ca thiếu.
          if (equivalentContributionToFullShift(fullShift.shiftKey, currentKey) > 0) return false;
          return touched.every((f) => {
            const afterMove =
              equivalentCoverageForFullShift(day, f, scheduled) -
              equivalentContributionToFullShift(f.shiftKey, currentKey);
            return afterMove >= (f.minStaff ?? 0);
          });
        })
        .map((emp) => ({
          emp,
          units: countMonthlyUnits(emp, shiftByKey),
          preferred: getPref(emp.id, split.shiftKey).preferredWorkDays.includes(day) ? 1 : 0,
        }))
        .sort((a, b) => {
          if (a.preferred !== b.preferred) return b.preferred - a.preferred;
          if (a.units !== b.units) return a.units - b.units;
          return a.emp.name.localeCompare(b.emp.name);
        });

      if (rebalanceCandidates.length === 0) continue;
      const picked = rebalanceCandidates[0].emp;
      const prev = picked.assignments[day];
      picked.assignments[day] = addShiftKey(picked.assignments[day], split.shiftKey);
      logs.push(
        `Action 2: điều chuyển ${picked.name} từ ${prev} sang ${split.shiftKey} để bù ${fullShift.shiftKey} ngày ${day}`
      );
      return true;
    }
    return false;
  };

  const canonicalShifts = staffingShiftsFromDefs(shiftDefinitions).filter(
    (s) => s.staffingGroup === 'FULL'
  );
  const fullDailyNeed = fullShifts.reduce((sum, s) => sum + (s.minStaff ?? 0), 0);
  const fullMonthlyNeed = fullDailyNeed * daysInMonth;
  const fullMonthlyCapacity = Array.from({ length: daysInMonth }, (_, idx) => idx + 1).reduce((acc, day) => {
    const availableForDefault = employees.filter((emp) =>
      fullShifts.some((shift) => !getPref(emp.id, shift.shiftKey).offDays.includes(day))
    ).length;
    return acc + availableForDefault;
  }, 0);
  const shouldBlendDefaultAndSplit = fullMonthlyCapacity < fullMonthlyNeed;
  const monthlyRequiredUnits = employees.length * globalMin;
  const monthlyCapacityUnits = daysInMonth * employees.length;
  const needsSplitRebalance = monthlyRequiredUnits > monthlyCapacityUnits;

  const monthAssignedCount = (shiftKey: string): number =>
    scheduled.reduce((acc, emp) => {
      const c = Object.values(emp.assignments).filter((k) => k === shiftKey).length;
      return acc + c;
    }, 0);

  const runAction1 = actionMode === 'FULL' || actionMode === 'ACTION1_DEFAULT';
  const runAction2 = actionMode === 'FULL' || actionMode === 'ACTION2_SPLIT_TOPUP';

  for (let day = 1; day <= daysInMonth; day += 1) {
    if (day > 1) applyNightRecovery(day - 1);

    const shiftsByPriority = [...fullShifts].sort((a, b) => {
      const aNight = isNightShiftDefinition(a) ? 1 : 0;
      const bNight = isNightShiftDefinition(b) ? 1 : 0;
      if (aNight !== bNight) return bNight - aNight;
      return (b.minStaff ?? 0) - (a.minStaff ?? 0);
    });

    if (runAction1) {
      logs.push(`Action 1: xếp ca mặc định ngày ${day}`);
      for (const shift of shiftsByPriority) {
        const minStaff = shift.minStaff ?? 0;
        let coverage = countStaffOnShiftKey(day, shift.shiftKey, scheduled).length;

        while (coverage < minStaff) {
          const assigned = tryAssign(day, shift, actionMode === 'FULL' && !shouldBlendDefaultAndSplit);
          if (!assigned) break;
          coverage = countStaffOnShiftKey(day, shift.shiftKey, scheduled).length;
        }
      }
    }

    if (runAction2) {
      logs.push(`Action 2: bù thiếu bằng ca gãy ngày ${day}`);
      for (const shift of shiftsByPriority) {
        const minStaff = shift.minStaff ?? 0;
        let coverageEquivalent = equivalentCoverageForFullShift(day, shift, scheduled);
        while (coverageEquivalent < minStaff) {
          const assigned = tryAssignSplitForDefaultShortage(day, shift);
          if (!assigned) break;
          coverageEquivalent = equivalentCoverageForFullShift(day, shift, scheduled);
        }
      }
    }

    // Khi đủ năng lực ca mặc định: đảm bảo mỗi ca full có ít nhất 1 người trong ngày
    if (shouldBlendDefaultAndSplit) continue;
    for (const shift of fullShifts) {
      const hasSomeone = scheduled.some((e) => hasShiftKey(e.assignments[day], shift.shiftKey));
      if (hasSomeone) continue;

      const free = scheduled.filter((emp) => !emp.assignments[day]);
      const candidate = free
        .map((emp) => ({
          emp,
          score: scoreEmployee(
            emp,
            day,
            shift.shiftKey,
            getPref(emp.id, shift.shiftKey),
            globalMin,
            countMonthlyUnits(emp, shiftByKey),
            isBlocked(emp.id, day, shift.shiftKey),
            false
          ),
        }))
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)[0];

      if (candidate) {
        assignShift(
          candidate.emp,
          day,
          shift,
          recoveryBlock,
          logs,
          `Ngày ${day}: bổ sung ca ${shift.shiftKey} → ${candidate.emp.name}`,
          daysInMonth
        );
      }
    }
  }

  if (daysInMonth >= 1) applyNightRecovery(daysInMonth);

  if (actionMode !== 'ACTION2_SPLIT_TOPUP') {
    for (const emp of scheduled) {
    let units = countMonthlyUnits(emp, shiftByKey);

    for (let day = 1; day <= daysInMonth && units < globalMin; day += 1) {
      if (emp.assignments[day]) continue;

      const shift =
        fullShifts.find(
          (s) => !isNightShiftDefinition(s) && !isBlocked(emp.id, day, s.shiftKey)
        ) ??
        fullShifts.find((s) => !isBlocked(emp.id, day, s.shiftKey)) ??
        fullShifts[0];
      if (!shift || isBlocked(emp.id, day, shift.shiftKey)) break;

      assignShift(
        emp,
        day,
        shift,
        recoveryBlock,
        logs,
        `Bù công: ${emp.name} ngày ${day} → ${shift.shiftKey} (${units + getShiftWorkloadUnits(shift)}/${globalMin} ca)`,
        daysInMonth
      );
      units += getShiftWorkloadUnits(shift);
    }
  }
  }

  // Team không đủ định mức hoặc không đủ phủ ca mặc định -> dàn đều ca gãy theo tháng.
  if (
    actionMode !== 'ACTION2_SPLIT_TOPUP' &&
    (needsSplitRebalance || shouldBlendDefaultAndSplit) &&
    splitShifts.length > 0
  ) {
    for (let day = 1; day <= daysInMonth; day += 1) {
      const split = splitShifts[(day - 1) % splitShifts.length];
      const candidates = scheduled
        .filter(
          (emp) =>
            !isBlocked(emp.id, day, split.shiftKey) &&
            canAppendShift(emp, day, split, shiftByKey)
        )
        .map((emp) => ({
          emp,
          units: countMonthlyUnits(emp, shiftByKey),
          splitCount: Object.values(emp.assignments).reduce(
            (acc, raw) =>
              acc +
              assignmentKeys(raw).filter((k) => {
                const def = shiftByKey.get(k);
                return def?.staffingGroup === 'SPLIT';
              }).length,
            0
          ),
        }))
        .sort((a, b) => {
          if (a.splitCount !== b.splitCount) return a.splitCount - b.splitCount;
          if (a.units !== b.units) return a.units - b.units;
          return a.emp.name.localeCompare(b.emp.name);
        });
      if (candidates.length === 0) continue;
      assignShift(
        candidates[0].emp,
        day,
        split,
        recoveryBlock,
        logs,
        `Bù ca gãy đều tháng: ${candidates[0].emp.name} ngày ${day} → ${split.shiftKey}`,
        daysInMonth,
        true
      );
    }
  }

  const unmetSlots: AutoScheduleResult['unmetSlots'] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    for (const shift of canonicalShifts) {
      const minStaff = shift.minStaff ?? 0;
      const coverage =
        actionMode === 'ACTION2_SPLIT_TOPUP' || actionMode === 'FULL'
          ? equivalentCoverageForFullShift(day, shift, scheduled)
          : countStaffOnShiftKey(day, shift.shiftKey, scheduled).length;
      if (coverage < minStaff) {
        unmetSlots.push({
          day,
          slotLabel: `${shift.shiftKey} (${shift.timeStart}–${shift.timeEnd})`,
          shortage: minStaff - coverage,
        });
      }
    }
  }

  const quotaShortfalls: AutoScheduleResult['quotaShortfalls'] = [];
  scheduled.forEach((emp) => {
    const assigned = countMonthlyUnits(emp, shiftByKey);
    if (assigned < globalMin) {
      quotaShortfalls.push({
        employeeId: emp.id,
        name: emp.name,
        assigned,
        required: globalMin,
      });
    }
  });

  logs.push(
    `Hoàn tất: ${unmetSlots.length} ca thiếu, ${otAssignments} ca OT, ${quotaShortfalls.length} NV chưa đủ công`
  );

  return { employees: scheduled, logs, unmetSlots, quotaShortfalls, otAssignments };
}

export function formatShiftUnits(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
