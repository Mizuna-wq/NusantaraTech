import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Pencil, Plus, Power, PowerOff, Search, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../services/api.js';
import { EMPLOYMENT_LABELS, JOB_STATUS_LABELS, formatDate } from '../../utils/format.js';

export default function AdminJobs() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [actionError, setActionError] = useState('');

  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (q) query.set('q', q);
  const { data, loading, error, reload } = useFetch(`/jobs/admin/all?${query}`);

  async function changeStatus(job, newStatus) {
    setActionError('');
    try {
      await api(`/jobs/${job.id}/status`, { method: 'PATCH', body: { status: newStatus } });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete(job) {
    if (!window.confirm(`Hapus lowongan "${job.title}"?`)) return;
    setActionError('');
    try {
      await api(`/jobs/${job.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Lowongan</h1>
        <Link to="/admin/jobs/new" className="btn btn-primary btn-sm">
          <Plus size={16} aria-hidden="true" /> Buat lowongan
        </Link>
      </div>

      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setQ(search.trim());
        }}
      >
        <label className="field">
          <span>Cari</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Judul atau department" />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua status</option>
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-outline btn-sm" type="submit">
          <Search size={16} aria-hidden="true" /> Cari
        </button>
      </form>

      {actionError && <p className="alert alert-error" role="alert">{actionError}</p>}
      {loading && !data && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && data.jobs.length === 0 && (
        <EmptyState icon={Briefcase} title="Belum ada lowongan" text="Buat lowongan pertama untuk mulai menerima lamaran.">
          <Link to="/admin/jobs/new" className="btn btn-primary btn-sm">
            <Plus size={16} aria-hidden="true" /> Buat lowongan
          </Link>
        </EmptyState>
      )}

      {data && data.jobs.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Posisi</th>
                <th>Jenis</th>
                <th>Status</th>
                <th>Pelamar</th>
                <th>Deadline</th>
                <th><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <div className="muted small">{job.department}, {job.location}</div>
                  </td>
                  <td>{EMPLOYMENT_LABELS[job.employment_type]}</td>
                  <td><StatusBadge status={job.status} kind="job" /></td>
                  <td>
                    <Link className="text-link" to={`/admin/applicants?job_id=${job.id}`}>{job.applicant_count}</Link>
                  </td>
                  <td>{job.deadline ? formatDate(job.deadline) : '-'}</td>
                  <td>
                    <div className="table-actions">
                      {job.status === 'published' ? (
                        <button className="btn btn-outline btn-sm" onClick={() => changeStatus(job, 'closed')}>
                          <PowerOff size={15} aria-hidden="true" /> Nonaktifkan
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => changeStatus(job, 'published')}>
                          <Power size={15} aria-hidden="true" /> Aktifkan
                        </button>
                      )}
                      <Link className="icon-btn" to={`/admin/jobs/${job.id}/edit`} aria-label={`Edit ${job.title}`}>
                        <Pencil size={17} />
                      </Link>
                      <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(job)} aria-label={`Hapus ${job.title}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
