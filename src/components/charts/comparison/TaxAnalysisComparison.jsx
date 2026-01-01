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

export function TaxAnalysisComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const datasets = datasetStats.map((item, index) => {
    const orders = item.dataset.orders || [];

    // Calculate tax statistics
    const taxStats = orders.reduce(
      (acc, order) => {
        const tax = order.unitPriceTax || 0;
        acc.totalTax += tax;
        return acc;
      },
      {
        totalTax: 0,
      }
    );

    return {
      label: item.dataset.name,
      data: [taxStats.totalTax],
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: ['Total Tax Paid'],
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Tax Analysis Comparison',
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

            // Calculate tax rate for this dataset
            const datasetIndex = context.datasetIndex;
            const item = datasetStats[datasetIndex];
            const orders = item.dataset.orders || [];

            const taxStats = orders.reduce(
              (acc, order) => {
                const tax = order.unitPriceTax || 0;
                const subtotal = order.unitPrice * order.quantity;
                acc.totalTax += tax;
                acc.totalSubtotal += subtotal;
                if (tax > 0) {
                  acc.taxedOrders++;
                }
                return acc;
              },
              { totalTax: 0, totalSubtotal: 0, taxedOrders: 0 }
            );

            const avgTaxRate =
              taxStats.totalSubtotal > 0 ? (taxStats.totalTax / taxStats.totalSubtotal) * 100 : 0;

            return [
              `${label}: $${formatNumber(value, 2)}`,
              `Taxed Orders: ${taxStats.taxedOrders}`,
              `Avg Tax Rate: ${formatNumber(avgTaxRate, 2)}%`,
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
          text: 'Total Tax Paid ($)',
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
