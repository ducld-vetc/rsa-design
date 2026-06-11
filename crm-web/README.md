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

Repo có **2 app** deploy lên **2 domain riêng** trên Vercel (cùng Git repo — mỗi lần push sẽ build cả hai):

| App | Config | Build | Output | Domain (ví dụ) |
|-----|--------|-------|--------|----------------|
| **CRM** (màn này) | `vercel.json` | `npm run build:crm` | `crm-web/dist` | `crm-xxx.vercel.app` |
| **Portal** (cổng đại lý) | `vercel.portal.json` | `npm run build` | `dist` | `portal-xxx.vercel.app` |

### Vercel — Project CRM

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo.
2. **Root Directory**: **`.`** (gốc repo — build cần `package.json` gốc và `pages/`).
3. **Config File**: `vercel.json` (mặc định).
4. Gán domain CRM (Settings → Domains).

### Vercel — Project Portal (app `npm run dev`)

1. **Add New Project** → import **cùng repo** lần nữa (2 project, 1 repo).
2. **Root Directory**: **`.`**
3. **Settings → General → Config File**: đặt **`vercel.portal.json`**
4. Build / Output (nếu không đọc config): `npm run build` → `dist`
5. **Environment Variables** (nếu dùng Gemini): thêm `GEMINI_API_KEY` cho project Portal.
6. Gán domain Portal riêng (Settings → Domains).

Mỗi lần push lên Git, Vercel deploy **song song** 2 project → 2 domain khác nhau.

### Build thủ công

```bash
npm run build:crm
```

Upload thư mục **`crm-web/dist/`** lên host khác. Cấu hình SPA: mọi path → `index.html`.
