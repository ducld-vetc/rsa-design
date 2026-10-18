export type LocationResourceType = 'VEHICLE' | 'STAFF';
export type LocationDemoCaseId = 'single' | 'handover' | 'empty';

export const LOCATION_SAMPLE_STEP_MS = 2 * 60 * 1000;
const RAW_STEP_MS = 30 * 1000;

export interface LocationLogPoint {
  id: string;
  rescueOrderId: string;
  resourceWorkOrderId: string;
  resourceType: LocationResourceType;
  resourceId: string;
  plate: string;
  driverId: string;
  driverName: string;
  lat: number;
  lng: number;
  speedKmh: number;
  address: string;
  capturedAt: string;
}

export interface AssignmentChange {
  at: string;
  kind: 'driver' | 'vehicle';
  fromLabel: string;
  toLabel: string;
  keptLabel: string;
}

export interface RescueAssignment {
  resourceWorkOrderId: string;
  plate: string;
  vehicleId: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  nextChange?: AssignmentChange;
}

export interface LocationLogDemo {
  id: LocationDemoCaseId;
  orderId: string;
  note: string;
  assignments: RescueAssignment[];
  points: LocationLogPoint[];
}

export const LOCATION_DEMO_CASES: { id: LocationDemoCaseId; label: string }[] = [
  { id: 'handover', label: 'Nhiều xe, nhiều tài xế' },
  { id: 'single', label: 'Một xe, một tài xế' },
  { id: 'empty', label: 'Không có dữ liệu' },
];

export const LOCATION_LAYER_COLOR: Record<LocationResourceType, string> = {
  VEHICLE: '#2563EB',
  STAFF: '#D97706',
};

interface Waypoint {
  at: string;
  lat: number;
  lng: number;
  speedKmh: number;
  address: string;
}

const ORDER_ID = 'RS12605010004';

const VEHICLE_A = 'veh-30H12345';
const VEHICLE_B = 'veh-29C67890';
const DRIVER_A = 'staff-nguyen-van-a';
const DRIVER_B = 'staff-tran-van-b';
const PLATE_A = '30H-12345';
const PLATE_B = '29C-67890';
const NAME_A = 'Nguyễn Văn A';
const NAME_B = 'Trần Văn B';

function iso(h: number, m: number, s = 0): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `2026-02-02T${pad(h)}:${pad(m)}:${pad(s)}+07:00`;
}

