export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-400 font-semibold text-lg">
              100% Private & Secure
            </p>
          </div>
          <p className="text-gray-400 text-sm mb-4 max-w-2xl mx-auto">
            All data is processed locally in your browser using client-side JavaScript.
            Nothing is uploaded to any server. Your purchase history stays completely private.
          </p>
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-500 text-sm">
              Prime Numbers - Built with React, Chart.js, and Tailwind CSS
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Not affiliated with Amazon.com, Inc. or its affiliates
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
