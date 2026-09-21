import React from 'react';
import { AlertTriangle, Waves, Layers, Smartphone, CheckCircle2, Clock } from 'lucide-react';

interface AlertBadgeProps {
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
}

const badgeSize = (iconOnly?: boolean, compact?: boolean) =>
  iconOnly
    ? 'h-5 w-5'
    : compact
      ? 'h-4 gap-1 px-1.5 text-[8px]'
      : 'h-5 gap-1 px-2 text-[9px]';

export const OrderWarningBadge: React.FC<AlertBadgeProps> = ({
  className = '',
  compact = false,
  iconOnly = false,
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-red-50 text-red-700 border-red-200 leading-none align-middle ${badgeSize(iconOnly, compact)} ${className}`}
    title="Đơn hàng có cảnh báo cần chú ý"
    aria-label="Cảnh báo đơn"
  >
    <AlertTriangle
      size={iconOnly ? 11 : compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-red-500 shrink-0 block"
    />
    {!iconOnly && <span className="leading-none">CẢNH BÁO ĐƠN</span>}
  </span>
);

export const OverloadBadge: React.FC<AlertBadgeProps> = ({
  className = '',
  compact = false,
  iconOnly = false,
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-orange-50 text-orange-700 border-orange-200 leading-none align-middle ${badgeSize(iconOnly, compact)} ${className}`}
    title="Đơn vị đang quá tải đơn"
    aria-label="Quá tải đơn"
  >
    <Layers
      size={iconOnly ? 11 : compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-orange-500 shrink-0 block"
    />
    {!iconOnly && <span className="leading-none">QUÁ TẢI ĐƠN</span>}
  </span>
);

export const FloodWarningBadge: React.FC<AlertBadgeProps> = ({
  className = '',
  compact = false,
  iconOnly = false,
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-sky-50 text-sky-700 border-sky-200 leading-none align-middle ${badgeSize(iconOnly, compact)} ${className}`}
    title="Khu vực đang ngập lụt"
    aria-label="Ngập lụt"
  >
    <Waves
      size={iconOnly ? 11 : compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-sky-500 shrink-0 block"
    />
    {!iconOnly && <span className="leading-none">NGẬP LỤT</span>}
  </span>
);

export const CustomerUpdatedBadge: React.FC<AlertBadgeProps & { updated?: boolean }> = ({
  className = '',
  compact = false,
  iconOnly = false,
  updated = true,
}) => {
  const pending = !updated;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap leading-none align-middle ${
        pending
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
      } ${badgeSize(iconOnly, compact)} ${className}`}
      title={pending ? 'Chờ khách hàng cập nhật từ app' : 'Khách hàng cập nhật từ app'}
      aria-label={pending ? 'Chờ cập nhật' : 'Khách hàng'}
    >
      {pending ? (
        <Clock
          size={iconOnly ? 11 : compact ? 9 : 11}
          strokeWidth={2.5}
          className="text-amber-500 shrink-0 block"
        />
      ) : (
        <Smartphone
          size={iconOnly ? 11 : compact ? 9 : 11}
          strokeWidth={2.5}
          className="text-indigo-500 shrink-0 block"
        />
      )}
      {!iconOnly && <span className="leading-none">{pending ? 'Chờ cập nhật' : 'Khách hàng'}</span>}
    </span>
  );
};

export const CustomerUpdateStatusBadge: React.FC<{
  status: 'waiting' | 'completed';
  time?: string | null;
  onClick?: () => void;
  className?: string;
  iconOnly?: boolean;
}> = ({ status, time, onClick, className = '', iconOnly = false }) => {
  const completed = status === 'completed';
  return (
    <button
      type="button"
      onClick={onClick}
      title={
        completed
          ? `Khách hàng đã gửi vị trí, ảnh và mô tả${time ? ` lúc ${time}` : ''}`
          : `Đã gửi thông báo${time ? ` lúc ${time}` : ''} — đang chờ khách hàng cập nhật`
      }
      aria-label={completed ? 'Khách hàng đã cập nhật' : 'Đang chờ khách hàng cập nhật'}
      className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap leading-none align-middle transition-colors ${
        iconOnly ? 'h-5 w-5' : 'h-5 gap-1 px-2 text-[9px]'
      } ${
        completed
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
      } ${className}`}
    >
      {completed ? (
        <CheckCircle2 size={11} strokeWidth={2.5} className="text-green-600 shrink-0 block" />
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
      )}
      {!iconOnly && (
        <span className="leading-none">{completed ? 'KH ĐÃ CẬP NHẬT' : 'ĐANG CHỜ KH'}</span>
      )}
    </button>
  );
};
