import { formatCurrency } from '../utils/currencyHelpers';

// Chart.js default configuration
export const CHART_COLORS = {
  primary: '#2563eb', // blue-600
  secondary: '#8b5cf6', // violet-600
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
  gray: '#6b7280', // gray-500
};

export const CHART_COLOR_PALETTE = [
  '#2563eb', // blue
  '#8b5cf6', // violet
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // purple
];

export const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold',
      },
      bodyFont: {
        size: 13,
      },
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatCurrency(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart',
  },
};

export const LINE_CHART_OPTIONS = {
  ...DEFAULT_CHART_OPTIONS,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
        callback: function (value) {
          return formatCurrency(value);
        },
      },
    },
  },
};

export const BAR_CHART_OPTIONS = {
  ...DEFAULT_CHART_OPTIONS,
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
  },
};

export const PIE_CHART_OPTIONS = {
  ...DEFAULT_CHART_OPTIONS,
  plugins: {
    ...DEFAULT_CHART_OPTIONS.plugins,
    tooltip: {
      ...DEFAULT_CHART_OPTIONS.plugins.tooltip,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${percentage}%`;
        },
      },
    },
  },
};
