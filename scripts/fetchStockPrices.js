#!/usr/bin/env node

/* global process */

/**
 * Script to fetch historical stock prices from Alpha Vantage
 * Run with: node scripts/fetchStockPrices.js YOUR_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.argv[2];

if (!API_KEY) {
  console.error('❌ Error: API key required');
  console.error('Usage: node scripts/fetchStockPrices.js YOUR_API_KEY');
  console.error('\nGet a free API key from: https://www.alphavantage.co/support/#api-key');
  process.exit(1);
}

const SYMBOLS = {
  SPY: 'TIME_SERIES_DAILY_ADJUSTED',
  NVDA: 'TIME_SERIES_DAILY_ADJUSTED',
  BTC: 'DIGITAL_CURRENCY_DAILY',
};

const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchStockData(symbol, apiKey) {
  const isCrypto = symbol === 'BTC';
  const endpoint = isCrypto
    ? `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&outputsize=full&apikey=${apiKey}`
    : `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${apiKey}`;

  console.log(`\n📊 Fetching ${symbol} data...`);

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
    throw new Error('API rate limit reached. Please try again later.');
  }

  // Parse response based on symbol type
  const prices = isCrypto ? parseCryptoData(data) : parseStockData(data);

  if (!prices || Object.keys(prices).length === 0) {
    throw new Error('No price data received from API');
  }

  console.log(`✅ Fetched ${Object.keys(prices).length} days of ${symbol} data`);

  return prices;
}

function parseStockData(data) {
  const timeSeries = data['Time Series (Daily)'];

  if (!timeSeries) {
    console.error('Response:', JSON.stringify(data, null, 2));
    throw new Error('No time series data found in response');
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

function parseCryptoData(data) {
  const timeSeries = data['Time Series (Digital Currency Daily)'];

  if (!timeSeries) {
    console.error('Response:', JSON.stringify(data, null, 2));
    throw new Error('No crypto time series data found in response');
  }

  const prices = {};

  for (const [date, values] of Object.entries(timeSeries)) {
    prices[date] = {
      close: parseFloat(values['4a. close (USD)']),
      adjusted_close: parseFloat(values['4a. close (USD)']),
      volume: parseFloat(values['5. volume']),
    };
  }

  return prices;
}

function saveData(symbol, prices) {
  const filename = path.join(OUTPUT_DIR, `${symbol.toLowerCase()}.json`);

  const data = {
    symbol,
    fetchedAt: new Date().toISOString(),
    priceCount: Object.keys(prices).length,
    prices,
  };

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`💾 Saved to ${filename}`);
}

async function main() {
  console.log('🚀 Starting stock price data fetch...');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  for (const symbol of Object.keys(SYMBOLS)) {
    try {
      const prices = await fetchStockData(symbol, API_KEY);
      saveData(symbol, prices);

      // Wait 12 seconds between requests to respect API rate limits (5 calls/minute)
      if (symbol !== 'BTC') {
        console.log('⏳ Waiting 12 seconds before next request...');
        await sleep(12000);
      }
    } catch (error) {
      console.error(`❌ Error fetching ${symbol}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✨ All stock price data fetched successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`- Files saved to: ${OUTPUT_DIR}`);
  console.log(`- Total symbols: ${Object.keys(SYMBOLS).length}`);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
