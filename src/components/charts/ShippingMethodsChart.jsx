import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PIE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ShippingMethodsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Take top 6 methods and group rest as "Other"
  const topMethods = data.slice(0, 6);
  const otherMethods = data.slice(6);
  const otherTotal = otherMethods.reduce((sum, method) => sum + method.count, 0);

  const methods = [...topMethods];
  if (otherTotal > 0) {
    methods.push({ method: 'Other', count: otherTotal });
  }

  const chartData = {
    labels: methods.map(d => d.method),
    datasets: [
      {
        data: methods.map(d => d.count),
        backgroundColor: CHART_COLOR_PALETTE,
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const options = {
    ...PIE_CHART_OPTIONS,
    plugins: {
      ...PIE_CHART_OPTIONS.plugins,
      tooltip: {
        ...PIE_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} orders (${percentage}%)`;
          }
        }
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}
