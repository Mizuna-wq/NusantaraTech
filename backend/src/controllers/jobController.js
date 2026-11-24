import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';
import { escapeLike } from '../utils/html.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { getCompanyWhere } from '../middleware/auth.js';
import { COMPANY } from '../utils/constants.js';

// Kolom yang ditampilkan pada daftar lowongan
const LIST_COLUMNS = `j.id, j.title, j.department, j.location, j.employment_type,
  j.salary_min, j.salary_max, j.deadline, j.status, j.created_at,
  c.id AS company_id, c.name AS company`;

// Lowongan yang tampil di halaman publik: published dan belum lewat deadline
const PUBLIC_CONDITION = `j.status = 'published' AND (j.deadline IS NULL OR j.deadline >= CURDATE())`;

// Daftar lowongan publik (dengan filter, pencarian, dan pagination).
// Pengunjung umum melihat semua perusahaan; HR hanya melihat lowongan milik perusahaannya.
export async function listJobs(req, res) {
  const { q, type, location, department, sort } = req.query;
  const { page, limit, offset } = parsePagination(req.query, 10);

  const conditions = [PUBLIC_CONDITION];
  const params = [];

  if (type && ['full_time', 'part_time', 'contract', 'internship'].includes(type)) {
    conditions.push('j.employment_type = ?');
    params.push(type);
  }
  if (location) {
    conditions.push('j.location LIKE ?');
    params.push(`%${escapeLike(location)}%`);
  }
  if (department) {
    conditions.push('j.department = ?');
    params.push(department);
  }
  if (q) {
    conditions.push(
      '(j.title LIKE ? OR j.department LIKE ? OR j.qualifications LIKE ? OR j.description LIKE ?)'
    );
    const like = `%${escapeLike(q)}%`;
    params.push(like, like, like, like);
  }

  const where = conditions.join(' AND ');
  const orderBy =
    sort === 'popular'
      ? '(SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) DESC, j.created_at DESC'
      : 'j.created_at DESC, j.id DESC';

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM jobs j WHERE ${where}`, params);
  const [jobs] = await pool.query(
    `SELECT ${LIST_COLUMNS} FROM jobs j JOIN companies c ON c.id = j.company_id WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  success(res, 'Daftar lowongan', {
    jobs: jobs.map((job) => ({ ...job, company: job.company || COMPANY.name })),
    pagination: buildPagination(total, page, limit),
  });
}

// Pilihan untuk dropdown filter
export async function getFilters(req, res) {
  const [[{ companies }]] = await pool.query(
    "SELECT JSON_ARRAYAGG(JSON_OBJECT('id', id, 'name', name)) AS companies FROM companies"
  );
  const [departments] = await pool.query(
    `SELECT DISTINCT j.department FROM jobs j WHERE ${PUBLIC_CONDITION} ORDER BY j.department`
  );
  const [locations] = await pool.query(
    `SELECT DISTINCT j.location FROM jobs j WHERE ${PUBLIC_CONDITION} ORDER BY j.location`
  );
  success(res, 'Filter lowongan', {
    companies: companies || [],
    departments: departments.map((row) => row.department),
    locations: locations.map((row) => row.location),
  });
}

// Detail lowongan. Pengunjung hanya bisa melihat yang published, admin bisa melihat semua.
export async function getJob(req, res) {
  const [rows] = await pool.query(
    `SELECT j.*, c.name AS company FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = ?`,
    [req.params.id]
  );
  const job = rows[0];
  const isAdmin = req.user?.role === 'admin';

  if (!job || (!isAdmin && job.status !== 'published')) {
    throw new AppError('Lowongan tidak ditemukan', 404);
  }

  if (req.user?.role === 'candidate') {
    const [applied] = await pool.query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [req.user.id, job.id]
    );
    if (applied.length > 0) job.applied_application_id = applied[0].id;
  }

  success(res, 'Detail lowongan', { job });
}

// Daftar semua lowongan untuk HR: hanya lowongan milik perusahaannya.
export async function listAllJobs(req, res) {
  const { q } = req.query;
  const [where, params] = getCompanyWhere(req);

  const conditions = [where];
  if (q) {
    conditions.push('(j.title LIKE ? OR j.department LIKE ?)');
    const like = `%${escapeLike(q)}%`;
    params.push(like, like);
  }

  const [jobs] = await pool.query(
    `SELECT ${LIST_COLUMNS}, j.status,
       (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
     FROM jobs j JOIN companies c ON c.id = j.company_id WHERE ${conditions.join(' AND ')}
     ORDER BY j.created_at DESC, j.id DESC`,
    params
  );
  success(res, 'Daftar lowongan', { jobs });
}

// Mengambil field lowongan dari body. Field kosong untuk kolom opsional menjadi NULL.
function pickJobFields(body) {
  return [
    body.title,
    body.department,
    body.description,
    body.responsibilities,
    body.qualifications,
    body.benefits || null,
    body.location,
    body.employment_type,
    body.salary_min || null,
    body.salary_max || null,
    body.deadline || null,
    body.status || 'draft',
  ];
}

export async function createJob(req, res) {
  const companyId = req.user.company_id;
  if (!companyId) throw new AppError('Hanya HRD dari perusahaan yang bisa membuat lowongan', 403);

  const [result] = await pool.query(
    `INSERT INTO jobs (title, department, description, responsibilities, qualifications, benefits,
       location, employment_type, salary_min, salary_max, deadline, status, created_by, company_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...pickJobFields(req.body), req.user.id, companyId]
  );
  success(res, 'Lowongan berhasil dibuat', { id: result.insertId }, 201);
}

export async function updateJob(req, res) {
  const [result] = await pool.query(
    `UPDATE jobs SET title = ?, department = ?, description = ?, responsibilities = ?,
       qualifications = ?, benefits = ?, location = ?, employment_type = ?,
       salary_min = ?, salary_max = ?, deadline = ?, status = ?
     WHERE id = ?`,
    [...pickJobFields(req.body), req.params.id]
  );
  if (result.affectedRows === 0) throw new AppError('Lowongan tidak ditemukan', 404);
  success(res, 'Lowongan berhasil diperbarui', { id: Number(req.params.id) });
}

// Untuk tombol aktifkan / nonaktifkan
export async function updateJobStatus(req, res) {
  const [result] = await pool.query('UPDATE jobs SET status = ? WHERE id = ?', [
    req.body.status,
    req.params.id,
  ]);
  if (result.affectedRows === 0) throw new AppError('Lowongan tidak ditemukan', 404);
  success(res, 'Status lowongan berhasil diubah', { status: req.body.status });
}

export async function deleteJob(req, res) {
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM applications WHERE job_id = ?',
    [req.params.id]
  );
  if (total > 0) {
    throw new AppError(
      'Lowongan ini sudah memiliki pelamar dan tidak bisa dihapus. Ubah statusnya menjadi closed.',
      409
    );
  }

  const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) throw new AppError('Lowongan tidak ditemukan', 404);
  success(res, 'Lowongan berhasil dihapus');
}
