import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CHART_COLORS } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ProductConditionChart({ orders, onClick }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Group orders by product condition
  const conditionStats = {};

  orders.forEach(order => {
    const condition = order.productCondition || 'Unknown';

    if (!conditionStats[condition]) {
      conditionStats[condition] = {
        count: 0,
        totalSpent: 0,
        items: 0
      };
    }

    conditionStats[condition].count += 1;
    conditionStats[condition].totalSpent += order.totalOwed || 0;
    conditionStats[condition].items += order.quantity || 1;
  });

  // Sort by count
  const sortedConditions = Object.entries(conditionStats)
    .sort((a, b) => b[1].count - a[1].count);

  const labels = sortedConditions.map(([condition]) => condition);
  const countData = sortedConditions.map(([, stats]) => stats.count);
  const spendingData = sortedConditions.map(([, stats]) => stats.totalSpent);
  const itemsData = sortedConditions.map(([, stats]) => stats.items);

  // Color mapping for different conditions
  const getColorForCondition = (condition) => {
    if (condition === 'New') return '#10B981'; // green
    if (condition === 'Used') return '#F59E0B'; // orange
    if (condition === 'Refurbished') return '#6366F1'; // indigo
    if (condition === 'Collectible') return '#EC4899'; // pink
    return '#6B7280'; // gray for Unknown
  };

  const colors = labels.map(getColorForCondition);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Orders by Condition',
        data: countData,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onClick ? (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const condition = labels[index];
        const stats = sortedConditions[index][1];

        // Find all orders with this condition
        const conditionOrders = orders.filter(o =>
          (o.productCondition || 'Unknown') === condition
        );

        onClick({
          condition,
          count: stats.count,
          totalSpent: stats.totalSpent,
          items: stats.items,
          orders: conditionOrders
        });
      }
    } : undefined,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: label,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: '#fff',
              lineWidth: 2,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const condition = context.label;
            const count = countData[context.dataIndex];
            const spending = spendingData[context.dataIndex];
            const items = itemsData[context.dataIndex];
            const percentage = ((count / countData.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
            const avgOrderValue = (spending / count).toFixed(2);

            return [
              `${condition}`,
              `Orders: ${count} (${percentage}%)`,
              `Items: ${items}`,
              `Total: $${spending.toFixed(2)}`,
              `Avg/Order: $${avgOrderValue}`
            ];
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        bodySpacing: 6
      }
    }
  };

  const totalOrders = sortedConditions.reduce((sum, [, stats]) => sum + stats.count, 0);
  const totalSpent = sortedConditions.reduce((sum, [, stats]) => sum + stats.totalSpent, 0);

  return (
    <div>
      <Doughnut data={chartData} options={options} />
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {sortedConditions.map(([condition, stats]) => {
            const percentage = ((stats.count / totalOrders) * 100).toFixed(1);
            const avgValue = (stats.totalSpent / stats.count).toFixed(2);

            return (
              <div
                key={condition}
                className="rounded p-3 transition-all hover:shadow-md cursor-pointer"
                style={{
                  backgroundColor: `${getColorForCondition(condition)}15`,
                  borderLeft: `4px solid ${getColorForCondition(condition)}`
                }}
              >
                <div className="font-semibold text-gray-900">{condition}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats.count} orders ({percentage}%)
                </div>
                <div className="text-xs text-gray-500">
                  ${stats.totalSpent.toFixed(2)} • Avg: ${avgValue}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded p-3 text-center">
          <div className="grid grid-cols-2 divide-x divide-gray-300">
            <div>
              <div className="text-lg font-bold text-gray-900">{totalOrders}</div>
              <div className="text-xs text-gray-600">Total Orders</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">${totalSpent.toFixed(2)}</div>
              <div className="text-xs text-gray-600">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
