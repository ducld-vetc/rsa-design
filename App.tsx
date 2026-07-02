import React, { useState, useEffect } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Step, FormData, RescueUnit, MonitoringOrder } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StepperOSA from './components/StepperOSA';
import StepperCSKH from './components/StepperCSKH';
import CreateRescueOrder from './pages/CreateRescueOrder';
import FindRescueStation from './pages/FindRescueStation';
import RescueConfirmation from './pages/RescueConfirmation';
import CreateRescueOrderComplete from './pages/CreateRescueOrderComplete';
import Searching from './pages/Searching';
import RescueList from './pages/RescueList';
import PaymentQR from './pages/PaymentQR';
import Supporting from './pages/Supporting';
import OrderManagement from './pages/OrderManagement';
import GuestOrderDetails from './pages/GuestOrderDetails';
import StationCreateOrder from './pages/StationCreateOrder';
import StationOrderDetail from './pages/StationOrderDetail';
import StationManagement from './pages/StationManagement';
import StaffManagement2 from './pages/StaffManagement2';
import RescueSupervision from './pages/RescueSupervision';
import RsaDashboardOverview from './pages/RsaDashboardOverview';
import PricingPolicyCreate from './pages/PricingPolicyCreate';
import BusinessManagement from './pages/BusinessManagement';
import BusinessForm from './pages/BusinessForm';
import PackagePurchaseManagement from './pages/PackagePurchaseManagement';
import PaymentRequestManagement from './pages/PaymentRequestManagement';
import PaymentRequestDetail from './pages/PaymentRequestDetail';

