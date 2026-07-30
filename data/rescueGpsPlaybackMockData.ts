export type GpsPlaybackSegmentType = 'stop' | 'route';

export interface GpsPlaybackSegment {
  id: string;
  type: GpsPlaybackSegmentType;
  totalDistanceKm: number;
  startTime: string;
  endTime: string;
  startAddress: string;
  endAddress: string;
  statusDuration: string;
}

export interface RescueGpsPlaybackBundle {
  orderId: string;
  deviceId: number;
  vehiclePlate: string;
  driverDepartAt: string;
  windowStart: string;
  windowEnd: string;
  bufferMinutes: number;
  segments: GpsPlaybackSegment[];
  syncMessage: string;
}

const SEGMENTS_WITH_DATA: GpsPlaybackSegment[] = [
  {
    id: 'seg-1',
    type: 'stop',
    totalDistanceKm: 0.05,
    startTime: '02/02/2026 13:49:12',
    endTime: '02/02/2026 13:55:00',
    startAddress: 'Trạm cứu hộ Hà Nội',
    endAddress: 'Trạm cứu hộ Hà Nội',
    statusDuration: '00:05:48',
  },
  {
    id: 'seg-2',
    type: 'route',
    totalDistanceKm: 2.15,
    startTime: '02/02/2026 13:55:00',
    endTime: '02/02/2026 14:05:30',
    startAddress: 'Trạm cứu hộ Hà Nội',
    endAddress: 'Đường Nguyễn Trãi, Hà Nội',
    statusDuration: '00:10:30',
  },
  {
    id: 'seg-3',
    type: 'stop',
    totalDistanceKm: 0.02,
    startTime: '02/02/2026 14:05:30',
    endTime: '02/02/2026 14:15:40',
    startAddress: 'Hiện trường sự cố — Phường Nam Hoa Lư',
    endAddress: 'Hiện trường sự cố — Phường Nam Hoa Lư',
    statusDuration: '00:10:10',
  },
];

export const RESCUE_GPS_PLAYBACK_MOCK: RescueGpsPlaybackBundle = {
  orderId: 'RS12605010004',
  deviceId: 5157040,
  vehiclePlate: '30H-12345',
  driverDepartAt: '02/02/2026 13:55:12',
  windowStart: '02/02/2026 13:49:12',
  windowEnd: '02/02/2026 14:21:40',
  bufferMinutes: 6,
  segments: SEGMENTS_WITH_DATA,
  syncMessage: 'Đã lấy 3 chặng hành trình từ VnetGPS map/playback.',
};

export const RESCUE_GPS_PLAYBACK_MOCK_EMPTY: RescueGpsPlaybackBundle = {
  ...RESCUE_GPS_PLAYBACK_MOCK,
  segments: [],
  syncMessage: 'Đã đồng bộ xong. API trả về result rỗng — không có dữ liệu hành trình trong cửa sổ thời gian.',
};

export type GpsPlaybackDemoCaseId = 'with_data' | 'empty';

export const GPS_PLAYBACK_DEMO_CASES: { id: GpsPlaybackDemoCaseId; label: string }[] = [
  { id: 'with_data', label: 'Có hành trình' },
  { id: 'empty', label: 'Không có dữ liệu' },
];

export function getRescueGpsPlaybackMock(caseId: GpsPlaybackDemoCaseId): RescueGpsPlaybackBundle {
  return caseId === 'empty' ? RESCUE_GPS_PLAYBACK_MOCK_EMPTY : RESCUE_GPS_PLAYBACK_MOCK;
}

export const GPS_SEGMENT_TYPE_LABELS: Record<GpsPlaybackSegmentType, string> = {
  stop: 'Dừng',
  route: 'Di chuyển',
};
