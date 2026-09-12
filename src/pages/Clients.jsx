import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Briefcase, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500', 'from-blue-400 to-indigo-500',
  'from-pink-400 to-rose-500', 'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500', 'from-cyan-400 to-sky-500',
];

export default function Clients({ ctx, user }) {
  const { data, displayCurrency, toDisplay, addClient, updateClient, deleteClient } = ctx;
  const clients = data?.clients || [];
  const invoices = data?.invoices || [];
  const tasks = data?.tasks || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', email: '', avatarColor: AVATAR_GRADIENTS[0] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isDark = ctx.theme === 'dark' || ctx.theme === 'midnight';

  const clientStats = useMemo(() => {
    return clients.map((c) => {
      const clientInvoices = invoices.filter(i => i.clientId === c.id && i.status === 'paid');
      const totalRevenue = clientInvoices.reduce((sum, i) => sum + toDisplay(i.total || 0, i.currency || 'USD'), 0);
      const activeTasks = tasks.filter(t => t.clientId === c.id && t.status !== 'completed').length;
      return { client: c, totalRevenue, activeTasks, invoiceCount: clientInvoices.length };
    });
  }, [clients, invoices, tasks, toDisplay]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', company: '', email: '', avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)] });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, company: c.company || '', email: c.email || '', avatarColor: c.avatarColor || AVATAR_GRADIENTS[0] });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.company.trim()) e.company = 'Company is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      if (editing) {
        await updateClient(editing.id, form);
      } else {
        await addClient(form);
      }
      setModalOpen(false);
    } catch (error) {
      alert(error.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete client "${c.name}"? Their tasks will become unassigned.`)) return;
    await deleteClient(c.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">Clients</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">{clients.length} clients managed</p>
        </div>
        <button onClick={openNew} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No clients yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">Add your first client to start tracking projects.</p>
          <button onClick={openNew} className="btn-primary px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {clientStats.map(({ client, totalRevenue, activeTasks, invoiceCount }) => {
            const initials = (client.name || 'C').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={client.id} className="glass rounded-2xl p-5 group hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${client.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {initials}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(client)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="font-bold text-lg text-[var(--text-primary)] tracking-tight">{client.name}</div>
                <div className="text-xs text-[var(--text-muted)] mb-1">{client.company || 'No company'}</div>
                {client.email && <div className="text-xs text-[var(--text-secondary)] mb-4 truncate">{client.email}</div>}

                <div className="pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Revenue</div>
                    <div className="text-sm font-bold text-emerald-500">{formatCurrency(totalRevenue, 'USD', displayCurrency, true)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Active Tasks</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{activeTasks}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 animate-scale-in ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Client Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input w-full px-4 py-2.5 rounded-xl ${errors.name ? 'border-rose-500' : ''}`} placeholder="Acme Corp" />
                {errors.name && <div className="text-xs text-rose-500 mt-1">{errors.name}</div>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Company *</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={`input w-full px-4 py-2.5 rounded-xl ${errors.company ? 'border-rose-500' : ''}`} placeholder="Acme Corporation" />
                {errors.company && <div className="text-xs text-rose-500 mt-1">{errors.company}</div>}
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input w-full px-4 py-2.5 rounded-xl" placeholder="contact@acme.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Avatar Color</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_GRADIENTS.map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, avatarColor: g })} className={`h-9 w-9 rounded-xl bg-gradient-to-br ${g} transition-all cursor-pointer ${form.avatarColor === g ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl" disabled={loading}>Cancel</button>
                <button onClick={handleSave} className="btn-primary flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50" disabled={loading}>
                  {loading ? 'Saving...' : (editing ? 'Save Changes' : 'Add Client')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}