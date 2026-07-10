import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Route as RouteIcon,
  Search,
  Send,
  Sparkles,
  User,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  X,
  AlertTriangle,
  CloudRain,
  Waves,
  Car,
  Wrench,
  Building2,
  Truck,
  Flag,
  List,
  ChevronDown,
  ClipboardList,
  Trash2,
  GripVertical,
} from 'lucide-react';
import {
  AreaWarning,
  AreaWarningSeverity,
  AreaWarningType,
  ChatMessageData,
  IdentifiedLocation,
  INITIAL_BOT_MESSAGE,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  NearbyPlace,
  respondToMessage,
  identifyLocationFromQuery,
  RouteOrigin,
  RouteResult,
  SAMPLE_PROMPTS,
  StationDistance,
  buildRouteFrom,
  geocodeOrigin,
  nearestStations,
  VIETNAM_BOUNDS,
  LatLngTuple,
  uid,
  hasKeyword,
  KW_ROUTE,
  KW_STATION_LIST,
  KW_TOW,
} from '../data/locationSearchMockData';

const GREEN = '#00A859';

const BotAvatar: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <img
    src="/vetc-logo.png"
    alt="VETC"
    style={{ width: size, height: size }}
    className="rounded-full object-contain bg-white border border-gray-200 shrink-0"
  />
);

const WARNING_ICON: Record<AreaWarningType, React.ComponentType<{ size?: number; className?: string }>> = {
  weather: CloudRain,
  flood: Waves,
  traffic: Car,
  demand: Wrench,
};

const WARNING_STYLE: Record<AreaWarningSeverity, { box: string; icon: string; dot: string }> = {
  high: { box: 'bg-red-50 border-red-200', icon: 'text-red-600', dot: 'bg-red-500' },
  medium: { box: 'bg-amber-50 border-amber-200', icon: 'text-amber-600', dot: 'bg-amber-500' },
  low: { box: 'bg-blue-50 border-blue-200', icon: 'text-blue-600', dot: 'bg-blue-500' },
};

// Vị trí sự cố - ghim xanh lá
const locationIcon = L.divIcon({
  html: `<div style="position:relative;width:40px;height:40px">
    <div style="width:34px;height:34px;background:${GREEN};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);position:absolute;left:3px;top:0;box-shadow:0 3px 10px rgba(0,0,0,0.3)"></div>
    <div style="width:12px;height:12px;background:white;border-radius:50%;position:absolute;left:14px;top:9px"></div>
  </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

// Vị trí trạm (điểm xuất phát là trạm) - tròn xanh dương
const stationIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#2563EB;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.28)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Điểm xuất phát tuỳ chọn (không phải trạm) - hình thoi tím
const originIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#7C3AED;border:2.5px solid white;border-radius:8px;transform:rotate(45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <div style="transform:rotate(-45deg);width:9px;height:9px;background:white;border-radius:50%"></div>
  </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Vị trí kéo xe tới - cờ cam
const towIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:#EA580C;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M4 15V4"/><path d="M4 15c3-2 6 2 9 0s5 0 6-1V4c-1 1-4 1-6 2s-6-2-9 0"/></svg>
  </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const placeIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#F59E0B;border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Trạm ứng viên (đang liệt kê) - viền xanh dương rỗng
const stationOptionIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:white;border:2.5px solid #2563EB;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.22)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Điều khiển map: fit bounds theo các tuyến/điểm liên quan */
const MapEffects: React.FC<{
  location: IdentifiedLocation | null;
  route: RouteResult | null;
  towRoute: RouteResult | null;
  stations: StationDistance[];
  focusPlace: LatLngTuple | null;
  mapResetToken: number;
}> = ({ location, route, towRoute, stations, focusPlace, mapResetToken }) => {
  const map = useMap();

  useEffect(() => {
    if (mapResetToken > 0) {
      map.flyTo(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [mapResetToken, map]);

  useEffect(() => {
    const pts: LatLngTuple[] = [];
    if (route) pts.push(...route.path);
    if (towRoute) pts.push(...towRoute.path);
    if (stations.length > 0 && location) {
      pts.push(location.position, ...stations.map((s) => s.position));
    }
    if (pts.length > 0) {
      map.fitBounds(L.latLngBounds(pts.map((p) => L.latLng(p[0], p[1]))), { padding: [70, 70] });
    } else if (location) {
      map.flyTo(location.position, 16, { duration: 0.8 });
    }
  }, [location, route, towRoute, stations, map]);

  useEffect(() => {
    if (focusPlace) map.flyTo(focusPlace, 17, { duration: 0.7 });
  }, [focusPlace, map]);

  return null;
};

/** Ép Leaflet tính lại kích thước để tránh tile bị trắng khi container thay đổi kích thước */
const MapResizeFix: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t1 = setTimeout(fix, 100);
    const t2 = setTimeout(fix, 450);
    window.addEventListener('resize', fix);
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', fix);
      ro.disconnect();
    };
  }, [map]);
  return null;
};

/** Nút zoom tùy biến (đã tắt zoomControl mặc định) */
const ZoomButtons: React.FC = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-[4.5rem] z-[500] flex flex-col rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-b border-gray-200"
        title="Phóng to"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100"
        title="Thu nhỏ"
      >
        <Minus size={16} />
      </button>
    </div>
  );
};

const PlaceCard: React.FC<{ place: NearbyPlace; onFocus: (p: NearbyPlace) => void }> = ({
  place,
  onFocus,
}) => (
  <button
    type="button"
    onClick={() => onFocus(place)}
    className="w-full flex gap-3 p-2 rounded-lg border border-gray-200 bg-white hover:border-[#00A859] hover:shadow-sm transition-all text-left"
  >
    <img
      src={place.image}
      alt={place.name}
      className="w-16 h-16 rounded-md object-cover shrink-0 border border-gray-100"
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          {place.category}
        </span>
        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
          {place.distanceKm} km
        </span>
      </div>
      <p className="text-xs font-bold text-gray-800 truncate mt-1">{place.name}</p>
      <p className="text-[10px] text-gray-500 truncate">{place.address}</p>
    </div>
  </button>
);

const LocationBubble: React.FC<{ location: IdentifiedLocation }> = ({ location }) => (
  <div className="mt-2 rounded-lg border border-[#00A859] bg-green-50 p-2.5">
    <div className="flex items-center gap-1.5 text-[#00A859]">
      <MapPin size={13} />
      <span className="text-[10px] font-black uppercase tracking-wide">Vị trí sự cố</span>
      <span className="ml-auto text-[10px] font-bold bg-[#00A859] text-white px-1.5 py-0.5 rounded-full">
        {Math.round(location.confidence * 100)}%
      </span>
    </div>
    <p className="text-xs font-semibold text-gray-700 mt-1.5">{location.address}</p>
    <p className="text-[10px] text-gray-400 mt-0.5">
      {location.position[0].toFixed(5)}, {location.position[1].toFixed(5)}
    </p>
  </div>
);

/** Thẻ danh sách trạm trong chat: chọn 1 trạm làm vị trí trạm xuất phát */
const StationPickList: React.FC<{
  stations: StationDistance[];
  activeName?: string;
  onPick: (s: StationDistance) => void;
}> = ({ stations, activeName, onPick }) => (
  <div className="mt-2 space-y-1.5">
    {stations.map((s, idx) => (
      <button
        key={s.id}
        type="button"
        onClick={() => onPick(s)}
        className={`w-full flex items-center gap-2 p-2 rounded-lg border bg-white text-left transition-all ${
          activeName === s.name
            ? 'border-blue-500 ring-1 ring-blue-200'
            : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Building2 size={13} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-gray-800 truncate">{s.name}</p>
          <p className="text-[10px] text-gray-500 truncate">{s.address}</p>
        </div>
        <div className="shrink-0 text-right">
          {idx === 0 && (
            <span className="block text-[8px] font-black text-[#00A859] uppercase leading-none mb-0.5">
              Gần nhất
            </span>
          )}
          <span className="text-[11px] font-black text-blue-700 whitespace-nowrap">{s.distanceKm} km</span>
        </div>
      </button>
    ))}
  </div>
);

