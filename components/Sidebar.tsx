
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Users, ShieldCheck, Truck, Activity, PlusCircle, ClipboardList, PlayCircle, Building2, DollarSign, LayoutDashboard, Briefcase, Package, Wallet, FileText, MapPin, Calendar, CalendarDays, Waves, Settings2, SlidersHorizontal, Handshake, BarChart3, GitBranch, Car, Store } from 'lucide-react';
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
  onNavigateStationCoverage: () => void;
  onNavigateStaffManagement: () => void;
  onNavigatePricingPolicy: () => void;
  onNavigateBusinessManagement: () => void;
  onNavigatePackagePurchaseManagement: () => void;
  onNavigatePaymentRequestManagement: () => void;
  onNavigateLocationSearch: () => void;
  onNavigateShiftDefinition: () => void;
  onNavigateShiftMonthlySchedule: () => void;
  onNavigateFloodZoneManagement: () => void;
  onNavigateRescueFeeConfiguration: () => void;
  onNavigateRescueFeeCriteria: () => void;
  onNavigatePartner: (path: string) => void;
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
  onNavigateStationCoverage,
  onNavigateStaffManagement,
  onNavigatePricingPolicy,
  onNavigateBusinessManagement,
  onNavigatePackagePurchaseManagement,
  onNavigatePaymentRequestManagement,
  onNavigateLocationSearch,
  onNavigateShiftDefinition,
  onNavigateShiftMonthlySchedule,
  onNavigateFloodZoneManagement,
  onNavigateRescueFeeConfiguration,
  onNavigateRescueFeeCriteria,
  onNavigatePartner,
  currentStep 
}) => {
  const [openMenus, setOpenMenus] = useState<string[]>([
    'admin',
    'hr',
    'rescuePackage',
    'payment',
    'cskh',
    'rescue',
    'station',
    'rescueFee',
    'partner',
    'partnerVehicle',
    'partnerReport',
    'partnerAdmin',
  ]);

  if (!isOpen) return null;

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId) 
        : [...prev, menuId]
    );
  };

  const isMenuOpen = (menuId: string) => openMenus.includes(menuId);

  const isHrActive =
    currentStep === Step.STAFF_MANAGEMENT ||
    currentStep === Step.SHIFT_DEFINITION_MANAGEMENT ||
    currentStep === Step.SHIFT_MONTHLY_SCHEDULE;

  const isRescuePackageActive =
    currentStep === Step.PRICING_POLICY ||
    currentStep === Step.PACKAGE_PURCHASE_MANAGEMENT;

  const isRescueFeeActive =
    currentStep === Step.RESCUE_FEE_CONFIGURATION ||
    currentStep === Step.RESCUE_FEE_CRITERIA;

  const isPartnerActive =
    currentStep === Step.PARTNER_VEHICLES ||
    currentStep === Step.PARTNER_TOOL_CONFIG ||
    currentStep === Step.PARTNER_STAFF ||
    currentStep === Step.PARTNER_REPORTS ||
    currentStep === Step.PARTNER_ORG;

  const isPartnerVehicleActive =
    currentStep === Step.PARTNER_VEHICLES || currentStep === Step.PARTNER_TOOL_CONFIG;

  const isPartnerAdminActive =
    currentStep === Step.RESCUE_PROVIDER_MANAGEMENT || currentStep === Step.RESCUE_STATION_ADMIN;

  const navPartnerItem = (step: Step, path: string, label: string, Icon: typeof Car) => (
    <div
      onClick={() => onNavigatePartner(path)}
      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === step ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon size={13} className="shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );

  return (
    <aside className="w-72 shrink-0 bg-white border-r flex flex-col transition-all duration-300">
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
            <div className="mt-2 space-y-0.5 pl-2">
              {/* Nhân sự */}
              <div>
                <div
                  onClick={() => toggleMenu('hr')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isHrActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Users size={14} className="shrink-0" />
                    <span className="truncate">Nhân sự</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isMenuOpen('hr') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('hr') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    <div
                      onClick={onNavigateStaffManagement}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.STAFF_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Users size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Quản lý nhân viên</span>
                    </div>
                    <div
                      onClick={onNavigateShiftDefinition}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.SHIFT_DEFINITION_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Calendar size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Cấu hình ca làm việc</span>
                    </div>
                    <div
                      onClick={onNavigateShiftMonthlySchedule}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.SHIFT_MONTHLY_SCHEDULE ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <CalendarDays size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Lịch ca theo tháng</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gói cứu hộ */}
              <div>
                <div
                  onClick={() => toggleMenu('rescuePackage')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isRescuePackageActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Package size={14} className="shrink-0" />
                    <span className="truncate">Gói cứu hộ</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isMenuOpen('rescuePackage') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('rescuePackage') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    <div
                      onClick={onNavigatePricingPolicy}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.PRICING_POLICY ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <DollarSign size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Chính sách giá</span>
                    </div>
                    <div
                      onClick={onNavigatePackagePurchaseManagement}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.PACKAGE_PURCHASE_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Package size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Quản lý mua gói</span>
                    </div>
                  </div>
                )}
              </div>

              <div 
                onClick={onNavigateBusinessManagement}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded cursor-pointer ${currentStep === Step.BUSINESS_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Briefcase size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Quản lý doanh nghiệp</span>
              </div>
              <div>
                <div
                  onClick={() => toggleMenu('partnerAdmin')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isPartnerAdminActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Handshake size={14} className="shrink-0" />
                    <span className="truncate">Quản lý đối tác cứu hộ</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isMenuOpen('partnerAdmin') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('partnerAdmin') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    {navPartnerItem(Step.RESCUE_PROVIDER_MANAGEMENT, '/admin/rescue-providers', 'Nhà cung cấp', Store)}
                    {navPartnerItem(Step.RESCUE_STATION_ADMIN, '/admin/rescue-stations', 'Trạm cứu hộ', Building2)}
                  </div>
                )}
              </div>
              <div 
                onClick={onNavigateFloodZoneManagement}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded cursor-pointer ${currentStep === Step.FLOOD_ZONE_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Waves size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Khu vực ngập lụt</span>
              </div>
              <div>
                <div
                  onClick={() => toggleMenu('rescueFee')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer transition-colors ${
                    isRescueFeeActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <DollarSign size={14} className="shrink-0" />
                    <span className="truncate">Phí cứu hộ</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isMenuOpen('rescueFee') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('rescueFee') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    <div
                      onClick={onNavigateRescueFeeConfiguration}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.RESCUE_FEE_CONFIGURATION ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <Settings2 size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Cấu hình phí</span>
                    </div>
                    <div
                      onClick={onNavigateRescueFeeCriteria}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.RESCUE_FEE_CRITERIA ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <SlidersHorizontal size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Danh mục tiêu chí</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div
                  onClick={() => toggleMenu('payment')}
                  className="flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Wallet size={14} className="shrink-0" />
                    <span className="truncate">Quản lý thanh toán</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isMenuOpen('payment') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('payment') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    <div
                      onClick={onNavigatePaymentRequestManagement}
                      className={`flex items-center gap-2 text-[13px] px-2 py-1.5 rounded cursor-pointer leading-snug ${currentStep === Step.PAYMENT_REQUEST_MANAGEMENT ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FileText size={13} className="shrink-0" />
                      <span className="whitespace-nowrap">Đề nghị thanh toán</span>
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
                onClick={onNavigateStationCoverage}
                className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer ${currentStep === Step.STATION_COVERAGE ? 'font-semibold text-blue-600 bg-blue-50 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <MapPin size={14} />
                <span>Độ phủ theo tỉnh</span>
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

        {/* Đối tác cứu hộ */}
        <div className="px-4 mb-2">
          <div
            onClick={() => toggleMenu('partner')}
            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${isMenuOpen('partner') && isPartnerActive ? 'bg-vetc-green text-white shadow-md' : isPartnerActive ? 'bg-emerald-50 text-[#00A859]' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <div className="flex items-center space-x-2">
              <Handshake size={18} />
              <span className="text-sm font-medium">Đối tác cứu hộ</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen('partner') ? 'rotate-180' : ''}`} />
          </div>
          {isMenuOpen('partner') && (
            <div className="mt-2 space-y-0.5 pl-2">
              <div>
                <div
                  onClick={() => toggleMenu('partnerVehicle')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer ${
                    isPartnerVehicleActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Car size={14} className="shrink-0" />
                    <span className="truncate">Hồ sơ xe cứu hộ</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform ${isMenuOpen('partnerVehicle') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('partnerVehicle') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    {navPartnerItem(Step.PARTNER_VEHICLES, '/partner/vehicles', 'Danh sách phương tiện', Car)}
                    {navPartnerItem(Step.PARTNER_TOOL_CONFIG, '/partner/tool-config', 'Cấu hình công cụ', Settings2)}
                  </div>
                )}
              </div>
              {navPartnerItem(Step.PARTNER_STAFF, '/partner/staff', 'Quản lý nhân viên', Users)}
              <div>
                <div
                  onClick={() => toggleMenu('partnerReport')}
                  className={`flex items-center justify-between gap-1 text-sm px-2 py-1.5 rounded cursor-pointer ${
                    currentStep === Step.PARTNER_REPORTS ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BarChart3 size={14} className="shrink-0" />
                    <span className="truncate">Báo cáo</span>
                  </div>
                  <ChevronDown size={12} className={`shrink-0 transition-transform ${isMenuOpen('partnerReport') ? 'rotate-180' : ''}`} />
                </div>
                {isMenuOpen('partnerReport') && (
                  <div className="mt-0.5 ml-3 border-l border-gray-200 pl-2 space-y-0.5">
                    {navPartnerItem(Step.PARTNER_REPORTS, '/partner/reports', 'Tất cả báo cáo', BarChart3)}
                  </div>
                )}
              </div>
              {navPartnerItem(Step.PARTNER_ORG, '/partner/org', 'Cấu hình tổ chức', GitBranch)}
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
