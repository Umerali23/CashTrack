import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Briefcase, FileText, Users, DollarSign, 
  TrendingUp, LogOut, Menu, X, CreditCard 
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

export default function Sidebar({ page, setPage, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user?.role || 'member'));

  const handleNavClick = (id) => {
    setPage(id);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <>
      {/* ==========================================
          MOBILE TOP HEADER (Visible < 1024px)
         ========================================== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ink-950/95 backdrop-blur-md border-b border-ink-800 flex items-center justify-between px-4 z-40">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-ink-800 text-ink-300 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">$</div>
          CashTrack
        </div>

        {/* Mobile Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`h-9 w-9 rounded-lg bg-gradient-to-br ${user?.avatarColor || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-xs font-bold shadow-md`}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </button>
          
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 w-56 bg-ink-900 rounded-xl border border-ink-700 shadow-2xl py-2 z-50 animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-ink-700 mb-1">
                  <div className="text-sm font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-ink-400 capitalize">{user?.role}</div>
                </div>
                <button 
                  onClick={() => { onLogout(); setProfileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-ink-800 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==========================================
          MOBILE DRAWER OVERLAY
         ========================================== */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ==========================================
          MAIN SIDEBAR (Fixed for Desktop & Mobile Drawer)
         ========================================== */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-ink-950 border-r border-ink-800 
        transform transition-transform duration-300 ease-in-out 
        lg:translate-x-0 /* Always visible on desktop */
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} /* Slide in on mobile */
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area (Desktop) */}
          <div className="h-16 flex items-center px-6 border-b border-ink-800">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              $
            </div>
            <span className="ml-3 font-bold text-lg tracking-tight">CashTrack</span>
            <button 
              onClick={() => setMobileOpen(false)}
              className="ml-auto lg:hidden p-1 rounded hover:bg-ink-800 text-ink-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
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
                      ? 'bg-white text-ink-950 shadow-lg shadow-white/5' 
                      : 'text-ink-400 hover:text-white hover:bg-ink-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-ink-950' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop User Profile & Logout */}
          <div className="p-4 border-t border-ink-800 hidden lg:block">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${user?.avatarColor || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white font-bold shadow-md`}>
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{user?.name}</div>
                <div className="text-xs text-ink-400 capitalize truncate">{user?.role}</div>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}