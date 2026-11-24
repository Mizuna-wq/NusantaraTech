import { useRef, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api, downloadCv } from '../../services/api.js';
import { formatDate, formatFileSize } from '../../utils/format.js';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

export default function CandidateCV() {
  const { data, loading, error, reload } = useFetch('/cv');
  const [extract, setExtract] = useState(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const cv = data?.cv;

  function resetInput() {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // Validasi di browser hanya untuk kenyamanan; backend tetap memeriksa ulang
  function handleFileChange(event) {
    setMessage('');
    setFormError('');
    const chosen = event.target.files[0];
    if (!chosen) return setFile(null);

    const extension = chosen.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFormError('Format file harus PDF, DOC, atau DOCX');
      return resetInput();
    }
    if (chosen.size > MAX_SIZE) {
      setFormError('Ukuran file maksimal 5 MB');
      return resetInput();
    }
    setFile(chosen);
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setFormError('');
    setMessage('');
    const form = new FormData();
    form.append('cv', file);
    try {
      await api('/cv', { method: 'POST', form });
      setMessage(cv ? 'CV berhasil diganti' : 'CV berhasil diunggah');
      resetInput();
      reload();
      await refreshExtract();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshExtract() {
    setExtractLoading(true);
    try {
      const res = await api('/cv/extract');
      setExtract(res.data);
    } catch (err) {
      // jika belum ada ekstraksi (belum ada CV), abaikan
    } finally {
      setExtractLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Hapus CV ini?')) return;
    setFormError('');
    setMessage('');
    try {
      await api(`/cv/${cv.id}`, { method: 'DELETE' });
      setMessage('CV berhasil dihapus');
      reload();
      setExtract(null);
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDownload() {
    setFormError('');
    try {
      await downloadCv(cv.id, cv.original_filename);
    } catch (err) {
      setFormError(err.message);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>CV Saya</h1>
        <p className="muted small">
          Unggah CV (PDF/DOC/DOCX) lalu sistem akan membacanya dan mendeteksi skill, ijazah, dan sertifikat Anda.
        </p>
      </div>

      {loading && !data && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className="stack">
          {/* Data ekstraksi */}
          {extractLoading && <p className="muted small">Membaca isi CV...</p>}
          {extract && (
            <section className="panel">
              <h2>Dari CV yang diunggah</h2>
              {extract.skills && extract.skills.length > 0 && (
                <div className="tag-group">
                  {extract.skills.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>
              )}
              {extract.ijazah && extract.ijazah.length > 0 && (
                <p className="muted small">Ijazah: {extract.ijazah.join(', ')}</p>
              )}
              {extract.sertifikat && extract.sertifikat.length > 0 && (
                <p className="muted small">Sertifikat: {extract.sertifikat.join(', ')}</p>
              )}
              {(!extract.skills || extract.skills.length === 0) && !extract.ijazah && !extract.sertifikat && (
                <p className="muted small">Belum ada data yang dapat diekstrak. Silakan unggah CV PDF.</p>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={refreshExtract}
                disabled={extractLoading}
              >
                {extractLoading ? 'Membaca...' : 'Ulangi pembacaan'}
              </button>
            </section>
          )}

          <section className="panel">
            <h2>CV saat ini</h2>
            {cv ? (
              <div className="file-card">
                <FileText size={28} aria-hidden="true" />
                <div className="file-card-info">
                  <strong>{cv.original_filename}</strong>
                  <span className="muted small">
                    {formatFileSize(cv.file_size)}, diunggah {formatDate(cv.uploaded_at)}
                  </span>
                </div>
                <div className="file-card-actions">
                  <button className="btn btn-outline btn-sm" onClick={handleDownload}>
                    <Download size={16} aria-hidden="true" /> Unduh
                  </button>
                  <button className="btn btn-danger-outline btn-sm" onClick={handleDelete}>
                    <Trash2 size={16} aria-hidden="true" /> Hapus
                  </button>
                </div>
              </div>
            ) : (
              <p className="muted">Anda belum mengunggah CV. CV dibutuhkan untuk melamar lowongan.</p>
            )}
          </section>

          <section className="panel">
            <h2>{cv ? 'Ganti CV' : 'Unggah CV'}</h2>
            <form className="form" onSubmit={handleUpload}>
              <label className="field">
                <span>File CV</span>
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                <small className="muted">Format PDF, DOC, atau DOCX. Ukuran maksimal 5 MB.</small>
              </label>
              {cv && (
                <p className="muted small">
                  Lamaran yang sudah terkirim tetap memakai CV yang Anda unggah saat melamar.
                </p>
              )}
              {message && <p className="alert alert-success" role="status">{message}</p>}
              {formError && <p className="alert alert-error" role="alert">{formError}</p>}
              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={!file || busy}>
                  <Upload size={18} aria-hidden="true" /> {busy ? 'Mengunggah...' : cv ? 'Ganti CV' : 'Unggah CV'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
