import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  parseCurrency,
  calculatePercentage,
  detectPrimaryCurrency,
  roundToTwo,
  sum,
  average,
} from './currencyHelpers';
import { mockOrdersMultiCurrency, floatingPointTestCases } from '../test/fixtures/mockOrders';

describe('formatCurrency', () => {
  it('should format positive USD amounts correctly', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should format negative amounts correctly', () => {
    expect(formatCurrency(-29.99)).toBe('-$29.99');
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should handle zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle very large numbers', () => {
    expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
  });

  it('should handle very small decimals', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  it('should handle null with default fallback', () => {
    expect(formatCurrency(null)).toBe('$0.00');
  });

  it('should handle undefined with default fallback', () => {
    expect(formatCurrency(undefined)).toBe('$0.00');
  });

  it('should handle NaN with default fallback', () => {
    expect(formatCurrency(NaN)).toBe('$0.00');
  });

  it('should format EUR currency', () => {
    const result = formatCurrency(29.99, 'EUR');
    expect(result).toContain('29.99');
    expect(result).toContain('€');
  });

  it('should format GBP currency', () => {
    const result = formatCurrency(29.99, 'GBP');
    expect(result).toContain('29.99');
    expect(result).toContain('£');
  });

  it('should format JPY currency without decimals', () => {
    const result = formatCurrency(2999, 'JPY', 0);
    expect(result).toContain('2,999');
    expect(result).toContain('¥');
  });

  it('should handle invalid currency codes with fallback', () => {
    expect(formatCurrency(29.99, 'INVALID')).toBe('$29.99');
  });

  it('should respect custom decimal places', () => {
    expect(formatCurrency(29.999, 'USD', 3)).toBe('$29.999');
    expect(formatCurrency(29.99, 'USD', 0)).toBe('$30');
  });
});

describe('formatNumber', () => {
  it('should format integers correctly', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('should format with decimal places', () => {
    expect(formatNumber(1234.56, 2)).toBe('1,234.56');
    expect(formatNumber(999.999, 2)).toBe('1,000.00');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle null', () => {
    expect(formatNumber(null)).toBe('0');
  });

  it('should handle undefined', () => {
    expect(formatNumber(undefined)).toBe('0');
  });

  it('should handle NaN', () => {
    expect(formatNumber(NaN)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1234)).toBe('-1,234');
  });
});

describe('formatPercentage', () => {
  it('should format percentage values correctly', () => {
    expect(formatPercentage(25)).toBe('25.0%');
    expect(formatPercentage(99.5)).toBe('99.5%');
    expect(formatPercentage(100)).toBe('100.0%');
  });

  it('should convert decimal to percentage', () => {
    expect(formatPercentage(0.25, 1, true)).toBe('25.0%');
    expect(formatPercentage(0.995, 1, true)).toBe('99.5%');
  });

  it('should respect decimal places', () => {
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
    expect(formatPercentage(33.333, 0)).toBe('33%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should handle null', () => {
    expect(formatPercentage(null)).toBe('0%');
  });

  it('should handle undefined', () => {
    expect(formatPercentage(undefined)).toBe('0%');
  });

  it('should handle NaN', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });
});

describe('parseCurrency', () => {
  it('should parse USD format', () => {
    expect(parseCurrency('$1,234.56')).toBe(1234.56);
    expect(parseCurrency('$29.99')).toBe(29.99);
  });

  it('should parse without currency symbol', () => {
    expect(parseCurrency('1234.56')).toBe(1234.56);
    expect(parseCurrency('29.99')).toBe(29.99);
  });

  it('should handle negative amounts', () => {
    expect(parseCurrency('-$29.99')).toBe(-29.99);
    expect(parseCurrency('$-29.99')).toBe(-29.99);
  });

  it('should handle strings with spaces', () => {
    expect(parseCurrency('$ 1,234.56')).toBe(1234.56);
    expect(parseCurrency(' 29.99 ')).toBe(29.99);
  });

  it('should handle empty string', () => {
    expect(parseCurrency('')).toBe(0);
  });

  it('should handle null', () => {
    expect(parseCurrency(null)).toBe(0);
  });

  it('should handle undefined', () => {
    expect(parseCurrency(undefined)).toBe(0);
  });

  it('should handle malformed strings', () => {
    expect(parseCurrency('invalid')).toBe(0);
    expect(parseCurrency('$abc')).toBe(0);
  });

  it('should handle numbers passed as strings', () => {
    expect(parseCurrency('123')).toBe(123);
  });
});

describe('calculatePercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(50, 200)).toBe(25);
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.333, 2);
  });

  it('should handle zero total', () => {
    expect(calculatePercentage(10, 0)).toBe(0);
  });

  it('should handle zero value', () => {
    expect(calculatePercentage(0, 100)).toBe(0);
  });

  it('should handle 100%', () => {
    expect(calculatePercentage(100, 100)).toBe(100);
  });

  it('should handle values greater than total', () => {
    expect(calculatePercentage(150, 100)).toBe(150);
  });

  it('should handle negative values', () => {
    expect(calculatePercentage(-25, 100)).toBe(-25);
  });

  it('should handle null total', () => {
    expect(calculatePercentage(10, null)).toBe(0);
  });
});

