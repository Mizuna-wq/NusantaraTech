import fs from 'fs/promises';
import path from 'path';
import { pool, withTransaction } from '../config/db.js';
import { BACKEND_ROOT } from '../config/paths.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';

// Kolom yang aman dikirim ke frontend (tanpa lokasi file di server)
const PUBLIC_COLUMNS = 'c.id, c.original_filename, c.mime_type, c.file_size, c.uploaded_at';

async function getProfileId(userId) {
  const [rows] = await pool.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [userId]);
  if (rows.length === 0) throw new AppError('Profil kandidat tidak ditemukan', 404);
  return rows[0].id;
}

function removeFile(filePath) {
  return fs.unlink(path.join(BACKEND_ROOT, filePath)).catch(() => {});
}

// Hapus CV lama yang sudah tidak aktif dan tidak dipakai oleh lamaran mana pun.
// CV yang sudah dipakai melamar tetap disimpan agar HR masih bisa membukanya.
async function removeUnusedCvs(profileId) {
  const [rows] = await pool.query(
    `SELECT id, file_path FROM cv_files
     WHERE candidate_profile_id = ? AND is_current = 0
       AND id NOT IN (SELECT cv_file_id FROM applications)`,
    [profileId]
  );
  for (const row of rows) {
    await pool.query('DELETE FROM cv_files WHERE id = ?', [row.id]);
    await removeFile(row.file_path);
  }
}

// Nama asli file dibersihkan dari karakter berbahaya sebelum disimpan ke database
function cleanOriginalName(name) {
  // multer membaca nama file sebagai latin1; ubah kembali ke UTF-8
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return path
    .basename(decoded)
    .replace(/[^\p{L}\p{N}.\-_() ]/gu, '_')
    .slice(0, 150);
}

export async function getMyCv(req, res) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
     FROM cv_files c JOIN candidate_profiles p ON p.id = c.candidate_profile_id
     WHERE p.user_id = ? AND c.is_current = 1
     ORDER BY c.id DESC LIMIT 1`,
    [req.user.id]
  );
  success(res, 'CV saat ini', { cv: rows[0] || null });
}

export async function uploadCv(req, res) {
  if (!req.file) throw new AppError('Pilih file CV terlebih dahulu (PDF, DOC, atau DOCX)', 400);

  try {
    const profileId = await getProfileId(req.user.id);

    const cvId = await withTransaction(async (conn) => {
      await conn.query('UPDATE cv_files SET is_current = 0 WHERE candidate_profile_id = ?', [profileId]);
      const [result] = await conn.query(
        `INSERT INTO cv_files (candidate_profile_id, original_filename, stored_filename,
           file_path, mime_type, file_size, is_current)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          profileId,
          cleanOriginalName(req.file.originalname),
          req.file.filename,
          `uploads/cv/${req.file.filename}`,
          req.file.mimetype,
          req.file.size,
        ]
      );
      return result.insertId;
    });

    await removeUnusedCvs(profileId);

    const [rows] = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM cv_files c WHERE c.id = ?`, [cvId]);
    success(res, 'CV berhasil diunggah', { cv: rows[0] }, 201);
  } catch (err) {
    // Jika gagal menyimpan ke database, file yang sudah terunggah ikut dihapus
    await fs.unlink(req.file.path).catch(() => {});
    throw err;
  }
}

export async function deleteCv(req, res) {
  const [rows] = await pool.query(
    `SELECT c.id, c.file_path, c.candidate_profile_id,
       EXISTS(SELECT 1 FROM applications a WHERE a.cv_file_id = c.id) AS in_use
     FROM cv_files c JOIN candidate_profiles p ON p.id = c.candidate_profile_id
     WHERE c.id = ? AND p.user_id = ?`,
    [req.params.id, req.user.id]
  );
  const cv = rows[0];
  if (!cv) throw new AppError('CV tidak ditemukan', 404);

  if (cv.in_use) {
    // Sudah dipakai melamar: hanya dinonaktifkan, file tetap ada untuk HR
    await pool.query('UPDATE cv_files SET is_current = 0 WHERE id = ?', [cv.id]);
  } else {
    await pool.query('DELETE FROM cv_files WHERE id = ?', [cv.id]);
    await removeFile(cv.file_path);
  }
  success(res, 'CV berhasil dihapus');
}

// Kandidat boleh mengunduh CV miliknya. HR hanya boleh mengunduh CV yang dipakai untuk melamar.
export async function downloadCv(req, res, next) {
  const params = [req.params.id];
  let sql;

  if (req.user.role === 'admin') {
    sql = `SELECT c.* FROM cv_files c
           WHERE c.id = ? AND EXISTS(SELECT 1 FROM applications a WHERE a.cv_file_id = c.id)`;
  } else {
    sql = `SELECT c.* FROM cv_files c JOIN candidate_profiles p ON p.id = c.candidate_profile_id
           WHERE c.id = ? AND p.user_id = ?`;
    params.push(req.user.id);
  }

  const [rows] = await pool.query(sql, params);
  const cv = rows[0];
  if (!cv) throw new AppError('CV tidak ditemukan', 404);

  res.download(path.join(BACKEND_ROOT, cv.file_path), cv.original_filename, (err) => {
    if (err && !res.headersSent) next(new AppError('File CV tidak ditemukan di server', 404));
  });
}
