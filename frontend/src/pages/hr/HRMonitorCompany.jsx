import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Loading, ErrorMessage } from '../../components/States.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function HRMonitorCompany() {
  const { data, loading, error, reload } = useFetch('/dashboard/me');

  return (
    <>
      <div className="page-head">
        <h1>Perusahaan</h1>
        <Link to="/hr/dashboard" className="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 13L6 8l4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Kembali ke dashboard
        </Link>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && data.company && (
        <div className="stack">
          <section className="panel">
            <h2>Informasi perusahaan</h2>
            <dl className="facts">
              <div><dt>Nama</dt><dd>{data.company.name}</dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${data.company.email}`}>{data.company.email}</a></dd></div>
              <div><dt>Nomor HP</dt><dd><a href={`tel:${data.company.phone}`}>{data.company.phone}</a></dd></div>
              <div><dt>Alamat</dt><dd>{data.company.address || '-'}</dd></div>
            </dl>
          </section>
        </div>
      )}
    </>
  );
}
