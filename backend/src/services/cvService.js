import fs from 'fs/promises';
import path from 'path';
import { BACKEND_ROOT } from '../config/paths.js';

export function absolutePath(relativePath) {
  return path.resolve(BACKEND_ROOT, relativePath);
}

export async function removeFile(absoluteFilePath) {
  try {
    await fs.unlink(absoluteFilePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Gagal menghapus file:', err.message);
  }
}

// Nama file dari browser dibaca sebagai latin1 oleh multer, jadi dikembalikan ke UTF-8.
// Lalu dibersihkan dari path dan karakter kontrol.
export function cleanOriginalName(name) {
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return path.basename(decoded).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200) || 'cv';
}

// Mimetype bisa dipalsukan, jadi isi file dicek lewat beberapa byte pertamanya.
export async function hasValidSignature(absoluteFilePath, ext) {
  const handle = await fs.open(absoluteFilePath, 'r');
  try {
    const buffer = Buffer.alloc(8);
    await handle.read(buffer, 0, 8, 0);
    if (ext === '.pdf') return buffer.subarray(0, 4).toString('latin1') === '%PDF';
    if (ext === '.docx') return buffer[0] === 0x50 && buffer[1] === 0x4b; // "PK" (file zip)
    if (ext === '.doc') return buffer.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]));
    return false;
  } finally {
    await handle.close();
  }
}
