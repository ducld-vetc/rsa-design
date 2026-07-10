export type LatLngTuple = [number, number];

export interface NearbyPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceKm: number;
  image: string;
  position: LatLngTuple;
}

export interface RescueStationPoint {
  id: string;
  name: string;
  address: string;
  position: LatLngTuple;
}

export interface IdentifiedLocation {
  address: string;
  position: LatLngTuple;
  confidence: number;
}

export interface RouteResult {
  fromName: string;
  toName: string;
  distanceKm: number;
  durationMin: number;
  path: LatLngTuple[];
}

export type AreaWarningType = 'weather' | 'flood' | 'traffic' | 'demand';
export type AreaWarningSeverity = 'high' | 'medium' | 'low';

export interface AreaWarning {
  id: string;
  type: AreaWarningType;
  severity: AreaWarningSeverity;
  title: string;
  detail: string;
}

export type ChatRole = 'osa' | 'bot';

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  text?: string;
  location?: IdentifiedLocation;
  places?: NearbyPlace[];
  route?: RouteResult;
  warnings?: AreaWarning[];
  stations?: StationDistance[];
  quickReplies?: string[];
}

export interface BotResponse {
  messages: ChatMessageData[];
  location?: IdentifiedLocation;
  places?: NearbyPlace[];
  route?: RouteResult;
  warnings?: AreaWarning[];
  selectedStationId?: string;
  /** Yêu cầu mở bảng "Xem đường đi" trên màn hình (thay vì thao tác trong chat) */
  openDirections?: boolean;
}

/** Điểm xuất phát của tuyến đường: có thể là trạm cứu hộ hoặc một vị trí tuỳ chọn */
export interface RouteOrigin {
  name: string;
  address?: string;
  position: LatLngTuple;
  kind: 'station' | 'custom';
}

export const MAP_DEFAULT_CENTER: LatLngTuple = [16.2, 106.5];
export const MAP_DEFAULT_ZOOM = 6;

// Giới hạn khung nhìn quanh lãnh thổ Việt Nam
export const VIETNAM_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [7.5, 101.5],
  [24.5, 111.5],
];

export const DEFAULT_STATION_RADIUS_KM = 10;
export const MIN_STATION_RADIUS_KM = 1;
export const MAX_STATION_RADIUS_KM = 50;
// Giữ lại tên cũ để tương thích
export const STATION_SEARCH_RADIUS_KM = DEFAULT_STATION_RADIUS_KM;

export const RESCUE_STATIONS: RescueStationPoint[] = [
  {
    id: 'st-1',
    name: 'Trạm cứu hộ Thanh Xuân',
    address: 'Nguyễn Trãi, Thanh Xuân, Hà Nội',
    position: [21.001, 105.805],
  },
  {
    id: 'st-2',
    name: 'Garage Thăng Long',
    address: 'Khuất Duy Tiến, Cầu Giấy, Hà Nội',
    position: [21.0075, 105.7995],
  },
  {
    id: 'st-3',
    name: 'Cứu hộ 116 Cầu Giấy',
    address: 'Trần Thái Tông, Cầu Giấy, Hà Nội',
    position: [21.03, 105.792],
  },
  {
    id: 'st-4',
    name: 'Trạm cứu hộ Hà Đông',
    address: 'Quang Trung, Hà Đông, Hà Nội',
    position: [20.955, 105.755],
  },
  {
    id: 'st-5',
    name: 'Carpla Service - CN Hà Nội',
    address: 'Phường Việt Hưng, Long Biên, Hà Nội',
    position: [21.0455, 105.8875],
  },
  {
    id: 'st-6',
    name: 'Trạm cứu hộ Long Biên',
    address: 'Ngô Gia Tự, Long Biên, Hà Nội',
    position: [21.048, 105.895],
  },
];

export interface StationDistance extends RescueStationPoint {
  distanceKm: number;
}

