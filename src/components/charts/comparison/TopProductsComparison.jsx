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

export function TopProductsComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get top products by spending across all datasets (top 10)
  const allProductsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats.products.topBySpending) {
      stats.products.topBySpending.slice(0, 10).forEach(p => {
        // Truncate product name to avoid too long labels
        const shortName = p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title;
        allProductsSet.add(shortName);
      });
    }
  });
  const allProducts = Array.from(allProductsSet).slice(0, 10);

  const datasets = datasetStats.map((item, index) => {
    // Create a map of product -> amount for this dataset
    const productMap = new Map();
    if (item.stats.products.topBySpending) {
      item.stats.products.topBySpending.forEach(p => {
        const shortName = p.title.length > 40 ? p.title.substring(0, 40) + '...' : p.title;
        productMap.set(shortName, p.totalSpent);
      });
    }

    // Fill in data for all products (0 if not present)
    const data = allProducts.map(product => productMap.get(product) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1
    };
  });

  const chartData = {
    labels: allProducts,
    datasets: datasets
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    indexAxis: 'y',
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Top Products by Spending Comparison',
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
            const value = context.parsed.x;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      y: {
        ticks: {
          autoSkip: false,
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
