import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { getHomePath } from '../../utils/navigation.js';
import { COMPANIES } from '../../utils/constants.js';

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Setelah login berhasil, user terisi dan halaman langsung dialihkan
  if (user) return <Navigate to={getHomePath(user, from)} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, role, companyId);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container auth-page">
      <div className="auth-card">
        <h1>Masuk</h1>
        {from && <p className="muted">Masuk untuk melanjutkan lamaran Anda.</p>}
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="field" style={{ flex: 1 }}>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
          </div>

          {role === 'hr' && (
            <label className="field">
              <span>Perusahaan</span>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} required>
                <option value="">Pilih perusahaan...</option>
                {COMPANIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}

          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            <LogIn size={18} aria-hidden="true" /> {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="muted auth-switch">
          Belum punya akun? <Link className="text-link" to="/register" state={{ from }}>Daftar</Link>
        </p>
      </div>
    </div>
  );
}
