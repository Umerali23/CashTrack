import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { convertAmount } from '../lib/currency';

export const useCashTrack = (user) => {
  // 1. Initialize empty state (Data will be fetched from Supabase)
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

  // 2. Fetch all data from Supabase on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all tables in parallel
        const [
          { data: clients },
          { data: profiles },
          { data: tasks },
          { data: invoices },
          { data: transactions }
        ] = await Promise.all([
          supabase.from('clients').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('invoices').select('*'),
          supabase.from('transactions').select('*')
        ]);

        setData({
          clients: clients || [],
          profiles: profiles || [],
          tasks: tasks || [],
          invoices: invoices || [],
          transactions: transactions || []
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Theme sync
  useEffect(() => {
    document.body.className = theme;
    document.documentElement.className = theme;
    localStorage.setItem('cashtrack_theme', theme);
  }, [theme]);

    // --- 3. ASYNC CRUD FUNCTIONS ---

  // CLIENTS
  const addClient = async (c) => {
    // Map camelCase to snake_case for the database
    const dbClient = { 
      name: c.name, 
      company: c.company, 
      email: c.email, 
      avatar_color: c.avatarColor 
    };
    const { data: newClient, error } = await supabase.from('clients').insert([dbClient]).select().single();
    if (!error) setData(prev => ({ ...prev, clients: [newClient, ...prev.clients] }));
  };
  
  const updateClient = async (id, patch) => {
    const dbPatch = { 
      name: patch.name, 
      company: patch.company, 
      email: patch.email, 
      avatar_color: patch.avatarColor 
    };
    await supabase.from('clients').update(dbPatch).eq('id', id);
    setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === id ? { ...c, ...patch } : c) }));
  };

  const deleteClient = async (id) => {
    await supabase.from('clients').delete().eq('id', id);
    setData(prev => ({ 
      ...prev, 
      clients: prev.clients.filter(c => c.id !== id),
      transactions: prev.transactions.map(t => t.client_id === id ? { ...t, client_id: null } : t)
    }));
  };

  // PROFILES (TEAM)
  const addTeamMember = async (m) => {
    const dbMember = { 
      name: m.name, 
      role: m.role, 
      email: m.email, 
      password: m.password, 
      avatar_color: m.avatarColor 
    };
    const { data: newMember, error } = await supabase.from('profiles').insert([dbMember]).select().single();
    if (!error) setData(prev => ({ ...prev, profiles: [newMember, ...prev.profiles] }));
  };
  
  const updateTeamMember = async (id, patch) => {
    const dbPatch = { 
      name: patch.name, 
      role: patch.role, 
      email: patch.email, 
      avatar_color: patch.avatarColor 
    };
    await supabase.from('profiles').update(dbPatch).eq('id', id);
    setData(prev => ({ ...prev, profiles: prev.profiles.map(m => m.id === id ? { ...m, ...patch } : m) }));
  };

  const deleteTeamMember = async (id) => {
    await supabase.from('profiles').delete().eq('id', id);
    setData(prev => ({ 
      ...prev, 
      profiles: prev.profiles.filter(m => m.id !== id),
      tasks: prev.tasks.map(t => t.assignee_id === id ? { ...t, assignee_id: null } : t)
    }));
  };

  // TASKS
  const addTask = async (t) => {
    // Map camelCase to snake_case for DB
    const dbTask = {
      title: t.title, description: t.description, status: t.status,
      due_date: t.dueDate, compensation: t.compensation, currency: t.currency,
      client_id: t.clientId, assignee_id: t.assigneeId
    };
    const { data: newTask, error } = await supabase.from('tasks').insert([dbTask]).select().single();
    if (!error) {
      // Add created_at manually for UI sorting
      const uiTask = { ...newTask, created_at: new Date().toISOString() };
      setData(prev => ({ ...prev, tasks: [uiTask, ...prev.tasks] }));
    }
  };
  const updateTask = async (id, patch) => {
    const dbPatch = {
      title: patch.title, description: patch.description, status: patch.status,
      due_date: patch.dueDate, compensation: patch.compensation, currency: patch.currency,
      client_id: patch.clientId, assignee_id: patch.assigneeId
    };
    await supabase.from('tasks').update(dbPatch).eq('id', id);
    setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, ...patch } : t) }));
  };
  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  // INVOICES
  const addInvoice = async (inv) => {
    const dbInv = {
      invoice_number: inv.invoiceNumber, client_id: inv.clientId, created_by: inv.createdBy,
      status: inv.status, total: inv.total, currency: inv.currency, items: inv.items,
      issue_date: inv.issueDate, due_date: inv.dueDate
    };
    const { data: newInv, error } = await supabase.from('invoices').insert([dbInv]).select().single();
    if (!error) setData(prev => ({ ...prev, invoices: [newInv, ...prev.invoices] }));
  };
  const updateInvoice = async (id, patch) => {
    const dbPatch = {
      invoice_number: patch.invoiceNumber, client_id: patch.clientId, status: patch.status,
      total: patch.total, currency: patch.currency, items: patch.items, due_date: patch.dueDate
    };
    await supabase.from('invoices').update(dbPatch).eq('id', id);
    setData(prev => ({ ...prev, invoices: prev.invoices.map(i => i.id === id ? { ...i, ...patch } : i) }));
  };
  const deleteInvoice = async (id) => {
    await supabase.from('invoices').delete().eq('id', id);
    setData(prev => ({ ...prev, invoices: prev.invoices.filter(i => i.id !== id) }));
  };

  // TRANSACTIONS
  const addTransaction = async (t) => {
    const dbTx = {
      type: t.type, amount: t.amount, currency: t.currency, client_id: t.clientId,
      assignee_id: t.assigneeId, category: t.category, date: t.date, description: t.description,
      status: t.status, is_auto_generated: t.isAutoGenerated, linked_invoice_id: t.linkedInvoiceId
    };
    const { data: newTx, error } = await supabase.from('transactions').insert([dbTx]).select().single();
    if (!error) setData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  };
  const updateTransaction = async (id, patch) => {
    // For simplicity in v1, we just update local state for transactions
    setData(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === id ? { ...t, ...patch } : t) }));
  };
  const deleteTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  };

  // Automated Pipeline Functions
  const markInvoiceAsPaid = async (invoiceId) => {
    const inv = data.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.status === 'paid') return;

    const autoTx = {
      type: 'income', amount: inv.total, currency: inv.currency,
      client_id: inv.client_id, assignee_id: inv.created_by,
      category: 'Client Payment', date: new Date().toISOString().slice(0, 10),
      description: `Payment for Invoice ${inv.invoice_number}`,
      status: 'paid', is_auto_generated: true, linked_invoice_id: inv.id
    };

    // 1. Create Transaction in DB
    const { data: newTx } = await supabase.from('transactions').insert([autoTx]).select().single();
    // 2. Update Invoice Status in DB
    await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId);

    // 3. Update Local State
    if (newTx) {
      setData(prev => ({
        ...prev,
        invoices: prev.invoices.map(i => i.id === invoiceId ? { ...i, status: 'paid' } : i),
        transactions: [newTx, ...prev.transactions]
      }));
    }
  };

  const revertInvoiceStatus = async (invoiceId, newStatus) => {
    await supabase.from('transactions').delete().eq('linked_invoice_id', invoiceId);
    await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
    
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === invoiceId ? { ...i, status: newStatus } : i),
      transactions: prev.transactions.filter(t => t.linked_invoice_id !== invoiceId)
    }));
  };

  // --- 4. DATA PROCESSING (Filtering & Aggregates) ---
  // Note: DB uses snake_case (client_id), UI uses camelCase (clientId). 
  // We map them here so the rest of your app doesn't break.
  
  const normalizeData = useMemo(() => {
    const mapTask = t => ({ ...t, clientId: t.client_id, assigneeId: t.assignee_id, dueDate: t.due_date, createdAt: t.created_at });
    const mapInv = i => ({ ...i, clientId: i.client_id, createdBy: i.created_by, issueDate: i.issue_date, dueDate: i.due_date });
    const mapTx = t => ({ ...t, clientId: t.client_id, assigneeId: t.assignee_id, isAutoGenerated: t.is_auto_generated, linkedInvoiceId: t.linked_invoice_id });

    return {
      tasks: data.tasks.map(mapTask),
      invoices: data.invoices.map(mapInv),
      transactions: data.transactions.map(mapTx),
      clients: data.clients,
      profiles: data.profiles
    };
  }, [data]);

  const toDisplay = useCallback((amount, originalCurrency) => convertAmount(amount, originalCurrency, displayCurrency), [displayCurrency]);

  // Privacy Filtering
  const effectiveTransactions = useMemo(() => {
    if (!user || user.role === 'admin') return normalizeData.transactions;
    return normalizeData.transactions.filter(t => t.assigneeId === user.id);
  }, [normalizeData.transactions, user]);

  const effectiveTasks = useMemo(() => {
    if (!user || user.role === 'admin') return normalizeData.tasks;
    return normalizeData.tasks.filter(t => t.assigneeId === user.id);
  }, [normalizeData.tasks, user]);

  const effectiveInvoices = useMemo(() => {
    if (!user || user.role === 'admin') return normalizeData.invoices;
    return normalizeData.invoices.filter(inv => inv.createdBy === user.id);
  }, [normalizeData.invoices, user]);

  // Aggregates
  const aggregates = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let income = 0, expense = 0, pending = 0, prevIncome = 0, prevExpense = 0;

    effectiveTransactions.forEach((t) => {
      const d = new Date(t.date);
      const displayAmt = toDisplay(t.amount, t.currency);
      if (d >= thisMonthStart) {
        if (t.type === 'income') { income += displayAmt; if (t.status === 'pending') pending += displayAmt; } 
        else expense += displayAmt;
      } else if (d >= lastMonthStart && d < thisMonthStart) {
        if (t.type === 'income') prevIncome += displayAmt; else prevExpense += displayAmt;
      }
    });
    return {
      income, expense, net: income - expense, pending,
      incomeChange: prevIncome ? ((income - prevIncome) / prevIncome) * 100 : 0,
      expenseChange: prevExpense ? ((expense - prevExpense) / prevExpense) * 100 : 0,
    };
  }, [effectiveTransactions, toDisplay]);

  const monthlySeries = useMemo(() => {
    const months = []; const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      let inc = 0, exp = 0;
      effectiveTransactions.forEach((t) => {
        const d = new Date(t.date);
        if (d >= start && d < end) {
          const amt = toDisplay(t.amount, t.currency);
          if (t.type === 'income') inc += amt; else exp += amt;
        }
      });
      months.push({ label: start.toLocaleString('en-US', { month: 'short' }), year: start.getFullYear(), income: inc, expense: exp, profit: inc - exp });
    }
    return months;
  }, [effectiveTransactions, toDisplay]);

  const topClients = useMemo(() => {
    const map = {};
    effectiveTransactions.forEach((t) => {
      if (t.type !== 'income' || !t.clientId) return;
      map[t.clientId] = (map[t.clientId] || 0) + toDisplay(t.amount, t.currency);
    });
    return Object.entries(map).map(([id, total]) => ({ client: normalizeData.clients.find((c) => c.id === id), total })).filter((x) => x.client).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [effectiveTransactions, normalizeData.clients, toDisplay]);

  const earningsByMember = useMemo(() => {
    if (user?.role !== 'admin') return []; 
    const map = {};
    effectiveTransactions.forEach((t) => {
      if (t.type !== 'income' || !t.assigneeId) return;
      map[t.assigneeId] = (map[t.assigneeId] || 0) + toDisplay(t.amount, t.currency);
    });
    return Object.entries(map).map(([id, total]) => ({ member: normalizeData.profiles.find((m) => m.id === id), total })).filter((x) => x.member).sort((a, b) => b.total - a.total);
  }, [effectiveTransactions, normalizeData.profiles, toDisplay, user]);

  return { 
    data: normalizeData, // Pass normalized data to UI
    setData,
    transactions: effectiveTransactions, 
    tasks: effectiveTasks, 
    invoices: effectiveInvoices, 
    loading, // Export loading state
    displayCurrency, setDisplayCurrency, theme, setTheme, 
    addTransaction, updateTransaction, deleteTransaction, 
    addClient, updateClient, deleteClient,
    addTeamMember, updateTeamMember, deleteTeamMember,
    addTask, updateTask, deleteTask,
    addInvoice, updateInvoice, deleteInvoice,
    markInvoiceAsPaid, revertInvoiceStatus,
    toDisplay, aggregates, monthlySeries, topClients, earningsByMember 
  };
};