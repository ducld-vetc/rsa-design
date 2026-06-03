# API — Tasco CRM · Đánh giá khách hàng sau sửa chữa (VETC ↔ Đối tác)

**Phiên bản:** 1.1  
**Tham chiếu UI:** `pages/crm-preview/` · Màn **Báo cáo chi tiết xe dịch vụ** + panel **Đánh giá KH**  
**Đối tác mẫu:** Ford DMS (Tasco / Sài Gòn Ford)

---

## 1. Tổng quan tích hợp

| # | API | Hướng | Cách dùng (v1.1) |
|---|-----|--------|------------------|
| 1 | **Lấy danh sách cần gọi đánh giá** | **Ford expose → VETC gọi** | **Job 00:00 hàng ngày** import vào DB VETC — **không** gọi khi mở màn hình |
| 2 | **Submit đánh giá** | **VETC** | CSKH lưu vào DB VETC; **VETC quản lý** trạng thái, SLA, lần gọi |
| 3 | **Đồng bộ sang đối tác** | **VETC → Ford** | Chỉ **kết quả cuối** sau khi Lưu — Ford không nhận trạng thái trung gian |

**Màn hình báo cáo:** `GET` API **nội bộ VETC** đọc DB (snapshot + evaluation).  
**Luồng:** [Tasco-CRM-integration-flow.md](./Tasco-CRM-integration-flow.md) · [Tasco-CRM-integration-flow.puml](./Tasco-CRM-integration-flow.puml)

### 1.1 Job import định kỳ (API #1)

| Thuộc tính | Giá trị |
|------------|---------|
| Lịch | `0 0 * * *` — **00:00** mỗi ngày (`Asia/Ho_Chi_Minh`) |
| Hành động | Gọi API #1 toàn bộ page → UPSERT `crm_repair_order_snapshot` |
| Merge | Không ghi đè `evaluation` / `contactStatus` đã do CSKH cập nhật trên VETC |

### 1.2 Trách nhiệm dữ liệu

