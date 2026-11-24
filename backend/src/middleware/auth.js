import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

function readToken(req) {
  const [type, token] = (req.headers.authorization || '').split(' ');
  return type === 'Bearer' ? token : null;
}

// Wajib login (role: candidate, hr, admin)
export function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) throw new AppError('Silakan login terlebih dahulu', 401);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role, company_id: payload.company_id };
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
      req.user = { id: payload.id, role: payload.role, company_id: payload.company_id };
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

// Mengembalikan [WHERE clause, params] untuk memfilter data perusahaan yang bisa dilihat.
// - HR (role 'hr'): hanya perusahaan miliknya sendiri.
// - Admin & candidate: tidak dibatasi perusahaan (admin lihat semua, candidate lihat lowongan publik).
export function getCompanyWhere(req) {
  if (req.user.role === 'hr' && req.user.company_id) {
    return ['j.company_id = ?', [req.user.company_id]];
  }
  return ['1 = 1', []];
}

// Pastikan user (jika HR) memiliki perusahaan yang ditetapkan.
export function requireCompanyId(value) {
  return (req, res, next) => {
    if (req.user.role === 'hr' && (!req.user.company_id || Number(req.user.company_id) !== value)) {
      throw new AppError('Anda tidak memiliki akses ke data perusahaan ini', 403);
    }
    next();
  };
}

// Pastikan objek yang diakses (lowongan/lamaran) milik perusahaan yang sama dengan HR.
export function requireSameCompany(req, res, next) {
  if (req.user.role === 'hr' && req.user.company_id && Number(req.user.company_id) !== Number(req.companyId)) {
    throw new AppError('Anda tidak memiliki akses ke data perusahaan ini', 403);
  }
  next();
}
