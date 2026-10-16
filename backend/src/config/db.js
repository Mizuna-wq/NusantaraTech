import 'dotenv/config';
import mysql from 'mysql2/promise';

// Pool = kumpulan koneksi yang dipakai ulang, jadi tidak perlu buka koneksi baru setiap request.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recruitment_db',
  waitForConnections: true,
  connectionLimit: 10,
  // Kolom DATE (misalnya deadline) dikembalikan sebagai teks "2026-10-15",
  // supaya tidak bergeser sehari karena perbedaan zona waktu.
  dateStrings: ['DATE'],
});

// Menjalankan beberapa query sebagai satu kesatuan.
// Jika salah satu gagal, semua perubahan dibatalkan (rollback).
export async function withTransaction(callback) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
