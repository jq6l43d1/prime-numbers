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
import { formatNumber } from '../../../utils/currencyHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ProductConditionComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique conditions across all datasets
  const allConditionsSet = new Set();
  datasetStats.forEach(({ dataset }) => {
    const orders = dataset.orders || [];
    orders.forEach(order => {
      const condition = order.productCondition || 'Unknown';
      allConditionsSet.add(condition);
    });
  });
  const allConditions = Array.from(allConditionsSet);

  const datasets = datasetStats.map((item, index) => {
    // Count orders by condition for this dataset
    const conditionCounts = {};
    const orders = item.dataset.orders || [];

    orders.forEach(order => {
      const condition = order.productCondition || 'Unknown';
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });

    // Fill in data for all conditions (0 if not present)
    const data = allConditions.map(condition => conditionCounts[condition] || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: allConditions,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Product Condition Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        ticks: {
          callback: function (value) {
            return formatNumber(value);
          },
        },
        title: {
          display: true,
          text: 'Number of Orders',
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
