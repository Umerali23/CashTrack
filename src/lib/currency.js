// src/lib/currency.js

// Exchange rates (1 USD = X PKR)
// Update this rate as needed - currently using approximate rate
const EXCHANGE_RATES = {
  USD: 1,
  PKR: 278.50 // 1 USD = 278.50 PKR (update as needed)
};

export const convertAmount = (amount, fromCurrency, toCurrency) => {
  if (!amount || amount === 0) return 0;
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount, currency, showSymbol = true) => {
  const converted = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  if (currency === 'USD') {
    return showSymbol ? `$${converted.toFixed(2)}` : converted.toFixed(2);
  }
  if (currency === 'PKR') {
    return showSymbol ? `Rs ${converted.toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : converted.toFixed(0);
  }
  return converted.toFixed(2);
};