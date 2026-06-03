import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, X, MapPin } from 'lucide-react';

export interface NewPartnerData {
  // Đối tác
  partnerName: string;
  partnerServiceTypes: string[];
  partnerTaxId: string;
  partnerAddress: string;
  partnerContactName: string;
  partnerContactPhone: string;
  
  // Trạm cứu hộ
  stationName: string;
  stationSupportedVehicleTypes: string[];
  stationVehicleCount: string;
  
  // Thông tin cứu hộ (Giữ lại từ code cũ)
  licensePlate: string;
  driverName: string;
  driverPhone: string;
}

interface PartnerSelectProps {
  value: string;
  onChange: (val: string) => void;
  onCreate?: (data: NewPartnerData) => void;
  disabled?: boolean;
}

const INITIAL_PARTNERS = [
  "CARPLA - CARPLA SERVICE",
  "116 GROUP",
  "THĂNG LONG AUTO",
  "ABC PARTNER"
];

const PartnerSelect: React.FC<PartnerSelectProps> = ({ value, onChange, onCreate, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New Partner Form State - Đối tác
  const [newPartnerName, setNewPartnerName] = useState('');
  const [partnerServiceTypes, setPartnerServiceTypes] = useState<string[]>(['Cứu hộ giao thông']);
  const [partnerTaxId, setPartnerTaxId] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerContactName, setPartnerContactName] = useState('');
  const [partnerContactPhone, setPartnerContactPhone] = useState('');
  
  // New Partner Form State - Trạm cứu hộ
  const [stationName, setStationName] = useState('');
  const [stationSupportedVehicleTypes, setStationSupportedVehicleTypes] = useState<string[]>([]);
  const [stationVehicleCount, setStationVehicleCount] = useState('');
  
  // New Partner Form State - Thông tin cứu hộ
  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPartners = partners.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (partner: string) => {
    onChange(partner);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreate = () => {
    if (
      newPartnerName.trim() && 
      partnerServiceTypes.length > 0 && 
      partnerAddress.trim() && 
      partnerContactName.trim() && 
      partnerContactPhone.trim() &&
      stationName.trim() &&
      stationSupportedVehicleTypes.length > 0 &&
      stationVehicleCount.trim()
    ) {
      setPartners([...partners, newPartnerName.trim()]);
      onChange(newPartnerName.trim());
      
      if (onCreate) {
        onCreate({
          partnerName: newPartnerName.trim(),
          partnerServiceTypes,
          partnerTaxId,
          partnerAddress,
          partnerContactName,
          partnerContactPhone,
          stationName,
          stationSupportedVehicleTypes,
          stationVehicleCount,
          licensePlate,
          driverName,
          driverPhone
        });
      }

      setIsCreateModalOpen(false);
      
      // Reset form
      setNewPartnerName('');
      setPartnerServiceTypes(['Cứu hộ giao thông']);
      setPartnerTaxId('');
      setPartnerAddress('');
      setPartnerContactName('');
      setPartnerContactPhone('');
      setStationName('');
      setStationSupportedVehicleTypes([]);
      setStationVehicleCount('');
      setLicensePlate('');
      setDriverName('');
      setDriverPhone('');
      
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border rounded px-3 py-2 text-xs flex items-center justify-between font-bold transition-all ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-vetc-green focus:border-vetc-green'}`}
      >
        <span className="truncate">{value || 'Chọn đối tác...'}</span>
        <ChevronDown size={14} className={`transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b flex items-center space-x-2">
            <Search size={14} className="text-gray-400" />
            <input 
              type="text"
              placeholder="Tìm đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredPartners.length > 0 ? (
              filteredPartners.map(p => (
                <div 
                  key={p}
                  onClick={() => handleSelect(p)}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors ${value === p ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700'}`}
                >
                  {p}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-xs text-gray-500 text-center italic">
                Không tìm thấy đối tác
              </div>
            )}
          </div>
          <div className="p-2 border-t bg-gray-50">
            <button 
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-1 py-1.5 text-xs font-bold text-vetc-green hover:bg-green-100 rounded transition-colors"
            >
              <Plus size={14} />
              <span>Tạo mới đối tác</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-bold text-gray-800">Tạo mới đối tác cứu hộ</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* Section 1: Đối tác */}
              <div>
                <h4 className="text-sm font-bold text-vetc-green mb-3 pb-1 border-b border-green-100">1. Thông tin Đối tác</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Tên đối tác <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      placeholder="Nhập tên đối tác..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                      autoFocus
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Loại hình dịch vụ <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Cứu hộ giao thông', 'Sửa chữa lưu động', 'Thay lốp', 'Kích bình'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (partnerServiceTypes.includes(type)) {
                              setPartnerServiceTypes(partnerServiceTypes.filter(t => t !== type));
                            } else {
                              setPartnerServiceTypes([...partnerServiceTypes, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                            partnerServiceTypes.includes(type)
                              ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Mã số thuế</label>
                    <input 
                      type="text"
                      value={partnerTaxId}
                      onChange={(e) => setPartnerTaxId(e.target.value)}
                      placeholder="Nhập mã số thuế..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={partnerAddress}
                      onChange={(e) => setPartnerAddress(e.target.value)}
                      placeholder="Nhập địa chỉ cụ thể..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Người liên hệ <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={partnerContactName}
                      onChange={(e) => setPartnerContactName(e.target.value)}
                      placeholder="Nhập tên người liên hệ..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">SĐT liên hệ <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={partnerContactPhone}
                      onChange={(e) => setPartnerContactPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Trạm cứu hộ */}
              <div>
                <h4 className="text-sm font-bold text-vetc-green mb-3 pb-1 border-b border-green-100">2. Thông tin Trạm cứu hộ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Tên trạm <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      placeholder="Nhập tên trạm cứu hộ..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Loại xe hỗ trợ <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Xe kéo cẩu', 'Xe sàn trượt', 'Xe cẩu quay', '<= 2.5 tấn', '<= 1.4 tấn'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (stationSupportedVehicleTypes.includes(type)) {
                              setStationSupportedVehicleTypes(stationSupportedVehicleTypes.filter(t => t !== type));
                            } else {
                              setStationSupportedVehicleTypes([...stationSupportedVehicleTypes, type]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                            stationSupportedVehicleTypes.includes(type)
                              ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Số lượng xe <span className="text-red-500">*</span></label>
                    <input 
                      type="number"
                      value={stationVehicleCount}
                      onChange={(e) => setStationVehicleCount(e.target.value)}
                      placeholder="Nhập số lượng xe..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Thông tin cứu hộ */}
              <div>
                <h4 className="text-sm font-bold text-vetc-green mb-3 pb-1 border-b border-green-100">3. Thông tin Cứu hộ</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Biển số xe cứu hộ</label>
                    <input 
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="Nhập biển số xe..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Tài xế cứu hộ</label>
                    <input 
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Nhập tên tài xế..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">SĐT tài xế</label>
                    <input 
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-vetc-green"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3 shrink-0">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreate}
                disabled={
                  !newPartnerName.trim() || 
                  partnerServiceTypes.length === 0 || 
                  !partnerAddress.trim() || 
                  !partnerContactName.trim() || 
                  !partnerContactPhone.trim() ||
                  !stationName.trim() ||
                  stationSupportedVehicleTypes.length === 0 ||
                  !stationVehicleCount.trim()
                }
                className="px-4 py-2 text-xs font-bold bg-vetc-green text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerSelect;
