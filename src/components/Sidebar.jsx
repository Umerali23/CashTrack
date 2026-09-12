import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Briefcase, FileText, Users, DollarSign, 
  TrendingUp, LogOut, Menu, X, Palette, Check
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'member'] },
  { id: 'tasks', label: 'Tasks', icon: Briefcase, roles: ['admin', 'member'] },
  { id: 'invoices', label: 'Invoices', icon: FileText, roles: ['admin', 'member'] },
  { id: 'transactions', label: 'Transactions', icon: DollarSign, roles: ['admin'] },
  { id: 'clients', label: 'Clients', icon: Users, roles: ['admin'] },
  { id: 'team', label: 'Team', icon: Users, roles: ['admin'] },
  { id: 'earnings', label: 'My Earnings', icon: DollarSign, roles: ['member'] },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, roles: ['admin'] },
];

const THEMES = [
  { id: 'dark', name: 'Dark', icon: '', desc: 'Deep slate with emerald accents' },
  { id: 'light', name: 'Light', icon: '☀️', desc: 'Clean white with subtle shadows' },
  { id: 'midnight', name: 'Midnight', icon: '🌌', desc: 'Rich indigo and violet tones' },
  { id: 'ocean', name: 'Ocean', icon: '', desc: 'Fresh sky blue and cyan hues' },
];

export default function Sidebar({ page, setPage, user, onLogout, theme, setTheme, displayCurrency, setDisplayCurrency }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const filteredNav = NAV_ITEMS.filter(item => isAdmin || item.roles.includes('member'));

  const CurrencySelector = () => (
    <select 
      value={displayCurrency} 
      onChange={(e) => setDisplayCurrency(e.target.value)}
      className="w-full border text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] cursor-pointer bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]"
    >
      <option value="PKR">PKR (Rs)</option>
      <option value="USD">USD ($)</option>
      <option value="ORIGINAL">Original Currency</option>
    </select>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel flex items-center justify-between px-4 z-40">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-bold text-lg text-[var(--text-primary)]">CashTrack</span>
        <button onClick={() => setThemeMenuOpen(!themeMenuOpen)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Palette className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel transform transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-[var(--border-color)]">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">$</div>
            <span className="ml-3 font-bold text-lg text-[var(--text-primary)]">CashTrack</span>
            <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/25' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border-color)] space-y-3">
            <CurrencySelector />
            
            <div className="relative">
              <button 
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-color)]"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme: {THEMES.find(t => t.id === theme)?.name}
                </span>
              </button>

              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-2 z-50 animate-scale-in">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); setThemeMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          theme === t.id 
                            ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]' 
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="text-lg">{t.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{t.name}</div>
                          <div className="text-[10px] opacity-70">{t.desc}</div>
                        </div>
                        {theme === t.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 px-2 pt-2 border-t border-[var(--border-color)]">
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${user?.avatarColor || 'from-violet-500 to-fuchsia-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name}</div>
                <div className="text-xs text-[var(--text-muted)] capitalize truncate">{user?.role}</div>
              </div>
            </div>
            
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}