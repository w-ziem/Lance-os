import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&rounded=true&bold=true&size=56`;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/clients', label: 'Clients', icon: <UsersIcon /> },
  { path: '/projects', label: 'Projects', icon: <FolderIcon /> },
  { path: '/tasks', label: 'Tasks', icon: <CheckSquareIcon /> },
  { path: '/calendar', label: 'Calendar', icon: <CalendarIcon /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{
      width: 216,
      flexShrink: 0,
      height: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Wordmark */}
      <div style={{
        padding: '22px 18px 18px',
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 20,
          color: '#fff',
          letterSpacing: '-0.04em',
        }}>
          Lance
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--sidebar-fg-muted)',
          marginTop: 2,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Freelance OS
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.path}
            label={item.label}
            icon={item.icon}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '0 10px 14px' }}>
        <div style={{ height: 1, background: 'var(--sidebar-border)', margin: '0 2px 10px' }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
        }}>
          <img
            src={avatarUrl(user?.fullName ?? 'User')}
            alt={user?.fullName ?? 'User'}
            width={28}
            height={28}
            style={{ borderRadius: '50%', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#fff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.fullName ?? 'User'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--sidebar-fg-muted)' }}>
              Lancer
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, icon, active, onClick }: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 10px',
        borderRadius: 7,
        border: 'none',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        background: active ? 'var(--sidebar-active)' : hovered ? 'var(--sidebar-hover)' : 'transparent',
        color: active ? '#fff' : 'var(--sidebar-fg)',
        fontFamily: 'var(--font-body)',
        fontWeight: active ? 500 : 400,
        fontSize: 13,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all 0.14s ease',
      }}
    >
      <span style={{ opacity: active ? 1 : 0.55, display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}

/* ── Icons ────────────────────────────────────────────────── */

function DashboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
