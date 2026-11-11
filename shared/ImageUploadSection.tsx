
import React, { useState } from 'react';
import { Camera, Upload, X, ImageIcon, Maximize2, ZoomIn } from 'lucide-react';

interface ImageUploadSectionProps {
  readOnly?: boolean;
  onlyScene?: boolean;
  /** Ảnh hiện trường (controlled) — dùng khi fill từ tra cứu xe */
  sceneImages?: string[];
  /** Badge nguồn (vd. khách hàng cập nhật) cho nhóm ảnh hiện trường */
  sceneBadge?: React.ReactNode;
  /** Đánh dấu từng ảnh hiện trường là khách hàng gửi */
  sceneCustomerMarked?: boolean;
}

/** Ô ảnh theo bộ chụp trên app VETC Cứu hộ: A hiện trường, B xử lý, C bàn giao. */
type RescueShotSlot = {
  id: string;
  label: string;
  max: number;
  optional?: boolean;
  towOnly?: boolean;
};

const RESCUE_PHOTO_SETS: {
  id: 'A' | 'B' | 'C';
  title: string;
  lead: string;
  color: string;
  shadow: string;
  shots: RescueShotSlot[];
}[] = [
  {
    id: 'A',
    title: 'Hiện trường sự cố',
    lead: 'Chụp ngay khi đến điểm cứu hộ, trước khi xử lý xe.',
    color: 'bg-orange-500',
    shadow: 'shadow-orange-200',
    shots: [
      { id: 'A1', label: 'Toàn cảnh hiện trường có xe khách hàng', max: 1 },
      { id: 'A2', label: 'Biển số xe khách hàng', max: 1 },
      { id: 'A3', label: 'Góc trước – trái 45°', max: 1 },
      { id: 'A4', label: 'Góc trước – phải 45°', max: 1 },
      { id: 'A5', label: 'Góc sau – trái 45°', max: 1 },
      { id: 'A6', label: 'Góc sau – phải 45°', max: 1 },
      { id: 'A7', label: 'Cận cảnh từng vết trầy, móp, nứt có sẵn', max: 6, optional: true },
      { id: 'A8', label: 'Taplo và đồng hồ ODO', max: 1 },
      { id: 'A9', label: 'Giấy đăng ký xe / Giấy đăng kiểm / Tem đăng kiểm', max: 1 },
      { id: 'A10', label: 'Tình trạng lỗi sự cố', max: 1 },
      { id: 'A11', label: 'Nội thất và khoang hành lý', max: 2 },
    ],
  },
  {
    id: 'B',
    title: 'Quá trình xử lý',
    lead: 'Ảnh thao tác trước khi rời hiện trường. Ảnh lên sàn và dây neo chỉ khi đơn có kéo xe.',
    color: 'bg-blue-500',
    shadow: 'shadow-blue-200',
    shots: [
      { id: 'B1', label: 'Thao tác xử lý tại hiện trường', max: 3 },
      { id: 'B2', label: 'Xe khách hàng đã đưa lên sàn', max: 1, towOnly: true },
      { id: 'B3', label: 'Điểm chằng buộc, dây neo', max: 1, towOnly: true },
      { id: 'B4', label: 'Chi phí phụ nếu có', max: 3, optional: true },
    ],
  },
  {
    id: 'C',
    title: 'Hoàn tất cứu hộ',
    lead: 'Chụp khi bàn giao xe, sau khi hoàn thành cứu hộ.',
    color: 'bg-green-500',
    shadow: 'shadow-green-200',
    shots: [
      { id: 'C1', label: 'Bàn giao xe tại địa chỉ kéo về', max: 1 },
      { id: 'C2', label: 'Bốn góc thân xe lần hai', max: 4 },
      { id: 'C3', label: 'Biên bản xác nhận bàn giao xe cho xưởng đã ký', max: 1 },
      { id: 'C4', label: 'Taplo và ODO lần hai', max: 1 },
    ],
  },
];

const car = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;

