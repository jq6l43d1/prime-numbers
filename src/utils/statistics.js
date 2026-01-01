import { groupByMonth, groupByYear } from './dateHelpers';
import { sum, average, roundToTwo, calculatePercentage } from './currencyHelpers';
import { getSpendingByCategory } from './categoryMapper';

/**
 * Calculates all statistics from orders
 * @param {Array} orders - Array of orders
 * @param {Array} returns - Array of returns
 * @returns {Object} - Complete statistics object
 */
export function calculateAllStatistics(orders, returns = []) {
  if (!orders || orders.length === 0) {
    return getEmptyStatistics();
  }

  return {
    overview: calculateOverviewStats(orders),
    spending: calculateSpendingStats(orders),
    products: calculateProductStats(orders),
    returns: calculateReturnStats(orders, returns),
    shipping: calculateShippingStats(orders),
    payments: calculatePaymentStats(orders),
    trends: calculateTrends(orders),
  };
}

/**
 * Gets empty statistics object
 * @returns {Object} - Empty statistics
 */
function getEmptyStatistics() {
  return {
    overview: {},
    spending: {},
    products: {},
    returns: {},
    shipping: {},
    payments: {},
    trends: {},
  };
}

/**
 * Calculates overview statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Overview stats
 */
export function calculateOverviewStats(orders) {
  const totalOrders = orders.length;
  const totalItems = sum(orders.map(o => o.quantity));
  const totalSpent = roundToTwo(sum(orders.map(o => o.totalOwed)));
  const totalShipping = roundToTwo(sum(orders.map(o => o.shippingCharge)));
  const totalDiscounts = roundToTwo(sum(orders.map(o => o.totalDiscounts)));
  const totalTax = roundToTwo(sum(orders.map(o => o.unitPriceTax * o.quantity)));

  const validDates = orders
    .map(o => o.orderDate)
    .filter(d => d !== null && d !== undefined)
    .sort((a, b) => a - b);

  const firstOrderDate = validDates.length > 0 ? validDates[0] : null;
  const lastOrderDate = validDates.length > 0 ? validDates[validDates.length - 1] : null;

  return {
    totalOrders,
    totalItems,
    totalSpent,
    totalShipping,
    totalDiscounts,
    totalTax,
    avgOrderValue: totalOrders > 0 ? roundToTwo(totalSpent / totalOrders) : 0,
    avgItemsPerOrder: totalOrders > 0 ? roundToTwo(totalItems / totalOrders) : 0,
    firstOrderDate,
    lastOrderDate,
    retailOrders: orders.filter(o => !o.isDigital).length,
    digitalOrders: orders.filter(o => o.isDigital).length,
  };
}

/**
 * Calculates spending statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Spending stats
 */
