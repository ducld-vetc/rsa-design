import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { getPaymentRequestDetail, ORDER_TYPE_CONFIG } from '../data/paymentRequestMockData';

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

type UploadedFileKind = 'image' | 'pdf' | 'other';

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
}> = ({ file, onOpen, onRemove }) => (
  <div
    onClick={() => onOpen(file)}
    title={file.name}
    className="flex items-center gap-2.5 p-2 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer group/file"
  >
    {file.kind === 'image' ? (
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
      <p className="text-[9px] text-gray-400 font-medium">{file.size}</p>
    </div>

    <div className="flex items-center gap-0.5 shrink-0">
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
    </div>
  </div>
);

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

const PaymentRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const detail = useMemo(() => {
    if (!orderId) return undefined;
    return getPaymentRequestDetail(orderId);
  }, [orderId]);

  const [paymentDeadline, setPaymentDeadline] = useState(detail?.paymentDeadline ?? '');
  const [invoiceLink, setInvoiceLink] = useState(detail?.invoiceLink ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(detail?.invoiceNumber ?? '');
  const [contractNumber, setContractNumber] = useState(detail?.contractNumber ?? '');
  const [note, setNote] = useState(detail?.note ?? '');
  const [invoiceFiles, setInvoiceFiles] = useState<UploadedFile[]>([]);
  const [otherFiles, setOtherFiles] = useState<UploadedFile[]>([]);
  const [previewImage, setPreviewImage] = useState<{ name: string; url: string } | null>(null);

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

  const inputClass =
    'w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-vetc-green placeholder:text-gray-400 bg-white';

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
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const openFile = (file: UploadedFile) => {
    if (file.kind === 'image') {
      setPreviewImage({ name: file.name, url: file.url });
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

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-lg font-black text-gray-800 uppercase tracking-tight">Tạo đề nghị thanh toán</h1>
        <button
          type="button"
          onClick={() => navigate('/payment-request-management')}
          className="flex items-center gap-2 text-gray-600 hover:text-vetc-green font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </button>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
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
            <ReadOnlyField label="Chi phí đơn" value={formatCurrency(detail.orderCost)} />
            <ReadOnlyField
              label="Tổng tiền phải thu của KH"
              value={formatCurrency(detail.totalCustomerReceivable)}
            />
            <ReadOnlyField label="Tiền KH đã cọc" value={formatCurrency(detail.customerDeposit)} />
          </OrderInfoGroup>

          <OrderInfoGroup title="Tạm ứng">
            <ReadOnlyField
              label="Tổng tiền ứng hoàn cọc"
              value={formatCurrency(detail.depositRefundAdvanceAmount)}
            />
            <ReadOnlyField label="Người ứng tiền" value={detail.depositRefundAdvancer} />
            <ReadOnlyField
              label="Tổng tiền ứng trả nhà NCC"
              value={formatCurrency(detail.supplierAdvanceAmount)}
            />
            <ReadOnlyField label="Người ứng tiền" value={detail.supplierAdvancer} />
          </OrderInfoGroup>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Thông tin cứu hộ" />
        <div className="p-4">
          <div className={FIELD_GRID_CLASS}>
            <ReadOnlyField label="Nhà cung cấp" value={detail.provider} colSpan={2} />
            <ReadOnlyField label="Mã số thuế" value={detail.providerTaxId} />
            <ReadOnlyField label="Biển số xe cứu hộ" value={detail.rescueVehiclePlate} />
            <ReadOnlyField label="Trạm cứu hộ" value={detail.rescueStation} colSpan={2} />
            <ReadOnlyField label="Số điện thoại" value={detail.rescueStationPhone} />
            <ReadOnlyField label="Địa chỉ trạm" value={detail.stationAddress} colSpan={4} />
          </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader title="Thông tin xuất hóa đơn" />
        <div className="p-4 space-y-4">
          <div className={FIELD_GRID_CLASS}>
            <FormField label="Hạn thanh toán" required>
              <div className="relative">
                <input
                  type="text"
                  value={paymentDeadline}
                  onChange={(e) => setPaymentDeadline(e.target.value)}
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
                className={inputClass}
              />
            </FormField>
            <FormField label="Số hóa đơn">
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Nhập số hóa đơn"
                className={inputClass}
              />
            </FormField>
            <FormField label="Số hợp đồng">
              <input
                type="text"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="Nhập số hợp đồng"
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
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>

          <div className={FIELD_GRID_CLASS}>
            <FormField label="File hóa đơn" colSpan={2}>
              <button
                type="button"
                onClick={() => invoiceInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
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
              <button
                type="button"
                onClick={() => otherInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-gray-300 rounded px-4 py-2 text-sm font-bold text-gray-600 hover:border-vetc-green hover:text-vetc-green transition-colors"
              >
                <Upload size={14} />
                Upload
              </button>
              <UploadedFileList
                files={otherFiles}
                onOpen={openFile}
                onRemove={(id) => handleRemoveFile(id, setOtherFiles)}
              />
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

      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <SectionHeader
          title="Ảnh bằng chứng cứu hộ"
          action={
            <button
              type="button"
              onClick={handleDownloadAllPhotos}
              disabled={allEvidencePhotos.length === 0}
              className="flex items-center gap-1.5 rounded-md bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Tải toàn bộ ảnh ({allEvidencePhotos.length})
            </button>
          }
        />
        <div className="p-4 space-y-6">
          <EvidencePhotoGroup
            title="Ảnh hiện trường"
            hint="(Ảnh BSX, hiện trạng xe trước khi xử lý theo từng dịch vụ)"
            photos={detail.evidencePhotos.scene}
            onPreview={(url, name) => setPreviewImage({ url, name })}
          />
          <EvidencePhotoGroup
            title="Ảnh xử lý cứu hộ"
            hint="(Ảnh xử lý theo từng dịch vụ)"
            photos={detail.evidencePhotos.process}
            onPreview={(url, name) => setPreviewImage({ url, name })}
          />
          <EvidencePhotoGroup
            title="Ảnh kết quả"
            hint="(Ảnh BSX cùng kết quả sau khi thực hiện)"
            photos={detail.evidencePhotos.result}
            onPreview={(url, name) => setPreviewImage({ url, name })}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/payment-request-management')}
          className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-lg text-sm font-bold hover:border-gray-300 transition-all"
        >
          <X size={16} />
          Hủy
        </button>
        <button
          type="button"
          className="flex items-center gap-2 bg-vetc-green text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-all"
        >
          <CreditCard size={16} />
          Tạo đề nghị thanh toán
        </button>
      </div>

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
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-3 overflow-auto flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
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
