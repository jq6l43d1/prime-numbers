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
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function FulfillmentSpeedChart({ orders, onClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Calculate fulfillment speed (order date to ship date)
  const speedBuckets = {
    'Same Day': { orders: [], min: 0, max: 1 },
    '1-2 Days': { orders: [], min: 1, max: 2 },
    '3-5 Days': { orders: [], min: 3, max: 5 },
    '6-10 Days': { orders: [], min: 6, max: 10 },
    '11+ Days': { orders: [], min: 11, max: Infinity },
    'Not Shipped': { orders: [], min: null, max: null },
  };

  orders.forEach(order => {
    if (!order.shipDate || order.shipDate === 'Not Available') {
      speedBuckets['Not Shipped'].orders.push(order);
      return;
    }

    const orderDate = new Date(order.orderDate);
    const shipDate = new Date(order.shipDate);
    const daysDiff = Math.floor((shipDate - orderDate) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      speedBuckets['Not Shipped'].orders.push(order);
    } else if (daysDiff < 1) {
      speedBuckets['Same Day'].orders.push(order);
    } else if (daysDiff <= 2) {
      speedBuckets['1-2 Days'].orders.push(order);
    } else if (daysDiff <= 5) {
      speedBuckets['3-5 Days'].orders.push(order);
    } else if (daysDiff <= 10) {
      speedBuckets['6-10 Days'].orders.push(order);
    } else {
      speedBuckets['11+ Days'].orders.push(order);
    }
  });

  // Prepare chart data
  const labels = Object.keys(speedBuckets);
  const counts = labels.map(label => speedBuckets[label].orders.length);
  const spending = labels.map(label =>
    speedBuckets[label].orders.reduce((sum, o) => sum + (o.totalOwed || 0), 0)
  );

  // Color gradient from green (fast) to red (slow)
  const colors = [
    '#10B981', // Same Day - green
    '#34D399', // 1-2 Days - light green
    '#FBBF24', // 3-5 Days - yellow
    '#FB923C', // 6-10 Days - orange
    '#EF4444', // 11+ Days - red
    '#9CA3AF', // Not Shipped - gray
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Orders',
        data: counts,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const bucket = labels[index];
            const bucketData = speedBuckets[bucket];

            onClick({
              bucket,
              count: bucketData.orders.length,
              orders: bucketData.orders,
              totalSpent: bucketData.orders.reduce((sum, o) => sum + (o.totalOwed || 0), 0),
            });
          }
        }
      : undefined,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: 'Number of Orders',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: '600',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const bucket = context.label;
            const count = counts[context.dataIndex];
            const totalSpent = spending[context.dataIndex];
            const avgSpent = count > 0 ? formatNumber(totalSpent / count, 2) : 0;
            const percentage = formatNumber((count / counts.reduce((a, b) => a + b, 0)) * 100, 1);

            return [
              `${bucket}`,
              `Orders: ${count} (${percentage}%)`,
              `Total: $${formatNumber(totalSpent, 2)}`,
              `Avg: $${avgSpent}`,
            ];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        bodySpacing: 6,
      },
    },
  };

  // Calculate summary statistics
  const shippedOrders = orders.filter(o => o.shipDate && o.shipDate !== 'Not Available');
  const avgFulfillmentDays =
    shippedOrders.length > 0
      ? shippedOrders.reduce((sum, order) => {
          const orderDate = new Date(order.orderDate);
          const shipDate = new Date(order.shipDate);
          const days = Math.floor((shipDate - orderDate) / (1000 * 60 * 60 * 24));
          return sum + (days >= 0 ? days : 0);
        }, 0) / shippedOrders.length
      : 0;

  const fastShipped =
    speedBuckets['Same Day'].orders.length + speedBuckets['1-2 Days'].orders.length;
  const fastPercentage = orders.length > 0 ? formatNumber((fastShipped / orders.length) * 100, 1) : 0;

  return (
    <div>
      <div className="h-56">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 space-y-3">
        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{formatNumber(avgFulfillmentDays, 1)}</div>
            <div className="text-xs text-green-600 font-medium">Avg Days</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{fastShipped}</div>
            <div className="text-xs text-blue-600 font-medium">Fast (≤2 days)</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">{fastPercentage}%</div>
            <div className="text-xs text-purple-600 font-medium">Fast Rate</div>
          </div>
        </div>

        {/* Bucket breakdown */}
        <div className="bg-gray-50 rounded p-3">
          <div className="text-xs font-semibold text-gray-700 mb-2">Speed Breakdown:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {labels.slice(0, 5).map((label, idx) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[idx] }} />
                  <span className="text-gray-700">{label}:</span>
                </div>
                <span className="font-semibold text-gray-900">{counts[idx]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
