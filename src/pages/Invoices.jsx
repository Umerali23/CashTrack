import { useState, useMemo } from 'react';
import { Plus, Eye, Trash2, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/currency';

const STATUS_CONFIG = {
  'draft': { label: 'Draft', color: 'bg-ink-500/10 text-ink-400 border-ink-500/20' },
  'sent': { label: 'Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'paid': { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

export default function Invoices({ ctx, toast }) {
  const { user } = useAuth();
  const { data, addInvoice, markInvoiceAsPaid, generateInvoiceFromTasks, deleteInvoice } = ctx;
  const currency = ctx.displayCurrency === 'ORIGINAL' ? 'USD' : ctx.displayCurrency;

  const invoices = data?.invoices || [];
  const clients = data?.clients || [];
  const tasks = data?.tasks || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  
  // ✅ FIXED: Simplified form with single amount field
  const [form, setForm] = useState({ 
    clientId: '', 
    total: '', 
    description: '', 
    issueDate: new Date().toISOString().split('T')[0], 
    dueDate: '', 
    status: 'draft' 
  });

  const visibleInvoices = useMemo(() => {
    if (user?.role === 'admin') return invoices;
    const memberTaskClientIds = tasks.filter(t => t.assigneeId === user.id).map(t => t.clientId);
    return invoices.filter(inv => memberTaskClientIds.includes(inv.clientId));
  }, [invoices, tasks, user]);

  const totalAmount = useMemo(() => visibleInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0), [visibleInvoices]);

  const completedTasksForClient = useMemo(() => {
    if (!selectedClientId) return [];
    return tasks.filter(t => 
      t.clientId === selectedClientId && 
      t.status === 'completed' &&
      !invoices.some(inv => inv.linkedTaskIds?.includes(t.id))
    );
  }, [selectedClientId, tasks, invoices]);

  const openNew = () => {
    setForm({ 
      clientId: '', 
      total: '', 
      description: '', 
      issueDate: new Date().toISOString().split('T')[0], 
      dueDate: '', 
      status: 'draft' 
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientId || !form.total) return toast('Client and Amount are required', 'error');
    
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await addInvoice({
      invoiceNumber, 
      clientId: form.clientId, 
      createdBy: user.id, 
      status: form.status,
      total: parseFloat(form.total), 
      currency: 'USD',
      items: [{ description: form.description || 'Services', amount: parseFloat(form.total) }],
      issueDate: form.issueDate, 
      dueDate: form.dueDate
    });
    
    toast('Invoice created successfully', 'success');
    setModalOpen(false);
  };

  const handleGenerateFromTasks = () => {
    if (!selectedClientId || selectedTaskIds.length === 0) return toast('Select client and tasks', 'error');
    const invoice = generateInvoiceFromTasks(selectedTaskIds, selectedClientId);
    if (invoice) {
      toast(`Invoice ${invoice.invoiceNumber} created`, 'success');
      setGenerateModalOpen(false); 
      setSelectedTaskIds([]); 
      setSelectedClientId('');
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleMarkAsPaid = async (id) => {
    await markInvoiceAsPaid(id);
    toast('Invoice marked as paid', 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    if (deleteInvoice) deleteInvoice(id);
    toast('Invoice deleted', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Invoices</h1>
          <p className="text-ink-400 text-sm mt-1">
            {visibleInvoices.length} invoices • {formatCurrency(totalAmount, currency, true)} total
          </p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setGenerateModalOpen(true)}
              className="btn-primary bg-emerald-500 text-white hover:bg-emerald-600"
            >
              <FileText className="h-4 w-4" /> Generate from Tasks
            </button>
            <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Create Invoice
            </button>
          </div>
        )}
      </div>

      {visibleInvoices.length === 0 ? (
        <EmptyState 
          title="No invoices yet" 
          description="Create your first invoice to get started." 
          action={user?.role === 'admin' ? <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> Create Invoice</button> : null} 
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-900/50 border-b border-ink-600/50">
                <tr>
                  <th className="text-left text-xs font-semibold text-ink-300 uppercase tracking-wider px-6 py-4">Invoice</th>
                  <th className="text-left text-xs font-semibold text-ink-300 uppercase tracking-wider px-6 py-4">Client</th>
                  <th className="text-left text-xs font-semibold text-ink-300 uppercase tracking-wider px-6 py-4">Amount</th>
                  <th className="text-left text-xs font-semibold text-ink-300 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-ink-300 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-600/50">
                {visibleInvoices.map((invoice) => {
                  const client = clients.find(c => c.id === invoice.clientId);
                  const StatusIcon = invoice.status === 'paid' ? CheckCircle : invoice.status === 'sent' ? AlertCircle : Clock;
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-ink-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{client?.name || 'Unknown Client'}</div>
                        <div className="text-xs text-ink-400">{client?.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-emerald-400">
                          {formatCurrency(invoice.total || 0, invoice.currency || 'USD', true)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1.5 ${STATUS_CONFIG[invoice.status]?.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {STATUS_CONFIG[invoice.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewingInvoice(invoice)}
                            className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-400 hover:text-white cursor-pointer"
                            title="View Invoice"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {user?.role === 'admin' && invoice.status !== 'paid' && (
                            <button 
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 cursor-pointer"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {user?.role === 'admin' && (
                            <button 
                              onClick={() => handleDelete(invoice.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer"
                              title="Delete"
                            >
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

      {/* Create Invoice Modal - SIMPLIFIED (Single Amount Field) */}
      {user?.role === 'admin' && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Invoice">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Client *</label>
              <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Total Amount *</label>
              <input 
                type="number" 
                value={form.total} 
                onChange={(e) => setForm({...form, total: e.target.value})} 
                className="input" 
                placeholder="0.00" 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description / Items</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})} 
                className="input h-20 resize-none" 
                placeholder="e.g. Web Development Services" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Issue Date</label>
                <input 
                  type="date" 
                  value={form.issueDate} 
                  onChange={(e) => setForm({...form, issueDate: e.target.value})} 
                  className="input" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Due Date</label>
                <input 
                  type="date" 
                  value={form.dueDate} 
                  onChange={(e) => setForm({...form, dueDate: e.target.value})} 
                  className="input" 
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100">Create Invoice</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generate from Tasks Modal */}
      {user?.role === 'admin' && (
        <Modal open={generateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate Invoice from Completed Tasks" size="lg">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Select Client *</label>
              <select 
                value={selectedClientId} 
                onChange={(e) => { setSelectedClientId(e.target.value); setSelectedTaskIds([]); }}
                className="input"
              >
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {selectedClientId && (
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                  Select Completed Tasks ({selectedTaskIds.length} selected)
                </label>
                {completedTasksForClient.length === 0 ? (
                  <div className="text-center py-8 text-ink-400 text-sm">
                    No completed tasks available for this client
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {completedTasksForClient.map(task => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      return (
                        <div 
                          key={task.id}
                          onClick={() => toggleTaskSelection(task.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-emerald-500/50' 
                              : 'bg-ink-900/40 border-ink-600/50 hover:bg-ink-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-ink-500'}`}>
                                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{task.title}</div>
                                <div className="text-xs text-ink-400">
                                  {formatCurrency(parseFloat(task.compensation) || 0, task.currency || 'USD', true)}
                                </div>
                              </div>
                            </div>
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
                  <span className="text-sm font-semibold text-emerald-400">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(
                      completedTasksForClient
                        .filter(t => selectedTaskIds.includes(t.id))
                        .reduce((sum, t) => sum + (parseFloat(t.compensation) || 0), 0),
                      'USD',
                      true
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setGenerateModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
              <button 
                onClick={handleGenerateFromTasks}
                disabled={selectedTaskIds.length === 0}
                className="btn-primary flex-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <Modal open={!!viewingInvoice} onClose={() => setViewingInvoice(null)} title="Invoice Details" size="lg">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{viewingInvoice.invoiceNumber}</h3>
                <p className="text-sm text-ink-400">
                  {viewingInvoice.issueDate ? new Date(viewingInvoice.issueDate).toLocaleDateString() : ''}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${STATUS_CONFIG[viewingInvoice.status]?.color}`}>
                {STATUS_CONFIG[viewingInvoice.status]?.label}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-ink-900/50">
              <div className="text-xs text-ink-400 mb-1">Bill To:</div>
              <div className="font-semibold">
                {clients.find(c => c.id === viewingInvoice.clientId)?.name || 'Unknown Client'}
              </div>
              <div className="text-sm text-ink-400">
                {clients.find(c => c.id === viewingInvoice.clientId)?.company}
              </div>
            </div>

            <div className="space-y-2">
              {viewingInvoice.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-ink-600/50">
                  <div>
                    <div className="text-sm font-medium">{item.description || 'Item'}</div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(item.amount || 0, 'USD', true)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-ink-600/50 flex justify-between items-center">
              <span className="text-sm font-semibold text-ink-300">Total</span>
              <span className="text-2xl font-bold text-emerald-400">
                {formatCurrency(viewingInvoice.total || 0, viewingInvoice.currency || 'USD', true)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}