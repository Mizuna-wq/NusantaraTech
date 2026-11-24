import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { extractSkills, extractIjazah, extractSertifikat } from './recommendationService.js';
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

// Mimetype bisa dipalsukan, jadi isi file dicek lewat beberapa byte pertamannya.
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

// --- Ekstraksi teks dari PDF (murni JavaScript, tanpa library eksternal) ---

/**
 * Mencari semua blok stream dalam file PDF, mendekompres jika menggunakan
 * FlateDecode, lalu mengeluarkan teks yang ditampilkan lewat operator Tj/TJ.
 */
export function extractPdfText(buffer) {
  const text = buffer.toString('latin1');
  const chunks = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const start = text.indexOf('stream', i);
    if (start === -1) break;
    // Marker stream sendiri diikuti baris baru
    let dataStart = start + 6;
    if (dataStart < n && (text[dataStart] === '\r' || text[dataStart] === '\n')) {
      if (text[dataStart] === '\r' && text[dataStart + 1] === '\n') dataStart += 2;
      else dataStart += 1;
    }
    const end = text.indexOf('endstream', dataStart);
    if (end === -1) break;
    let streamData = text.slice(dataStart, end);
    if (isFlateCompressed(text, start)) {
      try {
        const bytes = Buffer.from(streamData, 'latin1');
        const decompressed = zlib.inflateSync(bytes);
        streamData = decompressed.toString('latin1');
      } catch {
        // Bukan PDF yang terkompresi, tetap lanjut
      }
    }
    chunks.push(extractTextOperators(streamData));
    i = end + 9;
  }
  return chunks.join('\n');
}

function isFlateCompressed(text, streamIndex) {
  const before = text.slice(Math.max(0, streamIndex - 250), streamIndex);
  return /FlateDecode|[Ff]ilter\s*\/Fl\b/.test(before);
}

// Mengambil string literal yang diletakkan operator Tj / TJ.
// Mencocokkan string dalam kurung "()", termasuk escape sederhana.
function extractTextOperators(text) {
  const strings = [];
  const re = /\((?:\\.|[^\\()])*\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    strings.push(m[0]);
  }
  return strings.join(' ');
}

// --- Pemrosesan lengkap CV PDF ---
export async function parseCvFile(buffer, originalFilename) {
  const extractedText = extractPdfText(buffer);

  // Bersihkan teks dari spasi ganda dan baris kosong.
  const cleanText = extractedText
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const skills = extractSkillsFromText(cleanText);
  const ijazah = extractIjazahFromText(cleanText);
  const sertifikat = extractSertifikatFromText(cleanText);

  return {
    skills,
    ijazah,
    sertifikat,
    extractedText,
    cleanText,
    originalFilename,
  };
}

// Helper agar kode di atas tetap mudah diuji.
export function extractSkillsFromText(text) {
  return extractSkills(text);
}
export function extractIjazahFromText(text) {
  return extractIjazah(text);
}
export function extractSertifikatFromText(text) {
  return extractSertifikat(text);
}
