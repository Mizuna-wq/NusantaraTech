import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Briefcase, Building2, CalendarClock, CalendarDays, FileText, MapPin, Send } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { EMPLOYMENT_LABELS, formatDate, formatSalary, toList } from '../../utils/format.js';

function Section({ title, text, asList }) {
  return (
    <section className="detail-section">
      <h2>{title}</h2>
      {asList ? (
        <ul className="bullet-list">
          {toList(text).map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      ) : (
        <p className="prewrap">{text}</p>
      )}
    </section>
  );
}

function ApplyAction({ job }) {
  const { user } = useAuth();
  const applyPath = `/karir/${job.id}/lamar`;

  if (job.status !== 'published') {
    return <p className="muted small">Lowongan ini belum dipublikasikan (pratinjau untuk HR).</p>;
  }
  if (job.expired) {
    return <button className="btn btn-primary btn-block" disabled>Pendaftaran ditutup</button>;
  }
  if (user?.role === 'admin') {
    return <p className="muted small">Anda masuk sebagai HR. Lamaran hanya dapat dikirim oleh kandidat.</p>;
  }
  if (job.applied_application_id) {
    return (
      <>
        <p className="small">Anda sudah melamar posisi ini.</p>
        <Link className="btn btn-outline btn-block" to={`/candidate/applications/${job.applied_application_id}`}>
          <FileText size={18} aria-hidden="true" /> Lihat status lamaran
        </Link>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <Link className="btn btn-primary btn-block" to="/login" state={{ from: applyPath }}>
          <Send size={18} aria-hidden="true" /> Lamar Sekarang
        </Link>
        <p className="muted small">
          Anda perlu masuk terlebih dahulu. Belum punya akun?{' '}
          <Link className="text-link" to="/register" state={{ from: applyPath }}>Daftar</Link>
        </p>
      </>
    );
  }
  return (
    <Link className="btn btn-primary btn-block" to={applyPath}>
      <Send size={18} aria-hidden="true" /> Lamar Sekarang
    </Link>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(`/jobs/${id}`);

  if (loading) return <div className="container page-section"><Loading label="Memuat lowongan..." /></div>;
  if (error) {
    return (
      <div className="container page-section">
        <ErrorMessage message={error} onRetry={reload} />
        <Link to="/karir" className="text-link">Kembali ke daftar lowongan</Link>
      </div>
    );
  }

  const job = data.job;
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className="container page-section">
      <Link to="/karir" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Semua lowongan
      </Link>

      <header className="detail-head">
        <h1>{job.title}</h1>
        <ul className="meta-list meta-list-lg">
          <li><Building2 size={17} aria-hidden="true" />{job.company}, {job.department}</li>
          <li><MapPin size={17} aria-hidden="true" />{job.location}</li>
          <li><Briefcase size={17} aria-hidden="true" />{EMPLOYMENT_LABELS[job.employment_type]}</li>
        </ul>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <Section title="Deskripsi pekerjaan" text={job.description} />
          <Section title="Tanggung jawab" text={job.responsibilities} asList />
          <Section title="Kualifikasi" text={job.qualifications} asList />
          {job.benefits && <Section title="Benefit" text={job.benefits} asList />}
        </div>

        <aside className="detail-side">
          <div className="panel">
            <h2>Lamaran</h2>
            <dl className="facts facts-icons">
              <div>
                <Banknote size={18} aria-hidden="true" />
                <dt>Gaji</dt><dd>{salary || 'Tidak dicantumkan'}</dd>
              </div>
              <div>
                <CalendarDays size={18} aria-hidden="true" />
                <dt>Diposting</dt><dd>{formatDate(job.created_at)}</dd>
              </div>
              <div>
                <CalendarClock size={18} aria-hidden="true" />
                <dt>Batas lamaran</dt><dd>{job.deadline ? formatDate(job.deadline) : 'Tidak ada batas'}</dd>
              </div>
            </dl>
            <ApplyAction job={job} />
          </div>
        </aside>
      </div>
    </div>
  );
}
