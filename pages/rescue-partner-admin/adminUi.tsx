import React from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import AppMultiSelect from '../../shared/AppMultiSelect';
import type { AppSelectOption } from '../../shared/AppSelect';
import type { PartnerStatus } from '../../data/rescuePartnerAdminMockData';

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const inputClass =
  'w-full min-w-0 box-border h-[34px] border rounded px-3 text-sm leading-none outline-none focus:border-vetc-green placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed';
export const labelClass = 'block text-xs font-semibold text-gray-600 mb-1';
export const selectClass = `${inputClass} bg-white`;

export const filterLabelClass = 'w-32 shrink-0 text-xs font-semibold text-gray-600 leading-snug';

export function CombinedSearchBar<T extends string>({
  field,
  value,
  options,
  onFieldChange,
  onValueChange,
  onSubmit,
}: {
  field: T;
  value: string;
  options: { value: T; label: string }[];
  onFieldChange: (field: T) => void;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const selected = options.find((opt) => opt.value === field);
  const placeholder = selected ? `Tìm kiếm theo ${selected.label}` : 'Tìm kiếm';

  return (
    <div className="flex h-[34px] min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-vetc-green">
      <div className="relative h-full w-[148px] shrink-0">
        <select
          value={field}
          onChange={(e) => onFieldChange(e.target.value as T)}
          className="h-full w-full cursor-pointer appearance-none bg-transparent pl-3 pr-7 text-sm text-gray-700 outline-none"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="h-5 w-px shrink-0 bg-gray-200" />
      <div className="relative flex h-full min-w-0 flex-1 items-center">
        <Search size={15} className="pointer-events-none absolute left-2.5 shrink-0 text-gray-400" />
        <input
          className="h-full w-full min-w-0 bg-transparent pl-8 pr-3 text-sm outline-none placeholder:text-gray-400"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        />
      </div>
    </div>
  );
}

export const buildPageItems = (currentPage: number, totalPages: number): Array<number | 'ellipsis'> => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
};

export const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center space-x-2 font-bold text-sm uppercase tracking-wide">
    {icon}
    <span>{title}</span>
  </div>
);

export const StatusBadge: React.FC<{ status: PartnerStatus }> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold text-vetc-green whitespace-nowrap">
        Hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold text-gray-500 whitespace-nowrap">
      Không hoạt động
    </span>
  );
};

export const RequiredMark: React.FC = () => <span className="text-red-500">*</span>;

export const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className={labelClass}>
    {children}
    {required ? (
      <>
        {' '}
        <RequiredMark />
      </>
    ) : null}
  </label>
);

export const TagMultiSelect: React.FC<{
  values: string[];
  options: AppSelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}> = ({ values, options, onChange, placeholder, disabled }) => {
  const selected = options.filter((o) => values.includes(o.value));
  return (
    <div className="space-y-2">
      <AppMultiSelect
        values={values}
        options={options}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex max-w-full items-center gap-1 rounded bg-green-50 text-green-800 border border-green-200 px-2 py-0.5 text-[11px] font-semibold"
            >
              <span className="min-w-0 truncate">{opt.label}</span>
              {!disabled && (
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-green-700 hover:bg-green-100"
                  aria-label={`Bỏ ${opt.label}`}
                  onClick={() => onChange(values.filter((v) => v !== opt.value))}
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const ToggleChipGrid: React.FC<{
  values: string[];
  options: AppSelectOption[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}> = ({ values, options, onChange, disabled }) => {
  const selectedSet = new Set(values);
  const toggle = (value: string) => {
    if (disabled) return;
    if (selectedSet.has(value)) onChange(values.filter((item) => item !== value));
    else onChange([...values, value]);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {options.map((opt) => {
        const on = selectedSet.has(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={`flex h-[38px] items-center justify-between gap-2 rounded border px-3 text-left text-[12px] font-semibold transition-colors ${
              on
                ? 'border-vetc-green bg-green-50 text-green-800'
                : 'border-gray-200 bg-white text-gray-600'
            } ${disabled ? 'cursor-default opacity-80' : 'hover:border-vetc-green'}`}
            title={opt.label}
          >
            <span className="min-w-0 flex-1 truncate leading-none">{opt.label}</span>
            <span
              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                on ? 'border-vetc-green bg-vetc-green text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {on ? <Check size={11} strokeWidth={3} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
};

interface PaginationBarProps {
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  unitLabel: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: string;
  onGoToPageChange: (v: string) => void;
  onGoToPage: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  rangeStart,
  rangeEnd,
  totalItems,
  unitLabel,
  currentPage,
  totalPages,
  pageSize,
  goToPage,
  onGoToPageChange,
  onGoToPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const pageItems = buildPageItems(currentPage, totalPages);
  return (
    <div className="px-4 py-3 border-t bg-white flex flex-col xl:flex-row items-center justify-between gap-4 rounded-b-lg">
      <div className="text-sm text-gray-600 whitespace-nowrap">
        {rangeStart}-{rangeEnd} của {totalItems} {unitLabel}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="min-w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {pageItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className="min-w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  currentPage === item
                    ? 'bg-green-50 text-vetc-green border border-vetc-green'
                    : 'text-gray-600 hover:border-vetc-green hover:text-vetc-green border border-transparent'
                }`}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="min-w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none border border-gray-200 rounded pl-3 pr-8 py-1.5 text-sm text-gray-600 bg-white outline-none focus:border-vetc-green cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Go to</span>
          <input
            type="text"
            value={goToPage}
            onChange={(e) => onGoToPageChange(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && onGoToPage()}
            className="w-12 border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none focus:border-vetc-green"
          />
          <span>Page</span>
        </div>
      </div>
    </div>
  );
};

export const primaryBtnClass =
  'flex items-center space-x-2 bg-vetc-green text-white px-5 py-2 rounded font-bold text-sm hover:bg-green-700 transition-all shadow-sm';
export const outlineBtnClass =
  'flex items-center space-x-2 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded font-bold text-sm hover:border-vetc-green hover:text-vetc-green transition-all';

/** Giống bảng phí trên Quản lý đơn hàng / chi tiết đơn */
export const dataTableWrapClass = 'overflow-x-auto rounded border';
export const dataTableClass = 'w-full border-collapse text-[11px]';
export const dataTheadRowClass = 'bg-green-50/50 text-gray-600 border-b';
export const dataThClass = (align: 'left' | 'center' | 'right' = 'left') =>
  `p-2 border font-bold ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`;
export const dataTbodyRowClass = 'border-b hover:bg-gray-50 transition-colors';
export const dataTdClass = (align: 'left' | 'center' | 'right' = 'left') =>
  `p-2 border align-middle ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`;

export const AdminDialog: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-lg border bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
        <SectionHeader title={title} />
        <div className="p-4">{children}</div>
        <div className="flex justify-end gap-2 border-t px-4 py-3 bg-gray-50">{footer}</div>
      </div>
    </div>
  );
};
