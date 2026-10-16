import 'dotenv/config';
import app from './app.js';
import { pool } from './config/db.js';

const port = process.env.PORT || 3000;

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET belum diisi di file .env. Isi dengan teks acak yang panjang.');
    process.exit(1);
  }

  try {
    await pool.query('SELECT 1');
    console.log('Terhubung ke MySQL');
  } catch (err) {
    console.error('Gagal terhubung ke MySQL:', err.message);
    process.exit(1);
  }

  if (!process.env.SMTP_HOST) {
    console.warn('SMTP belum dikonfigurasi: email notifikasi tidak akan dikirim');
  }

  app.listen(port, () => {
    console.log(`Backend berjalan di http://localhost:${port}`);
  });
}

start();
