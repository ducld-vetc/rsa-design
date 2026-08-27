import {
  AREA_PROVINCES,
  V1_TO_BOTH_PROVINCE,
  type AddressSchemaMode,
} from './stationCoverageProvinces';
import vietnamProvinces63 from './vietnamProvinces63.json';

export type ProvinceBoundaryProps = {
  id: string;
  code: string;
  name: string;
};

type BoundaryGeometry = {
  type: string;
  coordinates: unknown;
};

type BoundaryFeature = {
  type: 'Feature';
  properties: ProvinceBoundaryProps;
  geometry: BoundaryGeometry;
};

type BoundaryCollection = {
  type: 'FeatureCollection';
  features: BoundaryFeature[];
};

const CODE_TO_PROVINCE = new Map(AREA_PROVINCES.map((p) => [p.code.toUpperCase(), p]));

/** Ranh giới 63 tỉnh (GADM 4.1, đã map mã RSA). */
export const vietnamProvinceBoundaries63 = vietnamProvinces63 as unknown as BoundaryCollection;

/**
 * GeoJSON tỉnh theo schema:
 * - old: 63 tỉnh
 * - new: remap mã V1 → BOTH (cùng id có thể nhiều polygon thành phần)
 */
export function getVietnamProvinceBoundaries(mode: AddressSchemaMode): BoundaryCollection {
  if (mode === 'old') return vietnamProvinceBoundaries63;

  const features: BoundaryFeature[] = [];
  for (const ft of vietnamProvinceBoundaries63.features) {
    const srcCode = String(ft.properties?.code ?? '').toUpperCase();
    const targetCode = (V1_TO_BOTH_PROVINCE[srcCode] ?? srcCode).toUpperCase();
    const target = CODE_TO_PROVINCE.get(targetCode);
    if (!target || target.schemaVersion !== 'BOTH') continue;
    features.push({
      type: 'Feature',
      properties: {
        id: target.id,
        code: target.code,
        name: target.name,
      },
      geometry: ft.geometry,
    });
  }
  return { type: 'FeatureCollection', features };
}
