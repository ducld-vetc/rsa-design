
import React, { useState } from 'react';
import { X, Maximize2, Check } from 'lucide-react';
import ExpandSearchDialog from './ExpandSearchDialog';
import PartnerSelect from './PartnerSelect';

interface Station {
  id: number;
  name: string;
  partner: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  distance: string;
}

interface ManualStationSearchProps {
  onSelect: (station: Station) => void;
  onClose: () => void;
  selectedStationName?: string;
  hidePartnerFilter?: boolean;
}

const MOCK_STATIONS: Station[] = [
  { id: 1, name: 'Test trạm ngày 2808', partner: 'UAT 280801', phone: '-', address: 'Test trạm ngày 2808', city: 'Hà Nội', district: '-', ward: '-', distance: '7.5 km' },
  { id: 2, name: 'Carpla Service Hoàn Kiếm', partner: 'CARPLA SERVICE', phone: '-', address: 'Carpla Service Hoàn Kiếm', city: 'Hà Nội', district: '-', ward: '-', distance: '0 km' },
  { id: 3, name: 'Carpla Service Thái Bình', partner: 'CARPLA SERVICE', phone: '-', address: 'Carpla Service Thái Bình', city: 'Hà Nội', district: '-', ward: '-', distance: '8.5 km' },
  { id: 4, name: 'Cứu hộ 116 Hà Nội', partner: '116 GROUP', phone: '0912345678', address: 'Cầu Giấy', city: 'Hà Nội', district: 'Cầu Giấy', ward: '-', distance: '12 km' },
  { id: 5, name: 'Garage Thăng Long', partner: 'THANG LONG AUTO', phone: '0988111222', address: 'Ba Đình', city: 'Hà Nội', district: 'Ba Đình', ward: '-', distance: '5 km' },
];

