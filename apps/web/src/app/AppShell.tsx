import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { navForRole } from '@ayekta/shared-types';
import { useAuthStore } from '../store/authStore';
import { signOutAndResetChart } from '../services/session';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-ayekta-orange text-white' : 'text-gray-700 hover:bg-gray-200'
  }`;

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const items = user ? navForRole(user.role) : [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside
        className="w-56 shrink-0 border-r border-ayekta-border p-4 flex flex-col gap-1"
        style={{ backgroundColor: '#FAF7F0' }}
      >
        <div className="font-bold text-lg mb-4 tracking-tight">Ayekta</div>
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
          className="mt-4 text-left text-sm text-red-700 hover:underline"
          onClick={async () => {
            await signOutAndResetChart();
            navigate('/login');
          }}
        >
          Sign out
        </button>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-ayekta-border px-4 py-2 flex justify-between items-center bg-white">
          <span className="font-medium">{user?.displayName ?? '—'}</span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">{user?.role}</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
