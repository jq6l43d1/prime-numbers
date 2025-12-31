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
import { BAR_CHART_OPTIONS, CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function OrdersByMonthChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Number of Orders',
        data: data.map(d => d.orders),
        backgroundColor: CHART_COLORS.primary,
        borderColor: CHART_COLORS.primary,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      tooltip: {
        ...BAR_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
