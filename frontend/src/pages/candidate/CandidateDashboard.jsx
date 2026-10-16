import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, MessageSquare, Search } from 'lucide-react';
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
            <StatCard icon={FileText} tone="primary" value={data.stats.total} label="Jumlah lamaran" />
            <StatCard icon={Clock} tone="amber" value={data.stats.in_process} label="Lamaran dalam proses" />
            <StatCard icon={MessageSquare} tone="violet" value={data.stats.interview} label="Interview" />
            <StatCard icon={CheckCircle2} tone="green" value={data.stats.accepted} label="Diterima" />
          </div>

          <section className="dash-section">
            <div className="section-head">
              <h2>Lamaran terbaru</h2>
              {data.latest.length > 0 && (
                <Link to="/candidate/applications" className="text-link">Lihat semua</Link>
              )}
            </div>
            {data.latest.length === 0 ? (
              <EmptyState title="Anda belum melamar posisi apa pun" text="Lamaran yang Anda kirim akan muncul di sini.">
                <Link to="/karir" className="btn btn-outline btn-sm">Lihat lowongan</Link>
              </EmptyState>
            ) : (
              <div className="row-list">
                {data.latest.map((item) => <ApplicationRow key={item.id} application={item} />)}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
