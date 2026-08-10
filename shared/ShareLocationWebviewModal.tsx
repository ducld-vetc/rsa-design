import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Check,
  ChevronDown,
  Loader2,
  LocateFixed,
  MessageSquare,
  Pencil,
  Phone,
  Play,
  Star,
  Truck,
  User,
  Video,
  X,
} from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RatingVersion, RATING_TYPE_LABELS } from './ratingTypes';

const CUSTOMER_RATING_TYPES = ['customer_vetc', 'customer_driver', 'customer_workshop'] as const;
type CustomerRatingType = (typeof CUSTOMER_RATING_TYPES)[number];

const CUSTOMER_RATING_CATEGORIES = ['Bình thường', 'Khen ngợi', 'Góp ý nhẹ', 'Khiếu nại'];

const STEPS = ['Chờ cứu hộ', 'Tài xế đang đến', 'Đang cứu hộ', 'Hoàn thành cứu hộ'] as const;

const MAX_INCIDENT_MEDIA = 4;

/** Trạng thái cho phép khách upload ảnh/video sự cố */
export const INCIDENT_UPLOAD_STATUSES = [
  'WAITING_CONFIRM',
  'CONFIRMED',
  'WAITING_PROVIDER_ACCEPT',
  'WAITING_DRIVER_ACCEPT',
  // Legacy demo portal
  'RECEIVE-NEW',
  'RECEIVE-PROCESSING',
  'DISPATCH-SEARCHING',
  'DISPATCH-ASSIGNED',
] as const;

export const canUploadIncidentMedia = (status: string): boolean =>
  (INCIDENT_UPLOAD_STATUSES as readonly string[]).includes(status);

type MobilePhase = 'waiting' | 'moving' | 'rescuing' | 'completed';

interface IncidentMediaItem {
  id: string;
  file: File;
  previewUrl: string;
  kind: 'image' | 'video';
}

/** Ánh xạ trạng thái portal → giai đoạn hiển thị trên Webview khách hàng */
export const getMobilePhase = (status: string): MobilePhase => {
  if (status === 'FINISH-COMPLETED') return 'completed';
  if (['EXECUTE-ARRIVED', 'EXECUTE-RESCUING'].includes(status)) return 'rescuing';
  if (status === 'EXECUTE-MOVING') return 'moving';
  if (
    canUploadIncidentMedia(status) ||
    ['RECEIVE-NEW', 'RECEIVE-PROCESSING', 'DISPATCH-SEARCHING', 'DISPATCH-ASSIGNED'].includes(status)
  ) {
    return 'waiting';
  }
  return 'waiting';
};

const phaseToStepIndex: Record<MobilePhase, number> = {
  waiting: 0,
  moving: 1,
  rescuing: 2,
  completed: 3,
};

export interface ShareLocationWebviewData {
  orderId: string;
  plate: string;
  orderTypeLabel: string;
  customerName: string;
  customerPhone: string;
  rescueAddress: string;
  towingDestination: string;
  rescueLat?: number;
  rescueLng?: number;
  towingLat?: number;
  towingLng?: number;
  /** Vị trí trạm cứu hộ (điểm xuất phát) */
  stationLat?: number;
  stationLng?: number;
  /** Vị trí tài xế realtime (khi đã nhận / đang đến) */
  driverLat?: number;
  driverLng?: number;
  /** Thông tin tài xế cứu hộ (hiện khi đã gán / đang thực thi) */
  driverName?: string;
  driverPhone?: string;
  driverVehicleType?: string;
  driverVehiclePlate?: string;
  stationName?: string;
  currentStatus: string;
  services: string[];
  createdAt?: string;
  /** 3 loại đánh giá khách hàng (đồng bộ với màn Giám sát & Thực thi) */
  customerRatings?: Partial<Record<CustomerRatingType, RatingVersion[]>>;
}

interface ShareLocationWebviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShareLocationWebviewData;
}

