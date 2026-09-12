import { useState, useMemo } from 'react';
import { Plus, Eye, Trash2, CheckCircle, Clock, AlertCircle, FileText, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: Clock },
  'sent': { label: 'Sent', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle },
  'paid': { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
};

export default function Invoices({ ctx, user }) {
  const { data, addInvoice, markInvoiceAsPaid, deleteInvoice, generateInvoiceFromTasks, displayCurrency } = ctx;
  const invoices = data?.invoices || [];
  const clients = data?.clients || [];
  const tasks = data?.tasks || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [form, setForm] = useState({ 
    clientId: '', total: '', description: '', 
    issueDate: new Date().toISOString().split('T')[0], 
    dueDate: '', status: 'draft' 
  });

  const isDark = ctx.theme === 'dark' || ctx.theme === 'midnight';

  const visibleInvoices = useMemo(() => {
    if (user?.role === 'admin') return invoices;
    const memberTaskClientIds = tasks.filter(t => t.assigneeId === user.id).map(t => t.clientId);
    return invoices.filter(inv => memberTaskClientIds.includes(inv.clientId));
  }, [invoices, tasks, user]);

  const totalAmount = useMemo(() => 
    visibleInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0), 
    [visibleInvoices]
  );

  const completedTasksForClient = useMemo(() => {
    if (!selectedClientId) return [];
    return tasks.filter(t => 
      t.clientId === selectedClientId && 
      t.status === 'completed' &&
      !invoices.some(inv => inv.linkedTaskIds?.includes(t.id))
    );
  }, [selectedClientId, tasks, invoices]);

  const openNew = () => {
    setForm({ clientId: '', total: '', description: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'draft' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.total) return alert('Client and Amount required');
    await addInvoice({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      clientId: form.clientId, createdBy: user.id, status: form.status,
      total: parseFloat(form.total), currency: 'USD',
      items: [{ description: form.description || 'Services', amount: parseFloat(form.total) }],
      issueDate: form.issueDate, dueDate: form.dueDate
    });
    setModalOpen(false);
  };

  const handleGenerateFromTasks = async () => {
    if (!selectedClientId || selectedTaskIds.length === 0) return alert('Select client and tasks');
    await generateInvoiceFromTasks(selectedTaskIds, selectedClientId);
    setGenerateModalOpen(false);
    setSelectedTaskIds([]);
    setSelectedClientId('');
  };

  const handleMarkAsPaid = async (id) => {
    if (window.confirm('Mark this invoice as paid?')) {
      await markInvoiceAsPaid(id);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice?')) await deleteInvoice(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">Invoices</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {visibleInvoices.length} invoices • {formatCurrency(totalAmount, 'USD', displayCurrency, true)} total
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <button onClick={() => setGenerateModalOpen(true)} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Generate from Tasks
            </button>
            <button onClick={openNew} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Invoice
            </button>
          </div>
        )}
      </div>

      {visibleInvoices.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No invoices yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">Create your first invoice to get started.</p>
          {user?.role === 'admin' && (
            <button onClick={openNew} className="btn-primary px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-input)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Invoice</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Client</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Amount</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {visibleInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  const StatusIcon = STATUS_CONFIG[invoice.status]?.icon || Clock;
                  return (
                    <tr key={invoice.id} className="hover:bg-[var(--bg-input)]/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-sm text-[var(--text-primary)]">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[var(--text-primary)]">{client?.name || 'Unknown'}</div>
                        <div className="text-xs text-[var(--text-muted)]">{client?.company}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-500">
                        {formatCurrency(invoice.total || 0, invoice.currency || 'USD', displayCurrency, true)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${STATUS_CONFIG[invoice.status]?.color}`}>
                          <StatusIcon className="h-3 w-3" />{STATUS_CONFIG[invoice.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setViewingInvoice(invoice)} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors" title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {user?.role === 'admin' && invoice.status !== 'paid' && (
                            <button onClick={() => handleMarkAsPaid(invoice.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Mark Paid">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDelete(invoice.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Create Invoice Modal with proper centering */}
      {user?.role === 'admin' && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Create Invoice</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Client *</label>
                <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Total Amount *</label>
                <input type="number" value={form.total} onChange={(e) => setForm({...form, total: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl h-20 resize-none" placeholder="Services rendered..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({...form, issueDate: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 px-4 py-2.5 rounded-xl">Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Generate from Tasks Modal */}
      {user?.role === 'admin' && generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Generate from Completed Tasks</h2>
              <button onClick={() => setGenerateModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Select Client *</label>
                <select value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelectedTaskIds([]); }} className="input w-full px-4 py-2.5 rounded-xl">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedClientId && (
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">
                    Select Tasks ({selectedTaskIds.length} selected)
                  </label>
                  {completedTasksForClient.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-muted)] text-sm">No completed tasks for this client</div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {completedTasksForClient.map(task => {
                        const isSelected = selectedTaskIds.includes(task.id);
                        return (
                          <div key={task.id} onClick={() => setSelectedTaskIds(prev => prev.includes(task.id) ? prev.filter(id => id !== task.id) : [...prev, task.id])}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-[var(--accent-color)]'}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-[var(--text-primary)]">{task.title}</span>
                              <span className="text-sm text-emerald-500">{formatCurrency(task.compensation || 0, task.currency || 'USD', displayCurrency, true)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {selectedTaskIds.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-emerald-500">Total</span>
                    <span className="text-2xl font-bold text-emerald-500">
                      {formatCurrency(completedTasksForClient.filter(t => selectedTaskIds.includes(t.id)).reduce((sum, t) => sum + (t.compensation || 0), 0), 'USD', displayCurrency, true)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-b-2xl">
              <button onClick={() => setGenerateModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleGenerateFromTasks} disabled={selectedTaskIds.length === 0} className="btn-primary flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50">Generate Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{viewingInvoice.invoiceNumber}</h2>
                <p className="text-xs text-[var(--text-muted)]">{viewingInvoice.issueDate ? new Date(viewingInvoice.issueDate).toLocaleDateString() : ''}</p>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div className="text-xs text-[var(--text-muted)] mb-1">Bill To:</div>
                <div className="font-semibold text-[var(--text-primary)]">{clients.find(c => c.id === viewingInvoice.clientId)?.name || 'Unknown'}</div>
                <div className="text-sm text-[var(--text-muted)]">{clients.find(c => c.id === viewingInvoice.clientId)?.company}</div>
              </div>
              <div className="space-y-2">
                {viewingInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{item.description || 'Item'}</div>
                    <div className="font-semibold text-[var(--text-primary)]">{formatCurrency(item.amount || 0, 'USD', displayCurrency, true)}</div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                <span className="text-sm font-semibold text-[var(--text-secondary)]">Total</span>
                <span className="text-2xl font-bold text-emerald-500">{formatCurrency(viewingInvoice.total || 0, viewingInvoice.currency || 'USD', displayCurrency, true)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}