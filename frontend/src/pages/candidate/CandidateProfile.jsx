import { useState } from 'react';
import { Save, FileText } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { api } from '../../services/api.js';

function ProfileForm({ initial }) {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    full_name: initial.full_name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    address: initial.address || '',
    city: initial.city || '',
    education: initial.education || '',
    skills: initial.skills || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await api(`/candidates/${user.id}`, { method: 'PUT', body: form });
      const saved = res.data.candidate;
      setUser({ ...user, full_name: saved.full_name, email: saved.email, phone: saved.phone });
      setMessage('Profil berhasil disimpan');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form form-wide" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nama lengkap</span>
        <input name="full_name" value={form.full_name} onChange={handleChange} required />
      </label>
      <div className="form-row">
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Nomor HP</span>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
        </label>
      </div>
      <label className="field">
        <span>Alamat</span>
        <input name="address" value={form.address} onChange={handleChange} maxLength={255} />
      </label>
      <div className="form-row">
        <label className="field">
          <span>Kota</span>
          <input name="city" value={form.city} onChange={handleChange} maxLength={100} />
        </label>
        <label className="field">
          <span>Pendidikan</span>
          <input name="education" value={form.education} onChange={handleChange} maxLength={255} placeholder="Contoh: S1 Informatika, Universitas Airlangga" />
        </label>
      </div>
      <label className="field">
        <span>Skills (tulis koma)</span>
        <textarea name="skills" rows={3} value={form.skills} onChange={handleChange} maxLength={1000} placeholder="Pisahkan dengan koma. Contoh: React, Node.js, SQL" />
      </label>

      {message && <p className="alert alert-success" role="status">{message}</p>}
      {error && <p className="alert alert-error" role="alert">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          <Save size={18} aria-hidden="true" /> {saving ? 'Menyimpan...' : 'Simpan profil'}
        </button>
      </div>
    </form>
  );
}

export default function CandidateProfile() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(`/candidates/${user.id}`);

  return (
    <>
      <div className="page-head">
        <h1>Profil</h1>
        <p className="muted small">Isi data diri Anda. Skill yang terdeteksi dari CV akan ditampilkan di bawah.</p>
      </div>
      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {data && <ProfileForm initial={data.candidate} />}
    </>
  );
}
