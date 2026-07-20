# Spec API — Location Gateway (Google Maps HTML Bridge)

| Thuộc tính | Giá trị |
|------------|---------|
| Phiên bản | 1.2 |
| Ngày | 15/07/2026 |
| Trạng thái open points | **Đã chốt** (mục 4) |
| Phân tích | [`analysis-maps-html-bridge-api.md`](./analysis-maps-html-bridge-api.md) |
| BRD liên quan | [`tim-kiem-vi-tri.md`](./tim-kiem-vi-tri.md) |
| Caller | **Chỉ BE RSA** (internal). FE không gọi trực tiếp. |
| Base path | `/maps-bridge/v1` |

---

## 0. Quy ước chung

| Mục | Quy ước |
|-----|---------|
| Protocol | HTTPS, JSON UTF-8 |
| Auth | Internal API key hoặc mTLS (chỉ BE RSA) |
| Thời gian | ISO-8601 UTC nếu có timestamp |
| Tọa độ | WGS84; `lat` ∈ [-90, 90], `lng` ∈ [-180, 180] |
| Vùng / ngôn ngữ | **Hardcode config Gateway**: bias `VN`, language `vi` — không truyền qua API |
| Lỗi | Body thống nhất (mục 0.1) |

### 0.1. Envelope lỗi

```json
{
  "requestId": "string",
  "code": "INVALID_QUERY",
  "message": "Mô tả ngắn cho log/BE",
  "details": {}
}
```

| Field | Type | Giải thích |
|-------|------|------------|
| `requestId` | string | ID lần gọi — dùng để đối soát log Gateway ↔ BE |
| `code` | string | Mã máy đọc được (table từng API) |
| `message` | string | Mô tả tiếng Việt/Anh ngắn; **không** đưa HTML thô từ Google |
| `details` | object | Tùy chọn: field lỗi validate, timeoutMs… |

---

## 1. API Geocode — Tìm theo địa chỉ

### 1.1. Tổng quan

| Mục | Giá trị |
|-----|---------|
| Method / Path | `POST /maps-bridge/v1/geocode` |
| Mục đích | Đổi mô tả địa chỉ / tên địa điểm → danh sách ứng viên có `lat`/`lng` |
| Thay thế | Google Geocoding / Places Text Search (API chính thức) trong BRD bước A5 |
| Side effect | Không ghi session Redis của RSA. Có thể ghi cache nội bộ Gateway. |

### 1.2. Request

```
Content-Type: application/json
```

#### Body — giải thích từng input

| Field | Type | Bắt buộc | Default | Ràng buộc | Giải thích |
|-------|------|----------|---------|------------|------------|
| `query` | string | **Có** | — | Trim space; độ dài 3–500 ký tự sau trim | Chuỗi OSA/BE gửi để tìm vị trí. Có thể là địa chỉ hành chính ("12 Nguyễn Trãi, Thanh Xuân"), mốc ("Ngã tư Sở"), hoặc tên địa điểm. Gateway dùng chuỗi này để mở/search trên Google Maps HTML rồi parse kết quả. |
| `limit` | integer | Không | `5` | Min 1, Max 5 | Số ứng viên tối đa trong `results[]`. `1` = chỉ điểm tốt nhất (đủ cho auto-pick). `>1` = BE/FE có thể cho OSA chọn khi địa chỉ mơ hồ. |

**Ví dụ request**

```json
{
  "query": "Ngã tư Sở, Thanh Xuân, Hà Nội",
  "limit": 5
}
```

### 1.3. Response thành công — `200 OK`

```json
{
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "query": "Ngã tư Sở, Thanh Xuân, Hà Nội",
  "results": [
    {
      "placeId": "gmhtml:0x3135ab3d...:0x...",
      "name": "Ngã tư Sở",
      "formattedAddress": "Ngã tư Sở, Thanh Xuân, Hà Nội, Việt Nam",
      "lat": 21.0012,
      "lng": 105.8145,
      "confidence": 0.91,
      "types": ["intersection", "geocode"],
      "source": "google_maps_html"
    }
  ]
}
```

#### Body root — giải thích từng output

| Field | Type | Luôn có? | Giải thích |
|-------|------|----------|------------|
| `requestId` | string (UUID) | Có | ID lần xử lý phía Gateway. BE nên log kèm khi gọi fail để debug parse/timeout. |
| `query` | string | Có | Echo lại `query` đã normalize (trim). Giúp BE đối chiếu không nhầm request khi gọi song song. |
| `results` | array | Có | Danh sách ứng viên, **đã sắp xếp** giảm dần theo `confidence` (điểm tốt nhất ở [0]). Rỗng `[]` khi không tìm thấy — kèm HTTP 404 (xem 1.4). |

