import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  Calendar,
  Check,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileText,
  History,
  Link2,
  QrCode,
  RefreshCw,
  Save,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ADVANCE_PURPOSE_LABEL,
  getPaymentRequestDetail,
  ORDER_TYPE_CONFIG,
  PAYMENT_REQUEST_STATUS_CONFIG,
  type PaymentRequestStatus,
} from '../data/paymentRequestMockData';
import { ADVANCE_BANKS, ADVANCE_USERS, lockAdvanceRequests } from '../data/advanceRequestStore';
import AppSelect from '../shared/AppSelect';
import PaymentQrModal from '../shared/PaymentQrModal';

const Label = ({ children, required = false }: { children?: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FIELD_GRID_CLASS = 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4';

const colSpanClass = (colSpan: 1 | 2 | 3 | 4 = 1) =>
  colSpan === 2
    ? 'lg:col-span-2'
    : colSpan === 3
      ? 'lg:col-span-3'
      : colSpan === 4
        ? 'lg:col-span-4'
        : '';

const ReadOnlyField: React.FC<{ label: string; value: string; colSpan?: 1 | 2 | 3 | 4 }> = ({
  label,
  value,
  colSpan = 1,
}) => (
  <div className={`min-w-0 ${colSpanClass(colSpan)}`}>
    <Label>{label}</Label>
    <div className="w-full border rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-700 min-h-[34px]">
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

const EmptyFileNote = () => <p className="mt-2 text-xs text-gray-400">Không có file</p>;

const CopyValue: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
    >
      <Copy size={12} />
      {copied ? 'Đã sao chép' : 'Copy'}
    </button>
  );
};

const FormField: React.FC<{
  label: string;
  required?: boolean;
  colSpan?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}> = ({ label, required, colSpan = 1, children }) => (
  <div className={`min-w-0 ${colSpanClass(colSpan)}`}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

type UploadedFileKind = 'image' | 'pdf' | 'other' | 'link';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: string;
  kind: UploadedFileKind;
}

const FILE_ACCEPT = 'image/*,.pdf,.xls,.xlsx,.doc,.docx,.csv';

const getFileKind = (file: File): UploadedFileKind => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'other';
};

