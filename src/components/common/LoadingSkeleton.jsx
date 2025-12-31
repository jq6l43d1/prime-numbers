export function SkeletonCard() {
  return (
    <div className="card bg-white shadow-lg animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-32 bg-gray-100 rounded"></div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
      </div>
      <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonChart({ height = 'h-80' }) {
  return (
    <div className={`${height} bg-gray-100 rounded-lg animate-pulse relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer"></div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
      </div>

      {/* Skeleton for date filters */}
      <div className="card bg-white shadow-lg mb-6 animate-pulse">
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
          ))}
        </div>
      </div>

      {/* Skeleton for stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Skeleton for charts */}
      <div className="space-y-8">
        {/* Full width chart */}
        <div className="card bg-white shadow-lg">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <SkeletonChart />
        </div>

        {/* Two column charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card bg-white shadow-lg">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <SkeletonChart />
          </div>
          <div className="card bg-white shadow-lg">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <SkeletonChart />
          </div>
        </div>

        {/* Three column charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card bg-white shadow-lg">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <SkeletonChart />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
