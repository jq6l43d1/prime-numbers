import { format, formatDistance, formatDistanceToNow, parseISO, isValid, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

/**
 * Formats a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr) : '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formats date and time
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export function formatDateTime(date) {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Gets relative time (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @returns {string} - Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
}

/**
 * Gets year and month from date
 * @param {Date} date - Date object
 * @returns {Object} - { year, month, monthName }
 */
export function getYearMonth(date) {
  if (!date || !isValid(date)) {
    return { year: null, month: null, monthName: '' };
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 1-12
    monthName: format(date, 'MMM yyyy')
  };
}

/**
 * Groups data by month
 * @param {Array} items - Items with orderDate
 * @returns {Object} - { 'Jan 2024': [...items], 'Feb 2024': [...items] }
 */
export function groupByMonth(items) {
  const grouped = {};

  items.forEach(item => {
    if (item.orderDate && isValid(item.orderDate)) {
      const monthKey = format(item.orderDate, 'MMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    }
  });

  return grouped;
}

/**
 * Groups data by year
 * @param {Array} items - Items with orderDate
 * @returns {Object} - { '2024': [...items], '2023': [...items] }
 */
export function groupByYear(items) {
  const grouped = {};

  items.forEach(item => {
    if (item.orderDate && isValid(item.orderDate)) {
      const year = item.orderDate.getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(item);
    }
  });

  return grouped;
}

/**
 * Gets date range filters
 * @returns {Object} - Date range presets
 */
export function getDateRangePresets() {
  const now = new Date();

  return {
    allTime: {
      start: null,
      end: null,
      label: 'All Time'
    },
    lastYear: {
      start: subYears(now, 1),
      end: now,
      label: 'Last Year'
    },
    last6Months: {
      start: subMonths(now, 6),
      end: now,
      label: 'Last 6 Months'
    },
    last3Months: {
      start: subMonths(now, 3),
      end: now,
      label: 'Last 3 Months'
    },
    thisYear: {
      start: startOfYear(now),
      end: endOfYear(now),
      label: 'This Year'
    },
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now),
      label: 'This Month'
    }
  };
}

/**
 * Filters items by date range
 * @param {Array} items - Items with orderDate
 * @param {Date} startDate - Start date (inclusive)
 * @param {Date} endDate - End date (inclusive)
 * @returns {Array} - Filtered items
 */
export function filterByDateRange(items, startDate, endDate) {
  if (!startDate && !endDate) {
    return items;
  }

  return items.filter(item => {
    if (!item.orderDate || !isValid(item.orderDate)) {
      return false;
    }

    const itemDate = item.orderDate;

    if (startDate && itemDate < startDate) {
      return false;
    }

    if (endDate && itemDate > endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Calculates days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} - Days between dates
 */
export function daysBetween(date1, date2) {
  if (!date1 || !date2 || !isValid(date1) || !isValid(date2)) {
    return 0;
  }

  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
