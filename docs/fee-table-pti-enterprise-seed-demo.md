# Demo dữ liệu bảng phí PTI (schema mới)

> Seed TypeScript: [`../data/feeTablePtiEnterpriseSeed.ts`](../data/feeTablePtiEnterpriseSeed.ts)  
> Spec nghiệp vụ: [`fee-table-pti-enterprise.md`](./fee-table-pti-enterprise.md)

**Thống kê seed:** 13 tiêu chí · 13 field map · 6 dịch vụ catalog · **142 dòng giá** (4 tại chỗ + **26** kéo + 112 cẩu) · **442** `fee_price_line_condition` · **7 phụ phí** · ví dụ 1 snapshot đơn.

**Model:** không nhóm G. Cột Excel “chỗ / tải” → line độc lập (pass/cargo). Kéo = **FIXED ≤10** + **PER_UNIT từ km 11**. Điều kiện trên cùng line = **AND**.

---

## A. `fee_table`

| id | code | name | target | kind | current_version | status |
|----|------|------|--------|------|-----------------|--------|
| ft-pti-001 | CUS-DN-PTI-2026 | Bảng phí KH DN — PTI (VETC × PTI) | CUSTOMER | CUSTOMER_BUSINESS | 1 | ACTIVE |

## B. `fee_table_version`

| id | fee_table_id | version | valid_from | valid_to | priority | status | note |
|----|--------------|---------|------------|----------|----------|--------|------|
| ftv-pti-v1 | ft-pti-001 | 1 | 2026-01-01 | 2026-12-31 | 200 | ACTIVE | pass/cargo AND, không nhóm G |

## C. `fee_table_scope`

| fee_table_version_id | enterprise_code | supplier_id | service_types_json |
|----------------------|-----------------|-------------|--------------------|
| ftv-pti-v1 | PTI | null | ["ONSITE","TOWING","CRANE"] |

## D. `fee_table_settings`

| fee_table_version_id | retail_markup_factor | round_mode | stack_surcharges | is_fallback |
|----------------------|----------------------|------------|------------------|-------------|
| ftv-pti-v1 | null | NEAREST_1000 | true | false |

---

## E. `fee_criterion_def` (rút gọn)

| key | label | value_type | values (rút) |
|-----|-------|------------|--------------|
| vehicleType | Loại xe khách | LIST | Xe chở người, Xe chở hàng |
| seat_number | Số chỗ | RANGE | — |
| load_capacity | Trọng tải (tấn) | RANGE | — |
| rescueVehicleType | Loại xe cứu hộ | LIST | Xe máy, Xe van, … (catalog; không gắn line PTI) |
| roadDistance | Khoảng cách so với mặt đất | RANGE | — |
| cranePosture | Tư thế xe cẩu (>150m) | LIST | Nghiêng, Ngửa |
| distanceKm | Quãng đường kéo | RANGE | — |
| areaTerrain | Địa hình khu vực | LIST | NORMAL, SUBURBAN, MOUNTAIN |
| isHighway | Cao tốc | LIST | YES, NO |
| timeWindow | Giờ yêu cầu cứu hộ | TIME | — |
| weather | Thời tiết / thiên tai | LIST | Bình thường, Mưa, Thiên tai / ngập… |
| locationType | Vị trí đặc biệt | LIST | ROAD, BASEMENT |
| extraEquipment | Thiết bị thêm | LIST | DOLLY, DOUBLE_JACK |

---

## F. `fee_criterion_field_map` (rút gọn)

| criterion_key | source_path | transform | scope |
|---------------|-------------|-----------|-------|
| vehicleType | vehicle.vehicleType | — | VEHICLE |
| seat_number | vehicle.seat_number | — | VEHICLE |
| load_capacity | vehicle.load_capacity | — | VEHICLE |
| rescueVehicleType | order.rescueVehicleType | — | ORDER |
| roadDistance | line.roadDistance | — | LINE |
| cranePosture | line.cranePosture | — | LINE |
| distanceKm | line.distanceKm | — | LINE |
| areaTerrain | order.areaTerrain | — | ORDER |
| isHighway | order.highwayRoute | BOOL_OR_ROUTE_TO_YES_NO | ORDER |
| timeWindow | order.requestTime | — | ORDER |
| weather | order.weather | UI_WEATHER_TO_LABEL | ORDER |
| locationType | order.locationType | — | ORDER |
| extraEquipment | line.extraEquipment | — | LINE |

### F1. Cách cấu hình chỗ / tải + km kéo (AND, không nhóm G)

| Loại dòng | Conditions (AND) | Cách tính |
|-----------|------------------|-----------|
| Kéo FIXED | `vehicleType` + chỗ/tải + `distanceKm BETWEEN [0,10]` | **Theo lượt** — giá mở cửa |
| Kéo PER_UNIT | cùng xe + `distanceKm BETWEEN [10,9999]` | **Theo đơn vị** — đ/km × (km − 10) |
| Cẩu | `vehicleType` + chỗ/tải + `roadDistance BETWEEN [from,to]` (+ `cranePosture` nếu >150m) | FIXED |

Cột Excel “2–12 chỗ / tải ≤1,4 tấn” → 2 nhánh xe × 2 dòng km = **4** `fee_price_line`.

**Ví dụ chạy (15 km, xe chở người 5 chỗ)**

