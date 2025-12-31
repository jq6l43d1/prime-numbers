import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { getMonth, getYear } from 'date-fns';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export function SeasonalSpendingChart({ orders }) {
  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Define seasons
  const getSeason = (month) => {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  };

  // Get unique years
  const years = new Set();
  orders.forEach(order => {
    if (order.orderDate) {
      years.add(getYear(new Date(order.orderDate)));
    }
  });

  const sortedYears = Array.from(years).sort((a, b) => b - a).slice(0, 3);

  // Group by year and season
  const yearSeasonData = {};

  orders.forEach(order => {
    if (!order.orderDate) return;

    const date = new Date(order.orderDate);
    const year = getYear(date);
    const month = getMonth(date);
    const season = getSeason(month);

    if (!sortedYears.includes(year)) return;

    if (!yearSeasonData[year]) {
      yearSeasonData[year] = {
        Spring: 0,
        Summer: 0,
        Fall: 0,
        Winter: 0
      };
    }

    yearSeasonData[year][season] += order.totalOwed || 0;
  });

  // Colors for years
  const colors = [
    {
      bg: 'rgba(59, 130, 246, 0.3)',
      border: 'rgba(59, 130, 246, 1)',
      point: 'rgba(59, 130, 246, 1)'
    },
    {
      bg: 'rgba(16, 185, 129, 0.3)',
      border: 'rgba(16, 185, 129, 1)',
      point: 'rgba(16, 185, 129, 1)'
    },
    {
      bg: 'rgba(251, 146, 60, 0.3)',
      border: 'rgba(251, 146, 60, 1)',
      point: 'rgba(251, 146, 60, 1)'
    }
  ];

  const datasets = sortedYears.reverse().map((year, index) => {
    const color = colors[index % colors.length];
    const seasonData = yearSeasonData[year] || { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };

    return {
      label: year.toString(),
      data: [
        seasonData.Spring,
        seasonData.Summer,
        seasonData.Fall,
        seasonData.Winter
      ],
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 3,
      pointBackgroundColor: color.point,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: color.border,
      pointRadius: 5,
      pointHoverRadius: 7
    };
  });

  const data = {
    labels: ['Spring', 'Summer', 'Fall', 'Winter'],
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 13, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${parseFloat(context.parsed.r).toFixed(2)}`;
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
          font: { size: 10 },
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: { size: 13, weight: 'bold' },
          color: '#374151'
        }
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Radar data={data} options={options} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Compare your spending patterns across seasons and years
        </p>
      </div>
    </div>
  );
}