| Dữ liệu | Bên quản lý |
|---------|-------------|
| Master R/O (xe, KH, ngày vào/ra…) | Snapshot từ Ford (import đêm) |
| Trạng thái liên hệ, SLA, Call 1–3, đánh giá chi tiết | **VETC** |
| Bản ghi đánh giá trên Ford DMS | Ford (sau API #3 thành công) |

---

## 2. Quy ước chung

### 2.1 Base URL

| Môi trường | Đối tác (API #1 — đối tác host) | VETC (API #2, #3 — VETC host) |
|------------|----------------------------------|-------------------------------|
| DEV | `https://api-dev.partner.example.com` | `https://api-dev.vetc.example.com/rsa-crm` |
| PROD | `https://api.partner.example.com` | `https://api.vetc.example.com/rsa-crm` |

### 2.2 Xác thực

| Header | Bắt buộc | Mô tả |
|--------|----------|--------|
| `Authorization` | Có | `Bearer {access_token}` (OAuth2 client credentials hoặc JWT) |
| `X-Request-Id` | Khuyến nghị | UUID — trace log 2 bên |
| `X-Branch-Code` | Có (API #1) | Mã đại lý / chi nhánh (vd. `SGF-CT`) |
| `Content-Type` | Có (body) | `application/json` |
| `Accept-Language` | Không | `vi` (mặc định) \| `en` |

### 2.3 Định dạng dữ liệu

- **Ngày:** `YYYY-MM-DD` (API); UI hiển thị `DD/MM/YYYY`.
- **Giờ:** `HH:mm` (24h).
- **Datetime:** ISO-8601 `YYYY-MM-DDTHH:mm:ss+07:00`.
- **Số điện thoại:** Chuỗi, giữ prefix `0` hoặc `84`.
- **Phân trang:** `page` (1-based), `pageSize` (mặc định 50, max 200).

### 2.4 Response envelope (VETC & khuyến nghị đối tác)

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": { },
  "meta": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 341,
    "totalPages": 7
  },
  "errors": null
}
```

Lỗi:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "requestId": "...",
  "data": null,
  "errors": [
    { "field": "contacts[0].reason", "code": "REQUIRED", "message": "Lý do bắt buộc khi liên hệ thành công" }
  ]
}
```

### 2.5 Mã trạng thái tổng hợp (`contactStatus`)

Map từ logic preview (`getTascoContactStatus`):

| Mã | Nhãn UI | Ý nghĩa |
|----|---------|---------|
| `CHUA_LIEN_HE` | Chưa liên hệ | Chưa có Call 1 / chưa ghi kết quả |
| `CAN_GOI_LAI` | Cần gọi lại | LH không thành công, không nhấc máy, yêu cầu gọi lại |
| `HOAN_THANH` | Đã hài lòng | LH thành công hoặc đã có đánh giá tổng thể |
| `QUA_HAN` | Quá hạn SLA | Quá `slaDaysAfterExit` ngày kể từ ngày xe ra, chưa Call 1 |

**SLA mặc định:** `slaDaysAfterExit = 3` (cấu hình theo đại lý).

---

## 3. API #1 — Lấy danh sách cần thực hiện gọi đánh giá (Ford cung cấp)

Ford expose endpoint; **VETC chỉ gọi qua Job import 00:00 hàng ngày** — lưu snapshot DB. **Không** gọi từ UI/CSKH.

### 3.1 Endpoint

```
GET /api/v1/post-service/repair-orders/pending-evaluation
```

### 3.2 Query parameters

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|--------|
| `dateFrom` | date | Có | Ngày xe ra / nghiệm thu từ (inclusive) |
| `dateTo` | date | Có | Đến ngày (inclusive) |
| `branchCode` | string | Có | Mã chi nhánh đại lý |
| `contactStatus` | enum | Không | Lọc: `CHUA_LIEN_HE`, `CAN_GOI_LAI`, `HOAN_THANH`, `QUA_HAN` |
| `licensePlate` | string | Không | Lọc biển số (contains) |
| `repairOrderNo` | string | Không | Lọc số R/O |
| `page` | int | Không | Trang, mặc định 1 |
| `pageSize` | int | Không | Mặc định 50 |

### 3.3 Response `data.items[]`

| Field | Kiểu | Mô tả | Cột UI báo cáo |
|-------|------|--------|----------------|
| `repairOrderNo` | string | Số R/O (PK nghiệp vụ) | Số R/O |
| `entryDate` | date | Ngày vào xưởng | Ngày vào |
| `licensePlate` | string | Biển kiểm soát | Biển kiểm soát |
| `customerName` | string | Tên khách hàng | Tên khách hàng |
| `customerAddress` | string | Địa chỉ | Địa chỉ |
| `repairSummary` | string | Nội dung sửa chữa | Nội dung sửa chữa |
| `contactPerson` | string | Người liên lạc | Người liên lạc |
| `contactPhone` | string | ĐT người liên lạc | ĐT người liên lạc |
| `vehicleModel` | string | Loại xe | Loại xe |
| `mileage` | number | Số km hiện tại | Số Km |
| `mileagePrevious` | number | Số km cũ | Số Km cũ |
| `mileageAppointment` | number | Số km hẹn | Số Km hẹn |
| `acceptanceDate` | date | Ngày nghiệm thu | Ngày nghiệm thu |
| `vehicleExitDate` | date | Ngày xe ra | Ngày xe ra |
| `chassisNo` | string | Số khung | Số khung |
| `engineNo` | string | Số máy | — |
| `vehicleColor` | string | Màu xe | — |
| `repairOrderType` | string | Loại lệnh SC (`BD`, `SCC`, `KTRA`…) | Loại lệnh SC |
| `serviceAdvisorCode` | string | Mã CVDV | — |
| `serviceAdvisorName` | string | Tên CVDV | CVDV |
| `careStaffName` | string | Người chăm sóc | Người chăm sóc |
| `customerPhone` | string | ĐT khách hàng | ĐT khách hàng |
| `isUsedCar` | boolean | Xe cũ | Xe cũ |
| `jobContent` | string | Nội dung CV | Nội dung CV |
| `comment` | string | Comment | Comment |
| `contactStatus` | enum | Trạng thái Tasco (mục 2.5) | Trạng thái Tasco |
| `slaDueDate` | date | Hạn gọi Call 1 (= exit + SLA ngày) | — |
| `calls` | array | Tối đa 3 phần tử (xem 3.4) | Call 1–3, ghi chú |
| `overallRating` | string | Đánh giá KH đã có trên DMS (nếu có) | Đánh giá KH |
| `lastContactResult` | enum | Kết quả LH gần nhất | Kết quả liên hệ |
| `lastContactReason` | enum | Lý do LH | Lý do liên hệ |
| `partnerUpdatedAt` | datetime | Thời điểm DMS cập nhật | — |

#### 3.4 Object `calls[]`

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `attemptNo` | int | 1 \| 2 \| 3 |
| `callDate` | date | Ngày gọi (null nếu chưa gọi) |
| `callTime` | string | Giờ gọi |
| `result` | enum | `CONTACT_SUCCESS`, `CONTACT_FAILED`, `NO_CONTACT` |
| `reason` | enum | `SATISFIED`, `NO_ANSWER`, `CALLBACK_REQUEST`, `OTHER` |
| `note` | string | Diễn giải / ghi chú lần N |

**Map hiển thị UI (đối tác có thể trả text tiếng Việt thay enum):**

| API `result` | UI |
|--------------|-----|
| `CONTACT_SUCCESS` | L/H Thành công |
| `CONTACT_FAILED` | L/H không thành công |
| `NO_CONTACT` | Không liên hệ |

### 3.5 Ví dụ request

```http
GET /api/v1/post-service/repair-orders/pending-evaluation?dateFrom=2026-05-01&dateTo=2026-05-26&branchCode=SGF-CT&contactStatus=QUA_HAN&page=1&pageSize=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Branch-Code: SGF-CT
X-Request-Id: 7c9e6679-7425-40de-944b-e07fc1f90ae7
```

### 3.6 Ví dụ response (rút gọn)

```json
{
  "success": true,
  "code": "OK",
  "data": {
    "summary": {
      "HOAN_THANH": 120,
      "CAN_GOI_LAI": 45,
      "CHUA_LIEN_HE": 89,
      "QUA_HAN": 87
    },
    "items": [
      {
        "repairOrderNo": "11.26S003233",
        "entryDate": "2026-04-28",
        "licensePlate": "51E20855",
        "customerName": "HUỲNH THỊ XUÂN TRÂM",
        "customerAddress": "145 đường 320 Bông Sao, Phường Chánh Hưng, TP.HCM",
        "repairSummary": "Kiểm tra hụt ga, bảo dưỡng",
        "contactPerson": "Anh Phi",
        "contactPhone": "0335247417",
        "vehicleModel": "Transit LX",
        "mileage": 196799,
        "acceptanceDate": "2026-05-04",
        "vehicleExitDate": "2026-05-04",
        "chassisNo": "RL3MLTGMCGER44741",
        "serviceAdvisorName": "Đỗ Hoàng Lĩnh",
        "careStaffName": "Tasco Demo",
        "contactStatus": "HOAN_THANH",
        "slaDueDate": "2026-05-07",
        "calls": [
          {
            "attemptNo": 1,
            "callDate": "2026-05-07",
            "callTime": "08:53",
            "result": "CONTACT_SUCCESS",
            "reason": "SATISFIED",
            "note": "Anh Phi bảo vụ hụt ga cần theo dõi thêm, còn lại hài lòng"
          }
        ],
        "overallRating": "SATISFIED",
        "lastContactResult": "CONTACT_SUCCESS",
        "lastContactReason": "SATISFIED",
        "partnerUpdatedAt": "2026-05-07T09:00:00+07:00"
      }
    ]
  },
  "meta": { "page": 1, "pageSize": 50, "totalItems": 341, "totalPages": 7 }
}
```

### 3.7 Mã lỗi thường gặp (đối tác)

| HTTP | code | Mô tả |
|------|------|--------|
| 400 | `INVALID_DATE_RANGE` | `dateFrom` > `dateTo` hoặc khoảng > 93 ngày |
| 401 | `UNAUTHORIZED` | Token hết hạn / sai |
| 403 | `BRANCH_FORBIDDEN` | Chi nhánh không thuộc quyền token |
| 429 | `RATE_LIMIT` | Vượt giới hạn (khuyến nghị 60 req/phút/branch) |
| 503 | `PARTNER_UNAVAILABLE` | DMS bảo trì |

---

## 4. API #2 — Submit đánh giá (VETC)

CSKH lưu panel **Đánh giá khách hàng sau sửa chữa** trên VETC. Dữ liệu lưu **DB VETC** trước; trigger đồng bộ API #3.

### 4.1 Endpoint

```
POST /api/v1/post-service/evaluations
```

**Idempotency:** Header `Idempotency-Key: {uuid}` — cùng key + cùng body → trả lại kết quả lần đầu (khuyến nghị 24h).

### 4.2 Request body

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|--------|
| `repairOrderNo` | string | Có | Số R/O (khớp API #1) |
| `branchCode` | string | Có | Chi nhánh |
| `submittedBy` | string | Có | User CSKH (username) |
| `contactChannel` | enum | Có | `PHONE`, `SMS`, `ZALO`, `EMAIL`, `IN_PERSON` |
| `overallRating` | enum | Điều kiện | `SATISFIED`, `NORMAL`, `UNSATISFIED`, `NOT_RATED` — bắt buộc nếu `vehicleDelivered=true` |
| `vehicleDelivered` | boolean | Có | Đã giao xe |
| `vrcCode` | string | Không | Mã VRC |
| `contacts` | array | Có | ≥ 1 lần liên hệ (tối đa 3) |
| `criteria` | array | Điều kiện | 4 tiêu chí — bắt buộc đủ rating khi `overallRating=SATISFIED` |

#### 4.2.1 `contacts[]`

| Field | Kiểu | Bắt buộc | Rule |
|-------|------|----------|------|
| `attemptNo` | int | Có | 1, 2, 3 |
| `callDate` | date | Có* | Bắt buộc nếu có ghi nhận lần gọi |
| `callTime` | string | Không | |
| `result` | enum | Có* | `CONTACT_SUCCESS`, `CONTACT_FAILED`, `NO_CONTACT` |
| `reason` | enum | Điều kiện | Bắt buộc khi `result=CONTACT_SUCCESS` |
| `note` | string | Không | Max 2000 ký tự |

**Rule nghiệp vụ (khớp UI):**

- Lần 2 chỉ hợp lệ khi lần 1 đã có `callDate` và `result` ≠ `CONTACT_SUCCESS`.
- Lần 3 tương tự so với lần 2.
- Không cho phép thêm lần sau khi đã `CONTACT_SUCCESS` ở lần trước.

#### 4.2.2 `criteria[]`

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `code` | string | `01`–`04` (CVDV, chất lượng DV, tiếp nhận xe, cam kết) |
| `rating` | enum | `STAR_5` … `STAR_1`, `NOT_RATED` |
| `note` | string | Ghi chú tiêu chí |

### 4.3 Response `data`

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `evaluationId` | string (UUID) | ID bản ghi VETC |
| `repairOrderNo` | string | |
| `status` | enum | `SAVED` |
| `syncStatus` | enum | `PENDING` \| `SYNCED` \| `FAILED` — trạng thái hàng đợi API #3 |
| `submittedAt` | datetime | |

### 4.4 Ví dụ request

```json
{
  "repairOrderNo": "11.26S003233",
  "branchCode": "SGF-CT",
  "submittedBy": "cskh.nguyen",
  "contactChannel": "PHONE",
  "overallRating": "SATISFIED",
  "vehicleDelivered": true,
  "contacts": [
    {
      "attemptNo": 1,
      "callDate": "2026-05-07",
      "callTime": "08:53",
      "result": "CONTACT_SUCCESS",
      "reason": "SATISFIED",
      "note": "Anh Phi bảo vụ hụt ga cần theo dõi thêm, còn lại hài lòng"
    }
  ],
  "criteria": [
    { "code": "01", "rating": "STAR_5", "note": "" },
    { "code": "02", "rating": "STAR_5", "note": "" },
    { "code": "03", "rating": "STAR_4", "note": "" },
    { "code": "04", "rating": "STAR_5", "note": "" }
  ]
}
```

### 4.5 Ví dụ response

```json
{
  "success": true,
  "code": "OK",
  "data": {
    "evaluationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "repairOrderNo": "11.26S003233",
    "status": "SAVED",
    "syncStatus": "PENDING",
    "submittedAt": "2026-05-07T10:15:00+07:00"
  }
}
```

### 4.6 Mã lỗi validation

| code | Mô tả |
|------|--------|
| `RO_NOT_FOUND` | R/O không có trong snapshot API #1 |
| `CONTACT_REQUIRED` | Chưa có lần liên hệ nào |
| `CONTACT_SEQUENCE_INVALID` | Vi phạm thứ tự lần 2/3 |
| `REASON_REQUIRED` | Thiếu lý do khi thành công |
| `CRITERIA_INCOMPLETE` | Thiếu tiêu chí khi KH hài lòng |
| `OVERALL_RATING_REQUIRED` | Xe đã giao nhưng chưa đánh giá tổng thể |

---

## 5. API #3 — Đồng bộ dữ liệu sang đối tác (VETC → Đối tác)

Sau API #2, **worker VETC** đẩy **kết quả cuối** về Ford DMS. Không đồng bộ trạng thái trung gian (`contactStatus`, draft call…) — Ford chỉ cần bản hoàn tất CSKH.

**Hai mô hình triển khai** (chọn một với đối tác):

| Mô hình | Endpoint | Ghi chú |
|---------|----------|---------|
| **A — Đối tác nhận push** | `PUT /api/v1/post-service/repair-orders/{repairOrderNo}/evaluation` (host **đối tác**) | Khuyến nghị |
| **B — VETC webhook hub** | `POST /api/v1/post-service/evaluations/{evaluationId}/sync` (host **VETC**, VETC gọi ra) | Dùng khi đối tác chỉ cung cấp URL callback |

Tài liệu dưới mô tả **mô hình A** (phổ biến với DMS Tasco).

### 5.1 Endpoint (đối tác host)

```
PUT /api/v1/post-service/repair-orders/{repairOrderNo}/evaluation
```

### 5.2 Headers (VETC gửi sang đối tác)

| Header | Mô tả |
|--------|--------|
| `Authorization` | Bearer token do đối tác cấp cho VETC |
| `X-VETC-Evaluation-Id` | UUID từ API #2 |
| `X-Sync-Attempt` | Số lần retry (1, 2, 3…) |
| `Idempotency-Key` | `{evaluationId}` |

### 5.3 Request body

Cùng cấu trúc nghiệp vụ API #2, bổ sung metadata đồng bộ:

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `evaluationId` | string | ID VETC |
| `repairOrderNo` | string | |
| `branchCode` | string | |
| `submittedBy` | string | |
| `submittedAt` | datetime | |
| `contactChannel` | enum | |
| `overallRating` | enum | |
| `vehicleDelivered` | boolean | |
| `contacts` | array | |
| `criteria` | array | |
| `source` | string | Cố định `VETC_CRM` |

### 5.4 Response đối tác (thành công)

```json
{
  "success": true,
  "code": "OK",
  "data": {
    "repairOrderNo": "11.26S003233",
    "partnerRecordId": "TASCO-EVAL-998877",
    "syncedAt": "2026-05-07T10:15:05+07:00"
  }
}
```

VETC cập nhật `syncStatus=SYNCED`, lưu `partnerRecordId`.

### 5.5 Retry & hàng đợi (phía VETC)

| Lần | Khoảng cách | Hành động |
|-----|-------------|-----------|
| 1 | Ngay sau API #2 | Gọi PUT đối tác |
| 2–4 | Exponential backoff 1m, 5m, 15m | Retry nếu 5xx / timeout |
| 5+ | — | `syncStatus=FAILED`, alert vận hành; CSKH vẫn thấy `SAVED` trên VETC |

**API nội bộ VETC (ops):** `POST /api/v1/post-service/evaluations/{evaluationId}/retry-sync` — đẩy lại thủ công.

### 5.6 Mã lỗi đối tác

| HTTP | code | Xử lý VETC |
|------|------|------------|
| 404 | `RO_NOT_FOUND_ON_PARTNER` | Không retry; báo master data lệch |
| 409 | `ALREADY_SYNCED` | Coi như thành công (idempotent) |
| 422 | `PARTNER_VALIDATION` | Ghi log, không retry vô hạn |
| 503 | `PARTNER_BUSY` | Retry |

---

## 6. Bảng ánh xạ UI ↔ API

| Thao tác UI | API / Nguồn |
|-------------|-------------|
| Mở màn báo cáo / Refresh | **VETC internal GET** `/internal/post-service/repair-orders` (DB) |
| Lọc tab trạng thái / biển số | Query DB — `contactStatus` do **VETC** tính/lưu |
| Hiển thị “Cập nhật lúc” | `GET /internal/post-service/import-batches/latest` |
| Double-click / Đánh giá KH | **GET** detail từ DB theo `repairOrderNo` |
| Lưu panel đánh giá | **#2 POST** evaluations → DB VETC |
| Sau Lưu thành công | **#3 PUT** Ford (async) — **chỉ kết quả cuối** |
| Job 00:00 (backend) | **#1 GET** pending-evaluation → UPSERT snapshot |

---

## 6.1 API nội bộ VETC (đọc báo cáo từ DB)

```
GET /api/v1/internal/post-service/repair-orders
```

Query: `dateFrom`, `dateTo`, `branchCode`, `contactStatus`, `licensePlate`, `repairOrderNo`, `page`, `pageSize`  
Response: cùng cấu trúc `PendingEvaluationItem` (mục 3.3) + trường VETC:

| Field | Mô tả |
|-------|--------|
| `contactStatus` | Trạng thái do **VETC** quản lý |
| `evaluationId` | Có nếu đã submit |
| `syncStatus` | `PENDING` \| `SYNCED` \| `FAILED` (đồng bộ Ford) |
| `lastImportAt` | Thời điểm snapshot từ job 00:00 |
| `lastEvaluatedAt` | CSKH lưu đánh giá gần nhất |

```
GET /api/v1/internal/post-service/import-batches/latest?branchCode=SGF-CT
```

```json
{
  "success": true,
  "data": {
    "importBatchId": "uuid",
    "status": "SUCCESS",
    "startedAt": "2026-06-04T00:00:05+07:00",
    "finishedAt": "2026-06-04T00:02:18+07:00",
    "recordsUpserted": 341
  }
}
```

---

## 7. Bảo mật & tuân thủ

- Chỉ truyền PII cần thiết (tên, SĐT, địa chỉ, biển số, số khung).
- Log mask SĐT: `0335***417`.
- HTTPS TLS 1.2+; IP allowlist hai chiều (tùy hợp đồng).
- Retention đánh giá: theo chính sách VETC & đại lý (khuyến nghị ≥ 24 tháng).

---

## 8. OpenAPI

File machine-readable: [Tasco-CRM-openapi.yaml](./Tasco-CRM-openapi.yaml)

---

## 9. Lịch sử thay đổi

| Version | Ngày | Nội dung |
|---------|------|----------|
| 1.0 | 2026-06-03 | Draft từ web preview Tasco CRM |
| 1.1 | 2026-06-04 | API #1 job 00:00; UI đọc DB VETC; Ford chỉ nhận kết quả cuối (API #3) |
