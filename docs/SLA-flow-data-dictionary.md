# Từ điển luồng SLA & bảng dữ liệu (Giám sát cứu hộ › Tổng quan)

**Tham chiếu diagram:** [SLA-sequence-preview.puml](./SLA-sequence-preview.puml) — flow dùng **văn mô tả**; tài liệu này mô tả **chi tiết kỹ thuật** (bảng, trường, thao tác DB).

Tài liệu giải thích **từng đối tượng** trong sequence diagram, **từng bảng** và **từng trường** — dùng để làm gì và **tại sao cần** trong kiến trúc một DB master.

---

## 1. Bức tranh tổng thể — tại sao chia 3 tầng job?

| Tầng | Job | Vấn đề nếu bỏ |
|------|-----|----------------|
| **1 — Gộp thời gian** | Consumer (topic) | Mỗi lần mở dashboard phải `SUM(duration)` trên hàng triệu dòng `rescue_order_history` → chậm, khóa DB |
| **2 — SLA từng đơn** | Job B | So sánh ngưỡng + rule PA/km/mức nguy hiểm phức tạp; cần chốt `config_version_id` theo thời điểm |
| **3 — Tổng hợp màn hình** | Job C | Thẻ KPI / biểu đồ cần `COUNT`, `%` theo scope; không tính lại trên 10k+ đơn mỗi request |

**API/UI** chỉ đọc kết quả tầng 3 (+ chi tiết tầng 2 khi drill-down).

```text
[A] OLTP  →  rescue_order publish topic update-state
                    ↓
              Consumer (SYNC_STATE_DURATION)
                    ↓
              duration_fact  →  Job B  →  order_sla_fact  →  Job C  →  snapshot
                    ↓
              [B] kpi_sla_config_*          API → UI
```

---

## 2. Đối tượng trong sequence diagram

### 2.1 DB Master

| Mục đích | Chi tiết |
|----------|----------|
| **Là gì** | Một cơ sở dữ liệu duy nhất chứa nghiệp vụ, cấu hình SLA và bảng tổng hợp |
| **Tại sao cần** | Tránh đồng bộ chéo nhiều DB; job và API cùng transaction/schema; cấu hình SLA sửa trên UI ghi thẳng nơi job đọc |
| **Trong diagram** | Hộp chứa nhóm bảng [A], [B], [C] — không phải “máy chủ riêng”, là **đích READ/WRITE** của mọi job |

---

### 2.2 Topic `update-state` + Consumer — `SYNC_STATE_DURATION`

| Mục đích | Chi tiết |
|----------|----------|
| **Là gì** | Service `rescue_order` publish message mỗi khi đơn đổi state; **Consumer** subscribe topic này |
| **Làm gì** | Từ `order_id` trong message → `SUM(duration)` theo state **chỉ cho đơn đó** trên `rescue_order_history` → `UPSERT` `kpi_order_state_duration_fact` → (tùy chọn) enqueue Job B |
| **Tại sao cần** | Biết chính xác đơn nào đổi **realtime**, không quét watermark cả bảng history mỗi phút |
| **Không làm** | Không so sánh ngưỡng SLA; không quét toàn bộ DB |

**Payload message (tối thiểu):** `rescue_order_v2_id`, `from_state`, `to_state`, `event_at`; nên có `message_id`, `duration`.

**Idempotent:** cùng message xử lý lại → `UPSERT` fact cùng kết quả.

**Dự phòng:** job reconcile định kỳ khi consumer lag / mất message (không thay topic trong luồng chính).

---

### 2.3 Job B — `BUILD_ORDER_SLA`

| Mục đích | Chi tiết |
|----------|----------|
| **Làm gì** | Với mỗi đơn: lấy duration từ fact + metadata đơn → chọn **bộ rule** theo `sla_anchor_at` → tính `sla_eligible`, từng mốc đạt/không, `sla_met` → ghi `kpi_order_sla_fact` kèm `config_version_id` |
| **Tại sao cần** | Logic SLA phụ thuộc loại hỗ trợ (Tại chỗ/Kéo xe), PA, km kéo, mức nguy hiểm; cần **chốt version** để đổi ngưỡng không làm lệch đơn cũ |
| **Chu kỳ** | Event-driven: kích hoạt khi Consumer ghi queue / gọi trực tiếp (có thể thêm cron drain queue 1–2 phút) |
| **Quy tắc đặc biệt** | Đơn **đã có** fact + `config_version_id` → **không** đổi version/kết quả khi Admin bật V2 (trừ `force_recalc`) |

**Khái niệm `sla_anchor_at` (không lưu bảng, là quy tắc tính):**

