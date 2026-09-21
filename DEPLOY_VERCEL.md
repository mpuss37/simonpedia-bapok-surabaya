# Panduan: Connect PostgreSQL ke Vercel

Panduan menghubungkan database PostgreSQL ke aplikasi Simonpedia Bapok Surabaya
yang di-deploy di Vercel.

## Arsitektur

Project ini fullstack dalam **satu repo**:

```
Frontend (React/Vite)  ──┐
                         ├──►  Vercel
Backend  (Express API) ──┘         │
  /api/*  ──►  api/index.ts (Serverless Function)
                    │
                    ▼
              PostgreSQL (Neon)
              via DATABASE_URL
```

- **Frontend**: di-build oleh Vite ke `dist/`, disajikan sebagai static site.
- **Backend**: Express (`server/src/`) dibungkus oleh serverless function
  `api/index.ts`. Semua request `/api/*` diarahkan ke sini lewat `vercel.json`.
- **Database**: PostgreSQL di cloud (Neon/Vercel Postgres) diakses lewat
  `DATABASE_URL`. Postgres `localhost` tidak bisa diakses dari Vercel.

---

## Langkah 1 — Buat Database PostgreSQL di Neon (gratis)

1. Buka https://neon.tech lalu sign up (bisa login pakai GitHub).
2. Buat project baru, pilih region terdekat (mis. Singapore).
3. Setelah project dibuat, copy **Connection string**.
   - **Gunakan yang ada kata `-pooler`** pada host-nya, karena serverless
     membuka banyak koneksi singkat. Contoh:
     ```
     postgresql://neondb_owner:xxxx@ep-cool-name-123456-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
   - String **wajib** diakhiri `?sslmode=require`.

> Alternatif: **Vercel Postgres** = Neon yang di-manage dari dashboard Vercel.
> Tab **Storage** → **Create Database** → **Postgres**. Connection string
> otomatis muncul dan otomatis ter-set sebagai env var di project.

## Langkah 2 — Push schema ke database cloud

Jalankan dari root project (lokal), isi dulu `DATABASE_URL` sementara:

```bash
# Linux/macOS
DATABASE_URL="postgresql://...neon.../neondb?sslmode=require" npx prisma migrate deploy

# Windows PowerShell
$env:DATABASE_URL="postgresql://...neon.../neondb?sslmode=require"; npx prisma migrate deploy
```

Ini membuat semua tabel di database Neon dari `server/prisma/migrations`.

Kalau kamu juga ingin mengisi data awal (seed):

```bash
DATABASE_URL="postgresql://...neon.../neondb?sslmode=require" npm run db:seed
```

## Langkah 3 — Set Environment Variable di Vercel

1. Buka project di https://vercel.com → **Settings** → **Environment Variables**.
2. Tambahkan:

   | Name           | Value                                             | Environment        |
   |----------------|---------------------------------------------------|--------------------|
   | `DATABASE_URL` | connection string Neon (yang `-pooler`)           | Production, Preview, Development |

3. **Jangan** set `VITE_API_URL` — biarkan kosong supaya frontend memakai
   path relatif `/api` (satu domain dengan serverless function).

4. Klik **Save**.

## Langkah 4 — Deploy

Karena kode sudah berubah, deploy ulang:

```bash
git add .
git commit -m "feat: serverless API + PostgreSQL via Vercel"
git push
```

Vercel otomatis build & deploy. Kalau pakai CLI: `vercel --prod`.

Saat build, `npm run build` menjalankan `prisma generate` lebih dulu supaya
Prisma Client tersedia untuk serverless function.

## Langkah 5 — Verifikasi

1. Buka `https://<domain-kamu>.vercel.app/api/health`
   → harus muncul `{"status":"ok","message":"SIMONPEDIA API is running"}`.
2. Buka halaman utama → data harga/EWS harus muncul (bukan kosong).
3. Cek **Vercel → Deployments → Functions → api/index** untuk melihat log
   kalau ada error.

---

## Troubleshooting

| Masalah | Penyebab & Solusi |
|---------|-------------------|
| `Can't reach database server` | `DATABASE_URL` salah / belum di-set di Vercel. Pastikan pakai host `-pooler` + `sslmode=require`. |
| `PrismaClientInitializationError` | Prisma Client tidak ter-generate. Pastikan `build` menjalankan `prisma generate` dan `@prisma/client` ada di dependencies root. |
| Halaman kosong / fetch gagal | Frontend masih menembak `localhost:3001`. Pastikan `VITE_API_URL` **tidak** di-set di Vercel (biar `/api`). |
| `Too many connections` | Pakai connection string `-pooler` Neon, bukan yang direct. |
| `504 FUNCTION_INVOCATION_TIMEOUT` | Query terlalu lama. Naikkan `maxDuration` di `vercel.json`. |
| Prisma tidak menemukan schema | Sudah diatur via `package.json` → `"prisma": { "schema": "server/prisma/schema.prisma" }`. |

## Catatan Dev Lokal

- Frontend: `npm run dev` (Vite, biasanya port 5173)
- Backend: `npm run dev:api` (Express, port 3001)
- Saat mode dev, frontend otomatis menembak `http://localhost:3001/api`
  (lihat `src/services/api.ts`). Tidak perlu mengisi `VITE_API_URL`.
