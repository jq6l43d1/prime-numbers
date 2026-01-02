import { StatsGrid } from './StatsGrid';
import { SpendingOverTimeChart } from '../charts/SpendingOverTimeChart';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { OrdersByMonthChart } from '../charts/OrdersByMonthChart';
import { OrdersByYearChart } from '../charts/OrdersByYearChart';
import { PriceDistributionChart } from '../charts/PriceDistributionChart';
import { DigitalVsRetailChart } from '../charts/DigitalVsRetailChart';
import { TopProductsChart } from '../charts/TopProductsChart';
import { ShippingMethodsChart } from '../charts/ShippingMethodsChart';
import { DayOfWeekChart } from '../charts/DayOfWeekChart';
import { OrderSizeDistributionChart } from '../charts/OrderSizeDistributionChart';
import { ReturnsAnalysisChart } from '../charts/ReturnsAnalysisChart';
import { CategorySpendingTrendChart } from '../charts/CategorySpendingTrendChart';
import { YearOverYearChart } from '../charts/YearOverYearChart';
import { SpendingHeatmapChart } from '../charts/SpendingHeatmapChart';
import { SeasonalSpendingChart } from '../charts/SeasonalSpendingChart';
import { MerchantAnalysisChart } from '../charts/MerchantAnalysisChart';
import { RepeatPurchaseChart } from '../charts/RepeatPurchaseChart';
import { SpendingVelocityChart } from '../charts/SpendingVelocityChart';
import { CumulativeOrdersChart } from '../charts/CumulativeOrdersChart';
import { PaymentMethodChart } from '../charts/PaymentMethodChart';
import { GiftOrdersChart } from '../charts/GiftOrdersChart';
import { OpportunityCostComparisonChart } from '../charts/OpportunityCostComparisonChart';
import { SP500InvestmentChart } from '../charts/SP500InvestmentChart';
import { NvidiaInvestmentChart } from '../charts/NvidiaInvestmentChart';
import { BitcoinInvestmentChart } from '../charts/BitcoinInvestmentChart';
import { SubscriptionDetectionChart } from '../charts/SubscriptionDetectionChart';
import { ShippingDestinationsChart } from '../charts/ShippingDestinationsChart';
import { DiscountAnalysisChart } from '../charts/DiscountAnalysisChart';
import { OrderStatusChart } from '../charts/OrderStatusChart';
import { ShippingCostAnalysisChart } from '../charts/ShippingCostAnalysisChart';
import { TaxAnalysisChart } from '../charts/TaxAnalysisChart';
import { CarrierPerformanceChart } from '../charts/CarrierPerformanceChart';
import { ProductConditionChart } from '../charts/ProductConditionChart';
import { FulfillmentSpeedChart } from '../charts/FulfillmentSpeedChart';
import { AmazonAnniversaryChart } from '../charts/AmazonAnniversaryChart';
import { ProductWordCloudChart } from '../charts/ProductWordCloudChart';
import { WishlistAnalysisChart } from '../charts/WishlistAnalysisChart';
import { SustainabilityChart } from '../charts/SustainabilityChart';
import { DetailedReturnsChart } from '../charts/DetailedReturnsChart';
import { TimePeriodComparison } from '../comparison/TimePeriodComparison';
import { DateRangeFilter } from '../filters/DateRangeFilter';
import { ProductSearchFilter } from '../filters/ProductSearchFilter';
import { AdvancedFilters } from '../filters/AdvancedFilters';
import { DrillDownModal } from '../modals/DrillDownModal';
import { ClickableStatCard } from './ClickableStatCard';
import { ExportButton } from '../export/ExportButton';
import { useStatistics } from '../../hooks/useStatistics';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/currencyHelpers';
import { useState, useMemo, useTransition } from 'react';

