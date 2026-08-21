import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import type { AppSelectOption } from './AppSelect';

interface AppMultiSelectProps {
  values: string[];
  options: AppSelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

const AppMultiSelect: React.FC<AppMultiSelectProps> = ({
  values,
  options,
  onChange,
  placeholder = 'Chọn giá trị',
  searchPlaceholder = 'Tìm kiếm...',
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const selectedSet = useMemo(() => new Set(values), [values]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi');
    if (!q) return options;
    return options.filter((option) => option.label.toLocaleLowerCase('vi').includes(q));
  }, [options, query]);

  const triggerLabel = useMemo(() => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return options.find((option) => option.value === values[0])?.label ?? placeholder;
    }
    return `${values.length} đã chọn`;
  }, [values, options, placeholder]);

  const toggleValue = (value: string) => {
    if (selectedSet.has(value)) onChange(values.filter((item) => item !== value));
    else onChange([...values, value]);
  };

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className="flex h-[34px] w-full min-w-0 items-center justify-between gap-2 rounded border bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-vetc-green disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      >
        <span className={`min-w-0 flex-1 truncate text-left ${values.length === 0 ? 'text-gray-400' : ''}`}>
          {triggerLabel}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-[200] mt-1 w-full min-w-[220px] overflow-hidden rounded-lg border bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-gray-100 px-2.5 py-2">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-gray-700 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Xóa tìm kiếm"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto p-1" role="listbox" aria-multiselectable>
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-gray-400">Không có kết quả</p>
            ) : (
              filteredOptions.map((option) => {
                const checked = selectedSet.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={checked}
                    disabled={option.disabled}
                    onClick={() => toggleValue(option.value)}
                    className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs outline-none transition-colors disabled:cursor-not-allowed disabled:text-gray-300 ${
                      checked ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked ? 'border-vetc-green bg-vetc-green text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {checked ? <Check size={11} strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {values.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full rounded px-3 py-2 text-xs font-bold text-gray-600 outline-none hover:bg-gray-100"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppMultiSelect;
