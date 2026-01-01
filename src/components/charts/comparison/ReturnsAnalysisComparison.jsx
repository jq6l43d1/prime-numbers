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

export function ReturnsAnalysisComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Create datasets showing return counts and return rates
  const labels = datasetStats.map(item => item.dataset.name);

  const returnCountsDataset = {
    label: 'Total Returns',
    data: datasetStats.map(item => item.stats?.returns?.totalReturns || 0),
    backgroundColor: CHART_COLOR_PALETTE[0],
    borderColor: CHART_COLOR_PALETTE[0],
    borderWidth: 1,
    yAxisID: 'y',
  };

  const returnRateDataset = {
    label: 'Return Rate (%)',
    data: datasetStats.map(item => {
      const returnRate = item.stats?.returns?.returnRate || 0;
      return parseFloat(returnRate);
    }),
    backgroundColor: CHART_COLOR_PALETTE[1],
    borderColor: CHART_COLOR_PALETTE[1],
    borderWidth: 1,
    yAxisID: 'y1',
  };

  const chartData = {
    labels: labels,
    datasets: [returnCountsDataset, returnRateDataset],
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Returns Analysis Comparison',
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
            if (label.includes('%')) {
              return `${label}: ${value.toFixed(1)}%`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Returns',
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Return Rate (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(1) + '%';
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