/** Danh sách trạm trong bán kính (km) quanh 1 vị trí, sắp theo khoảng cách tăng dần */
export const stationsWithinRadius = (
  location: LatLngTuple,
  radiusKm: number
): StationDistance[] =>
  RESCUE_STATIONS.map((s) => ({
    ...s,
    distanceKm: Math.round(haversineKm(location, s.position) * 10) / 10,
  }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

/** Trạm gần nhất (dùng khi không có trạm nào trong bán kính) */
export const nearestStations = (location: LatLngTuple, count: number): StationDistance[] =>
  RESCUE_STATIONS.map((s) => ({
    ...s,
    distanceKm: Math.round(haversineKm(location, s.position) * 10) / 10,
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);

const IMG = {
  fuel: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=320&h=220&fit=crop',
  mall: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=320&h=220&fit=crop',
  garage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=320&h=220&fit=crop',
  building: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=320&h=220&fit=crop',
  intersection: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=320&h=220&fit=crop',
  bridge: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=320&h=220&fit=crop',
};

// Vị trí "xác định được" mặc định: Ngã tư Nguyễn Trãi - Khuất Duy Tiến (Thanh Xuân, Hà Nội)
const IDENTIFIED_DEFAULT: IdentifiedLocation = {
  address: 'Ngã tư Nguyễn Trãi - Khuất Duy Tiến, P. Thanh Xuân Trung, Q. Thanh Xuân, Hà Nội',
  position: [21.0002, 105.8005],
  confidence: 0.86,
};

const NEARBY_DEFAULT: NearbyPlace[] = [
  {
    id: 'p-1',
    name: 'Cây xăng Petrolimex 34',
    category: 'Cây xăng',
    address: '295 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    distanceKm: 0.15,
    image: IMG.fuel,
    position: [21.0009, 105.8018],
  },
  {
    id: 'p-2',
    name: 'Vincom Nguyễn Trãi',
    category: 'Trung tâm thương mại',
    address: '54A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    distanceKm: 0.42,
    image: IMG.mall,
    position: [20.9978, 105.8043],
  },
  {
    id: 'p-3',
    name: 'Garage Ô tô Thanh Xuân',
    category: 'Garage',
    address: 'Ngõ 106 Khuất Duy Tiến, Hà Nội',
    distanceKm: 0.6,
    image: IMG.garage,
    position: [21.0031, 105.7975],
  },
  {
    id: 'p-4',
    name: 'Tòa nhà Golden Palace',
    category: 'Mốc dễ nhận biết',
    address: 'Mễ Trì, Nam Từ Liêm, Hà Nội',
    distanceKm: 0.85,
    image: IMG.building,
    position: [21.0055, 105.7935],
  },
];

// Bộ vị trí thay thế để giả lập "tìm địa điểm khác"
const IDENTIFIED_ALT: IdentifiedLocation = {
  address: 'Cầu vượt Ngã Tư Sở, P. Ngã Tư Sở, Q. Đống Đa, Hà Nội',
  position: [21.0045, 105.8225],
  confidence: 0.78,
};

const NEARBY_ALT: NearbyPlace[] = [
  {
    id: 'a-1',
    name: 'Cầu vượt Ngã Tư Sở',
    category: 'Mốc dễ nhận biết',
    address: 'Giao Nguyễn Trãi - Tây Sơn - Láng, Hà Nội',
    distanceKm: 0.05,
    image: IMG.bridge,
    position: [21.0045, 105.8225],
  },
  {
    id: 'a-2',
    name: 'Cây xăng Ngã Tư Sở',
    category: 'Cây xăng',
    address: '1 Tây Sơn, Đống Đa, Hà Nội',
    distanceKm: 0.3,
    image: IMG.fuel,
    position: [21.0062, 105.8215],
  },
  {
    id: 'a-3',
    name: 'Royal City',
    category: 'Trung tâm thương mại',
    address: '72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    distanceKm: 0.7,
    image: IMG.mall,
    position: [20.9995, 105.8155],
  },
];

const WARNINGS_DEFAULT: AreaWarning[] = [
  {
    id: 'w-1',
    type: 'weather',
    severity: 'high',
    title: 'Mưa lớn diện rộng',
    detail: 'Dự báo mưa to đến rất to trong 2 giờ tới tại khu vực Thanh Xuân, tầm nhìn hạn chế.',
  },
  {
    id: 'w-2',
    type: 'flood',
    severity: 'high',
    title: 'Ngập sâu cục bộ',
    detail: 'Hầm chui Thanh Xuân ngập 30-40cm, hạn chế xe gầm thấp di chuyển.',
  },
  {
    id: 'w-3',
    type: 'demand',
    severity: 'medium',
    title: 'Nhiều đơn cứu hộ',
    detail: 'Khu vực đang có ~12 đơn cứu hộ/giờ, thời gian điều phối có thể lâu hơn bình thường.',
  },
];

const WARNINGS_ALT: AreaWarning[] = [
  {
    id: 'wa-1',
    type: 'traffic',
    severity: 'high',
    title: 'Ùn tắc nghiêm trọng',
    detail: 'Nút giao Ngã Tư Sở đang ùn tắc kéo dài, xe cứu hộ có thể tới chậm.',
  },
  {
    id: 'wa-2',
    type: 'demand',
    severity: 'medium',
    title: 'Nhiều đơn cứu hộ',
    detail: 'Khu vực Đống Đa hiện có 8 đơn cứu hộ đang chờ điều phối.',
  },
];

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toRad = (v: number) => (v * Math.PI) / 180;

export const haversineKm = (a: LatLngTuple, b: LatLngTuple): number => {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Tạo tuyến đường "giả" gồm vài điểm gấp khúc giữa 2 tọa độ cho giống đường thật
const buildMockPath = (from: LatLngTuple, to: LatLngTuple): LatLngTuple[] => {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const offset = 0.004;
  return [
    from,
    [from[0] + (midLat - from[0]) * 0.5, from[1] + (midLng - from[1]) * 0.5 + offset],
    [midLat + offset, midLng],
    [to[0] + (midLat - to[0]) * 0.5 - offset, to[1] + (midLng - to[1]) * 0.5],
    to,
  ];
};

/** Vẽ tuyến đường từ 1 điểm xuất phát bất kỳ (trạm hoặc vị trí tuỳ chọn) tới vị trí đã xác định */
export const buildRouteFrom = (
  origin: { name: string; position: LatLngTuple },
  location: IdentifiedLocation
): RouteResult => {
  const straight = haversineKm(origin.position, location.position);
  const distanceKm = Math.round(straight * 1.35 * 10) / 10; // hệ số đường thực tế
  const durationMin = Math.max(3, Math.round((distanceKm / 28) * 60));
  return {
    fromName: origin.name,
    toName: location.address,
    distanceKm,
    durationMin,
    path: buildMockPath(origin.position, location.position),
  };
};

export const buildRoute = (
  station: RescueStationPoint,
  location: IdentifiedLocation
): RouteResult => buildRouteFrom(station, location);

// Một số mốc quen thuộc để giả lập tìm kiếm vị trí xuất phát tuỳ ý
const CUSTOM_LANDMARKS: { keywords: string[]; name: string; address: string; position: LatLngTuple }[] = [
  {
    keywords: ['hồ gươm', 'hoàn kiếm', 'bờ hồ'],
    name: 'Hồ Hoàn Kiếm',
    address: 'Q. Hoàn Kiếm, Hà Nội',
    position: [21.0287, 105.8524],
  },
  {
    keywords: ['mỹ đình', 'my dinh', 'bến xe mỹ đình'],
    name: 'Bến xe Mỹ Đình',
    address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội',
    position: [21.0288, 105.7757],
  },
  {
    keywords: ['nội bài', 'sân bay', 'noi bai'],
    name: 'Sân bay Nội Bài',
    address: 'Sóc Sơn, Hà Nội',
    position: [21.2212, 105.807],
  },
  {
    keywords: ['times city', 'timescity'],
    name: 'Times City',
    address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
    position: [20.9942, 105.8676],
  },
  {
    keywords: ['keangnam', 'landmark 72'],
    name: 'Keangnam Landmark 72',
    address: 'Phạm Hùng, Nam Từ Liêm, Hà Nội',
    position: [21.0175, 105.7838],
  },
];

/**
 * Giả lập geocode 1 vị trí xuất phát tuỳ ý từ câu tìm kiếm.
 * Ưu tiên khớp mốc quen thuộc; nếu không, sinh 1 điểm ổn định (theo hash) quanh vị trí đích.
 */
export const geocodeOrigin = (query: string, near: LatLngTuple): RouteOrigin => {
  const q = query.toLowerCase().trim();
  const found = CUSTOM_LANDMARKS.find((l) => l.keywords.some((k) => q.includes(k)));
  if (found) {
    return { name: found.name, address: found.address, position: found.position, kind: 'custom' };
  }
  const h = Array.from(q).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const dLat = (((h % 100) / 100) - 0.5) * 0.07; // lệch ~ vài km
  const dLng = ((((h * 7) % 100) / 100) - 0.5) * 0.07;
  return {
    name: query.trim() || 'Vị trí tuỳ chọn',
    address: 'Vị trí do người dùng nhập',
    position: [Math.round((near[0] + dLat) * 1e5) / 1e5, Math.round((near[1] + dLng) * 1e5) / 1e5],
    kind: 'custom',
  };
};

export const KW_ROUTE = [
  'đường đi',
  'chỉ đường',
  'từ trạm',
  'bao xa',
  'bao nhiêu km',
  'di chuyển',
  'tới đó',
  'đến đó',
  'định tuyến',
  'route',
  'quãng đường',
];

export const KW_STATION_LIST = [
  'danh sách trạm',
  'ds trạm',
  'trạm gần',
  'liệt kê trạm',
  'các trạm',
  'xem trạm',
];

export const KW_TOW = [
  'kéo xe tới',
  'kéo xe đến',
  'vị trí kéo',
  'kéo về',
  'điểm kéo',
  'garage',
  'xưởng',
];

const KW_ALT = ['địa điểm khác', 'vị trí khác', 'tìm lại', 'không đúng', 'sai vị trí', 'chỗ khác'];

const KW_LOCATION = [
  'cây xăng',
  'petrolimex',
  'vincom',
  'royal',
  'ngã tư',
  'ngã ba',
  'ngã tư sở',
  'gần',
  'đối diện',
  'đường',
  'phố',
  'số nhà',
  'chung cư',
  'tòa nhà',
  'cầu',
  'bến xe',
  'trường',
  'km',
  'quốc lộ',
  'cao tốc',
  'chợ',
];

export const hasKeyword = (text: string, keywords: string[]) =>
  keywords.some((kw) => text.includes(kw));

interface ConversationContext {
  location: IdentifiedLocation | null;
  places: NearbyPlace[];
}

const confidencePct = (c: number) => `${Math.round(c * 100)}%`;

/**
 * Engine giả lập: dựa vào từ khóa trong câu chat để trả lời.
 * Trả về các message của bot + side-effect (vị trí, điểm gần, tuyến đường).
 * Lưu ý: cảnh báo & địa điểm gần đó KHÔNG hiển thị trong chat mà chỉ hiển thị trên bản đồ;
 * chat chỉ trả lời xác nhận đã hiển thị.
 */
const displayedInfoText = (warnings: AreaWarning[], places: NearbyPlace[]): string =>
  `Mình đã hiển thị ${warnings.length} cảnh báo khu vực và ${places.length} địa điểm gần đó trên bản đồ để anh/chị đối chiếu với khách hàng.`;

/** Kết quả tìm vị trí trực tiếp (không qua chat) */
export interface LocationIdentifyResult {
  location: IdentifiedLocation;
  places: NearbyPlace[];
  warnings: AreaWarning[];
}

/**
 * Xác định vị trí sự cố từ mô tả địa chỉ — dùng cho ô tìm kiếm trên bản đồ.
 * Trả về null nếu không đủ dữ kiện để geocode.
 */
export const identifyLocationFromQuery = (
  rawText: string,
  ctx: ConversationContext
): LocationIdentifyResult | null => {
  const text = rawText.toLowerCase().trim();
  if (!text) return null;

  if (hasKeyword(text, KW_ALT)) {
    return { location: IDENTIFIED_ALT, places: NEARBY_ALT, warnings: WARNINGS_ALT };
  }

  if (hasKeyword(text, KW_LOCATION) || text.length >= 12) {
    return { location: IDENTIFIED_DEFAULT, places: NEARBY_DEFAULT, warnings: WARNINGS_DEFAULT };
  }

  // Fallback: vẫn cố gắng geocode nếu đủ dài hoặc có từ khóa địa điểm
  if (text.length >= 6) {
    return { location: IDENTIFIED_DEFAULT, places: NEARBY_DEFAULT, warnings: WARNINGS_DEFAULT };
  }

  return null;
};

export const respondToMessage = (
  rawText: string,
  ctx: ConversationContext
): BotResponse => {
  const text = rawText.toLowerCase().trim();

  // Danh sách action sau khi đã xác định được vị trí sự cố
  const identifiedReplies = ['Xem danh sách trạm', 'Xem đường đi', 'Tìm địa điểm khác'];

  // 1) Yêu cầu tìm địa điểm khác
  if (hasKeyword(text, KW_ALT)) {
    return {
      location: IDENTIFIED_ALT,
      places: NEARBY_ALT,
      warnings: WARNINGS_ALT,
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Mình xác định lại vị trí sự cố khả năng cao là: ${IDENTIFIED_ALT.address} (độ tin cậy ${confidencePct(
            IDENTIFIED_ALT.confidence
          )}).`,
          location: IDENTIFIED_ALT,
        },
        {
          id: uid(),
          role: 'bot',
          text: displayedInfoText(WARNINGS_ALT, NEARBY_ALT),
          quickReplies: identifiedReplies,
        },
      ],
    };
  }

  // 2) Xác nhận vị trí sự cố
  if (hasKeyword(text, ['xác nhận', 'chốt', 'đồng ý'])) {
    if (!ctx.location) {
      return {
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: 'Chưa có vị trí sự cố nào được xác định. Anh/chị mô tả vị trí khách hàng giúp mình nhé.',
          },
        ],
      };
    }
    return {
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Đã ghim vị trí sự cố: ${ctx.location.address}. Anh/chị chọn tiếp bước dưới đây.`,
          quickReplies: ['Xem danh sách trạm', 'Xem đường đi'],
        },
      ],
    };
  }

  // 3) Có dấu hiệu mô tả vị trí -> xác định vị trí sự cố (cảnh báo & địa điểm gần chỉ hiển thị trên bản đồ)
  if (hasKeyword(text, KW_LOCATION) || text.length >= 12) {
    return {
      location: IDENTIFIED_DEFAULT,
      places: NEARBY_DEFAULT,
      warnings: WARNINGS_DEFAULT,
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Từ mô tả của khách, mình xác định vị trí sự cố khả năng cao là: ${IDENTIFIED_DEFAULT.address} (độ tin cậy ${confidencePct(
            IDENTIFIED_DEFAULT.confidence
          )}).`,
          location: IDENTIFIED_DEFAULT,
        },
        {
          id: uid(),
          role: 'bot',
          text: displayedInfoText(WARNINGS_DEFAULT, NEARBY_DEFAULT),
          quickReplies: identifiedReplies,
        },
      ],
    };
  }

  // 4) Fallback: hỏi làm rõ
  return {
    messages: [
      {
        id: uid(),
        role: 'bot',
        text: 'Anh/chị cho mình xin thêm dữ kiện về vị trí khách hàng nhé: mốc gần nhất (cây xăng, tòa nhà, ngã tư), tên đường hoặc số nhà.',
        quickReplies: [
          'Gần cây xăng Petrolimex Nguyễn Trãi',
          'Đối diện Vincom Nguyễn Trãi',
          'Ở ngã tư sở',
        ],
      },
    ],
  };
};

export const INITIAL_BOT_MESSAGE: ChatMessageData = {
  id: 'welcome',
  role: 'bot',
  text: 'Xin chào! Mô tả vị trí sự cố ở panel bên trái hoặc chat tại đây — kết quả hiển thị chung trên panel. Sau đó chọn trạm và thêm điểm kéo xe (nếu cần).',
  quickReplies: [
    'Gần cây xăng Petrolimex Nguyễn Trãi',
    'Đối diện Vincom Nguyễn Trãi',
    'Ở ngã tư sở',
  ],
};

export const SAMPLE_PROMPTS = [
  'Khách nói đang đứng gần cây xăng Petrolimex trên đường Nguyễn Trãi, đối diện có Vincom',
  'Xe nằm ở ngã tư sở, gần cầu vượt',
  'Xem đường đi tới vị trí khách',
];
