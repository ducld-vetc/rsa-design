# Tasco CRM Preview (web riêng)

## Chạy local (khuyến nghị)

Dùng **http://127.0.0.1:5180** (không dùng `localhost` nếu IDE báo Connection Failed):

```bash
npm install
npm run dev:crm
```

Trình duyệt mở: **http://127.0.0.1:5180/**

### Nếu vẫn Connection Failed

**Cách 1 — Preview bản build (ổn định nhất):**

```bash
npm run start:crm
```

**Cách 2 — Vite preview:**

```bash
npm run build:crm
npm run preview:crm
```

Mở đúng URL in trong terminal (thường `http://127.0.0.1:5180/`).

## Luồng màn hình

Chỉ **một màn Báo cáo**. **Đánh giá KH** mở dạng panel bên phải khi:

- Bấm **Đánh giá KH** (toolbar) hoặc
- Double-click một dòng

## Deploy

```bash
npm run build:crm
```

Upload thư mục **`crm-web/dist/`** lên domain riêng. Cấu hình SPA: mọi path → `index.html`.
