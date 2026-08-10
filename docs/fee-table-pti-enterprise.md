# Bảng phí KH Doanh nghiệp — PTI (map từ khung giá VETC × PTI)

> Nguồn: `BẢNG GIÁ PTI.xlsx - Khung bảng giá.csv`  
> Ánh xạ theo cơ chế mới (`fee_table` / `fee_price_line` / `fee_surcharge_rule`) trong [fee-schema-redesign.md](./fee-schema-redesign.md).  
> **Demo dữ liệu quan hệ:** [fee-table-pti-enterprise-seed-demo.md](./fee-table-pti-enterprise-seed-demo.md) · seed TS [`../data/feeTablePtiEnterpriseSeed.ts`](../data/feeTablePtiEnterpriseSeed.ts)  
> **UI xem/lọc ma trận (analysis BA):** [analysis-rescue-fee-matrix-ui.md](./analysis-rescue-fee-matrix-ui.md)  
> **BRD tổng quan cấu hình + tính phí trên đơn:** [BRD-Tong-quan-cau-hinh-va-tinh-phi-don.md](./BRD-Tong-quan-cau-hinh-va-tinh-phi-don.md)  
> **Mock portal:** `CUS-DN-PTI-2026` trong `rescueFeeMockData.ts`  
> **Loại bảng:** `target = CUSTOMER`, `object_type = CUSTOMER_BUSINESS`, `order_type = PACKAGE_SINGLE`  
> **Scope:** `corporate_customer_id = PTI`  
> Giá trong bảng = **chưa VAT** (trừ ghi chú riêng). VAT áp khi xuất thu trên đơn.

---

## 1. Header bảng phí

| Trường | Giá trị |
|--------|---------|
| `code` | `CUS-DN-PTI-2026` |
| `name` | Bảng phí KH DN — PTI (VETC × PTI) |
| `target` | `CUSTOMER` |
| `object_type` | `CUSTOMER_BUSINESS` |
| `order_type` | `PACKAGE_SINGLE` |
| `status` | `ACTIVE` (đề xuất) |
| `version` | `1` |
| `valid_from` / `valid_to` | Theo hợp đồng PTI |
| `scope.corporate_customer_id` | `PTI` |
| `settings.round_mode` | `NEAREST_1000` (đề xuất) |
| `settings.stack_surcharges` | `true` (nhân các hệ số phụ phí — theo công thức “1,5 × giá phí”) |
| `settings.retail_markup_factor` | *(không dùng — không phải KH lẻ)* |

**Tiêu chí ma trận dùng trong bảng này**

| `criterion_key` | Label | `value_type` | Ghi chú |
|-----------------|-------|--------------|---------|
| `vehicleType` | Loại xe khách | LIST | `Xe chở người` \| `Xe chở hàng` |
| `seat_number` | Số chỗ | RANGE | Dùng **AND** với `vehicleType = Xe chở người` |
| `load_capacity` | Trọng tải (tấn) | RANGE | Dùng **AND** với `vehicleType = Xe chở hàng` |
| `rescueVehicleType` | Loại xe cứu hộ | LIST | Catalog + field_map; seed PTI **không** gắn trên line (áp mọi loại) |
| `distanceKm` | Quãng đường kéo | RANGE | km — **2 dòng**: FIXED `BETWEEN [0,10]` + PER_UNIT `BETWEEN [10,9999]` (engine cộng dồn) |
| `roadDistance` | Khoảng cách so với mặt đất | RANGE | mét — From–To trên dòng (vd. `[0,5]`, `[5,10]`, …) |
| `cranePosture` | Tư thế xe cẩu | LIST | `Nghiêng` / `Ngửa` — chỉ bậc **>150m** |
| `areaTerrain` | Địa hình khu vực | LIST | `MOUNTAIN` / `SUBURBAN` / `NORMAL` |
| `isHighway` | Cao tốc | LIST | tuyến / flag |
| `timeWindow` | Giờ yêu cầu | TIME | Đêm 18:00–06:00 |
| `weather` | Thời tiết / thiên tai | LIST | ngập lụt diện rộng |
| `locationType` | Vị trí đặc biệt | LIST | `BASEMENT` (hầm) |
| `extraEquipment` | Thiết bị thêm | LIST | `DOLLY` / `DOUBLE_JACK` |

> **Không dùng nhóm G / `ptiTowGroup` / `ptiCraneGroup`.** Cột Excel “2–12 chỗ / tải ≤1,4 tấn” tách thành **hai dòng giá độc lập** cùng giá: một dòng chở người + chỗ, một dòng chở hàng + tải. Điều kiện trên cùng line = **AND**.

