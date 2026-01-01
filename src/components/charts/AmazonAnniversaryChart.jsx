import { Card } from '../common/Card';
import { formatCurrency, formatNumber } from '../../utils/currencyHelpers';
import { formatDate } from '../../utils/dateHelpers';

export function AmazonAnniversaryChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Sort orders by date
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.orderDate);
    const dateB = new Date(b.orderDate);
    return dateA - dateB;
  });

  // Filter out Prime Membership Fee for first order calculation
  const nonPrimeOrders = sortedOrders.filter(
    order => !order.productName || !order.productName.toLowerCase().includes('prime membership')
  );

  // Calculate years as customer
  const firstOrderDate = new Date(sortedOrders[0].orderDate);
  const lastOrderDate = new Date(sortedOrders[sortedOrders.length - 1].orderDate);
  const yearsAsCustomer = ((lastOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(
    1
  );

  // First order details (excluding Prime Membership)
  const firstOrder = nonPrimeOrders.length > 0 ? nonPrimeOrders[0] : sortedOrders[0];

  // Most expensive order
  const mostExpensiveOrder = orders.reduce((max, order) => {
    return (order.totalOwed || 0) > (max.totalOwed || 0) ? order : max;
  }, orders[0]);

  // Order with most items
  const mostItemsOrder = orders.reduce((max, order) => {
    return (order.quantity || 0) > (max.quantity || 0) ? order : max;
  }, orders[0]);

  // Calculate longest time between orders
  let longestGap = 0;
  let longestGapOrders = { before: null, after: null };

  for (let i = 1; i < sortedOrders.length; i++) {
    const prevDate = new Date(sortedOrders[i - 1].orderDate);
    const currDate = new Date(sortedOrders[i].orderDate);
    const gap = (currDate - prevDate) / (1000 * 60 * 60 * 24); // days

    if (gap > longestGap) {
      longestGap = gap;
      longestGapOrders = {
        before: sortedOrders[i - 1],
        after: sortedOrders[i],
      };
    }
  }

  const stats = [
    {
      icon: '🎂',
      label: 'Years as Customer',
      value: yearsAsCustomer,
      subtitle: `Since ${formatDate(firstOrderDate, 'MMM d, yyyy')}`,
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-900',
    },
    {
      icon: '🎁',
      label: 'First Order',
      value:
        firstOrder.productName?.substring(0, 40) +
        (firstOrder.productName?.length > 40 ? '...' : ''),
      subtitle: `${formatCurrency(firstOrder.totalOwed)} on ${formatDate(firstOrder.orderDate, 'MMM d, yyyy')}`,
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
      valueSize: 'text-sm',
    },
    {
      icon: '💰',
      label: 'Most Expensive Order',
      value: formatCurrency(mostExpensiveOrder.totalOwed),
      subtitle: `${mostExpensiveOrder.productName?.substring(0, 50)}...`,
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-900',
    },
    {
      icon: '📦',
      label: 'Most Items in One Order',
      value: `${formatNumber(mostItemsOrder.quantity, 0)} items`,
      subtitle: `${mostItemsOrder.productName?.substring(0, 50)}...`,
      color: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-900',
    },
    {
      icon: '⏱️',
      label: 'Longest Break from Amazon',
      value: `${Math.floor(longestGap)} days`,
      subtitle: `${formatDate(longestGapOrders.before?.orderDate, 'MMM yyyy')} to ${formatDate(longestGapOrders.after?.orderDate, 'MMM yyyy')}`,
      color: 'from-red-50 to-red-100',
      textColor: 'text-red-900',
    },
    {
      icon: '📊',
      label: 'Total Orders',
      value: formatNumber(orders.length, 0),
      subtitle: `${formatNumber(
        orders.reduce((sum, o) => sum + (o.quantity || 0), 0),
        0
      )} items total`,
      color: 'from-indigo-50 to-indigo-100',
      textColor: 'text-indigo-900',
    },
  ];

  return (
    <Card title="🎉 Amazon Anniversary Stats" subtitle="Your shopping journey milestones">
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
              <p
                className={`${stat.valueSize || 'text-2xl'} font-bold ${stat.textColor} mb-1 break-words`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-600 break-words">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fun facts section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">🏆 Fun Facts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
          <div>
            • Average order value:{' '}
            <span className="font-semibold">
              {formatCurrency(
                orders.reduce((sum, o) => sum + (o.totalOwed || 0), 0) / orders.length
              )}
            </span>
          </div>
          <div>
            • Orders per year:{' '}
            <span className="font-semibold">
              {formatNumber(orders.length / parseFloat(yearsAsCustomer), 1)}
            </span>
          </div>
          <div>
            • Average days between orders:{' '}
            <span className="font-semibold">
              {formatNumber(
                (lastOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24) / orders.length,
                1
              )}
            </span>
          </div>
          <div>
            • Total spent:{' '}
            <span className="font-semibold">
              {formatCurrency(orders.reduce((sum, o) => sum + (o.totalOwed || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
