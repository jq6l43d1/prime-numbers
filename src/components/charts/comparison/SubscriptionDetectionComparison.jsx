import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SubscriptionDetectionComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Detect subscriptions for each dataset
  const subscriptionData = datasetStats.map(item => {
    const productMonthMap = {};

    item.dataset.orders.forEach(order => {
      if (!order.productName || !order.orderDate) return;

      const date = new Date(order.orderDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const productKey = order.productName.trim().substring(0, 60);

      if (!productMonthMap[productKey]) {
        productMonthMap[productKey] = {
          months: new Set(),
          totalSpent: 0,
          count: 0,
        };
      }

      productMonthMap[productKey].months.add(monthKey);
      productMonthMap[productKey].totalSpent += order.totalOwed || 0;
      productMonthMap[productKey].count += 1;
    });

    // Filter for potential subscriptions (appeared in 3+ different months)
    const subscriptions = Object.entries(productMonthMap).filter(
      ([, data]) => data.months.size >= 3
    );

    const totalRecurringItems = subscriptions.length;
    const totalRecurringOrders = subscriptions.reduce((sum, [, data]) => sum + data.count, 0);
    const totalRecurringSpend = subscriptions.reduce((sum, [, data]) => sum + data.totalSpent, 0);

    return {
      name: item.dataset.name,
      totalRecurringItems,
      totalRecurringOrders,
      totalRecurringSpend,
    };
  });

  const chartData = {
    labels: subscriptionData.map(d => d.name),
    datasets: [
      {
        label: 'Recurring Items',
        data: subscriptionData.map(d => d.totalRecurringItems),
        backgroundColor: subscriptionData.map(
          (_, i) => `${CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}80`
        ),
        borderColor: subscriptionData.map(
          (_, i) => CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]
        ),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Recurring Purchases Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const data = subscriptionData[context.dataIndex];
            return [
              `Recurring items: ${data.totalRecurringItems}`,
              `Total orders: ${data.totalRecurringOrders}`,
              `Total spent: $${formatNumber(data.totalRecurringSpend, 2)}`,
            ];
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Recurring purchases appear in 3+ different months
      </p>
    </div>
  );
}
