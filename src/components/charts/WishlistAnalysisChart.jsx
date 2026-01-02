import { Card } from '../common/Card';
import { formatNumber } from '../../utils/currencyHelpers';
import { formatDate } from '../../utils/dateHelpers';

export function WishlistAnalysisChart({ orders, cartItems }) {
  if (!cartItems || cartItems.length === 0) {
    return (
      <Card title="📋 Wishlist & Saved Items Analysis" subtitle="No cart data available">
        <div className="text-center text-gray-500 py-8">
          <p>No saved items data found in your Amazon export.</p>
          <p className="text-sm mt-2">
            This feature requires cart items data from your Amazon data export.
          </p>
        </div>
      </Card>
    );
  }

  // Separate saved items from active cart
  const savedItems = cartItems.filter(item => item.cartList === 'saved');
  const activeCart = cartItems.filter(item => item.cartList !== 'saved');

  // Find which saved items were eventually purchased
  const purchasedFromSaved = savedItems.filter(item => {
    return orders.some(order => order.asin === item.asin);
  });

  const neverPurchased = savedItems.filter(item => {
    return !orders.some(order => order.asin === item.asin);
  });

  // Calculate average time items stay saved
  const itemAges = savedItems.map(item => {
    const addedDate = new Date(item.dateAddedToCart);
    const now = new Date();
    const daysInCart = Math.floor((now - addedDate) / (1000 * 60 * 60 * 24));
    return { ...item, daysInCart };
  });

  const avgDaysInCart =
    itemAges.length > 0
      ? itemAges.reduce((sum, item) => sum + item.daysInCart, 0) / itemAges.length
      : 0;

  // Find oldest saved item
  const oldestItem = itemAges.reduce(
    (oldest, item) => (item.daysInCart > oldest.daysInCart ? item : oldest),
    itemAges[0] || { daysInCart: 0 }
  );

  // Conversion rate
  const conversionRate =
    savedItems.length > 0 ? (purchasedFromSaved.length / savedItems.length) * 100 : 0;

  // Calculate quantity distribution
  const totalQuantity = savedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const stats = [
    {
      icon: '💾',
      label: 'Items Saved',
      value: formatNumber(savedItems.length, 0),
      subtitle: `${formatNumber(totalQuantity, 0)} total units`,
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-900',
    },
    {
      icon: '🛒',
      label: 'Active Cart Items',
      value: formatNumber(activeCart.length, 0),
      subtitle: activeCart.length > 0 ? 'Ready to purchase' : 'Empty cart',
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-900',
    },
    {
      icon: '✅',
      label: 'Eventually Purchased',
      value: formatNumber(purchasedFromSaved.length, 0),
      subtitle: `${conversionRate.toFixed(1)}% conversion rate`,
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
    },
    {
      icon: '⏰',
      label: 'Never Purchased',
      value: formatNumber(neverPurchased.length, 0),
      subtitle: `${((neverPurchased.length / savedItems.length) * 100).toFixed(1)}% of saved`,
      color: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-900',
    },
    {
      icon: '📅',
      label: 'Avg Time Saved',
      value: `${Math.floor(avgDaysInCart)} days`,
      subtitle: 'Before purchase or now',
      color: 'from-teal-50 to-teal-100',
      textColor: 'text-teal-900',
    },
    {
      icon: '🕰️',
      label: 'Oldest Saved Item',
      value: `${oldestItem.daysInCart} days`,
      subtitle: `Since ${formatDate(oldestItem.dateAddedToCart, 'MMM yyyy')}`,
      color: 'from-red-50 to-red-100',
      textColor: 'text-red-900',
    },
  ];

  return (
    <Card
      title="📋 Wishlist & Saved Items Analysis"
      subtitle={`${formatNumber(savedItems.length, 0)} items saved for later`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Saved Items */}
      {neverPurchased.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            🔖 Top 10 Never Purchased (Consider Buying?)
          </h3>
          <div className="space-y-2">
            {neverPurchased.slice(0, 10).map((item, index) => {
              const age = Math.floor(
                (new Date() - new Date(item.dateAddedToCart)) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Saved {age} days ago • Qty: {item.quantity || 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-600">
                        {formatDate(item.dateAddedToCart, 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shopping Behavior Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">🧠 Shopping Behavior</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Impulse vs Planned:</span>
            {conversionRate > 50
              ? ' You often buy saved items (planned shopper)'
              : ' You save items but rarely buy them (browser)'}
          </div>
          <div>
            <span className="font-semibold">Decision Time:</span>
            {avgDaysInCart < 30
              ? ' Quick decision maker (< 30 days)'
              : avgDaysInCart < 90
                ? ' Moderate consideration (30-90 days)'
                : ' Long consideration period (90+ days)'}
          </div>
          {savedItems.length > 50 && (
            <div className="md:col-span-2">
              <span className="font-semibold">🎯 Tip:</span> You have {savedItems.length} saved
              items. Consider reviewing and removing items you no longer want to declutter your
              wishlist!
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
