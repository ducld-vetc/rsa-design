
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Users, ShieldCheck, Truck, Activity, PlusCircle, ClipboardList, PlayCircle, Building2, DollarSign, LayoutDashboard, Briefcase, Package, Wallet, FileText, MapPin, Calendar, CalendarDays } from 'lucide-react';
import { Step } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onNavigateRsaDashboard: () => void;
  onNavigateRescueSupervision: () => void;
  onNavigateSupporting: () => void;
  onNavigateCreate: () => void;
  onNavigateOrderManagement: () => void;
  onNavigateGuestOrder: () => void;
  onNavigateStationCreate: () => void;
  onNavigateStationOrders: () => void;
  onNavigateStationManagement: () => void;
  onNavigateStaffManagement: () => void;
  onNavigatePricingPolicy: () => void;
  onNavigateBusinessManagement: () => void;
  onNavigatePackagePurchaseManagement: () => void;
  onNavigatePaymentRequestManagement: () => void;
  onNavigateLocationSearch: () => void;
  onNavigateShiftDefinition: () => void;
  onNavigateShiftMonthlySchedule: () => void;
  currentStep: Step;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onNavigateRsaDashboard,
  onNavigateRescueSupervision,
  onNavigateSupporting, 
  onNavigateCreate, 
  onNavigateOrderManagement, 
  onNavigateGuestOrder, 
  onNavigateStationCreate,
  onNavigateStationOrders,
  onNavigateStationManagement,
  onNavigateStaffManagement,
  onNavigatePricingPolicy,
  onNavigateBusinessManagement,
  onNavigatePackagePurchaseManagement,
  onNavigatePaymentRequestManagement,
  onNavigateLocationSearch,
  onNavigateShiftDefinition,
  onNavigateShiftMonthlySchedule,
  currentStep 
}) => {
  const [openMenus, setOpenMenus] = useState<string[]>(['admin', 'payment', 'cskh', 'rescue', 'station']);

  if (!isOpen) return null;

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId) 
        : [...prev, menuId]
    );
  };

  const isMenuOpen = (menuId: string) => openMenus.includes(menuId);

  return (
    <aside className="w-64 bg-white border-r flex flex-col transition-all duration-300">
      <div className="p-4 border-b flex items-center justify-center">
        <div className="w-8 h-8 bg-[#00A859] rounded flex items-center justify-center text-white font-black italic shadow-inner">V</div>
        <span className="font-black text-gray-800 tracking-tighter text-xl ml-2">VETC</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Quản trị hệ thống */}
        <div className="px-4 mb-2">
          <div 
            onClick={() => toggleMenu('admin')}
            className="flex items-center justify-between text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck size={18} className="text-gray-500" />
              <span className="text-sm font-medium">Quản trị hệ thống</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen('admin') ? 'rotate-180' : ''}`} />
          </div>
          {isMenuOpen('admin') && (
            <div className="ml-8 mt-2 space-y-1">
              <div 
                onClick={onNavigateStaffManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.STAFF_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users size={14} />
                <span>Quản lý nhân viên</span>
              </div>
              <div 
                onClick={onNavigatePricingPolicy}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.PRICING_POLICY ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <DollarSign size={14} />
                <span>Chính sách giá</span>
              </div>
              <div 
                onClick={onNavigateBusinessManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.BUSINESS_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Briefcase size={14} />
                <span>Quản lý doanh nghiệp</span>
              </div>
              <div 
                onClick={onNavigatePackagePurchaseManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.PACKAGE_PURCHASE_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Package size={14} />
                <span>Quản lý mua gói</span>
              </div>
              <div 
                onClick={onNavigateShiftDefinition}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.SHIFT_DEFINITION_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Calendar size={14} />
                <span>Cấu hình ca làm việc</span>
              </div>
              <div 
                onClick={onNavigateShiftMonthlySchedule}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.SHIFT_MONTHLY_SCHEDULE ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <CalendarDays size={14} />
                <span>Lịch ca theo tháng</span>
              </div>
              <div>
                <div
                  onClick={() => toggleMenu('payment')}
                  className="flex items-center justify-between text-sm p-2 rounded cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Wallet size={14} />
                    <span>Quản lý thanh toán</span>
                  </div>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isMenuOpen('payment') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('payment') && (
                  <div className="ml-4 mt-1 space-y-1">
                    <div
                      onClick={onNavigatePaymentRequestManagement}
                      className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.PAYMENT_REQUEST_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FileText size={14} />
                      <span>Đề nghị thanh toán</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chăm sóc khách hàng */}
        <div className="px-4 mb-2">
          <div 
            onClick={() => toggleMenu('cskh')}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isMenuOpen('cskh') ? 'bg-vetc-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-2">
              <HelpCircle size={18} />
              <span className="text-sm font-medium">Chăm sóc khách hàng</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen('cskh') ? 'rotate-180' : ''}`} />
          </div>
          {isMenuOpen('cskh') && (
            <div className="ml-8 mt-2 space-y-1">
              <div 
                onClick={onNavigateCreate}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.CUSTOMER_INFO ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <PlusCircle size={14} />
                <span>Tạo đơn cứu hộ</span>
              </div>
              <div 
                onClick={onNavigateOrderManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.ORDER_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ClipboardList size={14} />
                <span>Quản lý đơn hàng</span>
              </div>
              <div 
                onClick={onNavigateLocationSearch}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.LOCATION_SEARCH ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MapPin size={14} />
                <span>Tìm kiếm vị trí</span>
              </div>
            </div>
          )}
        </div>

        {/* Giám sát cứu hộ */}
        <div className="px-4 mb-2">
          <div 
            onClick={() => toggleMenu('rescue')}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isMenuOpen('rescue') && !isMenuOpen('cskh') ? 'bg-vetc-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-2">
              <Truck size={18} />
              <span className="text-sm font-medium">Giám sát cứu hộ</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen('rescue') ? 'rotate-180' : ''}`} />
          </div>
          {isMenuOpen('rescue') && (
            <div className="ml-8 mt-2 space-y-1">
              <div
                onClick={onNavigateRsaDashboard}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.RSA_DASHBOARD ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LayoutDashboard size={14} />
                <span>Tổng quan</span>
              </div>
              <div
                onClick={onNavigateSupporting}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.SUPPORTING ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <PlayCircle size={14} />
                <span>Đang hỗ trợ</span>
              </div>
              <div 
                onClick={onNavigateRescueSupervision}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.RESCUE_SUPERVISION ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Activity size={14} />
                <span>Giám sát</span>
              </div>
            </div>
          )}
        </div>

        {/* Trạm cứu hộ */}
        <div className="px-4 mb-2">
          <div 
            onClick={() => toggleMenu('station')}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isMenuOpen('station') && !isMenuOpen('cskh') && !isMenuOpen('rescue') ? 'bg-vetc-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-2">
              <Building2 size={18} />
              <span className="text-sm font-medium">Trạm cứu hộ</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen('station') ? 'rotate-180' : ''}`} />
          </div>
          {isMenuOpen('station') && (
            <div className="ml-8 mt-2 space-y-1">
              <div 
                onClick={onNavigateStationCreate}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.STATION_CREATE ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <PlusCircle size={14} />
                <span>Tạo đơn cứu hộ</span>
              </div>
              <div 
                onClick={onNavigateStationManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.STATION_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ClipboardList size={14} />
                <span>Quản lý đơn cứu hộ</span>
              </div>
              <div 
                onClick={onNavigateStaffManagement}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.STAFF_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users size={14} />
                <span>Quản lý nhân viên</span>
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t text-[10px] text-gray-400 font-medium uppercase tracking-widest">
        Phiên bản 2.4.0 • 02/02/2026
      </div>
    </aside>
  );
};

export default Sidebar;