const StatusStepper: React.FC<{ activeIndex: number; completed: boolean }> = ({
  activeIndex,
  completed,
}) => (
  <div className="px-4 py-3">
    <div className="flex items-start justify-between relative">
      <div className="absolute top-[11px] left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute top-[11px] left-[10%] h-0.5 bg-[#00A859] z-0 transition-all duration-500"
        style={{
          width: completed ? '80%' : `${(activeIndex / (STEPS.length - 1)) * 80}%`,
        }}
      />
      {STEPS.map((label, idx) => {
        const isDone = completed || idx < activeIndex;
        const isActive = !completed && idx === activeIndex;
        return (
          <div key={label} className="flex flex-col items-center z-10 w-[22%]">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone
                  ? 'bg-[#00A859] border-[#00A859] text-white'
                  : isActive
                  ? 'bg-white border-[#00A859] ring-2 ring-[#00A859]/20'
                  : 'bg-white border-gray-300'
              }`}
            >
              {isDone ? (
                <Check size={13} strokeWidth={3} />
              ) : (
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#00A859]' : 'bg-gray-300'}`} />
              )}
            </div>
            <p
              className={`text-[9px] font-bold text-center mt-1.5 leading-tight ${
                isDone || isActive ? 'text-[#00A859]' : 'text-gray-400'
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

/** Vị trí cứu hộ — ghim đỏ */
const rescueMapIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#EF4444;border:2.5px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 26],
});

/** Điểm kéo xe về — tròn cam */
const towingMapIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;background:#EA580C;border:2.5px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

/** Vị trí trạm — tròn xanh dương + icon xe */
const stationMapIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#2563EB;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Vị trí tài xế — tròn xanh lá */
const driverMapIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#00A859;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.35)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 17h14v-5H5z"/><path d="M7 12V7l2-2h6l2 2v5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const toLatLng = (lat?: number, lng?: number): L.LatLngTuple | null => {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

const MapResizeFix: React.FC<{ active?: boolean }> = ({ active }) => {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    fix();
    const t1 = window.setTimeout(fix, 80);
    const t2 = window.setTimeout(fix, 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [map, active]);
  return null;
};

const MapFitBounds: React.FC<{ points: L.LatLngTuple[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
    }
    window.setTimeout(() => map.invalidateSize(), 50);
  }, [map, points]);
  return null;
};

const MiniMap: React.FC<{
  rescueLat?: number;
  rescueLng?: number;
  towingLat?: number;
  towingLng?: number;
  stationLat?: number;
  stationLng?: number;
  driverLat?: number;
  driverLng?: number;
  /** Hiện marker tài xế khi đã qua giai đoạn chờ */
  showDriver?: boolean;
  /** Đang tự lấy GPS vị trí cứu hộ */
  locatingRescue?: boolean;
  /** Cho phép hiện nút lấy vị trí khi thiếu điểm cứu hộ */
  showLocateButton?: boolean;
  onRequestLocation?: () => void;
  active?: boolean;
}> = ({
  rescueLat,
  rescueLng,
  towingLat,
  towingLng,
  stationLat,
  stationLng,
  driverLat,
  driverLng,
  showDriver,
  locatingRescue,
  showLocateButton,
  onRequestLocation,
  active,
}) => {
  const rescuePoint = useMemo(
    () => toLatLng(rescueLat, rescueLng),
    [rescueLat, rescueLng]
  );
  const stationPoint = useMemo(
    () => toLatLng(stationLat, stationLng),
    [stationLat, stationLng]
  );
  const towingPoint = useMemo(
    () => toLatLng(towingLat, towingLng),
    [towingLat, towingLng]
  );
  const driverPoint = useMemo(
    () => (showDriver ? toLatLng(driverLat, driverLng) : null),
    [showDriver, driverLat, driverLng]
  );

  /** Tuyến chính: Trạm → Cứu hộ → Kéo xe về (bỏ qua điểm thiếu) */
  const routeLine = useMemo((): L.LatLngTuple[] => {
    const pts: L.LatLngTuple[] = [];
    if (stationPoint) pts.push(stationPoint);
    if (rescuePoint) pts.push(rescuePoint);
    if (towingPoint) pts.push(towingPoint);
    return pts;
  }, [stationPoint, rescuePoint, towingPoint]);

  const mapPoints = useMemo(() => {
    const pts = [...routeLine];
    if (driverPoint) pts.push(driverPoint);
    return pts;
  }, [routeLine, driverPoint]);

  const mapCenter: L.LatLngTuple = rescuePoint ?? stationPoint ?? towingPoint ?? [21.0285, 105.8452];

  /** Thiếu điểm cứu hộ → ưu tiên empty/locating, không hiện map lệch với điểm phụ */
  if (!rescuePoint) {
    return (
      <div className="w-full h-44 relative border-y border-amber-200 bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center gap-2 px-5 text-center">
        {locatingRescue ? (
          <>
            <Loader2 size={28} className="text-[#00A859] animate-spin" />
            <p className="text-xs font-bold text-gray-800">Đang lấy vị trí hiện tại…</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Vui lòng cho phép trình duyệt truy cập vị trí để xác định điểm cứu hộ.
            </p>
          </>
        ) : (
          <>
            <LocateFixed size={28} className="text-amber-500" />
            <p className="text-xs font-bold text-gray-800">Chưa có vị trí cứu hộ trên bản đồ</p>
            <p className="text-[10px] text-gray-500 leading-relaxed max-w-[280px]">
              Nhấn nút bên dưới để lấy vị trí hiện tại hoặc nhập địa chỉ thủ công.
            </p>
            {showLocateButton && onRequestLocation && (
              <button
                type="button"
                onClick={onRequestLocation}
                className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#00A859] text-white text-[11px] font-black hover:bg-green-700 shadow-sm transition-colors"
              >
                <LocateFixed size={13} />
                Lấy vị trí hiện tại
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-44 relative border-y border-gray-200 z-0 isolate">
      <MapContainer
        center={mapCenter}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <MapResizeFix active={active} />
        <MapFitBounds points={mapPoints} />
        {routeLine.length >= 2 && (
          <Polyline
            positions={routeLine}
            pathOptions={{ color: '#00A859', weight: 3, opacity: 0.8, dashArray: '6 5' }}
          />
        )}
        {driverPoint && rescuePoint && (
          <Polyline
            positions={[driverPoint, rescuePoint]}
            pathOptions={{ color: '#00A859', weight: 2.5, opacity: 0.55, dashArray: '2 6' }}
          />
        )}
        {stationPoint && <Marker position={stationPoint} icon={stationMapIcon} />}
        {rescuePoint && <Marker position={rescuePoint} icon={rescueMapIcon} />}
        {towingPoint && <Marker position={towingPoint} icon={towingMapIcon} />}
        {driverPoint && <Marker position={driverPoint} icon={driverMapIcon} />}
      </MapContainer>
      <div className="absolute top-1.5 left-2 right-2 flex flex-wrap gap-1 pointer-events-none z-[500]">
        {stationPoint && (
          <span className="text-[8px] font-bold text-blue-700 bg-white/95 px-1.5 py-0.5 rounded border border-blue-100">
            Trạm
          </span>
        )}
        {rescuePoint && (
          <span className="text-[8px] font-bold text-red-600 bg-white/95 px-1.5 py-0.5 rounded border border-red-100">
            Cứu hộ
          </span>
        )}
        {towingPoint && (
          <span className="text-[8px] font-bold text-orange-700 bg-white/95 px-1.5 py-0.5 rounded border border-orange-100">
            Kéo về
          </span>
        )}
        {driverPoint && (
          <span className="text-[8px] font-bold text-[#00A859] bg-white/95 px-1.5 py-0.5 rounded border border-green-100">
            Tài xế
          </span>
        )}
      </div>
      <div className="absolute bottom-1.5 right-2 text-[8px] text-gray-600 bg-white/90 px-1.5 py-0.5 rounded pointer-events-none z-[500]">
        © OpenStreetMap
      </div>
    </div>
  );
};

/** Popup xin cấp quyền truy cập vị trí (trước khi gọi GPS trình duyệt) */
const LocationPermissionPopup: React.FC<{
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
}> = ({ isOpen, onAllow, onDeny }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/45 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 pt-5 pb-4 text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
              <LocateFixed size={26} className="text-[#00A859]" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-black text-gray-900">Cho phép truy cập vị trí?</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                VETC cần vị trí hiện tại của bạn để xác định điểm cứu hộ chính xác và điều phối tài xế
                nhanh hơn.
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-left space-y-1.5">
              <p className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                <Check size={12} className="text-[#00A859]" /> Chỉ dùng khi bạn đang yêu cầu cứu hộ
              </p>
              <p className="text-[10px] font-bold text-gray-700 flex items-center gap-1.5">
                <Check size={12} className="text-[#00A859]" /> Có thể tắt quyền bất cứ lúc nào trong
                trình duyệt
              </p>
            </div>
          </div>
          <div className="px-4 pb-4 space-y-2">
            <button
              type="button"
              onClick={onAllow}
              className="w-full py-2.5 rounded-full bg-[#00A859] text-white text-xs font-black hover:bg-green-700 transition-colors"
            >
              Cho phép truy cập vị trí
            </button>
            <button
              type="button"
              onClick={onDeny}
              className="w-full py-2.5 rounded-full border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Để sau
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Dòng địa chỉ có thể chỉnh sửa — full width trong khung mobile */
const EditableLocationRow: React.FC<{
  label: string;
  value: string;
  editable: boolean;
  editing: boolean;
  onStartEdit: () => void;
  onChange: (v: string) => void;
  onDone: () => void;
  /** Highlight nhẹ khi thiếu vị trí cứu hộ */
  missingHighlight?: boolean;
  locateError?: string | null;
  locateSuccessHint?: string | null;
}> = ({
  label,
  value,
  editable,
  editing,
  onStartEdit,
  onChange,
  onDone,
  missingHighlight,
  locateError,
  locateSuccessHint,
}) => (
  <div
    className={`w-full px-4 py-3 border-b last:border-b-0 ${
      missingHighlight ? 'bg-amber-50/50 border-amber-100' : 'border-gray-100 bg-white'
    }`}
  >
    <div className="flex items-center justify-between gap-2 mb-1">
      <p className="text-[11px] font-black text-gray-500 uppercase">{label}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        {editable && !editing && (
          <button
            type="button"
            onClick={onStartEdit}
            className="flex items-center gap-1 text-[10px] font-bold text-[#00A859] hover:text-green-700 px-2 py-0.5 rounded-full border border-green-200 bg-green-50 transition-colors"
          >
            <Pencil size={11} />
            Đổi
          </button>
        )}
        {editing && (
          <button
            type="button"
            onClick={onDone}
            className="text-[10px] font-bold text-[#00A859] hover:text-green-700"
          >
            Xong
          </button>
        )}
      </div>
    </div>
    {editing ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        autoFocus
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#00A859] resize-none bg-white leading-relaxed"
      />
    ) : (
      <p className="text-xs text-gray-800 leading-relaxed w-full">
        {value?.trim() ? (
          value
        ) : (
          <span className="text-gray-400 italic">Chưa có thông tin vị trí</span>
        )}
      </p>
    )}
    {locateError && (
      <p className="mt-1.5 text-[10px] text-red-500 leading-relaxed">{locateError}</p>
    )}
    {!locateError && locateSuccessHint && (
      <p className="mt-1.5 text-[10px] text-[#00A859] font-medium leading-relaxed flex items-center gap-1">
        <Check size={12} />
        {locateSuccessHint}
      </p>
    )}
  </div>
);

/** Upload ảnh/video sự cố — tối đa 4 file */
const IncidentMediaUpload: React.FC<{
  items: IncidentMediaItem[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}> = ({ items, onAdd, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAddMore = items.length < MAX_INCIDENT_MEDIA;
  const [previewItem, setPreviewItem] = useState<IncidentMediaItem | null>(null);

  return (
    <div>
      <p className="text-sm font-black text-gray-900 mb-1">Hình ảnh sự cố</p>
      <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
        Vui lòng chụp ảnh hoặc quay video hiện trường rõ toàn bộ xe, biển số và hiện trạng hư hỏng để hỗ trợ
        xử lý nhanh và chính xác.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shrink-0 group"
          >
            <button
              type="button"
              onClick={() => setPreviewItem(item)}
              className="w-full h-full cursor-pointer"
              title="Xem trước"
            >
              {item.kind === 'image' ? (
                <img src={item.previewUrl} alt="Ảnh sự cố" className="w-full h-full object-cover" />
              ) : (
                <div className="relative w-full h-full bg-gray-900">
                  <video
                    src={item.previewUrl}
                    className="w-full h-full object-cover opacity-90"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25">
                    <Play size={22} className="text-white drop-shadow" />
                    <span className="text-[8px] font-bold mt-1 uppercase text-white">Video</span>
                  </div>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.id);
                if (previewItem?.id === item.id) setPreviewItem(null);
              }}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 z-10"
              title="Xóa"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#00A859] hover:text-[#00A859] transition-colors shrink-0"
          >
            <Camera size={22} />
            <span className="text-[10px] font-bold mt-1 flex items-center gap-0.5">
              <Video size={10} />
              {items.length}/{MAX_INCIDENT_MEDIA}
            </span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewItem(null)}
          >
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
              title="Đóng"
            >
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-full max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {previewItem.kind === 'image' ? (
                <img
                  src={previewItem.previewUrl}
                  alt="Xem trước ảnh sự cố"
                  className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
              ) : (
                <video
                  src={previewItem.previewUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[85vh] max-w-full rounded-xl shadow-2xl bg-black"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StarPicker: React.FC<{
  stars: number;
  interactive?: boolean;
  onChange?: (n: number) => void;
  size?: number;
}> = ({ stars, interactive, onChange, size = 20 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onChange?.(i)}
        className={interactive ? 'hover:scale-110 transition-transform' : 'cursor-default'}
      >
        <Star
          size={size}
          className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      </button>
    ))}
    {stars > 0 && (
      <span className="ml-1 text-xs font-black text-amber-600">{stars}.0</span>
    )}
  </div>
);

/** Thẻ đánh giá 1 mục — giao diện mobile cho khách hàng */
const GuestCustomerRatingCard: React.FC<{
  type: CustomerRatingType;
  versions: RatingVersion[];
}> = ({ type, versions }) => {
  const latest = versions[versions.length - 1];
  const hasRating = versions.length > 0;
  const [expanded, setExpanded] = useState(!hasRating);
  const [draftStars, setDraftStars] = useState(0);
  const [draftCategory, setDraftCategory] = useState(CUSTOMER_RATING_CATEGORIES[0]);
  const [draftContent, setDraftContent] = useState('');
  const [submitted, setSubmitted] = useState(hasRating);

  useEffect(() => {
    setSubmitted(hasRating);
    setExpanded(!hasRating);
    if (latest) {
      setDraftStars(latest.stars);
      setDraftCategory(latest.category ?? CUSTOMER_RATING_CATEGORIES[0]);
      setDraftContent(latest.content);
    }
  }, [hasRating, latest]);

  const title = RATING_TYPE_LABELS[type];

  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        hasRating || submitted ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50/80'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-gray-50/80 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-gray-500 uppercase leading-tight">{title}</p>
          <div className="mt-1.5">
            {hasRating || submitted ? (
              <StarPicker stars={hasRating ? latest!.stars : draftStars} size={16} />
            ) : (
              <span className="text-[10px] font-bold text-gray-400 italic">Chưa đánh giá</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!hasRating && !submitted && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
              Mới
            </span>
          )}
          {(hasRating || submitted) && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-green-100 text-green-700">
              Đã gửi
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 space-y-3">
          {hasRating || submitted ? (
            <>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Phân loại</p>
                <p className="text-xs text-gray-800 font-medium">
                  {hasRating ? latest!.category ?? 'Bình thường' : draftCategory}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                  <MessageSquare size={11} /> Nội dung đánh giá
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {hasRating && latest!.content
                    ? latest!.content
                    : draftContent || 'Không có nội dung mô tả'}
                </p>
              </div>
              {hasRating && latest!.ratedAt && (
                <p className="text-[9px] text-gray-400">Gửi lúc: {latest!.ratedAt}</p>
              )}
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Số sao đánh giá *</p>
                <StarPicker stars={draftStars} interactive onChange={setDraftStars} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Phân loại</p>
                <select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#00A859] bg-white"
                >
                  {CUSTOMER_RATING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Nội dung đánh giá</p>
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#00A859] resize-none"
                />
              </div>
              <button
                type="button"
                disabled={draftStars < 1}
                onClick={() => setSubmitted(true)}
                className="w-full py-2.5 rounded-lg bg-[#00A859] text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
              >
                Gửi đánh giá
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ShareLocationWebviewModal: React.FC<ShareLocationWebviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [vehicleNote, setVehicleNote] = useState('');
  const [mediaItems, setMediaItems] = useState<IncidentMediaItem[]>([]);
  const mediaItemsRef = useRef(mediaItems);
  mediaItemsRef.current = mediaItems;

  const [rescueAddress, setRescueAddress] = useState(data.rescueAddress);
  const [towingDestination, setTowingDestination] = useState(data.towingDestination);
  const [rescueLat, setRescueLat] = useState<number | undefined>(data.rescueLat);
  const [rescueLng, setRescueLng] = useState<number | undefined>(data.rescueLng);
  const [towingLat, setTowingLat] = useState<number | undefined>(data.towingLat);
  const [towingLng, setTowingLng] = useState<number | undefined>(data.towingLng);
  const [editingRescue, setEditingRescue] = useState(false);
  const [editingTow, setEditingTow] = useState(false);
  const [locatingRescue, setLocatingRescue] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [locateSuccessHint, setLocateSuccessHint] = useState<string | null>(null);
  const [isLocationPermissionOpen, setIsLocationPermissionOpen] = useState(false);
  const autoPermissionPromptedRef = useRef(false);

  const phase = useMemo(() => getMobilePhase(data.currentStatus), [data.currentStatus]);
  const stepIndex = phaseToStepIndex[phase];
  const isCompleted = phase === 'completed';
  const showUpdateForm = canUploadIncidentMedia(data.currentStatus);
  const showDriverCard =
    Boolean(data.driverName) &&
    (phase === 'moving' || phase === 'rescuing' || phase === 'completed');
  const showCustomerRatings = isCompleted;
  const showServices = (showUpdateForm || isCompleted) && data.services.length > 0;
  const showDriverOnMap = phase === 'moving' || phase === 'rescuing';

  const applyRescueCoords = (latitude: number, longitude: number) => {
    const label = `Vị trí hiện tại (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    setRescueLat(latitude);
    setRescueLng(longitude);
    setRescueAddress((prev) => (prev.trim() ? prev : label));
    setLocateSuccessHint('Đã lấy vị trí hiện tại thành công.');
    setLocateError(null);
  };

  /** Mở popup xin quyền (in-app) trước khi gọi GPS trình duyệt */
  const openLocationPermission = () => {
    setLocateError(null);
    setLocateSuccessHint(null);
    setIsLocationPermissionOpen(true);
  };

  const fetchCurrentLocation = () => {
    setLocateError(null);
    setLocateSuccessHint(null);
    if (!('geolocation' in navigator)) {
      setLocateError('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setLocatingRescue(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        applyRescueCoords(latitude, longitude);
        setLocatingRescue(false);
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? 'Bạn chưa cấp quyền truy cập vị trí. Vui lòng bật quyền trong trình duyệt và thử lại.'
            : 'Không lấy được vị trí. Vui lòng thử lại hoặc nhập thủ công.';
        setLocateError(msg);
        setLocatingRescue(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleAllowLocationPermission = () => {
    setIsLocationPermissionOpen(false);
    // Cho popup đóng xong rồi mới gọi GPS → hiện prompt native của trình duyệt
    window.setTimeout(() => fetchCurrentLocation(), 180);
  };

  const handleDenyLocationPermission = () => {
    setIsLocationPermissionOpen(false);
    setLocateError('Bạn đã từ chối chia sẻ vị trí. Có thể thử lại bất cứ lúc nào hoặc nhập địa chỉ thủ công.');
  };

  useEffect(() => {
    if (!isOpen) {
      autoPermissionPromptedRef.current = false;
      setIsLocationPermissionOpen(false);
      return;
    }
    setRescueAddress(data.rescueAddress);
    setTowingDestination(data.towingDestination);
    setRescueLat(data.rescueLat);
    setRescueLng(data.rescueLng);
    setTowingLat(data.towingLat);
    setTowingLng(data.towingLng);
    setEditingRescue(false);
    setEditingTow(false);
    setLocatingRescue(false);
    setLocateError(null);
    setLocateSuccessHint(null);
    setIsLocationPermissionOpen(false);
    setVehicleNote('');
    setMediaItems([]);
    autoPermissionPromptedRef.current = false;
  }, [
    isOpen,
    data.rescueAddress,
    data.towingDestination,
    data.rescueLat,
    data.rescueLng,
    data.towingLat,
    data.towingLng,
  ]);

  /** Khi thiếu vị trí cứu hộ → luôn hiện popup xin quyền ngay khi mở webview */
  useEffect(() => {
    if (!isOpen || !showUpdateForm || autoPermissionPromptedRef.current) return;
    const missing =
      !data.rescueAddress.trim() || data.rescueLat == null || data.rescueLng == null;
    if (!missing) return;
    autoPermissionPromptedRef.current = true;
    const t = window.setTimeout(() => setIsLocationPermissionOpen(true), 280);
    return () => window.clearTimeout(t);
  }, [isOpen, showUpdateForm, data.rescueAddress, data.rescueLat, data.rescueLng]);

  const needsRescueLocation =
    showUpdateForm &&
    (!rescueAddress.trim() || rescueLat == null || rescueLng == null);

  const handleAddMedia = (files: FileList) => {
    const slotsLeft = MAX_INCIDENT_MEDIA - mediaItems.length;
    const picked = Array.from(files).slice(0, slotsLeft);
    const added: IncidentMediaItem[] = picked.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    setMediaItems((prev) => [...prev, ...added]);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
  }, []);

  const formattedTime = data.createdAt ?? new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative flex flex-col items-center max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal chrome */}
            <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-1">
              <p className="text-white text-sm font-bold">Xem trước Webview khách hàng</p>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Phone frame */}
            <div className="w-[390px] max-h-[calc(95vh-48px)] bg-white rounded-[2rem] shadow-2xl border-[6px] border-gray-800 overflow-hidden flex flex-col relative">
              <LocationPermissionPopup
                isOpen={isLocationPermissionOpen}
                onAllow={handleAllowLocationPermission}
                onDeny={handleDenyLocationPermission}
              />
              {/* Scrollable mobile content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {/* Header */}
                <div className="px-4 pt-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-base font-black text-gray-900">Yêu cầu cứu hộ</h1>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-[#00A859] border border-green-200">
                          {data.orderTypeLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 font-medium">
                        {data.orderId} • {formattedTime}
                      </p>
                    </div>
                    <div className="shrink-0 bg-[#00A859] text-white text-xs font-black px-3 py-2 rounded-lg tracking-wide">
                      {data.plate}
                    </div>
                  </div>
                </div>

                {!isCompleted && (
                  <MiniMap
                    rescueLat={rescueLat}
                    rescueLng={rescueLng}
                    towingLat={towingLat}
                    towingLng={towingLng}
                    stationLat={
                      rescueLat != null && rescueLng != null ? data.stationLat : undefined
                    }
                    stationLng={
                      rescueLat != null && rescueLng != null ? data.stationLng : undefined
                    }
                    driverLat={data.driverLat}
                    driverLng={data.driverLng}
                    showDriver={showDriverOnMap && rescueLat != null && rescueLng != null}
                    locatingRescue={locatingRescue}
                    showLocateButton={showUpdateForm && needsRescueLocation}
                    onRequestLocation={openLocationPermission}
                    active={isOpen}
                  />
                )}

                {/* Tài xế cứu hộ — hiện khi đã có thông tin tài xế (đang đến / đang cứu hộ / hoàn thành) */}
                {showDriverCard && (
                  <div className="mx-4 mt-4 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">
                        Tài xế cứu hộ
                      </p>
                      {(phase === 'moving' || phase === 'rescuing') && (
                        <span className="text-[9px] font-bold text-[#00A859] bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
                          {phase === 'moving' ? 'Đang đến' : 'Đang cứu hộ'}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#00A859]/10 border border-[#00A859]/20 flex items-center justify-center shrink-0">
                        <User size={22} className="text-[#00A859]" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-sm font-black text-gray-900 truncate">{data.driverName}</p>
                        {data.stationName && (
                          <p className="text-[10px] text-gray-500 truncate">{data.stationName}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                          {data.driverPhone && (
                            <a
                              href={`tel:${data.driverPhone}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#00A859] hover:text-green-700"
                            >
                              <Phone size={12} />
                              {data.driverPhone}
                            </a>
                          )}
                          {(data.driverVehicleType || data.driverVehiclePlate) && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                              <Truck size={12} className="text-gray-400 shrink-0" />
                              <span className="truncate">
                                {[data.driverVehicleType, data.driverVehiclePlate]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {data.driverPhone && (
                        <a
                          href={`tel:${data.driverPhone}`}
                          className="shrink-0 w-9 h-9 rounded-full bg-[#00A859] text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                          title="Gọi tài xế"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Địa chỉ — full width */}
                <div className="w-full mt-0 border-b border-gray-100 bg-white">
                  <EditableLocationRow
                    label="Vị trí cứu hộ"
                    value={rescueAddress}
                    editable={showUpdateForm}
                    editing={editingRescue}
                    onStartEdit={() => {
                      setEditingTow(false);
                      setEditingRescue(true);
                    }}
                    onChange={setRescueAddress}
                    onDone={() => setEditingRescue(false)}
                    missingHighlight={needsRescueLocation}
                    locateError={locateError}
                    locateSuccessHint={locateSuccessHint}
                  />
                  <EditableLocationRow
                    label="Vị trí kéo xe về"
                    value={towingDestination}
                    editable={showUpdateForm}
                    editing={editingTow}
                    onStartEdit={() => {
                      setEditingRescue(false);
                      setEditingTow(true);
                    }}
                    onChange={setTowingDestination}
                    onDone={() => setEditingTow(false)}
                  />
                </div>

                {/* Stepper */}
                <div className="mt-4 border-t border-b border-gray-100">
                  <StatusStepper activeIndex={stepIndex} completed={isCompleted} />
                </div>

                {/* Form cập nhật: upload ảnh/video + mô tả (Chờ xác nhận / Đã xác nhận / Điều phối) */}
                {showUpdateForm && (
                  <div className="px-4 py-4 space-y-4">
                    <IncidentMediaUpload
                      items={mediaItems}
                      onAdd={handleAddMedia}
                      onRemove={handleRemoveMedia}
                    />
                    <div>
                      <p className="text-sm font-black text-gray-900 mb-2">Mô tả tình trạng xe</p>
                      <textarea
                        value={vehicleNote}
                        onChange={(e) => setVehicleNote(e.target.value)}
                        placeholder="VD: Lốp trước bên phải bị nổ, không có lốp dự phòng..."
                        rows={4}
                        readOnly={false}
                        autoComplete="off"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859]/30 resize-none bg-white leading-relaxed pointer-events-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Đánh giá từ khách hàng — 3 loại (hoàn thành) */}
                {showCustomerRatings && (
                  <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Đánh giá từ Khách hàng
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed -mt-1 mb-2">
                      Vui lòng đánh giá trải nghiệm của bạn theo từng hạng mục bên dưới.
                    </p>
                    {CUSTOMER_RATING_TYPES.map((type) => (
                      <GuestCustomerRatingCard
                        key={type}
                        type={type}
                        versions={data.customerRatings?.[type] ?? []}
                      />
                    ))}
                  </div>
                )}

                {/* Dịch vụ */}
                {showServices && (
                  <div className="px-4 pb-4">
                    <p className="text-sm font-black text-gray-900 mb-2">Dịch vụ</p>
                    <div className="space-y-2">
                      {data.services.map((svc) => (
                        <div
                          key={svc}
                          className="rounded-xl border-2 border-[#00A859] px-3 py-2.5 bg-white"
                        >
                          <p className="text-xs font-bold text-[#00A859] leading-relaxed">{svc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="shrink-0 px-4 py-4 border-t border-gray-100 bg-white space-y-2">
                {showUpdateForm && (
                  <button
                    type="button"
                    className="w-full py-3 rounded-full bg-[#00A859] text-white text-sm font-black hover:bg-green-700 transition-colors"
                  >
                    Cập nhật yêu cầu
                  </button>
                )}
                <button
                  type="button"
                  className="w-full py-3 rounded-full border-2 border-[#00A859] text-[#00A859] text-sm font-black hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={16} />
                  Gọi CSKH
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareLocationWebviewModal;
