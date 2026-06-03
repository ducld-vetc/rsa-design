import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileSpreadsheet, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  Clock, 
  MapPin, 
  Truck, 
  ClipboardList, 
  ChevronDown,
  UserCog,
  X 
} from 'lucide-react';

interface StationManagementProps {
  role?: 'OSA' | 'CSKH' | 'STATION' | 'DRIVER';
}

const StationManagement: React.FC<StationManagementProps> = ({ role = 'STATION' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [isChangeDriverOpen, setIsChangeDriverOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const [driverSearchText, setDriverSearchText] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('Tất cả');
  const driverDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const driverOptions = [
    'Tất cả',
    'Nguyễn Văn An - 0988 123 456',
    'Trần Văn Bình - 0977 234 567', 
    'Lê Thế Cường - 0966 345 678',
    'Phạm Minh Đức - 0955 456 789',
    'Nguyễn Văn Dũng - 0912 345 678'
  ];

  const filteredDriverOptions = driverOptions.filter(d =>
    d.toLowerCase().includes(driverSearchText.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (driverDropdownRef.current && !driverDropdownRef.current.contains(e.target as Node)) {
        setIsDriverDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SectionHeader = ({ title, icon, rightElement }: { title: string, icon?: React.ReactNode, rightElement?: React.ReactNode }) => (
    <div className="bg-[#00A859] text-white px-4 py-2 flex items-center justify-between font-bold text-sm uppercase tracking-wide">
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      {rightElement}
    </div>
  );

  const Badge = ({ text, color }: { text: string, color: string, key?: any }) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest leading-none shadow-sm ${color}`}>
      {text}
    </span>
  );

  const ServicePill = ({ text }: { text: string, key?: any }) => (
    <div className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis">
      {text}
    </div>
  );

  const StatusPill = ({ label, status, type }: { label: string, status: string, type?: 'primary' | 'secondary', key?: any }) => {
    let colors = 'bg-gray-50 text-gray-500 border-gray-100';
    
    if (type === 'secondary') {
        if (status === 'Warning') colors = 'bg-orange-50 text-orange-600 border-orange-100';
        if (status === 'Success') colors = 'bg-green-50 text-green-600 border-green-100';
        if (status === 'Pending') colors = 'bg-amber-50 text-amber-600 border-amber-100';
    } else {
        if (status === 'Pending') colors = 'bg-orange-50 text-orange-600 border-orange-100';
        if (status === 'Success') colors = 'bg-green-50 text-green-600 border-green-100';
        if (status === 'Processing') colors = 'bg-blue-50 text-blue-600 border-blue-100';
        if (status === 'Cancelled') colors = 'bg-red-50 text-red-600 border-red-100';
    }
    
    return (
      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black border ${colors} whitespace-nowrap w-full text-center transition-all shadow-sm`}>
        {label}
      </span>
    );
  };

  const SupporterInfo = ({ role, name, phone, color }: { role: string, name: string, phone?: string, color: string, key?: any }) => (
    <div className="flex items-start space-x-2">
      <div className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase text-center min-w-[55px] ${color}`}>
        {role}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-indigo-800 leading-tight">{name}</span>
        {phone && <span className="text-[10px] font-bold text-red-600 leading-none">{phone}</span>}
      </div>
    </div>
  );

  const orders = [
    {
      stt: 1, 
      code: 'RS1HNO2603260010', 
      tags: [{t: 'NỘI BỘ', c: 'bg-white text-blue-600 border-blue-600'}],
      servicesList: ['Kích bình ắc quy', 'Cung cấp nhiên liệu khẩn ...'],
      wait: '5h 25p',
      statusCards: [
        {l: 'Đang thực hiện', s: 'Processing', type: 'primary'}, 
        {l: 'Tài xế đang đến', s: 'Warning', type: 'secondary'}
      ],
      supporters: [
        { role: 'OPERATOR', name: 'hieund2', phone: '09123123123', color: 'bg-purple-50 text-purple-600 border-purple-100' }
      ],
      customer: { n: 'NGUYỄN VĂN A', p: '0901234567' },
      vehicle: { plate: '30K-111.11', model: 'Toyota - Vios' },
      addr: 'Hà Nội, Hà Nội',
      station: 'Trạm HN - Hoàng Mai'
    },
    {
      stt: 2, 
      code: 'RS1HNO2603260008', 
      tags: [{t: 'NỘI BỘ', c: 'bg-white text-blue-600 border-blue-600'}],
      servicesList: ['Kích bình ắc quy'],
      wait: '18h 10p',
      statusCards: [
        {l: 'Đang thực hiện', s: 'Processing', type: 'primary'}, 
        {l: 'Hoàn thành bởi tài xế', s: 'Success', type: 'secondary'}
      ],
      supporters: [
        { role: 'OPERATOR', name: 'QuynhOSA', color: 'bg-purple-50 text-purple-600 border-purple-100' }
      ],
      customer: {n: 'TRẦN THỊ LAN', p: '0912345678'},
      vehicle: {plate: '51G-888.88', model: 'Honda - CRV'},
      addr: 'Tp. Hồ Chí Minh',
      station: 'Trạm HCM - Bình Thạnh'
    },
    {
        stt: 3, 
        code: 'RS1HNO2603260007', 
        tags: [{t: 'VETC', c: 'bg-green-600 text-white border-green-600'}, {t: 'ĐƠN LẺ', c: 'bg-white text-green-600 border-green-600'}],
        servicesList: ['Kích bình ắc quy', 'Thay lốp dự phòng'],
        wait: '2h 15p',
        statusCards: [
          {l: 'Đang thực hiện', s: 'Processing', type: 'primary'}, 
          {l: 'Hoàn thành bởi tài xế', s: 'Success', type: 'secondary'}
        ],
        supporters: [
          { role: 'OPERATOR', name: 'QuynhOSA', color: 'bg-purple-50 text-purple-600 border-purple-100' }
        ],
        customer: {n: 'LÊ VĂN B', p: '0966778899'},
        vehicle: {plate: '29A-999.99', model: 'BMW - X5'},
        addr: 'Nghệ An',
        station: 'Trạm Nghệ An'
    },
    {
        stt: 4, 
        code: 'RS1HNO2603260009', 
        tags: [{t: 'VETC', c: 'bg-green-600 text-white border-green-600'}, {t: 'ĐƠN GÓI', c: 'bg-white text-green-600 border-green-600'}],
        servicesList: ['Kích bình ắc quy', 'Thay lốp dự phòng'],
        wait: '45p',
        statusCards: [
          {l: 'Đã xác nhận', s: 'Processing', type: 'primary'}, 
          {l: 'Đã xác nhận', s: 'Warning', type: 'secondary'}
        ],
        supporters: [
          { role: 'OPERATOR', name: 'QuynhOSA', color: 'bg-purple-50 text-purple-600 border-purple-100' }
        ],
        customer: {n: 'PHẠM VĂN C', p: '0900112233'},
        vehicle: {plate: '30H-222.33', model: 'Mazda 3'},
        addr: 'Hải Phòng',
        station: 'Trạm Hải Phòng'
    },
    {
        stt: 5, 
        code: 'RS1HNO2603260006', 
        tags: [{t: 'VETC', c: 'bg-green-600 text-white border-green-600'}, {t: 'ĐƠN LẺ', c: 'bg-white text-green-600 border-green-600'}],
        servicesList: ['Kích bình ắc quy', 'Cung cấp nhiên liệu khẩn ...'],
        wait: '1h 30p',
        statusCards: [
          {l: 'Đang thực hiện', s: 'Processing', type: 'primary'}, 
          {l: 'Tài xế đang đến', s: 'Warning', type: 'secondary'}
        ],
        supporters: [
          { role: 'OPERATOR', name: 'QuynhOSA', color: 'bg-purple-50 text-purple-600 border-purple-100' }
        ],
        customer: {n: 'NGUYỄN THỊ D', p: '0933444555'},
        vehicle: {plate: '51F-111.11', model: 'Toyota Fortuner'},
        addr: 'Bình Dương',
        station: 'Trạm Bình Dương'
    },
    {
        stt: 6, 
        code: 'RS1HNO2603250058', 
        tags: [{t: 'VETC', c: 'bg-green-600 text-white border-green-600'}, {t: 'ĐƠN GÓI', c: 'bg-white text-green-600 border-green-600'}],
        servicesList: ['Thay lốp dự phòng', 'Kích bình ắc quy'],
        wait: '15h 25p',
        statusCards: [
          {l: 'Điều phối', s: 'Processing', type: 'primary'}, 
          {l: 'Chờ tài xế tiếp nhận', s: 'Warning', type: 'secondary'}
        ],
        supporters: [
          { role: 'OPERATOR', name: 'QuynhOSA', color: 'bg-purple-50 text-purple-600 border-purple-100' }
        ],
        customer: {n: 'HOÀNG VĂN E', p: '0911009988'},
        vehicle: {plate: '29D-444.55', model: 'Kia Seltos'},
        addr: 'Hà Nội',
        station: 'Trạm Hà Đông'
    }
  ];

  const handleViewDetails = (order: any) => {
    navigate('/station/details', { state: { order } });
  };

  const handleChangeDriver = (order: any) => {
    setSelectedOrder(order);
    setIsChangeDriverOpen(true);
  };

  const mockDrivers = [
    { id: 'D1', name: 'Nguyễn Văn An', phone: '0988 123 456' },
    { id: 'D2', name: 'Trần Văn Bình', phone: '0977 234 567' },
    { id: 'D3', name: 'Lê Thế Cường', phone: '0966 345 678' },
    { id: 'D4', name: 'Phạm Minh Đức', phone: '0955 456 789' }
  ];

  const ChangeDriverDialog = ({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: any }) => {
    const [selectedNewDriver, setSelectedNewDriver] = React.useState('');
    const [newDriverPhone, setNewDriverPhone] = React.useState('');
    
    const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const driverId = e.target.value;
      setSelectedNewDriver(driverId);
      const driver = mockDrivers.find(d => d.id === driverId);
      if (driver) {
        setNewDriverPhone(driver.phone);
      }
    };

    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-green-100">
          <div className="bg-[#00A859] p-4 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
               <UserCog size={20} className="text-white" />
               <h3 className="font-bold text-sm uppercase tracking-wider">Thay đổi tài xế</h3>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                   <div className="flex flex-col space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tài xế hiện tại</label>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold text-gray-400">
                         {order?.supporters?.find((s: any) => s.role === 'DRIVER')?.name || 'Chưa định danh'}
                      </div>
                   </div>
                   <div className="flex flex-col space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sđt tài xế hiện tại</label>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold text-gray-400">
                         {order?.supporters?.find((s: any) => s.role === 'DRIVER')?.phone || '0912 xxx xxx'}
                      </div>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <div className="flex flex-col space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Tài xế mới <span className="text-red-500 font-bold">*</span></label>
                      <div className="relative">
                        <select 
                          value={selectedNewDriver}
                          onChange={handleDriverChange}
                          className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-vetc-green focus:bg-white focus:ring-4 focus:ring-green-50/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Chọn tài xế...</option>
                            {mockDrivers.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
                      </div>
                   </div>
                   <div className="flex flex-col space-y-2 text-left">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">Sđt tài xế mới <span className="text-red-500 font-bold">*</span></label>
                      <input 
                        type="text" 
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                        placeholder="Nhập SĐT..."
                        className="border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-vetc-green focus:bg-white focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-300 shadow-sm"
                      />
                   </div>
                </div>
             </div>
             
             <div className="pt-4 flex space-x-4">
                <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-[12px] text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all">
                   Đóng
                </button>
                <button 
                  onClick={() => {
                    // Handle confirm
                    onClose();
                  }}
                  className="flex-1 bg-[#00A859] text-white px-4 py-3 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                >
                   Xác nhận thay đổi
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      {/* Search Filter Section */}
      <div className="border rounded-lg shadow-sm bg-white border-green-100 overflow-visible">
        <div className="rounded-t-lg overflow-hidden">
          <SectionHeader title="Tra cứu" icon={<Search size={16} />} />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
            <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Mã đơn hàng</label>
              <input type="text" placeholder="Nhập mã đơn..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green transition-all" />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Số điện thoại</label>
              <input type="text" placeholder="Nhập SĐT..." className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green transition-all" />
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Biển số xe</label>
              <input type="text" defaultValue="30H-123.45" className="flex-1 border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green transition-all" />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Dịch vụ</label>
              <div className="relative flex-1">
                <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green bg-white transition-all appearance-none cursor-pointer">
                    <option>Tất cả</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
             <div className="flex items-center space-x-4">
               <label className="w-32 text-xs font-bold text-gray-600">Trạm cứu hộ</label>
               <div className="relative flex-1">
                 <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green bg-white transition-all appearance-none cursor-pointer">
                     <option>Tất cả</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
               </div>
             </div>
             <div className="flex items-center space-x-4">
               <label className="w-32 text-xs font-bold text-gray-600">Loại đơn</label>
               <div className="relative flex-1">
                 <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green bg-white transition-all appearance-none cursor-pointer">
                     <option>Tất cả</option>
                     <option>VETC</option>
                     <option>Nội bộ</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
               </div>
             </div>
             <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Từ ngày <span className="text-red-500">*</span></label>
              <div className="relative flex-1 group">
                <input type="text" defaultValue="02/01/2026" className="w-full border rounded px-3 py-2 text-xs outline-none pr-8 cursor-pointer group-hover:border-vetc-green transition-all" />
                <Calendar size={14} className="absolute right-2.5 top-2.5 text-gray-400 group-hover:text-vetc-green transition-colors" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="w-32 text-xs font-bold text-gray-600">Đến ngày <span className="text-red-500">*</span></label>
              <div className="relative flex-1 group">
                <input type="text" defaultValue="02/28/2026" className="w-full border rounded px-3 py-2 text-xs outline-none pr-8 cursor-pointer group-hover:border-vetc-green transition-all" />
                <Calendar size={14} className="absolute right-2.5 top-2.5 text-gray-400 group-hover:text-vetc-green transition-colors" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <label className="w-32 text-xs font-bold text-gray-600">Trạng thái yêu cầu</label>
               <div className="relative flex-1">
                 <select className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green bg-white transition-all appearance-none cursor-pointer">
                     <option>Tất cả</option>
                     <option>Quá thời gian chờ tài xế nhận</option>
                     <option>Nhập</option>
                     <option>Chờ đối tác nhận</option>
                     <option>Đối tác từ chối</option>
                     <option>Chờ tài xế nhận đơn</option>
                     <option>Tài xế nhận đơn</option>
                     <option>Tài xế từ chối</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
               </div>
             </div>
             <div className="flex items-center space-x-4">
               <label className="w-32 text-xs font-bold text-gray-600">Tài xế</label>
               <div className="relative flex-1" ref={driverDropdownRef}>
                 <div 
                   onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
                   className="w-full border rounded px-3 py-2 text-xs outline-none focus:border-vetc-green bg-white transition-all appearance-none cursor-pointer flex items-center justify-between"
                 >
                   <span className={selectedDriver === 'Tất cả' ? 'text-gray-500' : 'text-gray-900'}>{selectedDriver}</span>
                   <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDriverDropdownOpen ? 'rotate-180' : ''}`} />
                 </div>
                 {isDriverDropdownOpen && (
                   <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                     <div className="p-2 border-b border-gray-100">
                       <input 
                         type="text"
                         value={driverSearchText}
                         onChange={(e) => setDriverSearchText(e.target.value)}
                         placeholder="Tìm kiếm tài xế..."
                         className="w-full border border-gray-200 rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green transition-all"
                         autoFocus
                       />
                     </div>
                     <div className="max-h-48 overflow-y-auto">
                       {filteredDriverOptions.map((d) => (
                         <div 
                           key={d}
                           onClick={() => {
                             setSelectedDriver(d);
                             setIsDriverDropdownOpen(false);
                             setDriverSearchText('');
                           }}
                           className={`px-3 py-2 text-xs cursor-pointer transition-all ${
                             selectedDriver === d 
                               ? 'bg-green-50 text-green-700 font-bold' 
                               : 'hover:bg-gray-50 text-gray-700'
                           }`}
                         >
                           {d}
                         </div>
                       ))}
                       {filteredDriverOptions.length === 0 && (
                         <div className="px-3 py-4 text-xs text-gray-400 text-center">Không tìm thấy tài xế</div>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-2">
              {(role === 'DRIVER' ? ['Tất cả', 'Chờ nhận', 'Đang cứu hộ'] : ['Tất cả', 'Chờ báo giá', 'Đã báo giá', 'Chờ nhận', 'Đang cứu hộ']).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                    activeFilter === f 
                      ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-md shadow-blue-50 scale-105' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-md font-bold text-xs hover:bg-gray-200 transition-all shadow-sm border border-transparent">
                Xóa bộ lọc
              </button>
              <button className="flex items-center space-x-2 bg-vetc-green text-white px-8 py-2 rounded-md font-bold text-xs hover:bg-green-700 transition-all shadow-md group border border-transparent">
                <Search size={14} className="group-hover:scale-110 transition-transform" />
                <span>Tìm kiếm</span>
              </button>
              <button className="flex items-center space-x-2 bg-vetc-green text-white px-8 py-2 rounded-md font-bold text-xs hover:bg-green-700 transition-all shadow-md group border border-transparent">
                <FileSpreadsheet size={14} className="group-hover:scale-110 transition-transform" />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result Table Section */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white border-green-100">
        <SectionHeader 
          title="DANH SÁCH QUẢN LÝ ĐƠN CỦU HỘ" 
          icon={<ClipboardList size={16} />} 
          rightElement={<span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] items-center flex font-black uppercase tracking-tight">6 bản ghi</span>}
        />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[12px] border-collapse min-w-[1400px]">
            <thead>
               {/* Grouped Header Rows */}
               <tr className="bg-green-50/40 text-gray-700 border-b">
                 <th rowSpan={2} className="px-3 py-4 text-center w-12 font-black border-r border-b text-[10px]">STT</th>
                 <th rowSpan={2} className="px-3 py-4 text-center w-24 font-black border-r border-b text-[10px]">HÀNH ĐỘNG</th>
                 <th rowSpan={2} className="px-3 py-4 text-left w-[180px] font-black border-r border-b text-[10px]">MÃ ĐƠN</th>
                 <th rowSpan={2} className="px-4 py-4 text-left w-40 font-black border-r border-b text-[10px]">DỊCH VỤ CHÍNH</th>
                 <th colSpan={3} className="px-4 py-2 text-center font-black border-r border-b bg-gray-50/50 uppercase tracking-widest text-[9px] text-gray-400">Thông tin cơ bản đơn hàng</th>
                 <th rowSpan={2} className="px-4 py-4 text-left w-40 font-black border-r border-b text-[10px]">KHÁCH HÀNG</th>
                 <th colSpan={2} className="px-4 py-2 text-center font-black border-r border-b bg-orange-50/30 uppercase tracking-widest text-[9px] text-orange-400/80">Thông tin đối tượng cứu hộ</th>
                 <th className="px-4 py-2 text-center font-black border-b bg-blue-50/30 uppercase tracking-widest text-[9px] text-blue-400/80">Vận hành</th>
               </tr>
               <tr className="bg-green-50/10 text-gray-500 uppercase text-[9px] border-b">
                 <th className="px-4 py-2 text-center border-r font-black">THỜI GIAN CHỜ</th>
                 <th className="px-4 py-2 text-center border-r font-black">TRẠNG THÁI ĐƠN</th>
                 <th className="px-4 py-2 text-center border-r font-black whitespace-nowrap">NGƯỜI HỖ TRỢ</th>
                 <th className="px-4 py-2 text-left border-r font-black">PHƯƠNG TIỆN</th>
                 <th className="px-4 py-2 text-left border-r font-black">ĐỊA CHỈ CỨU HỘ</th>
                 <th className="px-4 py-2 text-left font-black">TRẠM CỨU HỘ</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {orders.map((o) => (
                  <tr key={o.code} className="hover:bg-green-50/20 transition-all border-b group">
                    <td className="px-3 py-4 text-center border-r font-black text-gray-400">{o.stt}</td>
                    <td className="px-3 py-4 text-center border-r">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                            onClick={() => handleViewDetails(o)}
                            className="text-orange-500 hover:scale-125 transition-all p-1.5 hover:bg-orange-50 rounded-full shadow-sm border border-transparent hover:border-orange-100"
                            title="Xem chi tiết"
                        >
                           <Eye size={16} />
                        </button>
                        <button 
                            onClick={() => handleChangeDriver(o)}
                            className="text-blue-500 hover:scale-125 transition-all p-1.5 hover:bg-blue-50 rounded-full shadow-sm border border-transparent hover:border-blue-100"
                            title="Thay đổi tài xế"
                        >
                           <UserCog size={16} />
                        </button>
                      </div>
                    </td>
                     <td className="px-3 py-4 border-r align-middle">
                       <div className="flex flex-col items-start space-y-2">
                         <span className="font-extrabold text-gray-900 tracking-tight leading-none text-[12px]">{o.code}</span>
                         <div className="flex flex-wrap gap-1">
                           {o.tags.map((tag, idx) => <Badge key={idx} text={tag.t} color={tag.c} />)}
                         </div>
                       </div>
                     </td>
                    <td className="px-4 py-4 border-r font-bold text-gray-700 leading-snug">
                       <div className="flex flex-col space-y-1.5 max-w-[150px]">
                           {o.servicesList.map((s, idx) => <ServicePill key={idx} text={s} />)}
                       </div>
                    </td>
                    <td className="px-4 py-4 text-center border-r font-black text-gray-400 text-[10px]">{o.wait}</td>
                    <td className="px-4 py-4 border-r bg-gray-50/20">
                      <div className="flex flex-col items-center space-y-2">
                        {o.statusCards.map((s, idx) => (
                            <StatusPill key={idx} label={s.l} status={s.s} type={s.type as any} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r">
                      <div className="flex flex-col space-y-3">
                        {o.supporters.map((s, idx) => (
                            <SupporterInfo 
                                key={idx} 
                                role={s.role} 
                                name={s.name} 
                                phone={s.phone} 
                                color={s.color} 
                            />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight tracking-tight uppercase">{o.customer.n}</span>
                        <span className="text-gray-500 font-bold text-[10px] mt-0.5">{o.customer.p}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r bg-orange-50/5">
                       <div className="flex flex-col">
                          <span className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-[9px] font-black w-fit leading-none mb-1 tracking-wider">{o.vehicle.plate}</span>
                          <span className="text-gray-600 font-bold text-[10px] leading-tight">{o.vehicle.model}</span>
                       </div>
                    </td>
                    <td className="px-4 py-4 border-r text-gray-500 font-bold text-[10px] leading-tight">{o.addr}</td>
                    <td className="px-4 py-4 font-black text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-all">{o.station}</td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matching design */}
        <div className="p-4 border-t bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            Hiển thị 1 - 6 / 6 kết quả
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5">
              <button className="p-1.5 hover:bg-white rounded-md border border-gray-200 text-gray-300 transition-all hover:border-vetc-green hover:text-vetc-green group">
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-md bg-vetc-green text-white font-black text-[11px] shadow-lg shadow-green-100 ring-2 ring-green-100">1</button>
              <button className="p-1.5 hover:bg-white rounded-md border border-gray-200 text-gray-300 transition-all hover:border-vetc-green hover:text-vetc-green group">
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="relative group">
              <select className="border rounded-md px-3 py-1.5 text-[10px] bg-white outline-none font-black text-gray-600 appearance-none pr-8 cursor-pointer focus:border-vetc-green transition-all shadow-sm group-hover:bg-gray-50">
                <option>10 / page</option>
                <option>20 / page</option>
                <option>50 / page</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 pointer-events-none text-gray-400 group-hover:text-vetc-green transition-colors" />
            </div>
          </div>
        </div>
      </div>
      
      <ChangeDriverDialog 
        isOpen={isChangeDriverOpen} 
        onClose={() => setIsChangeDriverOpen(false)} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default StationManagement;
