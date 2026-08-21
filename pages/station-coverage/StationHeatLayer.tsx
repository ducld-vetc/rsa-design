import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { vietnamProvincesGeo, VIETNAM_BOUNDS } from '../rsa-dashboard/vietnamProvinceGeo';
import { PROVINCE_CENTERS } from './stationCoverageData';

export type HeatPoint = [number, number, number];

const GRADIENT_STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [59, 130, 246]],
  [0.28, [56, 189, 248]],
  [0.5, [74, 222, 128]],
  [0.72, [250, 204, 21]],
  [0.88, [251, 146, 60]],
  [1.0, [251, 146, 146]],
];

function buildColorRamp(): Uint8ClampedArray {
  const ramp = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i += 1) {
    const t = i / 255;
    let from = GRADIENT_STOPS[0];
    let to = GRADIENT_STOPS[GRADIENT_STOPS.length - 1];
    for (let s = 0; s < GRADIENT_STOPS.length - 1; s += 1) {
      if (t >= GRADIENT_STOPS[s][0] && t <= GRADIENT_STOPS[s + 1][0]) {
        from = GRADIENT_STOPS[s];
        to = GRADIENT_STOPS[s + 1];
        break;
      }
    }
    const span = to[0] - from[0] || 1;
    const local = (t - from[0]) / span;
    const offset = i * 4;
    ramp[offset] = from[1][0] + (to[1][0] - from[1][0]) * local;
    ramp[offset + 1] = from[1][1] + (to[1][1] - from[1][1]) * local;
    ramp[offset + 2] = from[1][2] + (to[1][2] - from[1][2]) * local;
    ramp[offset + 3] = 255;
  }
  return ramp;
}

const COLOR_RAMP = buildColorRamp();

function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const latI = ring[i][0];
    const lngI = ring[i][1];
    const latJ = ring[j][0];
    const lngJ = ring[j][1];
    const intersect =
      latI > lat !== latJ > lat && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI + Number.EPSILON) + lngI;
    if (intersect) inside = !inside;
  }
  return inside;
}

const PROVINCE_RINGS = vietnamProvincesGeo.features.map((feature) => ({
  id: feature.properties.id as string,
  ring: feature.geometry.coordinates[0] as number[][],
}));

/** Lưới phủ toàn quốc — vùng không có trạm vẫn có màu lạnh. */
export function buildNationalHeatFill(visibleIds?: Set<string>): HeatPoint[] {
  const [[minLat, minLng], [maxLat, maxLng]] = VIETNAM_BOUNDS;
  const points: HeatPoint[] = [];
  const step = 0.14;
  for (let lat = minLat; lat <= maxLat; lat += step) {
    for (let lng = minLng; lng <= maxLng; lng += step) {
      const hit = PROVINCE_RINGS.find((item) => pointInRing(lat, lng, item.ring));
      if (!hit) continue;
      if (visibleIds && !visibleIds.has(hit.id)) continue;
      points.push([lat, lng, 0.38]);
    }
  }
  for (const item of PROVINCE_RINGS) {
    if (visibleIds && !visibleIds.has(item.id)) continue;
    const center = PROVINCE_CENTERS[item.id];
    if (center) points.push([center[0], center[1], 0.42]);
    for (const [lat, lng] of item.ring) {
      points.push([lat, lng, 0.34]);
    }
  }
  return points;
}

function createCircleSprite(radius: number): HTMLCanvasElement {
  const r = Math.max(8, Math.round(radius));
  const circle = document.createElement('canvas');
  const size = r * 2;
  circle.width = size;
  circle.height = size;
  const ctx = circle.getContext('2d');
  if (!ctx) return circle;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, 'rgba(0,0,0,0.42)');
  gradient.addColorStop(0.45, 'rgba(0,0,0,0.16)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return circle;
}

