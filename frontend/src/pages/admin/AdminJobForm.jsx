import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { api } from '../../services/api.js';
import { EMPLOYMENT_LABELS, JOB_STATUS_LABELS } from '../../utils/format.js';

const EMPTY_JOB = {
  title: '',
  department: '',
  description: '',
  responsibilities: '',
  qualifications: '',
  benefits: '',
  location: '',
  employment_type: 'full_time',
  salary_min: '',
  salary_max: '',
  deadline: '',
  status: 'draft',
};

function JobForm({ initial, jobId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (jobId) await api(`/jobs/${jobId}`, { method: 'PUT', body: form });
      else await api('/jobs', { method: 'POST', body: form });
      navigate('/admin/jobs');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="form form-wide" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="field">
          <span>Judul posisi</span>
          <input name="title" value={form.title} onChange={handleChange} maxLength={150} required />
        </label>
        <label className="field">
          <span>Department</span>
          <input name="department" value={form.department} onChange={handleChange} maxLength={100} required />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span>Lokasi</span>
          <input name="location" value={form.location} onChange={handleChange} maxLength={100} required />
        </label>
        <label className="field">
          <span>Jenis pekerjaan</span>
          <select name="employment_type" value={form.employment_type} onChange={handleChange}>
            {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span>Gaji minimum (Rp)</span>
          <input type="number" name="salary_min" min="0" value={form.salary_min} onChange={handleChange} />
        </label>
        <label className="field">
          <span>Gaji maksimum (Rp)</span>
          <input type="number" name="salary_max" min="0" value={form.salary_max} onChange={handleChange} />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span>Deadline</span>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          <small className="muted">Kosongkan jika tidak ada batas waktu.</small>
        </label>
        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <small className="muted">Hanya lowongan Published yang tampil di halaman publik.</small>
        </label>
      </div>

      <label className="field">
        <span>Deskripsi pekerjaan</span>
        <textarea name="description" rows={5} value={form.description} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Tanggung jawab</span>
        <textarea name="responsibilities" rows={5} value={form.responsibilities} onChange={handleChange} required />
        <small className="muted">Satu poin per baris.</small>
      </label>
      <label className="field">
        <span>Kualifikasi</span>
        <textarea name="qualifications" rows={5} value={form.qualifications} onChange={handleChange} required />
        <small className="muted">Satu poin per baris. Cantumkan skill yang dibutuhkan agar mudah dicari.</small>
      </label>
      <label className="field">
        <span>Benefit</span>
        <textarea name="benefits" rows={4} value={form.benefits} onChange={handleChange} />
        <small className="muted">Satu poin per baris. Boleh dikosongkan.</small>
      </label>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          <Save size={18} aria-hidden="true" /> {saving ? 'Menyimpan...' : jobId ? 'Simpan perubahan' : 'Buat lowongan'}
        </button>
        <Link to="/admin/jobs" className="btn btn-ghost">Batal</Link>
      </div>
    </form>
  );
}

export default function AdminJobForm() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(id ? `/jobs/${id}` : null);

  // Nilai null dari database diganti teks kosong agar cocok dengan input form
  const initial = data
    ? Object.fromEntries(Object.keys(EMPTY_JOB).map((key) => [key, data.job[key] ?? '']))
    : EMPTY_JOB;

  return (
    <>
      <Link to="/admin/jobs" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Lowongan
      </Link>
      <div className="page-head"><h1>{id ? 'Edit lowongan' : 'Buat lowongan'}</h1></div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {(!id || data) && <JobForm initial={initial} jobId={id} />}
    </>
  );
}
