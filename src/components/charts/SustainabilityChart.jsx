import { Card } from '../common/Card';
import { formatNumber } from '../../utils/currencyHelpers';

export function SustainabilityChart({ sustainabilityMetrics }) {
  if (!sustainabilityMetrics || Object.keys(sustainabilityMetrics).length === 0) {
    return (
      <Card title="🌱 Sustainability Dashboard" subtitle="No sustainability data available">
        <div className="text-center text-gray-500 py-8">
          <p>No sustainability metrics found in your Amazon export.</p>
          <p className="text-sm mt-2">
            This feature requires sustainability data from your Amazon data export.
          </p>
        </div>
      </Card>
    );
  }

  const mspMetric = sustainabilityMetrics.msp_metric || 0;
  const cpfMetric = sustainabilityMetrics.cpf_metric || 0;
  const dexMetric = sustainabilityMetrics.dex_metric || 0;

  // Calculate rough carbon footprint equivalent (these are estimates)
  // Assuming each metric unit represents approximately 1kg of CO2
  const totalCarbonKg = mspMetric + cpfMetric + dexMetric;
  const carbonTons = totalCarbonKg / 1000;

  // Fun comparisons (approximate)
  const milesInCar = totalCarbonKg * 2.31; // ~2.31 miles per kg CO2
  const treesNeeded = Math.ceil(totalCarbonKg / 21); // ~21kg CO2 per tree per year

  const metrics = [
    {
      icon: '📦',
      label: 'MSP Metric',
      value: formatNumber(mspMetric, 0),
      subtitle: 'Minimal State Packaging',
      description: 'Packages using minimal materials',
      color: 'from-green-50 to-green-100',
      textColor: 'text-green-900',
      borderColor: 'border-green-300',
    },
    {
      icon: '📮',
      label: 'CPF Metric',
      value: formatNumber(cpfMetric, 0),
      subtitle: 'Compact by Design',
      description: 'Products with reduced packaging',
      color: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-900',
      borderColor: 'border-blue-300',
    },
    {
      icon: '♻️',
      label: 'DEX Metric',
      value: formatNumber(dexMetric, 0),
      subtitle: 'Device Experience',
      description: 'Digital/efficient delivery',
      color: 'from-purple-50 to-purple-100',
      textColor: 'text-purple-900',
      borderColor: 'border-purple-300',
    },
  ];

  return (
    <Card
      title="🌱 Sustainability Dashboard"
      subtitle="Your environmental impact from Amazon purchases"
    >
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${metric.color} rounded-lg p-4 border-2 ${metric.borderColor} hover:shadow-lg transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">{metric.icon}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">{metric.label}</p>
              <p className={`text-3xl font-bold ${metric.textColor} mb-2`}>{metric.value}</p>
              <p className="text-xs font-medium text-gray-700 mb-1">{metric.subtitle}</p>
              <p className="text-xs text-gray-600">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Carbon Footprint Estimate */}
      <div className="bg-gradient-to-r from-green-50 via-teal-50 to-blue-50 rounded-lg p-6 border-2 border-green-300 mb-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">🌍 Estimated Carbon Impact</h3>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div>
              <p className="text-4xl font-bold text-green-700">{carbonTons.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Metric Tons CO₂</p>
            </div>
            <div className="text-5xl">≈</div>
            <div>
              <p className="text-4xl font-bold text-blue-700">{formatNumber(totalCarbonKg, 0)}</p>
              <p className="text-sm text-gray-600">Kilograms CO₂</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🚗</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(milesInCar, 0)}</p>
              <p className="text-sm text-gray-600">Miles driven in a car</p>
              <p className="text-xs text-gray-500 mt-1">Equivalent carbon emissions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-2 border-green-300 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌳</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(treesNeeded, 0)}</p>
              <p className="text-sm text-gray-600">Trees needed for 1 year</p>
              <p className="text-xs text-gray-500 mt-1">To offset these emissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Chart */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">📊 Metric Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">MSP (Packaging)</span>
              <span className="text-sm font-semibold text-gray-900">
                {((mspMetric / totalCarbonKg) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(mspMetric / totalCarbonKg) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">CPF (Compact Design)</span>
              <span className="text-sm font-semibold text-gray-900">
                {((cpfMetric / totalCarbonKg) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(cpfMetric / totalCarbonKg) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">DEX (Digital Efficiency)</span>
              <span className="text-sm font-semibold text-gray-900">
                {((dexMetric / totalCarbonKg) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(dexMetric / totalCarbonKg) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">💡 Sustainability Tips</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>
            • <span className="font-semibold">Consolidate orders:</span> Multiple items in one
            shipment reduce packaging
          </li>
          <li>
            • <span className="font-semibold">Choose slower shipping:</span> Standard delivery is
            more eco-friendly than next-day
          </li>
          <li>
            • <span className="font-semibold">Look for certifications:</span> Climate Pledge
            Friendly products have lower impact
          </li>
          <li>
            • <span className="font-semibold">Buy digital when possible:</span> E-books, music, and
            streaming have minimal carbon footprint
          </li>
        </ul>
      </div>
    </Card>
  );
}
