export function ClickableStatCard({
  icon,
  label,
  value,
  subtitle,
  onClick,
  gradient = 'from-blue-500 to-blue-600',
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl">{icon}</span>
        <div className="text-right">
          <p className="text-white text-opacity-90 text-sm font-medium mb-1">{label}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-white text-opacity-75 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <p className="text-white text-opacity-90 text-sm font-medium flex items-center justify-end">
          Click to explore
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </div>
    </div>
  );
}
