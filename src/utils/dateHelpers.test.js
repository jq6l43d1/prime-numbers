import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatDateTime,
  getRelativeTime,
  getYearMonth,
  groupByMonth,
  groupByYear,
  getDateRangePresets,
  filterByDateRange,
  daysBetween,
} from './dateHelpers';

describe('formatDate', () => {
  it('should format date with default format', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);
    expect(result).toBe('Mar 15, 2024');
  });

  it('should format date with custom format', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date, 'yyyy-MM-dd');
    expect(result).toBe('2024-03-15');
  });

  it('should format ISO string date', () => {
    const result = formatDate('2024-03-15T10:30:00Z');
    expect(result).toBe('Mar 15, 2024');
  });

  it('should return empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    const result = formatDate('invalid-date');
    expect(result).toBe('');
  });

  it('should handle year 2025', () => {
    const date = new Date('2025-12-31');
    const result = formatDate(date);
    expect(result).toBe('Dec 31, 2025');
  });
});

describe('formatDateTime', () => {
  it('should format date and time', () => {
    const date = new Date('2024-03-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toMatch(/Mar 15, 2024 \d{1,2}:\d{2} [AP]M/);
  });

  it('should return empty string for null', () => {
    expect(formatDateTime(null)).toBe('');
  });
});

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return relative time for recent date', () => {
    const now = new Date('2024-03-15T12:00:00');
    vi.setSystemTime(now);

    const date = new Date('2024-03-14T12:00:00');
    const result = getRelativeTime(date);
    expect(result).toContain('1 day ago');
  });

  it('should handle ISO string dates', () => {
    const now = new Date('2024-03-15T12:00:00');
    vi.setSystemTime(now);

    const result = getRelativeTime('2024-03-14T12:00:00');
    expect(result).toContain('1 day ago');
  });

  it('should return empty string for null', () => {
    expect(getRelativeTime(null)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(getRelativeTime('invalid')).toBe('');
  });
});

describe('getYearMonth', () => {
  it('should extract year and month from date', () => {
    const date = new Date('2024-03-15');
    const result = getYearMonth(date);

    expect(result.year).toBe(2024);
    expect(result.month).toBe(3);
    expect(result.monthName).toBe('Mar 2024');
  });

  it('should handle January (month 1)', () => {
    const date = new Date('2024-01-15');
    const result = getYearMonth(date);

    expect(result.month).toBe(1);
    expect(result.monthName).toBe('Jan 2024');
  });

  it('should handle December (month 12)', () => {
    const date = new Date('2024-12-15');
    const result = getYearMonth(date);

    expect(result.month).toBe(12);
    expect(result.monthName).toBe('Dec 2024');
  });

  it('should return null values for invalid date', () => {
    const result = getYearMonth(new Date('invalid'));

    expect(result.year).toBeNull();
    expect(result.month).toBeNull();
    expect(result.monthName).toBe('');
  });

  it('should return null values for null', () => {
    const result = getYearMonth(null);

    expect(result.year).toBeNull();
    expect(result.month).toBeNull();
    expect(result.monthName).toBe('');
  });
});

describe('groupByMonth', () => {
  it('should group items by month', () => {
    const items = [
      { id: 1, orderDate: new Date('2024-01-15'), name: 'Item 1' },
      { id: 2, orderDate: new Date('2024-01-20'), name: 'Item 2' },
      { id: 3, orderDate: new Date('2024-02-10'), name: 'Item 3' },
      { id: 4, orderDate: new Date('2024-02-15'), name: 'Item 4' },
    ];

    const result = groupByMonth(items);

    expect(result['Jan 2024']).toHaveLength(2);
    expect(result['Feb 2024']).toHaveLength(2);
    expect(result['Jan 2024'][0].id).toBe(1);
    expect(result['Feb 2024'][0].id).toBe(3);
  });

  it('should handle empty array', () => {
    const result = groupByMonth([]);
    expect(result).toEqual({});
  });

  it('should skip items without orderDate', () => {
    const items = [
      { id: 1, orderDate: new Date('2024-01-15') },
      { id: 2, name: 'No date' },
    ];

    const result = groupByMonth(items);
    expect(result['Jan 2024']).toHaveLength(1);
  });

  it('should skip items with invalid dates', () => {
    const items = [
      { id: 1, orderDate: new Date('2024-01-15') },
      { id: 2, orderDate: new Date('invalid') },
    ];

    const result = groupByMonth(items);
    expect(result['Jan 2024']).toHaveLength(1);
  });

  it('should group multiple years separately', () => {
    const items = [
      { id: 1, orderDate: new Date('2023-01-15') },
      { id: 2, orderDate: new Date('2024-01-15') },
    ];

    const result = groupByMonth(items);
    expect(result['Jan 2023']).toHaveLength(1);
    expect(result['Jan 2024']).toHaveLength(1);
  });
});

