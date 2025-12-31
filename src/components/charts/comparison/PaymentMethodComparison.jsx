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

export function PaymentMethodComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique payment methods across all datasets
  const allMethodsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.orders?.byPaymentMethod) {
      stats?.orders?.byPaymentMethod.forEach(m => allMethodsSet.add(m.method));
    }
  });
  const allMethods = Array.from(allMethodsSet);

  const datasets = datasetStats.map((item, index) => {
    // Create a map of method -> count for this dataset
    const methodMap = new Map();
    if (item.stats?.orders?.byPaymentMethod) {
      item.stats?.orders?.byPaymentMethod.forEach(m => {
        methodMap.set(m.method, m.count);
      });
    }

    // Fill in data for all methods (0 if not present)
    const data = allMethods.map(method => methodMap.get(method) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1
    };
  });

  const chartData = {
    labels: allMethods,
    datasets: datasets
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Payment Methods Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        ...BAR_CHART_OPTIONS.plugins?.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} orders`;
          }
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
