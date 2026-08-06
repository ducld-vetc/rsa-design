# Analysis — UI ma trận giá dịch vụ theo tiêu chí (xem & cấu hình bảng phí)

**Ngày:** 2026-08-03  
**Nguồn:** Workshop UI portal `rsa-design` (màn Chi tiết / Form cấu hình bảng phí), mô hình tiêu chí PTI đã map tại [fee-table-pti-enterprise.md](./fee-table-pti-enterprise.md)  
**Preview:** `/rescue-fee-config` → Chi tiết / Chỉnh sửa bảng phí (mock PTI: code `CUS-DN-PTI-2026`, id `CUS-BUSINESS-PTI`)  
**Actor:** CSKH / Ops — xem bảng phí; Admin cấu hình bảng phí  
**Mục tiêu phiên:** Ghi nhận yêu cầu giao diện **xem / lọc ma trận dòng giá** và **làm gọn thao tác tiêu chí bổ sung** trên Form — **chưa viết BRD 6 mục**.

**Trạng thái chốt BA:** *(để BA điền)*

---

## 1. Bối cảnh

Bảng phí KH doanh nghiệp (điển hình PTI) có **nhiều chục–hơn trăm dòng giá**, mỗi dòng gắn tổ hợp điều kiện AND (`vehicleType`, `seat_number` / `load_capacity`, `distanceKm`, `roadDistance`, …).

Người dùng cần:

1. **Xem** ma trận trên màn Chi tiết mà không bị cột legacy trống chiếm diện tích.
2. **Lọc nhanh** theo loại dịch vụ và đặc trưng xe khách / xe cứu hộ / chỗ / tải — không phụ thuộc tìm kiếm chữ tự do hay cột “km gồm / giá km vượt”.
3. Khi **cấu hình**, cột tiêu chí bổ sung không bị nút “Cấu hình (N)” chiếm quá nhiều chỗ.

Mô hình tính giá (FIXED + PER_UNIT theo `distanceKm`, bậc `roadDistance` cẩu, …) **không** mô tả lại tại đây — xem [fee-table-pti-enterprise.md](./fee-table-pti-enterprise.md) và [fee-schema-redesign.md](./fee-schema-redesign.md).

---

## 2. AS-IS → TO-BE (UI)

| Khu vực | AS-IS | TO-BE |
|---------|-------|--------|
| Chi tiết — cột ma trận | Có thêm **Km gồm**, **Giá/km vượt**, **Vị trí** (thường `—` với mô hình điều kiện mới) | Chỉ còn **Dịch vụ \| Tổ hợp tiêu chí áp dụng \| Cách tính \| Mức giá** |
| Chi tiết — bộ lọc | Không có / thử nghiệm: tìm kiếm chữ, cách tính, khoảng cách kéo, vị trí so với mặt đường | **Sáu ô cố định** theo dịch vụ + xe (bảng mục 3); bỏ tìm kiếm, cách tính, khoảng cách |
| Form — tiêu chí bổ sung | Nút text `Cấu hình (N)` rộng | Icon + badge số tiêu chí; tooltip đầy đủ |
| Form — bộ lọc tab dòng giá | Bổ sung lọc khi cấu hình bảng lớn | Giữ lọc thao tác cấu hình: tìm kiếm + loại DV + đầu DV + cách tính *(chưa đồng bộ bộ 6 ô với Chi tiết — open point)* |

---

## 3. Mô tả màn — Chi tiết bảng phí

**Section:** Ma trận giá dịch vụ theo tiêu chí  
**Component tham chiếu:** `RescueFeeDetail` `[rsa-design: pages/RescueFeeDetail.tsx]`

### 3.1 Bảng dữ liệu

| Cột | Ý nghĩa nghiệp vụ |
|-----|-------------------|
| Dịch vụ | Tên đầu dịch vụ (`serviceDetail`), fallback nhãn loại DV |
| Tổ hợp tiêu chí áp dụng | Chip điều kiện trên dòng; “Giá mặc định” nếu không có điều kiện |
| Cách tính | Theo lượt (`FIXED`) / Theo đơn vị (`PER_UNIT`) |
| Mức giá | `basePrice` (+ đơn vị nếu PER_UNIT) |

**Không hiển thị:** Km gồm, Giá/km vượt, Vị trí đường (legacy trên rule).

### 3.2 Bộ lọc

Layout: một hàng tối đa 6 ô (+ nút Xóa khi đang lọc) + dòng đếm `Hiển thị X/Y dòng giá`.

| # | Nhãn UI | Nguồn / key | Kiểu control | Hành vi khớp |
|---|---------|-------------|--------------|--------------|
| 1 | Loại DV | `serviceType` | Select | `ONSITE` / `TOWING` / `CRANE` / Tất cả |
| 2 | Đầu dịch vụ | `serviceDetail` | Select (options từ dòng giá bảng) | Exact match |
| 3 | Loại xe khách | `vehicleType` | Select (options từ dòng giá + `priceCriteria.allowedValues`) | Giá trị nằm trong điều kiện `=` / `IN` |
| 4 | Loại xe cứu hộ | `rescueVehicleType` | Select (tương tự; catalog PTI: Xe máy, Xe van, …) | Exact / IN. Lưu ý: seed PTI có thể **không** gắn key này trên từng line → lọc này có thể ra rỗng nếu bảng chưa gắn điều kiện |
| 5 | Số chỗ | `seat_number` (legacy: `seats`) | Ô nhập số | Số nhập thuộc khoảng `BETWEEN [from, to]` (hoặc bằng giá trị đơn) |
| 6 | Trọng tải | `load_capacity` (legacy: `payload`) | Ô nhập số | Tương tự Số chỗ (đơn vị tấn theo cấu hình bảng) |

