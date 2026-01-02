import { Line } from 'react-chartjs-2';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/currencyHelpers';
import { useOpportunityCostData } from '../../hooks/useOpportunityCostData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function SP500InvestmentChart({ orders }) {
  const { loading, error, data } = useOpportunityCostData(orders);

  if (!orders || orders.length === 0) {
    return (
      <Card title="📈 S&P 500 Investment" subtitle="SPY ETF">
        <div className="text-center text-gray-500 py-8">
          <p>No orders available</p>
        </div>
      </Card>
    );
  }

  // API key is now optional (using bundled data)

  if (loading) {
    return (
      <Card title="📈 S&P 500 Investment" subtitle="SPY ETF">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </Card>
    );
  }

  if (error || !data?.sp500?.success) {
    return (
      <Card title="📈 S&P 500 Investment" subtitle="SPY ETF">
        <div className="text-center text-gray-500 py-8">
          <p>{error || data?.sp500?.error || 'Unable to calculate'}</p>
        </div>
      </Card>
    );
  }

  const sp500 = data.sp500;
  const { summary, dataPoints } = sp500;

  // Prepare chart data
  const chartLabels = dataPoints.map(dp => format(dp.date, 'MMM yyyy'));
  const investmentValues = dataPoints.map(dp => dp.currentValue);
  const spendingValues = dataPoints.map(dp => dp.totalInvested);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Investment Value',
        data: investmentValues,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Amount Invested',
        data: spendingValues,
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.dataset.label}: $${formatNumber(context.parsed.y, 2)}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${formatNumber(value, 0)}`,
          font: { size: 10 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: { size: 9 },
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card title="📈 S&P 500 Investment" subtitle="SPY ETF - Broad Market Index">
      {/* Chart */}
      <div style={{ height: '250px' }} className="mb-4">
        <Line data={chartData} options={options} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Current Value</p>
          <p className="text-lg font-bold text-green-700">
            ${formatNumber(summary.currentValue, 2)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Total Return</p>
          <p className="text-lg font-bold text-blue-700">
            {summary.totalReturnPercent >= 0 ? '+' : ''}
            {formatNumber(summary.totalReturnPercent, 1)}%
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Shares Owned</p>
          <p className="text-lg font-bold text-purple-700">
            {formatNumber(summary.totalShares, 2)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Annual Return</p>
          <p className="text-lg font-bold text-orange-700">
            {formatNumber(summary.annualizedReturn, 1)}%
          </p>
        </div>
      </div>

      {/* Best/Worst Purchases */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
          <span className="text-gray-700">🎯 Best Purchase:</span>
          <span className="font-semibold text-green-700">
            {summary.bestPurchase.date} (+{formatNumber(summary.bestPurchase.returnPercent, 1)}%)
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
          <span className="text-gray-700">⚠️ Worst Purchase:</span>
          <span className="font-semibold text-red-700">
            {summary.worstPurchase.date} ({formatNumber(summary.worstPurchase.returnPercent, 1)}%)
          </span>
        </div>
      </div>

      {/* Excluded orders warning */}
      {summary.excludedOrders > 0 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ℹ️ {summary.excludedOrders} orders before 1993 excluded (SPY inception)
        </div>
      )}
    </Card>
  );
}
