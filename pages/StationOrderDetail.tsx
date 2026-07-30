import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useLocation } from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Building2,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileText,
  LifeBuoy,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SquarePlus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  UserX,
  Video,
  Wrench,
  X
} from 'lucide-react';
import ImageUploadSection from '../shared/ImageUploadSection';
import RescueVehicleCameraSection from '../shared/RescueVehicleCameraSection';
import RescueGpsPlaybackSection from '../shared/RescueGpsPlaybackSection';
import ServiceSelectionField from '../shared/ServiceSelectionField';
import AISuggestionSection from '../shared/AISuggestionSection';
import RescueList from './RescueList';
import ManualStationSearch from '../components/ManualStationSearch';
import MapSelectionModal from '../shared/MapSelectionModal';
import CancellationDialog from '../shared/CancellationDialog';
import InvoicePreviewModal from '../shared/InvoicePreviewModal';
import PaymentQrModal from '../shared/PaymentQrModal';
import ProviderPaymentConfirmDialog from '../shared/ProviderPaymentConfirmDialog';
import UsageHistoryModal from '../shared/UsageHistoryModal';
import StatusUpdateModal, {STATUS_OPTIONS} from '../shared/StatusUpdateModal';
import DetailedRatingCard from '../shared/DetailedRatingCard';
import {AISuggestion, analyzeIncident} from '../data/aiDataMock';
import {FormData, RescueUnit} from '../types';
import Searching from "./Searching";

interface ActualService {
  id: string;
  name: string;
  price: string;
  isCustom?: boolean;
}

import { ALL_SERVICES } from '../shared/ServiceSelectionField';

const DRIVERS_MOCK = [
  { id: 'D1', name: 'Nguyễn Văn Tài', phone: '0911222333' },
  { id: 'D2', name: 'Trần Minh Quang', phone: '0988777666' },
  { id: 'D3', name: 'Lê Văn Hùng', phone: '0944555111' },
  { id: 'D4', name: 'Phạm Đức Anh', phone: '0900111222' }
];

const PACKAGE_LIST = [
  {
    id: 'BASIC',
    name: 'Gói cơ bản 10 dịch vụ',
    details: [
      { stt: 1, name: 'Kích bình ắc quy', used: 1, limit: 100 },
      { stt: 2, name: 'Sự cố kỹ thuật khác khiến xe không di chuyển', used: 0, limit: 100 },
      { stt: 3, name: 'Hỗ trợ 24/7, không giới hạn số lần sử dụng', used: 0, limit: 100 },
      { stt: 4, name: 'Miễn phí kéo xe trong phạm vi 100 km', used: 0, limit: 100 }
    ]
  },
  {
    id: 'PREMIUM',
    name: 'Gói nâng cao Premium',
    details: [
      { stt: 1, name: 'Kích bình ắc quy', used: 2, limit: 100 },
      { stt: 2, name: 'Thay lốp dự phòng', used: 1, limit: 100 },
      { stt: 3, name: 'Cứu hộ thủy kích', used: 0, limit: 10 },
      { stt: 4, name: 'Kéo xe không giới hạn khoảng cách', used: 0, limit: 100 }
    ]
  }
];

const ADJUSTMENT_OPTIONS = [
  { 
    category: 'Thời gian', 
    options: [
      { label: 'Ngày', coef: 1.0 }, 
      { label: 'Đêm', coef: 1.2 }
    ] 
  },
  { 
    category: 'Vị trí', 
    options: [
      { label: 'Cao tốc', coef: 1.2 }, 
      { label: 'Đường đèo', coef: 1.5 }
    ] 
  },
  { 
    category: 'Thời tiết', 
    options: [
      { label: 'Mưa to', coef: 1.1 }, 
      { label: 'Bão', coef: 1.3 }
    ] 
  },
  { 
    category: 'Khoảng cách', 
    options: [
      { label: '<10km', coef: 1.0 }, 
      { label: '<20 km', coef: 1.2 }, 
      { label: '<50km', coef: 1.5 }, 
      { label: '<100km', coef: 2.0 }
    ] 
  },
];

const AdjustmentTypeSelect = ({
                                value,
                                onChange,
                                disabled
                              }: {
  value: string,
  onChange: (val: string) => void,
  disabled: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const selectedOptions = value ? value.split(',').map(s => s.trim()).filter(s => s !== '') : [];

  useLayoutEffect(() => {
    const updateCoords = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updateCoords();
    if (isOpen) {
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const toggleOption = (option: string) => {
    let newOptions;
    if (selectedOptions.includes(option)) {
      newOptions = selectedOptions.filter(o => o !== option);
    } else {
      newOptions = [...selectedOptions, option];
    }
    onChange(newOptions.join(', '));
  };

  return (
      <div className="relative" ref={triggerRef}>
        <div
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`flex items-center justify-between px-2 py-1 border rounded cursor-pointer min-h-[28px] transition-all ${disabled ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white border-gray-200 hover:border-vetc-green'}`}
        >
        <span className="truncate max-w-[120px] text-[10px] font-bold">
          {value || <span className="text-gray-400 font-normal italic">Chọn...</span>}
        </span>
          <ChevronDown size={12} className={`text-gray-400 shrink-0 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        <AnimatePresence>
          {isOpen && !disabled && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'fixed',
                      top: coords.top,
                      left: coords.left,
                      minWidth: '240px',
                      transformOrigin: 'top left'
                    }}
                    className="mt-1 bg-white border rounded-lg shadow-2xl z-[101] p-2 max-h-80 overflow-y-auto"
                >
                  {ADJUSTMENT_OPTIONS.map((cat) => (
                      <div key={cat.category} className="mb-2 last:mb-0">
                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1 px-1 border-b border-gray-50 pb-0.5">{cat.category}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {cat.options.map((opt) => (
                              <label
                                  key={opt.label}
                                  className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${selectedOptions.includes(opt.label) ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${selectedOptions.includes(opt.label) ? 'bg-vetc-green border-vetc-green' : 'bg-white border-gray-300'}`}>
                                    {selectedOptions.includes(opt.label) && <Check size={10} className="text-white" />}
                                  </div>
                                  <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={selectedOptions.includes(opt.label)}
                                      onChange={() => toggleOption(opt.label)}
                                  />
                                  <span className={`text-[10px] ${selectedOptions.includes(opt.label) ? 'text-green-700 font-bold' : 'text-gray-600'}`}>{opt.label}</span>
                                </div>
                                <span className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1 rounded">x{opt.coef.toFixed(1)}</span>
                              </label>
                          ))}
                        </div>
                      </div>
                  ))}
                  {selectedOptions.length > 0 && (
                      <div className="mt-2 pt-2 border-t flex justify-between items-center px-1">
                        <button
                            onClick={() => onChange('')}
                            className="text-[9px] text-red-500 font-bold hover:underline"
                        >
                          Xóa tất cả
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="bg-vetc-green text-white px-3 py-1 rounded text-[9px] font-bold"
                        >
                          Xong
                        </button>
                      </div>
                  )}
                </motion.div>
              </>
          )}
        </AnimatePresence>
      </div>
  );
};


