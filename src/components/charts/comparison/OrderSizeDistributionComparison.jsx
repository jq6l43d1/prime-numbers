import { Bar } from 'react-chartjs-2';
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

export function OrderSizeDistributionComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const sizeLabels = ['1 item', '2-3 items', '4-5 items', '6-10 items', '11+ items'];

  const datasets = datasetStats.map((item, index) => {
    const sizeCategories = {
      '1 item': 0,
      '2-3 items': 0,
      '4-5 items': 0,
      '6-10 items': 0,
      '11+ items': 0,
    };

    // Group orders by order ID to get actual order sizes
    const orderSizes = {};
    item.dataset.orders.forEach(order => {
      const orderId = order.orderId || order.orderDate;
      if (!orderSizes[orderId]) {
        orderSizes[orderId] = 0;
      }
      orderSizes[orderId] += order.quantity || 1;
    });

    Object.values(orderSizes).forEach(size => {
      if (size === 1) sizeCategories['1 item']++;
      else if (size <= 3) sizeCategories['2-3 items']++;
      else if (size <= 5) sizeCategories['4-5 items']++;
      else if (size <= 10) sizeCategories['6-10 items']++;
      else sizeCategories['11+ items']++;
    });

    return {
      label: item.dataset.name,
      data: sizeLabels.map(label => sizeCategories[label]),
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}80`,
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 2,
    };
  });

  const chartData = {
    labels: sizeLabels,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Order Size Distribution Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: ${context.parsed.y} orders`;
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
