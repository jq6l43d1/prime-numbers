import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Papa from 'papaparse';
import { parseCSV, parseRetailOrders, parseDigitalItems, parseReturns } from './csvParser';

// Mock papaparse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('parseCSV', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully parse CSV content', async () => {
    const mockData = [
      { name: 'Product 1', price: '10.00' },
      { name: 'Product 2', price: '20.00' },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      // Simulate successful parse
      setTimeout(() => {
        config.complete({
          data: mockData,
          errors: [],
          meta: { fields: ['name', 'price'] },
        });
      }, 0);
    });

    const result = await parseCSV('name,price\nProduct 1,10.00\nProduct 2,20.00');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.errors).toEqual([]);
    expect(result.meta).toEqual({ fields: ['name', 'price'] });
  });

  it('should handle parse errors', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.error(new Error('Parse failed'));
      }, 0);
    });

    await expect(parseCSV('invalid csv')).rejects.toEqual({
      success: false,
      error: 'Parse failed',
      data: [],
    });
  });

  it('should pass options to Papa.parse', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: [], errors: [], meta: {} });
      }, 0);
    });

    const customOptions = {
      delimiter: ';',
      comments: '#',
    };

    await parseCSV('test', customOptions);

    expect(Papa.default.parse).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({
        delimiter: ';',
        comments: '#',
      })
    );
  });

  it('should clean header names (remove BOM)', async () => {
    let transformHeaderFunc;

    Papa.default.parse.mockImplementation((content, config) => {
      transformHeaderFunc = config.transformHeader;
      setTimeout(() => {
        config.complete({ data: [], errors: [], meta: {} });
      }, 0);
    });

    await parseCSV('test');

    // Test the transformHeader function
    expect(transformHeaderFunc('\uFEFFProduct Name')).toBe('Product Name');
    expect(transformHeaderFunc('  Price  ')).toBe('Price');
    expect(transformHeaderFunc('\uFEFF  Name  ')).toBe('Name');
  });

  it('should use chunked processing when chunk option is provided', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: [], errors: [], meta: {} });
      }, 0);
    });

    const chunkCallback = vi.fn();
    await parseCSV('test', { chunk: chunkCallback });

    expect(Papa.default.parse).toHaveBeenCalledWith(
      'test',
      expect.objectContaining({
        chunk: chunkCallback,
        chunkSize: 1024 * 1024,
      })
    );
  });
});

describe('parseRetailOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse retail orders correctly', async () => {
    const mockCsvData = [
      {
        Website: 'Amazon.com',
        'Order ID': 'ORDER-123',
        'Order Date': '2025-01-01',
        'Purchase Order Number': 'PO-123',
        Currency: 'USD',
        'Unit Price': '29.99',
        'Unit Price Tax': '2.50',
        'Shipping Charge': '5.00',
        'Total Discounts': '3.00',
        'Total Owed': '34.49',
        'Shipment Item Subtotal': '29.99',
        'Shipment Item Subtotal Tax': '2.50',
        ASIN: 'B001234567',
        'Product Condition': 'New',
        Quantity: '2',
        'Payment Instrument Type': 'Visa - 1234',
        'Order Status': 'Closed',
        'Shipment Status': 'Delivered',
        'Ship Date': '2025-01-02',
        'Shipping Option': 'Standard',
        'Shipping Address': '123 Main St',
        'Billing Address': '123 Main St',
        'Carrier Name & Tracking Number': 'UPS - 1Z999',
        'Product Name': 'Test Product',
        'Gift Message': 'Happy Birthday!',
        'Gift Sender Name': 'John Doe',
        'Gift Recipient Contact Details': 'jane@example.com',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      website: 'Amazon.com',
      orderId: 'ORDER-123',
      orderDate: new Date('2025-01-01'),
      currency: 'USD',
      unitPrice: 29.99,
      unitPriceTax: 2.5,
      shippingCharge: 5.0,
      totalDiscounts: 3.0,
      totalOwed: 34.49,
      asin: 'B001234567',
      productCondition: 'New',
      quantity: 2,
      paymentInstrumentType: 'Visa - 1234',
      orderStatus: 'Closed',
      shipmentStatus: 'Delivered',
      productName: 'Test Product',
      giftMessage: 'Happy Birthday!',
      giftSenderName: 'John Doe',
      giftRecipientContactDetails: 'jane@example.com',
      isDigital: false,
    });
  });

  it('should handle missing optional fields with defaults', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-456',
        'Order Date': '2025-01-05',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({
      orderId: 'ORDER-456',
      website: '',
      currency: 'USD',
      unitPrice: 0,
      unitPriceTax: 0,
      shippingCharge: 0,
      totalDiscounts: 0,
      totalOwed: 0,
      quantity: 1,
      isDigital: false,
    });
  });

  it('should parse numeric values with quotes', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-789',
        'Order Date': '2025-01-10',
        'Unit Price': '"49.99"',
        'Unit Price Tax': "'4.00'",
        Quantity: '3',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders[0].unitPrice).toBe(49.99);
    expect(orders[0].unitPriceTax).toBe(4.0);
    expect(orders[0].quantity).toBe(3);
  });

  it('should filter out empty rows without Order ID', async () => {
    const mockCsvData = [
      { 'Order ID': 'ORDER-123', 'Product Name': 'Product 1' },
      { 'Order ID': '', 'Product Name': 'Product 2' },
      { 'Order ID': 'ORDER-456', 'Product Name': 'Product 3' },
      { 'Product Name': 'Product 4' },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders).toHaveLength(2);
    expect(orders[0].orderId).toBe('ORDER-123');
    expect(orders[1].orderId).toBe('ORDER-456');
  });

  it('should handle invalid date values', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-999',
        'Order Date': 'invalid-date',
        'Ship Date': '',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders[0].orderDate).toBeInstanceOf(Date);
    expect(orders[0].shipDate).toBeNull();
  });

  it('should handle parsing errors', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.error(new Error('Parse error'));
      }, 0);
    });

    await expect(parseRetailOrders('invalid csv')).rejects.toThrow();
  });

  it('should trim gift message fields', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-GIFT',
        'Gift Message': '  Happy Birthday!  ',
        'Gift Sender Name': '  John  ',
        'Gift Recipient Contact Details': '  jane@example.com  ',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders[0].giftMessage).toBe('Happy Birthday!');
    expect(orders[0].giftSenderName).toBe('John');
    expect(orders[0].giftRecipientContactDetails).toBe('jane@example.com');
  });

  it('should handle malformed numeric values', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-BAD',
        'Unit Price': 'abc',
        Quantity: 'xyz',
        'Total Owed': '',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const orders = await parseRetailOrders('csv content');

    expect(orders[0].unitPrice).toBe(0);
    expect(orders[0].quantity).toBe(1); // Falls back to default
    expect(orders[0].totalOwed).toBe(0);
  });
});

