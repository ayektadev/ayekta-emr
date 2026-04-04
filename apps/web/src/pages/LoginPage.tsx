import { useState, FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--ayekta-surface)] font-sans antialiased">
      <img
        src={`${import.meta.env.BASE_URL}logo-512.png`}
        alt=""
        className="w-24 h-24 mb-5 opacity-90"
      />
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Ayekta EMR</h1>
      <p className="text-sm text-gray-600 mb-6 text-center max-w-md leading-relaxed">
        Sign in to continue. If <code className="text-xs bg-gray-100 px-1">VITE_SYNC_API_BASE</code> points at
        the API with <code className="text-xs bg-gray-100 px-1">JWT_SECRET</code> set, this form calls{' '}
        <code className="text-xs bg-gray-100 px-1">POST /auth/login</code> (tenant slug{' '}
        <code className="text-xs bg-gray-100 px-1">default</code> unless{' '}
        <code className="text-xs bg-gray-100 px-1">VITE_SYNC_TENANT_SLUG</code> is set). Otherwise use offline
        demo accounts: <strong>surgeon</strong>, <strong>nurse</strong>, or <strong>admin</strong> with the same
        password.
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
  );
}
