
import React from 'react';
import { X, History, Calendar, FileQuestion, Search } from 'lucide-react';
import { OrderHistory } from '../types';

interface RescueHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: OrderHistory[];
  customerName: string;
  customerPlate: string;
}

const RescueHistoryModal: React.FC<RescueHistoryModalProps> = ({ isOpen, onClose, history, customerName, customerPlate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-vetc-green text-white px-6 py-4 flex items-center justify-between font-black text-xl uppercase tracking-wider shrink-0">
          <div className="flex items-center space-x-2">
            <History size={24} />
            <span>Lịch sử cứu hộ</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={24} /></button>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between shrink-0">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Khách hàng</p>
                <p className="text-sm font-bold text-gray-800">{customerName || '---'}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Biển số xe</p>
                <p className="text-sm font-bold text-gray-800 uppercase">{customerPlate || '---'}</p>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
          {history.length > 0 ? (
            <div className="border rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold text-xs uppercase border-b">
                        <tr>
                            <th className="px-4 py-3">Mã đơn</th>
                            <th className="px-4 py-3">Ngày thực hiện</th>
                            <th className="px-4 py-3">Dịch vụ</th>
                            <th className="px-4 py-3 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((h) => (
                            <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-gray-700">{h.id}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center text-gray-600">
                                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                                        <span>{h.date}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800">{h.service}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${h.status === 'Completed' ? 'bg-green-100 text-green-700' : h.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {h.status === 'Completed' ? 'Hoàn thành' : h.status === 'Cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <FileQuestion size={48} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">Chưa có lịch sử cứu hộ</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
            <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default RescueHistoryModal;
