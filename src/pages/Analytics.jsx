import { useMemo } from 'react';
import { TrendingUp, PieChart as PieIcon, BarChart3, Wallet, UserCircle } from 'lucide-react';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import AreaChart from '../components/charts/AreaChart';
import { formatCurrency } from '../lib/currency';

const CATEGORY_COLORS = { 
  'Design Work': '#10b981', 
  'Development': '#8b5cf6', 
  'Subscription': '#f59e0b', 
  'Internet': '#06b6d4', 
  'Food': '#f43f5e', 
  'Software': '#ec4899', 
  'Other': '#64748b' 
};

export default function Analytics({ ctx }) {
  const { data, displayCurrency, toDisplay, monthlySeries, aggregates, earningsByMember } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;

  const { incomeTotal, expenseTotal, byCategory } = useMemo(() => {
    let incomeTotal = 0, expenseTotal = 0; 
    const catMap = {};
    data.transactions.forEach((t) => { 
      const amt = toDisplay(t.amount, t.currency); 
      if (t.type === 'income') incomeTotal += amt; 
      else { 
        expenseTotal += amt; 
        catMap[t.category] = (catMap[t.category] || 0) + amt; 
      } 
    });
    const byCategory = Object.entries(catMap)
      .map(([label, value]) => ({ label, value, color: CATEGORY_COLORS[label] || '#64748b' }))
      .sort((a, b) => b.value - a.value);
    return { incomeTotal, expenseTotal, byCategory };
  }, [data.transactions, toDisplay]);

  const savingsTrend = useMemo(() => { 
    let cum = 0; 
    return monthlySeries.map((m) => { 
      cum += m.profit; 
      return { ...m, income: cum, expense: 0 }; 
    }); 
  }, [monthlySeries]);

  const totalFlow = incomeTotal + expenseTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-ink-400 text-sm mt-1">Deep dive into your freelance finances and team performance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Gross Income
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(incomeTotal, currency)}</div>
          <div className="text-xs text-ink-400 mt-1">{totalFlow ? ((incomeTotal / totalFlow) * 100).toFixed(1) : 0}% of total flow</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <PieIcon className="h-3.5 w-3.5" /> Total Expenses
          </div>
          <div className="text-2xl font-bold text-rose-400">{formatCurrency(expenseTotal, currency)}</div>
          <div className="text-xs text-ink-400 mt-1">{totalFlow ? ((expenseTotal / totalFlow) * 100).toFixed(1) : 0}% of total flow</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">
            <Wallet className="h-3.5 w-3.5" /> Net Margin
          </div>
          <div className="text-2xl font-bold">{formatCurrency(incomeTotal - expenseTotal, currency)}</div>
          <div className="text-xs text-ink-400 mt-1">
            {incomeTotal ? (((incomeTotal - expenseTotal) / incomeTotal) * 100).toFixed(1) : 0}% margin
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieIcon className="h-4 w-4 text-emerald-400" />
            <h2 className="font-bold text-lg tracking-tight">Income vs Expense</h2>
          </div>
          {totalFlow === 0 ? (
            <div className="text-sm text-ink-400 text-center py-12">No data yet.</div>
          ) : (
            <DonutChart
              segments={[
                { label: 'Income', value: incomeTotal, color: '#10b981' },
                { label: 'Expense', value: expenseTotal, color: '#f43f5e' },
              ]}
              currency={currency}
              centerLabel="Net"
              centerValue={formatCurrency(incomeTotal - expenseTotal, currency, true)}
            />
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <h2 className="font-bold text-lg tracking-tight">Expense by Category</h2>
          </div>
          {byCategory.length === 0 ? (
            <div className="text-sm text-ink-400 text-center py-12">No expenses recorded.</div>
          ) : (
            <BarChart data={byCategory} currency={currency} />
          )}
        </div>
      </div>

      {/* ✅ NEW: Team Revenue Breakdown */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-violet-400" />
            <h2 className="font-bold text-lg tracking-tight">Revenue by Team Member</h2>
          </div>
          <div className="text-xs text-ink-400">Based on assigned income transactions</div>
        </div>
        
        {earningsByMember.length === 0 ? (
          <div className="text-sm text-ink-400 text-center py-8">
            No team earnings recorded yet. Assign transactions to team members to see the breakdown.
          </div>
        ) : (
          <div className="space-y-6">
            {earningsByMember.map((item) => {
              const maxEarnings = Math.max(...earningsByMember.map(x => x.total), 1);
              const percentage = (item.total / maxEarnings) * 100;
              const companyShare = aggregates.income ? ((item.total / aggregates.income) * 100).toFixed(1) : 0;
              const initials = item.member.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

              return (
                <div key={item.member.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${item.member.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.member.name}</div>
                        <div className="text-xs text-ink-400">{item.member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(item.total, currency)}
                      </div>
                      <div className="text-[10px] text-ink-400 tabular-nums">
                        {companyShare}% of total company income
                      </div>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${item.member.avatarColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings trend */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg tracking-tight">Cumulative Savings</h2>
            <p className="text-ink-400 text-xs mt-0.5">Running profit over the last 6 months</p>
          </div>
        </div>
        <AreaChart data={savingsTrend} currency={currency} />
      </div>
    </div>
  );
}