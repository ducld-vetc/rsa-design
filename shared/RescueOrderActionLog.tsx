import React, { useMemo, useState } from 'react';
import {
  ACTION_LOG_GROUPS,
  ActionLogDiff,
  ActionLogGroup,
  buildRescueOrderActionLog,
} from '../data/rescueOrderActionLogMock';

const GROUP_PILL: Record<ActionLogGroup, string> = {
  lifecycle: 'border-green-200 bg-green-50 text-green-700',
  incident: 'border-sky-200 bg-sky-50 text-sky-700',
  dispatch: 'border-orange-200 bg-orange-50 text-orange-700',
  fee: 'border-amber-200 bg-amber-50 text-amber-700',
  payment: 'border-blue-200 bg-blue-50 text-blue-700',
  file: 'border-violet-200 bg-violet-50 text-violet-700',
  invoice: 'border-teal-200 bg-teal-50 text-teal-700',
};

function diffText(diffs: ActionLogDiff[], side: 'before' | 'after') {
  if (diffs.length === 0) return '—';
  if (diffs.length === 1) return diffs[0][side];
  return diffs.map((diff) => `${diff.field}: ${diff[side]}`).join(' · ');
}

const RescueOrderActionLog: React.FC<{
  statusId: string;
  customerName: string;
  plate: string;
  address: string;
  serviceName: string;
}> = ({ statusId, customerName, plate, address, serviceName }) => {
  const [group, setGroup] = useState<'all' | ActionLogGroup>('all');

  const entries = useMemo(
    () => buildRescueOrderActionLog(statusId, { customerName, plate, address, serviceName }),
    [statusId, customerName, plate, address, serviceName]
  );

  const visible = useMemo(
    () => (group === 'all' ? entries : entries.filter((entry) => entry.group === group)),
    [entries, group]
  );

  const groupLabel = (id: ActionLogGroup) =>
    ACTION_LOG_GROUPS.find((item) => item.id === id)?.label ?? id;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5">
        {ACTION_LOG_GROUPS.map((item) => {
          const active = group === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setGroup(item.id)}
              className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                active ? 'bg-[#00A859] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="px-4 py-8 text-center text-[13px] text-gray-400">
          Không có sự kiện khớp bộ lọc
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px] text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-[13px] font-medium text-gray-500">
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">Thời gian</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">Người thực hiện</th>
                <th className="whitespace-nowrap px-3 py-2.5 font-medium">Loại</th>
                <th className="px-3 py-2.5 font-medium">Trước</th>
                <th className="px-3 py-2.5 font-medium">Sau</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 last:border-b-0">
                  <td className="whitespace-nowrap px-3 py-3 align-middle">{entry.at}</td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle">
                    {entry.actor} <span className="text-gray-500">({entry.channel})</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle">
                    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none ${GROUP_PILL[entry.group]}`}>
                      {groupLabel(entry.group)}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-middle">{diffText(entry.diffs, 'before')}</td>
                  <td className="px-3 py-3 align-middle">{diffText(entry.diffs, 'after')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RescueOrderActionLog;
