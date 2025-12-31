import { useMemo, memo } from 'react';
import { format, getMonth, getYear } from 'date-fns';

export const SpendingHeatmapChart = memo(function SpendingHeatmapChart({ orders }) {
  const heatmapData = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    // Group by year and month
    const monthlySpending = {};
    let maxSpending = 0;
    let minYear = Infinity;
    let maxYear = -Infinity;

    orders.forEach(order => {
      if (!order.orderDate) return;

      const date = new Date(order.orderDate);
      const year = getYear(date);
      const month = getMonth(date); // 0-11

      minYear = Math.min(minYear, year);
      maxYear = Math.max(maxYear, year);

      const key = `${year}-${month}`;
      monthlySpending[key] = (monthlySpending[key] || 0) + (order.totalOwed || 0);
      maxSpending = Math.max(maxSpending, monthlySpending[key]);
    });

    // Create matrix for recent years (max 5 years)
    const yearsToShow = Math.min(5, maxYear - minYear + 1);
    const startYear = maxYear - yearsToShow + 1;
    const years = [];

    for (let y = startYear; y <= maxYear; y++) {
      years.push(y);
    }

    return { monthlySpending, maxSpending, years };
  }, [orders]);

  if (!heatmapData || heatmapData.years.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const { monthlySpending, maxSpending, years } = heatmapData;

  // Color intensity function
  const getColor = (amount) => {
    if (amount === 0) return 'bg-gray-100';
    const intensity = Math.min((amount / maxSpending) * 100, 100);

    if (intensity < 20) return 'bg-blue-200';
    if (intensity < 40) return 'bg-blue-300';
    if (intensity < 60) return 'bg-blue-400';
    if (intensity < 80) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  const getTextColor = (amount) => {
    if (amount === 0) return 'text-gray-400';
    const intensity = (amount / maxSpending) * 100;
    return intensity > 40 ? 'text-white' : 'text-gray-700';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="h-full w-full overflow-auto">
      <div className="min-w-max">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-16 text-xs font-medium text-gray-600"></div>
          {months.map(month => (
            <div key={month} className="w-16 text-center text-xs font-medium text-gray-600">
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-1">
          {years.map(year => (
            <div key={year} className="flex items-center gap-2">
              <div className="w-16 text-sm font-semibold text-gray-700">
                {year}
              </div>
              <div className="flex gap-1">
                {months.map((_, monthIndex) => {
                  const key = `${year}-${monthIndex}`;
                  const amount = monthlySpending[key] || 0;
                  const color = getColor(amount);
                  const textColor = getTextColor(amount);

                  return (
                    <div
                      key={monthIndex}
                      className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg ${color} ${textColor} transition-all hover:scale-105 hover:shadow-lg cursor-pointer relative group`}
                      title={`${months[monthIndex]} ${year}: $${amount.toFixed(2)}`}
                    >
                      <span className="text-xs font-semibold">
                        ${amount > 999 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                      </span>
                      {/* Tooltip on hover */}
                      <div className="absolute top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        ${amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Spending intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-12 h-6 bg-gray-100 rounded"></div>
            <span className="text-xs text-gray-500 mr-2">$0</span>
            <div className="w-12 h-6 bg-blue-200 rounded"></div>
            <div className="w-12 h-6 bg-blue-300 rounded"></div>
            <div className="w-12 h-6 bg-blue-400 rounded"></div>
            <div className="w-12 h-6 bg-blue-500 rounded"></div>
            <div className="w-12 h-6 bg-blue-600 rounded"></div>
            <span className="text-xs text-gray-500 ml-2">
              ${maxSpending > 999 ? `${(maxSpending / 1000).toFixed(1)}k+` : `${maxSpending.toFixed(0)}+`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
