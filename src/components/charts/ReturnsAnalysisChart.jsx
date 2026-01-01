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

export function ReturnsAnalysisChart({ returns, orders, onReasonClick }) {
  if (!returns || returns.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg font-medium">No returns data available</p>
        <p className="text-sm mt-2">You haven't returned any items yet!</p>
      </div>
    );
  }

  // Calculate return reasons and link to orders
  const reasonData = {};
  returns.forEach(ret => {
    const reason = ret.returnReason || 'Unknown';
    if (!reasonData[reason]) {
      reasonData[reason] = {
        count: 0,
        returns: [],
        orders: [],
      };
    }
    reasonData[reason].count += 1;
    reasonData[reason].returns.push(ret);

    // Find matching order if orders array is provided
    if (orders) {
      const matchingOrder = orders.find(o => o.orderId === ret.orderId);
      if (matchingOrder) {
        reasonData[reason].orders.push(matchingOrder);
      }
    }
  });

  // Sort by count and take top 8
  const sortedReasons = Object.entries(reasonData)
    .map(([reason, data]) => ({
      reason,
      count: data.count,
      returns: data.returns,
      orders: data.orders,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const data = {
    labels: sortedReasons.map(item => {
      // Truncate long reasons
      const reason = item.reason;
      return reason.length > 25 ? reason.substring(0, 25) + '...' : reason;
    }),
    datasets: [
      {
        label: 'Number of Returns',
        data: sortedReasons.map(item => item.count),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(239, 68, 68, 0.95)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
          title: context => {
            const index = context[0].dataIndex;
            return sortedReasons[index].reason; // Show full reason in tooltip
          },
          afterBody: function (context) {
            if (onReasonClick) {
              return ['', 'Click to view returned orders'];
            }
            return '';
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    onClick: onReasonClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const reasonItem = sortedReasons[index];
            onReasonClick({
              reason: reasonItem.reason,
              count: reasonItem.count,
              orders: reasonItem.orders,
              returns: reasonItem.returns,
            });
          }
        }
      : undefined,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        ticks: {
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
}