const initialData: FormData = {
  orderId: '',
  customer: {
    phone: '0967419411',
    plate: '38A58531',
    name: 'TRAN DINH LAN ANH',
    vin: 'R7C2X9M4A8',
    vehicleBrand: 'Toyota',
    vehicleLine: 'Corolla Cross',
    payload: '1.4',
    seats: '5',
    servicePackage: 'Gói cơ bản 10 dịch vụ'
  },
  assistance: {
    rescueName: 'TRAN DINH LAN ANH',
    rescuePhone: '0967419411',
    address: '20, Phố Hội Vũ, Khu phố cổ, Hà Nội, 11017, Việt Nam',
    lng: '105.8452',
    lat: '21.0285',
    city: 'Hà Nội',
    district: 'Quận Long Biên',
    ward: 'P.Long Biên',
    note: ''
  },
  service: {
    serviceIds: ['Xe hết pin', 'Kích bình ắc quy', 'Đâm, lật, tai nạn'],
    quantity: 1,
    description: '- Hiện tượng: Xe không đề được, đề yếu.\n' +
        '- Khả năng di chuyển: Không di chuyển được.\n' +
        '- Dấu hiệu bất thường: Không có mùi khét, không rò rỉ.\n' +
        '- Phán đoán nguyên nhân: chưa rõ.\n' +
        '- Thời điểm: Đỗ qua đêm, sáng ra không nổ.',
    deposit: 200000
  },
  station: {
    partner: 'CARPLA - CARPLA SERVICE',
    station: 'Carpla Service - CN Hà Nội',
    contact1: 'LÊ VŨ LONG - 1900998865',
    contact2: 'Mr. Hoàn - 936499296',
    address: 'Phường Việt Hưng, Hà Nội, 11810, Việt Nam',
    towingDestination: 'Phường Việt Hưng, Hà Nội, 11810, Việt Nam',
    vehicleType: '<= 1.4 tấn'
  },
  pricing: {
    estimatedPrice: '527,500',
    distance: 8,
    adjustments: []
  }
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [lastDashboardStep, setLastDashboardStep] = useState<string | null>(null);
  const [role, setRole] = useState<'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER'>('CSKH');

  // Helper to map URL path to Step enum for Sidebar/Stepper compatibility
  const getStepFromPath = (path: string): Step => {
    if (path.includes('/pricing-policy')) return Step.PRICING_POLICY;
    if (path.includes('/payment-request-management')) return Step.PAYMENT_REQUEST_MANAGEMENT;
    if (path.includes('/package-purchase-management')) return Step.PACKAGE_PURCHASE_MANAGEMENT;
    if (path.includes('/business-management')) return Step.BUSINESS_MANAGEMENT;
    if (path.includes('/rsa-dashboard')) return Step.RSA_DASHBOARD;
    if (path.includes('/rescue-supervision')) return Step.RESCUE_SUPERVISION;
    if (path.includes('/monitoring')) return Step.MONITORING;
    if (path.includes('/supporting')) return Step.SUPPORTING;
    if (path.includes('/orders')) return Step.ORDER_MANAGEMENT;
    if (path.includes('/details')) return Step.GUEST_ORDER;
    if (path.includes('/station/create')) return Step.STATION_CREATE;
    if (path.includes('/station/management')) return Step.STATION_MANAGEMENT;
    if (path.includes('/staff-management')) return Step.STAFF_MANAGEMENT;
    if (path.includes('/station/details') || path.includes('/station/orders')) return Step.STATION_ORDERS;
    if (path === '/create') return Step.CUSTOMER_INFO;
    if (path === '/payment') return Step.PAYMENT_QR;
    if (path === '/searching') return Step.SEARCHING;
    if (path === '/rescue-list') return Step.RESCUE_LIST;
    if (path === '/station-info') return Step.STATION_INFO;
    if (path === '/confirmation') return Step.CONFIRMATION;
    if (path === '/success') return Step.SUCCESS;
    return Step.CUSTOMER_INFO;
  };

  const currentStep = getStepFromPath(location.pathname);

  const generateOrderId = (plate: string) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RS-${plate.replace(/\W/g, '')}-${dateStr}-${random}`;
  };

  const updateCustomerData = (updates: Partial<typeof formData.customer>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...updates }
    }));
  };

  const updateAssistanceData = (updates: Partial<typeof formData.assistance>) => {
    setFormData(prev => ({
      ...prev,
      assistance: { ...prev.assistance, ...updates }
    }));
  };

  const updateServiceData = (updates: Partial<typeof formData.service>) => {
    setFormData(prev => ({
      ...prev,
      service: { ...prev.service, ...updates }
    }));
  };

  const updateStationData = (updates: Partial<typeof formData.station>) => {
    setFormData(prev => ({
      ...prev,
      station: { ...prev.station, ...updates }
    }));
  };

  const updatePricingData = (updates: Partial<typeof formData.pricing>) => {
    setFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, ...updates }
    }));
  };

  const handleRescueUnitSelect = (unit: RescueUnit) => {
    setFormData(prev => ({
      ...prev,
      station: {
        ...prev.station,
        partner: unit.partner,
        station: unit.name,
        address: unit.address,
        contact1: unit.contact1,
        contact2: unit.contact2,
        vehicleType: unit.vehicleType
      },
      pricing: {
        ...prev.pricing,
        distance: unit.distance
      }
    }));
    navigate('/details');
  };

  const skipToManualEntry = () => {
    navigate('/details');
  };

  const handleExpandSearch = () => {
    navigate('/searching');
  };

  const handleHandover = (step?: Step) => {
    if (step === Step.SUCCESS) {
      navigate('/success');
    } else {
      navigate('/details');
    }
  };

  const nextStep = () => {
    const path = location.pathname;

    if (path === '/create' || path === '/') {
      const newOrderId = formData.orderId || generateOrderId(formData.customer.plate);
      setFormData(prev => ({ ...prev, orderId: newOrderId }));

      // TODO Keep for next phase
      // const hasNoPackage = formData.customer.servicePackage === "Không có";
      //
      // if (role === 'CSKH') {
      //   navigate(hasNoPackage ? '/payment' : '/success');
      // } else {
      //   navigate(hasNoPackage ? '/payment' : '/searching');
      // }
      navigate('/details');
    } else if (path === '/payment') {
      if (role === 'OSA') {
        navigate('/searching');
      } else {
        navigate('/details');
      }
    } else if (path === '/searching') {
      navigate('/rescue-list');
    } else if (path === '/rescue-list') {
      navigate('/details');
    } else if (path === '/station-info') {
        navigate('/confirmation');
    } else if (path === '/confirmation') {
        navigate('/success');
    }
  };

  const prevStep = () => {
    if (lastDashboardStep && (location.pathname === '/station-info' || location.pathname === '/create')) {
      const path = lastDashboardStep;
      setLastDashboardStep(null);
      navigate(path);
      return;
    }

    const path = location.pathname;
    const hasNoPackage = formData.customer.servicePackage === "Không có";

    if (path === '/payment') {
      navigate('/create');
    } else if (path === '/searching') {
      navigate(hasNoPackage ? '/payment' : '/create');
    } else if (path === '/rescue-list') {
      navigate('/searching');
    } else if (path === '/details') {
      if (role === 'OSA') {
        navigate('/searching');
      } else {
        navigate(hasNoPackage ? '/payment' : '/create');
      }
    } else if (path === '/station-info') {
        navigate('/rescue-list');
    } else if (path === '/confirmation') {
        navigate(role === 'CSKH' && !hasNoPackage ? '/create' : '/station-info'); // Simplified logic
    }
  };

  const resetFlow = () => {
    setFormData(initialData);
    navigate('/create');
    setLastDashboardStep(null);
  };

  const handleCancelOrder = () => {
    if (lastDashboardStep) {
      navigate(lastDashboardStep);
      setLastDashboardStep(null);
    } else {
      resetFlow();
    }
  };

  // Navigation Handlers
  const handleNavigateToRsaDashboard = () => navigate('/rsa-dashboard');
  const handleNavigateToRescueSupervision = () => navigate('/rescue-supervision');
  const handleNavigateToSupporting = () => navigate('/supporting');
  const handleNavigateToOrderManagement = () => navigate('/orders');
  const handleNavigateToGuestOrder = () => navigate('/details');
  const handleNavigateToCreate = () => navigate('/create');
  const handleNavigateToStationCreate = () => navigate('/station/create');
  const handleNavigateToStationOrders = () => navigate('/station/orders');
  const handleNavigateToStationManagement = () => navigate('/station/management');
  const handleNavigateToStaffManagement = () => navigate('/staff-management');
  const handleNavigateToPricingPolicy = () => navigate('/pricing-policy');
  const handleNavigateToBusinessManagement = () => navigate('/business-management');
  const handleNavigateToPackagePurchaseManagement = () => navigate('/package-purchase-management');
  const handleNavigateToPaymentRequestManagement = () => navigate('/payment-request-management');
  const handleViewDetails = (orderId: string) => {
    navigate('/details');
  };

  const handleCoordinateOrder = (order: MonitoringOrder) => {
    setLastDashboardStep(location.pathname);
    setFormData(prev => ({
      ...prev,
      orderId: order.orderId,
      customer: {
        ...prev.customer,
        name: order.customerName,
        phone: order.phone,
        plate: order.plate,
        vehicleBrand: 'Toyota',
        vehicleLine: `Xe ${order.plate}`,
      },
      assistance: {
        ...prev.assistance,
        rescueName: order.customerName,
        rescuePhone: order.phone,
        address: order.address,
        district: order.district,
      },
      service: {
        ...prev.service,
        serviceIds: order.services,
      }
    }));
    navigate('/details');
  };

  const handleVerifyOrder = (order: MonitoringOrder) => {
    setLastDashboardStep(location.pathname);
    setFormData(prev => ({
      ...prev,
      orderId: order.orderId,
      customer: {
        ...prev.customer,
        name: order.customerName,
        phone: order.phone,
        plate: order.plate,
        vehicleBrand: 'Toyota',
        vehicleLine: `Xe ${order.plate}`,
      },
      assistance: {
        ...prev.assistance,
        rescueName: order.customerName,
        rescuePhone: order.phone,
        address: order.address,
        district: order.district,
      },
      service: {
        ...prev.service,
        serviceIds: order.services,
      }
    }));
    navigate('/create');
  };

  // Logic to hide Stepper
  const hideStepperSteps = [
    Step.SUPPORTING,
    Step.ORDER_MANAGEMENT,
    Step.GUEST_ORDER,
    Step.RESCUE_SUPERVISION,
    Step.RSA_DASHBOARD,
    Step.SUCCESS,
    Step.STATION_CREATE,
    Step.STATION_MANAGEMENT,
    Step.STAFF_MANAGEMENT,
    Step.PRICING_POLICY,
    Step.BUSINESS_MANAGEMENT,
    Step.PACKAGE_PURCHASE_MANAGEMENT,
    Step.PAYMENT_REQUEST_MANAGEMENT,
  ];
  
  const isStepperVisible = !hideStepperSteps.includes(currentStep);

  const getBreadcrumbLabels = () => {
    if (currentStep === Step.RSA_DASHBOARD) return ['Giám sát cứu hộ', 'Tổng quan'];
    if (currentStep === Step.RESCUE_SUPERVISION) return ['Giám sát cứu hộ', 'Giám sát'];
    if (currentStep === Step.SUPPORTING) return ['Giám sát cứu hộ', 'Đang hỗ trợ'];
    if (currentStep === Step.ORDER_MANAGEMENT) return ['Chăm sóc khách hàng', 'Quản lý đơn hàng'];
    if (currentStep === Step.GUEST_ORDER) return ['Chăm sóc khách hàng', 'Chi tiết đơn hàng'];
    if (currentStep === Step.STATION_CREATE) return ['Trạm cứu hộ', 'Tạo đơn cứu hộ'];
    if (currentStep === Step.STATION_MANAGEMENT) return ['Trạm cứu hộ', 'Quản lý đơn cứu hộ'];
    if (currentStep === Step.STATION_ORDERS) return ['Trạm cứu hộ', 'Quản lý đơn'];
    if (currentStep === Step.STAFF_MANAGEMENT) return ['Quản trị hệ thống', 'Quản lý nhân viên'];
    if (currentStep === Step.PRICING_POLICY) return ['Thêm mới chính sách giá VETC'];
    if (currentStep === Step.BUSINESS_MANAGEMENT) {
      if (location.pathname.includes('/create')) return ['Quản trị hệ thống', 'Thêm mới doanh nghiệp'];
      if (location.pathname.includes('/edit/')) return ['Quản trị hệ thống', 'Chỉnh sửa doanh nghiệp'];
      return ['Quản trị hệ thống', 'Quản lý doanh nghiệp'];
    }
    if (currentStep === Step.PACKAGE_PURCHASE_MANAGEMENT) {
      return ['Quản trị hệ thống', 'Quản lý mua gói'];
    }
    if (currentStep === Step.PAYMENT_REQUEST_MANAGEMENT) {
      if (location.pathname.includes('/payment-request-management/')) {
        return ['Quản trị hệ thống', 'Quản lý thanh toán', 'Tạo đề nghị thanh toán'];
      }
      return ['Quản trị hệ thống', 'Quản lý thanh toán', 'Đề nghị thanh toán'];
    }
    return ['Chăm sóc khách hàng', 'Tạo đơn cứu hộ'];
  };

  const breadcrumbLabels = getBreadcrumbLabels();

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onNavigateRsaDashboard={handleNavigateToRsaDashboard}
        onNavigateRescueSupervision={handleNavigateToRescueSupervision}
        onNavigateSupporting={handleNavigateToSupporting}
        onNavigateOrderManagement={handleNavigateToOrderManagement}
        onNavigateGuestOrder={handleNavigateToGuestOrder}
        onNavigateCreate={handleNavigateToCreate}
        onNavigateStationCreate={handleNavigateToStationCreate}
        onNavigateStationOrders={handleNavigateToStationOrders}
        onNavigateStationManagement={handleNavigateToStationManagement}
        onNavigateStaffManagement={handleNavigateToStaffManagement}
        onNavigatePricingPolicy={handleNavigateToPricingPolicy}
        onNavigateBusinessManagement={handleNavigateToBusinessManagement}
        onNavigatePackagePurchaseManagement={handleNavigateToPackagePurchaseManagement}
        onNavigatePaymentRequestManagement={handleNavigateToPaymentRequestManagement}
        currentStep={currentStep}
      />

      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          role={role}
          onRoleChange={setRole}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-w-0 w-full">
          <div className="w-full min-w-0 max-w-none space-y-4">
            <div className="bg-[#00A859] text-white px-4 py-2 rounded shadow-sm flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-sm">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
                <Home size={16} className="shrink-0" />
                <ChevronRight size={14} className="shrink-0" />
                <span>Trang chủ</span>
                {breadcrumbLabels.map((label) => (
                  <React.Fragment key={label}>
                    <ChevronRight size={14} className="shrink-0" />
                    <span className="min-w-0">{label}</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 shrink-0">
                <span className="font-bold">rsa_test1</span>
                <span>Thứ hai - 02/02/2026</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md min-h-[calc(100vh-140px)] w-full min-w-0 p-4 sm:p-6">
              {/* TODO Keep for next phase*/}
              {/*{isStepperVisible && (*/}
              {/*  <div className="mb-8">*/}
              {/*    {role === 'OSA' ? (*/}
              {/*      <StepperOSA */}
              {/*        currentStep={currentStep} */}
              {/*        servicePackage={formData.customer.servicePackage} */}
              {/*      />*/}
              {/*    ) : (*/}
              {/*      <StepperCSKH */}
              {/*        currentStep={currentStep} */}
              {/*        servicePackage={formData.customer.servicePackage} */}
              {/*      />*/}
              {/*    )}*/}
              {/*  </div>*/}
              {/*)}*/}
              
              <div className="w-full min-w-0">
              <Routes>
                <Route path="/" element={<Navigate to="/create" replace />} />
                <Route path="/create" element={
                  <CreateRescueOrder 
                    data={formData} 
                    onNext={nextStep} 
                    onUpdateCustomer={updateCustomerData} 
                    onUpdateAssistance={updateAssistanceData} 
                    onUpdateService={updateServiceData}
                    onUpdatePricing={updatePricingData}
                    role={role}
                  />
                } />
                <Route path="/payment" element={
                  <PaymentQR 
                    data={formData} 
                    onConfirm={nextStep} 
                    onHandover={handleHandover} 
                    onBack={prevStep} 
                    onCancel={handleCancelOrder}
                    role={role}
                  />
                } />
                <Route path="/searching" element={
                  <Searching data={formData} onComplete={nextStep} onManualEntry={skipToManualEntry} onBack={prevStep} />
                } />
                <Route path="/rescue-list" element={
                  <RescueList 
                    data={formData}
                    onSelect={handleRescueUnitSelect} 
                    onManualEntry={skipToManualEntry} 
                    onBack={prevStep}
                    onExpandSearch={handleExpandSearch}
                  />
                } />
                <Route path="/station-info" element={
                  <FindRescueStation 
                    data={formData} 
                    onNext={nextStep} 
                    onBack={prevStep} 
                    onCancel={handleCancelOrder}
                    onUpdateStation={updateStationData}
                  />
                } />
                <Route path="/confirmation" element={
                  <RescueConfirmation data={formData} onNext={nextStep} onBack={prevStep} />
                } />
                <Route path="/success" element={
                  <CreateRescueOrderComplete data={formData} onReset={resetFlow} onViewList={handleNavigateToOrderManagement} />
                } />
                <Route path="/rsa-dashboard" element={
                  <RsaDashboardOverview />
                } />
                <Route path="/rescue-supervision" element={
                  <RescueSupervision />
                } />
                <Route path="/supporting" element={
                  <Supporting onCoordinate={handleCoordinateOrder} onVerify={handleVerifyOrder} />
                } />
                <Route path="/orders" element={
                  <OrderManagement onViewDetails={handleViewDetails} />
                } />
                <Route path="/details" element={
                  <GuestOrderDetails role={role} />
                } />
                <Route path="/station/create" element={
                  <StationCreateOrder />
                } />
                <Route path="/station/details" element={
                  <StationOrderDetail />
                } />
                <Route path="/station/management" element={
                  <StationManagement role={role} />
                } />
                <Route path="/staff-management" element={
                  <StaffManagement2 role={role} />
                } />
                <Route path="/station/orders" element={
                  <StationOrderDetail />
                } />
                <Route path="/pricing-policy" element={
                  <PricingPolicyCreate />
                } />
                <Route path="/business-management" element={
                  <BusinessManagement />
                } />
                <Route path="/business-management/create" element={
                  <BusinessForm />
                } />
                <Route path="/business-management/edit/:id" element={
                  <BusinessForm />
                } />
                <Route path="/package-purchase-management" element={
                  <PackagePurchaseManagement />
                } />
                <Route path="/payment-request-management" element={
                  <PaymentRequestManagement />
                } />
                <Route path="/payment-request-management/:orderId" element={
                  <PaymentRequestDetail />
                } />
              </Routes>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;