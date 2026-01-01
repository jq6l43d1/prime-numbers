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

export function CategoryBreakdownComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique categories across all datasets (top 10)
  const allCategoriesSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.spending?.byCategory) {
      stats?.spending?.byCategory.slice(0, 10).forEach(c => allCategoriesSet.add(c.category));
    }
  });
  const allCategories = Array.from(allCategoriesSet);

  const datasets = datasetStats.map((item, index) => {
    // Create a map of category -> amount for this dataset
    const categoryMap = new Map();
    if (item.stats?.spending?.byCategory) {
      item.stats?.spending?.byCategory.forEach(c => {
        categoryMap.set(c.category, c.amount);
      });
    }

    // Fill in data for all categories (0 if not present)
    const data = allCategories.map(category => categoryMap.get(category) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: allCategories,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Category Breakdown Comparison',
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
            return '$' + value.toLocaleString();
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
