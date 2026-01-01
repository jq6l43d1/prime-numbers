import { useMemo } from 'react';
import { getMonth, getYear } from 'date-fns';

export function SpendingHeatmapComparison({ datasetStats }) {
  if (!datasetStats || datasetStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const heatmapData = useMemo(() => {
    return datasetStats.map((item, index) => {
      const monthlySpending = {};
      let maxSpending = 0;
      let minYear = Infinity;
      let maxYear = -Infinity;

      item.dataset.orders.forEach(order => {
        if (!order.orderDate) return;

        const date = new Date(order.orderDate);
        const year = getYear(date);
        const month = getMonth(date);

        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);

        const key = `${year}-${month}`;
        monthlySpending[key] = (monthlySpending[key] || 0) + (order.totalOwed || 0);
        maxSpending = Math.max(maxSpending, monthlySpending[key]);
      });

      const yearsToShow = Math.min(3, maxYear - minYear + 1);
      const startYear = maxYear - yearsToShow + 1;
      const years = [];

      for (let y = startYear; y <= maxYear; y++) {
        years.push(y);
      }

      return {
        name: item.dataset.name,
        monthlySpending,
        maxSpending,
        years,
        color: index === 0 ? 'blue' : index === 1 ? 'purple' : index === 2 ? 'green' : 'orange',
      };
    });
  }, [datasetStats]);

  const getColor = (amount, maxSpending, color) => {
    if (amount === 0) return 'bg-gray-100';
    const intensity = Math.min((amount / maxSpending) * 100, 100);

    const colorMap = {
      blue: ['bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'],
      purple: ['bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600'],
      green: ['bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600'],
      orange: ['bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600'],
    };

    const colors = colorMap[color] || colorMap.blue;

    if (intensity < 20) return colors[0];
    if (intensity < 40) return colors[1];
    if (intensity < 60) return colors[2];
    if (intensity < 80) return colors[3];
    return colors[4];
  };

  const getTextColor = (amount, maxSpending) => {
    if (amount === 0) return 'text-gray-400';
    const intensity = (amount / maxSpending) * 100;
    return intensity > 40 ? 'text-white' : 'text-gray-700';
  };

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <div className="space-y-8">
      {heatmapData.map((dataset, datasetIndex) => (
        <div key={datasetIndex} className="border-2 border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-4">{dataset.name}</h4>
          <div className="overflow-auto">
            <div className="min-w-max">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-16 text-xs font-medium text-gray-600"></div>
                {months.map(month => (
                  <div key={month} className="w-14 text-center text-xs font-medium text-gray-600">
                    {month}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="space-y-1">
                {dataset.years.map(year => (
                  <div key={year} className="flex items-center gap-2">
                    <div className="w-16 text-sm font-semibold text-gray-700">{year}</div>
                    <div className="flex gap-1">
                      {months.map((_, monthIndex) => {
                        const key = `${year}-${monthIndex}`;
                        const amount = dataset.monthlySpending[key] || 0;
                        const color = getColor(amount, dataset.maxSpending, dataset.color);
                        const textColor = getTextColor(amount, dataset.maxSpending);

                        return (
                          <div
                            key={monthIndex}
                            className={`w-14 h-14 flex items-center justify-center rounded-lg ${color} ${textColor} transition-all hover:scale-105 hover:shadow-lg cursor-pointer relative group`}
                            title={`${months[monthIndex]} ${year}: $${amount.toFixed(2)}`}
                          >
                            <span className="text-xs font-semibold">
                              ${amount > 999 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                            </span>
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
