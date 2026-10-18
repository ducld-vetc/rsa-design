import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Route, Truck, User } from 'lucide-react';
import {
  LOCATION_DEMO_CASES,
  LOCATION_LAYER_COLOR,
  formatLogClock,
  formatLogDateTime,
  getLocationLogDemo,
  motionLabel,
  sampleLocationLog,
  trackLengthKm,
  type LocationDemoCaseId,
  type LocationLogPoint,
  type LocationResourceType,
  type RescueAssignment,
} from '../data/rescueOrderLocationLogMock';

const MAP_FALLBACK: L.LatLngTuple = [21.0285, 105.8452];

function InvalidateOnResize() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);
    map.invalidateSize();
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function FitJourney({ points }: { points: L.LatLngTuple[] }) {
  const map = useMap();
  const key = points.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join('|');
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
  }, [map, key, points]);
  return null;
}

function dotIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  });
}

interface Trail {
  key: string;
  resourceType: LocationResourceType;
  label: string;
  color: string;
  points: LocationLogPoint[];
}

function buildTrails(points: LocationLogPoint[]): Trail[] {
  const groups = new Map<string, LocationLogPoint[]>();
  points.forEach((point) => {
    const key = `${point.resourceType}|${point.resourceId}`;
    const list = groups.get(key);
    if (list) list.push(point);
    else groups.set(key, [point]);
  });

  return Array.from(groups.entries()).map(([key, list]) => {
    const sorted = [...list].sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
    const first = sorted[0];
    return {
      key,
      resourceType: first.resourceType,
      label: first.resourceType === 'VEHICLE' ? first.plate : first.driverName,
      color: LOCATION_LAYER_COLOR[first.resourceType],
      points: sorted,
    };
  });
}

type LayerFilter = 'all' | LocationResourceType;