> **Ngưỡng kéo ≠ ngưỡng cẩu** (file nguồn khác nhau) — cấu hình thẳng trên từng `fee_price_line_condition`, không qua transform gom nhóm.

### Bậc chỗ / tải — kéo (`TOWING`)

Mỗi bậc chỗ hoặc tải = **hai** `fee_price_line` cùng điều kiện xe:

| Dòng | `pricing_mode` | `distanceKm` | `base_price` |
|------|----------------|--------------|--------------|
| Mở cửa | **FIXED** (Theo lượt) | BETWEEN **[0, 10]** | Giá chuyến ≤10km |
| Km vượt | **PER_UNIT** (Theo đơn vị) | BETWEEN **[10, 9999]** | Đơn giá / km (engine: `(km − 10) × đơn giá`) |

| Nhánh | Điều kiện AND (xe) | FIXED ≤10km | PER_UNIT đ/km |
|-------|-------------------|-------------|----------------|
| Chỗ | `vehicleType=Xe chở người` ∧ `seat_number` 2–12 | 600.000 | 20.000 |
| Tải | `vehicleType=Xe chở hàng` ∧ `load_capacity` 0–1,4 | 600.000 | 20.000 |
| Chỗ | người ∧ chỗ 13–30 | 1.000.000 | 25.000 |
| Tải | hàng ∧ tải 1,41–3 | 1.000.000 | 25.000 |
| Chỗ | người ∧ chỗ 31–39 | 1.300.000 | 25.000 |
| Tải | hàng ∧ tải 3,01–5 | 1.300.000 | 25.000 |
| Chỗ | người ∧ chỗ 40–45 | 1.400.000 | 35.000 |
| Tải | hàng ∧ tải 5,01–8 | 1.400.000 | 35.000 |
| Chỗ | người ∧ chỗ 46–54 | 1.400.000 | 35.000 |
| Tải | hàng ∧ tải 8,01–13 | 1.400.000 | 35.000 |
| Chỗ | người ∧ chỗ 55–80 | 1.800.000 | 35.000 |
| Tải | hàng ∧ tải 13,01–18 | 1.800.000 | 35.000 |
| Tải | hàng ∧ tải >18 *(không có nhánh chỗ)* | 2.500.000 | 50.000 |

### Bậc chỗ / tải — cẩu (`CRANE`) — ngưỡng riêng

| Nhánh | `seat_number` / `load_capacity` |
|-------|----------------------------------|
| Chỗ / Tải | 2–12 / 0–2 |
| Chỗ / Tải | 13–30 / 2,01–3,5 |
| Chỗ / Tải | 31–39 / 3,51–5 |
| Chỗ / Tải | 40–45 / 5,01–8 |
| Chỗ / Tải | 46–54 / 8,01–13 |
| Chỗ / Tải | 55–65 / 13,01–18 |
| Chỗ / Tải | 66–80 / 18,01–25 |

Mỗi bậc chỗ/tải × mỗi khoảng `roadDistance` = 2 line (người + hàng). Bậc >150m thêm `cranePosture`.

---

## 2. Dòng giá — Xử lý tại chỗ (`ONSITE`)

`pricing_mode = FIXED` · không phụ thuộc chỗ/tải trong khung PTI.

| STT | `service_name` | `base_price` (VND) | Điều kiện | Ghi chú nghiệp vụ | Giá minh họa +VAT 8%* |
|-----|----------------|-------------------|-----------|-------------------|------------------------|
| 1 | Kích bình | 400.000 | — | Không thay bình | 432.000 |
| 2 | Vá lốp tại chỗ | 400.000 | — | Lốp không săm, vá dùi; chưa gồm miếng vá | 432.000 |
| 3 | Thay lốp dự phòng | 400.000 | — | Không gồm thay lốp mới | 432.000 |
| 4 | Cung cấp nhiên liệu (xăng, dầu, nước làm mát) | 300.000 | — | Chỉ công giao; KH tự trả nhiên liệu thực tế | 324.000 |

\*VAT 8% lấy từ cột “đã bao gồm VAT” trên file nguồn (400×1,08=432). Engine mới nên lưu **base chưa VAT**; VAT trên `rescue_order_charge` / dòng thu.

**Dạng `fee_price_line` (ví dụ 1 dòng)**

| service | base_price | pricing_mode | conditions |
|---------|------------|--------------|------------|
| Kích bình | 400000 | FIXED | *(không)* |

