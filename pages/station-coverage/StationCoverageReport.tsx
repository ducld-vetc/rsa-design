import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJSON as GeoJSONType } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Download,
  X,
  ChevronRight,
  ChevronDown,
  Map as MapIcon,
  List,
  RotateCcw,
} from 'lucide-react';
import AppSelect from '../../shared/AppSelect';
import AppMultiSelect from '../../shared/AppMultiSelect';
import { vietnamProvincesGeo, VIETNAM_BOUNDS } from '../rsa-dashboard/vietnamProvinceGeo';
import {
  ADDRESS_SCHEMA_OPTIONS,
  AREA_TYPE_OPTIONS,
  LEVEL_META,
  MAP_MODE_OPTIONS,
  PARTNER_OPTIONS,
  REGION_OPTIONS,
  STATION_TYPE_OPTIONS,
  buildProvinceHierarchy,
  coveragePercent,
  formatCoverage,
  getMapStationPoints,
  getProvinceCenters,
  getProvinceCoverageRows,
  matchesProvinceRegion,
  matchesStationTypeFilter,
  resolveCoverageLevelFromStations,
  stationCoveragePercent,
  TARGET_STATIONS_PER_PROVINCE,
  stationTypeLabel,
  UNASSIGNED_PROVINCE_ID,
  type AddressSchemaMode,
  type AreaType,
  type CoverageLevel,
  type CoverageStation,
  type MapDisplayMode,
  type ProvinceCoverageRow,
  type RegionId,
  type StationType,
} from './stationCoverageData';
import StationHeatLayer, { buildNationalHeatFill, type HeatPoint } from './StationHeatLayer';

const MARKER_SIZE = 28;
const MARKER_SIZE_SELECTED = 32;

const CARPLA_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" style="display:block"><circle cx="16" cy="16" r="15.2" fill="#111"/><circle cx="16" cy="16" r="13.4" fill="#F5D000"/><path d="M22.6 11a8.2 8.2 0 1 0 0 10" fill="none" stroke="#111" stroke-width="4.4" stroke-linecap="butt"/></svg>`;

const makeStationIcon = (bg: string, glyph: string, selected: boolean) => {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.35);${selected ? 'outline:2px solid #111;outline-offset:0;' : ''}">${glyph}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const carplaIcon = (selected: boolean) => {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.35);line-height:0;${selected ? 'outline:2px solid #111;outline-offset:0;' : ''}">${CARPLA_MARK_SVG}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const EXTERNAL_GLYPH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" style="display:block"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>`;
const QUICK_GLYPH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" style="display:block"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg>`;

const iconForStation = (type: StationType, selected: boolean) => {
  if (type === 'rescue_internal') return carplaIcon(selected);
  if (type === 'rescue_quick') return makeStationIcon('#D97706', QUICK_GLYPH, selected);
  return makeStationIcon('#059669', EXTERNAL_GLYPH, selected);
};

const FitVietnamBounds: React.FC<{ resetKey: string }> = ({ resetKey }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(VIETNAM_BOUNDS, { padding: [12, 12] });
  }, [map, resetKey]);
  return null;
};

const FlyToProvince: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 9, { duration: 0.45 });
  }, [center, map]);
  return null;
};

const MapRefBridge: React.FC<{ onMap: (map: L.Map) => void }> = ({ onMap }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
};

const formatNumber = (n: number) => n.toLocaleString('vi-VN');

interface ViewRow {
  row: ProvinceCoverageRow;
  stations: number;
  internalStations: number;
  quickStations: number;
  externalStations: number;
  orders: number;
  covered: number;
  avgKm: number | null;
  uncovered: number;
  cr: number;
  level: CoverageLevel;
}

const selectWrapClass = 'w-[196px] shrink-0';
const PARTNER_FILTER_OPTIONS = PARTNER_OPTIONS.slice(1);

