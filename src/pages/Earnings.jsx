import { useMemo } from 'react';
import { Wallet, TrendingUp, Clock, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function Earnings({ ctx, user }) {
  const { transactions, tasks, displayCurrency, toDisplay } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;

  const stats = useMemo(() => {
    const paid = transactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + toDisplay(t.amount, t.currency), 0);
      
    const pending = transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + toDisplay(t.amount, t.currency), 0);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return { paid, pending, total: paid + pending, completedTasks };
  }, [transactions, tasks, toDisplay]);

  const recentEarnings = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">My Earnings</h1>
        <p className="text-ink-400 text-sm mt-1">Track your revenue and completed work.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <Wallet className="h-3.5 w-3.5" /> Total Paid
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.paid, currency)}</div>
          <div className="text-xs text-ink-400 mt-1">Received earnings</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <Clock className="h-3.5 w-3.5" /> Pending
          </div>
          <div className="text-2xl font-bold text-amber-400">{formatCurrency(stats.pending, currency)}</div>
          <div className="text-xs text-ink-400 mt-1">Awaiting payment</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Tasks Completed
          </div>
          <div className="text-2xl font-bold text-violet-400">{stats.completedTasks}</div>
          <div className="text-xs text-ink-400 mt-1">Total billable tasks</div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-bold text-lg tracking-tight mb-4">Recent Earnings</h2>
        {recentEarnings.length === 0 ? (
          <div className="text-sm text-ink-400 text-center py-8">No earnings recorded yet. Complete tasks to generate revenue!</div>
        ) : (
          <div className="space-y-2">
            {recentEarnings.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/40 border border-ink-600/40">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.description}</div>
                  <div className="text-xs text-ink-400">{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 tabular-nums">+{formatCurrency(toDisplay(t.amount, t.currency), currency)}</div>
                  <div className={`text-[10px] uppercase tracking-wider font-semibold ${t.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}