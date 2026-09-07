import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/currency';

export default function Transactions({ ctx, toast }) {
  const { user } = useAuth();
  const { data, addManualIncome, addExpense, toDisplay, displayCurrency } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'USD' : displayCurrency;
  
  const transactions = data?.transactions || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];

  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  
  const [incomeForm, setIncomeForm] = useState({ 
    amount: '', 
    description: '', 
    clientId: '', 
    assigneeId: '', 
    category: 'Freelance Work', 
    date: new Date().toISOString().split('T')[0], 
    currency: 'USD' 
  });
  
  const [expenseForm, setExpenseForm] = useState({ 
    amount: '', 
    description: '', 
    category: 'Software Subscription', 
    date: new Date().toISOString().split('T')[0], 
    currency: 'USD' 
  });

  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions]);

  const totalIncome = useMemo(() => incomeTransactions.reduce((sum, t) => sum + toDisplay(t.amount, t.currency), 0), [incomeTransactions, toDisplay]);
  const totalExpenses = useMemo(() => expenseTransactions.reduce((sum, t) => sum + toDisplay(t.amount, t.currency), 0), [expenseTransactions, toDisplay]);

  const handleAddIncome = () => {
    if (!incomeForm.amount) return toast('Amount is required', 'error');
    addManualIncome(incomeForm);
    toast('Income added successfully', 'success');
    setIncomeModalOpen(false);
    setIncomeForm({ amount: '', description: '', clientId: '', assigneeId: '', category: 'Freelance Work', date: new Date().toISOString().split('T')[0], currency: 'USD' });
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount) return toast('Amount is required', 'error');
    addExpense(expenseForm);
    toast('Expense added successfully', 'success');
    setExpenseModalOpen(false);
    setExpenseForm({ amount: '', description: '', category: 'Software Subscription', date: new Date().toISOString().split('T')[0], currency: 'USD' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="text-ink-400 text-sm mt-1">Track all income and expenses</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIncomeModalOpen(true)} className="btn-primary bg-emerald-500 text-white hover:bg-emerald-600">
            <Plus className="h-4 w-4" /> Add Income
          </button>
          <button onClick={() => setExpenseModalOpen(true)} className="btn-primary bg-rose-500 text-white hover:bg-rose-600">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
            <span className="text-xs font-semibold text-ink-300 uppercase">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome, currency, true)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-rose-400" /></div>
            <span className="text-xs font-semibold text-ink-300 uppercase">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-rose-400">{formatCurrency(totalExpenses, currency, true)}</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-violet-400" /></div>
            <span className="text-xs font-semibold text-ink-300 uppercase">Net Profit</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">{formatCurrency(totalIncome - totalExpenses, currency, true)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Section */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" /> Income
          </h3>
          {incomeTransactions.length === 0 ? (
            <EmptyState title="No income yet" description="Add your first income transaction." />
          ) : (
            <div className="space-y-3">
              {incomeTransactions.map((tx) => {
                const client = clients.find(c => c.id === tx.clientId);
                const assignee = profiles.find(p => p.id === tx.assigneeId);
                return (
                  <div key={tx.id} className="p-4 rounded-xl bg-ink-900/40 border border-ink-600/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm">{tx.description || tx.category}</div>
                      <div className="text-sm font-bold text-emerald-400">+{formatCurrency(tx.amount, tx.currency, true)}</div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-ink-400">
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

        {/* Expense Section */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-rose-400" /> Expenses
          </h3>
          {expenseTransactions.length === 0 ? (
            <EmptyState title="No expenses yet" description="Add your first expense." />
          ) : (
            <div className="space-y-3">
              {expenseTransactions.map((tx) => (
                <div key={tx.id} className="p-4 rounded-xl bg-ink-900/40 border border-ink-600/50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm">{tx.description || tx.category}</div>
                    <div className="text-sm font-bold text-rose-400">-{formatCurrency(tx.amount, tx.currency, true)}</div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-ink-400">
                    <span className="px-2 py-0.5 rounded bg-ink-700/50">{tx.category}</span>
                    {tx.date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(tx.date).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal open={incomeModalOpen} onClose={() => setIncomeModalOpen(false)} title="Add Income">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Amount *</label>
            <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})} className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description</label>
            <input type="text" value={incomeForm.description} onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})} className="input" placeholder="e.g. Minor logo fix" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Category</label>
            <select value={incomeForm.category} onChange={(e) => setIncomeForm({...incomeForm, category: e.target.value})} className="input">
              <option value="Freelance Work">Freelance Work</option>
              <option value="Consulting">Consulting</option>
              <option value="Bonus">Bonus</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Client (Optional)</label>
              <select value={incomeForm.clientId} onChange={(e) => setIncomeForm({...incomeForm, clientId: e.target.value})} className="input">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Assignee (Optional)</label>
              <select value={incomeForm.assigneeId} onChange={(e) => setIncomeForm({...incomeForm, assigneeId: e.target.value})} className="input">
                <option value="">Select Member</option>
                {profiles.filter(p => p.role !== 'admin').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Date</label>
            <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})} className="input" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setIncomeModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
            <button onClick={handleAddIncome} className="btn-primary flex-1 bg-emerald-500 text-white hover:bg-emerald-600">Add Income</button>
          </div>
        </div>
      </Modal>

      {/* Add Expense Modal */}
      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Amount *</label>
            <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description</label>
            <input type="text" value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} className="input" placeholder="e.g. Payoneer fee" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Category</label>
            <select value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})} className="input">
              <option value="Software Subscription">Software Subscription</option>
              <option value="Payment Gateway Fee">Payment Gateway Fee</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Marketing">Marketing</option>
              <option value="Hosting">Hosting</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Date</label>
            <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})} className="input" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setExpenseModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
            <button onClick={handleAddExpense} className="btn-primary flex-1 bg-rose-500 text-white hover:bg-rose-600">Add Expense</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}