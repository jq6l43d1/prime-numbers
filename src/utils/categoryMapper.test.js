import { describe, it, expect } from 'vitest';
import {
  categorizeProduct,
  categorizeProducts,
  getCategoryDistribution,
  getSpendingByCategory,
  getAllCategoryNames,
} from './categoryMapper';

describe('categorizeProduct', () => {
  it('should categorize electronics products', () => {
    expect(categorizeProduct('iPhone 15 Pro')).toBe('Electronics');
    expect(categorizeProduct('Samsung Galaxy Tablet')).toBe('Electronics');
    expect(categorizeProduct('Wireless Bluetooth Headphones')).toBe('Electronics');
    expect(categorizeProduct('USB-C Cable')).toBe('Electronics');
    expect(categorizeProduct('Gaming Console')).toBe('Electronics');
  });

  it('should categorize home & kitchen products', () => {
    expect(categorizeProduct('Storage Container')).toBe('Home & Kitchen');
    expect(categorizeProduct('Kitchen Knife Set')).toBe('Home & Kitchen');
    expect(categorizeProduct('Office Desk Chair')).toBe('Home & Kitchen');
    expect(categorizeProduct('Lamp Light')).toBe('Home & Kitchen');
  });

  it('should categorize books & media products', () => {
    expect(categorizeProduct('Paperback Novel')).toBe('Books & Media');
    expect(categorizeProduct('Ebook Download')).toBe('Books & Media'); // Ebook is Books & Media
    expect(categorizeProduct('DVD Movie Collection')).toBe('Books & Media');
    expect(categorizeProduct('Music Album CD')).toBe('Books & Media');
  });

  it('should categorize clothing & accessories products', () => {
    expect(categorizeProduct('T-Shirt Blue')).toBe('Clothing & Accessories');
    expect(categorizeProduct('Running Shoes')).toBe('Clothing & Accessories');
    expect(categorizeProduct('Backpack Travel')).toBe('Clothing & Accessories');
    expect(categorizeProduct('Leather Wallet')).toBe('Clothing & Accessories');
  });

  it('should categorize health & personal care products', () => {
    expect(categorizeProduct('Vitamin D Supplement')).toBe('Health & Personal Care');
    expect(categorizeProduct('Shampoo and Conditioner')).toBe('Health & Personal Care');
    expect(categorizeProduct('Electric Toothbrush')).toBe('Health & Personal Care');
    expect(categorizeProduct('Face Moisturizer Cream')).toBe('Health & Personal Care');
  });

  it('should categorize prime membership', () => {
    expect(categorizeProduct('Amazon Prime Membership')).toBe('Prime Membership');
    expect(categorizeProduct('Prime Video Subscription')).toBe('Prime Membership');
  });

  it('should categorize grocery & gourmet products', () => {
    expect(categorizeProduct('Coffee Beans')).toBe('Grocery & Gourmet');
    expect(categorizeProduct('Chocolate Chips')).toBe('Grocery & Gourmet');
    expect(categorizeProduct('Granola Bar Pack')).toBe('Grocery & Gourmet'); // Granola is Grocery
  });

  it('should categorize sports & outdoors products', () => {
    expect(categorizeProduct('Yoga Mat')).toBe('Sports & Outdoors');
    expect(categorizeProduct('Camping Tent')).toBe('Sports & Outdoors');
    expect(categorizeProduct('Golf Club')).toBe('Sports & Outdoors');
  });

  it('should categorize toys & games products', () => {
    expect(categorizeProduct('LEGO Building Set')).toBe('Toys & Games');
    expect(categorizeProduct('Board Game')).toBe('Toys & Games');
    expect(categorizeProduct('Stuffed Animal Plush')).toBe('Toys & Games');
  });

  it('should categorize pet supplies', () => {
    expect(categorizeProduct('Dog Food')).toBe('Pet Supplies');
    expect(categorizeProduct('Cat Litter')).toBe('Pet Supplies');
    expect(categorizeProduct('Pet Leash')).toBe('Pet Supplies');
  });

  it('should categorize office & school supplies', () => {
    expect(categorizeProduct('School Supplies')).toBe('Office & School');
    expect(categorizeProduct('Office Desk Lamp')).toBe('Home & Kitchen'); // Lamp matches Home first
    expect(categorizeProduct('Pen Set')).toBe('Office & School');
  });

  it('should categorize tools & home improvement', () => {
    expect(categorizeProduct('Power Drill')).toBe('Tools & Home Improvement');
    expect(categorizeProduct('Hammer Tool')).toBe('Tools & Home Improvement');
    expect(categorizeProduct('Paint Brush')).toBe('Tools & Home Improvement');
  });

  it('should categorize automotive products', () => {
    expect(categorizeProduct('Car Tire')).toBe('Automotive');
    expect(categorizeProduct('Auto Filter')).toBe('Automotive');
    expect(categorizeProduct('Dash Cam')).toBe('Automotive');
  });

  it('should categorize baby & kids products', () => {
    expect(categorizeProduct('Baby Diapers')).toBe('Baby & Kids');
    expect(categorizeProduct('Infant Formula')).toBe('Baby & Kids');
    expect(categorizeProduct('Baby Wipes')).toBe('Baby & Kids');
  });

  it('should return "Other" for uncategorized products', () => {
    expect(categorizeProduct('Strange Widget')).toBe('Other');
    expect(categorizeProduct('Unknown Item')).toBe('Other');
  });

  it('should return "Other" for null input', () => {
    expect(categorizeProduct(null)).toBe('Other');
  });

  it('should return "Other" for undefined input', () => {
    expect(categorizeProduct(undefined)).toBe('Other');
  });

  it('should return "Other" for empty string', () => {
    expect(categorizeProduct('')).toBe('Other');
  });

  it('should be case insensitive', () => {
    expect(categorizeProduct('IPHONE')).toBe('Electronics');
    expect(categorizeProduct('laptop')).toBe('Electronics');
    expect(categorizeProduct('LaPtOp')).toBe('Electronics');
  });

  it('should match partial keywords', () => {
    expect(categorizeProduct('Wireless headphones for music')).toBe('Electronics');
    expect(categorizeProduct('New smartphone case')).toBe('Electronics');
  });
});

