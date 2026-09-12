// src/lib/currency.js

// Exchange rates (1 USD = X PKR)
const EXCHANGE_RATES = {
  USD: 1,
  PKR: 278.50
};

export const convertAmount = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount, originalCurrency, displayCurrency, showSymbol = true) => {
  const converted = convertAmount(amount || 0, originalCurrency || 'USD', displayCurrency || 'USD');
  
  if (displayCurrency === 'USD') {
    return showSymbol ? `$${converted.toFixed(2)}` : converted.toFixed(2);
  }
  if (displayCurrency === 'PKR') {
    return showSymbol ? `Rs ${converted.toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : converted.toFixed(0);
  }
  return converted.toFixed(2);
};