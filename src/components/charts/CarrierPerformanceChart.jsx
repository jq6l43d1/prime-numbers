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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function CarrierPerformanceChart({ orders, onCarrierClick }) {
  // Parse carrier information
  const carrierData = orders.reduce((acc, order) => {
    const carrierInfo = order.carrierNameAndTrackingNumber || 'No Tracking';

    // Extract carrier name (before the tracking number in parentheses)
    let carrier = 'No Tracking';
    if (carrierInfo && carrierInfo !== 'No Tracking' && carrierInfo !== '') {
      const match = carrierInfo.match(/^([A-Za-z_\s]+)/);
      if (match) {
        carrier = match[1].trim();
      }
    }

    if (!acc[carrier]) {
      acc[carrier] = {
        count: 0,
        orders: []
      };
    }

    acc[carrier].count++;
    acc[carrier].orders.push(order);

    return acc;
  }, {});

  // Sort by count and get top 10
  const sortedCarriers = Object.entries(carrierData)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const data = {
    labels: sortedCarriers.map(([carrier]) => carrier),
    datasets: [
      {
        label: 'Number of Shipments',
        data: sortedCarriers.map(([_, data]) => data.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.95)',
        hoverBorderColor: 'rgba(59, 130, 246, 1)',
        hoverBorderWidth: 3
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (elements.length > 0 && onCarrierClick) {
        const index = elements[0].index;
        const [carrier, carrierInfo] = sortedCarriers[index];
        onCarrierClick(carrier, carrierInfo.orders);
      }
    },
    onHover: (event, activeElements) => {
      event.native.target.style.cursor = activeElements.length > 0 && onCarrierClick
        ? 'pointer'
        : 'default';
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          title: function(context) {
            return onCarrierClick ? 'Click to view orders' : context[0].label;
          },
          label: function(context) {
            const value = context.parsed.x;
            const total = sortedCarriers.reduce((sum, [_, data]) => sum + data.count, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} shipments (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 12, weight: 'bold' }
        }
      }
    }
  };

  return (
    <div className="h-full">
      <Bar data={data} options={options} />
    </div>
  );
}