const formatFileSize = (bytes: number): string =>
  bytes > 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const UploadedFileCard: React.FC<{
  file: UploadedFile;
  onOpen: (file: UploadedFile) => void;
  onRemove: (id: string) => void;
}> = ({ file, onOpen, onRemove }) => {
  const isLink = file.kind === 'link';
  return (
    <div
      onClick={() => onOpen(file)}
      title={file.name}
      className="flex items-center gap-2.5 p-2 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer group/file"
    >
      {isLink ? (
        <div className="w-9 h-9 rounded-md border border-sky-100 bg-sky-50 flex items-center justify-center shrink-0">
          <Link2 size={16} className="text-sky-600" />
        </div>
      ) : file.kind === 'image' ? (
        <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-200 shrink-0">
          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${
            file.kind === 'pdf' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
          }`}
        >
          <FileText size={16} className={file.kind === 'pdf' ? 'text-red-500' : 'text-blue-500'} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-800 truncate">{file.name}</p>
        {isLink ? (
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={file.url}
            className="block text-[9px] text-sky-600 font-medium truncate hover:underline"
          >
            {file.url}
          </a>
        ) : (
          <p className="text-[9px] text-gray-400 font-medium">{file.size}</p>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {isLink ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(file);
            }}
            title="Xem link"
            className="p-1.5 rounded-md hover:bg-blue-100 text-blue-500 transition-colors"
          >
            <Eye size={14} />
          </button>
        ) : (
          <>
            <a
              href={file.url}
              download={file.name}
              onClick={(e) => e.stopPropagation()}
              title="Tải xuống"
              className="p-1.5 rounded-md hover:bg-green-100 text-green-500 transition-colors"
            >
              <Download size={14} />
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              title="Xóa"
              className="p-1.5 rounded-md hover:bg-red-100 text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const UploadedFileList: React.FC<{
  files: UploadedFile[];
  onOpen: (file: UploadedFile) => void;
  onRemove: (id: string) => void;
}> = ({ files, onOpen, onRemove }) => {
  if (files.length === 0) return null;
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {files.map((file) => (
        <UploadedFileCard key={file.id} file={file} onOpen={onOpen} onRemove={onRemove} />
      ))}
    </div>
  );
};

const CUSTOMER_SOURCE_STYLES: Record<string, string> = {
  API: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Portal: 'bg-slate-50 text-slate-700 border-slate-200',
  App: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const CustomerSourceBadge: React.FC<{ source: string }> = ({ source }) => {
  if (!source) return null;
  const className = CUSTOMER_SOURCE_STYLES[source] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span
      title="Nguồn khách hàng"
      className={`inline-flex items-center shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${className}`}
    >
      {source}
    </span>
  );
};

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="bg-vetc-green text-white px-4 py-2 flex items-center justify-between gap-3">
    <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
    {action}
  </div>
);

const OrderInfoGroup: React.FC<{
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, trailing, children }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
        <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full" />
        {title}
      </h3>
      {trailing}
    </div>
    <div className={FIELD_GRID_CLASS}>{children}</div>
  </div>
);

const formatCurrency = (value: number): string =>
  value.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface SavedAccount {
  id: string;
  ownerName: string;
  bank: string;
  account: string;
  accountName: string;
}

const SAVED_ACCOUNTS: SavedAccount[] = [
  { id: 'acc-an', ownerName: 'Nguyễn Văn An', bank: 'MB Bank', account: '9988776655', accountName: 'NGUYEN VAN AN' },
  { id: 'acc-binh', ownerName: 'Trần Thị Bình', bank: 'Vietcombank', account: '0123456789', accountName: 'TRAN THI BINH' },
  { id: 'acc-nam', ownerName: 'Lê Hoàng Nam', bank: 'Techcombank', account: '190345678901', accountName: 'LE HOANG NAM' },
];

const accountLabel = (account: SavedAccount) =>
  `${account.bank} · ${account.account} · ${account.accountName}`;

interface Payee {
  id: string;
  personName: string;
  accountId: string;
  account: string;
  accountName: string;
  bank: string;
  amount: string;
}

const PaymentRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewOnly =
    Boolean((location.state as { viewOnly?: boolean } | null)?.viewOnly) ||
    new URLSearchParams(location.search).get('view') === '1';
  const { orderId } = useParams<{ orderId: string }>();
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);
  const customerFileRef = useRef<HTMLInputElement>(null);
  const customerTransferRef = useRef<HTMLInputElement>(null);
  const advancerFileRef = useRef<HTMLInputElement>(null);

  const detail = useMemo(() => {
    if (!orderId) return undefined;
    return getPaymentRequestDetail(orderId);
  }, [orderId]);

  const [paymentDeadline, setPaymentDeadline] = useState(detail?.paymentDeadline ?? '');
  const [invoiceLink, setInvoiceLink] = useState(detail?.invoiceLink ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(detail?.invoiceNumber ?? '');
  const [contractNumber, setContractNumber] = useState(detail?.contractNumber ?? '');
  const [note, setNote] = useState(detail?.note ?? '');
  const [customerAccount, setCustomerAccount] = useState('');
  const [customerAccountName, setCustomerAccountName] = useState('');
  const [customerBankName, setCustomerBankName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(SAVED_ACCOUNTS);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [editingPayeeId, setEditingPayeeId] = useState<string | null>(null);
  const [adjustingPayeeId, setAdjustingPayeeId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [qrPayee, setQrPayee] = useState<Payee | null>(null);
  const [syncNote, setSyncNote] = useState('');
  const [activeSection, setActiveSection] = useState('section-order');
  const [customerPayFiles, setCustomerPayFiles] = useState<UploadedFile[]>([]);
  const [customerTransferImages, setCustomerTransferImages] = useState<UploadedFile[]>([]);
  const [advancerPayFiles, setAdvancerPayFiles] = useState<UploadedFile[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<PaymentRequestStatus>(detail?.status ?? 'draft');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [invoiceFiles, setInvoiceFiles] = useState<UploadedFile[]>([
    {
      id: 'invoice-link',
      name: 'Link tra cứu hóa đơn',
      url: 'https://hoadon.example.com/tra-cuu/HD-042026',
      size: '',
      kind: 'link',
    },
  ]);
  const [otherFiles, setOtherFiles] = useState<UploadedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<{
    name: string;
    url: string;
    kind: 'image' | 'link';
  } | null>(null);

  useEffect(() => {
    if (!detail || detail.advancerPayable <= 0) {
      setPayees([]);
      setEditingPayeeId(null);
      return;
    }
    const id = `${detail.orderId}-payee-1`;
    const personName = detail.advances[0]?.advancerName ?? '';
    const saved = SAVED_ACCOUNTS.find((item) => item.ownerName === personName) ?? SAVED_ACCOUNTS[0];
    setPayees([
      {
        id,
        personName,
        accountId: saved?.id ?? '',
        account: saved?.account ?? '',
        accountName: saved?.accountName ?? '',
        bank: saved?.bank ?? '',
        amount: formatCurrency(detail.advancerPayable),
      },
    ]);
    setEditingPayeeId(id);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    setStatus(detail.status);
    setSubmitted(false);
    setRejectOpen(false);
    setRejectReason('');
    setRejectError('');
    setDraftNote('');
  }, [detail]);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 font-bold">Không tìm thấy đơn hàng</p>
        <button
          type="button"
          onClick={() => navigate('/payment-request-management')}
          className="mt-4 flex items-center gap-2 text-vetc-green font-bold text-sm hover:underline"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const inputClass = `w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400 ${viewOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`;

  const handleFilesSelected = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    const selected = e.target.files;
    if (!selected) return;
    const mapped: UploadedFile[] = Array.from(selected).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: formatFileSize(file.size),
      kind: getFileKind(file),
    }));
    setter((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const handleRemoveFile = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    setter((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target && target.kind !== 'link') URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const openFile = (file: UploadedFile) => {
    if (file.kind === 'image') {
      setPreviewImage({ name: file.name, url: file.url, kind: 'image' });
    } else if (file.kind === 'link') {
      setPreviewImage({ name: file.name, url: file.url, kind: 'link' });
    } else {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  const allEvidencePhotos = [
    ...detail.evidencePhotos.scene,
    ...detail.evidencePhotos.process,
    ...detail.evidencePhotos.result,
  ];

  const handleDownloadAllPhotos = () => {
    allEvidencePhotos.forEach((src, idx) => {
      const link = document.createElement('a');
      link.href = src;
      link.download = `anh-cuu-ho-${detail.orderId}-${idx + 1}.jpg`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const payeeOptions = Array.from(
    new Set([...detail.advances.map((line) => line.advancerName), ...ADVANCE_USERS.map((user) => user.name)])
  ).map((name) => ({ value: name, label: name }));

  const updatePayee = (id: string, patch: Partial<Payee>) => {
    setPayees((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addPayee = () => {
    const id = `${detail.orderId}-payee-${Date.now()}`;
    setPayees((current) => [
      ...current,
      { id, personName: '', accountId: '', account: '', accountName: '', bank: '', amount: '' },
    ]);
    setEditingPayeeId(id);
  };

  const removePayee = (id: string) => {
    setPayees((current) => current.filter((item) => item.id !== id));
    setEditingPayeeId((current) => (current === id ? null : current));
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const paymentHistory = [
    detail.customerDeposit > 0
      ? {
          time: '20/11/2026 09:15',
          type: 'Thu cọc',
          method: 'QR',
          amount: detail.customerDeposit,
          state: 'Thành công',
          code: `QR-${detail.orderId.slice(-4)}`,
        }
      : null,
    detail.advancedRefund > 0
      ? {
          time: '22/11/2026 14:20',
          type: 'Tạm ứng hoàn khách',
          method: 'Chuyển khoản',
          amount: detail.advancedRefund,
          state: 'Thành công',
          code: 'UNC-HOAN',
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const handleSubmit = () => {
    if (detail.hasPendingAdvance) {
      setSubmitError('Còn yêu cầu tạm ứng đang chờ xử lý.');
      return;
    }
    if (
      detail.customerPayable > 0 &&
      (!customerAccount.trim() || !customerAccountName.trim() || !customerBankName.trim())
    ) {
      setSubmitError('Nhập đủ số tài khoản, tên tài khoản và ngân hàng của khách hàng.');
      return;
    }
    if (detail.advancerPayable > 0) {
      if (payees.length === 0) {
        setSubmitError('Thêm ít nhất một đối tượng thụ hưởng.');
        return;
      }
      const missingBank = payees.some(
        (payee) => !payee.personName.trim() || !payee.accountId || !payee.amount.trim()
      );
      if (missingBank) {
        setSubmitError('Chọn đối tượng, tài khoản thụ hưởng và nhập số tiền.');
        return;
      }
    }
    setSubmitError('');
    lockAdvanceRequests(detail.orderId);
    setSubmitted(true);
    setStatus('pending_approval');
  };

  const handleSaveDraft = () => {
    setSubmitError('');
    setStatus('draft');
    setDraftNote('Đã lưu nháp.');
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Nhập lý do từ chối.');
      return;
    }
    setRejectError('');
    setRejectOpen(false);
    setStatus('rejected');
  };

  const statusConfig = PAYMENT_REQUEST_STATUS_CONFIG[status];
  const sectionTabs = [
    { id: 'section-order', label: 'Thông tin đơn hàng' },
    { id: 'section-supplier', label: 'Nhà cung cấp' },
    detail.customerPayable > 0 || (detail.refundAmount > 0 && detail.customerPayable === 0)
      ? { id: 'section-customer', label: 'Khách hàng' }
      : null,
    detail.advancerPayable > 0 ? { id: 'section-advancer', label: 'Người tạm ứng' } : null,
  ].filter((item): item is { id: string; label: string } => item !== null);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="order-0 sticky top-0 z-20 flex flex-col bg-white/95 backdrop-blur-md border rounded-xl shadow-md border-l-4 border-l-vetc-green text-left">
        <div className="flex items-center justify-between p-4 gap-3 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Mã đơn hàng</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-900 tracking-tight">{detail.orderId}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tight ${ORDER_TYPE_CONFIG[detail.orderType].className}`}>
                  {ORDER_TYPE_CONFIG[detail.orderType].label}
                </span>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-100 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Trạng thái đề nghị</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold border w-fit ${statusConfig.className}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                {statusConfig.label}
              </span>
            </div>
            <div className="h-10 w-px bg-gray-100 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Điều phối viên</span>
              <span className="text-sm font-black text-gray-900">Nguyễn Thị Lan</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/payment-request-management')}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50"
            >
              <ArrowLeft size={14} />
              Quay lại
            </button>
            {!viewOnly && (
            <button
              type="button"
              onClick={() => {
                const owner = detail.customer.trim().toUpperCase();
                setCustomerAccount('1903654789012');
                setCustomerAccountName(owner);
                setCustomerBankName('Vietcombank');
                setPaymentDeadline(detail.paymentDeadline);
                setInvoiceLink(detail.invoiceLink);
                setInvoiceNumber(detail.invoiceNumber);
                setContractNumber(detail.contractNumber);
                setNote(detail.note);
                const personName = detail.advances[0]?.advancerName ?? '';
                const saved = savedAccounts.find((item) => item.ownerName === personName);
                if (detail.advancerPayable > 0) {
                  setPayees([
                    {
                      id: `${detail.orderId}-payee-sync`,
                      personName,
                      accountId: saved?.id ?? '',
                      account: saved?.account ?? '',
                      accountName: saved?.accountName ?? '',
                      bank: saved?.bank ?? '',
                      amount: formatCurrency(detail.advancerPayable),
                    },
                  ]);
                  setEditingPayeeId(`${detail.orderId}-payee-sync`);
                }
                setSyncNote('Đã lấy thông tin từ đơn hàng.');
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50"
            >
              <RefreshCw size={14} />
              Sync
            </button>
            )}
            {!viewOnly && (status === 'not_created' || status === 'draft') && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50"
            >
              <Save size={14} />
              Lưu nháp
            </button>
            )}
            {status === 'draft' && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={detail.hasPendingAdvance}
              className="flex items-center gap-2 px-4 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard size={14} />
              Gửi phê duyệt
            </button>
            )}
            {status === 'pending_approval' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRejectReason('');
                    setRejectError('');
                    setRejectOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
                >
                  <Ban size={14} />
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('awaiting_payment')}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700"
                >
                  <Check size={14} />
                  Chờ thanh toán
                </button>
              </>
            )}
            {status === 'awaiting_payment' && (
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className="flex items-center gap-2 px-4 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700"
              >
                <Check size={14} />
                Đã thanh toán
              </button>
            )}
          </div>
        </div>
        {syncNote && <p className="px-4 pb-3 -mt-1 text-[11px] font-medium text-blue-600">{syncNote}</p>}
        {draftNote && <p className="px-4 pb-3 -mt-1 text-[11px] font-medium text-gray-600">{draftNote}</p>}
        {status === 'rejected' && rejectReason && (
          <p className="px-4 pb-3 text-[11px] font-medium text-red-600">Lý do từ chối: {rejectReason}</p>
        )}
        <div className="flex items-center px-4 border-t bg-gray-50/50 overflow-x-auto">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-vetc-green text-vetc-green bg-green-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div id="section-order" className="order-1 scroll-mt-36 border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Thông tin đơn hàng" />
        <div className="p-4 space-y-6">
          <OrderInfoGroup
            title="Đơn hàng & dịch vụ"
            trailing={
              <div className="flex items-center gap-2 shrink-0">
                <span
                  title="Loại đơn"
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${ORDER_TYPE_CONFIG[detail.orderType].className}`}
                >
                  {ORDER_TYPE_CONFIG[detail.orderType].label}
                </span>
                <CustomerSourceBadge source={detail.customerSource} />
              </div>
            }
          >
            <ReadOnlyField label="Mã đơn hàng" value={detail.orderId} />
            <ReadOnlyField label="Mã gói" value={detail.packageCode} />
            <ReadOnlyField label="Dịch vụ" value={detail.service} colSpan={2} />
          </OrderInfoGroup>

          <OrderInfoGroup title="Khách hàng & phương tiện">
            <ReadOnlyField label="Khách hàng" value={detail.customer} />
            <ReadOnlyField label="Số điện thoại" value={detail.customerPhone} />
            <ReadOnlyField label="Biển số xe" value={detail.plate} colSpan={2} />
            <ReadOnlyField label="Loại KH" value={detail.customerType} />
            <ReadOnlyField
              label="Tên khách hàng doanh nghiệp"
              value={detail.enterpriseCustomerName}
              colSpan={3}
            />
          </OrderInfoGroup>

          <OrderInfoGroup title="Địa điểm cứu hộ">
            <ReadOnlyField label="Địa chỉ cứu hộ" value={detail.rescueAddress} colSpan={4} />
            <ReadOnlyField label="Điểm kéo xe về" value={detail.towingDestination} colSpan={3} />
            <ReadOnlyField label="Số km cứu hộ" value={`${detail.rescueDistanceKm} km`} />
          </OrderInfoGroup>

          <OrderInfoGroup title="Chi phí">
            <ReadOnlyField label="Chi phí nhà cung cấp" value={formatCurrency(detail.orderCost)} />
            <ReadOnlyField label="Đã ứng trả NCC" value={formatCurrency(detail.advancedSupplier)} />
            <ReadOnlyField label="Số tiền chi NCC" value={formatCurrency(detail.nccPayable)} />
            <ReadOnlyField label="Tiền hoàn" value={formatCurrency(detail.refundAmount)} />
            <ReadOnlyField label="Đã ứng hoàn" value={formatCurrency(detail.advancedRefund)} />
            <ReadOnlyField label="Số tiền trả khách" value={formatCurrency(detail.customerPayable)} />
            <ReadOnlyField
              label="Tổng tiền phải thu của KH"
              value={formatCurrency(detail.totalCustomerReceivable)}
            />
            <ReadOnlyField label="Tiền KH đã cọc" value={formatCurrency(detail.customerDeposit)} />
          </OrderInfoGroup>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full" />
                Hình ảnh
              </h3>
              <button
                type="button"
                onClick={handleDownloadAllPhotos}
                disabled={allEvidencePhotos.length === 0}
                className="flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1 text-[11px] font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download size={13} />
                Tải toàn bộ ảnh ({allEvidencePhotos.length})
              </button>
            </div>
            <EvidencePhotoGroup
              title="Ảnh hiện trường"
              hint="(Ảnh BSX, hiện trạng xe trước khi xử lý theo từng dịch vụ)"
              photos={detail.evidencePhotos.scene}
              onPreview={(url, name) => setPreviewImage({ url, name, kind: 'image' })}
            />
            <EvidencePhotoGroup
              title="Ảnh xử lý cứu hộ"
              hint="(Ảnh xử lý theo từng dịch vụ)"
              photos={detail.evidencePhotos.process}
              onPreview={(url, name) => setPreviewImage({ url, name, kind: 'image' })}
            />
            <EvidencePhotoGroup
              title="Ảnh kết quả"
              hint="(Ảnh BSX cùng kết quả sau khi thực hiện)"
              photos={detail.evidencePhotos.result}
              onPreview={(url, name) => setPreviewImage({ url, name, kind: 'image' })}
            />
          </div>
        </div>
      </div>

      <div id="section-supplier" className="order-2 scroll-mt-36 border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader
          title="Nhà cung cấp"
          action={<span className="text-[11px] font-bold">Số tiền chi {formatCurrency(detail.nccPayable)}</span>}
        />
        <div className="p-4">
          {detail.nccPayable === 0 && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Đã ứng đủ phần trả nhà cung cấp. Hóa đơn vẫn lưu trên khối này.
            </p>
          )}
          <div className={FIELD_GRID_CLASS}>
            <ReadOnlyField label="Đối tác cứu hộ" value={detail.provider} colSpan={2} />
            <ReadOnlyField label="Mã số thuế" value={detail.providerTaxId} />
            <ReadOnlyField label="Biển số xe cứu hộ" value={detail.rescueVehiclePlate} />
            <ReadOnlyField label="Trạm cứu hộ" value={detail.rescueStation} colSpan={2} />
            <ReadOnlyField label="Số điện thoại" value={detail.rescueStationPhone} />
            <ReadOnlyField label="Địa chỉ trạm" value={detail.stationAddress} colSpan={4} />
          </div>

          <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <span className="w-1 h-3 bg-vetc-green mr-2 rounded-full" />
              Hóa đơn và tài khoản nhà cung cấp
            </h3>
          <div className={FIELD_GRID_CLASS}>
            <FormField label="Hạn thanh toán" required>
              <div className="relative">
                <input
                  type="text"
                  value={paymentDeadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
                  readOnly={viewOnly}
                  className={`${inputClass} pr-8`}
                />
                <Calendar size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </FormField>
            <FormField label="Link hóa đơn">
              <input
                type="text"
                value={invoiceLink}
                onChange={(e) => setInvoiceLink(e.target.value)}
                placeholder="Nhập link hóa đơn"
                readOnly={viewOnly}
                className={inputClass}
              />
            </FormField>
            <FormField label="Số hóa đơn">
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Nhập số hóa đơn"
                readOnly={viewOnly}
                className={inputClass}
              />
            </FormField>
            <FormField label="Số hợp đồng">
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="Nhập số hợp đồng"
                readOnly={viewOnly}
                className={inputClass}
              />
            </FormField>
            <ReadOnlyField label="STK thụ hưởng" value={detail.beneficiaryAccount} />
            <ReadOnlyField label="Tên tài khoản" value={detail.beneficiaryName} colSpan={2} />
            <ReadOnlyField label="Mã số thuế trạm" value={detail.stationTaxId} />
            <ReadOnlyField label="Ngân hàng thụ hưởng" value={detail.beneficiaryBank} colSpan={4} />
            <FormField label="Ghi chú" colSpan={4}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Nhập ghi chú"
                readOnly={viewOnly}
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>

          <div className={FIELD_GRID_CLASS}>
            <FormField label="File hóa đơn" colSpan={2}>
              {!viewOnly && (
              <button
                type="button"
                onClick={() => invoiceInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
              )}
              <UploadedFileList
                files={invoiceFiles}
                onOpen={openFile}
                onRemove={(id) => handleRemoveFile(id, setInvoiceFiles)}
              />
              <input
                ref={invoiceInputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFilesSelected(e, setInvoiceFiles)}
              />
            </FormField>
            <FormField label="Khác" colSpan={2}>
              {!viewOnly && (
              <button
                type="button"
                onClick={() => otherInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
              )}
              <UploadedFileList
                files={otherFiles}
                onOpen={openFile}
                onRemove={(id) => handleRemoveFile(id, setOtherFiles)}
              />
              {otherFiles.length === 0 && <EmptyFileNote />}
              <input
                ref={otherInputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFilesSelected(e, setOtherFiles)}
              />
            </FormField>
          </div>
          </div>
        </div>
      </div>

      {detail.refundAmount > 0 && detail.customerPayable === 0 && (
        <div id="section-customer" className="order-3 scroll-mt-36 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Đã ứng hoàn đủ, đưa vào ĐNTT người tạm ứng.
        </div>
      )}

      {detail.customerPayable > 0 && (
        <div id="section-customer" className="order-3 scroll-mt-36 border rounded-lg shadow-sm overflow-hidden bg-white">
          <SectionHeader
            title="Khách hàng"
            action={<span className="text-[11px] font-bold">Số tiền trả {formatCurrency(detail.customerPayable)}</span>}
          />
          <div className="p-4 space-y-4">
            <div className={FIELD_GRID_CLASS}>
              <ReadOnlyField label="Khách hàng" value={detail.customer} />
              <ReadOnlyField label="Số điện thoại" value={detail.customerPhone} />
              <div className="min-w-0">
                <Label>Số tiền</Label>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1 border rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-700 min-h-[34px]">
                    {formatCurrency(detail.customerPayable)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistoryOpen(true)}
                    className="shrink-0 border border-blue-200 bg-white text-blue-700 px-2.5 py-1.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap hover:bg-blue-50"
                  >
                    <History size={12} className="inline mr-1" />
                    Lịch sử
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Số tài khoản" required>
                <input value={customerAccount} onChange={(e) => setCustomerAccount(e.target.value)} placeholder="Nhập số tài khoản" readOnly={viewOnly} className={inputClass} />
              </FormField>
              <FormField label="Tên tài khoản" required>
                <input value={customerAccountName} onChange={(e) => setCustomerAccountName(e.target.value)} placeholder="Nhập tên tài khoản" readOnly={viewOnly} className={inputClass} />
              </FormField>
              <FormField label="Ngân hàng" required>
                <input value={customerBankName} onChange={(e) => setCustomerBankName(e.target.value)} placeholder="Nhập tên ngân hàng" readOnly={viewOnly} className={inputClass} />
              </FormField>
            </div>
            <div className={FIELD_GRID_CLASS}>
              <FormField label="Ghi chú" colSpan={4}>
                <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={2} placeholder="Nhập ghi chú" readOnly={viewOnly} className={`${inputClass} resize-none`} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Chứng từ hoàn tiền">
                {!viewOnly && <button type="button" onClick={() => customerFileRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green">
                  <Upload size={14} />
                  Upload
                </button>}
                <UploadedFileList files={customerPayFiles} onOpen={openFile} onRemove={(id) => handleRemoveFile(id, setCustomerPayFiles)} />
                {customerPayFiles.length === 0 && <EmptyFileNote />}
                <input ref={customerFileRef} type="file" multiple accept={FILE_ACCEPT} className="hidden" onChange={(e) => handleFilesSelected(e, setCustomerPayFiles)} />
              </FormField>
              <FormField label="Hình ảnh chuyển khoản">
                {!viewOnly && <button type="button" onClick={() => customerTransferRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green">
                  <Upload size={14} />
                  Upload
                </button>}
                {customerTransferImages.length === 0 && <EmptyFileNote />}
                {customerTransferImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {customerTransferImages.map((file) => (
                      <div key={file.id} className="relative">
                        <button
                          type="button"
                          onClick={() => openFile(file)}
                          className="block overflow-hidden rounded border border-gray-200 bg-gray-50"
                        >
                          <img src={file.url} alt={file.name} className="h-28 w-36 object-cover" />
                        </button>
                        {!viewOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id, setCustomerTransferImages)}
                            title="Xóa"
                            className="absolute right-1 top-1 rounded bg-white/90 p-0.5 text-red-500 shadow-sm hover:bg-red-50"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={customerTransferRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e, setCustomerTransferImages)}
                />
              </FormField>
            </div>
          </div>
        </div>
      )}

      {detail.advancerPayable > 0 && (
        <div id="section-advancer" className="order-4 scroll-mt-36 border rounded-lg shadow-sm overflow-hidden bg-white">
          <SectionHeader
            title="Người tạm ứng"
            action={<span className="text-[11px] font-bold">Số tiền hoàn ứng {formatCurrency(detail.advancerPayable)}</span>}
          />
          <div className="p-4 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b text-[10px] font-bold uppercase text-gray-400">
                    <th className="py-2 pr-3">Người tạm ứng</th>
                    <th className="py-2 pr-3">Mục đích</th>
                    <th className="py-2 pr-3">Lý do</th>
                    <th className="py-2 pr-3 text-right">Số yêu cầu</th>
                    <th className="py-2 pr-3 text-right">Số thực chi</th>
                    <th className="py-2">Ủy nhiệm chi</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.advances.map((line) => (
                    <tr key={line.id} className="border-b border-gray-100">
                      <td className="py-2 pr-3 font-bold text-gray-800">{line.advancerName}</td>
                      <td className="py-2 pr-3">{ADVANCE_PURPOSE_LABEL[line.purpose]}</td>
                      <td className="py-2 pr-3 text-gray-600">{line.reason}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatCurrency(line.requestedAmount)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{formatCurrency(line.actualAmount)}</td>
                      <td className="py-2 text-gray-500">{line.proofLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-gray-500">Đối tượng thụ hưởng</p>
                <p className="text-[10px] text-gray-400">Các khoản tạm ứng dồn về tài khoản thụ hưởng. Có thể thêm, sửa hoặc xóa đối tượng.</p>
              </div>
              {!viewOnly && (
              <button
                type="button"
                onClick={addPayee}
                className="shrink-0 inline-flex items-center gap-1 rounded border border-vetc-green px-2.5 py-1.5 text-[11px] font-bold text-vetc-green hover:bg-green-50"
              >
                <Plus size={12} />
                Thêm
              </button>
              )}
            </div>
            {payees.length === 0 && (
              <p className="rounded border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                Chưa có đối tượng thụ hưởng.
              </p>
            )}
            {payees.map((payee) => {
              const editing = !viewOnly && editingPayeeId === payee.id;
              return (
                <div key={payee.id} className="rounded-lg border border-gray-200 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-gray-800">{payee.personName || 'Đối tượng mới'}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQrPayee(payee)}
                        disabled={!payee.account || !payee.amount}
                        className="inline-flex items-center gap-1 rounded border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <QrCode size={12} />
                        QR thanh toán
                      </button>
                      {!viewOnly && <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPayeeId(editing ? null : payee.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        <Pencil size={12} />
                        {editing ? 'Xong' : 'Sửa'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removePayee(payee.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline"
                      >
                        <Trash2 size={12} />
                        Xóa
                      </button>
                    </div>}
                    </div>
                  </div>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-3">
                        <FormField label="Đối tượng" required>
                          <AppSelect
                            value={payee.personName}
                            onChange={(value) => {
                              const saved = savedAccounts.find((item) => item.ownerName === value);
                              updatePayee(payee.id, {
                                personName: value,
                                accountId: saved?.id ?? '',
                                account: saved?.account ?? '',
                                accountName: saved?.accountName ?? '',
                                bank: saved?.bank ?? '',
                              });
                              setAdjustingPayeeId(null);
                            }}
                            options={payeeOptions}
                            placeholder="Chọn đối tượng"
                            searchable
                            searchPlaceholder="Tìm đối tượng"
                            className="h-[34px] px-3 text-xs"
                          />
                        </FormField>
                        <FormField label="Tài khoản thụ hưởng" required colSpan={2}>
                          <AppSelect
                            value={payee.accountId}
                            onChange={(value) => {
                              const saved = savedAccounts.find((item) => item.id === value);
                              updatePayee(payee.id, {
                                accountId: value,
                                account: saved?.account ?? '',
                                accountName: saved?.accountName ?? '',
                                bank: saved?.bank ?? '',
                              });
                            }}
                            options={savedAccounts
                              .filter((item) => !payee.personName || item.ownerName === payee.personName)
                              .map((item) => ({ value: item.id, label: accountLabel(item) }))}
                            placeholder="Chọn tài khoản đã lưu"
                            className="h-[34px] px-3 text-xs"
                            createLabel="Điều chỉnh thông tin"
                            onCreate={() => setAdjustingPayeeId(payee.id)}
                          />
                        </FormField>
                        <FormField label="Số tiền" required>
                          <input
                            value={payee.amount}
                            onChange={(event) => updatePayee(payee.id, { amount: event.target.value })}
                            placeholder="Nhập số tiền"
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                      {adjustingPayeeId === payee.id && (
                        <div className="grid grid-cols-4 gap-3 rounded border border-dashed border-gray-200 bg-gray-50 p-3">
                          <FormField label="Ngân hàng" required>
                            <AppSelect
                              value={payee.bank}
                              onChange={(value) => updatePayee(payee.id, { bank: value })}
                              options={ADVANCE_BANKS.map((bank) => ({ value: bank, label: bank }))}
                              placeholder="Chọn ngân hàng"
                              searchable
                              searchPlaceholder="Tìm ngân hàng"
                              className="h-[34px] px-3 text-xs"
                            />
                          </FormField>
                          <FormField label="Số tài khoản" required>
                            <input
                              value={payee.account}
                              onChange={(event) => updatePayee(payee.id, { account: event.target.value })}
                              placeholder="Nhập số tài khoản"
                              className={inputClass}
                            />
                          </FormField>
                          <FormField label="Tên tài khoản" required>
                            <input
                              value={payee.accountName}
                              onChange={(event) => updatePayee(payee.id, { accountName: event.target.value })}
                              placeholder="Nhập tên tài khoản"
                              className={inputClass}
                            />
                          </FormField>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (!payee.bank || !payee.account.trim() || !payee.accountName.trim()) return;
                                const nextAccount = {
                                  bank: payee.bank,
                                  account: payee.account.trim(),
                                  accountName: payee.accountName.trim(),
                                };
                                const exists = Boolean(payee.accountId && savedAccounts.some((item) => item.id === payee.accountId));
                                const accountId = exists ? payee.accountId : `acc-${Date.now()}`;
                                setSavedAccounts((current) =>
                                  exists
                                    ? current.map((item) => (item.id === accountId ? { ...item, ...nextAccount } : item))
                                    : [...current, { id: accountId, ownerName: payee.personName, ...nextAccount }]
                                );
                                updatePayee(payee.id, { accountId, ...nextAccount });
                                setAdjustingPayeeId(null);
                              }}
                              className="h-[34px] rounded bg-vetc-green px-3 text-[11px] font-bold text-white hover:bg-green-700"
                            >
                              Lưu tài khoản
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Ngân hàng', value: payee.bank },
                        { label: 'Số tài khoản', value: payee.account },
                        { label: 'Tên tài khoản', value: payee.accountName },
                        { label: 'Số tiền', value: payee.amount || '0' },
                      ].map((item) => (
                        <div key={item.label} className="min-w-0 rounded border border-gray-100 bg-gray-50 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase text-gray-400">{item.label}</p>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-gray-800">{item.value || '—'}</span>
                            <CopyValue value={item.value} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <FormField label="Chứng từ hoàn ứng">
              {!viewOnly && (
              <button type="button" onClick={() => advancerFileRef.current?.click()} className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green">
                <Upload size={14} />
                Upload
              </button>
              )}
              <UploadedFileList files={advancerPayFiles} onOpen={openFile} onRemove={(id) => handleRemoveFile(id, setAdvancerPayFiles)} />
              <input ref={advancerFileRef} type="file" multiple accept={FILE_ACCEPT} className="hidden" onChange={(e) => handleFilesSelected(e, setAdvancerPayFiles)} />
            </FormField>
          </div>
        </div>
      )}

      {detail.hasPendingAdvance && (
        <p className="order-7 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Còn yêu cầu tạm ứng đang chờ xử lý. Chưa tạo được đề nghị thanh toán.
        </p>
      )}
      {submitError && <p className="order-8 text-sm font-medium text-red-500">{submitError}</p>}
      {submitted && (
        <p className="order-8 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Đã tạo đề nghị thanh toán cho các khối đang có số tiền.
        </p>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setRejectOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-sm font-black text-gray-900">Từ chối đề nghị thanh toán</p>
            <p className="mt-1 text-xs text-gray-500">Nhập lý do trước khi chuyển sang trạng thái Từ chối.</p>
            <textarea
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value);
                if (rejectError) setRejectError('');
              }}
              rows={3}
              placeholder="Nhập lý do từ chối"
              className={`mt-3 w-full resize-none rounded border px-3 py-2 text-sm outline-none focus:border-red-400 ${rejectError ? 'border-red-500' : 'border-gray-200'}`}
            />
            {rejectError && <p className="mt-1 text-xs font-medium text-red-500">{rejectError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentQrModal
        isOpen={qrPayee !== null}
        onClose={() => setQrPayee(null)}
        amount={qrPayee?.amount || '0'}
        bankName={qrPayee?.bank || '—'}
        accountNumber={qrPayee?.account || '—'}
        content={`${detail.orderId} ${qrPayee?.accountName || ''}`.trim()}
        qrData={`VETC|${qrPayee?.bank || ''}|${qrPayee?.account || ''}|${qrPayee?.amount || '0'}|${detail.orderId}`}
      />

      {historyOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" onClick={() => setHistoryOpen(false)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">Lịch sử thanh toán</h3>
                <p className="mt-0.5 text-[11px] text-gray-400">{detail.customer} · {detail.orderId}</p>
              </div>
              <button type="button" onClick={() => setHistoryOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              {paymentHistory.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400">
                  Chưa có giao dịch thanh toán.
                </p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-[10px] font-bold uppercase text-gray-400">
                      <th className="py-2 pr-3">Thời gian</th>
                      <th className="py-2 pr-3">Loại</th>
                      <th className="py-2 pr-3">Phương thức</th>
                      <th className="py-2 pr-3 text-right">Số tiền</th>
                      <th className="py-2 pr-3">Trạng thái</th>
                      <th className="py-2">Mã giao dịch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((item) => (
                      <tr key={item.code} className="border-b border-gray-100">
                        <td className="py-2 pr-3 whitespace-nowrap text-gray-500">{item.time}</td>
                        <td className="py-2 pr-3 font-bold text-gray-700">{item.type}</td>
                        <td className="py-2 pr-3">{item.method}</td>
                        <td className="py-2 pr-3 text-right font-bold tabular-nums">{formatCurrency(item.amount)}</td>
                        <td className="py-2 pr-3">
                          <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                            {item.state}
                          </span>
                        </td>
                        <td className="py-2">{item.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg overflow-hidden max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-700 truncate">{previewImage.name}</span>
              <div className="flex items-center gap-1">
                {previewImage.kind === 'link' && (
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded hover:bg-sky-100 text-sky-600 transition-colors"
                    title="Mở link"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Đóng"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {previewImage.kind === 'link' ? (
              <div className="p-3 flex flex-col gap-3">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 hover:underline"
                >
                  <Link2 size={14} className="shrink-0" />
                  <span className="truncate">{previewImage.url}</span>
                </a>
                <iframe
                  src={previewImage.url}
                  title={previewImage.name}
                  className="w-[70vw] max-w-3xl h-[60vh] rounded-lg border border-gray-200 bg-white"
                />
              </div>
            ) : (
              <div className="p-3 overflow-auto flex items-center justify-center">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-w-full max-h-[70vh] object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EvidencePhotoGroup: React.FC<{
  title: string;
  hint: string;
  photos: string[];
  onPreview: (src: string, name: string) => void;
}> = ({ title, hint, photos, onPreview }) => (
  <div className="space-y-2">
    <div>
      <p className="text-xs font-bold text-gray-700">{title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>
    </div>
    {photos.length > 0 ? (
      <div className="flex flex-wrap gap-3">
        {photos.map((src, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onPreview(src, `${title} ${idx + 1}`)}
            className="w-24 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:ring-2 hover:ring-vetc-green transition-all cursor-pointer"
          >
            <img src={src} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    ) : (
      <p className="text-xs text-gray-400 italic">Chưa có ảnh</p>
    )}
  </div>
);

export default PaymentRequestDetail;
