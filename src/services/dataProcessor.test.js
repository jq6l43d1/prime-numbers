import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  filterOrders,
  normalizeOrders,
  simplifyPaymentMethod,
  linkReturnsToOrders,
  processAmazonData,
} from './dataProcessor';
import * as zipParser from './zipParser';
import * as csvParser from './csvParser';
import * as categoryMapper from '../utils/categoryMapper';

// Mock dependencies
vi.mock('./zipParser');
vi.mock('./csvParser');
vi.mock('../utils/categoryMapper');

// Since the module uses internal functions, we'll test the exported filterOrders function

describe('filterOrders', () => {
  const mockOrders = [
    {
      orderId: '1',
      orderDate: new Date('2024-01-15'),
      productName: 'Laptop Computer',
      category: 'Electronics',
      orderStatus: 'Closed',
      isDigital: false,
      totalOwed: 1000,
    },
    {
      orderId: '2',
      orderDate: new Date('2024-02-20'),
      productName: 'Ebook Reader',
      category: 'Electronics',
      orderStatus: 'Closed',
      isDigital: true,
      totalOwed: 120,
    },
    {
      orderId: '3',
      orderDate: new Date('2024-03-10'),
      productName: 'Coffee Maker',
      category: 'Home & Kitchen',
      orderStatus: 'Cancelled',
      isDigital: false,
      totalOwed: 50,
    },
    {
      orderId: '4',
      orderDate: new Date('2024-04-05'),
      productName: 'Book Novel',
      category: 'Books & Media',
      orderStatus: 'Closed',
      isDigital: false,
      totalOwed: 15,
    },
  ];

  it('should return all orders when no filters applied', () => {
    const result = filterOrders(mockOrders);
    expect(result).toHaveLength(4);
  });

  it('should filter by start date', () => {
    const filters = {
      startDate: new Date('2024-02-01'),
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(3);
    expect(result[0].orderId).toBe('2');
  });

  it('should filter by end date', () => {
    const filters = {
      endDate: new Date('2024-02-28'),
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(2);
    expect(result[1].orderId).toBe('2');
  });

  it('should filter by date range', () => {
    const filters = {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-31'),
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(2);
    expect(result[0].orderId).toBe('2');
    expect(result[1].orderId).toBe('3');
  });

  it('should filter by category', () => {
    const filters = {
      category: 'Electronics',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe('Electronics');
    expect(result[1].category).toBe('Electronics');
  });

  it('should not filter when category is "all"', () => {
    const filters = {
      category: 'all',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(4);
  });

  it('should filter by order status', () => {
    const filters = {
      status: 'Cancelled',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe('3');
  });

  it('should not filter when status is "all"', () => {
    const filters = {
      status: 'all',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(4);
  });

  it('should filter digital orders', () => {
    const filters = {
      type: 'digital',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].isDigital).toBe(true);
  });

  it('should filter retail orders', () => {
    const filters = {
      type: 'retail',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(3);
    expect(result.every(o => !o.isDigital)).toBe(true);
  });

  it('should search by product name', () => {
    const filters = {
      search: 'book',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(2);
    expect(result[0].productName).toContain('Ebook');
    expect(result[1].productName).toContain('Book');
  });

  it('should search case-insensitively', () => {
    const filters = {
      search: 'LAPTOP',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe('Laptop Computer');
  });

  it('should combine multiple filters', () => {
    const filters = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      category: 'Electronics',
      type: 'retail',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe('1');
  });

  it('should handle orders without orderDate when filtering by date', () => {
    const ordersWithNull = [
      ...mockOrders,
      {
        orderId: '5',
        orderDate: null,
        productName: 'No Date Product',
        category: 'Other',
        orderStatus: 'Closed',
        isDigital: false,
      },
    ];

    const filters = {
      startDate: new Date('2024-01-01'),
    };
    const result = filterOrders(ordersWithNull, filters);

    expect(result).toHaveLength(4);
    expect(result.every(o => o.orderDate !== null)).toBe(true);
  });

  it('should handle orders without productName when searching', () => {
    const ordersWithoutName = [
      ...mockOrders,
      {
        orderId: '5',
        orderDate: new Date('2024-05-01'),
        productName: null,
        category: 'Other',
      },
    ];

    const filters = {
      search: 'test',
    };
    const result = filterOrders(ordersWithoutName, filters);

    expect(result).toHaveLength(0);
  });

  it('should handle empty filters object', () => {
    const result = filterOrders(mockOrders, {});
    expect(result).toHaveLength(4);
  });

  it('should handle empty orders array', () => {
    const result = filterOrders([], { search: 'test' });
    expect(result).toEqual([]);
  });

  it('should not mutate original orders array', () => {
    const original = [...mockOrders];
    const filters = { category: 'Electronics' };

    filterOrders(mockOrders, filters);

    expect(mockOrders).toEqual(original);
  });

  it('should filter orders matching all criteria when multiple filters are combined', () => {
    const filters = {
      startDate: new Date('2024-01-01'),
      category: 'Electronics',
      status: 'Closed',
      search: 'laptop',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe('1');
  });

  it('should return empty array when no orders match filters', () => {
    const filters = {
      category: 'Nonexistent Category',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toEqual([]);
  });

  it('should handle partial product name matches', () => {
    const filters = {
      search: 'com',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe('Laptop Computer');
  });

  it('should filter correctly with only type filter', () => {
    const filters = {
      type: 'digital',
    };
    const result = filterOrders(mockOrders, filters);

    expect(result.length).toBeGreaterThan(0);
    expect(result.every(o => o.isDigital)).toBe(true);
  });

  it('should handle boundary date cases', () => {
    const filters = {
      startDate: new Date('2024-02-20'),
      endDate: new Date('2024-02-20'),
    };
    const result = filterOrders(mockOrders, filters);

    expect(result).toHaveLength(1);
    expect(result[0].orderId).toBe('2');
  });
});

describe('normalizeOrders', () => {
  it('should normalize order data with all fields', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-06-15'),
        unitPrice: '29.99',
        quantity: '2',
        totalOwed: '59.98',
        shippingCharge: '5.00',
        totalDiscounts: '-3.00',
        unitPriceTax: '2.50',
        paymentInstrumentType: 'Visa - 1234',
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].unitPrice).toBe(29.99);
    expect(result[0].quantity).toBe(2);
    expect(result[0].totalOwed).toBe(59.98);
    expect(result[0].shippingCharge).toBe(5.0);
    expect(result[0].totalDiscounts).toBe(3.0); // Absolute value
    expect(result[0].unitPriceTax).toBe(2.5);
    expect(result[0].year).toBe(2024);
    expect(result[0].month).toBe(6);
    expect(result[0].monthName).toBe('Jun 2024');
    expect(result[0].paymentMethod).toBe('Visa');
    expect(result[0].hasReturn).toBe(false);
    expect(result[0].returnInfo).toBeNull();
  });

  it('should handle missing fields with defaults', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].unitPrice).toBe(0);
    expect(result[0].quantity).toBe(1);
    expect(result[0].totalOwed).toBe(0);
    expect(result[0].shippingCharge).toBe(0);
    expect(result[0].totalDiscounts).toBe(0);
    expect(result[0].unitPriceTax).toBe(0);
  });

  it('should handle null order date', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: null,
        totalOwed: '10.00',
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].year).toBeNull();
    expect(result[0].month).toBeNull();
  });

  it('should set default order status when missing', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].orderStatus).toBe('Unknown');
    expect(result[0].shipmentStatus).toBe('Unknown');
  });

  it('should preserve existing order status', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
        orderStatus: 'Closed',
        shipmentStatus: 'Delivered',
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].orderStatus).toBe('Closed');
    expect(result[0].shipmentStatus).toBe('Delivered');
  });

  it('should handle invalid numeric values', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
        unitPrice: 'invalid',
        quantity: 'abc',
        totalOwed: null,
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].unitPrice).toBe(0);
    expect(result[0].quantity).toBe(1);
    expect(result[0].totalOwed).toBe(0);
  });

  it('should make discounts absolute value', () => {
    const orders = [
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
        totalDiscounts: '-10.50',
      },
      {
        orderId: '2',
        orderDate: new Date('2024-01-02'),
        totalDiscounts: '5.00',
      },
    ];

    const result = normalizeOrders(orders);

    expect(result[0].totalDiscounts).toBe(10.5);
    expect(result[1].totalDiscounts).toBe(5.0);
  });

  it('should handle empty array', () => {
    const result = normalizeOrders([]);
    expect(result).toEqual([]);
  });
});

