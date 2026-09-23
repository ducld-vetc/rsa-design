# Analysis — Nội dung thay đổi (auto) — bảng kiểm soát theo field

**Ngày:** 2026-09-23  
**UI:** Lịch sử bảng phí → cột **Nội dung thay đổi**  
**Trigger:** Publish version N (diff vs N−1)  
**Trạng thái chốt BA:** Đề xuất sẵn — review trên Canvas lọc theo nhóm; điền cột **Chốt** khi workshop.

> **Canvas kiểm soát (lọc nhóm / Auto):** [fee-changelog-control.canvas.tsx](/Users/admin/.cursor/projects/Users-admin-Documents-RSA/canvases/fee-changelog-control.canvas.tsx)

---

## A. Quy ước chung (chốt 1 lần)

| # | Quy ước | Giá trị đề xuất | Chốt (OK / Sửa / Bỏ) | Ghi chú BA |
|---|---------|-----------------|----------------------|------------|
| A1 | Thời điểm sinh | Lúc publish / activate | OK* | *đề xuất |
| A2 | Lưu kết quả | `fee_table_version.changes_json` (string[]) | OK* | |
| A3 | Version 1 | `["Phát hành lần đầu bảng phí"]` | OK* | |
| A4 | Khóa dòng giá | `serviceDetail` + `segmentType` + hash(conditions) | OK* | |
| A5 | Khóa phụ phí | `name` + `type` + hash(conditions) | OK* | |
| A6 | Format tiền | `en-US` (`500,000`) | OK* | |
| A7 | Format hệ số | Thập phân ngắn (`1.15`) | OK* | |
| A8 | Cap bullet | Tối đa **12**; dư thì gộp | OK* | |
| A9 | Ngưỡng gộp cùng loại | ≥ **5** dòng → 1 câu gộp | OK* | |
| A10 | `note` Ops | Tách riêng / không hiện trong cột này | OK* | |
| A11 | Ops sửa bullet trước activate | Không | OK* | |

---

## B. Bảng kiểm soát field → câu auto

**Cách dùng:** điền cột **Chốt** = `OK` \| `Sửa` \| `Bỏ`.  
**Auto** = có sinh bullet khi field đổi.  
**Ưu tiên** = thứ tự sắp xếp list (1 trước).

