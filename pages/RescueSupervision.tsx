
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Activity,
  MapPin,
  Clock,
  User,
  ChevronRight,
  Phone,
  Truck,
  CheckCircle2,
  AlertTriangle,

  Maximize2,
  Minimize2,
  Navigation,
  Info,
  ShieldCheck,
  UserPlus,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  PlusCircle,
  ClipboardList,
  BarChart3 as BarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const incidentIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#ef4444;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const vehicleIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#3b82f6;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const garageIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#22c55e;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});

const mapRoutes: {
  id: string;
  name: string;
  color: string;
  incident: [number, number];
  vehicle: [number, number];
  garage?: [number, number];
}[] = [
  {
    id: 'RS-38A58531', name: 'NGUYỄN VĂN A', color: '#EF4444',
    incident: [21.0329, 105.8706],
    vehicle:  [21.0435, 105.8640],
    garage:   [21.0180, 105.8510],
  },
  {
    id: 'RS-29K12345', name: 'TRẦN THỊ B', color: '#2563EB',
    incident: [21.0617, 105.8361],
    vehicle:  [21.0548, 105.8180],
    garage:   [21.0390, 105.8055],
  },
  {
    id: 'RS-30H11122', name: 'PHẠM VĂN C', color: '#16A34A',
    incident: [21.0181, 105.8406],
    vehicle:  [21.0265, 105.8285],
    garage:   [21.0065, 105.8340],
  },
  {
    id: 'RS-51G55566', name: 'LÊ THỊ D', color: '#F59E0B',
    incident: [21.0480, 105.8800],
    vehicle:  [21.0390, 105.8720],
  },
];

const RoutedPolyline: React.FC<{
  from: [number, number];
  to: [number, number];
  color: string;
  dashed?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
}> = ({ from, to, color, dashed, highlighted = false, dimmed = false }) => {
  const weight  = highlighted ? 8 : dimmed ? 3 : 5;
  const opacity = highlighted ? 1 : dimmed ? 0.2 : 0.9;
  const [positions, setPositions] = React.useState<[number, number][]>([from, to]);

  React.useEffect(() => {
    let cancelled = false;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    )
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.routes?.[0]?.geometry?.coordinates) {
          setPositions(
            data.routes[0].geometry.coordinates.map(
              ([lon, lat]: [number, number]) => [lat, lon] as [number, number]
            )
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color, weight, dashArray: dashed ? '10 7' : undefined, opacity, lineCap: 'round', lineJoin: 'round' }}
    />
  );
};

