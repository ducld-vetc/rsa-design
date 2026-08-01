import React from 'react';
import { AlertTriangle, RefreshCw, Shield, X } from 'lucide-react';

interface ManualFeeRecalcWarningModalProps {
  isOpen: boolean;
  changeDescription: string;
  onCancel: () => void;
  onKeepManual: () => void;
  onRecalculate: () => void;
}

const ManualFeeRecalcWarningModal: React.FC<ManualFeeRecalcWarningModalProps> = ({
  isOpen,
  changeDescription,
  onCancel,
  onKeepManual,
  onRecalculate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between bg-amber-500 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <h3 className="text-sm font-bold">Cảnh báo phí thủ công</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 hover:bg-white/20"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs leading-relaxed text-gray-700">
              Đơn đã có <span className="font-bold text-amber-800">phí chỉnh tay</span>. Bạn vừa đổi tiêu
              chí ảnh hưởng tính phí:
            </p>
            <p className="mt-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-[11px] font-semibold text-amber-900">
              {changeDescription}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-gray-700">
              Bạn có muốn <span className="font-bold">tính lại phí</span> theo bảng phí / tiêu chí mới
              không? Việc tính lại sẽ{' '}
              <span className="font-bold text-red-600">ghi đè các dòng Thủ công</span> (trừ dịch vụ
              khác nhập tay).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onRecalculate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 active:scale-[0.99]"
            >
              <RefreshCw size={14} />
              Tính lại toàn bộ phí
            </button>
            <button
              type="button"
              onClick={onKeepManual}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 active:scale-[0.99]"
            >
              <Shield size={14} />
              Giữ phí thủ công
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"
            >
              Hủy đổi tiêu chí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualFeeRecalcWarningModal;
