import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

// Dipakai di beranda dan halaman karir. onSearch({ q, location }) dipanggil saat tombol Cari ditekan.
export default function SearchBar({ initialQ = '', initialLocation = '', showLocation = true, onSearch }) {
  const [q, setQ] = useState(initialQ);
  const [location, setLocation] = useState(initialLocation);

  function handleSubmit(event) {
    event.preventDefault();
    onSearch({ q: q.trim(), location: showLocation ? location.trim() : initialLocation });
  }

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <label className="searchbar-field">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Posisi atau skill</span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Posisi atau skill"
        />
      </label>
      {showLocation && (
        <label className="searchbar-field">
          <MapPin size={18} aria-hidden="true" />
          <span className="sr-only">Lokasi</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi"
          />
        </label>
      )}
      <button type="submit" className="btn btn-primary">Cari</button>
    </form>
  );
}
