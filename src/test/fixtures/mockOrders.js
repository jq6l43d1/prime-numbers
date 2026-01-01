// Mock order data generators for tests

export const mockOrder = (overrides = {}) => ({
  orderId: 'ORDER-123',
  orderDate: new Date('2024-01-15'),
  productName: 'Test Product',
  asin: 'B00TEST123',
  unitPrice: 29.99,
  quantity: 1,
  totalOwed: 29.99,
  shippingCharge: 0,
  totalDiscounts: 0,
  unitPriceTax: 2.5,
  orderStatus: 'Closed',
  shipmentStatus: 'Delivered',
  isDigital: false,
  currency: 'USD',
  category: 'Electronics',
  paymentMethod: 'Visa',
  hasReturn: false,
  year: 2024,
  month: 1,
  monthName: 'Jan 2024',
  ...overrides,
});

export const generateMockOrders = (count, overridesFn = () => ({})) => {
  return Array.from({ length: count }, (_, i) =>
    mockOrder({ orderId: `ORDER-${i + 1}`, ...overridesFn(i) })
  );
};

// Mock orders for different categories
export const mockOrdersWithCategories = [
  mockOrder({
    orderId: 'ORDER-1',
    productName: 'iPhone 14 Pro',
    totalOwed: 999,
    category: 'Electronics',
  }),
  mockOrder({
    orderId: 'ORDER-2',
    productName: 'Kitchen Knife Set',
    totalOwed: 49.99,
    category: 'Home & Kitchen',
  }),
  mockOrder({
    orderId: 'ORDER-3',
    productName: 'Unknown Gadget',
    totalOwed: 25,
    category: 'Other',
  }),
];

// Mock orders spanning multiple months
export const mockOrdersByMonth = [
  mockOrder({
    orderId: 'ORDER-1',
    orderDate: new Date('2024-01-15'),
    monthName: 'Jan 2024',
    month: 1,
  }),
  mockOrder({
    orderId: 'ORDER-2',
    orderDate: new Date('2024-01-20'),
    monthName: 'Jan 2024',
    month: 1,
  }),
  mockOrder({
    orderId: 'ORDER-3',
    orderDate: new Date('2024-02-10'),
    monthName: 'Feb 2024',
    month: 2,
  }),
  mockOrder({
    orderId: 'ORDER-4',
    orderDate: new Date('2024-03-05'),
    monthName: 'Mar 2024',
    month: 3,
  }),
];

// Mock orders spanning multiple years
export const mockOrdersMultiYear = [
  mockOrder({
    orderId: 'ORDER-1',
    orderDate: new Date('2022-06-15'),
    year: 2022,
    month: 6,
    monthName: 'Jun 2022',
  }),
  mockOrder({
    orderId: 'ORDER-2',
    orderDate: new Date('2023-06-15'),
    year: 2023,
    month: 6,
    monthName: 'Jun 2023',
  }),
  mockOrder({
    orderId: 'ORDER-3',
    orderDate: new Date('2024-06-15'),
    year: 2024,
    month: 6,
    monthName: 'Jun 2024',
  }),
];

// Mock orders with multi-currency
export const mockOrdersMultiCurrency = [
  mockOrder({ orderId: 'ORDER-1', currency: 'USD', totalOwed: 100 }),
  mockOrder({ orderId: 'ORDER-2', currency: 'USD', totalOwed: 200 }),
  mockOrder({ orderId: 'ORDER-3', currency: 'EUR', totalOwed: 150 }),
];

// Floating-point test cases
export const floatingPointTestCases = [
  { input: [0.1, 0.2], expected: 0.3 },
  { input: [0.3, -0.1, -0.1, -0.1], expected: 0 },
  { input: [1.005, 1.005], expected: 2.01 },
  { input: [10.1, 20.2, 30.3], expected: 60.6 },
];

// Comprehensive test data for statistics
export const mockOrdersComprehensive = [
  mockOrder({
    orderId: 'ORDER-001',
    orderDate: new Date('2024-01-15'),
    productName: 'iPhone 14 Pro',
    asin: 'B001',
    unitPrice: 999,
    quantity: 1,
    totalOwed: 999,
    shippingCharge: 0,
    totalDiscounts: 50,
    unitPriceTax: 79.92,
    isDigital: false,
    orderStatus: 'Closed',
    paymentMethod: 'Visa',
    category: 'Electronics',
    year: 2024,
    month: 1,
    monthName: 'Jan 2024',
  }),
  mockOrder({
    orderId: 'ORDER-002',
    orderDate: new Date('2024-01-20'),
    productName: 'Kindle Book',
    asin: 'B002',
    unitPrice: 9.99,
    quantity: 1,
    totalOwed: 9.99,
    shippingCharge: 0,
    totalDiscounts: 0,
    unitPriceTax: 0,
    isDigital: true,
    orderStatus: 'Closed',
    paymentMethod: 'Mastercard',
    category: 'Books & Media',
    year: 2024,
    month: 1,
    monthName: 'Jan 2024',
  }),
  mockOrder({
    orderId: 'ORDER-003',
    orderDate: new Date('2024-02-10'),
    productName: 'Coffee Maker',
    asin: 'B003',
    unitPrice: 79.99,
    quantity: 1,
    totalOwed: 79.99,
    shippingCharge: 5.99,
    totalDiscounts: 10,
    unitPriceTax: 6.4,
    isDigital: false,
    orderStatus: 'Closed',
    paymentMethod: 'Visa',
    category: 'Home & Kitchen',
    year: 2024,
    month: 2,
    monthName: 'Feb 2024',
  }),
];
