export const EMPLOYMENT_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Kontrak',
  internship: 'Magang',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  screening: 'Screening',
  interview: 'Interview',
  technical_test: 'Technical Test',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const JOB_STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
};

function toDate(value) {
  if (!value) return null;
  // Teks "2026-10-15" (kolom DATE) dibaca sebagai tanggal lokal agar tidak bergeser hari
  if (typeof value === 'string' && value.length === 10) return new Date(`${value}T00:00:00`);
  return new Date(value);
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '-';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const formatRupiah = (amount) => `Rp ${Number(amount).toLocaleString('id-ID')}`;

// Mengembalikan null jika gaji tidak tersedia
export function formatSalary(min, max) {
  if (!min && !max) return null;
  if (min && max) return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  if (min) return `Mulai ${formatRupiah(min)}`;
  return `Hingga ${formatRupiah(max)}`;
}

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Teks dengan satu poin per baris menjadi array
export function toList(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim().replace(/^[-•*]\s*/, ''))
    .filter(Boolean);
}