const StationCoverageReport: React.FC = () => {
  const [addressSchema, setAddressSchema] = useState<AddressSchemaMode>('old');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [partners, setPartners] = useState<string[]>([]);
  const [areaType, setAreaType] = useState<AreaType | 'all'>('all');
  const [stationType, setStationType] = useState<StationType | 'all'>('all');
  const [provinceFilterIds, setProvinceFilterIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'list'>('list');
  const [mapMode, setMapMode] = useState<MapDisplayMode>('stations');
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  const mapStationPoints = useMemo(() => getMapStationPoints(addressSchema), [addressSchema]);
  const provinceCoverageRows = useMemo(
    () => getProvinceCoverageRows(addressSchema, mapStationPoints),
    [addressSchema, mapStationPoints],
  );
  const provinceCenters = useMemo(() => getProvinceCenters(addressSchema), [addressSchema]);

  const provinceFilterSet = useMemo(() => new Set(provinceFilterIds), [provinceFilterIds]);
  const partnerFilterSet = useMemo(() => new Set(partners), [partners]);

  const matchesProvinceFilter = useCallback(
    (provinceId: string) => provinceFilterIds.length === 0 || provinceFilterSet.has(provinceId),
    [provinceFilterIds.length, provinceFilterSet],
  );

  const filteredStations = useMemo(() => {
    return mapStationPoints.filter((station) => {
      if (areaType !== 'all' && station.areaType !== areaType) return false;
      if (!matchesStationTypeFilter(station.stationType, stationType)) return false;
      if (partners.length > 0 && !partnerFilterSet.has(station.partner)) return false;
      return true;
    });
  }, [areaType, mapStationPoints, partners.length, partnerFilterSet, stationType]);

  const stationStatsByProvince = useMemo(() => {
    const map = new Map<string, { total: number; internal: number; quick: number; external: number }>();
    for (const station of filteredStations) {
      const current = map.get(station.provinceId) ?? { total: 0, internal: 0, quick: 0, external: 0 };
      current.total += 1;
      if (station.stationType === 'rescue_internal') current.internal += 1;
      else if (station.stationType === 'rescue_quick') current.quick += 1;
      else current.external += 1;
      map.set(station.provinceId, current);
    }
    return map;
  }, [filteredStations]);

  const buildViewRow = useCallback(
    (row: ProvinceCoverageRow): ViewRow => {
      const stats = stationStatsByProvince.get(row.id) ?? { total: 0, internal: 0, quick: 0, external: 0 };
      const cr = stationCoveragePercent(stats.total, TARGET_STATIONS_PER_PROVINCE);
      const level = resolveCoverageLevelFromStations(stats.total, TARGET_STATIONS_PER_PROVINCE);
      return {
        row: { ...row, stations: stats.total },
        stations: stats.total,
        internalStations: stats.internal,
        quickStations: stats.quick,
        externalStations: stats.external,
        orders: row.orders90,
        covered: row.covered90,
        avgKm: row.avgKm90,
        uncovered: Math.max(0, row.orders90 - row.covered90),
        cr,
        level,
      };
    },
    [stationStatsByProvince],
  );

  const rowsForMap: ViewRow[] = useMemo(() => {
    return provinceCoverageRows
      .filter((row) => matchesProvinceRegion(row, region))
      .filter((row) => matchesProvinceFilter(row.id))
      .map(buildViewRow)
      .sort((a, b) => {
        if (b.stations !== a.stations) return b.stations - a.stations;
        return a.row.name.localeCompare(b.row.name, 'vi');
      });
  }, [region, matchesProvinceFilter, buildViewRow, provinceCoverageRows]);

  const viewRows: ViewRow[] = useMemo(() => {
    const source = focusedId ? rowsForMap.filter((item) => item.row.id === focusedId) : rowsForMap;
    return [...source].sort((a, b) => {
      if (b.stations !== a.stations) return b.stations - a.stations;
      return a.row.name.localeCompare(b.row.name, 'vi');
    });
  }, [rowsForMap, focusedId]);

  const hierarchyRows = useMemo(
    () =>
      buildProvinceHierarchy(
        addressSchema,
        provinceCoverageRows.filter((row) => matchesProvinceRegion(row, region)).filter((row) => matchesProvinceFilter(row.id)),
        filteredStations,
      ),
    [addressSchema, provinceCoverageRows, region, matchesProvinceFilter, filteredStations],
  );

  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedProvinces(new Set());
    setExpandedDistricts(new Set());
  }, [addressSchema, region, provinceFilterIds, stationType, partners, areaType]);

  const toggleProvinceExpand = (id: string) => {
    setExpandedProvinces((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDistrictExpand = (key: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const provincesByName = useMemo(
    () =>
      [...provinceCoverageRows]
        .filter((row) => matchesProvinceRegion(row, region))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    [region, provinceCoverageRows],
  );

  const visibleIds = useMemo(() => new Set(rowsForMap.map((item) => item.row.id)), [rowsForMap]);
  const selected = focusedId ? (rowsForMap.find((item) => item.row.id === focusedId) ?? null) : null;
  const selectedCenter = focusedId ? (provinceCenters[focusedId] ?? null) : null;

  const kpis = useMemo(() => {
    const source = focusedId ? viewRows : rowsForMap;
    const totalStations = source.reduce((sum, item) => sum + item.stations, 0);
    const withStation = source.filter((item) => item.stations >= 1).length;
    const lowProvinces = source.filter((item) => item.level === 'thap').length;
    const presenceCr = source.length === 0 ? null : coveragePercent(withStation, source.length);
    const avgDensity =
      source.length === 0
        ? null
        : Math.round(
            (source.reduce((sum, item) => sum + item.cr, 0) / source.length) * 10,
          ) / 10;
    return {
      totalOrders: source.reduce((sum, item) => sum + item.orders, 0),
      totalCovered: source.reduce((sum, item) => sum + item.covered, 0),
      totalStations,
      withStation,
      lowProvinces,
      nationalCr: avgDensity,
      presenceCr,
    };
  }, [viewRows, rowsForMap, focusedId]);

  const visibleStations = useMemo(() => {
    return filteredStations.filter((station) => {
      if (!station.hasValidPosition) return false;
      if (station.provinceId === UNASSIGNED_PROVINCE_ID) return false;
      if (!visibleIds.has(station.provinceId)) return false;
      if (focusedId && station.provinceId !== focusedId) return false;
      return true;
    });
  }, [filteredStations, visibleIds, focusedId]);

  const drillStations = useMemo(() => {
    return filteredStations.filter((station) => {
      if (station.provinceId === UNASSIGNED_PROVINCE_ID) return false;
      if (!visibleIds.has(station.provinceId)) return false;
      if (focusedId && station.provinceId !== focusedId) return false;
      return true;
    });
  }, [filteredStations, visibleIds, focusedId]);

  const provinceStyle = useCallback(
    (feature?: GeoJSON.Feature) => {
      const id = feature?.properties?.id as string | undefined;
      const isSelected = id === focusedId;
      const inFilter = id ? visibleIds.has(id) : false;
      if (mapMode === 'heatmap') {
        return {
          fillColor: '#3B82F6',
          fillOpacity: 0,
          color: isSelected ? '#111827' : 'rgba(15,23,42,0.28)',
          weight: isSelected ? 2.5 : 1,
        };
      }
      return {
        fillColor: isSelected ? '#00A859' : '#E5E7EB',
        fillOpacity: isSelected ? 0.18 : inFilter ? 0.04 : 0.02,
        color: isSelected ? '#111827' : 'rgba(55,65,81,0.35)',
        weight: isSelected ? 2.5 : 1,
      };
    },
    [visibleIds, focusedId, mapMode],
  );

  const onEachProvince = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const id = feature.properties?.id as string;
      const name = feature.properties?.name as string;
      const item = rowsForMap.find((row) => row.row.id === id);
      layer.on({
        click: () => {
          if (item) setFocusedId(id);
        },
      });
      if (layer instanceof L.Path) {
        const el = layer.getElement();
        if (el) el.style.cursor = item ? 'pointer' : 'default';
        const crText = item ? formatCoverage(item.cr) : 'Ngoài bộ lọc';
        layer.bindTooltip(
          `<div class="text-xs font-bold">${name}</div><div class="text-[10px] text-gray-500">${crText}</div>`,
          { sticky: true, className: 'map-trip-tooltip' },
        );
      }
    },
    [rowsForMap],
  );

  const geoKey = `${addressSchema}-${region}-${provinceFilterIds.join('|') || 'all'}-${focusedId ?? 'none'}-${mapMode}`;

  const handleExport = () => {
    const header = [
      'Cấp',
      'Tỉnh',
      'Mã tỉnh',
      'Huyện',
      'Mã huyện',
      'Xã/Phường',
      'Mã xã',
      'Số trạm',
      'Nội bộ',
      'Quick Service',
      'Bên ngoài',
      `% mật độ (mục tiêu ${TARGET_STATIONS_PER_PROVINCE})`,
      'Mức',
    ];
    const lines: string[] = [];
    for (const province of hierarchyRows) {
      lines.push(
        [
          'Tỉnh',
          province.name,
          province.code,
          '',
          '',
          '',
          '',
          province.total,
          province.internal,
          province.quick,
          province.external,
          province.cr.toFixed(1),
          LEVEL_META[province.level].label,
        ].join(','),
      );
      for (const district of province.districts) {
        lines.push(
          [
            'Huyện',
            province.name,
            province.code,
            district.name,
            district.code,
            '',
            '',
            district.total,
            district.internal,
            district.quick,
            district.external,
            '',
            '',
          ].join(','),
        );
        for (const precinct of district.precincts) {
          lines.push(
            [
              'Xã/Phường',
              province.name,
              province.code,
              district.name,
              district.code,
              precinct.name,
              precinct.code,
              precinct.total,
              precinct.internal,
              precinct.quick,
              precinct.external,
              '',
              '',
            ].join(','),
          );
        }
      }
    }
    const csv = `\uFEFF${header.join(',')}\n${lines.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'do-phu-tram-theo-tinh.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportNote(`Đã xuất ${hierarchyRows.length} tỉnh · 3 cấp địa chỉ (CSV mở bằng Excel).`);
  };

  const nationalFillPoints = useMemo(() => buildNationalHeatFill(visibleIds), [visibleIds]);

  const heatPoints = useMemo<HeatPoint[]>(() => {
    const hot = visibleStations.map((station) => [station.position[0], station.position[1], 0.68] as HeatPoint);
    return [...nationalFillPoints, ...hot];
  }, [nationalFillPoints, visibleStations]);

  const hasActiveFilters =
    provinceFilterIds.length > 0 ||
    focusedId != null ||
    region !== 'all' ||
    partners.length > 0 ||
    areaType !== 'all' ||
    stationType !== 'all' ||
    addressSchema !== 'new';

  const resetFilters = () => {
    setProvinceFilterIds([]);
    setFocusedId(null);
    setRegion('all');
    setPartners([]);
    setAreaType('all');
    setStationType('all');
    setAddressSchema('new');
  };

  useEffect(() => {
    setProvinceFilterIds([]);
    setFocusedId(null);
  }, [addressSchema]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-lg font-black uppercase tracking-wide text-gray-800">Độ phủ trạm cứu hộ theo tỉnh</h1>
        {activeTab === 'list' && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#00A859] px-4 text-xs font-bold text-white hover:bg-[#00924e]"
          >
            <Download size={14} />
            Xuất Excel
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex shrink-0 rounded-lg border border-gray-200 bg-gray-100 p-0.5">
          {[
            { id: 'overview' as const, label: 'Bản đồ', icon: <MapIcon size={14} /> },
            { id: 'list' as const, label: 'Danh sách', icon: <List size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'border border-gray-200 bg-white text-[#00A859] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <div className="flex shrink-0 rounded-lg border border-gray-200 bg-white p-0.5">
            {ADDRESS_SCHEMA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                title={opt.hint}
                onClick={() => setAddressSchema(opt.id)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                  addressSchema === opt.id
                    ? 'bg-[#00A859] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="w-[200px] shrink-0">
            <AppMultiSelect
              values={provinceFilterIds}
              placeholder="Tất cả tỉnh"
              searchPlaceholder="Tìm tỉnh..."
              options={provincesByName.map((row) => ({ value: row.id, label: row.name }))}
              onChange={(values) => {
                setProvinceFilterIds(values);
                if (focusedId && values.length > 0 && !values.includes(focusedId)) {
                  setFocusedId(null);
                }
              }}
            />
          </div>
          <div className={selectWrapClass}>
            <AppSelect
              value={stationType}
              options={STATION_TYPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
              onChange={(value) => setStationType(value as StationType | 'all')}
            />
          </div>
          <div className={selectWrapClass}>
            <AppSelect
              value={region}
              options={REGION_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
              onChange={(value) => setRegion(value as RegionId | 'all')}
            />
          </div>
          <div className="w-[220px] shrink-0">
            <AppMultiSelect
              values={partners}
              placeholder="Tất cả đối tác"
              searchPlaceholder="Tìm đối tác..."
              options={PARTNER_FILTER_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
              onChange={setPartners}
            />
          </div>
          <div className={selectWrapClass}>
            <AppSelect
              value={areaType}
              options={AREA_TYPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
              onChange={(value) => setAreaType(value as AreaType | 'all')}
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded border bg-white px-3 text-sm text-gray-700 outline-none transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <RotateCcw size={14} />
            Xóa lọc
          </button>
        </div>
      </div>

      {exportNote && activeTab === 'list' && (
        <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-800">
          {exportNote}
        </p>
      )}

      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
          <div className="min-w-0 xl:flex-1">
            <div
              className="rsa-dashboard-map relative z-0 isolate overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              style={{ minHeight: 'calc(100vh - 260px)' }}
            >
              <MapContainer
                center={[16.2, 106.5]}
                zoom={6}
                className="absolute inset-0 z-0 h-full w-full"
                style={{ minHeight: 'calc(100vh - 260px)' }}
                scrollWheelZoom
                zoomAnimation
                fadeAnimation
                markerZoomAnimation
                zoomControl={false}
                maxBounds={VIETNAM_BOUNDS}
                maxBoundsViscosity={1}
                minZoom={5}
                maxZoom={13}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedCenter ? (
                  <FlyToProvince center={selectedCenter} />
                ) : (
                  <FitVietnamBounds resetKey={`${region}`} />
                )}
                <MapRefBridge onMap={handleMapReady} />
                <GeoJSON
                  key={geoKey}
                  data={vietnamProvincesGeo as GeoJSONType}
                  style={provinceStyle}
                  onEachFeature={onEachProvince}
                />

                {mapMode === 'heatmap' && <StationHeatLayer points={heatPoints} />}

                {mapMode === 'stations' &&
                  visibleStations.map((station) => (
                    <Marker
                      key={station.id}
                      position={station.position}
                      icon={iconForStation(station.stationType, station.provinceId === focusedId)}
                      eventHandlers={{
                        click: () => setFocusedId(station.provinceId),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -14]} opacity={1} className="station-name-tooltip">
                        <div className="w-full min-w-0 max-w-[296px]">
                          <p className="text-[13px] font-bold leading-snug text-white">{station.name}</p>
                          <p className="mt-1 text-[11px] font-medium leading-snug text-white/80">
                            {stationTypeLabel(station.stationType)}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-white/75">{station.partner}</p>
                          <p className="mt-1 text-[11px] leading-snug text-white/70">
                            {station.code} · {station.provinceName}
                            {station.provinceSource === 'address' ? ' (suy từ địa chỉ)' : ''}
                          </p>
                          {station.address ? (
                            <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-white/65">{station.address}</p>
                          ) : null}
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
              </MapContainer>

              <div className="absolute left-4 top-4 z-20">
                <div className="flex rounded-lg border border-gray-200 bg-white/95 p-0.5 shadow-sm">
                  {MAP_MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMapMode(opt.id)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-all ${
                        mapMode === opt.id
                          ? 'bg-[#00A859] text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 z-20 space-y-1.5 rounded-xl border border-gray-200 bg-white/95 px-3 py-2.5 shadow-sm">
                {mapMode === 'stations' ? (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Loại trạm</p>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full shadow-sm"
                        dangerouslySetInnerHTML={{ __html: CARPLA_MARK_SVG }}
                      />
                      <span className="text-[10px] font-semibold text-gray-600">Trạm nội bộ (Carpla)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#D97706] shadow-sm">
                        <span dangerouslySetInnerHTML={{ __html: QUICK_GLYPH }} />
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600">Quick Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#059669] shadow-sm">
                        <span dangerouslySetInnerHTML={{ __html: EXTERNAL_GLYPH }} />
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600">Trạm bên ngoài</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Mật độ trạm cứu hộ</p>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-24 rounded-full"
                        style={{
                          background: 'linear-gradient(90deg,#3B82F6 0%,#38BDF8 28%,#4ADE80 50%,#FACC15 72%,#FB923C 88%,#FB9292 100%)',
                        }}
                      />
                    </div>
                    <div className="flex w-24 justify-between">
                      <span className="text-[9px] font-semibold text-gray-500">Ít</span>
                      <span className="text-[9px] font-semibold text-gray-500">Nhiều</span>
                    </div>
                    <p className="text-[9px] text-gray-400">Xanh = thưa / chưa có trạm, đỏ = cụm dày</p>
                  </>
                )}
              </div>

              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomIn()}
                  className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label="Zoom in"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label="Zoom out"
                >
                  −
                </button>
              </div>
            </div>
          </div>

          <ProvinceDetailPanel
            selected={selected}
            provinceRows={rowsForMap}
            kpis={kpis}
            drillStations={drillStations}
            onSelectProvince={setFocusedId}
            onClose={() => setFocusedId(null)}
          />
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <KpiChip label="Tỉnh có trạm" value={formatCoverage(kpis.presenceCr)} emphasis />
            <KpiChip label="Trạm active" value={formatNumber(kpis.totalStations)} />
            <KpiChip label={`% mật độ TB (/${TARGET_STATIONS_PER_PROVINCE})`} value={formatCoverage(kpis.nationalCr)} />
            <KpiChip
              label="Tỉnh mức thấp"
              value={formatNumber(kpis.lowProvinces)}
              danger={kpis.lowProvinces > 0}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-50 px-4 py-2 text-[11px] font-semibold text-gray-500">
              {addressSchema === 'new'
                ? 'Địa chỉ mới · 34 tỉnh (sau sáp nhập) · huyện/xã chuẩn hóa chung với địa chỉ cũ'
                : 'Địa chỉ cũ · 63 tỉnh → Huyện → Xã/Phường · sắp xếp theo số trạm'}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-2.5">Đơn vị hành chính</th>
                    <th className="px-4 py-2.5 text-right">Trạm</th>
                    <th className="px-4 py-2.5 text-right">Nội bộ</th>
                    <th className="px-4 py-2.5 text-right">QS</th>
                    <th className="px-4 py-2.5 text-right">Bên ngoài</th>
                    <th className="px-4 py-2.5 text-right">% mật độ</th>
                    <th className="px-4 py-2.5">Mức</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {hierarchyRows.map((province) => {
                    const provinceOpen = expandedProvinces.has(province.provinceId);
                    return (
                      <React.Fragment key={province.provinceId}>
                        <tr className="border-t border-gray-50 bg-white hover:bg-emerald-50/40">
                          <td className="px-4 py-2.5">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 text-left"
                              onClick={() => toggleProvinceExpand(province.provinceId)}
                            >
                              {provinceOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                              <span>
                                <span className="block font-bold text-gray-800">{province.name}</span>
                                <span className="text-[10px] text-gray-400">{province.code} · Tỉnh</span>
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.internal)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.quick)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.external)}</td>
                          <td className={`px-4 py-2.5 text-right font-black ${LEVEL_META[province.level].text}`}>
                            {formatCoverage(province.cr)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${LEVEL_META[province.level].badge}`}>
                              {LEVEL_META[province.level].label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-300">
                            <button
                              type="button"
                              className="rounded p-1 hover:bg-gray-100 hover:text-gray-700"
                              aria-label={`Mở bản đồ ${province.name}`}
                              onClick={() => {
                                setFocusedId(province.provinceId);
                                setActiveTab('overview');
                              }}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                        {provinceOpen &&
                          province.districts.map((district) => {
                            const districtKey = `${province.provinceId}::${district.code}`;
                            const districtOpen = expandedDistricts.has(districtKey);
                            return (
                              <React.Fragment key={districtKey}>
                                <tr className="border-t border-gray-50 bg-gray-50/70">
                                  <td className="px-4 py-2 pl-10">
                                    <button
                                      type="button"
                                      className="flex w-full items-center gap-2 text-left"
                                      onClick={() => toggleDistrictExpand(districtKey)}
                                    >
                                      {districtOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                      <span>
                                        <span className="block font-semibold text-gray-700">{district.name}</span>
                                        <span className="text-[10px] text-gray-400">{district.code} · Huyện</span>
                                      </span>
                                    </button>
                                  </td>
                                  <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatNumber(district.total)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.internal)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.quick)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.external)}</td>
                                  <td className="px-4 py-2 text-right text-gray-300">—</td>
                                  <td className="px-4 py-2" />
                                  <td className="px-4 py-2" />
                                </tr>
                                {districtOpen &&
                                  district.precincts.map((precinct) => (
                                    <tr key={`${districtKey}::${precinct.code}`} className="border-t border-gray-50 bg-white">
                                      <td className="px-4 py-2 pl-16">
                                        <p className="font-medium text-gray-700">{precinct.name}</p>
                                        <p className="text-[10px] text-gray-400">{precinct.code} · Xã/Phường</p>
                                      </td>
                                      <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatNumber(precinct.total)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.internal)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.quick)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.external)}</td>
                                      <td className="px-4 py-2 text-right text-gray-300">—</td>
                                      <td className="px-4 py-2" />
                                      <td className="px-4 py-2" />
                                    </tr>
                                  ))}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProvinceDetailPanel: React.FC<{
  selected: ViewRow | null;
  provinceRows: ViewRow[];
  kpis: {
    totalOrders: number;
    totalCovered: number;
    totalStations: number;
    withStation: number;
    lowProvinces: number;
    nationalCr: number | null;
    presenceCr: number | null;
  };
  drillStations: CoverageStation[];
  onSelectProvince: (id: string) => void;
  onClose: () => void;
}> = ({ selected, provinceRows, kpis, drillStations, onSelectProvince, onClose }) => {
  const internalCount = drillStations.filter((station) => station.stationType === 'rescue_internal').length;
  const quickCount = drillStations.filter((station) => station.stationType === 'rescue_quick').length;
  const externalCount = drillStations.filter((station) => station.stationType === 'rescue_external').length;
  const provinceList = [...provinceRows].sort((a, b) => {
    if (b.stations !== a.stations) return b.stations - a.stations;
    return a.row.name.localeCompare(b.row.name, 'vi');
  });

  if (!selected) {
    return (
      <aside className="flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:w-[340px] xl:shrink-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tổng hợp</p>
        <h2 className="mt-1 text-base font-black text-gray-900">Tất cả tỉnh</h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-black text-gray-900">{formatCoverage(kpis.presenceCr)}</span>
          <span className="text-[10px] font-semibold text-gray-400">tỉnh có trạm</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <MiniStat label="Số tỉnh" value={formatNumber(provinceRows.length)} />
          <MiniStat label="Tỉnh có trạm" value={formatNumber(kpis.withStation)} />
          <MiniStat label="Trạm active" value={formatNumber(kpis.totalStations)} />
          <MiniStat label={`% mật độ TB (/${TARGET_STATIONS_PER_PROVINCE})`} value={formatCoverage(kpis.nationalCr)} />
        </dl>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <MiniStat label="Nội bộ (Carpla)" value={formatNumber(internalCount)} />
          <MiniStat label="Quick Service" value={formatNumber(quickCount)} />
          <MiniStat label="Bên ngoài" value={formatNumber(externalCount)} />
          <MiniStat label="Tỉnh mức thấp" value={formatNumber(kpis.lowProvinces)} />
        </dl>

        <h3 className="mt-4 text-[11px] font-black uppercase tracking-wider text-gray-400">Theo tỉnh</h3>
        <ul className="mt-2 max-h-[46vh] space-y-1.5 overflow-y-auto">
          {provinceList.map((item) => (
            <li key={item.row.id}>
              <button
                type="button"
                onClick={() => onSelectProvince(item.row.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-100 px-2.5 py-2 text-left hover:bg-emerald-50/50"
              >
                <span>
                  <span className="block text-xs font-bold text-gray-800">{item.row.name}</span>
                  <span className="text-[10px] text-gray-400">{item.row.code}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs font-black text-gray-800">{formatNumber(item.stations)}</span>
                  <span className={`text-[10px] font-semibold ${LEVEL_META[item.level].text}`}>
                    {LEVEL_META[item.level].label} · {formatCoverage(item.cr)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:w-[340px] xl:shrink-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Chi tiết tỉnh</p>
          <h2 className="mt-1 text-base font-black text-gray-900">
            {selected.row.name}{' '}
            <span className="text-xs font-bold text-gray-400">{selected.row.code}</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Xem tất cả tỉnh"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${LEVEL_META[selected.level].badge}`}>
          {LEVEL_META[selected.level].label}
        </span>
        <span className="text-sm font-black text-gray-900">{formatCoverage(selected.cr)}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <MiniStat label="Trạm nội tỉnh" value={formatNumber(selected.stations)} />
        <MiniStat label="Nội bộ" value={formatNumber(selected.internalStations)} />
        <MiniStat label="Quick Service" value={formatNumber(selected.quickStations)} />
        <MiniStat label="Bên ngoài" value={formatNumber(selected.externalStations)} />
        <MiniStat label={`% mật độ (/${TARGET_STATIONS_PER_PROVINCE})`} value={formatCoverage(selected.cr)} />
      </dl>
      {selected.stations === 0 && (
        <p className="mt-2 text-[11px] text-amber-700">Chưa có trạm active khớp bộ lọc tại tỉnh này.</p>
      )}

      <h3 className="mt-4 text-[11px] font-black uppercase tracking-wider text-gray-400">Trạm active</h3>
      <ul className="mt-2 max-h-[28vh] space-y-2 overflow-y-auto">
        {drillStations.length === 0 && <li className="text-[11px] text-gray-400">Không có trạm khớp bộ lọc.</li>}
        {drillStations.map((station) => (
          <li key={station.id} className="rounded-lg border border-gray-100 px-2.5 py-2">
            <p className="text-xs font-bold text-gray-800">{station.name}</p>
            <p className="text-[10px] text-gray-400">
              {station.code} · {stationTypeLabel(station.stationType)} · {station.partner}
            </p>
            {station.address ? <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{station.address}</p> : null}
          </li>
        ))}
      </ul>
    </aside>
  );
};

const KpiChip: React.FC<{
  label: string;
  value: string;
  emphasis?: boolean;
  danger?: boolean;
}> = ({ label, value, emphasis, danger }) => (
  <div className="flex items-baseline justify-between gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5">
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <p className={`text-lg font-black leading-none ${danger ? 'text-red-600' : emphasis ? 'text-[#00A859]' : 'text-gray-900'}`}>
      {value}
    </p>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 px-2.5 py-2">
    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 font-black text-gray-800">{value}</p>
  </div>
);

export default StationCoverageReport;
