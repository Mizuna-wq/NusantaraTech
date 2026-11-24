# Panduan Menjalankan Aplikasi NusantaraTech Recruitment

> Platform rekrutmen sebagai **pihak ketiga**: kandidat, HR, dan admin.  
> Tujuan: kandidat unggah CV (dan sistem membaca skill/ijazah/sertifikat), sistem merekomendasikan lowongan relate; HR hanya lihat data perusahaan miliknya.

---

## 1. Prasyarat (hanya untuk laptop kamu)

- **Node.js** 18.11 atau lebih baru (`node -v`)
- **MySQL** berjalan di `localhost:3306` (`mysql -u root -e "SELECT 1;"`)
- **npm** (bundled dengan Node)

> Lingkungan koding (Termux/Android) ini: Node 26.4, npm 11, tapi **tidak ada MySQL** dan **tidak ada jaringan**. Backend & frontend `node_modules` sudah ter-install di sini; untuk menjalankan penuh di laptop kamu perlu MySQL + internet.

---

## 2. Install & Konfigurasi di Laptop

### 1) Siapkan file `.env` di folder `backend`

```bash
cd backend
cp .env.example .env
```

Isi minimal `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<password-mu-mysql>
DB_NAME=recruitment_db
JWT_SECRET=<random-32-64-haritera>
JWT_EXPIRES_IN=7d
# SMTP_HOST=, SMTP_PORT=, SMTP_USER=, SMTP_PASS=, SMTP_FROM= (opsional)
```

Cek secret JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `backend/.env` dan `backend/uploads/` di-ignore git. Jangan commit.

### 2) Siapkan database

```bash
mysql -u root -p < backend/database/schema.sql
```

Jika `DB_NAME` di `.env` bukan `recruitment_db`, ganti juga nama database di schema.

### 3) Install dependency backend

```bash
cd backend
npm install
```

### 4) (Opsional) Jalankan seed

```bash
npm run seed
```

Seed otomatis membuat 3 perusahaan + 1 HR per perusahaan + 6 lowongan/company.

### 5) Jalankan backend

```bash
npm run dev
```

Backend berjalan di `http://localhost:3000`.

### 6) Install frontend

```bash
cd ../frontend
cp .env.example .env
```

Pastikan `VITE_API_URL` menunjuk ke backend:

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

---

## 3. Akun Default (backend seed)

| Role | Email | Password | Catatan |
|---|---|---|---|
| Admin platform | `admin@nusantaratech.id` | `Admin12345` | Bisa ganti lewat `ADMIN_EMAIL`/`ADMIN_PASSWORD` sebelum seed |
| HR NusantaraTech | `hr@nusantaratech.id` | `Admin12345` | — |
| HR TechCorp | `hr@techcorp.id` | `Admin12345` | — |
| HR Kreatif Desain | `hr@kreatifdesain.id` | `Admin12345` | — |

---

## 4. Apa yang Baru Dari Kode Ini (vs project awal)

### Backend — perubahan / penambahan

| File | Perubahan |
|---|---|
| `database/schema.sql` | + tabel baru `companies`; + `company_id` di `users` & `jobs`; + kolom `extracted_skills`, `ijazah`, `sertifikat` di `candidate_profiles` |
| `database/seed.js` | Multi-perusahaan: 3 perusahaan, 1 HR tiap perusahaan, 6 lowongan/company |
| `src/middleware/auth.js` | + `getCompanyWhere(req)` (scope perusahaan), `+ requireCompanyId`, `+ requireSameCompany` |
| `src/controllers/authController.js` | + role `hr` dan `admin`; registrasi mendukung `company_id` untuk HR |
| `src/controllers/jobController.js` | HR lihat **hanya** lowongan milik perusahaan sendiri; tampilkan nama perusahaan |
| `src/controllers/candidateController.js` | HR bisa lihat profil kandidat yang pernah melamar perusahaan ini; kandidat cuma lihat diri sendiri |
| `src/controllers/cvController.js` | Simpan ekstraksi CV ke profil; HR download CV pelamar perusahaan |
| `src/controllers/dashboardController.js` | + rekomendasi lowongan di dashboard kandidat; dashboard HR per perusahaan; admin overview semua perusahaan |
| `src/services/cvService.js` | + ekstraksi teks PDF murni JS (FlateDecode stream → Tj/TJ operators) |
| `src/services/recommendationService.js` | + skoring rekomendasi (dictionary skill + matching teks) |
| `src/routes/authRoutes.js` | + validasi role & `company_id` |
| `src/routes/cvRoutes.js` | + `GET /extract` (data ekstraksi CV) |
| `src/routes/dashboardRoutes.js` | + `GET /me` (info perusahaan pengguna) |

