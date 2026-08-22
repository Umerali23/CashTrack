export const exportToCSV = (transactions, clients) => {
  if (!transactions.length) return;
  const header = ['Date', 'Type', 'Description', 'Client', 'Category', 'Amount', 'Currency', 'Status'];
  const rows = transactions.map((t) => {
    const client = clients.find((c) => c.id === t.clientId);
    return [t.date, t.type, `"${(t.description || '').replace(/"/g, '""')}"`, `"${(client?.name || '—').replace(/"/g, '""')}"`, t.category, t.amount, t.currency, t.status].join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cashtrack-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};