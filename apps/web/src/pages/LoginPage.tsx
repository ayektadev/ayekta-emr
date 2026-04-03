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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: '#F4F1E8' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-512.png`}
        alt="Ayekta"
        className="w-48 h-48 mb-6"
      />
      <h1 className="text-2xl font-bold mb-1">Ayekta</h1>
      <p className="text-ayekta-muted mb-6 text-center max-w-md">
        Offline-first EMR — mock sign-in (Dexie-cached session). Use{' '}
        <code className="text-sm bg-white/60 px-1 rounded">surgeon / surgeon</code>,{' '}
        <code className="text-sm bg-white/60 px-1 rounded">nurse / nurse</code>, or{' '}
        <code className="text-sm bg-white/60 px-1 rounded">admin / admin</code>.
      </p>

      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white/80 p-6 rounded-lg border border-ayekta-border shadow-sm">
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
          className="w-full py-2 bg-ayekta-orange text-white font-semibold rounded-md border-2 border-black hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
