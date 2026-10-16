import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import Logo from '../components/Logo.jsx';
import Footer from '../components/Footer.jsx';

const STORAGE_KEY = 'sidebar-collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Kerangka halaman: sidebar di kiri, isi halaman di kanan.
// Desktop: sidebar bisa diciutkan menjadi deretan ikon. Mobile: sidebar menjadi drawer.
// renderFooter({ collapsed }) mengisi bagian bawah sidebar (akun / tombol masuk).
export default function AppShell({ items, renderFooter, padded = false, showSiteFooter = false }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Tutup drawer setiap pindah halaman
  useEffect(() => setOpen(false), [location.pathname]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // penyimpanan tidak tersedia: abaikan
    }
  }

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      <div className={`shell-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <Sidebar
        items={items}
        footer={renderFooter({ collapsed })}
        collapsed={collapsed}
        open={open}
        onClose={() => setOpen(false)}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="shell-body">
        <header className="shell-topbar">
          {/* Tombol hamburger – hanya mobile */}
          <button type="button" className="icon-btn topbar-mobile-only" aria-label="Buka menu" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>

          {/* Tombol toggle collapse – hanya desktop */}
          <button
            type="button"
            className="icon-btn topbar-desktop-only"
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            onClick={toggleCollapsed}
          >
            {collapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
          </button>

          <Logo />
        </header>

        <main className={`shell-main ${padded ? 'padded' : ''}`}>
          <Outlet />
        </main>

        {showSiteFooter && <Footer />}
      </div>
    </div>
  );
}
