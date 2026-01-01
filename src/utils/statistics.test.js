import { describe, it, expect } from 'vitest';
import {
  calculateAllStatistics,
  calculateOverviewStats,
  calculateSpendingStats,
  calculateProductStats,
  calculateReturnStats,
  calculateShippingStats,
  calculatePaymentStats,
  calculateTrends,
} from './statistics';

// Helper function to create mock orders
const createMockOrder = (overrides = {}) => ({
  orderId: '123-456',
  orderDate: new Date('2024-01-15'),
  productName: 'Test Product',
  asin: 'B001TEST',
  quantity: 1,
  unitPrice: 100,
  totalOwed: 100,
  shippingCharge: 10,
  totalDiscounts: 0,
  unitPriceTax: 8,
  isDigital: false,
  category: 'Electronics',
  hasReturn: false,
  paymentMethod: 'Visa ****1234',
  shippingOption: 'Standard',
  orderStatus: 'Closed',
  ...overrides,
});

describe('calculateAllStatistics', () => {
  it('should return all statistics categories', () => {
    const orders = [createMockOrder()];
    const result = calculateAllStatistics(orders);

    expect(result).toHaveProperty('overview');
    expect(result).toHaveProperty('spending');
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('returns');
    expect(result).toHaveProperty('shipping');
    expect(result).toHaveProperty('payments');
    expect(result).toHaveProperty('trends');
  });

  it('should return empty statistics for empty orders array', () => {
    const result = calculateAllStatistics([]);

    expect(result.overview).toEqual({});
    expect(result.spending).toEqual({});
  });

  it('should return empty statistics for null orders', () => {
    const result = calculateAllStatistics(null);

    expect(result.overview).toEqual({});
  });

  it('should handle returns parameter', () => {
    const orders = [createMockOrder({ hasReturn: true })];
    const returns = [{ returnAmount: 50, returnReason: 'Defective' }];

    const result = calculateAllStatistics(orders, returns);

    expect(result.returns.totalRefunded).toBe(50);
  });
});

