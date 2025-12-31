import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { DEFAULT_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function DayOfWeekComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const datasets = datasetStats.map((item, index) => {
    // Create a map of day -> count for this dataset
    const dayMap = new Map();
    if (item.stats?.orders?.byDayOfWeek) {
      item.stats?.orders?.byDayOfWeek.forEach(d => {
        dayMap.set(d.day, d.count);
      });
    }

    // Fill in data for all days in order
    const data = daysOrder.map(day => dayMap.get(day) || 0);

    return {
      label: item.dataset.name,
      data: data,
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}40`,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });

  const chartData = {
    labels: daysOrder,
    datasets: datasets
  };

  const options = {
    ...DEFAULT_CHART_OPTIONS,
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Orders by Day of Week Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        ...DEFAULT_CHART_OPTIONS.plugins?.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.r;
            return `${label}: ${value} orders`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Radar data={chartData} options={options} />
    </div>
  );
}
