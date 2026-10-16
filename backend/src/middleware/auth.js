import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

function readToken(req) {
  const [type, token] = (req.headers.authorization || '').split(' ');
  return type === 'Bearer' ? token : null;
}

// Wajib login
export function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) throw new AppError('Silakan login terlebih dahulu', 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    throw new AppError('Sesi tidak valid atau sudah berakhir, silakan login kembali', 401);
  }
}

// Login tidak wajib, tapi jika ada token yang valid, req.user diisi
export function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, role: payload.role };
    } catch {
      // token tidak valid: anggap saja pengunjung biasa
    }
  }
  next();
}

// Contoh: authorize('admin') hanya mengizinkan role admin
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Anda tidak memiliki akses ke fitur ini', 403);
    }
    next();
  };
}