describe('parseDigitalItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse digital items correctly', async () => {
    const mockCsvData = [
      {
        ASIN: 'B00DIGITAL',
        ProductName: 'Digital Book',
        OrderId: 'DIG-ORDER-123',
        OrderDate: '2025-01-01',
        OriginalQuantity: '1',
        OurPrice: '9.99',
        OurPriceCurrencyCode: 'USD',
        OurPriceTax: '0.80',
        Marketplace: 'Amazon.com',
        FulfilledDate: '2025-01-01',
        IsFulfilled: 'Yes',
        SellerOfRecord: 'Amazon Digital Services',
        GiftItem: 'No',
        IsOrderEligibleForPrimeBenefit: 'Yes',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      asin: 'B00DIGITAL',
      productName: 'Digital Book',
      orderId: 'DIG-ORDER-123',
      orderDate: new Date('2025-01-01'),
      quantity: 1,
      unitPrice: 9.99,
      currency: 'USD',
      unitPriceTax: 0.8,
      marketplace: 'Amazon.com',
      fulfilledDate: new Date('2025-01-01'),
      isFulfilled: true,
      sellerOfRecord: 'Amazon Digital Services',
      isGift: false,
      isEligibleForPrime: true,
      isDigital: true,
      orderStatus: 'Closed',
      shipmentStatus: 'Delivered',
      shippingCharge: 0,
      totalDiscounts: 0,
      totalOwed: 9.99,
      paymentInstrumentType: 'Digital Payment',
    });
  });

  it('should handle missing optional fields', async () => {
    const mockCsvData = [
      {
        OrderId: 'DIG-ORDER-456',
        OrderDate: '2025-01-05',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      orderId: 'DIG-ORDER-456',
      asin: '',
      productName: '',
      currency: 'USD',
      unitPrice: 0,
      quantity: 1,
      isDigital: true,
    });
  });

  it('should parse boolean fields correctly', async () => {
    const mockCsvData = [
      {
        OrderId: 'DIG-BOOL-TEST',
        IsFulfilled: 'Yes',
        GiftItem: 'Yes',
        IsOrderEligibleForPrimeBenefit: 'No',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items[0].isFulfilled).toBe(true);
    expect(items[0].isGift).toBe(true);
    expect(items[0].isEligibleForPrime).toBe(false);
  });

  it('should filter out empty rows without OrderId', async () => {
    const mockCsvData = [
      { OrderId: 'DIG-123', ProductName: 'Product 1' },
      { OrderId: '', ProductName: 'Product 2' },
      { OrderId: 'DIG-456', ProductName: 'Product 3' },
      { ProductName: 'Product 4' },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items).toHaveLength(2);
    expect(items[0].orderId).toBe('DIG-123');
    expect(items[1].orderId).toBe('DIG-456');
  });

  it('should handle parsing errors', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.error(new Error('Parse error'));
      }, 0);
    });

    await expect(parseDigitalItems('invalid csv')).rejects.toThrow();
  });

  it('should parse numeric values with quotes', async () => {
    const mockCsvData = [
      {
        OrderId: 'DIG-789',
        OurPrice: '"19.99"',
        OurPriceTax: "'1.60'",
        OriginalQuantity: '2',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items[0].unitPrice).toBe(19.99);
    expect(items[0].unitPriceTax).toBe(1.6);
    expect(items[0].quantity).toBe(2);
  });

  it('should calculate totalOwed from OurPrice', async () => {
    const mockCsvData = [
      {
        OrderId: 'DIG-PRICE',
        OurPrice: '14.99',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items[0].totalOwed).toBe(14.99);
    expect(items[0].unitPrice).toBe(14.99);
  });

  it('should handle invalid date values', async () => {
    const mockCsvData = [
      {
        OrderId: 'DIG-DATE',
        OrderDate: 'invalid-date',
        FulfilledDate: '',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const items = await parseDigitalItems('csv content');

    expect(items[0].orderDate).toBeInstanceOf(Date);
    expect(items[0].fulfilledDate).toBeNull();
  });
});

describe('parseReturns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse returns correctly', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-123',
        'Return Order ID': 'RETURN-123',
        'Return Creation Date': '2025-01-15',
        'Return Amount': '29.99',
        'Return Reason': 'Defective',
        'Return Status': 'Completed',
        'Quantity Returned': '1',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns).toHaveLength(1);
    expect(returns[0]).toMatchObject({
      orderId: 'ORDER-123',
      returnOrderId: 'RETURN-123',
      returnDate: '2025-01-15',
      returnAmount: 29.99,
      returnReason: 'Defective',
      returnStatus: 'Completed',
      quantityReturned: 1,
    });
  });

  it('should handle alternative column names', async () => {
    const mockCsvData = [
      {
        'order identifier': 'ORDER-456',
        'return order identifier': 'RETURN-456',
        'return date': '2025-01-20',
        'refund amount': '15.50',
        'return reason': 'Not as described',
        'return status': 'Pending',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns).toHaveLength(1);
    expect(returns[0]).toMatchObject({
      orderId: 'ORDER-456',
      returnOrderId: 'RETURN-456',
      returnDate: '2025-01-20',
      returnAmount: 15.5,
      returnReason: 'Not as described',
      returnStatus: 'Pending',
    });
  });

  it('should handle missing optional fields', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-789',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns).toHaveLength(1);
    expect(returns[0]).toMatchObject({
      orderId: 'ORDER-789',
      returnOrderId: '',
      returnDate: '',
      returnAmount: 0,
      returnReason: '',
      returnStatus: '',
      quantityReturned: 1,
    });
  });

  it('should filter out empty rows without Order ID', async () => {
    const mockCsvData = [
      { 'Order ID': 'ORDER-123', 'Return Reason': 'Defective' },
      { 'Order ID': '', 'Return Reason': 'Late' },
      { 'Order ID': 'ORDER-456', 'Return Reason': 'Changed mind' },
      { 'Return Reason': 'No ID' },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns).toHaveLength(2);
    expect(returns[0].orderId).toBe('ORDER-123');
    expect(returns[1].orderId).toBe('ORDER-456');
  });

  it('should parse numeric values with quotes', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-QUOTES',
        'Return Amount': '"49.99"',
        'Quantity Returned': '3',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns[0].returnAmount).toBe(49.99);
    expect(returns[0].quantityReturned).toBe(3);
  });

  it('should handle parsing errors', async () => {
    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.error(new Error('Parse error'));
      }, 0);
    });

    await expect(parseReturns('invalid csv')).rejects.toThrow();
  });

  it('should handle malformed numeric values', async () => {
    const mockCsvData = [
      {
        'Order ID': 'ORDER-BAD-NUMS',
        'Return Amount': 'invalid',
        'Quantity Returned': 'abc',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns[0].returnAmount).toBe(0);
    expect(returns[0].quantityReturned).toBe(1); // Falls back to default
  });

  it('should prioritize standard column names over alternative names', async () => {
    const mockCsvData = [
      {
        'Order ID': 'STANDARD-ID',
        'order identifier': 'ALT-ID',
        'Return Amount': '25.00',
        'refund amount': '30.00',
      },
    ];

    Papa.default.parse.mockImplementation((content, config) => {
      setTimeout(() => {
        config.complete({ data: mockCsvData, errors: [], meta: {} });
      }, 0);
    });

    const returns = await parseReturns('csv content');

    expect(returns[0].orderId).toBe('STANDARD-ID');
    expect(returns[0].returnAmount).toBe(25.0);
  });
});
