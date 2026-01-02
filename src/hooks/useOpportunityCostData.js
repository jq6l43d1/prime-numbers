import { useState, useEffect, useMemo } from 'react';
import { fetchHistoricalPrices } from '../services/stockPriceAPI';
import {
  calculateDollarCostAveraging,
  generateComparisonDatasets,
} from '../utils/investmentCalculator';

const API_KEY_STORAGE_KEY = 'alphavantage_api_key';

/**
 * Custom hook for opportunity cost analysis
 * Fetches stock prices and calculates investment performance
 * @param {Array} orders - Array of order objects
 * @returns {Object} - { loading, error, data, apiKey, setApiKey, refetch }
 */
export function useOpportunityCostData(orders) {
  const [apiKey, setApiKeyState] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockPrices, setStockPrices] = useState({
    SPY: null,
    NVDA: null,
    BTC: null,
  });

  // Save API key to localStorage
  const setApiKey = key => {
    setApiKeyState(key);
    try {
      if (key) {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
      } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  // Fetch stock prices from API or cache
  const fetchAllPrices = async () => {
    if (!orders || orders.length === 0) {
      setError('No orders to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all three symbols in parallel
      const [spyResult, nvdaResult, btcResult] = await Promise.all([
        fetchHistoricalPrices('SPY', apiKey),
        fetchHistoricalPrices('NVDA', apiKey),
        fetchHistoricalPrices('BTC', apiKey),
      ]);

      // Check for errors
      const errors = [];
      if (!spyResult.success) errors.push(`SPY: ${spyResult.error}`);
      if (!nvdaResult.success) errors.push(`NVDA: ${nvdaResult.error}`);
      if (!btcResult.success) errors.push(`BTC: ${btcResult.error}`);

      if (errors.length > 0) {
        setError(errors.join('; '));
        setLoading(false);
        return;
      }

      // Update state with fetched prices
      setStockPrices({
        SPY: spyResult.data,
        NVDA: nvdaResult.data,
        BTC: btcResult.data,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      setError(`Failed to fetch stock prices: ${error.message}`);
      setLoading(false);
    }
  };

  // Auto-fetch when component mounts or when orders/API key changes
  useEffect(() => {
    if (orders && orders.length > 0) {
      fetchAllPrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, orders?.length]); // Run when apiKey or number of orders changes

  // Calculate investment performance using useMemo to avoid recalculation on every render
  const data = useMemo(() => {
    if (!stockPrices.SPY || !stockPrices.NVDA || !stockPrices.BTC) {
      return null;
    }

    if (!orders || orders.length === 0) {
      return null;
    }

    // Calculate DCA for each investment
    const sp500Data = calculateDollarCostAveraging(orders, stockPrices.SPY, 'SPY');
    const nvidiaData = calculateDollarCostAveraging(orders, stockPrices.NVDA, 'NVDA');
    const bitcoinData = calculateDollarCostAveraging(orders, stockPrices.BTC, 'BTC');

    // Generate chart datasets
    const chartData = generateComparisonDatasets(orders, sp500Data, nvidiaData, bitcoinData);

    // Calculate total Amazon spending for comparison
    const totalSpending = orders.reduce((sum, order) => sum + (order.totalOwed || 0), 0);

    return {
      sp500: sp500Data,
      nvidia: nvidiaData,
      bitcoin: bitcoinData,
      chartData,
      totalSpending,
    };
  }, [stockPrices, orders]);

  return {
    loading,
    error,
    data,
    apiKey,
    setApiKey,
    refetch: fetchAllPrices,
  };
}