#### `results[]` — từng phần tử

| Field | Type | Luôn có? | Giải thích |
|-------|------|----------|------------|
| `placeId` | string | Có | Định danh ổn định tương đối trong hệ Gateway (prefix `gmhtml:` + hash/id parse từ HTML). Dùng làm key cache, truyền `anchorPlaceId` sang API Nearby, **không** đảm bảo trùng Google Place ID chính thức. |
| `name` | string | Có | Tên ngắn của điểm (POI / giao lộ / vùng). Ưu tiên hiển thị trên marker tooltip hoặc dòng phụ. Nếu chỉ có địa chỉ dài: có thể trùng phần đầu của `formattedAddress`. |
| `formattedAddress` | string | Có | Địa chỉ đầy đủ đã chuẩn hóa để lưu `journey.incident.address` / hiển thị panel. Đây là field **chính** BE map sang JourneyState. |
| `lat` | number | Có | Vĩ độ WGS84. Đơn vị độ thập phân (không phải DMS). |
| `lng` | number | Có | Kinh độ WGS84. |
| `confidence` | number | Có | Độ tin cậy ∈ **[0, 1]**. Gateway ước lượng từ thứ hạng kết quả HTML, độ khớp query, loại kết quả… BE dùng để quyết định auto-pick hay bắt OSA chọn. Ví dụ: `0.91` = 91%. |
| `types` | string[] | Có (có thể `[]`) | Nhãn loại điểm sau khi normalize (vd. `street_address`, `establishment`, `intersection`, `geocode`). BE có thể dùng lọc/ưu tiên; FE demo hiện **không** bắt buộc dùng. |
| `source` | string | Có | Nguồn dữ liệu. MVP: luôn `"google_maps_html"`. Dự phòng khi sau này có provider khác. |

### 1.4. Response lỗi

| HTTP | `code` | Khi nào | `results` |
|------|--------|---------|-----------|
| 400 | `INVALID_QUERY` | Thiếu `query`, sau trim &lt; 3 ký tự, hoặc &gt; 500 | Không có body success |
| 400 | `INVALID_LIMIT` | `limit` ngoài [1, 5] | — |
| 404 | `GEOCODE_NOT_FOUND` | Parse thành công nhưng không có điểm hợp lệ | Có thể kèm `results: []` trong details |
| 429 | `RATE_LIMITED` | Vượt hạn mức gọi HTML/provider | — |
| 502 | `PROVIDER_ERROR` | Google chặn, HTML đổi cấu trúc, parse exception | — |
| 504 | `PROVIDER_TIMEOUT` | Vượt timeout Gateway (**4s**, đã chốt) | — |

### 1.5. Mapping sang BE RSA / JourneyState

| Output Gateway | Field RSA | Ghi chú |
|----------------|-----------|---------|
| `results[i].formattedAddress` | `journey.incident.address` (hoặc origin/tow) | Theo `pointRole` của API session |
| `results[i].lat` | `journey.*.lat` | |
| `results[i].lng` | `journey.*.lng` | |
| `results[i].confidence` | `journey.*.confidence` | |
| `results[i].placeId` | Cache / trace | Không bắt buộc FE |

**Quy tắc chọn phần tử (đã chốt)**

| Điều kiện | Hành vi |
|-----------|---------|
| `confidence ≥ 0.75` | BE có thể auto-pick `results[0]` (threshold cố định **0.75**) |
| Nhiều ứng viên / cần OSA chọn | Gateway/BE trả nguyên `results[]`; **FE tự xử lý UX** chọn điểm |
| `GEOCODE_NOT_FOUND` / 5xx | Không ghim marker; toast lỗi (BR-UC01-01) |

**Timeout (đã chốt):** Gateway/BE timeout **4s** cho geocode và **4s** cho nearby.

---

## 2. API Nearby — Danh sách điểm gần

### 2.1. Tổng quan

| Mục | Giá trị |
|-----|---------|
| Method / Path | `POST /maps-bridge/v1/nearby` |
| Mục đích | Từ một điểm đã có tọa độ → danh sách POI / mốc lân cận để OSA định vị nhanh |
| Nguồn dữ liệu | **Chỉ Google Maps HTML** (đã chốt) — không lấy từ CSDL RSA |
| Thay thế | Bước A9 `nearbyPlaces` trong BRD (trước đây ghi CSDL RSA) |
| **Không** thay thế | `GET /location-sessions/{id}/stations/nearby` (trạm cứu hộ RSA) |
| Side effect | Không ghi JourneyState. Cache ngắn hạn phía Gateway/BE. |

