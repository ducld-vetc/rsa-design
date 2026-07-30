import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import { useLocation } from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Building2,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Banknote,
  Download,
  Edit,
  Eye,
  FileText,
  Hash,
  LifeBuoy,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Shuffle,
  Smartphone,
  Sparkles,
  Star,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Upload,
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
import CustomerPaymentModal, {
  CustomerPaymentSession,
  CustomerPaymentType
} from '../shared/CustomerPaymentModal';
import CustomerFeeChangeWarningModal, {
  CustomerFeeWarningType
} from '../shared/CustomerFeeChangeWarningModal';
import GuaranteeRateChangeWarningModal from '../shared/GuaranteeRateChangeWarningModal';
import UnpaidDepositRemainingWarningModal from '../shared/UnpaidDepositRemainingWarningModal';
import ProviderPaymentConfirmDialog from '../shared/ProviderPaymentConfirmDialog';
import UsageHistoryModal, {
  DEFAULT_PACKAGE_ORDERS,
  hasOrderCreatedToday,
} from '../shared/UsageHistoryModal';
import StatusUpdateModal, { STATUS_OPTIONS } from '../shared/StatusUpdateModal';
import type { OrderDetailsNavState } from '../data/orderListDemoData';
import ShareLocationWebviewModal from '../shared/ShareLocationWebviewModal';
import DetailedRatingCard from '../shared/DetailedRatingCard';
import RatingHistoryModal from '../shared/RatingHistoryModal';
import PriorityCustomerBadge from '../shared/PriorityCustomerBadge';
import { OrderWarningBadge, FloodWarningBadge } from '../shared/OrderAlertBadges';
import { isPriorityCustomerPhone } from '../shared/priorityCustomer';
import { RatingType, RATING_TYPE_LABELS } from '../shared/ratingTypes';
import { INITIAL_RATING_HISTORIES, RATING_DEMO_CASES } from '../data/ratingMockData';
import {AISuggestion, analyzeIncident} from '../data/aiDataMock';
import {FormData, RescueUnit} from '../types';
import Searching from "./Searching";
import PartnerSelect from '../components/PartnerSelect';
import PaymentRequestSection from '../shared/PaymentRequestSection';
import DriverSelect from '../components/DriverSelect';
import {
  calculateRescueFees,
  getRetailMarkupFactor,
  formatMoneyVi,
  type FeeSnapshot,
} from '../data/rescueFeeMockData';

interface ActualService {
  id: string;
  name: string;
  price: string;
  isCustom?: boolean;
}

const DRIVERS_MOCK = [
  { id: 'D1', name: 'Nguyễn Văn Tài', phone: '0911222333' },
  { id: 'D2', name: 'Trần Minh Quang', phone: '0988777666' },
  { id: 'D3', name: 'Lê Văn Hùng', phone: '0944555111' },
  { id: 'D4', name: 'Phạm Đức Anh', phone: '0900111222' }
];

type OrderPaymentStatus = 'PENDING' | 'DEPOSITED' | 'PAID';

