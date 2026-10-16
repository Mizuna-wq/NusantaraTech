import { Newspaper } from 'lucide-react';
import { EmptyState } from '../../components/States.jsx';

export default function Blog() {
  return (
    <div className="container page-section">
      <h1>Blog</h1>
      <EmptyState
        icon={Newspaper}
        title="Belum ada artikel"
        text="Artikel dari tim NusantaraTech akan tampil di sini."
      />
    </div>
  );
}
