import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Film,
  Info,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Video,
  VideoOff,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  CAMERA_POSITION_LABELS,
  RESCUE_CAMERA_DEMO_CASES,
  SYNC_STATUS_CONFIG,
  getRescueCameraMediaMock,
  type CameraPosition,
  type RescueCameraDemoCaseId,
  type RescueCameraPhoto,
  type RescueVideoClip,
} from '../data/rescueCameraMediaMockData';

type PositionFilter = 'ALL' | CameraPosition;
type MediaTab = 'photos' | 'video';

interface RescueVehicleCameraSectionProps {
  readOnly?: boolean;
}

function formatShortTime(dateTime: string): string {
  const timePart = dateTime.split(' ')[1];
  return timePart ? timePart.slice(0, 5) : dateTime;
}

const RescueVehicleCameraSection: React.FC<RescueVehicleCameraSectionProps> = ({ readOnly = true }) => {
  const [demoCase, setDemoCase] = useState<RescueCameraDemoCaseId>('with_media');
  const data = getRescueCameraMediaMock(demoCase);
  const syncCfg = SYNC_STATUS_CONFIG[data.syncStatus];
  const windowShort = `${formatShortTime(data.windowStart)} → ${formatShortTime(data.windowEnd)}`;

  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [mediaTab, setMediaTab] = useState<MediaTab>('video');
  const [previewPhoto, setPreviewPhoto] = useState<RescueCameraPhoto | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [clipIndex, setClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredPhotos = useMemo(() => {
    if (positionFilter === 'ALL') return data.photos;
    return data.photos.filter((p) => p.position === positionFilter);
  }, [data.photos, positionFilter]);

  const clipsForPlayer = useMemo(() => {
    const clips =
      positionFilter === 'ALL'
        ? data.clips
        : data.clips.filter((c) => c.position === positionFilter);
    return [...clips].sort((a, b) => {
      const byTime = a.startTime.localeCompare(b.startTime);
      if (byTime !== 0) return byTime;
      return a.position.localeCompare(b.position);
    });
  }, [data.clips, positionFilter]);

  const currentClip = clipsForPlayer[clipIndex];

  const handleSync = () => {
    if (readOnly) return;
    setIsSyncing(true);
    window.setTimeout(() => setIsSyncing(false), 1500);
  };

  const playClip = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, clipsForPlayer.length - 1));
      setClipIndex(next);
      setIsPlaying(true);
    },
    [clipsForPlayer.length]
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !currentClip) return;
    el.load();
    if (isPlaying) {
      void el.play().catch(() => setIsPlaying(false));
    }
  }, [currentClip, isPlaying]);

  const handleVideoEnded = () => {
    if (clipIndex < clipsForPlayer.length - 1) {
      setClipIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      void el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleDemoCaseChange = (caseId: RescueCameraDemoCaseId) => {
    setDemoCase(caseId);
    setClipIndex(0);
    setIsPlaying(false);
    setPreviewPhoto(null);
    setShowDetails(false);
  };

  const PositionPills = () => (
    <div className="flex flex-wrap gap-1.5">
      {(['ALL', 'FRONT', 'REAR'] as const).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            setPositionFilter(key);
            setClipIndex(0);
          }}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
            positionFilter === key
              ? 'bg-vetc-green text-white border-vetc-green shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-vetc-green/40'
          }`}
        >
          {key === 'ALL' ? 'Tất cả' : CAMERA_POSITION_LABELS[key]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 text-left">
      <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest shrink-0">
          Demo
        </span>
        {RESCUE_CAMERA_DEMO_CASES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleDemoCaseChange(item.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              demoCase === item.id
                ? 'bg-white border-blue-200 text-blue-800 shadow-sm'
                : 'bg-transparent border-transparent text-blue-600 hover:bg-white/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Toolbar: meta gọn + tabs + lọc cam */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${syncCfg.className}`}>
          {(isSyncing || data.syncStatus === 'SYNCING') && <Loader2 size={11} className="animate-spin" />}
          {isSyncing ? 'Đang đồng bộ...' : syncCfg.label}
        </span>

        <span className="text-[11px] text-gray-700 shrink-0">
          <strong className="font-bold">{data.vehiclePlate}</strong>
          <span className="text-gray-400 mx-1.5">·</span>
          <span className="text-gray-500">{windowShort}</span>
        </span>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className={`p-1 rounded-md border transition-colors ${
              showDetails
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title="Chi tiết đồng bộ"
            aria-expanded={showDetails}
          >
            <Info size={14} />
          </button>
          {showDetails && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Đóng chi tiết"
                onClick={() => setShowDetails(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-20 w-72 rounded-lg border border-slate-200 bg-white shadow-lg p-3 text-[10px] text-slate-600 space-y-2">
                <p className="font-bold text-slate-800">VnetGPS · Media API</p>
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  <span className="text-slate-400">Cam trước</span>
                  <span className="font-mono font-semibold text-slate-800">{data.imeiFront}</span>
                  <span className="text-slate-400">Cam sau</span>
                  <span className="font-mono font-semibold text-slate-800">{data.imeiRear}</span>
                  <span className="text-slate-400">Cửa sổ</span>
                  <span>{data.windowStart} → {data.windowEnd}</span>
                  <span className="text-slate-400">Tài xế đi</span>
                  <span>{data.driverDepartAt} (±{data.bufferMinutes}p)</span>
                </div>
                <p className="text-slate-500 border-t border-slate-100 pt-2">{data.syncMessage}</p>
              </div>
            </>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 rounded-md text-gray-400 hover:text-vetc-green hover:bg-green-50 transition-colors disabled:opacity-50 shrink-0"
            title="Đồng bộ lại"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        )}

        <div className="hidden sm:block w-px h-5 bg-gray-200 shrink-0" />

        <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={() => setMediaTab('photos')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              mediaTab === 'photos' ? 'bg-white shadow-sm text-vetc-green' : 'text-gray-500'
            }`}
          >
            <Camera size={13} />
            Ảnh ({filteredPhotos.length})
          </button>
          <button
            type="button"
            onClick={() => setMediaTab('video')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              mediaTab === 'video' ? 'bg-white shadow-sm text-vetc-green' : 'text-gray-500'
            }`}
          >
            <Video size={13} />
            Video
          </button>
        </div>

        <div className="flex-1 min-w-[8px]" />
        <PositionPills />
      </div>

      {mediaTab === 'photos' && (
        <div className="space-y-3">
          {filteredPhotos.length === 0 ? (
            <MediaEmptyState
              kind="photos"
              message="Không có ảnh từ camera trong cửa sổ thời gian"
              hint="Xe đã đồng bộ nhưng thiết bị không ghi/chụp ảnh trong khoảng tài xế đi ± buffer."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setPreviewPhoto(photo)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-gray-100 bg-gray-100 text-left shadow-sm ring-1 ring-black/5"
                >
                  <img src={photo.storageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 drop-shadow" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${
                      photo.position === 'FRONT' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'
                    }`}>
                      {CAMERA_POSITION_LABELS[photo.position]}
                    </span>
                    <p className="text-[8px] text-white font-semibold mt-0.5 truncate">{photo.capturedAt}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mediaTab === 'video' && (
        clipsForPlayer.length === 0 ? (
          <MediaEmptyState
            kind="video"
            message="Không có video từ camera trong cửa sổ thời gian"
            hint="Có thể camera tắt, mất tín hiệu, hoặc chưa ghi hình trong lúc cứu hộ."
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Player */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-gray-800 shadow-lg">
              {currentClip ? (
                <video
                  ref={videoRef}
                  key={currentClip.id}
                  src={currentClip.storageUrl}
                  className="w-full h-full object-contain"
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  playsInline
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
                  Không có clip video
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex items-center justify-between gap-2">
                <div className="text-white min-w-0">
                  <p className="text-[10px] font-bold truncate">
                    Clip {currentClip?.sequence}/{clipsForPlayer.length} · {CAMERA_POSITION_LABELS[currentClip?.position ?? 'FRONT']}
                  </p>
                  <p className="text-[9px] text-white/80 truncate">
                    {currentClip?.startTime} — {currentClip?.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => playClip(clipIndex - 1)}
                    disabled={clipIndex <= 0}
                    className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-vetc-green text-white shadow-lg hover:bg-green-600"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => playClip(clipIndex + 1)}
                    disabled={clipIndex >= clipsForPlayer.length - 1}
                    className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline P1 — các segment 3 phút */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Film size={12} />
                  Timeline hành trình (playlist P1)
                </span>
                <span className="text-[9px] text-gray-400">{clipsForPlayer.length} clip × ~3 phút</span>
              </div>
              <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden border border-gray-100">
                {clipsForPlayer.map((clip, idx) => (
                  <button
                    key={clip.id}
                    type="button"
                    title={`${clip.startTime} — ${clip.endTime}`}
                    onClick={() => playClip(idx)}
                    className={`flex-1 min-w-[8px] transition-all hover:opacity-90 ${
                      idx === clipIndex
                        ? clip.position === 'FRONT'
                          ? 'bg-blue-500 ring-2 ring-blue-300 ring-offset-1'
                          : 'bg-purple-500 ring-2 ring-purple-300 ring-offset-1'
                        : clip.position === 'FRONT'
                          ? 'bg-blue-200'
                          : 'bg-purple-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-gray-500">
                Demo phát nối tiếp: clip kết thúc → tự chuyển clip tiếp (preload/HLS trên BE để không giật).
              </p>
            </div>
          </div>

          {/* Clip list */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden flex flex-col max-h-[420px]">
            <div className="px-3 py-2 border-b bg-white text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Danh sách clip
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {clipsForPlayer.map((clip, idx) => (
                <ClipRow
                  key={clip.id}
                  clip={clip}
                  isActive={idx === clipIndex}
                  onSelect={() => playClip(idx)}
                />
              ))}
            </div>
          </div>
        </div>
        )
      )}

      {/* Photo lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20"
            onClick={() => setPreviewPhoto(null)}
          >
            <X size={24} />
          </button>
          <img
            src={previewPhoto.storageUrl}
            alt=""
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 text-center text-white space-y-1" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold">{CAMERA_POSITION_LABELS[previewPhoto.position]} · {previewPhoto.capturedAt}</p>
            <p className="text-xs text-white/70">{previewPhoto.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

function MediaEmptyState({
  kind,
  message,
  hint,
}: {
  kind: 'photos' | 'video';
  message: string;
  hint: string;
}) {
  const Icon = kind === 'photos' ? CameraOff : VideoOff;
  return (
    <div className="py-12 px-6 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/80">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
        <Icon size={22} />
      </div>
      <p className="text-sm font-bold text-gray-600">{message}</p>
      <p className="text-[11px] text-gray-400 mt-1.5 max-w-md mx-auto">{hint}</p>
    </div>
  );
}

function ClipRow({
  clip,
  isActive,
  onSelect,
}: {
  clip: RescueVideoClip;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all ${
        isActive
          ? 'bg-white border-vetc-green shadow-sm ring-1 ring-vetc-green/20'
          : 'bg-white/80 border-transparent hover:border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
          clip.position === 'FRONT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {CAMERA_POSITION_LABELS[clip.position]}
        </span>
        <span className="text-[9px] text-gray-400 font-mono">#{clip.sequence}</span>
      </div>
      <p className="text-[10px] font-semibold text-gray-800 mt-1">{clip.startTime}</p>
      <p className="text-[9px] text-gray-500">→ {clip.endTime} · 3 phút</p>
    </button>
  );
}

export default RescueVehicleCameraSection;
