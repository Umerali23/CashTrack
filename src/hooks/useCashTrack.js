import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { convertAmount } from '../lib/currency';

export const useCashTrack = (user) => {
  const [data, setData] = useState({ 
    clients: [], 
    profiles: [], 
    tasks: [], 
    invoices: [], 
    transactions: [] 
  });
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('PKR');
  const [theme, setTheme] = useState(() => localStorage.getItem('cashtrack_theme') || 'dark');

  // Fetch all data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [c, p, t, i, tr] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('transactions').select('*')
      ]);
      
      setData({ 
        clients: c.data || [], 
        profiles: p.data || [], 
        tasks: t.data || [], 
        invoices: i.data || [], 
        transactions: tr.data || [] 
      });
      setLoading(false);
    };
    
    fetchAll();
  }, []);

  useEffect(() => { 
    document.documentElement.className = theme; 
    localStorage.setItem('cashtrack_theme', theme); 
  }, [theme]);

  // --- CRUD ACTIONS ---

  // Team Members
  const updateTeamMember = async (id, patch) => {
    await supabase.from('profiles').update({ 
      name: patch.name, 
      role: patch.role, 
      avatar_color: patch.avatarColor 
    }).eq('id', id);
    
    setData(prev => ({ 
      ...prev, 
      profiles: prev.profiles.map(m => m.id === id ? {...m, ...patch} : m) 
    }));
  };

  const deleteTeamMember = async (id) => {
    // Note: Deleting from auth.users requires admin privileges. 
    // For now, we just delete the profile. 
    // In a real app, you'd use a Supabase Edge Function to delete the auth user.
    await supabase.from('profiles').delete().eq('id', id);
    setData(prev => ({ ...prev, profiles: prev.profiles.filter(m => m.id !== id) }));
  };

  const addTeamMember = async (m) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: m.email, 
      password: m.password,
      options: { 
        data: { 
          name: m.name, 
          role: m.role || 'member', 
          avatar_color: m.avatarColor 
        } 
      }
    });
    return { success: !error, error: error?.message, creds: { email: m.email, password: m.password } };
  };

  // Tasks
  const addTask = async (t) => {
    const { data } = await supabase.from('tasks').insert([{ 
      title: t.title, description: t.description, status: t.status, 
      due_date: t.dueDate, compensation: t.compensation, currency: t.currency, 
      client_id: t.clientId, assignee_id: t.assigneeId 
    }]).select().single();
    
    if (data) setData(prev => ({ ...prev, tasks: [{...data, created_at: new Date().toISOString()}, ...prev.tasks] }));
  };

  const updateTask = async (id, patch) => {
    await supabase.from('tasks').update({ 
      status: patch.status, title: patch.title, description: patch.description, 
      due_date: patch.dueDate, compensation: patch.compensation, currency: patch.currency, 
      client_id: patch.clientId, assignee_id: patch.assigneeId 
    }).eq('id', id);
    
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? {...t, ...patch} : t) }));
  };

  // Invoices
  const addInvoice = async (inv) => {
    const { data } = await supabase.from('invoices').insert([{ 
      invoice_number: inv.invoiceNumber, client_id: inv.clientId, created_by: inv.createdBy, 
      status: inv.status, total: inv.total, currency: inv.currency, items: inv.items, 
      issue_date: inv.issueDate, due_date: inv.dueDate 
    }]).select().single();
    
    if (data) setData(prev => ({ ...prev, invoices: [data, ...prev.invoices] }));
  };

  const updateInvoice = async (id, patch) => {
    await supabase.from('invoices').update({ 
      status: patch.status, total: patch.total, items: patch.items, due_date: patch.dueDate 
    }).eq('id', id);
    
    setData(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === id ? {...i, ...patch} : i) }));
  };

  const markInvoiceAsPaid = async (invoiceId) => {
    const { data: result } = await supabase.rpc('mark_invoice_as_paid', { p_invoice_id: invoiceId });
    if (result?.success) {
      const { data: newInv } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
      const { data: newTx } = await supabase.from('transactions').select('*').eq('linked_invoice_id', invoiceId).single();
      setData(prev => ({ 
        ...prev, 
        invoices: prev.invoices.map(i => i.id === invoiceId ? newInv : i),
        transactions: newTx ? [newTx, ...prev.transactions] : prev.transactions
      }));
    }
  };

  // --- DATA NORMALIZATION ---
  const normalizeData = useMemo(() => ({
    tasks: data.tasks.map(t => ({ ...t, clientId: t.client_id, assigneeId: t.assignee_id, dueDate: t.due_date, createdAt: t.created_at })),
    invoices: data.invoices.map(i => ({ ...i, clientId: i.client_id, createdBy: i.created_by, issueDate: i.issue_date, dueDate: i.due_date })),
    transactions: data.transactions.map(t => ({ ...t, clientId: t.client_id, assigneeId: t.assignee_id, isAutoGenerated: t.is_auto_generated, linkedInvoiceId: t.linked_invoice_id })),
    clients: data.clients, 
    profiles: data.profiles
  }), [data]);

  // --- AGGREGATES CALCULATION ---
  const aggregates = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    let income = 0, expense = 0, pending = 0, prevIncome = 0, prevExpense = 0;

    normalizeData.transactions.forEach((t) => {
      const d = new Date(t.date);
      const displayAmt = convertAmount(t.amount, t.currency, displayCurrency);
      
      if (d >= thisMonthStart) {
        if (t.type === 'income') { 
          income += displayAmt; 
          if (t.status === 'pending') pending += displayAmt; 
        } else {
          expense += displayAmt;
        }
      } else if (d >= lastMonthStart && d < thisMonthStart) {
        if (t.type === 'income') prevIncome += displayAmt;
        else prevExpense += displayAmt;
      }
    });

    return {
      income, expense, net: income - expense, pending,
      incomeChange: prevIncome ? ((income - prevIncome) / prevIncome) * 100 : 0,
      expenseChange: prevExpense ? ((expense - prevExpense) / prevExpense) * 100 : 0,
    };
  }, [normalizeData.transactions, displayCurrency]);

  const monthlySeries = useMemo(() => {
    const months = []; 
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      let inc = 0, exp = 0;
      normalizeData.transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d >= start && d < end) {
          const amt = convertAmount(t.amount, t.currency, displayCurrency);
          if (t.type === 'income') inc += amt; else exp += amt;
        }
      });
      months.push({ label: start.toLocaleString('en-US', { month: 'short' }), year: start.getFullYear(), income: inc, expense: exp, profit: inc - exp });
    }
    return months;
  }, [normalizeData.transactions, displayCurrency]);

  const topClients = useMemo(() => {
    const map = {};
    normalizeData.transactions.forEach((t) => {
      if (t.type !== 'income' || !t.clientId) return;
      map[t.clientId] = (map[t.clientId] || 0) + convertAmount(t.amount, t.currency, displayCurrency);
    });
    return Object.entries(map).map(([id, total]) => ({ client: normalizeData.clients.find((c) => c.id === id), total })).filter((x) => x.client).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [normalizeData.transactions, normalizeData.clients, displayCurrency]);

  const earningsByMember = useMemo(() => {
    if (user?.role !== 'admin') return []; 
    const map = {};
    normalizeData.transactions.forEach((t) => {
      if (t.type !== 'income' || !t.assigneeId) return;
      map[t.assigneeId] = (map[t.assigneeId] || 0) + convertAmount(t.amount, t.currency, displayCurrency);
    });
    return Object.entries(map).map(([id, total]) => ({ member: normalizeData.profiles.find((m) => m.id === id), total })).filter((x) => x.member).sort((a, b) => b.total - a.total);
  }, [normalizeData.transactions, normalizeData.profiles, displayCurrency, user]);

  const toDisplay = useCallback((amount, originalCurrency) => convertAmount(amount, originalCurrency, displayCurrency), [displayCurrency]);

  return { 
    data: normalizeData, 
    setData, 
    loading, 
    displayCurrency, setDisplayCurrency, 
    theme, setTheme,
    tasks: normalizeData.tasks, 
    invoices: normalizeData.invoices, 
    transactions: normalizeData.transactions,
    addTask, updateTask, 
    addInvoice, updateInvoice, markInvoiceAsPaid, 
    addTeamMember, updateTeamMember, deleteTeamMember, // <-- Added these!
    toDisplay, aggregates, monthlySeries, topClients, earningsByMember
  };
};