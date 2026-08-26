import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, Circle, useMap } from 'react-leaflet';
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
  Filter,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
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
  SERVICE_RADIUS_KM,
  areaCoveragePercent,
  buildProvinceHierarchy,
  coveragePercent,
  evaluateWardCoverage,
  filterWardsByAdminKeys,
  formatCoverage,
  getMapStationPoints,
  getProvinceAreaCoverageMap,
  getProvinceCenters,
  getProvinceCoverageRows,
  matchesProvinceRegion,
  matchesStationTypeFilter,
  metricsFromWards,
  districtFilterKey,
  precinctFilterKey,
  districtDisplayName,
  precinctDisplayName,
  resolveCoverageLevelFromPercent,
  NEARBY_RADIUS_KM,
  haversineKm,
  averageStationCenter,
  stationTypeLabel,
  UNASSIGNED_PROVINCE_ID,
  type AddressSchemaMode,
  type AreaType,
  type CoverageLevel,
  type CoverageStation,
  type MapDisplayMode,
  type MapStationPoint,
  type ProvinceCoverageRow,
  type RegionId,
  type StationType,
} from './stationCoverageData';
import StationHeatLayer, { buildNationalHeatFill, type HeatPoint } from './StationHeatLayer';
import vetcMarkUrl from './assets/vetc-mark.png';

const MARKER_SIZE = 28;
const MARKER_SIZE_SELECTED = 32;

/** Đối tác có HĐ — indigo. */
const CONTRACT_STATION_BG = '#4F46E5';
/** Đối tác không HĐ — xám xanh. */
const NO_CONTRACT_STATION_BG = '#64748B';

