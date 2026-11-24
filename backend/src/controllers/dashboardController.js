import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { success } from '../utils/response.js';
import { getCompanyWhere } from '../middleware/auth.js';
import {
  recommendJobs,
  relevanceLabel,
} from './recommendationService.js';

// Isi dashboard menyesuaikan role: kandidat, HR, atau admin.
export async function getDashboard(req, res) {
  if (req.user.role === 'candidate') return getCandidateDashboard(req, res);
  if (req.user.role === 'hr') return getHrDashboard(req, res);
  return getAdminDashboard(req, res);
}

// Info perusahaan pengguna (dipakai HR untuk menampilkan konteks perusahaan)
export async function getCompanyMe(req, res) {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.slug, c.email, c.phone, c.address, c.description
     FROM companies c
     WHERE c.id = ?`,
    [req.user.company_id]
  );
  if (rows.length === 0) throw new AppError('Perusahaan tidak ditemukan', 404);
  success(res, 'Perusahaan', { company: rows[0] });
}

// --- Kandidat ---
async function getCandidateDashboard(req, res) {
  const { page = 1, limit = 6 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Stats lamaran kandidat
  const [statsRows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'accepted') AS accepted,
       SUM(status = 'rejected') AS rejected,
       SUM(status = 'interview') AS interview,
       SUM(status NOT IN ('accepted', 'rejected')) AS pending
     FROM applications WHERE user_id = ?`,
    [req.user.id]
  );
  const stats = statsRows[0];

  // Lowongan terbaru yang belum diterima/coret
  const [jobs] = await pool.query(
    `SELECT id, title, department, location, salary_min, salary_max, status,
       (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
     FROM jobs j
     WHERE j.status = 'published' AND (j.deadline IS NULL OR j.deadline >= CURDATE())
     ORDER BY j.created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  // Rekomendasi berdasarkan skill yang diekstrak dari CV + skill yang dimasukkan
  const candidate = await findCandidate(req.user.id);
  const manualSkills = candidate?.skills ? String(candidate.skills).split(',').map((s) => s.trim()).filter(Boolean) : [];
  const extracted = candidate?.extracted_skills ? JSON.parse(candidate.extracted_skills || '[]') : [];
  const allSkills = [...new Set([...manualSkills, ...extracted])];

  const [allJobs] = await pool.query(
    `SELECT id, title, department, location, salary_min, salary_max, status FROM jobs WHERE status = 'published' ORDER BY created_at DESC`
  );

  const recommendations = recommendJobs(allJobs, allSkills, candidate?.ijazah, candidate?.sertifikat);

  success(res, 'Dashboard kandidat', {
    stats: {
      total: Number(stats.total),
      accepted: Number(stats.accepted),
      rejected: Number(stats.rejected),
      interview: Number(stats.interview),
      pending: Number(stats.pending),
    },
    recommendations: recommendations.map((j) => ({
      ...j,
      relevance_label: relevanceLabel(j.relevance),
    })),
    jobs: jobs.map((j) => ({ ...j })),
    pagination: { page: Number(page), limit: Number(limit), total: Number(stats.total) },
  });
}

// --- HR (perusahaan) ---
async function getHrDashboard(req, res) {
  const [where, params] = getCompanyWhere(req);

  // Stats lamaran perusahaan (via job company_id)
  const [statsRows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(a.status = 'accepted') AS accepted,
       SUM(a.status = 'rejected') AS rejected,
       SUM(a.status = 'interview') AS interview,
       SUM(a.status NOT IN ('accepted', 'rejected')) AS pending,
       SUM(a.status = 'submitted') AS newly
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE ${where}`,
    params
  );
  const stats = statsRows[0];

  // Aktivitas terbaru (laporan rinci beberapa pelamar)
  const { page = 1, limit = 8 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE ${where}`,
    params
  );

  const [activities] = await pool.query(
    `SELECT a.id, a.status, a.created_at,
       j.title AS job_title, j.department, j.location,
       u.full_name, u.email
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN users u ON u.id = a.user_id
     WHERE ${where}
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  // Lowongan perusahaan + jumlah pelamar
  const [jobs] = await pool.query(
    `SELECT j.id, j.title, j.department, j.location, j.employment_type, j.salary_min, j.salary_max,
       j.status, j.deadline,
       (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
     FROM jobs j
     WHERE ${where}
     ORDER BY applicant_count DESC, j.created_at DESC`
  );

  success(res, 'Dashboard HR', {
    stats: {
      total: Number(stats.total),
      accepted: Number(stats.accepted),
      rejected: Number(stats.rejected),
      interview: Number(stats.interview),
      pending: Number(stats.pending),
      newly: Number(stats.newly),
    },
    activities: activities.map((a) => ({ ...a })),
    jobs: jobs.map((j) => ({ ...j })),
    pagination: { page: Number(page), limit: Number(limit), total: Number(total) },
  });
}

// --- Admin platform: meta informasi semua perusahaan ---
async function getAdminDashboard(req, res) {
  const [companies] = await pool.query(
    `SELECT c.*, (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) AS user_count,
       (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id) AS job_count
     FROM companies c ORDER BY c.created_at DESC`
  );
  const [totalApps] = await pool.query('SELECT COUNT(*) AS total FROM applications');
  const [jobs] = await pool.query('SELECT COUNT(*) AS total FROM jobs');
  const [cands] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'candidate'");

  success(res, 'Dashboard admin', {
    companies: companies.map((c) => ({ ...c, user_count: Number(c.user_count), job_count: Number(c.job_count) })),
    totals: { applications: Number(totalApps[0].total), jobs: Number(jobs[0].total), candidates: Number(cands[0].total) },
  });
}

async function findCandidate(userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.phone, p.skills, p.extracted_skills, p.ijazah, p.sertifikat
     FROM users u
     LEFT JOIN candidate_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'candidate'`,
    [userId]
  );
  return rows[0];
}
