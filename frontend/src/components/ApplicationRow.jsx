import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/format.js';

// Satu baris lamaran di dashboard dan halaman Lamaran Saya (sisi kandidat)
export default function ApplicationRow({ application }) {
  return (
    <Link to={`/candidate/applications/${application.id}`} className="row-item">
      <div className="row-item-main">
        <h3>{application.title}</h3>
        <p className="muted small">
          {application.company}
          <span className="row-item-place">
            <MapPin size={14} aria-hidden="true" /> {application.location}
          </span>
        </p>
      </div>
      <div className="row-item-side">
        <StatusBadge status={application.status} />
        <span className="muted small">Dilamar {formatDate(application.created_at)}</span>
      </div>
    </Link>
  );
}
