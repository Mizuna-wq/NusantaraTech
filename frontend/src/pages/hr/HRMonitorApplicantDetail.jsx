import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Save } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge.jsx';
import StatusTimeline from '../../components/StatusTimeline.jsx';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../services/api.js';
import { STATUS_LABELS, formatDate, formatFileSize } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function HRMonitorApplicantDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(`/applications/${id}`);

  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data) {
      setStatus(data.application.status);
      setInternalNote(data.application.note_internal || '');
    }
  }, [data]);

  async function handleStatusSubmit(event) {
    event.preventDefault();
    setActionError('');
    setStatusMessage('');
    setBusy(true);
    try {
      await api(`/applications/${id}/status`, { method: 'PUT', body: { status, note: statusNote } });
      setStatusNote('');
      setStatusMessage('Status lamaran berhasil diubah');
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleNoteSubmit(event) {
    event.preventDefault();
    setActionError('');
    setNoteMessage('');
    try {
      await api(`/applications/${id}/notes`, { method: 'PUT', body: { note_internal: internalNote } });
      setNoteMessage('Catatan internal disimpan');
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDownload() {
    setActionError('');
    try {
      await downloadCv(data.application.cv_id, data.application.cv_name);
    } catch (err) {
      setActionError(err.message);
    }
  }

  const app = data?.application;

  return (
    <>
      <Link to="/hr/applicants" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Pelamar
      </Link>

      {loading && !data && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {app && (
        <>
          <div className="page-head">
            <h1>{app.full_name}</h1>
            <StatusBadge status={app.status} />
          </div>
          {actionError && <p className="alert alert-error" role="alert">{actionError}</p>}

          <div className="two-col">
            <div className="stack">
              <section className="panel">
                <h2>Data kandidat</h2>
                <dl className="facts">
                  <div><dt>Email</dt><dd>{app.email}</dd></div>
                  <div><dt>Nomor HP</dt><dd>{app.phone}</dd></div>
                  <div><dt>Kota</dt><dd>{app.city || '-'}</dd></div>
                  <div><dt>Alamat</dt><dd>{app.address || '-'}</dd></div>
                  <div><dt>Pendidikan</dt><dd>{app.education || '-'}</dd></div>
                  <div><dt>Skills</dt><dd>{app.skills || '-'}</dd></div>
                  {app.extracted_skills && (
                    <div className="panel-sub">
                      <span className="muted small">Skill terdeteksi dari CV: </span>
                      {app.extracted_skills}
                    </div>
                  )}
                </dl>
              </section>

              <section className="panel">
                <h2>Lamaran</h2>
                <dl className="facts">
                  <div><dt>Posisi</dt><dd>{app.title}</dd></div>
                  <div><dt>Department</dt><dd>{app.department}</dd></div>
                  <div><dt>Tanggal apply</dt><dd>{formatDate(app.created_at)}</dd></div>
                  <div>
                    <dt>CV</dt>
                    <dd>
                      {app.cv_name ? (
                        <button className="btn btn-outline btn-sm" onClick={handleDownload}>
                          <Download size={15} aria-hidden="true" /> {app.cv_name} ({formatFileSize(app.cv_size)})
                        </button>
                      ) : '-'}
                    </dd>
                  </div>
                </dl>
                <h3>Cover letter</h3>
                {app.cover_letter ? <p className="prewrap">{app.cover_letter}</p> : <p className="muted">Kandidat tidak melampirkan cover letter.</p>}
              </section>
            </div>

            <div className="stack">
              <section className="panel">
                <h2>Ubah status</h2>
                <form className="form" onSubmit={handleStatusSubmit}>
                  <label className="field">
                    <span>Status</span>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Catatan untuk kandidat (opsional)</span>
                    <textarea rows={3} maxLength={1000} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
                    <small className="muted">Catatan ini tampil di timeline kandidat. Email dikirim saat status menjadi Interview, Accepted, atau Rejected.</small>
                  </label>
                  {statusMessage && <p className="alert alert-success" role="status">{statusMessage}</p>}
                  <div className="form-actions">
                    <button className="btn btn-primary" type="submit" disabled={busy || status === app.status}>
                      <Save size={18} aria-hidden="true" /> {busy ? 'Menyimpan...' : 'Simpan status'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="panel">
                <h2>Catatan internal</h2>
                <form className="form" onSubmit={handleNoteSubmit}>
                  <label className="field">
                    <span>Catatan (hanya terlihat oleh HR)</span>
                    <textarea rows={4} maxLength={2000} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
                  </label>
                  {noteMessage && <p className="alert alert-success" role="status">{noteMessage}</p>}
                  <div className="form-actions">
                    <button className="btn btn-outline" type="submit">
                      <Save size={18} aria-hidden="true" /> Simpan catatan
                    </button>
                  </div>
                </form>
              </section>

              <section className="panel">
                <h2>Riwayat status</h2>
                <StatusTimeline history={data.history} />
              </section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
