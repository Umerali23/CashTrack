import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.success) setError(result.error);
    // If successful, context updates and App.jsx automatically renders the dashboard!
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative w-full max-w-md p-8 glass rounded-3xl border border-ink-600/50 shadow-2xl animate-scale-in">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <DollarSign className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome to CashTrack</h1>
          <p className="text-ink-400 text-sm mt-1">Sign in to manage your team and projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="admin@cashtrack.com" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-ink-600/50">
          <p className="text-[11px] text-center text-ink-400 uppercase tracking-wider mb-3">Demo Credentials</p>
          <div className="space-y-2 text-xs text-ink-300">
            <div className="flex justify-between p-2 rounded-lg bg-ink-800/50"><span>Admin:</span><span className="font-mono text-emerald-400">admin@cashtrack.com / admin123</span></div>
            <div className="flex justify-between p-2 rounded-lg bg-ink-800/50"><span>Umer:</span><span className="font-mono text-blue-400">umer@cashtrack.com / umer123</span></div>
            <div className="flex justify-between p-2 rounded-lg bg-ink-800/50"><span>Laiba:</span><span className="font-mono text-pink-400">laiba@cashtrack.com / laiba123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}