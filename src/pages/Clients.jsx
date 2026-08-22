import { useState, useMemo } from 'react';
import { Plus, Mail, Building2, X, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/currency';

const AVATAR_GRADIENTS = ['from-emerald-400 to-teal-500', 'from-violet-400 to-fuchsia-500', 'from-sky-400 to-blue-500', 'from-amber-400 to-orange-500', 'from-rose-400 to-pink-500', 'from-indigo-400 to-purple-500', 'from-lime-400 to-green-500'];
const EMPTY_FORM = { name: '', company: '', email: '', avatarColor: AVATAR_GRADIENTS[0] };

export default function Clients({ ctx, toast, selectedClientId, onSelectClient, onClearSelection }) {
  const { data, displayCurrency, toDisplay, addClient, updateClient, deleteClient } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const clientStats = useMemo(() => { return data.clients.map((c) => { let paid = 0, pending = 0; const projects = new Set(); data.transactions.forEach((t) => { if (t.clientId !== c.id || t.type !== 'income') return; const amt = toDisplay(t.amount, t.currency); if (t.status === 'paid') paid += amt; else pending += amt; projects.add(t.description); }); return { client: c, paid, pending, projects: projects.size }; }); }, [data, toDisplay]);
  const selected = selectedClientId ? clientStats.find((x) => x.client.id === selectedClientId) : null;
  const selectedTx = selectedClientId ? data.transactions.filter((t) => t.clientId === selectedClientId).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

  const openNew = () => { setEditing(null); setForm({ ...EMPTY_FORM, avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)] }); setErrors({}); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, company: c.company, email: c.email, avatarColor: c.avatarColor }); setErrors({}); setModalOpen(true); };
  const validate = () => { const e = {}; if (!form.name.trim()) e.name = 'Name is required'; if (!form.email.trim()) e.email = 'Email is required'; else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'; setErrors(e); return Object.keys(e).length === 0; };
  const handleSave = () => { if (!validate()) return; if (editing) { updateClient(editing.id, form); toast('Client updated', 'success'); } else { addClient(form); toast('Client added', 'success'); } setModalOpen(false); };
  const handleDelete = (c) => { if (!window.confirm(`Delete "${c.name}"? Their transactions will be kept but unlinked.`)) return; deleteClient(c.id); toast('Client deleted', 'info'); if (selectedClientId === c.id) onClearSelection(); };
  const toggleSelect = (id) => { if (selectedClientId === id) onClearSelection(); else onSelectClient(id); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div><h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Clients</h1><p className="text-ink-400 text-sm mt-1">{data.clients.length} clients in your network</p></div>
        <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10"><Plus className="h-4 w-4" strokeWidth={2.5} />Add Client</button>
      </div>
      {selected && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${selected.client.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{selected.client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div><h2 className="font-bold text-xl tracking-tight">{selected.client.name}</h2><div className="flex items-center gap-3 text-xs text-ink-400 mt-0.5"><span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{selected.client.company}</span><span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selected.client.email}</span></div></div>
            </div>
            <button onClick={onClearSelection} className="p-1.5 rounded-lg hover:bg-ink-700/50 cursor-pointer"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl bg-ink-900/50 border border-ink-600/60 p-3"><div className="text-[10px] uppercase tracking-wider text-ink-400">Total Paid</div><div className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(selected.paid, currency, true)}</div></div>
            <div className="rounded-xl bg-ink-900/50 border border-ink-600/60 p-3"><div className="text-[10px] uppercase tracking-wider text-ink-400">Pending</div><div className="text-lg font-bold text-amber-400 mt-1">{formatCurrency(selected.pending, currency, true)}</div></div>
            <div className="rounded-xl bg-ink-900/50 border border-ink-600/60 p-3"><div className="text-[10px] uppercase tracking-wider text-ink-400">Projects</div><div className="text-lg font-bold mt-1">{selected.projects}</div></div>
          </div>
          {selectedTx.length === 0 ? <div className="text-sm text-ink-400 text-center py-6">No transactions for this client.</div> : (
            <div className="space-y-1">{selectedTx.map((t) => { const isIncome = t.type === 'income'; return (<div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-700/30 transition-colors"><div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{isIncome ? '↓' : '↑'}</div><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{t.description}</div><div className="text-xs text-ink-400">{t.category} · {new Date(t.date).toLocaleDateString()}</div></div><div className={`text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>{isIncome ? '+' : '-'}{formatCurrency(toDisplay(t.amount, t.currency), currency)}</div></div>); })}</div>
          )}
        </div>
      )}
      {clientStats.length === 0 ? <EmptyState title="No clients yet" description="Add your first client to start tracking income by customer." action={<button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> Add Client</button>} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientStats.map(({ client, paid, pending, projects }) => { const initials = client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(); const isSelected = selectedClientId === client.id; return (
            <div key={client.id} className={`glass rounded-2xl p-5 group hover:border-ink-500 transition-all duration-300 ${isSelected ? 'ring-2 ring-emerald-500/40' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <button onClick={() => toggleSelect(client.id)} className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${client.avatarColor} flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer`}>{initials}</button>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-ink-700/50 cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(client)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <button className="text-left w-full cursor-pointer" onClick={() => toggleSelect(client.id)}>
                <div className="font-bold text-base tracking-tight">{client.name}</div>
                <div className="text-xs text-ink-400 truncate">{client.company}</div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink-600/50">
                  <div><div className="text-[10px] uppercase tracking-wider text-ink-400">Paid</div><div className="text-sm font-bold text-emerald-400 mt-0.5">{formatCurrency(paid, currency, true)}</div></div>
                  <div><div className="text-[10px] uppercase tracking-wider text-ink-400">Pending</div><div className="text-sm font-bold text-amber-400 mt-0.5">{formatCurrency(pending, currency, true)}</div></div>
                  <div><div className="text-[10px] uppercase tracking-wider text-ink-400">Projects</div><div className="text-sm font-bold mt-0.5">{projects}</div></div>
                </div>
              </button>
            </div>
          ); })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Client' : 'New Client'}>
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-ink-300 mb-1.5 block">Full Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input ${errors.name ? 'border-rose-500/60' : ''}`} placeholder="Sarah Mitchell" />{errors.name && <div className="text-xs text-rose-400 mt-1">{errors.name}</div>}</div>
          <div><label className="text-xs font-semibold text-ink-300 mb-1.5 block">Company</label><input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" placeholder="Acme Inc." /></div>
          <div><label className="text-xs font-semibold text-ink-300 mb-1.5 block">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`input ${errors.email ? 'border-rose-500/60' : ''}`} placeholder="sarah@example.com" />{errors.email && <div className="text-xs text-rose-400 mt-1">{errors.email}</div>}</div>
          <div><label className="text-xs font-semibold text-ink-300 mb-1.5 block">Avatar Color</label><div className="flex flex-wrap gap-2">{AVATAR_GRADIENTS.map((g) => (<button key={g} type="button" onClick={() => setForm({ ...form, avatarColor: g })} className={`h-9 w-9 rounded-xl bg-gradient-to-br ${g} transition-all cursor-pointer ${form.avatarColor === g ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`} />))}</div></div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.01]">{editing ? 'Save Changes' : 'Add Client'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}