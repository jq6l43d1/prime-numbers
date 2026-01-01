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
import { formatNumber } from '../../../utils/currencyHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function CarrierPerformanceComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Get all unique carriers across all datasets (top 10 most common)
  const allCarriersMap = new Map();

  datasetStats.forEach(({ dataset }) => {
    const orders = dataset.orders || [];
    orders.forEach(order => {
      const carrierInfo = order.carrierNameAndTrackingNumber || 'No Tracking';
      let carrier = 'No Tracking';

      if (carrierInfo && carrierInfo !== 'No Tracking' && carrierInfo !== '') {
        const match = carrierInfo.match(/^([A-Za-z_\s]+)/);
        if (match) {
          carrier = match[1].trim();
        }
      }

      allCarriersMap.set(carrier, (allCarriersMap.get(carrier) || 0) + 1);
    });
  });

  // Get top 10 carriers by total usage
  const allCarriers = Array.from(allCarriersMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([carrier]) => carrier);

  const datasets = datasetStats.map((item, index) => {
    const orders = item.dataset.orders || [];

    // Count shipments by carrier for this dataset
    const carrierCounts = {};
    orders.forEach(order => {
      const carrierInfo = order.carrierNameAndTrackingNumber || 'No Tracking';
      let carrier = 'No Tracking';

      if (carrierInfo && carrierInfo !== 'No Tracking' && carrierInfo !== '') {
        const match = carrierInfo.match(/^([A-Za-z_\s]+)/);
        if (match) {
          carrier = match[1].trim();
        }
      }

      carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1;
    });

    // Fill in data for all carriers (0 if not present)
    const data = allCarriers.map(carrier => carrierCounts[carrier] || 0);

    return {
      label: item.dataset.name,
      data: data,
      backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length],
      borderWidth: 1,
    };
  });

  const chartData = {
    labels: allCarriers,
    datasets: datasets,
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    indexAxis: 'y',
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Carrier Performance Comparison',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatNumber(value);
          },
        },
        title: {
          display: true,
          text: 'Number of Shipments',
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-96">
      <Bar data={chartData} options={options} />
    </div>
  );
}