```
→ khớp FIXED  fpl-pti-tow-pass-2-12-le10   = 600.000
→ khớp PER_UNIT fpl-pti-tow-pass-2-12-from11 = 20.000 × (15−10) = 100.000
→ tổng base 700.000
```

---

## G. `fee_service_catalog`

| id | code | name | service_type |
|----|------|------|--------------|
| 101 | ONSITE_JUMP | Kích bình | ONSITE |
| 102 | ONSITE_PATCH | Vá lốp tại chỗ | ONSITE |
| 103 | ONSITE_SPARE | Thay lốp dự phòng | ONSITE |
| 104 | ONSITE_FUEL | Cung cấp nhiên liệu (…) | ONSITE |
| 201 | TOW_GENERIC | Kéo xe | TOWING |
| 301 | CRANE_GENERIC | Cẩu xe | CRANE |

---

## H. `fee_price_line` + `fee_price_line_condition`

**Mục đích line:** giá + mode. **Value tiêu chí** nằm ở condition (AND).

### H1. Tại chỗ (4 dòng) — không condition

| id | service_name | base_price |
|----|--------------|------------|
| fpl-pti-onsite-1…4 | Kích bình / Vá lốp / … | 400k / 300k |

### H2. Kéo xe (26 dòng) — FIXED + PER_UNIT

| id | mode | base | distanceKm | conditions AND (xe) |
|----|------|------|------------|---------------------|
| fpl-pti-tow-pass-2-12-le10 | FIXED | 600000 | [0,10] | người + seat [2,12] |
| fpl-pti-tow-pass-2-12-from11 | PER_UNIT | 20000 | [10,9999] | người + seat [2,12] |
| fpl-pti-tow-cargo-0-1_4-le10 | FIXED | 600000 | [0,10] | hàng + load [0,1.4] |
| fpl-pti-tow-cargo-0-1_4-from11 | PER_UNIT | 20000 | [10,9999] | hàng + load [0,1.4] |
| … | … | … | … | … |

### H3. Cẩu xe (112 dòng) — mẫu

| id | base_price | conditions AND |
|----|------------|----------------|
| fpl-pti-crane-0-5-pass-2-12 | 1000000 | người ∧ seat[2,12] ∧ roadDistance [0,5] |
| fpl-pti-crane-5-10-pass-2-12 | 1650000 | người ∧ seat[2,12] ∧ roadDistance [5,10] |
| fpl-pti-crane-gt150-upright-cargo-18.01-25 | 60500000 | hàng ∧ load ∧ roadDistance [150,9999] ∧ Ngửa |

### H4. `fee_price_line_condition` — mẫu kéo

| fee_price_line_id | criterion_key | operator | value_json |
|-------------------|---------------|----------|------------|
| …-le10 | vehicleType | = | `"Xe chở người"` |
| …-le10 | seat_number | BETWEEN | `[2,12]` |
| …-le10 | distanceKm | BETWEEN | `[0,10]` |
| …-from11 | vehicleType | = | `"Xe chở người"` |
| …-from11 | seat_number | BETWEEN | `[2,12]` |
| …-from11 | distanceKm | BETWEEN | `[10,9999]` |

---

## I. `fee_surcharge_rule` + `fee_surcharge_condition`

| id | name | type | value | exclusive_group | apply_service_types | condition |
|----|------|------|-------|-----------------|---------------------|-----------|
| fsr-pti-mountain | Miền núi | COEFFICIENT | 1.5 | AREA | all | areaTerrain = MOUNTAIN |
| fsr-pti-suburban | Ngoại thành | COEFFICIENT | 1.1 | AREA | all | areaTerrain = SUBURBAN |
| fsr-pti-highway | Cao tốc | COEFFICIENT | 1.3 | — | all | isHighway = YES |
| fsr-pti-night | Cứu hộ đêm | COEFFICIENT | 1.2 | — | all | timeWindow BETWEEN 18:00–06:00 |
| fsr-pti-disaster | Thiên tai / ngập… | COEFFICIENT | 1.3 | — | all | weather = Thiên tai / ngập… |
| fsr-pti-basement | Cứu hộ dưới hầm | FIXED | 500000 | — | TOWING, CRANE | locationType = BASEMENT |
| fsr-pti-dolly | Kích kép / Dolly | FIXED | 200000 | — | all | extraEquipment IN (DOLLY, DOUBLE_JACK) |

---

## J. Snapshot đơn demo

| id | order | table | ver | mode | context |
|----|-------|-------|-----|------|---------|
| rofs-demo-001 | 900001 | CUS-DN-PTI-2026 | 1 | BUSINESS | PTI, xe chở người, 5 chỗ, kéo 15km, 22:00 |

| service | fixed | coeff | customer_amount | matched | note |
|---------|-------|-------|-----------------|---------|------|
| Kéo xe | 700000 | 1.2 | **840000** | le10 + from11 | FIXED gần nhất 600k + PER_UNIT 20k×5; ×1.2 đêm |

---

```
fee_table (CUS-DN-PTI-2026)
  └─ fee_table_version v1
       ├─ scope / settings
       ├─ fee_price_line (onsite / tow-pass|cargo / crane-pass|cargo)
       │    └─ fee_price_line_condition (AND: vehicleType + seat|load [+ depth])
       └─ fee_surcharge_rule + condition
```
