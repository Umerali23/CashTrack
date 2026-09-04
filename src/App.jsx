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
  const ctx = useCashTrack(user);
  
  const [page, setPage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [newTxTrigger, setNewTxTrigger] = useState(0);

  const toast = useCallback((message, type = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((t) => [...t, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const handleNewTransaction = () => {
    setPage('transactions');
    setNewTxTrigger((n) => n + 1);
  };
  
  const handleSelectClient = (id) => {
    setSelectedClientId(id);
    setPage('clients');
  };

  if (authLoading || ctx.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="text-ink-400 text-xl">Loading CashTrack...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`min-h-screen ${ctx.theme === 'dark' ? 'dark bg-ink-950 text-ink-100' : 'light bg-zinc-50 text-zinc-900'} relative`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob bg-emerald-500/20 top-[-10%] left-[-10%] h-[500px] w-[500px]" />
        <div className="blob bg-violet-500/15 bottom-[-10%] right-[-10%] h-[600px] w-[600px]" />
      </div>
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-60" />
      
      <Sidebar 
        page={page} 
        setPage={setPage} 
        displayCurrency={ctx.displayCurrency} 
        setDisplayCurrency={ctx.setDisplayCurrency} 
        theme={ctx.theme} 
        setTheme={ctx.setTheme}
        user={user}
        onLogout={logout}
      />
      
      <main className="lg:pl-64 pt-16 lg:pt-0 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-10 relative">
        <div className="max-w-7xl mx-auto">
          {page === 'dashboard' && <Dashboard ctx={ctx} onSelectClient={handleSelectClient} user={user} />}
          {page === 'transactions' && <Transactions ctx={ctx} toast={toast} newTxTrigger={newTxTrigger} user={user} />}
          {page === 'clients' && <Clients ctx={ctx} toast={toast} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} onClearSelection={() => setSelectedClientId(null)} user={user} />}
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