import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { navForRole } from '@ayekta/shared-types';
import { useAuthStore } from '../store/authStore';
import { signOutAndResetChart } from '../services/session';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-sm px-3 py-2 text-sm font-medium border-l-2 transition-colors ${
    isActive
      ? 'border-ayekta-orange bg-white text-gray-900'
      : 'border-transparent text-gray-600 hover:bg-white/60 hover:text-gray-900'
  }`;

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const items = user ? navForRole(user.role) : [];

  return (
    <div className="min-h-screen flex bg-[var(--ayekta-surface)] font-clinical">
      <aside className="w-56 shrink-0 border-r border-ayekta-border p-4 flex flex-col gap-1 bg-[var(--ayekta-sidebar)]">
        <div className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-4">Ayekta</div>
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
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-ayekta-border px-4 py-2.5 flex justify-between items-center bg-[var(--ayekta-surface-elevated)]">
          <span className="text-sm font-medium text-gray-900">{user?.displayName ?? '—'}</span>
          <span className="text-xs text-gray-500 tabular-nums">{user?.role}</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
