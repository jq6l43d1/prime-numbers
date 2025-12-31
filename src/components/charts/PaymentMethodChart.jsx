import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function PaymentMethodChart({ orders, onClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Parse payment methods and group by card type
  const paymentMethodStats = {};

  orders.forEach(order => {
    if (!order.paymentInstrumentType || order.paymentInstrumentType === 'Not Applicable') return;

    // Extract card type (e.g., "MasterCard - 9214" -> "MasterCard")
    let cardType = order.paymentInstrumentType.split(' - ')[0].trim();

    // Group less common payment methods
    const commonTypes = ['Visa', 'MasterCard', 'American Express', 'Discover', 'Amex'];
    if (!commonTypes.some(type => cardType.includes(type))) {
      cardType = 'Other';
    }

    if (!paymentMethodStats[cardType]) {
      paymentMethodStats[cardType] = {
        count: 0,
        totalSpent: 0
      };
    }

    paymentMethodStats[cardType].count += 1;
    paymentMethodStats[cardType].totalSpent += order.totalOwed || 0;
  });

  // Sort by spending
  const sortedMethods = Object.entries(paymentMethodStats)
    .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

  const labels = sortedMethods.map(([method]) => method);
  const spendingData = sortedMethods.map(([, stats]) => stats.totalSpent);
  const countData = sortedMethods.map(([, stats]) => stats.count);

  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    '#8B5CF6',
    '#EC4899'
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Spent',
        data: spendingData,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onClick ? (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const method = labels[index];
        const stats = sortedMethods[index][1];

        // Find all orders using this payment method
        const methodOrders = orders.filter(o => {
          if (!o.paymentInstrumentType || o.paymentInstrumentType === 'Not Applicable') return false;
          let cardType = o.paymentInstrumentType.split(' - ')[0].trim();
          const commonTypes = ['Visa', 'MasterCard', 'American Express', 'Discover', 'Amex'];
          if (!commonTypes.some(type => cardType.includes(type))) {
            cardType = 'Other';
          }
          return cardType === method;
        });

        onClick({
          method,
          count: stats.count,
          totalSpent: stats.totalSpent,
          orders: methodOrders
        });
      }
    } : undefined,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const method = context.label;
            const spending = context.parsed;
            const count = countData[context.dataIndex];
            const percentage = ((spending / spendingData.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            return [
              `${method}`,
              `Spending: $${spending.toFixed(2)}`,
              `Orders: ${count}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    }
  };

  return (
    <div>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <div className="grid grid-cols-2 gap-2">
          {sortedMethods.map(([method, stats]) => (
            <div key={method} className="bg-gray-50 rounded p-2">
              <div className="font-semibold text-gray-900">{method}</div>
              <div className="text-xs">
                ${stats.totalSpent.toFixed(2)} • {stats.count} orders
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
