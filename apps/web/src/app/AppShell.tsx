import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { navForRole } from '@ayekta/shared-types';
import { useAuthStore } from '../store/authStore';
import { signOutAndResetChart } from '../services/session';
import { SyncStatusBadge } from '../components/sync/SyncStatusBadge';
import { SyncBootstrap } from '../components/sync/SyncBootstrap';

const SIDEBAR_LS_KEY = 'ayekta-sidebar-collapsed';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium border-l-2 transition-colors ${
    isActive
      ? 'border-gray-900 bg-white text-gray-900 shadow-sm'
      : 'border-transparent text-gray-600 hover:bg-white/60 hover:text-gray-900'
  }`;

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const items = user ? navForRole(user.role) : [];

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_LS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_LS_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen flex bg-[var(--ayekta-surface)] font-sans antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:px-4 focus:py-2 focus:rounded-md focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none shadow-md"
      >
        Skip to main content
      </a>

      {sidebarCollapsed ? (
        <aside
          className="w-12 shrink-0 border-r border-gray-200 py-3 flex flex-col items-center gap-2 bg-[var(--ayekta-sidebar)]"
          aria-label="Primary navigation collapsed"
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="p-2 rounded-sm text-gray-700 hover:bg-white/70 border border-transparent hover:border-ayekta-border"
            aria-expanded={false}
            aria-controls="app-sidebar-nav"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon />
          </button>
        </aside>
      ) : (
        <aside
          id="app-sidebar-nav"
          className="w-56 shrink-0 border-r border-gray-200 p-4 flex flex-col gap-1 bg-[var(--ayekta-sidebar)]"
          aria-label="Primary navigation"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="font-semibold text-sm uppercase tracking-wide text-gray-500">Ayekta</div>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-sm text-gray-600 hover:bg-white/70 border border-transparent hover:border-ayekta-border shrink-0"
              aria-expanded={true}
              aria-controls="app-sidebar-nav"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon />
            </button>
          </div>
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/dashboard'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex-1" />
          <button
            type="button"
            className="mt-4 text-left text-sm text-red-800 hover:underline font-medium"
            onClick={async () => {
              await signOutAndResetChart();
              navigate('/login');
            }}
          >
            Sign out
          </button>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-gray-200 px-4 py-2.5 flex flex-wrap gap-2 justify-between items-center bg-[var(--ayekta-surface-elevated)]">
          <span className="text-sm font-medium text-gray-900">{user?.displayName ?? '—'}</span>
          <div className="flex flex-wrap items-center gap-3">
            <SyncStatusBadge />
            <span className="text-xs text-gray-500 tabular-nums capitalize">{user?.role}</span>
          </div>
        </header>
        <main id="main-content" className="flex-1 flex flex-col min-h-0 outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <SyncBootstrap />
    </div>
  );
}