describe('simplifyPaymentMethod', () => {
  it('should identify Visa cards', () => {
    expect(simplifyPaymentMethod('Visa - 1234')).toBe('Visa');
    expect(simplifyPaymentMethod('VISA ending in 5678')).toBe('Visa');
    expect(simplifyPaymentMethod('visa card')).toBe('Visa');
  });

  it('should identify Mastercard', () => {
    expect(simplifyPaymentMethod('Mastercard - 1234')).toBe('Mastercard');
    expect(simplifyPaymentMethod('MASTERCARD ending in 5678')).toBe('Mastercard');
    expect(simplifyPaymentMethod('mastercard')).toBe('Mastercard');
  });

  it('should identify American Express', () => {
    expect(simplifyPaymentMethod('American Express - 1234')).toBe('American Express');
    expect(simplifyPaymentMethod('Amex - 5678')).toBe('American Express');
    expect(simplifyPaymentMethod('AMEX')).toBe('American Express');
  });

  it('should identify Discover cards', () => {
    expect(simplifyPaymentMethod('Discover - 1234')).toBe('Discover');
    expect(simplifyPaymentMethod('DISCOVER card')).toBe('Discover');
  });

  it('should identify Gift Cards', () => {
    expect(simplifyPaymentMethod('Gift Card')).toBe('Gift Card');
    expect(simplifyPaymentMethod('Amazon Gift Card')).toBe('Gift Card');
    expect(simplifyPaymentMethod('gift card balance')).toBe('Gift Card');
  });

  it('should identify Digital Payment', () => {
    expect(simplifyPaymentMethod('Digital Payment')).toBe('Digital Payment');
    expect(simplifyPaymentMethod('digital wallet')).toBe('Digital Payment');
  });

  it('should return "Other" for unknown payment methods', () => {
    expect(simplifyPaymentMethod('PayPal')).toBe('Other');
    expect(simplifyPaymentMethod('Bitcoin')).toBe('Other');
    expect(simplifyPaymentMethod('Unknown Method')).toBe('Other');
  });

  it('should return "Unknown" for null or undefined', () => {
    expect(simplifyPaymentMethod(null)).toBe('Unknown');
    expect(simplifyPaymentMethod(undefined)).toBe('Unknown');
    expect(simplifyPaymentMethod('')).toBe('Unknown');
  });

  it('should be case insensitive', () => {
    expect(simplifyPaymentMethod('VISA')).toBe('Visa');
    expect(simplifyPaymentMethod('visa')).toBe('Visa');
    expect(simplifyPaymentMethod('ViSa')).toBe('Visa');
  });
});

