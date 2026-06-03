import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  Eye,
  FileText,
  Lock,
  Paperclip,
  Receipt,
  Trash2,
  Upload,
  X
} from 'lucide-react';

interface PaymentFile {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  preview?: string;
  category: 'invoice' | 'other';
}

interface PaymentRequestSectionProps {
  disabled?: boolean;
}

const MOCK_FILES: PaymentFile[] = [
  { id: 'mock1', name: 'HoaDon_NCC_Carpla_042026.pdf', type: 'application/pdf', size: '1.2 MB', url: '#', preview: undefined, category: 'invoice' },
  { id: 'mock2', name: 'HoaDon_DichVu_CuuHo.pdf', type: 'application/pdf', size: '980 KB', url: '#', preview: undefined, category: 'invoice' },
  { id: 'mock3', name: 'ChungTu_ThanhToan_01.jpg', type: 'image/jpeg', size: '850 KB', url: '#', preview: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', category: 'other' },
  { id: 'mock4', name: 'BienBan_BanGiao.pdf', type: 'application/pdf', size: '420 KB', url: '#', preview: undefined, category: 'other' },
];




const FileCard: React.FC<{
  file: PaymentFile;
  onPreview: (file: PaymentFile) => void;
  onDelete: (id: string) => void;
}> = ({ file, onPreview, onDelete }) => (
    <div
        className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all group/file"
    >
      {/* Thumbnail / Icon */}
      {file.preview ? (
          <div
              className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
              onClick={() => onPreview(file)}
          >
            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
          </div>
      ) : (
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
              file.category === 'invoice'
                  ? 'bg-amber-50 border-amber-100'
                  : 'bg-red-50 border-red-100'
          }`}>
            {file.category === 'invoice'
                ? <Receipt size={18} className="text-amber-500" />
                : <FileText size={18} className="text-red-500" />
            }
          </div>
      )}

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-gray-800 truncate">{file.name}</p>
        <p className="text-[9px] text-gray-400 font-medium">{file.size}</p>
      </div>

      {/* Actions - always visible */}
      <div className="flex items-center space-x-1">
        <button
            title="Xem trước"
            onClick={() => {
              if (file.preview) {
                onPreview(file);
              } else {
                window.open(file.url, '_blank');
              }
            }}
            className="p-1.5 rounded-md hover:bg-blue-100 text-blue-500 transition-colors"
        >
          <Eye size={14} />
        </button>
        <a
            href={file.url}
            download={file.name}
            title="Tải xuống"
            className="p-1.5 rounded-md hover:bg-green-100 text-green-500 transition-colors"
        >
          <Download size={14} />
        </a>
        <button
            title="Xóa"
            onClick={() => onDelete(file.id)}
            className="p-1.5 rounded-md hover:bg-red-100 text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
);

const PaymentRequestSection: React.FC<PaymentRequestSectionProps> = ({ disabled = false }) => {
  const [files, setFiles] = useState<PaymentFile[]>(MOCK_FILES);
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  const createFileFromInput = (f: File, category: 'invoice' | 'other'): PaymentFile => {
    const isImage = f.type.startsWith('image/');
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      type: f.type,
      size: f.size > 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
      url: URL.createObjectURL(f),
      preview: isImage ? URL.createObjectURL(f) : undefined,
      category
    };
  };

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map(f => createFileFromInput(f, 'invoice'));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleOtherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles).map(f => createFileFromInput(f, 'other'));
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handlePreview = (file: PaymentFile) => {
    if (file.preview) {
      setPreviewFile({ name: file.name, url: file.preview, type: file.type });
    }
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const invoiceFiles = files.filter(f => f.category === 'invoice');
  const otherFiles = files.filter(f => f.category === 'other');

  if (disabled) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Lock size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-500">Chức năng chưa khả dụng</p>
          <p className="text-xs text-gray-400 mt-1">Đề nghị thanh toán chỉ khả dụng khi đơn hàng ở trạng thái <span className="font-bold text-green-600">Hoàn thành</span></p>
        </div>
    );
  }

  return (
      <>
        <div className="space-y-5">
          {/* === Hóa đơn Section === */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <Receipt size={12} className="mr-1 text-amber-500" />
                Hóa đơn ({invoiceFiles.length})
              </span>
            </div>
            {/* Invoice upload area */}
            <div
                onClick={() => invoiceInputRef.current?.click()}
                className="border-2 border-dashed border-amber-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all group/upload-inv"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2 group-hover/upload-inv:bg-amber-200 transition-colors">
                <Upload size={18} className="text-amber-500" />
              </div>
              <p className="text-xs font-bold text-gray-700">Kéo thả hoặc nhấn để tải hóa đơn</p>
              <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ: JPG, PNG, PDF — Tối đa 10MB mỗi file</p>
              <input
                  ref={invoiceInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleInvoiceUpload}
              />
            </div>
            {invoiceFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {invoiceFiles.map(file => (
                      <FileCard
                          key={file.id}
                          file={file}
                          onPreview={handlePreview}
                          onDelete={handleDelete}
                      />
                  ))}
                </div>
            )}
          </div>

          {/* === File khác Section === */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <Paperclip size={12} className="mr-1 text-blue-500" />
                File khác ({otherFiles.length})
              </span>
            </div>
            {/* Other files upload area */}
            <div
                onClick={() => otherInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group/upload-other"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2 group-hover/upload-other:bg-blue-200 transition-colors">
                <Upload size={18} className="text-blue-500" />
              </div>
              <p className="text-xs font-bold text-gray-700">Kéo thả hoặc nhấn để tải file khác</p>
              <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ: JPG, PNG, PDF — Tối đa 10MB mỗi file</p>
              <input
                  ref={otherInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleOtherUpload}
              />
            </div>
            {otherFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {otherFiles.map(file => (
                      <FileCard
                          key={file.id}
                          file={file}
                          onPreview={handlePreview}
                          onDelete={handleDelete}
                      />
                  ))}
                </div>
            )}
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
                className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <CreditCard size={14} />
              <span>Đề nghị thanh toán</span>
            </button>
          </div>
        </div>

        {/* Image Preview Modal */}
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
                    onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <Eye size={16} className="text-blue-500" />
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[400px]">{previewFile.name}</span>
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