### 2.2. Request

```
Content-Type: application/json
```

#### Body — giải thích từng input

| Field | Type | Bắt buộc | Default | Ràng buộc | Giải thích |
|-------|------|----------|---------|------------|------------|
| `lat` | number | **Có** | — | [-90, 90]; khuyến nghị trong khung VN | Vĩ độ **tâm** tìm kiếm — thường lấy từ kết quả geocode đã chọn (vị trí sự cố). |
| `lng` | number | **Có** | — | [-180, 180]; khuyến nghị trong khung VN | Kinh độ tâm tìm kiếm. |
| `radiusMeters` | integer | Không | `1500` | Min 100, Max 5000 | Bán kính (mét) quanh tâm. POI ngoài bán kính không trả về (sau khi Gateway/BE tính khoảng cách). 1500m ≈ phù hợp định vị đô thị; tăng khi vùng thưa. |
| `limit` | integer | Không | `10` | Min 1, Max 20 | Số điểm tối đa trong `places[]`. FE demo list PlaceCard — nên giữ ≤ 10 để UI gọn. |
| `categories` | string[] | Không | Xem mặc định bên dưới | Mỗi phần tử thuộc enum mục 2.2.1 | Lọc loại POI. `[]` hoặc omit = dùng bộ mặc định RSA. |
| `anchorPlaceId` | string | Không | `null` | Cùng format `placeId` geocode | `placeId` vừa geocode được. Giúp Gateway tái dùng context HTML/session scrape (nếu adapter hỗ trợ), giảm lần mở Maps mới. **Optional** — thiếu vẫn tìm theo lat/lng. |

**Default `categories` (khi omit)**

```json
["gas_station", "shopping_mall", "landmark", "hospital", "intersection"]
```

#### 2.2.1. Enum `categories`

| Giá trị | Ý nghĩa | `categoryLabel` gợi ý (vi) |
|---------|---------|----------------------------|
| `gas_station` | Cây xăng / trạm xăng | Cây xăng |
| `shopping_mall` | TTTM / trung tâm thương mại | TTTM |
| `landmark` | Mốc / địa danh quen | Địa danh |
| `hospital` | Bệnh viện / cơ sở y tế | Bệnh viện |
| `intersection` | Ngã tư / vòng xuyến | Ngã tư |
| `parking` | Bãi đỗ xe | Bãi đỗ |
| `police` | Công an / đồn | Công an |
| `other` | Không map được enum | Khác |

**Ví dụ request**

```json
{
  "lat": 21.0012,
  "lng": 105.8145,
  "radiusMeters": 1500,
  "limit": 10,
  "categories": ["gas_station", "shopping_mall", "landmark", "hospital"],
  "anchorPlaceId": "gmhtml:0x3135ab3d...:0x..."
}
```

### 2.3. Response thành công — `200 OK`

Kể cả khi **không có POI**, vẫn trả `200` với `places: []` (không dùng 404). FE ẩn khối "Địa điểm gần" hoặc empty state.

```json
{
  "requestId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "center": {
    "lat": 21.0012,
    "lng": 105.8145
  },
  "places": [
    {
      "placeId": "gmhtml:poi:...",
      "name": "Cây xăng Petrolimex Nguyễn Trãi",
      "category": "gas_station",
      "categoryLabel": "Cây xăng",
      "formattedAddress": "Nguyễn Trãi, Thanh Xuân, Hà Nội",
      "lat": 21.0021,
      "lng": 105.8130,
      "distanceMeters": 180,
      "distanceKm": 0.18,
      "imageUrl": null,
      "rating": null,
      "source": "google_maps_html"
    }
  ]
}
```

#### Body root — giải thích từng output

| Field | Type | Luôn có? | Giải thích |
|-------|------|----------|------------|
| `requestId` | string | Có | ID lần gọi — log/debug. |
| `center` | object | Có | Echo tọa độ tâm đã dùng (sau khi Gateway validate). FE/BE đối chiếu với điểm sự cố. |
| `center.lat` | number | Có | Vĩ độ tâm. |
| `center.lng` | number | Có | Kinh độ tâm. |
| `places` | array | Có | Danh sách POI, **sắp xếp tăng dần** theo `distanceMeters` (gần nhất trước). Có thể rỗng. |

#### `places[]` — từng phần tử

