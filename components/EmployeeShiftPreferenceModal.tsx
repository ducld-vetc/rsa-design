import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Search, Sparkles, X } from 'lucide-react';
import { getDaysInMonth } from '../data/shiftConfigMockData';
import type { EmployeeShiftMonthPreference } from '../data/autoScheduleEngine';
import type { MonthlyEmployee, ShiftRole } from '../data/shiftConfigMockData';

type DayMode = 'off' | 'preferred';

type Props = {
  open: boolean;
  onClose: () => void;
  role: ShiftRole;
  yearMonth: string;
  shiftKeys: string[];
  roster: MonthlyEmployee[];
  getPreference: (employeeId: string, shiftKey: string) => EmployeeShiftMonthPreference;
  onUpdatePreference: (
    employeeId: string,
    shiftKey: string,
    patch: Partial<Pick<EmployeeShiftMonthPreference, 'offDays' | 'preferredWorkDays'>>
  ) => void;
};

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toggleDay(days: number[], day: number): number[] {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b);
}

const EmployeeShiftPreferenceModal: React.FC<Props> = ({
  open,
  onClose,
  role,
  yearMonth,
  shiftKeys,
  roster,
  getPreference,
  onUpdatePreference,
}) => {
  const [activeShiftKey, setActiveShiftKey] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [dayMode, setDayMode] = useState<DayMode>('off');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const filteredRoster = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
    );
  }, [roster, employeeSearch]);

  const daysInMonth = getDaysInMonth(yearMonth);
  const dayNumbers = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const monthLabel = `${yearMonth.slice(5, 7)}/${yearMonth.slice(0, 4)}`;
  const currentShift = activeShiftKey || shiftKeys[0] || '';

  const firstDayOffset = useMemo(() => {
    const [y, m] = yearMonth.split('-').map(Number);
    const dow = new Date(y, m - 1, 1).getDay();
    return dow === 0 ? 6 : dow - 1;
  }, [yearMonth]);

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [
      ...Array.from({ length: firstDayOffset }, () => null),
      ...dayNumbers,
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [firstDayOffset, dayNumbers]);

  useEffect(() => {
    if (!open) return;
    if (!shiftKeys.includes(activeShiftKey)) {
      setActiveShiftKey(shiftKeys[0] ?? '');
    }
    if (!roster.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(roster[0]?.id ?? '');
    }
  }, [open, shiftKeys, activeShiftKey, roster, selectedEmployeeId]);

  useEffect(() => {
    if (!open) setEmployeeSearch('');
  }, [open]);

  useEffect(() => {
    if (filteredRoster.length > 0 && !filteredRoster.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(filteredRoster[0].id);
    }
  }, [filteredRoster, selectedEmployeeId]);

  const selectedEmployee = roster.find((e) => e.id === selectedEmployeeId) ?? roster[0];
  const pref = selectedEmployee
    ? getPreference(selectedEmployee.id, currentShift)
    : { offDays: [] as number[], preferredWorkDays: [] as number[] };

  const handleDayClick = (day: number) => {
    if (!selectedEmployee || !currentShift) return;
    if (dayMode === 'off') {
      const offDays = toggleDay(pref.offDays, day);
      const preferredWorkDays = pref.preferredWorkDays.filter((d) => d !== day);
      onUpdatePreference(selectedEmployee.id, currentShift, { offDays, preferredWorkDays });
    } else {
      const preferredWorkDays = toggleDay(pref.preferredWorkDays, day);
      const offDays = pref.offDays.filter((d) => d !== day);
      onUpdatePreference(selectedEmployee.id, currentShift, { offDays, preferredWorkDays });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="bg-vetc-green text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <div>
              <h3 className="font-bold text-sm">Mong muốn theo ca — {role} tháng {monthLabel}</h3>
              <p className="text-[10px] opacity-90 font-normal">Bấm chọn ngày trên lịch — không cần nhập tay</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={18} />
          </button>
        </div>

        {shiftKeys.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Chưa có ca làm việc để cấu hình.</p>
        ) : roster.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Chưa có nhân viên trong lịch tháng này.</p>
        ) : (
          <>
            <div className="px-4 py-2 border-b bg-gray-50 flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Ca:</span>
              {shiftKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveShiftKey(key)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
                    currentShift === key
                      ? 'bg-vetc-green text-white border-vetc-green'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
              <div className="w-44 sm:w-52 border-r flex flex-col shrink-0 bg-gray-50/50 min-h-0">
                <div className="p-2 border-b bg-white shrink-0">
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="search"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder="Tìm tên, mã NV..."
                      className="w-full pl-7 pr-2 py-1.5 text-[11px] border rounded-lg outline-none focus:border-vetc-green bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                  {filteredRoster.length === 0 ? (
                    <p className="px-3 py-4 text-[10px] text-gray-400 text-center">Không tìm thấy NV</p>
                  ) : (
                    filteredRoster.map((emp) => {
                      const p = getPreference(emp.id, currentShift);
                      const count = p.offDays.length + p.preferredWorkDays.length;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className={`w-full text-left px-3 py-2.5 border-b transition-colors ${
                            selectedEmployee?.id === emp.id
                              ? 'bg-white border-l-2 border-l-vetc-green'
                              : 'hover:bg-white/80 border-l-2 border-l-transparent'
                          }`}
                        >
                          <div className="font-bold text-gray-800 text-xs leading-tight truncate">{emp.name}</div>
                          <div className="text-[9px] text-gray-400 font-mono">{emp.code}</div>
                          {count > 0 && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-vetc-green/10 text-vetc-green text-[8px] font-bold">
                              {count} ngày
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {selectedEmployee && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-800">
                        {selectedEmployee.name}{' '}
                        <span className="font-mono text-gray-400 text-xs">— ca {currentShift}</span>
                      </p>
                      <div className="flex rounded-lg border overflow-hidden text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setDayMode('off')}
                          className={`px-3 py-1.5 transition-colors ${
                            dayMode === 'off'
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          Ngày nghỉ
                        </button>
                        <button
                          type="button"
                          onClick={() => setDayMode('preferred')}
                          className={`px-3 py-1.5 transition-colors border-l ${
                            dayMode === 'preferred'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-emerald-50'
                          }`}
                        >
                          Muốn đi làm
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      Chế độ <strong>{dayMode === 'off' ? 'Ngày nghỉ' : 'Muốn đi làm'}</strong> — bấm ngày để
                      bật/tắt. Một ngày chỉ thuộc một loại.
                    </p>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAY_LABELS.map((label) => (
                        <div key={label} className="text-[9px] font-black text-gray-400 py-1">
                          {label}
                        </div>
                      ))}
                      {calendarCells.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }
                        const isOff = pref.offDays.includes(day);
                        const isPreferred = pref.preferredWorkDays.includes(day);

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(day)}
                            className={`aspect-square rounded-lg text-xs font-bold border transition-all ${
                              isOff
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : isPreferred
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-vetc-green hover:bg-green-50'
                            }`}
                            title={
                              isOff
                                ? `Ngày nghỉ ca ${currentShift}`
                                : isPreferred
                                  ? `Muốn đi làm ca ${currentShift}`
                                  : `Ngày ${day}`
                            }
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 pt-1 border-t">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Ngày nghỉ ({pref.offDays.length})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Muốn đi làm ({pref.preferredWorkDays.length})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> Tháng {monthLabel}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <div className="px-5 py-3 border-t bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-vetc-green text-white font-bold text-sm hover:bg-green-700"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeShiftPreferenceModal;
