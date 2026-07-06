import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X, ChevronRight, Check } from 'lucide-react';

export const STATUS_OPTIONS = [
  {
    group: 'Tiếp nhận',
    items: [
      { id: 'WAITING_CONFIRM', label: 'Chờ xác nhận', color: 'bg-sky-50 text-sky-600 border-sky-100', dot: 'bg-sky-500' },
      { id: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-teal-50 text-teal-600 border-teal-100', dot: 'bg-teal-500' },
      { id: 'RECEIVE-NEW', label: 'Mới', color: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
      { id: 'RECEIVE-PROCESSING', label: 'Đang xử lý', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-500' },
    ]
  },
  {
    group: 'Điều phối',
    items: [
      { id: 'WAITING_PROVIDER_ACCEPT', label: 'Điều phối (chờ NCC)', color: 'bg-orange-50 text-orange-600 border-orange-100', dot: 'bg-orange-500' },
      { id: 'WAITING_DRIVER_ACCEPT', label: 'Điều phối (chờ tài xế)', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' },
      { id: 'DISPATCH-SEARCHING', label: 'Đang tìm trạm', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' },
      { id: 'DISPATCH-ASSIGNED', label: 'Đã gán trạm', color: 'bg-orange-50 text-orange-600 border-orange-100', dot: 'bg-orange-500' },
    ]
  },
  {
    group: 'Thực hiện',
    items: [
      { id: 'EXECUTE-MOVING', label: 'Đang di chuyển', color: 'bg-purple-50 text-purple-600 border-purple-100', dot: 'bg-purple-500' },
      { id: 'EXECUTE-ARRIVED', label: 'Đã đến hiện trường', color: 'bg-cyan-50 text-cyan-600 border-cyan-100', dot: 'bg-cyan-500' },
      { id: 'EXECUTE-RESCUING', label: 'Đang cứu hộ', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    ]
  },
  {
    group: 'Kết thúc',
    items: [
      { id: 'FINISH-COMPLETED', label: 'Hoàn thành', color: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-500' },
      { id: 'FINISH-CANCELLED', label: 'Hủy đơn', color: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' },
    ]
  }
];

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onUpdate: (status: string) => void;
}

const StatusUpdateModal = ({ isOpen, onClose, currentStatus, onUpdate }: StatusUpdateModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  
  const currentStatusInfo = STATUS_OPTIONS.flatMap(g => g.items).find(i => i.id === currentStatus) || { label: currentStatus, color: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-vetc-green/10 flex items-center justify-center text-vetc-green">
                  <RefreshCw size={18} />
                </div>
                <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Cập nhật trạng thái</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Status Display */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Trạng thái hiện tại</p>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatusInfo.color}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${currentStatusInfo.dot}`}></div>
                    {currentStatusInfo.label}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chọn trạng thái mới</p>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {STATUS_OPTIONS.map((group) => (
                    <div key={group.group} className="space-y-2">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded flex items-center">
                        <ChevronRight size={12} className="mr-1" />
                        {group.group}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedStatus(item.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                              selectedStatus === item.id
                                ? 'border-vetc-green bg-green-50/50 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${item.dot}`}></div>
                              <span className={`text-xs font-bold ${selectedStatus === item.id ? 'text-vetc-green' : 'text-gray-700'}`}>
                                {item.label}
                              </span>
                            </div>
                            {selectedStatus === item.id && (
                              <div className="w-5 h-5 rounded-full bg-vetc-green flex items-center justify-center text-white">
                                <Check size={12} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex items-center space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-white transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => onUpdate(selectedStatus)}
                disabled={selectedStatus === currentStatus}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2 ${
                  selectedStatus === currentStatus
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-vetc-green text-white hover:bg-green-700'
                }`}
              >
                <Check size={16} />
                <span>Cập nhật ngay</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StatusUpdateModal;
