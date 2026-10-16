import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../services/api.js';
import { formatFileSize } from '../../utils/format.js';

export default function ApplyJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const jobRes = useFetch(`/jobs/${id}`);
  const profileRes = useFetch(`/candidates/${user.id}`);
  const cvRes = useFetch('/cv');

  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Nomor HP diisi otomatis dari profil, tetapi masih bisa diubah untuk lamaran ini
  useEffect(() => {
    if (profileRes.data) setPhone(profileRes.data.candidate.phone);
  }, [profileRes.data]);

  if (jobRes.loading || profileRes.loading || cvRes.loading) {
    return <div className="container page-section"><Loading /></div>;
  }
  const loadError = jobRes.error || profileRes.error || cvRes.error;
  if (loadError) {
    return (
      <div className="container page-section">
        <ErrorMessage message={loadError} />
        <Link to="/karir" className="text-link">Kembali ke daftar lowongan</Link>
      </div>
    );
  }

  const job = jobRes.data.job;
  const profile = profileRes.data.candidate;
  const cv = cvRes.data.cv;
  const blocked = job.expired ? 'Pendaftaran untuk lowongan ini sudah ditutup.' : null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api('/applications', {
        method: 'POST',
        body: { job_id: Number(id), phone, cover_letter: coverLetter },
      });
      navigate(`/candidate/applications/${res.data.id}`, { state: { submitted: true } });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container container-narrow page-section">
      <Link to={`/karir/${job.id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke detail lowongan
      </Link>
      <h1>Lamar posisi {job.title}</h1>
      <p className="muted page-intro">{job.company}, {job.location}</p>

      {job.applied_application_id && (
        <div className="alert alert-info">
          Anda sudah melamar lowongan ini.{' '}
          <Link className="text-link" to={`/candidate/applications/${job.applied_application_id}`}>Lihat status lamaran</Link>
        </div>
      )}
      {blocked && <div className="alert alert-error">{blocked}</div>}

      {!job.applied_application_id && !blocked && (
        <form className="form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Data diri</h2>
            <dl className="facts facts-grid">
              <div><dt>Nama</dt><dd>{profile.full_name}</dd></div>
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
              <div><dt>Pendidikan</dt><dd>{profile.education || '-'}</dd></div>
              <div><dt>Skills</dt><dd>{profile.skills || '-'}</dd></div>
            </dl>
            {(!profile.education || !profile.skills) && (
              <p className="muted small">
                Profil Anda belum lengkap. <Link className="text-link" to="/candidate/profile">Lengkapi profil</Link> agar HR dapat menilai lamaran Anda dengan lebih baik.
              </p>
            )}
            <label className="field">
              <span>Nomor HP</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
          </section>

          <section className="form-section">
            <h2>CV</h2>
            {cv ? (
              <div className="file-row">
                <FileText size={20} aria-hidden="true" />
                <div>
                  <strong>{cv.original_filename}</strong>
                  <span className="muted small"> {formatFileSize(cv.file_size)}</span>
                </div>
                <Link className="text-link" to="/candidate/cv">Ganti CV</Link>
              </div>
            ) : (
              <div className="alert alert-info">
                Anda belum mengunggah CV. <Link className="text-link" to="/candidate/cv">Unggah CV</Link>, lalu kembali ke halaman ini.
              </div>
            )}
          </section>

          <section className="form-section">
            <h2>Cover letter</h2>
            <label className="field">
              <span>Cover letter (opsional)</span>
              <textarea
                rows={6}
                maxLength={3000}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Ceritakan singkat mengapa Anda tertarik dengan posisi ini."
              />
            </label>
          </section>

          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={submitting || !cv}>
              <Send size={18} aria-hidden="true" /> {submitting ? 'Mengirim...' : 'Kirim lamaran'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
