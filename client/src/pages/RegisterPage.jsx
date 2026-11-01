import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <ErrorMessage message={error} />
      <input className="input" name="name" placeholder="Name" required value={form.name} onChange={handleChange} />
      <input className="input" name="email" type="email" placeholder="Email" required value={form.email} onChange={handleChange} />
      <input
        className="input"
        name="password"
        type="password"
        placeholder="Password (min 6 characters)"
        minLength={6}
        required
        value={form.password}
        onChange={handleChange}
      />
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? 'Creating account...' : 'Sign up'}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="text-indigo-600">Log in</Link>
      </p>
    </form>
  );
}