| Giá trị | Khi nào | Tại sao |
|---------|---------|---------|
| `completed_at` | Đơn đã hoàn thành | SLA báo cáo gắn thời điểm kết thúc dịch vụ |
| `created_at` | Đơn chưa hoàn thành | Tạm chọn version cho đơn đang chạy; có thể cập nhật duration đến khi chốt |

---

### 2.4 Job C — `BUILD_DASHBOARD`

| Mục đích | Chi tiết |
|----------|----------|
| **Làm gì** | `COUNT` / `AVG` / `% SLA` theo `scope_key` (toàn quốc, vùng, tenant…) từ `kpi_order_sla_fact` (+ có thể đếm `ro.state` cho thẻ “đang xử lý”) → ghi `kpi_dashboard_snapshot_5m`, `kpi_dashboard_timeseries_1h` |
| **Tại sao cần** | Màn Tổng quan cần một dòng số liệu “sẵn sàng”; query 1–2 bảng nhỏ thay vì aggregate hàng nghìn đơn |
| **Chu kỳ** | ~5 phút (cron) **hoặc** chạy ngay khi có trigger thủ công |
| **Không làm** | Không đổi `sla_met` từng đơn; không sửa config |

---

### 2.5 Dashboard API

| Mục đích | Chi tiết |
|----------|----------|
| **Làm gì** | `GET` snapshot/timeseries; `GET` danh sách đơn từ `kpi_order_sla_fact` (cảnh báo, export); `POST` kích job (config, snapshot thủ công) |
| **Tại sao cần** | Tách **đọc nhẹ** (HTTP) khỏi **ghi nặng** (job nền); kiểm soát quyền, cache, `is_stale_data` |
| **Không làm** | Không `SUM(rescue_order_history.duration)` trong request người dùng |

**`is_stale_data`:** `true` khi `kpi_job_control.last_success_at` của Job C cách hiện tại > **10 phút** → UI cảnh báo và gợi ý **Làm mới ngay**.

---

### 2.6 Admin

| Mục đích | Chi tiết |
|----------|----------|
| **Làm gì** | Tạo/kích hoạt version SLA; import sheet; (tùy chọn) backfill `force_recalc`; bấm làm mới dashboard |
| **Tại sao cần** | Thay đổi ngưỡng là nghiệp vụ, không hard-code; audit qua `created_by`, `approved_by` |

---

### 2.7 Màn hình Tổng quan (UI)

| Mục đích | Chi tiết |
|----------|----------|
| **Làm gì** | Hiển thị thẻ KPI, funnel, bản đồ, cảnh báo; gửi bộ lọc lên API; trigger refresh |
| **Tại sao cần** | Người điều hành không truy cập DB; chỉ thấy payload đã tính + `updated_at` |

---

### 2.8 Scheduler & gọi Job C thủ công

| Kích hoạt | Luồng |
|-----------|--------|
| **Làm mới ngay** | **API → Job C (service)** → Job C đọc/ghi **DB Master**. API **không** ghi DB để “đặt lệnh” chạy job. |
| **Chu kỳ 5 phút** | Scheduler/cron **gọi trực tiếp** Job C (cùng service), sau đó Job C ghi DB — không khác bản chất luồng thủ công. |
| **API đọc dashboard** | API → DB (chỉ SELECT bảng tổng hợp), không tự tính KPI. |

Job C có thể **sau khi xong** ghi `kpi_job_control` (audit, `last_success_at`) — đó là **kết quả** chạy job, không phải cơ chế trigger.

**Pattern hàng đợi qua DB** (`kpi_manual_job_trigger` + worker poll): tùy chọn, không mô tả trên sequence chính; xem §5.7 nếu triển khai async tách process.

---

## 3. Nhóm [A] — Bảng nghiệp vụ (OLTP, đã có sẵn)

Consumer / Job B **đọc** nhóm này; API dashboard **hạn chế** đọc (trừ snapshot trạng thái realtime nhẹ).

### 3.1 `rescue_order_v2`

| Trường (điển hình) | Mục đích | Tại sao cần |
|--------------------|----------|-------------|
| `id` | Khóa đơn | Join mọi bảng |
| `code` | Mã hiển thị | Drill-down, export |
| `status` | `COMPLETED` / `CANCELLED` / … | Phân loại hoàn thành/huỷ; quyết định có tính % SLA |
| `state` | Trạng thái hiện tại | Thẻ snapshot “Tiếp nhận / Điều phối / Đang cứu hộ” |
| `created_at` | Thời điểm tạo | `sla_anchor_at` khi chưa hoàn thành; lọc kỳ báo cáo |
| `completed_at` | Thời điểm hoàn thành | `sla_anchor_at` chính; chọn version config |
| `operator_id` | OSA phụ trách | KPI theo nhân viên |
| `order_type` | `INTERNAL`, … | Lọc báo cáo (BRD: `INTERNAL`) |
| `rescue_distance` | Km kéo | `support_type`: >0 → Kéo xe; bucket SLA kéo |
| (các trường PA, danger) | PA1–3, mức nguy hiểm | Match rule `apply_priority_area`, `apply_danger_level` — **tên cột PO chốt** |

