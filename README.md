# Amazon Order Analyzer 📊

A privacy-focused web application that analyzes your Amazon order history to provide detailed insights into your spending habits, purchase patterns, and order statistics. **All data processing happens entirely in your browser** - no data is ever uploaded to any server.

![Privacy Badge](https://img.shields.io/badge/Privacy-100%25%20Client--Side-green)

## Features

✨ **Comprehensive Statistics**

- Total spending, order counts, and averages
- Return rates and refund amounts
- Shipping costs analysis
- Payment method breakdown

📊 **Beautiful Visualizations**

- Spending over time (line chart)
- Category breakdown (doughnut chart)
- Orders by month (bar chart)
- Interactive Chart.js charts

🔒 **100% Private & Secure**

- All processing happens client-side in your browser
- Zero data transmission to any server
- No tracking, no cookies, no analytics
- Open source for transparency

🎨 **Modern UI**

- Clean, responsive design built with Tailwind CSS
- Works on desktop, tablet, and mobile
- Drag-and-drop file upload
- Real-time processing progress

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Fetch Stock Price Data (One-time setup)

The opportunity cost analysis feature requires historical stock price data. Fetch it once:

```bash
node scripts/fetchStockPrices.js YOUR_ALPHA_VANTAGE_API_KEY
```

**Get a free API key:** https://www.alphavantage.co/support/#api-key

This downloads historical prices for S&P 500, Nvidia, and Bitcoin (~2.5 MB total).

**Note:** This is a one-time setup. The data is cached in `public/data/` and only needs updating occasionally.

### 3. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173/`

### 4. Request Your Amazon Data

1. Go to [Amazon.com](https://www.amazon.com) and sign in
2. Navigate to **Account & Lists** → **Privacy & Settings** → **Request My Data**
3. Select **"Your Orders"** data
4. Submit the request
5. Wait for an email from Amazon (usually 24-48 hours)
6. Download the **"Your Orders.zip"** file

### 5. Analyze Your Data

1. Open the application in your browser
2. Drag and drop your **"Your Orders.zip"** file onto the upload zone
3. Wait while the app processes your data (a few seconds)
4. Explore your Amazon order analytics!

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **JSZip** - ZIP file extraction (client-side)
- **PapaParse** - CSV parsing
- **date-fns** - Date manipulation
- **react-dropzone** - File upload

## Privacy & Security

### How We Protect Your Privacy

1. **No Backend** - This is a 100% client-side application
2. **No Network Requests** - No data leaves your browser
3. **No Storage** - Data is not saved anywhere
4. **No Tracking** - No analytics or third-party services
5. **Open Source** - All code is auditable

### What Happens to Your Data?

1. You select a file on your computer
2. JavaScript in your browser reads the file
3. The browser parses the CSV data
4. Statistics are calculated in memory
5. Charts are rendered
6. **Data is discarded when you close the tab**

## Build for Production

```bash
# Build
npm run build

# Preview
npm run preview
```

Deploy the `dist/` folder to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

## Browser Support

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Opera (v76+)

## License

MIT License

## Disclaimer

This application is not affiliated with Amazon.com, Inc. Amazon is a trademark of Amazon.com, Inc.

This tool is provided "as is" without warranty. Use at your own risk.

---

**Built with ❤️ using React, Chart.js, and Tailwind CSS**

**Remember: Your data never leaves your browser!** 🔒
