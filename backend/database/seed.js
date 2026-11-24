// Membuat akun HR untuk setiap perusahaan dan beberapa lowongan contoh.
// Jalankan dari folder backend: npm run seed
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@nusantaratech.id';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin12345';

// Contoh perusahaan (pihak ketiga) yang terdaftar di platform.
const companies = [
  {
    name: 'NusantaraTech',
    slug: 'nusantaratech',
    email: 'hr@nusantaratech.id',
    phone: '081200000001',
    address: 'Jl. Raya Darmo No. 88, Surabaya, Jawa Timur 60265',
    description: 'Perusahaan teknologi yang membuka lowongan Frontend, Backend, Data Analyst, dan HR.',
  },
  {
    name: 'TechCorp Indonesia',
    slug: 'techcorp',
    email: 'hr@techcorp.id',
    phone: '081200000002',
    address: 'Glove Tower, Jakarta Utara, DKI Jakarta',
    description: 'Perusahaan teknologi yang membuka lowongan Backend, Data Analyst, dan HR.',
  },
  {
    name: 'Kreatif Desain',
    slug: 'kreatifdesain',
    email: 'hr@kreatifdesain.id',
    phone: '081200000003',
    address: 'Jl. Seni Rupa No. 12, Bandung, Jawa Barat',
    description: 'Perusahaan desain yang membuka lowongan UI/UX Designer dan Frontend.',
  },
];

const jobs = [
  {
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Surabaya',
    employment_type: 'full_time',
    salary_min: 9000000,
    salary_max: 14000000,
    deadline: 45,
    description:
      'Anda akan bergabung dengan tim produk untuk membangun antarmuka aplikasi web yang dipakai pelanggan bisnis kami setiap hari.',
    responsibilities:
      'Membangun dan merawat antarmuka web dengan React\nBekerja sama dengan desainer dan backend developer\nMenulis kode yang rapi, mudah diuji, dan mudah dirawat\nMemperbaiki bug dan meningkatkan performa halaman',
    qualifications:
      'Pengalaman minimal 2 tahun dengan React dan JavaScript\nMemahami HTML, CSS, dan desain responsif\nTerbiasa menggunakan Git dan REST API\nMampu bekerja dalam tim',
    benefits: 'BPJS Kesehatan dan Ketenagakerjaan\nTunjangan internet\nCuti tahunan 12 hari\nBudget pelatihan tahunan',
  },
  {
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Jakarta',
    employment_type: 'full_time',
    salary_min: 10000000,
    salary_max: 16000000,
    deadline: 40,
    description:
      'Anda akan mengembangkan layanan backend dan API yang menjadi dasar seluruh produk NusantaraTech.',
    responsibilities:
      'Merancang dan membangun REST API dengan Node.js\nMengelola skema dan query database MySQL\nMenjaga keamanan dan kestabilan layanan\nMelakukan code review bersama tim',
    qualifications:
      'Pengalaman minimal 2 tahun dengan Node.js dan Express\nMemahami desain database relasional dan SQL\nMemahami autentikasi (JWT) dan praktik keamanan dasar\nTerbiasa menulis dokumentasi teknis',
    benefits: 'BPJS Kesehatan dan Ketenagakerjaan\nAsuransi kesehatan tambahan\nJam kerja fleksibel\nBudget pelatihan tahunan',
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Bandung',
    employment_type: 'full_time',
    salary_min: 8000000,
    salary_max: 12000000,
    deadline: 30,
    description:
      'Anda akan merancang pengalaman pengguna untuk produk web kami, dari riset sederhana sampai desain akhir yang siap dikembangkan.',
    responsibilities:
      'Membuat wireframe, prototipe, dan desain antarmuka\nMelakukan riset dan uji coba dengan pengguna\nMenjaga konsistensi desain di seluruh produk\nBerdiskusi dengan developer saat implementasi',
    qualifications:
      'Portofolio desain produk digital\nMahir menggunakan Figma\nMemahami prinsip aksesibilitas dan desain responsif\nKomunikasi yang baik',
    benefits: 'BPJS Kesehatan dan Ketenagakerjaan\nTunjangan perangkat kerja\nCuti tahunan 12 hari',
  },
  {
    title: 'Internship Frontend Developer',
    department: 'Engineering',
    location: 'Surabaya',
    employment_type: 'internship',
    salary_min: 2500000,
    salary_max: 3000000,
    deadline: 35,
    description:
      'Program magang selama 6 bulan untuk mahasiswa tingkat akhir yang ingin belajar membangun aplikasi web bersama tim engineering.',
    responsibilities:
      'Membantu membangun komponen antarmuka dengan React\nMemperbaiki bug yang ditugaskan mentor\nMengikuti code review dan sesi belajar mingguan',
    qualifications:
      'Mahasiswa tingkat akhir jurusan Informatika atau bidang terkait\nMemahami dasar HTML, CSS, dan JavaScript\nMemiliki proyek pribadi atau tugas kuliah yang bisa ditunjukkan\nBersedia magang penuh waktu minimal 6 bulan',
    benefits: 'Uang saku bulanan\nMentoring langsung dari engineer\nSertifikat magang\nKesempatan menjadi karyawan tetap',
  },
  {
    title: 'Internship Data Analyst',
    department: 'Data',
    location: 'Jakarta',
    employment_type: 'internship',
    salary_min: 2500000,
    salary_max: 3000000,
    deadline: 35,
    description:
      'Magang selama 6 bulan di tim data untuk membantu menyiapkan laporan dan analisis yang dipakai tim produk dan bisnis.',
    responsibilities:
      'Membersihkan dan merapikan data\nMembuat laporan dan visualisasi sederhana\nMembantu tim menjawab pertanyaan bisnis dengan data',
    qualifications:
      'Mahasiswa tingkat akhir jurusan Statistika, Informatika, atau bidang terkait\nMemahami SQL dan spreadsheet\nMemahami dasar statistik\nTeliti dan suka belajar',
    benefits: 'Uang saku bulanan\nMentoring langsung dari data analyst\nSertifikat magang',
  },
  {
    title: 'HR Generalist',
    department: 'Human Resources',
    location: 'Surabaya',
    employment_type: 'contract',
    salary_min: 6500000,
    salary_max: 9000000,
    deadline: 25,
    description:
      'Kontrak 12 bulan untuk membantu proses rekrutmen, administrasi karyawan, dan kegiatan pengembangan tim.',
    responsibilities:
      'Mengelola proses rekrutmen dari penyaringan sampai penawaran kerja\nMengurus administrasi karyawan dan kontrak\nMenyiapkan kegiatan onboarding karyawan baru',
    qualifications:
      'Pengalaman minimal 1 tahun di bidang HR\nMemahami dasar hukum ketenagakerjaan di Indonesia\nKomunikasi dan organisasi yang baik\nMahir menggunakan spreadsheet',
    benefits: 'BPJS Kesehatan dan Ketenagakerjaan\nCuti tahunan 12 hari\nPerpanjangan kontrak berdasarkan kinerja',
  },
];

