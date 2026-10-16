import { Mail, MapPin } from 'lucide-react';
import { COMPANY } from '../utils/constants.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <strong>{COMPANY.name}</strong>
        <ul className="meta-list">
          <li><MapPin size={15} aria-hidden="true" />{COMPANY.address}</li>
          <li><Mail size={15} aria-hidden="true" />{COMPANY.email}</li>
        </ul>
      </div>
      <div className="container footer-bottom muted">
        &copy; {new Date().getFullYear()} {COMPANY.name}. Seluruh hak dilindungi.
      </div>
    </footer>
  );
}
