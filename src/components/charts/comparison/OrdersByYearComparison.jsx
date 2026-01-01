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

export function OrdersByYearComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique years across all datasets
  const allYearsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.orders?.byYear) {
      stats?.orders?.byYear.forEach(d => allYearsSet.add(d.year));
    }
  });
  const allYears = Array.from(allYearsSet).sort();

  const datasets = datasetStats.map((item, index) => {
    // Create a map of year -> count for this dataset
    const yearMap = new Map();
    if (item.stats?.orders?.byYear) {
      item.stats?.orders?.byYear.forEach(d => {
        yearMap.set(d.year, d.count);
      });
    }

    // Fill in data for all years (0 if not present)
    const data = allYears.map(year => yearMap.get(year) || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: allYears,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Orders by Year Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        ...BAR_CHART_OPTIONS.plugins?.tooltip,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} orders`;
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
            return value.toLocaleString();
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
