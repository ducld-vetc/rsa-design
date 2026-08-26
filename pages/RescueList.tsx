
import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, XCircle, Clock, ChevronRight, AlertCircle, Edit3, ArrowLeft, Maximize2, Search, X, Compass, MessageSquareQuote, RotateCcw, Bell, UserCog, AlertTriangle, ChevronDown } from 'lucide-react';
import { RescueUnit, FormData } from '../types';
import NotificationModal, { NotificationRecipient } from '../components/NotificationModal';
import { OverloadBadge } from '../shared/OrderAlertBadges';

interface RescueListProps {
  data: FormData;
  onSelect: (unit: RescueUnit) => void;
  onManualEntry: () => void;
  onBack: () => void;
  onExpandSearch: () => void;
}

interface UnitDriver {
  id: string;
  name: string;
  phone: string;
  busy?: boolean;
  busyOrderCode?: string;
}

const UNIT_DRIVERS: Record<string, UnitDriver[]> = {
  '1': [
    { id: '1-1', name: 'LÊ VŨ LONG', phone: '1900998865', busy: true, busyOrderCode: 'RSA-260426-001' },
    { id: '1-2', name: 'TRẦN THỊ MAI', phone: '0912000111' },
    { id: '1-3', name: 'PHẠM VĂN NAM', phone: '0912333444', busy: true, busyOrderCode: 'RSA-260426-008' },
  ],
  '2': [
    { id: '2-1', name: 'HÀ VĂN TUẤN', phone: '0912345678' },
    { id: '2-2', name: 'NGUYỄN VĂN PHÚC', phone: '0912555666' },
    { id: '2-3', name: 'LÊ MINH TUẤN', phone: '0912777888' },
  ],
  '3': [
    { id: '3-1', name: 'NGUYỄN ANH DŨNG', phone: '0988888888', busy: true, busyOrderCode: 'RSA-260426-012' },
    { id: '3-2', name: 'VŨ THỊ HƯƠNG', phone: '0988000111' },
    { id: '3-3', name: 'ĐỖ VĂN KHÁNH', phone: '0988222333' },
  ],
  '4': [
    { id: '4-1', name: 'TRẦN VĂN B', phone: '0909090909' },
    { id: '4-2', name: 'NGUYỄN THỊ LAN', phone: '0909111222' },
  ],
};

const applyDriverToUnit = (unit: RescueUnit, driver: UnitDriver): RescueUnit => ({
  ...unit,
  contact1: `${driver.name} - ${driver.phone}`,
  driverBusy: Boolean(driver.busy),
  busyOrderCode: driver.busy ? driver.busyOrderCode : undefined,
});

const findDriverOfUnit = (unit: RescueUnit): UnitDriver | undefined => {
  const drivers = UNIT_DRIVERS[unit.id] || [];
  return drivers.find((d) => unit.contact1.includes(d.phone) || unit.contact1.includes(d.name)) || drivers[0];
};

const mockUnits: RescueUnit[] = [
  {
    id: '1',
    name: 'Carpla Service - CN Hà Nội',
    partner: 'CARPLA - CARPLA SERVICE',
    status: 'Accepted',
    distance: 3.2,
    time: 12,
    address: 'Phường Việt Hưng, Hà Nội, 11810, Việt Nam',
    contact1: 'LÊ VŨ LONG - 1900998865',
    contact2: 'Mr. Hoàn - 936499296',
    vehicleType: '<= 1.4 tấn',
    overloaded: true,
    driverBusy: true,
    busyOrderCode: 'RSA-260426-001'
  },
  {
    id: '2',
    name: 'Cứu hộ 116 Hà Nội',
    partner: '116 GROUP',
    status: 'Accepted',
    distance: 5.8,
    time: 18,
    address: 'Quận Cầu Giấy, Hà Nội',
    contact1: 'HÀ VĂN TUẤN - 0912345678',
    contact2: 'Trạm trưởng - 0912345679',
    vehicleType: '<= 2.5 tấn'
  },
  {
    id: '3',
    name: 'Garage Thăng Long',
    partner: 'THĂNG LONG AUTO',
    status: 'Pending',
    distance: 4.1,
    time: 15,
    address: 'Quận Ba Đình, Hà Nội',
    contact1: 'NGUYỄN ANH DŨNG - 0988888888',
    contact2: 'CSKH - 0988111222',
    vehicleType: '<= 1.4 tấn',
    overloaded: true,
    driverBusy: true,
    busyOrderCode: 'RSA-260426-012'
  },
  {
    id: '4',
    name: 'Cứu hộ ABC',
    partner: 'ABC PARTNER',
    status: 'Rejected',
    distance: 2.5,
    time: 8,
    address: 'Quận Hoàn Kiếm, Hà Nội',
    contact1: 'TRẦN VĂN B - 0909090909',
    contact2: 'Kỹ thuật - 0909111222',
    vehicleType: '<= 1.4 tấn'
  }
];

