import { Bar } from 'react-chartjs-2';
import { formatNumber, formatCurrency } from '../../../utils/currencyHelpers';
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

export function GiftOrdersComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const categories = ['Gift Orders', 'Personal Orders'];

  const datasets = datasetStats.map((item, index) => {
    // Calculate gift and personal orders for this dataset
    const allOrders = item.dataset.orders || [];

    const giftOrders = allOrders.filter(o => {
      const hasGiftMessage = o.giftMessage && o.giftMessage.trim().length > 0;
      const hasGiftSender = o.giftSenderName && o.giftSenderName.trim().length > 0;
      return hasGiftMessage || hasGiftSender;
    });

    const personalOrders = allOrders.filter(o => {
      const hasGiftMessage = o.giftMessage && o.giftMessage.trim().length > 0;
      const hasGiftSender = o.giftSenderName && o.giftSenderName.trim().length > 0;
      return !hasGiftMessage && !hasGiftSender;
    });

    const giftSpending = giftOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);
    const personalSpending = personalOrders.reduce((sum, o) => sum + (o.totalOwed || 0), 0);

    return {
      label: item.dataset.name,
      data: [giftSpending, personalSpending],
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: categories,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Gift vs Personal Orders Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;

            // Calculate order counts
            const datasetIndex = context.datasetIndex;
            const item = datasetStats[datasetIndex];
            const allOrders = item.dataset.orders || [];

            const giftOrders = allOrders.filter(o => {
              const hasGiftMessage = o.giftMessage && o.giftMessage.trim().length > 0;
              const hasGiftSender = o.giftSenderName && o.giftSenderName.trim().length > 0;
              return hasGiftMessage || hasGiftSender;
            });

            const personalOrders = allOrders.filter(o => {
              const hasGiftMessage = o.giftMessage && o.giftMessage.trim().length > 0;
              const hasGiftSender = o.giftSenderName && o.giftSenderName.trim().length > 0;
              return !hasGiftMessage && !hasGiftSender;
            });

            const count = context.dataIndex === 0 ? giftOrders.length : personalOrders.length;

            return `${label}: $${formatNumber(value, 2)} (${count} orders)`;
          },
        },
      },
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
