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
}

const CancellationDialog: React.FC<CancellationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedReason,
  setSelectedReason,
  otherReason,
  setOtherReason,
  cancelReasons
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-md">
        <div className="bg-red-500 p-4 text-white flex items-center space-x-3">
          <AlertTriangle size={22} />
          <h3 className="font-bold">Xác nhận hủy đơn hàng</h3>
        </div>
        <div className="p-6 space-y-4 text-left">
          <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-xs text-left">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>Hành động này sẽ hủy yêu cầu cứu hộ hiện tại của khách hàng. Vui lòng chọn lý do cụ thể.</p>
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
              className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận hủy đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationDialog;
