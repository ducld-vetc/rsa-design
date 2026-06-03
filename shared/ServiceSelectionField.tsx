
import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, X, Truck, AlertCircle, ChevronDown, Layers } from 'lucide-react';

export interface ServiceOption {
  name: string;
  provider: string;
}

export const ALL_SERVICES: ServiceOption[] = [
  // VETC Services
  { name: 'Kích bình ắc quy', provider: 'VETC' },
  { name: 'Thay lốp dự phòng', provider: 'VETC' },
  { name: 'Cung cấp nhiên liệu', provider: 'VETC' },
  { name: 'Cứu hộ kéo xe (Towing)', provider: 'VETC' },
  { name: 'Sửa chữa tại chỗ (Mobile Mechanic)', provider: 'VETC' },
  { name: 'Mở khóa xe (Locksmith)', provider: 'VETC' },
  { name: 'Kiểm tra hệ thống điện', provider: 'VETC' },
  { name: 'Vá lốp khẩn cấp', provider: 'VETC' },
  { name: 'Cứu hộ sa lầy', provider: 'VETC' },
  { name: 'Hỗ trợ kéo xe đường dài', provider: 'VETC' },
  // Other Services (Khác)
  { name: 'Xe hết pin', provider: 'Khác' },
  { name: 'Đâm, lật, tai nạn', provider: 'Khác' },
  { name: 'Cứu hộ thủy kích chuyên sâu', provider: 'NCC 01' },
  { name: 'Thay bình điện xe Hybrid', provider: 'NCC 02' },
  { name: 'Cứu hộ xe tải trọng tải lớn (>10 tấn)', provider: 'NCC 01' },
  { name: 'Cẩu xe từ vực/mương', provider: 'NCC 03' },
  { name: 'Sửa chữa hộp số tự động tại chỗ', provider: 'NCC 02' },
  { name: 'Thay thế phụ tùng chính hãng NCC', provider: 'NCC 01' },
  { name: 'Vận chuyển xe bằng sàn trượt', provider: 'NCC 03' },
  { name: 'Cứu hộ xe điện (EV Charging Service)', provider: 'NCC 01' }
];

interface ServiceSelectionFieldProps {
  selectedServices: string[];
  onUpdate: (services: string[]) => void;
  showTitle?: boolean;
  services?: ServiceOption[]; // Optional prop to allow custom service lists in the future
}

const ServiceSelectionField: React.FC<ServiceSelectionFieldProps> = ({ 
  selectedServices, 
  onUpdate,
  showTitle = true,
  services
}) => {
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleService = (serviceName: string) => {
    const newSelection = selectedServices.includes(serviceName) 
        ? selectedServices.filter(s => s !== serviceName)
        : [...selectedServices, serviceName];
    
    onUpdate(newSelection);
  };

  const filteredOptions = (services ? services : ALL_SERVICES).filter(opt =>
    opt.name.toLowerCase().includes(serviceSearch.toLowerCase()) || 
    opt.provider.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center space-x-2 pb-2 border-b">
          <div className="w-1.5 h-4 bg-vetc-green rounded-full"></div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tìm kiếm dịch vụ cứu hộ</h4>
        </div>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-2.5 bg-white focus-within:border-vetc-green transition-all cursor-text shadow-sm"
          onClick={() => setShowServiceDropdown(true)}
        >
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text"
            placeholder="Tìm kiếm dịch vụ (VETC hoặc Nhà cung cấp)..."
            className="flex-1 text-sm outline-none bg-transparent font-medium"
            value={serviceSearch}
            onChange={(e) => {
              setServiceSearch(e.target.value);
              setShowServiceDropdown(true);
            }}
          />
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
        </div>

        {showServiceDropdown && (
          <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-2xl max-h-72 overflow-y-auto animate-in slide-in-from-top-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => {
                const isSelected = selectedServices.includes(opt.name);
                return (
                  <div 
                    key={opt.name}
                    onClick={() => toggleService(opt.name)}
                    className={`px-4 py-3 text-sm hover:bg-green-50 cursor-pointer flex items-center justify-between border-b last:border-0 transition-colors ${isSelected ? 'bg-green-100/40' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-lg ${opt.provider === 'VETC' ? 'bg-green-100 text-vetc-green' : 'bg-blue-100 text-blue-600'}`}>
                        <Truck size={16} />
                      </div>
                      <div>
                        <span className={`font-medium ${isSelected ? 'text-green-800 font-bold' : 'text-gray-700'}`}>{opt.name}</span>
                        <span className={`ml-2 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${opt.provider === 'VETC' ? 'text-green-600 bg-green-50 border-green-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
                          {opt.provider}
                        </span>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-vetc-green flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-sm text-gray-500 italic text-center">
                Không tìm thấy dịch vụ nào phù hợp
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Chips - Styled to match the image */}
      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-dashed border-gray-300">
        {selectedServices.length > 0 ? (
          selectedServices.map(serviceName => {
            const opt = ALL_SERVICES.find(o => o.name === serviceName);
            const isVetc = opt?.provider === 'VETC';
            return (
              <span 
                key={serviceName} 
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all animate-in zoom-in ${
                  isVetc 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <span className="truncate">{serviceName} ({opt?.provider || 'Khác'})</span>
                <button 
                  onClick={() => toggleService(serviceName)}
                  className={`ml-2 p-0.5 rounded-full transition-colors ${isVetc ? 'hover:bg-green-200 text-green-600' : 'hover:bg-blue-200 text-blue-600'}`}
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </span>
            );
          })
        ) : (
          <div className="flex items-center justify-center w-full space-x-2 text-gray-400 italic py-2">
            <AlertCircle size={14} />
            <span className="text-[11px]">Vui lòng tìm kiếm và chọn ít nhất một dịch vụ cứu hộ</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelectionField;
