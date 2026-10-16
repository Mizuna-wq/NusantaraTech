import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY } from '../../utils/constants.js';

// NusantaraTech adalah satu-satunya perusahaan di sistem ini, jadi halaman ini hanya menampilkan datanya.
export default function AdminCompany() {
  return (
    <>
      <div className="page-head"><h1>Perusahaan</h1></div>
      <section className="panel panel-narrow">
        <h2>{COMPANY.name}</h2>
        <p className="muted">Data ini tampil di halaman kontak dan footer website karir.</p>
        <dl className="facts facts-icons">
          <div><Mail size={18} aria-hidden="true" /><dt>Email karir</dt><dd>{COMPANY.email}</dd></div>
          <div><Phone size={18} aria-hidden="true" /><dt>Telepon</dt><dd>{COMPANY.phone}</dd></div>
          <div><MapPin size={18} aria-hidden="true" /><dt>Alamat</dt><dd>{COMPANY.address}</dd></div>
          <div><Clock size={18} aria-hidden="true" /><dt>Jam layanan</dt><dd>{COMPANY.hours}</dd></div>
        </dl>
        <p className="muted small">Untuk mengubahnya, edit file frontend/src/utils/constants.js.</p>
      </section>
    </>
  );
}