export function calculateSpendingStats(orders) {
  // Group by year
  const byYear = groupByYear(orders);
  const spendingByYear = Object.entries(byYear)
    .map(([year, yearOrders]) => ({
      year: parseInt(year),
      amount: roundToTwo(sum(yearOrders.map(o => o.totalOwed))),
      orders: yearOrders.length,
    }))
    .sort((a, b) => a.year - b.year);

  // Group by month
  const byMonth = groupByMonth(orders);
  const spendingByMonth = Object.entries(byMonth)
    .map(([month, monthOrders]) => ({
      month,
      amount: roundToTwo(sum(monthOrders.map(o => o.totalOwed))),
      orders: monthOrders.length,
      date: monthOrders[0].orderDate,
    }))
    .sort((a, b) => a.date - b.date);

  // Get last 12 months
  const last12Months = spendingByMonth.slice(-12);

  // Calculate by category
  const spendingByCategory = getSpendingByCategory(orders);
  const categoryArray = Object.entries(spendingByCategory)
    .map(([category, amount]) => ({
      category,
      amount: roundToTwo(amount),
      percentage: 0, // Will be calculated below
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalSpent = sum(categoryArray.map(c => c.amount));
  categoryArray.forEach(cat => {
    cat.percentage = roundToTwo(calculatePercentage(cat.amount, totalSpent));
  });

  // Highest and lowest spending months
  const monthlyAmounts = spendingByMonth.map(m => m.amount);
  const highestMonth =
    spendingByMonth.length > 0
      ? spendingByMonth.reduce((max, m) => (m.amount > max.amount ? m : max))
      : null;
  const lowestMonth =
    spendingByMonth.length > 0
      ? spendingByMonth.reduce((min, m) => (m.amount < min.amount ? m : min))
      : null;

  // Monthly average
  const monthlyAverage = monthlyAmounts.length > 0 ? roundToTwo(average(monthlyAmounts)) : 0;

  // Year over year growth
  let yoyGrowth = 0;
  if (spendingByYear.length >= 2) {
    const currentYear = spendingByYear[spendingByYear.length - 1];
    const previousYear = spendingByYear[spendingByYear.length - 2];
    if (previousYear.amount > 0) {
      yoyGrowth = roundToTwo(
        calculatePercentage(currentYear.amount - previousYear.amount, previousYear.amount)
      );
    }
  }

  // Digital vs Retail
  const digitalOrders = orders.filter(o => o.isDigital);
  const retailOrders = orders.filter(o => !o.isDigital);
  const digitalSpending = roundToTwo(sum(digitalOrders.map(o => o.totalOwed)));
  const retailSpending = roundToTwo(sum(retailOrders.map(o => o.totalOwed)));

  return {
    byYear: spendingByYear,
    byMonth: spendingByMonth,
    last12Months,
    byCategory: categoryArray,
    monthlyAverage,
    highestMonth,
    lowestMonth,
    yoyGrowth,
    digitalSpending,
    retailSpending,
    digitalPercentage: roundToTwo(calculatePercentage(digitalSpending, totalSpent)),
    retailPercentage: roundToTwo(calculatePercentage(retailSpending, totalSpent)),
  };
}

/**
 * Calculates product statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Product stats
 */
export function calculateProductStats(orders) {
  const uniqueProducts = new Set(orders.map(o => o.asin).filter(a => a)).size;

  // Top products by quantity
  const productQuantities = {};
  const productSpending = {};
  const productInfo = {};

  orders.forEach(order => {
    const key = order.asin || order.productName;
    if (!key) return;

    productQuantities[key] = (productQuantities[key] || 0) + order.quantity;
    productSpending[key] = (productSpending[key] || 0) + order.totalOwed;

    if (!productInfo[key]) {
      productInfo[key] = {
        name: order.productName,
        asin: order.asin,
        category: order.category,
      };
    }
  });

  const topByQuantity = Object.entries(productQuantities)
    .map(([key, quantity]) => ({
      ...productInfo[key],
      quantity,
      totalSpent: roundToTwo(productSpending[key]),
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topBySpending = Object.entries(productSpending)
    .map(([key, amount]) => ({
      ...productInfo[key],
      totalSpent: roundToTwo(amount),
      quantity: productQuantities[key],
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Category distribution
  const categoryCount = {};
  orders.forEach(order => {
    const cat = order.category || 'Other';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count,
      percentage: roundToTwo(calculatePercentage(count, orders.length)),
    }))
    .sort((a, b) => b.count - a.count);

  // Average product price
  const avgProductPrice = orders.length > 0 ? roundToTwo(average(orders.map(o => o.unitPrice))) : 0;

  // Price ranges
  const priceRanges = {
    under10: orders.filter(o => o.unitPrice < 10).length,
    '10to50': orders.filter(o => o.unitPrice >= 10 && o.unitPrice < 50).length,
    '50to100': orders.filter(o => o.unitPrice >= 50 && o.unitPrice < 100).length,
    '100to500': orders.filter(o => o.unitPrice >= 100 && o.unitPrice < 500).length,
    over500: orders.filter(o => o.unitPrice >= 500).length,
  };

  return {
    uniqueProducts,
    topByQuantity,
    topBySpending,
    topCategories,
    avgProductPrice,
    priceRanges,
  };
}

/**
 * Calculates return statistics
 * @param {Array} orders - Array of orders
 * @param {Array} returns - Array of returns
 * @returns {Object} - Return stats
 */
export function calculateReturnStats(orders, returns) {
  const ordersWithReturns = orders.filter(o => o.hasReturn);
  const totalReturns = ordersWithReturns.length;
  const returnRate =
    orders.length > 0 ? roundToTwo(calculatePercentage(totalReturns, orders.length)) : 0;

  const totalRefunded = returns.length > 0 ? roundToTwo(sum(returns.map(r => r.returnAmount))) : 0;

  // Returns by category
  const returnsByCategory = {};
  ordersWithReturns.forEach(order => {
    const cat = order.category || 'Other';
    returnsByCategory[cat] = (returnsByCategory[cat] || 0) + 1;
  });

  const topReturnCategories = Object.entries(returnsByCategory)
    .map(([category, count]) => ({
      category,
      count,
      percentage: totalReturns > 0 ? roundToTwo(calculatePercentage(count, totalReturns)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Return reasons
  const returnReasons = {};
  returns.forEach(ret => {
    const reason = ret.returnReason || 'Unknown';
    returnReasons[reason] = (returnReasons[reason] || 0) + 1;
  });

  const topReturnReasons = Object.entries(returnReasons)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalReturns,
    returnRate,
    totalRefunded,
    topReturnCategories,
    topReturnReasons,
  };
}

/**
 * Calculates shipping statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Shipping stats
 */
export function calculateShippingStats(orders) {
  const totalShippingCost = roundToTwo(sum(orders.map(o => o.shippingCharge)));
  const totalSpent = sum(orders.map(o => o.totalOwed));
  const shippingPercentage =
    totalSpent > 0 ? roundToTwo(calculatePercentage(totalShippingCost, totalSpent)) : 0;

  const ordersWithShipping = orders.filter(o => o.shippingCharge > 0);
  const freeShippingOrders = orders.length - ordersWithShipping.length;
  const avgShippingCost =
    ordersWithShipping.length > 0
      ? roundToTwo(average(ordersWithShipping.map(o => o.shippingCharge)))
      : 0;

  // Shipping methods
  const shippingMethods = {};
  orders.forEach(order => {
    const method = order.shippingOption || 'Unknown';
    shippingMethods[method] = (shippingMethods[method] || 0) + 1;
  });

  const methodsArray = Object.entries(shippingMethods)
    .map(([method, count]) => ({
      method,
      count,
      percentage: roundToTwo(calculatePercentage(count, orders.length)),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalShippingCost,
    shippingPercentage,
    freeShippingOrders,
    paidShippingOrders: ordersWithShipping.length,
    avgShippingCost,
    methods: methodsArray,
  };
}

/**
 * Calculates payment method statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Payment stats
 */
export function calculatePaymentStats(orders) {
  const paymentMethods = {};
  const paymentSpending = {};

  orders.forEach(order => {
    const method = order.paymentMethod || 'Unknown';
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    paymentSpending[method] = (paymentSpending[method] || 0) + order.totalOwed;
  });

  const methodsArray = Object.entries(paymentMethods)
    .map(([method, count]) => ({
      method,
      count,
      amount: roundToTwo(paymentSpending[method]),
      percentage: roundToTwo(calculatePercentage(count, orders.length)),
    }))
    .sort((a, b) => b.count - a.count);

  const mostUsedMethod = methodsArray.length > 0 ? methodsArray[0].method : 'Unknown';

  return {
    methods: methodsArray,
    mostUsedMethod,
  };
}

/**
 * Calculates trend statistics
 * @param {Array} orders - Array of orders
 * @returns {Object} - Trend stats
 */
export function calculateTrends(orders) {
  const byMonth = groupByMonth(orders);
  const monthlyData = Object.entries(byMonth)
    .map(([month, monthOrders]) => ({
      month,
      orders: monthOrders.length,
      spending: sum(monthOrders.map(o => o.totalOwed)),
      date: monthOrders[0].orderDate,
    }))
    .sort((a, b) => a.date - b.date);

  // Most active month
  const mostActiveMonth =
    monthlyData.length > 0
      ? monthlyData.reduce((max, m) => (m.orders > max.orders ? m : max))
      : null;

  // Calculate average days between orders
  const validDates = orders
    .map(o => o.orderDate)
    .filter(d => d !== null)
    .sort((a, b) => a - b);

  let avgDaysBetweenOrders = 0;
  if (validDates.length > 1) {
    const daysDiffs = [];
    for (let i = 1; i < validDates.length; i++) {
      const diff = (validDates[i] - validDates[i - 1]) / (1000 * 60 * 60 * 24);
      daysDiffs.push(diff);
    }
    avgDaysBetweenOrders = roundToTwo(average(daysDiffs));
  }

  // Order status distribution
  const statusDistribution = {};
  orders.forEach(order => {
    const status = order.orderStatus || 'Unknown';
    statusDistribution[status] = (statusDistribution[status] || 0) + 1;
  });

  const statusArray = Object.entries(statusDistribution)
    .map(([status, count]) => ({
      status,
      count,
      percentage: roundToTwo(calculatePercentage(count, orders.length)),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    monthlyData,
    mostActiveMonth,
    avgDaysBetweenOrders,
    statusDistribution: statusArray,
  };
}
