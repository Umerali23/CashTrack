import { useMemo } from 'react';
import { DollarSign, TrendingUp, CheckCircle, Clock, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

export default function Earnings({ ctx, user }) {
  const { memberEarnings, earningsByMember, data, displayCurrency, toDisplay } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'USD' : displayCurrency;
  const tasks = data?.tasks || [];
  const profiles = data?.profiles || [];

  // Admin sees all members' earnings
  const allMembersEarnings = useMemo(() => {
    if (user?.role !== 'admin') return [];
    
    return profiles
      .filter(p => p.role === 'member')
      .map(member => {
        const memberTasks = tasks.filter(t => t.assigneeId === member.id && t.status === 'completed');
        const total = memberTasks.reduce((sum, t) => {
          return sum + toDisplay(parseFloat(t.compensation) || 0, t.currency);
        }, 0);
        
        return {
          member,
          total,
          completedTasks: memberTasks.length,
          tasks: memberTasks
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [profiles, tasks, user, toDisplay]);

  // Member sees only their own earnings
  const myEarnings = memberEarnings;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {user?.role === 'admin' ? 'Team Earnings' : 'My Earnings'}
        </h1>
        <p className="text-ink-400 text-sm mt-1">
          {user?.role === 'admin' 
            ? 'Overview of all team member earnings' 
            : 'Track your completed tasks and earnings'}
        </p>
      </div>

      {/* Member View: Personal Earnings Dashboard */}
      {user?.role !== 'admin' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(myEarnings.total, currency, true)}
              </div>
              <div className="text-xs text-ink-400 mt-1">Total Earnings</div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {myEarnings.completedTasks}
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
                {myEarnings.pendingTasks}
              </div>
              <div className="text-xs text-ink-400 mt-1">Pending Tasks</div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Earnings Breakdown</h3>
            
            {myEarnings.taskBreakdown.length === 0 ? (
              <div className="text-center py-12 text-ink-400">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No completed tasks yet</p>
                <p className="text-xs mt-1">Complete your assigned tasks to see earnings here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myEarnings.taskBreakdown.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-ink-900/40 hover:bg-ink-900/60 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{task.title}</div>
                        <div className="text-xs text-ink-400 truncate">
                          {task.client?.name || 'Unknown Client'} • 
                          {task.completedAt ? ` Completed ${new Date(task.completedAt).toLocaleDateString()}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-lg font-bold text-emerald-400">
                        {formatCurrency(task.earnings, task.currency || 'USD', true)}
                      </div>
                      <div className="text-xs text-ink-400">Earned</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Card */}
          {myEarnings.taskBreakdown.length > 0 && (
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-emerald-400">Total Earned</h3>
                  <p className="text-xs text-ink-400 mt-1">From {myEarnings.completedTasks} completed tasks</p>
                </div>
                <div className="text-3xl font-bold text-emerald-400">
                  {formatCurrency(myEarnings.total, currency, true)}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin View: All Team Members' Earnings */}
      {user?.role === 'admin' && (
        <>
          {/* Team Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-violet-400" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(allMembersEarnings.reduce((sum, m) => sum + m.total, 0), currency, true)}
              </div>
              <div className="text-xs text-ink-400 mt-1">Total Team Earnings</div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {allMembersEarnings.reduce((sum, m) => sum + m.completedTasks, 0)}
              </div>
              <div className="text-xs text-ink-400 mt-1">Total Completed Tasks</div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {allMembersEarnings.length}
              </div>
              <div className="text-xs text-ink-400 mt-1">Active Members</div>
            </div>
          </div>

          {/* Members Earnings List */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Team Member Earnings</h3>
            
            {allMembersEarnings.length === 0 ? (
              <div className="text-center py-12 text-ink-400">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No team earnings yet</p>
                <p className="text-xs mt-1">Assign and complete tasks to see earnings here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allMembersEarnings.map((memberData, index) => (
                  <div key={memberData.member.id} className="p-4 rounded-xl bg-ink-900/40 hover:bg-ink-900/60 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${memberData.member.avatarColor} flex items-center justify-center text-white font-bold`}>
                          {memberData.member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{memberData.member.name}</div>
                          <div className="text-xs text-ink-400">{memberData.member.role} • {memberData.completedTasks} completed tasks</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-emerald-400">
                          {formatCurrency(memberData.total, currency, true)}
                        </div>
                        <div className="text-xs text-ink-400">Total Earned</div>
                      </div>
                    </div>

                    {/* Member's Tasks */}
                    {memberData.tasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ink-600/50 space-y-2">
                        {memberData.tasks.slice(0, 3).map(task => (
                          <div key={task.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                              <span className="text-ink-300 truncate">{task.title}</span>
                            </div>
                            <span className="text-emerald-400 font-medium">
                              {formatCurrency(toDisplay(parseFloat(task.compensation) || 0, task.currency), task.currency, true)}
                            </span>
                          </div>
                        ))}
                        {memberData.tasks.length > 3 && (
                          <div className="text-xs text-ink-400 text-center pt-1">
                            +{memberData.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}