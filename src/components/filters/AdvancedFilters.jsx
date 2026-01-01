import { useState, useMemo, useEffect } from 'react';
import { formatNumber } from '../../utils/currencyHelpers';

export function AdvancedFilters({ orders, onFilteredOrdersChange }) {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for dropdowns
  const { statuses, shippingOptions, priceStats } = useMemo(() => {
    const statuses = new Set();
    const shippingOptions = new Set();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    orders.forEach(order => {
      if (order.orderStatus) statuses.add(order.orderStatus);
      if (order.shippingOption) shippingOptions.add(order.shippingOption);
      if (order.totalPrice) {
        minPrice = Math.min(minPrice, order.totalPrice);
        maxPrice = Math.max(maxPrice, order.totalPrice);
      }
    });

    return {
      statuses: Array.from(statuses).sort(),
      shippingOptions: Array.from(shippingOptions).sort(),
      priceStats: { min: Math.floor(minPrice), max: Math.ceil(maxPrice) },
    };
  }, [orders]);

  // Apply all filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Price filter
      if (priceRange.min && order.totalPrice < parseFloat(priceRange.min)) return false;
      if (priceRange.max && order.totalPrice > parseFloat(priceRange.max)) return false;

      // Status filter
      if (orderStatusFilter !== 'all' && order.orderStatus !== orderStatusFilter) return false;

      // Quantity filter
      if (quantityFilter === 'single' && order.quantity > 1) return false;
      if (quantityFilter === 'multiple' && order.quantity <= 1) return false;

      // Shipping filter
      if (shippingFilter !== 'all' && order.shippingOption !== shippingFilter) return false;

      return true;
    });
  }, [orders, priceRange, orderStatusFilter, quantityFilter, shippingFilter]);

  // Update parent component when filters change
  useEffect(() => {
    const hasActiveFilters =
      priceRange.min ||
      priceRange.max ||
      orderStatusFilter !== 'all' ||
      quantityFilter !== 'all' ||
      shippingFilter !== 'all';

    onFilteredOrdersChange(hasActiveFilters ? filteredOrders : null);
  }, [
    filteredOrders,
    priceRange,
    orderStatusFilter,
    quantityFilter,
    shippingFilter,
    onFilteredOrdersChange,
  ]);

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setOrderStatusFilter('all');
    setQuantityFilter('all');
    setShippingFilter('all');
  };

  const hasActiveFilters =
    priceRange.min ||
    priceRange.max ||
    orderStatusFilter !== 'all' ||
    quantityFilter !== 'all' ||
    shippingFilter !== 'all';

  return (
    <div className="card bg-white shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">🔍 Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-slideUp">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder={`Min ($${priceStats.min})`}
                value={priceRange.min}
                onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                className="input flex-1"
                min={priceStats.min}
                max={priceStats.max}
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder={`Max ($${priceStats.max})`}
                value={priceRange.max}
                onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                className="input flex-1"
                min={priceStats.min}
                max={priceStats.max}
              />
            </div>
          </div>

          {/* Grid for other filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Order Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <select
                value={quantityFilter}
                onChange={e => setQuantityFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Quantities</option>
                <option value="single">Single Items (1)</option>
                <option value="multiple">Multiple Items (2+)</option>
              </select>
            </div>

            {/* Shipping Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Method
              </label>
              <select
                value={shippingFilter}
                onChange={e => setShippingFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Methods</option>
                {shippingOptions.slice(0, 10).map(option => (
                  <option key={option} value={option}>
                    {option.substring(0, 30)}
                    {option.length > 30 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-bold text-blue-600">
                  {formatNumber(filteredOrders.length)}
                </span>{' '}
                of {formatNumber(orders.length)} orders
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
