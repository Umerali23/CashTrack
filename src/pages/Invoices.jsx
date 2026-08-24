import { useState, useMemo } from 'react';
import { Plus, Search, FileText, Printer, Trash2, CheckCircle2, Clock, Send } from 'lucide-react';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/currency';

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: FileText },
  'sent': { label: 'Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Send },
  'paid': { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  'overdue': { label: 'Overdue', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: Clock },
};

const EMPTY_FORM = { invoiceNumber: '', clientId: '', items: [{ description: '', amount: '' }], status: 'draft', dueDate: new Date().toISOString().slice(0, 10), currency: 'USD' };

export default function Invoices({ ctx, toast, user }) {
  const { data, toDisplay, addInvoice, updateInvoice, deleteInvoice } = ctx;
  const clients = data?.clients || [];
  const invoices = data?.invoices || [];

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewInv, setPreviewInv] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const visibleInvoices = useMemo(() => {
    return invoices
      .filter(inv => filterStatus === 'all' || inv.status === filterStatus)
      .filter(inv => search.trim() === '' || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  }, [invoices, filterStatus, search]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}` });
    setModalOpen(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({ invoiceNumber: inv.invoiceNumber, clientId: inv.clientId || '', items: inv.items, status: inv.status, dueDate: inv.dueDate, currency: inv.currency });
    setModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addItemRow = () => setForm({ ...form, items: [...form.items, { description: '', amount: '' }] });
  const removeItemRow = (index) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const calculateTotal = (items) => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSave = () => {
    if (!form.invoiceNumber.trim()) return toast('Invoice number is required', 'error');
    const validItems = form.items.filter(i => i.description.trim() && Number(i.amount) > 0);
    if (validItems.length === 0) return toast('Add at least one valid item', 'error');

    const payload = { 
      ...form, 
      clientId: form.clientId || null, 
      items: validItems,
      total: calculateTotal(validItems)
    };
    
    if (editing) {
      updateInvoice(editing.id, payload);
      toast('Invoice updated', 'success');
    } else {
      addInvoice(payload);
      toast('Invoice created', 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (inv) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    deleteInvoice(inv.id);
    toast('Invoice deleted', 'info');
  };

  const handlePrint = () => {
    setPreviewInv(null); // Close modal first to trigger print cleanly
    setTimeout(() => window.print(), 100);
  };

  const stats = useMemo(() => ({
    total: visibleInvoices.length,
    paid: visibleInvoices.filter(i => i.status === 'paid').length,
    sent: visibleInvoices.filter(i => i.status === 'sent').length,
    draft: visibleInvoices.filter(i => i.status === 'draft').length,
  }), [visibleInvoices]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="text-ink-400 text-sm mt-1">Bill your clients and track payments</p>
        </div>
        <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
          <Plus className="h-4 w-4" strokeWidth={2.5} /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4"><div className="text-[10px] uppercase tracking-wider text-ink-400">Total</div><div className="text-xl font-bold mt-1">{stats.total}</div></div>
        <div className="glass rounded-xl p-4"><div className="text-[10px] uppercase tracking-wider text-ink-400">Paid</div><div className="text-xl font-bold text-emerald-400 mt-1">{stats.paid}</div></div>
        <div className="glass rounded-xl p-4"><div className="text-[10px] uppercase tracking-wider text-ink-400">Sent</div><div className="text-xl font-bold text-blue-400 mt-1">{stats.sent}</div></div>
        <div className="glass rounded-xl p-4"><div className="text-[10px] uppercase tracking-wider text-ink-400">Drafts</div><div className="text-xl font-bold text-zinc-400 mt-1">{stats.draft}</div></div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" placeholder="Search invoice number..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {visibleInvoices.length === 0 ? (
          <EmptyState title="No invoices found" description="Create your first invoice to bill a client." action={<button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> New Invoice</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 border-b border-ink-600/60">
                  <th className="px-5 py-3 font-semibold">Invoice #</th>
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Issue Date</th>
                  <th className="px-5 py-3 font-semibold">Due Date</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((inv) => {
                  const client = clients.find(c => c.id === inv.clientId);
                  const StatusIcon = STATUS_CONFIG[inv.status]?.icon || FileText;
                  return (
                    <tr key={inv.id} className="border-b border-ink-600/40 last:border-0 hover:bg-ink-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-ink-100">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 text-ink-300">{client?.name || <span className="text-ink-500">—</span>}</td>
                      <td className="px-5 py-3.5 text-ink-300 tabular-nums">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-ink-300 tabular-nums">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-right font-bold tabular-nums">{formatCurrency(inv.total, inv.currency)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${STATUS_CONFIG[inv.status]?.color || STATUS_CONFIG.draft.color}`}>
                          <StatusIcon className="h-3 w-3" /> {STATUS_CONFIG[inv.status]?.label || 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => setPreviewInv(inv)} className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-300 hover:text-white cursor-pointer" title="View/Print"><Printer className="h-3.5 w-3.5" /></button>
                          <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-300 hover:text-white cursor-pointer"><FileText className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete(inv)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-ink-300 hover:text-rose-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Invoice' : 'New Invoice'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Invoice Number</label>
              <input type="text" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="input" placeholder="INV-001" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Client</label>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="input">
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink-300">Line Items</label>
              <button onClick={addItemRow} className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer">+ Add Item</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="input flex-1" placeholder="Description" />
                  <input type="number" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)} className="input w-32" placeholder="Amount" />
                  {form.items.length > 1 && (
                    <button onClick={() => removeItemRow(index)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-2 text-sm font-bold text-ink-100">Total: {formatCurrency(calculateTotal(form.items), form.currency)}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.01]">{editing ? 'Save Changes' : 'Create Invoice'}</button>
          </div>
        </div>
      </Modal>

      {/* ✅ Print Preview Modal */}
      {previewInv && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewInv(null)} />
          <div className="relative w-full max-w-3xl bg-white text-black rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-200 p-4 flex justify-between items-center z-10">
              <h3 className="font-bold text-lg">Invoice Preview</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="btn-primary bg-black text-white hover:bg-zinc-800"><Printer className="h-4 w-4" /> Print / Save PDF</button>
                <button onClick={() => setPreviewInv(null)} className="btn-ghost text-zinc-600 hover:bg-zinc-100">Close</button>
              </div>
            </div>
            
            {/* Actual Printable Invoice Content */}
            <div className="p-12 print-only-block">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-xl">$</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">CashTrack</h1>
                  <p className="text-zinc-500 text-sm mt-1">Freelance Finance Dashboard</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-zinc-900">{previewInv.invoiceNumber}</h2>
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    previewInv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    previewInv.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-700'
                  }`}>{previewInv.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bill To</div>
                  <div className="text-lg font-bold">{clients.find(c => c.id === previewInv.clientId)?.name || 'Unknown Client'}</div>
                  <div className="text-zinc-500 text-sm">{clients.find(c => c.id === previewInv.clientId)?.company}</div>
                  <div className="text-zinc-500 text-sm">{clients.find(c => c.id === previewInv.clientId)?.email}</div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Issue Date</div>
                    <div className="font-semibold">{new Date(previewInv.issueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Due Date</div>
                    <div className="font-semibold">{new Date(previewInv.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-zinc-200">
                    <th className="text-left py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="text-right py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewInv.items.map((item, i) => (
                    <tr key={i} className="border-b border-zinc-100">
                      <td className="py-4 text-zinc-800">{item.description}</td>
                      <td className="py-4 text-right font-semibold tabular-nums">{formatCurrency(item.amount, previewInv.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between items-center py-3 border-t-2 border-zinc-900">
                    <span className="text-lg font-bold text-zinc-900">Total Due</span>
                    <span className="text-2xl font-bold text-zinc-900 tabular-nums">{formatCurrency(previewInv.total, previewInv.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-zinc-200 text-center text-zinc-400 text-xs">
                <p>Thank you for your business!</p>
                <p className="mt-1">Generated by CashTrack on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}