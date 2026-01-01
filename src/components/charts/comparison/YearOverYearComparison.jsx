import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../../utils/currencyHelpers';
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

export function YearOverYearComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get spending by year for each dataset
  const yearData = datasetStats.map(item => {
    const yearMap = {};

    item.dataset.orders.forEach(order => {
      if (!order.orderDate) return;
      const year = new Date(order.orderDate).getFullYear();
      yearMap[year] = (yearMap[year] || 0) + (order.totalOwed || 0);
    });

    return {
      name: item.dataset.name,
      yearMap,
      color: CHART_COLOR_PALETTE[datasetStats.indexOf(item) % CHART_COLOR_PALETTE.length],
    };
  });

  // Get all unique years across all datasets
  const allYears = new Set();
  yearData.forEach(({ yearMap }) => {
    Object.keys(yearMap).forEach(year => allYears.add(parseInt(year)));
  });
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);

  if (sortedYears.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const yearMap = yearData[index].yearMap;

    return {
      label: item.dataset.name,
      data: sortedYears.map(year => yearMap[year] || 0),
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}80`,
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 2,
      borderRadius: 6,
    };
  });

  const chartData = {
    labels: sortedYears.map(y => y.toString()),
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Year-over-Year Spending Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: $${formatNumber(context.parsed.y, 2)}`;
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
