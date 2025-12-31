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
import { format } from 'date-fns';
import { LINE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function CategorySpendingTrendComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get top category for the first dataset to use as the comparison category
  const firstDataset = datasetStats[0];
  const categoryTotals = {};

  firstDataset.dataset.orders.forEach(order => {
    const category = order.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + (order.totalOwed || 0);
  });

  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Other';

  // Get monthly spending for this category across all datasets
  const allMonthsSet = new Set();
  const datasetMonthlyData = datasetStats.map(item => {
    const monthlyData = {};

    item.dataset.orders.forEach(order => {
      if (!order.orderDate) return;
      const category = order.category || 'Other';
      if (category !== topCategory) return;

      const monthKey = format(new Date(order.orderDate), 'yyyy-MM');
      allMonthsSet.add(monthKey);
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (order.totalOwed || 0);
    });

    return { name: item.dataset.name, monthlyData };
  });

  const allMonths = Array.from(allMonthsSet).sort().slice(-12); // Last 12 months

  if (allMonths.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const monthlyData = datasetMonthlyData[index].monthlyData;

    return {
      label: item.dataset.name,
      data: allMonths.map(month => monthlyData[month] || 0),
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}40`,
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    };
  });

  const chartData = {
    labels: allMonths.map(month => {
      const [year, monthNum] = month.split('-');
      return format(new Date(year, parseInt(monthNum) - 1, 1), 'MMM yy');
    }),
    datasets: datasets
  };

  const options = {
    ...LINE_CHART_OPTIONS,
    plugins: {
      ...LINE_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: `${topCategory} Spending Trend Comparison`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Showing trend for top category: {topCategory}
      </p>
    </div>
  );
}
