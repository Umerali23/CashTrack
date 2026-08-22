import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadData, saveData } from '../lib/storage';
import { convertAmount } from '../lib/currency';
import { DUMMY_CLIENTS, DUMMY_TRANSACTIONS } from '../lib/dummyData';

export const useCashTrack = () => {
  const [data, setData] = useState(() => {
    const saved = loadData();
    return saved || { transactions: DUMMY_TRANSACTIONS, clients: DUMMY_CLIENTS };
  });
  const [displayCurrency, setDisplayCurrency] = useState('PKR');
  const [theme, setTheme] = useState(() => localStorage.getItem('cashtrack_theme') || 'dark');

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => {
    document.body.className = theme;
    document.documentElement.className = theme;
    localStorage.setItem('cashtrack_theme', theme);
  }, [theme]);

  const addTransaction = useCallback((t) => {
    const newT = { ...t, id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    setData((d) => ({ ...d, transactions: [newT, ...d.transactions] }));
  }, []);
  const updateTransaction = useCallback((id, patch) => {
    setData((d) => ({ ...d, transactions: d.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);
  const deleteTransaction = useCallback((id) => {
    setData((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) }));
  }, []);
  const addClient = useCallback((c) => {
    const newC = { ...c, id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    setData((d) => ({ ...d, clients: [...d.clients, newC] }));
  }, []);
  const updateClient = useCallback((id, patch) => {
    setData((d) => ({ ...d, clients: d.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);
  const deleteClient = useCallback((id) => {
    setData((d) => ({
      ...d,
      clients: d.clients.filter((c) => c.id !== id),
      transactions: d.transactions.map((t) => t.clientId === id ? { ...t, clientId: null } : t),
    }));
  }, []);

  const toDisplay = useCallback((amount, originalCurrency) => convertAmount(amount, originalCurrency, displayCurrency), [displayCurrency]);

  const aggregates = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let income = 0, expense = 0, pending = 0, prevIncome = 0, prevExpense = 0;

    data.transactions.forEach((t) => {
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
  }, [data.transactions, toDisplay]);

  const monthlySeries = useMemo(() => {
    const months = []; const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      let inc = 0, exp = 0;
      data.transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d >= start && d < end) {
          const amt = toDisplay(t.amount, t.currency);
          if (t.type === 'income') inc += amt; else exp += amt;
        }
      });
      months.push({ label: start.toLocaleString('en-US', { month: 'short' }), year: start.getFullYear(), income: inc, expense: exp, profit: inc - exp });
    }
    return months;
  }, [data.transactions, toDisplay]);

  const topClients = useMemo(() => {
    const map = {};
    data.transactions.forEach((t) => {
      if (t.type !== 'income' || !t.clientId) return;
      map[t.clientId] = (map[t.clientId] || 0) + toDisplay(t.amount, t.currency);
    });
    return Object.entries(map).map(([id, total]) => ({ client: data.clients.find((c) => c.id === id), total })).filter((x) => x.client).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [data.transactions, data.clients, toDisplay]);

  return { data, displayCurrency, setDisplayCurrency, theme, setTheme, addTransaction, updateTransaction, deleteTransaction, addClient, updateClient, deleteClient, toDisplay, aggregates, monthlySeries, topClients };
};