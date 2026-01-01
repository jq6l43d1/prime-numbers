import { Card } from '../common/Card';
import { formatCurrency, formatNumber } from '../../utils/currencyHelpers';

export function StatCard({ title, value, subtitle, icon, trend, format = 'number' }) {
  const formattedValue = () => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return `${formatNumber(value, 1)}%`;
      case 'text':
        return value;
      case 'number':
      default:
        return formatNumber(value);
    }
  };

  return (
    <div className="card bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-blue-50 transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 animate-fade-in-up">{formattedValue()}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-4xl opacity-50 hover:opacity-100 transition-opacity duration-300 hover:scale-110 transform">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div
          className={`mt-2 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {trend > 0 ? '↑' : '↓'} {formatNumber(Math.abs(trend), 1)}%
        </div>
      )}
    </div>
  );
}
