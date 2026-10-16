import multer from 'multer';
import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`, 404));
}

// Semua error dari route berakhir di sini. Express 5 otomatis meneruskan
// error dari fungsi async, jadi controller tidak perlu try/catch untuk itu.
export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message;

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file maksimal 5 MB' : 'Upload file gagal';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Format JSON tidak valid';
  }

  if (status === 500) {
    console.error(err);
    message = 'Terjadi kesalahan pada server';
  }

  res.status(status).json({ success: false, message });
}