const RescueOrderLocationSection: React.FC = () => {
  const [demoCase, setDemoCase] = useState<LocationDemoCaseId>('handover');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [plateFilter, setPlateFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const demo = getLocationLogDemo(demoCase);
  const sampled = useMemo(() => sampleLocationLog(demo.points), [demo.points]);
  const plates = useMemo(
    () => Array.from(new Set(demo.assignments.map((item) => item.plate))),
    [demo.assignments]
  );
  const drivers = useMemo(
    () => Array.from(new Set(demo.assignments.map((item) => item.driverName))),
    [demo.assignments]
  );
  const visibleAssignments = useMemo(
    () =>
      demo.assignments.filter(
        (item) =>
          (plateFilter === 'all' || item.plate === plateFilter) &&
          (driverFilter === 'all' || item.driverName === driverFilter)
      ),
    [demo.assignments, plateFilter, driverFilter]
  );
  const visiblePoints = useMemo(() => {
    const orderIds = new Set(visibleAssignments.map((item) => item.resourceWorkOrderId));
    return sampled.filter(
      (point) =>
        orderIds.has(point.resourceWorkOrderId) &&
        (layerFilter === 'all' || point.resourceType === layerFilter)
    );
  }, [sampled, visibleAssignments, layerFilter]);
  const trails = useMemo(() => buildTrails(visiblePoints), [visiblePoints]);
  const selected = visiblePoints.find((point) => point.id === selectedId) ?? null;
  const fitPoints = trails.flatMap((trail) => trail.points.map((point) => [point.lat, point.lng] as L.LatLngTuple));

  useEffect(() => {
    setSelectedId(null);
    setPlateFilter('all');
    setDriverFilter('all');
    setLayerFilter('all');
  }, [demoCase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-[600px]">
      <div className="lg:col-span-8 bg-gray-100 relative min-h-[280px]">
        <MapContainer center={MAP_FALLBACK} zoom={13} className="h-full w-full absolute inset-0 z-0" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InvalidateOnResize />
          <FitJourney points={fitPoints} />
          {trails.map((trail) =>
            trail.points.length >= 2 ? (
              <Polyline
                key={trail.key}
                positions={trail.points.map((point) => [point.lat, point.lng] as L.LatLngTuple)}
                pathOptions={{
                  color: trail.color,
                  weight: trail.resourceType === 'VEHICLE' ? 5 : 3,
                  opacity: 0.9,
                  dashArray: trail.resourceType === 'STAFF' ? '7 6' : undefined,
                }}
              >
                <Tooltip sticky>
                  {trail.resourceType === 'VEHICLE' ? 'Xe' : 'Tài xế'} {trail.label}
                </Tooltip>
              </Polyline>
            ) : null
          )}
          {selected && (
            <Marker position={[selected.lat, selected.lng]} icon={dotIcon(LOCATION_LAYER_COLOR[selected.resourceType])}>
              <Tooltip direction="top" offset={[0, -8]} permanent>
                {selected.resourceType === 'VEHICLE' ? selected.plate : selected.driverName} · {formatLogClock(selected.capturedAt)}
              </Tooltip>
            </Marker>
          )}
        </MapContainer>

        {visiblePoints.length === 0 && (
          <div className="absolute inset-0 z-[350] flex items-center justify-center pointer-events-none">
            <div className="bg-white/95 border border-dashed border-gray-200 rounded-xl px-4 py-3 text-center shadow-sm">
              <p className="text-xs font-bold text-gray-600">Không có điểm để vẽ</p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-4 border-l flex flex-col bg-white overflow-hidden text-left min-h-0">
        <div className="p-3 border-b bg-gray-50/80 space-y-2">
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-1.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest shrink-0">Demo</span>
            {LOCATION_DEMO_CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDemoCase(item.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                  demoCase === item.id
                    ? 'bg-white border-blue-200 text-blue-800 shadow-sm'
                    : 'bg-transparent border-transparent text-blue-600 hover:bg-white/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect label="Xe" value={plateFilter} onChange={setPlateFilter} options={plates} />
            <FilterSelect label="Tài xế" value={driverFilter} onChange={setDriverFilter} options={drivers} />
          </div>
          <div className="flex gap-1">
            {(
              [
                ['all', 'Cả hai'],
                ['VEHICLE', 'Chỉ xe'],
                ['STAFF', 'Chỉ tài xế'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setLayerFilter(id)}
                className={`flex-1 rounded border px-1 py-1 text-[10px] font-bold ${
                  layerFilter === id
                    ? 'border-blue-200 bg-white text-blue-800 shadow-sm'
                    : 'border-transparent text-gray-500 hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
          {demo.assignments.length === 0 ? (
            <div className="py-10 px-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/80">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-gray-400 mb-3">
                <Route size={20} />
              </div>
              <p className="text-sm font-bold text-gray-600">Không có dữ liệu hành trình</p>
            </div>
          ) : visibleAssignments.length === 0 ? (
            <div className="py-8 px-3 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/80">
              <p className="text-sm font-bold text-gray-600">Không có lệnh khớp bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleAssignments.map((assignment) => (
                <AssignmentBlock
                  key={assignment.resourceWorkOrderId}
                  assignment={assignment}
                  points={visiblePoints.filter((point) => point.resourceWorkOrderId === assignment.resourceWorkOrderId)}
                  layerFilter={layerFilter}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[9px] font-black uppercase tracking-wide text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full truncate rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-800"
      >
        <option value="all">Tất cả</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AssignmentBlock({
  assignment,
  points,
  layerFilter,
  selectedId,
  onSelect,
}: {
  assignment: RescueAssignment;
  points: LocationLogPoint[];
  layerFilter: LayerFilter;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const vehiclePoints = points.filter((point) => point.resourceType === 'VEHICLE');
  const staffPoints = points.filter((point) => point.resourceType === 'STAFF');
  const km = trackLengthKm(vehiclePoints.length > 0 ? vehiclePoints : staffPoints);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 border-b space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">Lệnh {assignment.resourceWorkOrderId}</p>
            <p className="text-[10px] font-bold text-gray-500">{km.toFixed(2)} km</p>
          </div>
          <p className="text-[11px] font-bold text-gray-800">
            {formatLogDateTime(assignment.from)} → {formatLogClock(assignment.to)}
          </p>
          <p className="text-[11px] text-gray-700 flex items-center gap-1">
            <Truck size={12} className="text-blue-600 shrink-0" />
            Xe {assignment.plate}
          </p>
          <p className="text-[11px] text-gray-700 flex items-center gap-1">
            <User size={12} className="text-amber-600 shrink-0" />
            Tài xế {assignment.driverName}
          </p>
        </div>
        {layerFilter !== 'STAFF' && (
          <PointList title="Xe cứu hộ" tone="vehicle" points={vehiclePoints} selectedId={selectedId} onSelect={onSelect} />
        )}
        {layerFilter !== 'VEHICLE' && (
          <PointList title="Tài xế" tone="staff" points={staffPoints} selectedId={selectedId} onSelect={onSelect} />
        )}
      </div>
      {assignment.nextChange && <HandoverNote change={assignment.nextChange} />}
    </div>
  );
}

interface MotionSegment {
  id: string;
  type: 'Dừng' | 'Đi';
  points: LocationLogPoint[];
}

function groupByMotion(points: LocationLogPoint[]): MotionSegment[] {
  const sorted = [...points].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
  );
  const segments: MotionSegment[] = [];
  sorted.forEach((point) => {
    const type = motionLabel(point.speedKmh);
    const last = segments[segments.length - 1];
    if (last && last.type === type) last.points.push(point);
    else segments.push({ id: point.id, type, points: [point] });
  });
  return segments;
}

function segmentClock(segment: MotionSegment): string {
  const from = formatLogClock(segment.points[0].capturedAt);
  const to = formatLogClock(segment.points[segment.points.length - 1].capturedAt);
  return from === to ? from : `${from} → ${to}`;
}

function segmentPlace(segment: MotionSegment): string {
  const from = segment.points[0].address;
  const to = segment.points[segment.points.length - 1].address;
  return from === to ? from : `${from} → ${to}`;
}

function PointList({
  title,
  tone,
  points,
  selectedId,
  onSelect,
}: {
  title: string;
  tone: 'vehicle' | 'staff';
  points: LocationLogPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const toneClass = tone === 'vehicle' ? 'border-l-blue-500' : 'border-l-amber-500';
  const segments = groupByMotion(points);
  return (
    <div className={`px-3 py-2 border-t border-l-4 ${toneClass}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {title} · {segments.length} đoạn
      </p>
      <div className="space-y-0.5">
        {segments.map((segment) => {
          const moving = segment.type === 'Đi';
          const active = segment.points.some((point) => point.id === selectedId);
          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelect(segment.points[0].id)}
              className={`w-full text-left rounded-md px-1.5 py-1 ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <span className={`text-[10px] font-black uppercase ${moving ? 'text-blue-600' : 'text-amber-600'}`}>
                {segment.type}
              </span>
              <span className="text-[10px] font-bold text-gray-700 ml-1.5">{segmentClock(segment)}</span>
              <span className="block text-[10px] text-gray-500 truncate">
                <MapPin size={9} className="inline mr-0.5 text-gray-400" />
                {segmentPlace(segment)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HandoverNote({ change }: { change: NonNullable<RescueAssignment['nextChange']> }) {
  const isDriver = change.kind === 'driver';
  return (
    <div className={`rounded-lg border px-2.5 py-2 ${isDriver ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
      <p className={`text-[10px] font-black uppercase ${isDriver ? 'text-amber-700' : 'text-blue-700'}`}>
        {formatLogClock(change.at)} · {isDriver ? 'Đổi tài xế' : 'Đổi xe cứu hộ'}
      </p>
      <p className="text-[11px] font-bold text-gray-800 mt-0.5">
        {change.fromLabel} → {change.toLabel}
      </p>
      <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{change.keptLabel}</p>
    </div>
  );
}

export default RescueOrderLocationSection;
