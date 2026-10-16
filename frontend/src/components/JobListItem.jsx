import { Link } from 'react-router-dom';
import { Briefcase, Building2, ChevronRight, MapPin } from 'lucide-react';
import { EMPLOYMENT_LABELS, formatDate, formatSalary } from '../utils/format.js';

export default function JobListItem({ job }) {
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Link to={`/karir/${job.id}`} className="job-item">
      <div className="job-item-main">
        <h3>{job.title}</h3>
        <ul className="meta-list">
          <li><Building2 size={15} aria-hidden="true" />{job.department}</li>
          <li><MapPin size={15} aria-hidden="true" />{job.location}</li>
          <li><Briefcase size={15} aria-hidden="true" />{EMPLOYMENT_LABELS[job.employment_type]}</li>
        </ul>
        <p className="job-item-sub muted">
          {salary && <span className="job-salary">{salary}</span>}
          <span>Diposting {formatDate(job.created_at)}</span>
        </p>
      </div>
      <span className="job-item-link">
        Lihat detail <ChevronRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
