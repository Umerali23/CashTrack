import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

export default function Dashboard({ ctx, onSelectClient, user }) {
  const { data, aggregates, memberEarnings, displayCurrency } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'USD' : displayCurrency;

  const tasks = data?.tasks || [];
  const transactions = data?.transactions || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];
  const invoices = data?.invoices || [];

  const stats = useMemo(() => {
    const totalRevenue = aggregates?.income || 0;
    const totalExpenses = aggregates?.expense || 0;
    const netProfit = aggregates?.net || 0;
    const pendingAmount = aggregates?.pending || 0;

    const activeTasks = tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalClients = clients.length;
    const totalMembers = profiles.filter(p => p.role === 'member').length;
    const pendingInvoices = invoices.filter(i => i.status === 'draft' || i.status === 'sent').length;

    return {
      totalRevenue, totalExpenses, netProfit, pendingAmount,
      activeTasks, completedTasks, totalClients, totalMembers, pendingInvoices
    };
  }, [aggregates, tasks, clients, profiles, invoices]);

  // Member-specific stats
  const myStats = useMemo(() => {
    if (user?.role !== 'member') return null;
    
    const myTasks = tasks.filter(t => t.assigneeId === user.id);
    const myCompleted = myTasks.filter(t => t.status === 'completed').length;
    const myPending = myTasks.filter(t => t.status !== 'completed').length;
    const myEarnings = memberEarnings?.total || 0;

    return { myTasks: myTasks.length, myCompleted, myPending, myEarnings };
  }, [tasks, memberEarnings, user]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5);
  }, [transactions]);

  const upcomingTasks = useMemo(() => {
    const tasksToFilter = user?.role === 'member' 
      ? tasks.filter(t => t.assigneeId === user.id)
      : tasks;
    
    return [...tasksToFilter]
      .filter(t => t.status !== 'completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  }, [tasks, user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {user?.role === 'admin' 
              ? "Here's what's happening with your business today."
              : "Here's your personal performance overview."}
          </p>
        </div>
      </div>

      {/* Admin Stats Grid */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                {aggregates?.incomeChange ? `${aggregates.incomeChange.toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(stats.totalRevenue, currency, true)}
            </div>
            <div className="text-xs text-ink-400 mt-1">Total Revenue</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(stats.totalExpenses, currency, true)}
            </div>
            <div className="text-xs text-ink-400 mt-1">Total Expenses</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(stats.netProfit, currency, true)}
            </div>
            <div className="text-xs text-ink-400 mt-1">Net Profit</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(stats.pendingAmount, currency, true)}
            </div>
            <div className="text-xs text-ink-400 mt-1">Pending Amount</div>
          </div>
        </div>
      )}

      {/* Member Stats Grid */}
      {user?.role === 'member' && myStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-400">
              {formatCurrency(myStats.myEarnings, currency, true)}
            </div>
            <div className="text-xs text-ink-400 mt-1">My Earnings</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {myStats.myCompleted}
            </div>
            <div className="text-xs text-ink-400 mt-1">Completed Tasks</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {myStats.myPending}
            </div>
            <div className="text-xs text-ink-400 mt-1">Pending Tasks</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {myStats.myTasks}
            </div>
            <div className="text-xs text-ink-400 mt-1">Total Tasks</div>
          </div>
        </div>
      )}

      {/* Quick Stats Row */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <div>
              <div className="text-lg font-bold">{stats.activeTasks}</div>
              <div className="text-xs text-ink-400">Active Tasks</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-emerald-400" />
            <div>
              <div className="text-lg font-bold">{stats.totalMembers}</div>
              <div className="text-xs text-ink-400">Team Members</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-violet-400" />
            <div>
              <div className="text-lg font-bold">{stats.totalClients}</div>
              <div className="text-xs text-ink-400">Clients</div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-amber-400" />
            <div>
              <div className="text-lg font-bold">{stats.pendingInvoices}</div>
              <div className="text-xs text-ink-400">Pending Invoices</div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        {user?.role === 'admin' && (
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">No transactions yet</div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => {
                  const client = clients.find(c => c.id === tx.clientId);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-ink-900/40 hover:bg-ink-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{tx.description || tx.category || 'Transaction'}</div>
                          <div className="text-xs text-ink-400">{client?.name || 'Unknown Client'}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD', true)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Tasks */}
        <div className={`glass rounded-2xl p-5 ${user?.role === 'member' ? 'lg:col-span-2' : ''}`}>
          <h3 className="font-bold text-lg mb-4">
            {user?.role === 'member' ? 'My Upcoming Tasks' : 'Upcoming Tasks'}
          </h3>
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8 text-ink-400 text-sm">No upcoming tasks</div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const assignee = profiles.find(p => p.id === task.assigneeId);
                const client = clients.find(c => c.id === task.clientId);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-ink-900/40 hover:bg-ink-900/60 transition-colors">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{task.title}</div>
                        <div className="text-xs text-ink-400 truncate">
                          {client?.name}{assignee && user?.role === 'admin' ? ` • ${assignee.name}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-ink-400 flex-shrink-0 ml-2">
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