import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getHomePath } from '../../utils/navigation.js';

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
        <p className="muted">Akun dibutuhkan untuk melamar dan memantau status lamaran.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nama lengkap</span>
            <input name="full_name" value={form.full_name} onChange={handleChange} autoComplete="name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label className="field">
            <span>Nomor HP</span>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="081234567890" autoComplete="tel" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
            <small className="muted">Minimal 8 karakter, mengandung huruf dan angka.</small>
          </label>
          <label className="field">
            <span>Konfirmasi password</span>
            <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" required />
          </label>
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
