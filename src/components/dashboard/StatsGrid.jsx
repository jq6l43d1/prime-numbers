import { StatCard } from './StatCard';
import { formatDate } from '../../utils/dateHelpers';
import { formatNumber } from '../../utils/currencyHelpers';

export function StatsGrid({ statistics }) {
  if (!statistics || !statistics.overview) {
    return null;
  }

  const { overview, returns } = statistics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Spent"
        value={overview.totalSpent}
        format="currency"
        icon="💰"
        subtitle={`${formatNumber(overview.totalOrders, 0)} orders`}
      />
      <StatCard
        title="Total Orders"
        value={overview.totalOrders}
        format="number"
        icon="📦"
        subtitle={`${formatNumber(overview.totalItems, 0)} items`}
      />
      <StatCard
        title="Average Order"
        value={overview.avgOrderValue}
        format="currency"
        icon="📊"
        subtitle={`${formatNumber(overview.avgItemsPerOrder, 1)} items/order`}
      />
      <StatCard
        title="Total Savings"
        value={overview.totalDiscounts}
        format="currency"
        icon="🎉"
        subtitle="From discounts"
      />
      <StatCard
        title="Return Rate"
        value={returns?.returnRate || 0}
        format="percentage"
        icon="↩️"
        subtitle={`${formatNumber(returns?.totalReturns || 0, 0)} returns`}
      />
      <StatCard
        title="Customer Since"
        value={overview.firstOrderDate ? formatDate(overview.firstOrderDate, 'MMM yyyy') : '-'}
        format="text"
        icon="📅"
        subtitle={
          overview.lastOrderDate
            ? `Last order: ${formatDate(overview.lastOrderDate, 'MMM d, yyyy')}`
            : ''
        }
      />
    </div>
  );
}
