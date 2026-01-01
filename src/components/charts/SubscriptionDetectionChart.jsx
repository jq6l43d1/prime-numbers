import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SubscriptionDetectionChart({ orders, onSubscriptionClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Detect potential subscriptions by looking for products that appear monthly
  // Group by product name and count occurrences by month
  const productMonthMap = {};

  orders.forEach(order => {
    if (!order.productName || !order.orderDate) return;

    const date = new Date(order.orderDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const productKey = order.productName.trim().substring(0, 60); // Truncate for grouping

    if (!productMonthMap[productKey]) {
      productMonthMap[productKey] = {
        months: new Set(),
        totalSpent: 0,
        count: 0,
        orders: [],
      };
    }

    productMonthMap[productKey].months.add(monthKey);
    productMonthMap[productKey].totalSpent += order.totalOwed || 0;
    productMonthMap[productKey].count += 1;
    productMonthMap[productKey].orders.push(order);
  });

  // Filter for potential subscriptions (appeared in 3+ different months)
  const subscriptions = Object.entries(productMonthMap)
    .filter(([, data]) => data.months.size >= 3)
    .map(([product, data]) => ({
      product,
      frequency: data.months.size,
      totalSpent: data.totalSpent,
      avgPrice: data.totalSpent / data.count,
      count: data.count,
      orders: data.orders,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); // Top 10 recurring items

  if (subscriptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg mb-2">No recurring purchases detected</p>
        <p className="text-sm">
          Products need to appear in 3+ different months to be considered recurring
        </p>
      </div>
    );
  }

  const chartData = {
    labels: subscriptions.map(s => {
      const truncated = s.product.length > 30 ? s.product.substring(0, 30) + '...' : s.product;
      return truncated;
    }),
    datasets: [
      {
        label: 'Months Active',
        data: subscriptions.map(s => s.frequency),
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => {
            const sub = subscriptions[context.dataIndex];
            return [
              `Active: ${sub.frequency} months`,
              `Orders: ${formatNumber(sub.count, 0)}`,
              `Total Spent: $${formatNumber(sub.totalSpent, 2)}`,
              `Avg: $${formatNumber(sub.avgPrice, 2)}/order`,
            ];
          },
          afterLabel: () => 'Click to view details',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Months',
          font: { size: 12, weight: 'bold' },
        },
      },
      y: {
        ticks: {
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
    },
    onClick: onSubscriptionClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const subscription = subscriptions[index];
            onSubscriptionClick(subscription);
          }
        }
      : undefined,
  };

  // Summary stats
  const totalRecurringSpend = subscriptions.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalRecurringOrders = subscriptions.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-900">
            {formatNumber(subscriptions.length)}
          </div>
          <div className="text-xs text-purple-700 font-medium">Recurring Items</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-indigo-900">
            {formatNumber(totalRecurringOrders, 0)}
          </div>
          <div className="text-xs text-indigo-700 font-medium">Total Orders</div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-violet-900">
            ${formatNumber(totalRecurringSpend, 2)}
          </div>
          <div className="text-xs text-violet-700 font-medium">Total Spent</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 text-center">
        Recurring purchases are detected when a product appears in 3 or more different months
      </div>
    </div>
  );
}