/** Thẻ kết quả 1 chặng hành trình trong chat */
const RouteResultCard: React.FC<{
  route: RouteResult;
  fromLabel: string;
  toLabel: string;
  fromColor: string;
}> = ({ route, fromLabel, toLabel, fromColor }) => (
  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
    <div className="relative pl-5">
      <span className="absolute left-[5px] top-3 bottom-3 w-0 border-l-2 border-dashed border-gray-300" />
      <div className="relative">
        <span
          className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-white shadow"
          style={{ background: fromColor }}
        />
        <p className="text-[9px] font-black text-gray-400 uppercase leading-none">{fromLabel}</p>
        <p className="text-[11px] font-semibold text-gray-700 mt-0.5 leading-snug break-words">
          {route.fromName}
        </p>
      </div>
      <div className="relative mt-2">
        <span className="absolute -left-[22px] top-0">
          <MapPin size={15} className="text-[#00A859]" fill="#00A859" fillOpacity={0.15} />
        </span>
        <p className="text-[9px] font-black text-[#00A859] uppercase leading-none">{toLabel}</p>
        <p className="text-[11px] font-semibold text-gray-700 mt-0.5 leading-snug break-words">
          {route.toName}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-blue-100">
      <span className="flex items-center gap-1 text-sm font-black text-blue-700">
        <Navigation size={13} /> {route.distanceKm} km
      </span>
      <span className="flex items-center gap-1 text-sm font-black text-blue-700">
        <Clock size={13} /> {route.durationMin} phút
      </span>
    </div>
  </div>
);

// Các action gợi ý sau khi đã có tuyến xuất phát → sự cố
const NEXT_STEP_REPLIES = ['Chọn vị trí kéo xe tới', 'Tạo đơn cứu hộ', 'Đổi trạm xuất phát'];

type JourneyStepId = 'incident' | 'station' | 'tow';

const DEFAULT_STEP_ORDER: JourneyStepId[] = ['incident', 'station', 'tow'];

const JOURNEY_STEP_META: Record<
  JourneyStepId,
  {
    title: string;
    shortTitle: string;
    optional?: boolean;
    dotClass: string;
    labelClass: string;
    placeholder: string;
  }
> = {
  incident: {
    title: 'Vị trí sự cố',
    shortTitle: 'Sự cố',
    dotClass: 'bg-[#00A859] ring-2 ring-green-100',
    labelClass: 'text-[#00A859]',
    placeholder: 'Mô tả / tìm vị trí sự cố...',
  },
  station: {
    title: 'Trạm / điểm xuất phát',
    shortTitle: 'Trạm',
    dotClass: 'bg-blue-600 ring-2 ring-blue-100',
    labelClass: 'text-blue-600',
    placeholder: 'Tên trạm, địa chỉ trạm...',
  },
  tow: {
    title: 'Điểm kéo xe về',
    shortTitle: 'Kéo xe',
    optional: true,
    dotClass: 'border-2 border-orange-500 bg-white',
    labelClass: 'text-orange-600',
    placeholder: 'Garage, xưởng, điểm tập kết...',
  },
};

/** Dữ liệu prefill đẩy sang màn "Tạo đơn cứu hộ" */
export interface LocationSearchPrefill {
  incidentAddress: string;
  lat: number;
  lng: number;
  originName?: string;
  originAddress?: string;
  originIsStation?: boolean;
  towDestinationName?: string;
  distanceKm?: number;
}

