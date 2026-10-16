// Menguji seluruh alur aplikasi lewat API. Backend harus sedang berjalan dan "npm run seed" sudah dijalankan.
// Jalankan dari folder backend: npm run test:workflow
const BASE = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hr@nusantaratech.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin12345';

let passed = 0;
let failed = 0;

async function call(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const type = response.headers.get('content-type') || '';
  const json = type.includes('application/json') ? await response.json() : null;
  return { status: response.status, json, response };
}

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  OK    ${name}`);
  } else {
    failed++;
    console.log(`  GAGAL ${name} ${detail}`);
  }
}

function cvForm(content, filename, type) {
  const form = new FormData();
  form.append('cv', new Blob([content], { type }), filename);
  return form;
}

async function run() {
  const stamp = Date.now();
  const password = 'Rahasia123';
  const users = [1, 2].map((n) => ({
    full_name: `Kandidat Uji ${n}`,
    email: `uji${n}.${stamp}@example.com`,
    phone: `08123${String(stamp).slice(-7)}`,
    password,
    confirm_password: password,
  }));

  console.log('1. Server dan autentikasi');
  const health = await call('GET', '/health');
  check('health check', health.status === 200, `(status ${health.status})`);

  const reg1 = await call('POST', '/auth/register', { body: users[0] });
  check('register kandidat 1', reg1.status === 201);
  const reg2 = await call('POST', '/auth/register', { body: users[1] });
  check('register kandidat 2', reg2.status === 201);
  const dup = await call('POST', '/auth/register', { body: users[0] });
  check('email sama ditolak (409)', dup.status === 409);
  const weak = await call('POST', '/auth/register', { body: { ...users[0], email: 'x@example.com', password: 'abc', confirm_password: 'abc' } });
  check('password lemah ditolak (400)', weak.status === 400);
  const bad = await call('POST', '/auth/login', { body: { email: users[0].email, password: 'salah12345' } });
  check('login password salah (401)', bad.status === 401);

  const login1 = await call('POST', '/auth/login', { body: { email: users[0].email, password } });
  check('login kandidat 1', login1.status === 200 && login1.json.data.token);
  const t1 = login1.json?.data?.token;
  const id1 = login1.json?.data?.user?.id;
  const t2 = reg2.json?.data?.token;

  const adminLogin = await call('POST', '/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('login HR', adminLogin.status === 200, '(sudah menjalankan npm run seed?)');
  const ta = adminLogin.json?.data?.token;
  if (!t1 || !t2 || !ta) return console.log('Token tidak tersedia, pengujian dihentikan.');

  console.log('2. Otorisasi');
  const noToken = await call('GET', '/applications');
  check('tanpa token ditolak (401)', noToken.status === 401);
  const candCreate = await call('POST', '/jobs', { token: t1, body: {} });
  check('kandidat tidak bisa membuat lowongan (403)', candCreate.status === 403);
  const adminEdit = await call('PUT', `/candidates/${id1}`, { token: ta, body: {} });
  check('HR tidak bisa mengubah data kandidat (403)', adminEdit.status === 403);
  const otherView = await call('GET', `/candidates/${id1}`, { token: t2 });
  check('kandidat tidak bisa melihat profil orang lain (403)', otherView.status === 403);

  console.log('3. Lowongan (HR)');
  const title = `Lowongan Uji ${stamp}`;
  const jobBody = {
    title,
    department: 'Pengujian',
    description: 'Deskripsi uji',
    responsibilities: 'Tugas 1\nTugas 2',
    qualifications: 'Syarat 1\nSyarat 2',
    benefits: 'Benefit 1',
    location: 'Surabaya',
    employment_type: 'full_time',
    salary_min: 5000000,
    salary_max: 8000000,
    deadline: '',
    status: 'published',
  };
  const created = await call('POST', '/jobs', { token: ta, body: jobBody });
  check('buat lowongan published', created.status === 201);
  const jobId = created.json?.data?.id;
  const draft = await call('POST', '/jobs', { token: ta, body: { ...jobBody, title: `${title} Draft`, status: 'draft' } });
  check('buat lowongan draft', draft.status === 201);
  const draftId = draft.json?.data?.id;

  const invalidSalary = await call('POST', '/jobs', { token: ta, body: { ...jobBody, salary_min: 9000000, salary_max: 1000000 } });
  check('gaji max < min ditolak (400)', invalidSalary.status === 400);

  const list = await call('GET', `/jobs?q=${encodeURIComponent(title)}`);
  const titles = (list.json?.data?.jobs || []).map((j) => j.title);
  check('lowongan published tampil di publik', titles.includes(title));
  check('lowongan draft tidak tampil di publik', !titles.includes(`${title} Draft`));
  const draftDetail = await call('GET', `/jobs/${draftId}`);
  check('detail draft tidak bisa dibuka publik (404)', draftDetail.status === 404);
  const detail = await call('GET', `/jobs/${jobId}`);
  check('detail lowongan published', detail.status === 200 && detail.json.data.job.title === title);

  console.log('4. Profil dan CV');
  const profile = await call('PUT', `/candidates/${id1}`, {
    token: t1,
    body: { ...users[0], address: 'Jl. Uji 1', city: 'Surabaya', education: 'S1 Informatika', skills: 'React, Node.js' },
  });
  check('kandidat menyimpan profil', profile.status === 200);

  const noCvApply = await call('POST', '/applications', { token: t1, body: { job_id: jobId, phone: users[0].phone } });
  check('melamar tanpa CV ditolak (400)', noCvApply.status === 400);

  const txt = await call('POST', '/cv', { token: t1, form: cvForm('halo', 'cv.txt', 'text/plain') });
  check('upload file .txt ditolak (400)', txt.status === 400);
  const big = await call('POST', '/cv', { token: t1, form: cvForm(Buffer.alloc(5 * 1024 * 1024 + 10), 'besar.pdf', 'application/pdf') });
  check('upload file > 5 MB ditolak (400)', big.status === 400);
  const upload = await call('POST', '/cv', { token: t1, form: cvForm('%PDF-1.4 uji', 'CV Uji.pdf', 'application/pdf') });
  check('upload PDF berhasil', upload.status === 201);
  const cvId = upload.json?.data?.cv?.id;
  const myCv = await call('GET', '/cv', { token: t1 });
  check('CV aktif tampil', myCv.json?.data?.cv?.id === cvId);

  console.log('5. Melamar');
  const apply = await call('POST', '/applications', { token: t1, body: { job_id: jobId, phone: users[0].phone, cover_letter: 'Saya tertarik.' } });
  check('kirim lamaran', apply.status === 201);
  const appId = apply.json?.data?.id;
  const again = await call('POST', '/applications', { token: t1, body: { job_id: jobId, phone: users[0].phone } });
  check('melamar dua kali ditolak (409)', again.status === 409);
  const applyDraft = await call('POST', '/applications', { token: t1, body: { job_id: draftId, phone: users[0].phone } });
  check('melamar lowongan draft ditolak (404)', applyDraft.status === 404);

  const myApps = await call('GET', '/applications', { token: t1 });
  check('lamaran tampil di Lamaran Saya', myApps.json?.data?.applications?.length === 1);
  const foreign = await call('GET', `/applications/${appId}`, { token: t2 });
  check('kandidat lain tidak bisa membuka lamaran ini (404)', foreign.status === 404);

  console.log('6. Pengelolaan pelamar (HR)');
  const adminList = await call('GET', `/applications?job_id=${jobId}`, { token: ta });
  check('HR melihat pelamar lowongan', adminList.json?.data?.applications?.length === 1);
  const sameStatus = await call('PUT', `/applications/${appId}/status`, { token: ta, body: { status: 'submitted' } });
  check('status sama ditolak (400)', sameStatus.status === 400);
  const toScreening = await call('PUT', `/applications/${appId}/status`, { token: ta, body: { status: 'screening' } });
  check('ubah status ke screening', toScreening.status === 200);
  const toInterview = await call('PUT', `/applications/${appId}/status`, { token: ta, body: { status: 'interview', note: 'Interview hari Senin' } });
  check('ubah status ke interview', toInterview.status === 200);
  const note = await call('PUT', `/applications/${appId}/notes`, { token: ta, body: { note_internal: 'Kandidat kuat' } });
  check('HR menyimpan catatan internal', note.status === 200);
  const candNote = await call('PUT', `/applications/${appId}/notes`, { token: t1, body: { note_internal: 'x' } });
  check('kandidat tidak bisa mengubah catatan internal (403)', candNote.status === 403);
  const badStatus = await call('PUT', `/applications/${appId}/status`, { token: t1, body: { status: 'accepted' } });
  check('kandidat tidak bisa mengubah status (403)', badStatus.status === 403);

  const candDetail = await call('GET', `/applications/${appId}`, { token: t1 });
  const cd = candDetail.json?.data;
  check('timeline kandidat: 3 riwayat status', cd?.history?.length === 3);
  check('status terakhir interview', cd?.application?.status === 'interview');
  check('catatan internal tidak terlihat kandidat', !('note_internal' in (cd?.application || {})));
  check('catatan untuk kandidat tampil di timeline', cd?.history?.some((h) => h.note === 'Interview hari Senin'));
  const adminDetail = await call('GET', `/applications/${appId}`, { token: ta });
  check('HR melihat catatan internal', adminDetail.json?.data?.application?.note_internal === 'Kandidat kuat');

  console.log('7. Unduh CV');
  const dlAdmin = await call('GET', `/cv/${cvId}/download`, { token: ta });
  check('HR bisa mengunduh CV pelamar', dlAdmin.status === 200);
  const dlOwner = await call('GET', `/cv/${cvId}/download`, { token: t1 });
  check('kandidat bisa mengunduh CV sendiri', dlOwner.status === 200);
  const dlOther = await call('GET', `/cv/${cvId}/download`, { token: t2 });
  check('kandidat lain tidak bisa mengunduh CV ini (404)', dlOther.status === 404);

  console.log('8. Dashboard dan pembersihan');
  const candDash = await call('GET', '/dashboard', { token: t1 });
  check('dashboard kandidat: 1 lamaran, 1 interview', candDash.json?.data?.stats?.total === 1 && candDash.json?.data?.stats?.interview === 1);
  const adminDash = await call('GET', '/dashboard', { token: ta });
  check('dashboard HR tampil', adminDash.status === 200 && adminDash.json.data.activities.length > 0);

  const delUsed = await call('DELETE', `/jobs/${jobId}`, { token: ta });
  check('lowongan yang punya pelamar tidak bisa dihapus (409)', delUsed.status === 409);
  const close = await call('PATCH', `/jobs/${jobId}/status`, { token: ta, body: { status: 'closed' } });
  check('lowongan dinonaktifkan (closed)', close.status === 200);
  const closedList = await call('GET', `/jobs?q=${encodeURIComponent(title)}`);
  check('lowongan closed hilang dari halaman publik', !(closedList.json?.data?.jobs || []).some((j) => j.title === title));
  const delDraft = await call('DELETE', `/jobs/${draftId}`, { token: ta });
  check('lowongan tanpa pelamar bisa dihapus', delDraft.status === 200);
}

run()
  .catch((err) => {
    failed++;
    console.error('Pengujian berhenti karena error:', err.message);
  })
  .finally(() => {
    console.log(`\nSelesai: ${passed} lolos, ${failed} gagal`);
    process.exit(failed > 0 ? 1 : 0);
  });
