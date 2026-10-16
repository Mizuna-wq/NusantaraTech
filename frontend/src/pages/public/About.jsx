import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Target } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Produk yang berguna',
    text: 'Kami membangun alat yang benar-benar dipakai pelanggan setiap hari, bukan fitur untuk pamer.',
  },
  {
    icon: MessageSquare,
    title: 'Terbuka dan saling menghargai',
    text: 'Keputusan dijelaskan, masukan diberikan langsung, dan semua orang boleh bertanya.',
  },
  {
    icon: BookOpen,
    title: 'Belajar sambil bekerja',
    text: 'Setiap anggota tim, termasuk peserta magang, mendapat mentor dan waktu untuk berkembang.',
  },
];

export default function About() {
  return (
    <div className="container container-narrow page-section">
      <h1>Tentang NusantaraTech</h1>
      <p className="lead">
        NusantaraTech mengembangkan perangkat lunak untuk bisnis di Indonesia. Kami bekerja dari
        Surabaya, Jakarta, dan Bandung bersama tim engineer, desainer, dan analis data.
      </p>

      <h2>Cara kami bekerja</h2>
      <div className="value-list">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="value-card">
            <span className="value-icon"><Icon size={20} aria-hidden="true" /></span>
            <div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <p>
        Tertarik bergabung? <Link className="text-link" to="/karir">Lihat lowongan yang sedang dibuka</Link>.
      </p>
    </div>
  );
}
