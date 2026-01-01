import { describe, it, expect, vi, beforeEach } from 'vitest';
import JSZip from 'jszip';
import { extractZipFile, categorizeFiles, validateAmazonData } from './zipParser';

// Mock jszip
vi.mock('jszip');

describe('extractZipFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract CSV files from ZIP', async () => {
    const mockZipEntry1 = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content 1'),
    };
    const mockZipEntry2 = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content 2'),
    };

    const mockZipContents = new Map([
      ['file1.csv', mockZipEntry1],
      ['folder/file2.csv', mockZipEntry2],
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(2);
    expect(result.files['file1.csv']).toEqual({
      name: 'file1.csv',
      content: 'csv content 1',
      type: 'csv',
    });
    expect(result.files['folder/file2.csv']).toEqual({
      name: 'folder/file2.csv',
      content: 'csv content 2',
      type: 'csv',
    });
  });

  it('should extract image files from ZIP', async () => {
    const mockZipEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('base64imagedata'),
    };

    const mockZipContents = new Map([['photo.jpg', mockZipEntry]]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(1);
    expect(result.files['photo.jpg']).toEqual({
      name: 'photo.jpg',
      content: 'base64imagedata',
      type: 'image',
    });
    expect(mockZipEntry.async).toHaveBeenCalledWith('base64');
  });

  it('should extract multiple image types (jpg, jpeg, png, gif)', async () => {
    const mockZipEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('base64data'),
    };

    const mockZipContents = new Map([
      ['photo1.jpg', mockZipEntry],
      ['photo2.jpeg', mockZipEntry],
      ['photo3.png', mockZipEntry],
      ['photo4.gif', mockZipEntry],
      ['Photo5.JPG', mockZipEntry], // Test case insensitivity
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(5);
    expect(result.files['photo1.jpg'].type).toBe('image');
    expect(result.files['photo2.jpeg'].type).toBe('image');
    expect(result.files['photo3.png'].type).toBe('image');
    expect(result.files['photo4.gif'].type).toBe('image');
    expect(result.files['Photo5.JPG'].type).toBe('image');
  });

  it('should skip directories', async () => {
    const mockFileEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content'),
    };
    const mockDirEntry = {
      dir: true,
    };

    const mockZipContents = new Map([
      ['file.csv', mockFileEntry],
      ['folder/', mockDirEntry],
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(1);
    expect(result.files['file.csv']).toBeDefined();
    expect(result.files['folder/']).toBeUndefined();
  });

  it('should skip non-CSV and non-image files', async () => {
    const mockCsvEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content'),
    };
    const mockTextEntry = {
      dir: false,
      async: vi.fn(),
    };
    const mockPdfEntry = {
      dir: false,
      async: vi.fn(),
    };

    const mockZipContents = new Map([
      ['data.csv', mockCsvEntry],
      ['readme.txt', mockTextEntry],
      ['document.pdf', mockPdfEntry],
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(1);
    expect(result.files['data.csv']).toBeDefined();
    expect(result.files['readme.txt']).toBeUndefined();
    expect(result.files['document.pdf']).toBeUndefined();
  });

  it('should handle CSV files case-insensitively', async () => {
    const mockZipEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content'),
    };

    const mockZipContents = new Map([
      ['data.CSV', mockZipEntry],
      ['Data.CsV', mockZipEntry],
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(2);
    expect(result.files['data.CSV']).toBeDefined();
    expect(result.files['Data.CsV']).toBeDefined();
  });

  it('should handle empty ZIP file', async () => {
    const mockZipContents = new Map();

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(0);
    expect(result.files).toEqual({});
  });

  it('should handle ZIP loading errors', async () => {
    const mockZip = {
      loadAsync: vi.fn().mockRejectedValue(new Error('Invalid ZIP file')),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'invalid.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid ZIP file');
    expect(result.files).toEqual({});
  });

  it('should handle file extraction errors', async () => {
    const mockZipEntry = {
      dir: false,
      async: vi.fn().mockRejectedValue(new Error('Extraction failed')),
    };

    const mockZipContents = new Map([['corrupt.csv', mockZipEntry]]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Extraction failed');
  });

  it('should extract both CSV and image files together', async () => {
    const mockCsvEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('csv content'),
    };
    const mockImageEntry = {
      dir: false,
      async: vi.fn().mockResolvedValue('base64imagedata'),
    };

    const mockZipContents = new Map([
      ['orders.csv', mockCsvEntry],
      ['photo.jpg', mockImageEntry],
    ]);

    const mockZip = {
      loadAsync: vi.fn().mockResolvedValue({
        forEach: callback => {
          mockZipContents.forEach((entry, path) => callback(path, entry));
        },
      }),
    };

    JSZip.mockImplementation(() => mockZip);

    const mockFile = new File(['test'], 'test.zip', { type: 'application/zip' });
    const result = await extractZipFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(2);
    expect(result.files['orders.csv'].type).toBe('csv');
    expect(result.files['photo.jpg'].type).toBe('image');
    expect(mockCsvEntry.async).toHaveBeenCalledWith('string');
    expect(mockImageEntry.async).toHaveBeenCalledWith('base64');
  });
});

describe('categorizeFiles', () => {
  it('should categorize retail order history', () => {
    const files = {
      'Retail.OrderHistory.csv': { name: 'Retail.OrderHistory.csv', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.retailOrders).toBe(files['Retail.OrderHistory.csv']);
  });

  it('should categorize digital items', () => {
    const files = {
      'Digital Items.csv': { name: 'Digital Items.csv', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.digitalItems).toBe(files['Digital Items.csv']);
  });

  it('should categorize digital orders', () => {
    const files = {
      'Digital Orders.csv': { name: 'Digital Orders.csv', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.digitalOrders).toBe(files['Digital Orders.csv']);
  });

  it('should categorize digital orders monetary', () => {
    const files = {
      'Digital Orders Monetary.csv': {
        name: 'Digital Orders Monetary.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.digitalOrdersMonetary).toBe(files['Digital Orders Monetary.csv']);
  });

  it('should not categorize digital orders monetary as digital orders', () => {
    const files = {
      'Digital Orders Monetary.csv': {
        name: 'Digital Orders Monetary.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.digitalOrders).toBeNull();
    expect(result.digitalOrdersMonetary).toBe(files['Digital Orders Monetary.csv']);
  });

  it('should categorize digital returns', () => {
    const files = {
      'Digital.Orders.Returns.Transaction.csv': {
        name: 'Digital.Orders.Returns.Transaction.csv',
        content: '',
        type: 'csv',
      },
      'Digital.Orders.Returns.Monetary.csv': {
        name: 'Digital.Orders.Returns.Monetary.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.digitalReturns).toHaveLength(2);
    expect(result.digitalReturns).toContain(files['Digital.Orders.Returns.Transaction.csv']);
    expect(result.digitalReturns).toContain(files['Digital.Orders.Returns.Monetary.csv']);
  });

  it('should categorize customer returns', () => {
    const files = {
      'Retail.CustomerReturns.csv': {
        name: 'Retail.CustomerReturns.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.customerReturns).toHaveLength(1);
    expect(result.customerReturns[0]).toBe(files['Retail.CustomerReturns.csv']);
  });

  it('should categorize orders returned', () => {
    const files = {
      'Retail.OrdersReturned.csv': { name: 'Retail.OrdersReturned.csv', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.ordersReturned).toHaveLength(1);
    expect(result.ordersReturned[0]).toBe(files['Retail.OrdersReturned.csv']);
  });

  it('should categorize cart items', () => {
    const files = {
      'Retail.CartItems.csv': { name: 'Retail.CartItems.csv', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.cartItems).toHaveLength(1);
    expect(result.cartItems[0]).toBe(files['Retail.CartItems.csv']);
  });

  it('should categorize rental contracts', () => {
    const files = {
      'Retail.AmazonRentals.rental_contracts.csv': {
        name: 'Retail.AmazonRentals.rental_contracts.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.rentalContracts).toHaveLength(1);
    expect(result.rentalContracts[0]).toBe(files['Retail.AmazonRentals.rental_contracts.csv']);
  });

  it('should categorize rental events', () => {
    const files = {
      'Retail.AmazonRentals.rental_events.csv': {
        name: 'Retail.AmazonRentals.rental_events.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.rentalEvents).toHaveLength(1);
    expect(result.rentalEvents[0]).toBe(files['Retail.AmazonRentals.rental_events.csv']);
  });

  it('should categorize rental items', () => {
    const files = {
      'Retail.AmazonRentals.rental_items.csv': {
        name: 'Retail.AmazonRentals.rental_items.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.rentalItems).toHaveLength(1);
    expect(result.rentalItems[0]).toBe(files['Retail.AmazonRentals.rental_items.csv']);
  });

  it('should categorize concessions', () => {
    const files = {
      'OrdersAndReturns.CSConcessions.Concessions.csv': {
        name: 'OrdersAndReturns.CSConcessions.Concessions.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.concessions).toHaveLength(1);
    expect(result.concessions[0]).toBe(files['OrdersAndReturns.CSConcessions.Concessions.csv']);
  });

  it('should categorize photos', () => {
    const files = {
      'photo1.jpg': { name: 'photo1.jpg', content: 'base64data', type: 'image' },
      'photo2.png': { name: 'photo2.png', content: 'base64data', type: 'image' },
    };

    const result = categorizeFiles(files);

    expect(result.photos).toHaveLength(2);
    expect(result.photos).toContain(files['photo1.jpg']);
    expect(result.photos).toContain(files['photo2.png']);
  });

  it('should categorize unknown files as other', () => {
    const files = {
      'unknown.csv': { name: 'unknown.csv', content: '', type: 'csv' },
      'readme.txt': { name: 'readme.txt', content: '', type: 'text' },
    };

    const result = categorizeFiles(files);

    expect(result.other).toHaveLength(2);
    expect(result.other).toContain(files['unknown.csv']);
    expect(result.other).toContain(files['readme.txt']);
  });

  it('should handle case-insensitive file names', () => {
    const files = {
      'RETAIL.ORDERHISTORY.CSV': { name: 'RETAIL.ORDERHISTORY.CSV', content: '', type: 'csv' },
      'digital items.CSV': { name: 'digital items.CSV', content: '', type: 'csv' },
    };

    const result = categorizeFiles(files);

    expect(result.retailOrders).toBe(files['RETAIL.ORDERHISTORY.CSV']);
    expect(result.digitalItems).toBe(files['digital items.CSV']);
  });

  it('should handle multiple files of same category (arrays)', () => {
    const files = {
      'Digital.Orders.Returns.1.csv': {
        name: 'Digital.Orders.Returns.1.csv',
        content: '',
        type: 'csv',
      },
      'Digital.Orders.Returns.2.csv': {
        name: 'Digital.Orders.Returns.2.csv',
        content: '',
        type: 'csv',
      },
    };

    const result = categorizeFiles(files);

    expect(result.digitalReturns).toHaveLength(2);
  });

  it('should return all expected category keys', () => {
    const result = categorizeFiles({});

    expect(result).toHaveProperty('retailOrders');
    expect(result).toHaveProperty('digitalItems');
    expect(result).toHaveProperty('digitalOrders');
    expect(result).toHaveProperty('digitalOrdersMonetary');
    expect(result).toHaveProperty('digitalReturns');
    expect(result).toHaveProperty('customerReturns');
    expect(result).toHaveProperty('ordersReturned');
    expect(result).toHaveProperty('cartItems');
    expect(result).toHaveProperty('rentalContracts');
    expect(result).toHaveProperty('rentalEvents');
    expect(result).toHaveProperty('rentalItems');
    expect(result).toHaveProperty('concessions');
    expect(result).toHaveProperty('photos');
    expect(result).toHaveProperty('other');
  });

  it('should handle empty files object', () => {
    const result = categorizeFiles({});

    expect(result.retailOrders).toBeNull();
    expect(result.digitalItems).toBeNull();
    expect(result.digitalReturns).toEqual([]);
    expect(result.other).toEqual([]);
  });
});

describe('validateAmazonData', () => {
  it('should validate when retail orders present', () => {
    const categorizedFiles = {
      retailOrders: { name: 'orders.csv', content: '', type: 'csv' },
      digitalItems: null,
    };

    const result = validateAmazonData(categorizedFiles);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('Valid Amazon order data detected.');
    expect(result.hasRetailOrders).toBe(true);
    expect(result.hasDigitalItems).toBe(false);
  });

  it('should validate when digital items present', () => {
    const categorizedFiles = {
      retailOrders: null,
      digitalItems: { name: 'digital.csv', content: '', type: 'csv' },
    };

    const result = validateAmazonData(categorizedFiles);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('Valid Amazon order data detected.');
    expect(result.hasRetailOrders).toBe(false);
    expect(result.hasDigitalItems).toBe(true);
  });

  it('should validate when both retail and digital present', () => {
    const categorizedFiles = {
      retailOrders: { name: 'orders.csv', content: '', type: 'csv' },
      digitalItems: { name: 'digital.csv', content: '', type: 'csv' },
    };

    const result = validateAmazonData(categorizedFiles);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('Valid Amazon order data detected.');
    expect(result.hasRetailOrders).toBe(true);
    expect(result.hasDigitalItems).toBe(true);
  });

  it('should invalidate when neither retail nor digital present', () => {
    const categorizedFiles = {
      retailOrders: null,
      digitalItems: null,
    };

    const result = validateAmazonData(categorizedFiles);

    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      'No Amazon order data found. Please upload the "Your Orders.zip" file from Amazon.'
    );
  });

  it('should invalidate when only other files present', () => {
    const categorizedFiles = {
      retailOrders: null,
      digitalItems: null,
      cartItems: [{ name: 'cart.csv', content: '', type: 'csv' }],
      photos: [{ name: 'photo.jpg', content: 'base64', type: 'image' }],
    };

    const result = validateAmazonData(categorizedFiles);

    expect(result.valid).toBe(false);
    expect(result.message).toContain('No Amazon order data found');
  });
});
