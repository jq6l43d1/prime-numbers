import { LoadingSpinner } from '../common/LoadingSpinner';

export function UploadProgress({ progress }) {
  const { step, progress: percentage, message } = progress;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <LoadingSpinner size="lg" />
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{message}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <p className="text-center text-sm text-gray-500">
          Processing your Amazon order data...
        </p>
      </div>
    </div>
  );
}
