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

export function ShippingCostAnalysisChart({ orders }) {
  // Analyze shipping costs
  const shippingAnalysis = orders.reduce((acc, order) => {
    const shippingCost = order.shippingCharge || 0;

    if (shippingCost === 0) {
      acc.free++;
      acc.freeTotal += order.unitPrice * order.quantity;
    } else {
      acc.paid++;
      acc.paidTotal += shippingCost;
      acc.paidOrderValue += order.unitPrice * order.quantity;
    }

    acc.totalShippingPaid += shippingCost;
    return acc;
  }, {
    free: 0,
    freeTotal: 0,
    paid: 0,
    paidTotal: 0,
    paidOrderValue: 0,
    totalShippingPaid: 0
  });

  const avgPaidShipping = shippingAnalysis.paid > 0
    ? shippingAnalysis.paidTotal / shippingAnalysis.paid
    : 0;

  const data = {
    labels: ['Free Shipping', 'Paid Shipping'],
    datasets: [
      {
        label: 'Number of Orders',
        data: [shippingAnalysis.free, shippingAnalysis.paid],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const total = shippingAnalysis.free + shippingAnalysis.paid;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 12 }
        }
      },
      x: {
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
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="font-semibold text-gray-700 mb-1">Free Shipping</p>
          <p className="text-2xl font-bold text-green-600">{shippingAnalysis.free}</p>
          <p className="text-gray-600 text-xs mt-1">
            ${shippingAnalysis.freeTotal.toFixed(2)} in orders
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="font-semibold text-gray-700 mb-1">Paid Shipping</p>
          <p className="text-2xl font-bold text-red-600">{shippingAnalysis.paid}</p>
          <p className="text-gray-600 text-xs mt-1">
            ${shippingAnalysis.paidTotal.toFixed(2)} total
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 col-span-2">
          <p className="font-semibold text-gray-700 mb-1">💰 Total Shipping Costs</p>
          <p className="text-2xl font-bold text-blue-600">
            ${shippingAnalysis.totalShippingPaid.toFixed(2)}
          </p>
          {shippingAnalysis.paid > 0 && (
            <p className="text-gray-600 text-xs mt-1">
              Avg: ${avgPaidShipping.toFixed(2)} per paid order
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
