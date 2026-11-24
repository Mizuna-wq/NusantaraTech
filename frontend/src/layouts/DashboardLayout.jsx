import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Building2, FileText, LayoutDashboard, LogOut, Settings, User, Users,
} from 'lucide-react';
import AppShell from './AppShell.jsx';
import { SidebarUser } from '../components/Sidebar.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const MENUS = {
  candidate: [
    { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/candidate/profile', label: 'Profil', icon: User },
    { to: '/candidate/cv', label: 'CV Saya', icon: FileText },
    { to: '/candidate/applications', label: 'Lamaran Saya', icon: Briefcase },
    { to: '/candidate/settings', label: 'Pengaturan', icon: Settings },
  ],
  hr: [
    { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hr/jobs', label: 'Lowongan', icon: Briefcase },
    { to: '/hr/applicants', label: 'Pelamar', icon: Users },
    { to: '/hr/company', label: 'Perusahaan', icon: Building2 },
    { to: '/hr/settings', label: 'Pengaturan', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/jobs', label: 'Lowongan', icon: Briefcase },
    { to: '/admin/applicants', label: 'Pelamar', icon: Users },
    { to: '/admin/company', label: 'Perusahaan', icon: Building2 },
    { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
  ],
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const items = [
    ...MENUS[role],
    { label: 'Keluar', icon: LogOut, onClick: handleLogout, divider: true },
  ];

  return <AppShell items={items} renderFooter={() => <SidebarUser user={user} />} padded />;
}
