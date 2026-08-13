import React, { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, Plus } from 'lucide-react';

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
}

const EMPTY_VALUE = '__APP_SELECT_EMPTY__';

const AppSelect: React.FC<AppSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Chọn giá trị',
  disabled = false,
  className = '',
  createLabel,
  onCreate,
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
      className={`flex h-[34px] w-full min-w-0 items-center justify-between gap-2 rounded border bg-white px-3 text-sm text-gray-700 outline-none transition-colors data-[placeholder]:text-gray-400 focus:border-vetc-green disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left ${className}`}
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

export default AppSelect;
