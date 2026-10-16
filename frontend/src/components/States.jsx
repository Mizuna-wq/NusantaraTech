import { AlertCircle, Inbox } from 'lucide-react';

export function Loading({ label = 'Memuat data...' }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

// icon: komponen ikon lucide (opsional). children dipakai untuk tombol / link ajakan bertindak.
export function EmptyState({ title, text, icon: Icon = Inbox, children }) {
  return (
    <div className="state">
      <span className="state-icon"><Icon size={24} aria-hidden="true" /></span>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-icon"><AlertCircle size={24} aria-hidden="true" /></span>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>Coba lagi</button>
      )}
    </div>
  );
}
