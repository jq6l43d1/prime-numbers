import { useState } from 'react';
import { useData } from '../../context/DataContext';

export function TimePeriodComparison() {
  const { orders } = useData();
  const [period1, setPeriod1] = useState({ start: '', end: '', label: 'Period 1' });
  const [period2, setPeriod2] = useState({ start: '', end: '', label: 'Period 2' });
  const [showComparison, setShowComparison] = useState(false);

  const filterOrdersByPeriod = (start, end) => {
    if (!start || !end) return [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // Include the end date fully

    return orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const calculateStats = orders => {
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Calculate unique products
    const uniqueProducts = new Set(orders.map(o => o.productName)).size;

    // Calculate by category
    const byCategory = {};
    orders.forEach(order => {
      const cat = order.category || 'Other';
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, spent: 0 };
      }
      byCategory[cat].count++;
      byCategory[cat].spent += order.totalOwed || 0;
    });

    return {
      totalSpent,
      totalOrders,
      avgOrderValue,
      uniqueProducts,
      byCategory,
    };
  };

  const handleCompare = () => {
    if (period1.start && period1.end && period2.start && period2.end) {
      setShowComparison(true);
    }
  };

  const orders1 = filterOrdersByPeriod(period1.start, period1.end);
  const orders2 = filterOrdersByPeriod(period2.start, period2.end);
  const stats1 = calculateStats(orders1);
  const stats2 = calculateStats(orders2);

  const calculateChange = (val1, val2) => {
    if (val2 === 0) return 0;
    return ((val1 - val2) / val2) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period 1 */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
          <h4 className="text-lg font-bold text-blue-900 mb-4">Period 1</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Label</label>
              <input
                type="text"
                value={period1.label}
                onChange={e => setPeriod1({ ...period1, label: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Q1 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">Start Date</label>
              <input
                type="date"
                value={period1.start}
                onChange={e => setPeriod1({ ...period1, start: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">End Date</label>
              <input
                type="date"
                value={period1.end}
                onChange={e => setPeriod1({ ...period1, end: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Period 2 */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300">
          <h4 className="text-lg font-bold text-purple-900 mb-4">Period 2</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">Label</label>
              <input
                type="text"
                value={period2.label}
                onChange={e => setPeriod2({ ...period2, label: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Q1 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">Start Date</label>
              <input
                type="date"
                value={period2.start}
                onChange={e => setPeriod2({ ...period2, start: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-900 mb-1">End Date</label>
              <input
                type="date"
                value={period2.end}
                onChange={e => setPeriod2({ ...period2, end: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="text-center">
        <button
          onClick={handleCompare}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!period1.start || !period1.end || !period2.start || !period2.end}
        >
          Compare Periods
        </button>
      </div>

      {/* Comparison Results */}
      {showComparison && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Overview Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Spending */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Total Spending</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-700">{period1.label}</div>
                    <div className="text-lg font-bold text-blue-900">
                      ${stats1.totalSpent.toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-purple-700">{period2.label}</div>
                    <div className="text-lg font-bold text-purple-900">
                      ${stats2.totalSpent.toFixed(0)}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${calculateChange(stats1.totalSpent, stats2.totalSpent) > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {calculateChange(stats1.totalSpent, stats2.totalSpent) > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(calculateChange(stats1.totalSpent, stats2.totalSpent)).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Total Orders</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-700">{period1.label}</div>
                    <div className="text-lg font-bold text-blue-900">{stats1.totalOrders}</div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-purple-700">{period2.label}</div>
                    <div className="text-lg font-bold text-purple-900">{stats2.totalOrders}</div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${calculateChange(stats1.totalOrders, stats2.totalOrders) > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {calculateChange(stats1.totalOrders, stats2.totalOrders) > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(calculateChange(stats1.totalOrders, stats2.totalOrders)).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Avg Order Value */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Avg Order Value</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-700">{period1.label}</div>
                    <div className="text-lg font-bold text-blue-900">
                      ${stats1.avgOrderValue.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-purple-700">{period2.label}</div>
                    <div className="text-lg font-bold text-purple-900">
                      ${stats2.avgOrderValue.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${calculateChange(stats1.avgOrderValue, stats2.avgOrderValue) > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {calculateChange(stats1.avgOrderValue, stats2.avgOrderValue) > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(calculateChange(stats1.avgOrderValue, stats2.avgOrderValue)).toFixed(1)}
                  %
                </div>
              </div>
            </div>

            {/* Unique Products */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Unique Products</div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-700">{period1.label}</div>
                    <div className="text-lg font-bold text-blue-900">{stats1.uniqueProducts}</div>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <div className="text-xs text-purple-700">{period2.label}</div>
                    <div className="text-lg font-bold text-purple-900">{stats2.uniqueProducts}</div>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold ${calculateChange(stats1.uniqueProducts, stats2.uniqueProducts) > 0 ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  {calculateChange(stats1.uniqueProducts, stats2.uniqueProducts) > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(calculateChange(stats1.uniqueProducts, stats2.uniqueProducts)).toFixed(
                    1
                  )}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Category Comparison */}
          <div className="card bg-white">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.keys({ ...stats1.byCategory, ...stats2.byCategory }).map(category => {
                const spent1 = stats1.byCategory[category]?.spent || 0;
                const spent2 = stats2.byCategory[category]?.spent || 0;
                const maxSpent = Math.max(spent1, spent2);

                return (
                  <div key={category} className="border-b border-gray-200 pb-2">
                    <div className="text-sm font-medium text-gray-700 mb-1">{category}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full transition-all duration-300"
                              style={{ width: `${maxSpent > 0 ? (spent1 / maxSpent) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-blue-900 w-16 text-right">
                            ${spent1.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-purple-500 h-full transition-all duration-300"
                              style={{ width: `${maxSpent > 0 ? (spent2 / maxSpent) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-purple-900 w-16 text-right">
                            ${spent2.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
