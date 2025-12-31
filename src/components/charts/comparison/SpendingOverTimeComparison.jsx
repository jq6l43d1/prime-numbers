import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { LINE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SpendingOverTimeComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique months across all datasets
  const allMonthsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.spending?.overTime) {
      stats?.spending?.overTime.forEach(d => allMonthsSet.add(d.month));
    }
  });
  const allMonths = Array.from(allMonthsSet).sort();

  const datasets = datasetStats.map((item, index) => {
    // Create a map of month -> amount for this dataset
    const monthMap = new Map();
    if (item.stats?.spending?.overTime) {
      item.stats?.spending?.overTime.forEach(d => {
        monthMap.set(d.month, d.amount);
      });
    }

    // Fill in data for all months (0 if not present)
    const data = allMonths.map(month => monthMap.get(month) || 0);

    return {
      label: item.dataset.name,
      data: data,
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}20`,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });

  const chartData = {
    labels: allMonths,
    datasets: datasets
  };

  const options = {
    ...LINE_CHART_OPTIONS,
    plugins: {
      ...LINE_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Spending Over Time Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
