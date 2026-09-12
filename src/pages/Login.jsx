import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Sun, Moon } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Theme state - check localStorage for saved preference
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cashtrack_theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('cashtrack_theme', newTheme);
    document.documentElement.className = newTheme;
  };

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

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      isDark ? 'bg-ink-950' : 'bg-gray-100'
    }`}>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`blob ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} top-[-10%] left-[-10%] h-[500px] w-[500px]`} />
        <div className={`blob ${isDark ? 'bg-violet-500/15' : 'bg-violet-500/10'} bottom-[-10%] right-[-10%] h-[600px] w-[600px]`} />
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all z-50 ${
          isDark 
            ? 'bg-ink-800 text-yellow-400 hover:bg-ink-700' 
            : 'bg-white text-gray-700 hover:bg-gray-200 shadow-lg'
        }`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className={`w-full max-w-md p-8 rounded-3xl relative z-10 animate-scale-in ${
        isDark 
          ? 'glass bg-ink-900/60 border border-ink-700/50' 
          : 'bg-white border border-gray-200 shadow-2xl'
      }`}>
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">$</span>
          </div>
          {/* ✅ White text in dark mode, dark text in light mode */}
          <h1 className={`text-2xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome to CashTrack
          </h1>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-ink-400' : 'text-gray-500'
          }`}>
            Sign in to your dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-sm text-rose-400">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${
              isDark ? 'text-ink-300' : 'text-gray-700'
            }`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-ink-400' : 'text-gray-400'
              }`} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-white text-ink-950 border-ink-200 placeholder-ink-400' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'
                }`}
                placeholder="admin@cashtrack.com"
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${
              isDark ? 'text-ink-300' : 'text-gray-700'
            }`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-ink-400' : 'text-gray-400'
              }`} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-white text-ink-950 border-ink-200 placeholder-ink-400' 
                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50 mt-2 ${
              isDark 
                ? 'bg-white text-ink-950 hover:bg-ink-100' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 p-4 rounded-xl border text-xs ${
          isDark 
            ? 'bg-ink-900/50 border-ink-700/50 text-ink-400' 
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          <div className={`font-semibold mb-1 ${isDark ? 'text-ink-300' : 'text-gray-700'}`}>Demo Credentials:</div>
          <div>Admin: admin@cashtrack.com / admin123</div>
          <div>Member: umer@cashtrack.com / umer123</div>
        </div>
      </div>
    </div>
  );
}