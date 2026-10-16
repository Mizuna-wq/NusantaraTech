import { Link } from 'react-router-dom';
import ApplicationRow from '../../components/ApplicationRow.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function CandidateApplications() {
  const { data, loading, error, reload } = useFetch('/applications');

  return (
    <>
      <div className="page-head"><h1>Lamaran Saya</h1></div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && data.applications.length === 0 && (
        <EmptyState title="Anda belum melamar posisi apa pun" text="Temukan posisi yang cocok, lalu kirim lamaran pertama Anda.">
          <Link to="/karir" className="btn btn-primary btn-sm">Lihat lowongan</Link>
        </EmptyState>
      )}

      {data && data.applications.length > 0 && (
        <div className="row-list">
          {data.applications.map((item) => <ApplicationRow key={item.id} application={item} />)}
        </div>
      )}
    </>
  );
}
