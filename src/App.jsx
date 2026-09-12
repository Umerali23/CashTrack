import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Clients from './pages/Clients';
import Team from './pages/Team';
import Tasks from './pages/Tasks';
import Invoices from './pages/Invoices';
import Analytics from './pages/Analytics';
import Earnings from './pages/Earnings';
import { useCashTrack } from './hooks/useCashTrack';

function AppContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const ctx = useCashTrack();
  
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  if (authLoading || ctx.loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        ctx.theme === 'dark' ? 'bg-ink-950 text-ink-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="text-ink-400 text-xl">Loading CashTrack...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`min-h-screen ${
      ctx.theme === 'dark' ? 'bg-ink-950 text-ink-100' : 'bg-gray-50 text-gray-900'
    } relative`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`blob ${ctx.theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} top-[-10%] left-[-10%] h-[500px] w-[500px]`} />
        <div className={`blob ${ctx.theme === 'dark' ? 'bg-violet-500/15' : 'bg-violet-500/10'} bottom-[-10%] right-[-10%] h-[600px] w-[600px]`} />
      </div>
      
      <Sidebar 
        page={page} 
        setPage={setPage} 
        user={user}
        onLogout={logout}
        displayCurrency={ctx.displayCurrency}
        setDisplayCurrency={ctx.setDisplayCurrency}
        theme={ctx.theme}
        setTheme={ctx.setTheme}
      />
      
      <main className="w-full pt-20 lg:pt-8 px-4 sm:px-6 lg:px-10 pb-24 lg:pb-8 lg:pl-72 transition-all duration-300">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {page === 'dashboard' && <Dashboard ctx={ctx} user={user} />}
          {page === 'transactions' && <Transactions ctx={ctx} toast={toast} user={user} />}
          {page === 'clients' && <Clients ctx={ctx} toast={toast} user={user} />}
          {page === 'team' && <Team ctx={ctx} toast={toast} user={user} />}
          {page === 'tasks' && <Tasks ctx={ctx} toast={toast} user={user} />}
          {page === 'invoices' && <Invoices ctx={ctx} toast={toast} user={user} />}
          {page === 'analytics' && <Analytics ctx={ctx} user={user} />}
          {page === 'earnings' && <Earnings ctx={ctx} user={user} />}
        </div>
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
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