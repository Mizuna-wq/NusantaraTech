import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="logo" aria-label="NusantaraTech, ke beranda">
      <span className="logo-mark" aria-hidden="true">N</span>
      <span className="logo-text">NusantaraTech</span>
    </Link>
  );
}
