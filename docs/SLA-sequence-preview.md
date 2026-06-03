# Preview Sequence Diagram — SLA Pipeline (event-driven)

**Giải thích đối tượng, bảng, trường và thao tác DB (SELECT/INSERT…):** [SLA-flow-data-dictionary.md](./SLA-flow-data-dictionary.md) · BRD §14

**Diagram dùng văn mô tả nghiệp vụ.** Chi tiết kỹ thuật DB nằm ở tài liệu trên, không ghi trên flow.

**Flowchart chi tiết (cột Step = số trên diagram):** BRD [§14.11](./BRD-Giam-sat-cuu-ho-Tong-quan.md#1411-sequence--tính-sla-và-đổ-bảng-tổng-hợp-một-db-master) — Step **1–25** luồng chính, **26–33** đổi ngưỡng, **34–46** làm mới thủ công.

PlantUML: [SLA-sequence-preview.puml](./SLA-sequence-preview.puml)

**Phát hiện đổi state:** subscribe topic **`update-state`** (không quét toàn bộ lịch sử định kỳ).

## Luồng chính

```mermaid
sequenceDiagram
    autonumber
    participant RO as Dịch vụ Đơn cứu hộ
    participant T as Topic update-state
    participant C as Consumer đồng bộ thời lượng
    participant M as DB Master
    participant B as Job B tính SLA
    participant D as Job C tổng hợp Dashboard
    participant API as API Dashboard
    participant UI as Màn hình Tổng quan

    RO->>M: Cập nhật trạng thái đơn và ghi nhật ký
    RO->>T: Gửi sự kiện đổi state

    T-->>C: Nhận message
    C->>M: Gộp thời gian theo từng state cho đơn đó
    C->>M: Lưu bảng thời lượng và đưa đơn vào hàng đợi SLA

    B->>M: Lấy đơn cần tính, đọc thời lượng và chọn bộ ngưỡng
    B->>M: Lưu kết quả SLA từng đơn

    D->>M: Tổng hợp thẻ KPI và biểu đồ

    API->>M: Đọc số liệu đã tổng hợp
    API-->>UI: Dữ liệu hiển thị + thời điểm cập nhật + cờ dữ liệu cũ/mới
```

## Nội dung sự kiện topic (gợi ý)

| Thông tin | Mục đích |
|-----------|----------|
| Mã đơn | Biết đơn cần xử lý |
| State cũ / state mới | Theo dõi, đối soát |
| Thời điểm sự kiện | Chốt timeline |
| Thời lượng vừa chốt (nếu có) | Giảm bước đọc lại lịch sử |
| Mã message | Tránh xử lý trùng |

Nếu message chưa có thời lượng → Consumer vẫn **đọc lịch sử chỉ của đơn đó** để gộp (chi tiết: data dictionary).

## Làm mới dashboard thủ công

```mermaid
sequenceDiagram
    participant UI as Màn hình
    participant API as API Dashboard
    participant C as Job C
    participant M as DB Master

    UI->>API: Yêu cầu cập nhật ngay
    API->>C: Gọi trực tiếp Job C (không ghi DB để kích hoạt)
    C->>M: Đọc dữ liệu cần tổng hợp
    C->>C: Tính KPI, % SLA, ...
    C->>M: Lưu snapshot / biểu đồ
    C-->>API: Hoàn thành
    UI->>API: Tải lại dashboard
    API->>M: Đọc số liệu mới
    API-->>UI: Hiển thị, không cảnh báo stale
```

## Các luồng đặc biệt khác

- **Đổi ngưỡng SLA:** xem PlantUML — không làm lại đơn đã chốt theo phiên bản cũ (BRD §14.9).
- **Reconcile:** chỉ khi mất message / consumer trễ — không thay topic trong luồng chính.
