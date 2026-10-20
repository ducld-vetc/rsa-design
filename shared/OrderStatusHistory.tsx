import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface StatusEntry {
  statusId: string;
  at: string;
  actor: string;
}

const SEED: StatusEntry[] = [
  { statusId: 'WAITING_CONFIRM', at: '02/02/2026 13:40', actor: 'Hệ thống' },
  { statusId: 'DISPATCH-ASSIGNED', at: '02/02/2026 13:46', actor: 'rsa_test1' },
  { statusId: 'EXECUTE-MOVING', at: '02/02/2026 13:49', actor: 'Nguyễn Văn A' },
];

function nowLabel(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const OrderStatusHistory: React.FC<{
  currentStatus: string;
  labelOf: (statusId: string) => string;
}> = ({ currentStatus, labelOf }) => {
  const [entries, setEntries] = useState<StatusEntry[]>(SEED);

  useEffect(() => {
    setEntries((prev) => {
      if (prev[prev.length - 1]?.statusId === currentStatus) return prev;
      return [...prev, { statusId: currentStatus, at: nowLabel(), actor: 'rsa_test1' }];
    });
  }, [currentStatus]);

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-gray-100 bg-gray-50/60 md:w-72 md:border-l md:border-t-0">
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lịch sử trạng thái</p>
      </div>
      <div className="max-h-64 space-y-3 overflow-y-auto p-4 md:max-h-[520px] md:flex-1">
        {[...entries].reverse().map((entry, index) => (
          <div key={`${entry.statusId}-${entry.at}-${index}`} className="flex gap-2">
            <Clock size={12} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-800">{labelOf(entry.statusId)}</p>
              <p className="text-[10px] text-gray-400">
                {entry.at} · {entry.actor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default OrderStatusHistory;
