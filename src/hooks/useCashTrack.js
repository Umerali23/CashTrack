import { useState, useEffect, useCallback, useMemo } from 'react';
import { convertAmount } from '../lib/currency';

const INITIAL_DATA = {
  clients: [
    { 
      id: 'c1', 
      name: 'Fiverr Client', 
      company: 'Nova Labs', 
      email: 'alex@novalabs.io', 
      avatarColor: 'from-emerald-400 to-teal-500',
      createdAt: new Date().toISOString()
    }
  ],
  profiles: [
    { 
      id: 'p1', 
      name: 'Umer', 
      role: 'member', 
      email: 'umer@cashtrack.com', 
      avatarColor: 'from-blue-400 to-indigo-500',
      createdAt: new Date().toISOString()
    },
    { 
      id: 'p2', 
      name: 'Laiba', 
      role: 'member', 
      email: 'laiba@cashtrack.com', 
      avatarColor: 'from-pink-400 to-rose-500',
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    { 
      id: 't1', 
      title: 'Build Login Page', 
      description: 'Create responsive login page with email and password fields', 
      status: 'completed', 
      priority: 'high',
      tags: ['Frontend', 'React'],
      dueDate: '2026-09-15', 
      compensation: 150, 
      currency: 'USD', 
      clientId: 'c1', 
      assigneeId: 'p1', 
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    { 
      id: 't2', 
      title: 'Design Dashboard UI', 
      description: 'Create modern dashboard interface with charts', 
      status: 'pending', 
      priority: 'medium',
      tags: ['Design', 'UI/UX'],
      dueDate: '2026-09-20', 
      compensation: 200, 
      currency: 'USD', 
      clientId: 'c1', 
      assigneeId: 'p2', 
      createdAt: new Date().toISOString()
    }
  ],
  invoices: [],
  transactions: [],
  payouts: []
};

export const useCashTrack = (user) => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('cashtrack_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          clients: Array.isArray(parsed.clients) ? parsed.clients : INITIAL_DATA.clients,
          profiles: Array.isArray(parsed.profiles) ? parsed.profiles : INITIAL_DATA.profiles,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_DATA.tasks,
          invoices: Array.isArray(parsed.invoices) ? parsed.invoices : [],
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          payouts: Array.isArray(parsed.payouts) ? parsed.payouts : []
        };
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return INITIAL_DATA;
  });

  const [displayCurrency, setDisplayCurrency] = useState('PKR');
  const [theme, setTheme] = useState(() => localStorage.getItem('cashtrack_theme') || 'dark');

  useEffect(() => {
    try {
      localStorage.setItem('cashtrack_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [data]);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('cashtrack_theme', theme);
  }, [theme]);

  // --- CLIENTS ---
  const addClient = (c) => {
    const newClient = { ...c, id: `c${Date.now()}`, createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, clients: [newClient, ...(prev.clients || [])] }));
  };

  const updateClient = (id, patch) => {
    setData(prev => ({ ...prev, clients: (prev.clients || []).map(c => c.id === id ? { ...c, ...patch } : c) }));
  };

  const deleteClient = (id) => {
    setData(prev => ({ 
      ...prev, 
      clients: (prev.clients || []).filter(c => c.id !== id),
      tasks: (prev.tasks || []).map(t => t.clientId === id ? { ...t, clientId: null } : t)
    }));
  };

  // --- TEAM MEMBERS ---
  const addTeamMember = (m) => {
    const newMember = { ...m, id: `p${Date.now()}`, createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, profiles: [...(prev.profiles || []), newMember] }));
    return { success: true, creds: { email: m.email, password: 'local123' } };
  };

  const updateTeamMember = (id, patch) => {
    setData(prev => ({ ...prev, profiles: (prev.profiles || []).map(m => m.id === id ? { ...m, ...patch } : m) }));
  };

  const deleteTeamMember = (id) => {
    setData(prev => ({ 
      ...prev, 
      profiles: (prev.profiles || []).filter(m => m.id !== id),
      tasks: (prev.tasks || []).map(t => t.assigneeId === id ? { ...t, assigneeId: null } : t)
    }));
  };

  // --- TASKS ---
  const addTask = (t) => {
    const newTask = { 
      ...t, 
      id: `t${Date.now()}`, 
      createdAt: new Date().toISOString(),
      priority: t.priority || 'medium',
      tags: t.tags || []
    };
    setData(prev => ({ ...prev, tasks: [newTask, ...(prev.tasks || [])] }));
  };

  const updateTask = (id, patch) => {
    setData(prev => ({ 
      ...prev, 
      tasks: (prev.tasks || []).map(t => t.id === id ? { 
        ...t, 
        ...patch,
        completedAt: patch.status === 'completed' && t.status !== 'completed' ? new Date().toISOString() : t.completedAt
      } : t) 
    }));
  };

  const deleteTask = (id) => {
    setData(prev => ({ ...prev, tasks: (prev.tasks || []).filter(t => t.id !== id) }));
  };

  // --- INVOICES ---
  const addInvoice = (inv) => {
    const newInv = { ...inv, id: `inv${Date.now()}`, createdAt: new Date().toISOString() };
    setData(prev => ({ ...prev, invoices: [newInv, ...(prev.invoices || [])] }));
  };

  const updateInvoice = (id, patch) => {
    setData(prev => ({ ...prev, invoices: (prev.invoices || []).map(i => i.id === id ? { ...i, ...patch } : i) }));
  };

  const deleteInvoice = (id) => {
    setData(prev => ({ ...prev, invoices: (prev.invoices || []).filter(i => i.id !== id) }));
  };

  const markInvoiceAsPaid = (invoiceId) => {
    const inv = (data.invoices || []).find(i => i.id === invoiceId);
    if (!inv) return;

    const newTx = {
      id: `tx${Date.now()}`,
      type: 'income',
      amount: inv.total,
      currency: inv.currency || 'USD',
      clientId: inv.clientId,
      assigneeId: inv.createdBy,
      category: 'Client Payment',
      date: new Date().toISOString().split('T')[0],
      description: `Payment for Invoice ${inv.invoiceNumber}`,
      status: 'paid',
      isAutoGenerated: true,
      linkedInvoiceId: inv.id,
      createdAt: new Date().toISOString()
    };

    const newPayouts = [];
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach(item => {
        if (item.taskId) {
          const task = (data.tasks || []).find(t => t.id === item.taskId);
          if (task && task.assigneeId) {
            newPayouts.push({
              id: `po${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
              memberId: task.assigneeId,
              amount: parseFloat(task.compensation) || 0,
              currency: task.currency || 'USD',
              taskId: task.id,
              taskTitle: task.title,
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              date: new Date().toISOString().split('T')[0],
              status: 'paid',
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    }

    setData(prev => ({
      ...prev,
      invoices: (prev.invoices || []).map(i => i.id === invoiceId ? { ...i, status: 'paid' } : i),
      transactions: [newTx, ...(prev.transactions || [])],
      payouts: [...newPayouts, ...(prev.payouts || [])]
    }));
  };

  const generateInvoiceFromTasks = (taskIds, clientId) => {
    const completedTasks = (data.tasks || []).filter(t => taskIds.includes(t.id) && t.status === 'completed');
    if (completedTasks.length === 0) return null;

    const total = completedTasks.reduce((sum, t) => sum + (parseFloat(t.compensation) || 0), 0);
    const items = completedTasks.map(t => ({
      description: t.title,
      amount: parseFloat(t.compensation) || 0,
      taskId: t.id
    }));

    const invoice = {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      clientId,
      createdBy: user?.id,
      status: 'draft',
      total,
      currency: 'USD',
      items,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      linkedTaskIds: taskIds
    };

    addInvoice(invoice);
    return invoice;
  };

  // --- NEW: MANUAL INCOME (Optional Assignee) ---
  const addManualIncome = (t) => {
    const newTx = {
      id: `tx${Date.now()}`,
      type: 'income',
      amount: parseFloat(t.amount) || 0,
      currency: t.currency || 'USD',
      clientId: t.clientId || null,
      assigneeId: t.assigneeId || null,
      category: t.category || 'Freelance Work',
      date: t.date || new Date().toISOString().split('T')[0],
      description: t.description || '',
      status: 'paid',
      isAutoGenerated: false,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
  };

  // --- NEW: EXPENSE ---
  const addExpense = (e) => {
    const newTx = {
      id: `tx${Date.now()}`,
      type: 'expense',
      amount: parseFloat(e.amount) || 0,
      currency: e.currency || 'USD',
      clientId: null,
      assigneeId: null,
      category: e.category || 'General',
      date: e.date || new Date().toISOString().split('T')[0],
      description: e.description || '',
      status: 'paid',
      isAutoGenerated: false,
      createdAt: new Date().toISOString()
    };
    setData(prev => ({ ...prev, transactions: [newTx, ...(prev.transactions || [])] }));
  };

  // --- DATA PROCESSING ---
  const toDisplay = useCallback((amount, originalCurrency) => 
    convertAmount(amount || 0, originalCurrency || 'USD', displayCurrency), 
    [displayCurrency]
  );

  const aggregates = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    let income = 0, expense = 0, pending = 0, prevIncome = 0, prevExpense = 0;

    (data.transactions || []).forEach((t) => {
      const d = new Date(t.date || t.createdAt || Date.now());
      const displayAmt = toDisplay(t.amount || 0, t.currency);
      
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
  }, [data.transactions, toDisplay]);

  const memberEarnings = useMemo(() => {
    if (!user) return { total: 0, completedTasks: 0, pendingTasks: 0, taskBreakdown: [], payouts: [] };
    
    const myTasks = (data.tasks || []).filter(t => t.assigneeId === user.id);
    const completedTasks = myTasks.filter(t => t.status === 'completed');
    const pendingTasks = myTasks.filter(t => t.status !== 'completed');
    
    const totalEarnings = completedTasks.reduce((sum, t) => {
      return sum + toDisplay(parseFloat(t.compensation) || 0, t.currency);
    }, 0);

    const taskBreakdown = completedTasks.map(t => ({
      ...t,
      earnings: toDisplay(parseFloat(t.compensation) || 0, t.currency),
      client: (data.clients || []).find(c => c.id === t.clientId)
    }));

    const myPayouts = (data.payouts || []).filter(p => p.memberId === user.id);

    return {
      total: totalEarnings,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      taskBreakdown,
      payouts: myPayouts
    };
  }, [data.tasks, data.clients, data.payouts, user, toDisplay]);

  const monthlySeries = useMemo(() => {
    const months = []; 
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      let inc = 0, exp = 0;
      
      (data.transactions || []).forEach((t) => {
        const d = new Date(t.date || t.createdAt || Date.now());
        if (d >= start && d < end) {
          const amt = toDisplay(t.amount || 0, t.currency);
          if (t.type === 'income') inc += amt; else exp += amt;
        }
      });
      
      months.push({ 
        label: start.toLocaleString('en-US', { month: 'short' }), 
        year: start.getFullYear(), 
        income: inc, expense: exp, profit: inc - exp 
      });
    }
    return months;
  }, [data.transactions, toDisplay]);

  const topClients = useMemo(() => {
    const map = {};
    (data.transactions || []).forEach((t) => {
      if (t.type !== 'income' || !t.clientId) return;
      map[t.clientId] = (map[t.clientId] || 0) + toDisplay(t.amount || 0, t.currency);
    });
    
    return Object.entries(map)
      .map(([id, total]) => ({ client: (data.clients || []).find((c) => c.id === id), total }))
      .filter((x) => x.client)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [data.transactions, data.clients, toDisplay]);

  const earningsByMember = useMemo(() => {
    if (user?.role !== 'admin') return []; 
    const map = {};
    
    (data.tasks || []).forEach((t) => {
      if (t.status !== 'completed' || !t.assigneeId) return;
      const earnings = toDisplay(parseFloat(t.compensation) || 0, t.currency);
      map[t.assigneeId] = (map[t.assigneeId] || 0) + earnings;
    });
    
    return Object.entries(map)
      .map(([id, total]) => ({ member: (data.profiles || []).find((m) => m.id === id), total }))
      .filter((x) => x.member)
      .sort((a, b) => b.total - a.total);
  }, [data.tasks, data.profiles, toDisplay, user]);

  return { 
    data, setData, loading: false,
    displayCurrency, setDisplayCurrency, theme, setTheme,
    addClient, updateClient, deleteClient,
    addTeamMember, updateTeamMember, deleteTeamMember,
    addTask, updateTask, deleteTask,
    addInvoice, updateInvoice, deleteInvoice, markInvoiceAsPaid,
    generateInvoiceFromTasks,
    addManualIncome, addExpense,
    toDisplay, aggregates, monthlySeries, topClients, earningsByMember, memberEarnings
  };
};