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

export function MerchantAnalysisComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get top merchants across all datasets (top 10)
  const allMerchantsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.merchants?.topMerchants) {
      stats?.merchants?.topMerchants.slice(0, 10).forEach(m => allMerchantsSet.add(m.merchant));
    }
  });
  const allMerchants = Array.from(allMerchantsSet);

  const datasets = datasetStats.map((item, index) => {
    // Create a map of merchant -> count for this dataset
    const merchantMap = new Map();
    if (item.stats?.merchants?.topMerchants) {
      item.stats?.merchants?.topMerchants.forEach(m => {
        merchantMap.set(m.merchant, m.orderCount);
      });
    }

    // Fill in data for all merchants (0 if not present)
    const data = allMerchants.map(merchant => merchantMap.get(merchant) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1
    };
  });

  const chartData = {
    labels: allMerchants,
    datasets: datasets
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    indexAxis: 'y',
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Top Merchants Comparison',
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
            return `${label}: ${value} orders`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      y: {
        ticks: {
          autoSkip: false
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