const makeStationIcon = (bg: string, glyph: string, selected: boolean) => {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.35);${selected ? 'outline:2px solid #111;outline-offset:0;' : ''}">${glyph}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const vetcIcon = (selected: boolean) => {
  const size = selected ? MARKER_SIZE_SELECTED : MARKER_SIZE;
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.35);line-height:0;background:#00A651;${selected ? 'outline:2px solid #111;outline-offset:0;' : ''}"><img src="${vetcMarkUrl}" alt="" width="${size}" height="${size}" style="display:block;width:100%;height:100%;object-fit:cover" /></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const CONTRACT_GLYPH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" style="display:block"><path d="M9 12l2 2 4-4"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;
const NO_CONTRACT_GLYPH = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" style="display:block"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9.5 15.5 14.5 10.5M14.5 15.5 9.5 10.5"/></svg>`;

const iconForStation = (type: StationType, selected: boolean) => {
  if (type === 'rescue_internal') return vetcIcon(selected);
  if (type === 'partner_with_contract') return makeStationIcon(CONTRACT_STATION_BG, CONTRACT_GLYPH, selected);
  return makeStationIcon(NO_CONTRACT_STATION_BG, NO_CONTRACT_GLYPH, selected);
};

const FitVietnamBounds: React.FC<{ resetKey: string }> = ({ resetKey }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(VIETNAM_BOUNDS, { padding: [12, 12] });
  }, [map, resetKey]);
  return null;
};

const FlyToArea: React.FC<{
  center: [number, number] | null;
  points?: Array<[number, number]>;
  includeRadiusKm?: number | null;
}> = ({ center, points = [], includeRadiusKm = null }) => {
  const map = useMap();
  useEffect(() => {
    const latLngs: L.LatLngExpression[] = [...points];
    if (center && includeRadiusKm != null && includeRadiusKm > 0) {
      const dLat = includeRadiusKm / 111;
      const dLng = includeRadiusKm / (111 * Math.max(0.2, Math.cos((center[0] * Math.PI) / 180)));
      latLngs.push([center[0] - dLat, center[1] - dLng], [center[0] + dLat, center[1] + dLng]);
    }
    if (latLngs.length >= 2) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 11, animate: true });
      return;
    }
    if (latLngs.length === 1) {
      map.flyTo(latLngs[0], 10, { duration: 0.45 });
      return;
    }
    if (center) map.flyTo(center, 9, { duration: 0.45 });
  }, [center, points, includeRadiusKm, map]);
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
  withContractStations: number;
  noContractStations: number;
  orders: number;
  covered: number;
  avgKm: number | null;
  uncovered: number;
  wardTotal: number;
  wardCovered: number;
  cr: number;
  level: CoverageLevel;
}

const PARTNER_FILTER_OPTIONS = PARTNER_OPTIONS.slice(1);

const StationCoverageReport: React.FC = () => {
  const [addressSchema, setAddressSchema] = useState<AddressSchemaMode>('old');
  const [region, setRegion] = useState<RegionId | 'all'>('all');
  const [partners, setPartners] = useState<string[]>([]);
  const [areaType, setAreaType] = useState<AreaType | 'all'>('all');
  const [stationTypes, setStationTypes] = useState<StationType[]>([]);
  const [provinceFilterIds, setProvinceFilterIds] = useState<string[]>([]);
  const [districtFilterKeys, setDistrictFilterKeys] = useState<string[]>([]);
  const [precinctFilterKeys, setPrecinctFilterKeys] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'list'>('overview');
  const [mapMode, setMapMode] = useState<MapDisplayMode>('stations');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const moreFiltersRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMapFullscreen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mapFullscreen]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      mapRef.current?.invalidateSize({ animate: false });
    }, 180);
    return () => window.clearTimeout(id);
  }, [mapFullscreen, sidebarOpen, activeTab]);

  const mapStationPoints = useMemo(() => getMapStationPoints(addressSchema), [addressSchema]);
  const provinceCoverageRows = useMemo(
    () => getProvinceCoverageRows(addressSchema, mapStationPoints),
    [addressSchema, mapStationPoints],
  );
  const provinceCenters = useMemo(() => getProvinceCenters(addressSchema), [addressSchema]);

  const provinceFilterSet = useMemo(() => new Set(provinceFilterIds), [provinceFilterIds]);
  const partnerFilterSet = useMemo(() => new Set(partners), [partners]);
  const districtFilterSet = useMemo(() => new Set(districtFilterKeys), [districtFilterKeys]);
  const precinctFilterSet = useMemo(() => new Set(precinctFilterKeys), [precinctFilterKeys]);

  const matchesProvinceFilter = useCallback(
    (provinceId: string) => provinceFilterIds.length === 0 || provinceFilterSet.has(provinceId),
    [provinceFilterIds.length, provinceFilterSet],
  );

  const filteredStations = useMemo(() => {
    return mapStationPoints.filter((station) => {
      if (areaType !== 'all' && station.areaType !== areaType) return false;
      if (!matchesStationTypeFilter(station.stationType, stationTypes)) return false;
      if (partners.length > 0 && !partnerFilterSet.has(station.partner)) return false;
      if (provinceFilterIds.length > 0 && !provinceFilterSet.has(station.provinceId)) return false;
      // Địa chỉ mới: không lọc theo quận/huyện (bộ lọc đã ẩn)
      if (addressSchema === 'old' && districtFilterKeys.length > 0) {
        const key = districtFilterKey(station.provinceCode, station.districtCode);
        if (!districtFilterSet.has(key)) return false;
      }
      if (precinctFilterKeys.length > 0) {
        const key = precinctFilterKey(station.provinceCode, station.districtCode, station.precinctCode);
        if (!precinctFilterSet.has(key)) return false;
      }
      return true;
    });
  }, [
    addressSchema,
    areaType,
    mapStationPoints,
    partners.length,
    partnerFilterSet,
    stationTypes,
    provinceFilterIds.length,
    provinceFilterSet,
    districtFilterKeys.length,
    districtFilterSet,
    precinctFilterKeys.length,
    precinctFilterSet,
  ]);

  /** Lọc theo loại trạm / đối tác / khu vực — dùng làm nguồn cho bán kính 30km (không khóa theo tỉnh/huyện). */
  const attributeFilteredStations = useMemo(() => {
    return mapStationPoints.filter((station) => {
      if (areaType !== 'all' && station.areaType !== areaType) return false;
      if (!matchesStationTypeFilter(station.stationType, stationTypes)) return false;
      if (partners.length > 0 && !partnerFilterSet.has(station.partner)) return false;
      return true;
    });
  }, [areaType, mapStationPoints, partners.length, partnerFilterSet, stationTypes]);

  const stationStatsByProvince = useMemo(() => {
    const map = new Map<string, { total: number; internal: number; withContract: number; noContract: number }>();
    for (const station of filteredStations) {
      const current = map.get(station.provinceId) ?? { total: 0, internal: 0, withContract: 0, noContract: 0 };
      current.total += 1;
      if (station.stationType === 'rescue_internal') current.internal += 1;
      else if (station.stationType === 'partner_with_contract') current.withContract += 1;
      else current.noContract += 1;
      map.set(station.provinceId, current);
    }
    return map;
  }, [filteredStations]);

  const provinceAreaCoverage = useMemo(
    () => getProvinceAreaCoverageMap(addressSchema, attributeFilteredStations),
    [addressSchema, attributeFilteredStations],
  );

  const buildViewRow = useCallback(
    (row: ProvinceCoverageRow): ViewRow => {
      const stats = stationStatsByProvince.get(row.id) ?? { total: 0, internal: 0, withContract: 0, noContract: 0 };
      const coverage = provinceAreaCoverage.get(row.id) ?? {
        wardTotal: 0,
        wardCovered: 0,
        cr: 0,
        level: 'thap' as CoverageLevel,
      };
      return {
        row: { ...row, stations: stats.total },
        stations: stats.total,
        internalStations: stats.internal,
        withContractStations: stats.withContract,
        noContractStations: stats.noContract,
        orders: row.orders90,
        covered: row.covered90,
        avgKm: row.avgKm90,
        uncovered: Math.max(0, row.orders90 - row.covered90),
        wardTotal: coverage.wardTotal,
        wardCovered: coverage.wardCovered,
        cr: coverage.cr,
        level: coverage.level,
      };
    },
    [stationStatsByProvince, provinceAreaCoverage],
  );

  const rowsForMap: ViewRow[] = useMemo(() => {
    // Khi lọc huyện/xã: chỉ giữ các tỉnh có trong key lọc (vd HNO|TLI → chỉ Hà Nội),
    // tránh sidebar "Tất cả tỉnh" với 63 tỉnh trong khi đang xem 1 huyện.
    const provinceCodesFromAdmin = new Set<string>();
    for (const key of districtFilterKeys) {
      const code = key.split('|')[0]?.trim().toUpperCase();
      if (code && code !== '__NONE__') provinceCodesFromAdmin.add(code);
    }
    for (const key of precinctFilterKeys) {
      const code = key.split('|')[0]?.trim().toUpperCase();
      if (code && code !== '__NONE__') provinceCodesFromAdmin.add(code);
    }

    return provinceCoverageRows
      .filter((row) => matchesProvinceRegion(row, region))
      .filter((row) => matchesProvinceFilter(row.id))
      .filter((row) => {
        if (provinceCodesFromAdmin.size === 0) return true;
        return provinceCodesFromAdmin.has(row.code.toUpperCase());
      })
      .map(buildViewRow)
      .sort((a, b) => {
        if (b.stations !== a.stations) return b.stations - a.stations;
        return a.row.name.localeCompare(b.row.name, 'vi');
      });
  }, [
    region,
    matchesProvinceFilter,
    buildViewRow,
    provinceCoverageRows,
    districtFilterKeys,
    precinctFilterKeys,
  ]);

  const provinceIdByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of provinceCoverageRows) map.set(row.code.toUpperCase(), row.id);
    return map;
  }, [provinceCoverageRows]);

  /** Tỉnh suy ra từ lọc đúng 1 huyện hoặc 1 xã (key province|district|...). */
  const provinceIdFromAdminFilter = useMemo(() => {
    const key =
      precinctFilterKeys.length === 1
        ? precinctFilterKeys[0]
        : addressSchema === 'old' && districtFilterKeys.length === 1
          ? districtFilterKeys[0]
          : null;
    if (!key) return null;
    const code = key.split('|')[0]?.trim().toUpperCase();
    if (!code) return null;
    return provinceIdByCode.get(code) ?? null;
  }, [precinctFilterKeys, districtFilterKeys, addressSchema, provinceIdByCode]);

  /** Click tỉnh / lọc 1 tỉnh / lọc 1 huyện|xã → xem chi tiết tỉnh đó. */
  const effectiveFocusedId =
    focusedId ??
    (provinceFilterIds.length === 1 ? provinceFilterIds[0] : null) ??
    provinceIdFromAdminFilter;
  const selectedFromAdminFilter =
    focusedId == null &&
    (provinceFilterIds.length === 1 ||
      districtFilterKeys.length === 1 ||
      precinctFilterKeys.length === 1);

  const viewRows: ViewRow[] = useMemo(() => {
    const source = effectiveFocusedId
      ? rowsForMap.filter((item) => item.row.id === effectiveFocusedId)
      : rowsForMap;
    return [...source].sort((a, b) => {
      if (b.stations !== a.stations) return b.stations - a.stations;
      return a.row.name.localeCompare(b.row.name, 'vi');
    });
  }, [rowsForMap, effectiveFocusedId]);

  const hierarchyRows = useMemo(
    () =>
      buildProvinceHierarchy(
        addressSchema,
        provinceCoverageRows.filter((row) => matchesProvinceRegion(row, region)).filter((row) => matchesProvinceFilter(row.id)),
        filteredStations,
        attributeFilteredStations,
      ),
    [addressSchema, provinceCoverageRows, region, matchesProvinceFilter, filteredStations, attributeFilteredStations],
  );

  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedProvinces(new Set());
    setExpandedDistricts(new Set());
  }, [
    addressSchema,
    region,
    provinceFilterIds,
    districtFilterKeys,
    precinctFilterKeys,
    stationTypes,
    partners,
    areaType,
  ]);

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

  /** Trạm trong vùng/tỉnh đã chọn — dùng để build option huyện/xã (cascade). */
  const stationsForAdminOptions = useMemo(() => {
    const regionProvinceIds = new Set(
      provinceCoverageRows.filter((row) => matchesProvinceRegion(row, region)).map((row) => row.id),
    );
    return mapStationPoints.filter((station) => {
      if (station.provinceId === UNASSIGNED_PROVINCE_ID) return false;
      if (!regionProvinceIds.has(station.provinceId)) return false;
      if (provinceFilterIds.length > 0 && !provinceFilterSet.has(station.provinceId)) return false;
      return true;
    });
  }, [mapStationPoints, provinceFilterIds.length, provinceFilterSet, provinceCoverageRows, region]);

  const provinceNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of provinceCoverageRows) map.set(row.id, row.name);
    return map;
  }, [provinceCoverageRows]);

  const districtOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const station of stationsForAdminOptions) {
      const key = districtFilterKey(station.provinceCode, station.districtCode);
      if (byKey.has(key)) continue;
      const districtName = districtDisplayName(addressSchema, station.provinceCode, station.districtCode);
      const provinceName = provinceNameById.get(station.provinceId) ?? station.provinceCode;
      byKey.set(key, `${districtName} (${provinceName})`);
    }
    return [...byKey.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [stationsForAdminOptions, addressSchema, provinceNameById]);

  const precinctOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const station of stationsForAdminOptions) {
      if (districtFilterKeys.length > 0) {
        const dKey = districtFilterKey(station.provinceCode, station.districtCode);
        if (!districtFilterSet.has(dKey)) continue;
      }
      const key = precinctFilterKey(station.provinceCode, station.districtCode, station.precinctCode);
      if (byKey.has(key)) continue;
      const precinctName = precinctDisplayName(
        addressSchema,
        station.provinceCode,
        station.districtCode,
        station.precinctCode,
      );
      const districtName = districtDisplayName(addressSchema, station.provinceCode, station.districtCode);
      byKey.set(key, `${precinctName} · ${districtName}`);
    }
    return [...byKey.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'));
  }, [stationsForAdminOptions, districtFilterKeys.length, districtFilterSet, addressSchema]);

  useEffect(() => {
    const validDistrict = new Set(districtOptions.map((opt) => opt.value));
    setDistrictFilterKeys((prev) => {
      const next = prev.filter((key) => validDistrict.has(key));
      return next.length === prev.length ? prev : next;
    });
  }, [districtOptions]);

  useEffect(() => {
    const validPrecinct = new Set(precinctOptions.map((opt) => opt.value));
    setPrecinctFilterKeys((prev) => {
      const next = prev.filter((key) => validPrecinct.has(key));
      return next.length === prev.length ? prev : next;
    });
  }, [precinctOptions]);

  const visibleIds = useMemo(() => new Set(rowsForMap.map((item) => item.row.id)), [rowsForMap]);
  const selected = effectiveFocusedId
    ? (rowsForMap.find((item) => item.row.id === effectiveFocusedId) ?? null)
    : null;

  /** Độ phủ / tiêu đề khu vực — thu hẹp theo huyện/xã đang lọc (không lấy cả tỉnh). */
  const areaDetail = useMemo(() => {
    if (!selected) return null;

    const provinceLabel = selected.row.name;
    const provinceCode = selected.row.code;

    const scopedNeeded = precinctFilterKeys.length > 0 || districtFilterKeys.length > 0;
    const scopedWards = scopedNeeded
      ? filterWardsByAdminKeys(evaluateWardCoverage(addressSchema, attributeFilteredStations), {
          precinctKeys: precinctFilterKeys,
          districtKeys: precinctFilterKeys.length > 0 ? undefined : districtFilterKeys,
          provinceCodes: [provinceCode],
        })
      : null;
    const scopedMetrics = scopedWards ? metricsFromWards(scopedWards) : null;

    const wardCovered = scopedMetrics?.wardCovered ?? selected.wardCovered;
    const wardTotal = scopedMetrics?.wardTotal ?? selected.wardTotal;
    const cr = scopedMetrics ? scopedMetrics.cr : selected.cr;
    const level = scopedMetrics ? resolveCoverageLevelFromPercent(scopedMetrics.cr) : selected.level;

    let title = provinceLabel;
    let subtitle = provinceCode;
    let levelHint: 'province' | 'district' | 'precinct' = 'province';

    if (precinctFilterKeys.length === 1) {
      const key = precinctFilterKeys[0];
      const [, distCode, precCode] = key.split('|');
      const precinctName =
        precinctOptions.find((opt) => opt.value === key)?.label?.split(' · ')[0] ??
        precinctDisplayName(addressSchema, provinceCode, distCode === '__none__' ? null : distCode, precCode === '__none__' ? null : precCode);
      const districtName = districtDisplayName(
        addressSchema,
        provinceCode,
        distCode === '__none__' ? null : distCode,
      );
      title = precinctName;
      subtitle = `${districtName} · ${provinceLabel} · ${provinceCode}`;
      levelHint = 'precinct';
    } else if (precinctFilterKeys.length > 1) {
      title = `${precinctFilterKeys.length} phường/xã`;
      subtitle = `${provinceLabel} · ${provinceCode}`;
      levelHint = 'precinct';
    } else if (addressSchema === 'old' && districtFilterKeys.length === 1) {
      const key = districtFilterKeys[0];
      const [, distCode] = key.split('|');
      const districtName =
        districtOptions.find((opt) => opt.value === key)?.label ??
        districtDisplayName(addressSchema, provinceCode, distCode === '__none__' ? null : distCode);
      title = districtName;
      subtitle = `${provinceLabel} · ${provinceCode}`;
      levelHint = 'district';
    } else if (addressSchema === 'old' && districtFilterKeys.length > 1) {
      title = `${districtFilterKeys.length} quận/huyện`;
      subtitle = `${provinceLabel} · ${provinceCode}`;
      levelHint = 'district';
    }

    return { title, subtitle, wardCovered, wardTotal, cr, level, levelHint };
  }, [
    selected,
    addressSchema,
    attributeFilteredStations,
    precinctFilterKeys,
    districtFilterKeys,
    precinctOptions,
    districtOptions,
  ]);

  /**
   * Khi search/chọn đúng 1 area (xã > huyện > tỉnh/focus) → lấy tâm điểm
   * để vẽ bán kính 30km và liệt kê trạm lân cận.
   */
  const searchAreaFocus = useMemo(() => {
    if (precinctFilterKeys.length === 1) {
      const key = precinctFilterKeys[0];
      const inArea = mapStationPoints.filter(
        (s) => precinctFilterKey(s.provinceCode, s.districtCode, s.precinctCode) === key,
      );
      const fromStations =
        averageStationCenter(inArea.filter((s) => s.hasValidPosition)) ?? averageStationCenter(inArea);
      const center =
        fromStations ??
        (() => {
          const wards = filterWardsByAdminKeys(evaluateWardCoverage(addressSchema, []), {
            precinctKeys: [key],
          });
          if (wards.length === 0) return null;
          const lat = wards.reduce((sum, w) => sum + w.lat, 0) / wards.length;
          const lng = wards.reduce((sum, w) => sum + w.lng, 0) / wards.length;
          return [lat, lng] as [number, number];
        })();
      if (!center) return null;
      const label = precinctOptions.find((opt) => opt.value === key)?.label ?? 'Phường/Xã đã chọn';
      return { center, label, level: 'precinct' as const };
    }
    if (addressSchema === 'old' && districtFilterKeys.length === 1) {
      const key = districtFilterKeys[0];
      const inArea = mapStationPoints.filter(
        (s) => districtFilterKey(s.provinceCode, s.districtCode) === key,
      );
      const fromStations =
        averageStationCenter(inArea.filter((s) => s.hasValidPosition)) ?? averageStationCenter(inArea);
      const center =
        fromStations ??
        (() => {
          const wards = filterWardsByAdminKeys(evaluateWardCoverage(addressSchema, []), {
            districtKeys: [key],
          });
          if (wards.length === 0) return null;
          const lat = wards.reduce((sum, w) => sum + w.lat, 0) / wards.length;
          const lng = wards.reduce((sum, w) => sum + w.lng, 0) / wards.length;
          return [lat, lng] as [number, number];
        })();
      if (!center) return null;
      const label = districtOptions.find((opt) => opt.value === key)?.label ?? 'Quận/Huyện đã chọn';
      return { center, label, level: 'district' as const };
    }
    if (provinceFilterIds.length === 1) {
      const id = provinceFilterIds[0];
      const center = provinceCenters[id];
      if (!center) return null;
      const label = provincesByName.find((row) => row.id === id)?.name ?? id;
      return { center, label, level: 'province' as const };
    }
    if (focusedId) {
      const center = provinceCenters[focusedId];
      if (!center) return null;
      const label =
        rowsForMap.find((item) => item.row.id === focusedId)?.row.name ??
        provinceCoverageRows.find((row) => row.id === focusedId)?.name ??
        focusedId;
      return { center, label, level: 'province' as const };
    }
    return null;
  }, [
    precinctFilterKeys,
    districtFilterKeys,
    provinceFilterIds,
    focusedId,
    addressSchema,
    mapStationPoints,
    precinctOptions,
    districtOptions,
    provinceCenters,
    provincesByName,
    rowsForMap,
    provinceCoverageRows,
  ]);

  const nearbyStations = useMemo(() => {
    if (!searchAreaFocus) return [] as Array<MapStationPoint & { distanceKm: number }>;
    const [lat, lng] = searchAreaFocus.center;
    return attributeFilteredStations
      .filter((station) => station.hasValidPosition && station.provinceId !== UNASSIGNED_PROVINCE_ID)
      .map((station) => ({
        ...station,
        distanceKm: haversineKm(lat, lng, station.position[0], station.position[1]),
      }))
      .filter((station) => station.distanceKm <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name, 'vi'));
  }, [searchAreaFocus, attributeFilteredStations]);

  const nearbyDistanceById = useMemo(() => {
    const map = new Map<string, number>();
    for (const station of nearbyStations) map.set(station.id, station.distanceKm);
    return map;
  }, [nearbyStations]);

  const selectedCenter = searchAreaFocus?.center ?? null;

  const kpis = useMemo(() => {
    const source = effectiveFocusedId ? viewRows : rowsForMap;
    const totalStations = source.reduce((sum, item) => sum + item.stations, 0);
    const withStation = source.filter((item) => item.stations >= 1).length;
    const lowProvinces = source.filter((item) => item.level === 'thap').length;
    const presenceCr = source.length === 0 ? null : coveragePercent(withStation, source.length);
    const wardTotal = source.reduce((sum, item) => sum + item.wardTotal, 0);
    const wardCovered = source.reduce((sum, item) => sum + item.wardCovered, 0);
    const nationalCr = wardTotal === 0 ? null : areaCoveragePercent(wardCovered, wardTotal);
    return {
      totalOrders: source.reduce((sum, item) => sum + item.orders, 0),
      totalCovered: source.reduce((sum, item) => sum + item.covered, 0),
      totalStations,
      withStation,
      lowProvinces,
      nationalCr,
      presenceCr,
      wardTotal,
      wardCovered,
    };
  }, [viewRows, rowsForMap, effectiveFocusedId]);

  const filteredStationIdSet = useMemo(
    () => new Set(filteredStations.map((station) => station.id)),
    [filteredStations],
  );

  const visibleStations = useMemo(() => {
    const byId = new Map<string, MapStationPoint>();
    for (const station of filteredStations) {
      if (!station.hasValidPosition) continue;
      if (station.provinceId === UNASSIGNED_PROVINCE_ID) continue;
      if (!visibleIds.has(station.provinceId)) continue;
      if (effectiveFocusedId && station.provinceId !== effectiveFocusedId) continue;
      byId.set(station.id, station);
    }
    // Khi chọn 1 khu vực: thêm marker các trạm trong bán kính 30km (kể cả ngoài tỉnh/huyện lọc).
    // KPI / Trạm active vẫn chỉ đếm filteredStations.
    for (const station of nearbyStations) {
      byId.set(station.id, station);
    }
    return [...byId.values()];
  }, [filteredStations, visibleIds, effectiveFocusedId, nearbyStations]);

  const drillStations = useMemo(() => {
    return filteredStations.filter((station) => {
      if (station.provinceId === UNASSIGNED_PROVINCE_ID) return false;
      if (!visibleIds.has(station.provinceId)) return false;
      if (effectiveFocusedId && station.provinceId !== effectiveFocusedId) return false;
      return true;
    });
  }, [filteredStations, visibleIds, effectiveFocusedId]);

  const mapFitPoints = useMemo(
    () => visibleStations.map((station) => station.position),
    [visibleStations],
  );

  const provinceStyle = useCallback(
    (feature?: GeoJSON.Feature) => {
      const id = feature?.properties?.id as string | undefined;
      const isSelected = id === effectiveFocusedId;
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
    [visibleIds, effectiveFocusedId, mapMode],
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
      'Đối tác có HĐ',
      'Đối tác không HĐ',
      'Xã phủ',
      'Tổng xã',
      `% độ phủ (R=${SERVICE_RADIUS_KM}km)`,
      'Mức',
      'Km tới trạm gần nhất',
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
          province.withContract,
          province.noContract,
          province.wardCovered,
          province.wardTotal,
          province.cr.toFixed(1),
          LEVEL_META[province.level].label,
          '',
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
            district.withContract,
            district.noContract,
            district.wardCovered,
            district.wardTotal,
            district.cr == null ? '' : district.cr.toFixed(1),
            district.level ? LEVEL_META[district.level].label : '',
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
              precinct.withContract,
              precinct.noContract,
              precinct.cr === 100 ? 1 : precinct.cr === 0 ? 0 : '',
              precinct.hasCentroid ? 1 : '',
              precinct.cr == null ? '' : precinct.cr.toFixed(1),
              '',
              precinct.nearestKm == null ? '' : precinct.nearestKm.toFixed(2),
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
    setExportNote(`Đã xuất ${hierarchyRows.length} tỉnh · độ phủ xã (R=${SERVICE_RADIUS_KM}km).`);
  };

  const nationalFillPoints = useMemo(() => buildNationalHeatFill(visibleIds), [visibleIds]);

  const heatPoints = useMemo<HeatPoint[]>(() => {
    const hot = visibleStations.map((station) => [station.position[0], station.position[1], 0.68] as HeatPoint);
    return [...nationalFillPoints, ...hot];
  }, [nationalFillPoints, visibleStations]);

  const moreFilterCount =
    (region !== 'all' ? 1 : 0) + (partners.length > 0 ? 1 : 0) + (areaType !== 'all' ? 1 : 0);

  const hasActiveFilters =
    provinceFilterIds.length > 0 ||
    (addressSchema === 'old' && districtFilterKeys.length > 0) ||
    precinctFilterKeys.length > 0 ||
    focusedId != null ||
    moreFilterCount > 0 ||
    stationTypes.length > 0 ||
    addressSchema !== 'new';

  const resetFilters = () => {
    setProvinceFilterIds([]);
    setDistrictFilterKeys([]);
    setPrecinctFilterKeys([]);
    setFocusedId(null);
    setRegion('all');
    setPartners([]);
    setAreaType('all');
    setStationTypes([]);
    setAddressSchema('new');
    setMoreFiltersOpen(false);
  };

  useEffect(() => {
    setProvinceFilterIds([]);
    setDistrictFilterKeys([]);
    setPrecinctFilterKeys([]);
    setFocusedId(null);
  }, [addressSchema]);

  useEffect(() => {
    if (!moreFiltersOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (moreFiltersRef.current?.contains(target)) return;
      // AppSelect (Radix) portal ra body — không đóng panel khi tương tác dropdown
      if (target.closest('[data-radix-select-content], [data-radix-popper-content-wrapper]')) return;
      setMoreFiltersOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [moreFiltersOpen]);

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
          <div className="w-[180px] shrink-0">
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
          {addressSchema === 'old' && (
            <div className="w-[200px] shrink-0">
              <AppMultiSelect
                values={districtFilterKeys}
                placeholder="Tất cả quận/huyện"
                searchPlaceholder="Tìm quận/huyện..."
                options={districtOptions}
                onChange={setDistrictFilterKeys}
              />
            </div>
          )}
          <div className="w-[200px] shrink-0">
            <AppMultiSelect
              values={precinctFilterKeys}
              placeholder="Tất cả phường/xã"
              searchPlaceholder="Tìm phường/xã..."
              options={precinctOptions}
              onChange={setPrecinctFilterKeys}
            />
          </div>
          <div className="w-[180px] shrink-0">
            <AppMultiSelect
              values={stationTypes}
              placeholder="Tất cả loại trạm"
              searchPlaceholder="Tìm loại trạm..."
              options={STATION_TYPE_OPTIONS.filter((opt) => opt.id !== 'all').map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
              onChange={(values) => setStationTypes(values as StationType[])}
            />
          </div>
          <div className="relative shrink-0" ref={moreFiltersRef}>
            <button
              type="button"
              aria-expanded={moreFiltersOpen}
              onClick={() => setMoreFiltersOpen((prev) => !prev)}
              className={`inline-flex h-[34px] items-center gap-1.5 rounded border bg-white px-3 text-sm outline-none transition-colors hover:bg-gray-50 ${
                moreFilterCount > 0 ? 'border-[#00A859] text-[#00A859]' : 'text-gray-700'
              }`}
            >
              <Filter size={14} />
              Bộ lọc
              {moreFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00A859] px-1.5 text-[10px] font-bold text-white">
                  {moreFilterCount}
                </span>
              )}
            </button>
            {moreFiltersOpen && (
              <div className="absolute right-0 z-40 mt-1.5 w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">Bộ lọc thêm</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-600">Miền</label>
                    <AppSelect
                      value={region}
                      options={REGION_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
                      onChange={(value) => setRegion(value as RegionId | 'all')}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-600">Đối tác</label>
                    <AppMultiSelect
                      values={partners}
                      placeholder="Tất cả đối tác"
                      searchPlaceholder="Tìm đối tác..."
                      options={PARTNER_FILTER_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                      onChange={setPartners}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-600">Loại khu vực</label>
                    <AppSelect
                      value={areaType}
                      options={AREA_TYPE_OPTIONS.map((opt) => ({ value: opt.id, label: opt.label }))}
                      onChange={(value) => setAreaType(value as AreaType | 'all')}
                    />
                  </div>
                </div>
              </div>
            )}
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
        <div
          className={
            mapFullscreen
              ? 'fixed inset-0 z-[80] flex bg-white'
              : 'flex flex-col gap-4 xl:flex-row xl:items-stretch'
          }
        >
          <div className={`min-w-0 ${mapFullscreen ? 'relative flex-1' : 'xl:flex-1'}`}>
            <div
              className={`rsa-dashboard-map relative z-0 isolate overflow-hidden bg-white ${
                mapFullscreen
                  ? 'h-full rounded-none border-0 shadow-none'
                  : 'rounded-2xl border border-gray-100 shadow-sm'
              }`}
              style={mapFullscreen ? { height: '100%' } : { minHeight: 'calc(100vh - 260px)' }}
            >
              <MapContainer
                center={[16.2, 106.5]}
                zoom={6}
                className="absolute inset-0 z-0 h-full w-full"
                style={mapFullscreen ? { height: '100%' } : { minHeight: 'calc(100vh - 260px)' }}
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
                {selectedCenter || mapFitPoints.length > 0 ? (
                  <FlyToArea
                    center={selectedCenter}
                    points={mapFitPoints}
                    includeRadiusKm={searchAreaFocus ? NEARBY_RADIUS_KM : null}
                  />
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

                {searchAreaFocus && (
                  <Circle
                    center={searchAreaFocus.center}
                    radius={NEARBY_RADIUS_KM * 1000}
                    pathOptions={{
                      color: '#00A859',
                      weight: 2,
                      fillColor: '#00A859',
                      fillOpacity: 0.08,
                      dashArray: '6 4',
                    }}
                  />
                )}

                {mapMode === 'heatmap' && <StationHeatLayer points={heatPoints} />}

                {mapMode === 'stations' &&
                  visibleStations.map((station) => (
                    <Marker
                      key={station.id}
                      position={station.position}
                      icon={iconForStation(station.stationType, station.provinceId === effectiveFocusedId)}
                      eventHandlers={{
                        click: () => setFocusedId(station.provinceId),
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -14]} opacity={1} className="station-name-tooltip">
                        <div className="min-w-0 max-w-[296px]">
                          <p className="text-[13px] font-bold leading-snug text-white">{station.name}</p>
                          <p className="mt-1 text-[11px] font-medium leading-snug text-white/80">
                            {stationTypeLabel(station.stationType)}
                            {nearbyDistanceById.has(station.id)
                              ? ` · ${nearbyDistanceById.get(station.id)!.toFixed(1)} km`
                              : ''}
                            {searchAreaFocus &&
                            nearbyDistanceById.has(station.id) &&
                            !filteredStationIdSet.has(station.id)
                              ? ' · ngoài khu vực lọc'
                              : ''}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-white/75">{station.partner}</p>
                          <p className="mt-1 text-[11px] leading-snug text-white/70">
                            {station.code} · {station.provinceName}
                            {station.provinceSource === 'address' ? ' (suy từ địa chỉ)' : ''}
                          </p>
                          {station.address ? (
                            <p className="mt-1 break-words text-[11px] leading-snug text-white/65">{station.address}</p>
                          ) : null}
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}
              </MapContainer>

              {searchAreaFocus && (
                <div className="pointer-events-none absolute left-4 top-14 z-20 max-w-[280px] rounded-lg border border-emerald-200 bg-emerald-50/95 px-3 py-2 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                    Bán kính {NEARBY_RADIUS_KM} km
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-emerald-900">
                    {searchAreaFocus.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-700">
                    {nearbyStations.length} trạm trong vòng {NEARBY_RADIUS_KM} km (hiện trên map; KPI chỉ đếm
                    trong khu vực lọc)
                  </p>
                </div>
              )}

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

              <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 px-2.5 text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label={sidebarOpen ? 'Ẩn bảng chi tiết' : 'Hiện bảng chi tiết'}
                  title={sidebarOpen ? 'Ẩn bảng chi tiết' : 'Hiện bảng chi tiết'}
                >
                  {sidebarOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
                  <span className="hidden sm:inline">{sidebarOpen ? 'Ẩn bảng' : 'Hiện bảng'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapFullscreen((prev) => !prev)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 px-2.5 text-[11px] font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  aria-label={mapFullscreen ? 'Thu nhỏ bản đồ' : 'Xem bản đồ toàn màn hình'}
                  title={mapFullscreen ? 'Thu nhỏ (Esc)' : 'Toàn màn hình'}
                >
                  {mapFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span className="hidden sm:inline">{mapFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
                </button>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-4 z-20 space-y-1.5 rounded-xl border border-gray-200 bg-white/95 px-3 py-2.5 shadow-sm">
                {mapMode === 'stations' ? (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-wide text-gray-400">Loại trạm</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full shadow-sm">
                        <img src={vetcMarkUrl} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600">Trạm nội bộ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
                        style={{ background: CONTRACT_STATION_BG }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: CONTRACT_GLYPH }} />
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600">Đối tác có HĐ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
                        style={{ background: NO_CONTRACT_STATION_BG }}
                      >
                        <span dangerouslySetInnerHTML={{ __html: NO_CONTRACT_GLYPH }} />
                      </span>
                      <span className="text-[10px] font-semibold text-gray-600">Đối tác không HĐ</span>
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

          {sidebarOpen && (
            <div
              className={
                mapFullscreen
                  ? 'absolute right-0 top-0 z-[90] flex h-full w-full max-w-[360px] border-l border-gray-100 bg-white/95 shadow-xl backdrop-blur-sm sm:w-[360px]'
                  : 'w-full xl:w-auto xl:shrink-0'
              }
            >
              <ProvinceDetailPanel
                selected={selected}
                areaDetail={areaDetail}
                provinceRows={rowsForMap}
                kpis={kpis}
                drillStations={drillStations}
                nearbyStations={nearbyStations}
                searchAreaLabel={searchAreaFocus?.label ?? null}
                filterSummaryTitle={
                  provinceFilterIds.length > 1
                    ? `${provinceFilterIds.length} tỉnh đang lọc`
                    : 'Tất cả tỉnh'
                }
                onSelectProvince={setFocusedId}
                onClose={() => {
                  setFocusedId(null);
                  if (selectedFromAdminFilter) {
                    setProvinceFilterIds([]);
                    setDistrictFilterKeys([]);
                    setPrecinctFilterKeys([]);
                  }
                }}
                className={
                  mapFullscreen
                    ? '!h-full !w-full !max-w-none !rounded-none !border-0 !shadow-none overflow-y-auto'
                    : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <KpiChip label="Tỉnh có trạm" value={formatCoverage(kpis.presenceCr)} emphasis />
            <KpiChip label="Trạm active" value={formatNumber(kpis.totalStations)} />
            <KpiChip label={`% độ phủ (R=${SERVICE_RADIUS_KM}km)`} value={formatCoverage(kpis.nationalCr)} />
            <KpiChip
              label="Tỉnh mức thấp"
              value={formatNumber(kpis.lowProvinces)}
              danger={kpis.lowProvinces > 0}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-50 px-4 py-2 text-[11px] font-semibold text-gray-500">
              {addressSchema === 'new'
                ? `Địa chỉ mới · 34 tỉnh · % độ phủ = xã có trạm gần nhất < ${SERVICE_RADIUS_KM}km (kể cả ngoài huyện/tỉnh) / tổng xã`
                : `Địa chỉ cũ · 63 tỉnh → Huyện → Xã · % độ phủ = xã có trạm gần nhất < ${SERVICE_RADIUS_KM}km (kể cả ngoài huyện) / tổng xã`}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-2.5">Đơn vị hành chính</th>
                    <th className="px-4 py-2.5 text-right">Trạm</th>
                    <th className="px-4 py-2.5 text-right">Nội bộ</th>
                    <th className="px-4 py-2.5 text-right">Có HĐ</th>
                    <th className="px-4 py-2.5 text-right">Không HĐ</th>
                    <th className="px-4 py-2.5 text-right">% độ phủ</th>
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
                                <span className="text-[10px] text-gray-400">
                                  {province.code} · Tỉnh · {province.wardCovered}/{province.wardTotal} xã phủ
                                </span>
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.internal)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.withContract)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatNumber(province.noContract)}</td>
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
                                        <span className="text-[10px] text-gray-400">
                                          {district.code} · Huyện
                                          {district.wardTotal > 0
                                            ? ` · ${district.wardCovered}/${district.wardTotal} xã phủ`
                                            : ''}
                                          {district.total === 0 && (district.cr ?? 0) > 0
                                            ? ' · phủ bởi trạm ngoài huyện'
                                            : ''}
                                        </span>
                                      </span>
                                    </button>
                                  </td>
                                  <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatNumber(district.total)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.internal)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.withContract)}</td>
                                  <td className="px-4 py-2 text-right text-gray-700">{formatNumber(district.noContract)}</td>
                                  <td
                                    className={`px-4 py-2 text-right font-black ${
                                      district.level ? LEVEL_META[district.level].text : 'text-gray-300'
                                    }`}
                                  >
                                    {formatCoverage(district.cr)}
                                  </td>
                                  <td className="px-4 py-2">
                                    {district.level ? (
                                      <span
                                        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${LEVEL_META[district.level].badge}`}
                                      >
                                        {LEVEL_META[district.level].label}
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="px-4 py-2" />
                                </tr>
                                {districtOpen &&
                                  district.precincts.map((precinct) => (
                                    <tr key={`${districtKey}::${precinct.code}`} className="border-t border-gray-50 bg-white">
                                      <td className="px-4 py-2 pl-16">
                                        <p className="font-medium text-gray-700">{precinct.name}</p>
                                        <p className="text-[10px] text-gray-400">
                                          {precinct.code} · Xã/Phường
                                          {precinct.nearestKm != null
                                            ? ` · ${precinct.nearestKm.toFixed(1)} km`
                                            : precinct.hasCentroid
                                              ? ''
                                              : ' · chưa có centroid'}
                                        </p>
                                      </td>
                                      <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatNumber(precinct.total)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.internal)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.withContract)}</td>
                                      <td className="px-4 py-2 text-right text-gray-700">{formatNumber(precinct.noContract)}</td>
                                      <td
                                        className={`px-4 py-2 text-right font-black ${
                                          precinct.cr === 100
                                            ? 'text-emerald-800'
                                            : precinct.cr === 0
                                              ? 'text-orange-700'
                                              : 'text-gray-300'
                                        }`}
                                      >
                                        {formatCoverage(precinct.cr)}
                                      </td>
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
  areaDetail: {
    title: string;
    subtitle: string;
    wardCovered: number;
    wardTotal: number;
    cr: number;
    level: CoverageLevel;
    levelHint: 'province' | 'district' | 'precinct';
  } | null;
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
  nearbyStations: Array<MapStationPoint & { distanceKm: number }>;
  searchAreaLabel: string | null;
  filterSummaryTitle: string;
  onSelectProvince: (id: string) => void;
  onClose: () => void;
  className?: string;
}> = ({
  selected,
  areaDetail,
  provinceRows,
  kpis,
  drillStations,
  nearbyStations,
  searchAreaLabel,
  filterSummaryTitle,
  onSelectProvince,
  onClose,
  className,
}) => {
  const internalCount = drillStations.filter((station) => station.stationType === 'rescue_internal').length;
  const withContractCount = drillStations.filter((station) => station.stationType === 'partner_with_contract').length;
  const noContractCount = drillStations.filter((station) => station.stationType === 'partner_no_contract').length;
  const provinceList = [...provinceRows].sort((a, b) => {
    if (b.stations !== a.stations) return b.stations - a.stations;
    return a.row.name.localeCompare(b.row.name, 'vi');
  });

  const coverageLevel = areaDetail?.level ?? selected?.level ?? 'thap';
  const coverageCr = areaDetail?.cr ?? selected?.cr ?? null;
  const wardCovered = areaDetail?.wardCovered ?? selected?.wardCovered ?? 0;
  const wardTotal = areaDetail?.wardTotal ?? selected?.wardTotal ?? 0;

  const nearbyList = (
    <>
      {searchAreaLabel && (
        <>
          <h3 className="mt-4 text-[11px] font-black uppercase tracking-wider text-emerald-700">
            Trong bán kính {NEARBY_RADIUS_KM} km · {nearbyStations.length} trạm
          </h3>
          <p className="mt-1 text-[10px] text-gray-500">Tâm: {searchAreaLabel}</p>
          <ul className="mt-2 max-h-[32vh] space-y-2 overflow-y-auto">
            {nearbyStations.length === 0 && (
              <li className="text-[11px] text-gray-400">Không có trạm trong bán kính {NEARBY_RADIUS_KM} km.</li>
            )}
            {nearbyStations.map((station) => (
              <li key={`near-${station.id}`} className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-2.5 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-gray-800">{station.name}</p>
                  <span className="shrink-0 text-[10px] font-black text-emerald-700">
                    {station.distanceKm.toFixed(1)} km
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">
                  {station.code} · {stationTypeLabel(station.stationType)} · {station.provinceName}
                </p>
                <p className="text-[10px] text-gray-500">{station.partner}</p>
                {station.address ? <p className="mt-0.5 text-[10px] leading-snug text-gray-500">{station.address}</p> : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );

  if (!selected) {
    return (
      <aside className={`flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:w-[340px] xl:shrink-0 ${className ?? ''}`}>
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tổng hợp</p>
        <h2 className="mt-1 text-base font-black text-gray-900">{filterSummaryTitle}</h2>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-black text-gray-900">{formatCoverage(kpis.presenceCr)}</span>
          <span className="text-[10px] font-semibold text-gray-400">tỉnh có trạm</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <MiniStat label="Số tỉnh" value={formatNumber(provinceRows.length)} />
          <MiniStat label="Tỉnh có trạm" value={formatNumber(kpis.withStation)} />
          <MiniStat label="Trạm active" value={formatNumber(kpis.totalStations)} />
          <MiniStat label={`% độ phủ (R=${SERVICE_RADIUS_KM}km)`} value={formatCoverage(kpis.nationalCr)} />
          <MiniStat label="Tỉnh mức thấp" value={formatNumber(kpis.lowProvinces)} />
        </dl>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <MiniStat label="Nội bộ" value={formatNumber(internalCount)} />
          <MiniStat label="Đối tác có HĐ" value={formatNumber(withContractCount)} />
          <MiniStat label="Đối tác không HĐ" value={formatNumber(noContractCount)} />
        </dl>

        {nearbyList}

        {!searchAreaLabel && (
          <>
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
          </>
        )}
      </aside>
    );
  }

  return (
    <aside className={`flex w-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm xl:w-[340px] xl:shrink-0 ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Chi tiết khu vực</p>
          <h2 className="mt-1 text-base font-black text-gray-900">
            {areaDetail?.title ?? selected.row.name}
          </h2>
          <p className="mt-0.5 text-[11px] font-semibold text-gray-500">
            {areaDetail?.subtitle ?? selected.row.code}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Xóa chọn khu vực"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${LEVEL_META[coverageLevel].badge}`}>
          {LEVEL_META[coverageLevel].label}
        </span>
        <span className="text-sm font-black text-gray-900">{formatCoverage(coverageCr)}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <MiniStat label="Trạm active" value={formatNumber(drillStations.length)} />
        <MiniStat label="Xã được phủ" value={`${wardCovered}/${wardTotal}`} />
        <MiniStat label="Nội bộ" value={formatNumber(internalCount)} />
        <MiniStat label="Đối tác có HĐ" value={formatNumber(withContractCount)} />
        <MiniStat label="Đối tác không HĐ" value={formatNumber(noContractCount)} />
        <MiniStat label={`% độ phủ (R=${SERVICE_RADIUS_KM}km)`} value={formatCoverage(coverageCr)} />
      </dl>
      {drillStations.length === 0 && (
        <p className="mt-2 text-[11px] text-amber-700">Chưa có trạm active khớp bộ lọc tại khu vực này.</p>
      )}

      {nearbyList}

      <h3 className="mt-4 text-[11px] font-black uppercase tracking-wider text-gray-400">
        {areaDetail?.levelHint === 'precinct'
          ? 'Trạm trong xã/phường (lọc)'
          : areaDetail?.levelHint === 'district'
            ? 'Trạm trong huyện (lọc)'
            : 'Trạm trong tỉnh (lọc)'}
      </h3>
      <ul className="mt-2 max-h-[22vh] space-y-2 overflow-y-auto">
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
