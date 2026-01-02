# Stock Price Data Fetching

This directory contains a script to fetch historical stock price data from Alpha Vantage API.

## Prerequisites

1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Node.js installed

## Usage

Run the script from the project root:

```bash
node scripts/fetchStockPrices.js YOUR_API_KEY
```

## What it does

The script fetches historical daily prices for:

- **SPY**: S&P 500 ETF (full history since 1993)
- **NVDA**: Nvidia stock (full history since 1999)
- **BTC**: Bitcoin (full history since July 2010)

Data is saved to `public/data/` directory:

- `public/data/spy.json`
- `public/data/nvda.json`
- `public/data/btc.json`

## Rate Limits

- Alpha Vantage free tier: 25 API calls per day
- The script uses 3 calls (one per symbol)
- Waits 12 seconds between requests to avoid rate limiting

## Data Format

Each JSON file contains:

```json
{
  "symbol": "SPY",
  "fetchedAt": "2026-01-02T12:00:00.000Z",
  "priceCount": 8500,
  "prices": {
    "2026-01-02": {
      "close": 500.00,
      "adjusted_close": 500.00,
      "volume": 50000000
    },
    ...
  }
}
```

## Notes

- **Adjusted close** prices account for stock splits and dividends
- Bitcoin data is 24/7 (no weekend gaps)
- Stock data only includes trading days (no weekends/holidays)
- Data files are approximately 500-800 KB each
