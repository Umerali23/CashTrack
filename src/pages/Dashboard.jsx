import { TrendingUp, TrendingDown, Wallet, Clock, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import AreaChart from '../components/charts/AreaChart';
import { formatCurrency } from '../lib/currency';

export default function Dashboard({ ctx, onSelectClient, user }) {
  const { aggregates, monthlySeries, topClients, data, displayCurrency, toDisplay, tasks } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;
  
  const recentTx = [...data.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const activeTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ✅ Cleaned up header without the New Transaction button */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-emerald-400 mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {user?.role === 'admin' ? 'Good to see you ' : `Welcome back, ${user?.name || 'User'} 👋`}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {user?.role === 'admin' 
              ? "Here's what your freelance business looks like this month." 
              : "Here is your personal performance overview for this month."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={formatCurrency(aggregates.income, currency)} icon={TrendingUp} change={aggregates.incomeChange} accent="emerald" sub="This month" />
        <StatCard label="Total Expenses" value={formatCurrency(aggregates.expense, currency)} icon={TrendingDown} change={aggregates.expenseChange} accent="rose" sub="This month" />
        <StatCard label="Net Profit" value={formatCurrency(aggregates.net, currency)} icon={Wallet} accent="violet" sub={aggregates.net >= 0 ? 'You\'re in the green' : 'Watch your spend'} />
        <StatCard label="Pending" value={formatCurrency(aggregates.pending, currency)} icon={Clock} accent="amber" sub="Awaiting payment" />
      </div>

      {/* Active Tasks Widget */}
      {activeTasks.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg tracking-tight">Active Tasks</h2>
            <span className="text-xs text-ink-400">{tasks.filter(t => t.status !== 'completed').length} total active</span>
          </div>
          <div className="space-y-2">
            {activeTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/40 border border-ink-600/40">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {t.status === 'in-progress' ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-ink-400">Due: {new Date(t.dueDate).toLocaleDateString()}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${t.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>{t.status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg tracking-tight">Monthly Performance</h2>
            <p className="text-ink-400 text-xs mt-0.5">Income vs Expense — last 6 months</p>
          </div>
        </div>
        <AreaChart data={monthlySeries} currency={currency} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg tracking-tight">Recent Transactions</h2>
            <span className="text-xs text-ink-400">Last 5</span>
          </div>
          {recentTx.length === 0 ? (
            <div className="text-sm text-ink-400 py-8 text-center">No transactions yet.</div>
          ) : (
            <div className="space-y-1">
              {recentTx.map((t) => { 
                const client = data.clients.find((c) => c.id === t.clientId); 
                const isIncome = t.type === 'income'; 
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-700/30 transition-colors group">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isIncome ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.description}</div>
                      <div className="text-xs text-ink-400 truncate">
                        {client?.name || 'Uncategorized'} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(toDisplay(t.amount, t.currency), currency)}
                      </div>
                      <div className="text-[10px] text-ink-400 uppercase tracking-wider">{t.status}</div>
                    </div>
                  </div>
                ); 
              })}
            </div>
          )}
        </div>
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg tracking-tight">Top Clients</h2>
            <span className="text-xs text-ink-400">By income</span>
          </div>
          {topClients.length === 0 ? (
            <div className="text-sm text-ink-400 py-8 text-center">No client income yet.</div>
          ) : (
            <div className="space-y-1">
              {topClients.map(({ client, total }) => (
                <button key={client.id} onClick={() => onSelectClient(client.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-700/30 transition-colors text-left cursor-pointer">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${client.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{client.name}</div>
                    <div className="text-xs text-ink-400 truncate">{client.company}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{formatCurrency(total, currency, true)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}