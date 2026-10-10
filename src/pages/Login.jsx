import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User as UserIcon } from 'lucide-react';
import { authService } from '../services';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };
      const data = await authService[mode === 'login' ? 'login' : 'register'](payload);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
            <Activity className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">CivicPulse</h1>
            <p className="text-xs text-slate-500">City Issue Reporting Dashboard</p>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm border border-slate-200">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium ${mode === 'login' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium ${mode === 'register' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    placeholder="Jane Citizen"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {loading && <Spinner size={16} className="text-white" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Citizens can register. Staff/admin accounts are created by administrators.
        </p>
      </div>
    </div>
  );
}
