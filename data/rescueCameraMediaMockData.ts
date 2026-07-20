export type CameraPosition = 'FRONT' | 'REAR';
export type CameraSyncStatus = 'READY' | 'SYNCING' | 'PARTIAL' | 'FAILED' | 'NO_DEVICE';

export interface RescueCameraPhoto {
  id: string;
  position: CameraPosition;
  capturedAt: string;
  storageUrl: string;
  address: string;
}

export interface RescueVideoClip {
  id: string;
  position: CameraPosition;
  sequence: number;
  startTime: string;
  endTime: string;
  durationSec: number;
  storageUrl: string;
}

export interface RescueCameraMediaBundle {
  orderId: string;
  syncStatus: CameraSyncStatus;
  syncMessage: string;
  imeiFront: string;
  imeiRear: string;
  vehiclePlate: string;
  driverDepartAt: string;
  completedAt: string;
  windowStart: string;
  windowEnd: string;
  bufferMinutes: number;
  photos: RescueCameraPhoto[];
  clips: RescueVideoClip[];
}

const SAMPLE_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const frontPhotos: RescueCameraPhoto[] = [
  { id: 'pf1', position: 'FRONT', capturedAt: '02/02/2026 13:50:00', storageUrl: 'https://picsum.photos/seed/cam-front-1/800/450', address: 'QL1A, Hà Nội' },
  { id: 'pf2', position: 'FRONT', capturedAt: '02/02/2026 13:55:00', storageUrl: 'https://picsum.photos/seed/cam-front-2/800/450', address: 'QL1A, Hà Nội' },
  { id: 'pf3', position: 'FRONT', capturedAt: '02/02/2026 14:00:00', storageUrl: 'https://picsum.photos/seed/cam-front-3/800/450', address: 'Đường Nguyễn Trãi, Hà Nội' },
  { id: 'pf4', position: 'FRONT', capturedAt: '02/02/2026 14:05:00', storageUrl: 'https://picsum.photos/seed/cam-front-4/800/450', address: 'Đường Nguyễn Trãi, Hà Nội' },
  { id: 'pf5', position: 'FRONT', capturedAt: '02/02/2026 14:10:00', storageUrl: 'https://picsum.photos/seed/cam-front-5/800/450', address: 'Hiện trường sự cố' },
  { id: 'pf6', position: 'FRONT', capturedAt: '02/02/2026 14:15:00', storageUrl: 'https://picsum.photos/seed/cam-front-6/800/450', address: 'Hiện trường sự cố' },
];

const rearPhotos: RescueCameraPhoto[] = [
  { id: 'pr1', position: 'REAR', capturedAt: '02/02/2026 13:50:00', storageUrl: 'https://picsum.photos/seed/cam-rear-1/800/450', address: 'QL1A, Hà Nội' },
  { id: 'pr2', position: 'REAR', capturedAt: '02/02/2026 13:55:00', storageUrl: 'https://picsum.photos/seed/cam-rear-2/800/450', address: 'QL1A, Hà Nội' },
  { id: 'pr3', position: 'REAR', capturedAt: '02/02/2026 14:00:00', storageUrl: 'https://picsum.photos/seed/cam-rear-3/800/450', address: 'Đường Nguyễn Trãi, Hà Nội' },
  { id: 'pr4', position: 'REAR', capturedAt: '02/02/2026 14:05:00', storageUrl: 'https://picsum.photos/seed/cam-rear-4/800/450', address: 'Đường Nguyễn Trãi, Hà Nội' },
  { id: 'pr5', position: 'REAR', capturedAt: '02/02/2026 14:10:00', storageUrl: 'https://picsum.photos/seed/cam-rear-5/800/450', address: 'Hiện trường sự cố' },
  { id: 'pr6', position: 'REAR', capturedAt: '02/02/2026 14:15:00', storageUrl: 'https://picsum.photos/seed/cam-rear-6/800/450', address: 'Hiện trường sự cố' },
];