describe('calculateOverviewStats', () => {
  it('should calculate basic overview statistics', () => {
    const orders = [createMockOrder({ totalOwed: 100 }), createMockOrder({ totalOwed: 200 })];

    const result = calculateOverviewStats(orders);

    expect(result.totalOrders).toBe(2);
    expect(result.totalItems).toBe(2);
    expect(result.totalSpent).toBe(300);
    expect(result.avgOrderValue).toBe(150);
  });

  it('should count total items correctly', () => {
    const orders = [
      createMockOrder({ quantity: 1 }),
      createMockOrder({ quantity: 3 }),
      createMockOrder({ quantity: 2 }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.totalItems).toBe(6);
    expect(result.avgItemsPerOrder).toBe(2);
  });

  it('should calculate shipping and discounts', () => {
    const orders = [
      createMockOrder({ shippingCharge: 5, totalDiscounts: 10 }),
      createMockOrder({ shippingCharge: 10, totalDiscounts: 20 }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.totalShipping).toBe(15);
    expect(result.totalDiscounts).toBe(30);
  });

  it('should calculate tax total', () => {
    const orders = [
      createMockOrder({ unitPriceTax: 8, quantity: 1 }),
      createMockOrder({ unitPriceTax: 10, quantity: 2 }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.totalTax).toBe(28);
  });

  it('should identify first and last order dates', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15') }),
      createMockOrder({ orderDate: new Date('2024-03-20') }),
      createMockOrder({ orderDate: new Date('2024-02-10') }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.firstOrderDate).toEqual(new Date('2024-01-15'));
    expect(result.lastOrderDate).toEqual(new Date('2024-03-20'));
  });

  it('should handle null order dates', () => {
    const orders = [
      createMockOrder({ orderDate: null }),
      createMockOrder({ orderDate: new Date('2024-01-15') }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.firstOrderDate).toEqual(new Date('2024-01-15'));
  });

  it('should count digital vs retail orders', () => {
    const orders = [
      createMockOrder({ isDigital: true }),
      createMockOrder({ isDigital: false }),
      createMockOrder({ isDigital: false }),
      createMockOrder({ isDigital: true }),
    ];

    const result = calculateOverviewStats(orders);

    expect(result.digitalOrders).toBe(2);
    expect(result.retailOrders).toBe(2);
  });

  it('should handle empty orders array', () => {
    const result = calculateOverviewStats([]);

    expect(result.totalOrders).toBe(0);
    expect(result.totalSpent).toBe(0);
    expect(result.avgOrderValue).toBe(0);
  });
});

describe('calculateSpendingStats', () => {
  it('should group spending by year', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2023-05-15'), totalOwed: 100 }),
      createMockOrder({ orderDate: new Date('2023-08-20'), totalOwed: 150 }),
      createMockOrder({ orderDate: new Date('2024-01-10'), totalOwed: 200 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.byYear).toHaveLength(2);
    expect(result.byYear[0].year).toBe(2023);
    expect(result.byYear[0].amount).toBe(250);
    expect(result.byYear[1].year).toBe(2024);
    expect(result.byYear[1].amount).toBe(200);
  });

  it('should group spending by month', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15'), totalOwed: 100 }),
      createMockOrder({ orderDate: new Date('2024-01-20'), totalOwed: 50 }),
      createMockOrder({ orderDate: new Date('2024-02-10'), totalOwed: 200 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.byMonth).toHaveLength(2);
    expect(result.byMonth[0].amount).toBe(150);
    expect(result.byMonth[1].amount).toBe(200);
  });

  it('should calculate spending by category', () => {
    const orders = [
      createMockOrder({ category: 'Electronics', totalOwed: 100 }),
      createMockOrder({ category: 'Electronics', totalOwed: 200 }),
      createMockOrder({ category: 'Books & Media', totalOwed: 50 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.byCategory[0].category).toBe('Electronics');
    expect(result.byCategory[0].amount).toBe(300);
    expect(result.byCategory[1].category).toBe('Books & Media');
    expect(result.byCategory[1].amount).toBe(50);
  });

  it('should calculate category percentages', () => {
    const orders = [
      createMockOrder({ category: 'Electronics', totalOwed: 300 }),
      createMockOrder({ category: 'Books & Media', totalOwed: 100 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.byCategory[0].percentage).toBe(75);
    expect(result.byCategory[1].percentage).toBe(25);
  });

  it('should identify highest and lowest spending months', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15'), totalOwed: 100 }),
      createMockOrder({ orderDate: new Date('2024-02-15'), totalOwed: 500 }),
      createMockOrder({ orderDate: new Date('2024-03-15'), totalOwed: 50 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.highestMonth.amount).toBe(500);
    expect(result.lowestMonth.amount).toBe(50);
  });

  it('should calculate monthly average', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15'), totalOwed: 100 }),
      createMockOrder({ orderDate: new Date('2024-02-15'), totalOwed: 200 }),
      createMockOrder({ orderDate: new Date('2024-03-15'), totalOwed: 300 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.monthlyAverage).toBe(200);
  });

  it('should calculate year-over-year growth', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2023-01-15'), totalOwed: 1000 }),
      createMockOrder({ orderDate: new Date('2024-01-15'), totalOwed: 1500 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.yoyGrowth).toBe(50);
  });

  it('should separate digital and retail spending', () => {
    const orders = [
      createMockOrder({ isDigital: true, totalOwed: 100 }),
      createMockOrder({ isDigital: true, totalOwed: 50 }),
      createMockOrder({ isDigital: false, totalOwed: 300 }),
    ];

    const result = calculateSpendingStats(orders);

    expect(result.digitalSpending).toBe(150);
    expect(result.retailSpending).toBe(300);
    expect(result.digitalPercentage).toBeCloseTo(33.33, 1);
    expect(result.retailPercentage).toBeCloseTo(66.67, 1);
  });

  it('should get last 12 months of data', () => {
    const orders = [];
    for (let i = 0; i < 24; i++) {
      orders.push(
        createMockOrder({
          orderDate: new Date(2024, i % 12, 15),
          totalOwed: 100,
        })
      );
    }

    const result = calculateSpendingStats(orders);

    expect(result.last12Months.length).toBeLessThanOrEqual(12);
  });
});

describe('calculateProductStats', () => {
  it('should count unique products by ASIN', () => {
    const orders = [
      createMockOrder({ asin: 'B001' }),
      createMockOrder({ asin: 'B002' }),
      createMockOrder({ asin: 'B001' }),
      createMockOrder({ asin: 'B003' }),
    ];

    const result = calculateProductStats(orders);

    expect(result.uniqueProducts).toBe(3);
  });

  it('should identify top products by quantity', () => {
    const orders = [
      createMockOrder({ asin: 'B001', productName: 'Product A', quantity: 5 }),
      createMockOrder({ asin: 'B002', productName: 'Product B', quantity: 3 }),
      createMockOrder({ asin: 'B001', productName: 'Product A', quantity: 2 }),
    ];

    const result = calculateProductStats(orders);

    expect(result.topByQuantity[0].name).toBe('Product A');
    expect(result.topByQuantity[0].quantity).toBe(7);
  });

  it('should identify top products by spending', () => {
    const orders = [
      createMockOrder({ asin: 'B001', productName: 'Product A', totalOwed: 100 }),
      createMockOrder({ asin: 'B002', productName: 'Product B', totalOwed: 300 }),
      createMockOrder({ asin: 'B001', productName: 'Product A', totalOwed: 50 }),
    ];

    const result = calculateProductStats(orders);

    expect(result.topBySpending[0].name).toBe('Product B');
    expect(result.topBySpending[0].totalSpent).toBe(300);
  });

  it('should calculate average product price', () => {
    const orders = [
      createMockOrder({ unitPrice: 100 }),
      createMockOrder({ unitPrice: 200 }),
      createMockOrder({ unitPrice: 300 }),
    ];

    const result = calculateProductStats(orders);

    expect(result.avgProductPrice).toBe(200);
  });

  it('should group products by price ranges', () => {
    const orders = [
      createMockOrder({ unitPrice: 5 }),
      createMockOrder({ unitPrice: 25 }),
      createMockOrder({ unitPrice: 75 }),
      createMockOrder({ unitPrice: 250 }),
      createMockOrder({ unitPrice: 1000 }),
    ];

    const result = calculateProductStats(orders);

    expect(result.priceRanges.under10).toBe(1);
    expect(result.priceRanges['10to50']).toBe(1);
    expect(result.priceRanges['50to100']).toBe(1);
    expect(result.priceRanges['100to500']).toBe(1);
    expect(result.priceRanges.over500).toBe(1);
  });

  it('should calculate top categories', () => {
    const orders = [
      createMockOrder({ category: 'Electronics' }),
      createMockOrder({ category: 'Electronics' }),
      createMockOrder({ category: 'Electronics' }),
      createMockOrder({ category: 'Books & Media' }),
    ];

    const result = calculateProductStats(orders);

    expect(result.topCategories[0].category).toBe('Electronics');
    expect(result.topCategories[0].count).toBe(3);
    expect(result.topCategories[0].percentage).toBe(75);
  });

  it('should limit to top 10 products', () => {
    const orders = [];
    for (let i = 0; i < 20; i++) {
      orders.push(
        createMockOrder({
          asin: `B${i.toString().padStart(3, '0')}`,
          productName: `Product ${i}`,
          quantity: i + 1,
        })
      );
    }

    const result = calculateProductStats(orders);

    expect(result.topByQuantity.length).toBe(10);
  });
});

describe('calculateReturnStats', () => {
  it('should count total returns', () => {
    const orders = [
      createMockOrder({ hasReturn: true }),
      createMockOrder({ hasReturn: false }),
      createMockOrder({ hasReturn: true }),
    ];

    const result = calculateReturnStats(orders, []);

    expect(result.totalReturns).toBe(2);
  });

  it('should calculate return rate', () => {
    const orders = [
      createMockOrder({ hasReturn: true }),
      createMockOrder({ hasReturn: false }),
      createMockOrder({ hasReturn: false }),
      createMockOrder({ hasReturn: false }),
    ];

    const result = calculateReturnStats(orders, []);

    expect(result.returnRate).toBe(25);
  });

  it('should calculate total refunded amount', () => {
    const orders = [createMockOrder({ hasReturn: true })];
    const returns = [{ returnAmount: 50 }, { returnAmount: 100 }, { returnAmount: 25 }];

    const result = calculateReturnStats(orders, returns);

    expect(result.totalRefunded).toBe(175);
  });

  it('should group returns by category', () => {
    const orders = [
      createMockOrder({ hasReturn: true, category: 'Electronics' }),
      createMockOrder({ hasReturn: true, category: 'Electronics' }),
      createMockOrder({ hasReturn: true, category: 'Books & Media' }),
    ];

    const result = calculateReturnStats(orders, []);

    expect(result.topReturnCategories[0].category).toBe('Electronics');
    expect(result.topReturnCategories[0].count).toBe(2);
  });

  it('should track return reasons', () => {
    const orders = [];
    const returns = [
      { returnReason: 'Defective' },
      { returnReason: 'Defective' },
      { returnReason: 'Wrong item' },
      { returnReason: 'Not as described' },
    ];

    const result = calculateReturnStats(orders, returns);

    expect(result.topReturnReasons[0].reason).toBe('Defective');
    expect(result.topReturnReasons[0].count).toBe(2);
  });

  it('should handle missing return reasons', () => {
    const orders = [];
    const returns = [{ returnAmount: 50 }];

    const result = calculateReturnStats(orders, returns);

    expect(result.topReturnReasons[0].reason).toBe('Unknown');
  });

  it('should limit to top 5 return reasons', () => {
    const orders = [];
    const returns = [];
    for (let i = 0; i < 10; i++) {
      returns.push({ returnReason: `Reason ${i}` });
    }

    const result = calculateReturnStats(orders, returns);

    expect(result.topReturnReasons.length).toBe(5);
  });

  it('should handle empty returns array', () => {
    const orders = [createMockOrder()];

    const result = calculateReturnStats(orders, []);

    expect(result.totalRefunded).toBe(0);
  });
});

describe('calculateShippingStats', () => {
  it('should calculate total shipping cost', () => {
    const orders = [
      createMockOrder({ shippingCharge: 5 }),
      createMockOrder({ shippingCharge: 10 }),
      createMockOrder({ shippingCharge: 0 }),
    ];

    const result = calculateShippingStats(orders);

    expect(result.totalShippingCost).toBe(15);
  });

  it('should calculate shipping as percentage of total', () => {
    const orders = [
      createMockOrder({ totalOwed: 100, shippingCharge: 10 }),
      createMockOrder({ totalOwed: 200, shippingCharge: 0 }),
    ];

    const result = calculateShippingStats(orders);

    expect(result.shippingPercentage).toBeCloseTo(3.33, 1);
  });

  it('should count free vs paid shipping orders', () => {
    const orders = [
      createMockOrder({ shippingCharge: 5 }),
      createMockOrder({ shippingCharge: 0 }),
      createMockOrder({ shippingCharge: 10 }),
      createMockOrder({ shippingCharge: 0 }),
    ];

    const result = calculateShippingStats(orders);

    expect(result.paidShippingOrders).toBe(2);
    expect(result.freeShippingOrders).toBe(2);
  });

  it('should calculate average shipping cost for paid orders', () => {
    const orders = [
      createMockOrder({ shippingCharge: 10 }),
      createMockOrder({ shippingCharge: 20 }),
      createMockOrder({ shippingCharge: 0 }),
    ];

    const result = calculateShippingStats(orders);

    expect(result.avgShippingCost).toBe(15);
  });

  it('should group orders by shipping method', () => {
    const orders = [
      createMockOrder({ shippingOption: 'Standard' }),
      createMockOrder({ shippingOption: 'Standard' }),
      createMockOrder({ shippingOption: 'Express' }),
      createMockOrder({ shippingOption: 'Standard' }),
    ];

    const result = calculateShippingStats(orders);

    expect(result.methods[0].method).toBe('Standard');
    expect(result.methods[0].count).toBe(3);
    expect(result.methods[0].percentage).toBe(75);
  });

  it('should handle missing shipping option', () => {
    const orders = [createMockOrder({ shippingOption: null })];

    const result = calculateShippingStats(orders);

    expect(result.methods[0].method).toBe('Unknown');
  });
});

describe('calculatePaymentStats', () => {
  it('should group orders by payment method', () => {
    const orders = [
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Mastercard ****5678' }),
    ];

    const result = calculatePaymentStats(orders);

    expect(result.methods[0].method).toBe('Visa ****1234');
    expect(result.methods[0].count).toBe(2);
  });

  it('should calculate spending per payment method', () => {
    const orders = [
      createMockOrder({ paymentMethod: 'Visa ****1234', totalOwed: 100 }),
      createMockOrder({ paymentMethod: 'Visa ****1234', totalOwed: 200 }),
      createMockOrder({ paymentMethod: 'Mastercard ****5678', totalOwed: 50 }),
    ];

    const result = calculatePaymentStats(orders);

    expect(result.methods[0].amount).toBe(300);
    expect(result.methods[1].amount).toBe(50);
  });

  it('should identify most used payment method', () => {
    const orders = [
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Mastercard ****5678' }),
    ];

    const result = calculatePaymentStats(orders);

    expect(result.mostUsedMethod).toBe('Visa ****1234');
  });

  it('should handle missing payment method', () => {
    const orders = [createMockOrder({ paymentMethod: null })];

    const result = calculatePaymentStats(orders);

    expect(result.methods[0].method).toBe('Unknown');
  });

  it('should calculate percentage of orders per method', () => {
    const orders = [
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Visa ****1234' }),
      createMockOrder({ paymentMethod: 'Mastercard ****5678' }),
    ];

    const result = calculatePaymentStats(orders);

    expect(result.methods[0].percentage).toBe(75);
    expect(result.methods[1].percentage).toBe(25);
  });
});

describe('calculateTrends', () => {
  it('should create monthly trend data', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15'), totalOwed: 100 }),
      createMockOrder({ orderDate: new Date('2024-01-20'), totalOwed: 50 }),
      createMockOrder({ orderDate: new Date('2024-02-10'), totalOwed: 200 }),
    ];

    const result = calculateTrends(orders);

    expect(result.monthlyData).toHaveLength(2);
    expect(result.monthlyData[0].orders).toBe(2);
    expect(result.monthlyData[0].spending).toBe(150);
  });

  it('should identify most active month', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-15') }),
      createMockOrder({ orderDate: new Date('2024-02-10') }),
      createMockOrder({ orderDate: new Date('2024-02-15') }),
      createMockOrder({ orderDate: new Date('2024-02-20') }),
    ];

    const result = calculateTrends(orders);

    expect(result.mostActiveMonth.orders).toBe(3);
  });

  it('should calculate average days between orders', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-01') }),
      createMockOrder({ orderDate: new Date('2024-01-11') }), // 10 days
      createMockOrder({ orderDate: new Date('2024-01-31') }), // 20 days
    ];

    const result = calculateTrends(orders);

    expect(result.avgDaysBetweenOrders).toBe(15);
  });

  it('should handle single order for days between', () => {
    const orders = [createMockOrder()];

    const result = calculateTrends(orders);

    expect(result.avgDaysBetweenOrders).toBe(0);
  });

  it('should calculate order status distribution', () => {
    const orders = [
      createMockOrder({ orderStatus: 'Closed' }),
      createMockOrder({ orderStatus: 'Closed' }),
      createMockOrder({ orderStatus: 'Closed' }),
      createMockOrder({ orderStatus: 'Cancelled' }),
    ];

    const result = calculateTrends(orders);

    expect(result.statusDistribution[0].status).toBe('Closed');
    expect(result.statusDistribution[0].count).toBe(3);
    expect(result.statusDistribution[0].percentage).toBe(75);
  });

  it('should handle missing order status', () => {
    const orders = [createMockOrder({ orderStatus: null })];

    const result = calculateTrends(orders);

    expect(result.statusDistribution[0].status).toBe('Unknown');
  });

  it('should skip null dates in days between calculation', () => {
    const orders = [
      createMockOrder({ orderDate: new Date('2024-01-01') }),
      createMockOrder({ orderDate: null }),
      createMockOrder({ orderDate: new Date('2024-01-11') }),
    ];

    const result = calculateTrends(orders);

    expect(result.avgDaysBetweenOrders).toBe(10);
  });
});
