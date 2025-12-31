import { useState, useMemo } from 'react';
import { filterOrders } from '../services/dataProcessor';
import { getDateRangePresets } from '../utils/dateHelpers';

export function useFilters(orders) {
  const dateRangePresets = getDateRangePresets();

  const [filters, setFilters] = useState({
    dateRange: 'allTime',
    startDate: null,
    endDate: null,
    category: 'all',
    status: 'all',
    type: 'all', // all, digital, retail
    search: ''
  });

  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    let dateFilter = {};
    if (filters.dateRange && filters.dateRange !== 'allTime') {
      const preset = dateRangePresets[filters.dateRange];
      if (preset) {
        dateFilter = {
          startDate: preset.start,
          endDate: preset.end
        };
      }
    } else if (filters.startDate || filters.endDate) {
      dateFilter = {
        startDate: filters.startDate,
        endDate: filters.endDate
      };
    }

    return filterOrders(orders, {
      ...dateFilter,
      category: filters.category,
      status: filters.status,
      type: filters.type,
      search: filters.search
    });
  }, [orders, filters, dateRangePresets]);

  const setDateRange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range, startDate: null, endDate: null }));
  };

  const setCustomDateRange = (startDate, endDate) => {
    setFilters(prev => ({
      ...prev,
      dateRange: 'custom',
      startDate,
      endDate
    }));
  };

  const setCategory = (category) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const setStatus = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const setType = (type) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const setSearch = (search) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'allTime',
      startDate: null,
      endDate: null,
      category: 'all',
      status: 'all',
      type: 'all',
      search: ''
    });
  };

  return {
    filters,
    filteredOrders,
    setDateRange,
    setCustomDateRange,
    setCategory,
    setStatus,
    setType,
    setSearch,
    resetFilters,
    dateRangePresets
  };
}
