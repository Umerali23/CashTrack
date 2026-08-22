const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

export const DUMMY_CLIENTS = [
  { id: 'c1', name: 'Fiverr Client', company: 'US Startup — Nova Labs', email: 'alex@novalabs.io', avatarColor: 'from-emerald-400 to-teal-500' },
  { id: 'c2', name: 'Local Shop Owner', company: 'Al-Madina Stores, Karachi', email: 'shop.almadina@gmail.com', avatarColor: 'from-amber-400 to-orange-500' },
  { id: 'c3', name: 'Sarah Mitchell', company: 'Upwork — Freelance', email: 'sarah.m@outlook.com', avatarColor: 'from-violet-400 to-fuchsia-500' },
  { id: 'c4', name: 'DesignPro Agency', company: 'DesignPro (Pvt) Ltd', email: 'projects@designpro.pk', avatarColor: 'from-sky-400 to-blue-500' },
  { id: 'c5', name: 'Ali Raza', company: 'Friend Referral', email: 'ali.raza@yahoo.com', avatarColor: 'from-rose-400 to-pink-500' },
];

export const DUMMY_TRANSACTIONS = [
  { id: 't1', type: 'income', amount: 450, currency: 'USD', clientId: 'c1', category: 'Development', date: daysAgo(2), description: 'Landing page build', status: 'paid' },
  { id: 't2', type: 'income', amount: 85000, currency: 'PKR', clientId: 'c2', category: 'Design Work', date: daysAgo(5), description: 'Shop signage & menu design', status: 'paid' },
  { id: 't3', type: 'expense', amount: 29, currency: 'USD', clientId: null, category: 'Subscription', date: daysAgo(7), description: 'Figma Professional plan', status: 'paid' },
  { id: 't4', type: 'expense', amount: 6500, currency: 'PKR', clientId: null, category: 'Internet', date: daysAgo(8), description: 'Monthly fiber bill', status: 'paid' },
  { id: 't5', type: 'income', amount: 1200, currency: 'USD', clientId: 'c3', category: 'Development', date: daysAgo(10), description: 'Dashboard MVP — Phase 1', status: 'paid' },
  { id: 't6', type: 'income', amount: 350, currency: 'USD', clientId: 'c1', category: 'Design Work', date: daysAgo(12), description: 'Brand refresh icons', status: 'pending' },
  { id: 't7', type: 'expense', amount: 4200, currency: 'PKR', clientId: null, category: 'Food', date: daysAgo(14), description: 'Team lunch', status: 'paid' },
  { id: 't8', type: 'expense', amount: 19, currency: 'USD', clientId: null, category: 'Software', date: daysAgo(15), description: 'GitHub Copilot', status: 'paid' },
  { id: 't9', type: 'income', amount: 150000, currency: 'PKR', clientId: 'c4', category: 'Development', date: daysAgo(18), description: 'E-commerce website', status: 'paid' },
  { id: 't10', type: 'income', amount: 25000, currency: 'PKR', clientId: 'c5', category: 'Design Work', date: daysAgo(20), description: 'Wedding card design', status: 'pending' },
  { id: 't11', type: 'income', amount: 800, currency: 'USD', clientId: 'c3', category: 'Development', date: daysAgo(32), description: 'API integration', status: 'paid' },
  { id: 't12', type: 'expense', amount: 99, currency: 'USD', clientId: null, category: 'Software', date: daysAgo(35), description: 'Adobe CC', status: 'paid' },
  { id: 't13', type: 'income', amount: 60000, currency: 'PKR', clientId: 'c2', category: 'Design Work', date: daysAgo(38), description: 'Packaging design', status: 'paid' },
  { id: 't14', type: 'expense', amount: 8500, currency: 'PKR', clientId: null, category: 'Internet', date: daysAgo(40), description: 'Internet bill', status: 'paid' },
  { id: 't15', type: 'income', amount: 2000, currency: 'USD', clientId: 'c4', category: 'Development', date: daysAgo(45), description: 'SaaS dashboard Phase 2', status: 'paid' },
  { id: 't16', type: 'expense', amount: 12, currency: 'USD', clientId: null, category: 'Subscription', date: daysAgo(48), description: 'Notion Team plan', status: 'paid' },
  { id: 't17', type: 'income', amount: 300, currency: 'USD', clientId: 'c1', category: 'Design Work', date: daysAgo(62), description: 'Logo redesign', status: 'paid' },
  { id: 't18', type: 'expense', amount: 5500, currency: 'PKR', clientId: null, category: 'Food', date: daysAgo(65), description: 'Client dinner', status: 'paid' },
  { id: 't19', type: 'income', amount: 120000, currency: 'PKR', clientId: 'c4', category: 'Development', date: daysAgo(70), description: 'Corporate website', status: 'paid' },
  { id: 't20', type: 'expense', amount: 24, currency: 'USD', clientId: null, category: 'Software', date: daysAgo(75), description: 'Vercel Pro', status: 'paid' },
  { id: 't21', type: 'income', amount: 500, currency: 'USD', clientId: 'c3', category: 'Development', date: daysAgo(80), description: 'Bug fixes', status: 'paid' },
];