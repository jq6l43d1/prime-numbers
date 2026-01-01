import { Bar } from 'react-chartjs-2';
import { formatNumber, formatCurrency } from '../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function TopProductsChart({ data, type = 'spending', onProductClick }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const topItems = data.slice(0, 10);

  const truncateName = (name, maxLength = 30) => {
    if (!name) return 'Unknown Product';
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  const chartData = {
    labels: topItems.map(item => truncateName(item.name)),
    datasets: [
      {
        label: type === 'spending' ? 'Total Spent ($)' : 'Quantity Ordered',
        data: topItems.map(item => (type === 'spending' ? item.totalSpent : item.quantity)),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(16, 185, 129, 0.95)',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: function (context) {
            const item = topItems[context[0].dataIndex];
            return item.name || 'Unknown Product';
          },
          label: function (context) {
            const value = context.parsed.x;
            if (type === 'spending') {
              return `Total Spent: $${formatNumber(value, 2)}`;
            } else {
              return `Quantity: ${formatNumber(value)}`;
            }
          },
          afterLabel: function (context) {
            const item = topItems[context.dataIndex];
            const lines = [];
            if (type === 'spending') {
              lines.push(`Quantity: ${item.quantity}`);
            } else {
              lines.push(`Total Spent: $${formatNumber(item.totalSpent, 2)}`);
            }
            if (onProductClick) {
              lines.push('Click to view details');
            }
            return lines;
          },
        },
      },
    },
    onClick: onProductClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const product = topItems[index];
            onProductClick(product);
          }
        }
      : undefined,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function (value) {
            if (type === 'spending') {
              return formatCurrency(value);
            }
            return formatNumber(value, 0);
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#374151',
          font: {
            size: 11,
            weight: '500',
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
