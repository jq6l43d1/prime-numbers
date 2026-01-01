import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PIE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ShippingMethodsChart({ data, onMethodClick }) {
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
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    ...PIE_CHART_OPTIONS,
    onClick: onMethodClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const method = methods[index].method;
            onMethodClick(method);
          }
        }
      : undefined,
    onHover: onMethodClick
      ? (event, elements) => {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      : undefined,
    plugins: {
      ...PIE_CHART_OPTIONS.plugins,
      tooltip: {
        ...PIE_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = formatNumber((value / total) * 100, 1);
            return `${label}: ${formatNumber(value, 0)} orders (${percentage}%)`;
          },
          afterLabel: onMethodClick ? () => 'Click to view details' : undefined,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