| Field | Type | Luôn có? | Giải thích |
|-------|------|----------|------------|
| `placeId` | string | Có | ID POI phía Gateway. Map sang `NearbyPlace.id` trên FE. |
| `name` | string | Có | Tên hiển thị trên PlaceCard (vd. tên cây xăng). |
| `category` | string | Có | Mã enum (bảng 2.2.1). Dùng filter/icon phía BE/FE. |
| `categoryLabel` | string | Có | Nhãn tiếng Việt (theo language hardcode `vi` trên Gateway). FE có thể hiển thị trực tiếp vào `NearbyPlace.category`. |
| `formattedAddress` | string | Có | Địa chỉ POI. Có thể ngắn hơn geocode; rỗng `""` nếu HTML không có — FE vẫn show `name`. |
| `lat` | number | Có | Vĩ độ POI — dùng fly-to khi OSA click PlaceCard. |
| `lng` | number | Có | Kinh độ POI. |
| `distanceMeters` | integer | Có | Khoảng cách ước lượng tâm → POI (mét), đường chim bay (haversine) trừ khi Gateway lấy được khoảng cách đường đi từ HTML. |
| `distanceKm` | number | Có | `distanceMeters / 1000`, làm tròn hợp lý (vd. 2 chữ số thập phân). Map trực tiếp `NearbyPlace.distanceKm`. |
| `imageUrl` | string \| null | Có (nullable) | URL ảnh nếu parse được; thường `null` với HTML bridge. FE dùng placeholder khi null. |
| `rating` | number \| null | Có (nullable) | Điểm đánh giá 0–5 nếu có; MVP cho phép `null`, UI không bắt buộc hiện. |
| `source` | string | Có | Luôn `"google_maps_html"` (đã chốt nguồn chỉ Google HTML). |

### 2.4. Response lỗi

| HTTP | `code` | Khi nào |
|------|--------|---------|
| 400 | `INVALID_COORDINATE` | Thiếu/sai kiểu `lat`/`lng`, hoặc NaN/out of range |
| 400 | `INVALID_RADIUS` | `radiusMeters` &lt; 100 hoặc &gt; 5000 |
| 400 | `INVALID_LIMIT` | `limit` ngoài [1, 20] |
| 400 | `INVALID_CATEGORY` | Phần tử `categories` không thuộc enum |
| 429 | `RATE_LIMITED` | Quá hạn mức |
| 502 | `PROVIDER_ERROR` | Scrape/parse fail |
| 504 | `PROVIDER_TIMEOUT` | Timeout |

> Không có POI hợp lệ trong bán kính → **200** + `places: []`, không phải 404.

### 2.5. Mapping sang FE `NearbyPlace`

| Output Gateway | `NearbyPlace` (FE) | Ghi chú |
|----------------|-------------------|---------|
| `placeId` | `id` | |
| `name` | `name` | |
| `categoryLabel` | `category` | Hoặc map icon theo `category` |
| `formattedAddress` | `address` | |
| `distanceKm` | `distanceKm` | |
| `imageUrl` ?? placeholder | `image` | |
| `[lat, lng]` | `position` | Tuple `[lat, lng]` |

**Hành vi BE đề xuất khi Gateway Nearby lỗi (5xx/429):** vẫn coi geocode sự cố **thành công**; ghi `nearbyPlaces = []`; log `requestId` — không fail cả UC-01.

---

## 3. Thứ tự gọi khuyến nghị (BE RSA)

| Bước | API | Bắt buộc cho UC-01? |
|:----:|-----|---------------------|
| 1 | `POST .../geocode` | **Có** — fail thì dừng, không ghim |
| 2 | Chọn 1 phần tử `results[]` | **Có** |
| 3 | `POST .../nearby` (song song warnings/flood) | **Không** — best effort |
| 4 | Patch Redis JourneyState + trả FE | Có |

---

## 4. Quyết định đã chốt

| # | Chủ đề | Quyết định |
|---|--------|------------|
| 1 | Nguồn `nearbyPlaces` | **Chỉ Google Maps HTML** qua Location Gateway — không CSDL RSA, không hybrid |
| 2 | Threshold `confidence` | **0.75** — `≥ 0.75` đủ điều kiện auto-pick |
| 3 | UX nhiều ứng viên geocode | **FE tự xử lý** (hiển thị / chọn ứng viên). Gateway/BE trả đủ `results[]` |
| 4 | Timeout Gateway | Geocode **4s**, Nearby **4s** |

> Còn lại (không blocking API contract): Auth Gateway (mTLS/API key), TTL cache Gateway nội bộ — do BE/infra quyết khi implement.
