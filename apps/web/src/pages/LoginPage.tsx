import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import StaticDemoBanner from '../components/layout/StaticDemoBanner';
import { isStaticDemoBuild } from '../utils/deploymentMode';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await login(username.trim(), password);
    if (!ok) {
      setError('Invalid username or password.');
      return;
    }
    navigate(from, { replace: true });
  };

  const staticDemo = isStaticDemoBuild();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--ayekta-surface)] font-sans antialiased">
      <StaticDemoBanner />
      <div className="flex flex-1 flex-col items-center justify-center p-6">
      <img
        src={`${import.meta.env.BASE_URL}logo-512.png`}
        alt=""
        className="w-24 h-24 mb-5 opacity-90"
      />
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Ayekta EMR</h1>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md leading-relaxed">
        {staticDemo ? (
          <>
            This site is a <strong>static preview</strong> of the app shell and chart UI. Data stays in your
            browser only. Sign in with demo accounts: <strong>surgeon</strong>, <strong>nurse</strong>, or{' '}
            <strong>admin</strong> — use the same word as the password (e.g. <code className="text-xs bg-gray-100 px-1 rounded">surgeon</code> /{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">surgeon</code>).
          </>
        ) : (
          <>
            Sign in to continue. This build uses your configured API for{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">POST /auth/login</code> (tenant slug from{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">VITE_SYNC_TENANT_SLUG</code> when set). If the API
            is unavailable, demo accounts may still work when the server allows it.
          </>
        )}
      </p>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 bg-[var(--ayekta-surface-elevated)] p-6 rounded-xl border border-gray-200 shadow-sm"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Sign in
        </button>
      </form>
      </div>
    </div>
  );
}
