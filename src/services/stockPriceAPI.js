const CACHE_EXPIRATION_DAYS = 30;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff
const USE_BUNDLED_DATA = true; // Use pre-fetched data bundled with the app

/**
 * Determines if a symbol is a cryptocurrency
 */
function isCrypto(symbol) {
  return symbol === 'BTC';
}

/**
 * Loads stock price data from bundled JSON files
 * @param {string} symbol - Stock symbol (SPY, NVDA, BTC)
 * @returns {Promise<Object>} - Historical prices data
 */
async function loadBundledData(symbol) {
  try {
    const response = await fetch(`/data/${symbol.toLowerCase()}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load bundled data for ${symbol}`);
    }

    const data = await response.json();

    console.log(
      `📦 Loaded bundled ${symbol} data (${data.priceCount} days, fetched: ${new Date(data.fetchedAt).toLocaleDateString()})`
    );

    return { success: true, data: data.prices, bundled: true };
  } catch (error) {
    console.error(`Error loading bundled data for ${symbol}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches historical prices from Alpha Vantage API or bundled data
 * @param {string} symbol - Stock symbol (SPY, NVDA) or crypto (BTC)
 * @param {string} apiKey - Alpha Vantage API key (optional if using bundled data)
 * @returns {Promise<Object>} - Historical prices data
 */
export async function fetchHistoricalPrices(symbol, apiKey) {
  // Try cache first
  const cached = getStockPriceCache(symbol);
  if (cached && isCacheValid(symbol)) {
    console.log(`Using cached data for ${symbol}`);
    return { success: true, data: cached.prices, cached: true };
  }

  // If no API key provided, use bundled data
  if (!apiKey && USE_BUNDLED_DATA) {
    console.log(`No API key provided, loading bundled data for ${symbol}`);
    const bundledResult = await loadBundledData(symbol);

    if (bundledResult.success) {
      // Cache the bundled data
      setStockPriceCache(symbol, bundledResult.data);
    }

    return bundledResult;
  }

  // If we don't have an API key and bundled data loading failed, return error
  if (!apiKey) {
    return {
      success: false,
      error: 'No API key provided and bundled data unavailable',
    };
  }

  // Determine API endpoint based on symbol type
  const endpoint = isCrypto(symbol)
    ? `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&outputsize=full&apikey=${apiKey}`
    : `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

  // Fetch with retry logic
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(
        `Fetching ${symbol} data from Alpha Vantage (attempt ${attempt + 1}/${MAX_RETRIES})...`
      );

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }

      if (data['Note']) {
        // Rate limit hit
        return {
          success: false,
          error: 'API rate limit reached. Please try again later.',
          rateLimited: true,
        };
      }

      // Parse response based on symbol type
      const prices = isCrypto(symbol) ? parseCryptoData(data) : parseStockData(data);

      if (!prices || Object.keys(prices).length === 0) {
        throw new Error('No price data received from API');
      }

      // Cache the results
      setStockPriceCache(symbol, prices);

      return { success: true, data: prices, cached: false };
    } catch (error) {
      console.error(`Error fetching ${symbol} (attempt ${attempt + 1}):`, error);

      // If this is the last attempt, check for expired cache
      if (attempt === MAX_RETRIES - 1) {
        if (cached) {
          console.log(`Using expired cache for ${symbol} as fallback`);
          return { success: true, data: cached.prices, cached: true, expired: true };
        }
        return {
          success: false,
          error: `Failed to fetch ${symbol} data: ${error.message}`,
        };
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  return {
    success: false,
    error: `Failed to fetch ${symbol} data after ${MAX_RETRIES} attempts`,
  };
}

/**
 * Parses stock data from Alpha Vantage response
 * @param {Object} data - API response
 * @returns {Object} - Parsed prices { 'YYYY-MM-DD': { close, adjusted_close, volume } }
 */
function parseStockData(data) {
  const timeSeries = data['Time Series (Daily)'];

  if (!timeSeries) {
    console.error('No time series data found in response:', data);
    return null;
  }

  const prices = {};

  for (const [date, values] of Object.entries(timeSeries)) {
    prices[date] = {
      close: parseFloat(values['4. close']),
      adjusted_close: parseFloat(values['5. adjusted close']),
      volume: parseInt(values['6. volume']),
    };
  }

  return prices;
}

/**
 * Parses crypto data from Alpha Vantage response
 * @param {Object} data - API response
 * @returns {Object} - Parsed prices { 'YYYY-MM-DD': { close, volume } }
 */
function parseCryptoData(data) {
  const timeSeries = data['Time Series (Digital Currency Daily)'];

  if (!timeSeries) {
    console.error('No crypto time series data found in response:', data);
    return null;
  }

  const prices = {};

  for (const [date, values] of Object.entries(timeSeries)) {
    prices[date] = {
      close: parseFloat(values['4a. close (USD)']),
      adjusted_close: parseFloat(values['4a. close (USD)']), // Crypto doesn't have adjusted close, use close
      volume: parseFloat(values['5. volume']),
    };
  }

  return prices;
}

/**
 * Gets cached stock price data from localStorage
 * @param {string} symbol - Stock symbol
 * @returns {Object|null} - Cached data or null
 */
export function getStockPriceCache(symbol) {
  try {
    const cacheKey = `stock_prices_${symbol}_v1`;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error(`Error reading cache for ${symbol}:`, error);
    return null;
  }
}

/**
 * Saves stock price data to localStorage with expiration
 * @param {string} symbol - Stock symbol
 * @param {Object} prices - Price data to cache
 */
export function setStockPriceCache(symbol, prices) {
  try {
    const cacheKey = `stock_prices_${symbol}_v1`;
    const now = Date.now();
    const expiresAt = now + CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

    const cacheData = {
      symbol,
      timestamp: now,
      expiresAt,
      prices,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`Cached ${symbol} data (expires: ${new Date(expiresAt).toLocaleDateString()})`);
  } catch (error) {
    console.error(`Error caching ${symbol} data:`, error);
  }
}

/**
 * Checks if cached data is still valid
 * @param {string} symbol - Stock symbol
 * @param {number} maxAge - Optional max age in milliseconds (defaults to CACHE_EXPIRATION_DAYS)
 * @returns {boolean} - True if cache is valid
 */
export function isCacheValid(symbol, maxAge = null) {
  const cached = getStockPriceCache(symbol);

  if (!cached) {
    return false;
  }

  const now = Date.now();
  const age = maxAge || CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

  return now < cached.expiresAt && now - cached.timestamp < age;
}

/**
 * Clears all stock price caches
 */
export function clearAllCaches() {
  const symbols = ['SPY', 'NVDA', 'AMZN', 'BTC'];

  symbols.forEach(symbol => {
    try {
      const cacheKey = `stock_prices_${symbol}_v1`;
      localStorage.removeItem(cacheKey);
      console.log(`Cleared cache for ${symbol}`);
    } catch (error) {
      console.error(`Error clearing cache for ${symbol}:`, error);
    }
  });
}
