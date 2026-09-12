import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Briefcase, CheckCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/currency';

export default function Dashboard({ ctx, user }) {
  const { data, aggregates, memberEarnings, displayCurrency } = ctx;
  const tasks = data?.tasks || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];
  const invoices = data?.invoices || [];
  const transactions = data?.transactions || [];

  const stats = useMemo(() => {
    const totalRevenue = aggregates?.income || 0;
    const totalExpenses = aggregates?.expense || 0;
    const netProfit = aggregates?.net || 0;
    const activeTasks = tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalClients = clients.length;
    const totalMembers = profiles.filter(p => p.role !== 'admin').length;
    const pendingInvoices = invoices.filter(i => i.status === 'draft' || i.status === 'sent').length;
    return { totalRevenue, totalExpenses, netProfit, activeTasks, completedTasks, totalClients, totalMembers, pendingInvoices };
  }, [aggregates, tasks, clients, profiles, invoices]);

  const teamStats = useMemo(() => {
    return profiles
      .filter(p => p.role !== 'admin')
      .map(member => {
        const memberTasks = tasks.filter(t => t.assigneeId === member.id);
        const completed = memberTasks.filter(t => t.status === 'completed').length;
        const pending = memberTasks.filter(t => t.status !== 'completed').length;
        const earnings = memberTasks.filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (parseFloat(t.compensation) || 0), 0);
        return { ...member, completed, pending, earnings };
      });
  }, [profiles, tasks]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5);
  }, [transactions]);

  const upcomingTasks = useMemo(() => {
    const tasksToFilter = user?.role === 'member' ? tasks.filter(t => t.assigneeId === user.id) : tasks;
    return [...tasksToFilter]
      .filter(t => t.status !== 'completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks, user]);

  const myStats = useMemo(() => {
    if (user?.role !== 'member') return null;
    const myTasks = tasks.filter(t => t.assigneeId === user.id);
    return {
      myCompleted: myTasks.filter(t => t.status === 'completed').length,
      myPending: myTasks.filter(t => t.status !== 'completed').length,
      myTotal: myTasks.length,
      myEarnings: memberEarnings?.total || 0
    };
  }, [tasks, memberEarnings, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {user?.role === 'admin' ? "Here's what's happening with your business today." : "Here's your personal performance overview."}
        </p>
      </div>

      {/* Stats Grid */}
      {user?.role === 'admin' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            {/* ✅ FIXED: Uses displayCurrency */}
            <div className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.totalRevenue, 'USD', displayCurrency, true)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Total Revenue</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.totalExpenses, 'USD', displayCurrency, true)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Total Expenses</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.netProfit, 'USD', displayCurrency, true)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Net Profit</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeTasks}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Active Tasks</div>
          </div>
        </div>
      ) : myStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-500">{formatCurrency(myStats.myEarnings, 'USD', displayCurrency, true)}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">My Earnings</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{myStats.myCompleted}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Completed Tasks</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{myStats.myPending}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Pending Tasks</div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
              <Briefcase className="h-5 w-5 text-violet-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{myStats.myTotal}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">Total Tasks</div>
          </div>
        </div>
      )}

      {/* Team Status (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--accent-color)]" /> Team Status
          </h3>
          {teamStats.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No team members yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamStats.map(member => (
                <div key={member.id} className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between hover:border-[var(--accent-color)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${member.avatarColor || 'from-violet-500 to-fuchsia-500'} flex items-center justify-center text-white font-bold`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{member.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">{member.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* ✅ FIXED: Uses displayCurrency */}
                    <div className="text-sm font-bold text-emerald-500">{formatCurrency(member.earnings, 'USD', displayCurrency, true)}</div>
                    <div className="text-xs text-[var(--text-muted)]">{member.completed} done • {member.pending} pending</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {user?.role === 'admin' && (
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">No transactions yet</div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => {
                  const client = clients.find(c => c.id === tx.clientId);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {tx.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{tx.description || tx.category || 'Transaction'}</div>
                          <div className="text-xs text-[var(--text-muted)]">{client?.name || 'Unknown Client'}</div>
                        </div>
                      </div>
                      {/* ✅ FIXED: Uses displayCurrency */}
                      <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD', displayCurrency, true)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={`glass rounded-2xl p-5 ${user?.role === 'member' ? 'lg:col-span-2' : ''}`}>
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4">
            {user?.role === 'member' ? 'My Upcoming Tasks' : 'Upcoming Tasks'}
          </h3>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No upcoming tasks</div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const assignee = profiles.find(p => p.id === task.assigneeId);
                const client = clients.find(c => c.id === task.clientId);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">
                          {client?.name}{assignee && user?.role === 'admin' ? ` • ${assignee.name}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] flex-shrink-0 ml-2">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}