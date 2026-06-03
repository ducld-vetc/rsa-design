
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Truck, 
  User, 
  MoreVertical,
  Hash,
  Activity,
  History,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  PlayCircle,
  Car,
  AlertCircle
} from 'lucide-react';
import { MonitoringOrder } from '../types';

interface SupportingProps {
  onCoordinate: (order: MonitoringOrder) => void;
  onVerify: (order: MonitoringOrder) => void;
}

const mockSupportingOrders: MonitoringOrder[] = [
  {
    id: '1',
    orderId: 'RS-30E12345-260202-0001',
    customerName: 'NGUYỄN HOÀNG NAM',
    phone: '0912345678',
    plate: '30E-123.45',
    address: '210 Phố Xã Đàn, Đống Đa, Hà Nội',
    district: 'Quận Đống Đa',
    services: ['Kích bình ắc quy'],
    waitingTime: 450,
    status: 'Searching'
  },
  {
    id: '2',
    orderId: 'RS-29A88888-260202-0002',
    customerName: 'PHẠM MINH ANH',
    phone: '0987654321',
    plate: '29A-888.88',
    address: 'Cầu Chương Dương, Long Biên, Hà Nội',
    district: 'Quận Long Biên',
    services: ['Cứu hộ kéo xe'],
    waitingTime: 1200,
    status: 'Expired'
  },
  {
    id: '3',
    orderId: 'RS-30H55566-260202-0003',
    customerName: 'LÊ THỊ THU HÀ',
    phone: '0903456789',
    plate: '30H-555.66',
    address: 'Hầm Kim Liên, Lê Duẩn, Hà Nội',
    district: 'Quận Hai Bà Trưng',
    services: ['Thay lốp dự phòng'],
    waitingTime: 320,
    status: 'Searching'
  },
  {
    id: '4',
    orderId: 'RS-29C11122-260202-0004',
    customerName: 'VŨ ĐỨC KIÊN',
    phone: '0944556677',
    plate: '29C-111.22',
    address: 'Đường vành đai 3 trên cao, Thanh Xuân, Hà Nội',
    district: 'Quận Thanh Xuân',
    services: ['Cung cấp nhiên liệu'],
    waitingTime: 15,
    status: 'NoPartner'
  },
  {
    id: '5',
    orderId: 'RS-30G77788-260202-0005',
    customerName: 'ĐẶNG VĂN TỚN',
    phone: '0922334455',
    plate: '30G-777.88',
    address: 'Trần Duy Hưng, Cầu Giấy, Hà Nội',
    district: 'Quận Cầu Giấy',
    services: [], 
    waitingTime: 180,
    status: 'Searching'
  }
];

