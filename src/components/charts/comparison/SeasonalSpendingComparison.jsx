import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { LINE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SeasonalSpendingComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique season-year combinations across all datasets
  const allSeasonsSet = new Set();
  datasetStats.forEach(({ stats }) => {
    if (stats?.spending?.bySeason) {
      stats?.spending?.bySeason.forEach(s => {
        allSeasonsSet.add(`${s.season} ${s.year}`);
      });
    }
  });
  const allSeasons = Array.from(allSeasonsSet).sort();

  const datasets = datasetStats.map((item, index) => {
    // Create a map of season-year -> amount for this dataset
    const seasonMap = new Map();
    if (item.stats?.spending?.bySeason) {
      item.stats?.spending?.bySeason.forEach(s => {
        seasonMap.set(`${s.season} ${s.year}`, s.amount);
      });
    }

    // Fill in data for all seasons (0 if not present)
    const data = allSeasons.map(season => seasonMap.get(season) || 0);

    return {
      label: item.dataset.name,
      data: data,
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}20`,
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6
    };
  });

  const chartData = {
    labels: allSeasons,
    datasets: datasets
  };

  const options = {
    ...LINE_CHART_OPTIONS,
    plugins: {
      ...LINE_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Seasonal Spending Comparison',
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
