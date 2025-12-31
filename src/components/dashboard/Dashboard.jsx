import { StatsGrid } from './StatsGrid';
import { SpendingOverTimeChart } from '../charts/SpendingOverTimeChart';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { OrdersByMonthChart } from '../charts/OrdersByMonthChart';
import { OrdersByYearChart } from '../charts/OrdersByYearChart';
import { useStatistics } from '../../hooks/useStatistics';
import { useData } from '../../context/DataContext';

export function Dashboard() {
  const { orders, returns } = useData();
  const statistics = useStatistics(orders, returns);

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Amazon Order Analytics</h2>
        <p className="text-gray-600">
          Insights from {statistics.overview.totalOrders} orders
        </p>
      </div>

      <StatsGrid statistics={statistics} />

      <div className="space-y-8">
        {/* Spending Over Time - Full Width */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Spending Over Time</h3>
          <div className="h-80">
            <SpendingOverTimeChart data={statistics.spending.last12Months} />
          </div>
        </div>

        {/* Two Column Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h3>
            <div className="h-80">
              <CategoryBreakdownChart data={statistics.spending.byCategory} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Orders by Month</h3>
            <div className="h-80">
              <OrdersByMonthChart data={statistics.spending.last12Months} />
            </div>
          </div>
        </div>

        {/* Orders by Year - Full Width */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Orders by Year</h3>
          <div className="h-80">
            <OrdersByYearChart data={statistics.spending.byYear} />
          </div>
        </div>

        {/* Insights Section */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {statistics.spending.byCategory[0] && (
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-900">Top Category</p>
                <p className="text-gray-600">
                  You spend most on <span className="font-bold text-primary">
                    {statistics.spending.byCategory[0].category}
                  </span> ({statistics.spending.byCategory[0].percentage}% of total)
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900">Monthly Average</p>
              <p className="text-gray-600">
                You spend an average of <span className="font-bold text-primary">
                  ${statistics.spending.monthlyAverage.toFixed(2)}
                </span> per month
              </p>
            </div>
            {statistics.spending.highestMonth && (
              <div className="bg-white rounded-lg p-3">
                <p className="font-semibold text-gray-900">Biggest Month</p>
                <p className="text-gray-600">
                  {statistics.spending.highestMonth.month} with{' '}
                  <span className="font-bold text-primary">
                    ${statistics.spending.highestMonth.amount.toFixed(2)}
                  </span> spent
                </p>
              </div>
            )}
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900">Total Savings</p>
              <p className="text-gray-600">
                You saved <span className="font-bold text-green-600">
                  ${statistics.overview.totalDiscounts.toFixed(2)}
                </span> with discounts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
