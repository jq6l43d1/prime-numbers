import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function OrderStatusChart({ orders, onStatusClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Count orders by status
  const statusCounts = {};

  orders.forEach(order => {
    const status = order.orderStatus || 'Unknown';
    if (!statusCounts[status]) {
      statusCounts[status] = {
        count: 0,
        totalSpent: 0,
      };
    }
    statusCounts[status].count += 1;
    statusCounts[status].totalSpent += order.totalOwed || 0;
  });

  // Sort by count
  const sortedStatuses = Object.entries(statusCounts).sort((a, b) => b[1].count - a[1].count);

  const labels = sortedStatuses.map(([status]) => status);
  const countData = sortedStatuses.map(([, stats]) => stats.count);

  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    CHART_COLORS.secondary,
    '#8B5CF6',
    '#EC4899',
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Order Count',
        data: countData,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onStatusClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const status = labels[index];
            const stats = sortedStatuses[index][1];

            // Find all orders with this status
            const statusOrders = orders.filter(o => (o.orderStatus || 'Unknown') === status);

            onStatusClick({
              status,
              orders: statusOrders,
              count: stats.count,
              totalSpent: stats.totalSpent,
            });
          }
        }
      : undefined,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const status = context.label;
            const count = context.parsed;
            const percentage = formatNumber((count / orders.length) * 100, 1);
            return `${status}: ${count} orders (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
      <div className="h-80">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
