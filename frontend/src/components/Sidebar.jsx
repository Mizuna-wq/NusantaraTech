import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import Logo from './Logo.jsx';

// item: { label, icon, to, end } untuk link, atau { label, icon, onClick } untuk tombol.
// divider: true menambah garis pemisah di atas item.
function SidebarItem({ item, collapsed }) {
  const Icon = item.icon;
  const title = collapsed ? item.label : undefined;
  const content = (
    <>
      <Icon size={20} aria-hidden="true" />
      <span className="sidebar-label">{item.label}</span>
    </>
  );

  return (
    <>
      {item.divider && <div className="sidebar-divider" />}
      {item.onClick ? (
        <button type="button" className="sidebar-link" onClick={item.onClick} title={title}>
          {content}
        </button>
      ) : (
        <NavLink to={item.to} end={item.end} className="sidebar-link" title={title}>
          {content}
        </NavLink>
      )}
    </>
  );
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export function SidebarUser({ user }) {
  return (
    <div className="sidebar-user" title={user.full_name}>
      <span className="avatar" aria-hidden="true">{initials(user.full_name)}</span>
      <span className="sidebar-user-info">
        <strong>{user.full_name}</strong>
        <small>{user.email}</small>
      </span>
    </div>
  );
}

export default function Sidebar({ items, footer, collapsed, open, onClose, onToggleCollapse }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-head">
        <Logo />
        <button type="button" className="icon-btn sidebar-close" aria-label="Tutup menu" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Menu utama">
        {items.map((item) => <SidebarItem key={item.label} item={item} collapsed={collapsed} />)}
      </nav>

      <div className="sidebar-bottom">
        {footer}
        <button
          type="button"
          className="sidebar-link sidebar-collapse"
          onClick={onToggleCollapse}
          title={collapsed ? 'Perluas menu' : undefined}
        >
          <ToggleIcon size={20} aria-hidden="true" />
          <span className="sidebar-label">Ciutkan menu</span>
        </button>
      </div>
    </aside>
  );
}
