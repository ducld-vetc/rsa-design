# Luồng tích hợp VETC ↔ Đối tác (Ford DMS) — Đánh giá sau sửa chữa

**Phiên bản:** 1.1  
**Tham chiếu API:** [Tasco-CRM-API.md](./Tasco-CRM-API.md) · PlantUML: [Tasco-CRM-integration-flow.puml](./Tasco-CRM-integration-flow.puml)

---

## 1. Nguyên tắc tích hợp (v1.1)

| Khía cạnh | Quyết định |
|-----------|------------|
| **Lấy danh sách báo cáo (API #1)** | **Không** gọi đối tác khi CSKH mở màn hình. **Job định kỳ 00:00 hàng ngày** gọi API #1 → lưu snapshot vào DB VETC. |
| **Màn hình báo cáo** | Chỉ đọc **DB VETC** (API nội bộ). Refresh UI = đọc lại DB, không hit Ford. |
| **Trạng thái / SLA / lần gọi** | **VETC quản lý** sau khi import (cập nhật khi CSKH submit đánh giá). |
| **Đối tác (Ford)** | Chỉ nhận **kết quả cuối** qua API #3 khi CSKH hoàn tất đánh giá — không đồng bộ trạng thái trung gian. |

```mermaid
flowchart TB
  subgraph Partner["Ford / Đối tác"]
    DMS[(Ford DMS)]
    API1["API #1 GET\n(danh sách R/O)"]
    API3["API #3 PUT\n(kết quả cuối)"]
    DMS --> API1
    API3 --> DMS
  end

  subgraph VETC["VETC"]
    JOB["Job 00:00 hàng ngày\nImport snapshot"]
    DB[(DB VETC\nrepair_order_snapshot\n+ evaluation)]
    UI["Web CRM\nBáo cáo + Đánh giá"]
    VAPI["VETC API"]
    OUT["Outbound Sync\n(chỉ kết quả cuối)"]
    JOB --> API1
    API1 --> JOB
    JOB --> DB
    UI --> VAPI
    VAPI --> DB
    VAPI --> OUT
    OUT --> API3
  end
```

---

## 2. Job import định kỳ — 00:00 hàng ngày

### 2.1 Lịch chạy

| Thuộc tính | Giá trị |
|------------|---------|
| Tên job | `post_service_import_partner_snapshot` |
| Cron | `0 0 * * *` (00:00 mỗi ngày, timezone `Asia/Ho_Chi_Minh`) |
| Nguồn | API #1 đối tác: `GET /repair-orders/pending-evaluation` |
| Đích | Bảng snapshot VETC (vd. `crm_repair_order_snapshot`) |

### 2.2 Phạm vi dữ liệu mỗi lần chạy

- `dateFrom` / `dateTo`: mặc định **T-30 → T** (có thể cấu hình theo `branchCode`).
- Phân trang: lặp đến hết `totalPages`.
- Mỗi `repairOrderNo`: **UPSERT** snapshot (thông tin xe, KH, km, ngày xe ra… từ Ford).
- Ghi log job: `import_batch_id`, `startedAt`, `finishedAt`, `recordsUpserted`, `status`.

### 2.3 Quy tắc merge với dữ liệu VETC đã xử lý

| Trường | Nguồn sau import |
|--------|------------------|
| Thông tin master R/O (biển số, KH, CVDV, ngày vào/ra…) | **Snapshot Ford** (ghi đè phần master) |
| `contactStatus`, Call 1–3, đánh giá, ghi chú CSKH | **Giữ bản VETC** nếu đã có `evaluation` — **không** ghi đè bởi snapshot |
| R/O mới (chưa có trên VETC) | Tạo dòng mới; `contactStatus` tính từ rule VETC (SLA 3 ngày) |

> Ford chỉ cung cấp **danh sách & dữ liệu gốc**; trạng thái vận hành CSKH là **single source of truth tại VETC**.

### 2.4 Sequence — Job 00:00

```mermaid
sequenceDiagram
  autonumber
  participant CRON as Scheduler 00:00
  participant JOB as Import Job VETC
  participant PAPI as Ford API
  participant DMS as Ford DMS
  participant DB as DB VETC

  CRON->>JOB: Trigger hàng ngày
  JOB->>DB: BEGIN import_batch
  loop Theo page / branchCode
    JOB->>PAPI: GET pending-evaluation
    PAPI->>DMS: Query R/O
    DMS-->>PAPI: items[]
    PAPI-->>JOB: 200
    JOB->>DB: UPSERT snapshot\n(không ghi đè evaluation VETC)
  end
  JOB->>DB: COMMIT batch SUCCESS
```

---

## 3. Luồng CSKH — Đọc DB VETC (không gọi Ford)

```mermaid
sequenceDiagram
  autonumber
  actor CSKH as CSKH
  participant UI as Web CRM
  participant VAPI as VETC API
  participant DB as DB VETC

  CSKH->>UI: Mở Báo cáo / Lọc / Refresh
  UI->>VAPI: GET /internal/post-service/repair-orders\n?page&contactStatus&dateFrom
  Note over VAPI,DB: Chỉ SELECT DB VETC
  VAPI->>DB: JOIN snapshot + evaluation
  DB-->>VAPI: items + contactStatus (VETC)
  VAPI-->>UI: 200
  UI-->>CSKH: Bảng báo cáo + SLA

  CSKH->>UI: Đánh giá KH → Lưu
  UI->>VAPI: POST /evaluations
  VAPI->>DB: UPDATE evaluation,\ncontactStatus, calls
  VAPI-->>UI: SAVED
  UI-->>CSKH: Cập nhật dòng (từ DB)
```

**Lưu ý UI:** Nút **Refresh** chỉ tải lại dữ liệu DB; hiển thị `lastImportAt` (thời điểm job 00:00 gần nhất).

---

## 4. Đồng bộ kết quả cuối sang Ford (API #3)

Chỉ khi CSKH **Lưu** đánh giá thành công → queue **một lần** PUT kết quả cuối.

```mermaid
sequenceDiagram
  autonumber
  participant VAPI as VETC API
  participant DB as DB VETC
  participant OUT as Outbound Sync
  participant PAPI as Ford API
  participant DMS as Ford DMS

  VAPI->>DB: evaluation SAVED
  VAPI->>OUT: Enqueue (evaluationId)
  OUT->>PAPI: PUT /repair-orders/{ro}/evaluation\ncontacts + criteria + overallRating
  PAPI->>DMS: Ghi kết quả cuối
  DMS-->>PAPI: partnerRecordId
  PAPI-->>OUT: 200
  OUT->>DB: syncStatus=SYNCED
```

Ford **không** nhận: trạng thái `CAN_GOI_LAI`, draft Call 2, SLA nội bộ — chỉ bản **hoàn tất** CSKH gửi.

---

## 5. Retry đồng bộ kết quả (API #3)

```mermaid
sequenceDiagram
  autonumber
  participant OUT as Outbound Sync
  participant PAPI as Ford API
  participant DB as DB VETC
  participant OPS as Vận hành

  OUT->>PAPI: PUT evaluation
  alt 200 OK
    PAPI-->>OUT: synced
    OUT->>DB: syncStatus=SYNCED
  else 5xx / timeout
    PAPI-->>OUT: 503
    OUT->>DB: PENDING, retry backoff
  else 422
    PAPI-->>OUT: validation
    OUT->>DB: syncStatus=FAILED
    OUT->>OPS: Alert
  end
```

---

## 6. Phân vai trách dữ liệu

| Dữ liệu | Master | Ghi chú |
|---------|--------|---------|
| Danh sách R/O, thông tin xe/KH từ xưởng | Import Ford @ 00:00 → snapshot VETC | Cập nhật 1 lần/ngày |
| `contactStatus`, SLA, quá hạn | **VETC** | Tính/cập nhật khi CSKH làm việc |
| Call 1–3, ghi chú, tiêu chí 01–04 | **VETC** (`evaluation`) | Submit API #2 |
| Kết quả trên Ford DMS | **Ford** (sau API #3) | Chỉ bản cuối đã SYNCED |

---

## 7. Trạng thái đồng bộ sang Ford (`syncStatus`)

```mermaid
stateDiagram-v2
  [*] --> PENDING: POST evaluations OK
  PENDING --> SYNCED: PUT Ford 200
  PENDING --> FAILED: 422 / hết retry
  FAILED --> PENDING: retry-sync thủ công
  SYNCED --> [*]
```

*(Khác với `contactStatus` — chỉ dùng nội bộ VETC, không đẩy Ford.)*

---

## 8. API nội bộ VETC (màn hình)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/v1/internal/post-service/repair-orders` | Danh sách báo cáo từ DB (snapshot + evaluation) |
| GET | `/api/v1/internal/post-service/repair-orders/{repairOrderNo}` | Chi tiết 1 R/O cho panel đánh giá |
| POST | `/api/v1/post-service/evaluations` | Submit đánh giá (API #2) |
| GET | `/api/v1/internal/post-service/import-batches/latest` | Thời điểm import 00:00 gần nhất |

---

## 9. Checklist tích hợp

| Hạng mục | Ford | VETC |
|----------|------|------|
| API #1 GET danh sách | ✓ expose | Job 00:00 gọi, **không** gọi từ UI |
| Lưu snapshot DB | — | ✓ UPSERT + merge rule |
| API đọc báo cáo | — | ✓ internal GET từ DB |
| Quản lý trạng thái / SLA | — | ✓ |
| API #2 submit | — | ✓ |
| API #3 chỉ kết quả cuối | ✓ nhận PUT | ✓ outbound sau Lưu |
| Idempotency PUT | ✓ | ✓ |

PlantUML: [Tasco-CRM-integration-flow.puml](./Tasco-CRM-integration-flow.puml)
