
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJSON as GeoJSONType } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vietnamProvincesGeo, VIETNAM_BOUNDS } from './vietnamProvinceGeo';
import {
  heatmapStatCards,
  orderDensityRows,
  stationDensityRows,
  provinceIntensityMap,
  rescueOrderMarkers,
  heatmapStationMarkers,
  heatIntensityColor,
  type HeatmapStatCard,
} from './heatmapTabData';

const formatNumber = (n: number) => n.toLocaleString('vi-VN');

const orderMarkerIcon = L.divIcon({
  html: `<div style="position:relative;width:34px;height:34px">
    <div style="width:30px;height:30px;background:#FBBF24;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.28)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
    </div>
    <span style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;background:#EF4444;border-radius:50%;color:white;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;border:2px solid white">!</span>
  </div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

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
    <div className="flex items-end justify-end gap-1 h-12">
      {data.map((h, i) => (
        <div
          key={i}
          className="w-2 rounded-sm"
          style={{ height: `${(h / max) * 100}%`, minHeight: 4, backgroundColor: greens[i] ?? greens[greens.length - 1] }}
        />
      ))}
    </div>
  );
};

const HeatmapStatCardView: React.FC<{ card: HeatmapStatCard }> = ({ card }) => {
  if (card.variant === 'total') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-[32px] font-black text-gray-900 leading-none">{formatNumber(card.value)}</p>
            {card.trend !== undefined && (
              <div className="flex items-center gap-1 mt-2 text-sm font-bold text-[#00A859]">
                <TrendingUp size={14} />
                +{card.trend}%
              </div>
            )}
          </div>
          {card.barChart && <MiniBarChart data={card.barChart} />}
        </div>
      </div>
    );
  }

  if (card.variant === 'progress') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
        <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
        <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#00A859]" style={{ width: `${card.progressPercent ?? 0}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
      <p className="text-[32px] font-black text-gray-900 leading-none mt-2">{formatNumber(card.value)}</p>
      {card.subLabel && <p className="text-xs text-gray-400 mt-2">{card.subLabel}</p>}
    </div>
  );
};

const FitVietnamBounds: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(VIETNAM_BOUNDS, { padding: [12, 12] });
  }, [map]);
  return null;
};

const MapRefBridge: React.FC<{ onMap: (map: L.Map) => void }> = ({ onMap }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
};

interface HeatmapTabProps {
  dimmed?: boolean;
}

