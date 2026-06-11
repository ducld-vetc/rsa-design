
import React, { useState } from 'react';
import { TrendingUp, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  resourceStatCards,
  stationDensityRegions,
  stationDensityTotal,
  providerCsat,
  stationDistributionRows,
  resourceKpiCards,
  resourceMapStations,
  type ResourceStatCard,
  type ResourceKpiCard,
} from './resourcesTabData';
import type { MiniBarItem } from './mockDashboardData';

const formatNumber = (n: number) => n.toLocaleString('vi-VN');

const stationMarkerIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#00A859;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const MiniBarChart: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const greens = ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#065F46'];
  return (
    <div className="flex items-end justify-end gap-1.5 h-16">
      {data.map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-sm"
          style={{ height: `${(h / max) * 100}%`, minHeight: 6, backgroundColor: greens[i] ?? greens[greens.length - 1] }}
        />
      ))}
    </div>
  );
};

const ResourceStatCardView: React.FC<{ card: ResourceStatCard }> = ({ card }) => {
  if (card.variant === 'total') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between min-h-[108px] h-full">
        <div>
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex flex-col justify-between min-h-[108px] h-full">
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
        <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
      </div>
      {card.subLabel && <p className="text-xs text-gray-400 mt-4">{card.subLabel}</p>}
    </div>
  );
};

const DonutChart: React.FC = () => {
  let offset = 0;
  const segments = stationDensityRegions.map((r) => {
    const seg = { ...r, offset };
    offset += r.percent;
    return seg;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
      <div className="relative w-52 h-52 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx="18"
              cy="18"
              r="13.5"
              fill="none"
              stroke={seg.color}
              strokeWidth="5.5"
              strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Tổng</p>
          <p className="text-3xl font-black text-gray-900">{stationDensityTotal}</p>
        </div>
      </div>
      <div className="space-y-3 flex-1 w-full sm:w-auto">
        {stationDensityRegions.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-semibold text-gray-600 truncate">{r.label}</span>
            </div>
            <span className="text-sm font-black text-gray-800">{r.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 22 }) => (
  <div className="flex items-center gap-0.5">
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

const ResourceKpiCardView: React.FC<{ card: ResourceKpiCard }> = ({ card }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col min-h-[160px]">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-tight">{card.label}</p>
      <div className={`flex items-center gap-1 text-xs font-bold shrink-0 ${card.positive ? 'text-[#00A859]' : 'text-red-500'}`}>
        <TrendingUp size={12} className={card.positive ? '' : 'rotate-180'} />
        {card.positive ? '+' : ''}{card.trend}%
      </div>
    </div>
    <p className="text-[32px] font-black text-[#00A859] mt-2 leading-none">{card.value}</p>
    <div className="w-full flex items-end gap-1.5 h-[72px] mt-auto pt-3">
      {card.miniBars.map((bar, i) => (
        <div key={i} className="flex-1 flex items-end h-full min-w-0">
          <div
            className="w-full rounded-t-lg"
            style={{ height: `${bar.height}%`, minHeight: 10, backgroundColor: miniBarColor(bar.tone) }}
          />
        </div>
      ))}
    </div>
  </div>
);

interface ResourcesTabProps {
  dimmed?: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ dimmed = false }) => {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const mapCenter: [number, number] = [16.0, 106.5];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4">
        {resourceStatCards.map((card) => (
          <div key={card.key} className="xl:col-span-3 min-w-0">
            <ResourceStatCardView card={card} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-8 min-w-0">
          <div className={`rsa-dashboard-map bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[520px] relative z-0 isolate ${dimmed ? 'pointer-events-none' : ''}`}>
            <MapContainer center={mapCenter} zoom={6} className="h-[520px] w-full z-0" scrollWheelZoom>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {resourceMapStations.map((station) => (
                <Marker
                  key={station.id}
                  position={station.position}
                  icon={stationMarkerIcon}
                  eventHandlers={{
                    mouseover: () => setHoveredStation(station.id),
                    mouseout: () => setHoveredStation(null),
                  }}
                >
                  {hoveredStation === station.id && (
                    <Tooltip permanent direction="top" offset={[0, -16]} className="map-trip-tooltip">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 min-w-[160px]">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#00A859] text-white text-[9px] font-black uppercase">
                          Hoạt động
                        </span>
                        <p className="text-sm font-bold text-gray-900 mt-2">{station.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{station.drivers} Tài xế</p>
                      </div>
                    </Tooltip>
                  )}
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 pointer-events-none">
              <div className="w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-600 font-bold shadow-sm flex items-center justify-center text-sm">+</div>
              <div className="w-8 h-8 bg-white border border-gray-200 rounded-md text-gray-600 font-bold shadow-sm flex items-center justify-center text-sm">−</div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  Mật độ phân bố trạm
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Theo vùng miền</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#00A859]">
                <TrendingUp size={12} />
                +2.4%
              </div>
            </div>
            <div className="mt-4">
              <DonutChart />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              Mức độ CSAT (Provider)
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-end gap-1 leading-none">
                <span className="text-[36px] font-black text-gray-900">{providerCsat.score}</span>
                <span className="text-base font-semibold text-gray-400 pb-1">/{providerCsat.max}</span>
              </div>
              <StarRating rating={providerCsat.stars} />
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Phân bố hài lòng</p>
              <p className="text-[10px] font-black text-gray-700 uppercase">{providerCsat.satisfactionLabel}</p>
            </div>
            <div className="mt-2 h-2 rounded-full overflow-hidden flex">
              {providerCsat.satisfactionSegments.map((seg, i) => (
                <div
                  key={i}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${seg.percent}%`, backgroundColor: seg.color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
              Phân bố trạm cứu hộ
            </h3>
            <button type="button" className="text-xs font-bold text-[#00A859] hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px] table-fixed">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-3 pl-5 w-14">STT</th>
                  <th className="text-left py-3 px-3">Khu vực</th>
                  <th className="text-center py-3 px-2 w-24">Trạm cứu hộ</th>
                  <th className="text-center py-3 px-2 w-24">Phương tiện</th>
                  <th className="text-center py-3 pr-5 w-20">Tài xế</th>
                </tr>
              </thead>
              <tbody>
                {stationDistributionRows.map((row, idx) => (
                  <tr key={row.id} className={`border-b border-gray-50 align-middle ${idx % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                    <td className="py-3.5 pl-5">
                      <span className="inline-flex w-7 h-7 rounded-full bg-green-50 text-[#00A859] text-xs font-black items-center justify-center">
                        {row.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-gray-900">
                      {row.area}
                      {row.warning && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-500 text-white">
                          Cảnh báo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.stations}</td>
                    <td className="py-3.5 px-2 text-center font-semibold text-gray-700">{row.vehicles}</td>
                    <td className="py-3.5 pr-5 text-center font-semibold text-gray-700">{row.drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 flex flex-col gap-4 min-w-0">
          {resourceKpiCards.map((card) => (
            <ResourceKpiCardView key={card.key} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
