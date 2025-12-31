import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function TaxAnalysisChart({ orders }) {
  // Calculate tax statistics
  const taxStats = orders.reduce((acc, order) => {
    const tax = order.unitPriceTax || 0;
    const subtotal = order.unitPrice * order.quantity;

    acc.totalTax += tax;
    acc.totalSubtotal += subtotal;

    if (tax > 0) {
      acc.taxedOrders++;
    } else {
      acc.taxFreeOrders++;
    }

    return acc;
  }, {
    totalTax: 0,
    totalSubtotal: 0,
    taxedOrders: 0,
    taxFreeOrders: 0
  });

  const avgTaxRate = taxStats.totalSubtotal > 0
    ? (taxStats.totalTax / taxStats.totalSubtotal) * 100
    : 0;

  const data = {
    labels: ['Taxed Orders', 'Tax-Free Orders'],
    datasets: [
      {
        data: [taxStats.taxedOrders, taxStats.taxFreeOrders],
        backgroundColor: [
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(251, 146, 60, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = taxStats.taxedOrders + taxStats.taxFreeOrders;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} orders (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 space-y-3">
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="font-semibold text-gray-700 mb-1">Total Tax Paid</p>
          <p className="text-2xl font-bold text-orange-600">
            ${taxStats.totalTax.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="font-semibold text-gray-700 mb-1">Average Tax Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {avgTaxRate.toFixed(2)}%
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Across ${taxStats.totalSubtotal.toFixed(2)} in purchases
          </p>
        </div>
      </div>
    </div>
  );
}
