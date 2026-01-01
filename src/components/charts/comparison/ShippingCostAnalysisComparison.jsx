import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../../utils/currencyHelpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ShippingCostAnalysisComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const orders = item.dataset.orders || [];

    // Calculate shipping cost statistics
    const shippingStats = orders.reduce(
      (acc, order) => {
        const shippingCost = order.shippingCharge || 0;
        acc.totalShippingPaid += shippingCost;
        if (shippingCost === 0) {
          acc.freeShipping++;
        } else {
          acc.paidShipping++;
        }
        return acc;
      },
      {
        totalShippingPaid: 0,
        freeShipping: 0,
        paidShipping: 0,
      }
    );

    return {
      label: item.dataset.name,
      data: [shippingStats.totalShippingPaid],
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: ['Total Shipping Costs'],
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Shipping Cost Analysis Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;

            // Calculate shipping stats for this dataset
            const datasetIndex = context.datasetIndex;
            const item = datasetStats[datasetIndex];
            const orders = item.dataset.orders || [];

            const shippingStats = orders.reduce(
              (acc, order) => {
                const shippingCost = order.shippingCharge || 0;
                acc.totalShippingPaid += shippingCost;
                if (shippingCost === 0) {
                  acc.freeShipping++;
                } else {
                  acc.paidShipping++;
                }
                return acc;
              },
              { totalShippingPaid: 0, freeShipping: 0, paidShipping: 0 }
            );

            const avgPaidShipping =
              shippingStats.paidShipping > 0
                ? shippingStats.totalShippingPaid / shippingStats.paidShipping
                : 0;

            return [
              `${label}: $${formatNumber(value, 2)}`,
              `Free Shipping: ${shippingStats.freeShipping} orders`,
              `Paid Shipping: ${shippingStats.paidShipping} orders`,
              `Avg Paid: $${formatNumber(avgPaidShipping, 2)}`,
            ];
          },
        },
      },
    },
    scales: {
      ...BAR_CHART_OPTIONS.scales,
      y: {
        ...BAR_CHART_OPTIONS.scales.y,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
        },
        title: {
          display: true,
          text: 'Total Shipping Costs ($)',
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