const PAYMENT_STATUS_CONFIG: Record<OrderPaymentStatus, { label: string; color: string; dot: string }> = {
  PENDING: {
    label: 'Chờ thanh toán',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  DEPOSITED: {
    label: 'Đã cọc tiền',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  PAID: {
    label: 'Đã thanh toán',
    color: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500'
  }
};

const resolveOrderPaymentStatus = (
  totalDue: number,
  paid: number,
  deposited: number,
  remaining: number
): OrderPaymentStatus => {
  if (totalDue > 0 && remaining === 0 && paid >= totalDue) return 'PAID';
  if (deposited > 0 || paid > 0) return 'DEPOSITED';
  return 'PENDING';
};

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

const WORKSHOP_STATIONS = [
  'Carpla Service Thái Bình',
  'Carpla Service Hà Nội',
  'Carpla Service Hải Phòng',
  'Carpla Service Đà Nẵng',
  'Carpla Service TP. Hồ Chí Minh',
  'Carpla Service Cần Thơ',
  'Carpla Service Nha Trang',
  'Carpla Service Huế',
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

type AdjustmentRow = {
  id: number;
  serviceName: string;
  fixedPrice: string;
  adjustmentType: string;
  coefficient: string;
  ceilingPrice: string;
  discount: string;
  totalPrice: string;
  customerPaid: string;
  isCustom?: boolean;
  isCustomerFeeManual?: boolean;
  isSupplierFeeManual?: boolean;
  customerSource?: string;
  supplierSource?: string;
};

const parseMoney = (value: string) => parseFloat(value.replace(/,/g, '')) || 0;

const formatMoneyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('en-US');
};

const applyVatAfterTax = (beforeTax: number, vatPercent: number) =>
  Math.round(beforeTax * (1 + vatPercent / 100));

const applyVatBeforeTax = (afterTax: number, vatPercent: number) =>
  vatPercent > 0 ? afterTax / (1 + vatPercent / 100) : afterTax;

const calculateCustomerTotal = (rows: AdjustmentRow[]) =>
  rows.reduce((sum, row) => sum + parseMoney(row.customerPaid), 0);

const calculateProviderTotal = (rows: AdjustmentRow[]) =>
  rows.reduce((sum, row) => sum + parseMoney(row.totalPrice), 0);

const applyTotalPriceToRow = (
  row: AdjustmentRow,
  totalPrice: number,
  options?: { retailMarkup?: number; preserveCustomerPaid?: boolean }
): AdjustmentRow => {
  const fixed = parseMoney(row.fixedPrice);
  const coef = parseFloat(row.coefficient) || 0;
  const diff = fixed * coef - totalPrice;
  const markup = options?.retailMarkup ?? getRetailMarkupFactor();

  let customerPaid = row.customerPaid;
  if (!options?.preserveCustomerPaid && !row.isCustomerFeeManual) {
    customerPaid = Math.round(totalPrice * markup).toLocaleString('en-US');
  }

  return {
    ...row,
    totalPrice: totalPrice.toLocaleString('en-US'),
    customerPaid,
    discount: diff.toLocaleString('en-US'),
  };
};

const recalculateRowsFromFixedPrices = (rows: AdjustmentRow[]): AdjustmentRow[] =>
  rows.map((row) => {
    if (row.isSupplierFeeManual) {
      return applyTotalPriceToRow(row, parseMoney(row.totalPrice), { preserveCustomerPaid: true });
    }
    const fixed = parseMoney(row.fixedPrice);
    const coef = parseFloat(row.coefficient) || 1;
    return applyTotalPriceToRow(row, Math.round(fixed * coef), {
      preserveCustomerPaid: row.isCustomerFeeManual,
    });
  });

const computeUpdatedRows = (
  rows: AdjustmentRow[],
  id: number,
  field: string,
  value: string
): AdjustmentRow[] =>
  rows.map(row => {
    if (row.id !== id) return row;

    let processedValue = value;
    if (['fixedPrice', 'discount', 'customerPaid', 'ceilingPrice', 'totalPrice'].includes(field)) {
      const isNegative = value.trim().startsWith('-');
      const numericPart = value.replace(/[^0-9.]/g, '');
      const num = parseFloat(numericPart) || 0;
      processedValue = (isNegative ? -num : num).toLocaleString('en-US');
    }

    let updatedRow = { ...row, [field]: processedValue };

    if (field === 'totalPrice') {
      const numericPrice = parseMoney(processedValue);
      if (!updatedRow.isCustomerFeeManual) {
        updatedRow.customerPaid = Math.round(
          numericPrice * getRetailMarkupFactor()
        ).toLocaleString('en-US');
      }
    }

    if (field === 'adjustmentType') {
      const selectedLabels = processedValue.split(',').map(s => s.trim()).filter(s => s !== '');
      let maxCoef = 1.0;

      selectedLabels.forEach(label => {
        ADJUSTMENT_OPTIONS.forEach(cat => {
          const opt = cat.options.find(o => o.label === label);
          if (opt && opt.coef > maxCoef) {
            maxCoef = opt.coef;
          }
        });
      });

      updatedRow.coefficient = maxCoef.toFixed(2);
    }

    if (field === 'fixedPrice' || field === 'coefficient' || field === 'totalPrice' || field === 'adjustmentType') {
      const fixed = parseMoney(updatedRow.fixedPrice);
      const coef = parseFloat(updatedRow.coefficient) || 0;
      if ((field === 'fixedPrice' || field === 'coefficient' || field === 'adjustmentType') && !updatedRow.isSupplierFeeManual) {
        const nextTotal = Math.round(fixed * coef);
        updatedRow.totalPrice = nextTotal.toLocaleString('en-US');
        if (!updatedRow.isCustomerFeeManual) {
          updatedRow.customerPaid = Math.round(
            nextTotal * getRetailMarkupFactor()
          ).toLocaleString('en-US');
        }
      }
      const total = parseMoney(updatedRow.totalPrice);
      const diff = fixed * coef - total;
      updatedRow.discount = diff.toLocaleString('en-US');
    }

    return updatedRow;
  });

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
            className={`flex items-start justify-between gap-1 px-2 py-1 border rounded cursor-pointer min-h-[34px] transition-all ${disabled ? 'bg-gray-50 text-gray-500 border-gray-100' : 'bg-white border-gray-200 hover:border-vetc-green'}`}
        >
          <div className="flex min-h-[22px] flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 && (
              <span className="text-[10px] italic text-gray-400">Chon...</span>
            )}
            {selectedOptions.map((opt) => (
              <span
                key={opt}
                className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-100"
                title={opt}
              >
                {opt}
              </span>
            ))}
          </div>
          {!disabled && (
            <ChevronDown
              size={12}
              className={`text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
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

const AVAILABLE_SERVICES = [
  'Kích bình ắc quy',
  'Thay lốp dự phòng',
  'Cung cấp nhiên liệu',
  'Cứu hộ kéo xe (Towing)',
  'Sửa chữa tại chỗ (Mobile Mechanic)',
  'Mở khóa xe (Locksmith)',
  'Xe hết pin',
  'Đâm, lật, tai nạn',
  'Dịch vụ khác'
];

const OTHER_SERVICE_OPTIONS = [
  { value: 'night-support', label: 'Hỗ trợ ngoài giờ', suggestedPrice: 250000 },
  { value: 'highway-support', label: 'Phụ phí cao tốc', suggestedPrice: 300000 },
  { value: 'rain-storm-support', label: 'Phụ phí mưa bão', suggestedPrice: 350000 },
  { value: 'remote-area-support', label: 'Phụ phí khu vực xa', suggestedPrice: 400000 },
  { value: 'parking-basement-support', label: 'Hỗ trợ tầng hầm/bãi đỗ', suggestedPrice: 280000 },
  { value: 'custom-other', label: 'Khác', suggestedPrice: 200000 },
];

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
                 onChange,
                 onBlur
               }: {
  value?: string,
  defaultValue?: string,
  readOnly?: boolean,
  placeholder?: string,
  className?: string,
  onChange?: (val: string|any) => void,
  onBlur?: () => void
}) => (
    <input
        type="text"
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        className={`w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green transition-all ${readOnly ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100' : 'bg-white'} ${className}`}
    />
);

const GuestOrderDetails: React.FC<{
  role?: 'OSA' | 'ADMIN' | 'CSKH' | 'STATION' | 'DRIVER';
}> = ({ role = 'CSKH' }) => {
  const location = useLocation();
  const navState = (location.state ?? null) as OrderDetailsNavState | null;

  const [viewMode, setViewMode] = useState<'list' | 'tabs'>('list');
  const [activeTab, setActiveTab] = useState('general');

  const [selectedServices, setSelectedServices] = useState<string[]>(['Xe hết pin', 'Kích bình ắc quy', 'Đâm, lật, tai nạn']);
  const [actualServices, setActualServices] = useState<ActualService[]>([
    { id: '1', name: 'Xe hết pin', price: '200,000' },
    { id: '2', name: 'Kích bình ắc quy', price: '100,000' }
  ]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isOtherServiceFormOpen, setIsOtherServiceFormOpen] = useState(false);
  const [otherServiceKey, setOtherServiceKey] = useState('');
  const [otherServicePrice, setOtherServicePrice] = useState('');
  const [incidentDescription, setIncidentDescription] = useState(
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
  const [selectedPackage, setSelectedPackage] = useState('Gói cơ bản 10 dịch vụ');
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('D1');
  const [driverPhone, setDriverPhone] = useState('0911222333');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isManualSearchModalOpen, setIsManualSearchModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isExportingInvoice, setIsExportingInvoice] = useState(false);
  const [invoiceDownloadUrl, setInvoiceDownloadUrl] = useState<string | null>(null);
  const [stateFindStation, setStateFindStation] = useState<'search' | 'list'>('search');

  // Location type state
  const [locationType, setLocationType] = useState('Đô thị');

  // Rescue Info State
  const [partnerName, setPartnerName] = useState('CARPLA - CARPLA SERVICE');
  const [stationName, setStationName] = useState('Carpla Service - CN Hà Nội');
  const [rescueVehicleType, setRescueVehicleType] = useState('Xe kéo cẩu');
  const [rescueLicensePlate, setRescueLicensePlate] = useState('30G-888.88');
  const [rescueDistance, setRescueDistance] = useState('8');
  const [towingDestination, setTowingDestination] = useState('Ngõ 119 Hồ Đắc Di, Khu tập thể Nam Đồng, Phường Kim Liên, Quận Đống Đa, Thành phố Hà Nội, 11415, Việt Nam');
  const [towingCoords, setTowingCoords] = useState('21.01088443501316, 105.82813622447911');
  const [workshopStation, setWorkshopStation] = useState('Carpla Service Thái Bình');
  const [estimatedDistance, setEstimatedDistance] = useState('2.37');
  const [roadsideDistance, setRoadsideDistance] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advancePerson, setAdvancePerson] = useState('');

  const ENTERPRISE_OPTIONS = [
    { value: '', label: '-- Chọn doanh nghiệp --' },
    { value: 'VETC', label: 'VETC' },
    { value: 'FORD', label: 'Ford Việt Nam' },
    { value: 'TOYOTA', label: 'Toyota Việt Nam' },
    { value: 'HONDA', label: 'Honda Việt Nam' },
  ];
  const [selectedEnterprise, setSelectedEnterprise] = useState('');
  const [hasGuarantee, setHasGuarantee] = useState<'yes' | 'no'>('no');
  const [guaranteeNote, setGuaranteeNote] = useState('');
  const [guaranteeRate, setGuaranteeRate] = useState('');
  const [guaranteeRateDraft, setGuaranteeRateDraft] = useState('');
  const [isGuaranteeRateWarningOpen, setIsGuaranteeRateWarningOpen] = useState(false);
  const [pendingGuaranteeRate, setPendingGuaranteeRate] = useState('');
  const [enterpriseEstimatedCost, setEnterpriseEstimatedCost] = useState('0');

  const selectedEnterpriseLabel =
    ENTERPRISE_OPTIONS.find((opt) => opt.value === selectedEnterprise)?.label ?? '';
  const canEditEnterpriseFees = role === 'ADMIN' && isEditing;

  const handleEnterpriseChange = (value: string) => {
    setSelectedEnterprise(value);
    if (!value) {
      setHasGuarantee('no');
      setGuaranteeNote('');
      setGuaranteeRate('');
      setGuaranteeRateDraft('');
      setEnterpriseEstimatedCost('0');
    }
  };

  const handleGuaranteeChange = (value: 'yes' | 'no') => {
    setHasGuarantee(value);
    if (value === 'no') {
      setGuaranteeRate('');
      setGuaranteeRateDraft('');
    }
  };

  const normalizeGuaranteeRate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10);
    if (num < 1) return '';
    if (num > 100) return '100';
    return String(num);
  };

  const handleGuaranteeRateDraftChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setGuaranteeRateDraft('');
      return;
    }
    const num = parseInt(digits, 10);
    if (num > 100) {
      setGuaranteeRateDraft('100');
      return;
    }
    setGuaranteeRateDraft(digits);
  };

  const handleGuaranteeRateBlur = () => {
    if (!isEditing || isGuaranteeRateWarningOpen) return;

    const normalized = normalizeGuaranteeRate(guaranteeRateDraft);
    setGuaranteeRateDraft(normalized);

    if (normalized === guaranteeRate) return;

    setPendingGuaranteeRate(normalized);
    setIsGuaranteeRateWarningOpen(true);
  };

  const handleConfirmGuaranteeRateChange = () => {
    setGuaranteeRate(pendingGuaranteeRate);
    setGuaranteeRateDraft(pendingGuaranteeRate);
    setPendingGuaranteeRate('');
    setIsGuaranteeRateWarningOpen(false);
  };

  const handleCancelGuaranteeRateChange = () => {
    setGuaranteeRateDraft(guaranteeRate);
    setPendingGuaranteeRate('');
    setIsGuaranteeRateWarningOpen(false);
  };

  const handleEnterpriseEstimatedCostChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setEnterpriseEstimatedCost('');
      return;
    }
    setEnterpriseEstimatedCost(parseInt(digits, 10).toLocaleString('en-US'));
  };

  // Adjustment Coefficients Data state — khởi tạo từ engine bảng phí
  const buildInitialFeeRows = (): { rows: AdjustmentRow[]; snapshot: FeeSnapshot | null } => {
    const breakdown = calculateRescueFees({
      customerType: 'PACKAGE',
      supplierType: 'INTERNAL',
      packageBenefitAmount: 800000,
      weather: 'NORMAL',
      isNight: true,
      lines: [
        { serviceName: 'Xe hết pin', serviceType: 'ONSITE' },
        { serviceName: 'Kích bình ắc quy', serviceType: 'ONSITE' },
        { serviceName: 'Đâm, tai nạn, lật', serviceType: 'ONSITE' },
      ],
    });

    const rows: AdjustmentRow[] = breakdown.lines.map((line, idx) => ({
      id: idx + 1,
      serviceName: line.serviceName,
      fixedPrice: formatMoneyVi(line.fixedPrice),
      adjustmentType: line.adjustmentLabels.join(', '),
      coefficient: String(line.coefficient),
      ceilingPrice: '0',
      discount: formatMoneyVi(line.discount),
      totalPrice: formatMoneyVi(line.supplierAmount),
      customerPaid: formatMoneyVi(line.customerAmount),
      isCustom: false,
      isCustomerFeeManual: false,
      isSupplierFeeManual: false,
      customerSource: line.customerSource,
      supplierSource: line.supplierSource,
    }));

    return { rows, snapshot: breakdown.snapshot };
  };

  const initialFeeBundle = buildInitialFeeRows();
  const [adjustmentRows, setAdjustmentRows] = useState<AdjustmentRow[]>(initialFeeBundle.rows);
  const [feeSnapshot, setFeeSnapshot] = useState<FeeSnapshot | null>(initialFeeBundle.snapshot);
  const [customerTotalOverride, setCustomerTotalOverride] = useState<string | null>(null);

  // One order must use a single customer fee table source.
  const customerFeeSourceText =
    feeSnapshot?.customerFeeMode === 'BUSINESS'
      ? selectedEnterprise || feeSnapshot.customerTableCode || 'VETC'
      : 'VETC';
  const supplierFeeSourceText =
    feeSnapshot?.supplierTableCode?.includes('INT') ||
    partnerName.toLowerCase().includes('vetc') ||
    partnerName.toLowerCase().includes('carpla')
      ? 'VETC'
      : 'NCC';

  // Map States
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapAddress, setMapAddress] = useState(
    navState?.address ??
      'Hanoi Metro Cafe & Canteen, 192, Phố Hào Nam, Phường Ô Chợ Dừa, Quận Đống Đa, Thành phố Hà Nội, 10060, Việt Nam'
  );
  const [displayOrderId, setDisplayOrderId] = useState(navState?.orderId ?? 'RS12602020002');
  const [customerName, setCustomerName] = useState(navState?.customerName ?? 'Vương Đăng Minh');
  const [customerPhone, setCustomerPhone] = useState(navState?.customerPhone ?? '0967419411');
  const [vehiclePlate, setVehiclePlate] = useState(navState?.plate ?? '29E366666');
  const [mapCoords, setMapCoords] = useState("21.0277350565601, 105.827792697257");

  // Cancellation States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isEditCancelReasonModalOpen, setIsEditCancelReasonModalOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState<string>('');
  const [cancelReason, setCancelReason] = useState('');
  const [orderCancelReason, setOrderCancelReason] = useState('Không còn cần dịch vụ');

  const [severityLevel, setSeverityLevel] = useState('Nhẹ');
  const [weather, setWeather] = useState('Bình thường');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentType, setActivePaymentType] = useState<CustomerPaymentType>('deposit');
  const [depositPaymentSession, setDepositPaymentSession] = useState<CustomerPaymentSession>({ method: null });
  const [remainingPaymentSession, setRemainingPaymentSession] = useState<CustomerPaymentSession>({ method: null });
  const DEPOSIT_AMOUNT = 50_000;
  const isDepositPaid =
    depositPaymentSession.pushStatus === 'success' ||
    depositPaymentSession.paymentCheckStatus === 'paid' ||
    depositPaymentSession.cashStatus === 'confirmed';
  const paidAmount = isDepositPaid ? DEPOSIT_AMOUNT : 0;
  const [refundAmount, setRefundAmount] = useState(0);
  const hasDeposited = isDepositPaid;
  const hasPartialPayment = hasDeposited || paidAmount > 0;
  const [isUnpaidDepositWarningOpen, setIsUnpaidDepositWarningOpen] = useState(false);
  const [isFeeWarningOpen, setIsFeeWarningOpen] = useState(false);
  const [editBaselineTotal, setEditBaselineTotal] = useState(0);
  const [pendingFeeChange, setPendingFeeChange] = useState<{
    type: CustomerFeeWarningType;
    oldTotal: number;
    newTotal: number;
  } | null>(null);

  const openPaymentModal = (type: CustomerPaymentType) => {
    if (type === 'remaining' && DEPOSIT_AMOUNT > 0 && !isDepositPaid) {
      setIsUnpaidDepositWarningOpen(true);
      return;
    }
    setActivePaymentType(type);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmUnpaidDepositRemaining = () => {
    setIsUnpaidDepositWarningOpen(false);
    setActivePaymentType('remaining');
    setIsPaymentModalOpen(true);
  };
  const [isProviderPaymentConfirmOpen, setIsProviderPaymentConfirmOpen] = useState(false);
  const [isDistanceWarningOpen, setIsDistanceWarningOpen] = useState(false);

  const hasPackage = selectedPackage !== 'Không có';
  const packageOrders = hasPackage ? DEFAULT_PACKAGE_ORDERS : [];
  const hasOrderToday = hasOrderCreatedToday(packageOrders);
  const isOverDistance = parseFloat(estimatedDistance) > 100;

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEstimatedDistance(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 100 && hasPackage) {
      setIsDistanceWarningOpen(true);
    }
  };

  const handleRoadsideDistanceChange = (value: string) => {
    const normalized = value.replace(',', '.');
    if (normalized === '' || /^\d*\.?\d*$/.test(normalized)) {
      setRoadsideDistance(normalized);
    }
  };
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [isShareLocationWebviewOpen, setIsShareLocationWebviewOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(navState?.portalStatusId ?? 'EXECUTE-RESCUING');

  useEffect(() => {
    if (!navState) return;
    setDisplayOrderId(navState.orderId);
    setCurrentStatus(navState.portalStatusId);
    setCustomerName(navState.customerName);
    setCustomerPhone(navState.customerPhone);
    setVehiclePlate(navState.plate);
    setMapAddress(navState.address);
  }, [navState]);
  const [ratingHistories, setRatingHistories] = useState(INITIAL_RATING_HISTORIES);
  const [ratingHistoryModal, setRatingHistoryModal] = useState<{
    isOpen: boolean;
    type: RatingType | null;
  }>({ isOpen: false, type: null });
  const [expandedRatings, setExpandedRatings] = useState<Record<string, boolean>>({
    customer_vetc: true,
    customer_driver: true,
    customer_workshop: false,
    rescue_customer: false,
    vetc_rescue: false,
  });

  const handleSaveRatingVersion = (
    type: RatingType,
    data: { stars: number; category: string; content: string; attachments: { name: string; url?: string }[] }
  ) => {
    setRatingHistories((prev) => {
      const history = prev[type];
      const nextVersion = history.length + 1;
      return {
        ...prev,
        [type]: [
          ...history,
          {
            id: `${type}-v${nextVersion}-${Date.now()}`,
            version: nextVersion,
            targetLabel: RATING_TYPE_LABELS[type],
            ratedAt: new Date().toLocaleString('vi-VN'),
            stars: data.stars,
            content: data.content,
            attachments: data.attachments,
            category: data.category,
            updatedBy: 'CSKH — Nguyễn Thị Lan',
          },
        ],
      };
    });
  };

  const RATING_CARD_CONFIG: {
    type: RatingType;
    categories: string[];
    feedback?: boolean;
  }[] = [
    { type: 'customer_vetc', categories: ['Bình thường', 'Khen ngợi', 'Góp ý nhẹ', 'Khiếu nại'], feedback: true },
    { type: 'customer_driver', categories: ['Bình thường', 'Khen ngợi', 'Góp ý nhẹ', 'Khiếu nại'], feedback: true },
    { type: 'customer_workshop', categories: ['Bình thường', 'Khen ngợi', 'Góp ý nhẹ', 'Khiếu nại'], feedback: true },
    { type: 'rescue_customer', categories: ['Bình thường', 'Khách hàng nhiệt tình', 'Khách hàng khó tính', 'Sai lệch thông tin'], feedback: true },
    { type: 'vetc_rescue', categories: ['Bình thường', 'Đúng giờ, chuyên nghiệp', 'Chậm trễ', 'Thái độ không tốt', 'Vi phạm quy trình'], feedback: false },
  ];
  const [vat, setVat] = useState('8');


  // Calculate Max Coefficient for Highlighting
  const maxCoefficient = adjustmentRows.length > 0 ? Math.max(...adjustmentRows.map(r => parseFloat(r.coefficient))) : 0;

  // Tổng phí = tổng các dòng (không cân bằng dòng khác)
  const providerTotal = calculateProviderTotal(adjustmentRows);
  const displayProviderTotal = providerTotal;

  const providerVatValue = parseFloat(vat) || 0;
  const totalProviderPriceBeforeTax = displayProviderTotal / (1 + providerVatValue / 100);

  // Calculate total customer price from adjustmentRows
  const grossCustomerTotal = calculateCustomerTotal(adjustmentRows);
  const displayGrossCustomerTotal =
    customerTotalOverride !== null ? parseMoney(customerTotalOverride) : grossCustomerTotal;
  const customerTotalMismatch =
    customerTotalOverride !== null && parseMoney(customerTotalOverride) !== grossCustomerTotal;

  const tableTotals = {
    customerPaid: grossCustomerTotal,
    totalPrice: providerTotal,
    discount: adjustmentRows.reduce((sum, row) => {
      const d = parseMoney(row.discount);
      return sum + (row.discount.trim().startsWith('-') ? Math.abs(d) : -d);
    }, 0),
  };
  const vatRate = parseFloat(vat) || 0;
  const guaranteeRateNum = parseInt(guaranteeRate, 10) || 0;
  const isGuaranteeActive = hasGuarantee === 'yes' && guaranteeRateNum > 0 && !!selectedEnterprise;

  const enterpriseAfterTax = isGuaranteeActive
    ? Math.round(grossCustomerTotal * (guaranteeRateNum / 100))
    : applyVatAfterTax(parseMoney(enterpriseEstimatedCost), vatRate);

  const enterpriseBeforeTax = isGuaranteeActive
    ? applyVatBeforeTax(enterpriseAfterTax, vatRate)
    : parseMoney(enterpriseEstimatedCost);

  const individualCustomerPrice = isGuaranteeActive
    ? Math.round(displayGrossCustomerTotal * ((100 - guaranteeRateNum) / 100))
    : displayGrossCustomerTotal;

  const remainingAmount = refundAmount > 0 ? 0 : Math.max(0, individualCustomerPrice - paidAmount);
  const orderPaymentStatus = resolveOrderPaymentStatus(
    individualCustomerPrice,
    paidAmount,
    DEPOSIT_AMOUNT,
    remainingAmount
  );
  const paymentStatusInfo = PAYMENT_STATUS_CONFIG[orderPaymentStatus];

  const handleStartEditing = () => {
    setEditBaselineTotal(individualCustomerPrice);
    setCustomerTotalOverride(null);
    setIsEditing(true);
  };

  const handleProviderTotalChange = (value: string) => {
    // Tổng phía trên chỉ phản ánh tổng dòng; không phân bổ lại.
    // Cho phép ghi đè tạm hiển thị bằng cách scale tỷ lệ nếu user chủ động sửa (hiếm).
    const formatted = formatMoneyInput(value);
    const newTotal = parseMoney(formatted);
    const current = calculateProviderTotal(adjustmentRows);
    if (current <= 0 || adjustmentRows.length === 0) return;
    const ratio = newTotal / current;
    setCustomerTotalOverride(null);
    setAdjustmentRows((prev) =>
      prev.map((row) => {
        const nextSupplier = Math.round(parseMoney(row.totalPrice) * ratio);
        return {
          ...applyTotalPriceToRow(row, nextSupplier, { preserveCustomerPaid: row.isCustomerFeeManual }),
          isSupplierFeeManual: true,
          supplierSource: 'Thủ công',
        };
      })
    );
  };

  const handleCustomerTotalChange = (value: string) => {
    setCustomerTotalOverride(formatMoneyInput(value));
  };

  const handleRefreshProviderTotal = () => {
    const recalculated = recalculateRowsFromFixedPrices(adjustmentRows);
    setAdjustmentRows(recalculated);
    setCustomerTotalOverride(null);
  };

  const finalizeSave = () => {
    if (hasPartialPayment && individualCustomerPrice < DEPOSIT_AMOUNT) {
      setRefundAmount(Math.max(0, DEPOSIT_AMOUNT - individualCustomerPrice));
    } else if (individualCustomerPrice >= paidAmount) {
      setRefundAmount(0);
    }
    setCustomerTotalOverride(null);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    const newTotal = individualCustomerPrice;
    const oldTotal = editBaselineTotal;

    if (hasPartialPayment && newTotal < DEPOSIT_AMOUNT) {
      setPendingFeeChange({ type: 'decrease', oldTotal, newTotal });
      setIsFeeWarningOpen(true);
      return;
    }

    if (hasPartialPayment && newTotal > oldTotal) {
      setPendingFeeChange({ type: 'increase', oldTotal, newTotal });
      setIsFeeWarningOpen(true);
      return;
    }

    finalizeSave();
  };

  const handleConfirmFeeChange = () => {
    if (!pendingFeeChange) return;
    if (pendingFeeChange.type === 'decrease') {
      setRefundAmount(Math.max(0, DEPOSIT_AMOUNT - pendingFeeChange.newTotal));
    }
    setPendingFeeChange(null);
    setIsFeeWarningOpen(false);
    setIsEditing(false);
  };

  const handleCancelFeeChange = () => {
    setPendingFeeChange(null);
    setIsFeeWarningOpen(false);
  };

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

  const handleAddService = (serviceName: string, customPrice?: string) => {
    const defaultPrice = customPrice && customPrice.trim() !== '' ? formatMoneyInput(customPrice) : '500,000';
    const defaultCoefficient = '1';
    const supplierAmount = parseMoney(defaultPrice);
    const customerAmount = Math.round(supplierAmount * getRetailMarkupFactor());

    const newRow: AdjustmentRow = {
      id: Date.now(),
      serviceName: serviceName,
      fixedPrice: defaultPrice,
      adjustmentType: '',
      coefficient: defaultCoefficient,
      ceilingPrice: '0',
      discount: '0',
      totalPrice: defaultPrice,
      customerPaid: customerAmount.toLocaleString('en-US'),
      isCustom: serviceName === 'Dịch vụ khác' || Boolean(customPrice),
      isCustomerFeeManual: false,
      isSupplierFeeManual: Boolean(customPrice),
      customerSource: customPrice ? 'Thủ công' : customerFeeSourceText,
      supplierSource: customPrice ? 'Thủ công' : supplierFeeSourceText,
    };
    setCustomerTotalOverride(null);
    setAdjustmentRows((prev) => [...prev, newRow]);
    setOtherServiceKey('');
    setOtherServicePrice('');
    setIsOtherServiceFormOpen(false);
    setIsServiceModalOpen(false);
  };

  const handleSelectServiceFromModal = (serviceName: string) => {
    if (serviceName === 'Dịch vụ khác') {
      setIsOtherServiceFormOpen(true);
      return;
    }
    handleAddService(serviceName);
  };

  const handleSaveOtherService = () => {
    const selectedOtherService = OTHER_SERVICE_OPTIONS.find((opt) => opt.value === otherServiceKey);
    const normalizedName = selectedOtherService?.label?.trim() ?? '';
    const normalizedPrice = parseMoney(otherServicePrice);
    if (!normalizedName || normalizedPrice <= 0) return;
    handleAddService(normalizedName, otherServicePrice);
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
    setOrderCancelReason(finalReason);
    setCurrentStatus('FINISH-CANCELLED');
    setIsCancelModalOpen(false);
    setSelectedCancelReason('');
    setCancelReason('');
  };

  const handleOpenCancelModal = () => {
    setSelectedCancelReason('');
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleOpenEditCancelReasonModal = () => {
    if (CANCEL_REASONS.includes(orderCancelReason)) {
      setSelectedCancelReason(orderCancelReason);
      setCancelReason('');
    } else if (orderCancelReason) {
      setSelectedCancelReason('Lý do khác');
      setCancelReason(orderCancelReason);
    } else {
      setSelectedCancelReason('');
      setCancelReason('');
    }
    setIsEditCancelReasonModalOpen(true);
  };

  const handleConfirmEditCancelReason = () => {
    const finalReason = selectedCancelReason === 'Lý do khác' ? cancelReason.trim() : selectedCancelReason;
    setOrderCancelReason(finalReason);
    setIsEditCancelReasonModalOpen(false);
    setSelectedCancelReason('');
    setCancelReason('');
  };

  const handleCloseCancelDialog = () => {
    setIsCancelModalOpen(false);
    setIsEditCancelReasonModalOpen(false);
    setSelectedCancelReason('');
    setCancelReason('');
  };

  const isOrderCancelled = currentStatus === 'FINISH-CANCELLED';

  const handleProviderPriceChange = (id: number, value: string) => {
    setCustomerTotalOverride(null);
    const nextPrice = Math.max(0, parseMoney(formatMoneyInput(value)));
    setAdjustmentRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...applyTotalPriceToRow(row, nextPrice, {
                preserveCustomerPaid: row.isCustomerFeeManual,
              }),
              isSupplierFeeManual: true,
              supplierSource: 'Thủ công',
            }
          : row
      )
    );
  };

  const handleCustomerPaidChange = (id: number, value: string) => {
    if (!isEditing) return;
    setCustomerTotalOverride(null);
    setAdjustmentRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              customerPaid: formatMoneyInput(value),
              isCustomerFeeManual: true,
              customerSource: 'Thủ công',
            }
          : row
      )
    );
  };

  const handleRemoveAdjustmentRow = (id: number) => {
    if (!isEditing) return;
    setCustomerTotalOverride(null);
    setAdjustmentRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAdjustmentChange = (id: number, field: string, value: string) => {
    if (field === 'totalPrice') return;
    setCustomerTotalOverride(null);
    const updatedRows = computeUpdatedRows(adjustmentRows, id, field, value);
    const shouldMarkSupplierManual = ['fixedPrice', 'coefficient', 'adjustmentType'].includes(field);
    setAdjustmentRows(
      updatedRows.map((row) =>
        row.id === id && shouldMarkSupplierManual
          ? { ...row, isSupplierFeeManual: true, supplierSource: 'Thủ công' }
          : row
      )
    );
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
  const isVisible = (tabId: string) => viewMode === 'list' || activeTab === tabId;

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

  // Tabs Configuration
  const TABS = [
    { id: 'general', label: 'Thông tin sự cố', icon: <User size={16}/> },
    { id: 'orchestration', label: 'Điều phối cứu hộ', icon: <LifeBuoy size={16}/> },
    { id: 'fees', label: 'Thông tin phí', icon: <Banknote size={16}/> },
    { id: 'process', label: 'Quá trình cứu hộ', icon: <Activity size={16}/> },
    { id: 'images', label: 'Hình ảnh', icon: <Camera size={16}/> },
    { id: 'camera', label: 'Camera xe', icon: <Video size={16}/> },
    { id: 'monitoring', label: 'Giám sát & Thực thi', icon: <ShieldCheck size={16}/> },
    { id: 'invoice', label: 'Hóa đơn', icon: <FileText size={16}/> },
    { id: 'payment-request', label: 'Đề nghị thanh toán', icon: <CreditCard size={16}/> },
  ];

  // Mock data for Searching/RescueList component
  const mockFormData: FormData = {
    orderId: displayOrderId,
    customer: {
      phone: customerPhone,
      plate: vehiclePlate,
      name: customerName,
      vin: 'R7C2X9M4A8',
      vehicleBrand: 'Toyota',
      vehicleLine: 'Sedan',
      payload: '1',
      seats: '5',
      servicePackage: selectedPackage
    },
    assistance: {
      rescueName: customerName,
      rescuePhone: customerPhone,
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

  const isPriorityCustomer = isPriorityCustomerPhone(customerPhone);
  const hasOrderWarning = true;
  const isFloodedArea = true;

  const shareLocationUrl = `https://vetc.com.vn/share-location/${mockFormData.orderId}`;
  const parseCoords = (raw: string): { lat?: number; lng?: number } => {
    const [latStr, lngStr] = raw.split(',').map((s) => s.trim());
    const lat = Number(latStr);
    const lng = Number(lngStr);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : {};
  };
  const rescueCoords = parseCoords(mapCoords);
  const towCoords = parseCoords(towingCoords);

  return (
      <div className="space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-20">
        {/* Top Sticky Header Row */}
        <div className="sticky top-0 z-20 flex flex-col bg-white/95 backdrop-blur-md border rounded-xl shadow-md border-l-4 border-l-vetc-green text-left">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-6">

              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Mã đơn hàng (Cố định)</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black text-gray-900 tracking-tight">{displayOrderId}</span>
                  <span className={`${selectedPackage === 'Không có' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'} px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight`}>
                    {selectedPackage === 'Không có' ? 'Đơn Lẻ' : 'Đơn gói'}
                  </span>
                  {isPriorityCustomer && <PriorityCustomerBadge />}
                  {hasOrderWarning && <OrderWarningBadge />}
                  {isFloodedArea && <FloodWarningBadge />}
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

              <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Trạng thái thanh toán</span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border w-fit ${paymentStatusInfo.color}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${paymentStatusInfo.dot}`}></div>
                  <span>{paymentStatusInfo.label}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing && (
                  <button
                      className="flex items-center space-x-2 px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-50 transition-all active:scale-95 group"
                  >
                    <Check size={14} className="group-hover:scale-110 transition-transform" />
                    <span>Xác nhận</span>
                  </button>
              )}

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
                        onClick={handleSaveChanges}
                        className="flex items-center space-x-2 px-6 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg transition-all active:scale-95 group"
                    >
                      <Save size={14} className="group-hover:scale-110 transition-transform" />
                      <span>Lưu thay đổi</span>
                    </button>
                  </>
              ) : (
                  <button
                      onClick={handleStartEditing}
                      className="flex items-center space-x-2 px-6 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-lg transition-all active:scale-95 group"
                    >
                    <Edit size={14} className="group-hover:scale-110 transition-transform" />
                    <span>Cập nhật</span>
                  </button>
              )}
            </div>
          </div>

          {/* Tab Navigation Bar */}
          {viewMode === 'tabs' || viewMode === 'list' && (
              <div className="flex items-center px-4 border-t bg-gray-50/50 overflow-x-auto custom-scrollbar">
                {TABS.map(tab => (
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
                ))}
              </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 text-left">
          {/* 1. Thông tin sự cố */}
          <div id="section-general" className={`scroll-mt-40 ${isVisible('general') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Thông tin sự cố" number={1} icon={<User size={16} />} />
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                <div className="lg:col-span-2">
                  <Label>Thu thập vị trí</Label>
                  <div className="flex items-center space-x-2 bg-gray-50 border rounded px-3 py-1.5">
                    <span className="text-xs text-blue-600 font-medium truncate flex-1">{shareLocationUrl}</span>
                    <button
                      type="button"
                      onClick={() => setIsShareLocationWebviewOpen(true)}
                      className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded border border-vetc-green text-vetc-green text-[10px] font-bold hover:bg-green-50 transition-colors"
                      title="Xem trước giao diện Webview khách hàng"
                    >
                      <Smartphone size={12} />
                      Webview
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(shareLocationUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`${copied ? 'text-vetc-green' : 'text-gray-400'} hover:text-vetc-green transition-colors active:scale-90 flex items-center space-x-1 shrink-0`}
                      title="Copy link"
                    >
                      {copied ? <span className="text-[10px] font-bold">Đã sao chép!</span> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-2"></div>
                <div>
                  <Label required>Người yêu cầu</Label>
                  <Input defaultValue={customerName} readOnly={true} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label required>SĐT yêu cầu</Label>
                    {isPriorityCustomer && <PriorityCustomerBadge compact />}
                  </div>
                  <Input defaultValue={customerPhone} readOnly={true} />
                </div>
                <div>
                  <Label>Người liên hệ</Label>
                  <Input defaultValue={customerName} readOnly={!isEditing} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label>SĐT liên hệ</Label>
                    {isPriorityCustomer && <PriorityCustomerBadge compact />}
                  </div>
                  <Input defaultValue={customerPhone} readOnly={!isEditing} />
                </div>

                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <Label>Doanh nghiệp</Label>
                    <select
                      value={selectedEnterprise}
                      disabled={!isEditing}
                      onChange={(e) => handleEnterpriseChange(e.target.value)}
                      className={`w-full border rounded px-3 py-1.5 text-xs font-bold outline-none focus:border-vetc-green transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                    >
                      {ENTERPRISE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {selectedEnterprise && (
                    <>
                      <div>
                        <Label>Bảo lãnh</Label>
                        <select
                          value={hasGuarantee}
                          disabled={!isEditing}
                          onChange={(e) => handleGuaranteeChange(e.target.value as 'yes' | 'no')}
                          className={`w-full border rounded px-3 py-1.5 text-xs font-bold outline-none focus:border-vetc-green transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                        >
                          <option value="no">Không</option>
                          <option value="yes">Có</option>
                        </select>
                      </div>
                      {hasGuarantee === 'yes' && (
                        <div>
                          <Label required>Tỷ lệ bảo lãnh</Label>
                          <div className="relative">
                            <Input
                              value={guaranteeRateDraft}
                              onChange={handleGuaranteeRateDraftChange}
                              onBlur={handleGuaranteeRateBlur}
                              placeholder="1 – 100"
                              readOnly={!isEditing}
                              className="w-full text-right font-bold pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">%</span>
                          </div>
                        </div>
                      )}
                      <div className={hasGuarantee === 'yes' ? '' : 'lg:col-span-2'}>
                        <Label>Ghi chú bảo lãnh</Label>
                        <Input
                          value={guaranteeNote}
                          onChange={(e) => setGuaranteeNote(e.target.value)}
                          placeholder="Nhập nội dung chi tiết bảo lãnh..."
                          readOnly={!isEditing}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <Label required>Biển số xe</Label>
                    <Input defaultValue={vehiclePlate} readOnly={true} />
                  </div>
                  <div>
                    <Label>Số khung (Vin)</Label>
                    <Input defaultValue="R7C2X9M4A8" readOnly={!isEditing} />
                  </div>
                  <div>
                    <Label>Hãng xe</Label>
                    <Input defaultValue="Toyota" readOnly={!isEditing} />
                  </div>
                  <div>
                    <Label>Dòng xe</Label>
                    <Input defaultValue="Sedan" readOnly={!isEditing} />
                  </div>
                </div>

                <div>
                  <Label>Trọng tải</Label>
                  <div className="flex items-center space-x-2">
                    <Input defaultValue="1" readOnly={!isEditing} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">tấn</span>
                  </div>
                </div>
                <div>
                  <Label>Số chỗ</Label>
                  <div className="flex items-center space-x-2">
                    <Input defaultValue="5" readOnly={!isEditing} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase">chỗ</span>
                  </div>
                </div>
                <div>
                  <Label>Loại xe</Label>
                  <div className="flex items-center space-x-2">
                    <select disabled={!isEditing} className={`w-48 border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green font-bold text-gray-700 ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}>
                      <option value="Xe chở hàng">Xe chở hàng</option>
                      <option value="Xe chở người">Xe chở người</option>
                    </select>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div>
                    <Label>
                      <span className="flex items-center gap-2 flex-wrap">
                        Gói dịch vụ
                        {hasOrderToday && (
                          <span className="inline-flex items-center gap-1 normal-case tracking-normal text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            <AlertTriangle size={11} className="shrink-0" />
                            Cảnh báo đơn
                          </span>
                        )}
                      </span>
                    </Label>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className={`flex-1 relative`}>
                        <select
                            value={selectedPackage}
                            disabled={!isEditing}
                            onChange={(e) => {
                              setSelectedPackage(e.target.value);
                            }}
                            className={`w-full border rounded pl-3 pr-10 py-1.5 text-xs font-bold outline-none appearance-none focus:border-vetc-green transition-all ${selectedPackage === 'Không có' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} ${!isEditing ? 'cursor-not-allowed' : ''}`}
                        >
                          {PACKAGE_LIST.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          <option value="Không có">Không có</option>
                        </select>
                        <div className="absolute right-2 top-2 pointer-events-none text-gray-400">
                          {selectedPackage === 'Không có' ? <UserX size={14} /> : <UserCheck size={14} />}
                        </div>
                      </div>
                      <button
                          onClick={() => {
                            setIsPackageModalOpen(true);
                          }}
                          className="text-[10px] text-blue-600 font-bold underline whitespace-nowrap px-2"
                      >
                        Chi tiết gói
                      </button>
                    </div>
                  </div>
                </div>
                {/* Vị trí sự cố */}
                <div className="lg:col-span-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Label required>Vị trí sự cố</Label>
                        {isFloodedArea && <FloodWarningBadge compact />}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0 text-left">
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
                    <div className="lg:col-span-1">
                      <Label>Lat</Label>
                      <Input value={mapCoords.split(',')[0].trim()} readOnly />
                    </div>
                    <div className="lg:col-span-1">
                      <Label>Long</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={mapCoords.split(',')[1]?.trim() || ''} readOnly />
                        <button
                            onClick={() => {
                              navigator.clipboard.writeText(mapCoords);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-gray-400 hover:text-vetc-green transition-colors shrink-0"
                            title="Copy tọa độ"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Điểm xưởng */}
                <div className="lg:col-span-1">
                  <Label>Điểm xưởng</Label>
                  <div className="relative">
                    <select
                        value={workshopStation}
                        disabled={!isEditing}
                        onChange={(e) => setWorkshopStation(e.target.value)}
                        className={`w-full border rounded px-3 py-1.5 text-xs font-medium outline-none appearance-none pr-8 transition-all ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100' : 'bg-white focus:border-vetc-green hover:border-vetc-green cursor-pointer'}`}
                    >
                      <option value="">-- Chọn điểm xưởng --</option>
                      {WORKSHOP_STATIONS.map((ws) => (
                          <option key={ws} value={ws}>{ws}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Điểm kéo về */}
                <div className="lg:col-span-4">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Label>Điểm kéo xe về</Label>
                        {isFloodedArea && <FloodWarningBadge compact />}
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1 min-w-0 text-left">
                          <input
                              readOnly={!isEditing}
                              value={towingDestination}
                              onChange={(e) => setTowingDestination(e.target.value)}
                              className={`w-full border rounded px-3 py-1.5 text-xs outline-none pr-8 font-medium ${!isEditing ? 'bg-gray-50' : 'bg-white focus:border-vetc-green'}`}
                          />
                          <MapPin size={14} className="absolute right-2.5 top-2 text-red-500" />
                        </div>
                        <button
                            disabled={!isEditing}
                            className={`bg-vetc-green text-white px-4 py-1.5 rounded text-[11px] font-bold shrink-0 hover:bg-green-700 transition-all flex items-center space-x-2 active:scale-95 shadow-sm ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <MapPin size={14} />
                          <span>Bản đồ</span>
                        </button>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <Label>Lat</Label>
                      <Input value={towingCoords.split(',')[0].trim()} readOnly />
                    </div>
                    <div className="lg:col-span-1">
                      <Label>Long</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={towingCoords.split(',')[1]?.trim() || ''} readOnly />
                        <button
                            onClick={() => {
                              navigator.clipboard.writeText(towingCoords);
                            }}
                            className="text-gray-400 hover:text-vetc-green transition-colors shrink-0"
                            title="Copy tọa độ"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Khoảng cách & vị trí mặt đường */}
                <div className="lg:col-span-2">
                  <Label>Khoảng cách (Ước tính)</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Input
                        value={estimatedDistance}
                        readOnly={!isEditing}
                        onChange={handleDistanceChange}
                        className={isOverDistance && hasPackage ? '!border-orange-400 !bg-orange-50' : ''}
                      />
                      {isOverDistance && hasPackage && (
                        <AlertCircle size={14} className="absolute right-2 top-2 text-orange-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">KM</span>
                  </div>
                  {isOverDistance && hasPackage && (
                    <button
                      onClick={() => setIsDistanceWarningOpen(true)}
                      className="text-[10px] text-orange-600 font-bold mt-1 hover:underline flex items-center space-x-1"
                    >
                      <AlertCircle size={10} />
                      <span>Vượt quá phạm vi gói ({(parseFloat(estimatedDistance) - 100).toFixed(1)} km ngoài gói)</span>
                    </button>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <Label>Vị trí với mặt đường</Label>
                  <div className="flex items-center space-x-2 max-w-xs">
                    <Input
                      value={roadsideDistance}
                      onChange={handleRoadsideDistanceChange}
                      readOnly={!isEditing}
                      placeholder="0"
                      className="text-right"
                    />
                    <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Mét</span>
                  </div>
                </div>

                {/* Loại vị trí / Mức độ / Thời tiết — 1 dòng */}
                <div className="lg:col-span-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
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
                    <div>
                      <Label>Mức độ nghiêm trọng</Label>
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
                    <div>
                      <Label>Thời tiết</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[
                          { label: 'Bình thường', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300', activeColor: 'bg-green-600 text-white border-green-600 shadow-md' },
                          { label: 'Mưa bão', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500 shadow-md' },
                          { label: 'Ngập lụt', color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300', activeColor: 'bg-sky-600 text-white border-sky-600 shadow-md' },
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

                <div className="lg:col-span-4 hidden">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center mb-2">
                    <MessageSquare size={14} className="mr-1.5 text-amber-600" /> Ghi chú điều phối (Auto-AI)</label>
                  <div className={`rounded-xl border-2 p-3 min-h-[200px] text-[11px] font-bold leading-relaxed transition-all ${
                      isAiApplied
                          ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-inner'
                          : isEditing
                              ? 'border-gray-300 bg-white text-gray-700'
                              : 'border-gray-200 bg-gray-50 text-gray-500 italic'
                  }`}>
                    {isAiApplied && <div className="flex items-center text-amber-600 mb-2 font-black uppercase tracking-tighter"><Sparkles size={12} className="mr-1.5 animate-pulse" /> Đề xuất từ hệ thống RSA-AI</div>}
                    {isEditing ? (
                        <textarea
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            className="w-full bg-transparent outline-none resize-none min-h-[160px]"
                            placeholder="Nhập ghi chú thêm..."
                        />
                    ) : (
                        <div className="whitespace-pre-wrap">
                          {verificationNotes || "Chưa có ghi chú điều phối..."}
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
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Thông tin điều phối cứu hộ */}
          <div id="section-orchestration" className={`scroll-mt-40 ${isVisible('orchestration') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Thông tin điều phối cứu hộ" number={2} icon={<Truck size={16} />} />
              <div className="p-5 space-y-6">
                <div className="flex items-center space-x-4">
                  <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="bg-vetc-green text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-700 transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <Shuffle size={14} />
                    <span>Điều phối tự động</span>
                  </button>

                  <button
                      disabled={!isEditing}
                      onClick={() => setIsManualSearchModalOpen(true)}
                      className={`bg-white border-2 border-vetc-green text-vetc-green px-5 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-50 transition-all flex items-center space-x-2 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Search size={14} />
                    <span>Tìm trạm thủ công</span>
                  </button>

                  <span className="text-[10px] text-gray-400 italic">Hệ thống sẽ gợi ý trạm gần nhất dựa trên vị trí sự cố</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-50 text-left">
                  <div className="lg:col-span-1">
                    <Label required>Đối tác cung cấp</Label>
                    <PartnerSelect 
                      value={partnerName}
                      onChange={setPartnerName}
                      onCreate={(data) => {
                        setStationName(data.stationName);
                        setRescueVehicleType(data.stationSupportedVehicleTypes.join(', '));
                        setSelectedDriverId(data.driverName); 
                        setDriverPhone(data.driverPhone);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
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
                    <Input value={rescueLicensePlate} onChange={setRescueLicensePlate} readOnly={!isEditing} />
                  </div>
                  <div>
                    <Label required>Tài xế thực hiện</Label>
                    <DriverSelect 
                      value={selectedDriverId}
                      onChange={(id, name, phone) => {
                        setSelectedDriverId(id);
                        if (phone) setDriverPhone(phone);
                      }}
                      disabled={!isEditing}
                      drivers={DRIVERS_MOCK}
                    />
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

                  <div className="min-w-0 max-w-xs">
                    <Label>Điểm xưởng</Label>
                    <div className="relative">
                      <select
                          value={workshopStation}
                          disabled={!isEditing}
                          onChange={(e) => setWorkshopStation(e.target.value)}
                          className={`w-full border rounded px-3 py-1.5 text-xs font-medium outline-none appearance-none pr-8 transition-all ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100' : 'bg-white focus:border-vetc-green hover:border-vetc-green cursor-pointer'}`}
                      >
                        <option value="">-- Chọn điểm xưởng --</option>
                        {WORKSHOP_STATIONS.map((ws) => (
                            <option key={ws} value={ws}>{ws}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="min-w-0 lg:col-span-2">
                    <Label required>Điểm kéo về (Destination)</Label>
                    <div className="flex gap-2">
                      <Input value={towingDestination} onChange={setTowingDestination} className="flex-1 min-w-0" readOnly={!isEditing} />
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
                </div>
              </div>
            </div>
          </div>

          {/* 3. Thông tin phí */}
          <div id="section-fees" className={`scroll-mt-40 ${isVisible('fees') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Thông tin phí" number={3} icon={<Banknote size={16} />} />
              <div className="p-5 space-y-6">
                {feeSnapshot && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs text-blue-900">
                    <div className="font-bold uppercase tracking-wide text-[10px] mb-1">Snapshot bảng phí</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        NCC: <span className="font-semibold">{feeSnapshot.supplierTableCode}</span> —{' '}
                        {feeSnapshot.supplierTableName} (v{feeSnapshot.supplierVersion})
                      </div>
                      <div>
                        KH:{' '}
                        <span className="font-semibold">
                          {feeSnapshot.customerFeeMode === 'RETAIL_MARKUP'
                            ? `Hệ số lẻ ×${feeSnapshot.retailMarkupFactor ?? getRetailMarkupFactor()}`
                            : `${feeSnapshot.customerTableCode ?? '—'} — ${feeSnapshot.customerTableName ?? ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Provider Payment Section */}
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                    <span className="w-1 h-3 bg-blue-500 mr-2 rounded-full"></span>
                    Trả cho NCC
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                    <div className="min-w-0">
                      <Label>Tổng thanh toán (Trước thuế)</Label>
                      <Input
                          value={Math.round(totalProviderPriceBeforeTax).toLocaleString('en-US')}
                          readOnly={!isEditing}
                          className="w-full font-bold text-gray-800 text-right bg-gray-50"
                      />
                    </div>

                    <div className="min-w-0">
                      <Label>Thuế VAT (%)</Label>
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

                    <div className="min-w-0">
                      <Label>Tổng thanh toán (Sau thuế)</Label>
                      <div className="flex gap-2">
                        <Input
                            value={displayProviderTotal.toLocaleString('en-US')}
                            onChange={handleProviderTotalChange}
                            readOnly={!isEditing}
                            className="flex-1 min-w-0 font-black text-red-600 text-right bg-red-50"
                        />
                        <button
                            type="button"
                            disabled={!isEditing}
                            onClick={handleRefreshProviderTotal}
                            title="Tính lại theo giá cố định × hệ số"
                            className={`shrink-0 bg-green-600 text-white px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm flex items-center justify-center transition-all hover:bg-green-700 active:scale-95 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="hidden lg:block" aria-hidden="true" />
                  </div>
                </div>

                {/* Customer Payment Section */}
                <div className="pt-4 border-t border-gray-100 space-y-6">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                    <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full"></span>
                    Khách hàng trả phí
                  </h3>

                  {/* Cá nhân */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-wider flex items-center">
                      <span className="w-1 h-2.5 bg-vetc-green mr-2 rounded-full"></span>
                      Cá nhân
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                      <div className="min-w-0">
                        <Label required>Chi phí tạm tính</Label>
                        <Input defaultValue="400,000" className="w-full font-black text-gray-800 text-right" readOnly={!isEditing} />
                      </div>
                      <div className="min-w-0">
                        <Label>Thuế VAT (%)</Label>
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
                      <div className="min-w-0">
                        <Label>Tổng thanh toán (Sau thuế)</Label>
                        <Input
                            value={
                              customerTotalOverride !== null
                                ? customerTotalOverride
                                : displayGrossCustomerTotal.toLocaleString('en-US')
                            }
                            onChange={handleCustomerTotalChange}
                            readOnly={!isEditing}
                            className={`w-full font-black text-red-600 text-right bg-red-50 ${customerTotalMismatch ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                        />
                        {customerTotalMismatch && isEditing && (
                          <p className="text-[9px] text-red-600 font-medium mt-1">
                            Tổng KH trả phí trong bảng ({grossCustomerTotal.toLocaleString('en-US')}) chưa khớp
                          </p>
                        )}
                      </div>
                      <div className="hidden lg:block" aria-hidden="true" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-gray-100">
                      <div className="min-w-0">
                        <Label>Tiền đã cọc</Label>
                        <div className="flex gap-2">
                          <Input
                              value={DEPOSIT_AMOUNT.toLocaleString('en-US')}
                              className="flex-1 min-w-0 text-right text-green-600 font-bold bg-gray-50"
                              readOnly
                          />
                          <button
                              title="Thanh toán tiền cọc"
                              disabled={isEditing}
                              className={`shrink-0 bg-green-600 text-white px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm flex items-center justify-center gap-1 transition-all hover:bg-green-700 active:scale-95 whitespace-nowrap ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => openPaymentModal('deposit')}
                          >
                            <CreditCard size={14} />
                            <span>Thanh toán</span>
                          </button>
                        </div>
                        {hasDeposited && isEditing && (
                          <p className="text-[9px] text-amber-600 font-medium mt-1">Đã cọc — không thể chỉnh sửa</p>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Label>Đã thanh toán</Label>
                        <Input
                            value={paidAmount.toLocaleString('en-US')}
                            className="w-full text-right text-blue-600 font-bold"
                            readOnly
                        />
                      </div>

                      <div className="min-w-0">
                        <Label>Còn lại</Label>
                        <div className="flex gap-2">
                          <Input
                              value={remainingAmount.toLocaleString('en-US')}
                              readOnly
                              className="flex-1 min-w-0 text-right font-black"
                          />
                          <button
                              title="Thanh toán phần còn lại"
                              disabled={isEditing}
                              className={`shrink-0 bg-green-600 text-white px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm flex items-center justify-center gap-1 transition-all hover:bg-green-700 active:scale-95 whitespace-nowrap ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => openPaymentModal('remaining')}
                          >
                            <CreditCard size={14} />
                            <span>Thanh toán</span>
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <Label>Tiền hoàn</Label>
                        <Input
                            value={refundAmount.toLocaleString('en-US')}
                            className="w-full text-right text-amber-600 font-bold bg-gray-50"
                            readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doanh nghiệp — hiện khi đã chọn DN ở section 1; chỉ Admin được sửa */}
                  {selectedEnterprise && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex items-center">
                        <span className="w-1 h-2.5 bg-blue-500 mr-2 rounded-full"></span>
                        Doanh nghiệp — {selectedEnterpriseLabel}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                        <div className="min-w-0">
                          <Label required>Chi phí tạm tính</Label>
                          <Input
                              value={
                                isGuaranteeActive
                                  ? Math.round(enterpriseBeforeTax).toLocaleString('en-US')
                                  : enterpriseEstimatedCost
                              }
                              onChange={handleEnterpriseEstimatedCostChange}
                              className="w-full font-black text-gray-800 text-right"
                              readOnly={!canEditEnterpriseFees || isGuaranteeActive}
                          />
                        </div>
                        <div className="min-w-0">
                          <Label>Thuế VAT (%)</Label>
                          <select
                              value={vat}
                              disabled={!canEditEnterpriseFees || isGuaranteeActive}
                              onChange={(e) => setVat(e.target.value)}
                              className={`w-full border rounded px-3 py-1.5 text-xs font-bold outline-none focus:border-vetc-green transition-all bg-white ${!canEditEnterpriseFees || isGuaranteeActive ? 'cursor-not-allowed opacity-60 bg-gray-50' : ''}`}
                          >
                            <option value="0">0%</option>
                            <option value="8">8%</option>
                            <option value="10">10%</option>
                          </select>
                        </div>
                        <div className="min-w-0">
                          <Label required>Tổng thanh toán (Sau thuế)</Label>
                          <Input
                              value={enterpriseAfterTax.toLocaleString('en-US')}
                              readOnly
                              className="w-full font-black text-red-600 text-right bg-red-50"
                          />
                        </div>
                        <div className="hidden lg:block" aria-hidden="true" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actual Services & Fees */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                    <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full"></span>
                    Dịch vụ thực tế & Chi phí
                  </h3>
                  <div className="space-y-3">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                        <tr className="bg-green-50/50 text-gray-600 border-b">
                          <th className="p-2 text-center border font-bold w-10">STT</th>
                          <th className="p-2 text-left border font-bold w-80">Tên dịch vụ</th>
                          <th className="p-2 text-right border font-bold w-60">KH trả phí</th>
                          <th className="p-2 text-right border font-bold w-60">Giá NCC</th>
                          <th className="p-2 text-right border font-bold w-40">Chênh lệch giá</th>
                          <th className="p-2 text-right border font-bold w-40">Giá cố định</th>
                          <th className="p-2 text-center border font-bold w-40">Hệ số điều chỉnh</th>
                          <th className="p-2 text-left border font-bold w-72">Loại điều chỉnh</th>
                          <th className="p-2 text-center border font-bold w-20">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {adjustmentRows.map((row, idx) => {
                          const isMax = parseFloat(row.coefficient) === maxCoefficient && maxCoefficient > 1;
                          return (
                              <tr key={row.id} className={`border-b hover:bg-gray-50 transition-colors`}>
                                <td className="p-2 border text-center font-medium">{idx + 1}</td>
                                <td className="p-2 border font-bold text-gray-800">
                                  {row.isCustom ? (
                                    <Input
                                      value={row.serviceName}
                                      onChange={(val) => handleAdjustmentChange(row.id, 'serviceName', val)}
                                      readOnly={!isEditing}
                                      className={`font-bold text-gray-800 ${!isEditing ? 'bg-gray-50' : ''}`}
                                    />
                                  ) : (
                                    row.serviceName
                                  )}
                                </td>
                                <td className="p-2 border text-right font-medium">
                                  {isEditing ? (
                                    <Input
                                      value={row.customerPaid}
                                      onChange={(val) => handleCustomerPaidChange(row.id, val)}
                                      readOnly={false}
                                      className="text-right font-bold text-blue-600"
                                    />
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="text-right font-bold text-blue-600">
                                        {row.customerPaid}
                                      </div>
                                      <div className="flex justify-end">
                                        <span className="text-[9px] font-semibold text-blue-700">
                                          {row.isCustomerFeeManual
                                            ? 'Thủ công'
                                            : row.customerSource || customerFeeSourceText}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 border text-right font-medium">
                                  {isEditing ? (
                                    <Input
                                      value={row.totalPrice}
                                      onChange={(val) => handleProviderPriceChange(row.id, val)}
                                      readOnly={adjustmentRows.length === 1}
                                      className={`text-right font-bold text-gray-800 ${adjustmentRows.length === 1 ? 'bg-gray-50' : ''}`}
                                    />
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="text-right font-bold text-gray-800">
                                        {row.totalPrice}
                                      </div>
                                      <div className="flex justify-end">
                                        <span className="text-[9px] font-semibold text-gray-700">
                                          {row.isSupplierFeeManual
                                            ? 'Thủ công'
                                            : row.supplierSource || supplierFeeSourceText}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 border text-right font-medium">
                                  <div className={`flex items-center justify-end space-x-1 font-bold ${
                                      row.discount.trim().startsWith('-')
                                          ? 'text-red-600'
                                          : parseFloat(row.discount.replace(/,/g, '')) > 0
                                              ? 'text-green-600'
                                              : 'text-gray-500'
                                  }`}>
                                    {row.discount.trim().startsWith('-') ? (
                                        <>
                                          <TrendingUp size={12} />
                                          <span>+{row.discount.replace('-', '').trim()}</span>
                                        </>
                                    ) : parseFloat(row.discount.replace(/,/g, '')) > 0 ? (
                                        <>
                                          <TrendingDown size={12} />
                                          <span>-{row.discount.trim()}</span>
                                        </>
                                    ) : (
                                        <span>0</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2 border text-right font-medium text-gray-700">
                                  {isEditing ? (
                                    <Input
                                      value={row.fixedPrice}
                                      onChange={(val) => handleAdjustmentChange(row.id, 'fixedPrice', val)}
                                      readOnly={false}
                                      className="text-right font-bold text-gray-700"
                                    />
                                  ) : (
                                    <div className="text-right font-bold text-gray-700">{row.fixedPrice}</div>
                                  )}
                                </td>
                                 <td className={`p-2 text-center border font-bold text-gray-700`}>
                                   {isEditing ? (
                                     <Input
                                       value={row.coefficient}
                                       onChange={(val) => handleAdjustmentChange(row.id, 'coefficient', val)}
                                       readOnly={false}
                                       className="text-center font-bold text-gray-700"
                                     />
                                   ) : (
                                     <div className="text-center font-bold text-gray-700">{row.coefficient}</div>
                                   )}
                                </td>
                                <td className="p-2 border">
                                  {isEditing ? (
                                    <AdjustmentTypeSelect
                                      value={row.adjustmentType}
                                      onChange={(val) => handleAdjustmentChange(row.id, 'adjustmentType', val)}
                                      disabled={false}
                                    />
                                  ) : (
                                    <div className="flex flex-wrap justify-start gap-1">
                                      {(row.adjustmentType || '')
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean)
                                        .map((opt) => (
                                          <span
                                            key={`${row.id}-${opt}`}
                                            className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-100"
                                          >
                                            {opt}
                                          </span>
                                        ))}
                                    </div>
                                  )}
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
                        <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                          <td className="p-2 border text-center" colSpan={2}>
                            <span className="text-[10px] uppercase tracking-wider text-gray-600">Tổng cộng</span>
                          </td>
                          <td className="p-2 border text-right text-blue-600">
                            {tableTotals.customerPaid.toLocaleString('en-US')}
                          </td>
                          <td className="p-2 border text-right text-gray-800">
                            {tableTotals.totalPrice.toLocaleString('en-US')}
                          </td>
                          <td className={`p-2 border text-right ${
                            tableTotals.discount > 0
                              ? 'text-green-600'
                              : tableTotals.discount < 0
                                ? 'text-red-600'
                                : 'text-gray-500'
                          }`}>
                            {tableTotals.discount === 0
                              ? '0'
                              : tableTotals.discount > 0
                                ? `-${Math.abs(tableTotals.discount).toLocaleString('en-US')}`
                                : `+${Math.abs(tableTotals.discount).toLocaleString('en-US')}`}
                          </td>
                          <td className="p-2 border" colSpan={4} />
                        </tr>
                        </tfoot>
                      </table>
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

                {/* Advance Payment */}
                <div className="pt-4 border-t border-gray-100">
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

          {/* 4. Quá trình cứu hộ */}
          <div id="section-process" className={`scroll-mt-40 ${isVisible('process') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Quá trình cứu hộ" number={4} icon={<Activity size={18} />} />
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

                  <div className="absolute top-4 right-4">
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
                    {!isOrderCancelled && (
                    <button 
                      onClick={() => setIsStatusUpdateModalOpen(true)}
                      className="w-full bg-vetc-green text-white py-2.5 rounded-xl font-bold text-xs shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <Pencil size={14} />
                      <span>Cập nhật trạng thái thủ công</span>
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Hình ảnh sự cố & Quá trình thực hiện */}
          <div id="section-images" className={`scroll-mt-40 ${isVisible('images') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Hình ảnh sự cố & Quá trình thực hiện" number={5} icon={<Camera size={18} />} />
              <div className="p-6">
                <ImageUploadSection readOnly={!isEditing} />
              </div>
            </div>
          </div>

          {/* 6. Camera xe cứu hộ (VnetGPS) */}
          <div id="section-camera" className={`scroll-mt-40 ${isVisible('camera') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
              <SectionHeader title="Camera xe cứu hộ" number={6} icon={<Video size={18} />} />
              <div className="p-6">
                <RescueVehicleCameraSection readOnly={!isEditing} />
              </div>
            </div>
          </div>

          {/* 7. Thông tin giám sát, thực thi */}
          <div id="section-monitoring" className={`scroll-mt-40 ${isVisible('monitoring') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden text-left">
              <SectionHeader title="Thông tin giám sát, thực thi" number={7} icon={<ShieldCheck size={18} />} />
              <div className="p-5 space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">
                    Demo các trường hợp đánh giá
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {RATING_DEMO_CASES.map((item) => (
                      <div key={item.type} className="flex items-start space-x-2 text-[10px] text-blue-900">
                        <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>
                          <strong className="font-bold">{RATING_TYPE_LABELS[item.type]}:</strong>{' '}
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Cột trái: Đánh giá từ Khách hàng */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Đánh giá từ Khách hàng</span>
                    </div>
                    {RATING_CARD_CONFIG.filter((c) => c.type.startsWith('customer_')).map((config) => (
                      <DetailedRatingCard
                        key={config.type}
                        title={RATING_TYPE_LABELS[config.type]}
                        versions={ratingHistories[config.type]}
                        categories={config.categories}
                        feedback={config.feedback}
                        isExpanded={expandedRatings[config.type]}
                        onToggle={() => setExpandedRatings((prev) => ({ ...prev, [config.type]: !prev[config.type] }))}
                        onSaveVersion={(data) => handleSaveRatingVersion(config.type, data)}
                        onViewHistory={() => setRatingHistoryModal({ isOpen: true, type: config.type })}
                      />
                    ))}
                  </div>

                  {/* Cột phải: Đánh giá nội bộ */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Đánh giá nội bộ</span>
                    </div>
                    {RATING_CARD_CONFIG.filter((c) => !c.type.startsWith('customer_')).map((config) => (
                      <DetailedRatingCard
                        key={config.type}
                        title={RATING_TYPE_LABELS[config.type]}
                        versions={ratingHistories[config.type]}
                        categories={config.categories}
                        feedback={config.feedback}
                        isExpanded={expandedRatings[config.type]}
                        onToggle={() => setExpandedRatings((prev) => ({ ...prev, [config.type]: !prev[config.type] }))}
                        onSaveVersion={(data) => handleSaveRatingVersion(config.type, data)}
                        onViewHistory={() => setRatingHistoryModal({ isOpen: true, type: config.type })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Thông tin hóa đơn */}
          <div id="section-invoice" className={`scroll-mt-40 ${isVisible('invoice') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden text-left">
              <SectionHeader title="Thông tin hóa đơn" number={8} icon={<FileText size={18} />} />
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  <div>
                    <Label required>Phân loại khách hàng</Label>
                    <select
                        disabled={!isEditing}
                        value={customerType}
                        onChange={(e) => setCustomerType(e.target.value)}
                        className={`w-full border rounded px-3 py-1.5 text-xs bg-white outline-none focus:border-vetc-green font-bold text-gray-800 ${!isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                    >
                      <option>Cá nhân</option>
                      <option>Doanh nghiệp</option>
                    </select>
                  </div>
                  <div className={customerType === 'Cá nhân' ? 'opacity-50' : ''}>
                    <Label required={customerType === 'Doanh nghiệp'}>Tên doanh nghiệp / Công ty</Label>
                    <div className="relative">
                      <Building2 size={12} className="absolute left-3 top-2 text-gray-400" />
                      <Input
                          placeholder="Nhập tên đầy đủ của công ty..."
                          className="pl-8"
                          readOnly={!isEditing || customerType === 'Cá nhân'}
                      />
                    </div>
                  </div>
                  <div className={customerType === 'Cá nhân' ? 'opacity-50' : ''}>
                    <Label required={customerType === 'Doanh nghiệp'}>Mã số thuế</Label>
                    <Input
                        placeholder="Nhập MST..."
                        readOnly={!isEditing || customerType === 'Cá nhân'}
                    />
                  </div>
                  <div>
                    <Label>Email nhận hóa đơn</Label>
                    <div className="relative">
                      <Mail size={12} className="absolute left-3 top-2 text-gray-400" />
                      <Input placeholder="email@company.com" className="pl-8" readOnly={!isEditing} />
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <Label>Căn cước công dân</Label>
                    <Input placeholder="Nhập thông tin căn cước công dân" readOnly={!isEditing} />
                  </div>
                  <div className="lg:col-span-3">
                    <Label>Địa chỉ xuất hóa đơn</Label>
                    <Input placeholder="Nhập địa chỉ chính xác trên giấy phép kinh doanh..." readOnly={!isEditing} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg gap-4 text-left">
                  <div className="flex items-start space-x-3 text-left">
                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-blue-800 leading-relaxed font-medium">
                      Hóa đơn điện tử sẽ được gửi tự động qua email sau khi đơn hàng được xác nhận thanh toán thành công và hoàn tất cứu hộ.
                      <br />Vui lòng kiểm tra kỹ thông tin pháp nhân trước khi lưu.
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <button
                          onClick={() => setIsInvoicePreviewOpen(true)}
                          className="flex items-center space-x-2 border-2 border-blue-600 text-blue-600 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap"
                      >
                        <Eye size={16} />
                        <span>Xem trước hóa đơn</span>
                      </button>
                      <button 
                        onClick={handleExportInvoice}
                        disabled={isExportingInvoice}
                        className={`flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 whitespace-nowrap ${isExportingInvoice ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isExportingInvoice ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                        <span>{isExportingInvoice ? 'Đang tạo...' : 'Xuất hóa đơn'}</span>
                      </button>
                    </div>

                    {invoiceDownloadUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 text-green-700">
                          <Check size={16} />
                          <span className="text-xs font-bold">Hóa đơn đã được tạo thành công!</span>
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

          {/* 8. Đề nghị thanh toán */}
          <div id="section-payment-request" className={`scroll-mt-40 ${isVisible('payment-request') ? 'block' : 'hidden'}`}>
            <div className="border rounded-lg shadow-sm bg-white overflow-hidden text-left">
              <SectionHeader title="Đề nghị thanh toán" number={9} icon={<CreditCard size={18} />} />
              <div className="p-5">
                <PaymentRequestSection disabled={currentStatus !== 'FINISH-COMPLETED'} />
              </div>
            </div>
          </div>
        </div>

        <UsageHistoryModal
            isOpen={isPackageModalOpen}
            onClose={() => setIsPackageModalOpen(false)}
            currentPackage={selectedPackage}
            customerPlate={mockFormData.customer.plate}
            orders={packageOrders}
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
                    {AVAILABLE_SERVICES.map((serviceName) => (
                        <button
                            key={serviceName}
                            onClick={() => handleSelectServiceFromModal(serviceName)}
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
                  {isOtherServiceFormOpen && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide">Dịch vụ khác</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label required>Loại phí phát sinh</Label>
                          <select
                            value={otherServiceKey}
                            onChange={(e) => {
                              const selectedKey = e.target.value;
                              setOtherServiceKey(selectedKey);
                              const selectedOption = OTHER_SERVICE_OPTIONS.find((opt) => opt.value === selectedKey);
                              if (selectedOption) {
                                setOtherServicePrice(selectedOption.suggestedPrice.toLocaleString('en-US'));
                              } else {
                                setOtherServicePrice('');
                              }
                            }}
                            className="w-full border rounded px-3 py-1.5 text-xs outline-none focus:border-vetc-green bg-white"
                          >
                            <option value="">-- Chọn loại phí --</option>
                            {OTHER_SERVICE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label} ({opt.suggestedPrice.toLocaleString('en-US')})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label required>Giá NCC</Label>
                          <Input
                            value={otherServicePrice}
                            onChange={(val) => setOtherServicePrice(formatMoneyInput(val))}
                            placeholder="Nhập số tiền"
                            className="text-right"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveOtherService}
                          disabled={!otherServiceKey || parseMoney(otherServicePrice) <= 0}
                          className="px-4 py-2 rounded-lg bg-vetc-green text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                        >
                          Lưu dịch vụ
                        </button>
                      </div>
                    </div>
                  )}
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

        <CustomerPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            paymentType={activePaymentType}
            amount={activePaymentType === 'deposit' ? DEPOSIT_AMOUNT.toLocaleString('en-US') : remainingAmount.toLocaleString('en-US')}
            session={activePaymentType === 'deposit' ? depositPaymentSession : remainingPaymentSession}
            onSessionChange={activePaymentType === 'deposit' ? setDepositPaymentSession : setRemainingPaymentSession}
            allowCashPayment={role === 'ADMIN'}
        />

        <UnpaidDepositRemainingWarningModal
            isOpen={isUnpaidDepositWarningOpen}
            onClose={() => setIsUnpaidDepositWarningOpen(false)}
            onConfirm={handleConfirmUnpaidDepositRemaining}
            depositAmount={DEPOSIT_AMOUNT}
            totalAmount={individualCustomerPrice}
            remainingAmount={remainingAmount}
        />

        <CustomerFeeChangeWarningModal
            isOpen={isFeeWarningOpen}
            onClose={handleCancelFeeChange}
            onConfirm={handleConfirmFeeChange}
            type={pendingFeeChange?.type ?? 'increase'}
            oldTotal={pendingFeeChange?.oldTotal ?? 0}
            newTotal={pendingFeeChange?.newTotal ?? 0}
            excessRefund={pendingFeeChange?.type === 'decrease' ? Math.max(0, DEPOSIT_AMOUNT - (pendingFeeChange?.newTotal ?? 0)) : 0}
            additionalAmount={pendingFeeChange?.type === 'increase' ? (pendingFeeChange?.newTotal ?? 0) - (pendingFeeChange?.oldTotal ?? 0) : 0}
        />

        <GuaranteeRateChangeWarningModal
            isOpen={isGuaranteeRateWarningOpen}
            onClose={handleCancelGuaranteeRateChange}
            onConfirm={handleConfirmGuaranteeRateChange}
            oldRate={guaranteeRate}
            newRate={pendingGuaranteeRate}
            enterpriseLabel={selectedEnterpriseLabel}
        />

        {/* Cancellation Dialog */}
        <CancellationDialog
            isOpen={isCancelModalOpen || isEditCancelReasonModalOpen}
            onClose={handleCloseCancelDialog}
            onConfirm={isEditCancelReasonModalOpen ? handleConfirmEditCancelReason : handleConfirmCancel}
            selectedReason={selectedCancelReason}
            setSelectedReason={setSelectedCancelReason}
            otherReason={cancelReason}
            setOtherReason={setCancelReason}
            cancelReasons={CANCEL_REASONS}
            variant={isEditCancelReasonModalOpen ? 'editReason' : 'cancel'}
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

        <RatingHistoryModal
          isOpen={ratingHistoryModal.isOpen}
          onClose={() => setRatingHistoryModal({ isOpen: false, type: null })}
          title={ratingHistoryModal.type ? RATING_TYPE_LABELS[ratingHistoryModal.type] : ''}
          orderCode={displayOrderId}
          versions={ratingHistoryModal.type ? ratingHistories[ratingHistoryModal.type] : []}
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

        <ShareLocationWebviewModal
          isOpen={isShareLocationWebviewOpen}
          onClose={() => setIsShareLocationWebviewOpen(false)}
          data={{
            orderId: mockFormData.orderId ?? displayOrderId,
            plate: mockFormData.customer.plate,
            orderTypeLabel: selectedPackage === 'Không có' ? 'Đơn lẻ' : 'Đơn gói',
            customerName: mockFormData.assistance.rescueName,
            customerPhone: mockFormData.assistance.rescuePhone,
            rescueAddress: mapAddress,
            towingDestination,
            rescueLat: rescueCoords.lat,
            rescueLng: rescueCoords.lng,
            towingLat: towCoords.lat,
            towingLng: towCoords.lng,
            currentStatus,
            services: selectedServices,
            createdAt: '15:26 - 03/07/2026',
            customerRatings: {
              customer_vetc: ratingHistories.customer_vetc,
              customer_driver: ratingHistories.customer_driver,
              customer_workshop: ratingHistories.customer_workshop,
            },
          }}
        />

        {/* Distance Warning Modal */}
        {isDistanceWarningOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsDistanceWarningOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertCircle size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Cảnh báo vượt phạm vi gói</h3>
                  <p className="text-white/80 text-[11px]">Khoảng cách ước tính vượt giới hạn</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Gói dịch vụ hiện tại</span>
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">{selectedPackage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Phạm vi gói</span>
                    <span className="text-xs font-bold text-gray-700">100 KM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Khoảng cách ước tính</span>
                    <span className="text-xs font-bold text-orange-600">{estimatedDistance} KM</span>
                  </div>
                  <div className="border-t border-orange-200 pt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">Phần vượt gói</span>
                    <span className="text-sm font-black text-red-600">{(parseFloat(estimatedDistance) - 100).toFixed(1)} KM</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Khoảng cách ước tính <strong>{estimatedDistance} KM</strong> vượt quá phạm vi <strong>100 KM</strong> trong gói <strong>{selectedPackage}</strong>. 
                    Phần khoảng cách vượt <strong>{(parseFloat(estimatedDistance) - 100).toFixed(1)} KM</strong> sẽ <strong className="text-red-600">phát sinh chi phí ngoài gói</strong> và được tính theo đơn giá chuẩn.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsDistanceWarningOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Đã hiểu
                  </button>
                  <button
                    onClick={() => {
                      setEstimatedDistance('100');
                      setIsDistanceWarningOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    Đặt lại 100 KM
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  );
};

export default GuestOrderDetails;
