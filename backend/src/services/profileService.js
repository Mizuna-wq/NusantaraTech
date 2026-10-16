import { pool } from '../config/db.js';

// Mengambil id profil candidate. Dibuatkan jika belum ada.
export async function getOrCreateProfileId(userId, conn = pool) {
  const [rows] = await conn.query('SELECT id FROM candidate_profiles WHERE user_id = ?', [userId]);
  if (rows.length > 0) return rows[0].id;

  const [result] = await conn.query('INSERT INTO candidate_profiles (user_id) VALUES (?)', [userId]);
  return result.insertId;
}
