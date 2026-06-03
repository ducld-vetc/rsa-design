
import React, { useState } from 'react';
import { Compass, X, Search } from 'lucide-react';

interface ExpandSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (range: string) => void;
}

const ExpandSearchDialog: React.FC<ExpandSearchDialogProps> = ({ isOpen, onClose, onSearch }) => {
  const [searchRange, setSearchRange] = useState('20');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Compass size={20} />
            <h3 className="font-bold">Mở rộng phạm vi tìm kiếm</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              Nhập phạm vi cứu hộ (km)
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={searchRange}
                onChange={(e) => setSearchRange(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-vetc-green transition-all text-lg font-bold text-gray-800 pr-12"
                placeholder="20"
                autoFocus
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-bold">km</span>
            </div>
            <p className="text-[11px] text-gray-500 italic font-medium leading-relaxed">
              * Phạm vi càng rộng thời gian chờ của khách hàng có thể tăng lên do quãng đường di chuyển xa hơn.
            </p>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => onSearch(searchRange)}
              className="flex-1 bg-vetc-green text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <Search size={18} />
              <span>Tìm kiếm cứu hộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandSearchDialog;
