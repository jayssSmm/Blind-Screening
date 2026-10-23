import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthShell from '@/components/AuthShell';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Candidate Portal — Create your account">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={name} onChange={(e) => setName(e.target.value)} className="input pl-10" placeholder="Your name" required />
          </div>
        </div>
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="At least 6 characters" required />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign up'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <p className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" state={{ from }} className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
