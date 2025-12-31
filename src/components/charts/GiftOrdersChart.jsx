import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function GiftOrdersChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Separate gift orders from personal orders
  const giftOrders = orders.filter(o => o.giftMessage || o.giftSenderName);
  const personalOrders = orders.filter(o => !o.giftMessage && !o.giftSenderName);

  // Calculate stats
  const giftSpending = giftOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);
  const personalSpending = personalOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);

  // Analyze gift orders by month
  const giftsByMonth = {};
  giftOrders.forEach(order => {
    const date = new Date(order.orderDate);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!giftsByMonth[monthKey]) {
      giftsByMonth[monthKey] = {
        count: 0,
        spending: 0
      };
    }

    giftsByMonth[monthKey].count += 1;
    giftsByMonth[monthKey].spending += order.totalOwed || 0;
  });

  // Get last 12 months of gift data
  const sortedMonths = Object.keys(giftsByMonth).sort((a, b) => {
    return new Date(a) - new Date(b);
  }).slice(-12);

  const chartData = {
    labels: ['Gift Orders', 'Personal Orders'],
    datasets: [
      {
        label: 'Number of Orders',
        data: [giftOrders.length, personalOrders.length],
        backgroundColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Total Spending',
        data: [giftSpending, personalSpending],
        backgroundColor: [`${CHART_COLORS.secondary}80`, `${CHART_COLORS.primary}80`],
        borderColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Total Spending ($)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y1') {
              label += '$' + context.parsed.y.toFixed(2);
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    }
  };

  const avgGiftValue = giftOrders.length > 0 ? giftSpending / giftOrders.length : 0;
  const avgPersonalValue = personalOrders.length > 0 ? personalSpending / personalOrders.length : 0;
  const giftPercentage = orders.length > 0 ? ((giftOrders.length / orders.length) * 100).toFixed(1) : 0;

  return (
    <div>
      <Bar data={chartData} options={options} />
      <div className="mt-4 space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-pink-50 rounded p-3">
            <div className="font-semibold text-gray-900">🎁 Gift Orders</div>
            <div className="text-xs text-gray-600 mt-1">
              {giftOrders.length} orders • ${giftSpending.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Avg: ${avgGiftValue.toFixed(2)}
            </div>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <div className="font-semibold text-gray-900">🛍️ Personal Orders</div>
            <div className="text-xs text-gray-600 mt-1">
              {personalOrders.length} orders • ${personalSpending.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Avg: ${avgPersonalValue.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <span className="font-semibold">{giftPercentage}%</span> of your orders are gifts
        </div>
      </div>
    </div>
  );
}