### Frontend

| File | Perubahan |
|---|---|
| `src/utils/constants.js` | + `COMPANIES` (3 perusahaan), `DEFAULT_COMPANY` |
| `src/pages/public/Login.jsx` | + pilih role + pilih perusahaan (untuk HR) |
| `src/pages/public/Register.jsx` | + role `candidate`/`hr`/`admin` + pilih perusahaan |
| `src/pages/candidate/CandidateDashboard.jsx` | + baris rekomendasi lowongan + lowongan tersedia |
| `src/pages/candidate/CandidateCV.jsx` | + tampilkan data ekstraksi dari CV |
| `src/pages/candidate/CandidateProfile.jsx` | + info profil + keterangan skill terdeteksi |
| `src/pages/admin/AdminDashboard.jsx` | + overview semua perusahaan (admin platform) |
| `src/pages/hr/*` | Halaman HR baru: Dashboard, Lowongan, Pelamar, Detail, Profil perusahaan |

### Fitur yang ada
- 3 role: `candidate`, `hr`, `admin`
- Isolasi akses: HR perusahaan A tidak lihat data perusahaan B (hanya lihat perusahaan miliknya)
- Upload CV + pembacaan otomatis skill/ijazah/sertifikat
- Rekomendasi lowongan berdasarkan skill yang dimasukkan + skill dari CV
- Dashboard kandidat: rekomendasi relate + statistik
- Dashboard HR: lowongan + laporan pelamar
- Email notifikasi: submit lamaran, status change (opsional, butuh SMTP)

---

## 5. Langkah Uji Manual (manual melalui browser)

1. Buka `/karir`: 6 lowongan contoh tampil. Coba cari "React", filter lokasi, filter jenis.
2. Klik *Lamar Sekarang* tanpa login → dialihkan ke login.
3. Daftar akun kandidat, kembali ke form lamaran. Isi profil + unggah CV di *CV Saya*.
4. Kirim lamaran; coba lamar lagi → ditolak (sudah menangguhkan).
5. Login sebagai HR di jendela lain. Buka *Pelamar*, ubah status ke Screening + Interview dengan catatan, simpan internal note.
6. Kembali ke akun kandidat: timeline menunjukkan perubahan status + catatan, tanpa internal note.
7. Coba tombol *Ciutkan menu* (desktop): sidebar mengecil; di mobile: sidebar drawer dari tombol menu.

---

## 6. Catatan Penting

- **CV parsing** murni JavaScript (FlateDecode stream → Tj/TJ). PDF hasil Word/Google Docs biasanya terbaca.
- **Rekomendasi** skoring: skill match ×2 per skill; bonus dept/location. Tidak ada training model.
- **Akses HR** dibatasi `company_id` di query: HR hanya lihat lowongan/lamaran perusahaan miliknya.
- **CV yang dipakai melamar** tetap disimpan (HR masih bisa baca); CV baru ditandai `is_current=1`.
- Kandidat cuma lihat profil sendiri; HR cuma lihat kandidat yang pernah melamar perusahaan HR-nya.

---

## 7. Troubleshooting

| Masalah | Solusi |
|---|---|
| `ER_ACCESS_DENIED_ERROR` saat `mysql` | Cek `DB_PASSWORD` di `.env` dan user MySQL |
| `Cannot find module ...` | Jalankan `npm install` di `backend/` dan `frontend/` |
| Backend gagal konek DB | Cek `mysql -u root -e "SELECT 1"`; pastikan port 3306 terbuka |
| Seed gagal “email sudah terdaftar” | Hapus database `recruitment_db` atau ubah `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| CV PDF tidak terbaca | CSV hasil Word/Google Docs biasanya terbaca; scan/citra butuh OCR eksternal |
| HR tidak lihat lowongan perusahaan lain | **Bukan bug** — ini memang diminta: HR hanya lihat data perusahaan miliknya |
| SMTP tidak dikonfigurasi | Email hanya dicatat di log, tidak terkirim |

---

## 8. Tidak Track (tidak masuk repo, tapi diperlukan)

| File | Keterangan |
|---|---|
| `backend/src/services/recommendationService.js` | Rekomendasi + ekstraksi skill (tidak butuh library) |
| `backend/scripts/pure-test.js` | Unit-test murni (tidak butuh MySQL) |
| `frontend/src/pages/hr/*` | 8 halaman HR baru |

Catatan: file-file di atas adalah output koding agent; hapus setelah disetujui/digunakan.
