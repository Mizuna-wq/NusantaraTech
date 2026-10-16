import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY } from '../../utils/constants.js';

export default function Contact() {
  return (
    <div className="container container-narrow page-section">
      <h1>Kontak</h1>
      <p className="lead">Pertanyaan seputar lowongan atau lamaran dapat dikirim ke tim HR kami.</p>
      <div className="panel">
        <dl className="facts facts-icons">
          <div><Mail size={18} aria-hidden="true" /><dt>Email</dt><dd>{COMPANY.email}</dd></div>
          <div><Phone size={18} aria-hidden="true" /><dt>Telepon</dt><dd>{COMPANY.phone}</dd></div>
          <div><MapPin size={18} aria-hidden="true" /><dt>Alamat</dt><dd>{COMPANY.address}</dd></div>
          <div><Clock size={18} aria-hidden="true" /><dt>Jam layanan</dt><dd>{COMPANY.hours}</dd></div>
        </dl>
      </div>
    </div>
  );
}
