import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';
import { getCompanyWhere } from '../middleware/auth.js';

async function findCandidate(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, p.address, p.city, p.education, p.skills,
      p.extracted_skills, p.ijazah, p.sertifikat
     FROM users u
     LEFT JOIN candidate_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'candidate'`,
    [userId]
  );
  return rows[0];
}

// Kandidat hanya bisa melihat profilnya sendiri.
// HR (perusahaan A) dapat melihat profil kandidat yang sudah melamar lowongan di perusahaan A.
export async function getCandidate(req, res) {
  const id = Number(req.params.id);
  if (req.user.role === 'admin') {
    throw new AppError('Anda tidak memiliki akses ke data ini', 403);
  }

  if (req.user.role === 'candidate' && req.user.id !== id) {
    throw new AppError('Anda tidak memiliki akses ke data ini', 403);
  }

  // HR: hanya kandidat yang pernah melamar lowongan di perusahaan HR
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, p.address, p.city, p.education, p.skills,
      p.extracted_skills, p.ijazah, p.sertifikat
     FROM users u
     JOIN candidate_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'candidate'
       AND EXISTS (
         SELECT 1 FROM applications a JOIN jobs j ON j.id = a.job_id
         WHERE a.user_id = u.id AND j.company_id = ?
       )`,
    [id, req.user.company_id]
  );
  const candidate = rows[0];
  if (!candidate) throw new AppError('Kandidat tidak ditemukan', 404);
  success(res, 'Data kandidat', { candidate });
}

// Hanya pemilik profil yang boleh mengubahnya (HR tidak bisa mengubah data kandidat).
export async function updateCandidate(req, res) {
  const id = Number(req.params.id);
  if (req.user.id !== id) {
    throw new AppError('Anda hanya dapat mengubah data profil Anda sendiri', 403);
  }

  const { full_name, email, phone, address, city, education, skills, extracted_skills, ijazah, sertifikat } = req.body;

  const [taken] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id]);
  if (taken.length > 0) throw new AppError('Email sudah digunakan akun lain', 409);

  await pool.query('UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?', [
    full_name, email, phone, id,
  ]);

  await pool.query(
    `UPDATE candidate_profiles
     SET address = ?, city = ?, education = ?, skills = ?,
         extracted_skills = ?, ijazah = ?, sertifikat = ?
     WHERE user_id = ?`,
    [address || null, city || null, education || null, skills || null, extracted_skills || null, ijazah || null, sertifikat || null, id]
  );

  const candidate = await findCandidate(id);
  success(res, 'Profil berhasil disimpan', { candidate });
}
