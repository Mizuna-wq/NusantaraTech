import { useSearchParams } from 'react-router-dom';
import { SearchX, X } from 'lucide-react';
import SearchBar from '../../components/SearchBar.jsx';
import JobListItem from '../../components/JobListItem.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Loading, EmptyState, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { EMPLOYMENT_LABELS } from '../../utils/format.js';

const PAGE_SIZE = 8;

export default function Careers() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = params.get('type') || '';
  const location = params.get('location') || '';
  const department = params.get('department') || '';
  const page = Number(params.get('page')) || 1;

  const filters = useFetch('/jobs/filters');

  const query = new URLSearchParams({ page, limit: PAGE_SIZE });
  if (q) query.set('q', q);
  if (type) query.set('type', type);
  if (location) query.set('location', location);
  if (department) query.set('department', department);
  const { data, loading, error, reload } = useFetch(`/jobs?${query}`);

  // Ubah satu atau beberapa parameter URL. Halaman kembali ke 1 kecuali yang diubah adalah page.
  function update(changes) {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  }

  // Lokasi dari pencarian di beranda bisa berupa teks bebas, jadi tetap dimasukkan ke pilihan
  const locations = [...new Set([...(filters.data?.locations || []), ...(location ? [location] : [])])];
  const hasFilter = q || type || location || department;

  return (
    <div className="container page-section">
      <h1>Lowongan</h1>
      <p className="muted page-intro">Cari posisi yang sesuai dengan keahlian dan minat Anda.</p>

      <SearchBar
        key={q}
        initialQ={q}
        initialLocation={location}
        showLocation={false}
        onSearch={({ q: newQ }) => update({ q: newQ })}
      />

      <div className="filters">
        <label className="field">
          <span>Jenis pekerjaan</span>
          <select value={type} onChange={(e) => update({ type: e.target.value })}>
            <option value="">Semua jenis</option>
            {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Lokasi</span>
          <select value={location} onChange={(e) => update({ location: e.target.value })}>
            <option value="">Semua lokasi</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Department</span>
          <select value={department} onChange={(e) => update({ department: e.target.value })}>
            <option value="">Semua department</option>
            {(filters.data?.departments || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        {hasFilter && (
          <button className="btn btn-ghost btn-sm filters-reset" onClick={() => setParams({})}>
            <X size={16} aria-hidden="true" /> Hapus filter
          </button>
        )}
      </div>

      {loading && <Loading label="Memuat lowongan..." />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && data.jobs.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="Tidak ada lowongan yang cocok"
          text={hasFilter ? 'Coba kata kunci lain atau hapus filter yang aktif.' : 'Belum ada lowongan yang dibuka saat ini.'}
        >
          {hasFilter && (
            <button className="btn btn-outline btn-sm" onClick={() => setParams({})}>Hapus filter</button>
          )}
        </EmptyState>
      )}

      {data && data.jobs.length > 0 && (
        <>
          <p className="muted result-count">{data.pagination.total} lowongan ditemukan</p>
          <div className="job-list">
            {data.jobs.map((job) => <JobListItem key={job.id} job={job} />)}
          </div>
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onChange={(n) => {
              update({ page: n > 1 ? String(n) : '' });
              window.scrollTo({ top: 0 });
            }}
          />
        </>
      )}
    </div>
  );
}
