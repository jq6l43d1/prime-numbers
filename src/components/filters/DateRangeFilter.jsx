import { useState, useMemo } from 'react';
import { format } from 'date-fns';

export function DateRangeFilter({ orders, onFilterChange }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'year', 'month', 'custom', 'quick'
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('');

  // Extract unique years and months from orders
  const { years, months } = useMemo(() => {
    if (!orders || orders.length === 0) return { years: [], months: [] };

    const yearSet = new Set();
    const monthSet = new Set();

    orders.forEach(order => {
      if (order.orderDate) {
        const date = new Date(order.orderDate);
        yearSet.add(date.getFullYear());
        monthSet.add(format(date, 'yyyy-MM'));
      }
    });

    return {
      years: Array.from(yearSet).sort((a, b) => b - a),
      months: Array.from(monthSet).sort((a, b) => b.localeCompare(a)),
    };
  }, [orders]);

  // Apply filters
  const applyFilter = () => {
    let startTime = null;
    let endTime = null;

    if (filterType === 'all') {
      onFilterChange({ startDate: null, endDate: null, label: 'All Time' });
      return;
    }

    if (filterType === 'year' && selectedYear) {
      startTime = new Date(selectedYear, 0, 1).getTime();
      endTime = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();
      onFilterChange({
        startDate: startTime,
        endDate: endTime,
        label: `Year ${selectedYear}`,
      });
    } else if (filterType === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(year, parseInt(month) - 1, 1);
      startTime = date.getTime();
      endTime = new Date(year, parseInt(month), 0, 23, 59, 59).getTime();
      onFilterChange({
        startDate: startTime,
        endDate: endTime,
        label: format(date, 'MMMM yyyy'),
      });
    } else if (filterType === 'custom' && startDate && endDate) {
      startTime = new Date(startDate).getTime();
      endTime = new Date(endDate + 'T23:59:59').getTime();
      onFilterChange({
        startDate: startTime,
        endDate: endTime,
        label: `${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`,
      });
    } else if (filterType === 'quick' && quickFilter) {
      const now = new Date();
      endTime = now.getTime();

      switch (quickFilter) {
        case '30days':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime();
          onFilterChange({ startDate: startTime, endDate: endTime, label: 'Last 30 Days' });
          break;
        case '90days':
          startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).getTime();
          onFilterChange({ startDate: startTime, endDate: endTime, label: 'Last 90 Days' });
          break;
        case '6months':
          startTime = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).getTime();
          onFilterChange({ startDate: startTime, endDate: endTime, label: 'Last 6 Months' });
          break;
        case '1year':
          startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).getTime();
          onFilterChange({ startDate: startTime, endDate: endTime, label: 'Last 12 Months' });
          break;
        case 'ytd':
          startTime = new Date(now.getFullYear(), 0, 1).getTime();
          onFilterChange({ startDate: startTime, endDate: endTime, label: 'Year to Date' });
          break;
      }
    }
  };

  const handleReset = () => {
    setFilterType('all');
    setSelectedYear('');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setQuickFilter('');
    onFilterChange({ startDate: null, endDate: null, label: 'All Time' });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <h3 className="text-xl font-bold text-gray-900">Filter by Date</h3>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* Filter Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <button
          onClick={() => {
            setFilterType('all');
            handleReset();
          }}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            filterType === 'all'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setFilterType('quick')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            filterType === 'quick'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Quick Filter
        </button>
        <button
          onClick={() => setFilterType('year')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            filterType === 'year'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By Year
        </button>
        <button
          onClick={() => setFilterType('month')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            filterType === 'month'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By Month
        </button>
        <button
          onClick={() => setFilterType('custom')}
          className={`px-4 py-3 rounded-lg font-medium transition-all ${
            filterType === 'custom'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom Range
        </button>
      </div>

      {/* Filter Options */}
      {filterType === 'quick' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: '6months', label: 'Last 6 Months' },
              { value: '1year', label: 'Last Year' },
              { value: 'ytd', label: 'Year to Date' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setQuickFilter(option.value);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  quickFilter === option.value
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {quickFilter && (
            <button
              onClick={applyFilter}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Apply Filter
            </button>
          )}
        </div>
      )}

      {filterType === 'year' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Choose a year...</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {selectedYear && (
            <button
              onClick={applyFilter}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Apply Filter
            </button>
          )}
        </div>
      )}

      {filterType === 'month' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Choose a month...</option>
              {months.map(month => {
                const [year, monthNum] = month.split('-');
                const date = new Date(year, parseInt(monthNum) - 1, 1);
                return (
                  <option key={month} value={month}>
                    {format(date, 'MMMM yyyy')}
                  </option>
                );
              })}
            </select>
          </div>
          {selectedMonth && (
            <button
              onClick={applyFilter}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Apply Filter
            </button>
          )}
        </div>
      )}

      {filterType === 'custom' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {startDate && endDate && (
            <button
              onClick={applyFilter}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Apply Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