const Supporting: React.FC<SupportingProps> = ({ onCoordinate, onVerify }) => {
  const [orders, setOrders] = useState<MonitoringOrder[]>(mockSupportingOrders);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prev => prev.map(order => ({
        ...order,
        waitingTime: order.waitingTime + 1
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s.toString().padStart(2, '0')}s`;
  };

  const getStatusStyle = (status: string, time: number, serviceCount: number) => {
    if (serviceCount === 0) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (time > 900 || status === 'Expired') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'NoPartner') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getStatusLabel = (status: string, time: number, serviceCount: number) => {
    if (serviceCount === 0) return { text: 'Thiếu thông tin dịch vụ', icon: <HelpCircle size={12} /> };
    if (time > 900 || status === 'Expired') return { text: 'Yêu cầu quá hạn (>15p)', icon: <AlertCircle size={12} /> };
    if (status === 'NoPartner') return { text: 'Không tìm thấy trạm phù hợp', icon: <AlertTriangle size={12} /> };
    return { text: 'Đang tìm kiếm đối tác...', icon: <Search size={12} className="animate-pulse" /> };
  };

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo mã đơn, biển số, SĐT khách hàng..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-vetc-green transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button className="flex items-center space-x-2 px-4 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 font-bold transition-colors shadow-sm bg-white">
            <Filter size={18} />
            <span>Bộ lọc</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 font-bold transition-colors shadow-sm bg-white">
            <History size={18} />
            <span>Lịch sử</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center space-x-2 uppercase tracking-tight text-xs">
            <Activity size={18} className="text-vetc-green" />
            <span>Danh sách đơn cứu hộ đang hỗ trợ ({filteredOrders.length})</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cập nhật thời gian thực</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b">
                <th className="px-6 py-4 text-left whitespace-nowrap">Thông tin đơn</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Phương tiện</th>
                <th className="px-6 py-4 text-left whitespace-nowrap">Vị trí & Dịch vụ</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Thời gian chờ</th>
                <th className="px-6 py-4 text-left whitespace-nowrap min-w-[200px]">Trạng thái</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const isExpired = order.waitingTime > 900 || order.status === 'Expired';
                const hasNoServices = order.services.length === 0;
                const statusInfo = getStatusLabel(order.status, order.waitingTime, order.services.length);
                
                return (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-1.5 text-blue-600 font-black mb-1">
                          <Hash size={12} className="shrink-0" />
                          <span className="tracking-tight">{order.orderId.split('-').slice(1).join('-')}</span>
                        </div>
                        <div className="flex space-x-2">
                           <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-black border border-blue-100 uppercase">Gói VETC</span>
                           <span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded text-[9px] font-black border border-green-100 uppercase">App</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <User size={14} className="text-gray-400" />
                          <span className="font-black text-gray-900 uppercase text-xs">{order.customerName}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-bold ml-5 tracking-wide">{order.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start space-y-1">
                        <div className="inline-flex items-center px-3 py-1 bg-white border-2 border-gray-900 rounded-lg text-sm font-black text-gray-900 shadow-sm">
                          {order.plate}
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-gray-400 font-bold uppercase">
                          <Car size={10} />
                          <span>Toyota Corolla Cross</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-1.5 max-w-[200px]">
                          <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-gray-600 font-medium leading-tight line-clamp-2">{order.address}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {order.services.length > 0 ? (
                            order.services.map(s => (
                              <span key={s} className="bg-green-50 text-green-700 text-[9px] px-2 py-0.5 rounded-md border border-green-100 font-black uppercase">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="bg-red-50 text-red-600 text-[9px] px-2 py-0.5 rounded-md border border-red-100 font-black uppercase animate-pulse">
                              Thiếu dịch vụ
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center space-x-1.5 font-black text-xs ${order.waitingTime > 900 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                          <Clock size={14} />
                          <span>{formatTime(order.waitingTime)}</span>
                        </div>
                        {order.waitingTime > 600 && (
                          <span className="text-[9px] text-red-400 font-black uppercase mt-1 tracking-tighter">Cần xử lý gấp</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-wider whitespace-nowrap ${getStatusStyle(order.status, order.waitingTime, order.services.length)}`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {hasNoServices ? (
                          <button 
                            onClick={() => onVerify(order)}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-md active:scale-95 group"
                          >
                            <HelpCircle size={14} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[11px] font-black uppercase">Chọn DV</span>
                          </button>
                        ) : isExpired ? (
                          <button 
                            onClick={() => onVerify(order)}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-md active:scale-95 group"
                          >
                            <ShieldAlert size={14} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase">Xác minh</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => onCoordinate(order)}
                            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md active:scale-95 group"
                          >
                            <Truck size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="text-[11px] font-black uppercase">Điều phối</span>
                          </button>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-gray-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-xs">
                    Không tìm thấy đơn hàng phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
        <div className="flex items-center space-x-3 text-blue-800 text-xs font-bold">
          <Activity size={18} className="text-blue-500" />
          <p>Màn hình hỗ trợ điều phối viên giám sát và can thiệp thủ công vào các đơn hàng đang xử lý.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase">Bình thường</span>
           </div>
           <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase">Quá hạn</span>
           </div>
           <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase">Thiếu dữ liệu</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Supporting;
