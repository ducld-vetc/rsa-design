import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Lock,
  Paperclip,
  Receipt,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type PaymentFileCategory = 'invoice' | 'transfer' | 'other';

interface PaymentFile {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  preview?: string;
  category: PaymentFileCategory;
}

interface PaymentRequestSectionProps {
  disabled?: boolean;
}

const MOCK_FILES: PaymentFile[] = [
  {
    id: 'mock1',
    name: 'HoaDon_NCC_Carpla_042026.pdf',
    type: 'application/pdf',
    size: '1.2 MB',
    url: '#',
    category: 'invoice',
  },
  {
    id: 'mock2',
    name: 'HoaDon_DichVu_CuuHo.pdf',
    type: 'application/pdf',
    size: '980 KB',
    url: '#',
    category: 'invoice',
  },
  {
    id: 'mock-tf1',
    name: 'CK_Vietcombank_042026.jpg',
    type: 'image/jpeg',
    size: '640 KB',
    url: '#',
    preview: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    category: 'transfer',
  },
  {
    id: 'mock-tf2',
    name: 'BienLai_ChuyenKhoan.png',
    type: 'image/png',
    size: '510 KB',
    url: '#',
    preview: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    category: 'transfer',
  },
  {
    id: 'mock3',
    name: 'ChungTu_ThanhToan_01.jpg',
    type: 'image/jpeg',
    size: '850 KB',
    url: '#',
    preview: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
    category: 'other',
  },
  {
    id: 'mock4',
    name: 'BienBan_BanGiao.pdf',
    type: 'application/pdf',
    size: '420 KB',
    url: '#',
    category: 'other',
  },
];

const CATEGORY_META: Record<
  PaymentFileCategory,
  {
    label: string;
    hint: string;
    accept: string;
    icon: React.ReactNode;
    accent: {
      border: string;
      borderHover: string;
      bgHover: string;
      iconBg: string;
      iconBgHover: string;
      iconText: string;
      fileIconBg: string;
      fileIconBorder: string;
      fileIconText: string;
    };
  }
> = {
  invoice: {
    label: 'Hóa đơn',
    hint: 'JPG, PNG, PDF — tối đa 10MB',
    accept: 'image/*,.pdf',
    icon: <Receipt size={12} className="text-amber-500" />,
    accent: {
      border: 'border-amber-200',
      borderHover: 'hover:border-amber-400',
      bgHover: 'hover:bg-amber-50/50',
      iconBg: 'bg-amber-100',
      iconBgHover: 'group-hover/upload:bg-amber-200',
      iconText: 'text-amber-500',
      fileIconBg: 'bg-amber-50',
      fileIconBorder: 'border-amber-100',
      fileIconText: 'text-amber-500',
    },
  },
  transfer: {
    label: 'Hình ảnh chuyển khoản',
    hint: 'JPG, PNG — tối đa 10MB',
    accept: 'image/*',
    icon: <ImageIcon size={12} className="text-emerald-500" />,
    accent: {
      border: 'border-emerald-200',
      borderHover: 'hover:border-emerald-400',
      bgHover: 'hover:bg-emerald-50/50',
      iconBg: 'bg-emerald-100',
      iconBgHover: 'group-hover/upload:bg-emerald-200',
      iconText: 'text-emerald-500',
      fileIconBg: 'bg-emerald-50',
      fileIconBorder: 'border-emerald-100',
      fileIconText: 'text-emerald-500',
    },
  },
  other: {
    label: 'File khác',
    hint: 'JPG, PNG, PDF — tối đa 10MB',
    accept: 'image/*,.pdf',
    icon: <Paperclip size={12} className="text-blue-500" />,
    accent: {
      border: 'border-blue-200',
      borderHover: 'hover:border-blue-400',
      bgHover: 'hover:bg-blue-50/50',
      iconBg: 'bg-blue-100',
      iconBgHover: 'group-hover/upload:bg-blue-200',
      iconText: 'text-blue-500',
      fileIconBg: 'bg-blue-50',
      fileIconBorder: 'border-blue-100',
      fileIconText: 'text-blue-500',
    },
  },
};

