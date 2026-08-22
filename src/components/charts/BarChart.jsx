import { formatCurrency } from '../../lib/currency';
const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f43f5e', '#ec4899', '#3b82f6', '#84cc16'];
export default function BarChart({ data, currency = 'PKR' }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (<div key={d.label}><div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium">{d.label}</span><span className="text-sm font-semibold tabular-nums">{formatCurrency(d.value, currency)}</span></div><div className="h-2 rounded-full bg-ink-800 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}aa)` }} /></div></div>))}
    </div>
  );
}