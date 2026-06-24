import React from 'react';
import { X, History, Star, Paperclip, FileText } from 'lucide-react';
import { RatingVersion } from './ratingTypes';

interface RatingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  orderCode?: string;
  versions: RatingVersion[];
}

const StarDisplay: React.FC<{ stars: number }> = ({ stars }) => (
  <div className="flex items-center space-x-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={12}
        fill={i <= stars ? '#fbbf24' : 'none'}
        className={i <= stars ? 'text-yellow-400' : 'text-gray-200'}
      />
    ))}
    <span className="ml-1 text-[11px] font-black text-yellow-600">{stars}.0</span>
  </div>
);

const RatingHistoryModal: React.FC<RatingHistoryModalProps> = ({
  isOpen,
  onClose,
  title,
  orderCode,
  versions,
}) => {
  if (!isOpen) return null;

  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-vetc-green text-white px-6 py-4 flex items-center justify-between font-black text-xl uppercase tracking-wider shrink-0">
          <div className="flex items-center space-x-2">
            <History size={24} />
            <span>Lịch sử đánh giá</span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Mục đánh giá</p>
            <p className="text-sm font-bold text-gray-800">{title}</p>
          </div>
          {orderCode && (
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase">Mã đơn</p>
              <p className="text-sm font-bold text-gray-800">{orderCode}</p>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
          {sortedVersions.length > 0 ? (
            <div className="border rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase border-b">
                  <tr>
                    <th className="px-4 py-3 w-10">Ver.</th>
                    <th className="px-4 py-3">Đối tượng đánh giá</th>
                    <th className="px-4 py-3">Thời gian đánh giá</th>
                    <th className="px-4 py-3">Số sao</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">File đính kèm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedVersions.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors align-top">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black ${
                            v.version === sortedVersions[0].version
                              ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          v{v.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs max-w-[160px]">
                        {v.targetLabel}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{v.ratedAt}</td>
                      <td className="px-4 py-3">
                        <StarDisplay stars={v.stars} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[220px]">
                        {v.content || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {v.attachments.length > 0 ? (
                          <ul className="space-y-1">
                            {v.attachments.map((file, idx) => (
                              <li key={idx} className="flex items-center space-x-1 text-[10px] text-blue-600">
                                <Paperclip size={10} className="shrink-0" />
                                <span className="truncate max-w-[140px]" title={file.name}>
                                  {file.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-400 italic text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <FileText size={48} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Chưa có lịch sử đánh giá</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingHistoryModal;
