import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  MOCK_MIN_SHIFT_UNITS_FROM_BE,
  MOCK_SHIFT_DEFINITIONS,
  MOCK_TIME_SLOT_RULES,
  buildMockMonthlyEmployees,
  computeShiftWarnings,
  computeTimeSlotDayStats,
  getDaysInMonth,
  getWarningsForEmployeeCell,
  type MonthlyEmployee,
  type ShiftDefinition,
  type ShiftRole,
  type TimeSlotStaffingRule,
} from '../data/shiftConfigMockData';
import {
  DEFAULT_EMPLOYEE_SHIFT_PREFS,
  type AutoScheduleActionMode,
  getPreferencesForMonth,
  getShiftMonthPreference,
  type AutoScheduleResult,
  type EmployeeShiftMonthPreference,
  runAutoSchedule,
} from '../data/autoScheduleEngine';

type ShiftConfigContextValue = {
  shiftDefinitions: ShiftDefinition[];
  setShiftDefinitions: React.Dispatch<React.SetStateAction<ShiftDefinition[]>>;
  timeSlotRules: TimeSlotStaffingRule[];
  setTimeSlotRules: React.Dispatch<React.SetStateAction<TimeSlotStaffingRule[]>>;
  employeeShiftPreferences: EmployeeShiftMonthPreference[];
  updateShiftMonthPreference: (
    role: ShiftRole,
    yearMonth: string,
    employeeId: string,
    shiftKey: string,
    patch: Partial<Pick<EmployeeShiftMonthPreference, 'offDays' | 'preferredWorkDays'>>
  ) => void;
  getShiftMonthPreferenceFor: (
    role: ShiftRole,
    yearMonth: string,
    employeeId: string,
    shiftKey: string
  ) => EmployeeShiftMonthPreference;
  getMinShiftUnitsFromBe: (role: ShiftRole) => number;
  getShiftDefinitionsForRole: (role: ShiftRole) => ShiftDefinition[];
  getTimeSlotRulesForRole: (role: ShiftRole) => TimeSlotStaffingRule[];
  runAutoScheduleForMonth: (
    role: ShiftRole,
    yearMonth: string,
    employees: MonthlyEmployee[],
    actionMode?: AutoScheduleActionMode
  ) => AutoScheduleResult;
  computeWarnings: (
    role: ShiftRole,
    yearMonth: string,
    employees: MonthlyEmployee[]
  ) => ReturnType<typeof computeShiftWarnings>;
  computeSlotStats: (
    role: ShiftRole,
    yearMonth: string,
    employees: MonthlyEmployee[]
  ) => ReturnType<typeof computeTimeSlotDayStats>;
  getCellWarnings: (
    day: number,
    shiftKey: string | null,
    role: ShiftRole,
    yearMonth: string,
    employees: MonthlyEmployee[]
  ) => ReturnType<typeof getWarningsForEmployeeCell>;
  buildEmployees: (role: ShiftRole, yearMonth: string) => MonthlyEmployee[];
};

const ShiftConfigContext = createContext<ShiftConfigContextValue | null>(null);

