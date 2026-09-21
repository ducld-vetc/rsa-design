import React from 'react';
import { Star } from 'lucide-react';

interface PriorityCustomerBadgeProps {
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
}

const PriorityCustomerBadge: React.FC<PriorityCustomerBadgeProps> = ({
  className = '',
  compact = false,
  iconOnly = false,
}) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200 leading-none align-middle ${
      iconOnly
        ? 'h-5 w-5'
        : compact
          ? 'h-4 gap-1 px-1.5 text-[8px]'
          : 'h-5 gap-1 px-2 text-[9px]'
    } ${className}`}
    title="Khách hàng ưu tiên theo số điện thoại"
    aria-label="Khách hàng ưu tiên"
  >
    <Star
      size={iconOnly ? 11 : compact ? 9 : 11}
      fill="#f59e0b"
      strokeWidth={2}
      className="text-amber-500 shrink-0 block"
    />
    {!iconOnly && <span className="leading-none">ƯU TIÊN</span>}
  </span>
);

export default PriorityCustomerBadge;
