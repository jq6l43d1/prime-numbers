import { useData } from '../../context/DataContext';
import { useStatistics } from '../../hooks/useStatistics';
import { SpendingOverTimeComparison } from '../charts/comparison/SpendingOverTimeComparison';
import { CategoryBreakdownComparison } from '../charts/comparison/CategoryBreakdownComparison';
import { OrdersByMonthComparison } from '../charts/comparison/OrdersByMonthComparison';
import { OrdersByYearComparison } from '../charts/comparison/OrdersByYearComparison';
import { DigitalVsRetailComparison } from '../charts/comparison/DigitalVsRetailComparison';
import { DayOfWeekComparison } from '../charts/comparison/DayOfWeekComparison';
import { PaymentMethodComparison } from '../charts/comparison/PaymentMethodComparison';
import { ShippingMethodsComparison } from '../charts/comparison/ShippingMethodsComparison';
import { MerchantAnalysisComparison } from '../charts/comparison/MerchantAnalysisComparison';
import { SeasonalSpendingComparison } from '../charts/comparison/SeasonalSpendingComparison';
import { TopProductsComparison } from '../charts/comparison/TopProductsComparison';
import { PriceDistributionComparison } from '../charts/comparison/PriceDistributionComparison';
import { ReturnsAnalysisComparison } from '../charts/comparison/ReturnsAnalysisComparison';
import { GiftOrdersComparison } from '../charts/comparison/GiftOrdersComparison';
import { OrderStatusComparison } from '../charts/comparison/OrderStatusComparison';
import { ProductConditionComparison } from '../charts/comparison/ProductConditionComparison';
import { FulfillmentSpeedComparison } from '../charts/comparison/FulfillmentSpeedComparison';
import { TaxAnalysisComparison } from '../charts/comparison/TaxAnalysisComparison';
import { DiscountAnalysisComparison } from '../charts/comparison/DiscountAnalysisComparison';
import { ShippingCostAnalysisComparison } from '../charts/comparison/ShippingCostAnalysisComparison';
import { CarrierPerformanceComparison } from '../charts/comparison/CarrierPerformanceComparison';
import { OrderSizeDistributionComparison } from '../charts/comparison/OrderSizeDistributionComparison';
import { YearOverYearComparison } from '../charts/comparison/YearOverYearComparison';
import { RepeatPurchaseComparison } from '../charts/comparison/RepeatPurchaseComparison';
import { SpendingVelocityComparison } from '../charts/comparison/SpendingVelocityComparison';
import { CumulativeOrdersComparison } from '../charts/comparison/CumulativeOrdersComparison';
import { SubscriptionDetectionComparison } from '../charts/comparison/SubscriptionDetectionComparison';
import { ShippingDestinationsComparison } from '../charts/comparison/ShippingDestinationsComparison';
import { SpendingHeatmapComparison } from '../charts/comparison/SpendingHeatmapComparison';
import { CategorySpendingTrendComparison } from '../charts/comparison/CategorySpendingTrendComparison';

