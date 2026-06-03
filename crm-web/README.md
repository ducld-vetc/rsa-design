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

### Vercel (khuyến nghị)

Repo đã có **`vercel.json`** ở thư mục gốc — chỉ build app CRM, không build portal chính.

1. Đăng nhập [vercel.com](https://vercel.com) → **Add New Project** → import repo GitHub/GitLab.
2. **Root Directory**: để **`.`** (gốc repo, không chọn `crm-web` — build cần `package.json` gốc và thư mục `pages/`).
3. Vercel đọc tự động:
   - **Build Command**: `npm run build:crm`
   - **Output Directory**: `crm-web/dist`
4. Deploy. Mọi route SPA đã rewrite về `index.html`.

Nếu tạo project thủ công trong dashboard, nhập đúng Build / Output như trên.

### Build thủ công

```bash
npm run build:crm
```

Upload thư mục **`crm-web/dist/`** lên host khác. Cấu hình SPA: mọi path → `index.html`.