Các filter đang chọn kết hợp **AND**. Ô trống / “Tất cả” = không áp điều kiện đó.

**Empty state:** “Không có dòng giá khớp bộ lọc.” khi Y > 0 nhưng X = 0.

---

## 4. Mô tả màn — Form cấu hình bảng phí (tab dòng giá)

**Section:** Dòng giá theo tổ hợp tiêu chí  
**Component tham chiếu:** `RescueFeeForm` `[rsa-design: pages/RescueFeeForm.tsx]`  
**Route ví dụ:** `/rescue-fee-config/edit/CUS-BUSINESS-PTI`

### 4.1 Nút cấu hình tiêu chí bổ sung

- Hiển thị dạng **icon** (không còn nhãn “Cấu hình (N)” dài).
- **Badge** số lượng tiêu chí bổ sung khi N > 0.
- Tooltip: `Cấu hình tiêu chí bổ sung (N)`.
- Click mở modal chỉnh điều kiện bổ sung của dòng.

### 4.2 Bộ lọc trên Form (hiện trạng preview)

Khác Chi tiết — phục vụ thao tác khi sửa nhiều dòng:

| Nhãn UI | Hành vi |
|---------|---------|
| Tìm kiếm | Chuỗi khớp tên DV / tóm tắt điều kiện / giá |
| Loại DV | `serviceType` |
| Đầu dịch vụ | `serviceDetail` |
| Cách tính | `FIXED` / `PER_UNIT` |

Hiển thị đếm dòng đã lọc theo từng khối đầu dịch vụ.

---

## 5. Rule bases (UI)

| Mã | Rule |
|----|------|
| BR-UI-01 | Filter trên cùng màn kết hợp theo **AND**; giá trị mặc định “Tất cả” / trống = bỏ qua chiều đó. |
| BR-UI-02 | Số chỗ / Trọng tải: khớp nếu tồn tại điều kiện khoảng chứa giá trị nhập (biên đóng `[from, to]` theo preview). |
| BR-UI-03 | Màn Chi tiết **không** dùng cột Km gồm / Giá km vượt / Vị trí để thể hiện mô hình giá mới; khoảng km / mét nằm trong **tổ hợp tiêu chí** (`distanceKm`, `roadDistance`). |
| BR-UI-04 | Nút tiêu chí bổ sung trên Form chỉ là shortcut mở cấu hình; không thay đổi logic tính phí. |
| BR-UI-05 | Có thể xóa toàn bộ filter đang áp (nút Xóa / Xóa lọc); đếm dòng phản ánh kết quả sau lọc. |

---

## 6. Tham chiếu

| Tài liệu / artifact | Vai trò |
|---------------------|---------|
| [fee-table-pti-enterprise.md](./fee-table-pti-enterprise.md) | Map nghiệp vụ PTI + tiêu chí |
| [fee-table-pti-enterprise-seed-demo.md](./fee-table-pti-enterprise-seed-demo.md) | Demo quan hệ seed |
| [fee-schema-redesign.md](./fee-schema-redesign.md) | Schema `fee_*` |
| [BRD-Tong-quan-cau-hinh-va-tinh-phi-don.md](./BRD-Tong-quan-cau-hinh-va-tinh-phi-don.md) | BRD đầy đủ cấu hình + tính phí trên đơn |
| [BRD-UI-ma-tran-bang-phi.md](./BRD-UI-ma-tran-bang-phi.md) | BRD UI ma trận xem/lọc |
| `data/rescueFeeMockData.ts` | Mock portal `CUS-DN-PTI-2026` |
| `data/feeTablePtiEnterpriseSeed.ts` | Seed TS |

---

## 7. Gap / Open points

| # | Chủ đề | Hiện tại | Đề xuất | Cần chốt |
|---|--------|----------|---------|----------|
| 1 | Đồng bộ bộ lọc Form ↔ Chi tiết | Form còn tìm kiếm + cách tính; Detail dùng 6 ô xe/DV | Form cùng bộ lọc Chi tiết (hoặc Form giữ thêm tìm kiếm khi cấu hình) | *(BA)* |
| 2 | Lọc `rescueVehicleType` khi line PTI chưa gắn key | Options có từ catalog; kết quả có thể rỗng | Gắn điều kiện trên line khi cần phân biệt loại xe cứu hộ, hoặc ẩn filter nếu bảng không dùng | *(BA/PO)* |
| 3 | Biên khoảng chỗ/tải (đóng vs nửa mở) | Preview: `>= from && <= to` | Khớp engine tính phí thật | *(BE)* |

---

## 8. Kết luận

- **Đã rõ:** Cột ma trận Chi tiết; bộ lọc 6 chiều trên Chi tiết; nút tiêu chí bổ sung gọn trên Form; quan hệ với tiêu chí PTI (tham chiếu, không nhân bản công thức).
- **Chưa chốt (blocking cho BRD UI đầy đủ):** Đồng bộ filter Form vs Detail (#1); chính sách lọc loại xe cứu hộ khi chưa gắn trên line (#2).
- **Sẵn sàng viết BRD:** Không — chờ BA điền chốt open points trên.
