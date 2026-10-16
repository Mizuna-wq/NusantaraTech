import { Check, Code, MessageSquare, Search, Send, X } from 'lucide-react';
import { STATUS_LABELS, formatDateTime } from '../utils/format.js';

const ICONS = {
  submitted: Send,
  screening: Search,
  interview: MessageSquare,
  technical_test: Code,
  accepted: Check,
  rejected: X,
};

// Menampilkan riwayat status apa adanya dari database
export default function StatusTimeline({ history }) {
  return (
    <ol className="timeline">
      {history.map((item, index) => {
        const Icon = ICONS[item.new_status];
        const isLast = index === history.length - 1;
        return (
          <li key={item.id} className={`timeline-item tone-${item.new_status} ${isLast ? 'current' : ''}`}>
            <span className="timeline-dot"><Icon size={14} aria-hidden="true" /></span>
            <div className="timeline-head">
              <strong>{STATUS_LABELS[item.new_status]}</strong>
              <span className="muted small">{formatDateTime(item.created_at)}</span>
            </div>
            {item.note && <p className="timeline-note">{item.note}</p>}
            {item.changed_by_name && (
              <p className="muted small">Diubah oleh {item.changed_by_name}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
