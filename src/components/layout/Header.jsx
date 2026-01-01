export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <span className="text-4xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Prime Numbers</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Discover insights from your Amazon purchase history
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center text-sm animate-fade-in-up">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white bg-opacity-20 backdrop-blur-sm text-white font-medium shadow-lg hover:bg-opacity-30 transition-all">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              100% Private & Secure
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
