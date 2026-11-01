import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold">Log in</h1>
      <ErrorMessage message={error} />
      <input
        className="input"
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        required
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? 'Logging in...' : 'Log in'}
      </button>
      <p className="text-center text-sm text-slate-500">
        New here? <Link to="/register" className="text-indigo-600">Create an account</Link>
      </p>
      <p className="text-center text-xs text-slate-400">Demo: user@shoplite.dev / user123</p>
    </form>
  );
}