describe('detectPrimaryCurrency', () => {
  it('should return most common currency', () => {
    expect(detectPrimaryCurrency(mockOrdersMultiCurrency)).toBe('USD');
  });

  it('should default to USD when empty array', () => {
    expect(detectPrimaryCurrency([])).toBe('USD');
  });

  it('should default to USD when null', () => {
    expect(detectPrimaryCurrency(null)).toBe('USD');
  });

  it('should handle orders without currency property', () => {
    const orders = [{ orderId: '1' }, { orderId: '2' }];
    expect(detectPrimaryCurrency(orders)).toBe('USD');
  });

  it('should handle ties by returning first currency', () => {
    const orders = [{ currency: 'USD' }, { currency: 'EUR' }, { currency: 'GBP' }];
    // Should return one of them based on iteration order
    const result = detectPrimaryCurrency(orders);
    expect(['USD', 'EUR', 'GBP']).toContain(result);
  });

  it('should handle single order', () => {
    const orders = [{ currency: 'EUR' }];
    expect(detectPrimaryCurrency(orders)).toBe('EUR');
  });
});

describe('roundToTwo', () => {
  it('should round to 2 decimal places', () => {
    expect(roundToTwo(1.234)).toBe(1.23);
    expect(roundToTwo(1.235)).toBe(1.24);
    expect(roundToTwo(1.999)).toBe(2);
  });

  it('should handle floating-point precision issues', () => {
    // The classic 0.1 + 0.2 problem
    const result = 0.1 + 0.2;
    expect(roundToTwo(result)).toBe(0.3);
  });

  it('should handle Number.EPSILON correctly', () => {
    const value = 1.005 + 1.005;
    expect(roundToTwo(value)).toBe(2.01);
  });

  it('should handle very small numbers', () => {
    expect(roundToTwo(0.001)).toBe(0);
    expect(roundToTwo(0.005)).toBe(0.01);
    expect(roundToTwo(0.004)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(roundToTwo(-1.234)).toBe(-1.23);
    expect(roundToTwo(-1.236)).toBe(-1.24);
  });

  it('should handle numbers already at 2 decimals', () => {
    expect(roundToTwo(1.23)).toBe(1.23);
    expect(roundToTwo(99.99)).toBe(99.99);
  });

  it('should handle zero', () => {
    expect(roundToTwo(0)).toBe(0);
  });

  it('should handle integers', () => {
    expect(roundToTwo(10)).toBe(10);
    expect(roundToTwo(999)).toBe(999);
  });
});

describe('sum', () => {
  it('should sum array of numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
    expect(sum([10, 20, 30])).toBe(60);
  });

  it('should handle empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('should handle single item', () => {
    expect(sum([42])).toBe(42);
  });

  it('should handle null values in array', () => {
    expect(sum([1, null, 3, null, 5])).toBe(9);
  });

  it('should handle undefined values in array', () => {
    expect(sum([1, undefined, 3, undefined, 5])).toBe(9);
  });

  it('should handle floating-point accumulation', () => {
    // Test that floating-point errors don't compound too much
    const result = sum([0.1, 0.2, 0.3]);
    expect(result).toBeCloseTo(0.6, 10);
  });

  it('should handle negative numbers', () => {
    expect(sum([10, -5, 3, -2])).toBe(6);
  });

  it('should handle large arrays', () => {
    const largeArray = Array(10000).fill(1);
    expect(sum(largeArray)).toBe(10000);
  });
});

describe('average', () => {
  it('should calculate average correctly', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
    expect(average([10, 20, 30])).toBe(20);
  });

  it('should handle empty array', () => {
    expect(average([])).toBe(0);
  });

  it('should handle single item', () => {
    expect(average([42])).toBe(42);
  });

  it('should handle null', () => {
    expect(average(null)).toBe(0);
  });

  it('should handle undefined', () => {
    expect(average(undefined)).toBe(0);
  });

  it('should handle floating-point division', () => {
    const result = average([1, 2]);
    expect(result).toBe(1.5);
  });

  it('should handle negative numbers', () => {
    expect(average([-10, -20, -30])).toBe(-20);
    expect(average([-5, 5])).toBe(0);
  });
});

describe('floating-point edge cases', () => {
  it('should handle all floating-point test cases with roundToTwo', () => {
    floatingPointTestCases.forEach(({ input, expected }) => {
      const result = sum(input);
      expect(roundToTwo(result)).toBe(expected);
    });
  });

  it('should handle 0.3 - 0.1 - 0.1 - 0.1', () => {
    const result = 0.3 - 0.1 - 0.1 - 0.1;
    expect(roundToTwo(result)).toBe(0);
  });

  it('should handle multiple operations', () => {
    const result = (0.1 + 0.2) * 3;
    expect(roundToTwo(result)).toBe(0.9);
  });
});
