import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthShell from '@/components/AuthShell';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { SEED_CANDIDATE } from '@/data/seed';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [email, setEmail] = useState(SEED_CANDIDATE.user.email);
  const [password, setPassword] = useState(SEED_CANDIDATE.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Candidate Portal — Log in to apply">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@example.com" required />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" required />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Log in'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          New here?{' '}
          <Link to="/signup" state={{ from }} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Create an account</Link>
        </p>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">Demo mode — the seeded candidate account is pre-filled.</p>
      </div>
    </AuthShell>
  );
}