const ManualStationSearch: React.FC<ManualStationSearchProps> = ({ onSelect, onClose, selectedStationName, hidePartnerFilter }) => {
  const [isExpandSearchOpen, setIsExpandSearchOpen] = useState(false);
  const [currentRange, setCurrentRange] = useState('20');
  const [selectedPartner, setSelectedPartner] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [stationToConfirm, setStationToConfirm] = useState<Station | null>(null);

  const Label = ({ children, required = false, className = "" }: { children?: React.ReactNode, required?: boolean, className?: string }) => (
    <label className={`text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center ${className}`}>
      {children} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const handleSelectClick = (station: Station) => {
    setStationToConfirm(station);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSelect = () => {
    if (stationToConfirm) {
      onSelect(stationToConfirm);
    }
    setIsConfirmModalOpen(false);
  };


  const handleExpandSearch = (range: string) => {
    console.log(`Searching with range: ${range} km`);
    setCurrentRange(range);
    // Here you would implement logic to fetch new stations based on range
    setIsExpandSearchOpen(false);
  };

  const filteredStations = MOCK_STATIONS.filter(station => {
    if (!selectedPartner) return true;
    // Simple check if partner name contains the selected partner string or vice versa
    return station.partner.toLowerCase().includes(selectedPartner.toLowerCase()) || 
           selectedPartner.toLowerCase().includes(station.partner.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-white w-full">
       <div className="bg-vetc-green text-white px-4 py-3 flex items-center justify-between shrink-0">
         <div className="flex-1 text-center flex flex-col justify-center">
            <h3 className="font-bold text-sm uppercase">DANH SÁCH TRẠM CỨU HỘ</h3>
            <span className="text-[10px] font-medium opacity-90 mt-0.5">(Trong phạm vi {currentRange} km)</span>
         </div>
         <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full absolute right-4"><X size={20} /></button>
       </div>
       
       <div className="p-4 flex-1 overflow-auto custom-scrollbar">
         {!hidePartnerFilter && (
           <div className="mb-4 max-w-sm">
              <Label className="text-xs font-bold text-gray-600 mb-1.5 block">Lọc theo đối tác</Label>
              <PartnerSelect 
                  value={selectedPartner}
                  onChange={setSelectedPartner}
              />
           </div>
         )}

         <table className="w-full text-xs text-left border-collapse border border-gray-200">
           <thead className="bg-gray-50 text-gray-700 font-bold">
             <tr>
               <th className="p-3 border border-gray-200">Trạm cứu hộ</th>
               <th className="p-3 border border-gray-200">Đối tác</th>
               <th className="p-3 border border-gray-200">Điện thoại</th>
               <th className="p-3 border border-gray-200">Điểm giao dịch</th>
               <th className="p-3 border border-gray-200">Tỉnh/TP</th>
               <th className="p-3 border border-gray-200">Xã/Phường</th>
               <th className="p-3 border border-gray-200 text-center">Khoảng cách</th>
               <th className="p-3 border border-gray-200 text-center w-24">Thao tác</th>
             </tr>
           </thead>
           <tbody>
             {filteredStations.length > 0 ? (
               filteredStations.map((station) => (
                 <tr 
                   key={station.id} 
                   className="hover:bg-gray-50"
                 >
                   <td className="p-3 border border-gray-200 font-medium text-gray-800">{station.name}</td>
                   <td className="p-3 border border-gray-200">{station.partner}</td>
                   <td className="p-3 border border-gray-200">{station.phone}</td>
                   <td className="p-3 border border-gray-200">{station.address}</td>
                   <td className="p-3 border border-gray-200">{station.city}</td>
                   <td className="p-3 border border-gray-200">{station.ward}</td>
                   <td className="p-3 border border-gray-200 text-center">{station.distance}</td>
                   <td className="p-3 border border-gray-200 text-center">
                     {station.name === selectedStationName ? (
                       <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded flex items-center justify-center space-x-1 border border-gray-200 mx-auto w-fit font-bold">
                         <Check size={14} className="text-vetc-green" />
                         <span>Đã chọn</span>
                       </div>
                     ) : (
                       <button 
                           onClick={() => handleSelectClick(station)}
                           className="bg-vetc-green text-white px-3 py-1.5 rounded flex items-center justify-center space-x-1 hover:bg-green-700 transition-colors mx-auto shadow-sm active:scale-95"
                       >
                           <Check size={14} />
                           <span>Chọn</span>
                       </button>
                     )}
                   </td>
                 </tr>
               ))
             ) : (
               <tr>
                 <td colSpan={8} className="p-10 text-center text-gray-500 italic">
                   Không tìm thấy trạm cứu hộ nào phù hợp với đối tác đã chọn.
                 </td>
               </tr>
             )}
           </tbody>
         </table>
       </div>

       <div className="p-4 border-t flex justify-center space-x-3 shrink-0 bg-gray-50">
          <button 
            onClick={() => setIsExpandSearchOpen(true)} 
            className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-50 transition-colors text-sm min-w-[100px] flex items-center space-x-2"
          >
            <Maximize2 size={16} />
            <span>Mở rộng tìm kiếm</span>
          </button>
          
          <button onClick={onClose} className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600 transition-colors text-sm min-w-[100px]">
            Đóng
          </button>
       </div>

       {/* Expand Search Dialog */}
       <ExpandSearchDialog 
         isOpen={isExpandSearchOpen}
         onClose={() => setIsExpandSearchOpen(false)}
         onSearch={handleExpandSearch}
       />

       {/* Confirmation Modal */}
       {isConfirmModalOpen && stationToConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="p-6 text-center space-y-4">
               <div className="w-16 h-16 bg-green-100 text-vetc-green rounded-full flex items-center justify-center mx-auto">
                 <Check size={32} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-gray-900">Xác nhận chọn trạm</h3>
                 <p className="text-sm text-gray-500">
                   Bạn có chắc chắn muốn chọn đơn vị <span className="font-bold text-gray-800">{stationToConfirm.name}</span> để thực hiện cứu hộ cho đơn hàng này?
                 </p>
               </div>
               
               <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 border border-gray-100">
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Đối tác:</span>
                     <span className="font-bold text-gray-700">{stationToConfirm.partner}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Địa chỉ:</span>
                     <span className="font-bold text-gray-700">{stationToConfirm.address}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-gray-500">Khoảng cách:</span>
                     <span className="font-bold text-gray-700">{stationToConfirm.distance}</span>
                  </div>
               </div>

               <div className="flex space-x-3 pt-2">
                 <button 
                   onClick={() => setIsConfirmModalOpen(false)}
                   className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                 >
                   Hủy bỏ
                 </button>
                 <button 
                   onClick={handleConfirmSelect}
                   className="flex-1 bg-vetc-green text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                 >
                   Xác nhận
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default ManualStationSearch;
