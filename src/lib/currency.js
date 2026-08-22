export const RATES = { USD: 1, PKR: 280 };
export const convertAmount = (amount, originalCurrency, targetCurrency) => {
  if (targetCurrency === 'ORIGINAL') return amount;
  if (originalCurrency === targetCurrency) return amount;
  const usdValue = originalCurrency === 'USD' ? amount : amount / RATES.PKR;
  return targetCurrency === 'USD' ? usdValue : usdValue * RATES.PKR;
};
export const formatCurrency = (amount, currency = 'PKR', compact = false) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (compact && abs >= 1_000_000) return `${sign}${currency === 'USD' ? '$' : 'Rs '}${(abs / 1_000_000).toFixed(2)}M`;
  if (compact && abs >= 1_000) return `${sign}${currency === 'USD' ? '$' : 'Rs '}${(abs / 1_000).toFixed(1)}K`;
  const formatted = abs.toLocaleString('en-US', { maximumFractionDigits: currency === 'USD' ? 2 : 0, minimumFractionDigits: currency === 'USD' ? 2 : 0 });
  return `${sign}${currency === 'USD' ? '$' : 'Rs '}${formatted}`;
};