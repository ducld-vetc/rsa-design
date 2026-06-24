import React from 'react';
import { Star } from 'lucide-react';

interface PriorityCustomerBadgeProps {
  className?: string;
  compact?: boolean;
}

const PriorityCustomerBadge: React.FC<PriorityCustomerBadgeProps> = ({ className = '', compact = false }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 rounded-full border font-black uppercase tracking-wide whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200 leading-none align-middle ${
      compact ? 'h-4 px-1.5 text-[8px]' : 'h-5 px-2 text-[9px]'
    } ${className}`}
    title="Khách hàng ưu tiên theo số điện thoại"
  >
    <Star
      size={compact ? 9 : 11}
      fill="#f59e0b"
      strokeWidth={2}
      className="text-amber-500 shrink-0 block"
    />
    <span className="leading-none">ƯU TIÊN</span>
  </span>
);

export default PriorityCustomerBadge;
