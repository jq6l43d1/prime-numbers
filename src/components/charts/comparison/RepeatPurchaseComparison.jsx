import { useMemo } from 'react';
import { formatNumber } from '../../../utils/currencyHelpers';
import { Bar } from 'react-chartjs-2';
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

export function RepeatPurchaseComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const repeatCounts = useMemo(() => {
    return datasetStats.map(item => {
      const productPurchases = {};

      // Count purchases per product
      item.dataset.orders.forEach(order => {
        const key = order.asin || order.productName;
        if (!key) return;

        if (!productPurchases[key]) {
          productPurchases[key] = 0;
        }
        productPurchases[key] += order.quantity || 1;
      });

      // Count how many products were purchased multiple times
      const repeats = Object.values(productPurchases).filter(count => count >= 2);
      const totalRepeats = repeats.length;
      const totalProducts = Object.keys(productPurchases).length;

      return {
        name: item.dataset.name,
        totalRepeats,
        totalProducts,
        repeatRate: totalProducts > 0 ? (totalRepeats / totalProducts) * 100 : 0,
      };
    });
  }, [datasetStats]);

  const chartData = {
    labels: repeatCounts.map(d => d.name),
    datasets: [
      {
        label: 'Repeat Purchases',
        data: repeatCounts.map(d => d.totalRepeats),
        backgroundColor: repeatCounts.map(
          (_, i) => `${CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}80`
        ),
        borderColor: repeatCounts.map(
          (_, i) => CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]
        ),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Repeat Purchase Patterns Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const data = repeatCounts[context.dataIndex];
            return [
              `Repeat purchases: ${data.totalRepeats}`,
              `Total products: ${data.totalProducts}`,
              `Repeat rate: ${formatNumber(data.repeatRate, 1)}%`,
            ];
          },
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