describe('linkReturnsToOrders', () => {
  it('should link returns to orders', () => {
    const orders = [
      { orderId: '1', productName: 'Product 1' },
      { orderId: '2', productName: 'Product 2' },
    ];

    const returns = [{ orderId: '1', returnAmount: 10.0, returnReason: 'Defective' }];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].hasReturn).toBe(true);
    expect(result[0].returnInfo).toHaveLength(1);
    expect(result[0].returnInfo[0].returnReason).toBe('Defective');
    expect(result[1].hasReturn).toBeUndefined();
  });

  it('should link multiple returns to same order', () => {
    const orders = [{ orderId: '1', productName: 'Product 1' }];

    const returns = [
      { orderId: '1', returnAmount: 10.0, returnReason: 'Defective' },
      { orderId: '1', returnAmount: 5.0, returnReason: 'Wrong item' },
    ];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].hasReturn).toBe(true);
    expect(result[0].returnInfo).toHaveLength(2);
  });

  it('should handle orders without returns', () => {
    const orders = [
      { orderId: '1', productName: 'Product 1' },
      { orderId: '2', productName: 'Product 2' },
    ];

    const returns = [];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].hasReturn).toBeUndefined();
    expect(result[1].hasReturn).toBeUndefined();
  });

  it('should skip returns without order ID', () => {
    const orders = [{ orderId: '1', productName: 'Product 1' }];

    const returns = [
      { orderId: null, returnAmount: 10.0 },
      { orderId: '', returnAmount: 5.0 },
      { returnAmount: 3.0 },
    ];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].hasReturn).toBeUndefined();
  });

  it('should handle returns for non-existent orders', () => {
    const orders = [{ orderId: '1', productName: 'Product 1' }];

    const returns = [{ orderId: '999', returnAmount: 10.0 }];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].hasReturn).toBeUndefined();
  });

  it('should handle empty orders array', () => {
    const returns = [{ orderId: '1', returnAmount: 10.0 }];

    const result = linkReturnsToOrders([], returns);

    expect(result).toEqual([]);
  });

  it('should handle empty returns array', () => {
    const orders = [{ orderId: '1', productName: 'Product 1' }];

    const result = linkReturnsToOrders(orders, []);

    expect(result[0].hasReturn).toBeUndefined();
  });

  it('should preserve all original order properties', () => {
    const orders = [
      {
        orderId: '1',
        productName: 'Product 1',
        totalOwed: 100,
        category: 'Electronics',
        isDigital: false,
      },
    ];

    const returns = [{ orderId: '1', returnAmount: 10.0 }];

    const result = linkReturnsToOrders(orders, returns);

    expect(result[0].orderId).toBe('1');
    expect(result[0].productName).toBe('Product 1');
    expect(result[0].totalOwed).toBe(100);
    expect(result[0].category).toBe('Electronics');
    expect(result[0].isDigital).toBe(false);
  });
});