---

### 3.2 `rescue_order_history`

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `rescue_order_v2_id` | FK đơn | Gộp theo đơn |
| `state` | Mã trạng thái (`DRAFT`, `WAITING_DRIVER_ACCEPT`, …) | Map sang `kpi_column` (TAO_DON, DIEU_PHOI, …) |
| `duration` | Giây ở trạng thái đó | Nguồn duy nhất cho thời lượng SLA từng giai đoạn |
| (timestamp event) | Thời điểm chuyển state | `event_at` trên topic; `first_entered_at` / `last_exited_at` trên fact |

**Tại sao không đọc trực tiếp từ API:** Volume lớn, query lặp mỗi F5 → Consumer materialize qua topic + fact.

---

### 3.3 `ro_resource_work_order`

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `is_book` | `Y` = điều phối tự động | KPI “tỷ lệ điều phối tự động” |
| Liên kết đơn / trạm / tài xế | Gán nguồn lực | Drill-down trạm, tài xế |

---

### 3.4 `rescue_order_rate`

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `rescue_order_v2_id` | FK đơn | Join |
| `type` | `1` = khảo sát CSAT chính | BRD PO: chỉ type 1 vào CSAT dashboard |
| (score) | Điểm 1–5 | `csat_score` trên `kpi_order_sla_fact` |

CSAT là KPI **sau dịch vụ**, tách khỏi SLA vận hành từng giai đoạn.

---

## 4. Nhóm [B] — Cấu hình SLA/KPI

### 4.1 `kpi_sla_config_version` — “Bộ ngưỡng theo thời gian”

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `version_id` | PK | Tham chiếu từ `kpi_order_sla_fact.config_version_id` — **chứng minh đơn tính bằng bộ nào** |
| `version_code` | Mã người đọc (`SLA_2026Q2_V1`) | Audit, support, so sánh báo cáo |
| `source_type` | `SHEET` / `UI` / `API` | Truy vết nguồn thay đổi |
| `source_ref` | Link sheet / ticket Jira | Điều tra tranh chấp số liệu |
| `status` | `DRAFT` → `ACTIVE` → `ARCHIVED` | Không sửa rule đang production; kích hoạt có kiểm soát |
| `effective_from` | Thời điểm bắt đầu hiệu lực | Chọn version theo `sla_anchor_at` |
| `effective_to` | Kết thúc (nullable) | Nhiều version không chồng lấn |
| `created_by`, `created_at` | Audit tạo | Trách nhiệm |
| `approved_by`, `approved_at` | Phê duyệt (nếu có quy trình) | PO/Compliance |

**Tại sao tách khỏi `rule`:** Một version = nhiều rule; đổi ngưỡng = version mới, không UPDATE rule cũ.

---

### 4.2 `kpi_sla_config_rule` — Từng mốc SLA

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `rule_id` | PK | Sửa/xóa từng dòng rule trên UI |
| `version_id` | FK version | Gom rule theo bộ |
| `sla_type` | Dispatch / Execution SLA | Báo cáo nhóm KPI |
| `kpi_column` | `TAO_DON`, `DIEU_PHOI`, … | Map với cột duration trên fact (`tao_don_seconds`, …) |
| `owner_object` | CSKH / OSA / DRIVER / PROVIDER | Trách nhiệm trên dashboard |
| `pre_state`, `after_state` | Transition (tham chiếu sheet) | Tài liệu hóa; SQL hiện gom theo `state` |
| `sla_seconds` | Ngưỡng đạt (giây) | So sánh `duration_seconds <= sla_seconds` |
| `warning_seconds` | Ngưỡng cảnh báo | Màu vàng / alert “sắp trễ” |
| `risk_seconds` | Ngưỡng rủi ro | Màu đỏ / alert “quá hạn” |
| `apply_support_type` | `TAI_CHO` / `KEO_XE` / `ALL` | Ngưỡng 60 phút vs 120 phút tổng |
| `apply_order_type` | Đơn lẻ / gói / ALL | Rule khác theo sản phẩm |
| `apply_priority_area` | PA1 / PA2 / PA3 | ETA đến hiện trường 30/45/60 phút |
| `apply_danger_level` | 1 / 2 / 3 | Thời gian thực hiện cứu hộ |
| `apply_distance_min_km`, `apply_distance_max_km` | Bucket km kéo | ≤10 / ≤30 km; >30 → loại SLA |
| `count_in_sla_total` | Có tính vào % SLA tổng | Một số mốc chỉ giám sát, không vào mẫu số |
| `active` | Bật/tắt rule trong version | Tắt một mốc không cần version mới |

