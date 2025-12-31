import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BAR_CHART_OPTIONS, CHART_COLOR_PALETTE } from '../../../constants/chartConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ShippingDestinationsComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  // Calculate unique shipping addresses for each dataset
  const destinationData = datasetStats.map(item => {
    const addressMap = new Map();

    item.dataset.orders.forEach(order => {
      const address = order.shippingAddress;
      if (!address || address === 'Not Available') return;

      if (!addressMap.has(address)) {
        addressMap.set(address, {
          count: 0,
          totalSpent: 0
        });
      }

      const data = addressMap.get(address);
      data.count++;
      data.totalSpent += order.totalOwed || 0;
    });

    const addresses = Array.from(addressMap.values());
    const uniqueAddresses = addresses.length;
    const primaryAddress = addresses.sort((a, b) => b.count - a.count)[0];
    const primaryPercentage = primaryAddress ? (primaryAddress.count / item.dataset.orders.length * 100) : 0;

    return {
      name: item.dataset.name,
      uniqueAddresses,
      primaryPercentage
    };
  });

  const chartData = {
    labels: destinationData.map(d => d.name),
    datasets: [
      {
        label: 'Unique Addresses',
        data: destinationData.map(d => d.uniqueAddresses),
        backgroundColor: destinationData.map((_, i) => `${CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]}80`),
        borderColor: destinationData.map((_, i) => CHART_COLOR_PALETTE[i % CHART_COLOR_PALETTE.length]),
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const options = {
    ...BAR_CHART_OPTIONS,
    plugins: {
      ...BAR_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: 'Shipping Destinations Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = destinationData[context.dataIndex];
            return [
              `Unique addresses: ${data.uniqueAddresses}`,
              `Primary address: ${data.primaryPercentage.toFixed(1)}% of orders`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