export const ShiftConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shiftDefinitions, setShiftDefinitions] = useState<ShiftDefinition[]>(MOCK_SHIFT_DEFINITIONS);
  const [timeSlotRules, setTimeSlotRules] = useState<TimeSlotStaffingRule[]>(MOCK_TIME_SLOT_RULES);
  const [employeeShiftPreferences, setEmployeeShiftPreferences] = useState<EmployeeShiftMonthPreference[]>(
    DEFAULT_EMPLOYEE_SHIFT_PREFS
  );

  const getMinShiftUnitsFromBe = useCallback(
    (role: ShiftRole) => MOCK_MIN_SHIFT_UNITS_FROM_BE[role],
    []
  );

  const getShiftDefinitionsForRole = useCallback(
    (role: ShiftRole) => shiftDefinitions.filter((s) => s.role === role && s.status === 'active'),
    [shiftDefinitions]
  );

  const getTimeSlotRulesForRole = useCallback(
    (role: ShiftRole) => timeSlotRules.filter((r) => r.role === role && r.status === 'active'),
    [timeSlotRules]
  );

  const updateShiftMonthPreference = useCallback(
    (
      role: ShiftRole,
      yearMonth: string,
      employeeId: string,
      shiftKey: string,
      patch: Partial<Pick<EmployeeShiftMonthPreference, 'offDays' | 'preferredWorkDays'>>
    ) => {
      setEmployeeShiftPreferences((prev) => {
        const idx = prev.findIndex(
          (p) =>
            p.role === role &&
            p.yearMonth === yearMonth &&
            p.employeeId === employeeId &&
            p.shiftKey === shiftKey
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...patch };
          return next;
        }
        return [
          ...prev,
          {
            employeeId,
            role,
            yearMonth,
            shiftKey,
            offDays: [],
            preferredWorkDays: [],
            ...patch,
          },
        ];
      });
    },
    []
  );

  const getShiftMonthPreferenceFor = useCallback(
    (role: ShiftRole, yearMonth: string, employeeId: string, shiftKey: string) =>
      getShiftMonthPreference(employeeShiftPreferences, role, yearMonth, employeeId, shiftKey),
    [employeeShiftPreferences]
  );

  const scheduleConfig = useMemo(
    () => ({ shiftDefinitions, timeSlotRules }),
    [shiftDefinitions, timeSlotRules]
  );

  const computeWarnings = useCallback(
    (role: ShiftRole, yearMonth: string, employees: MonthlyEmployee[]) =>
      computeShiftWarnings(role, yearMonth, employees, scheduleConfig),
    [scheduleConfig]
  );

  const computeSlotStats = useCallback(
    (role: ShiftRole, yearMonth: string, employees: MonthlyEmployee[]) =>
      computeTimeSlotDayStats(role, yearMonth, employees, scheduleConfig),
    [scheduleConfig]
  );

  const getCellWarnings = useCallback(
    (
      day: number,
      shiftKey: string | null,
      role: ShiftRole,
      yearMonth: string,
      employees: MonthlyEmployee[]
    ) => getWarningsForEmployeeCell(day, shiftKey, role, yearMonth, employees, scheduleConfig),
    [scheduleConfig]
  );

  const buildEmployees = useCallback(
    (role: ShiftRole, yearMonth: string) =>
      buildMockMonthlyEmployees(role, getDaysInMonth(yearMonth), scheduleConfig, yearMonth),
    [scheduleConfig]
  );

  const runAutoScheduleForMonth = useCallback(
    (role: ShiftRole, yearMonth: string, employees: MonthlyEmployee[], actionMode?: AutoScheduleActionMode) =>
      runAutoSchedule({
        role,
        yearMonth,
        employees,
        shiftDefinitions: getShiftDefinitionsForRole(role),
        timeSlotRules: getTimeSlotRulesForRole(role),
        minShiftUnitsPerMonth: getMinShiftUnitsFromBe(role),
        preferences: getPreferencesForMonth(employeeShiftPreferences, role, yearMonth),
        actionMode,
      }),
    [employeeShiftPreferences, getMinShiftUnitsFromBe, getShiftDefinitionsForRole, getTimeSlotRulesForRole]
  );

  const value: ShiftConfigContextValue = {
    shiftDefinitions,
    setShiftDefinitions,
    timeSlotRules,
    setTimeSlotRules,
    employeeShiftPreferences,
    updateShiftMonthPreference,
    getShiftMonthPreferenceFor,
    getMinShiftUnitsFromBe,
    getShiftDefinitionsForRole,
    getTimeSlotRulesForRole,
    runAutoScheduleForMonth,
    computeWarnings,
    computeSlotStats,
    getCellWarnings,
    buildEmployees,
  };

  return <ShiftConfigContext.Provider value={value}>{children}</ShiftConfigContext.Provider>;
};

export function useShiftConfig() {
  const ctx = useContext(ShiftConfigContext);
  if (!ctx) throw new Error('useShiftConfig must be used within ShiftConfigProvider');
  return ctx;
}
