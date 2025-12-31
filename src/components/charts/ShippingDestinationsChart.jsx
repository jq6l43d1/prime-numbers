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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Parses and normalizes a shipping address
 * Returns { displayName, city, state, zip, fullAddress }
 */
function parseAddress(addressString) {
  if (!addressString || addressString === 'Not Available') return null;

  // Try to extract city, state, and zip from common patterns
  // Format: "Name, Street, City, State ZIP, Country"
  const parts = addressString.split(',').map(p => p.trim());

  let city = '';
  let state = '';
  let zip = '';

  // Look for state/zip pattern (e.g., "WY 82009-5228" or "CA 90210")
  for (let i = 0; i < parts.length; i++) {
    const stateZipMatch = parts[i].match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      zip = stateZipMatch[2];
      if (i > 0) {
        city = parts[i - 1];
      }
      break;
    }
  }

  // Create a display name (use city and state if available, otherwise first 50 chars)
  let displayName = addressString.substring(0, 50);
  if (city && state) {
    displayName = `${city}, ${state}`;
  } else if (parts.length >= 2) {
    // Use last 2 parts as fallback
    displayName = parts.slice(-2).join(', ');
  }

  return {
    displayName,
    city,
    state,
    zip,
    fullAddress: addressString
  };
}

/**
 * Shipping Destinations Chart - Shows where orders are being shipped
 * Helps identify gift recipients, multiple addresses, and shipping patterns
 */
export function ShippingDestinationsChart({ orders, onDrillDown }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Shipping Destinations</h3>
        <p className="text-gray-500">No shipping data available</p>
      </div>
    );
  }

  // Parse all shipping addresses
  const addressMap = new Map();

  orders.forEach(order => {
    const parsed = parseAddress(order.shippingAddress);
    if (!parsed) return;

    const key = parsed.fullAddress;
    if (!addressMap.has(key)) {
      addressMap.set(key, {
        ...parsed,
        orders: [],
        totalSpent: 0,
        orderCount: 0
      });
    }

    const addressData = addressMap.get(key);
    addressData.orders.push(order);
    addressData.totalSpent += order.totalOwed || 0;
    addressData.orderCount++;
  });

  // Convert to array and sort by order count
  const addressStats = Array.from(addressMap.values())
    .sort((a, b) => b.orderCount - a.orderCount);

  // Find the primary address (most orders)
  const primaryAddress = addressStats[0];

  // Get top 10 addresses (excluding primary if there are many addresses)
  let topAddresses = addressStats;
  let showingSecondaryOnly = false;

  if (addressStats.length > 10) {
    // Show primary + top 9 secondary addresses
    topAddresses = [
      primaryAddress,
      ...addressStats.slice(1, 10)
    ];
    showingSecondaryOnly = true;
  } else {
    topAddresses = addressStats.slice(0, 10);
  }

  const chartData = {
    labels: topAddresses.map(addr => addr.displayName),
    datasets: [
      {
        label: 'Number of Orders',
        data: topAddresses.map(addr => addr.orderCount),
        backgroundColor: topAddresses.map((addr, idx) =>
          idx === 0 && showingSecondaryOnly ? 'rgba(59, 130, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)'
        ),
        borderColor: topAddresses.map((addr, idx) =>
          idx === 0 && showingSecondaryOnly ? 'rgba(59, 130, 246, 1)' : 'rgba(99, 102, 241, 1)'
        ),
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(79, 70, 229, 0.9)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars
    onClick: (event, elements) => {
      if (elements.length > 0 && onDrillDown) {
        const index = elements[0].index;
        const addressData = topAddresses[index];
        onDrillDown({
          title: `Orders Shipped to ${addressData.displayName}`,
          orders: addressData.orders,
          metadata: {
            fullAddress: addressData.fullAddress,
            totalSpent: addressData.totalSpent,
            orderCount: addressData.orderCount
          }
        });
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const addressData = topAddresses[context[0].dataIndex];
            return addressData.displayName;
          },
          afterTitle: (context) => {
            const addressData = topAddresses[context[0].dataIndex];
            if (addressData.fullAddress.length > 50) {
              return addressData.fullAddress.substring(50);
            }
            return '';
          },
          label: (context) => {
            const addressData = topAddresses[context.dataIndex];
            return [
              `${addressData.orderCount} orders`,
              `$${addressData.totalSpent.toFixed(2)} total`,
              `Click to view details`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Orders'
        }
      },
      y: {
        ticks: {
          autoSkip: false,
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Calculate summary stats
  const uniqueAddresses = addressStats.length;
  const primaryAddressPercent = primaryAddress
    ? ((primaryAddress.orderCount / orders.length) * 100).toFixed(1)
    : 0;
  const secondaryShipments = orders.length - (primaryAddress?.orderCount || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-4">Shipping Destinations</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Unique Addresses</p>
          <p className="text-2xl font-bold text-blue-600">{uniqueAddresses}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Primary Address</p>
          <p className="text-2xl font-bold text-indigo-600">{primaryAddressPercent}%</p>
          <p className="text-xs text-gray-500">of orders</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Other Addresses</p>
          <p className="text-2xl font-bold text-purple-600">{secondaryShipments}</p>
          <p className="text-xs text-gray-500">shipments</p>
        </div>
      </div>

      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>

      {showingSecondaryOnly && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Showing primary address and top 9 secondary addresses.
          Total unique addresses: {uniqueAddresses}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-2 text-center">
        Click any address to view all orders shipped there
      </p>
    </div>
  );
}
