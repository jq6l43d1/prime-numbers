import { format } from 'date-fns';

// IPO/Launch dates for filtering pre-existence orders
const IPO_DATES = {
  SPY: new Date('1993-01-22').getTime(),
  NVDA: new Date('1999-01-22').getTime(),
  BTC: new Date('2010-07-01').getTime(),
};

/**
 * Finds the stock price for a given date
 * Handles weekends/holidays by searching backwards up to 7 days
 * @param {Object} stockPrices - Price data { 'YYYY-MM-DD': { close, adjusted_close } }
 * @param {Date} orderDate - Order date
 * @returns {Object|null} - { date, price, adjusted_close } or null
 */
export function findStockPriceForDate(stockPrices, orderDate) {
  if (!orderDate || !stockPrices) {
    return null;
  }

  const MAX_LOOKBACK_DAYS = 7;

  // Try exact date first
  const dateStr = format(orderDate, 'yyyy-MM-dd');

  if (stockPrices[dateStr]) {
    return {
      date: dateStr,
      price: stockPrices[dateStr].close,
      adjusted_close: stockPrices[dateStr].adjusted_close,
    };
  }

  // Search backwards up to 7 days for most recent trading day
  for (let i = 1; i <= MAX_LOOKBACK_DAYS; i++) {
    const priorDate = new Date(orderDate);
    priorDate.setDate(priorDate.getDate() - i);
    const priorDateStr = format(priorDate, 'yyyy-MM-dd');

    if (stockPrices[priorDateStr]) {
      return {
        date: priorDateStr,
        price: stockPrices[priorDateStr].close,
        adjusted_close: stockPrices[priorDateStr].adjusted_close,
      };
    }
  }

  return null;
}

/**
 * Calculates dollar-cost averaging investment performance
 * @param {Array} orders - Array of order objects with orderDate and totalOwed
 * @param {Object} stockPrices - Price data from API
 * @param {string} symbol - Stock symbol (SPY, NVDA, BTC)
 * @returns {Object} - Investment analysis data
 */
export function calculateDollarCostAveraging(orders, stockPrices, symbol) {
  if (!orders || orders.length === 0 || !stockPrices) {
    return {
      success: false,
      error: 'No orders or stock prices provided',
    };
  }

  const ipoDate = IPO_DATES[symbol];
  if (!ipoDate) {
    return {
      success: false,
      error: `Unknown symbol: ${symbol}`,
    };
  }

  // Sort orders by date (oldest first)
  const sortedOrders = [...orders].sort((a, b) => {
    if (!a.orderDate) return 1;
    if (!b.orderDate) return -1;
    return a.orderDate - b.orderDate;
  });

  const dataPoints = [];
  let totalShares = 0;
  let totalInvested = 0;
  let excludedOrders = 0;
  let missedPriceOrders = 0;

  for (const order of sortedOrders) {
    if (!order.orderDate || !order.totalOwed || order.totalOwed <= 0) {
      continue;
    }

    // Skip orders before IPO/launch
    const orderTime = order.orderDate.getTime();
    if (orderTime < ipoDate) {
      excludedOrders++;
      continue;
    }

    // Find stock price for this date
    const priceInfo = findStockPriceForDate(stockPrices, order.orderDate);

    if (!priceInfo) {
      missedPriceOrders++;
      console.warn(`No price found for ${symbol} on ${format(order.orderDate, 'yyyy-MM-dd')}`);
      continue;
    }

    // Calculate shares purchased with this order amount
    const sharesPurchased = order.totalOwed / priceInfo.adjusted_close;
    totalShares += sharesPurchased;
    totalInvested += order.totalOwed;

    // Current value of all shares at this purchase price
    const currentValue = totalShares * priceInfo.adjusted_close;
    const returnAmount = currentValue - totalInvested;
    const returnPercent = totalInvested > 0 ? (returnAmount / totalInvested) * 100 : 0;

    dataPoints.push({
      date: order.orderDate,
      dateStr: format(order.orderDate, 'yyyy-MM-dd'),
      orderAmount: order.totalOwed,
      sharesPurchased,
      totalShares,
      totalInvested,
      priceAtPurchase: priceInfo.adjusted_close,
      currentValue,
      returnAmount,
      returnPercent,
    });
  }

  if (dataPoints.length === 0) {
    return {
      success: false,
      error: 'No valid orders found for this investment',
      excludedOrders,
      missedPriceOrders,
    };
  }

  // Get latest stock price for current value calculation
  const latestDate = Object.keys(stockPrices).sort().reverse()[0];
  const latestPrice = stockPrices[latestDate]?.adjusted_close;

  if (!latestPrice) {
    return {
      success: false,
      error: 'Could not determine current stock price',
    };
  }

  const finalValue = totalShares * latestPrice;
  const totalReturn = finalValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Calculate annualized return
  const firstDate = dataPoints[0].date;
  const lastDate = new Date();
  const yearsInvested = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365);
  const annualizedReturn =
    yearsInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / yearsInvested) - 1) * 100 : 0;

  // Find best and worst purchase dates
  const sortedByReturn = [...dataPoints].sort((a, b) => b.returnPercent - a.returnPercent);
  const bestPurchase = sortedByReturn[0];
  const worstPurchase = sortedByReturn[sortedByReturn.length - 1];

  return {
    success: true,
    symbol,
    dataPoints,
    summary: {
      totalInvested,
      totalShares,
      currentPrice: latestPrice,
      currentValue: finalValue,
      totalReturn,
      totalReturnPercent,
      annualizedReturn,
      numberOfPurchases: dataPoints.length,
      excludedOrders,
      missedPriceOrders,
      bestPurchase: {
        date: bestPurchase.dateStr,
        price: bestPurchase.priceAtPurchase,
        returnPercent: bestPurchase.returnPercent,
      },
      worstPurchase: {
        date: worstPurchase.dateStr,
        price: worstPurchase.priceAtPurchase,
        returnPercent: worstPurchase.returnPercent,
      },
    },
  };
}

