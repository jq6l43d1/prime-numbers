import { useState, useMemo } from 'react';

export function ProductSearchFilter({ orders, onFilteredOrdersChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const categorySet = new Set();
    orders.forEach(order => {
      if (order.category) {
        categorySet.add(order.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [orders]);

  // Apply all filters
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.productName && order.productName.toLowerCase().includes(term)) ||
        (order.asin && order.asin.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(order => order.category === selectedCategory);
    }

    // Price range filter
    if (minPrice !== '') {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(order => (order.totalOwed || 0) >= min);
    }

    if (maxPrice !== '') {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(order => (order.totalOwed || 0) <= max);
    }

    return filtered;
  }, [orders, searchTerm, minPrice, maxPrice, selectedCategory]);

  // Update parent component when filters change
  useMemo(() => {
    if (onFilteredOrdersChange) {
      onFilteredOrdersChange(filteredOrders);
    }
  }, [filteredOrders, onFilteredOrdersChange]);

  const handleReset = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchTerm || minPrice || maxPrice || selectedCategory;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <h3 className="text-xl font-bold text-gray-900">Search & Filter Products</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Product Name or ASIN
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter product name or ASIN..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Category and Price Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="$0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-900">
              Showing {filteredOrders.length} of {orders?.length || 0} orders
              {searchTerm && <span className="ml-1">matching "{searchTerm}"</span>}
              {selectedCategory && <span className="ml-1">in {selectedCategory}</span>}
              {(minPrice || maxPrice) && (
                <span className="ml-1">
                  priced {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : 'unlimited'}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