describe('categorizeProducts', () => {
  it('should categorize multiple products', () => {
    const products = [
      { id: 1, productName: 'iPhone 15' },
      { id: 2, productName: 'Coffee Beans' },
      { id: 3, productName: 'T-Shirt' },
    ];

    const result = categorizeProducts(products);

    expect(result[0].category).toBe('Electronics');
    expect(result[1].category).toBe('Grocery & Gourmet');
    expect(result[2].category).toBe('Clothing & Accessories');
  });

  it('should preserve original product properties', () => {
    const products = [{ id: 1, productName: 'Laptop', price: 999, quantity: 1 }];

    const result = categorizeProducts(products);

    expect(result[0].id).toBe(1);
    expect(result[0].price).toBe(999);
    expect(result[0].quantity).toBe(1);
    expect(result[0].category).toBe('Electronics');
  });

  it('should handle empty array', () => {
    const result = categorizeProducts([]);
    expect(result).toEqual([]);
  });

  it('should handle products without productName', () => {
    const products = [
      { id: 1, name: 'Item' },
      { id: 2, productName: 'Laptop' },
    ];

    const result = categorizeProducts(products);

    expect(result[0].category).toBe('Other');
    expect(result[1].category).toBe('Electronics');
  });
});

describe('getCategoryDistribution', () => {
  it('should count orders by category', () => {
    const orders = [
      { category: 'Electronics' },
      { category: 'Electronics' },
      { category: 'Books & Media' },
      { category: 'Electronics' },
      { category: 'Books & Media' },
    ];

    const result = getCategoryDistribution(orders);

    expect(result['Electronics']).toBe(3);
    expect(result['Books & Media']).toBe(2);
  });

  it('should handle orders without category', () => {
    const orders = [
      { category: 'Electronics' },
      { productName: 'Item' },
      { category: 'Books & Media' },
    ];

    const result = getCategoryDistribution(orders);

    expect(result['Electronics']).toBe(1);
    expect(result['Books & Media']).toBe(1);
    expect(result['Other']).toBe(1);
  });

  it('should handle empty array', () => {
    const result = getCategoryDistribution([]);
    expect(result).toEqual({});
  });

  it('should count single category', () => {
    const orders = [{ category: 'Electronics' }, { category: 'Electronics' }];

    const result = getCategoryDistribution(orders);

    expect(result['Electronics']).toBe(2);
    expect(Object.keys(result).length).toBe(1);
  });
});

describe('getSpendingByCategory', () => {
  it('should sum spending by category', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 100 },
      { category: 'Electronics', totalOwed: 200 },
      { category: 'Books & Media', totalOwed: 50 },
      { category: 'Electronics', totalOwed: 150 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBe(450);
    expect(result['Books & Media']).toBe(50);
  });

  it('should handle orders without category', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 100 },
      { totalOwed: 50 },
      { category: 'Books & Media', totalOwed: 75 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBe(100);
    expect(result['Books & Media']).toBe(75);
    expect(result['Other']).toBe(50);
  });

  it('should handle orders without totalOwed', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 100 },
      { category: 'Electronics' },
      { category: 'Books & Media', totalOwed: 50 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBe(100);
    expect(result['Books & Media']).toBe(50);
  });

  it('should handle empty array', () => {
    const result = getSpendingByCategory([]);
    expect(result).toEqual({});
  });

  it('should handle zero amounts', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 0 },
      { category: 'Electronics', totalOwed: 100 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBe(100);
  });

  it('should handle negative amounts (refunds)', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 100 },
      { category: 'Electronics', totalOwed: -20 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBe(80);
  });

  it('should handle decimal amounts', () => {
    const orders = [
      { category: 'Electronics', totalOwed: 99.99 },
      { category: 'Electronics', totalOwed: 50.5 },
    ];

    const result = getSpendingByCategory(orders);

    expect(result['Electronics']).toBeCloseTo(150.49, 2);
  });
});

describe('getAllCategoryNames', () => {
  it('should return all category names including Other', () => {
    const categories = getAllCategoryNames();

    expect(categories).toContain('Electronics');
    expect(categories).toContain('Home & Kitchen');
    expect(categories).toContain('Books & Media');
    expect(categories).toContain('Clothing & Accessories');
    expect(categories).toContain('Health & Personal Care');
    expect(categories).toContain('Prime Membership');
    expect(categories).toContain('Grocery & Gourmet');
    expect(categories).toContain('Sports & Outdoors');
    expect(categories).toContain('Toys & Games');
    expect(categories).toContain('Pet Supplies');
    expect(categories).toContain('Office & School');
    expect(categories).toContain('Tools & Home Improvement');
    expect(categories).toContain('Automotive');
    expect(categories).toContain('Baby & Kids');
    expect(categories).toContain('Other');
  });

  it('should return an array', () => {
    const categories = getAllCategoryNames();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('should have Other as the last category', () => {
    const categories = getAllCategoryNames();
    expect(categories[categories.length - 1]).toBe('Other');
  });

  it('should return at least 15 categories', () => {
    const categories = getAllCategoryNames();
    expect(categories.length).toBeGreaterThanOrEqual(15);
  });
});
