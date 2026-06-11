
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Map as MapIcon,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Star,
  ChevronRight,
  ChevronLeft,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  statusCards,
  slaWarnings,
  funnelSteps,
  kpiMetrics,
  weeklyOrders,
  drivers,
  resources,
  alerts,
  mapTrips,
  orderChartFilters,
  type MiniBarItem,
  type KpiMetricCard,
} from './rsa-dashboard/mockDashboardData';
import DashboardFilterModal from './rsa-dashboard/DashboardFilterModal';
import KpiPartnerStationDriverDetail from './rsa-dashboard/KpiPartnerStationDriverDetail';
import ResourcesTab from './rsa-dashboard/ResourcesTab';
import HeatmapTab from './rsa-dashboard/HeatmapTab';
import type { KpiDetailTab } from './rsa-dashboard/kpiDetailData';
import {
  defaultDashboardFilters,
  countActiveFilters,
  partnerOptions,
  stationOptions,
  allStationOptions,
  provinceOptions,
  wardOptions,
  type DashboardFilterValues,
} from './rsa-dashboard/dashboardFilterData';

const incidentIcon = L.divIcon({
  html: `<div style="width:34px;height:34px;background:#ef4444;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.35);position:relative">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    <span style="position:absolute;top:-2px;right:-2px;width:12px;height:12px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px">!</span>
  </div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const vehicleIcon = L.divIcon({
  html: `<div style="width:34px;height:34px;background:white;border:2.5px solid #00A859;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.25)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A859" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
};

const TripRouteLines: React.FC<{
  trip: (typeof mapTrips)[number];
  highlighted: boolean;
}> = ({ trip, highlighted }) => {
  const color = highlighted ? trip.color : '#9CA3AF';
  const weight = highlighted ? 6 : 3;
  const opacity = highlighted ? 0.95 : 0.35;
  const segments: [number, number][][] = [
    [trip.vehicle, trip.incident],
    ...(trip.garage ? [[trip.incident, trip.garage] as [number, number][]] : []),
  ];

  return (
    <>
      {segments.map((positions, i) => (
        <Polyline
          key={i}
          positions={positions}
          pathOptions={{ color, weight, opacity, lineCap: 'round', lineJoin: 'round' }}
        />
      ))}
    </>
  );
};

const TripTooltipContent: React.FC<{ trip: (typeof mapTrips)[number] }> = ({ trip }) => (
  <div className="min-w-[180px]">
    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00A859] text-white text-[10px] font-black uppercase">
      {trip.statusLabel}
    </span>
    <p className="text-sm font-bold text-gray-900 mt-2">
      {trip.eta}, {trip.distance}
    </p>
    <p className="text-xs text-gray-500 mt-1 font-semibold">
      {trip.vehiclePlate} | {trip.vehicleModel}
    </p>
    <p className="text-[10px] text-gray-400 mt-1">{trip.orderId}</p>
  </div>
);

const TripMarker: React.FC<{
  trip: (typeof mapTrips)[number];
  position: [number, number];
  type: 'incident' | 'vehicle';
  showTooltip: boolean;
  onHover: () => void;
  onLeave: () => void;
}> = ({ trip, position, type, showTooltip, onHover, onLeave }) => (
  <Marker
    position={position}
    icon={type === 'incident' ? incidentIcon : vehicleIcon}
    eventHandlers={{
      mouseover: onHover,
      mouseout: onLeave,
    }}
  >
    {showTooltip && (
      <Tooltip permanent direction="top" offset={[0, -20]} className="map-trip-tooltip">
        <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3">
          <TripTooltipContent trip={trip} />
        </div>
      </Tooltip>
    )}
  </Marker>
);

const formatNumber = (n: number) => n.toLocaleString('vi-VN');

const MiniBarChart: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const greens = ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46'];

  return (
    <div className="flex items-end justify-end gap-1.5 h-16">
      {data.map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-sm"
          style={{
            height: `${(h / max) * 100}%`,
            minHeight: 6,
            backgroundColor: greens[i] ?? greens[greens.length - 1],
          }}
        />
      ))}
    </div>
  );
};

