# Tasco CRM Preview

Web riêng, không dùng portal RSA.

## Chạy

```bash
npm run dev:crm
```

URL: **http://127.0.0.1:5180/**

Lỗi Connection Failed → `npm run start:crm`

## Màn hình

- **Báo cáo chi tiết xe dịch vụ** (màn chính)
- **Đánh giá KH sau sửa chữa** — panel trên báo cáo (Detail / double-click dòng)

Xem [crm-web/README.md](../crm-web/README.md) để deploy.

## Tài liệu API & tích hợp

- [Tasco-CRM-API.md](./Tasco-CRM-API.md) — 3 API + validation
- [Tasco-CRM-integration-flow.md](./Tasco-CRM-integration-flow.md) — luồng 2 bên (Mermaid)
- [Tasco-CRM-openapi.yaml](./Tasco-CRM-openapi.yaml) — OpenAPI 3.0
