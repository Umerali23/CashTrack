import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Sun, Moon, Palette } from 'lucide-react';

export default function Login({ theme, setTheme }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  const isDark = theme === 'dark' || theme === 'midnight';

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

  const themes = [
    { id: 'dark', name: 'Dark', icon: '🌙', bg: 'bg-[#0a0a0f]' },
    { id: 'light', name: 'Light', icon: '☀️', bg: 'bg-[#f8fafc]' },
    { id: 'midnight', name: 'Midnight', icon: '', bg: 'bg-[#0f0f1a]' },
    { id: 'ocean', name: 'Ocean', icon: '', bg: 'bg-[#f0f9ff]' },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#0a0a0f]' : 'bg-[#f8fafc]'
    }`}>
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`blob ${
          theme === 'dark' ? 'bg-emerald-500/20' :
          theme === 'midnight' ? 'bg-indigo-500/20' :
          theme === 'ocean' ? 'bg-sky-500/20' :
          'bg-emerald-500/10'
        } top-[-10%] left-[-10%] h-[500px] w-[500px]`} />
        <div className={`blob ${
          theme === 'dark' ? 'bg-violet-500/15' :
          theme === 'midnight' ? 'bg-purple-500/15' :
          theme === 'ocean' ? 'bg-cyan-500/15' :
          'bg-violet-500/10'
        } bottom-[-10%] right-[-10%] h-[600px] w-[600px]`} />
      </div>

      {/* Theme Selector Button */}
      <button
        onClick={() => setShowThemes(!showThemes)}
        className={`fixed top-6 right-6 p-3 rounded-full transition-all z-50 ${
          isDark 
            ? 'bg-[#12121a] text-[#f1f5f9] hover:bg-[#1a1a2e] border border-[#94a3b8]/20' 
            : 'bg-white text-[#0f172a] hover:bg-gray-50 shadow-lg border border-gray-200'
        }`}
        title="Change Theme"
      >
        <Palette className="h-5 w-5" />
      </button>

      {/* Theme Selector Dropdown */}
      {showThemes && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowThemes(false)} />
          <div className={`fixed top-20 right-6 w-64 rounded-2xl border shadow-2xl p-4 z-50 animate-scale-in ${
            isDark 
              ? 'bg-[#12121a] border-[#94a3b8]/20' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-[#f1f5f9]' : 'text-[#0f172a]'}`}>
              Choose Theme
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setShowThemes(false);
                  }}
                  className={`p-3 rounded-xl border transition-all ${
                    theme === t.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : isDark 
                        ? 'border-[#94a3b8]/20 hover:border-[#94a3b8]/40' 
                        : 'border-gray-200 hover:border-gray-300'
                  } ${t.bg}`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <div className={`text-xs font-medium ${
                    isDark ? 'text-[#f1f5f9]' : 'text-[#0f172a]'
                  }`}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Login Card */}
      <div className={`w-full max-w-md p-8 rounded-3xl relative z-10 animate-scale-in transition-all ${
        isDark 
          ? 'bg-[#12121a]/70 backdrop-blur-xl border border-[#94a3b8]/10 shadow-2xl' 
          : 'bg-white border border-gray-200 shadow-2xl'
      }`}>
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">$</span>
          </div>
          <h1 className={`text-2xl font-bold tracking-tight ${
            isDark ? 'text-[#f1f5f9]' : 'text-[#0f172a]'
          }`}>
            Welcome to CashTrack
          </h1>
          <p className={`text-sm mt-1 ${
            isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
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
              isDark ? 'text-[#cbd5e1]' : 'text-[#475569]'
            }`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
              }`} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-white text-[#0f172a] border-[#94a3b8]/20 placeholder-[#94a3b8]' 
                    : 'bg-[#f1f5f9] text-[#0f172a] border-gray-200 placeholder-[#64748b]'
                }`}
                placeholder="admin@cashtrack.com"
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1.5 block ${
              isDark ? 'text-[#cbd5e1]' : 'text-[#475569]'
            }`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-[#94a3b8]' : 'text-[#64748b]'
              }`} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
                  isDark 
                    ? 'bg-white text-[#0f172a] border-[#94a3b8]/20 placeholder-[#94a3b8]' 
                    : 'bg-[#f1f5f9] text-[#0f172a] border-gray-200 placeholder-[#64748b]'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 mt-2 ${
              isDark 
                ? 'bg-white text-[#0f172a] hover:bg-gray-100' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={`mt-6 p-4 rounded-xl border text-xs ${
          isDark 
            ? 'bg-[#0a0a0f]/50 border-[#94a3b8]/10 text-[#94a3b8]' 
            : 'bg-gray-50 border-gray-200 text-[#64748b]'
        }`}>
          <div className={`font-semibold mb-1 ${isDark ? 'text-[#cbd5e1]' : 'text-[#475569]'}`}>Demo Credentials:</div>
          <div>Admin: admin@cashtrack.com / admin123</div>
          <div>Member: umer@cashtrack.com / umer123</div>
        </div>
      </div>
    </div>
  );
}