function buildClips(position: CameraPosition, baseHour: number): RescueVideoClip[] {
  const slots = [
    { start: '13:49:00', end: '13:52:00' },
    { start: '13:52:00', end: '13:55:00' },
    { start: '13:55:00', end: '13:58:00' },
    { start: '13:58:00', end: '14:01:00' },
    { start: '14:01:00', end: '14:04:00' },
    { start: '14:04:00', end: '14:07:00' },
    { start: '14:07:00', end: '14:10:00' },
    { start: '14:10:00', end: '14:13:00' },
    { start: '14:13:00', end: '14:16:00' },
  ];
  return slots.map((slot, idx) => ({
    id: `${position.toLowerCase()}-clip-${idx + 1}`,
    position,
    sequence: idx + 1,
    startTime: `02/02/2026 ${slot.start}`,
    endTime: `02/02/2026 ${slot.end}`,
    durationSec: 180,
    storageUrl: SAMPLE_VIDEO,
  }));
}

export const RESCUE_CAMERA_MEDIA_MOCK: RescueCameraMediaBundle = {
  orderId: 'RS12605010004',
  syncStatus: 'READY',
  syncMessage: 'Đã đồng bộ 12 ảnh và 18 clip video từ VnetGPS (Media API).',
  imeiFront: '00BD000954',
  imeiRear: '00BD000A3B',
  vehiclePlate: '30H-12345',
  driverDepartAt: '02/02/2026 13:55:12',
  completedAt: '02/02/2026 14:15:40',
  windowStart: '02/02/2026 13:49:12',
  windowEnd: '02/02/2026 14:21:40',
  bufferMinutes: 6,
  photos: [...frontPhotos, ...rearPhotos],
  clips: [...buildClips('FRONT', 13), ...buildClips('REAR', 13)],
};

export const RESCUE_CAMERA_MEDIA_MOCK_EMPTY: RescueCameraMediaBundle = {
  orderId: 'RS12605010004',
  syncStatus: 'READY',
  syncMessage: 'Đã đồng bộ xong. Không có ảnh hoặc video trong cửa sổ thời gian.',
  imeiFront: '00BD000954',
  imeiRear: '00BD000A3B',
  vehiclePlate: '30H-12345',
  driverDepartAt: '02/02/2026 13:55:12',
  completedAt: '02/02/2026 14:15:40',
  windowStart: '02/02/2026 13:49:12',
  windowEnd: '02/02/2026 14:21:40',
  bufferMinutes: 6,
  photos: [],
  clips: [],
};

export type RescueCameraDemoCaseId = 'with_media' | 'empty';

export const RESCUE_CAMERA_DEMO_CASES: { id: RescueCameraDemoCaseId; label: string }[] = [
  { id: 'with_media', label: 'Có ảnh & video' },
  { id: 'empty', label: 'Không có media' },
];

export function getRescueCameraMediaMock(caseId: RescueCameraDemoCaseId): RescueCameraMediaBundle {
  return caseId === 'empty' ? RESCUE_CAMERA_MEDIA_MOCK_EMPTY : RESCUE_CAMERA_MEDIA_MOCK;
}

export const CAMERA_POSITION_LABELS: Record<CameraPosition, string> = {
  FRONT: 'Cam trước',
  REAR: 'Cam sau',
};

export const SYNC_STATUS_CONFIG: Record<
  CameraSyncStatus,
  { label: string; className: string }
> = {
  READY: { label: 'Đã đồng bộ', className: 'bg-green-50 text-green-700 border-green-200' },
  SYNCING: { label: 'Đang lấy dữ liệu', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PARTIAL: { label: 'Thiếu một phần', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAILED: { label: 'Lỗi đồng bộ', className: 'bg-red-50 text-red-700 border-red-200' },
  NO_DEVICE: { label: 'Chưa gắn camera', className: 'bg-gray-50 text-gray-600 border-gray-200' },
};