describe('processAmazonData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process ZIP file with retail orders', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': {
          name: 'Retail.OrderHistory.csv',
          content: 'csv content',
          type: 'csv',
        },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'csv content', type: 'csv' },
      digitalItems: null,
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid Amazon order data detected.',
    });

    csvParser.parseRetailOrders.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-15'),
        productName: 'Product 1',
        totalOwed: 100,
        isDigital: false,
        quantity: 1,
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const onProgress = vi.fn();
    const result = await processAmazonData(mockFile, onProgress);

    expect(result.success).toBe(true);
    expect(result.orders).toHaveLength(1);
    expect(result.summary.totalOrders).toBe(1);
    expect(result.summary.totalSpent).toBe(100);
    expect(onProgress).toHaveBeenCalled();
  });

  it('should process ZIP file with digital items', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Digital Items.csv': { name: 'Digital Items.csv', content: 'csv content', type: 'csv' },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: null,
      digitalItems: { name: 'Digital Items.csv', content: 'csv content', type: 'csv' },
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid Amazon order data detected.',
    });

    csvParser.parseDigitalItems.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-15'),
        productName: 'Digital Product',
        totalOwed: 50,
        isDigital: true,
        quantity: 1,
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const result = await processAmazonData(mockFile);

    expect(result.success).toBe(true);
    expect(result.orders).toHaveLength(1);
    expect(result.summary.digitalOrders).toBe(1);
  });

  it('should process returns data', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': {
          name: 'Retail.OrderHistory.csv',
          content: 'csv content',
          type: 'csv',
        },
        'Retail.CustomerReturns.csv': {
          name: 'Retail.CustomerReturns.csv',
          content: 'returns csv',
          type: 'csv',
        },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'csv content', type: 'csv' },
      digitalItems: null,
      customerReturns: [
        { name: 'Retail.CustomerReturns.csv', content: 'returns csv', type: 'csv' },
      ],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid Amazon order data detected.',
    });

    csvParser.parseRetailOrders.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-15'),
        productName: 'Product 1',
        totalOwed: 100,
        isDigital: false,
        quantity: 1,
      },
    ]);

    csvParser.parseReturns.mockResolvedValue([
      {
        orderId: '1',
        returnAmount: 100,
        returnReason: 'Defective',
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const result = await processAmazonData(mockFile);

    expect(result.success).toBe(true);
    expect(result.returns).toHaveLength(1);
    expect(result.summary.totalReturns).toBe(1);
    expect(result.orders[0].hasReturn).toBe(true);
  });

  it('should handle ZIP extraction errors', async () => {
    const mockFile = new File(['test'], 'invalid.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: false,
      error: 'Invalid ZIP file',
    });

    const result = await processAmazonData(mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid ZIP file');
    expect(result.orders).toEqual([]);
  });

  it('should handle validation errors', async () => {
    const mockFile = new File(['test'], 'empty.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {},
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: null,
      digitalItems: null,
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: false,
      message: 'No Amazon order data found.',
    });

    const result = await processAmazonData(mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No Amazon order data found.');
  });

  it('should continue processing even if retail orders fail', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': {
          name: 'Retail.OrderHistory.csv',
          content: 'bad csv',
          type: 'csv',
        },
        'Digital Items.csv': { name: 'Digital Items.csv', content: 'good csv', type: 'csv' },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'bad csv', type: 'csv' },
      digitalItems: { name: 'Digital Items.csv', content: 'good csv', type: 'csv' },
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid Amazon order data detected.',
    });

    csvParser.parseRetailOrders.mockRejectedValue(new Error('Parse error'));
    csvParser.parseDigitalItems.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-15'),
        productName: 'Digital Product',
        totalOwed: 50,
        isDigital: true,
        quantity: 1,
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const result = await processAmazonData(mockFile);

    expect(result.success).toBe(true);
    expect(result.orders).toHaveLength(1);
  });

  it('should sort orders by date (most recent first)', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      digitalItems: null,
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid.',
    });

    csvParser.parseRetailOrders.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
        productName: 'Product 1',
        totalOwed: 10,
        isDigital: false,
        quantity: 1,
      },
      {
        orderId: '2',
        orderDate: new Date('2024-03-01'),
        productName: 'Product 2',
        totalOwed: 20,
        isDigital: false,
        quantity: 1,
      },
      {
        orderId: '3',
        orderDate: new Date('2024-02-01'),
        productName: 'Product 3',
        totalOwed: 15,
        isDigital: false,
        quantity: 1,
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const result = await processAmazonData(mockFile);

    expect(result.orders[0].orderId).toBe('2'); // March
    expect(result.orders[1].orderId).toBe('3'); // February
    expect(result.orders[2].orderId).toBe('1'); // January
  });

  it('should calculate summary statistics correctly', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      digitalItems: null,
      customerReturns: [],
      ordersReturned: [],
      photos: [{ name: 'photo.jpg', type: 'image' }],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid.',
    });

    csvParser.parseRetailOrders.mockResolvedValue([
      {
        orderId: '1',
        orderDate: new Date('2024-01-01'),
        productName: 'Product 1',
        totalOwed: 100,
        isDigital: false,
        quantity: 2,
      },
      {
        orderId: '2',
        orderDate: new Date('2024-01-02'),
        productName: 'Product 2',
        totalOwed: 50,
        isDigital: false,
        quantity: 1,
      },
    ]);

    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    const result = await processAmazonData(mockFile);

    expect(result.summary.totalOrders).toBe(2);
    expect(result.summary.totalSpent).toBe(150);
    expect(result.summary.totalItems).toBe(3);
    expect(result.summary.retailOrders).toBe(2);
    expect(result.summary.digitalOrders).toBe(0);
    expect(result.summary.totalPhotos).toBe(1);
  });

  it('should call onProgress callback at each step', async () => {
    const mockFile = new File(['test'], 'orders.zip', { type: 'application/zip' });
    const onProgress = vi.fn();

    zipParser.extractZipFile.mockResolvedValue({
      success: true,
      files: {
        'Retail.OrderHistory.csv': { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      },
    });

    zipParser.categorizeFiles.mockReturnValue({
      retailOrders: { name: 'Retail.OrderHistory.csv', content: 'csv', type: 'csv' },
      digitalItems: null,
      customerReturns: [],
      ordersReturned: [],
      photos: [],
    });

    zipParser.validateAmazonData.mockReturnValue({
      valid: true,
      message: 'Valid.',
    });

    csvParser.parseRetailOrders.mockResolvedValue([]);
    categoryMapper.categorizeProducts.mockImplementation(orders => orders);

    await processAmazonData(mockFile, onProgress);

    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'extracting', progress: 10 })
    );
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'categorizing', progress: 20 })
    );
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'parsing-retail', progress: 30 })
    );
    expect(onProgress).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'complete', progress: 100 })
    );
  });
});
