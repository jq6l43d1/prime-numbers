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
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function YearOverYearChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Group orders by year and month
  const yearMonthData = {};
  const years = new Set();

  orders.forEach(order => {
    if (!order.orderDate) return;

    const date = new Date(order.orderDate);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    years.add(year);

    if (!yearMonthData[year]) {
      yearMonthData[year] = Array(12).fill(0);
    }

    yearMonthData[year][month] += order.totalOwed || 0;
  });

  // Sort years and take most recent ones (max 3 years for readability)
  const sortedYears = Array.from(years).sort((a, b) => b - a).slice(0, 3).reverse();

  if (sortedYears.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Color palette for years
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' }, // Blue
    { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(16, 185, 129, 1)' }, // Green
    { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgba(251, 146, 60, 1)' }  // Orange
  ];

  const datasets = sortedYears.map((year, index) => {
    const color = colors[index % colors.length];
    return {
      label: year.toString(),
      data: yearMonthData[year] || Array(12).fill(0),
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 2,
      borderRadius: 6,
      hoverBackgroundColor: color.border
    };
  });

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 13, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `${context.dataset.label}: $${parseFloat(context.parsed.y).toFixed(2)}`;
          },
          footer: (tooltipItems) => {
            if (tooltipItems.length > 1) {
              const values = tooltipItems.map(item => parseFloat(item.parsed.y));
              const max = Math.max(...values);
              const min = Math.min(...values.filter(v => v > 0));
              if (max > 0 && min > 0 && max !== min) {
                const change = ((max - min) / min * 100).toFixed(1);
                return `\nChange: ${change}%`;
              }
            }
            return '';
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 14,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        footerFont: { size: 12, style: 'italic' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toFixed(0)}`,
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          font: { size: 11 }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  return (
    <div className="h-full w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