describe('groupByYear', () => {
  it('should group items by year', () => {
    const items = [
      { id: 1, orderDate: new Date('2023-01-15') },
      { id: 2, orderDate: new Date('2023-06-20') },
      { id: 3, orderDate: new Date('2024-02-10') },
      { id: 4, orderDate: new Date('2024-08-15') },
    ];

    const result = groupByYear(items);

    expect(result['2023']).toHaveLength(2);
    expect(result['2024']).toHaveLength(2);
    expect(result['2023'][0].id).toBe(1);
    expect(result['2024'][0].id).toBe(3);
  });

  it('should handle empty array', () => {
    const result = groupByYear([]);
    expect(result).toEqual({});
  });

  it('should skip items without orderDate', () => {
    const items = [
      { id: 1, orderDate: new Date('2024-01-15') },
      { id: 2, name: 'No date' },
    ];

    const result = groupByYear(items);
    expect(result['2024']).toHaveLength(1);
  });

  it('should skip items with invalid dates', () => {
    const items = [
      { id: 1, orderDate: new Date('2024-01-15') },
      { id: 2, orderDate: new Date('invalid') },
    ];

    const result = groupByYear(items);
    expect(result['2024']).toHaveLength(1);
  });
});

describe('getDateRangePresets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return all preset date ranges', () => {
    const now = new Date('2024-06-15T12:00:00');
    vi.setSystemTime(now);

    const presets = getDateRangePresets();

    expect(presets).toHaveProperty('allTime');
    expect(presets).toHaveProperty('lastYear');
    expect(presets).toHaveProperty('last6Months');
    expect(presets).toHaveProperty('last3Months');
    expect(presets).toHaveProperty('thisYear');
    expect(presets).toHaveProperty('thisMonth');
  });

  it('should have correct allTime preset', () => {
    const presets = getDateRangePresets();

    expect(presets.allTime.start).toBeNull();
    expect(presets.allTime.end).toBeNull();
    expect(presets.allTime.label).toBe('All Time');
  });

  it('should calculate lastYear correctly', () => {
    const now = new Date('2024-06-15T12:00:00');
    vi.setSystemTime(now);

    const presets = getDateRangePresets();
    const lastYear = presets.lastYear;

    expect(lastYear.start.getFullYear()).toBe(2023);
    expect(lastYear.start.getMonth()).toBe(5); // June (0-indexed)
    expect(lastYear.end).toEqual(now);
  });

  it('should calculate last6Months correctly', () => {
    const now = new Date('2024-06-15T12:00:00');
    vi.setSystemTime(now);

    const presets = getDateRangePresets();
    const last6Months = presets.last6Months;

    expect(last6Months.start.getFullYear()).toBe(2023);
    expect(last6Months.start.getMonth()).toBe(11); // December (0-indexed)
    expect(last6Months.end).toEqual(now);
  });

  it('should calculate thisYear correctly', () => {
    const now = new Date('2024-06-15T12:00:00');
    vi.setSystemTime(now);

    const presets = getDateRangePresets();
    const thisYear = presets.thisYear;

    expect(thisYear.start.getFullYear()).toBe(2024);
    expect(thisYear.start.getMonth()).toBe(0); // January
    expect(thisYear.start.getDate()).toBe(1);

    expect(thisYear.end.getFullYear()).toBe(2024);
    expect(thisYear.end.getMonth()).toBe(11); // December
    expect(thisYear.end.getDate()).toBe(31);
  });

  it('should calculate thisMonth correctly', () => {
    const now = new Date('2024-06-15T12:00:00');
    vi.setSystemTime(now);

    const presets = getDateRangePresets();
    const thisMonth = presets.thisMonth;

    expect(thisMonth.start.getFullYear()).toBe(2024);
    expect(thisMonth.start.getMonth()).toBe(5); // June
    expect(thisMonth.start.getDate()).toBe(1);

    expect(thisMonth.end.getFullYear()).toBe(2024);
    expect(thisMonth.end.getMonth()).toBe(5); // June
    expect(thisMonth.end.getDate()).toBe(30);
  });
});

