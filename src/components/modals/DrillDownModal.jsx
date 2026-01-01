import { format } from 'date-fns';
import { formatNumber } from '../../utils/currencyHelpers';

export function DrillDownModal({ isOpen, onClose, data, type }) {
  if (!isOpen) return null;

  const renderProductDetails = () => {
    if (!data.orders || data.orders.length === 0) {
      return <p className="text-gray-500">No order details available</p>;
    }

    const totalSpent = data.orders.reduce((sum, order) => sum + (order.totalOwed || 0), 0);
    const totalQuantity = data.orders.reduce((sum, order) => sum + (order.quantity || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{data.orders.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
            <p className="text-2xl font-bold text-green-700">{totalQuantity}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-700">${formatNumber(totalSpent, 2)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Order History</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.orders.map((order, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {order.productName || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.orderDate
                        ? format(new Date(order.orderDate), 'MMM dd, yyyy')
                        : 'Unknown date'}
                    </p>
                    {order.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {order.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">
                      ${formatNumber(order.totalOwed || 0, 2)}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {order.quantity || 1}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryDetails = () => {
    if (!data.orders || data.orders.length === 0) {
      return <p className="text-gray-500">No orders in this category</p>;
    }

    const totalSpent = data.orders.reduce((sum, order) => sum + (order.totalOwed || 0), 0);
    const avgOrderValue = totalSpent / data.orders.length;

    // Group by product
    const productGroups = {};
    data.orders.forEach(order => {
      const key = order.productName || 'Unknown Product';
      if (!productGroups[key]) {
        productGroups[key] = {
          name: key,
          orders: 0,
          quantity: 0,
          spent: 0,
        };
      }
      productGroups[key].orders++;
      productGroups[key].quantity += order.quantity || 1;
      productGroups[key].spent += order.totalOwed || 0;
    });

    const topProducts = Object.values(productGroups)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{data.orders.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Average Order</p>
            <p className="text-2xl font-bold text-green-700">${formatNumber(avgOrderValue, 2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-700">${formatNumber(totalSpent, 2)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Top Products in Category</h4>
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.orders} orders • Qty: {product.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">${formatNumber(product.spent, 2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTimeDetails = () => {
    if (!data.orders || data.orders.length === 0) {
      return <p className="text-gray-500">No orders in this time period</p>;
    }

    const totalSpent = data.orders.reduce((sum, order) => sum + (order.totalOwed || 0), 0);
    const totalQuantity = data.orders.reduce((sum, order) => sum + (order.quantity || 0), 0);

    // Group by category
    const categoryGroups = {};
    data.orders.forEach(order => {
      const cat = order.category || 'Other';
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = { spent: 0, orders: 0 };
      }
      categoryGroups[cat].spent += order.totalOwed || 0;
      categoryGroups[cat].orders++;
    });

    const topCategories = Object.entries(categoryGroups)
      .map(([cat, stats]) => ({ category: cat, ...stats }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 8);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-blue-700">{data.orders.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Items</p>
            <p className="text-2xl font-bold text-green-700">{totalQuantity}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-purple-700">${formatNumber(totalSpent, 2)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Spending by Category</h4>
          <div className="space-y-2">
            {topCategories.map((cat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{cat.category}</p>
                    <p className="text-sm text-gray-600">{cat.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${formatNumber(cat.spent, 2)}</p>
                    <p className="text-sm text-gray-600">
                      {formatNumber((cat.spent / totalSpent) * 100, 1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'product':
        return renderProductDetails();
      case 'category':
        return renderCategoryDetails();
      case 'time':
        return renderTimeDetails();
      default:
        return <p className="text-gray-500">Unknown data type</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{data.title || 'Details'}</h2>
              {data.subtitle && <p className="text-blue-100">{data.subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">{renderContent()}</div>
      </div>
    </div>
  );
}
