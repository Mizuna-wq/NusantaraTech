import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Halaman">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} aria-hidden="true" /> Sebelumnya
      </button>
      <span className="muted">Halaman {page} dari {totalPages}</span>
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Berikutnya <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
