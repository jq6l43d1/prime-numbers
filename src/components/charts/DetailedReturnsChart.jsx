import { useMemo } from 'react';
import { Card } from '../common/Card';
import { formatNumber, formatCurrency } from '../../utils/currencyHelpers';
import { Doughnut, Bar } from 'react-chartjs-2';

export function DetailedReturnsChart({ returns, orders }) {
  const analysis = useMemo(() => {
    if (!returns || returns.length === 0) {
      return null;
    }

    // Group returns by reason
    const reasonCounts = {};
    const reasonAmounts = {};
    const reasonByCarrier = {};
    const reasonByCategory = {};

    returns.forEach(returnItem => {
      const reason = returnItem.returnReason || returnItem.reversalReason || 'Unknown';
      const amount = returnItem.refundAmount || returnItem.returnAmount || 0;

      // Count and amount by reason
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      reasonAmounts[reason] = (reasonAmounts[reason] || 0) + amount;

      // Find associated order for carrier and category
      const order = orders.find(o => o.orderId === returnItem.orderId);
      if (order) {
        const carrier = order.carrier || 'Unknown';
        const category = order.category || 'Other';

        if (!reasonByCarrier[reason]) reasonByCarrier[reason] = {};
        if (!reasonByCategory[reason]) reasonByCategory[reason] = {};

        reasonByCarrier[reason][carrier] = (reasonByCarrier[reason][carrier] || 0) + 1;
        reasonByCategory[reason][category] = (reasonByCategory[reason][category] || 0) + 1;
      }
    });

    // Sort by count
    const sortedReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Calculate return rate by carrier
    const carrierReturns = {};
    returns.forEach(returnItem => {
      const order = orders.find(o => o.orderId === returnItem.orderId);
      if (order && order.carrier) {
        carrierReturns[order.carrier] = (carrierReturns[order.carrier] || 0) + 1;
      }
    });

    const carrierStats = Object.entries(carrierReturns)
      .map(([carrier, count]) => {
        const totalOrders = orders.filter(o => o.carrier === carrier).length;
        const returnRate = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
        return { carrier, count, returnRate };
      })
      .sort((a, b) => b.returnRate - a.returnRate)
      .slice(0, 5);

    // Most returned categories
    const categoryReturns = {};
    returns.forEach(returnItem => {
      const order = orders.find(o => o.orderId === returnItem.orderId);
      if (order && order.category) {
        categoryReturns[order.category] = (categoryReturns[order.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryReturns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      reasonCounts,
      reasonAmounts,
      sortedReasons,
      carrierStats,
      topCategories,
      totalReturns: returns.length,
      totalRefunded: Object.values(reasonAmounts).reduce((sum, val) => sum + val, 0),
    };
  }, [returns, orders]);

  if (!analysis) {
    return (
      <Card title="📦 Detailed Return Reason Analysis" subtitle="No return data available">
        <div className="text-center text-gray-500 py-8">
          <p>No returns found in your order history.</p>
          <p className="text-sm mt-2">
            This is great - means you're satisfied with your purchases!
          </p>
        </div>
      </Card>
    );
  }

  const reasonColors = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316',
    '#06B6D4',
    '#6366F1',
  ];

  const chartData = {
    labels: analysis.sortedReasons.map(([reason]) => reason),
    datasets: [
      {
        data: analysis.sortedReasons.map(([, count]) => count),
        backgroundColor: reasonColors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barData = {
    labels: analysis.sortedReasons.map(([reason]) => reason),
    datasets: [
      {
        label: 'Return Count',
        data: analysis.sortedReasons.map(([, count]) => count),
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
      {
        label: 'Refund Amount',
        data: analysis.sortedReasons.map(([reason]) => analysis.reasonAmounts[reason] || 0),
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const reason = context.label;
            const count = analysis.reasonCounts[reason];
            const amount = analysis.reasonAmounts[reason];
            return `${count} returns (${formatCurrency(amount)})`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => {
            if (context.dataset.label === 'Refund Amount') {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } },
      y: { beginAtZero: true },
    },
  };

  return (
    <Card
      title="📦 Detailed Return Reason Analysis"
      subtitle={`${formatNumber(analysis.totalReturns, 0)} total returns • ${formatCurrency(analysis.totalRefunded)} refunded`}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Returns</p>
          <p className="text-2xl font-bold text-red-700">
            {formatNumber(analysis.totalReturns, 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Refunded</p>
          <p className="text-2xl font-bold text-green-700">
            {formatCurrency(analysis.totalRefunded)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Avg Refund</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(analysis.totalRefunded / analysis.totalReturns)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Return Rate</p>
          <p className="text-2xl font-bold text-purple-700">
            {((analysis.totalReturns / orders.length) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Return Reasons Distribution</h3>
          <div className="h-64">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Count vs Refund Amount</h3>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Carrier */}
        {analysis.carrierStats.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">🚚 Return Rate by Carrier</h3>
            <div className="space-y-3">
              {analysis.carrierStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{stat.carrier}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stat.returnRate.toFixed(1)}% ({stat.count})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(stat.returnRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Category */}
        {analysis.topCategories.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              📂 Most Returned Categories
            </h3>
            <div className="space-y-2">
              {analysis.topCategories.map(([category, count], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatNumber(count, 0)} returns
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reason Details */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">📋 All Return Reasons</h3>
        <div className="space-y-2">
          {analysis.sortedReasons.map(([reason, count], index) => {
            const amount = analysis.reasonAmounts[reason];
            const percentage = (count / analysis.totalReturns) * 100;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: reasonColors[index] }}
                    ></span>
                    <span className="text-sm font-medium text-gray-900">{reason}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(count, 0)} ({percentage.toFixed(1)}%)
                  </p>
                  <p className="text-xs text-gray-600">{formatCurrency(amount)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">💡 Return Insights</h3>
        <div className="text-sm text-gray-700 space-y-2">
          {analysis.sortedReasons[0] && (
            <p>
              • <span className="font-semibold">Most common reason:</span>{' '}
              {analysis.sortedReasons[0][0]} ({analysis.sortedReasons[0][1]} returns)
            </p>
          )}
          {analysis.carrierStats[0] && (
            <p>
              • <span className="font-semibold">Highest return rate carrier:</span>{' '}
              {analysis.carrierStats[0].carrier} ({analysis.carrierStats[0].returnRate.toFixed(1)}
              %)
            </p>
          )}
          {analysis.topCategories[0] && (
            <p>
              • <span className="font-semibold">Most returned category:</span>{' '}
              {analysis.topCategories[0][0]} ({analysis.topCategories[0][1]} returns)
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
