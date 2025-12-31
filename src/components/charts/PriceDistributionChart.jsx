import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { BAR_CHART_OPTIONS } from '../../constants/chartConfig';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function PriceDistributionChart({ data }) {
  if (!data) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const labels = ['Under $10', '$10-$50', '$50-$100', '$100-$500', 'Over $500'];
  const values = [
    data.under10,
    data['10to50'],
    data['50to100'],
    data['100to500'],
    data.over500
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Items',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.95)'
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
            const value = context.parsed.y;
            const total = values.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} items (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        title: {
          display: true,
          text: 'Number of Items',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
