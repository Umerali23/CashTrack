import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-ink-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob bg-emerald-500/20 top-[-10%] left-[-10%] h-[500px] w-[500px]" />
        <div className="blob bg-violet-500/15 bottom-[-10%] right-[-10%] h-[600px] w-[600px]" />
      </div>

      <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">$</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to CashTrack</h1>
          <p className="text-ink-400 text-sm mt-1">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-ink-950 border border-ink-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-ink-400 transition-all" placeholder="admin@cashtrack.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-ink-950 border border-ink-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-ink-400 transition-all" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-white text-ink-950 font-bold hover:bg-ink-100 transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}