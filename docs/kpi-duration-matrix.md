# Ma trận KPI / SLA — `kpi_duration` theo state & đối tượng

**Nguồn chính thức:** [Google Sheets — KPI Duration](https://docs.google.com/spreadsheets/d/1vja3aMeko8mAvnkYHKymkR0ngxp-OZcP99kh4H2eLEk/edit?gid=0#gid=0)  
**Bản sao trong repo:** [kpi-duration-matrix.csv](./kpi-duration-matrix.csv) (đồng bộ 2026-05)  
**BRD:** [BRD-Giam-sat-cuu-ho-Tong-quan.md](./BRD-Giam-sat-cuu-ho-Tong-quan.md)

---

## 1. Quyết định nghiệp vụ đã chốt (PO/BA)

| # | Nội dung | Quyết định |
|---|----------|------------|
| 1 | Trạng thái kết thúc | `ro.status = 'COMPLETED'` → **Hoàn thành**; `ro.status = 'CANCELLED'` → **Huỷ** |
| 2 | Master ngưỡng | Import từ Google Sheets → **`kpi_sla_config_*` trên DB master** (chỉnh qua UI/API) |
| 3 | Kéo xe / Tại chỗ | **Ngưỡng khác nhau** — chi tiết §3–§5 (từ sheet) |
| 4 | `WAITING_DRIVER_ACCEPT` | **Gộp** thẻ **Điều phối** (cùng `WAITING_PROVIDER_ACCEPT`) |
| 5 | CSAT | `rescue_order_rate` JOIN `rescue_order_v2_id` WHERE **`type = 1`** |
| 6 | Đơn không xác định SLA | Tách bucket **Không tính SLA** — **loại** khỏi mẫu số % SLA |
| 7 | `DRAFT` | **Có** trong **Tổng đơn**; **không** tính vào SLA |

---

## 2. Phân loại đơn (ảnh hưởng ngưỡng)

```sql
loai_ho_tro := CASE
  WHEN ro.rescue_distance > 0 THEN 'KEO_XE'
  ELSE 'TAI_CHO'
END;
```

| Loại | Điều kiện | SLA tổng (sheet) | Ghi chú |
|------|-----------|-------------------|---------|
| **Hỗ trợ tại chỗ** | `rescue_distance <= 0` hoặc NULL | ≤ **60 phút** (3600 giây) | End-to-end §VIII |
| **Kéo xe** | `rescue_distance > 0` | ≤ **120 phút** (7200 giây) | End-to-end §VIII |

---

## 3. Bảng ngưỡng SLA — Dispatch (từ sheet)

Đơn vị cột **SLA** trên sheet: **giây** (quy đổi phút = `SLA / 60`).

| KPI Name | Pre → After | `state` (history SUM) | Đối tượng | SLA (giây) | SLA (phút) | `kpi_column` SQL |
|----------|-------------|----------------------|-----------|------------|------------|----------------|
| Tổng đài xác nhận đơn | `WAITING_CONFIRM` → `CONFIRMED` | `DRAFT`, `WAITING_CONFIRM` | CSKH | 60 | 1 | `TAO_DON` |
| Điều phối Provider | `CONFIRMED` → `WAITING_PROVIDER_ACCEPT` | `CONFIRMED` (+ một phần điều phối) | OSA | 480 | 8 | `XAC_NHAN` / transition* |
| Provider phản hồi | tại `WAITING_PROVIDER_ACCEPT` | `WAITING_PROVIDER_ACCEPT` | PROVIDER | 180 | 3 | `DIEU_PHOI` |
| Tài xế nhận đơn | `WAITING_DRIVER_ACCEPT` → `DRIVER_ON_THE_WAY` | `WAITING_DRIVER_ACCEPT` | DRIVER | 300 | 5 | `TAI_XE_TIEP_NHAN` |

\* SQL hiện tại gom theo **state**, không theo transition. Dev map: so sánh `TAO_DON` với 1 phút; `DIEU_PHOI` với 3 phút; `TAI_XE_TIEP_NHAN` với 5 phút (sheet) hoặc 2 phút (tóm tắt cột phụ — **ưu tiên giá trị bảng cấu hình** sau khi PO nhập trên `kpi_sla_config_rule` (DB master).

**Tóm tắt nhanh (cột phụ sheet):**

| Bước | SLA |
|------|-----|
| `WAITING_CONFIRM` → `CONFIRMED` | ≤ 60 giây |
| `CONFIRMED` → `WAITING_PROVIDER_ACCEPT` | ≤ 3 phút |
| `WAITING_PROVIDER_ACCEPT` (báo giá) | ≤ 3 phút |
| `WAITING_DRIVER_ACCEPT` | ≤ 2 phút |

---

## 4. Bảng ngưỡng — Execution (Tại chỗ / Kéo xe)

### 4.1 ETA tới hiện trường (`DRIVER_ON_THE_WAY` → `RESCUE_IN_PROGRESS`)

| Vùng (PA) | SLA (giây) | SLA (phút) | `kpi_column` |
|-----------|------------|------------|--------------|
| PA1 — Nội đô | 1800 | 30 | `DI_CHUYEN_TOI_DIEM` |
| PA2 — Cao tốc | 2400 | 45 | `DI_CHUYEN_TOI_DIEM` |
| PA3 — Ngoại thành/tỉnh | 3600 | 60 | `DI_CHUYEN_TOI_DIEM` |

**Điều kiện chọn PA:** Theo trường đơn (vd. `priority_area` / `zone_type` — PO bổ sung tên cột DB).

### 4.2 Xử lý tại hiện trường (`RESCUE_IN_PROGRESS`)

| Mức nguy hiểm | Hướng kết thúc | SLA (giây) | Phút |
|---------------|----------------|------------|------|
| 1 | `RESCUE_COMPLETED_BY_DRIVER` (tại chỗ) | 1800 | 30 |
| 1 | `RESCUE_MOVE_TO_TOWING_POINT` (kéo) | 1800 | 30 |
| 2 | Hoàn thành tại chỗ | 2400 | 40 |
| 2 | Chuyển kéo | 2400 | 40 |
| 3 | Hoàn thành tại chỗ | 3600 | 60 |
| 3 | Chuyển kéo | 3600 | 60 |

**SQL:** `THUC_HIEN_CUU_HO` — so ngưỡng theo `danger_level` + `loai_ho_tro`.

**Tóm tắt sheet (mục IV):**

| Loại sự cố | SLA xử lý |
|------------|-----------|
| Mức 1 — Nguy hiểm (tai nạn) | ≤ 45 phút |
| Mức 2 — Kỹ thuật nặng | ≤ 30 phút |
| Mức 3 — Kỹ thuật nhẹ | ≤ 15 phút |

### 4.3 Kéo xe về gara (`RESCUE_MOVE_TO_TOWING_POINT`) — **chỉ Kéo xe**

| Khoảng cách kéo | SLA (giây) | Phút | Tính SLA? |
|-----------------|------------|------|-----------|
| ≤ 10 km | 1800 | 30 | Có |
| ≤ 30 km | 3600 | 60 | Có |
| **> 30 km** | — | theo ETA thực tế | **Không** — `sla_eligible = false` |

**SQL:** `THOI_GIAN_KEO_XE` — chọn ngưỡng theo bucket km.

### 4.4 OSA xác nhận hoàn thành

| Bước | State | SLA (giây) | Phút | `kpi_column` |
|------|-------|------------|------|--------------|
| Driver hoàn thành → OSA đóng | `RESCUE_COMPLETED_BY_DRIVER` → `COMPLETED` | 300 | 5 | `OSA_HOAN_THANH` |

---

## 5. SLA End-to-End (so sánh tổng thời gian đơn)

| Loại ca | SLA sheet (giây) | Phút | Điều kiện |
|---------|------------------|------|-----------|
| Xử lý tại chỗ | 3600 | 60 | `TAI_CHO` |
| Kéo xe về gara | 7200 | 120 | `KEO_XE` |

```sql
SLA_TONG_actual := /* SUM các mốc áp dụng HOẶC created_at → completed_at */;
SLA_TONG_met := (loai_ho_tro = 'TAI_CHO' AND SLA_TONG_actual <= 60)
             OR (loai_ho_tro = 'KEO_XE' AND SLA_TONG_actual <= 120);
```

---

## 6. Đơn **không tính SLA** (`sla_eligible = false`)

Loại khỏi mẫu số **SLA Tổng quát**, KPI trạm/tài xế theo SLA; vẫn có thể hiển thị ở **Tổng đơn** / báo cáo riêng.

| Điều kiện | Lý do |
|-----------|--------|
| `ro.status = 'CANCELLED'` | Đơn huỷ |
| `ro.state = 'DRAFT'` only / chưa qua xác nhận | Chưa vào luồng SLA (§7) |
| Kéo xe **> 30 km** | Sheet: *Không tính* — theo ETA thực tế |
| Thiếu `danger_level` khi `state = RESCUE_IN_PROGRESS` | Không chọn được ngưỡng mức 1/2/3 |
| Thiếu `priority_area` (PA) khi tính ETA đến hiện trường | Không chọn PA1/2/3 |
| Đơn test / flag nội bộ | Cấu hình |

```sql
sla_eligible := CASE
  WHEN ro.status = 'CANCELLED' THEN false
  WHEN ro.state = 'DRAFT' AND NOT EXISTS (/* đã từng rời DRAFT */) THEN false
  WHEN loai_ho_tro = 'KEO_XE' AND towing_distance_km > 30 THEN false
  WHEN ro.state = 'RESCUE_IN_PROGRESS' AND ro.danger_level IS NULL THEN false
  -- + rule PO bổ sung
  ELSE true
END;
```

**Dashboard:** Widget hoặc filter *Đơn chưa áp dụng SLA* (số lượng + danh sách).

---

## 7. `DRAFT` — Tổng đơn vs SLA

| Chỉ số | `DRAFT` |
|--------|---------|
| **Tổng đơn** | **Có** — `COUNT(*)` gồm `state = 'DRAFT'` |
| **Tiếp nhận** (snapshot) | **Có** — gộp `DRAFT` + `WAITING_CONFIRM` |
| **Funnel / SLA / % đạt** | **Không** cho đến khi đơn có đủ điều kiện `sla_eligible` |
| **Thời lượng `TAO_DON`** | Chỉ tính SLA khi đơn đã **hoàn thành** và `sla_eligible = true` |

---

## 8. CSAT — `rescue_order_rate`

```sql
LEFT JOIN rescue_order_rate ror
  ON ror.rescue_order_v2_id = ro.rescue_order_v2_id
 AND ror.type = 1   -- CSAT khách hàng sau cứu hộ
```

| Chỉ số dashboard | Công thức |
|------------------|-----------|
| Điểm CSAT | `AVG(ror.score)` hoặc trường điểm tương ứng (PO xác nhận tên cột) |
| Phân bổ "Rất tốt" | % bản ghi có điểm ≥ 4 (nếu thang 5) |
| Mẫu số | Chỉ đơn `COMPLETED` + có bản ghi `type = 1` |

**Sheet (VII):** CSAT mục tiêu ≥ 90%; gửi khảo sát ≤ 2 giờ sau hoàn thành — KPI sau dịch vụ, không gộp vào SLA dispatch.

---

## 9. Cấu hình ngưỡng trên DB master (`kpi_sla_config_*`)

Toàn bộ cấu hình SLA/KPI lưu trên **cùng DB master** với bảng nghiệp vụ và bảng tổng hợp. Cho phép **chỉnh ngưỡng** qua UI/API — import ban đầu từ sheet.

**Bảng (DDL đầy đủ):** `kpi_sla_config_version`, `kpi_sla_config_rule` — xem BRD §14.2.

**Luồng cấu hình:**

1. Import CSV từ [Google Sheets](./kpi-duration-matrix.csv) → `kpi_sla_config_rule` (gắn `version_id`).
2. Màn **Cấu hình SLA** (Admin): tạo/kích hoạt version, sửa `sla_seconds`, `warning_seconds`, `risk_seconds`.
3. Job B chọn version theo **`sla_anchor_at`** (`completed_at` hoặc `created_at`); ghi `config_version_id` vào `kpi_order_sla_fact`.
4. Kích hoạt version mới: **không** ghi đè đơn đã tính theo version cũ (BRD §14.9).
5. Dashboard/API chỉ đọc bảng config trên master — không đọc file sheet runtime.
6. **Làm mới ngay:** `POST /kpi/jobs/build-dashboard/run` — chạy Job C snapshot tức thì (BRD §14.12).

---

## 10. Map `kpi_column` (SQL) ↔ dashboard

| `kpi_column` | States (SUM duration) | Thẻ UI | Gộp điều phối |
|--------------|----------------------|--------|----------------|
| `TAO_DON` | `DRAFT`, `WAITING_CONFIRM` | Tiếp nhận | — |
| `XAC_NHAN` | `CONFIRMED` | — | — |
| `DIEU_PHOI` | `WAITING_PROVIDER_ACCEPT` | Điều phối | **Có** |
| `TAI_XE_TIEP_NHAN` | `WAITING_DRIVER_ACCEPT` | Điều phối | **Có** |
| `DI_CHUYEN_TOI_DIEM` | `DRIVER_ON_THE_WAY` | Đang cứu hộ | — |
| `THUC_HIEN_CUU_HO` | `RESCUE_IN_PROGRESS` | Đang cứu hộ | — |
| `THOI_GIAN_KEO_XE` | `RESCUE_MOVE_TO_TOWING_POINT` | Đang cứu hộ | Chỉ `KEO_XE` |
| `OSA_HOAN_THANH` | `RESCUE_COMPLETED_BY_DRIVER` | — | — |

**Snapshot điều phối:**

```sql
COUNT(*) FILTER (WHERE ro.state IN (
  'WAITING_PROVIDER_ACCEPT', 'WAITING_DRIVER_ACCEPT'
))
```

**Hoàn thành / Huỷ:**

```sql
-- Hoàn thành
ro.status = 'COMPLETED'

-- Huỷ
ro.status = 'CANCELLED'
```

---

## 11. KPI % từ sheet (không phải duration)

| KPI | Mục tiêu | Đối tượng |
|-----|----------|-----------|
| Dispatch thành công lần đầu | ≥ 85% | OSA |
| Điều phối tự động | ≥ 95% | Hệ thống |
| Tài xế nhận đơn đúng SLA | ≥ 95% | DRIVER |
| ETA đúng | ≥ 90% | DRIVER (GPS) |
| Xử lý tại chỗ thành công | ≥ 80% | DRIVER |
| Hoàn thành đơn | ≥ 98% | OSA |
| CSAT | ≥ 90% | CSKH (after service) |

Tính riêng — không thay thế cột phút `kpi_duration`.

---

*Đồng bộ từ Google Sheets. Cấu hình và tổng hợp trên một DB master (`kpi_sla_config_*`, `kpi_order_sla_fact`, …).*
