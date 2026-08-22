import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onDone={() => removeToast(t.id)} />)}
    </div>
  );
}
function ToastItem({ toast, onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 3000); return () => clearTimeout(id); }, [onDone]);
  const styles = { success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', error: 'border-rose-500/40 bg-rose-500/10 text-rose-300', info: 'border-sky-500/40 bg-sky-500/10 text-sky-300' };
  const Icon = toast.type === 'error' ? XCircle : toast.type === 'info' ? Info : CheckCircle2;
  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg animate-slide-up ${styles[toast.type]}`}>
      <Icon className="h-5 w-5 flex-shrink-0" /><div className="text-sm font-medium">{toast.message}</div>
    </div>
  );
}