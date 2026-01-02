import { useState } from 'react';
import { fetchHistoricalPrices } from '../../services/stockPriceAPI';

export function ApiKeyModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!apiKey || apiKey.trim().length === 0) {
      setTestError('Please enter an API key');
      return;
    }

    setTesting(true);
    setTestError('');
    setTestSuccess(false);

    try {
      // Test with a simple SPY request
      const result = await fetchHistoricalPrices('SPY', apiKey.trim());

      if (result.success) {
        setTestSuccess(true);
        setTestError('');
      } else {
        setTestError(result.error || 'Failed to validate API key');
      }
    } catch (error) {
      setTestError(`Failed to test API key: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!apiKey || apiKey.trim().length === 0) {
      setTestError('Please enter an API key');
      return;
    }

    if (!testSuccess) {
      setTestError('Please test the API key first');
      return;
    }

    onSave(apiKey.trim());
    setApiKey('');
    setTestSuccess(false);
    setTestError('');
    onClose();
  };

  const handleClose = () => {
    setApiKey('');
    setTestSuccess(false);
    setTestError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alpha Vantage API Key</h2>
              <p className="text-sm text-gray-600 mt-1">Required for opportunity cost analysis</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to get your free API key:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>
                Visit{' '}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600"
                >
                  Alpha Vantage
                </a>
              </li>
              <li>Enter your email and click "GET FREE API KEY"</li>
              <li>Copy the API key from your email</li>
              <li>Paste it below and click "Test & Save"</li>
            </ol>
          </div>

          {/* API Key Input */}
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setTestSuccess(false);
                setTestError('');
              }}
              placeholder="Enter your Alpha Vantage API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Test Result Messages */}
          {testError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{testError}</p>
            </div>
          )}

          {testSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✓ API key is valid!</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              🔒 <strong>Privacy:</strong> Your API key is stored locally in your browser only. It
              is never sent to our servers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !apiKey}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {testing ? 'Testing...' : 'Test API Key'}
            </button>
            <button
              onClick={handleSave}
              disabled={!testSuccess}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Rate Limit Info */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Free tier limits:</strong> 25 API calls per day. This app uses 3 calls
              (SPY, NVDA, BTC) and caches results for 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
