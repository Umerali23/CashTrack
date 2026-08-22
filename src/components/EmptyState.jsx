import { Inbox } from 'lucide-react';
export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-ink-800 border border-ink-600 flex items-center justify-center mb-4"><Inbox className="h-7 w-7 text-ink-400" /></div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-ink-400 text-sm max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}