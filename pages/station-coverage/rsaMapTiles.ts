/**
 * Tile server RSA (OpenMapTiles) — thử nghiệm thay OSM public.
 * Auth: query `apikey` (header x-api-key cũng được, nhưng img tile Leaflet dùng query).
 * Key nằm phía client — chỉ dùng thử; revert về OSM nếu không ổn.
 */
export const RSA_MAP_TILE_URL =
  'https://openmaptiles-rsa.vetc.com.vn/styles/VietNam/{z}/{x}/{y}.png?apikey=shuuk1ooz5owie3IeGh0koo4Ophod8th';

export const RSA_MAP_TILE_ATTRIBUTION = '© RSA OpenMapTiles · VietNam';
