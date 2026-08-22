import { formatCurrency } from '../../lib/currency';
export default function DonutChart({ segments, currency = 'PKR', centerLabel, centerValue }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 80; const C = 2 * Math.PI * R; let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="20" />
          {segments.map((seg, i) => { const len = (seg.value / total) * C; const el = <circle key={i} cx="100" cy="100" r={R} fill="none" stroke={seg.color} strokeWidth="20" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} strokeLinecap="butt" className="transition-all duration-500" />; offset += len; return el; })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-[11px] uppercase tracking-wider text-ink-400">{centerLabel}</div><div className="text-xl font-bold">{centerValue}</div></div>
      </div>
      <div className="flex-1 space-y-2.5">
        {segments.map((seg, i) => (<div key={i} className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: seg.color }} /><span className="text-sm font-medium truncate">{seg.label}</span></div><div className="text-right flex-shrink-0"><div className="text-sm font-semibold">{formatCurrency(seg.value, currency, true)}</div><div className="text-[10px] text-ink-400">{((seg.value / total) * 100).toFixed(1)}%</div></div></div>))}
      </div>
    </div>
  );
}