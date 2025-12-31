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

export function OrdersByYearChart({ data, onYearClick }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const chartData = {
    labels: data.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Number of Orders',
        data: data.map(d => d.orders),
        backgroundColor: CHART_COLORS.secondary,
        borderColor: CHART_COLORS.secondary,
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      legend: {
        display: false
      },
      tooltip: {
        ...BAR_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `Orders: ${context.parsed.y}`;
          },
          afterLabel: function(context) {
            const yearData = data[context.dataIndex];
            if (yearData && yearData.amount) {
              return [`Total Spent: $${yearData.amount.toLocaleString()}`, 'Click to view details'];
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          stepSize: 1
        }
      }
    },
    onClick: onYearClick ? (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const yearData = data[index];
        onYearClick(yearData);
      }
    } : undefined
  };

  return <Bar data={chartData} options={options} />;
}