const HeatmapTab: React.FC<HeatmapTabProps> = ({ dimmed = false }) => {
  const [mode, setMode] = useState<'station' | 'order'>('order');
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const densityRows = mode === 'order' ? orderDensityRows : stationDensityRows;

  const provinceStyle = useCallback(
    (feature?: GeoJSON.Feature) => {
      const id = feature?.properties?.id as string | undefined;
      const intensity = id ? (provinceIntensityMap[id] ?? 0.12) : 0.12;
      return {
        fillColor: heatIntensityColor(intensity),
        fillOpacity: 0.78,
        color: 'rgba(255,255,255,0.35)',
        weight: 1,
      };
    },
    []
  );

  const onEachProvince = useCallback((feature: GeoJSON.Feature, layer: L.Layer) => {
    const id = feature.properties?.id as string;
    const name = feature.properties?.name as string;
    const intensity = provinceIntensityMap[id] ?? 0.12;
    layer.on({
      mouseover: () => setHoveredId(id),
      mouseout: () => setHoveredId(null),
    });
    if (layer instanceof L.Path) {
      layer.bindTooltip(
        `<div class="text-xs font-bold">${name}</div><div class="text-[10px] text-gray-500">Mật độ: ${Math.round(intensity * 100)}%</div>`,
        { sticky: true, className: 'map-trip-tooltip' }
      );
    }
  }, []);

  const geoKey = useMemo(() => `${mode}-${heatmapOn}`, [mode, heatmapOn]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex bg-gray-100 rounded-full p-0.5 border border-gray-200">
          <button
            onClick={() => setMode('station')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mode === 'station' ? 'bg-white text-[#00A859] shadow-sm border border-gray-200' : 'text-gray-500'
            }`}
          >
            Trạm cứu hộ
          </button>
          <button
            onClick={() => setMode('order')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mode === 'order' ? 'bg-white text-[#00A859] shadow-sm border border-gray-200' : 'text-gray-500'
            }`}
          >
            Đơn cứu hộ
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        <div className="xl:flex-[2.8] min-w-0">
          <div
            className={`rsa-dashboard-map bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative z-0 isolate ${
              dimmed ? 'pointer-events-none' : ''
            }`}
            style={{ minHeight: 'calc(100vh - 260px)' }}
          >
            <MapContainer
              center={[16.2, 106.5]}
              zoom={6}
              className="h-full w-full absolute inset-0 z-0"
              style={{ minHeight: 'calc(100vh - 260px)' }}
              scrollWheelZoom
              zoomControl={false}
              maxBounds={VIETNAM_BOUNDS}
              maxBoundsViscosity={1}
              minZoom={5}
              maxZoom={12}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitVietnamBounds />
              <MapRefBridge onMap={handleMapReady} />

              {heatmapOn && (
                <GeoJSON
                  key={geoKey}
                  data={vietnamProvincesGeo as GeoJSONType}
                  style={provinceStyle}
                  onEachFeature={onEachProvince}
                />
              )}

              {!heatmapOn && mode === 'order' &&
                rescueOrderMarkers.map((order) => (
                  <Marker
                    key={order.id}
                    position={order.position}
                    icon={orderMarkerIcon}
                    eventHandlers={{
                      mouseover: () => setHoveredId(order.id),
                      mouseout: () => setHoveredId(null),
                    }}
                  >
                    {hoveredId === order.id && (
                      <Tooltip permanent direction="top" offset={[0, -18]} className="map-trip-tooltip">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3 min-w-[170px]">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[9px] font-black uppercase">
                            {order.status}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-2">{order.orderId}</p>
                          <p className="text-xs text-gray-500 mt-1">{order.province}</p>
                        </div>
                      </Tooltip>
                    )}
                  </Marker>
                ))}

              {!heatmapOn && mode === 'station' &&
                heatmapStationMarkers.map((station) => (
                  <Marker
                    key={station.id}
                    position={station.position}
                    icon={stationMarkerIcon}
                    eventHandlers={{
                      mouseover: () => setHoveredId(station.id),
                      mouseout: () => setHoveredId(null),
                    }}
                  >
                    {hoveredId === station.id && (
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

            <div className="absolute bottom-5 left-5 z-20 bg-white/95 border border-gray-200 rounded-xl px-4 py-3 shadow-sm space-y-2.5 pointer-events-auto">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setHeatmapOn((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${heatmapOn ? 'bg-[#00A859]' : 'bg-gray-300'}`}
                  aria-label="Bật/tắt heat map"
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      heatmapOn ? 'translate-x-[22px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wide">Heat map</span>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase mb-1.5">Mật độ</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500 font-semibold">Thấp</span>
                  <div
                    className="h-2.5 w-28 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #3B82F6, #22C55E, #EAB308, #F97316, #EF4444)',
                    }}
                  />
                  <span className="text-[9px] text-gray-500 font-semibold">Cao</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-400">
                {heatmapOn
                  ? 'Màu theo ranh giới tỉnh/thành Việt Nam'
                  : mode === 'order'
                    ? 'Hiển thị điểm đơn cứu hộ'
                    : 'Hiển thị điểm trạm cứu hộ'}
              </p>
            </div>

            <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold shadow-sm hover:bg-gray-50 text-lg leading-none"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-9 h-9 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold shadow-sm hover:bg-gray-50 text-lg leading-none"
                aria-label="Zoom out"
              >
                −
              </button>
            </div>
          </div>
        </div>

        <div className="xl:w-[300px] xl:shrink-0 flex flex-col gap-3">
          {heatmapStatCards.map((card) => (
            <HeatmapStatCardView key={card.key} card={card} />
          ))}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              Mật độ {mode === 'order' ? 'đơn' : 'trạm'}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              Tổng hợp số lượng {mode === 'order' ? 'đơn đang cứu hộ' : 'trạm hoạt động'} theo tỉnh
            </p>
            <div className="mt-4 space-y-3">
              {densityRows.map((row) => (
                <div key={row.rank} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-green-50 text-[#00A859] text-xs font-black flex items-center justify-center shrink-0">
                      {row.rank}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{row.name}</span>
                  </div>
                  <span className="text-sm font-black text-gray-900 shrink-0">{row.value}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-4 text-xs font-bold text-[#00A859] hover:underline">
              Xem tất cả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTab;
