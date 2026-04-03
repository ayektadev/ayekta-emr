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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--ayekta-surface)] font-clinical">
      <img
        src={`${import.meta.env.BASE_URL}logo-512.png`}
        alt=""
        className="w-24 h-24 mb-5 opacity-90"
      />
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Ayekta EMR</h1>
      <p className="text-sm text-ayekta-muted mb-6 text-center max-w-md leading-relaxed">
        Sign in to continue. Demo accounts: surgeon, nurse, or admin — password matches username.
      </p>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 bg-[var(--ayekta-surface-elevated)] p-6 rounded-md border border-ayekta-border shadow-sm"
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
            className="w-full border border-gray-300 rounded-md p-2"
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
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full py-2.5 bg-ayekta-orange text-white text-sm font-medium rounded-md border border-gray-800 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--ayekta-focus-ring)]"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
