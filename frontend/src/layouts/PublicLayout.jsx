import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Home, LayoutDashboard, LogIn, LogOut, Mail, Newspaper, UserPlus } from 'lucide-react';
import AppShell from './AppShell.jsx';
import { SidebarUser } from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const ITEMS = [
  { to: '/', label: 'Beranda', icon: Home, end: true },
  { to: '/karir', label: 'Karir', icon: Briefcase },
  { to: '/tentang-kami', label: 'Tentang Kami', icon: Building2 },
  { to: '/blog', label: 'Blog', icon: Newspaper },
  { to: '/kontak', label: 'Kontak', icon: Mail },
];

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function renderFooter() {
    if (!user) {
      return (
        <div className="sidebar-auth">
          <Link to="/login" className="side-btn" title="Masuk">
            <LogIn size={18} aria-hidden="true" />
            <span className="sidebar-label">Masuk</span>
          </Link>
          <Link to="/register" className="side-btn side-btn-primary" title="Daftar">
            <UserPlus size={18} aria-hidden="true" />
            <span className="sidebar-label">Daftar</span>
          </Link>
        </div>
      );
    }

    const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard';
    return (
      <div className="sidebar-auth">
        <SidebarUser user={user} />
        <Link to={dashboardPath} className="side-btn side-btn-primary" title="Dashboard">
          <LayoutDashboard size={18} aria-hidden="true" />
          <span className="sidebar-label">Dashboard</span>
        </Link>
        <button type="button" className="side-btn" onClick={handleLogout} title="Keluar">
          <LogOut size={18} aria-hidden="true" />
          <span className="sidebar-label">Keluar</span>
        </button>
      </div>
    );
  }

  return <AppShell items={ITEMS} renderFooter={renderFooter} showSiteFooter />;
}
