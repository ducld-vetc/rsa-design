import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
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
  RESCUE_STATIONS,
  RescueStationPoint,
  respondToMessage,
  RouteResult,
  SAMPLE_PROMPTS,
  StationDistance,
  VIETNAM_BOUNDS,
  LatLngTuple,
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

const locationIcon = L.divIcon({
  html: `<div style="position:relative;width:40px;height:40px">
    <div style="width:34px;height:34px;background:${GREEN};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);position:absolute;left:3px;top:0;box-shadow:0 3px 10px rgba(0,0,0,0.3)"></div>
    <div style="width:12px;height:12px;background:white;border-radius:50%;position:absolute;left:14px;top:9px"></div>
  </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

const stationIcon = L.divIcon({
  html: `<div style="width:30px;height:30px;background:#2563EB;border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.28)">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const placeIcon = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#F59E0B;border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Trạm ứng viên (trong bán kính) - viền xanh dương rỗng để phân biệt với trạm đã chọn
const stationOptionIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:white;border:2.5px solid #2563EB;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.22)">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Điều khiển map: bay tới vị trí / fit bounds theo tuyến đường */
const MapEffects: React.FC<{
  location: IdentifiedLocation | null;
  route: RouteResult | null;
  stations: StationDistance[];
  focusPlace: LatLngTuple | null;
}> = ({ location, route, stations, focusPlace }) => {
  const map = useMap();

  useEffect(() => {
    if (route && route.path.length > 0) {
      map.fitBounds(L.latLngBounds(route.path.map((p) => L.latLng(p[0], p[1]))), {
        padding: [60, 60],
      });
    } else if (stations.length > 0 && location) {
      const pts = [location.position, ...stations.map((s) => s.position)];
      map.fitBounds(L.latLngBounds(pts.map((p) => L.latLng(p[0], p[1]))), {
        padding: [70, 70],
      });
    } else if (location) {
      map.flyTo(location.position, 16, { duration: 0.8 });
    }
  }, [location, route, stations, map]);

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
    <div className="absolute bottom-3 left-3 z-[500] flex flex-col rounded-lg overflow-hidden shadow-md border border-gray-200 bg-white">
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
      <span className="text-[10px] font-black uppercase tracking-wide">Vị trí xác định</span>
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

const RouteBubble: React.FC<{ route: RouteResult }> = ({ route }) => (
  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
    <div className="flex items-center gap-1.5 text-blue-600">
      <RouteIcon size={13} />
      <span className="text-[10px] font-black uppercase tracking-wide">Đường đi</span>
    </div>
    <p className="text-[11px] text-gray-600 mt-1.5">
      <span className="font-bold text-gray-800">Từ:</span> {route.fromName}
    </p>
    <p className="text-[11px] text-gray-600 truncate">
      <span className="font-bold text-gray-800">Đến:</span> {route.toName}
    </p>
    <div className="flex items-center gap-4 mt-2">
      <span className="flex items-center gap-1 text-sm font-black text-blue-700">
        <Navigation size={13} /> {route.distanceKm} km
      </span>
      <span className="flex items-center gap-1 text-sm font-black text-blue-700">
        <Clock size={13} /> {route.durationMin} phút
      </span>
    </div>
  </div>
);

const StationList: React.FC<{
  stations: StationDistance[];
  onPick: (s: StationDistance) => void;
}> = ({ stations, onPick }) => (
  <div className="mt-2 space-y-1.5">
    {stations.map((s, idx) => (
      <button
        key={s.id}
        type="button"
        onClick={() => onPick(s)}
        className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all text-left"
      >
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <RouteIcon size={14} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-800 truncate">{s.name}</p>
          <p className="text-[10px] text-gray-500 truncate">{s.address}</p>
        </div>
        <div className="shrink-0 text-right">
          {idx === 0 && (
            <span className="block text-[8px] font-black text-[#00A859] uppercase leading-none mb-0.5">
              Gần nhất
            </span>
          )}
          <span className="text-xs font-black text-blue-700 whitespace-nowrap">{s.distanceKm} km</span>
        </div>
      </button>
    ))}
  </div>
);

const WarningBubble: React.FC<{ warnings: AreaWarning[] }> = ({ warnings }) => (
  <div className="mt-2 space-y-1.5">
    {warnings.map((w) => {
      const style = WARNING_STYLE[w.severity];
      const Icon = WARNING_ICON[w.type];
      return (
        <div key={w.id} className={`rounded-lg border p-2.5 ${style.box}`}>
          <div className={`flex items-center gap-1.5 ${style.icon}`}>
            <Icon size={13} />
            <span className="text-[11px] font-black">{w.title}</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-1 leading-snug">{w.detail}</p>
        </div>
      );
    })}
  </div>
);

const LocationSearch: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageData[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [mapSearch, setMapSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  const [location, setLocation] = useState<IdentifiedLocation | null>(null);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [warnings, setWarnings] = useState<AreaWarning[]>([]);
  const [stationOptions, setStationOptions] = useState<StationDistance[]>([]);
  const [focusPlace, setFocusPlace] = useState<LatLngTuple | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>(RESCUE_STATIONS[0].id);
  const [confirmed, setConfirmed] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedStation = useMemo<RescueStationPoint>(
    () => RESCUE_STATIONS.find((s) => s.id === selectedStationId) ?? RESCUE_STATIONS[0],
    [selectedStationId]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, chatOpen]);

  const sendMessage = (raw: string) => {
    const text = raw.trim();
    if (!text || isTyping) return;
    if (!chatOpen) setChatOpen(true);

    const userMsg: ChatMessageData = { id: `${Date.now()}-u`, role: 'osa', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const res = respondToMessage(text, { location, places, selectedStation });

      if (res.selectedStationId) setSelectedStationId(res.selectedStationId);
      if (res.location) {
        setLocation(res.location);
        setRoute(null);
        setStationOptions([]);
        setConfirmed(false);
      }
      if (res.places) setPlaces(res.places);
      if (res.warnings) setWarnings(res.warnings);
      if (res.stations) setStationOptions(res.stations);
      if (res.route) {
        setRoute(res.route);
        setStationOptions([]);
      }
      if (text.toLowerCase().includes('xác nhận') || text.toLowerCase().includes('chốt')) {
        setConfirmed(true);
      }

      setMessages((prev) => [...prev, ...res.messages]);
      setIsTyping(false);
    }, 900);
  };

  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = mapSearch.trim();
    if (!q) return;
    setMapSearch('');
    sendMessage(q);
  };

  const handleFocusPlace = (place: NearbyPlace) => {
    setFocusPlace([...place.position] as LatLngTuple);
  };

  return (
    <div className="w-full min-w-0 h-[calc(100vh-180px)] relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      {/* MAP (chỉ preview) */}
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
        <MapEffects location={location} route={route} stations={stationOptions} focusPlace={focusPlace} />
        <ZoomButtons />

        {/* Vòng tròn bán kính 10km khi đang liệt kê trạm */}
        {location && stationOptions.length > 0 && (
          <Circle
            center={location.position}
            radius={10000}
            pathOptions={{ color: GREEN, weight: 1.5, fillColor: GREEN, fillOpacity: 0.06, dashArray: '6 6' }}
          />
        )}

        {/* Marker các trạm ứng viên trong bán kính */}
        {stationOptions.map((s) => (
          <Marker
            key={`opt-${s.id}`}
            position={s.position}
            icon={stationOptionIcon}
            eventHandlers={{ click: () => sendMessage(`Trạm: ${s.name}`) }}
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
                  onClick={() => sendMessage(`Trạm: ${s.name}`)}
                  className="mt-1.5 w-full bg-[#00A859] text-white rounded px-2 py-1 text-[11px] font-bold hover:bg-green-700 transition-colors"
                >
                  Chọn trạm này
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Trạm xuất phát: chỉ hiển thị khi đã có tuyến (chọn từ chat) */}
        {route && (
          <Marker position={selectedStation.position} icon={stationIcon}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-gray-800">{selectedStation.name}</p>
                <p className="text-gray-500">{selectedStation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

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

        {route && (
          <Polyline positions={route.path} pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>

      {/* Overlay: ô tìm kiếm địa điểm (giống Google Map) */}
      <form
        onSubmit={handleMapSearch}
        className="absolute top-3 left-3 z-[500] flex items-center gap-2 w-[min(460px,calc(100%-24px))]"
      >
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Tìm kiếm địa điểm, mốc, tên đường..."
            className="w-full bg-white shadow-md border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#00A859] transition-colors"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 h-10 px-4 rounded-full bg-[#00A859] text-white text-sm font-bold shadow-md hover:bg-green-700 transition-colors flex items-center gap-1.5"
        >
          <Search size={15} />
          Tìm
        </button>
      </form>

      {/* Overlay: cảnh báo khu vực */}
      {warnings.length > 0 && (
        <div className="absolute top-16 left-3 z-[500] w-[min(320px,calc(100%-24px))] bg-white/95 backdrop-blur rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white">
            <AlertTriangle size={14} />
            <span className="text-[11px] font-black uppercase tracking-wide">
              Cảnh báo khu vực ({warnings.length})
            </span>
          </div>
          <div className="p-2 space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
            {warnings.map((w) => {
              const style = WARNING_STYLE[w.severity];
              const Icon = WARNING_ICON[w.type];
              return (
                <div key={w.id} className={`flex items-start gap-2 rounded-lg border p-2 ${style.box}`}>
                  <Icon size={14} className={`${style.icon} shrink-0 mt-0.5`} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-800">{w.title}</p>
                    <p className="text-[10px] text-gray-500 leading-snug">{w.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay: trạng thái vị trí đã ghim */}
      {location && confirmed && (
        <div className="absolute bottom-3 left-16 z-[500] bg-white/95 backdrop-blur rounded-lg shadow-md border border-gray-200 px-3 py-2 flex items-center gap-2 max-w-[420px]">
          <MapPin size={16} className="text-[#00A859] shrink-0" />
          <p className="text-xs font-semibold text-gray-700 truncate flex-1">{location.address}</p>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#00A859] whitespace-nowrap">
            <CheckCircle2 size={13} /> Đã ghim
          </span>
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
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              title="Thu gọn"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3 bg-gray-50">
            {messages.map((msg) => (
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
                      className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'osa'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {msg.location && <LocationBubble location={msg.location} />}
                  {msg.warnings && msg.warnings.length > 0 && <WarningBubble warnings={msg.warnings} />}
                  {msg.stations && msg.stations.length > 0 && (
                    <StationList stations={msg.stations} onPick={(s) => sendMessage(`Trạm: ${s.name}`)} />
                  )}
                  {msg.route && <RouteBubble route={msg.route} />}

                  {msg.places && msg.places.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.places.map((p) => (
                        <PlaceCard key={p.id} place={p} onFocus={handleFocusPlace} />
                      ))}
                    </div>
                  )}

                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr) => (
                        <button
                          key={qr}
                          type="button"
                          onClick={() => sendMessage(qr)}
                          className="px-2.5 py-1 rounded-full border border-[#00A859] text-[#00A859] text-[11px] font-bold hover:bg-[#00A859] hover:text-white transition-colors"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

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
                  onClick={() => sendMessage(s)}
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
              sendMessage(input);
            }}
            className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập nội dung lời khách..."
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
        onClick={() => setChatOpen((v) => !v)}
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
