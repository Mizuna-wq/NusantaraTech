// Rekomendasi lowongan berdasarkan skill kandidat.
// Tidak ada library eksternal: dictionary kata kunci + pencocokan teks sederhana.

// Kata kunci skill yang sering muncul dalam CV (ditambah yang relevan dengan lowongan).
export const SKILL_KEYWORDS = [
  // Pemrograman & web
  'javascript', 'typescript', 'react', 'nextjs', 'node.js', 'nodejs', 'express', 'reactjs',
  'vue', 'angular', 'html', 'css', 'tailwind', 'bootstrap', 'sass', 'scss', 'php', 'laravel',
  'python', 'java', 'c#', 'csharp', 'go', 'golang', 'ruby', 'swift', 'kotlin',
  'cplusplus', 'c++', 'c', 'ruby on rails', 'django', 'flask', 'spring', 'springboot',
  // Database & data
  'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'oracle', 'sql server',
  'python', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow', 'keras',
  'machine learning', 'deep learning', 'data analysis', 'data analyst', 'data science', 'etl',
  'tableau', 'power bi', 'excel',
  // Mobile
  'react native', 'flutter', 'kotlin', 'swift', 'ios', 'android',
  // UI/UX & desain
  'ui ux', 'ui/ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
  'user research', 'wireframe', 'prototyping', 'user experience', 'user interface',
  // DevOps & cloud
  'docker', 'kubernetes', 'aws', 'azure', 'google cloud', 'ci cd', 'jenkins', 'git', 'github',
  'linux', 'nginx',
  // Trading/finansial/manajemen (sesuai deskripsi user)
  'trading', 'akuntansi', 'manajemen', 'finance', 'keuangan',
  // Kembaran "sering banget jadi data jadi data analyst / data engineer"
  'data', 'analisis', 'statistik', 'statistical', 'big data',
];

// IJAZAH / pendidikan yang sering muncul
const IJAZAH_KEYWORDS = [
  's3', 'doktor', 'phd', 's2', 'magister', 'master', 's1', 'sarjana',
  'struktur', 'bidikmen', 'pascasarjana', 'pasca sarjana', 'smk', 'sma', 'slta',
  'd3', 'diploma', 'profesi',
];

// SERTIFIKAT / kualifikasi tambahan
const SERTIFIKAT_KEYWORDS = [
  'sertifikat', 'certification', 'cloud certified', 'aws certified', 'google cert', 'oxford',
  'bappbidiksi', 'osf', 'kominfo', 'buku pintar', 'kodepos', 'bisa code',
  'hackathon', 'bootcamp', 'kursus', 'training', 'course', 'programmer', 'coder',
];

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F/ ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function containsAny(text, keywords) {
  const tokens = tokenize(text);
  return keywords.some((k) => tokens.some((t) => t === k || t.startsWith(k) || k.startsWith(t)));
}

export function extractSkills(text) {
  const found = [];
  const seen = new Set();
  for (const keyword of SKILL_KEYWORDS) {
    if (containsAny(text, [keyword])) {
      if (!seen.has(keyword)) {
        seen.add(keyword);
        found.push(keyword);
      }
    }
  }
  return found;
}

export function extractIjazah(text) {
  const found = [];
  const seen = new Set();
  for (const keyword of IJAZAH_KEYWORDS) {
    if (containsAny(text, [keyword])) {
      if (!seen.has(keyword)) {
        seen.add(keyword);
        found.push(keyword);
      }
    }
  }
  return found;
}

export function extractSertifikat(text) {
  const found = [];
  const seen = new Set();
  for (const keyword of SERTIFIKAT_KEYWORDS) {
    if (containsAny(text, [keyword])) {
      if (!seen.has(keyword)) {
        seen.add(keyword);
        found.push(keyword);
      }
    }
  }
  return found;
}

// Skor responsivitas: seberapa relevan lowongan untuk kandidat.
export function scoreJob(job, candidateSkills, candidateIjazah, candidateSertifikat) {
  const txt = `${job.title} ${job.department} ${job.description} ${job.responsibilities} ${job.qualifications}`.toLowerCase();
  let score = 0;

  // Skill yang dimiliki kandidat dan ada di deskripsi/lowongan -> nilai tambah
  for (const skill of candidateSkills || []) {
    if (containsAny(txt, [skill])) {
      score += 2;
    }
  }
  // Ijazah (pendidikan) yang cocok
  if (candidateIjazah && candidateIjazah.length) score += 1;
  // Sertifikat
  if (candidateSertifikat && candidateSertifikat.length) score += 1;

  // Bonus jika dept/lokasi cocok
  if (job.department) {
    const d = job.department.toLowerCase();
    for (const s of candidateSkills || []) {
      if (d.includes(s) || s.includes(d)) score += 1;
    }
  }

  if (score <= 0) return 0;
  return score;
}

// Rekomendasi lowongan untuk kandidat, diurutkan dari yang paling relevan.
export function recommendJobs(jobs, candidateSkills, candidateIjazah, candidateSertifikat) {
  const scored = [];
  for (const job of jobs) {
    const score = scoreJob(job, candidateSkills, candidateIjazah, candidateSertifikat);
    if (score > 0) {
      scored.push({ job, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => ({ ...s.job, relevance: s.score }));
}

// Skor kasar untuk testing/dashboard
export function relevanceLabel(score) {
  if (score >= 6) return 'Sangat relevan';
  if (score >= 3) return 'Relevan';
  if (score >= 1) return 'Kurang relevan';
  return 'Tidak terdeteksi';
}
