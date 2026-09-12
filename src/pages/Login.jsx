import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'dark', name: 'Dark', icon: '🌙', bg: 'bg-slate-900', text: 'text-white' },
  { id: 'light', name: 'Light', icon: '☀️', bg: 'bg-white', text: 'text-slate-900' },
  { id: 'midnight', name: 'Midnight', icon: '🌌', bg: 'bg-indigo-950', text: 'text-indigo-100' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', bg: 'bg-sky-100', text: 'text-sky-900' },
];

export default function Login({ theme, setTheme }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const isDark = theme === 'dark' || theme === 'midnight';

  // Theme-aware accent color
  const getAccentColor = () => {
    switch(theme) {
      case 'ocean': return 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/25';
      case 'midnight': return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25';
      case 'light': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25';
      default: return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Invalid credentials');
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${
      isDark ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      {/* ✅ FIXED: Smaller, softer blobs with proper opacity */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-3xl opacity-30 ${
          theme === 'dark' ? 'bg-emerald-500' :
          theme === 'midnight' ? 'bg-indigo-500' :
          theme === 'ocean' ? 'bg-sky-400' :
          'bg-emerald-400'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-3xl opacity-30 ${
          theme === 'dark' ? 'bg-violet-500' :
          theme === 'midnight' ? 'bg-purple-500' :
          theme === 'ocean' ? 'bg-cyan-400' :
          'bg-violet-400'
        }`} />
      </div>

      {/* ✅ FIXED: Theme button anchored to top-right with proper positioning */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className={`p-3 rounded-full transition-all shadow-lg ${
            isDark 
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
          title="Change Theme"
        >
          <Palette className="h-5 w-5" />
        </button>

        {/* ✅ FIXED: Popup anchored directly below button */}
        {showThemes && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowThemes(false)} />
            <div className={`absolute top-full right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-4 z-50 animate-scale-in ${
              isDark 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Choose Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setShowThemes(false); }}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === t.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : isDark 
                          ? 'border-slate-700 hover:border-slate-600' 
                          : 'border-slate-200 hover:border-slate-300'
                    } ${t.bg}`}
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <span className={`text-xs font-medium ${
                      theme === t.id 
                        ? 'text-emerald-600' 
                        : (t.id === 'dark' || t.id === 'midnight' ? 'text-white' : 'text-slate-900')
                    }`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Login Card */}
      <div className={`w-full max-w-md p-8 rounded-3xl relative z-10 animate-scale-in transition-all duration-500 ${
        isDark 
          ? 'bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/50' 
          : 'bg-white border border-slate-200 shadow-2xl shadow-slate-200/50'
      }`}>
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">$</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome to CashTrack
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
            <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                }`}
                placeholder="admin@cashtrack.com"
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500' 
                    : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 mt-2 shadow-lg ${getAccentColor()}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* ✅ FIXED: Better styled demo credentials box */}
        <div className={`mt-6 p-4 rounded-xl border text-xs ${
          isDark 
            ? 'bg-slate-800/50 border-slate-700 text-slate-400' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className={`font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Demo Credentials:</div>
          <div className="space-y-0.5">
            <div>Admin: admin@cashtrack.com / admin123</div>
            <div>Member: umer@cashtrack.com / umer123</div>
          </div>
        </div>
      </div>
    </div>
  );
}