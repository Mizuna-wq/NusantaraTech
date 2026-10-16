import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';

async function findCandidate(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, p.address, p.city, p.education, p.skills
     FROM users u
     LEFT JOIN candidate_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'candidate'`,
    [userId]
  );
  return rows[0];
}

// Kandidat hanya bisa melihat profilnya sendiri. HR boleh melihat (hanya baca).
export async function getCandidate(req, res) {
  const id = Number(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new AppError('Anda tidak memiliki akses ke data ini', 403);
  }

  const candidate = await findCandidate(id);
  if (!candidate) throw new AppError('Kandidat tidak ditemukan', 404);
  success(res, 'Data kandidat', { candidate });
}

// Hanya pemilik profil yang boleh mengubahnya (HR tidak bisa mengubah data kandidat)
export async function updateCandidate(req, res) {
  const id = Number(req.params.id);
  if (req.user.id !== id) {
    throw new AppError('Anda hanya dapat mengubah data profil Anda sendiri', 403);
  }

  const { full_name, email, phone, address, city, education, skills } = req.body;

  const [taken] = await pool.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id]);
  if (taken.length > 0) throw new AppError('Email sudah digunakan akun lain', 409);

  await withTransaction(async (conn) => {
    await conn.query('UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?', [
      full_name,
      email,
      phone,
      id,
    ]);
    await conn.query(
      'UPDATE candidate_profiles SET address = ?, city = ?, education = ?, skills = ? WHERE user_id = ?',
      [address || null, city || null, education || null, skills || null, id]
    );
  });

  const candidate = await findCandidate(id);
  success(res, 'Profil berhasil disimpan', { candidate });
}
