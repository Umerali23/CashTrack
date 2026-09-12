import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Briefcase, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function Dashboard({ ctx, user }) {
  const { data, aggregates } = ctx;
  const tasks = data?.tasks || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];
  const invoices = data?.invoices || [];

  const stats = useMemo(() => {
    const totalRevenue = aggregates?.income || 0;
    const totalExpenses = aggregates?.expense || 0;
    const netProfit = aggregates?.net || 0;
    const activeTasks = tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalClients = clients.length;
    const totalMembers = profiles.filter(p => p.role !== 'admin').length;
    const pendingInvoices = invoices.filter(i => i.status === 'draft' || i.status === 'sent').length;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      activeTasks,
      completedTasks,
      totalClients,
      totalMembers,
      pendingInvoices
    };
  }, [aggregates, tasks, clients, profiles, invoices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Here's what's happening with your dashboard today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {formatCurrency(stats.totalRevenue, 'USD', true)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Total Revenue</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.activeTasks}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Active Tasks</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.totalMembers}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Team Members</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {stats.completedTasks}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Completed Tasks</div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4">Recent Tasks</h3>
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{task.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {clients.find(c => c.id === task.clientId)?.name || 'Unknown Client'}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.status === 'completed' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)]">No tasks yet</div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
              <span className="text-sm text-[var(--text-secondary)]">Total Clients</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
              <span className="text-sm text-[var(--text-secondary)]">Pending Invoices</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{stats.pendingInvoices}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
              <span className="text-sm text-[var(--text-secondary)]">Net Profit</span>
              <span className="text-lg font-bold text-emerald-500">{formatCurrency(stats.netProfit, 'USD', true)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}