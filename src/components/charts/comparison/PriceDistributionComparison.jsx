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

export function PriceDistributionComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique price ranges across all datasets
  const allRangesSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.products?.priceDistribution) {
      stats?.products?.priceDistribution.forEach(r => allRangesSet.add(r.range));
    }
  });
  const allRanges = Array.from(allRangesSet);

  const datasets = datasetStats.map((item, index) => {
    // Create a map of range -> count for this dataset
    const rangeMap = new Map();
    if (item.stats?.products?.priceDistribution) {
      item.stats?.products?.priceDistribution.forEach(r => {
        rangeMap.set(r.range, r.count);
      });
    }

    // Fill in data for all ranges (0 if not present)
    const data = allRanges.map(range => rangeMap.get(range) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1
    };
  });

  const chartData = {
    labels: allRanges,
    datasets: datasets
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Price Distribution Comparison',
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
            return `${label}: ${value} items`;
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
