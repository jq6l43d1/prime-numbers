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
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function CategorySpendingTrendChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Group orders by month and category
  const monthlyData = {};
  const categories = new Set();

  orders.forEach(order => {
    if (!order.orderDate) return;

    const monthKey = format(new Date(order.orderDate), 'yyyy-MM');
    const category = order.category || 'Other';

    categories.add(category);

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {};
    }

    if (!monthlyData[monthKey][category]) {
      monthlyData[monthKey][category] = 0;
    }

    monthlyData[monthKey][category] += order.totalOwed || 0;
  });

  // Get sorted months
  const months = Object.keys(monthlyData).sort();

  // Take only last 12 months
  const recentMonths = months.slice(-12);

  // Get top 5 categories by total spending
  const categoryTotals = {};
  Object.values(monthlyData).forEach(monthData => {
    Object.entries(monthData).forEach(([cat, amount]) => {
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
    });
  });

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat]) => cat);

  // Color palette
  const colors = [
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
    { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgba(251, 146, 60, 1)' },
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)' },
    { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)' },
  ];

  const datasets = topCategories.map((category, index) => {
    const color = colors[index % colors.length];
    return {
      label: category,
      data: recentMonths.map(month => {
        return (monthlyData[month][category] || 0).toFixed(2);
      }),
      borderColor: color.border,
      backgroundColor: color.bg,
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: color.border,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    };
  });

  const data = {
    labels: recentMonths.map(month => {
      const [year, monthNum] = month.split('-');
      return format(new Date(year, parseInt(monthNum) - 1, 1), 'MMM yyyy');
    }),
    datasets,
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
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: $${parseFloat(context.parsed.y).toFixed(2)}`;
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
          callback: value => `$${value}`,
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
