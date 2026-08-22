import { useMemo } from 'react';
import { TrendingUp, PieChart as PieIcon, BarChart3, Wallet } from 'lucide-react';
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import AreaChart from '../components/charts/AreaChart';
import { formatCurrency } from '../lib/currency';

const CATEGORY_COLORS = { 'Design Work': '#10b981', 'Development': '#8b5cf6', 'Subscription': '#f59e0b', 'Internet': '#06b6d4', 'Food': '#f43f5e', 'Software': '#ec4899', 'Other': '#64748b' };

export default function Analytics({ ctx }) {
  const { data, displayCurrency, toDisplay, monthlySeries } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;

  const { incomeTotal, expenseTotal, byCategory } = useMemo(() => {
    let incomeTotal = 0, expenseTotal = 0; const catMap = {};
    data.transactions.forEach((t) => { const amt = toDisplay(t.amount, t.currency); if (t.type === 'income') incomeTotal += amt; else { expenseTotal += amt; catMap[t.category] = (catMap[t.category] || 0) + amt; } });
    const byCategory = Object.entries(catMap).map(([label, value]) => ({ label, value, color: CATEGORY_COLORS[label] || '#64748b' })).sort((a, b) => b.value - a.value);
    return { incomeTotal, expenseTotal, byCategory };
  }, [data.transactions, toDisplay]);

  const savingsTrend = useMemo(() => { let cum = 0; return monthlySeries.map((m) => { cum += m.profit; return { ...m, income: cum, expense: 0 }; }); }, [monthlySeries]);
  const total = incomeTotal + expenseTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Analytics</h1><p className="text-ink-400 text-sm mt-1">Deep dive into your freelance finances.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5"><div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2"><TrendingUp className="h-3.5 w-3.5" /> Gross Income</div><div className="text-2xl font-bold text-emerald-400">{formatCurrency(incomeTotal, currency)}</div><div className="text-xs text-ink-400 mt-1">{total ? ((incomeTotal / total) * 100).toFixed(1) : 0}% of total flow</div></div>
        <div className="glass rounded-2xl p-5"><div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2"><PieIcon className="h-3.5 w-3.5" /> Total Expenses</div><div className="text-2xl font-bold text-rose-400">{formatCurrency(expenseTotal, currency)}</div><div className="text-xs text-ink-400 mt-1">{total ? ((expenseTotal / total) * 100).toFixed(1) : 0}% of total flow</div></div>
        <div className="glass rounded-2xl p-5"><div className="flex items-center gap-2 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2"><Wallet className="h-3.5 w-3.5" /> Net Margin</div><div className="text-2xl font-bold">{formatCurrency(incomeTotal - expenseTotal, currency)}</div><div className="text-xs text-ink-400 mt-1">{incomeTotal ? (((incomeTotal - expenseTotal) / incomeTotal) * 100).toFixed(1) : 0}% margin</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6"><div className="flex items-center gap-2 mb-5"><PieIcon className="h-4 w-4 text-emerald-400" /><h2 className="font-bold text-lg tracking-tight">Income vs Expense</h2></div>{total === 0 ? <div className="text-sm text-ink-400 text-center py-12">No data yet.</div> : <DonutChart segments={[{ label: 'Income', value: incomeTotal, color: '#10b981' }, { label: 'Expense', value: expenseTotal, color: '#f43f5e' }]} currency={currency} centerLabel="Net" centerValue={formatCurrency(incomeTotal - expenseTotal, currency, true)} />}</div>
        <div className="glass rounded-2xl p-6"><div className="flex items-center gap-2 mb-5"><BarChart3 className="h-4 w-4 text-violet-400" /><h2 className="font-bold text-lg tracking-tight">Expense by Category</h2></div>{byCategory.length === 0 ? <div className="text-sm text-ink-400 text-center py-12">No expenses recorded.</div> : <BarChart data={byCategory} currency={currency} />}</div>
      </div>
      <div className="glass rounded-2xl p-6"><div className="flex items-center justify-between mb-5"><div><h2 className="font-bold text-lg tracking-tight">Cumulative Savings</h2><p className="text-ink-400 text-xs mt-0.5">Running profit over the last 6 months</p></div></div><AreaChart data={savingsTrend} currency={currency} /></div>
    </div>
  );
}