const ChangeDriverModal: React.FC<{
  unit: RescueUnit;
  drivers: UnitDriver[];
  onClose: () => void;
  onConfirm: (driver: UnitDriver) => void;
}> = ({ unit, drivers, onClose, onConfirm }) => {
  const currentDriver = findDriverOfUnit(unit);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <UserCog size={20} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Thay đổi tài xế</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-gray-500">
            Đơn vị: <span className="font-bold text-gray-800">{unit.name}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Tài xế hiện tại</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold text-gray-400">
                  {currentDriver?.name || unit.contact1}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">SĐT tài xế hiện tại</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold text-gray-400">
                  {currentDriver?.phone || '—'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">
                  Tài xế mới <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:border-vetc-green focus:ring-4 focus:ring-green-50/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Chọn tài xế...</option>
                    {drivers
                      .filter((d) => d.id !== currentDriver?.id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}{d.busy ? ' (Đang trong chuyến)' : ''}
                        </option>
                      ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">SĐT tài xế mới</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-xs font-bold text-gray-700">
                  {selectedDriver?.phone || '—'}
                </div>
              </div>
            </div>
          </div>

          {selectedDriver?.busy && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Tài xế <span className="font-bold">{selectedDriver.name}</span> đang trong chuyến khác
                {selectedDriver.busyOrderCode ? ` (mã đơn ${selectedDriver.busyOrderCode})` : ''}. Bạn vẫn có thể chọn.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button
              disabled={!selectedDriver}
              onClick={() => selectedDriver && onConfirm(selectedDriver)}
              className="flex-1 bg-vetc-green text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Xác nhận thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock notification data - replace with API data in production

const mockNotifications: Record<string, NotificationRecipient[]> = {
  '1': [
    { name: 'Lê Vũ Long', role: 'Tài xế', sentAt: '29/04/2026 14:00:12', viewedAt: '29/04/2026 14:00:45' },
    { name: 'Nguyễn Văn Hoàn', role: 'Trạm trưởng', sentAt: '29/04/2026 14:00:12', viewedAt: '29/04/2026 14:01:30' },
    { name: 'Trần Thị Mai', role: 'Tài xế', sentAt: '29/04/2026 14:00:12', viewedAt: null },
  ],
  '2': [
    { name: 'Hà Văn Tuấn', role: 'Tài xế', sentAt: '29/04/2026 14:00:15', viewedAt: '29/04/2026 14:01:05' },
    { name: 'Phạm Đức Anh', role: 'Trạm trưởng', sentAt: '29/04/2026 14:00:15', viewedAt: '29/04/2026 14:02:10' },
  ],
  '3': [
    { name: 'Nguyễn Anh Dũng', role: 'Tài xế', sentAt: '29/04/2026 14:00:18', viewedAt: null },
    { name: 'Lê Hoàng Nam', role: 'Trạm trưởng', sentAt: '29/04/2026 14:00:18', viewedAt: null },
    { name: 'Vũ Thị Hương', role: 'Trạm trưởng', sentAt: '29/04/2026 14:00:18', viewedAt: null },
  ],
  '4': [
    { name: 'Trần Văn B', role: 'Tài xế', sentAt: '29/04/2026 14:00:20', viewedAt: '29/04/2026 14:00:55' },
    { name: 'Nguyễn Thị Lan', role: 'Trạm trưởng', sentAt: '29/04/2026 14:00:20', viewedAt: '29/04/2026 14:01:40' },
  ],
};

const RescueList: React.FC<RescueListProps> = ({ data, onSelect, onManualEntry, onBack, onExpandSearch }) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [searchRange, setSearchRange] = useState('20');
  const [unitNotes, setUnitNotes] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<RescueUnit[]>(mockUnits);
  const [busyWarningUnit, setBusyWarningUnit] = useState<RescueUnit | null>(null);
  const [changeDriverUnit, setChangeDriverUnit] = useState<RescueUnit | null>(null);
  const [selectAfterDriverChange, setSelectAfterDriverChange] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationUnitId, setNotificationUnitId] = useState<string | null>(null);

  const handleViewNotifications = (unitId: string) => {
    setNotificationUnitId(unitId);
    setIsNotificationModalOpen(true);
  };

  const isSelected = (unit: RescueUnit) => {
    return data.station.station === unit.name;
  };

  const updateUnit = (updated: RescueUnit) => {
    setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    return updated;
  };

  const handleSelectClick = (unit: RescueUnit) => {
    if (unit.status === 'Rejected') return;
    if (unit.driverBusy) {
      setBusyWarningUnit(unit);
      return;
    }
    onSelect(unit);
  };

  const handleConfirmBusySelect = () => {
    if (busyWarningUnit) {
      onSelect(busyWarningUnit);
    }
    setBusyWarningUnit(null);
  };

  const handleOpenChangeDriver = (unit: RescueUnit, thenSelect: boolean) => {
    setChangeDriverUnit(unit);
    setSelectAfterDriverChange(thenSelect);
    setBusyWarningUnit(null);
  };

  const handleConfirmChangeDriver = (driver: UnitDriver) => {
    if (!changeDriverUnit) return;
    const updated = updateUnit(applyDriverToUnit(changeDriverUnit, driver));
    const shouldSelect = selectAfterDriverChange;
    setChangeDriverUnit(null);
    setSelectAfterDriverChange(false);
    if (!shouldSelect) return;
    if (updated.driverBusy) {
      setBusyWarningUnit(updated);
      return;
    }
    onSelect(updated);
  };

  const unitsRef = React.useRef(units);
  unitsRef.current = units;

  useEffect(() => {
    if (timeLeft <= 0) {
      const list = unitsRef.current;
      const firstAccepted = list.find(u => u.status === 'Accepted') || list[0];
      onSelect(firstAccepted);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSelect]);

  const handleStartExpandSearch = () => {
    setIsRangeModalOpen(false);
    onExpandSearch();
  };

  const handleNoteChange = (id: string, note: string) => {
    setUnitNotes(prev => ({ ...prev, [id]: note }));
  };

  const handleResend = (id: string) => {
    // Logic gửi lại yêu cầu cứu hộ
    console.log(`Resending request to unit ${id}`);
    alert(`Đã gửi lại yêu cầu cứu hộ cho đơn vị: ${units.find(u => u.id === id)?.name}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <span className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold"><CheckCircle2 size={12} /> <span>Đã đồng ý</span></span>;
      case 'Rejected':
        return <span className="flex items-center space-x-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><XCircle size={12} /> <span>Từ chối</span></span>;
      default:
        return <span className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold"><Clock size={12} /> <span>Đang chờ</span></span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
        <div className="flex flex-1 items-center justify-between bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg w-full">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-2 rounded-full">
              <Timer size={24} className={timeLeft <= 5 ? 'animate-pulse text-red-200' : ''} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-blue-900">Danh sách đơn vị phản hồi</h3>
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Mã đơn: {data.orderId}</span>
              </div>
              <p className="text-sm text-blue-700">Hệ thống sẽ tự động chọn đơn vị tối ưu nhất sau {timeLeft} giây</p>
            </div>
          </div>
          <div className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-600 animate-bounce' : 'text-blue-600'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-500 font-bold hover:bg-gray-50 transition-all shadow-sm text-sm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại</span>
          </button>

          <button 
            onClick={() => setIsRangeModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-white border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition-all shadow-sm text-sm"
          >
            <Maximize2 size={18} />
            <span>Mở rộng tìm kiếm</span>
          </button>
          
          <button 
            onClick={onManualEntry}
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-white border-2 border-vetc-green text-vetc-green font-bold hover:bg-green-50 transition-all shadow-sm text-sm"
          >
            <Edit3 size={18} />
            <span>Nhập cứu hộ thủ công</span>
          </button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-500 uppercase text-[11px] font-bold tracking-wider">
              <th className="px-4 py-3 text-left">Đơn vị cứu hộ</th>
              <th className="px-4 py-3 text-left">SĐT tài xế</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Khoảng cách</th>
              <th className="px-4 py-3 text-center">Thời gian tiếp cận</th>
              <th className="px-4 py-3 text-center">Chi phí dự kiến</th>
              <th className="px-4 py-3 text-left min-w-[150px]">Ghi chú</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit) => (
              <tr key={unit.id} className={`hover:bg-gray-50 transition-colors ${unit.status === 'Rejected' ? 'opacity-60 bg-gray-50/50' : ''}`}>
                <td className="px-4 py-4">
                  <div className="font-bold text-gray-900">{unit.address}</div>
                  <div className="text-[11px] text-gray-500">{unit.name}</div>
                  <div className="text-[11px] text-gray-500">{unit.contact2}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{unit.contact1}</div>
                  {unit.driverBusy && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      <AlertTriangle size={10} />
                      <span>Đang trong chuyến{unit.busyOrderCode ? ` · ${unit.busyOrderCode}` : ''}</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getStatusBadge(unit.status)}
                    {unit.overloaded && <OverloadBadge compact />}
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-medium text-gray-600">
                  {unit.distance} km
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center text-blue-600 font-bold">
                    {unit.time}p
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {unit.status === 'Pending' ? (
                    <span className="text-gray-400 text-xs italic">Chờ phản hồi</span>
                  ) : unit.status === 'Rejected' ? (
                    <span className="text-gray-300">-</span>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-red-600 font-black tracking-tight">300.000 đ</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">Tạm tính</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="relative group">
                    <textarea 
                      value={unitNotes[unit.id] || ''}
                      onChange={(e) => handleNoteChange(unit.id, e.target.value)}
                      placeholder="Nhập ghi chú cho đơn vị này..."
                      className="w-full border rounded-lg p-2 text-[11px] outline-none focus:border-vetc-green bg-gray-50/50 focus:bg-white transition-all min-h-[40px] resize-none"
                    />
                    <MessageSquareQuote size={12} className="absolute right-2 bottom-2 text-gray-300 pointer-events-none group-focus-within:text-vetc-green" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleViewNotifications(unit.id)}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all group flex items-center justify-center"
                      title="Xem thông báo"
                    >
                      <Bell size={16} className="group-hover:animate-[swing_0.5s_ease-in-out] transition-transform" />
                    </button>
                    <button
                      onClick={() => handleResend(unit.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all group flex items-center justify-center"
                      title="Gửi lại yêu cầu cho đơn vị này"
                    >
                      <RotateCcw size={16} className="group-active:rotate-180 transition-transform duration-300" />
                    </button>
                    {unit.status !== 'Rejected' && (
                      <button
                        onClick={() => handleOpenChangeDriver(unit, false)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all group flex items-center justify-center"
                        title="Thay đổi tài xế"
                      >
                        <UserCog size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    {isSelected(unit) ? (
                      <div className="inline-flex items-center justify-center space-x-1 w-[120px] whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        <CheckCircle2 size={14} className="text-vetc-green" />
                        <span>Đã chọn</span>
                      </div>
                    ) : (
                      <button
                        disabled={unit.status === 'Rejected'}
                        onClick={() => handleSelectClick(unit)}
                        className={`inline-flex items-center justify-center space-x-1 w-[120px] whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-bold transition-all
                          ${unit.status === 'Rejected'
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-vetc-green text-white hover:bg-green-700 hover:shadow-md'}`}
                      >
                        <span>Chọn</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center space-x-2 text-xs text-gray-400 italic">
        <AlertCircle size={14} />
        <span>Lưu ý: Bạn có thể nhập ghi chú và chọn thủ công đơn vị cứu hộ mong muốn trước khi hết thời gian chờ.</span>
      </div>

      {/* Range Selection Modal */}
      {isRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Compass size={20} />
                <h3 className="font-bold">Mở rộng phạm vi tìm kiếm</h3>
              </div>
              <button 
                onClick={() => setIsRangeModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Nhập phạm vi cứu hộ (km)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={searchRange}
                    onChange={(e) => setSearchRange(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-vetc-green transition-all text-lg font-bold text-vetc-green pr-12"
                    placeholder="20"
                    autoFocus
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">km</span>
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  * Phạm vi càng rộng thời gian chờ của khách hàng có thể tăng lên do quãng đường di chuyển xa hơn.
                </p>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsRangeModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleStartExpandSearch}
                  className="flex-1 bg-vetc-green text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Search size={18} />
                  <span>Tìm kiếm cứu hộ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Busy driver warning modal */}
      {busyWarningUnit && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Cảnh báo tài xế đang trong chuyến</h3>
                  <p className="text-xs text-white/80">Tài xế hiện tại đang thực hiện đơn cứu hộ khác</p>
                </div>
              </div>
              <button
                onClick={() => setBusyWarningUnit(null)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Tài xế <span className="font-bold text-gray-900">{busyWarningUnit.contact1.split(' - ')[0]}</span> của đơn vị <span className="font-bold text-gray-900">{busyWarningUnit.name}</span> đang trong chuyến khác
                  {busyWarningUnit.busyOrderCode ? (
                    <> (mã đơn <span className="font-black text-amber-800">{busyWarningUnit.busyOrderCode}</span>)</>
                  ) : null}.
                </p>
                <p className="text-sm text-gray-600">
                  Nếu xác nhận, hệ thống vẫn chọn đơn vị và tài xế này cho đơn hiện tại. Bạn cũng có thể đổi sang tài xế khác của cùng đơn vị.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tài xế:</span>
                  <span className="font-bold text-gray-700">{busyWarningUnit.contact1}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Khoảng cách:</span>
                  <span className="font-bold text-gray-700">{busyWarningUnit.distance} km</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Thời gian:</span>
                  <span className="font-bold text-gray-700">{busyWarningUnit.time} phút</span>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setBusyWarningUnit(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmBusySelect}
                  className="flex-1 bg-vetc-green text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                >
                  Xác nhận
                </button>
              </div>
              <button
                onClick={() => handleOpenChangeDriver(busyWarningUnit, true)}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 border-blue-500 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                <UserCog size={16} />
                <span>Thay đổi tài xế</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {changeDriverUnit && (
        <ChangeDriverModal
          unit={changeDriverUnit}
          drivers={UNIT_DRIVERS[changeDriverUnit.id] || []}
          onClose={() => {
            const pendingUnit = changeDriverUnit;
            const shouldReshowWarning = selectAfterDriverChange;
            setChangeDriverUnit(null);
            setSelectAfterDriverChange(false);
            if (shouldReshowWarning && pendingUnit) {
              setBusyWarningUnit(pendingUnit);
            }
          }}
          onConfirm={handleConfirmChangeDriver}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen && !!notificationUnitId}
        onClose={() => setIsNotificationModalOpen(false)}
        unitName={units.find(u => u.id === notificationUnitId)?.name}
        recipients={notificationUnitId ? (mockNotifications[notificationUnitId] || []) : []}
      />
    </div>
  );
};

export default RescueList;
