import { useMemo } from 'react';
import { formatNumber } from '../../utils/currencyHelpers';
import { Bar } from 'react-chartjs-2';
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

export function RepeatPurchaseChart({ orders }) {
  const repeatData = useMemo(() => {
    const productPurchases = {};

    // Count purchases per product
    orders.forEach(order => {
      const key = order.asin || order.productName;
      if (!key) return;

      if (!productPurchases[key]) {
        productPurchases[key] = {
          name: order.productName || 'Unknown Product',
          asin: order.asin,
          count: 0,
          dates: [],
          totalSpent: 0,
        };
      }
      productPurchases[key].count += order.quantity || 1;
      productPurchases[key].dates.push(order.orderDate);
      productPurchases[key].totalSpent += order.totalOwed || 0;
    });

    // Find products purchased multiple times
    const repeats = Object.values(productPurchases)
      .filter(p => p.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return repeats;
  }, [orders]);

  const chartData = {
    labels: repeatData.map(p => {
      const name = p.name.substring(0, 30);
      return name.length < p.name.length ? name + '...' : name;
    }),
    datasets: [
      {
        label: 'Times Purchased',
        data: repeatData.map(p => p.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            return repeatData[context[0].dataIndex].name;
          },
          label: function (context) {
            const product = repeatData[context.dataIndex];
            return [
              `Purchased: ${formatNumber(product.count, 0)} times`,
              `Total spent: $${formatNumber(product.totalSpent, 2)}`,
              `ASIN: ${product.asin || 'N/A'}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Purchases',
        },
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  if (repeatData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No repeat purchases found in your order history
      </div>
    );
  }

  return (
    <div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">You've made {repeatData.length} repeat purchases</p>
        <p className="text-xs mt-1">
          Your most repurchased item: <span className="font-semibold">{repeatData[0]?.name}</span> (
          {repeatData[0]?.count}x)
        </p>
      </div>
    </div>
  );
}
