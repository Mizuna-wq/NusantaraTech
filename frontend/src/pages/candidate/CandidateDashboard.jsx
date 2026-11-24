import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock, FileText, Gauge, Search, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import ApplicationRow from '../../components/ApplicationRow.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch('/dashboard');

  return (
    <>
      <div className="page-head">
        <h1>Halo, {user.full_name.split(' ')[0]}</h1>
        <Link to="/karir" className="btn btn-primary btn-sm">
          <Search size={16} aria-hidden="true" /> Cari lowongan
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard icon={Briefcase} tone="primary" value={data.stats.total} label="Jumlah lamaran" />
            <StatCard icon={Clock} tone="amber" value={data.stats.pending} label="Lamaran dalam proses" />
            <StatCard icon={CheckCircle2} tone="green" value={data.stats.interview} label="Interview" />
            <StatCard icon={Gauge} tone="violet" value={data.recommendations.length} label="Rekomendasi" />
          </div>

          {/* Rekomendasi lowongan berdasarkan skill */}
          {data.recommendations.length > 0 && (
            <section className="dash-section">
              <div className="section-head">
                <h2>Rekomendasi lowongan</h2>
                <span className="muted small">Dijalankan otomatis dari skill yang Anda masukkan dan skill yang terdeteksi dari CV Anda</span>
              </div>
              <div className="row-list">
                {data.recommendations.map((job) => (
                  <Link key={job.id} to={`/karir/${job.id}`} className="card card-recommend">
                    <div className="card-avatar">
                      <Briefcase size={18} />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{job.title}</div>
                      <div className="muted small">{job.department} · {job.location}</div>
                      <div className="card-tags">
                        <span className="tag">Rp {job.salary_min.toLocaleString()} – Rp {job.salary_max.toLocaleString()}</span>
                        <span className="tag tag-light">{job.relevance_label}</span>
                      </div>
                    </div>
                    <div className="card-arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Lowongan publik */}
          {data.jobs.length > 0 && (
            <section className="dash-section">
              <div className="section-head">
                <h2>Lowongan yang tersedia</h2>
                <Link to="/karir" className="text-link">Lihat semua</Link>
              </div>
              <div className="row-list">
                {data.jobs.map((job) => (
                  <Link key={job.id} to={`/karir/${job.id}`} className="card card-recommend">
                    <div className="card-avatar">
                      <Briefcase size={18} />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{job.title}</div>
                      <div className="muted small">{job.department} · {job.location}</div>
                      <div className="card-tags">
                        <span className="tag">Rp {job.salary_min.toLocaleString()} – Rp {job.salary_max.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="card-arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
