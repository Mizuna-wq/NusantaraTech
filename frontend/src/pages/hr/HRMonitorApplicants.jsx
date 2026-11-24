import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Download, Eye, Search, Users } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { downloadCv } from '../../services/api.js';
import { STATUS_LABELS, formatDate } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function HRMonitorApplicants() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const jobId = params.get('job_id') || '';
  const status = params.get('status') || '';
  const q = params.get('q') || '';
  const page = Number(params.get('page')) || 1;

  const [search, setSearch] = useState(q);
  const [downloadError, setDownloadError] = useState('');

  const query = new URLSearchParams({ page, limit: 10 });
  if (jobId) query.set('job_id', jobId);
  if (status) query.set('status', status);
  if (q) query.set('q', q);
  const { data, loading, error, reload } = useFetch(`/applications?${query}`);

  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  }

  async function handleDownload(application) {
    setDownloadError('');
    try {
      await downloadCv(application.cv_file_id, application.cv_name);
    } catch (err) {
      setDownloadError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Pelamar {user.company_id ? 'perusahaan' : ''}</h1>
        <p className="muted small">
          {user.company_id
            ? `Kandidat yang melamar lowongan perusahaan ID ${user.company_id}`
            : 'Semua kandidat di platform'}
        </p>
      </div>

      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim() });
        }}
      >
        <label className="field">
          <span>Lowongan</span>
          <select value={jobId} onChange={(e) => update({ job_id: e.target.value })}>
            <option value="">Semua lowongan</option>
            {(data?.jobs || []).map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(e) => update({ status: e.target.value })}>
            <option value="">Semua status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Nama atau email</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kandidat" />
        </label>
        <button className="btn btn-outline btn-sm" type="submit">
          <Search size={16} aria-hidden="true" /> Cari
        </button>
      </form>

      {downloadError && <p className="alert alert-error" role="alert">{downloadError}</p>}
      {loading && !data && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && data.applications.length === 0 && (
        <EmptyState icon={Users} title="Belum ada pelamar" text="Tidak ada lamaran yang cocok dengan filter saat ini." />
      )}

      {data && data.applications.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Kandidat</th>
                  <th>Posisi</th>
                  <th>Tanggal apply</th>
                  <th>Status</th>
                  <th>CV</th>
                  <th><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.full_name}</strong>
                      <div className="muted small">{item.email}</div>
                    </td>
                    <td>{item.title}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDownload(item)}>
                        <Download size={15} aria-hidden="true" /> Unduh
                      </button>
                    </td>
                    <td>
                      <Link className="btn btn-outline btn-sm" to={`/hr/applicants/${item.id}`}>
                        <Eye size={15} aria-hidden="true" /> Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(n) => update({ page: n > 1 ? String(n) : '' })}
          />
        </>
      )}
    </>
  );
}
