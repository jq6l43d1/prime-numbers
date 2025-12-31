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
import { BAR_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function OrderStatusComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique statuses across all datasets
  const allStatusesSet = new Set();
  datasetStats.forEach(({ dataset }) => {
    const orders = dataset.orders || [];
    orders.forEach((order) => {
      const status = order.orderStatus || 'Unknown';
      allStatusesSet.add(status);
    });
  });
  const allStatuses = Array.from(allStatusesSet);

  const datasets = datasetStats.map((item, index) => {
    // Count orders by status for this dataset
    const statusCounts = {};
    const orders = item.dataset.orders || [];

    orders.forEach((order) => {
      const status = order.orderStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Fill in data for all statuses (0 if not present)
    const data = allStatuses.map(status => statusCounts[status] || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1
    };
  });

  const chartData = {
    labels: allStatuses,
    datasets: datasets
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Order Status Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Number of Orders'
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
