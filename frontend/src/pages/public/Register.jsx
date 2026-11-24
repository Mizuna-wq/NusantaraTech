import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getHomePath } from '../../utils/navigation.js';
import { COMPANIES } from '../../utils/constants.js';

export default function Register() {
  const { user, register } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'candidate',
    company_id: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={getHomePath(user, from)} replace />;

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Buat akun</h1>
        <p className="muted">
          Akun dipakai untuk melamar, melihat CV, atau mengelola lowongan perusahaan.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field" style={{ flex: 1 }}>
              <span>Nama lengkap</span>
              <input name="full_name" value={form.full_name} onChange={handleChange} autoComplete="name" required />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </label>
          </div>
          <label className="field">
            <span>Nomor HP</span>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="081234567890" autoComplete="tel" required />
          </label>

          <div className="form-row">
            <label className="field" style={{ flex: 1 }}>
              <span>Password</span>
              <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
              <small className="muted">Minimal 8 karakter, huruf + angka.</small>
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Konfirmasi password</span>
              <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" required />
            </label>
          </div>

          <label className="field">
            <span>Jelasin sebagai</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="candidate">Pelamar / Kandidat</option>
              <option value="hr">HRD (pegawai HR perusahaan)</option>
              <option value="admin">Admin platform</option>
            </select>
          </label>

          {form.role === 'hr' && (
            <label className="field">
              <span>Perusahaan</span>
              <select name="company_id" value={form.company_id} onChange={handleChange}>
                <option value="">Pilih perusahaan...</option>
                {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}

          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            <UserPlus size={18} aria-hidden="true" /> {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="muted auth-switch">
          Sudah punya akun? <Link className="text-link" to="/login" state={{ from }}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}
