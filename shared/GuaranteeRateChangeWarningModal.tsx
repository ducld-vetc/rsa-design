import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

type GuaranteeChangeKind = 'rate' | 'amount' | 'type';

interface GuaranteeRateChangeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  kind?: GuaranteeChangeKind;
  oldValue: string;
  newValue: string;
  enterpriseLabel?: string;
}

const TYPE_LABELS: Record<string, string> = {
  rate: 'Theo tỷ lệ',
  fixed: 'Số tiền bảo lãnh cố định',
};

const formatMoney = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Chưa thiết lập';
  return `${parseInt(digits, 10).toLocaleString('en-US')} đ`;
};

const formatValue = (kind: GuaranteeChangeKind, value: string) => {
  if (kind === 'rate') return value ? `${value}%` : 'Chưa thiết lập';
  if (kind === 'amount') return formatMoney(value);
  return TYPE_LABELS[value] || 'Chưa thiết lập';
};

const KIND_COPY: Record<GuaranteeChangeKind, { title: string; noun: string; current: string; next: string }> = {
  rate: {
    title: 'Cảnh báo thay đổi tỷ lệ bảo lãnh',
    noun: 'tỷ lệ bảo lãnh',
    current: 'Tỷ lệ hiện tại',
    next: 'Tỷ lệ sau thay đổi',
  },
  amount: {
    title: 'Cảnh báo thay đổi số tiền bảo lãnh',
    noun: 'số tiền bảo lãnh',
    current: 'Số tiền hiện tại',
    next: 'Số tiền sau thay đổi',
  },
  type: {
    title: 'Cảnh báo thay đổi hình thức bảo lãnh',
    noun: 'hình thức bảo lãnh',
    current: 'Hình thức hiện tại',
    next: 'Hình thức sau thay đổi',
  },
};

const GuaranteeRateChangeWarningModal: React.FC<GuaranteeRateChangeWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  kind = 'rate',
  oldValue,
  newValue,
  enterpriseLabel,
}) => {
  if (!isOpen) return null;

  const copy = KIND_COPY[kind];
  const formattedOld = formatValue(kind, oldValue);
  const formattedNew = formatValue(kind, newValue);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 text-white flex items-center justify-between bg-amber-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={20} />
            <h3 className="font-bold text-sm">{copy.title}</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <p className="text-xs text-gray-700 leading-relaxed">
                Thay đổi {copy.noun}
                {enterpriseLabel ? (
                  <> của <span className="font-bold">{enterpriseLabel}</span></>
                ) : null}{' '}
                từ <span className="font-bold">{formattedOld}</span> thành{' '}
                <span className="font-black text-amber-700">{formattedNew}</span> sẽ{' '}
                <span className="font-bold text-red-600">ảnh hưởng tới số tiền khách hàng cá nhân phải thanh toán</span>.
                Vui lòng kiểm tra lại trước khi xác nhận.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-gray-400 font-bold uppercase mb-1">{copy.current}</p>
                <p className="font-black text-gray-800">{formattedOld}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-300">
                <p className="text-gray-400 font-bold uppercase mb-1">{copy.next}</p>
                <p className="font-black text-amber-700">{formattedNew}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border font-bold text-xs text-gray-500 hover:bg-gray-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs active:scale-95 transition-all bg-amber-500 hover:bg-amber-600"
            >
              Xác nhận thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuaranteeRateChangeWarningModal;
