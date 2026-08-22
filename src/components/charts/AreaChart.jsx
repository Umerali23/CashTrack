import { useMemo, useState } from 'react';
import { formatCurrency } from '../../lib/currency';
export default function AreaChart({ data, currency = 'PKR' }) {
  const [hover, setHover] = useState(null);
  const { path, areaPath, points, max, bars } = useMemo(() => {
    if (!data.length) return {};
    const W = 720, H = 260, PAD_L = 40, PAD_T = 20, PAD_B = 40;
    const innerW = W - PAD_L - 20; const innerH = H - PAD_T - PAD_B;
    const all = data.flatMap((d) => [d.income, d.expense]);
    const max = Math.max(...all, 1) * 1.15;
    const stepX = innerW / (data.length - 1 || 1);
    const pts = data.map((d, i) => ({ x: PAD_L + i * stepX, yIncome: PAD_T + innerH - (d.income / max) * innerH, yExpense: PAD_T + innerH - (d.expense / max) * innerH, ...d }));
    const buildPath = (key) => { let d = `M ${pts[0].x} ${pts[0][key]}`; for (let i = 1; i < pts.length; i++) { const prev = pts[i - 1]; const cur = pts[i]; const cpx = (prev.x + cur.x) / 2; d += ` C ${cpx} ${prev[key]}, ${cpx} ${cur[key]}, ${cur.x} ${cur[key]}`; } return d; };
    const incomeLine = buildPath('yIncome');
    const areaPath = `${incomeLine} L ${pts[pts.length - 1].x} ${PAD_T + innerH} L ${pts[0].x} ${PAD_T + innerH} Z`;
    const barW = Math.min(28, stepX * 0.35);
    const bars = pts.map((p, i) => ({ x: p.x - barW - 2, y: p.yExpense, w: barW, h: PAD_T + innerH - p.yExpense, data: p, idx: i }));
    return { path: incomeLine, areaPath, points: pts, max, bars };
  }, [data]);
  if (!data.length) return null;
  const gridLines = 4; const innerH = 260 - 20 - 40;
  return (
    <div className="w-full">
      <svg viewBox="0 0 720 260" className="w-full h-auto">
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.35" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" /><stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" /></linearGradient>
        </defs>
        {Array.from({ length: gridLines + 1 }).map((_, i) => { const y = 20 + (innerH / gridLines) * i; const val = (max * (1 - i / gridLines)); return (<g key={i}><line x1="40" x2="700" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" /><text x="34" y={y + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.4">{formatCurrency(val, currency, true)}</text></g>); })}
        {bars.map((b) => (<rect key={b.idx} x={b.x} y={b.y} width={b.w} height={Math.max(0, b.h)} rx="4" fill="url(#barGrad)" opacity={hover === null || hover === b.idx ? 0.9 : 0.3} className="transition-opacity" />))}
        <path d={areaPath} fill="url(#incomeGrad)" />
        <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.yIncome} r={hover === i ? 6 : 4} fill="#10b981" stroke="#0a0a0b" strokeWidth="2" className="transition-all" /><rect x={p.x - 30} y="0" width="60" height="260" fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} /></g>))}
        {points.map((p, i) => (<text key={i} x={p.x} y="252" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5" fontWeight="500">{p.label}</text>))}
        {hover !== null && points[hover] && (<g><line x1={points[hover].x} x2={points[hover].x} y1="20" y2="220" stroke="#10b981" strokeOpacity="0.3" strokeDasharray="3 3" /><foreignObject x={Math.min(points[hover].x - 70, 580)} y="30" width="140" height="70"><div className="glass rounded-lg px-3 py-2 text-xs border border-ink-600"><div className="font-semibold mb-1">{points[hover].label} {points[hover].year}</div><div className="flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />In: {formatCurrency(points[hover].income, currency, true)}</div><div className="flex items-center gap-1.5 text-rose-400"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" />Ex: {formatCurrency(points[hover].expense, currency, true)}</div></div></foreignObject></g>)}
      </svg>
      <div className="flex items-center gap-5 mt-2 text-xs text-ink-400">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="font-medium">Income</span></div>
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" /><span className="font-medium">Expense</span></div>
      </div>
    </div>
  );
}