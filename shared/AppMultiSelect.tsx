import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 220, openUp: false });

  const selectedSet = useMemo(() => new Set(values), [values]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi');
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLocaleLowerCase('vi').includes(q) || option.value.toLocaleLowerCase('vi').includes(q),
    );
  }, [options, query]);

  const triggerLabel = useMemo(() => {
    if (values.length === 0) return placeholder;
    if (values.length === 1) {
      return options.find((option) => option.value === values[0])?.label ?? placeholder;
    }
    return `${values.length} doanh nghiệp đã chọn`;
  }, [values, options, placeholder]);

  const updatePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const openUp = window.innerHeight - r.bottom < 280 && r.top > 280;
    setPos({
      top: openUp ? r.top - 4 : r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 280),
      openUp,
    });
  };

  useEffect(() => {
    if (!open) return;
    setQuery('');
    updatePos();
    requestAnimationFrame(() => searchRef.current?.focus());
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onReposition = () => updatePos();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

  const toggleValue = (value: string) => {
    if (selectedSet.has(value)) onChange(values.filter((item) => item !== value));
    else onChange([...values, value]);
  };

  return (
    <div className={`relative min-w-0 ${className}`} ref={rootRef}>
      <button
        ref={triggerRef}
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

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-[200] overflow-hidden rounded-lg border bg-white shadow-xl"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: pos.width,
              transform: pos.openUp ? 'translateY(-100%)' : undefined,
            }}
          >
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
                      <span className="min-w-0 flex-1 break-words">{option.label}</span>
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
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AppMultiSelect;
