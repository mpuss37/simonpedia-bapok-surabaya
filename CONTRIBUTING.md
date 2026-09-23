# Panduan Kontribusi — SIMONPEDIA Bapok Surabaya

Terima kasih mau ikut mengembangkan project ini. Panduan ini menjelaskan cara
menyiapkan project di komputermu, cara mengirim perubahan, dan aturan yang
dipakai tim.

> **Catatan alur branch:** untuk sementara semua pekerjaan memakai branch
> `main`. Kalau nanti tim bertambah besar, kita bisa pindah ke alur
> `fitur/xxx` → PR → `main`. Panduan akan diperbarui kalau itu terjadi.

---

## 1. Prasyarat

- Node.js versi 20 ke atas dan npm
- Git
- PostgreSQL — boleh lokal, tapi lebih mudah pakai cloud gratis seperti
  Neon (lihat `DEPLOY_VERCEL.md`)
- Akun GitHub

---

## 2. Jadi Collaborator

1. Owner repo mengundangmu: **Settings → Collaborators → Add people**.
2. Kamu akan dapat email/notifikasi GitHub. Klik **Accept invitation**.
3. Setelah diterima, kamu punya akses **Write** ke repo ini.

Kalau belum menerima undangan, cek juga folder spam di emailmu.

---

## 3. Clone Project

```bash
git clone https://github.com/mpuss37/simonpedia-bapok-surabaya.git
cd simonpedia-bapok-surabaya
```

---

## 4. Atur Identitas Git (PENTING)

Supaya kontribusimu tercatat benar di GitHub, pastikan nama dan email Git
sama dengan akun GitHub-mu:

```bash
git config --global user.name "Nama GitHub Kamu"
git config --global user.email "email-github-kamu@example.com"
```

Email ini bisa dilihat di https://github.com/settings/emails. Kalau tidak
ingin memakai email pribadi, GitHub menyediakan email `noreply` khusus.

Kalau email Git dan email GitHub berbeda, commitmu tetap masuk ke repo, tapi
tidak akan terhitung sebagai kontribusimu di grafik kontributor.

---

## 5. Setup Project di Lokal

```bash
npm install
```

Buat file `.env` di root (contoh lengkap ada di `.env.example`):

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
VITE_API_URL=
```

Keterangan:
- `DATABASE_URL` — connection string PostgreSQL (Neon atau lokal).
- `VITE_API_URL` — biarkan kosong. Frontend otomatis memakai path `/api`.

Siapkan database:

```bash
npx prisma generate
npx prisma migrate deploy        # atau: npx prisma migrate dev
npm run db:seed                  # opsional, untuk mengisi data awal
```

Jalankan aplikasi (butuh dua terminal):

```bash
# Terminal 1 — backend (port 3001)
npm run dev:api

# Terminal 2 — frontend (port 5173)
npm run dev
```

Lalu buka http://localhost:5173

> Frontend saat mode dev meneruskan request `/api` ke backend port 3001
> (lihat `vite.config.ts`). Jadi kamu cukup membuka satu alamat saja.

---

## 6. Struktur Project

```
src/         Frontend React + Vite + Tailwind
server/      Backend Express + Prisma + PostgreSQL
  prisma/    Schema dan migrasi database
  src/       Route API
api/         Serverless function untuk deploy di Vercel
docs/        Dokumen proyek (BPMN, dsb.)
```

---

## 7. Cara Mengirim Perubahan

Karena sementara memakai `main`, alurnya sederhana:

```bash
git pull origin main            # pastikan kode terbaru dulu
# kerjakan perubahan...
git add .
git commit -m "feat: deskripsi singkat"
git push origin main
```

**Tips:** kalau mengerjakan sesuatu yang cukup besar, lebih aman buat branch
sendiri dulu supaya `main` tetap stabil:

```bash
git checkout -b fitur/nama-singkat
# kerjakan, commit, lalu push
git push -u origin fitur/nama-singkat
```

Setelah itu ajukan **Pull Request** dari branch kamu ke `main` agar bisa
diperiksa dulu sebelum digabung.

---

## 8. Standar Kode & Commit

- Bahasa: **TypeScript**. Jalankan pemeriksaan tipe sebelum kirim:
  ```bash
  npx tsc -b
  ```
- **Lint**: `npx eslint src/` — usahakan bersih tanpa error.
- Format pesan commit (Conventional Commits):
  ```
  feat: fitur baru
  fix: perbaikan bug
  refactor: ubah kode tanpa mengubah perilaku
  docs: perubahan dokumentasi
  ```
- Satu commit/kontribusi sebaiknya fokus pada satu hal.
- **Jangan pernah** commit file `.env`, token, atau kredensial apa pun.

---

## 9. Checklist Sebelum Mengirim

- [ ] `npx tsc -b` lolos tanpa error
- [ ] `npx eslint src/` bersih
- [ ] `npm run build` berhasil
- [ ] Tidak ada file `.env` atau token yang ikut ter-commit
- [ ] Pesan commit jelas dan sesuai format

---

## 10. Ambil Update Terbaru

```bash
git checkout main
git pull origin main
```

Kalau sedang bekerja di branch sendiri dan ingin menggabungkan update terbaru:

```bash
git checkout fitur/nama-singkat
git merge main
```

---

## 11. Butuh Bantuan?

Buka **Issue** di repo ini dan jelaskan kendalanya. Sertakan pesan error dan
langkah yang sudah kamu coba supaya lebih mudah dibantu.
