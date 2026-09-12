import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Briefcase, FileText, Users, DollarSign, 
  TrendingUp, LogOut, Menu, X, CreditCard, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'member'] },
  { id: 'tasks', label: 'Tasks', icon: Briefcase, roles: ['admin', 'member'] },
  { id: 'invoices', label: 'Invoices', icon: FileText, roles: ['admin', 'member'] },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, roles: ['admin'] },
  { id: 'clients', label: 'Clients', icon: Users, roles: ['admin'] },
  { id: 'team', label: 'Team', icon: Users, roles: ['admin'] },
  { id: 'earnings', label: 'My Earnings', icon: DollarSign, roles: ['member'] },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, roles: ['admin'] },
];

export default function Sidebar({ page, setPage, user, onLogout, displayCurrency, setDisplayCurrency, theme, setTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const filteredNav = NAV_ITEMS.filter(item => {
    if (isAdmin) return item.roles.includes('admin');
    return item.roles.includes('member');
  });

  const handleNavClick = (id) => {
    setPage(id);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const isDark = theme === 'dark';

  // ✅ Currency Selector - USD and PKR only
  const CurrencySelector = () => (
    <select 
      value={displayCurrency} 
      onChange={(e) => setDisplayCurrency(e.target.value)}
      className={`w-full border text-xs rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
        isDark 
          ? 'bg-ink-900 border-ink-700 text-ink-300' 
          : 'bg-gray-50 border-gray-300 text-gray-700'
      }`}
    >
      <option value="PKR">PKR (Rs)</option>
      <option value="USD">USD ($)</option>
      <option value="ORIGINAL">Original Currency</option>
    </select>
  );

  return (
    <>
      {/* MOBILE TOP HEADER */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-md border-b flex items-center justify-between px-4 z-40 ${
        isDark ? 'bg-ink-950/95 border-ink-800' : 'bg-white/95 border-gray-200'
      }`}>
        <button onClick={() => setMobileOpen(true)} className={`p-2 rounded-lg transition-colors ${
          isDark ? 'hover:bg-ink-800 text-ink-300' : 'hover:bg-gray-100 text-gray-700'
        }`}>
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">$</div>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>CashTrack</span>
        </div>

        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className={`h-9 w-9 rounded-lg bg-gradient-to-br ${user?.avatarColor || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </button>
          
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className={`absolute right-0 top-12 w-56 rounded-xl border shadow-2xl py-2 z-50 animate-scale-in origin-top-right ${
                isDark ? 'bg-ink-900 border-ink-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-3 border-b mb-1 ${isDark ? 'border-ink-700' : 'border-gray-200'}`}>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
                  <div className="text-xs text-ink-400 capitalize">{user?.role}</div>
                </div>
                <div className={`px-4 py-3 border-b mb-1 ${isDark ? 'border-ink-700' : 'border-gray-200'}`}>
                  <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-ink-300' : 'text-gray-700'}`}>Currency</div>
                  <CurrencySelector />
                </div>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-ink-700' : 'border-gray-200'}`}>
                  <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-ink-300' : 'text-gray-700'}`}>Theme</div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      isDark 
                        ? 'bg-ink-800 text-yellow-400 hover:bg-ink-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
                <button onClick={() => { onLogout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-ink-800 flex items-center gap-2 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}

      {/* MAIN SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isDark ? 'bg-ink-950 border-ink-800' : 'bg-white border-gray-200'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className={`h-16 flex items-center px-6 border-b ${isDark ? 'border-ink-800' : 'border-gray-200'}`}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">$</div>
            <span className={`ml-3 font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>CashTrack</span>
            <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden p-1 rounded hover:bg-ink-800 text-ink-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? (isDark ? 'bg-white text-ink-950 shadow-lg shadow-white/5' : 'bg-emerald-600 text-white shadow-lg')
                      : (isDark ? 'text-ink-400 hover:text-white hover:bg-ink-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive && isDark ? 'text-ink-950' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className={`p-4 border-t space-y-3 ${isDark ? 'border-ink-800' : 'border-gray-200'}`}>
            <CurrencySelector />
            
            {/* Theme Toggle in Sidebar */}
            <button 
              onClick={toggleTheme}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                isDark 
                  ? 'bg-ink-900 text-yellow-400 hover:bg-ink-800 border border-ink-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>

            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${user?.avatarColor || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold shadow-md`}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</div>
                <div className="text-xs text-ink-400 capitalize truncate">{user?.role}</div>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}