interface LocationSearchProps {
  onCreateOrder?: (prefill: LocationSearchPrefill) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onCreateOrder }) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [pointInput, setPointInput] = useState('');
  const [stationInput, setStationInput] = useState('');
  const [towInput, setTowInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [stepOrder, setStepOrder] = useState<JourneyStepId[]>(DEFAULT_STEP_ORDER);
  const [draggedStep, setDraggedStep] = useState<JourneyStepId | null>(null);
  const [showTowStep, setShowTowStep] = useState(false);
  const [stationSearchMode, setStationSearchMode] = useState<'nearby' | 'address'>('nearby');
  const [primaryPointRole, setPrimaryPointRole] = useState<JourneyStepId>('incident');
  const [incidentStepInput, setIncidentStepInput] = useState('');

  const [location, setLocation] = useState<IdentifiedLocation | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [warnings, setWarnings] = useState<AreaWarning[]>([]);
  const [focusPlace, setFocusPlace] = useState<LatLngTuple | null>(null);
  const [warningsOpen, setWarningsOpen] = useState(true);
  const [placesExpanded, setPlacesExpanded] = useState(false);

  // Hành trình: trạm/xuất phát → vị trí sự cố → kéo xe tới (tuỳ chọn)
  const [routeOrigin, setRouteOrigin] = useState<RouteOrigin | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [towDestination, setTowDestination] = useState<RouteOrigin | null>(null);
  const [towRoute, setTowRoute] = useState<RouteResult | null>(null);
  const [stationList, setStationList] = useState<StationDistance[]>([]);

  // Trạng thái chờ khách nhập trong chat
  const [pending, setPending] = useState<'origin' | 'tow' | null>(null);
  const [mapResetToken, setMapResetToken] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  const resetJourney = () => {
    setRouteOrigin(null);
    setRoute(null);
    setTowDestination(null);
    setTowRoute(null);
    setStationList([]);
    setStationInput('');
    setTowInput('');
    setPending(null);
    setShowTowStep(false);
    setStationSearchMode('nearby');
    setPrimaryPointRole('incident');
    setIncidentStepInput('');
  };

  const resetMapToDefault = () => {
    resetJourney();
    setPointInput('');
    setLocation(null);
    setPlaces([]);
    setWarnings([]);
    setSearchError(null);
    setPlacesExpanded(false);
    setWarningsOpen(true);
    setStepOrder(DEFAULT_STEP_ORDER);
    setFocusPlace(null);
    setIsSearching(false);
    setMapResetToken((t) => t + 1);
  };

  const switchToPanelSearch = () => {
    if (!chatOpen) return;
    resetMapToDefault();
    setChatOpen(false);
  };

  const switchToChatSearch = () => {
    if (chatOpen) return;
    resetMapToDefault();
    setChatOpen(true);
  };

  const hideChatForPanelSearch = () => switchToPanelSearch();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, chatOpen]);

  const bot = (
    text: string,
    quickReplies?: string[],
    extra?: Partial<ChatMessageData>
  ): ChatMessageData => ({ id: uid(), role: 'bot', text, quickReplies, ...extra });

  const botSay = (msgs: ChatMessageData[], delay = 650) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, ...msgs]);
      setIsTyping(false);
    }, delay);
  };

  const pushUser = (text: string) =>
    setMessages((prev) => [...prev, { id: `${uid()}-u`, role: 'osa', text }]);

  const hasJourneyPoint = Boolean(location || routeOrigin || towDestination);

  const getReferencePosition = (): LatLngTuple => {
    if (location) return location.position;
    if (routeOrigin) return routeOrigin.position;
    if (towDestination) return towDestination.position;
    return MAP_DEFAULT_CENTER;
  };

  const rebuildAllRoutes = () => {
    if (location && routeOrigin) {
      setRoute(buildRouteFrom(routeOrigin, location));
    } else {
      setRoute(null);
    }
    if (location && towDestination) {
      rebuildTowRoute(location, towDestination);
    } else {
      setTowRoute(null);
    }
  };

  const getPrimaryDisplayAddress = (): string => {
    if (primaryPointRole === 'incident') return location?.address ?? pointInput;
    if (primaryPointRole === 'station') return routeOrigin?.name ?? pointInput;
    if (primaryPointRole === 'tow') return towDestination?.name ?? pointInput;
    return pointInput;
  };

  const changePrimaryRole = (newRole: JourneyStepId) => {
    if (newRole === primaryPointRole) return;

    let data: IdentifiedLocation | null = null;
    if (primaryPointRole === 'incident' && location) {
      data = location;
    } else if (primaryPointRole === 'station' && routeOrigin) {
      data = {
        address: routeOrigin.address ?? routeOrigin.name,
        position: routeOrigin.position,
        confidence: 1,
      };
    } else if (primaryPointRole === 'tow' && towDestination) {
      data = {
        address: towDestination.address ?? towDestination.name,
        position: towDestination.position,
        confidence: 1,
      };
    }
    if (!data) return;

    if (primaryPointRole === 'incident') setLocation(null);
    else if (primaryPointRole === 'station') clearStation();
    else if (primaryPointRole === 'tow') clearTow();

    setPrimaryPointRole(newRole);
    setPointInput(data.address);

    if (newRole === 'incident') {
      setLocation(data);
      setIncidentStepInput(data.address);
    } else if (newRole === 'station') {
      applyStation({
        name: data.address,
        address: data.address,
        position: data.position,
        kind: 'custom',
      });
    } else {
      setShowTowStep(true);
      applyTow({
        name: data.address,
        address: data.address,
        position: data.position,
        kind: 'custom',
      });
    }

    rebuildAllRoutes();
  };

  const rebuildTowRoute = (loc: IdentifiedLocation, dest: RouteOrigin | null) => {
    if (!dest) {
      setTowRoute(null);
      return;
    }
    setTowRoute(
      buildRouteFrom(
        { name: loc.address, position: loc.position },
        { address: dest.name, position: dest.position, confidence: 1 }
      )
    );
  };

  const applyStation = (origin: RouteOrigin) => {
    setRouteOrigin(origin);
    setStationInput(origin.name);
    setStationList([]);
    if (location) {
      setRoute(buildRouteFrom(origin, location));
    } else {
      setRoute(null);
    }
  };

  const applyTow = (dest: RouteOrigin) => {
    setTowDestination(dest);
    setTowInput(dest.name);
    if (location) {
      rebuildTowRoute(location, dest);
    } else {
      setTowRoute(null);
    }
  };

  const handleApplyJourney = () => {
    if (!location) {
      setSearchError('Cần xác định vị trí sự cố trước khi áp dụng hành trình.');
      return;
    }
    if (!stationInput.trim() && primaryPointRole !== 'station') {
      setSearchError('Bước trạm: cần chọn trạm hoặc nhập điểm xuất phát.');
      return;
    }

    if (chatOpen) setChatOpen(false);
    setSearchError(null);
    setIsSearching(true);

    setTimeout(() => {
      if (primaryPointRole !== 'station' && stationInput.trim()) {
        const origin = geocodeOrigin(stationInput, getReferencePosition());
        const matchedStation = stationList.find(
          (s) => s.name.toLowerCase() === stationInput.trim().toLowerCase()
        );
        applyStation(
          matchedStation
            ? {
                name: matchedStation.name,
                address: matchedStation.address,
                position: matchedStation.position,
                kind: 'station',
              }
            : { ...origin, kind: 'custom' }
        );
      }

      if (towInput.trim() && showTowStep) {
        applyTow(geocodeOrigin(towInput, getReferencePosition()));
      } else if (!showTowStep && primaryPointRole !== 'tow') {
        setTowDestination(null);
        setTowRoute(null);
      }

      rebuildAllRoutes();
      setIsSearching(false);
    }, 350);
  };

  const reorderSteps = (fromId: JourneyStepId, toId: JourneyStepId) => {
    if (fromId === toId || fromId === 'incident' || toId === 'incident') return;
    setStepOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(fromId);
      const toIdx = next.indexOf(toId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, fromId);
      return next;
    });
  };

  const visibleJourneySteps = stepOrder.filter((id) => {
    if (id === primaryPointRole) return false;
    if (id === 'tow' && !showTowStep) return false;
    return true;
  });

  // ----- Các action điều hướng hội thoại -----
  const showStationList = () => {
    if (!location) {
      botSay([bot('Mình chưa có vị trí sự cố để tìm trạm gần. Anh/chị mô tả vị trí khách hàng trước nhé.')]);
      return;
    }
    setPending(null);
    const list = nearestStations(location.position, 5);
    setStationList(list);
    botSay([
      bot('Các trạm gần vị trí sự cố (chọn 1 trạm làm điểm xuất phát để vẽ đường đi):', undefined, {
        stations: list,
      }),
    ]);
  };

  const askForOrigin = () => {
    if (!location) {
      botSay([bot('Mình chưa có vị trí sự cố. Anh/chị mô tả vị trí khách hàng trước để mình tính đường đi nhé.')]);
      return;
    }
    setPending('origin');
    botSay([
      bot(
        'Anh/chị cho mình xin vị trí xuất phát (vị trí trạm cứu hộ hoặc một điểm bất kỳ) để nối tới vị trí sự cố. Gõ tên trạm, mốc quen thuộc hoặc địa chỉ vào ô chat bên dưới.',
        ['Xem danh sách trạm']
      ),
    ]);
  };

  const resolveOrigin = (text: string) => {
    if (!location) return;
    const origin = geocodeOrigin(text, location.position);
    applyStation(origin);
    setPending(null);
    const r = buildRouteFrom(origin, location);
    botSay([
      bot(`Đã nối vị trí xuất phát "${origin.name}" tới vị trí sự cố.`, undefined, { route: r }),
      bot('Bước tiếp theo anh/chị muốn làm gì?', NEXT_STEP_REPLIES),
    ]);
  };

  const handlePickStation = (s: StationDistance) => {
    const origin: RouteOrigin = {
      name: s.name,
      address: s.address,
      position: s.position,
      kind: 'station',
    };
    applyStation(origin);
    setPending(null);
    const r = location ? buildRouteFrom(origin, location) : null;
    pushUser(`Chọn trạm: ${s.name}`);
    botSay([
      bot(
        location
          ? `Đã chọn ${s.name} làm vị trí trạm xuất phát và vẽ đường đi tới vị trí sự cố.`
          : `Đã chọn ${s.name} làm vị trí trạm. Anh/chị bổ sung vị trí sự cố để vẽ tuyến.`,
        undefined,
        r ? { route: r } : undefined
      ),
      ...(location ? [bot('Bước tiếp theo anh/chị muốn làm gì?', NEXT_STEP_REPLIES)] : []),
    ]);
  };

  const askForTow = () => {
    if (!route) {
      botSay([bot('Anh/chị cần có tuyến xuất phát → sự cố trước. Chọn "Xem đường đi" hoặc "Xem danh sách trạm" nhé.')]);
      return;
    }
    setPending('tow');
    botSay([
      bot(
        'Anh/chị cho mình xin vị trí kéo xe tới (garage/xưởng/điểm tập kết) để mình vẽ chặng kéo xe từ vị trí sự cố. Gõ tên hoặc địa chỉ vào ô chat.'
      ),
    ]);
  };

  const resolveTow = (text: string) => {
    if (!location) return;
    const dest = geocodeOrigin(text, location.position);
    applyTow(dest);
    setPending(null);
    const r2 = buildRouteFrom({ name: location.address, position: location.position }, {
      address: dest.name,
      position: dest.position,
      confidence: 1,
    });
    botSay([
      bot(`Đã thêm vị trí kéo xe tới: ${dest.name}.`, undefined, { route: r2 }),
      bot('Đã đủ thông tin hành trình. Anh/chị có thể tạo đơn cứu hộ.', ['Tạo đơn cứu hộ']),
    ]);
  };

  const createOrder = () => {
    if (!location || !routeOrigin) {
      botSay([bot('Cần có vị trí sự cố và điểm xuất phát trước khi tạo đơn.')]);
      return;
    }
    const lines = [
      `• Vị trí sự cố: ${location.address}`,
      `• ${routeOrigin.kind === 'station' ? 'Vị trí trạm' : 'Điểm xuất phát'}: ${routeOrigin.name}`,
      route ? `• Quãng đường tới sự cố: ${route.distanceKm} km (~${route.durationMin} phút)` : '',
      towDestination ? `• Vị trí kéo xe tới: ${towDestination.name}` : '',
      towRoute ? `• Quãng đường kéo xe: ${towRoute.distanceKm} km (~${towRoute.durationMin} phút)` : '',
    ].filter(Boolean);
    botSay([
      bot(
        `Đã tổng hợp thông tin để tạo đơn cứu hộ:\n${lines.join('\n')}\n\nĐang chuyển sang màn "Tạo đơn cứu hộ" để anh/chị hoàn tất (dịch vụ, khách hàng, giá).`
      ),
    ]);

    const prefill: LocationSearchPrefill = {
      incidentAddress: location.address,
      lat: location.position[0],
      lng: location.position[1],
      originName: routeOrigin.name,
      originAddress: routeOrigin.address,
      originIsStation: routeOrigin.kind === 'station',
      towDestinationName: towDestination?.name,
      distanceKm: route?.distanceKm,
    };
    // Chờ bot hiển thị xác nhận rồi mới điều hướng
    setTimeout(() => onCreateOrder?.(prefill), 750);
  };

  // ----- Xử lý tin nhắn người dùng -----
  const handleUserSend = (raw: string) => {
    const text = raw.trim();
    if (!text || isTyping) return;
    if (!chatOpen) switchToChatSearch();
    pushUser(text);
    setInput('');

    const low = text.toLowerCase();

    // Đang chờ khách nhập điểm xuất phát / điểm kéo xe
    if (pending === 'origin') {
      resolveOrigin(text);
      return;
    }
    if (pending === 'tow') {
      resolveTow(text);
      return;
    }

    // Chặn các lệnh gõ tay khớp action
    if (hasKeyword(low, KW_STATION_LIST)) {
      showStationList();
      return;
    }
    if (hasKeyword(low, KW_TOW)) {
      askForTow();
      return;
    }
    if (hasKeyword(low, KW_ROUTE)) {
      askForOrigin();
      return;
    }

    // Còn lại: đưa vào engine để xác định vị trí sự cố
    setIsTyping(true);
    setTimeout(() => {
      const res = respondToMessage(text, { location, places });
      if (res.location) {
        setLocation(res.location);
        resetJourney();
      }
      if (res.places) setPlaces(res.places);
      if (res.warnings) setWarnings(res.warnings);
      setMessages((prev) => [...prev, ...res.messages]);
      setIsTyping(false);
    }, 750);
  };

  const handleQuickReply = (qr: string) => {
    if (isTyping) return;
    const low = qr.toLowerCase();
    // Mỗi action đã bấm đều hiển thị như một tin nhắn của người dùng
    if (hasKeyword(low, KW_STATION_LIST)) {
      pushUser(qr);
      return showStationList();
    }
    if (low.includes('đổi trạm') || low.includes('đổi điểm xuất phát')) {
      pushUser(qr);
      return askForOrigin();
    }
    if (hasKeyword(low, KW_TOW)) {
      pushUser(qr);
      return askForTow();
    }
    if (low.includes('tạo đơn')) {
      pushUser(qr);
      return createOrder();
    }
    if (hasKeyword(low, KW_ROUTE)) {
      pushUser(qr);
      return askForOrigin();
    }
    handleUserSend(qr);
  };

  /** Bước 1: Tìm điểm (vị trí sự cố) trực tiếp trên bản đồ */
  const handlePointSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = pointInput.trim();
    if (!q) return;

    hideChatForPanelSearch();
    setSearchError(null);
    setIsSearching(true);

    setTimeout(() => {
      const result = identifyLocationFromQuery(q, { location, places });
      if (!result) {
        setSearchError('Không xác định được vị trí. Thử thêm mốc, tên đường hoặc địa chỉ cụ thể hơn.');
        setIsSearching(false);
        return;
      }
      resetJourney();
      setLocation(result.location);
      setPlaces(result.places);
      setWarnings(result.warnings);
      setPointInput(result.location.address);
      setIncidentStepInput(result.location.address);
      setPrimaryPointRole('incident');
      setPlacesExpanded(false);
      setWarningsOpen(true);
      setIsSearching(false);
    }, 400);
  };

  const handleSecondaryIncidentSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = incidentStepInput.trim();
    if (!q) return;
    hideChatForPanelSearch();
    setSearchError(null);
    setIsSearching(true);
    setTimeout(() => {
      const result = identifyLocationFromQuery(q, { location, places });
      if (!result) {
        setSearchError('Không xác định được vị trí sự cố. Thử mô tả cụ thể hơn.');
        setIsSearching(false);
        return;
      }
      setLocation(result.location);
      setIncidentStepInput(result.location.address);
      rebuildAllRoutes();
      setIsSearching(false);
    }, 400);
  };

  const clearPoint = () => resetMapToDefault();

  const visiblePlaces = placesExpanded ? places : places.slice(0, 2);

  const clearTow = () => {
    setTowInput('');
    setTowDestination(null);
    setTowRoute(null);
    setShowTowStep(false);
  };

  const clearStation = () => {
    setStationInput('');
    setRouteOrigin(null);
    setRoute(null);
    setStationList([]);
  };

  const handleSearchStationByAddress = () => {
    if (!stationInput.trim()) return;
    hideChatForPanelSearch();
    setSearchError(null);
    setIsSearching(true);
    setTimeout(() => {
      const origin = geocodeOrigin(stationInput.trim(), getReferencePosition());
      applyStation({ ...origin, kind: 'custom' });
      setStationList([]);
      rebuildAllRoutes();
      setIsSearching(false);
    }, 300);
  };

  const handleLoadNearbyStations = () => {
    setStationSearchMode('nearby');
    setStationList(nearestStations(getReferencePosition(), 5));
    setSearchError(null);
  };

  const handleFocusPlace = (place: NearbyPlace) => {
    setFocusPlace([...place.position] as LatLngTuple);
  };

  const renderStepBody = (stepId: JourneyStepId) => {
    const meta = JOURNEY_STEP_META[stepId];
    const refPos = getReferencePosition();

    if (stepId === 'incident') {
      return (
        <form onSubmit={handleSecondaryIncidentSearch} className="flex items-center gap-1.5">
          <input
            type="text"
            value={incidentStepInput}
            onChange={(e) => {
              setIncidentStepInput(e.target.value);
              setSearchError(null);
            }}
            onFocus={hideChatForPanelSearch}
            placeholder={meta.placeholder}
            className="flex-1 min-w-0 py-1.5 px-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#00A859]"
          />
          <button
            type="submit"
            disabled={isSearching || !incidentStepInput.trim()}
            className="shrink-0 h-8 px-2.5 rounded-lg bg-[#00A859] text-white text-[10px] font-bold disabled:opacity-40"
          >
            Tìm
          </button>
        </form>
      );
    }

    if (stepId === 'station') {
      return (
        <div className="space-y-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                setStationSearchMode('nearby');
                setSearchError(null);
              }}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                stationSearchMode === 'nearby'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trạm gần
            </button>
            <button
              type="button"
              onClick={() => {
                setStationSearchMode('address');
                setStationList([]);
                setSearchError(null);
              }}
              className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                stationSearchMode === 'address'
                  ? 'bg-white text-blue-700 shadow-sm border border-blue-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Theo địa chỉ
            </button>
          </div>

          {stationSearchMode === 'nearby' ? (
            <>
              <button
                type="button"
                disabled={isSearching}
                onClick={handleLoadNearbyStations}
                className="w-full h-8 rounded-lg border border-blue-200 text-blue-700 text-[10px] font-bold hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Building2 size={13} />
                {location ? 'Tìm trạm gần vị trí sự cố' : 'Tìm trạm gần điểm đã chọn'}
              </button>
              {stationList.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                  {stationList.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePickStation(s)}
                      className={`w-full text-left px-2 py-1.5 rounded border transition-colors text-[10px] ${
                        routeOrigin?.name === s.name
                          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-800 truncate">{s.name}</span>
                        <span className="text-blue-700 font-bold whitespace-nowrap shrink-0">
                          {s.distanceKm} km
                        </span>
                      </div>
                      {idx === 0 && (
                        <span className="text-[8px] font-black text-[#00A859] uppercase">Gần nhất</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="relative flex gap-1.5">
                <input
                  type="text"
                  value={stationInput}
                  onChange={(e) => {
                    setStationInput(e.target.value);
                    setSearchError(null);
                  }}
                  onFocus={hideChatForPanelSearch}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchStationByAddress();
                    }
                  }}
                  placeholder="Nhập địa chỉ hoặc tên trạm..."
                  className="flex-1 min-w-0 py-1.5 px-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSearchStationByAddress}
                  disabled={isSearching || !stationInput.trim()}
                  className="shrink-0 h-8 px-2.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tìm
                </button>
              </div>
              {routeOrigin && stationSearchMode === 'address' && (
                <p className="text-[10px] text-gray-600 bg-blue-50 border border-blue-100 rounded px-2 py-1.5">
                  Đã chọn: <strong>{routeOrigin.name}</strong>
                </p>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <input
          type="text"
          value={towInput}
          onChange={(e) => {
            setTowInput(e.target.value);
            setSearchError(null);
          }}
          onFocus={hideChatForPanelSearch}
          placeholder={meta.placeholder}
          disabled={!location && primaryPointRole !== 'station'}
          className="w-full py-1.5 px-2 pr-7 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400"
        />
        {towInput && (
          <button
            type="button"
            onClick={clearTow}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-w-0 h-[calc(100vh-180px)] relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      {/* MAP */}
      <MapContainer
        center={MAP_DEFAULT_CENTER}
        zoom={MAP_DEFAULT_ZOOM}
        className="h-full w-full absolute inset-0 z-0"
        scrollWheelZoom
        zoomControl={false}
        maxBounds={VIETNAM_BOUNDS}
        maxBoundsViscosity={0.8}
        minZoom={5}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeFix />
        <MapEffects
          location={location}
          route={route}
          towRoute={towRoute}
          stations={stationList}
          focusPlace={focusPlace}
          mapResetToken={mapResetToken}
        />
        <ZoomButtons />

        {/* Marker các trạm đang liệt kê */}
        {stationList.map((s) => (
          <Marker
            key={`opt-${s.id}`}
            position={s.position}
            icon={stationOptionIcon}
            eventHandlers={{ click: () => handlePickStation(s) }}
          >
            <Tooltip direction="top" offset={[0, -14]}>
              <div className="text-[11px]">
                <span className="font-bold text-gray-800">{s.name}</span>
                <span className="text-blue-700 font-bold"> · {s.distanceKm} km</span>
              </div>
            </Tooltip>
            <Popup>
              <div className="text-xs max-w-[200px]">
                <p className="font-bold text-gray-800">{s.name}</p>
                <p className="text-gray-500">{s.address}</p>
                <p className="text-blue-700 font-bold mt-0.5">{s.distanceKm} km</p>
                <button
                  type="button"
                  onClick={() => handlePickStation(s)}
                  className="mt-1.5 w-full bg-[#00A859] text-white rounded px-2 py-1 text-[11px] font-bold hover:bg-green-700 transition-colors"
                >
                  Chọn trạm này
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Vị trí trạm / điểm xuất phát */}
        {routeOrigin && (
          <Marker
            position={routeOrigin.position}
            icon={routeOrigin.kind === 'station' ? stationIcon : originIcon}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-gray-800">{routeOrigin.name}</p>
                {routeOrigin.address && <p className="text-gray-500">{routeOrigin.address}</p>}
                <p className="text-[10px] font-bold text-purple-600 uppercase mt-0.5">
                  {routeOrigin.kind === 'station' ? 'Vị trí trạm' : 'Điểm xuất phát'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vị trí sự cố */}
        {location && (
          <Marker position={location.position} icon={locationIcon}>
            <Popup>
              <div className="text-xs max-w-[220px]">
                <p className="font-bold text-[#00A859] uppercase text-[10px]">Vị trí sự cố</p>
                <p className="text-gray-700 mt-1">{location.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Điểm dừng / thêm — đã gộp vào bước trạm */}

        {/* Vị trí kéo xe tới */}
        {towDestination && (
          <Marker position={towDestination.position} icon={towIcon}>
            <Popup>
              <div className="text-xs max-w-[220px]">
                <p className="font-bold text-orange-600 uppercase text-[10px]">Vị trí kéo xe tới</p>
                <p className="text-gray-700 mt-1">{towDestination.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {places.map((p) => (
          <Marker key={p.id} position={p.position} icon={placeIcon}>
            <Popup>
              <div className="text-xs max-w-[200px]">
                <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded mb-1" />
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-gray-500">{p.address}</p>
                <p className="text-amber-600 font-bold mt-0.5">{p.distanceKm} km</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Chặng 1: xuất phát → sự cố */}
        {route && (
          <Polyline positions={route.path} pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.8 }} />
        )}
        {towRoute && (
          <Polyline
            positions={towRoute.path}
            pathOptions={{ color: '#EA580C', weight: 5, opacity: 0.85, dashArray: '8 8' }}
          />
        )}
      </MapContainer>

      {/* Cột trái: tìm kiếm + cảnh báo + địa điểm gần (xếp dọc, không scroll) */}
      <div className="absolute top-3 left-3 z-[500] w-[min(380px,calc(100%-24px))] flex flex-col gap-2 pointer-events-none">
        {!hasJourneyPoint ? (
          <form
            onSubmit={handlePointSearch}
            className="pointer-events-auto flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1 min-w-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={pointInput}
                onChange={(e) => {
                  setPointInput(e.target.value);
                  setSearchError(null);
                }}
                onFocus={hideChatForPanelSearch}
                placeholder="Mô tả / tìm địa chỉ..."
                className="w-full bg-white shadow-md border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00A859] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !pointInput.trim()}
              className="shrink-0 h-10 px-4 rounded-full bg-[#00A859] text-white text-sm font-bold shadow-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Tìm
            </button>
          </form>
        ) : (
          <div className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden shrink-0">
            {(() => {
              const primaryMeta = JOURNEY_STEP_META[primaryPointRole];
              const headerBg =
                primaryPointRole === 'incident'
                  ? 'border-green-100 bg-green-50/80'
                  : primaryPointRole === 'station'
                    ? 'border-blue-100 bg-blue-50/80'
                    : 'border-orange-100 bg-orange-50/80';
              return (
            <div className={`px-3 py-2.5 border-b ${headerBg}`}>
              <div className="flex items-start gap-2">
                <MapPin size={14} className={`${primaryMeta.labelClass} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[9px] font-black uppercase tracking-wide ${primaryMeta.labelClass}`}>
                    {primaryMeta.title}
                  </p>
                  <p
                    className="text-xs font-medium text-gray-700 leading-snug line-clamp-2 mt-0.5"
                    title={getPrimaryDisplayAddress()}
                  >
                    {getPrimaryDisplayAddress()}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(['incident', 'station', 'tow'] as JourneyStepId[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => changePrimaryRole(role)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                          primaryPointRole === role
                            ? role === 'incident'
                              ? 'bg-[#00A859] text-white border-[#00A859]'
                              : role === 'station'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-orange-600 text-white border-orange-600'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {JOURNEY_STEP_META[role].shortTitle}
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] text-gray-400 mt-1">Đổi loại điểm nếu tìm nhầm (sự cố / trạm / kéo xe)</p>
                </div>
                <button
                  type="button"
                  onClick={clearPoint}
                  className="shrink-0 text-[10px] font-bold text-gray-400 hover:text-red-500"
                >
                  Đổi
                </button>
              </div>
            </div>
              );
            })()}

            <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-500 uppercase">Tiếp theo</span>
              {visibleJourneySteps.length > 1 && (
                <span className="text-[9px] text-gray-400 flex items-center gap-1">
                  <GripVertical size={11} /> Kéo để đổi loại điểm
                </span>
              )}
            </div>

            <div className="p-2 space-y-1.5">
              {visibleJourneySteps.map((stepId, idx) => {
                const meta = JOURNEY_STEP_META[stepId];
                const isDone =
                  stepId === 'incident'
                    ? Boolean(location)
                    : stepId === 'station'
                      ? Boolean(routeOrigin)
                      : Boolean(towDestination);
                const isDragging = draggedStep === stepId;

                return (
                  <div
                    key={stepId}
                    draggable
                    onDragStart={() => setDraggedStep(stepId)}
                    onDragEnd={() => setDraggedStep(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedStep) reorderSteps(draggedStep, stepId);
                      setDraggedStep(null);
                    }}
                    className={`rounded-lg border p-2 transition-all ${
                      isDragging
                        ? 'border-[#00A859] bg-green-50/50 opacity-70'
                        : isDone
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-100 bg-gray-50/40'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        className="shrink-0 mt-0.5 p-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                        title="Kéo để đổi loại điểm"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={14} />
                      </button>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${meta.dotClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-black text-gray-400">Bước {idx + 2}</span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wide ${meta.labelClass}`}
                          >
                            {meta.title}
                          </span>
                          <div className="ml-auto flex items-center gap-1 shrink-0">
                            {isDone && <CheckCircle2 size={12} className="text-[#00A859]" />}
                            {stepId === 'tow' && (
                              <button
                                type="button"
                                onClick={clearTow}
                                className="p-0.5 text-gray-400 hover:text-red-500"
                                title="Bỏ điểm kéo xe"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        {renderStepBody(stepId)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {!showTowStep && (
                <button
                  type="button"
                  onClick={() => setShowTowStep(true)}
                  disabled={!routeOrigin && !stationInput.trim() && primaryPointRole !== 'station'}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-orange-300 text-orange-700 text-[11px] font-bold hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={14} />
                  Thêm điểm kéo xe về
                </button>
              )}
            </div>

            {searchError && (
              <p className="px-3 pb-1 text-[11px] text-red-600 font-medium">{searchError}</p>
            )}

            <div className="px-2.5 pb-2.5">
              <button
                type="button"
                onClick={handleApplyJourney}
                disabled={
                  isSearching ||
                  !location ||
                  (!routeOrigin && !stationInput.trim() && primaryPointRole !== 'station')
                }
                className="w-full h-9 rounded-lg bg-[#00A859] text-white text-xs font-bold shadow-sm hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                {isSearching ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <RouteIcon size={14} />
                )}
                Áp dụng hành trình
              </button>
            </div>
          </div>
        )}

        {searchError && !hasJourneyPoint && (
          <p className="pointer-events-auto px-3 py-1.5 bg-white/95 rounded-lg shadow text-[11px] text-red-600 font-medium border border-red-100 shrink-0">
            {searchError}
          </p>
        )}

        {warnings.length > 0 && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-xl shadow-md border border-gray-200 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setWarningsOpen((v) => !v)}
              className="w-full flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <AlertTriangle size={14} />
              <span className="text-[11px] font-black uppercase tracking-wide flex-1 text-left">
                Cảnh báo khu vực ({warnings.length})
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 transition-transform duration-200 ${warningsOpen ? '' : '-rotate-90'}`}
              />
            </button>
            {warningsOpen && (
              <div className="p-2 space-y-1.5">
                {warnings.map((w) => {
                  const style = WARNING_STYLE[w.severity];
                  const Icon = WARNING_ICON[w.type];
                  return (
                    <div key={w.id} className={`flex items-start gap-2 rounded-lg border p-2 ${style.box}`}>
                      <Icon size={14} className={`${style.icon} shrink-0 mt-0.5`} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-800">{w.title}</p>
                        <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{w.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {places.length > 0 && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-xl shadow-md border border-gray-200 overflow-hidden shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white">
              <MapPin size={14} />
              <span className="text-[11px] font-black uppercase tracking-wide">
                Địa điểm gần đó ({places.length})
              </span>
            </div>
            <div className="p-2 space-y-2">
              {visiblePlaces.map((p) => (
                <PlaceCard key={p.id} place={p} onFocus={handleFocusPlace} />
              ))}
              {places.length > 2 && !placesExpanded && (
                <button
                  type="button"
                  onClick={() => setPlacesExpanded(true)}
                  className="w-full py-1.5 text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  Xem thêm {places.length - 2} địa điểm
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay: tóm tắt hành trình (góc dưới bên trái) */}
      {(route || location) && (
        <div className="absolute bottom-3 left-3 z-[500] w-[min(360px,calc(100%-24px))]">
          {route ? (
            <div className="bg-white/95 backdrop-blur rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#00A859] text-white">
                <RouteIcon size={14} />
                <span className="text-[11px] font-black uppercase tracking-wide flex-1">Hành trình</span>
                <button
                  type="button"
                  onClick={resetJourney}
                  className="flex items-center gap-1 text-[10px] font-bold text-white/90 hover:text-white transition-colors"
                  title="Xoá hành trình"
                >
                  <Trash2 size={12} /> Xoá
                </button>
              </div>
              <div className="p-2.5 space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: routeOrigin?.kind === 'custom' ? '#7C3AED' : '#2563EB' }} />
                  <span className="text-gray-500 font-bold uppercase text-[9px] w-20 shrink-0">
                    {routeOrigin?.kind === 'custom' ? 'Điểm xuất phát' : 'Vị trí trạm'}
                  </span>
                  <span className="text-gray-800 font-semibold truncate">{route.fromName}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <MapPin size={12} className="text-[#00A859] shrink-0" />
                  <span className="text-gray-500 font-bold uppercase text-[9px] w-20 shrink-0">Vị trí sự cố</span>
                  <span className="text-gray-800 font-semibold truncate">{location?.address}</span>
                </div>
                {towDestination && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <Flag size={12} className="text-orange-600 shrink-0" />
                    <span className="text-gray-500 font-bold uppercase text-[9px] w-20 shrink-0">Kéo xe tới</span>
                    <span className="text-gray-800 font-semibold truncate">{towDestination.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-1.5 border-t border-gray-100 text-[11px] font-black text-blue-700">
                  <span className="flex items-center gap-1">
                    <Navigation size={12} /> {route.distanceKm} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {route.durationMin} phút
                  </span>
                  {towRoute && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <Truck size={12} /> +{towRoute.distanceKm} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            location && (
              <div className="bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 px-3 py-2 flex items-center gap-2">
                <MapPin size={16} className="text-[#00A859] shrink-0" />
                <p className="text-xs font-semibold text-gray-700 truncate flex-1">{location.address}</p>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#00A859] whitespace-nowrap">
                  <CheckCircle2 size={13} /> Vị trí sự cố
                </span>
              </div>
            )
          )}
        </div>
      )}

      {/* CHATBOT nổi trên map */}
      {chatOpen && (
        <div className="absolute top-3 right-3 bottom-20 z-[600] w-[min(380px,calc(100%-24px))] flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-2xl bg-white animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-[#00A859] text-white px-4 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <BotAvatar size={30} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">Trợ lý xác định vị trí</p>
              <p className="text-[10px] text-white/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-200 inline-block" /> Đang hoạt động
              </p>
            </div>
            <button
              type="button"
              onClick={switchToPanelSearch}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              title="Thu gọn"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => {
              // Chỉ tin nhắn mới nhất mới hiện gợi ý/action; tin đã xử lý thì ẩn
              const isLast = idx === messages.length - 1;
              return (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'osa' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'osa' ? (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                    <User size={14} />
                  </div>
                ) : (
                  <BotAvatar size={28} />
                )}
                <div className={`min-w-0 max-w-[85%] ${msg.role === 'osa' ? 'items-end' : ''}`}>
                  {msg.text && (
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                        msg.role === 'osa'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {msg.location && <LocationBubble location={msg.location} />}

                  {msg.stations && msg.stations.length > 0 && isLast && (
                    <StationPickList
                      stations={msg.stations}
                      activeName={routeOrigin?.name}
                      onPick={handlePickStation}
                    />
                  )}

                  {msg.route && (
                    <RouteResultCard
                      route={msg.route}
                      fromLabel={msg.route.toName === location?.address ? 'Điểm xuất phát' : 'Vị trí sự cố'}
                      toLabel={msg.route.toName === location?.address ? 'Vị trí sự cố' : 'Vị trí kéo xe tới'}
                      fromColor={msg.route.toName === location?.address ? '#2563EB' : GREEN}
                    />
                  )}

                  {msg.quickReplies && msg.quickReplies.length > 0 && isLast && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => {
                        const low = qr.toLowerCase();
                        const Icon = hasKeyword(low, KW_STATION_LIST)
                          ? List
                          : hasKeyword(low, KW_TOW)
                          ? Truck
                          : low.includes('tạo đơn')
                          ? ClipboardList
                          : hasKeyword(low, KW_ROUTE) || low.includes('đổi điểm')
                          ? Navigation
                          : null;
                        return (
                          <button
                            key={qr}
                            type="button"
                            onClick={() => handleQuickReply(qr)}
                            className="px-2.5 py-1 rounded-full border border-[#00A859] text-[#00A859] text-[11px] font-bold hover:bg-[#00A859] hover:text-white transition-colors flex items-center gap-1"
                          >
                            {Icon && <Icon size={12} />}
                            {qr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2">
                <BotAvatar size={28} />
                <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-gray-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-white space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Sparkles size={11} /> Câu mẫu
              </p>
              {SAMPLE_PROMPTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleUserSend(s)}
                  className="w-full text-left text-[11px] text-gray-600 hover:text-[#00A859] px-2 py-1 rounded hover:bg-gray-50 transition-colors truncate"
                >
                  “{s}”
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSend(input);
            }}
            className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pending === 'origin'
                  ? 'Nhập vị trí xuất phát...'
                  : pending === 'tow'
                  ? 'Nhập vị trí kéo xe tới...'
                  : 'Nhập nội dung lời khách...'
              }
              className="flex-1 min-w-0 border border-gray-200 rounded-full px-4 py-2 text-xs outline-none focus:border-[#00A859]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-[#00A859] text-white flex items-center justify-center shrink-0 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* FAB bật/tắt chat */}
      <button
        type="button"
        onClick={() => {
          if (chatOpen) switchToPanelSearch();
          else switchToChatSearch();
        }}
        className={`absolute bottom-4 right-4 z-[600] w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 ${
          chatOpen ? 'bg-[#00A859] text-white hover:bg-green-700' : 'bg-white border border-gray-200 hover:shadow-2xl'
        }`}
        title={chatOpen ? 'Thu gọn trợ lý' : 'Mở trợ lý xác định vị trí'}
      >
        {chatOpen ? <X size={22} /> : <BotAvatar size={34} />}
      </button>
    </div>
  );
};

export default LocationSearch;
