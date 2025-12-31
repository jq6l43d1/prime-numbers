import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PIE_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../constants/chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export function OrderStatusChart({ orders, onStatusClick }) {
  const data = useMemo(() => {
    if (!orders || orders.length === 0) {
      return null;
    }

    // Group orders by status
    const statusCounts = {};
    orders.forEach((order) => {
      const status = order.orderStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Sort by count
    const sortedStatuses = Object.entries(statusCounts)
      .sort(([, a], [, b]) => b - a);

    return {
      labels: sortedStatuses.map(([status]) => status),
      counts: sortedStatuses.map(([, count]) => count),
      rawData: sortedStatuses,
    };
  }, [orders]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No order status data available
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.counts,
        backgroundColor: CHART_COLOR_PALETTE,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    ...PIE_CHART_OPTIONS,
    onClick: onStatusClick ? (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const status = data.labels[index];
        onStatusClick(status);
      }
    } : undefined,
    onHover: onStatusClick ? (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    } : undefined,
    plugins: {
      ...PIE_CHART_OPTIONS.plugins,
      tooltip: {
        ...PIE_CHART_OPTIONS.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} orders (${percentage}%)`;
          },
          afterLabel: onStatusClick ? () => 'Click to view orders' : undefined,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
