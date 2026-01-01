import { useMemo } from 'react';
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
  Filler,
} from 'chart.js';
import { LINE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

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

export function CumulativeOrdersComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const cumulativeData = useMemo(() => {
    return datasetStats.map(item => {
      const orders = [...item.dataset.orders].sort(
        (a, b) => new Date(a.orderDate) - new Date(b.orderDate)
      );

      let cumulative = 0;
      const cumulativeByDate = orders.map(order => {
        cumulative += 1;
        return {
          date: new Date(order.orderDate),
          cumulative: cumulative,
        };
      });

      // Group by month
      const monthlyData = {};
      cumulativeByDate.forEach(item => {
        const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = item.cumulative;
      });

      return { monthlyData, name: item.dataset.name };
    });
  }, [datasetStats]);

  // Get all unique months
  const allMonthsSet = new Set();
  cumulativeData.forEach(({ monthlyData }) => {
    Object.keys(monthlyData).forEach(month => allMonthsSet.add(month));
  });
  const allMonths = Array.from(allMonthsSet).sort();

  if (allMonths.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const monthlyData = cumulativeData[index].monthlyData;

    return {
      label: item.dataset.name,
      data: allMonths.map(month => monthlyData[month] || 0),
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      backgroundColor: `${CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}20`,
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
    };
  });

  const chartData = {
    labels: allMonths.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: datasets,
  };

  const options = {
    ...LINE_CHART_OPTIONS,
    plugins: {
      ...LINE_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Cumulative Orders Over Time Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: ${context.parsed.y} orders`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Line data={chartData} options={options} />
    </div>
  );
}
