import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, FileText, Plus, Users, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function HRMonitorDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch('/dashboard');

  return (
    <>
      <div className="page-head">
        <h1>Dashboard {user.company_id ? `Perusahaan` : ''}</h1>
        <p className="muted small">
          {user.company_id
            ? `Mengelola perusahaan dengan ID ${user.company_id}`
            : 'Platform administrator'}
        </p>
        <Link to="/hr/jobs/new" className="btn btn-primary btn-sm">
          <Plus size={16} aria-hidden="true" /> Buat lowongan
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard icon={Users} tone="primary" value={data.stats.total} label="Lamaran keseluruhan" />
            <StatCard icon={Clock} tone="amber" value={data.stats.pending} label="Dalam proses" />
            <StatCard icon={CheckCircle2} tone="green" value={data.stats.accepted} label="Diterima" />
            <StatCard icon={TrendingUp} tone="violet" value={data.jobs.length} label="Lowongan aktif" />
          </div>

          {/* Daftar lowongan perusahaan + jumlah pelamar */}
          {data.jobs.length > 0 && (
            <section className="dash-section">
              <div className="section-head">
                <h2>Lowongan {user.company_id ? 'perusahaan' : 'platform'}</h2>
              </div>
              <div className="row-list">
                {data.jobs.map((job) => (
                  <Link key={job.id} to={`/hr/jobs/${job.id}`} className="card card-recommend">
                    <div className="card-avatar">
                      <Briefcase size={18} />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{job.title}</div>
                      <div className="muted small">
                        {job.department} · {job.location} · {job.employment_type}
                      </div>
                      <div className="card-tags">
                        <span className="tag">Rp {job.salary_min.toLocaleString()} – Rp {job.salary_max.toLocaleString()}</span>
                        {job.applicant_count > 0 && <span className="tag tag-light">{job.applicant_count} pelamar</span>}
                      </div>
                    </div>
                    <div className="card-arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Aktivitas / pelamar terbaru (laporan rinci) */}
          <section className="dash-section">
            <div className="section-head">
              <h2>Pelamar terbaru</h2>
              {data.activities.length > 0 && (
                <Link to="/hr/applicants" className="text-link">Lihat semua</Link>
              )}
            </div>
            {data.activities.length === 0 ? (
              <EmptyState title="Belum ada lamaran" text="Pelamar yang melamar lowongan perusahaan ini akan muncul di sini.">
                <Link to="/karir" className="btn btn-outline btn-sm">Lihat lowongan</Link>
              </EmptyState>
            ) : (
              <div className="row-list">
                {data.activities.map((item) => (
                  <Link key={item.id} to={`/hr/applicants/${item.id}`} className="card card-recommend">
                    <div className="card-avatar">
                      <FileText size={18} />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{item.full_name}</div>
                      <div className="muted small">{item.job_title} · {item.department}</div>
                      <div className="card-tags">
                        <span className={`tag tag-light ${item.status === 'accepted' ? 'status-accepted' : item.status === 'rejected' ? 'status-rejected' : 'status-pending'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="card-arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