const FileCard: React.FC<{
  file: PaymentFile;
  onPreview: (file: PaymentFile) => void;
  onDelete: (id: string) => void;
}> = ({ file, onPreview, onDelete }) => {
  const meta = CATEGORY_META[file.category];
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
      {file.preview ? (
        <button
          type="button"
          className="w-8 h-8 rounded-md overflow-hidden border border-gray-200 shrink-0 hover:ring-2 hover:ring-blue-400 transition-all"
          onClick={() => onPreview(file)}
        >
          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
        </button>
      ) : (
        <div
          className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 ${meta.accent.fileIconBg} ${meta.accent.fileIconBorder}`}
        >
          {file.category === 'invoice' ? (
            <Receipt size={14} className={meta.accent.fileIconText} />
          ) : file.category === 'transfer' ? (
            <ImageIcon size={14} className={meta.accent.fileIconText} />
          ) : (
            <FileText size={14} className={meta.accent.fileIconText} />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-800 truncate">{file.name}</p>
        <p className="text-[9px] text-gray-400 font-medium">{file.size}</p>
      </div>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          title="Xem trước"
          onClick={() => {
            if (file.preview) onPreview(file);
            else window.open(file.url, '_blank');
          }}
          className="p-1 rounded-md hover:bg-blue-100 text-blue-500 transition-colors"
        >
          <Eye size={13} />
        </button>
        <a
          href={file.url}
          download={file.name}
          title="Tải xuống"
          className="p-1 rounded-md hover:bg-green-100 text-green-500 transition-colors"
        >
          <Download size={13} />
        </a>
        <button
          type="button"
          title="Xóa"
          onClick={() => onDelete(file.id)}
          className="p-1 rounded-md hover:bg-red-100 text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const UploadZone: React.FC<{
  category: PaymentFileCategory;
  count: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  files: PaymentFile[];
  onPreview: (file: PaymentFile) => void;
  onDelete: (id: string) => void;
}> = ({ category, count, inputRef, onChange, files, onPreview, onDelete }) => {
  const meta = CATEGORY_META[category];
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-gray-50 bg-gray-50/80 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5 min-w-0">
          {meta.icon}
          <span className="truncate">{meta.label}</span>
          <span className="text-gray-400 font-bold normal-case tracking-normal">({count})</span>
        </span>
      </div>

      <div className="p-2.5 space-y-2 flex-1 flex flex-col">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full border border-dashed rounded-lg px-3 py-2.5 flex items-center gap-2.5 text-left cursor-pointer transition-all group/upload ${meta.accent.border} ${meta.accent.borderHover} ${meta.accent.bgHover}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${meta.accent.iconBg} ${meta.accent.iconBgHover}`}
          >
            <Upload size={14} className={meta.accent.iconText} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-gray-700 leading-tight">Kéo thả hoặc nhấn để tải</p>
            <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{meta.hint}</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={meta.accept}
            className="hidden"
            onChange={onChange}
          />
        </button>

        {files.length > 0 ? (
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-0.5">
            {files.map((file) => (
              <FileCard key={file.id} file={file} onPreview={onPreview} onDelete={onDelete} />
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-400 italic px-1 py-1">Chưa có file</p>
        )}
      </div>
    </div>
  );
};

const PaymentRequestSection: React.FC<PaymentRequestSectionProps> = ({ disabled = false }) => {
  const [files, setFiles] = useState<PaymentFile[]>(MOCK_FILES);
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const transferInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const createFileFromInput = (f: File, category: PaymentFileCategory): PaymentFile => {
    const isImage = f.type.startsWith('image/');
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      type: f.type,
      size:
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`,
      url: URL.createObjectURL(f),
      preview: isImage ? URL.createObjectURL(f) : undefined,
      category,
    };
  };

  const handleUpload = (category: PaymentFileCategory) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map((f) => createFileFromInput(f, category));
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handlePreview = (file: PaymentFile) => {
    if (file.preview) {
      setPreviewFile({ name: file.name, url: file.preview, type: file.type });
    }
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const invoiceFiles = files.filter((f) => f.category === 'invoice');
  const transferFiles = files.filter((f) => f.category === 'transfer');
  const otherFiles = files.filter((f) => f.category === 'other');

  if (disabled) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Lock size={24} className="text-gray-400" />
        </div>
        <p className="text-sm font-bold text-gray-500">Chức năng chưa khả dụng</p>
        <p className="text-xs text-gray-400 mt-1">
          Đề nghị thanh toán chỉ khả dụng khi đơn hàng ở trạng thái{' '}
          <span className="font-bold text-green-600">Hoàn thành</span>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <UploadZone
            category="invoice"
            count={invoiceFiles.length}
            inputRef={invoiceInputRef}
            onChange={handleUpload('invoice')}
            files={invoiceFiles}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
          <UploadZone
            category="transfer"
            count={transferFiles.length}
            inputRef={transferInputRef}
            onChange={handleUpload('transfer')}
            files={transferFiles}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
          <UploadZone
            category="other"
            count={otherFiles.length}
            inputRef={otherInputRef}
            onChange={handleUpload('other')}
            files={otherFiles}
            onPreview={handlePreview}
            onDelete={handleDelete}
          />
        </div>

      </div>

      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Eye size={16} className="text-blue-500" />
                  <span className="text-xs font-bold text-gray-700 truncate max-w-[400px]">
                    {previewFile.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                    title="Tải xuống"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewFile(null)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center overflow-auto">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PaymentRequestSection;