function colorize(image: ImageData) {
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue;
    const tone = Math.min(255, alpha);
    const ramp = tone * 4;
    data[i] = COLOR_RAMP[ramp];
    data[i + 1] = COLOR_RAMP[ramp + 1];
    data[i + 2] = COLOR_RAMP[ramp + 2];
    data[i + 3] = Math.min(135, Math.round(alpha * 0.85));
  }
}

type LeafletMapWithPrivates = L.Map & {
  _getCenterOffset: (center: L.LatLng) => L.Point;
  _getMapPanePos: () => L.Point;
};

class StationHeatCanvas extends L.Layer {
  private canvas: HTMLCanvasElement | null = null;
  private points: HeatPoint[] = [];
  private sprite: HTMLCanvasElement | null = null;
  private spriteRadius = 0;

  onAdd(map: L.Map): this {
    const canvas = L.DomUtil.create('canvas', 'leaflet-layer leaflet-zoom-animated station-heat-canvas') as HTMLCanvasElement;
    canvas.style.pointerEvents = 'none';
    canvas.style.transformOrigin = '50% 50%';
    this.canvas = canvas;
    map.getPanes().overlayPane.appendChild(canvas);

    map.on('moveend viewreset resize', this.reset, this);
    if (map.options.zoomAnimation) {
      map.on('zoomanim', this.animateZoom, this);
    }
    this.reset();
    return this;
  }

  onRemove(map: L.Map): this {
    map.off('moveend viewreset resize', this.reset, this);
    map.off('zoomanim', this.animateZoom, this);
    this.canvas?.remove();
    this.canvas = null;
    return this;
  }

  setPoints(points: HeatPoint[]) {
    this.points = points;
    this.redraw();
  }

  private animateZoom = (event: L.ZoomAnimEvent) => {
    const canvas = this.canvas;
    const map = this._map as LeafletMapWithPrivates | undefined;
    if (!canvas || !map) return;
    const scale = map.getZoomScale(event.zoom);
    const offset = map._getCenterOffset(event.center)._multiplyBy(-scale).subtract(map._getMapPanePos());
    L.DomUtil.setTransform(canvas, offset, scale);
  };

  private reset = () => {
    const canvas = this.canvas;
    const map = this._map;
    if (!canvas || !map) return;
    const size = map.getSize();
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
    this.redraw();
  };

  private redraw() {
    const canvas = this.canvas;
    const map = this._map;
    if (!canvas || !map) return;

    const size = map.getSize();
    const scale = 0.5;
    const width = Math.max(1, Math.round(size.x * scale));
    const height = Math.max(1, Math.round(size.y * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (this.points.length === 0) return;

    const zoom = map.getZoom();
    const radius = Math.round(26 + Math.max(0, zoom - 5) * 9);
    if (!this.sprite || this.spriteRadius !== radius) {
      this.sprite = createCircleSprite(radius);
      this.spriteRadius = radius;
    }

    ctx.globalCompositeOperation = 'lighter';
    const pad = radius + 4;
    for (const [lat, lng, intensity] of this.points) {
      const point = map.latLngToContainerPoint([lat, lng]);
      const x = point.x * scale;
      const y = point.y * scale;
      if (x < -pad || y < -pad || x > width + pad || y > height + pad) continue;
      ctx.globalAlpha = Math.max(0.08, Math.min(1, intensity));
      ctx.drawImage(this.sprite, x - radius * scale, y - radius * scale, radius * 2 * scale, radius * 2 * scale);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    const image = ctx.getImageData(0, 0, width, height);
    colorize(image);
    ctx.putImageData(image, 0, 0);
  }
}

interface StationHeatLayerProps {
  points: HeatPoint[];
}

const StationHeatLayer = ({ points }: StationHeatLayerProps) => {
  const map = useMap();
  const layerRef = useRef<StationHeatCanvas | null>(null);

  useEffect(() => {
    const layer = new StationHeatCanvas();
    layer.addTo(map);
    layerRef.current = layer;
    return () => {
      map.removeLayer(layer);
      layerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    layerRef.current?.setPoints(points);
  }, [points]);

  return null;
};

export default StationHeatLayer;
