
import React from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';

export interface NotificationRecipient {
  name: string;
  role: string;
  sentAt: string;
  viewedAt: string | null;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitName?: string;
  recipients: NotificationRecipient[];
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, unitName, recipients }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Bell size={20} />
            <div>
              <h3 className="font-bold">Xem thông báo</h3>
              {unitName && <p className="text-xs text-white/80">{unitName}</p>}
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
        <div className="p-5">
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-4 py-3 text-left w-[50px]">STT</th>
                  <th className="px-4 py-3 text-left w-[180px]">Tên người nhận</th>
                  <th className="px-4 py-3 text-center w-[150px]">Vai trò</th>
                  <th className="px-4 py-3 text-center">Thời gian gửi</th>
                  <th className="px-4 py-3 text-center">Thời gian xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recipients.map((recipient, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{recipient.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-[100px] px-2.5 py-1 rounded-full text-xs font-bold border border-blue-400 text-blue-700 bg-transparent">
                        {recipient.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{recipient.sentAt}</td>
                    <td className="px-4 py-3 text-center">
                      {recipient.viewedAt ? (
                        <span className="inline-flex items-center space-x-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 size={12} />
                          <span>{recipient.viewedAt}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-gray-400 text-xs italic">
                          <Clock size={12} />
                          <span>Chưa xem</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {recipients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                      Không có dữ liệu thông báo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 pb-5">
          <button 
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
