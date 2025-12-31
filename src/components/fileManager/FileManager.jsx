import { useData } from '../../context/DataContext';

export function FileManager() {
  const {
    datasets,
    activeDatasetId,
    viewMode,
    setViewMode,
    switchDataset,
    removeDataset
  } = useData();

  if (datasets.length === 0) return null;

  const handleRemove = (datasetId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this file?')) {
      removeDataset(datasetId);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          📁 Uploaded Files ({datasets.length})
        </h3>

        {datasets.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'single'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single View
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'compare'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => setViewMode('combined')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'combined'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Combined
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            onClick={() => viewMode === 'single' && switchDataset(dataset.id)}
            className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
              activeDatasetId === dataset.id && viewMode === 'single'
                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
            }`}
          >
            <button
              onClick={(e) => handleRemove(dataset.id, e)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Remove file"
            >
              ×
            </button>

            <div className="pr-8">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">📦</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {dataset.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(dataset.uploadDate)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders:</span>
                  <span className="font-medium text-gray-900">
                    {dataset.summary?.totalOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(dataset.summary?.totalSpent || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium text-gray-900">
                    {dataset.summary?.totalItems || 0}
                  </span>
                </div>
              </div>
            </div>

            {activeDatasetId === dataset.id && viewMode === 'single' && (
              <div className="absolute bottom-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                  Active
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewMode === 'compare' && datasets.length > 1 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Compare Mode:</strong> View side-by-side statistics and charts for all uploaded files to identify trends and differences.
          </p>
        </div>
      )}

      {viewMode === 'combined' && datasets.length > 1 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            💡 <strong>Combined Mode:</strong> All data is merged together to show your complete purchasing history across all files.
          </p>
        </div>
      )}
    </div>
  );
}