/**
 * Generates Chart.js compatible datasets for comparison chart
 * @param {Array} orders - Original orders array
 * @param {Object} sp500Data - S&P 500 calculation results
 * @param {Object} nvidiaData - Nvidia calculation results
 * @param {Object} bitcoinData - Bitcoin calculation results
 * @returns {Object} - Chart datasets and labels
 */
export function generateComparisonDatasets(orders, sp500Data, nvidiaData, bitcoinData) {
  if (!orders || orders.length === 0) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Get all unique dates from all datasets
  const allDates = new Set();

  // Add Amazon spending dates
  orders.forEach(order => {
    if (order.orderDate) {
      allDates.add(format(order.orderDate, 'yyyy-MM-dd'));
    }
  });

  // Add investment dates
  if (sp500Data?.success) {
    sp500Data.dataPoints.forEach(dp => allDates.add(dp.dateStr));
  }
  if (nvidiaData?.success) {
    nvidiaData.dataPoints.forEach(dp => allDates.add(dp.dateStr));
  }
  if (bitcoinData?.success) {
    bitcoinData.dataPoints.forEach(dp => allDates.add(dp.dateStr));
  }

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Build cumulative Amazon spending data
  const amazonValues = [];
  let cumulativeSpending = 0;

  sortedDates.forEach(dateStr => {
    const ordersOnDate = orders.filter(
      order => order.orderDate && format(order.orderDate, 'yyyy-MM-dd') === dateStr
    );

    ordersOnDate.forEach(order => {
      cumulativeSpending += order.totalOwed || 0;
    });

    amazonValues.push(cumulativeSpending);
  });

  // Build investment value arrays
  const sp500Values = buildInvestmentValues(sortedDates, sp500Data);
  const nvidiaValues = buildInvestmentValues(sortedDates, nvidiaData);
  const bitcoinValues = buildInvestmentValues(sortedDates, bitcoinData);

  // Create datasets
  const datasets = [
    {
      label: 'Amazon Spending',
      data: amazonValues,
      borderColor: 'rgb(59, 130, 246)', // blue
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: false,
    },
  ];

  if (sp500Data?.success) {
    datasets.push({
      label: 'S&P 500 (SPY)',
      data: sp500Values,
      borderColor: 'rgb(34, 197, 94)', // green
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: false,
    });
  }

  if (nvidiaData?.success) {
    datasets.push({
      label: 'Nvidia (NVDA)',
      data: nvidiaValues,
      borderColor: 'rgb(239, 68, 68)', // red
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: false,
    });
  }

  if (bitcoinData?.success) {
    datasets.push({
      label: 'Bitcoin (BTC)',
      data: bitcoinValues,
      borderColor: 'rgb(249, 115, 22)', // orange
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 2,
      tension: 0.1,
      fill: false,
    });
  }

  return {
    labels: sortedDates,
    datasets,
  };
}

/**
 * Helper to build investment value array aligned with date labels
 */
function buildInvestmentValues(sortedDates, investmentData) {
  if (!investmentData?.success || !investmentData.dataPoints) {
    return sortedDates.map(() => null);
  }

  const dataPointsMap = new Map();
  investmentData.dataPoints.forEach(dp => {
    dataPointsMap.set(dp.dateStr, dp.currentValue);
  });

  const values = [];
  let lastValue = 0;

  sortedDates.forEach(dateStr => {
    if (dataPointsMap.has(dateStr)) {
      lastValue = dataPointsMap.get(dateStr);
    }
    values.push(lastValue);
  });

  return values;
}
