
import React, { useState, useEffect } from 'react';
import { Navigation, X, Search, Hash, MapPin, Plus, LocateFixed } from 'lucide-react';

interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, coords: string) => void;
  initialAddress?: string;
  initialCoords?: string;
}

const MapSelectionModal: React.FC<MapSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialAddress = '',
  initialCoords = '',
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState(initialCoords);

  useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress);
      setCoords(initialCoords);
    }
  }, [isOpen, initialAddress, initialCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
        <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <Navigation size={22} className="animate-pulse" />
            <h3 className="font-bold text-lg">Chọn vị trí sự cố</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative bg-gray-100">
          <iframe 
            src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d105.8452!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s`}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            className="grayscale-[0.2] contrast-[1.1]"
          ></iframe>

          <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-vetc-green transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tìm kiếm địa chỉ..."
                className="w-full bg-white border-2 border-transparent focus:border-vetc-green shadow-xl rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Hash size={18} />
              </div>
              <input 
                type="text"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
                placeholder="Tìm kiếm theo tọa độ (Lat, Lng)..."
                className="w-full bg-white border-2 border-transparent focus:border-blue-500 shadow-xl rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative flex flex-col items-center -translate-y-6">
              <div className="bg-vetc-green text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-lg mb-2 whitespace-nowrap">
                Vị trí sự cố tại đây
              </div>
              <MapPin size={48} className="text-vetc-green drop-shadow-2xl fill-vetc-green/20" />
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
            <button className="bg-white p-3 rounded-xl shadow-xl border hover:bg-gray-100 transition-all text-gray-600 active:scale-90">
              <Plus size={24} />
            </button>
            <button className="bg-white p-3 rounded-xl shadow-xl border hover:bg-gray-50 transition-all text-vetc-green active:scale-90">
              <LocateFixed size={24} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter text-left">Vị trí hiện tại</span>
            <span className="text-sm font-bold text-gray-700 truncate max-w-[400px]">
              {address || 'Đang xác định vị trí...'}
            </span>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => onConfirm(address, coords)}
              className="bg-vetc-green text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
            >
              Xác nhận vị trí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSelectionModal;
