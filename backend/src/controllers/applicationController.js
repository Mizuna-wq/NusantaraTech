import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';
import { escapeLike } from '../utils/html.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { APPLICATION_STATUSES, COMPANY_NAME } from '../utils/constants.js';
import { sendApplicationSubmitted, sendStatusChanged } from '../services/emailService.js';

// Kandidat mengirim lamaran
export async function createApplication(req, res) {
  const userId = req.user.id;
  const { job_id, phone, cover_letter } = req.body;

  const [jobs] = await pool.query(
    `SELECT id, title, status, (deadline IS NOT NULL AND deadline < CURDATE()) AS expired
     FROM jobs WHERE id = ?`,
    [job_id]
  );
  const job = jobs[0];
  if (!job || job.status !== 'published') throw new AppError('Lowongan tidak ditemukan', 404);
  if (job.expired) throw new AppError('Pendaftaran untuk lowongan ini sudah ditutup', 400);

  const [existing] = await pool.query(
    'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
    [userId, job_id]
  );
  if (existing.length > 0) throw new AppError('Anda sudah melamar lowongan ini', 409);

  const [cvs] = await pool.query(
    `SELECT c.id FROM cv_files c JOIN candidate_profiles p ON p.id = c.candidate_profile_id
     WHERE p.user_id = ? AND c.is_current = 1 ORDER BY c.id DESC LIMIT 1`,
    [userId]
  );
  if (cvs.length === 0) {
    throw new AppError('Unggah CV terlebih dahulu di halaman CV Saya sebelum melamar', 400);
  }

  let applicationId;
  try {
    applicationId = await withTransaction(async (conn) => {
      const [result] = await conn.query(
        'INSERT INTO applications (user_id, job_id, cv_file_id, phone, cover_letter) VALUES (?, ?, ?, ?, ?)',
        [userId, job_id, cvs[0].id, phone, cover_letter || null]
      );
      // Baris pertama riwayat status: old_status kosong
      await conn.query(
        `INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
         VALUES (?, NULL, 'submitted', ?)`,
        [result.insertId, userId]
      );
      return result.insertId;
    });
  } catch (err) {
    // Jaga-jaga jika dua request masuk bersamaan: unique constraint di database yang menolak
    if (err.code === 'ER_DUP_ENTRY') throw new AppError('Anda sudah melamar lowongan ini', 409);
    throw err;
  }

  const [[user]] = await pool.query('SELECT full_name, email FROM users WHERE id = ?', [userId]);
  sendApplicationSubmitted({
    to: user.email,
    name: user.full_name,
    jobTitle: job.title,
    applicationId,
  });

  success(res, 'Lamaran berhasil dikirim', { id: applicationId }, 201);
}

// Kandidat: lamaran miliknya. HR: semua lamaran (dengan filter dan pagination).
export async function listApplications(req, res) {
  if (req.user.role === 'admin') return listForAdmin(req, res);

  const [rows] = await pool.query(
    `SELECT a.id, a.status, a.created_at,
       j.id AS job_id, j.title, j.department, j.location, j.employment_type
     FROM applications a JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC, a.id DESC`,
    [req.user.id]
  );
  const applications = rows.map((row) => ({ ...row, company: COMPANY_NAME }));
  success(res, 'Daftar lamaran', { applications });
}

async function listForAdmin(req, res) {
  const { job_id, status, q } = req.query;
  const { page, limit, offset } = parsePagination(req.query, 10);

  const conditions = ['1 = 1'];
  const params = [];

  if (job_id && Number(job_id) > 0) {
    conditions.push('a.job_id = ?');
    params.push(Number(job_id));
  }
  if (status && APPLICATION_STATUSES.includes(status)) {
    conditions.push('a.status = ?');
    params.push(status);
  }
  if (q) {
    conditions.push('(u.full_name LIKE ? OR u.email LIKE ?)');
    const like = `%${escapeLike(q)}%`;
    params.push(like, like);
  }

  const from = `FROM applications a
    JOIN users u ON u.id = a.user_id
    JOIN jobs j ON j.id = a.job_id
    LEFT JOIN cv_files c ON c.id = a.cv_file_id
    WHERE ${conditions.join(' AND ')}`;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${from}`, params);
  const [applications] = await pool.query(
    `SELECT a.id, a.status, a.created_at, a.cv_file_id, c.original_filename AS cv_name,
       u.full_name, u.email, j.id AS job_id, j.title
     ${from}
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  success(res, 'Daftar pelamar', { applications, pagination: buildPagination(total, page, limit) });
}

export async function getApplication(req, res) {
  const isAdmin = req.user.role === 'admin';

  const [rows] = await pool.query(
    `SELECT a.id, a.user_id, a.status, a.phone, a.cover_letter, a.note_internal, a.created_at,
       j.id AS job_id, j.title, j.department, j.location, j.employment_type,
       u.full_name, u.email,
       p.address, p.city, p.education, p.skills,
       c.id AS cv_id, c.original_filename AS cv_name, c.file_size AS cv_size
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     LEFT JOIN candidate_profiles p ON p.user_id = u.id
     LEFT JOIN cv_files c ON c.id = a.cv_file_id
     WHERE a.id = ?`,
    [req.params.id]
  );
  const application = rows[0];

  // Kandidat hanya boleh melihat lamarannya sendiri
  if (!application || (!isAdmin && application.user_id !== req.user.id)) {
    throw new AppError('Lamaran tidak ditemukan', 404);
  }

  const [history] = await pool.query(
    `SELECT h.id, h.old_status, h.new_status, h.note, h.created_at, u.full_name AS changed_by_name
     FROM application_status_history h JOIN users u ON u.id = h.changed_by
     WHERE h.application_id = ?
     ORDER BY h.created_at ASC, h.id ASC`,
    [application.id]
  );

  application.company = COMPANY_NAME;

  if (!isAdmin) {
    // Catatan internal dan nama HR tidak boleh terlihat oleh kandidat
    delete application.note_internal;
    history.forEach((item) => delete item.changed_by_name);
  }

  success(res, 'Detail lamaran', { application, history });
}

// HR mengubah status lamaran
export async function updateStatus(req, res) {
  const { status, note } = req.body;

  const [rows] = await pool.query(
    `SELECT a.id, a.status, u.full_name, u.email, j.title
     FROM applications a JOIN users u ON u.id = a.user_id JOIN jobs j ON j.id = a.job_id
     WHERE a.id = ?`,
    [req.params.id]
  );
  const application = rows[0];
  if (!application) throw new AppError('Lamaran tidak ditemukan', 404);
  if (application.status === status) {
    throw new AppError('Status lamaran sudah sama dengan status yang dipilih', 400);
  }

  await withTransaction(async (conn) => {
    await conn.query('UPDATE applications SET status = ? WHERE id = ?', [status, application.id]);
    await conn.query(
      `INSERT INTO application_status_history
         (application_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [application.id, application.status, status, req.user.id, note || null]
    );
  });

  sendStatusChanged({
    to: application.email,
    name: application.full_name,
    jobTitle: application.title,
    status,
    note,
    applicationId: application.id,
  });

  success(res, 'Status lamaran berhasil diubah', { status });
}

// HR menyimpan catatan internal (tidak terlihat oleh kandidat)
export async function updateInternalNote(req, res) {
  const [result] = await pool.query('UPDATE applications SET note_internal = ? WHERE id = ?', [
    req.body.note_internal || null,
    req.params.id,
  ]);
  if (result.affectedRows === 0) throw new AppError('Lamaran tidak ditemukan', 404);
  success(res, 'Catatan internal disimpan');
}
