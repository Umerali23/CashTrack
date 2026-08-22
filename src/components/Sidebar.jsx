import { LayoutDashboard, Receipt, Users, BarChart3, DollarSign, Sun, Moon } from 'lucide-react';
const NAV = [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'transactions', label: 'Transactions', icon: Receipt }, { id: 'clients', label: 'Clients', icon: Users }, { id: 'analytics', label: 'Analytics', icon: BarChart3 }];
const CURRENCIES = [{ id: 'PKR', label: 'PKR' }, { id: 'USD', label: 'USD' }, { id: 'ORIGINAL', label: 'Original' }];

export default function Sidebar({ page, setPage, displayCurrency, setDisplayCurrency, theme, setTheme }) {
  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col glass border-r border-ink-600/60 z-30">
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-ink-600/50">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><DollarSign className="h-5 w-5 text-white" strokeWidth={2.5} /></div>
          <div><div className="font-bold text-[15px] tracking-tight">CashTrack</div><div className="text-[11px] text-ink-400 -mt-0.5">Freelance Finance</div></div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon; const active = page === item.id;
            return <button key={item.id} onClick={() => setPage(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/40'}`}><Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.3 : 2} />{item.label}</button>;
          })}
        </nav>
        <div className="px-4 pb-3">
          <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-2 px-1">Display Currency</div>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-ink-900/60 border border-ink-600/60">
            {CURRENCIES.map((c) => (<button key={c.id} onClick={() => setDisplayCurrency(c.id)} className={`text-xs font-semibold py-1.5 rounded-lg transition-all ${displayCurrency === c.id ? 'bg-ink-700 text-white shadow-sm' : 'text-ink-400 hover:text-ink-200'}`}>{c.label}</button>))}
          </div>
        </div>
        <div className="px-4 pb-5">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-ink-300 hover:text-ink-100 hover:bg-ink-700/40 transition-all">
            <span className="flex items-center gap-3">{theme === 'dark' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            <div className={`h-5 w-9 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-ink-500'}`}><div className={`h-4 w-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} /></div>
          </button>
        </div>
      </aside>
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 glass border-b border-ink-600/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center"><DollarSign className="h-4 w-4 text-white" strokeWidth={2.5} /></div><div className="font-bold text-sm">CashTrack</div></div>
          <div className="flex items-center gap-1">
            <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value)} className="text-xs font-semibold bg-ink-800 border border-ink-600 rounded-lg px-2 py-1.5 outline-none">{CURRENCIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-ink-700/50">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          </div>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-ink-600/60">
        <div className="grid grid-cols-4">
          {NAV.map((item) => { const Icon = item.icon; const active = page === item.id; return <button key={item.id} onClick={() => setPage(item.id)} className={`flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${active ? 'text-emerald-400' : 'text-ink-400'}`}><Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />{item.label}</button>; })}
        </div>
      </nav>
    </>
  );
}