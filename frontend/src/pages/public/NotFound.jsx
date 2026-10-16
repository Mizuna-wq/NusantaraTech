import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../../components/States.jsx';

export default function NotFound() {
  return (
    <div className="container page-section">
      <EmptyState icon={Compass} title="Halaman tidak ditemukan" text="Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.">
        <Link to="/" className="btn btn-primary btn-sm">Kembali ke beranda</Link>
      </EmptyState>
    </div>
  );
}