function formatCapturedAt(ms: number): string {
  const shifted = new Date(ms + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}+07:00`;
}

function buildTrack(input: {
  resourceWorkOrderId: string;
  resourceType: LocationResourceType;
  resourceId: string;
  plate: string;
  driverId: string;
  driverName: string;
  waypoints: Waypoint[];
  latOffset?: number;
  lngOffset?: number;
}): LocationLogPoint[] {
  const { waypoints } = input;
  const points: LocationLogPoint[] = [];
  const push = (ms: number, lat: number, lng: number, speedKmh: number, address: string) => {
    points.push({
      id: `${input.resourceWorkOrderId}-${input.resourceType}-${points.length}`,
      rescueOrderId: ORDER_ID,
      resourceWorkOrderId: input.resourceWorkOrderId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      plate: input.plate,
      driverId: input.driverId,
      driverName: input.driverName,
      lat: lat + (input.latOffset ?? 0),
      lng: lng + (input.lngOffset ?? 0),
      speedKmh,
      address,
      capturedAt: formatCapturedAt(ms),
    });
  };

  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const t0 = new Date(from.at).getTime();
    const t1 = new Date(to.at).getTime();
    for (let t = t0; t < t1; t += RAW_STEP_MS) {
      const u = (t - t0) / (t1 - t0);
      push(
        t,
        from.lat + (to.lat - from.lat) * u,
        from.lng + (to.lng - from.lng) * u,
        Math.round(from.speedKmh + (to.speedKmh - from.speedKmh) * u),
        u < 0.15 ? from.address : to.address
      );
    }
  }
  const last = waypoints[waypoints.length - 1];
  push(new Date(last.at).getTime(), last.lat, last.lng, last.speedKmh, last.address);
  return points;
}

const station: Waypoint = { at: iso(13, 49), lat: 21.0168, lng: 105.8019, speedKmh: 0, address: 'Trạm cứu hộ Hà Nội' };
const moving: Waypoint = { at: iso(13, 57), lat: 21.0244, lng: 105.8288, speedKmh: 32, address: 'Đường Nguyễn Trãi, Hà Nội' };
const driverHandover: Waypoint = { at: iso(14, 5), lat: 21.0302, lng: 105.848, speedKmh: 18, address: 'Ngã tư Nguyễn Trãi' };
const vehicleHandover: Waypoint = { at: iso(14, 21), lat: 21.0348, lng: 105.8625, speedKmh: 0, address: 'Hiện trường — Nam Hoa Lư' };
const towPoint: Waypoint = { at: iso(14, 41), lat: 21.0265, lng: 105.882, speedKmh: 12, address: 'Điểm kéo — Giải Phóng' };

function pair(resourceWorkOrderId: string, plate: string, vehicleId: string, driverId: string, driverName: string, waypoints: Waypoint[]): LocationLogPoint[] {
  return [
    ...buildTrack({
      resourceWorkOrderId,
      resourceType: 'VEHICLE',
      resourceId: vehicleId,
      plate,
      driverId,
      driverName,
      waypoints,
    }),
    ...buildTrack({
      resourceWorkOrderId,
      resourceType: 'STAFF',
      resourceId: driverId,
      plate,
      driverId,
      driverName,
      waypoints,
      latOffset: 0.0022,
      lngOffset: -0.0016,
    }),
  ];
}

const HANDOVER_ASSIGNMENTS: RescueAssignment[] = [
  {
    resourceWorkOrderId: '16326',
    plate: PLATE_A,
    vehicleId: VEHICLE_A,
    driverId: DRIVER_A,
    driverName: NAME_A,
    from: iso(13, 49),
    to: iso(14, 5),
    nextChange: {
      at: iso(14, 5),
      kind: 'driver',
      fromLabel: NAME_A,
      toLabel: NAME_B,
      keptLabel: `Xe ${PLATE_A} giữ nguyên. Đường xe nối tiếp qua lệnh mới.`,
    },
  },
  {
    resourceWorkOrderId: '16337',
    plate: PLATE_A,
    vehicleId: VEHICLE_A,
    driverId: DRIVER_B,
    driverName: NAME_B,
    from: iso(14, 5),
    to: iso(14, 21),
    nextChange: {
      at: iso(14, 21),
      kind: 'vehicle',
      fromLabel: PLATE_A,
      toLabel: PLATE_B,
      keptLabel: `Tài xế ${NAME_B} giữ nguyên. Đường tài xế nối tiếp qua lệnh mới.`,
    },
  },
  {
    resourceWorkOrderId: '16348',
    plate: PLATE_B,
    vehicleId: VEHICLE_B,
    driverId: DRIVER_B,
    driverName: NAME_B,
    from: iso(14, 21),
    to: iso(14, 41),
  },
];

const SINGLE_ASSIGNMENT: RescueAssignment = {
  resourceWorkOrderId: '16326',
  plate: PLATE_A,
  vehicleId: VEHICLE_A,
  driverId: DRIVER_A,
  driverName: NAME_A,
  from: iso(13, 49),
  to: iso(14, 21),
};

const DEMOS: Record<LocationDemoCaseId, LocationLogDemo> = {
  handover: {
    id: 'handover',
    orderId: ORDER_ID,
    note: 'Ba lệnh nối tiếp trên một đơn. Mỗi thời điểm chỉ một xe và một tài xế.',
    assignments: HANDOVER_ASSIGNMENTS,
    points: [
      ...pair('16326', PLATE_A, VEHICLE_A, DRIVER_A, NAME_A, [station, moving, driverHandover]),
      ...pair('16337', PLATE_A, VEHICLE_A, DRIVER_B, NAME_B, [driverHandover, vehicleHandover]),
      ...pair('16348', PLATE_B, VEHICLE_B, DRIVER_B, NAME_B, [vehicleHandover, towPoint]),
    ],
  },
  single: {
    id: 'single',
    orderId: ORDER_ID,
    note: 'Một lệnh, một xe, một tài xế suốt cửa sổ đi.',
    assignments: [SINGLE_ASSIGNMENT],
    points: pair('16326', PLATE_A, VEHICLE_A, DRIVER_A, NAME_A, [station, moving, driverHandover, vehicleHandover]),
  },
  empty: {
    id: 'empty',
    orderId: ORDER_ID,
    note: 'Đơn chưa có điểm trong rescue_order_location_log.',
    assignments: [],
    points: [],
  },
};

export function getLocationLogDemo(caseId: LocationDemoCaseId): LocationLogDemo {
  return DEMOS[caseId];
}

/** Mỗi lệnh, mỗi lớp (xe hoặc tài xế): giữ điểm đầu, rồi điểm cách điểm đã giữ ít nhất 2 phút, và điểm cuối. */
export function sampleLocationLog(points: LocationLogPoint[], stepMs = LOCATION_SAMPLE_STEP_MS): LocationLogPoint[] {
  const groups = new Map<string, LocationLogPoint[]>();
  points.forEach((point) => {
    const key = `${point.resourceWorkOrderId}|${point.resourceType}|${point.resourceId}`;
    const list = groups.get(key);
    if (list) list.push(point);
    else groups.set(key, [point]);
  });

  const kept: LocationLogPoint[] = [];
  groups.forEach((list) => {
    list.sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    let lastKept = -Infinity;
    list.forEach((point, index) => {
      const at = new Date(point.capturedAt).getTime();
      const isLast = index === list.length - 1;
      if (at - lastKept >= stepMs || isLast) {
        kept.push(point);
        lastKept = at;
      }
    });
  });

  kept.sort((a, b) => {
    const byTime = new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime();
    if (byTime !== 0) return byTime;
    if (a.resourceWorkOrderId !== b.resourceWorkOrderId) return a.resourceWorkOrderId.localeCompare(b.resourceWorkOrderId);
    return a.resourceType.localeCompare(b.resourceType);
  });
  return kept;
}

export function formatLogClock(isoValue: string): string {
  const shifted = new Date(new Date(isoValue).getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

export function formatLogDateTime(isoValue: string): string {
  const shifted = new Date(new Date(isoValue).getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(shifted.getUTCDate())}/${pad(shifted.getUTCMonth() + 1)}/${shifted.getUTCFullYear()} ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
}

export function motionLabel(speedKmh: number): 'Dừng' | 'Đi' {
  return speedKmh < 3 ? 'Dừng' : 'Đi';
}

function haversineKm(a: LocationLogPoint, b: LocationLogPoint): number {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function trackLengthKm(points: LocationLogPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineKm(points[i - 1], points[i]);
  return total;
}
