
import React, { useState } from 'react';
import { Camera, Upload, X, ImageIcon, Maximize2, ZoomIn } from 'lucide-react';

interface ImageUploadSectionProps {
  readOnly?: boolean;
  onlyScene?: boolean;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({ readOnly = false, onlyScene = false }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const ImageGroup = ({ 
    title,
    subtitle,
    color, 
    shadow, 
    max, 
    images = []
  }: { 
    title: string,
    subtitle?: string,
    color: string,
    shadow: string, 
    max: number, 
    images?: string[] 
  }) => (
    <div className="flex flex-col space-y-3">
      <div className={`flex items-center justify-between pb-1.5 border-b ${color.replace('bg-', 'border-')}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm ${shadow}`}></div>
          <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-tight">{title}</h4>
        </div>
        <span className={`${color.replace('bg-', 'bg-').replace('-500', '-50')} ${color.replace('bg-', 'text-').replace('-500', '-600')} px-1.5 py-0.5 rounded text-[8px] font-bold`}>Tối đa {max}</span>
      </div>
      {subtitle && <span className={'text-[14px]'}>{subtitle}</span>}
      
      {/* Grid increased to make items smaller */}
      <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6">
        {!readOnly && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-vetc-green hover:bg-green-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-300 group">
            <Upload size={16} className="group-hover:text-vetc-green group-hover:scale-110 transition-all" />
            <span className="text-[8px] font-bold mt-1 uppercase tracking-tighter text-gray-400 group-hover:text-vetc-green">Thêm</span>
          </div>
        )}
        
        {images.map((src, idx) => (
          <div 
            key={idx} 
            className="aspect-square rounded-lg bg-gray-100 relative group overflow-hidden border border-gray-100 shadow-sm ring-1 ring-black/5 cursor-zoom-in"
            onClick={() => setPreviewUrl(src)}
          >
            <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`${title} ${idx + 1}`} />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn size={16} className="text-white drop-shadow-md" />
            </div>

            {!readOnly && (
              <button 
                className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle delete logic if needed
                }}
              >
                <X size={8} />
              </button>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[7px] text-white p-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              Xem ảnh {idx + 1}
            </div>
          </div>
        ))}
        
        {readOnly && images.length === 0 && (
          <div className="col-span-full py-3 text-center text-[9px] text-gray-400 italic bg-gray-50 rounded-lg border border-dashed">
            Chưa có hình ảnh
          </div>
        )}
      </div>
    </div>
  );

  if (onlyScene) {
    return (
      <>
        <ImageGroup 
          title="Hiện trường sự cố"
          subtitle="Ảnh được chụp ở góc 45 độ từ phía trước bên trái, với biển số rõ ràng và xe còn nguyên vẹn"
          color="bg-orange-500" 
          shadow="shadow-orange-200" 
          max={4} 
          images={[
            "https://picsum.photos/id/1071/800/600"
          ]}
        />
        {/* Preview Modal */}
        {previewUrl && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setPreviewUrl(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
              onClick={() => setPreviewUrl(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={previewUrl} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
              alt="Preview" 
            />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <ImageGroup 
        title="Hiện trường sự cố"
        subtitle="Ảnh được chụp ở góc 45 độ từ phía trước bên trái, với biển số rõ ràng và xe còn nguyên vẹn"
        color="bg-orange-500" 
        shadow="shadow-orange-200" 
        max={4} 
        images={["https://picsum.photos/id/1071/800/600"]}
      />
      <ImageGroup 
        title="Quá trình xử lý"
        subtitle="Chụp ảnh các bước thực hiện, rõ thao tác, tình trạng xe, biển số xe trong quá trình xử lý."
        color="bg-blue-500" 
        shadow="shadow-blue-200" 
        max={4} 
        images={["https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&q=80&w=800"]}
      />
      <ImageGroup 
        title="Hoàn tất cứu hộ"
        subtitle="Chụp ảnh hoàn tất cứu hộ, đảm bảo rõ biển số xe, kết quả xử lý."
        color="bg-green-500" 
        shadow="shadow-green-200" 
        max={4} 
        images={["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"]}
      />

      {/* Preview Modal */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewUrl(null)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
            onClick={() => setPreviewUrl(null)}
          >
            <X size={24} />
          </button>
          <img 
            src={previewUrl} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
            alt="Preview" 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