export function ComparisonDashboard() {
  const { datasets } = useData();

  if (datasets.length < 2) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Upload at least 2 files to compare</p>
      </div>
    );
  }

  // Generate colors for each dataset
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];

  const borderColors = [
    'border-blue-500',
    'border-purple-500',
    'border-green-500',
    'border-orange-500',
    'border-pink-500',
    'border-indigo-500',
    'border-teal-500',
    'border-red-500'
  ];

  const bgColors = [
    'bg-blue-50',
    'bg-purple-50',
    'bg-green-50',
    'bg-orange-50',
    'bg-pink-50',
    'bg-indigo-50',
    'bg-teal-50',
    'bg-red-50'
  ];

  // Calculate statistics for each dataset
  const datasetStats = datasets.map((dataset, index) => {
    const stats = useStatistics(dataset.orders, dataset.returns);
    return {
      dataset,
      stats,
      color: colors[index % colors.length],
      borderColor: borderColors[index % borderColors.length],
      bgColor: bgColors[index % bgColors.length]
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Compare Files
          <span className="ml-3 text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
            Comparison View
          </span>
        </h2>
        <p className="text-gray-600">
          Side-by-side comparison of {datasets.length} files
        </p>
      </div>

      {/* Legend */}
      <div className="card bg-white shadow-lg mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {datasetStats.map((item, index) => (
            <div
              key={item.dataset.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${item.borderColor} ${item.bgColor}`}
            >
              <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {item.dataset.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(item.dataset.uploadDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="card bg-gradient-to-br from-white to-indigo-50 shadow-lg mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Key Metrics</h3>
        <div className="space-y-6">
          {/* Total Spent */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Total Spent</h4>
            <div className="space-y-2">
              {datasetStats.map((item) => (
                <div key={item.dataset.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end px-3`}
                        style={{
                          width: `${(item.stats.overview.totalSpent / Math.max(...datasetStats.map(d => d.stats.overview.totalSpent))) * 100}%`
                        }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {formatCurrency(item.stats.overview.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Orders */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Total Orders</h4>
            <div className="space-y-2">
              {datasetStats.map((item) => (
                <div key={item.dataset.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end px-3`}
                        style={{
                          width: `${(item.stats.overview.totalOrders / Math.max(...datasetStats.map(d => d.stats.overview.totalOrders))) * 100}%`
                        }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {item.stats.overview.totalOrders}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Order Value */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Average Order Value</h4>
            <div className="space-y-2">
              {datasetStats.map((item) => (
                <div key={item.dataset.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500 flex items-center justify-end px-3`}
                        style={{
                          width: `${(item.stats.overview.avgOrderValue / Math.max(...datasetStats.map(d => d.stats.overview.avgOrderValue))) * 100}%`
                        }}
                      >
                        <span className="text-white font-semibold text-sm">
                          {formatCurrency(item.stats.overview.avgOrderValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {datasetStats.map((item) => (
          <div
            key={item.dataset.id}
            className={`card border-2 ${item.borderColor} ${item.bgColor} shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {item.dataset.name}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.stats.overview.totalSpent)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Orders</p>
                  <p className="text-xl font-bold text-gray-900">
                    {item.stats.overview.totalOrders}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Avg Order</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(item.stats.overview.avgOrderValue)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">Items</p>
                  <p className="text-xl font-bold text-gray-900">
                    {item.stats.overview.totalItems}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-2">Top Category</p>
                {item.stats.spending.byCategory[0] ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {item.stats.spending.byCategory[0].category}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.stats.spending.byCategory[0].amount)} ({item.stats.spending.byCategory[0].percentage}%)
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No data</p>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-xs text-gray-600 mb-2">Monthly Average</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.stats.spending.monthlyAverage)}
                </p>
              </div>

              {item.stats.spending.highestMonth && (
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-2">Biggest Month</p>
                  <p className="font-semibold text-gray-900">
                    {item.stats.spending.highestMonth.month}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.stats.spending.highestMonth.amount)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Insights Comparison */}
      <div className="card bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Comparison Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Highest Spender</p>
            {(() => {
              const highest = datasetStats.reduce((max, item) =>
                item.stats.overview.totalSpent > max.stats.overview.totalSpent ? item : max
              );
              const highestIndex = datasetStats.indexOf(highest);
              return (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${highest.color}`}></div>
                  <p className="text-gray-700 flex-1">
                    {highest.dataset.name} with {formatCurrency(highest.stats.overview.totalSpent)}
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Most Orders</p>
            {(() => {
              const highest = datasetStats.reduce((max, item) =>
                item.stats.overview.totalOrders > max.stats.overview.totalOrders ? item : max
              );
              return (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${highest.color}`}></div>
                  <p className="text-gray-700 flex-1">
                    {highest.dataset.name} with {highest.stats.overview.totalOrders} orders
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Highest Avg Order</p>
            {(() => {
              const highest = datasetStats.reduce((max, item) =>
                item.stats.overview.avgOrderValue > max.stats.overview.avgOrderValue ? item : max
              );
              return (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${highest.color}`}></div>
                  <p className="text-gray-700 flex-1">
                    {highest.dataset.name} with {formatCurrency(highest.stats.overview.avgOrderValue)}
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-gray-900 mb-2">Total Combined</p>
            <p className="text-gray-700">
              {formatCurrency(datasetStats.reduce((sum, item) => sum + item.stats.overview.totalSpent, 0))} across all files
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="space-y-8 mt-8">
        {/* Spending Over Time */}
        <div className="card bg-white shadow-lg">
          <SpendingOverTimeComparison datasetStats={datasetStats} />
        </div>

        {/* Category Breakdown */}
        <div className="card bg-white shadow-lg">
          <CategoryBreakdownComparison datasetStats={datasetStats} />
        </div>

        {/* Orders by Month and Year */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <OrdersByMonthComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <OrdersByYearComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Digital vs Retail and Day of Week */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <DigitalVsRetailComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <DayOfWeekComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Payment Methods and Shipping Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <PaymentMethodComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <ShippingMethodsComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Seasonal Spending */}
        <div className="card bg-white shadow-lg">
          <SeasonalSpendingComparison datasetStats={datasetStats} />
        </div>

        {/* Top Products and Merchant Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <TopProductsComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <MerchantAnalysisComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Price Distribution and Returns Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <PriceDistributionComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <ReturnsAnalysisComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Gift Orders and Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <GiftOrdersComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <OrderStatusComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Product Condition and Fulfillment Speed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <ProductConditionComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <FulfillmentSpeedComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Tax, Discount, and Shipping Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card bg-white shadow-lg">
            <TaxAnalysisComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <DiscountAnalysisComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <ShippingCostAnalysisComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Carrier Performance */}
        <div className="card bg-white shadow-lg">
          <CarrierPerformanceComparison datasetStats={datasetStats} />
        </div>

        {/* Order Size Distribution and Year-over-Year */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <OrderSizeDistributionComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <YearOverYearComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Repeat Purchase and Subscription Detection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <RepeatPurchaseComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <SubscriptionDetectionComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Spending Velocity and Cumulative Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <SpendingVelocityComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <CumulativeOrdersComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Category Spending Trend and Shipping Destinations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-white shadow-lg">
            <CategorySpendingTrendComparison datasetStats={datasetStats} />
          </div>
          <div className="card bg-white shadow-lg">
            <ShippingDestinationsComparison datasetStats={datasetStats} />
          </div>
        </div>

        {/* Spending Heatmap */}
        <div className="card bg-white shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Spending Heatmap Comparison</h3>
          <SpendingHeatmapComparison datasetStats={datasetStats} />
        </div>
      </div>
    </div>
  );
}
