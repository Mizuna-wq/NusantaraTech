import { pool } from '../config/db.js';
import { success } from '../utils/response.js';
import { COMPANY_NAME } from '../utils/constants.js';

// "Dalam proses" = belum ada keputusan akhir (bukan accepted / rejected)
const IN_PROCESS = `('submitted', 'screening', 'interview', 'technical_test')`;

export async function getDashboard(req, res) {
  if (req.user.role === 'admin') return adminDashboard(res);
  return candidateDashboard(req, res);
}

async function candidateDashboard(req, res) {
  const [[stats]] = await pool.query(
    `SELECT COUNT(*) AS total,
       COUNT(CASE WHEN status IN ${IN_PROCESS} THEN 1 END) AS in_process,
       COUNT(CASE WHEN status = 'interview' THEN 1 END) AS interview,
       COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted
     FROM applications WHERE user_id = ?`,
    [req.user.id]
  );

  const [latest] = await pool.query(
    `SELECT a.id, a.status, a.created_at, j.title, j.location
     FROM applications a JOIN jobs j ON j.id = a.job_id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC, a.id DESC LIMIT 5`,
    [req.user.id]
  );

  success(res, 'Dashboard kandidat', {
    stats,
    latest: latest.map((row) => ({ ...row, company: COMPANY_NAME })),
  });
}

async function adminDashboard(res) {
  const [[stats]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM jobs
         WHERE status = 'published' AND (deadline IS NULL OR deadline >= CURDATE())) AS active_jobs,
       (SELECT COUNT(*) FROM applications) AS total_applicants,
       (SELECT COUNT(*) FROM applications WHERE status IN ${IN_PROCESS}) AS in_process,
       (SELECT COUNT(*) FROM applications WHERE status = 'interview') AS interview`
  );

  // Aktivitas terbaru diambil dari riwayat status (lamaran baru juga tercatat di sana)
  const [activities] = await pool.query(
    `SELECT h.id, h.old_status, h.new_status, h.created_at,
       a.id AS application_id, u.full_name, j.title
     FROM application_status_history h
     JOIN applications a ON a.id = h.application_id
     JOIN users u ON u.id = a.user_id
     JOIN jobs j ON j.id = a.job_id
     ORDER BY h.created_at DESC, h.id DESC LIMIT 10`
  );

  success(res, 'Dashboard HR', { stats, activities });
}
