import React, { useEffect, useRef, useState } from 'react';
import { Clock, Pencil } from 'lucide-react';
import { STATUS_OPTIONS } from './StatusUpdateModal';

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

function statusLabel(statusId: string): string {
  return STATUS_OPTIONS.flatMap((group) => group.items).find((item) => item.id === statusId)?.label ?? statusId;
}

function nowLabel(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const OrderStatusHistory: React.FC<{
  currentStatus: string;
  canUpdate: boolean;
  onUpdate: () => void;
}> = ({ currentStatus, canUpdate, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<StatusEntry[]>(SEED);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEntries((prev) => {
      if (prev[prev.length - 1]?.statusId === currentStatus) return prev;
      return [...prev, { statusId: currentStatus, at: nowLabel(), actor: 'rsa_test1' }];
    });
  }, [currentStatus]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-1 text-[10px] font-bold text-blue-600 hover:underline"
      >
        Lịch sử trạng thái
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-xl">
          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-gray-400">Lịch sử đổi trạng thái</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {[...entries].reverse().map((entry, index) => (
              <div key={`${entry.statusId}-${entry.at}-${index}`} className="flex gap-2">
                <Clock size={12} className="mt-0.5 shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-800">{statusLabel(entry.statusId)}</p>
                  <p className="text-[10px] text-gray-400">
                    {entry.at} · {entry.actor}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onUpdate();
              }}
              className="mt-3 flex w-full items-center justify-center space-x-2 rounded-xl bg-vetc-green py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
            >
              <Pencil size={14} />
              <span>Cập nhật trạng thái thủ công</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatusHistory;
