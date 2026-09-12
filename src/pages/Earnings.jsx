import { useMemo } from 'react';
import { DollarSign, Briefcase, CheckCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function Earnings({ ctx, user }) {
  const { memberEarnings, displayCurrency } = ctx;
  const { total, completedTasks, pendingTasks, taskBreakdown, payouts } = memberEarnings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">My Earnings</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Track your completed work and payouts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">{formatCurrency(total, 'USD', displayCurrency, true)}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total Earnings</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{completedTasks}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Completed Tasks</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{pendingTasks}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Pending Tasks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[var(--accent-color)]" /> Completed Tasks
          </h3>
          {taskBreakdown.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No completed tasks yet</div>
          ) : (
            <div className="space-y-3">
              {taskBreakdown.map((task) => (
                <div key={task.id} className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{task.title}</div>
                    <div className="text-sm font-bold text-emerald-500">{formatCurrency(task.earnings, task.currency || 'USD', displayCurrency, true)}</div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{task.client?.name || 'Unknown Client'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--accent-color)]" /> Payout History
          </h3>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No payouts yet</div>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div key={payout.id} className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{payout.taskTitle || 'Task'}</div>
                    <div className="text-sm font-bold text-emerald-500">{formatCurrency(payout.amount, payout.currency || 'USD', displayCurrency, true)}</div>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Invoice: {payout.invoiceNumber || 'N/A'}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{payout.date ? new Date(payout.date).toLocaleDateString() : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}