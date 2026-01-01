export function HighlightCard({ icon, title, value, subtitle, gradient, delay = 0 }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 animate-fade-in-up`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl animate-float" style={{ animationDelay: `${delay + 0.2}s` }}>
            {icon}
          </span>
          <div className="bg-white bg-opacity-30 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-white text-xs font-semibold uppercase tracking-wide">
              {title}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold text-white drop-shadow-lg">{value}</div>
          {subtitle && <div className="text-sm text-white text-opacity-90">{subtitle}</div>}
        </div>
      </div>

      {/* Animated shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-500 shimmer" />
    </div>
  );
}