async function createCompanies() {
  const [rows] = await pool.query('SELECT id, slug FROM companies');
  if (rows.length === companies.length) {
    console.log('Perusahaan sudah ada, melewati pembuatan.');
    return rows;
  }
  const result = [];
  for (const c of companies) {
    const [res] = await pool.query(
      'INSERT INTO companies (name, slug, email, phone, address, description) VALUES (?, ?, ?, ?, ?, ?)',
      [c.name, c.slug, c.email, c.phone, c.address, c.description]
    );
    result.push({ id: res.insertId, ...c });
  }
  return result;
}

async function ensureAdminUser() {
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (rows.length > 0) return rows[0].id;
  const hash = await bcrypt.hash(adminPassword, 10);
  const [res] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role, company_id) VALUES (?, ?, ?, ?, "admin", NULL)',
    ['Tim Pengelola Platform', adminEmail, '081200000099', hash]
  );
  return res.insertId;
}

async function ensureHrUser(companyId, companyName) {
  const email = `hr@${companies[companyId - 1].slug}.id`;
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) return rows[0].id;
  const hash = await bcrypt.hash('Admin12345', 10);
  const [res] = await pool.query(
    'INSERT INTO users (full_name, email, phone, password_hash, role, company_id) VALUES (?, ?, ?, ?, "hr", ?)',
    [`HR ${companyName}`, email, '081200000000', hash, companyId]
  );
  return res.insertId;
}

async function seedJobs(companies, adminId) {
  const [total] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
  if (total[0].total > 0) {
    console.log('Tabel jobs sudah berisi data, lowongan contoh dilewati.');
    return;
  }

  // Buat pekerjaan untuk setiap perusahaan, dipegang oleh HR perusahaan masing-masing.
  for (const company of companies) {
    const hrId = await ensureHrUser(company.id, company.name);
    const deadline = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    for (let i = 0; i < jobs.length; i += 1) {
      const j = jobs[i];
      await pool.query(
        `INSERT INTO jobs
          (title, department, location, employment_type, salary_min, salary_max, deadline, status, created_by, description, responsibilities, qualifications, benefits, company_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?)`,
        [
          j.title, j.department, j.location, j.employment_type, j.salary_min, j.salary_max,
          deadline, hrId, j.description, j.responsibilities, j.qualifications, j.benefits,
          company.id,
        ]
      );
    }
    console.log(`${jobs.length} lowongan ${company.name} dibuat.`);
  }
  console.log(`${jobs.length * companies.length} lowongan contoh dibuat.`);
}

async function seed() {
  const companies = await createCompanies();
  const adminId = await ensureAdminUser();
  console.log('Aplikasi admin (platform-wide):', adminEmail, '/', adminPassword);
  await seedJobs(companies, adminId);
  console.log('Selesai seeding.');
}

seed()
  .catch((err) => {
    console.error('Seed gagal:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