const CANCEL_REASONS = [
  "Không còn cần dịch vụ",
  "Tìm được dịch vụ khác",
  "Tài xế đến quá chậm",
  "Giá cả không phù hợp",
  "Lý do khác"
];

const SectionHeader = ({ title, number, icon }: { title: string, number: number, icon?: React.ReactNode }) => (
    <div className="bg-vetc-green text-white px-4 py-2 rounded-t-lg font-bold text-sm flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="bg-white/20 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{number}</span>
        <span>{title}</span>
      </div>
      {icon && <div className="opacity-80">{icon}</div>}
    </div>
);

const Label = ({ children, required = false }: { children?: React.ReactNode, required?: boolean }) => (
    <label className="text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center">
      {children} {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Input = ({
                 value,
                 defaultValue,
                 readOnly = false,
                 placeholder = "",
                 className = "",
                 onChange
               }: {
  value?: string,
  defaultValue?: string,
  readOnly?: boolean,
  placeholder?: string,
  className?: string,
  onChange?: (val: string|any) => void
}) => (
    <input
        type="text"
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green transition-all ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100' : 'bg-white'} ${className}`}
    />
);

const StationOrderDetail: React.FC = () => {
  const location = useLocation();
  const orderData = location.state?.order;
  const isVetcOrder = orderData?.tags?.some((t: any) => t.t === 'ĐƠN GÓI' || t.t === 'VETC');

  const filteredPartnerServices = isVetcOrder 
    ? ALL_SERVICES 
    : ALL_SERVICES.filter(s => s.provider !== 'VETC');
  
  const availableServices = filteredPartnerServices.map(s => s.name);

  const [rescueOrderId, setRescueOrderId] = useState(orderData?.code || 'RS12602020002');
  const [activeTab, setActiveTab] = useState('general');

  const [selectedServices, setSelectedServices] = useState<string[]>(
    orderData?.incident?.services || 
    orderData?.servicesList || 
    (isVetcOrder ? ['Xe hết pin', 'Kích bình ắc quy', 'Đâm, lật, tai nạn'] : ['Xe hết pin', 'Đâm, lật, tai nạn'])
  );
  const [actualServices, setActualServices] = useState<ActualService[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [incidentDescription, setIncidentDescription] = useState(
      orderData?.incident?.description ||
      '- Hiện tượng: Xe không đề được, đề yếu.\n' +
      '- Khả năng di chuyển: Không di chuyển được.\n' +
      '- Dấu hiệu bất thường: Không có mùi khét, không rò rỉ.\n' +
      '- Phán đoán nguyên nhân: chưa rõ.\n' +
      '- Thời điểm: Đỗ qua đêm, sáng ra không nổ.'
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isAiApplied, setIsAiApplied] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [customerType, setCustomerType] = useState('Cá nhân');
  const [selectedPackage, setSelectedPackage] = useState(orderData?.vehicle?.package || 'Không có');
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(orderData?.coordination?.driverId || 'D1');
  const [driverPhone, setDriverPhone] = useState(orderData?.coordination?.driverPhone || '0911222333');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isManualSearchModalOpen, setIsManualSearchModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isExportingInvoice, setIsExportingInvoice] = useState(false);
  const [invoiceDownloadUrl, setInvoiceDownloadUrl] = useState<string | null>(null);
  const [stateFindStation, setStateFindStation] = useState<'search' | 'list'>('search');

  // Location type state
  const [locationType, setLocationType] = useState(orderData?.incident?.type || 'Đô thị');

  // Rescue Info State
  const [partnerName, setPartnerName] = useState(orderData?.coordination?.partner || 'CARPLA - CARPLA SERVICE');
  const [stationName, setStationName] = useState(orderData?.coordination?.station || 'Carpla Service - CN Hà Nội');
  const [rescueVehicleType, setRescueVehicleType] = useState(orderData?.coordination?.vehicleType || 'Xe kéo cẩu');
  const [rescueDistance, setRescueDistance] = useState(orderData?.coordination?.distance || '8');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advancePerson, setAdvancePerson] = useState('');

  // Adjustment Coefficients Data state
  const [adjustmentRows, setAdjustmentRows] = useState(orderData?.pricing?.adjustments || (isVetcOrder ? [
    { id: 1, serviceName: 'Xe hết pin ', fixedPrice: '500,000', adjustmentType: 'Đêm', coefficient: '1.2', ceilingPrice: '1,000,000', discount: '0', totalPrice: '600,000', customerPaid: '600,000' },
    { id: 2, serviceName: 'Kích bình ắc quy', fixedPrice: '1,000,000', adjustmentType: '<10km', coefficient: '1.5', ceilingPrice: '3,000,000', discount: '0', totalPrice: '1,500,000', customerPaid: '1,500,000' },
    { id: 3, serviceName: 'Đâm, tai nạn, lật', fixedPrice: '1,000,000', adjustmentType: 'Cao tốc', coefficient: '1', ceilingPrice: '3,000,000', discount: '0', totalPrice: '1,000,000', customerPaid: '1,000,000' }
  ] : [
    { id: 1, serviceName: 'Xe hết pin ', fixedPrice: '500,000', adjustmentType: 'Đêm', coefficient: '1.2', ceilingPrice: '1,000,000', discount: '0', totalPrice: '600,000', customerPaid: '600,000' },
    { id: 3, serviceName: 'Đâm, tai nạn, lật', fixedPrice: '1,000,000', adjustmentType: 'Cao tốc', coefficient: '1', ceilingPrice: '3,000,000', discount: '0', totalPrice: '1,000,000', customerPaid: '1,000,000' }
  ]));

  // Map States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapAddress, setMapAddress] = useState(orderData?.incident?.addr || "20, Phố Hội Vũ, Khu phố cổ, Phường Hoàn Kiếm, Hà Nội");
  const [mapCoords, setMapCoords] = useState(orderData?.incident?.coords || "21.0285, 105.8452");

  // Cancellation States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');
  const [cancelReason, setCancelReason] = useState('');

  const [severityLevel, setSeverityLevel] = useState(orderData?.incident?.severity || 'Nhẹ');
  const [weather, setWeather] = useState(orderData?.incident?.weather || 'Bình thường');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isProviderPaymentConfirmOpen, setIsProviderPaymentConfirmOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(orderData?.status || 'EXECUTE-RESCUING');
  const [customerRating, setCustomerRating] = useState(4);
  const [rescueRating, setRescueRating] = useState(orderData?.ratings?.rescue || 5);
  const [vetcRating, setVetcRating] = useState(4);
  const [expandedRatings, setExpandedRatings] = useState<Record<string, boolean>>({
    customer: true,
    rescue: false,
    vetc: false
  });
  const [ratingDetails, setRatingDetails] = useState({
    customer: orderData?.ratings?.details?.customer || { note: '', category: 'Bình thường' },
    rescue: orderData?.ratings?.details?.rescue || { note: '', category: 'Bình thường' },
    vetc: { note: '', category: 'Bình thường' }
  });
  const [vat, setVat] = useState(orderData?.pricing?.vat || '8');
  const [totalPayment, setTotalPayment] = useState(orderData?.pricing?.total || '432,000');

  // Calculate Max Coefficient for Highlighting
  const maxCoefficient = adjustmentRows.length > 0 ? Math.max(...adjustmentRows.map(r => parseFloat(r.coefficient))) : 0;

  useEffect(() => {
    if (!incidentDescription || incidentDescription.trim().length < 5) {
      return;
    }
    const timer = setTimeout(() => {
      setIsAiProcessing(true);
      setTimeout(() => {
        const suggestion = analyzeIncident(incidentDescription);

        // Format services list
        const servicesList = suggestion.recommendedServices
            .map(s => `- ${s.name}: ${s.price} VNĐ`)
            .join('\n');

        const formattedNote = `[PHÂN TÍCH AI]: ${suggestion.analysis}\n\n[DỊCH VỤ ĐỀ XUẤT]:\n${servicesList}\n\n[HƯỚNG DẪN XỬ LÝ]: ${suggestion.solutionSteps}`;

        setVerificationNotes(formattedNote);
        setIsAiProcessing(false);
        setIsAiApplied(true);
      }, 600);
    }, 1000);
    return () => clearTimeout(timer);
  }, [incidentDescription]);

  // Update driver phone when selected driver changes
  useEffect(() => {
    const driver = DRIVERS_MOCK.find(d => d.id === selectedDriverId);
    if (driver) {
      setDriverPhone(driver.phone);
    }
  }, [selectedDriverId]);

  const handleUpdateServices = (newSelection: string[]) => {
    setSelectedServices(newSelection);
  };

  const handleExportInvoice = () => {
    setIsExportingInvoice(true);
    setInvoiceDownloadUrl(null);
    // Simulate API call
    setTimeout(() => {
      setIsExportingInvoice(false);
      setInvoiceDownloadUrl(`https://example.com/invoices/INV-${mockFormData.orderId}.pdf`);
    }, 1500);
  };

  const handleAddService = (serviceName: string) => {
    const defaultPrice = '500,000';
    const defaultCoefficient = '1';

    const newRow = {
      id: Date.now(),
      serviceName: serviceName,
      fixedPrice: defaultPrice,
      adjustmentType: '',
      coefficient: defaultCoefficient,
      ceilingPrice: '0',
      discount: '0',
      totalPrice: defaultPrice,
      customerPaid: defaultPrice
    };
    setAdjustmentRows([...adjustmentRows, newRow]);
    setIsServiceModalOpen(false);
  };

  const handleRemoveService = (id: string) => {
    setActualServices(actualServices.filter(s => s.id !== id));
  };

  const handlePriceChange = (id: string, newPrice: string) => {
    setActualServices(actualServices.map(s => s.id === id ? { ...s, price: newPrice } : s));
  };

  const handleNameChange = (id: string, newName: string) => {
    setActualServices(actualServices.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const applyAISuggestion = (suggestion: AISuggestion) => {
    const newActualServices = suggestion.recommendedServices.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      name: s.name,
      price: s.price
    }));

    setActualServices([...actualServices, ...newActualServices]);

    // Check if services are already in verificationNotes to avoid duplication if applied multiple times or if effect already ran
    setVerificationNotes(prev => {
      // If we want to append info about applied action
      const separator = prev ? "\n\n" : "";
      return `${prev}${separator}[ĐÃ ÁP DỤNG]: Đã thêm ${suggestion.recommendedServices.length} dịch vụ đề xuất vào danh sách chi phí.`;
    });
    setIsAiApplied(true);
  };

  const handleConfirmLocation = (address: string, coords: string) => {
    setMapAddress(address);
    setMapCoords(coords);
    setIsMapModalOpen(false);
  };

  const handleConfirmCancel = () => {
    const finalReason = selectedCancelReason === 'Lý do khác' ? cancelReason : selectedCancelReason;
    console.log("Order cancelled for reason:", finalReason);
    setIsCancelModalOpen(false);
    // Reset states
    setSelectedCancelReason('');
    setCancelReason('');
  };

  const handleOpenCancelModal = () => {
    setSelectedCancelReason('');
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleRemoveAdjustmentRow = (id: number) => {
    if (!isEditing) return;
    setAdjustmentRows(adjustmentRows.filter(row => row.id !== id));
  };

  const handleAdjustmentChange = (id: number, field: string, value: string) => {
    setAdjustmentRows(prev => prev.map(row => {
      if (row.id !== id) return row;

      let processedValue = value;
      if (['fixedPrice', 'discount', 'customerPaid', 'ceilingPrice', 'totalPrice'].includes(field)) {
        const isNegative = value.trim().startsWith('-');
        const numericPart = value.replace(/[^0-9.]/g, '');
        const num = parseFloat(numericPart) || 0;
        processedValue = (isNegative ? -num : num).toLocaleString('en-US');
      }

      let updatedRow = { ...row, [field]: processedValue };

      // If adjustmentType changes, recalculate coefficient
      if (field === 'adjustmentType') {
        const selectedLabels = processedValue.split(',').map(s => s.trim()).filter(s => s !== '');
        let maxCoef = 1.0;
        
        selectedLabels.forEach(label => {
          ADJUSTMENT_OPTIONS.forEach(cat => {
            const opt = cat.options.find(o => o.label === label);
            if (opt) {
              // Take the maximum coefficient among selected options
              if (opt.coef > maxCoef) {
                maxCoef = opt.coef;
              }
            }
          });
        });
        
        updatedRow.coefficient = maxCoef.toFixed(2);
      }

      // Auto recalculate discount if fixed price, coefficient or total price changes
      if (field === 'fixedPrice' || field === 'coefficient' || field === 'totalPrice' || field === 'adjustmentType') {
        const fixed = parseFloat(updatedRow.fixedPrice.replace(/,/g, '')) || 0;
        const coef = parseFloat(updatedRow.coefficient) || 0;
        const total = parseFloat(updatedRow.totalPrice.replace(/,/g, '')) || 0;
        
        // Formula: Chênh lệch giá = (Giá cố định * Hệ số) - Giá NCC
        const diff = (fixed * coef) - total;
        updatedRow.discount = diff.toLocaleString('en-US');
      }
      return updatedRow;
    }));
  };

  const handleRescueSelect = (unit: RescueUnit) => {
    setPartnerName(unit.partner);
    setStationName(unit.name);
    setRescueDistance(unit.distance.toString());
    if (unit.vehicleType) setRescueVehicleType(unit.vehicleType);
    setIsSearchModalOpen(false);
  };

  const handleManualRescueSelect = (station: any) => {
    setStationName(station.name);
    setPartnerName(station.partner);
    setRescueDistance(station.distance.replace(' km', ''));
    setIsManualSearchModalOpen(false);
  };

  const selectedDriver = DRIVERS_MOCK.find(d => d.id === selectedDriverId);

  // Helper to determine visibility
  const scrollToSection = (tabId: string) => {
    setActiveTab(tabId);
    
    // Use a small timeout to ensure the DOM has updated (especially in tabs mode)
    // before attempting to scroll to the element.
    setTimeout(() => {
      const element = document.getElementById(`section-${tabId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const TABS = [
    { id: 'general', label: 'Thông tin KH liên hệ', icon: <User size={16}/>, hideInCreate: false, hideForInternal: false },
    { id: 'orchestration', label: 'Điều phối cứu hộ', icon: <LifeBuoy size={16}/>, hideInCreate: false, hideForInternal: false },
    { id: 'process', label: 'Quá trình cứu hộ', icon: <Activity size={16}/>, hideInCreate: true, hideForInternal: false },
    { id: 'images', label: 'Hình ảnh', icon: <Camera size={16}/>, hideInCreate: false, hideForInternal: false },
    { id: 'camera', label: 'Camera xe', icon: <Video size={16}/>, hideInCreate: true, hideForInternal: false },
    { id: 'monitoring', label: 'Giám sát & Thực thi', icon: <ShieldCheck size={16}/>, hideInCreate: true, hideForInternal: true },
    { id: 'invoice', label: 'Hóa đơn', icon: <FileText size={16}/>, hideInCreate: true, hideForInternal: false },
  ];

  // Mock data for Searching/RescueList component
  const mockFormData: FormData = {
    orderId: 'RS12602020002',
    customer: {
      phone: '0967419411',
      plate: '29E366666',
      name: 'Vương Đăng Minh',
      vin: 'R7C2X9M4A8',
      vehicleBrand: 'Toyota',
      vehicleLine: 'Sedan',
      payload: '1',
      seats: '5',
      servicePackage: selectedPackage
    },
    assistance: {
      rescueName: 'Vương Đăng Minh',
      rescuePhone: '0967419411',
      address: mapAddress,
      lng: mapCoords.split(',')[1]?.trim() || '',
      lat: mapCoords.split(',')[0].trim() || '',
      city: 'Hà Nội',
      district: '',
      ward: '',
      note: incidentDescription
    },
    service: {
      serviceIds: selectedServices,
      quantity: 1,
      description: incidentDescription,
      deposit: 0
    },
    station: {
      partner: partnerName,
      station: stationName,
      contact1: '',
      contact2: '',
      address: '',
      towingDestination: '',
      vehicleType: rescueVehicleType
    },
    pricing: {
      estimatedPrice: '527,500',
      distance: parseFloat(rescueDistance),
      adjustments: adjustmentRows // Syncing mock data with state
    }
  };

  return (
      <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
        {/* Top Sticky Header Row */}
        {/* Top Sticky Header Row */}
        {rescueOrderId && (
            <div className="sticky top-0 z-20 flex flex-col bg-white/95 backdrop-blur-md border rounded-xl shadow-md border-l-4 border-l-vetc-green text-left">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-6">
    
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Mã đơn hàng (Cố định)</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black text-gray-900 tracking-tight">{rescueOrderId}</span>
                      <span className={`${isVetcOrder ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'} px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight`}>
                        {isVetcOrder ? 'VETC' : 'NỘI BỘ'}
                      </span>
                      {isVetcOrder && (() => {
                        const subTag = orderData?.tags?.find((t: any) => t.t === 'ĐƠN LẺ' || t.t === 'ĐƠN GÓI');
                        return subTag ? (
                          <span className="bg-white text-green-600 border-green-600 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight">
                            {subTag.t}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
    
                  <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Trạng thái hiện tại</span>
                    <button 
                      onClick={() => isEditing && setIsStatusUpdateModalOpen(true)}
                      disabled={!isEditing}
                      className={`flex items-center space-x-2 transition-opacity text-left group ${isEditing ? 'hover:opacity-80' : 'cursor-default'}`}
                    >
                      {(() => {
                        const statusInfo = STATUS_OPTIONS.flatMap(g => g.items).find(i => i.id === currentStatus) || { label: currentStatus, color: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' };
                        return (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${statusInfo.color} ${isEditing ? 'cursor-pointer group-hover:shadow-sm' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse mr-2 ${statusInfo.dot}`}></div>
                            <span>{statusInfo.label}</span>
                            {isEditing && <Pencil size={10} className="ml-2 text-gray-400 group-hover:text-current transition-colors" />}
                          </span>
                        );
                      })()}
                    </button>
                  </div>
                </div>
    
                <div className="flex items-center space-x-3">
                  {isEditing && (
                      <button
                          onClick={handleOpenCancelModal}
                          className="flex items-center space-x-2 px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-all active:scale-95 group"
                      >
                        <X size={14} className="group-hover:scale-110 transition-transform" />
                        <span>Hủy</span>
                      </button>
                  )}
    
                  {isEditing ? (
                      <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center space-x-2 px-6 py-2 border-2 border-gray-400 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all active:scale-95 group"
                        >
                          <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                          <span>Hủy thay đổi</span>
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center space-x-2 px-6 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg transition-all active:scale-95 group"
                        >
                          <Save size={14} className="group-hover:scale-110 transition-transform" />
                          <span>Lưu thay đổi</span>
                        </button>
                      </>
                  ) : (
                      <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-2 px-6 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg transition-all active:scale-95 group"
                      >
                        <Edit size={14} className="group-hover:scale-110 transition-transform" />
                        <span>Cập nhật</span>
                      </button>
                  )}
                </div>
              </div>
    
              {/* Tab Navigation Bar */}
              <div className="flex items-center px-4 border-t bg-gray-50/50 overflow-x-auto custom-scrollbar rounded-t-xl">
                {TABS.map(tab => {
                  return ((tab.hideInCreate && !rescueOrderId) || (tab.hideForInternal && !isVetcOrder)) ? <></> : (
                      <button
                          key={tab.id}
                          onClick={() => scrollToSection(tab.id)}
                          className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                              activeTab === tab.id
                                  ? 'border-vetc-green text-vetc-green bg-green-50/50'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                  )})
                }
              </div>
            </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 text-left">
          {/* 1. Thông tin KH liên hệ */}
          <div id="section-general" className={`scroll-mt-40 block relative z-10`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-visible">
              <SectionHeader title="Thông tin KH liên hệ" number={1} icon={<User size={16} />} />
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <Label required>Người yêu cầu</Label>
                  <Input defaultValue={orderData?.customer?.n || "Vương Đăng Minh"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label required>SĐT yêu cầu</Label>
                  <Input defaultValue={orderData?.customer?.p || "0967419411"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>Người liên hệ</Label>
                  <Input defaultValue={orderData?.customer?.contactName || "Vương Đăng Minh"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>SĐT liên hệ</Label>
                  <Input defaultValue={orderData?.customer?.contactPhone || "0967419411"} readOnly={!isEditing} />
                </div>

                <div>
                  <Label required>Biển số xe</Label>
                  <Input defaultValue={orderData?.vehicle?.plate || "29E366666"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>Số khung (Vin)</Label>
                  <Input defaultValue={orderData?.vehicle?.vin || "R7C2X9M4A8"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>Hãng xe</Label>
                  <Input defaultValue={orderData?.vehicle?.brand || "Toyota"} readOnly={!isEditing} />
                </div>
                <div>
                  <Label>Dòng xe</Label>
                  <Input defaultValue={orderData?.vehicle?.model || "Sedan"} readOnly={!isEditing} />
                </div>

                <div>
                  <Label>Trọng tải</Label>
                  <div className="flex items-center space-x-2">
                    <Input defaultValue={orderData?.vehicle?.weight || "1"} readOnly={!isEditing} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">tấn</span>
                  </div>
                </div>
                <div>
                  <Label>Số chỗ</Label>
                  <div className="flex items-center space-x-2">
                    <Input defaultValue={orderData?.vehicle?.seats || "5"} readOnly={!isEditing} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">chỗ</span>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <Label required>Vị trí sự cố</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1 text-left">
                      <input
                          readOnly
                          value={mapAddress}
                          className="w-full border rounded px-3 py-1.5 text-xs outline-none pr-8 bg-gray-50 font-medium"
                      />
                      <MapPin size={14} className="absolute right-2.5 top-2 text-red-500" />
                    </div>
                    <button
                        onClick={() => setIsMapModalOpen(true)}
                        disabled={!isEditing}
                        className={`bg-vetc-green text-white px-4 py-1.5 rounded text-[11px] font-bold shrink-0 hover:bg-green-700 transition-all flex items-center space-x-2 active:scale-95 shadow-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <MapPin size={14} />
                      <span>Bản đồ</span>
                    </button>
                  </div>
                </div>
                <div>
                  <Label required>Kinh độ / Vĩ độ</Label>
                  <div className="flex space-x-2">
                    <Input value={mapCoords.split(',')[0].trim()} />
                    <Input value={mapCoords.split(',')[1]?.trim() || ''} />
                  </div>
                </div>
                <div className="invisible md:hidden lg:block"></div>

                <div className="lg:col-span-1">
                  <Label>Loại vị trí</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {['Vùng núi', 'Cao tốc', 'Đô thị'].map((type) => (
                        <button
                            key={type}
                            disabled={!isEditing}
                            onClick={() => setLocationType(type)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                locationType === type
                                    ? 'bg-vetc-green text-white border-vetc-green shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green hover:bg-green-50'
                            } ${!isEditing ? 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-white' : 'active:scale-95'}`}
                        >
                          {type}
                        </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Mức độ nghiêm trọng</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { label: 'Nhẹ', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300', activeColor: 'bg-green-600 text-white border-green-600 shadow-md' },
                      { label: 'Mắc kẹt', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md' },
                      { label: 'Nguy hiểm', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300', activeColor: 'bg-red-600 text-white border-red-600 shadow-md' }
                    ].map((level) => (
                        <button
                            key={level.label}
                            disabled={!isEditing}
                            onClick={() => setSeverityLevel(level.label)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                severityLevel === level.label
                                    ? level.activeColor
                                    : level.color
                            } ${!isEditing ? 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-white' : 'active:scale-95'}`}
                        >
                          {level.label}
                        </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">Thời tiết</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      { label: 'Bình thường', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300', activeColor: 'bg-green-600 text-white border-green-600 shadow-md' },
                      { label: 'Mưa bão', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md' },
                      { label: 'Thiên tai', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300', activeColor: 'bg-red-600 text-white border-red-600 shadow-md' }
                    ].map((level) => (
                        <button
                            key={level.label}
                            disabled={!isEditing}
                            onClick={() => setWeather(level.label)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                weather === level.label
                                    ? level.activeColor
                                    : level.color
                            } ${!isEditing ? 'opacity-60 cursor-not-allowed hover:border-gray-200 hover:bg-white' : 'active:scale-95'}`}
                        >
                          {level.label}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <Label required>Mô tả chi tiết tình trạng sự cố</Label>
                    <AISuggestionSection
                        description={incidentDescription}
                        onApply={applyAISuggestion}
                    />
                  </div>
                  <div className="relative">
                  <textarea
                      rows={5}
                      value={incidentDescription}
                      readOnly={!isEditing}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                      className={`w-full border rounded px-3 py-1.5 text-xs min-h-[60px] outline-none focus:border-vetc-green text-left ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  ></textarea>
                    {isAiProcessing && (
                        <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-[9px] text-indigo-500 font-black uppercase">
                          <Loader2 size={12} className="animate-spin" />
                          <span>AI Analyzing...</span>
                        </div>
                    )}
                  </div>
                </div>



                <div className="lg:col-span-4 space-y-4 pt-4 border-t border-gray-50">
                  <div className="space-y-1">
                    <Label required>Dịch vụ yêu cầu</Label>
                    <ServiceSelectionField
                        selectedServices={selectedServices}
                        onUpdate={handleUpdateServices}
                        showTitle={false}
                        services={filteredPartnerServices}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Thông tin điều phối cứu hộ */}
          <div id="section-orchestration" className={`scroll-mt-40 block`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Thông tin điều phối cứu hộ" number={2} icon={<Truck size={16} />} />
              <div className="p-5 space-y-6">
                <div className="flex items-center space-x-4">
                  <button
                      disabled={!isEditing}
                      onClick={() => setIsManualSearchModalOpen(true)}
                      className={`bg-white border-2 border-vetc-green text-vetc-green px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-50 transition-all flex items-center space-x-2 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Search size={14} />
                    <span>Tìm trạm thủ công</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-50 text-left">
                  <div className="lg:col-span-1">
                    <Label required>Trạm cứu hộ cụ thể</Label>
                    <select
                        disabled={!isEditing}
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-xs bg-white outline-none focus:border-vetc-green font-bold disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="Carpla Service - CN Hà Nội">Carpla Service - CN Hà Nội</option>
                      <option value="Cứu hộ 116 Hà Nội">Cứu hộ 116 Hà Nội</option>
                      <option value="Garage Thăng Long">Garage Thăng Long</option>
                      <option value="Cứu hộ ABC">Cứu hộ ABC</option>
                    </select>
                  </div>

                  <div>
                    <Label>Loại xe cứu hộ</Label>
                    <select
                        disabled={!isEditing}
                        value={rescueVehicleType}
                        onChange={(e) => setRescueVehicleType(e.target.value)}
                        className="w-full border rounded px-3 py-1.5 text-xs bg-white outline-none text-left disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="Xe kéo cẩu">Xe kéo cẩu</option>
                      <option value="Xe sàn trượt">Xe sàn trượt</option>
                      <option value="Xe cẩu quay">Xe cẩu quay</option>
                      <option value="<= 2.5 tấn">{'<= 2.5 tấn'}</option>
                      <option value="<= 1.4 tấn">{'<= 1.4 tấn'}</option>
                    </select>
                  </div>
                  <div>
                    <Label>Biển số xe cứu hộ</Label>
                    <Input defaultValue="30G-888.88" readOnly={!isEditing} />
                  </div>
                  <div>
                    <Label required>Tài xế thực hiện</Label>
                    <div className="relative">
                      <select
                          value={selectedDriverId}
                          disabled={!isEditing}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className={`w-full border rounded px-3 py-1.5 text-xs bg-white outline-none focus:border-vetc-green appearance-none font-bold ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                      >
                        {DRIVERS_MOCK.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label>SĐT Tài xế</Label>
                    <Input
                        value={driverPhone}
                        onChange={(val) => setDriverPhone(val)}
                        readOnly={!isEditing}
                        className="font-bold"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label required>Điểm kéo về (Destination)</Label>
                    <div className="flex space-x-2">
                      <Input defaultValue={orderData?.coordination?.destination || "Phường Việt Hưng, Quận Long Biên, Hà Nội"} className="flex-1" readOnly={!isEditing} />
                      <button
                          onClick={() => setIsMapModalOpen(true)}
                          disabled={!isEditing}
                          className={`bg-vetc-green text-white px-4 py-1.5 rounded text-[11px] font-bold shrink-0 hover:bg-green-700 transition-all flex items-center space-x-2 active:scale-95 shadow-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <MapPin size={14} />
                        <span>Bản đồ</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label required>Kinh độ / Vĩ độ</Label>
                    <div className="flex space-x-2">
                      <Input value={mapCoords.split(',')[0].trim()} readOnly={!isEditing} />
                      <Input value={mapCoords.split(',')[1]?.trim() || ''} readOnly={!isEditing} />
                    </div>
                  </div>
                  <div>
                    <Label>Khoảng cách (Ước tính)</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={rescueDistance} onChange={setRescueDistance} className="font-bold" readOnly={!isEditing} />
                      <span className="text-[10px] font-bold text-gray-400">KM</span>
                    </div>
                  </div>
                  <div className="invisible lg:block"></div>



                  {/* Financial Information Section */}
                   <div className="lg:col-span-4 mt-4 pt-4">
                     <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                       <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full"></span>
                       {orderData?.tags?.some((t: any) => t.t === 'ĐƠN GÓI' || t.t === 'VETC') ? 'Trả cho NCC' : 'Khách hàng trả phí'}
                     </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <div className="lg:col-span-1">
                        <Label required>Chi phí tạm tính</Label>
                        <Input defaultValue={orderData?.pricing?.estimatedPrice || "400,000"} className="font-black text-gray-800 text-right" readOnly={!isEditing} />
                      </div>
                      <div className="lg:col-span-1">
                        <Label>Thuế VAT (%)</Label>
                        <div className="flex items-center space-x-2">
                          <select
                              value={vat}
                              disabled={!isEditing}
                              onChange={(e) => setVat(e.target.value)}
                              className={`w-full border rounded px-3 py-1.5 text-xs font-bold outline-none focus:border-vetc-green transition-all bg-white ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                          >
                            <option value="0">0%</option>
                            <option value="8">8%</option>
                            <option value="10">10%</option>
                          </select>
                        </div>
                      </div>

                      <div className="lg:col-span-1">
                        <Label>Tổng thanh toán (Sau thuế)</Label>
                        <Input
                            value={totalPayment}
                            onChange={(e) => setTotalPayment(e.target.value)}
                            readOnly={!isEditing}
                            className="font-black text-red-600 text-right bg-red-50"
                        />
                      </div>

                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    {/*<Label>Dịch vụ thực tế & Chi phí</Label>*/}
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full"></span>
                      Dịch vụ thực tế & Chi phí
                    </h3>
                    {/*Table detail service*/}
                    <div className="space-y-3">
                      <div className="bg-white lg:col-span-4">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-[11px]">
                            <thead>
                            <tr className="bg-green-50/50 text-gray-600 border-b">
                              <th className="p-2 text-center border font-bold w-10">STT</th>
                              <th className="p-2 text-left border font-bold w-80">Tên dịch vụ</th>
                              <th className="p-2 text-right border font-bold w-60">{orderData?.tags?.some((t: any) => t.t === 'ĐƠN GÓI' || t.t === 'VETC') ? 'Thanh toán' : 'KH trả phí'}</th>
                              <th className="p-2 text-center border font-bold w-20">Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {adjustmentRows.map((row, idx) => {
                              const isMax = parseFloat(row.coefficient) === maxCoefficient && maxCoefficient > 1;
                              return (
                                  <tr key={row.id} className={`border-b hover:bg-gray-50 transition-colors`}>
                                    <td className="p-2 border text-center font-medium">{idx + 1}</td>
                                    <td className="p-2 border font-bold text-gray-800">{row.serviceName}</td>
                                    <td className="p-2 border text-right font-medium">
                                      <Input
                                          value={row.customerPaid}
                                          onChange={(val) => handleAdjustmentChange(row.id, 'customerPaid', val)}
                                          readOnly={!isEditing}
                                          className="text-right font-bold text-blue-600"
                                      />
                                    </td>

                                    <td className="p-2 border text-center">
                                      <button
                                          disabled={!isEditing}
                                          onClick={() => handleRemoveAdjustmentRow(row.id)}
                                          className={`p-1 text-gray-400 hover:text-red-500 rounded transition-colors ${!isEditing ? 'cursor-not-allowed' : ''}`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                              );
                            })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                            disabled={!isEditing}
                            onClick={() => setIsServiceModalOpen(true)}
                            className={`text-[10px] text-white bg-vetc-green px-4 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center transition-all active:scale-95 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Plus size={12} className="mr-1.5" /> Thêm dịch vụ thực tế
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                      <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full"></span>
                      Tạm ứng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <div className="lg:col-span-1">
                        <Label>Tạm ứng</Label>
                        <Input
                            value={advanceAmount}
                            onChange={setAdvanceAmount}
                            readOnly={!isEditing}
                            className="text-right font-bold"
                        />
                      </div>
                      <div className="lg:col-span-1">
                        <Label>Người tạm ứng</Label>
                        <Input
                            value={advancePerson}
                            onChange={setAdvancePerson}
                            readOnly={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Quá trình cứu hộ (Renumbered from 4) */}
          <div id="section-process" className={`scroll-mt-40 ${rescueOrderId ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Quá trình cứu hộ (Theo dõi thời gian thực)" number={3} icon={<Activity size={18} />} />
              <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px]">
                {/* Map Container */}
                <div className="lg:col-span-8 bg-gray-100 relative group text-left">
                  <iframe
                      src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d105.8452!3d21.0285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="grayscale-[0.1] contrast-[1.05]"
                  ></iframe>

                  {/* Overlay Map UI */}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <div className="bg-white/95 p-3 rounded-xl shadow-lg border border-gray-100 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Truck size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Vị trí xe cứu hộ</p>
                          <p className="text-xs font-bold text-gray-800 mt-1">Cách hiện trường 2.5 km</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
                    <button className="bg-white p-2 rounded-lg shadow-xl hover:bg-gray-50 active:scale-95 transition-all"><Plus size={20} /></button>
                    <button className="bg-white p-2 rounded-lg shadow-xl hover:bg-gray-50 active:scale-95 transition-all border-t"><X size={20} /></button>
                  </div>
                </div>

                {/* Timeline — VnetGPS map/playback */}
                <div className="lg:col-span-4 border-l flex flex-col bg-white overflow-hidden text-left min-h-0">
                  <RescueGpsPlaybackSection />
                  <div className="p-4 bg-gray-50 border-t shrink-0">
                    <button 
                      onClick={() => setIsStatusUpdateModalOpen(true)}
                      className="w-full bg-vetc-green text-white py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <Pencil size={14} />
                      <span>Cập nhật trạng thái thủ công</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Hình ảnh sự cố & Quá trình thực hiện (Renumbered from 5) */}
          <div id="section-images" className={`scroll-mt-40 block`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Hình ảnh sự cố & Quá trình thực hiện" number={4} icon={<Camera size={18} />} />
              <div className="p-6">
                <ImageUploadSection readOnly={!isEditing} />
              </div>
            </div>
          </div>

          {/* 5. Camera xe cứu hộ (VnetGPS) */}
          <div id="section-camera" className={`scroll-mt-40 ${rescueOrderId ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Camera xe cứu hộ" number={5} icon={<Video size={18} />} />
              <div className="p-6">
                <RescueVehicleCameraSection readOnly={!isEditing} />
              </div>
            </div>
          </div>

          {/* 6. Thông tin giám sát, thực thi (Renumbered) */}
          {isVetcOrder && <div id="section-monitoring" className={`scroll-mt-40 ${rescueOrderId ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden text-left">
              <SectionHeader title="Thông tin giám sát, thực thi" number={6} icon={<ShieldCheck size={18} />} />
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-6">
                  {/* Detailed Ratings Section */}
                  <div className="lg:col-span-4 grid grid-cols-1 gap-6">


                    {/* 2. Đơn vị cứu hộ đánh giá KH */}
                    <DetailedRatingCard
                      title="Đơn vị cứu hộ đánh giá Khách hàng"
                      rating={rescueRating}
                      category={ratingDetails.rescue.category}
                      note={ratingDetails.rescue.note}
                      isExpanded={expandedRatings.rescue}
                      isEditing={isEditing}
                      categories={['Bình thường', 'Khách hàng nhiệt tình', 'Khách hàng khó tính', 'Sai lệch thông tin']}
                      feedback={true}
                      onToggle={() => setExpandedRatings(prev => ({ ...prev, rescue: !prev.rescue }))}
                      onRatingChange={setRescueRating}
                      onCategoryChange={(cat) => setRatingDetails(prev => ({ ...prev, rescue: { ...prev.rescue, category: cat } }))}
                      onNoteChange={(note) => setRatingDetails(prev => ({ ...prev, rescue: { ...prev.rescue, note: note } }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {/* 7. Thông tin hóa đơn */}
          <div id="section-invoice" className={`scroll-mt-40 block`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden text-left">
              <SectionHeader title="Thông tin hóa đơn" number={7} icon={<FileText size={18} />} />
              <div className="p-5 space-y-6">

                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg gap-4 text-left">
                  <div className="flex items-start space-x-3 text-left">
                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-blue-800 leading-relaxed font-medium">
                      Hóa đơn điện tử sẽ được gửi tự động qua email sau khi đơn hàng được xác nhận thanh toán thành công và hoàn tất cứu hộ.
                      <br />Vui lòng kiểm tra kỹ thông tin pháp nhân trước khi lưu.
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    {!invoiceDownloadUrl && (
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={handleExportInvoice}
                        disabled={isExportingInvoice}
                        className={`flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 whitespace-nowrap ${isExportingInvoice ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isExportingInvoice ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        <span>{isExportingInvoice ? 'Đang đồng bộ...' : 'Đồng bộ hóa đơn'}</span>
                      </button>
                    </div>
                    )}

                    {invoiceDownloadUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 text-green-700">
                          <Check size={16} />
                          <span className="text-xs font-bold">Hóa đơn đã được đồng bộ thành công!</span>
                        </div>
                        <a 
                          href={invoiceDownloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-black underline"
                        >
                          <FileText size={14} />
                          <span>Tải về PDF</span>
                        </a>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>



        <UsageHistoryModal
            isOpen={isPackageModalOpen}
            onClose={() => setIsPackageModalOpen(false)}
            currentPackage={selectedPackage}
            customerPlate={mockFormData.customer.plate}
            onApply={(pkg) => setSelectedPackage(pkg)}
        />

        {/* Actual Service Selection Modal */}
        {isServiceModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border-t-4 border-vetc-green">
                <div className="bg-vetc-green p-4 flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <Settings size={22} className="animate-spin-slow" />
                    <h3 className="font-bold text-lg">Thêm dịch vụ thực tế</h3>
                  </div>
                  <button
                      onClick={() => setIsServiceModalOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 bg-gray-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {availableServices.map((serviceName) => (
                        <button
                            key={serviceName}
                            onClick={() => handleAddService(serviceName)}
                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-vetc-green hover:shadow-md transition-all text-left group active:scale-95"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-vetc-green group-hover:bg-vetc-green group-hover:text-white transition-colors">
                              {serviceName === 'Dịch vụ khác' ? <Edit size={16} /> : <Wrench size={16} />}
                            </div>
                            <span className="text-sm font-bold text-gray-700">{serviceName}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-vetc-green group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white border-t flex justify-end space-x-3">
                  <button
                      onClick={() => setIsServiceModalOpen(false)}
                      className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-sm"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* QR Code Dialog */}
        <PaymentQrModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
        />

        {/* Cancellation Dialog */}
        <CancellationDialog
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleConfirmCancel}
            selectedReason={selectedCancelReason}
            setSelectedReason={setSelectedCancelReason}
            otherReason={cancelReason}
            setOtherReason={setCancelReason}
            cancelReasons={CANCEL_REASONS}
        />

        {/* Map Selection Modal */}
        <MapSelectionModal
            isOpen={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            onConfirm={handleConfirmLocation}
            initialAddress={mapAddress}
            initialCoords={mapCoords}
        />

        {/* Rescue List Modal (Previously Searching Modal) */}
        {isSearchModalOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] overflow-hidden relative h-[80vh] flex flex-col">
                <div className="absolute top-4 right-4 z-20">
                  <button
                      onClick={() => setIsSearchModalOpen(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                  {stateFindStation === 'search' &&
                      <Searching
                          data={mockFormData}
                          onComplete={() => {setStateFindStation('list')}}
                          onManualEntry={() => {
                            setIsSearchModalOpen(false);
                            setIsManualSearchModalOpen(true);
                          }}
                          onBack={() => setIsSearchModalOpen(false)}
                      />
                  }
                  {stateFindStation === 'list' &&
                      <RescueList
                          data={mockFormData}
                          onSelect={handleRescueSelect}
                          onManualEntry={() => setIsSearchModalOpen(false)}
                          onBack={() => setIsSearchModalOpen(false)}
                          onExpandSearch={() => console.log('Expand search')}
                      />
                  }
                </div>
              </div>
            </div>
        )}

        {/* Manual Station Search Modal */}
        {isManualSearchModalOpen && (
            <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col max-h-[85vh]">
                <ManualStationSearch
                    onSelect={handleManualRescueSelect}
                    onClose={() => setIsManualSearchModalOpen(false)}
                    selectedStationName={stationName}
                    hidePartnerFilter={true}
                />
              </div>
            </div>
        )}

        {/* INVOICE PREVIEW MODAL */}
        <InvoicePreviewModal
            isOpen={isInvoicePreviewOpen}
            onClose={() => setIsInvoicePreviewOpen(false)}
            customerType={customerType}
            customerName={mockFormData.customer.name}
            customerPhone={mockFormData.customer.phone}
            mapAddress={mapAddress}
        />

        <ProviderPaymentConfirmDialog
            isOpen={isProviderPaymentConfirmOpen}
            onClose={() => setIsProviderPaymentConfirmOpen(false)}
            onConfirm={() => setIsProviderPaymentConfirmOpen(false)}
            partnerName={partnerName}
        />

        <StatusUpdateModal
          isOpen={isStatusUpdateModalOpen}
          onClose={() => setIsStatusUpdateModalOpen(false)}
          currentStatus={currentStatus}
          onUpdate={(newStatus) => {
            setCurrentStatus(newStatus);
            setIsStatusUpdateModalOpen(false);
          }}
        />
      </div>
  );
};

export default StationOrderDetail;