---

## 3. Dòng giá — Kéo xe (`TOWING`)

Hai dòng theo khung PTI (**đã chốt**), engine chọn **FIXED gần nhất** rồi cộng PER_UNIT phía sau:

1. **FIXED** · `distanceKm BETWEEN [0, 10]` · giá mở cửa / chuyến  
2. **PER_UNIT** · `distanceKm BETWEEN [10, 9999]` · đơn giá/km × `(km − 10)`

**Ví dụ:** Xe chở người · 5 chỗ · 15 km  
→ FIXED gần nhất `[0,10]` 600.000 + PER_UNIT 20.000 × 5 = **700.000** (chưa VAT, chưa phụ phí).

**Xen kẽ FIXED / PER_UNIT:** vd. `[0,10]` FIXED 100k · `[10,20]` PER 10k/km · `[20,50]` FIXED 200k · `[50,9999]` PER 20k/km · đơn **70 km**  
→ FIXED gần nhất = `[20,50]` **200.000**; bỏ qua `[0,10]` và `[10,20]`; + PER `[50,9999]` × 20 km = **400.000** → tổng base **600.000**.

**Ma trận giá (cùng số cho nhánh chỗ và nhánh tải của cùng cột Excel)**

| Quãng đường | 2–12 chỗ / ≤1,4t | 13–30 / 1,41–3t | 31–39 / 3–5t | 40–45 / 5–8t | 46–54 / 8–13t | 55–80 / 13–18t | tải >18t |
|-------------|------------------|-----------------|--------------|--------------|---------------|----------------|----------|
| ≤ 10 km (FIXED) | 600k | 1.000k | 1.300k | 1.400k | 1.400k | 1.800k | 2.500k |
| Từ km 11 (PER_UNIT) | 20k | 25k | 25k | 35k | 35k | 35k | 50k |

---

## 4. Dòng giá — Cẩu xe (`CRANE`)

`pricing_mode = FIXED` · điều kiện AND: (`vehicleType` + chỗ **hoặc** tải) + **`roadDistance BETWEEN [from, to]`** (+ `cranePosture` nếu >150m).

| `roadDistance` (m) | `cranePosture` | Mô tả (file nguồn) |
|--------------------|----------------|--------------------|
| `[0, 5]` | — | Mặt đường hoặc sâu **≤ 5m** |
| `[5, 10]` | — | Sâu **5 → 10m** |
| `[10, 30]` | — | Sâu **10 → 30m** |
| `[30, 50]` | — | Sâu **30 → 50m** |
| `[50, 100]` | — | Sâu **50 → 100m** |
| `[100, 150]` | — | Sâu **100 → 150m** |
| `[150, 9999]` | **Nghiêng** | Nghiêng, sâu **> 150m** |
| `[150, 9999]` | **Ngửa** | Ngửa, sâu **> 150m** (giá MAX) |

### Ma trận cẩu — `base_price` (VND, chưa VAT)

Cột = bậc chỗ/tải. Hàng = khoảng `roadDistance` (+ tư thế).

| Khoảng mặt đất | 2–12 / ≤2t | 13–30 / ≤3,5t | 31–39 / ≤5t | 40–45 / ≤8t | 46–54 / ≤13t | 55–65 / ≤18t | 66–80 / ≤25t |
|----------------|------------|---------------|-------------|-------------|--------------|--------------|--------------|
| 0–5m | 1.000.000 | 1.200.000 | 2.900.000 | 4.000.000 | 4.600.000 | 5.100.000 | 6.200.000 |
| 5–10m | 1.650.000 | 2.700.000 | 3.800.000 | 5.500.000 | 6.600.000 | 7.100.000 | 7.500.000 |
| 10–30m | 2.700.000 | 3.800.000 | 4.900.000 | 8.200.000 | 9.500.000 | 11.000.000 | 12.000.000 |
| 30–50m | 3.300.000 | 5.500.000 | 7.100.000 | 11.000.000 | 14.000.000 | 14.000.000 | 17.500.000 |
| 50–100m | 5.500.000 | 7.700.000 | 9.300.000 | 14.000.000 | 16.500.000 | 19.800.000 | 24.000.000 |
| 100–150m | 8.000.000 | 13.000.000 | 13.000.000 | 19.000.000 | 22.000.000 | 27.000.000 | 33.000.000 |
| >150m Nghiêng | 15.500.000 | 19.800.000 | 19.800.000 | 24.000.000 | 27.000.000 | 33.000.000 | 38.500.000 |
| >150m Ngửa | 19.000.000 | 24.000.000 | 27.000.000 | 30.000.000 | 38.500.000 | 49.500.000 | 60.500.000 |