---

## 5. Nhóm [C] — Bảng tổng hợp

### 5.1 `kpi_order_state_duration_fact`

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `rescue_order_v2_id` + `state_code` | PK composite | Một dòng = tổng thời gian đơn ở một state |
| `duration_seconds` | Tổng giây | Job B so với `sla_seconds`; tránh SUM history |
| `first_entered_at` | Lần đầu vào state | Phân tích timeline |
| `last_exited_at` | Lần rời state | |
| `last_event_at` | Event history mới nhất | So sánh với `source_updated_at` trên sla_fact (Job B) |
| `updated_at` | Lần job A ghi | Debug độ trễ |

**Ví dụ gộp:** `DRAFT` + `WAITING_CONFIRM` → cột logic `TAO_DON` (Job B cộng hai state nếu cần).

---

### 5.2 `kpi_order_sla_fact` — Kết quả SLA từng đơn

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `rescue_order_v2_id` | PK | 1 đơn = 1 dòng phục vụ drill-down |
| `rescue_order_code` | Mã hiển thị | Không join lại OLTP khi export |
| `order_date` | Ngày đơn (partition) | Lọc nhanh theo ngày/tháng |
| `status`, `state` | Trạng thái tại lần tính | Lọc hoàn thành/huỷ; cảnh báo đơn đang treo |
| `order_type`, `support_type` | Phân loại | Áp rule đúng bộ |
| `dispatch_type` | Tự động / thủ công | KPI điều phối |
| `operator_id`, `station_id`, `driver_id` | Chiều tổ chức | Top trạm, tài xế, OSA |
| **`config_version_id`** | **FK version đã dùng** | **Chốt theo thời điểm; đổi V2 không sửa đơn cũ** |
| `tao_don_seconds`, `dieu_phoi_seconds`, … | Thời lượng từng mốc | Hiển thị chi tiết; so rule từng cột |
| `sla_tong_seconds` | Tổng thời gian SLA (logic Tại chỗ/Kéo xe) | So với 3600s / 7200s |
| `sla_eligible` | Có đưa vào mẫu % SLA | Loại huỷ, kéo >30km, thiếu PA, DRAFT-only, … |
| `sla_met` | Đạt SLA đơn (khi eligible + completed) | % SLA tổng = COUNT(met)/COUNT(eligible) |
| `sla_exclusion_reason` | Mã loại trừ | Giải thích cho PO; báo cáo riêng |
| `csat_score` | Điểm khảo sát | Thẻ CSAT trên cùng dòng phục vụ export |
| `calculated_at` | Lần Job B tính | Audit |
| `source_updated_at` | OLTP/fact thay đổi lần cuối | Biết cần tính lại delta |

---

### 5.3 `kpi_dashboard_snapshot_5m` — Ảnh chụp màn Tổng quan

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `snapshot_at` | Thời điểm chụp | Hiển thị “Cập nhật lúc …”; PK |
| `timezone` | Múi giờ hiển thị | Tránh lệch ngày |
| `scope_key` | Phạm vi (`VN`, vùng, tenant) | Một query trả đúng bộ lọc |
| `total_orders` | Tổng đơn trong scope/kỳ | Thẻ KPI |
| `tiep_nhan_orders`, `dieu_phoi_orders`, `dang_cuu_ho_orders` | Snapshot `state` | Thẻ trạng thái realtime |
| `completed_orders`, `cancelled_orders` | Đếm theo `status` | Funnel / tỷ lệ |
| `sla_overall_pct` | % SLA đạt | Thẻ SLA chính |
| `csat_avg`, `csat_good_pct` | CSAT | Thẻ hài lòng |
| `station_sla_pct`, `driver_kpi_pass_pct` | KPI đối tượng | Tóm tắt (chi tiết có thể từ entity daily) |
| `not_eligible_orders` | Số đơn loại SLA | Minh bạch mẫu số |

**Tại sao 5 phút:** Cân bằng độ tươi dữ liệu và tải DB; user có nút **Làm mới ngay** khi cần.

---

