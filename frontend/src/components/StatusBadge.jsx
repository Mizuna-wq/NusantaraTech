import { STATUS_LABELS, JOB_STATUS_LABELS } from '../utils/format.js';

const TONE = {
  submitted: 'neutral',
  screening: 'info',
  interview: 'info',
  technical_test: 'info',
  accepted: 'success',
  rejected: 'danger',
  draft: 'neutral',
  published: 'success',
  closed: 'danger',
};

// kind="job" untuk status lowongan, selain itu status lamaran
export default function StatusBadge({ status, kind = 'application' }) {
  const label = kind === 'job' ? JOB_STATUS_LABELS[status] : STATUS_LABELS[status];
  return <span className={`badge badge-${TONE[status]}`}>{label}</span>;
}