const StatusMetricCard: React.FC<{
  card: (typeof statusCards)[number];
  wide?: boolean;
  onClick?: () => void;
}> = ({ card, wide = false, onClick }) => {
  const shell = `${wide ? 'xl:flex-[2] w-full xl:w-auto' : 'xl:flex-1 min-w-[140px]'} flex-shrink-0`;
  const interactive = onClick
    ? 'cursor-pointer hover:border-[#00A859]/40 hover:shadow-md transition-all'
    : '';

  if (card.variant === 'total') {
    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        className={`${shell} bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between min-h-[108px] ${interactive}`}
      >
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
          <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
          {card.trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-sm font-bold text-[#00A859]">
              <TrendingUp size={14} strokeWidth={2.5} />
              +{card.trend}%
            </div>
          )}
        </div>
        {card.barChart && <MiniBarChart data={card.barChart} />}
      </div>
    );
  }

  if (card.variant === 'progress') {
    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        className={`${shell} bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col justify-between min-h-[108px] ${interactive}`}
      >
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
          <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
        </div>
        <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${card.progressPercent ?? 0}%`,
              backgroundColor: card.progressColor,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      className={`${shell} bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col justify-between min-h-[108px] ${interactive}`}
    >
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
        <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
      </div>
      {card.subLabel && (
        <p className="text-xs text-gray-400 mt-4">{card.subLabel}</p>
      )}
    </div>
  );
};

const miniBarColor = (tone: MiniBarItem['tone']) => {
  switch (tone) {
    case 'red': return '#E8A0A0';
    case 'light-red': return '#F5C4C4';
    case 'light-green': return '#C8E6C9';
    case 'medium-green': return '#4CAF50';
    case 'dark-green': return '#1B7A45';
    default: return '#C8E6C9';
  }
};

const PanelTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{children}</h3>
);

const MiniSlaBarChart: React.FC<{ bars: MiniBarItem[] }> = ({ bars }) => (
  <div className="w-full flex items-end gap-2 h-[88px] mt-auto pt-5">
    {bars.map((bar, i) => (
      <div key={i} className="flex-1 flex items-end h-full min-w-0">
        <div
          className="w-full rounded-t-xl"
          style={{
            height: `${bar.height}%`,
            minHeight: 14,
            backgroundColor: miniBarColor(bar.tone),
          }}
        />
      </div>
    ))}
  </div>
);

const ConversionFunnelPanel: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <PanelTitle>Phễu chuyển đổi</PanelTitle>
    <div className="mt-4 space-y-2">
      {funnelSteps.map((step) => (
        <div key={step.label} className="w-full">
          <div
            className="h-11 rounded-lg flex items-center justify-between px-4 min-w-[120px] transition-all"
            style={{ width: `${step.percent}%`, backgroundColor: step.color }}
          >
            <span className="text-white text-xs font-bold whitespace-nowrap">
              {step.label} ({step.percent}%)
            </span>
            <span className="text-white text-sm font-black ml-2">{formatNumber(step.count)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DriverManagementPanel: React.FC = () => {
  const barColor = (kpi: number) => {
    if (kpi >= 80) return 'bg-[#00A859]';
    if (kpi >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <PanelTitle>Quản lý tài xế</PanelTitle>
      <div className="mt-4 space-y-4">
        {drivers.map((driver) => (
          <div key={driver.id}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{driver.name}</p>
                <p className="text-[11px] text-gray-400">{driver.vehicle}</p>
              </div>
              <span className={`text-xs font-black shrink-0 ${driver.kpi >= 80 ? 'text-[#00A859]' : driver.kpi >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                {driver.kpi}% KPI
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor(driver.kpi)}`} style={{ width: `${driver.kpi}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResourcesPanel: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <PanelTitle>Nguồn lực</PanelTitle>
    <div className="mt-4 grid grid-cols-3 gap-3">
      {[
        { label: 'Trạm', value: resources.stations },
        { label: 'Xe', value: resources.vehicles },
        { label: 'Tài xế', value: resources.drivers },
      ].map((item) => (
        <div key={item.label} className="bg-gray-50 rounded-xl py-4 px-2 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</p>
          <p className="text-2xl font-black text-[#00A859] mt-1">{item.value}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#00A859]">
      <span className="w-2 h-2 rounded-full bg-[#00A859]" />
      {resources.activePercent}% Đang hoạt động
    </div>
  </div>
);

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 26 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => {
      const fill = Math.min(Math.max(rating - i, 0), 1);
      return (
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <Star size={size} className="text-gray-200 absolute inset-0" fill="currentColor" stroke="none" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star size={size} className="text-amber-400" fill="currentColor" stroke="none" />
          </div>
        </div>
      );
    })}
  </div>
);

