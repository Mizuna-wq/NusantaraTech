import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import { CV_DIR } from '../config/paths.js';
import { AppError } from '../utils/AppError.js';

export const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB

// Tipe file yang diizinkan dan ekstensi yang harus cocok dengannya
const ALLOWED = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CV_DIR),
  // Nama file di server dibuat acak, nama asli dari user tidak dipakai sama sekali.
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype]}`),
});

function fileFilter(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (ALLOWED[file.mimetype] !== extension) {
    return cb(new AppError('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX', 400));
  }
  cb(null, true);
}

// Field form yang dikirim frontend bernama "cv"
export const uploadCv = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_CV_SIZE, files: 1 },
}).single('cv');