| Nhóm | # | Field UI | Path | Auto | Event | Mẫu câu | Gộp khi | Ưu tiên | Chốt | Ghi chú |
|------|---|----------|------|------|-------|---------|---------|---------|------|--------|
| Meta | M01 | Mã bảng | `code` | Có | Đổi | `Đổi mã bảng {old} → {new}` | — | 1 | | Hiếm |
| Meta | M02 | Tên bảng | `name` | Có | Đổi | `Đổi tên bảng «{old}» → «{new}»` | — | 1 | | |
| Meta | M03 | Đối tượng tính | `target` | Có | Đổi | `Đổi đối tượng tính {old} → {new}` | — | 1 | | |
| Meta | M04 | Loại đối tượng | `objectType` | Có | Đổi | `Đổi loại đối tượng {old} → {new}` | — | 1 | | |
| Meta | M05 | Doanh nghiệp | `scope.corporateCustomerId` | Có | Gán | `Gán DN {id}` | — | 1 | | |
| Meta | M05 | Doanh nghiệp | `scope.corporateCustomerId` | Có | Đổi | `Đổi DN {old} → {new}` | — | 1 | | |
| Meta | M05 | Doanh nghiệp | `scope.corporateCustomerId` | Có | Gỡ | `Gỡ DN áp dụng` | — | 1 | | |
| Meta | M06 | Đối tác cứu hộ | `scope.partnerId` | Có | Gán | `Gán đối tác {id — name}` | — | 1 | | |
| Meta | M06 | Đối tác cứu hộ | `scope.partnerId` | Có | Đổi | `Đổi đối tác {old} → {new}` | — | 1 | | |
| Meta | M06 | Đối tác cứu hộ | `scope.partnerId` | Có | Gỡ | `Gỡ đối tác` | — | 1 | | |
| Meta | M07 | Đối tượng áp dụng | `applyFor` | Có | Đổi | `Đổi đối tượng áp dụng «{old}» → «{new}»` | — | 1 | | |
| Meta | M08 | Loại đơn | `orderType` | Có | Đổi | `Đổi loại đơn {Đơn gói\|Đơn lẻ}` | — | 1 | | |
| Meta | M09 | Trạng thái | `status` | Có | Đổi | `Đổi trạng thái {old} → {new}` | — | 1 | | Ngoài nội dung version? |
| Meta | M10 | Phiên bản | `version` | **Không** | — | — | — | — | | Hệ thống |
| Meta | M11 | Hiệu lực từ | `validFrom` | Có | Đổi | `Đổi hiệu lực từ {old} → {new}` | Gộp M11+M12 nếu cùng lúc | 1 | | |
| Meta | M12 | Hiệu lực đến | `validTo` | Có | Đổi | `Đổi hiệu lực đến {old} → {new}` | `Đổi hiệu lực {oldFrom}→{oldTo} thành {newFrom}→{newTo}` | 1 | | |
| Settings | S01 | Hệ số giá khách lẻ | `settings.retailMarkupFactor` | Có | Đổi | `Đổi hệ số giá khách lẻ ×{old} → ×{new}` | — | 2 | | |
| Settings | S02 | Quy tắc làm tròn | `settings.roundMode` | Có | Đổi | `Đổi quy tắc làm tròn {old} → {new}` | — | 2 | | |
| Settings | S03 | Cách tính hệ số phụ phí | `settings.stackSurcharges` | Có | Đổi | `Đổi ghép phụ phí {STACK\|MAX} → …` | — | 2 | | |
| Settings | S04 | Giá đã bao gồm VAT? | `settings.includesVat` | Có | Bật/Tắt | `Bật/Tắt giá đã gồm VAT` | — | 2 | | |
| Settings | S05 | Bảng fallback | `settings.isFallback` | Có | Bật/Tắt | `Bật/Tắt bảng fallback` | — | 2 | | |
| Catalog TC | C01 | Tiêu chí giá (tick) | `priceCriteria[]` | Có | Thêm | `Thêm tiêu chí giá: {label}` | ≥4 → `Cập nhật {k} tiêu chí giá` | 3 | | |
| Catalog TC | C02 | Tiêu chí giá (tick) | `priceCriteria[]` | Có | Gỡ | `Gỡ tiêu chí giá: {label}` | như trên | 3 | | |
| Catalog TC | C03 | Cấu hình tiêu chí | `priceCriteria.*` | Có | Sửa | `Cập nhật cấu hình tiêu chí {label}` | như trên | 3 | | |
| Catalog DV | D01 | Đầu dịch vụ | catalog / serviceRules head | Có | Bật | `Thêm đầu dịch vụ {detail}` | — | 3 | | Không liệt kê dòng con |
| Catalog DV | D02 | Đầu dịch vụ | catalog / serviceRules head | Có | Gỡ | `Gỡ đầu dịch vụ {detail}` | — | 3 | | |
| Catalog PP | P01 | Đầu phụ phí | surcharge head | Có | Bật | `Thêm phụ phí {name}` | — | 3 | | |
| Catalog PP | P02 | Đầu phụ phí | surcharge head | Có | Gỡ | `Gỡ phụ phí {name}` | — | 3 | | |
| Đơn giá | L01 | Loại đoạn giá | `segmentType` | Có | Đổi | `Đổi loại đoạn {detail} Đơn lẻ ↔ Bậc thang` | Nhiều dòng cùng đầu → 1 câu | 4 | | |
| Đơn giá | L02 | Phương pháp tính | `pricingMode` | Có | Đổi | `Đổi cách tính {detail}{cond} Cố định ↔ Theo đơn vị` | ≥5 cùng detail → gộp | 4 | | |
| Đơn giá | L03 | Mức giá | `basePrice` | Có | Tăng | `Tăng giá {detail}{cond} {old} → {new}` | ≥5 → `Cập nhật giá {k} dòng {detail}` | 4 | | |
| Đơn giá | L04 | Mức giá | `basePrice` | Có | Giảm | `Giảm giá {detail}{cond} {old} → {new}` | như trên | 4 | | |
| Đơn giá | L05 | Đơn vị | `unit` | Có | Đổi | `Đổi đơn vị tính {detail}{cond} {old} → {new}` | — | 4 | | |
| Đơn giá | L06 | Điều kiện dòng | `conditions[]` | Có | Sửa hash | `Sửa điều kiện dòng giá {detail}: {tóm tắt}` | 1 bullet / dòng | 4 | | cond ≤2 chip |
| Đơn giá | L07 | Dòng giá | rule | Có | Thêm | `Thêm dòng giá {detail}{cond} — {price} ({mode})` | ≥5 → `Thêm {k} dòng giá {detail}` | 4 | | |
| Đơn giá | L08 | Dòng giá | rule | Có | Xóa | `Xóa dòng giá {detail}{cond}` | ≥5 → `Xóa {k} dòng giá {detail}` | 4 | | |
| Đơn giá | L09 | Thứ tự kéo-thả | order | **Không** | Đổi | — | — | — | | Không ảnh hưởng giá |
| Đơn giá | L10 | Bộ lọc tab | UI only | **Không** | — | — | — | — | | |
| Phụ phí | R01 | Điều kiện / khung giờ | `conditions[].value` | Có | Đổi | `Đổi điều kiện phụ phí {name}: {old} → {new}` | ≥4 cùng name → gộp | 5 | | |
| Phụ phí | R02 | Kiểu | `type` | Có | Đổi | `Đổi kiểu phụ phí {name} Cố định ↔ Hệ số` | — | 5 | | |
| Phụ phí | R03 | Giá trị (FIXED) | `value` | Có | Đổi | `Đổi phụ phí {name} {old} → {new} đ` | ≥4 → `Điều chỉnh {k} dòng phụ phí {name}` | 5 | | |
| Phụ phí | R04 | Hệ số (COEFF) | `value` | Có | Đổi | `Đổi phụ phí {name} hệ số {old} → {new}` | như trên | 5 | | |
| Phụ phí | R05 | Dòng trong nhóm | rule | Có | Thêm | `Thêm dòng điều kiện phụ phí {name}` | — | 5 | | |
| Phụ phí | R06 | Dòng trong nhóm | rule | Có | Xóa | `Xóa dòng điều kiện phụ phí {name}` | — | 5 | | |
| Hệ thống | X01 | `updatedAt` / `updatedBy` | meta | **Không** | — | — | — | — | | |
| Hệ thống | X02 | Hành động Import file | — | **Không** | — | — | — | — | | Chỉ diff kết quả cuối |
| Hệ thống | X03 | `note` Ops | `note` | **Không** | — | — | — | — | | Field riêng nếu có |

