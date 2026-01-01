import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function DayOfWeekChart({ orders, onDayClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Calculate orders by day of week
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayData = Array(7).fill(0);
  const daySpending = Array(7).fill(0);

  orders.forEach(order => {
    if (order.orderDate) {
      const day = new Date(order.orderDate).getDay();
      dayData[day]++;
      daySpending[day] += order.totalOwed || 0;
    }
  });

  const data = {
    labels: dayNames,
    datasets: [
      {
        label: 'Number of Orders',
        data: dayData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: context => {
            const dayIndex = context.dataIndex;
            return [
              `Total Spent: $${formatNumber(daySpending[dayIndex], 2)}`,
              'Click to view details',
            ];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
    onClick: onDayClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            onDayClick({
              dayName: dayNames[index],
              dayIndex: index,
              count: dayData[index],
              spending: daySpending[index],
            });
          }
        }
      : undefined,
  };

  return <Bar data={data} options={options} />;
}
