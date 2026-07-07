import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedReason: string;
  setSelectedReason: (reason: string) => void;
  otherReason: string;
  setOtherReason: (reason: string) => void;
  cancelReasons: string[];
  /** cancel: hủy đơn mới | editReason: chỉnh sửa lý do đơn đã hủy */
  variant?: 'cancel' | 'editReason';
}

const CancellationDialog: React.FC<CancellationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedReason,
  setSelectedReason,
  otherReason,
  setOtherReason,
  cancelReasons,
  variant = 'cancel',
}) => {
  if (!isOpen) return null;

  const isEditReason = variant === 'editReason';
  const title = isEditReason ? 'Chỉnh sửa lý do hủy đơn' : 'Xác nhận hủy đơn hàng';
  const notice = isEditReason
    ? 'Cập nhật lý do hủy đơn để đồng bộ nhật ký hành trình và báo cáo cho khách hàng.'
    : 'Hành động này sẽ hủy yêu cầu cứu hộ hiện tại của khách hàng. Vui lòng chọn lý do cụ thể.';
  const confirmLabel = isEditReason ? 'Lưu lý do' : 'Xác nhận hủy đơn';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md">
        <div className={`${isEditReason ? 'bg-amber-500' : 'bg-red-500'} p-4 text-white flex items-center space-x-3`}>
          <AlertTriangle size={22} />
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="p-6 space-y-4 text-left">
          <div className={`flex items-start space-x-3 p-3 border rounded-lg text-xs text-left ${
            isEditReason
              ? 'bg-amber-50 border-amber-100 text-amber-900'
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>{notice}</p>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-bold text-gray-700">Lý do hủy đơn <span className="text-red-500">*</span></label>
            <div className="space-y-3">
              {cancelReasons.map((reason) => (
                <label key={reason} className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedReason === reason ? 'border-red-500' : 'border-gray-300'}`}>
                    {selectedReason === reason && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                  </div>
                  <input
                    type="radio"
                    name="cancelReason"
                    className="hidden"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                  <span className={`text-sm font-medium ${selectedReason === reason ? 'text-gray-900' : 'text-gray-600'}`}>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Lý do khác' && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Nhập chi tiết lý do..."
                  className="w-full border rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-red-500 transition-all text-left"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              disabled={!selectedReason || (selectedReason === 'Lý do khác' && !otherReason.trim())}
              onClick={onConfirm}
              className={`flex-1 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isEditReason
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationDialog;
