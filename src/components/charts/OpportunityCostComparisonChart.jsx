import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/currencyHelpers';
import { useOpportunityCostData } from '../../hooks/useOpportunityCostData';
import { ApiKeyModal } from '../modals/ApiKeyModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function OpportunityCostComparisonChart({ orders }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { loading, error, data, apiKey, setApiKey } = useOpportunityCostData(orders);

  if (!orders || orders.length === 0) {
    return (
      <Card title="💸 Opportunity Cost Analysis" subtitle="Investment comparison">
        <div className="text-center text-gray-500 py-8">
          <p>No orders available to analyze.</p>
          <p className="text-sm mt-2">Upload your Amazon data to see investment comparisons.</p>
        </div>
      </Card>
    );
  }

  // API Key required
  if (!apiKey) {
    return (
      <>
        <Card title="💸 Opportunity Cost Analysis" subtitle="Investment comparison">
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                <span className="text-4xl">🔑</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">API Key Required</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                See how much your Amazon spending could have become if invested in S&P 500, Nvidia,
                or Bitcoin.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started - Enter API Key
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Free API key from Alpha Vantage • Stored locally in browser only
            </p>
          </div>
        </Card>
        <ApiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={setApiKey} />
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card title="💸 Opportunity Cost Analysis" subtitle="Loading historical data...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Fetching S&P 500, Nvidia, and Bitcoin prices...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card title="💸 Opportunity Cost Analysis" subtitle="Error loading data">
        <div className="text-center py-12">
          <div className="mb-6">
            <span className="text-6xl">⚠️</span>
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Update API Key
            </button>
          </div>
        </div>
        <ApiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={setApiKey} />
      </Card>
    );
  }

  // No data
  if (!data || !data.chartData) {
    return (
      <Card title="💸 Opportunity Cost Analysis" subtitle="No data available">
        <div className="text-center text-gray-500 py-8">
          <p>Unable to generate investment comparison.</p>
        </div>
      </Card>
    );
  }

  // Prepare chart data - sample every Nth point if too many
  const maxPoints = 500;
  const sampleRate = Math.ceil(data.chartData.labels.length / maxPoints);

  const sampledLabels =
    sampleRate > 1
      ? data.chartData.labels.filter((_, i) => i % sampleRate === 0)
      : data.chartData.labels;

  const sampledDatasets = data.chartData.datasets.map(dataset => ({
    ...dataset,
    data: sampleRate > 1 ? dataset.data.filter((_, i) => i % sampleRate === 0) : dataset.data,
  }));

  const chartData = {
    labels: sampledLabels.map(dateStr => {
      try {
        return format(new Date(dateStr), 'MMM yyyy');
      } catch {
        return dateStr;
      }
    }),
    datasets: sampledDatasets,
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
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const value = typeof context.parsed.y === 'number' ? context.parsed.y : 0;
            return `${context.dataset.label}: $${formatNumber(value, 2)}`;
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${formatNumber(value, 0)}`,
          font: { size: 11 },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 20,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Summary stats
  const stats = [
    {
      label: 'Amazon Spending',
      value: data.totalSpending,
      color: 'blue',
      icon: '🛍️',
    },
  ];

  if (data.sp500?.success) {
    stats.push({
      label: 'S&P 500 (SPY)',
      value: data.sp500.summary.currentValue,
      return: data.sp500.summary.totalReturnPercent,
      color: 'green',
      icon: '📈',
    });
  }

  if (data.nvidia?.success) {
    stats.push({
      label: 'Nvidia (NVDA)',
      value: data.nvidia.summary.currentValue,
      return: data.nvidia.summary.totalReturnPercent,
      color: 'red',
      icon: '🎮',
    });
  }

  if (data.bitcoin?.success) {
    stats.push({
      label: 'Bitcoin (BTC)',
      value: data.bitcoin.summary.currentValue,
      return: data.bitcoin.summary.totalReturnPercent,
      color: 'orange',
      icon: '₿',
    });
  }

  const colorMap = {
    blue: 'from-blue-50 to-blue-100 text-blue-900',
    green: 'from-green-50 to-green-100 text-green-900',
    red: 'from-red-50 to-red-100 text-red-900',
    orange: 'from-orange-50 to-orange-100 text-orange-900',
  };

  return (
    <>
      <Card
        title="💸 Opportunity Cost Analysis"
        subtitle="What if you invested instead of shopping?"
      >
        {/* Chart */}
        <div style={{ height: '400px' }} className="mb-6">
          <Line data={chartData} options={options} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-lg p-4 hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xl font-bold mb-1">${formatNumber(stat.value, 2)}</p>
                {stat.return !== undefined && (
                  <p className="text-xs font-semibold">
                    {stat.return >= 0 ? '+' : ''}
                    {formatNumber(stat.return, 1)}% return
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="flex justify-end">
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Update API Key
          </button>
        </div>
      </Card>

      <ApiKeyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={setApiKey} />
    </>
  );
}
