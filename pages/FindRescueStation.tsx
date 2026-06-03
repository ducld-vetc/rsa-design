
import React, { useState } from 'react';
import { RefreshCw, Plus, Trash2, ChevronDown, MapPin, X, Navigation, LocateFixed, Search, Hash, AlertTriangle, MessageCircleX } from 'lucide-react';
import { FormData } from '../types';

interface FindRescueStationProps {
  data: FormData;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  onUpdateStation: (updates: Partial<FormData['station']>) => void;
}

const FindRescueStation: React.FC<FindRescueStationProps> = ({ data, onNext, onBack, onCancel, onUpdateStation }) => {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [mapAddress, setMapAddress] = useState(data.station.towingDestination);
  const [mapCoords, setMapCoords] = useState('');
  
  // Mock data for adjustment coefficients
  const [adjustmentRows, setAdjustmentRows] = useState([
    { id: 1, type: 'Thời gian', detail: 'Ban ngày', coefficient: 1.0, amount: '211,000' },
    { id: 2, type: 'Thời tiết', detail: 'Bình thường', coefficient: 2.5, amount: '527,500' },
    { id: 3, type: 'Khu vực', detail: 'Nội thành', coefficient: 1.4, amount: '295,400' },
    { id: 4, type: 'Trọng tải xe KH', detail: '<= 1,4 tấn', coefficient: 1.3, amount: '274,300' }
  ]);

  // Calculate the maximum coefficient to highlight
  const maxCoefficient = Math.max(...adjustmentRows.map(row => row.coefficient));

  const SectionHeader = ({ title, icon, color = 'bg-vetc-green', orderId, extra }: { title: string, icon?: React.ReactNode, color?: string, orderId?: string, extra?: React.ReactNode }) => (
    <div className={`${color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between font-medium`}>
      <div className="flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex items-center space-x-4">
        {extra}
        {orderId && (
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-white/20 text-xs backdrop-blur-sm border border-white/30">
            <Hash size={10} />
            <span className="font-bold tracking-tight">Mã đơn: {orderId}</span>
          </div>
        )}
      </div>
    </div>
  );

  const handleConfirmLocation = () => {
    onUpdateStation({ towingDestination: mapAddress });
    setIsMapModalOpen(false);
  };

  const removeAdjustmentRow = (id: number) => {
    setAdjustmentRows(prev => prev.filter(row => row.id !== id));
  };

  const handleConfirmCancel = () => {
    console.log("Order cancelled for reason:", cancelReason);
    setIsCancelModalOpen(false);
    onCancel();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Điểm dịch vụ cứu hộ */}
      <div className="border rounded-lg shadow-sm">
        <SectionHeader title="Điểm dịch vụ cứu hộ" icon={<MapPin size={18} />} orderId={data.orderId} />
        <div className="p-4 space-y-4 bg-white">
          <button className="bg-vetc-green text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700 transition-colors">
            Tìm trạm cứu hộ
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Đối tác <span className="text-red-500">*</span></label>
                <select className="flex-1 border rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-vetc-green">
                  <option>{data.station.partner}</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Trạm cứu hộ <span className="text-red-500">*</span></label>
                <select className="flex-1 border rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-vetc-green">
                  <option>{data.station.station}</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Địa chỉ trạm</label>
                <input readOnly value={data.station.address} className="flex-1 bg-gray-50 border rounded px-3 py-1.5 text-sm outline-none cursor-not-allowed" />
              </div>
              <div className="flex items-center space-x-2">
                <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Địa điểm kéo về</label>
                <div className="flex-1 flex space-x-2">
                  <input 
                    value={data.station.towingDestination} 
                    onChange={(e) => onUpdateStation({ towingDestination: e.target.value })}
                    className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green" 
                  />
                  <button 
                    onClick={() => {
                      setMapAddress(data.station.towingDestination);
                      setIsMapModalOpen(true);
                    }}
                    className="bg-vetc-green text-white px-3 py-1.5 rounded text-[11px] font-bold hover:bg-green-700 transition-all flex items-center space-x-1 shrink-0 shadow-sm"
                  >
                    <MapPin size={16} />
                    <span>Bản đồ</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Loại xe cứu hộ <span className="text-red-500">*</span></label>
                <select className="flex-1 border rounded px-3 py-1.5 text-sm bg-white outline-none focus:border-vetc-green">
                  <option>{data.station.vehicleType}</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center">
                <label className="w-40 text-xs font-semibold text-gray-600 uppercase">Thông tin liên hệ</label>
                <input readOnly value={data.station.contact1} className="flex-1 bg-gray-50 border rounded px-3 py-1.5 text-sm outline-none cursor-not-allowed" />
              </div>
               <div className="flex items-center">
                <label className="w-40 text-xs font-semibold text-gray-600 uppercase">Thông tin liên hệ trạm</label>
                <input readOnly value={data.station.contact2} className="flex-1 bg-gray-50 border rounded px-3 py-1.5 text-sm outline-none cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phí trả cho NCC */}
      <div className="border rounded-lg shadow-sm">
        <SectionHeader title="Phí trả cho NCC" />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
          <div className="flex items-center space-x-2">
            <label className="w-32 text-xs font-semibold text-gray-600 uppercase">Tạm tính <span className="text-red-500">*</span></label>
            <div className="relative flex-1">
              <input value={data.pricing.estimatedPrice} className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-8 text-right font-bold text-gray-700" />
              <button className="absolute right-2 top-1.5 p-0.5 text-gray-400 hover:text-vetc-green">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="w-40 text-xs font-semibold text-gray-600 uppercase">Khoảng cách cứu hộ <span className="text-red-500">*</span></label>
            <div className="relative flex-1">
              <input value={data.pricing.distance} className="w-full border rounded px-3 py-1.5 text-sm outline-none pr-10 text-right font-medium" />
              <span className="absolute right-3 top-1.5 text-xs text-gray-400 font-medium">km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accordions Section */}
      <div className="space-y-4">
        {/* Giá cố định */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-2 flex items-center justify-between text-sm font-bold text-gray-700 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <ChevronDown size={14} />
              <span>Giá cố định</span>
            </div>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div className="flex items-center space-x-4">
              <label className="text-xs font-semibold text-gray-600 uppercase">Giá cố định <span className="text-red-500">*</span></label>
              <input defaultValue="211,000" className="border rounded px-3 py-1.5 text-sm outline-none text-right w-48 font-bold" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-green-50 text-gray-600 border-b">
                    <th className="p-2 text-left w-12 border font-bold">STT</th>
                    <th className="p-2 text-left border font-bold">Loại</th>
                    <th className="p-2 text-left border font-bold">Khoảng cách</th>
                    <th className="p-2 text-left border font-bold">Ngưỡng trọng tải</th>
                    <th className="p-2 text-right border font-bold">Giá cố định</th>
                    <th className="p-2 text-right border font-bold">Giá thêm/1km</th>
                    <th className="p-2 text-right border font-bold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 border text-center">1</td>
                    <td className="p-2 border">Khoảng cách(km)</td>
                    <td className="p-2 border">0.00km → 10.00km</td>
                    <td className="p-2 border bg-gray-50"></td>
                    <td className="p-2 text-right border">211,000</td>
                    <td className="p-2 text-right border">0</td>
                    <td className="p-2 text-right border font-bold">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Hệ số điều chỉnh */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-2 flex items-center justify-between text-sm font-bold text-gray-700 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <ChevronDown size={14} />
              <span>Hệ số điều chỉnh</span>
            </div>
            <button className="p-1 bg-vetc-green text-white rounded hover:bg-green-700 transition-all active:scale-90">
              <Plus size={16} />
            </button>
          </div>
          <div className="p-4 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-green-50 text-gray-600 border-b">
                    <th className="p-2 text-left w-12 border font-bold">STT</th>
                    <th className="p-2 text-center border font-bold w-20">Thao tác</th>
                    <th className="p-2 text-left border font-bold">Loại điều chỉnh</th>
                    <th className="p-2 text-left border font-bold">Chi tiết</th>
                    <th className="p-2 text-right border font-bold">Hệ số</th>
                    <th className="p-2 text-right border font-bold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustmentRows.map((row, idx) => {
                    const isMax = row.coefficient === maxCoefficient;
                    return (
                      <tr key={row.id} className={`border-b hover:bg-gray-50 transition-colors ${isMax ? 'bg-orange-50/70 shadow-inner' : ''}`}>
                        <td className="p-2 border text-center font-medium">{idx + 1}</td>
                        <td className="p-2 border text-center">
                          <button 
                            onClick={() => removeAdjustmentRow(row.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                        <td className="p-2 border">
                          <select className="w-full bg-transparent outline-none">
                            <option>{row.type}</option>
                          </select>
                        </td>
                        <td className="p-2 border">
                          <select className="w-full bg-transparent outline-none">
                            <option>{row.detail}</option>
                          </select>
                        </td>
                        <td className={`p-2 text-right border font-bold transition-all ${isMax ? 'text-orange-700' : 'text-gray-700'}`}>
                          <div className="flex items-center justify-end">
                            <span>{row.coefficient.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className={`p-2 text-right border font-black ${isMax ? 'text-orange-800' : 'text-gray-700'}`}>
                          {row.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Giá trần */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-2 flex items-center justify-between text-sm font-bold text-gray-700 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <ChevronDown size={14} />
              <span>Giá trần</span>
            </div>
          </div>
          <div className="p-4 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-green-50 text-gray-600 border-b">
                    <th className="p-2 text-left w-12 border font-bold">STT</th>
                    <th className="p-2 text-left border font-bold">Loại</th>
                    <th className="p-2 text-left border font-bold">Khoảng cách</th>
                    <th className="p-2 text-right border font-bold">Giá max</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 border text-center">1</td>
                    <td className="p-2 border">Theo khoảng cách</td>
                    <td className="p-2 border">0km → 10km</td>
                    <td className="p-2 text-right border font-medium">2,000,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 border text-center">2</td>
                    <td className="p-2 border">Theo khoảng cách</td>
                    <td className="p-2 border">0km → 10km</td>
                    <td className="p-2 text-right border font-medium">1,500,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 border text-center">3</td>
                    <td className="p-2 border">Theo khoảng cách</td>
                    <td className="p-2 border">10km → 20km</td>
                    <td className="p-2 text-right border font-medium">1,700,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 border text-center">4</td>
                    <td className="p-2 border">Theo sự vụ</td>
                    <td className="p-2 border">-</td>
                    <td className="p-2 text-right border font-bold">12,000,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Map Selection Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Navigation size={22} className="animate-pulse" />
                <h3 className="font-bold text-lg">Chọn địa điểm kéo về</h3>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 relative bg-gray-100">
              <iframe 
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d105.8452!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s`}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.2] contrast-[1.1]"
              ></iframe>

              <div className="absolute top-4 left-4 right-4 z-10 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-vetc-green transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text"
                    value={mapAddress}
                    onChange={(e) => setMapAddress(e.target.value)}
                    placeholder="Tìm kiếm địa chỉ kéo xe về..."
                    className="w-full bg-white border-2 border-transparent focus:border-vetc-green shadow-xl rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Hash size={18} />
                  </div>
                  <input 
                    type="text"
                    value={mapCoords}
                    onChange={(e) => setMapCoords(e.target.value)}
                    placeholder="Tìm kiếm theo tọa độ (Lat, Lng)..."
                    className="w-full bg-white border-2 border-transparent focus:border-blue-500 shadow-xl rounded-xl py-3 pl-10 pr-4 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative flex flex-col items-center -translate-y-6">
                  <div className="bg-vetc-green text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-lg mb-2 whitespace-nowrap">
                    Địa điểm kéo về
                  </div>
                  <MapPin size={48} className="text-vetc-green drop-shadow-2xl fill-vetc-green/20" />
                </div>
              </div>

              <button className="absolute bottom-6 right-6 bg-white p-3 rounded-xl shadow-xl border hover:bg-gray-50 transition-all text-vetc-green active:scale-90">
                <LocateFixed size={24} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Vị trí được chọn</span>
                <span className="text-sm font-bold text-gray-700 truncate max-w-[400px]">
                  {mapAddress || 'Đang chọn vị trí...'}
                </span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsMapModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleConfirmLocation}
                  className="bg-vetc-green text-white px-8 py-2 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                >
                  Xác nhận vị trí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Dialog */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-red-500 p-4 text-white flex items-center space-x-3">
              <AlertTriangle size={22} />
              <h3 className="font-bold">Xác nhận hủy đơn hàng</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-xs">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>Hành động này sẽ hủy yêu cầu cứu hộ hiện tại của khách hàng. Vui lòng nhập lý do cụ thể.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Lý do hủy đơn <span className="text-red-500">*</span></label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do khách hàng muốn hủy đơn..."
                  className="w-full border rounded-xl p-3 text-sm min-h-[100px] outline-none focus:border-red-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button 
                  disabled={!cancelReason.trim()}
                  onClick={handleConfirmCancel}
                  className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy đơn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t mt-8">
        <div className="flex space-x-3">
          <button 
            onClick={onBack}
            className="bg-[#00703C] hover:bg-[#005a30] text-white px-6 py-2 rounded font-bold transition-all shadow-sm flex items-center space-x-2"
          >
            <span>Quay lại</span>
          </button>
          <button 
            onClick={() => setIsCancelModalOpen(true)}
            className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-6 py-2 rounded font-bold transition-all flex items-center space-x-2"
          >
            <span>Hủy đơn</span>
          </button>
        </div>
        <button 
          onClick={onNext}
          className="bg-vetc-green hover:bg-green-700 text-white px-8 py-2 rounded font-bold transition-all shadow-md flex items-center space-x-2"
        >
          <span>Tiếp theo</span>
        </button>
      </div>
    </div>
  );
};

export default FindRescueStation;
