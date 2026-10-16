import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '../services/api.js';

// Dipakai oleh kandidat dan HR
export default function Settings() {
  const empty = { current_password: '', new_password: '', confirm_password: '' };
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    if (form.new_password !== form.confirm_password) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    setSaving(true);
    try {
      await api('/auth/password', { method: 'PUT', body: form });
      setMessage('Password berhasil diubah');
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-head"><h1>Pengaturan</h1></div>
      <section className="panel panel-narrow">
        <h2>Ubah password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Password saat ini</span>
            <input type="password" name="current_password" value={form.current_password} onChange={handleChange} autoComplete="current-password" required />
          </label>
          <label className="field">
            <span>Password baru</span>
            <input type="password" name="new_password" value={form.new_password} onChange={handleChange} autoComplete="new-password" required />
            <small className="muted">Minimal 8 karakter, mengandung huruf dan angka.</small>
          </label>
          <label className="field">
            <span>Konfirmasi password baru</span>
            <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} autoComplete="new-password" required />
          </label>
          {message && <p className="alert alert-success" role="status">{message}</p>}
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <KeyRound size={18} aria-hidden="true" /> {saving ? 'Menyimpan...' : 'Simpan password'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
