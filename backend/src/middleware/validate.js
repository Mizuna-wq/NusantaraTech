import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

// Dipasang setelah aturan validasi di route. Jika ada yang salah, tampilkan pesan pertama.
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
  next();
}
