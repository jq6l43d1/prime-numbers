import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function OrderSizeDistributionChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Calculate order size distribution
  const sizeCategories = {
    '1 item': 0,
    '2-3 items': 0,
    '4-5 items': 0,
    '6-10 items': 0,
    '11+ items': 0,
  };

  // Group orders by order ID to get actual order sizes
  const orderSizes = {};
  orders.forEach(order => {
    const orderId = order.orderId || order.orderDate;
    if (!orderSizes[orderId]) {
      orderSizes[orderId] = 0;
    }
    orderSizes[orderId] += order.quantity || 1;
  });

  Object.values(orderSizes).forEach(size => {
    if (size === 1) sizeCategories['1 item']++;
    else if (size <= 3) sizeCategories['2-3 items']++;
    else if (size <= 5) sizeCategories['4-5 items']++;
    else if (size <= 10) sizeCategories['6-10 items']++;
    else sizeCategories['11+ items']++;
  });

  const data = {
    labels: Object.keys(sizeCategories),
    datasets: [
      {
        data: Object.values(sizeCategories),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = formatNumber((value / total) * 100, 1);
            return `${label}: ${formatNumber(value, 0)} orders (${percentage}%)`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}
