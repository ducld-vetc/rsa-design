import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Calendar, Search, Sparkles, X } from 'lucide-react';
import { getDaysInMonth } from '../data/shiftConfigMockData';
import type { EmployeeShiftMonthPreference } from '../data/autoScheduleEngine';
import type { MonthlyEmployee, ShiftRole } from '../data/shiftConfigMockData';

/** Số ngày nghỉ (unique theo lịch) tối đa / NV / tháng */
export const MAX_OFF_DAYS_PER_MONTH = 4;

type DayMark = {
  offKeys: string[];
  preferredKeys: string[];
};

type PendingPrefUpdate = {
  employeeId: string;
  shiftKey: string;
  patch: Partial<Pick<EmployeeShiftMonthPreference, 'offDays' | 'preferredWorkDays'>>;
};

type DayPopover = {
  day: number;
  top: number;
  left: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  role: ShiftRole;
  yearMonth: string;
  shiftKeys: string[];
  roster: MonthlyEmployee[];
  /** Tháng đã có lịch ca xếp → cảnh báo khi đổi mong muốn */
  scheduleAlreadyConfigured?: boolean;
  getPreference: (employeeId: string, shiftKey: string) => EmployeeShiftMonthPreference;
  onUpdatePreference: (
    employeeId: string,
    shiftKey: string,
    patch: Partial<Pick<EmployeeShiftMonthPreference, 'offDays' | 'preferredWorkDays'>>
  ) => void;
  /** Gọi sau khi user xác nhận đổi pref khi lịch đã xếp (reset auto / nhắc xếp lại) */
  onConfirmedChangeAfterSchedule?: () => void;
};

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function withoutDay(days: number[], day: number): number[] {
  return days.filter((d) => d !== day);
}

function withDay(days: number[], day: number): number[] {
  return days.includes(day) ? days : [...days, day].sort((a, b) => a - b);
}

