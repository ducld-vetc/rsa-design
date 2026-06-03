import React from 'react';
import { AlertTriangle, Hash, MapPin, X } from 'lucide-react';

interface DuplicateRescueWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rescueOrderCode: string;
  plate: string;
  address: string;
}

const DuplicateRescueWarningModal: React.FC<DuplicateRescueWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  rescueOrderCode,
  plate,
  address,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Cảnh báo trùng yêu cầu</h3>
              <p className="text-xs text-white/80">Khách đang có yêu cầu cứu hộ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              Khách hàng đang có yêu cầu cứu hộ với:
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase w-20 shrink-0">Mã Yêu Cầu</span>
                <div className="flex items-center space-x-1.5 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-black text-blue-700">
                  <Hash size={14} className="text-blue-500 shrink-0" />
                  <span>{rescueOrderCode || '—'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase w-20 shrink-0">BSX</span>
                <span className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-black text-amber-700 uppercase tracking-wider">
                  {plate || '—'}
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase w-20 shrink-0 pt-1.5">Vị trí</span>
                <div className="flex items-center space-x-1.5 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-700 flex-1">
                  <MapPin size={14} className="text-amber-500 shrink-0" />
                  <span>{address || 'Chưa xác định'}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-medium text-center">
            Bạn có đồng ý tạo yêu cầu cứu hộ mới không?
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-5 pb-5 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors active:scale-[0.98]"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-vetc-green text-white font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-[0.98]"
          >
            Tạo mới yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateRescueWarningModal;
