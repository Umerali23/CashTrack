import { TrendingUp, TrendingDown } from 'lucide-react';
export default function StatCard({ label, value, icon: Icon, change, accent = 'emerald', sub }) {
  const accentMap = { emerald: 'from-emerald-400/20 to-emerald-600/5 text-emerald-400', rose: 'from-rose-400/20 to-rose-600/5 text-rose-400', violet: 'from-violet-400/20 to-violet-600/5 text-violet-400', amber: 'from-amber-400/20 to-amber-600/5 text-amber-400' };
  const positive = change >= 0;
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-ink-500 transition-all duration-300">
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${accentMap[accent]} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center`}><Icon className="h-5 w-5" strokeWidth={2.2} /></div>
          {change !== undefined && !isNaN(change) && (<div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{Math.abs(change).toFixed(1)}%</div>)}
        </div>
        <div className="text-ink-400 text-xs font-medium uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold mt-1.5 tracking-tight">{value}</div>
        {sub && <div className="text-ink-400 text-xs mt-1">{sub}</div>}
      </div>
    </div>
  );
}