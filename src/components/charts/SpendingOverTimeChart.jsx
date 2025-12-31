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
import { LINE_CHART_OPTIONS, CHART_COLORS } from '../../constants/chartConfig';

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

export function SpendingOverTimeChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Total Spending',
        data: data.map(d => d.amount),
        borderColor: CHART_COLORS.primary,
        backgroundColor: `${CHART_COLORS.primary}20`,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  return <Line data={chartData} options={LINE_CHART_OPTIONS} />;
}