export function Dashboard() {
  const [modalData, setModalData] = useState({ isOpen: false, data: null, type: null });
  const [productFilteredOrders, setProductFilteredOrders] = useState(null);
  const [advancedFilteredOrders, setAdvancedFilteredOrders] = useState(null);
  const [isPending, startTransition] = useTransition();
  const {
    orders,
    returns,
    cartItems,
    sustainabilityMetrics,
    viewMode,
    getCombinedData,
    dateFilter,
    setDateFilter,
    getFilteredOrders,
  } = useData();

  // Use combined data if in combined mode, otherwise use single dataset
  const dataToUse = useMemo(() => {
    if (viewMode === 'combined') {
      const combined = getCombinedData();
      return combined || { orders, returns };
    }
    return { orders, returns };
  }, [viewMode, orders, returns, getCombinedData]);

  // Apply filters in order: date -> product search -> advanced - all memoized
  const dateFilteredOrders = useMemo(
    () => getFilteredOrders(dataToUse.orders),
    [dataToUse.orders, getFilteredOrders]
  );

  const afterProductFilter = useMemo(
    () => (productFilteredOrders !== null ? productFilteredOrders : dateFilteredOrders),
    [productFilteredOrders, dateFilteredOrders]
  );

  const filteredOrders = useMemo(
    () => (advancedFilteredOrders !== null ? advancedFilteredOrders : afterProductFilter),
    [advancedFilteredOrders, afterProductFilter]
  );

  const filteredReturns = useMemo(
    () =>
      dataToUse.returns.filter(ret => {
        const matchingOrder = filteredOrders.find(o => o.orderId === ret.orderId);
        return !!matchingOrder;
      }),
    [dataToUse.returns, filteredOrders]
  );

  const statistics = useStatistics(filteredOrders, filteredReturns);

  const handleDateFilterChange = filter => {
    startTransition(() => {
      setDateFilter(filter);
    });
  };

  const openDrillDown = (data, type) => {
    setModalData({ isOpen: true, data, type });
  };

  const closeDrillDown = () => {
    setModalData({ isOpen: false, data: null, type: null });
  };

  const handleCategoryClick = category => {
    const categoryOrders = filteredOrders.filter(o => (o.category || 'Other') === category);
    openDrillDown(
      {
        title: category,
        subtitle: `${categoryOrders.length} orders in this category`,
        orders: categoryOrders,
      },
      'category'
    );
  };

  const handleMonthClick = monthData => {
    // Parse the month string (e.g., "Jan 2024") to get date range
    const monthOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const orderMonthYear = `${orderDate.toLocaleDateString('en-US', { month: 'short' })} ${orderDate.getFullYear()}`;
      return orderMonthYear === monthData.month;
    });

    openDrillDown(
      {
        title: monthData.month,
        subtitle: `${monthOrders.length} orders • $${formatNumber(monthData.amount, 2)} spent`,
        orders: monthOrders,
      },
      'time'
    );
  };

  const handleYearClick = yearData => {
    const yearOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getFullYear() === yearData.year;
    });

    openDrillDown(
      {
        title: `${yearData.year}`,
        subtitle: `${yearOrders.length} orders • $${formatNumber(yearData.amount, 2)} spent`,
        orders: yearOrders,
      },
      'time'
    );
  };

  const handleDayClick = dayData => {
    const dayOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getDay() === dayData.dayIndex;
    });

    openDrillDown(
      {
        title: `${dayData.dayName} Orders`,
        subtitle: `${dayOrders.length} orders • $${formatNumber(dayData.spending, 2)} spent`,
        orders: dayOrders,
      },
      'time'
    );
  };

  const handleSubscriptionClick = subscriptionData => {
    openDrillDown(
      {
        title: subscriptionData.product,
        subtitle: `${formatNumber(subscriptionData.count, 0)} orders across ${subscriptionData.frequency} months • $${formatNumber(subscriptionData.totalSpent, 2)} total`,
        orders: subscriptionData.orders,
      },
      'product'
    );
  };

  const handleShippingDestinationClick = destinationData => {
    openDrillDown(
      {
        title: destinationData.title,
        subtitle: `${destinationData.orders.length} orders • $${formatNumber(destinationData.metadata.totalSpent, 2)} total`,
        orders: destinationData.orders,
        metadata: {
          address: destinationData.metadata.fullAddress,
        },
      },
      'location'
    );
  };

  const handleMerchantClick = merchantData => {
    openDrillDown(
      {
        title: merchantData.merchant,
        subtitle: `${merchantData.orderCount} orders • $${formatNumber(merchantData.totalSpent, 2)} total`,
        orders: merchantData.orders,
      },
      'merchant'
    );
  };

  const handleProductClick = productData => {
    // Find all orders for this product
    const productOrders = filteredOrders.filter(
      o => o.productName === productData.name || o.asin === productData.asin
    );

    openDrillDown(
      {
        title: productData.name,
        subtitle: `${productData.quantity} items ordered • $${formatNumber(productData.totalSpent, 2)} total`,
        orders: productOrders,
      },
      'product'
    );
  };

  const handleReturnReasonClick = reasonData => {
    openDrillDown(
      {
        title: `Returns: ${reasonData.reason}`,
        subtitle: `${formatNumber(reasonData.count, 0)} returns`,
        orders: reasonData.orders,
        metadata: {
          returnReason: reasonData.reason,
        },
      },
      'returns'
    );
  };

  const handleShippingMethodClick = method => {
    const methodOrders = filteredOrders.filter(o => (o.shippingOption || 'Unknown') === method);
    openDrillDown(
      {
        title: `Shipping: ${method}`,
        subtitle: `${methodOrders.length} orders with this shipping method`,
        orders: methodOrders,
      },
      'shipping'
    );
  };

  const handleOrderStatusClick = status => {
    const statusOrders = filteredOrders.filter(o => (o.orderStatus || 'Unknown') === status);
    openDrillDown(
      {
        title: `Status: ${status}`,
        subtitle: `${statusOrders.length} orders with this status`,
        orders: statusOrders,
      },
      'status'
    );
  };

  const handlePriceRangeClick = range => {
    const rangeOrders = filteredOrders.filter(o => {
      const price = parseFloat(o.unitPrice) || 0;
      return price >= range.min && price < range.max;
    });
    openDrillDown(
      {
        title: `Price Range: ${range.label}`,
        subtitle: `${rangeOrders.length} items in this price range`,
        orders: rangeOrders,
      },
      'price'
    );
  };

  const handleDigitalRetailClick = type => {
    const typeOrders = filteredOrders.filter(o => o.isDigital === (type === 'digital'));
    openDrillDown(
      {
        title: type === 'digital' ? 'Digital Orders' : 'Retail Orders',
        subtitle: `${typeOrders.length} ${type} orders`,
        orders: typeOrders,
      },
      'type'
    );
  };

  const handleCarrierClick = (carrier, orders) => {
    openDrillDown(
      {
        title: `Carrier: ${carrier}`,
        subtitle: `${orders.length} shipments`,
        orders: orders,
      },
      'carrier'
    );
  };

  const handlePaymentMethodClick = methodData => {
    openDrillDown(
      {
        title: `Payment: ${methodData.method}`,
        subtitle: `${formatNumber(methodData.count, 0)} orders • $${formatNumber(methodData.totalSpent, 2)} total`,
        orders: methodData.orders,
      },
      'payment'
    );
  };

  const handleSeasonalClick = seasonData => {
    openDrillDown(
      {
        title: `${seasonData.season} ${seasonData.year}`,
        subtitle: `${seasonData.orders.length} orders • $${formatNumber(seasonData.totalSpent, 2)} total`,
        orders: seasonData.orders,
      },
      'seasonal'
    );
  };

  const handleGiftClick = giftData => {
    openDrillDown(
      {
        title: giftData.type,
        subtitle: `${giftData.orders.length} orders • $${formatNumber(giftData.totalSpent, 2)} total`,
        orders: giftData.orders,
      },
      giftData.isGift ? 'gift' : 'personal'
    );
  };

  const handleConditionClick = conditionData => {
    openDrillDown(
      {
        title: `Condition: ${conditionData.condition}`,
        subtitle: `${formatNumber(conditionData.count, 0)} orders • ${formatNumber(conditionData.items, 0)} items • $${formatNumber(conditionData.totalSpent, 2)} total`,
        orders: conditionData.orders,
      },
      'condition'
    );
  };

  const handleFulfillmentSpeedClick = speedData => {
    openDrillDown(
      {
        title: `Fulfillment: ${speedData.bucket}`,
        subtitle: `${formatNumber(speedData.count, 0)} orders • $${formatNumber(speedData.totalSpent, 2)} total`,
        orders: speedData.orders,
      },
      'fulfillment'
    );
  };

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Loading overlay when filtering */}
      {isPending && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Updating charts...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        </div>
      )}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your Order Analytics
              {viewMode === 'combined' && (
                <span className="ml-3 text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
                  Combined View
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                Insights from {formatNumber(statistics.overview.totalOrders, 0)} orders
              </p>
              {dateFilter.label !== 'All Time' && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  {dateFilter.label}
                </span>
              )}
            </div>
          </div>
          <ExportButton orders={filteredOrders} statistics={statistics} dateFilter={dateFilter} />
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter orders={dataToUse.orders} onFilterChange={handleDateFilterChange} />

      {/* Product Search Filter */}
      <ProductSearchFilter
        orders={dateFilteredOrders}
        onFilteredOrdersChange={setProductFilteredOrders}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        orders={afterProductFilter}
        onFilteredOrdersChange={setAdvancedFilteredOrders}
      />

      {/* Clickable Stat Cards for Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          <ClickableStatCard
            icon="💰"
            label="Total Spending"
            value={`$${formatNumber(statistics.overview.totalSpent, 2)}`}
            subtitle={`${formatNumber(statistics.overview.totalOrders, 0)} orders`}
            gradient="from-blue-500 to-blue-600"
            onClick={() =>
              openDrillDown(
                {
                  title: 'All Orders',
                  subtitle: `Total spending across ${formatNumber(statistics.overview.totalOrders, 0)} orders`,
                  orders: filteredOrders,
                },
                'time'
              )
            }
          />
        </div>
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          <ClickableStatCard
            icon="📦"
            label="Total Items"
            value={formatNumber(statistics.overview.totalItems, 0)}
            subtitle={`${formatNumber(statistics.overview.avgItemsPerOrder, 1)} per order`}
            gradient="from-green-500 to-green-600"
            onClick={() =>
              openDrillDown(
                {
                  title: 'Order Details',
                  subtitle: `${formatNumber(statistics.overview.totalItems, 0)} items ordered`,
                  orders: filteredOrders,
                },
                'time'
              )
            }
          />
        </div>
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <ClickableStatCard
            icon="🎯"
            label="Top Category"
            value={statistics.spending.byCategory[0]?.category.substring(0, 15) || 'N/A'}
            subtitle={`$${formatNumber(statistics.spending.byCategory[0]?.amount || 0, 2)}`}
            gradient="from-purple-500 to-purple-600"
            onClick={() => {
              if (statistics.spending.byCategory[0]) {
                handleCategoryClick(statistics.spending.byCategory[0].category);
              }
            }}
          />
        </div>
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          <ClickableStatCard
            icon="📈"
            label="Avg Order Value"
            value={`$${formatNumber(statistics.overview.avgOrderValue, 2)}`}
            subtitle="per order"
            gradient="from-orange-500 to-orange-600"
            onClick={() =>
              openDrillDown(
                {
                  title: 'Order Value Distribution',
                  subtitle: 'Breakdown of order values',
                  orders: filteredOrders,
                },
                'time'
              )
            }
          />
        </div>
      </div>

      <StatsGrid statistics={statistics} />

      <div className="space-y-12">
        {/* Spending Over Time - Full Width */}
        <div className="card bg-gradient-to-br from-white to-blue-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Spending Over Time</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click any point to view orders from that month
          </p>
          <div className="h-80 mb-2">
            <SpendingOverTimeChart
              data={statistics.spending.last12Months}
              onMonthClick={handleMonthClick}
            />
          </div>
        </div>

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-purple-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Spending by Category</h3>
            <p className="text-sm text-gray-600 mb-4">Click any category to view orders</p>
            <div className="h-80 mb-2">
              <CategoryBreakdownChart
                data={statistics.spending.byCategory}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-green-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Orders by Month</h3>
            <p className="text-sm text-gray-600 mb-4">Click any month to view orders</p>
            <div className="h-80 mb-2">
              <OrdersByMonthChart
                data={statistics.spending.last12Months}
                onMonthClick={handleMonthClick}
              />
            </div>
          </div>
        </div>

        {/* Three Column Charts - New Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card bg-gradient-to-br from-white to-indigo-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💵 Price Distribution</h3>
            <p className="text-sm text-gray-600 mb-4">Click any price range to view items</p>
            <div className="h-80 mb-2">
              <PriceDistributionChart
                data={statistics.products.priceRanges}
                onPriceRangeClick={handlePriceRangeClick}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-pink-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Digital vs Retail</h3>
            <p className="text-sm text-gray-600 mb-4">Click any segment to view orders</p>
            <div className="h-80 mb-2">
              <DigitalVsRetailChart
                digitalSpending={statistics.spending.digitalSpending}
                retailSpending={statistics.spending.retailSpending}
                onTypeClick={handleDigitalRetailClick}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-yellow-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚚 Shipping Methods</h3>
            <p className="text-sm text-gray-600 mb-4">Click any method to view orders</p>
            <div className="h-80 mb-2">
              <ShippingMethodsChart
                data={statistics.shipping.methods}
                onMethodClick={handleShippingMethodClick}
              />
            </div>
          </div>
        </div>

        {/* Orders by Year - Full Width */}
        <div className="card bg-gradient-to-br from-white to-teal-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Orders by Year</h3>
          <p className="text-sm text-gray-600 mb-4">
            Click any year to view all orders from that year
          </p>
          <div className="h-80 mb-2">
            <OrdersByYearChart data={statistics.spending.byYear} onYearClick={handleYearClick} />
          </div>
        </div>

        {/* Top Products - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-emerald-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Products by Spending</h3>
            <p className="text-sm text-gray-600 mb-4">Click any product to view all orders</p>
            <div className="h-96 mb-2">
              <TopProductsChart
                data={statistics.products.topBySpending}
                type="spending"
                onProductClick={handleProductClick}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-cyan-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔢 Most Ordered Products</h3>
            <p className="text-sm text-gray-600 mb-4">Click any product to view all orders</p>
            <div className="h-96 mb-2">
              <TopProductsChart
                data={statistics.products.topByQuantity}
                type="quantity"
                onProductClick={handleProductClick}
              />
            </div>
          </div>
        </div>

        {/* New Charts - Category Spending Trend */}
        <div className="card bg-gradient-to-br from-white to-violet-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Category Spending Trends</h3>
          <div className="h-80 mb-2">
            <CategorySpendingTrendChart orders={filteredOrders} />
          </div>
        </div>

        {/* Year-over-Year Comparison */}
        <div className="card bg-gradient-to-br from-white to-amber-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 Year-over-Year Spending Comparison
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Compare spending patterns across different years, month by month
          </p>
          <div className="h-80 mb-2">
            <YearOverYearChart orders={filteredOrders} />
          </div>
        </div>

        {/* Spending Heatmap */}
        <div className="card bg-gradient-to-br from-white to-blue-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Monthly Spending Heatmap</h3>
          <p className="text-sm text-gray-600 mb-4">
            Visualize your spending intensity across months and years
          </p>
          <div className="h-auto py-4 mb-2">
            <SpendingHeatmapChart orders={filteredOrders} />
          </div>
        </div>

        {/* Seasonal Analysis and Shopping Patterns - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-fuchsia-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🌸 Seasonal Spending Analysis</h3>
            <div className="h-96 mb-2">
              <SeasonalSpendingChart orders={filteredOrders} onClick={handleSeasonalClick} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-sky-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Shopping by Day of Week</h3>
            <p className="text-sm text-gray-600 mb-4">
              Click any day to view all orders from that day of the week
            </p>
            <div className="h-96 mb-2">
              <DayOfWeekChart orders={filteredOrders} onDayClick={handleDayClick} />
            </div>
          </div>
        </div>

        {/* Order Analysis - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-lime-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Order Size Distribution</h3>
            <div className="h-80 mb-2">
              <OrderSizeDistributionChart orders={filteredOrders} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-rose-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">↩️ Return Reasons</h3>
            <p className="text-sm text-gray-600 mb-4">Click any reason to view returned orders</p>
            <div className="h-80 mb-2">
              <ReturnsAnalysisChart
                returns={filteredReturns}
                orders={filteredOrders}
                onReasonClick={handleReturnReasonClick}
              />
            </div>
          </div>
        </div>

        {/* Spending Velocity - Full Width */}
        <div className="card bg-gradient-to-br from-white to-blue-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Spending Velocity</h3>
          <p className="text-sm text-gray-600 mb-4">
            Track your cumulative spending growth over time
          </p>
          <div className="h-80 mb-2">
            <SpendingVelocityChart orders={filteredOrders} />
          </div>
        </div>

        {/* Cumulative Orders - Full Width */}
        <div className="card bg-gradient-to-br from-white to-green-50 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Cumulative Orders Over Time</h3>
          <p className="text-sm text-gray-600 mb-4">
            See how your total order count has grown over time
          </p>
          <div className="h-80 mb-2">
            <CumulativeOrdersChart orders={filteredOrders} />
          </div>
        </div>

        {/* Opportunity Cost Analysis - Full Width */}
        <OpportunityCostComparisonChart orders={filteredOrders} />

        {/* Investment Details - Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SP500InvestmentChart orders={filteredOrders} />
          <NvidiaInvestmentChart orders={filteredOrders} />
          <BitcoinInvestmentChart orders={filteredOrders} />
        </div>

        {/* Advanced Analytics - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-indigo-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏪 Merchant Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              Where you shop most - click any merchant to view orders
            </p>
            <div className="h-96 mb-2">
              <MerchantAnalysisChart
                orders={filteredOrders}
                onMerchantClick={handleMerchantClick}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-violet-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔁 Repeat Purchases</h3>
            <p className="text-sm text-gray-600 mb-4">Products you buy again and again</p>
            <div className="h-96 mb-2">
              <RepeatPurchaseChart orders={filteredOrders} />
            </div>
          </div>
        </div>

        {/* Payment & Gift Analysis - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-teal-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💳 Payment Methods</h3>
            <p className="text-sm text-gray-600 mb-4">
              How you pay - click any payment method to view orders
            </p>
            <div className="h-96 mb-2">
              <PaymentMethodChart orders={filteredOrders} onClick={handlePaymentMethodClick} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-pink-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎁 Gift Orders Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              Gift vs personal - click any bar to view orders
            </p>
            <div className="h-96 mb-2">
              <GiftOrdersChart orders={filteredOrders} onClick={handleGiftClick} />
            </div>
          </div>
        </div>

        {/* Order Status & Discounts - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-blue-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Order Status Distribution</h3>
            <p className="text-sm text-gray-600 mb-4">Click any status to view those orders</p>
            <div className="h-96 mb-2">
              <OrderStatusChart orders={filteredOrders} onStatusClick={handleOrderStatusClick} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-green-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              💰 Discount Analysis by Category
            </h3>
            <p className="text-sm text-gray-600 mb-4">See where you save the most money</p>
            <div className="h-96 mb-2">
              <DiscountAnalysisChart orders={filteredOrders} />
            </div>
          </div>
        </div>

        {/* Shipping & Tax Analysis - Three Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card bg-gradient-to-br from-white to-blue-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Shipping Cost Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">Free vs Paid shipping breakdown</p>
            <div className="h-96 mb-2">
              <ShippingCostAnalysisChart orders={filteredOrders} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-orange-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💵 Tax Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">Breakdown of taxes paid</p>
            <div className="h-96 mb-2">
              <TaxAnalysisChart orders={filteredOrders} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-cyan-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚛 Carrier Performance</h3>
            <p className="text-sm text-gray-600 mb-4">Click any carrier to view shipments</p>
            <div className="h-96 mb-2">
              <CarrierPerformanceChart
                orders={filteredOrders}
                onCarrierClick={handleCarrierClick}
              />
            </div>
          </div>
        </div>

        {/* Product Condition & Fulfillment Speed - Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-gradient-to-br from-white to-emerald-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📦 Product Condition Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              New vs Used vs Refurbished - click any segment
            </p>
            <div className="mb-2">
              <ProductConditionChart orders={filteredOrders} onClick={handleConditionClick} />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-amber-50 shadow-lg overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Fulfillment Speed Analysis</h3>
            <p className="text-sm text-gray-600 mb-4">
              How fast are your orders shipped? Click any bar
            </p>
            <div className="mb-2">
              <FulfillmentSpeedChart
                orders={filteredOrders}
                onClick={handleFulfillmentSpeedClick}
              />
            </div>
          </div>
        </div>

        {/* Subscription Detection - Full Width */}
        <div className="card bg-gradient-to-br from-white to-purple-50 shadow-lg overflow-hidden border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Recurring Purchases Detected</h3>
          <p className="text-sm text-gray-600 mb-4">
            Items you purchase regularly across multiple months - click to view order history
          </p>
          <SubscriptionDetectionChart
            orders={filteredOrders}
            onSubscriptionClick={handleSubscriptionClick}
          />
        </div>

        {/* Amazon Anniversary Stats - Full Width */}
        <div className="border-2 border-yellow-200">
          <AmazonAnniversaryChart orders={filteredOrders} />
        </div>

        {/* Product Word Cloud - Full Width */}
        <div className="border-2 border-blue-200">
          <ProductWordCloudChart orders={filteredOrders} />
        </div>

        {/* Wishlist & Saved Items Analysis - Full Width */}
        <div className="border-2 border-purple-200">
          <WishlistAnalysisChart orders={filteredOrders} cartItems={cartItems || []} />
        </div>

        {/* Sustainability Dashboard - Full Width */}
        <div className="border-2 border-green-200">
          <SustainabilityChart sustainabilityMetrics={sustainabilityMetrics || {}} />
        </div>

        {/* Detailed Return Reason Analysis - Full Width */}
        <div className="border-2 border-red-200">
          <DetailedReturnsChart returns={dataToUse.returns} orders={filteredOrders} />
        </div>

        {/* Time Period Comparison - Full Width */}
        <div className="card bg-gradient-to-br from-white to-indigo-50 shadow-lg overflow-hidden border-2 border-indigo-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">⚖️ Compare Time Periods</h3>
          <p className="text-sm text-gray-600 mb-4">
            Compare your spending patterns across any two custom date ranges
          </p>
          <TimePeriodComparison />
        </div>

        {/* Shipping Destinations - Full Width */}
        <div className="card bg-gradient-to-br from-white to-teal-50 shadow-lg overflow-hidden border-2 border-teal-200">
          <ShippingDestinationsChart
            orders={filteredOrders}
            onDrillDown={handleShippingDestinationClick}
          />
        </div>

        {/* Insights Section */}
        <div className="card bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-lg overflow-hidden animate-gradient">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {statistics.spending.byCategory[0] && (
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300">
                <p className="font-semibold text-gray-900 mb-1">🎯 Top Category</p>
                <p className="text-gray-600">
                  You spend most on{' '}
                  <span className="font-bold text-primary">
                    {statistics.spending.byCategory[0].category}
                  </span>{' '}
                  ({statistics.spending.byCategory[0].percentage}% of total)
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
              <p className="font-semibold text-gray-900 mb-1">📊 Monthly Average</p>
              <p className="text-gray-600">
                You spend an average of{' '}
                <span className="font-bold text-primary">
                  ${formatNumber(statistics.spending.monthlyAverage, 2)}
                </span>{' '}
                per month
              </p>
            </div>
            {statistics.spending.highestMonth && (
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-300">
                <p className="font-semibold text-gray-900 mb-1">🔥 Biggest Month</p>
                <p className="text-gray-600">
                  {statistics.spending.highestMonth.month} with{' '}
                  <span className="font-bold text-primary">
                    ${formatNumber(statistics.spending.highestMonth.amount, 2)}
                  </span>{' '}
                  spent
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-300">
              <p className="font-semibold text-gray-900 mb-1">💰 Total Savings</p>
              <p className="text-gray-600">
                You saved{' '}
                <span className="font-bold text-green-600">
                  ${formatNumber(statistics.overview.totalDiscounts, 2)}
                </span>{' '}
                with discounts
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-300">
              <p className="font-semibold text-gray-900 mb-1">⏱️ Order Frequency</p>
              <p className="text-gray-600">
                You order something every{' '}
                <span className="font-bold text-primary">
                  {formatNumber(statistics.trends.avgDaysBetweenOrders, 0)}
                </span>{' '}
                days
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-300">
              <p className="font-semibold text-gray-900 mb-1">🛍️ Unique Products</p>
              <p className="text-gray-600">
                You've ordered{' '}
                <span className="font-bold text-primary">{statistics.products.uniqueProducts}</span>{' '}
                different products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Down Modal */}
      <DrillDownModal
        isOpen={modalData.isOpen}
        onClose={closeDrillDown}
        data={modalData.data || {}}
        type={modalData.type}
      />
    </div>
  );
}