const KpiMetricCardView: React.FC<{ card: KpiMetricCard }> = ({ card }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col ${
      card.variant === 'csat' ? 'min-h-[200px]' : 'min-h-[210px]'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <PanelTitle>{card.label}</PanelTitle>
      {card.trend !== undefined && (
        <div className="flex items-center gap-1 text-sm font-bold text-[#00A859]">
          <TrendingUp size={14} strokeWidth={2.5} />
          +{card.trend}%
        </div>
      )}
    </div>

    {card.variant === 'csat' ? (
      <>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-end gap-1 leading-none">
            <span className="text-[40px] font-black text-gray-900">{card.value}</span>
            {card.valueMax && (
              <span className="text-lg font-semibold text-gray-400 pb-1">/{card.valueMax}</span>
            )}
          </div>
          {card.stars !== undefined && <StarRating rating={card.stars} size={28} />}
        </div>
        <div className="flex items-center justify-between mt-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phân bố hài lòng</p>
          <p className="text-[11px] font-black text-gray-700 uppercase">{card.satisfactionLabel}</p>
        </div>
        <div className="mt-2 h-2.5 rounded-full overflow-hidden flex">
          {card.satisfactionSegments?.map((seg, i) => (
            <div
              key={i}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
            />
          ))}
        </div>
      </>
    ) : (
      <>
        <p className="text-[40px] font-black text-[#00A859] mt-1 leading-none">{card.value}</p>
        {card.miniBars && <MiniSlaBarChart bars={card.miniBars} />}
      </>
    )}
  </div>
);

const AlertsListPanel: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[480px]">
    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Cảnh báo</h3>
      <button className="text-xs font-bold text-[#00A859] hover:underline">Xem tất cả</button>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow"
        >
          <div className="w-1 rounded-full bg-red-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-black uppercase">
                  {alert.type}
                </span>
                <p className="text-xs font-black text-gray-900 mt-1.5 truncate">{alert.orderId}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-red-500">{alert.delay}</p>
                <p className="text-[10px] text-gray-400 mt-1">CSKH: {alert.cskh}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const OrderSummaryPanel: React.FC = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState<(typeof orderChartFilters)[number]>('7 ngày qua');
  const maxWeekly = Math.max(...weeklyOrders.map((d) => d.count));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      <div className="px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Tổng hợp đơn</h3>
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  className="p-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-vetc-green transition-colors"
                  aria-label="Bộ lọc biểu đồ"
                >
                  <SlidersHorizontal size={14} />
                </button>
                {filterOpen && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                    {orderChartFilters.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setChartFilter(opt); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${
                          chartFilter === opt ? 'text-vetc-green bg-green-50' : 'text-gray-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Cập nhật lúc: 09:45 AM</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Xu hướng</p>
            <div className="flex items-center justify-end gap-1 text-sm font-bold text-[#00A859] mt-0.5">
              <TrendingUp size={14} strokeWidth={2.5} />
              +2.4%
            </div>
          </div>
        </div>
        {chartFilter !== '7 ngày qua' && (
          <p className="text-[10px] text-vetc-green font-semibold mt-2">Đang lọc: {chartFilter}</p>
        )}
      </div>
      <div className="px-5 py-4 flex-1">
        <div className="flex items-end justify-between gap-3 h-44">
          {weeklyOrders.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end gap-2">
              <div className="w-full flex-1 flex items-end">
                <div className="w-full h-full bg-gray-100 rounded-t-lg relative flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      d.highlighted ? 'bg-[#00A859]' : 'bg-[#6EE7B7]'
                    }`}
                    style={{ height: `${(d.count / maxWeekly) * 100}%`, minHeight: 10 }}
                  />
                </div>
              </div>
              <span className={`text-xs ${d.highlighted ? 'font-black text-gray-900' : 'font-semibold text-gray-500'}`}>
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SlaWarningPanel: React.FC = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
      <Gauge size={18} className="text-[#00A859]" strokeWidth={2.5} />
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Cảnh báo SLA</h3>
    </div>
    <div className="px-5 py-2 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <th className="text-left py-3 font-bold w-[50%]">Chỉ số</th>
            <th className="text-center py-3 w-14 font-bold">SL</th>
            <th className="text-right py-3 font-bold w-[34%]">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {slaWarnings.map((row) => (
            <tr key={row.metric} className="border-t border-gray-50 align-middle">
              <td className="py-3.5 pr-2 font-semibold text-gray-800 truncate">{row.metric}</td>
              <td className="py-3.5 text-center font-black text-gray-900">{row.quantity}</td>
              <td className="py-3.5 text-right whitespace-nowrap">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                    row.status === 'risk'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}
                >
                  {row.status === 'risk' ? 'Rủi ro' : 'Cảnh báo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MonitoringMapPanel: React.FC<{
  focusedIndex: number;
  onPrev: () => void;
  onNext: () => void;
  dimmed?: boolean;
}> = ({ focusedIndex, onPrev, onNext, dimmed = false }) => {
  const [hovered, setHovered] = useState<{ tripId: string; anchor: 'incident' | 'vehicle' } | null>(null);
  const focusedTrip = mapTrips[focusedIndex];
  const mapCenter: [number, number] = [
    (focusedTrip.incident[0] + focusedTrip.vehicle[0]) / 2,
    (focusedTrip.incident[1] + focusedTrip.vehicle[1]) / 2,
  ];

  const tooltipTripId = hovered?.tripId ?? focusedTrip.id;
  const tooltipAnchor = hovered?.anchor ?? 'vehicle';

  return (
    <div className={`rsa-dashboard-map bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[560px] relative z-0 isolate ${dimmed ? 'pointer-events-none' : ''}`}>
      <div className="relative flex-1 min-h-[520px] z-0">
        <MapContainer center={mapCenter} zoom={13} className="h-full w-full absolute inset-0 z-0" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={mapCenter} zoom={13} />
          {mapTrips.map((trip) => {
            const isFocused = trip.id === focusedTrip.id;
            return (
              <React.Fragment key={trip.id}>
                <TripRouteLines trip={trip} highlighted={isFocused} />
                <TripMarker
                  trip={trip}
                  position={trip.incident}
                  type="incident"
                  showTooltip={!dimmed && tooltipTripId === trip.id && tooltipAnchor === 'incident'}
                  onHover={() => setHovered({ tripId: trip.id, anchor: 'incident' })}
                  onLeave={() => setHovered(null)}
                />
                <TripMarker
                  trip={trip}
                  position={trip.vehicle}
                  type="vehicle"
                  showTooltip={!dimmed && tooltipTripId === trip.id && tooltipAnchor === 'vehicle'}
                  onHover={() => setHovered({ tripId: trip.id, anchor: 'vehicle' })}
                  onLeave={() => setHovered(null)}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>

        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <button
            onClick={() => { onPrev(); setHovered(null); }}
            className="flex items-center gap-1 px-3 py-2 bg-white/95 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-white shadow-sm"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <button
            onClick={() => { onNext(); setHovered(null); }}
            className="flex items-center gap-1 px-3 py-2 bg-white/95 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-white shadow-sm"
          >
            Next
            <ChevronRight size={14} />
          </button>
          <span className="px-2 py-1 bg-gray-900/75 text-white text-[10px] font-bold rounded-md">
            {focusedIndex + 1}/{mapTrips.length}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-600 font-bold shadow-sm hover:bg-gray-50">+</button>
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-600 font-bold shadow-sm hover:bg-gray-50">−</button>
        </div>
      </div>
    </div>
  );
};

const formatFilterDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const getFilterLabel = (
  options: { value: string; label: string }[],
  value: string
) => options.find((o) => o.value === value)?.label ?? value;

const RsaDashboardOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'heatmap'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [focusedTripIndex, setFocusedTripIndex] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilterValues>(defaultDashboardFilters);
  const [dashboardView, setDashboardView] = useState<'overview' | 'kpi-detail'>('overview');
  const [kpiDetailTab, setKpiDetailTab] = useState<KpiDetailTab>('partner');

  const openKpiDetail = (tab: KpiDetailTab = 'partner') => {
    setKpiDetailTab(tab);
    setDashboardView('kpi-detail');
  };

  const activeFilterCount = countActiveFilters(appliedFilters);

  const handlePrevTrip = () => {
    setFocusedTripIndex((i) => (i === 0 ? mapTrips.length - 1 : i - 1));
  };

  const handleNextTrip = () => {
    setFocusedTripIndex((i) => (i === mapTrips.length - 1 ? 0 : i + 1));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 -m-2">
      {/* Tabs + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg border shadow-sm px-4 py-3">
        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
          {[
            { id: 'overview' as const, label: 'Tổng quan', icon: <LayoutDashboard size={14} /> },
            { id: 'resources' as const, label: 'Nguồn lực', icon: <Users size={14} /> },
            { id: 'heatmap' as const, label: 'Heatmap', icon: <MapIcon size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setDashboardView('overview');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-vetc-green shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-colors ${
              activeFilterCount > 0
                ? 'border-vetc-green bg-green-50 text-vetc-green'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={14} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-vetc-green text-white text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={14} />
            Tải báo cáo
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-vetc-green text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-semibold text-gray-500">Đang lọc:</span>
          {appliedFilters.partner && (
            <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">
              {getFilterLabel(partnerOptions, appliedFilters.partner)}
            </span>
          )}
          {appliedFilters.station && (
            <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">
              {getFilterLabel(allStationOptions, appliedFilters.station)}
            </span>
          )}
          {appliedFilters.province && (
            <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">
              {getFilterLabel(provinceOptions, appliedFilters.province)}
            </span>
          )}
          {appliedFilters.ward && (
            <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">
              {(wardOptions[appliedFilters.province] ?? []).find((w) => w.value === appliedFilters.ward)?.label}
            </span>
          )}
          <button
            onClick={() => setFilterOpen(true)}
            className="text-[11px] font-bold text-vetc-green hover:underline"
          >
            Chỉnh sửa
          </button>
        </div>
      )}

      <DashboardFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={appliedFilters}
        onApply={setAppliedFilters}
      />

      <p className="text-[11px] text-gray-400 px-1">
        Khoảng thời gian: {formatFilterDate(appliedFilters.createdFrom)} – {formatFilterDate(appliedFilters.createdTo)}
        <span className="text-gray-300 mx-1">·</span>
        <span className="text-gray-300">rescue_order_v2.created_at</span>
      </p>

      {activeTab === 'overview' && dashboardView === 'kpi-detail' && (
        <KpiPartnerStationDriverDetail
          key={kpiDetailTab}
          initialTab={kpiDetailTab}
          onBack={() => setDashboardView('overview')}
          onOpenFilter={() => setFilterOpen(true)}
        />
      )}

      {activeTab === 'overview' && dashboardView === 'overview' && (
        <>
          {/* Status cards */}
          <div className="flex flex-wrap xl:flex-nowrap gap-4">
            {statusCards.map((card) => (
              <StatusMetricCard
                key={card.key}
                card={card}
                wide={card.variant === 'total'}
                onClick={() => openKpiDetail('partner')}
              />
            ))}
          </div>

          {/* Map + sidebar + bottom panels — single 12-col grid for column alignment */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <div className="xl:col-span-8 min-w-0">
              <MonitoringMapPanel
                focusedIndex={focusedTripIndex}
                onPrev={handlePrevTrip}
                onNext={handleNextTrip}
                dimmed={filterOpen}
              />
            </div>

            <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
              <OrderSummaryPanel />
              <SlaWarningPanel />
            </div>

            <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
              <ConversionFunnelPanel />
              <DriverManagementPanel />
              <ResourcesPanel />
            </div>

            <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
              {kpiMetrics.map((card) => (
                <KpiMetricCardView key={card.key} card={card} />
              ))}
            </div>

            <div className="xl:col-span-4 min-w-0">
              <AlertsListPanel />
            </div>
          </div>
        </>
      )}

      {activeTab === 'resources' && <ResourcesTab dimmed={filterOpen} />}

      {activeTab === 'heatmap' && <HeatmapTab dimmed={filterOpen} />}
    </div>
  );
};

export default RsaDashboardOverview;