describe('filterByDateRange', () => {
  const items = [
    { id: 1, orderDate: new Date('2024-01-15') },
    { id: 2, orderDate: new Date('2024-02-15') },
    { id: 3, orderDate: new Date('2024-03-15') },
    { id: 4, orderDate: new Date('2024-04-15') },
  ];

  it('should return all items when no date range specified', () => {
    const result = filterByDateRange(items, null, null);
    expect(result).toHaveLength(4);
  });

  it('should filter by start date only', () => {
    const startDate = new Date('2024-02-01');
    const result = filterByDateRange(items, startDate, null);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(2);
  });

  it('should filter by end date only', () => {
    const endDate = new Date('2024-02-28');
    const result = filterByDateRange(items, null, endDate);

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe(2);
  });

  it('should filter by both start and end date', () => {
    const startDate = new Date('2024-02-01');
    const endDate = new Date('2024-03-31');
    const result = filterByDateRange(items, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
  });

  it('should include items on boundary dates', () => {
    const startDate = new Date('2024-02-15');
    const endDate = new Date('2024-03-15');
    const result = filterByDateRange(items, startDate, endDate);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
  });

  it('should exclude items without orderDate when filtering', () => {
    const itemsWithNull = [...items, { id: 5, name: 'No date' }];

    const startDate = new Date('2024-01-01');
    const result = filterByDateRange(itemsWithNull, startDate, null);
    expect(result).toHaveLength(4);
  });

  it('should exclude items with invalid dates when filtering', () => {
    const itemsWithInvalid = [...items, { id: 5, orderDate: new Date('invalid') }];

    const startDate = new Date('2024-01-01');
    const result = filterByDateRange(itemsWithInvalid, startDate, null);
    expect(result).toHaveLength(4);
  });

  it('should handle empty array', () => {
    const result = filterByDateRange([], new Date('2024-01-01'), new Date('2024-12-31'));
    expect(result).toEqual([]);
  });
});

describe('daysBetween', () => {
  it('should calculate days between two dates', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-11');

    expect(daysBetween(date1, date2)).toBe(10);
  });

  it('should handle dates in reverse order', () => {
    const date1 = new Date('2024-01-11');
    const date2 = new Date('2024-01-01');

    expect(daysBetween(date1, date2)).toBe(10);
  });

  it('should calculate days across months', () => {
    const date1 = new Date('2024-01-25');
    const date2 = new Date('2024-02-10');

    expect(daysBetween(date1, date2)).toBe(16);
  });

  it('should calculate days across years', () => {
    const date1 = new Date('2023-12-25');
    const date2 = new Date('2024-01-10');

    expect(daysBetween(date1, date2)).toBe(16);
  });

  it('should return 0 for same date', () => {
    const date = new Date('2024-01-15');

    expect(daysBetween(date, date)).toBe(0);
  });

  it('should return 0 for null dates', () => {
    expect(daysBetween(null, new Date())).toBe(0);
    expect(daysBetween(new Date(), null)).toBe(0);
    expect(daysBetween(null, null)).toBe(0);
  });

  it('should return 0 for invalid dates', () => {
    const validDate = new Date('2024-01-15');
    const invalidDate = new Date('invalid');

    expect(daysBetween(invalidDate, validDate)).toBe(0);
    expect(daysBetween(validDate, invalidDate)).toBe(0);
  });

  it('should round up partial days', () => {
    const date1 = new Date('2024-01-01T10:00:00');
    const date2 = new Date('2024-01-02T14:00:00');

    // Should be 1.16... days, rounded up to 2
    expect(daysBetween(date1, date2)).toBe(2);
  });
});