### 5.4 `kpi_dashboard_timeseries_1h` — Biểu đồ theo thời gian

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `bucket_at` | Mốc giờ/ngày | Trục X biểu đồ |
| `scope_key` | Phạm vi | Đồng bộ với snapshot |
| `created_orders`, `completed_orders`, `cancelled_orders` | Khối lượng theo bucket | Xu hướng vận hành |
| `sla_overall_pct` | % SLA theo bucket | Xu hướng chất lượng |

**Tại sao tách khỏi snapshot:** Snapshot = “hiện tại”; timeseries = chuỗi lịch sử — kích thước và index khác nhau.

---

### 5.5 `kpi_entity_daily_score` (tùy chọn — Job D)

| Mục đích | Tại sao cần |
|----------|-------------|
| Điểm KPI/SLA **theo ngày** cho tài xế / trạm / OSA | Bảng xếp hạng “Top 5” không aggregate lại từ fact mỗi lần mở |

---

### 5.6 `kpi_job_control` — Watermark & sức khỏe job

| Trường | Mục đích | Tại sao cần |
|--------|----------|-------------|
| `job_name` | PK (`SYNC_STATE_DURATION`, …) | Một dòng / job |
| `last_success_at` | Lần chạy OK | API tính `is_stale_data` (Job C > 10 phút) |
| `last_run_at` | Lần bắt đầu gần nhất | Phát hiện job kẹt |
| `last_status` | SUCCESS / FAILED / RUNNING | Alert vận hành |
| `last_error` | Chi tiết lỗi | Debug |
| `rows_processed` | Số dòng xử lý | Giám sát hiệu năng |
| `updated_at` | Thời điểm ghi | |
| (`force_run_at` — tùy triển khai) | Yêu cầu chạy sớm | Trigger thủ công không đợi cron |

---

### 5.7 `kpi_manual_job_trigger` (tùy chọn — không dùng trong luồng diagram chính)

**Luồng chuẩn trên diagram:** API **gọi trực tiếp** Job C → Job C ghi DB.

Bảng hàng đợi chỉ cần nếu team tách process: API ghi `PENDING` → worker poll → gọi Job C. Khi đó các trường:

| Trường | Mục đích |
|--------|----------|
| `trigger_id` | `job_id` cho UI poll |
| `job_name` | `BUILD_DASHBOARD` / `BUILD_ORDER_SLA` |
| `scope_key`, `requested_by`, `requested_at` | Audit, phạm vi |
| `status`, `finished_at`, `error_message` | Tiến trình / lỗi |

Nếu API gọi thẳng Job C (sync hoặc async trong service), có thể **không** cần bảng này; chỉ dùng `kpi_job_control` sau khi Job C chạy xong.

---

## 6. Ánh xạ nhanh: diagram → bảng

| Bước diagram | Đọc | Ghi |
|--------------|-----|-----|
| Rescue Order đổi state | — | `rescue_order_v2`, `rescue_order_history`, **topic `update-state`** |
| Consumer | Message topic + `rescue_order_history` (1 order) | `kpi_order_state_duration_fact`, `kpi_sla_recalc_queue`, `kpi_job_control` |
| Job B | `kpi_order_state_duration_fact`, `kpi_sla_config_*`, `rescue_order_v2`, `rescue_order_rate` | `kpi_order_sla_fact`, `kpi_job_control` |
| Job C | `kpi_order_sla_fact`, (nhẹ) `rescue_order_v2.state` | `kpi_dashboard_snapshot_5m`, `kpi_dashboard_timeseries_1h`, `kpi_job_control` |
| API GET | `kpi_dashboard_*`, `kpi_order_sla_fact` | — |
| Admin đổi SLA | — | `kpi_sla_config_version`, `kpi_sla_config_rule` |
| Làm mới ngay | API → **Job C** → DB | (Tùy chọn) audit `kpi_job_control` sau khi xong |

---

## 7. Câu hỏi thường gặp

**Vì sao lưu `config_version_id` trên từng đơn?**  
Để báo cáo phản ánh đúng “luật chơi” tại thời điểm chốt; PO đổi ngưỡng không làm thay đổi hồi tố đơn đã báo cáo.

**Vì sao có cả `duration_fact` và `order_sla_fact`?**  
Fact 1 = số liệu thô theo state; Fact 2 = kết luận nghiệp vụ (eligible, met, version) — tách giúp Job C đơn giản và drill-down rõ.

**Làm mới ngay có tính lại SLA không?**  
Không — chỉ Job C. Muốn tính lại SLA từng đơn phải trigger Job B (và chỉ khi thật sự cần, có `force_recalc`).

---

*Cập nhật theo BRD v1.6 · PlantUML SLA sequence*
