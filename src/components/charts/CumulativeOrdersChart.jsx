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
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function CumulativeOrdersChart({ orders }) {
  const cumulativeData = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    // Sort orders by date
    const sortedOrders = [...orders].sort((a, b) =>
      new Date(a.orderDate) - new Date(b.orderDate)
    );

    // Calculate cumulative order count
    let cumulative = 0;
    const cumulativeByDate = sortedOrders.map(order => {
      cumulative += 1;
      return {
        date: new Date(order.orderDate),
        cumulative: cumulative
      };
    });

    // Group by month for cleaner visualization
    const monthlyData = {};
    cumulativeByDate.forEach(item => {
      const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = item.cumulative;
    });

    const months = Object.keys(monthlyData).sort();
    const values = months.map(m => monthlyData[m]);

    return { months, values };
  }, [orders]);

  if (!cumulativeData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No order data available
      </div>
    );
  }

  const chartData = {
    labels: cumulativeData.months.map(m => {
      const [year, month] = m.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        label: 'Cumulative Orders',
        data: cumulativeData.values,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
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
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total Orders: ${context.parsed.y}`;
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
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Cumulative Orders'
        }
      }
    }
  };

  const totalOrders = cumulativeData.values[cumulativeData.values.length - 1];
  const firstMonth = cumulativeData.months[0];
  const lastMonth = cumulativeData.months[cumulativeData.months.length - 1];

  return (
    <div>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>Total orders from {firstMonth} to {lastMonth}</span>
          <span className="font-bold text-lg text-green-600">{totalOrders} orders</span>
        </div>
      </div>
    </div>
  );
}
