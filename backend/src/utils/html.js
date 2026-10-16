// Mencegah teks dari user (nama, catatan) dianggap sebagai HTML di dalam email.
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Karakter % dan _ punya arti khusus di LIKE, jadi di-escape agar dicari apa adanya.
export function escapeLike(value) {
  return String(value).replace(/[\\%_]/g, '\\$&');
}
