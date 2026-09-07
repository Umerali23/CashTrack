import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

export default function Analytics({ ctx, user }) {
  const { monthlySeries, topClients, earningsByMember, displayCurrency } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'USD' : displayCurrency;

  // Safely access data
  const series = monthlySeries || [];
  const topClientsList = topClients || [];
  const memberEarnings = earningsByMember || [];

  // Calculate max value for chart scaling
  const maxValue = useMemo(() => {
    if (series.length === 0) return 100;
    return Math.max(...series.map(s => Math.max(s.income, s.expense, s.profit))) * 1.1;
  }, [series]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-ink-400 text-sm mt-1">Performance insights and trends</p>
      </div>

      {/* Monthly Trends Chart */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6">Monthly Trends</h3>
        
        {series.length === 0 ? (
          <div className="text-center py-12 text-ink-400">
            No data available yet
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart Container */}
            <div className="h-64 flex items-end gap-4">
              {series.map((month, index) => {
                const incomeHeight = (month.income / maxValue) * 100;
                const expenseHeight = (month.expense / maxValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end h-48">
                      <div 
                        className="flex-1 bg-emerald-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: $${month.income.toFixed(2)}`}
                      />
                      <div 
                        className="flex-1 bg-rose-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expense: $${month.expense.toFixed(2)}`}
                      />
                    </div>
                    <div className="text-xs text-ink-400 font-medium">{month.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-ink-300">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-rose-500" />
                <span className="text-ink-300">Expenses</span>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-ink-600/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(series.reduce((sum, m) => sum + m.income, 0), currency, true)}
                </div>
                <div className="text-xs text-ink-400 mt-1">Total Income</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-400">
                  {formatCurrency(series.reduce((sum, m) => sum + m.expense, 0), currency, true)}
                </div>
                <div className="text-xs text-ink-400 mt-1">Total Expenses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-400">
                  {formatCurrency(series.reduce((sum, m) => sum + m.profit, 0), currency, true)}
                </div>
                <div className="text-xs text-ink-400 mt-1">Total Profit</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Clients (Admin Only) */}
      {user?.role === 'admin' && topClientsList.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Top Clients by Revenue</h3>
          <div className="space-y-3">
            {topClientsList.map((item, index) => (
              <div key={item.client.id} className="flex items-center justify-between p-4 rounded-xl bg-ink-900/40">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{item.client.name}</div>
                    <div className="text-xs text-ink-400">{item.client.company}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-400">
                    {formatCurrency(item.total, currency, true)}
                  </div>
                  <div className="text-xs text-ink-400">Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Performance (Admin Only) */}
      {user?.role === 'admin' && memberEarnings.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Team Performance</h3>
          <div className="space-y-3">
            {memberEarnings.map((item, index) => (
              <div key={item.member.id} className="flex items-center justify-between p-4 rounded-xl bg-ink-900/40">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${item.member.avatarColor} flex items-center justify-center text-white font-bold`}>
                    {item.member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{item.member.name}</div>
                    <div className="text-xs text-ink-400">{item.member.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-violet-400">
                    {formatCurrency(item.total, currency, true)}
                  </div>
                  <div className="text-xs text-ink-400">Earnings Generated</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}