import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function FulfillmentSpeedComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Define speed buckets
  const speedCategories = [
    'Same Day',
    '1-2 Days',
    '3-5 Days',
    '6-10 Days',
    '11+ Days',
    'Not Shipped',
  ];

  const datasets = datasetStats.map((item, index) => {
    const orders = item.dataset.orders || [];

    // Categorize orders by fulfillment speed
    const speedBuckets = {
      'Same Day': [],
      '1-2 Days': [],
      '3-5 Days': [],
      '6-10 Days': [],
      '11+ Days': [],
      'Not Shipped': [],
    };

    orders.forEach(order => {
      if (!order.shipDate || order.shipDate === 'Not Available') {
        speedBuckets['Not Shipped'].push(order);
        return;
      }

      const orderDate = new Date(order.orderDate);
      const shipDate = new Date(order.shipDate);
      const daysDiff = Math.floor((shipDate - orderDate) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) {
        speedBuckets['Not Shipped'].push(order);
      } else if (daysDiff < 1) {
        speedBuckets['Same Day'].push(order);
      } else if (daysDiff <= 2) {
        speedBuckets['1-2 Days'].push(order);
      } else if (daysDiff <= 5) {
        speedBuckets['3-5 Days'].push(order);
      } else if (daysDiff <= 10) {
        speedBuckets['6-10 Days'].push(order);
      } else {
        speedBuckets['11+ Days'].push(order);
      }
    });

    // Count orders in each bucket
    const data = speedCategories.map(category => speedBuckets[category].length);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: speedCategories,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Fulfillment Speed Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;

            // Calculate average fulfillment days for this dataset
            const datasetIndex = context.datasetIndex;
            const item = datasetStats[datasetIndex];
            const orders = item.dataset.orders || [];
            const shippedOrders = orders.filter(o => o.shipDate && o.shipDate !== 'Not Available');

            const avgDays =
              shippedOrders.length > 0
                ? shippedOrders.reduce((sum, order) => {
                    const orderDate = new Date(order.orderDate);
                    const shipDate = new Date(order.shipDate);
                    const days = Math.floor((shipDate - orderDate) / (1000 * 60 * 60 * 24));
                    return sum + (days >= 0 ? days : 0);
                  }, 0) / shippedOrders.length
                : 0;

            return `${label}: ${value} orders (Avg: ${formatNumber(avgDays, 1)} days)`;
          },
        },
      },
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        title: {
          display: true,
          text: 'Number of Orders',
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
