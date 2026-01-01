import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PIE_CHART_OPTIONS } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DigitalVsRetailChart({ digitalSpending, retailSpending, onTypeClick }) {
  if (!digitalSpending && !retailSpending) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const chartData = {
    labels: ['Digital Orders', 'Retail Orders'],
    datasets: [
      {
        data: [digitalSpending, retailSpending],
        backgroundColor: ['rgba(147, 51, 234, 0.8)', 'rgba(59, 130, 246, 0.8)'],
        borderColor: ['rgba(147, 51, 234, 1)', 'rgba(59, 130, 246, 1)'],
        borderWidth: 2,
        hoverBackgroundColor: ['rgba(147, 51, 234, 0.95)', 'rgba(59, 130, 246, 0.95)'],
        hoverBorderColor: ['rgba(147, 51, 234, 1)', 'rgba(59, 130, 246, 1)'],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    ...PIE_CHART_OPTIONS,
    onClick: (event, elements) => {
      if (elements.length > 0 && onTypeClick) {
        const index = elements[0].index;
        const type = index === 0 ? 'digital' : 'retail';
        onTypeClick(type);
      }
    },
    onHover: (event, activeElements) => {
      event.native.target.style.cursor =
        activeElements.length > 0 && onTypeClick ? 'pointer' : 'default';
    },
    plugins: {
      ...PIE_CHART_OPTIONS.plugins,
      tooltip: {
        ...PIE_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          title: function (context) {
            return onTypeClick ? 'Click to view orders' : context[0].label;
          },
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = formatNumber((value / total) * 100, 1);
            const formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
            return `${label}: ${formatted} (${percentage}%)`;
          },
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
