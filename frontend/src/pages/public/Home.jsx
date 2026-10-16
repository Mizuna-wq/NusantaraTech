import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, TrendingUp } from 'lucide-react';
import SearchBar from '../../components/SearchBar.jsx';
import JobListItem from '../../components/JobListItem.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function Home() {
  const navigate = useNavigate();
  const latest = useFetch('/jobs?limit=5');
  const popular = useFetch('/jobs?sort=popular&limit=5');

  function handleSearch({ q, location }) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/karir?${params}`);
  }

  const popularJobs = popular.data?.jobs || [];

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <h1>Bangun Masa Depan Bersama NusantaraTech</h1>
            <p className="hero-text">
              Temukan peluang kerja dan internship di NusantaraTech. Lihat posisi yang sedang dibuka,
              kirim lamaran, dan pantau prosesnya langsung dari akun Anda.
            </p>
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {popularJobs.length > 0 && (
        <section className="section section-tight">
          <div className="container">
            <h2 className="heading-icon"><TrendingUp size={20} aria-hidden="true" /> Posisi populer</h2>
            <ul className="chip-list">
              {popularJobs.map((job) => (
                <li key={job.id}>
                  <Link to={`/karir/${job.id}`} className="chip">{job.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="heading-icon"><Clock size={20} aria-hidden="true" /> Lowongan terbaru</h2>
            <Link to="/karir" className="text-link">Lihat semua lowongan</Link>
          </div>

          {latest.loading && <Loading label="Memuat lowongan..." />}
          {latest.error && <ErrorMessage message={latest.error} onRetry={latest.reload} />}
          {latest.data && latest.data.jobs.length === 0 && (
            <EmptyState
              icon={Briefcase}
              title="Belum ada lowongan yang dibuka"
              text="Lowongan baru akan tampil di sini setelah dipublikasikan oleh tim HR."
            />
          )}
          {latest.data && latest.data.jobs.length > 0 && (
            <div className="job-list">
              {latest.data.jobs.map((job) => <JobListItem key={job.id} job={job} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