`{cond}` = rút gọn tối đa 2 tiêu chí, ví dụ `(mở cửa)`, `(0–10 km)`.

---

## C. Thứ tự hiển thị list (theo cột Ưu tiên)

| Ưu tiên | Nhóm |
|---------|------|
| 1 | Meta / hiệu lực / scope |
| 2 | Settings |
| 3 | Catalog (tiêu chí, đầu DV, đầu PP) |
| 4 | Đơn giá |
| 5 | Phụ phí |

---

## D. Ví dụ kiểm thử nhanh

| # | Thao tác trên form | Kỳ vọng Nội dung thay đổi | Pass? |
|---|--------------------|---------------------------|-------|
| T1 | Giá kéo mở cửa 450k → 500k | `Tăng giá Kéo xe (mở cửa) 450,000 → 500,000` | |
| T2 | Hệ số Đêm 1.1 → 1.15 | `Đổi phụ phí Đêm hệ số 1.1 → 1.15` | |
| T3 | Bật TIERED cả đầu Kéo xe | `Đổi loại đoạn Kéo xe → Bậc thang` (1 câu) | |
| T4 | Đổi chỉ bộ lọc tab Đơn giá | *(không có bullet)* | |
| T5 | Kéo thả đổi thứ tự 2 dòng | *(không có bullet)* | |
| T6 | Publish lần đầu (v1) | `Phát hành lần đầu bảng phí` | |
| T7 | Đổi 6 mức giá cùng đầu Kéo | `Cập nhật giá 6 dòng Kéo xe` | |

---

## E. Open points

| # | Câu hỏi | Phương án | Chốt |
|---|---------|-----------|------|
| E1 | Cột chỉ `changes[]`? | Chỉ auto list | |
| E2 | Ops sửa bullet trước activate? | Không | |
| E3 | Có `changes_json` trên DB? | Có | |
| E4 | Cap / ngưỡng gộp | 12 / 5 | |

---

## Kết luận

- Bảng **B** dùng để BA tick **Chốt** theo từng field.  
- **Sẵn sàng viết BRD:** sau khi cột Chốt (A + B + E) xong.  
- **Next:** implement `diffFeeTableVersions` theo các dòng `Auto = Có`.