const EmployeeShiftPreferenceModal: React.FC<Props> = ({
  open,
  onClose,
  role,
  yearMonth,
  shiftKeys,
  roster,
  scheduleAlreadyConfigured = false,
  getPreference,
  onUpdatePreference,
  onConfirmedChangeAfterSchedule,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [pendingPrefUpdate, setPendingPrefUpdate] = useState<PendingPrefUpdate | null>(null);
  const [rescheduleWarningAccepted, setRescheduleWarningAccepted] = useState(false);
  const [dayPopover, setDayPopover] = useState<DayPopover | null>(null);
  const [offDaysLimitWarning, setOffDaysLimitWarning] = useState(false);

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
    if (!roster.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(roster[0]?.id ?? '');
    }
  }, [open, roster, selectedEmployeeId]);

  useEffect(() => {
    if (!open) {
      setEmployeeSearch('');
      setPendingPrefUpdate(null);
      setRescheduleWarningAccepted(false);
      setDayPopover(null);
      setOffDaysLimitWarning(false);
    }
  }, [open]);

  useEffect(() => {
    if (filteredRoster.length > 0 && !filteredRoster.some((e) => e.id === selectedEmployeeId)) {
      setSelectedEmployeeId(filteredRoster[0].id);
    }
  }, [filteredRoster, selectedEmployeeId]);

  const selectedEmployee = roster.find((e) => e.id === selectedEmployeeId) ?? roster[0];

  /** Tổng hợp nghỉ / muốn đi theo ngày — tất cả KEY ca (NV đang chọn) */
  const dayMarks = useMemo(() => {
    const map = new Map<number, DayMark>();
    if (!selectedEmployee) return map;
    shiftKeys.forEach((shiftKey) => {
      const pref = getPreference(selectedEmployee.id, shiftKey);
      pref.offDays.forEach((day) => {
        const cur = map.get(day) ?? { offKeys: [], preferredKeys: [] };
        if (!cur.offKeys.includes(shiftKey)) cur.offKeys.push(shiftKey);
        map.set(day, cur);
      });
      pref.preferredWorkDays.forEach((day) => {
        const cur = map.get(day) ?? { offKeys: [], preferredKeys: [] };
        if (!cur.preferredKeys.includes(shiftKey)) cur.preferredKeys.push(shiftKey);
        map.set(day, cur);
      });
    });
    return map;
  }, [selectedEmployee, shiftKeys, getPreference]);

  const uniqueOffDayCount = useMemo(() => {
    let n = 0;
    dayMarks.forEach((mark) => {
      if (mark.offKeys.length > 0) n += 1;
    });
    return n;
  }, [dayMarks]);

  const employeeDayMarkCount = (employeeId: string) => {
    let count = 0;
    shiftKeys.forEach((shiftKey) => {
      const p = getPreference(employeeId, shiftKey);
      count += p.offDays.length + p.preferredWorkDays.length;
    });
    return count;
  };

  const commitPreference = (update: PendingPrefUpdate, notifyReschedule: boolean) => {
    onUpdatePreference(update.employeeId, update.shiftKey, update.patch);
    if (notifyReschedule) {
      setRescheduleWarningAccepted(true);
      onConfirmedChangeAfterSchedule?.();
    }
  };

  const applyPreferenceUpdate = (update: PendingPrefUpdate) => {
    if (scheduleAlreadyConfigured && !rescheduleWarningAccepted) {
      setPendingPrefUpdate(update);
      return;
    }
    commitPreference(update, false);
  };

  const countUniqueOffDaysAfter = (
    employeeId: string,
    shiftKey: string,
    nextOffDays: number[]
  ): number => {
    const days = new Set<number>();
    shiftKeys.forEach((key) => {
      const pref = getPreference(employeeId, key);
      const offs = key === shiftKey ? nextOffDays : pref.offDays;
      offs.forEach((d) => days.add(d));
    });
    return days.size;
  };

  const setShiftDayStatus = (
    day: number,
    shiftKey: string,
    status: 'off' | 'preferred' | 'clear'
  ) => {
    if (!selectedEmployee) return;
    const pref = getPreference(selectedEmployee.id, shiftKey);

    let offDays = withoutDay(pref.offDays, day);
    let preferredWorkDays = withoutDay(pref.preferredWorkDays, day);

    if (status === 'off') {
      const nextOff = withDay(offDays, day);
      if (countUniqueOffDaysAfter(selectedEmployee.id, shiftKey, nextOff) > MAX_OFF_DAYS_PER_MONTH) {
        setOffDaysLimitWarning(true);
        return;
      }
      offDays = nextOff;
    } else if (status === 'preferred') {
      preferredWorkDays = withDay(preferredWorkDays, day);
    }

    applyPreferenceUpdate({
      employeeId: selectedEmployee.id,
      shiftKey,
      patch: { offDays, preferredWorkDays },
    });
  };

  const openDayPopover = (day: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const popoverWidth = 220;
    const left = Math.min(
      Math.max(8, rect.left + rect.width / 2 - popoverWidth / 2),
      window.innerWidth - popoverWidth - 8
    );
    const top = Math.min(rect.bottom + 6, window.innerHeight - 280);
    setDayPopover({ day, top, left });
  };

  const confirmPendingPrefUpdate = () => {
    if (!pendingPrefUpdate) return;
    commitPreference(pendingPrefUpdate, true);
    setPendingPrefUpdate(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="bg-vetc-green text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <div>
              <h3 className="font-bold text-sm">
                Mong muốn theo ca — {role} tháng {monthLabel}
              </h3>
              <p className="text-[10px] opacity-90 font-normal">
                Bấm ngày trên lịch → chọn ca (nghỉ / muốn đi làm) ngay trên ô
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={18} />
          </button>
        </div>

        {scheduleAlreadyConfigured && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-start gap-2 shrink-0 text-left">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-snug">
              <strong>Lịch ca tháng đã được xếp.</strong> Nếu bạn thay đổi mong muốn, cần{' '}
              <strong>xếp lại ca tháng</strong> (Sắp xếp ca mặc định / Bổ sung ca gãy) để lịch khớp mong
              muốn mới.
              {rescheduleWarningAccepted && (
                <span className="block mt-0.5 text-amber-700">
                  Đã xác nhận thay đổi trong phiên này — nhớ chạy lại sắp xếp ca.
                </span>
              )}
            </p>
          </div>
        )}

        {shiftKeys.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Chưa có ca làm việc để cấu hình.</p>
        ) : roster.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Chưa có nhân viên trong lịch tháng này.</p>
        ) : (
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
                    const count = employeeDayMarkCount(emp.id);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setDayPopover(null);
                        }}
                        className={`w-full text-left px-3 py-2.5 border-b transition-colors ${
                          selectedEmployee?.id === emp.id
                            ? 'bg-white border-l-2 border-l-vetc-green'
                            : 'hover:bg-white/80 border-l-2 border-l-transparent'
                        }`}
                      >
                        <div className="font-bold text-gray-800 text-xs leading-tight truncate">
                          {emp.name}
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono">{emp.code}</div>
                        {count > 0 && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-vetc-green/10 text-vetc-green text-[8px] font-bold">
                            {count} đánh dấu
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
                    <p className="text-sm font-bold text-gray-800">{selectedEmployee.name}</p>
                    <p
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                        uniqueOffDayCount >= MAX_OFF_DAYS_PER_MONTH
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Ngày nghỉ: {uniqueOffDayCount}/{MAX_OFF_DAYS_PER_MONTH}
                    </p>
                  </div>

                  <p className="text-[11px] text-gray-500 text-left">
                    Bấm một ngày để mở danh sách ca — chọn <strong>Nghỉ</strong> hoặc{' '}
                    <strong>Muốn đi</strong>. Lịch hiển thị đồng thời cả hai loại.
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
                      const mark = dayMarks.get(day) ?? { offKeys: [], preferredKeys: [] };
                      const hasOff = mark.offKeys.length > 0;
                      const hasPref = mark.preferredKeys.length > 0;
                      const isOpen = dayPopover?.day === day;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={(e) => openDayPopover(day, e.currentTarget)}
                          className={`min-h-[4.5rem] rounded-lg text-xs font-bold border transition-all p-1 flex flex-col items-stretch gap-0.5 ${
                            isOpen
                              ? 'border-vetc-green ring-2 ring-vetc-green/30 bg-green-50'
                              : hasOff && hasPref
                                ? 'bg-white border-slate-300'
                                : hasOff
                                  ? 'bg-red-50/80 border-red-200'
                                  : hasPref
                                    ? 'bg-emerald-50/80 border-emerald-200'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-vetc-green hover:bg-green-50'
                          }`}
                          title={`Ngày ${day}${
                            hasOff ? ` · Nghỉ: ${mark.offKeys.join(', ')}` : ''
                          }${hasPref ? ` · Muốn đi: ${mark.preferredKeys.join(', ')}` : ''}`}
                        >
                          <span className="text-[11px] text-gray-800 leading-none">{day}</span>
                          <div className="flex flex-col gap-0.5 flex-1 justify-end min-h-0 overflow-hidden">
                            {mark.offKeys.slice(0, 2).map((k) => (
                              <span
                                key={`off-${k}`}
                                className="truncate px-0.5 rounded text-[7px] font-black leading-tight bg-red-100 text-red-800 border border-red-200"
                              >
                                {k} nghỉ
                              </span>
                            ))}
                            {mark.offKeys.length > 2 && (
                              <span className="text-[7px] text-red-600 font-bold">
                                +{mark.offKeys.length - 2}
                              </span>
                            )}
                            {mark.preferredKeys.slice(0, 2).map((k) => (
                              <span
                                key={`pref-${k}`}
                                className="truncate px-0.5 rounded text-[7px] font-black leading-tight bg-emerald-100 text-emerald-800 border border-emerald-200"
                              >
                                {k} đi
                              </span>
                            ))}
                            {mark.preferredKeys.length > 2 && (
                              <span className="text-[7px] text-emerald-700 font-bold">
                                +{mark.preferredKeys.length - 2}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 pt-1 border-t">
                    <span className="flex items-center gap-1">
                      <span className="px-1 rounded bg-red-100 border border-red-200 text-red-800 font-bold text-[8px]">
                        C1 nghỉ
                      </span>
                      Ngày nghỉ (theo ca)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="px-1 rounded bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[8px]">
                        C1 đi
                      </span>
                      Muốn đi làm (theo ca)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Tháng {monthLabel}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
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

      {dayPopover && selectedEmployee && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[78] cursor-default"
            aria-label="Đóng chọn ca"
            onClick={() => setDayPopover(null)}
          />
          <div
            className="fixed z-[79] w-[220px] bg-white border-2 border-vetc-green rounded-xl shadow-xl p-2 space-y-1.5 text-left"
            style={{ top: dayPopover.top, left: dayPopover.left }}
          >
            <div className="flex items-center justify-between px-1 pb-1 border-b">
              <p className="text-[11px] font-bold text-gray-800">
                Ngày {dayPopover.day} — chọn ca
              </p>
              <button
                type="button"
                onClick={() => setDayPopover(null)}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400"
              >
                <X size={14} />
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5">
              {shiftKeys.map((shiftKey) => {
                const pref = getPreference(selectedEmployee.id, shiftKey);
                const isOff = pref.offDays.includes(dayPopover.day);
                const isPref = pref.preferredWorkDays.includes(dayPopover.day);
                return (
                  <div
                    key={shiftKey}
                    className="rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-1.5 space-y-1"
                  >
                    <div className="font-mono text-[11px] font-black text-gray-800">{shiftKey}</div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setShiftDayStatus(dayPopover.day, shiftKey, isOff ? 'clear' : 'off')
                        }
                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                          isOff
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        Nghỉ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShiftDayStatus(
                            dayPopover.day,
                            shiftKey,
                            isPref ? 'clear' : 'preferred'
                          )
                        }
                        className={`flex-1 py-1 rounded text-[9px] font-bold border transition-colors ${
                          isPref
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        Muốn đi
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {offDaysLimitWarning && (
        <div className="fixed inset-0 z-[82] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 text-left animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Quá số ngày nghỉ cho phép</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Mỗi nhân viên chỉ được đánh dấu tối đa{' '}
                  <strong>{MAX_OFF_DAYS_PER_MONTH} ngày nghỉ / tháng</strong> (tính theo ngày lịch, gộp
                  mọi ca). Hiện đã có <strong>{uniqueOffDayCount}</strong> ngày nghỉ.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOffDaysLimitWarning(false)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingPrefUpdate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5 space-y-4 text-left animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Lịch ca tháng đã xếp xong</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Tháng này đã có lịch ca. Nếu bạn thay đổi mong muốn theo ca, cần{' '}
                  <strong>xếp lại ca tháng</strong> để áp dụng mong muốn mới.
                </p>
                <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                  Xác nhận sẽ lưu thay đổi mong muốn và khóa lại bước <strong>Bổ sung ca gãy</strong> —
                  hãy chạy lại <strong>Sắp xếp ca mặc định</strong>.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingPrefUpdate(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmPendingPrefUpdate}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-bold hover:bg-amber-700"
              >
                Đổi mong muốn — sẽ xếp lại ca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeShiftPreferenceModal;
