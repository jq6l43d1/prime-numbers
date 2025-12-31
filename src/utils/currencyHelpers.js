/**
 * Formats a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    return `$${amount.toFixed(decimals)}`;
  }
}

/**
 * Formats a number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} - Formatted number string
 */
export function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
}

/**
 * Formats a percentage
 * @param {number} value - Value to format (0-100 or 0-1)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} isDecimal - Whether value is in decimal form (0-1) vs percentage (0-100)
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(value, decimals = 1, isDecimal = false) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Parses currency string to number
 * @param {string} currencyString - Currency string (e.g., "$123.45")
 * @returns {number} - Parsed number
 */
export function parseCurrency(currencyString) {
  if (!currencyString) return 0;

  // Remove currency symbols, commas, and spaces
  const cleaned = currencyString.toString().replace(/[$,\s]/g, '');
  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}

/**
 * Calculates percentage of total
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} - Percentage (0-100)
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Detects the primary currency from orders
 * @param {Array} orders - Array of orders with currency property
 * @returns {string} - Most common currency code
 */
export function detectPrimaryCurrency(orders) {
  if (!orders || orders.length === 0) return 'USD';

  const currencyCounts = {};

  orders.forEach(order => {
    const currency = order.currency || 'USD';
    currencyCounts[currency] = (currencyCounts[currency] || 0) + 1;
  });

  // Find the most common currency
  let primaryCurrency = 'USD';
  let maxCount = 0;

  Object.entries(currencyCounts).forEach(([currency, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryCurrency = currency;
    }
  });

  return primaryCurrency;
}

/**
 * Rounds to 2 decimal places
 * @param {number} value - Value to round
 * @returns {number} - Rounded value
 */
export function roundToTwo(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Sums an array of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} - Sum
 */
export function sum(numbers) {
  return numbers.reduce((acc, num) => acc + (num || 0), 0);
}

/**
 * Calculates average of numbers
 * @param {Array} numbers - Array of numbers
 * @returns {number} - Average
 */
export function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}
