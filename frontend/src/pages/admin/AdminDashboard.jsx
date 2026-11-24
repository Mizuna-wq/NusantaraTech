import { Link } from 'react-router-dom';
import { Activity, Briefcase, Building2, FileText, Users, LayoutDashboard } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/dashboard');

  return (
    <>
      <div className="page-head">
        <h1>Dashboard Platform</h1>
        <p className="muted small">Ikhtisar semua perusahaan dan kegiatan rekrutmen di platform.</p>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard icon={Briefcase} tone="primary" value={data.totals.jobs} label="Total lowongan" />
            <StatCard icon={Users} tone="green" value={data.totals.candidates} label="Kandidat" />
            <StatCard icon={Activity} tone="amber" value={data.totals.applications} label="Lamaran" />
            <StatCard icon={LayoutDashboard} tone="violet" value={data.companies.length} label="Perusahaan terdaftar" />
          </div>

          <section className="dash-section">
            <div className="section-head">
              <h2>Daftar perusahaan</h2>
              <Link to="/admin/company" className="text-link">Kelola semua perusahaan</Link>
            </div>
            {data.companies.length === 0 ? (
              <EmptyState title="Belum ada perusahaan" text="Perusahaan akan muncul di sini setelah berhasildidatangkan." />
            ) : (
              <div className="row-list">
                {data.companies.map((company) => (
                  <div key={company.id} className="card card-recommend">
                    <div className="card-avatar">
                      <Building2 size={18} />
                    </div>
                    <div className="card-body">
                      <div className="card-title">{company.name}</div>
                      <div className="muted small">{company.email} · {company.address}</div>
                      <div className="card-tags">
                        <span className="tag">{company.job_count} lowongan</span>
                        <span className="tag tag-light">{company.user_count} pengguna</span>
                      </div>
                    </div>
                    <div className="card-arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
