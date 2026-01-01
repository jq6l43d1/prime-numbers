import { Bar } from 'react-chartjs-2';
import { formatNumber, formatCurrency } from '../../../utils/currencyHelpers';
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

export function DiscountAnalysisComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const orders = item.dataset.orders || [];

    // Calculate discount statistics
    const discountStats = orders.reduce(
      (acc, order) => {
        const discount = Math.abs(parseFloat(order.totalDiscounts) || 0);
        acc.totalDiscounts += discount;
        if (discount > 0) {
          acc.ordersWithDiscounts++;
        }
        return acc;
      },
      {
        totalDiscounts: 0,
        ordersWithDiscounts: 0,
      }
    );

    return {
      label: item.dataset.name,
      data: [discountStats.totalDiscounts],
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: ['Total Discounts Received'],
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Discount Analysis Comparison',
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

            // Calculate discount rate for this dataset
            const datasetIndex = context.datasetIndex;
            const item = datasetStats[datasetIndex];
            const orders = item.dataset.orders || [];

            const discountStats = orders.reduce(
              (acc, order) => {
                const discount = Math.abs(parseFloat(order.totalDiscounts) || 0);
                acc.totalDiscounts += discount;
                if (discount > 0) {
                  acc.ordersWithDiscounts++;
                }
                return acc;
              },
              { totalDiscounts: 0, ordersWithDiscounts: 0 }
            );

            const avgDiscount =
              discountStats.ordersWithDiscounts > 0
                ? discountStats.totalDiscounts / discountStats.ordersWithDiscounts
                : 0;

            return [
              `${label}: $${formatNumber(value, 2)}`,
              `Orders with Discounts: ${discountStats.ordersWithDiscounts}`,
              `Avg Discount: $${formatNumber(avgDiscount, 2)}`,
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
            return formatCurrency(value);
          },
        },
        title: {
          display: true,
          text: 'Total Discounts Received ($)',
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
