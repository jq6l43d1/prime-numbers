import { useMemo } from 'react';
import { formatNumber } from '../../utils/currencyHelpers';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function MerchantAnalysisChart({ orders, onMerchantClick }) {
  const merchantData = useMemo(() => {
    const merchantStats = {};

    orders.forEach(order => {
      const merchant = order.sellerOfRecord || order.seller || 'Amazon';
      if (!merchantStats[merchant]) {
        merchantStats[merchant] = {
          count: 0,
          total: 0,
          orders: [],
        };
      }
      merchantStats[merchant].count += 1;
      merchantStats[merchant].total += order.totalOwed || 0;
      merchantStats[merchant].orders.push(order);
    });

    // Sort by total spending
    const sorted = Object.entries(merchantStats)
      .map(([merchant, stats]) => ({
        merchant,
        count: stats.count,
        total: stats.total,
        orders: stats.orders,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 merchants

    return sorted;
  }, [orders]);

  const chartData = {
    labels: merchantData.map(m => m.merchant),
    datasets: [
      {
        label: 'Spending by Merchant',
        data: merchantData.map(m => m.total),
        backgroundColor: [
          '#3B82F6', // blue
          '#10B981', // green
          '#F59E0B', // amber
          '#EF4444', // red
          '#8B5CF6', // purple
          '#EC4899', // pink
          '#14B8A6', // teal
          '#F97316', // orange
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const merchant = merchantData[context.dataIndex];
            return [
              `${context.label}`,
              `Spending: $${formatNumber(merchant.total, 2)}`,
              `Orders: ${formatNumber(merchant.count, 0)}`,
              onMerchantClick ? 'Click to view details' : '',
            ].filter(Boolean);
          },
        },
      },
    },
    onClick: onMerchantClick
      ? (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const merchant = merchantData[index];
            onMerchantClick({
              merchant: merchant.merchant,
              orders: merchant.orders,
              totalSpent: merchant.total,
              orderCount: merchant.count,
            });
          }
        }
      : undefined,
  };

  if (merchantData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No merchant data available
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Pie data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Top merchants by total spending</p>
        <div className="mt-2 space-y-1">
          {merchantData.slice(0, 3).map((m, i) => (
            <div key={i} className="flex justify-between">
              <span className="truncate max-w-[200px]">{m.merchant}</span>
              <span className="font-semibold">${formatNumber(m.total, 2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
