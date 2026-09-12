import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { useCashTrack } from './hooks/useCashTrack';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Clients from './pages/Clients';
import Team from './pages/Team';
import Invoices from './pages/Invoices';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Earnings from './pages/Earnings';

function AppContent() {
  const { user, logout } = useAuth();
  const ctx = useCashTrack();
  const [page, setPage] = useState('dashboard');

  if (ctx.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--accent-color)]/20" />
          <div className="text-sm font-medium">Loading CashTrack...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Login theme={ctx.theme} setTheme={ctx.setTheme} />;

  const getGradientColors = () => {
    switch(ctx.theme) {
      case 'light': return 'bg-emerald-500/10 bg-violet-500/10';
      case 'midnight': return 'bg-indigo-500/15 bg-purple-500/15';
      case 'ocean': return 'bg-sky-500/15 bg-cyan-500/15';
      default: return 'bg-emerald-500/10 bg-violet-500/10';
    }
  };

  const [grad1, grad2] = getGradientColors().split(' ');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 opacity-60 ${grad1}`} />
        <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-60 ${grad2}`} />
      </div>

      <Sidebar 
        page={page} setPage={setPage} user={user} onLogout={logout}
        theme={ctx.theme} setTheme={ctx.setTheme}
        displayCurrency={ctx.displayCurrency} setDisplayCurrency={ctx.setDisplayCurrency}
      />

      <main className="lg:pl-64 min-h-screen relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          {page === 'dashboard' && <Dashboard ctx={ctx} user={user} />}
          {page === 'tasks' && <Tasks ctx={ctx} user={user} />}
          {page === 'clients' && <Clients ctx={ctx} user={user} />}
          {page === 'team' && <Team ctx={ctx} user={user} />}
          {page === 'invoices' && <Invoices ctx={ctx} user={user} />}
          {page === 'transactions' && <Transactions ctx={ctx} user={user} />}
          {page === 'analytics' && <Analytics ctx={ctx} user={user} />}
          {page === 'earnings' && <Earnings ctx={ctx} user={user} />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}