const DEMO_SHOT_IMAGES: Record<string, string[]> = {
  A1: [car('1449965408869-eaa3f722e40d')],
  A2: [car('1492144534655-ae79c964c9d7')],
  A3: [car('1494976388531-d1058494cdd8')],
  A4: [car('1621007947382-bb3c3994e3fb')],
  A7: [
    car('1486262715619-67b85e0b08d3'),
    car('1494976388531-d1058494cdd8'),
    car('1489824904134-891ab64532f1'),
  ],
  A8: [car('1617531653332-bd46c24f2068')],
  A10: [car('1580273916550-e323be2ae537')],
  A11: [car('1549317661-bd32c8ce0db2'), car('1606664515524-ed2f786a0bd6')],
  B1: [
    car('1530046339160-ce3e530c7d2f'),
    car('1486262715619-67b85e0b08d3'),
    car('1621007947382-bb3c3994e3fb'),
  ],
  B2: [car('1601584115197-04ecc1da5d9a')],
  B4: [car('1554224155-6726b3ff858f'), car('1568667256549-094345960b4e')],
  C1: [car('1544620347-c4fd4a3d5957')],
  C2: [
    car('1492144534655-ae79c964c9d7'),
    car('1621007947382-bb3c3994e3fb'),
    car('1489824904134-891ab64532f1'),
    car('1549317661-bd32c8ce0db2'),
  ],
  C3: [car('1554224155-8d04cb21cd6c')],
  C4: [car('1617531653332-bd46c24f2068')],
};

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  readOnly = false,
  onlyScene = false,
  sceneImages,
  sceneBadge,
  sceneCustomerMarked = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detailShot, setDetailShot] = useState<{
    code: string;
    label: string;
    images: string[];
    max: number;
    customerMarked?: boolean;
  } | null>(null);
  const uploadedScene = sceneImages && sceneImages.length > 0 ? sceneImages.slice(0, 4) : [];
  const sceneList = uploadedScene.length > 0
    ? uploadedScene
    : ['https://picsum.photos/id/1071/800/600'];
  const customerSceneImages = uploadedScene;

  const ImageGroup = ({ 
    title,
    subtitle,
    color, 
    shadow, 
    max, 
    images = [],
    badge,
    customerMarked = false,
  }: { 
    title: string,
    subtitle?: string,
    color: string,
    shadow: string, 
    max: number, 
    images?: string[],
    badge?: React.ReactNode,
    customerMarked?: boolean,
  }) => (
    <div className="flex flex-col space-y-3">
      <div className={`flex items-center justify-between pb-1.5 border-b ${color.replace('bg-', 'border-')}`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm ${shadow}`}></div>
          <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-tight">{title}</h4>
          {badge}
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
            {customerMarked && (
              <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-indigo-600/90 text-white text-[7px] font-black uppercase tracking-wide leading-none">
                KH
              </span>
            )}
            
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
          images={sceneList}
          badge={sceneBadge}
          customerMarked={sceneCustomerMarked}
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

  const imagesOf = (shotId: string) =>
    shotId === 'A3' && customerSceneImages.length > 0 ? [] : (DEMO_SHOT_IMAGES[shotId] ?? []);

  const openShotDetail = (shot: RescueShotSlot, images: string[]) => {
    setDetailShot({ code: shot.id, label: shot.label, images, max: shot.max });
  };

  return (
    <div className="flex flex-col space-y-6">
      {RESCUE_PHOTO_SETS.map((set) => {
        const visibleShots = set.shots.filter((shot) => !readOnly || imagesOf(shot.id).length > 0);
        const showCustomer = set.id === 'A' && customerSceneImages.length > 0;
        if (readOnly && visibleShots.length === 0 && !showCustomer) return null;
        return (
        <div key={set.id} className="flex flex-col space-y-2">
          <div className={`flex items-center justify-between gap-2 pb-1.5 border-b ${set.color.replace('bg-', 'border-')}`}>
            <div className="flex items-center space-x-2 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${set.color} shadow-sm ${set.shadow}`} />
              <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-tight">
                {set.title}
              </h4>
              {set.id === 'A' && sceneBadge}
            </div>
            <span className="min-w-0 truncate text-right text-[10px] text-gray-400">{set.lead}</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {set.id === 'A' && customerSceneImages.length > 0 && (
              <div className="w-[108px] shrink-0 flex flex-col gap-1 text-left">
                <button
                  type="button"
                  className="aspect-square rounded-lg bg-gray-100 relative overflow-hidden border border-indigo-100"
                  onClick={() => {
                    if (customerSceneImages.length > 1) {
                      setDetailShot({
                        code: 'KH',
                        label: sceneCustomerMarked ? 'Ảnh khách hàng gửi' : 'Ảnh đính kèm từ tra cứu',
                        images: customerSceneImages,
                        max: customerSceneImages.length,
                        customerMarked: sceneCustomerMarked,
                      });
                    } else {
                      setPreviewUrl(customerSceneImages[0]);
                    }
                  }}
                >
                  <img src={customerSceneImages[0]} alt="Ảnh khách hàng" className="w-full h-full object-cover" />
                  {sceneCustomerMarked && (
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-indigo-600/90 text-white text-[7px] font-black uppercase leading-none">
                      KH
                    </span>
                  )}
                </button>
                <p className="text-[9px] font-bold text-gray-700 leading-tight line-clamp-2">
                  {sceneCustomerMarked ? 'Ảnh khách hàng gửi' : 'Ảnh đính kèm từ tra cứu'}
                </p>
              </div>
            )}
            {visibleShots.map((shot) => {
              const images = imagesOf(shot.id);
              const cover = images[0];
              const multiple = readOnly ? images.length > 1 : shot.max > 1;
              return (
                <div key={shot.id} className="w-[108px] shrink-0 flex flex-col gap-1 text-left">
                  <button
                    type="button"
                    aria-label={multiple ? `Xem các ảnh ${shot.label}` : shot.label}
                    className="aspect-square rounded-lg bg-white relative overflow-hidden border border-gray-200"
                    onClick={() => {
                      if (multiple) openShotDetail(shot, images);
                      else if (cover) setPreviewUrl(cover);
                    }}
                  >
                    {cover ? (
                      <img src={cover} alt={shot.label} className="w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-lg">
                        {readOnly ? <ImageIcon size={16} /> : <Upload size={16} />}
                      </span>
                    )}
                    {multiple && (
                      <span className="absolute top-1 right-1 rounded bg-black/65 px-1 py-0.5 text-[8px] font-bold text-white">
                        {images.length}/{shot.max}
                      </span>
                    )}
                  </button>
                  <p className="text-[9px] font-bold text-gray-700 leading-tight line-clamp-2">
                    <span className="text-gray-400">{shot.id}</span> {shot.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        );
      })}

      {detailShot && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setDetailShot(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-gray-800 truncate">
                  <span className="text-gray-400 mr-1">{detailShot.code}</span>
                  {detailShot.label}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{detailShot.images.length}/{detailShot.max} ảnh</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailShot(null)}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: readOnly ? detailShot.images.length : detailShot.max }, (_, idx) => {
                const src = detailShot.images[idx];
                if (!src) {
                  return (
                    <div
                      key={`${detailShot.code}-empty-${idx}`}
                      className="aspect-square rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300"
                    >
                      <ImageIcon size={16} />
                    </div>
                  );
                }
                return (
                  <button
                    key={`${detailShot.code}-${src}`}
                    type="button"
                    className="aspect-square rounded-lg overflow-hidden border border-gray-100 relative"
                    onClick={() => setPreviewUrl(src)}
                  >
                    <img src={src} alt={`${detailShot.label} ${idx + 1}`} className="w-full h-full object-cover" />
                    {detailShot.customerMarked && (
                      <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-indigo-600/90 text-white text-[7px] font-black uppercase leading-none">
                        KH
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
