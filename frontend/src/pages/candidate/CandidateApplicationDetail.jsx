import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import StatusTimeline from '../../components/StatusTimeline.jsx';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { EMPLOYMENT_LABELS, formatDate } from '../../utils/format.js';

export default function CandidateApplicationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(`/applications/${id}`);

  return (
    <>
      <Link to="/candidate/applications" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Lamaran Saya
      </Link>

      {location.state?.submitted && (
        <p className="alert alert-success" role="status">
          Lamaran berhasil dikirim. Anda dapat memantau perkembangannya di halaman ini.
        </p>
      )}

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="page-head">
            <h1>{data.application.title}</h1>
            <StatusBadge status={data.application.status} />
          </div>

          <div className="two-col">
            <section className="panel">
              <h2>Ringkasan lamaran</h2>
              <dl className="facts">
                <div><dt>Perusahaan</dt><dd>{data.application.company}</dd></div>
                <div><dt>Posisi</dt><dd>{data.application.title}</dd></div>
                <div><dt>Department</dt><dd>{data.application.department}</dd></div>
                <div><dt>Lokasi</dt><dd>{data.application.location}</dd></div>
                <div><dt>Jenis pekerjaan</dt><dd>{EMPLOYMENT_LABELS[data.application.employment_type]}</dd></div>
                <div><dt>Tanggal melamar</dt><dd>{formatDate(data.application.created_at)}</dd></div>
                <div><dt>Nomor HP</dt><dd>{data.application.phone}</dd></div>
                <div><dt>CV</dt><dd>{data.application.cv_name || '-'}</dd></div>
              </dl>
              {data.application.cover_letter && (
                <>
                  <h3>Cover letter</h3>
                  <p className="prewrap">{data.application.cover_letter}</p>
                </>
              )}
            </section>

            <section className="panel">
              <h2>Status lamaran</h2>
              <StatusTimeline history={data.history} />
            </section>
          </div>
        </>
      )}
    </>
  );
}
