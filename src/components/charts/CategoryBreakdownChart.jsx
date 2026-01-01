import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PIE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function CategoryBreakdownChart({ data, onCategoryClick }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Take top 8 categories and group rest as "Other"
  const topCategories = data.slice(0, 8);
  const otherCategories = data.slice(8);
  const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);

  const categories = [...topCategories];
  if (otherTotal > 0) {
    categories.push({ category: 'Other', amount: otherTotal });
  }

  const chartData = {
    labels: categories.map(d => d.category),
    datasets: [
      {
        data: categories.map(d => d.amount),
        backgroundColor: CHART_COLOR_PALETTE,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    ...PIE_CHART_OPTIONS,
    plugins: {
      ...PIE_CHART_OPTIONS.plugins,
      tooltip: {
        ...PIE_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
            return `${label}: ${formatted} (${percentage}%) - Click to view details`;
          },
        },
      },
    },
    onClick: onCategoryClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const category = categories[index].category;
            onCategoryClick(category);
          }
        }
      : undefined,
  };

  return <Doughnut data={chartData} options={options} />;
}
