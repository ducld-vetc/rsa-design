import React from 'react';
import { AlertTriangle, Waves, Layers } from 'lucide-react';

interface AlertBadgeProps {
  className?: string;
  compact?: boolean;
}

export const OrderWarningBadge: React.FC<AlertBadgeProps> = ({ className = '', compact = false }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-red-50 text-red-700 border-red-200 leading-none align-middle ${
      compact ? 'h-4 px-1.5 text-[8px]' : 'h-5 px-2 text-[9px]'
    } ${className}`}
    title="Đơn hàng có cảnh báo cần chú ý"
  >
    <AlertTriangle
      size={compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-red-500 shrink-0 block"
    />
    <span className="leading-none">CẢNH BÁO ĐƠN</span>
  </span>
);

export const OverloadBadge: React.FC<AlertBadgeProps> = ({ className = '', compact = false }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-orange-50 text-orange-700 border-orange-200 leading-none align-middle ${
      compact ? 'h-4 px-1.5 text-[8px]' : 'h-5 px-2 text-[9px]'
    } ${className}`}
    title="Đơn vị đang quá tải đơn"
  >
    <Layers
      size={compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-orange-500 shrink-0 block"
    />
    <span className="leading-none">QUÁ TẢI ĐƠN</span>
  </span>
);

export const FloodWarningBadge: React.FC<AlertBadgeProps> = ({ className = '', compact = false }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-sky-50 text-sky-700 border-sky-200 leading-none align-middle ${
      compact ? 'h-4 px-1.5 text-[8px]' : 'h-5 px-2 text-[9px]'
    } ${className}`}
    title="Khu vực đang ngập lụt"
  >
    <Waves
      size={compact ? 9 : 11}
      strokeWidth={2.5}
      className="text-sky-500 shrink-0 block"
    />
    <span className="leading-none">NGẬP LỤT</span>
  </span>
);
