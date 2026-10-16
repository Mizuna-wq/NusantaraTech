import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool, withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Data user yang aman dikirim ke frontend (tanpa password_hash)
function publicUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

export async function register(req, res) {
  const { full_name, email, phone, password } = req.body;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) throw new AppError('Email sudah terdaftar', 409);

  const passwordHash = await bcrypt.hash(password, 10);

  // User dan profilnya dibuat bersamaan
  const userId = await withTransaction(async (conn) => {
    const [result] = await conn.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone, passwordHash, 'candidate']
    );
    await conn.query('INSERT INTO candidate_profiles (user_id) VALUES (?)', [result.insertId]);
    return result.insertId;
  });

  const user = { id: userId, full_name, email, phone, role: 'candidate' };
  success(res, 'Registrasi berhasil', { token: signToken(user), user }, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  // Pesan sengaja dibuat sama agar tidak membocorkan email mana yang terdaftar
  const isValid = user && (await bcrypt.compare(password, user.password_hash));
  if (!isValid) throw new AppError('Email atau password salah', 401);

  success(res, 'Login berhasil', { token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) throw new AppError('Akun tidak ditemukan', 401);
  success(res, 'Data akun', { user: publicUser(rows[0]) });
}

export async function changePassword(req, res) {
  const { current_password, new_password } = req.body;

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) throw new AppError('Akun tidak ditemukan', 404);

  const isValid = await bcrypt.compare(current_password, user.password_hash);
  if (!isValid) throw new AppError('Password saat ini salah', 400);

  const passwordHash = await bcrypt.hash(new_password, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
  success(res, 'Password berhasil diubah');
}