**Dòng ngửa > 150m:** **đã chốt — luôn lấy giá MAX** (= số ghi trên cột), `FIXED`.

**Số dòng `fee_price_line` ước tính:** cẩu 8×7×2 = **112** + kéo **26** + tại chỗ **4** ≈ **142** dòng.

---

## 5. Phụ phí (`fee_surcharge_rule`)

`settings.stack_surcharges = true` → các hệ số **nhân** với giá phí đã match (đúng công thức “1,5 × giá phí”). Phụ phí tiền mặt **cộng** thêm.

| STT | `name` | `type` | `value` | Điều kiện (tóm tắt) | Ghi chú |
|-----|--------|--------|---------|---------------------|---------|
| 1 | Miền núi | COEFFICIENT | **1,5** | `areaTerrain = MOUNTAIN` | +50% |
| 2 | Ngoại thành | COEFFICIENT | **1,1** | `areaTerrain = SUBURBAN` | +10% |
| 3 | Cao tốc | COEFFICIENT | **1,3** | `isHighway` khớp tuyến | +30%; chưa gồm phí cầu đường |
| 4 | Cứu hộ đêm | COEFFICIENT | **1,2** | `timeWindow` BETWEEN 18:00–06:00 | Ban ngày 06:00–18:00 không áp |
| 5 | Thiên tai / ngập lụt diện rộng | COEFFICIENT | **1,3** | `weather` ∈ { Thiên tai, Ngập lụt diện rộng, … } | +30% |
| 6 | Cứu hộ dưới hầm | FIXED | **+500.000** | `locationType = BASEMENT` | Chỉ dịch vụ **cẩu/kéo** (lọc `service_type`) |
| 7 | Kích kép / Dolly | FIXED | **+200.000** | `extraEquipment IN (DOLLY, DOUBLE_JACK)` | Xe tự động khóa 4 bánh |

**Lưu ý stacking:** Nếu cùng lúc miền núi + đêm → `giá × 1,5 × 1,2` (vì stack = nhân). Đề xuất `exclusive_group = AREA` cho miền núi / ngoại thành.

**Không nằm trong phụ phí bảng (ghi chú hợp đồng):**

- Chi phí cầu đường, hầm (ngoài hệ số cao tốc)  
- Nhiên liệu thực tế (dịch vụ cung cấp nhiên liệu chỉ thu công giao)

---

## 6. Ví dụ end-to-end (dễ hình dung)

**Đơn:** PTI · kéo · xe chở người · 5 chỗ · 15 km · đêm · không cao tốc  

| Bước | Kết quả |
|------|---------|
| Chọn bảng | `CUS-DN-PTI-2026` (`CUSTOMER_BUSINESS` + corporate_customer PTI) |
| Match line | FIXED gần nhất ≤10 (600k) + PER_UNIT ×5 (100k) |
| Base trước phụ phí | 700.000 |
| Surcharge đêm ×1,2 | 840.000 |
| VAT 8% (nếu áp) | 907.200 |
| Snapshot | `customer_table_code=CUS-DN-PTI-2026`, `customer_fee_mode=BUSINESS` |
| Dòng đơn | `customer_amount` (và tách KHCN/KHDN nếu có bảo lãnh) |

---

## 7. Checklist cấu hình trên form / DB mới

- [x] Công thức kéo: FIXED gần nhất + PER_UNIT các bậc sau `to` của FIXED đó (PTI 2 dòng `[0,10]`+`[10,9999]` vẫn đúng; xen kẽ bỏ bậc trước FIXED gần nhất) — **đã chốt**
- [x] Bỏ nhóm G — cấu hình `vehicleType` + `seat_number` / `load_capacity` (AND)  
- [x] Cẩu ngửa > 150m — **luôn lấy giá MAX**, FIXED  
- [ ] Tạo `fee_table` PTI — `CUSTOMER_BUSINESS`  
- [ ] Seed tiêu chí + ~142 price lines + 7 surcharge  
- [ ] Chốt VAT: lưu chưa VAT trên line; VAT ở lớp charge/thu  
- [ ] Không nhầm với `rescue_order_payment` khi chỉnh tay số trên đơn  

---

*File cấu hình dạng bảng — phục vụ review BA trước khi nhập DB / seed mock.*
