import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, User, Briefcase, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

export default function Transactions({ ctx, user }) {
  const { data, addManualIncome, addExpense, displayCurrency } = ctx;
  const transactions = data?.transactions || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  
  const [incomeForm, setIncomeForm] = useState({ 
    amount: '', description: '', clientId: '', assigneeId: '', 
    category: 'Freelance Work', date: new Date().toISOString().split('T')[0], currency: 'USD'
  });
  
  const [expenseForm, setExpenseForm] = useState({ 
    amount: '', description: '', category: 'Software Subscription', 
    date: new Date().toISOString().split('T')[0], currency: 'USD'
  });

  const isDark = ctx.theme === 'dark' || ctx.theme === 'midnight';

  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0), [incomeTransactions]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0), [expenseTransactions]);

  const handleAddIncome = async () => {
    if (!incomeForm.amount) return alert('Amount is required');
    await addManualIncome(incomeForm);
    setIncomeModalOpen(false);
    setIncomeForm({ amount: '', description: '', clientId: '', assigneeId: '', category: 'Freelance Work', date: new Date().toISOString().split('T')[0], currency: 'USD' });
  };

  const handleAddExpense = async () => {
    if (!expenseForm.amount) return alert('Amount is required');
    await addExpense(expenseForm);
    setExpenseModalOpen(false);
    setExpenseForm({ amount: '', description: '', category: 'Software Subscription', date: new Date().toISOString().split('T')[0], currency: 'USD' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">Transactions</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Track all income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIncomeModalOpen(true)} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Income
          </button>
          <button onClick={() => setExpenseModalOpen(true)} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-rose-500 hover:bg-rose-600">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-500" /></div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalIncome, 'USD', displayCurrency, true)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-rose-500" /></div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalExpenses, 'USD', displayCurrency, true)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-violet-500" /></div>
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">Net Profit</span>
          </div>
          <div className="text-2xl font-bold text-violet-500">{formatCurrency(totalIncome - totalExpenses, 'USD', displayCurrency, true)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Income</h3>
          {incomeTransactions.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No income yet</div>
          ) : (
            <div className="space-y-3">
              {incomeTransactions.map((tx) => {
                const client = clients.find(c => c.id === tx.clientId);
                const assignee = profiles.find(p => p.id === tx.assigneeId);
                return (
                  <div key={tx.id} className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{tx.description || tx.category}</div>
                      <div className="text-sm font-bold text-emerald-500">+{formatCurrency(tx.amount, tx.currency || 'USD', displayCurrency, true)}</div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                      {client && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{client.name}</span>}
                      {assignee && <span className="flex items-center gap-1"><User className="h-3 w-3" />{assignee.name}</span>}
                      {tx.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(tx.date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-rose-500" /> Expenses</h3>
          {expenseTransactions.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">No expenses yet</div>
          ) : (
            <div className="space-y-3">
              {expenseTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{tx.description || tx.category}</div>
                    <div className="text-sm font-bold text-rose-500">-{formatCurrency(tx.amount, tx.currency || 'USD', displayCurrency, true)}</div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)]">{tx.category}</span>
                    {tx.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(tx.date).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Add Income Modal with proper centering */}
      {incomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add Income</h2>
              <button onClick={() => setIncomeModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Amount *</label>
                  <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Currency</label>
                  <select value={incomeForm.currency} onChange={(e) => setIncomeForm({...incomeForm, currency: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="USD">USD ($)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Description</label>
                <input type="text" value={incomeForm.description} onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="e.g. Minor logo fix" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Category</label>
                <select value={incomeForm.category} onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                  <option value="Freelance Work">Freelance Work</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Client</label>
                  <select value={incomeForm.clientId} onChange={(e) => setIncomeForm({...incomeForm, clientId: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Assignee</label>
                  <select value={incomeForm.assigneeId} onChange={(e) => setIncomeForm({...incomeForm, assigneeId: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="">Select Member</option>
                    {profiles.filter(p => p.role !== 'admin').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Date</label>
                <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-2 p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-b-2xl">
              <button onClick={() => setIncomeModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleAddIncome} className="btn-primary flex-1 px-4 py-2.5 rounded-xl">Add Income</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Add Expense Modal with proper centering */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Add Expense</h2>
              <button onClick={() => setExpenseModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Amount *</label>
                  <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Currency</label>
                  <select value={expenseForm.currency} onChange={(e) => setExpenseForm({...expenseForm, currency: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="USD">USD ($)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Description</label>
                <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="e.g. Payoneer fee" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Category</label>
                <select value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                  <option value="Software Subscription">Software Subscription</option>
                  <option value="Payment Gateway Fee">Payment Gateway Fee</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Hosting">Hosting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Date</label>
                <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" />
              </div>
            </div>
            <div className="flex gap-2 p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-b-2xl">
              <button onClick={() => setExpenseModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleAddExpense} className="btn-primary flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600">Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}