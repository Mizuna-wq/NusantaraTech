# NusantaraTech Recruitment

Website karir dan internship NusantaraTech (perusahaan fiktif). Kandidat mencari lowongan, mengunggah CV, melamar, dan memantau status. HR mengelola lowongan dan pelamar. Hanya untuk penggunaan lokal.

Stack: React + Vite + React Router, Express 5, MySQL, JWT, bcrypt, Multer, Nodemailer.

## Prasyarat
- Node.js 18.11 atau lebih baru
- MySQL berjalan di localhost:3306

## Menjalankan

### 1. Database
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend (http://localhost:3000)
```bash
cd backend
cp .env.example .env
```
Isi `.env`: `DB_PASSWORD` dan `JWT_SECRET`. Untuk membuat JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Lalu:
```bash
npm install
npm run seed     # membuat akun HR dan 6 lowongan contoh
npm run dev
```
Akun HR dari seed: `hr@nusantaratech.id` / `Admin12345` (bisa diganti lewat `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env` sebelum seed).

### 3. Frontend (http://localhost:5173)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Email (opsional)
Isi `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` di `backend/.env`. Jika dikosongkan, aplikasi tetap berjalan dan email hanya dicatat di log sebagai "tidak dikirim".
Untuk mencoba tanpa akun email sungguhan, pakai layanan SMTP uji seperti Mailtrap atau Ethereal.

Email dikirim saat: lamaran terkirim, status menjadi Interview, Accepted, atau Rejected.

## Pengujian alur lengkap

Otomatis (backend dan database harus berjalan, seed sudah dijalankan):
```bash
cd backend
npm run test:workflow
```
Skrip ini menguji 50-an langkah lewat API: registrasi, login, otorisasi role, CRUD lowongan, upload CV (termasuk file salah format dan terlalu besar), melamar, pencegahan lamaran ganda, perubahan status, timeline, catatan internal, unduh CV, dan dashboard.

Manual lewat browser:
1. Buka `/karir`: 6 lowongan contoh tampil. Coba cari "React", filter lokasi, dan filter jenis.
2. Buka salah satu lowongan, klik Lamar Sekarang tanpa login: diarahkan ke login.
3. Daftar akun kandidat, lalu kembali ke form lamaran. Isi profil dan unggah CV di menu CV Saya.
4. Kirim lamaran. Coba lamar lagi: ditolak.
5. Login sebagai HR di jendela lain (atau mode incognito). Buka Pelamar, buka detail, ubah status ke Screening lalu Interview dengan catatan, dan simpan catatan internal.
6. Kembali ke akun kandidat: timeline menampilkan perubahan status dan catatan, tanpa catatan internal.
7. Coba tombol "Ciutkan menu" di bawah sidebar (desktop): sidebar mengecil menjadi deretan ikon dan pilihannya diingat browser. Kecilkan jendela ke lebar ponsel: sidebar berubah menjadi drawer yang dibuka dari tombol menu di atas.

## Struktur
```
backend/
  database/        schema.sql, seed.js
  scripts/         workflow-test.js
  src/
    config/        db.js (pool + transaksi), paths.js
    controllers/   auth, job, candidate, cv, application, dashboard
    routes/        satu file per fitur
    middleware/    auth (JWT + role), upload (Multer), validate, errorHandler
    services/      emailService, emailTemplates
    utils/         AppError, response, validators, constants, html, pagination
  uploads/cv/      file CV (tidak dibuka sebagai file statis)
frontend/src/
  components/ (Sidebar, StatCard, ...)  hooks/  layouts/ (AppShell = sidebar + isi)  pages/{public,candidate,admin}/  routes/  services/  utils/  styles/
```

## Endpoint utama
| Method | Path | Akses |
| --- | --- | --- |
| POST | /api/auth/register, /api/auth/login | publik |
| GET | /api/auth/me, PUT /api/auth/password | login |
| GET | /api/jobs, /api/jobs/filters, /api/jobs/:id | publik (hanya published) |
| GET | /api/jobs/admin/all | HR |
| POST, PUT, DELETE | /api/jobs, /api/jobs/:id | HR |
| PATCH | /api/jobs/:id/status | HR |
| GET, PUT | /api/candidates/:id | pemilik (HR hanya GET) |
| GET, POST | /api/cv | kandidat |
| DELETE | /api/cv/:id | kandidat |
| GET | /api/cv/:id/download | pemilik CV, atau HR untuk CV pelamar |
| GET, POST | /api/applications | kandidat (milik sendiri) / HR (semua) |
| GET | /api/applications/:id | pemilik atau HR |
| PUT | /api/applications/:id/status, /notes | HR |
| GET | /api/dashboard | kandidat atau HR |

Format response: `{ "success": true, "message": "...", "data": {} }` atau `{ "success": false, "message": "..." }`.

## Catatan desain
- Status lamaran: `submitted`, `screening`, `interview`, `technical_test`, `accepted`, `rejected`. Timeline kandidat diambil dari tabel `application_status_history`.
- "Dalam proses" = lamaran yang belum accepted atau rejected.
- Lowongan tampil di publik jika `published` dan belum lewat deadline. Lowongan yang sudah punya pelamar tidak bisa dihapus (ubah menjadi closed).
- CV lama yang sudah dipakai melamar tetap disimpan agar HR masih bisa membukanya.
- Poin tanggung jawab, kualifikasi, dan benefit ditulis satu poin per baris.
- Menu Perusahaan (HR) hanya menampilkan data tetap dari `frontend/src/utils/constants.js`. Blog menampilkan status kosong karena belum ada fitur artikel.
- Posisi populer di beranda diambil dari lowongan dengan pelamar terbanyak.
