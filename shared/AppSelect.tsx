import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
  value?: string;
  options: AppSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  createLabel?: string;
  onCreate?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  title?: string;
}

const EMPTY_VALUE = '__APP_SELECT_EMPTY__';

const TRIGGER_CLASS =
  'flex h-[34px] w-full min-w-0 items-center justify-between gap-2 rounded border bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-vetc-green disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

const SearchableAppSelect: React.FC<AppSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Chọn giá trị',
  disabled = false,
  className = '',
  searchPlaceholder = 'Tìm kiếm...',
  title,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 220, openUp: false });

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi');
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLocaleLowerCase('vi').includes(q) || option.value.toLocaleLowerCase('vi').includes(q),
    );
  }, [options, query]);

  const updatePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const openUp = window.innerHeight - r.bottom < 260 && r.top > 260;
    setPos({
      top: openUp ? r.top - 4 : r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 220),
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

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={title || selected?.label || placeholder}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className={`${TRIGGER_CLASS} ${!value ? 'text-gray-400' : ''} ${className}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label || placeholder}</span>
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
            <div className="max-h-60 overflow-y-auto p-1" role="listbox">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => pick('')}
                className="flex w-full items-center rounded px-2.5 py-2 text-left text-xs text-gray-400 outline-none hover:bg-gray-50"
              >
                {placeholder}
              </button>
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-3 text-center text-xs text-gray-400">Không có kết quả</p>
              ) : (
                filteredOptions.map((option) => {
                  const checked = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={option.disabled}
                      onClick={() => pick(option.value)}
                      className={`relative flex w-full cursor-pointer items-center rounded px-8 py-2 text-left text-xs outline-none disabled:cursor-not-allowed disabled:text-gray-300 ${
                        checked ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="absolute left-2 inline-flex w-4 items-center justify-center">
                        {checked ? <Check size={13} /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const RadixAppSelect: React.FC<AppSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Chọn giá trị',
  disabled = false,
  className = '',
  createLabel,
  onCreate,
  title,
}) => {
  const isCreatable = Boolean(createLabel && onCreate && !disabled);
  const [open, setOpen] = useState(false);

  return (
    <Select.Root
      value={value ? value : EMPTY_VALUE}
      onValueChange={(next) => onChange(next === EMPTY_VALUE ? '' : next)}
      disabled={disabled}
      {...(isCreatable ? { open, onOpenChange: setOpen } : {})}
    >
      <Select.Trigger
        title={title}
        className={`${TRIGGER_CLASS} data-[placeholder]:text-gray-400 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown size={14} className="shrink-0 text-gray-400" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={4}
          className="z-[200] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border bg-white shadow-xl"
        >
          <Select.Viewport className="p-1">
            {!value && (
              <Select.Item
                value={EMPTY_VALUE}
                className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-xs text-gray-400 outline-none data-[highlighted]:bg-gray-50"
              >
                <Select.ItemText>{placeholder}</Select.ItemText>
              </Select.Item>
            )}
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-xs text-gray-700 outline-none data-[disabled]:cursor-not-allowed data-[disabled]:text-gray-300 data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700"
              >
                <span className="absolute left-2 inline-flex w-4 items-center justify-center">
                  <Select.ItemIndicator>
                    <Check size={13} />
                  </Select.ItemIndicator>
                </span>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          {isCreatable && (
            <div className="border-t border-gray-100 bg-gray-50 p-1">
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  onCreate?.();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-bold text-vetc-green outline-none hover:bg-green-100"
              >
                <Plus size={14} />
                {createLabel}
              </button>
            </div>
          )}
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const AppSelect: React.FC<AppSelectProps> = (props) => {
  if (props.searchable) return <SearchableAppSelect {...props} />;
  return <RadixAppSelect {...props} />;
};

export default AppSelect;
