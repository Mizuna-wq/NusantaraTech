import { Link } from 'react-router-dom';
import { Activity, Briefcase, Clock, MessageSquare, Plus, Users } from 'lucide-react';
import StatCard from '../../components/StatCard.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { STATUS_LABELS, formatDateTime } from '../../utils/format.js';

function describeActivity(item) {
  if (!item.old_status) return `${item.full_name} melamar posisi ${item.title}`;
  return `Status lamaran ${item.full_name} untuk ${item.title} diubah dari ${STATUS_LABELS[item.old_status]} ke ${STATUS_LABELS[item.new_status]}`;
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/dashboard');

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link to="/admin/jobs/new" className="btn btn-primary btn-sm">
          <Plus size={16} aria-hidden="true" /> Buat lowongan
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard icon={Briefcase} tone="primary" value={data.stats.active_jobs} label="Lowongan aktif" />
            <StatCard icon={Users} tone="green" value={data.stats.total_applicants} label="Jumlah pelamar" />
            <StatCard icon={Clock} tone="amber" value={data.stats.in_process} label="Kandidat dalam proses" />
            <StatCard icon={MessageSquare} tone="violet" value={data.stats.interview} label="Interview" />
          </div>

          <section className="dash-section">
            <h2>Aktivitas terbaru</h2>
            {data.activities.length === 0 ? (
              <EmptyState icon={Activity} title="Belum ada aktivitas" text="Lamaran baru dan perubahan status akan tampil di sini." />
            ) : (
              <ul className="activity-list">
                {data.activities.map((item) => (
                  <li key={item.id}>
                    <Link to={`/admin/applicants/${item.application_id}`}>{describeActivity(item)}</Link>
                    <span className="muted small">{formatDateTime(item.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
