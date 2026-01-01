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
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function GiftOrdersChart({ orders, onClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Separate gift orders from personal orders
  // Only consider it a gift if giftMessage or giftSenderName has actual content (not empty/whitespace/Not Available)
  const isValidGiftField = value => {
    if (!value) return false;
    const trimmed = value.trim();
    if (trimmed.length === 0) return false;
    if (trimmed.toLowerCase() === 'not available') return false;
    return true;
  };

  const giftOrders = orders.filter(o => {
    const hasGiftMessage = isValidGiftField(o.giftMessage);
    const hasGiftSender = isValidGiftField(o.giftSenderName);
    return hasGiftMessage || hasGiftSender;
  });
  const personalOrders = orders.filter(o => {
    const hasGiftMessage = isValidGiftField(o.giftMessage);
    const hasGiftSender = isValidGiftField(o.giftSenderName);
    return !hasGiftMessage && !hasGiftSender;
  });

  // Calculate stats
  const giftSpending = giftOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);
  const personalSpending = personalOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);

  const chartData = {
    labels: ['Gift Orders', 'Personal Orders'],
    datasets: [
      {
        label: 'Number of Orders',
        data: [giftOrders.length, personalOrders.length],
        backgroundColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Total Spending',
        data: [giftSpending, personalSpending],
        backgroundColor: [`${CHART_COLORS.secondary}80`, `${CHART_COLORS.primary}80`],
        borderColor: [CHART_COLORS.secondary, CHART_COLORS.primary],
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const isGift = index === 0;
            const relevantOrders = isGift ? giftOrders : personalOrders;
            const type = isGift ? 'Gift Orders' : 'Personal Orders';

            onClick({
              type,
              isGift,
              orders: relevantOrders,
              totalSpent: relevantOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0),
            });
          }
        }
      : undefined,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Orders',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Total Spending ($)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y1') {
              label += '$' + formatNumber(context.parsed.y, 2);
            } else {
              label += formatNumber(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  const avgGiftValue = giftOrders.length > 0 ? giftSpending / giftOrders.length : 0;
  const avgPersonalValue = personalOrders.length > 0 ? personalSpending / personalOrders.length : 0;
  const giftPercentage =
    orders.length > 0 ? formatNumber((giftOrders.length / orders.length) * 100, 1) : 0;

  return (
    <div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-pink-50 rounded p-3">
            <div className="font-semibold text-gray-900">🎁 Gift Orders</div>
            <div className="text-xs text-gray-600 mt-1">
              {formatNumber(giftOrders.length, 0)} orders • ${formatNumber(giftSpending, 2)}
            </div>
            <div className="text-xs text-gray-500">Avg: ${formatNumber(avgGiftValue, 2)}</div>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <div className="font-semibold text-gray-900">🛍️ Personal Orders</div>
            <div className="text-xs text-gray-600 mt-1">
              {formatNumber(personalOrders.length, 0)} orders • ${formatNumber(personalSpending, 2)}
            </div>
            <div className="text-xs text-gray-500">Avg: ${formatNumber(avgPersonalValue, 2)}</div>
          </div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <span className="font-semibold">{giftPercentage}%</span> of your orders are gifts
        </div>
      </div>
    </div>
  );
}