const RescueSupervision: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'order'>('system');
  const [rightTab, setRightTab] = useState<'osa' | 'driver' | 'customer' | 'detail'>('detail');
  const [rightInfoTab, setRightInfoTab] = useState<'incident' | 'dispatch'>('dispatch');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const commandQueue = [
    { id: '38A58531...8412', routeId: 'RS-38A58531', name: 'NGUYỄN VĂN A', address: 'Đường Nguyễn Văn Cừ, Long Biên, Hà Nội', time: '8P 19S', status: 'ƯU TIÊN', statusColor: 'bg-pink-100 text-pink-600 border-pink-200', actions: ['ĐANG TÌM ĐỐI TÁC', 'PHÂN CÔNG HỖ TRỢ'] },
    { id: '29K12345...9900', routeId: 'RS-29K12345', name: 'TRẦN THỊ B', address: 'Cầu Nhật Tân, Tây Hồ, Hà Nội', time: '13P 45S', status: 'ĐANG CỨU HỘ', statusColor: 'bg-blue-100 text-blue-600 border-blue-200', actions: ['PHÂN CÔNG HỖ TRỢ'] },
    { id: '30H11122...3344', routeId: 'RS-30H11122', name: 'PHẠM VĂN C', address: 'Hầm Kim Liên, Đống Đa, Hà Nội', time: '25P 00S', status: 'ĐANG CỨU HỘ', statusColor: 'bg-blue-100 text-blue-600 border-blue-200', overdue: true, actions: ['CHUYỂN TIẾP OSA'] },
    { id: '51G55566...7788', routeId: 'RS-51G55566', name: 'LÊ THỊ D', address: 'Cầu Giấy, Hà Nội', time: '15P 30S', status: '', statusColor: '', actions: [] },
  ];

  const activeRouteId = hoveredRouteId ?? focusedRouteId;

  const content = (
    <div className={`flex flex-col bg-gray-50 overflow-hidden ${isFullscreen ? 'h-full' : 'h-full -m-6'}`}>
      {/* Top Banner Status */}
      <div className="bg-white border-b px-6 py-2 flex items-center justify-between shadow-sm z-10 transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-inner">
              <Activity size={16} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs font-black tracking-tight text-gray-800 uppercase">OPERATIONAL ENVIRONMENT</h1>
              <span className="text-gray-400 font-bold text-[8px] uppercase tracking-widest">MISSION CONTROL DISPLAY</span>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <div className="flex bg-gray-50 rounded-md p-0.5 border border-gray-200">
            <div className="px-2.5 py-1 text-[9px] font-bold text-gray-400 uppercase">QUEUE STATUS</div>
            <div className="px-2.5 py-1 bg-white shadow-sm rounded text-[9px] font-bold text-gray-700 uppercase">ORDERS</div>
          </div>
        </div>

        <div className="flex items-stretch border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {[
            { label: 'TỔNG ĐƠN CHỜ', value: 7, color: 'text-gray-800' },
            { label: 'ĐƠN QUÁ HẠN', value: 2, color: 'text-red-500' },
            { label: 'CẦN XÁC MINH', value: 1, color: 'text-orange-500' },
            { label: 'ĐANG TÌM ĐỐI TÁC', value: 2, color: 'text-blue-500' },
            { label: 'ĐANG CỨU HỘ', value: 2, color: 'text-blue-600' },
            { label: 'CHƯA PHÂN CÔNG', value: 2, color: 'text-orange-600' }
          ].map((stat, i, arr) => (
            <React.Fragment key={i}>
              <button className="flex flex-col items-center justify-center px-4 py-1.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer select-none">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{stat.label}</span>
                <span className={`text-base font-black leading-tight ${stat.color}`}>{stat.value}</span>
              </button>
              {i < arr.length - 1 && <div className="w-px bg-gray-200 self-stretch"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">TRẠNG THÁI TỐT</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span className="text-[9px] font-bold text-green-600">Online</span>
            </div>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-gray-200 transition-colors border border-gray-200"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span>{isFullscreen ? 'THU NHỎ' : 'FULLSCREEN'}</span>
          </button>
          <button className="flex items-center space-x-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-green-700 transition-colors shadow-sm">
            <Activity size={12} />
            <span>ĐANG CỨU HỘ</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: Command Queue */}
        <div className="w-[320px] bg-white border-r flex flex-col shadow-lg z-10 transition-all duration-300">
          <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black italic shadow-inner">1</div>
              <h2 className="text-xs font-black uppercase text-gray-700">Command Queue</h2>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-bold text-green-500 uppercase">Live Sync</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-2">
              {commandQueue.map((order, i) => {
                const isActive = focusedRouteId === order.routeId;
                return (
                  <div
                    key={i}
                    onClick={() => { setFocusedRouteId(order.routeId); setRightPanelCollapsed(false); }}
                    onMouseEnter={() => setHoveredRouteId(order.routeId)}
                    onMouseLeave={() => setHoveredRouteId(null)}
                    className={`relative p-2.5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md group ${isActive ? 'border-indigo-500 bg-indigo-600 text-white shadow-indigo-100' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-indigo-200' : 'text-blue-600'}`}>{order.id}</span>
                        <h3 className={`text-sm font-black ${isActive ? 'text-white' : 'text-gray-800'}`}>{order.name}</h3>
                      </div>
                      <div className="flex items-center space-x-1">
                        {order.overdue && <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500 text-white">QUÁ HẠN</span>}
                        {order.status && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${isActive ? 'bg-white/20 border-white/30 text-white' : order.statusColor}`}>{order.status}</span>
                        )}
                      </div>
                    </div>
                    <div className={`text-[11px] mb-1 line-clamp-1 ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>{order.address}</div>
                    <div className="flex items-center justify-between">
                      <div className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{order.time}</div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.actions?.map((action, j) => (
                          <span key={j} className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${isActive ? (j === 0 ? 'bg-white text-indigo-600' : 'bg-indigo-400 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{action}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="border-t flex flex-col" style={{ minHeight: '200px' }}>
            <div className="flex bg-white border-b">
              <button 
                onClick={() => setActiveTab('system')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-[10px] font-bold border-b-2 transition-all ${activeTab === 'system' ? 'border-green-500 text-gray-800' : 'border-transparent text-gray-400'}`}
              >
                <History size={14} />
                <span>SYSTEM LOGS</span>
              </button>
              <button 
                onClick={() => setActiveTab('order')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-[10px] font-bold border-b-2 transition-all ${activeTab === 'order' ? 'border-green-500 text-gray-800' : 'border-transparent text-gray-400'}`}
              >
                <Activity size={14} />
                <span>ORDER LOGS</span>
              </button>
            </div>
            
            <div className="px-3 py-2 text-[11px] text-gray-600 bg-gray-50 border-b">
              {activeTab === 'system' ? 'Trạm Cầu Giấy vừa kích hoạt trạng thái sẵn sàng.' : 'Thay đổi trạng thái đơn sang: Đang tìm đối tác.'}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              <div className="p-2.5 bg-white rounded-lg border space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-300">10:57:30</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[8px] font-black rounded border">SYSTEM</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600">#RS-38A58531</span>
                </div>
                <p className="text-[11px] text-gray-600">Trạm Cầu Giấy vừa kích hoạt trạng thái sẵn sàng.</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-300">10:56:45</span>
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-500 text-[8px] font-black rounded border border-purple-100">STATUS CHANGE</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600">#RS-38A58531</span>
                </div>
                <p className="text-[11px] text-gray-600">Địa chỉ cứu hộ đã được CSKH cập nhật chính xác hơn.</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-orange-100 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-300">10:50:20</span>
                    <span className="px-1.5 py-0.5 bg-orange-50 text-orange-500 text-[8px] font-black rounded border border-orange-200">WARNING</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600">#RS-30H11122</span>
                </div>
                <p className="text-[11px] text-orange-700 font-medium">Đơn hàng đã quá hạn 15 phút chưa được xác nhận!</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-red-100 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-gray-300">10:48:12</span>
                    <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[8px] font-black rounded border border-red-200">ERROR</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600">#RS-51G55566</span>
                </div>
                <p className="text-[11px] text-red-600 font-medium">Không thể kết nối trạm cứu hộ. Đang thử lại...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Live Monitoring Environment */}
        <div className="flex-1 flex flex-col relative">
          {/* Environment Header */}
          <div className="bg-[#4C43D0] text-white px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-[11px] font-black italic shadow-inner">2</div>
              <h2 className="text-sm font-black uppercase tracking-widest">LIVE MONITORING COMMAND ENVIRONMENT</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${rightPanelCollapsed ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'}`}
              >
                <ChevronRight size={16} className={`transition-transform duration-300 ${rightPanelCollapsed ? 'rotate-180' : ''}`} />
                <span>{rightPanelCollapsed ? 'MỞ PANEL' : 'ẨN PANEL'}</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-white overflow-hidden flex flex-col">
            {/* Context Info Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[1001] flex space-x-4 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center space-x-6 flex-1 pointer-events-auto">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">HIỆN TRƯỜNG</span>
                  <h3 className="text-base font-black text-gray-800 uppercase">ĐƯỜNG NGUYỄN VĂN CỪ, LONG BIÊN, HÀ NỘI</h3>
                </div>
                <div className="h-10 w-px bg-gray-100 mx-2"></div>
                <div className="flex space-x-8">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">TIẾP NHẬN</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-black text-green-600">02:45</span>
                      <span className="text-[10px] font-bold text-gray-300">05:00</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">TÌM KIẾM</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-black text-orange-600">08:12</span>
                      <span className="text-[10px] font-bold text-gray-300">10:00</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">THỰC HIỆN</span>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-black text-indigo-600">24:50</span>
                      <span className="text-[10px] font-bold text-gray-300">45:00</span>
                    </div>
                  </div>
                  <div className="flex flex-col bg-gray-50 px-4 py-1 rounded-xl border border-gray-100 text-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center">
                      <Activity size={10} className="mr-1 text-green-500" /> SLA TỔNG
                    </span>
                    <div className="flex items-baseline space-x-1 justify-center">
                      <span className="text-lg font-black text-gray-800">35:47</span>
                      <span className="text-[10px] font-bold text-gray-400">/ 60:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Map Container */}
            <div className="flex-1 relative overflow-hidden">
              <MapContainer
                center={[21.028, 105.854]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {mapRoutes.map((route) => {
                  const highlighted = !!activeRouteId && activeRouteId === route.id;
                  const dimmed      = !!activeRouteId && activeRouteId !== route.id;
                  return (
                  <React.Fragment key={route.id}>
                    <RoutedPolyline from={route.vehicle} to={route.incident} color={route.color} dashed highlighted={highlighted} dimmed={dimmed} />
                    {route.garage && (
                      <RoutedPolyline from={route.incident} to={route.garage} color={route.color} highlighted={highlighted} dimmed={dimmed} />
                    )}
                    {/* Marker: Vị trí sự cố */}
                    <Marker position={route.incident} icon={incidentIcon}>
                      <Popup>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                          <div style={{ color: '#ef4444', marginBottom: 2 }}>⚠ VỊ TRÍ SỰ CỐ</div>
                          <div>{route.name}</div>
                          <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                        </div>
                      </Popup>
                    </Marker>
                    {/* Marker: Xe cứu hộ */}
                    <Marker position={route.vehicle} icon={vehicleIcon}>
                      <Popup>
                        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                          <div style={{ color: '#3b82f6', marginBottom: 2 }}>🚛 XE CỨU HỘ</div>
                          <div>Đang di chuyển đến hiện trường</div>
                          <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                        </div>
                      </Popup>
                    </Marker>
                    {/* Marker: Gara đích đến — chỉ khi có gara */}
                    {route.garage && (
                      <Marker position={route.garage} icon={garageIcon}>
                        <Popup>
                          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6 }}>
                            <div style={{ color: '#22c55e', marginBottom: 2 }}>🔧 GARA ĐÍCH ĐẾN</div>
                            <div>Điểm kéo xe về</div>
                            <div style={{ color: '#9ca3af', fontSize: 11 }}>{route.id}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                  );
                })}
              </MapContainer>
              {/* Floating Map Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-[1001]">
                <button className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50">+</button>
                <button className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:bg-gray-50">−</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Coordination Panel */}
        <div className={`bg-white border-l flex flex-col shadow-2xl z-10 overflow-hidden transition-all duration-300 ease-in-out ${rightPanelCollapsed ? 'w-0 border-l-0' : 'w-[400px]'}`}>
          <div className="bg-[#00A859] text-white px-4 py-1.5 flex items-center justify-between min-w-[400px]">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black italic shadow-inner">3</div>
              <h2 className="text-sm font-black uppercase tracking-widest whitespace-nowrap">ĐIỀU PHỐI CỨU HỘ</h2>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-2 transition-opacity duration-200 ${rightPanelCollapsed ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>
            {/* Tab Switcher */}
            <div className="grid grid-cols-4 gap-1">
              {([
                { key: 'osa', icon: <ShieldCheck size={14} />, label: 'OSA' },
                { key: 'driver', icon: <Truck size={14} />, label: 'Tài xế' },
                { key: 'customer', icon: <User size={14} />, label: 'Khách' },
                { key: 'detail', icon: <Info size={14} />, label: 'CHI TIẾT' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => tab.key === 'detail' ? navigate('/details') : setRightTab(tab.key)}
                  className={`flex items-center justify-center space-x-1 py-1 rounded-full border text-[10px] font-bold transition-all ${rightTab === tab.key ? 'bg-white border-gray-300 text-gray-800 shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Info Tabs */}
            <div className="flex items-center border-b">
              <button 
                onClick={() => setRightInfoTab('incident')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${rightInfoTab === 'incident' ? 'text-[#00A859] border-[#00A859]' : 'text-gray-400 border-transparent'}`}
              >THÔNG TIN SỰ CỐ</button>
              <button 
                onClick={() => setRightInfoTab('dispatch')}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${rightInfoTab === 'dispatch' ? 'text-[#00A859] border-[#00A859]' : 'text-gray-400 border-transparent'}`}
              >ĐIỀU PHỐI & ĐỐI TÁC</button>
            </div>

            {rightInfoTab === 'dispatch' ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">CHI TIẾT ĐIỀU PHỐI & ĐỐI TÁC</h3>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"><ClipboardList size={13} /></button>
                    <button className="p-1 text-blue-500 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100"><MapPin size={13} /></button>
                    <button className="p-1 text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"><BarChart size={13} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ĐỐI TÁC THỰC HIỆN</label>
                    <div className="px-2 py-1 bg-orange-50 rounded-md border border-orange-200 font-bold text-orange-600 text-sm">ĐANG TÌM ĐỐI TÁC...</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">TRẠM CỨU HỘ</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-500 text-sm">ĐANG TÌM TRẠM...</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">LOẠI XE CỨU HỘ</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-500 text-sm">---</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">BIỂN SỐ XE CỨU HỘ</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-500 text-sm">---</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">TÀI XẾ TIẾP NHẬN</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-800 text-sm">CHƯA CÓ TÀI XẾ</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest invisible">.</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-500 text-sm">---</div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ĐIỂM KÉO VỀ</label>
                  <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-700 italic text-[11px]">123 Đường Láng, Đống Đa, Hà Nội</div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-md border">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">THỜI GIAN</span>
                    <span className="text-xs font-black text-gray-800">25 PHÚT</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-md border">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">K.CÁCH</span>
                    <span className="text-xs font-black text-gray-800">4.5 KM</span>
                  </div>
                </div>
                {/* Pricing */}
                <div className="grid grid-cols-4 gap-1">
                  <div className="flex flex-col items-center py-1 bg-red-50 rounded-md border border-red-200">
                    <span className="text-[8px] font-bold text-red-400 uppercase">NCC</span>
                    <span className="text-xs font-black text-red-600">2,200K</span>
                  </div>
                  <div className="flex flex-col items-center py-1 bg-blue-50 rounded-md border border-blue-200">
                    <span className="text-[8px] font-bold text-blue-400 uppercase">KHÁCH</span>
                    <span className="text-xs font-black text-blue-600">3,100K</span>
                  </div>
                  <div className="flex flex-col items-center py-1 bg-green-50 rounded-md border border-green-200">
                    <span className="text-[8px] font-bold text-green-500 uppercase">ĐÃ CỌC</span>
                    <span className="text-xs font-black text-green-600">500K</span>
                  </div>
                  <div className="flex flex-col items-center py-1 bg-gray-50 rounded-md border">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">CÒN LẠI</span>
                    <span className="text-xs font-black text-gray-800">2,600K</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button className="flex items-center justify-center space-x-1.5 py-1.5 bg-red-600 text-white rounded-md text-[11px] font-bold hover:bg-red-700 transition-all">
                    <Zap size={12} />
                    <span>QRCODE</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1.5 py-1.5 bg-green-600 text-white rounded-md text-[11px] font-bold hover:bg-green-700 transition-all">
                    <Zap size={12} />
                    <span>QRCODE</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">CHI TIẾT SỰ CỐ</h3>
                  <div className="flex space-x-1">
                    <button className="p-1 text-green-500 bg-green-50 border border-green-100 rounded-md"><CheckCircle size={14} /></button>
                    <button className="p-1 text-blue-500 bg-blue-50 border border-blue-100 rounded-md"><ShieldCheck size={14} /></button>
                    <button className="p-1 text-red-500 bg-red-50 border border-red-100 rounded-md"><XCircle size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">TÊN KHÁCH HÀNG</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-gray-800 text-sm">NGUYỄN VĂN A</div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">SỐ ĐIỆN THOẠI</label>
                    <div className="px-2 py-1 bg-gray-50 rounded-md border border-gray-100 font-bold text-blue-600 text-sm">0912345678</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">THÔNG TIN PHƯƠNG TIỆN</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="py-1 bg-gray-50 rounded-md border text-center">
                      <span className="text-[10px] font-black text-gray-800">MAZDA</span>
                    </div>
                    <div className="py-1 bg-gray-50 rounded-md border text-center">
                      <span className="text-[10px] font-black text-gray-800">CX-5</span>
                    </div>
                    <div className="py-1 bg-blue-50 rounded-md border border-blue-100 text-center">
                      <span className="text-[10px] font-black text-blue-700">29A-123.45</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="flex flex-col items-center py-1 rounded-md bg-gray-50 border">
                      <span className="text-[8px] font-bold text-gray-400">TRỌNG TẢI</span>
                      <span className="text-[10px] font-black text-blue-600">1,500 KGT</span>
                    </div>
                    <div className="flex flex-col items-center py-1 rounded-md bg-gray-50 border">
                      <span className="text-[8px] font-bold text-gray-400">SỐ CHỖ</span>
                      <span className="text-[10px] font-black text-gray-800">5</span>
                    </div>
                    <div className="flex flex-col items-center py-1 rounded-md bg-gray-50 border">
                      <span className="text-[8px] font-bold text-gray-400">LOẠI XE</span>
                      <span className="text-[9px] font-black text-green-600">SUV</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">VỊ TRÍ CỨU HỘ</label>
                  <div className="px-2 py-1 bg-gray-50 rounded-md border font-bold text-gray-700 italic text-[11px]">Đường Nguyễn Văn Cừ, Long Biên, Hà Nội</div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest block">DỊCH VỤ YÊU CẦU</label>
                  <div className="flex flex-wrap gap-1">
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-[10px] font-bold">
                      <Zap size={12} />
                      <span>Kích bình ắc quy</span>
                      <XCircle size={12} className="text-green-300 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!rightPanelCollapsed && (
            <div className="bg-gray-50 border-t px-4 py-1 flex items-center justify-center space-x-4 text-[9px] text-gray-400 font-bold">
              <span className="flex items-center space-x-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> <span>KHẨN CẤP</span></span>
              <span className="flex items-center space-x-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> <span>MỨC ĐỘ VỪA</span></span>
              <span className="flex items-center space-x-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> <span>BÌNH THƯỜNG</span></span>
            </div>
          )}
        </div>
      </div>


      {/* Styles for scrollbar and animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  if (isFullscreen) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full h-full bg-gray-50 shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          {content}
        </div>
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scale-in {
            from { transform: scale(0.97); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.2s ease-out; }
          .animate-scale-in { animation: scale-in 0.25s ease-out; }
        `}</style>
      </div>,
      document.body
    );
  }

  return content;
};

const History = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

export default RescueSupervision;
