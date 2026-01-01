import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export function DiscountAnalysisChart({ orders }) {
  const data = useMemo(() => {
    if (!orders || orders.length === 0) {
      return null;
    }

    // Calculate discounts by category
    const categoryDiscounts = {};
    const monthlyDiscounts = {};

    orders.forEach(order => {
      const discount = Math.abs(parseFloat(order.totalDiscounts) || 0);
      if (discount > 0) {
        const category = order.category || 'Other';
        categoryDiscounts[category] = (categoryDiscounts[category] || 0) + discount;

        // Track monthly discounts
        const orderDate = new Date(order.orderDate);
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyDiscounts[monthKey] = (monthlyDiscounts[monthKey] || 0) + discount;
      }
    });

    // Sort categories by discount amount
    const sortedCategories = Object.entries(categoryDiscounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedCategories.map(([category]) =>
        category.length > 20 ? category.substring(0, 20) + '...' : category
      ),
      datasets: [
        {
          label: 'Total Discounts Received',
          data: sortedCategories.map(([, amount]) => amount),
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(34, 197, 94, 0.9)',
        },
      ],
      rawData: sortedCategories,
    };
  }, [orders]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No discount data available
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `Saved: $${context.parsed.x.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value}`,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
