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
}

export const MAP_DEFAULT_CENTER: LatLngTuple = [16.2, 106.5];
export const MAP_DEFAULT_ZOOM = 6;

// Giới hạn khung nhìn quanh lãnh thổ Việt Nam
export const VIETNAM_BOUNDS: [LatLngTuple, LatLngTuple] = [
  [7.5, 101.5],
  [24.5, 111.5],
];

export const STATION_SEARCH_RADIUS_KM = 10;

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

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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

export const buildRoute = (
  station: RescueStationPoint,
  location: IdentifiedLocation
): RouteResult => {
  const straight = haversineKm(station.position, location.position);
  const distanceKm = Math.round(straight * 1.35 * 10) / 10; // hệ số đường thực tế
  const durationMin = Math.max(3, Math.round((distanceKm / 28) * 60));
  return {
    fromName: station.name,
    toName: location.address,
    distanceKm,
    durationMin,
    path: buildMockPath(station.position, location.position),
  };
};

const KW_ROUTE = [
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

const hasKeyword = (text: string, keywords: string[]) =>
  keywords.some((kw) => text.includes(kw));

interface ConversationContext {
  location: IdentifiedLocation | null;
  places: NearbyPlace[];
  selectedStation: RescueStationPoint;
}

const confidencePct = (c: number) => `${Math.round(c * 100)}%`;

/**
 * Engine giả lập: dựa vào từ khóa trong câu chat để trả lời.
 * Trả về các message của bot + side-effect (vị trí, điểm gần, tuyến đường).
 */
const warningsMessage = (warnings: AreaWarning[]): ChatMessageData => ({
  id: uid(),
  role: 'bot',
  text: 'Cảnh báo tại khu vực này, anh/chị lưu ý khi điều phối:',
  warnings,
});

export const respondToMessage = (
  rawText: string,
  ctx: ConversationContext
): BotResponse => {
  const text = rawText.toLowerCase().trim();

  // 0) Chọn trạm xuất phát (output đi từ chat) -> vẽ tuyến
  const pickedStation = RESCUE_STATIONS.find((s) => text.includes(s.name.toLowerCase()));
  if (pickedStation) {
    if (!ctx.location) {
      return {
        selectedStationId: pickedStation.id,
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: `Đã chọn trạm "${pickedStation.name}". Anh/chị mô tả vị trí khách hàng để mình vẽ đường đi nhé.`,
            quickReplies: ['Gần cây xăng Petrolimex Nguyễn Trãi', 'Đối diện Vincom Nguyễn Trãi'],
          },
        ],
      };
    }
    const route = buildRoute(pickedStation, ctx.location);
    return {
      selectedStationId: pickedStation.id,
      route,
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Tuyến đường từ "${pickedStation.name}" tới vị trí khách hàng đã được vẽ trên bản đồ.`,
          route,
          quickReplies: ['Xác nhận vị trí này', 'Tìm địa điểm khác'],
        },
      ],
    };
  }

  // 1) Yêu cầu chỉ đường -> hỏi chọn trạm ngay trong chat
  if (hasKeyword(text, KW_ROUTE)) {
    if (!ctx.location) {
      return {
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: 'Mình chưa có vị trí khách hàng để tính đường đi. Anh/chị mô tả vị trí trước giúp mình nhé (ví dụ: gần cây xăng, ngã tư, tòa nhà...).',
            quickReplies: ['Gần cây xăng Petrolimex Nguyễn Trãi', 'Đối diện Vincom Nguyễn Trãi'],
          },
        ],
      };
    }
    const within = stationsWithinRadius(ctx.location.position, STATION_SEARCH_RADIUS_KM);
    if (within.length > 0) {
      return {
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: `Có ${within.length} trạm trong bán kính ${STATION_SEARCH_RADIUS_KM} km quanh vị trí khách hàng. Anh/chị chọn trạm xuất phát:`,
            stations: within,
          },
        ],
      };
    }
    const nearest = nearestStations(ctx.location.position, 3);
    return {
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Không có trạm nào trong bán kính ${STATION_SEARCH_RADIUS_KM} km. Đây là ${nearest.length} trạm gần nhất để anh/chị cân nhắc:`,
          stations: nearest,
        },
      ],
    };
  }

  // 2) Yêu cầu tìm địa điểm khác
  if (hasKeyword(text, KW_ALT)) {
    return {
      location: IDENTIFIED_ALT,
      places: NEARBY_ALT,
      warnings: WARNINGS_ALT,
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Mình xác định lại vị trí khả năng cao là: ${IDENTIFIED_ALT.address} (độ tin cậy ${confidencePct(
            IDENTIFIED_ALT.confidence
          )}).`,
          location: IDENTIFIED_ALT,
        },
        warningsMessage(WARNINGS_ALT),
        {
          id: uid(),
          role: 'bot',
          text: 'Các địa điểm gần đó để đối chiếu với khách hàng:',
          places: NEARBY_ALT,
          quickReplies: ['Xác nhận vị trí này', 'Xem đường đi từ trạm'],
        },
      ],
    };
  }

  // 3) Xác nhận vị trí
  if (hasKeyword(text, ['xác nhận', 'chốt', 'đồng ý'])) {
    if (!ctx.location) {
      return {
        messages: [
          {
            id: uid(),
            role: 'bot',
            text: 'Chưa có vị trí nào được xác định để chốt. Anh/chị mô tả vị trí khách hàng giúp mình nhé.',
          },
        ],
      };
    }
    return {
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Đã ghim vị trí sự cố: ${ctx.location.address}. Anh/chị có thể tạo đơn cứu hộ hoặc xem đường đi từ trạm.`,
          quickReplies: ['Xem đường đi từ trạm', 'Tìm địa điểm khác'],
        },
      ],
    };
  }

  // 4) Có dấu hiệu mô tả vị trí -> xác định vị trí + cảnh báo + gợi ý điểm gần
  if (hasKeyword(text, KW_LOCATION) || text.length >= 12) {
    return {
      location: IDENTIFIED_DEFAULT,
      places: NEARBY_DEFAULT,
      warnings: WARNINGS_DEFAULT,
      messages: [
        {
          id: uid(),
          role: 'bot',
          text: `Từ mô tả của khách, mình xác định vị trí khả năng cao là: ${IDENTIFIED_DEFAULT.address} (độ tin cậy ${confidencePct(
            IDENTIFIED_DEFAULT.confidence
          )}).`,
          location: IDENTIFIED_DEFAULT,
        },
        warningsMessage(WARNINGS_DEFAULT),
        {
          id: uid(),
          role: 'bot',
          text: 'Các địa điểm gần đó kèm hình ảnh để anh/chị đối chiếu với khách hàng:',
          places: NEARBY_DEFAULT,
          quickReplies: ['Xác nhận vị trí này', 'Xem đường đi từ trạm', 'Tìm địa điểm khác'],
        },
      ],
    };
  }

  // 5) Fallback: hỏi làm rõ
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
  text: 'Xin chào! Mình là trợ lý xác định vị trí. Anh/chị dán/nhập nguyên văn mô tả vị trí của khách hàng, mình sẽ xác định vị trí trên bản đồ và gợi ý các địa điểm gần đó.',
  quickReplies: [
    'Gần cây xăng Petrolimex Nguyễn Trãi',
    'Đối diện Vincom Nguyễn Trãi',
    'Ở ngã tư sở',
  ],
};

export const SAMPLE_PROMPTS = [
  'Khách nói đang đứng gần cây xăng Petrolimex trên đường Nguyễn Trãi, đối diện có Vincom',
  'Xe nằm ở ngã tư sở, gần cầu vượt',
  'Xem đường đi từ trạm tới vị trí khách',
];
