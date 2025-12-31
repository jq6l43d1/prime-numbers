import { extractZipFile, categorizeFiles, validateAmazonData } from './zipParser';
import { parseRetailOrders, parseDigitalItems, parseReturns } from './csvParser';
import { categorizeProducts } from '../utils/categoryMapper';
import { getYearMonth } from '../utils/dateHelpers';

/**
 * Main data processing pipeline
 * @param {File} zipFile - The ZIP file to process
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} - Processed data
 */
export async function processAmazonData(zipFile, onProgress = () => {}) {
  try {
    // Step 1: Extract ZIP file
    onProgress({ step: 'extracting', progress: 10, message: 'Extracting ZIP file...' });
    const extractResult = await extractZipFile(zipFile);

    if (!extractResult.success) {
      throw new Error(extractResult.error);
    }

    onProgress({ step: 'categorizing', progress: 20, message: 'Categorizing files...' });
    const categorizedFiles = categorizeFiles(extractResult.files);

    // Step 2: Validate data
    const validation = validateAmazonData(categorizedFiles);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const allOrders = [];
    const returns = [];

    // Step 3: Parse retail orders
    if (categorizedFiles.retailOrders) {
      onProgress({ step: 'parsing-retail', progress: 30, message: 'Parsing retail orders...' });
      try {
        // Add a small delay to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 50));
        const retailOrders = await parseRetailOrders(categorizedFiles.retailOrders.content);
        allOrders.push(...retailOrders);
      } catch (error) {
        console.error('Error parsing retail orders:', error);
        // Continue processing even if retail orders fail
      }
    }

    // Step 4: Parse digital items
    if (categorizedFiles.digitalItems) {
      onProgress({ step: 'parsing-digital', progress: 50, message: 'Parsing digital orders...' });
      try {
        const digitalOrders = await parseDigitalItems(categorizedFiles.digitalItems.content);
        allOrders.push(...digitalOrders);
      } catch (error) {
        console.error('Error parsing digital items:', error);
        // Continue processing even if digital items fail
      }
    }

    // Step 5: Parse returns
    onProgress({ step: 'parsing-returns', progress: 60, message: 'Parsing return data...' });
    try {
      const returnFiles = [
        ...categorizedFiles.customerReturns,
        ...categorizedFiles.ordersReturned
      ];

      for (const returnFile of returnFiles) {
        const parsedReturns = await parseReturns(returnFile.content);
        returns.push(...parsedReturns);
      }
    } catch (error) {
      console.error('Error parsing returns:', error);
      // Continue processing even if returns fail
    }

    // Step 6: Normalize and enrich data
    onProgress({ step: 'normalizing', progress: 70, message: 'Normalizing data...' });
    const normalizedOrders = normalizeOrders(allOrders);

    // Step 7: Categorize products
    onProgress({ step: 'categorizing-products', progress: 80, message: 'Categorizing products...' });
    const categorizedOrders = categorizeProducts(normalizedOrders);

    // Step 8: Link returns to orders
    onProgress({ step: 'linking-returns', progress: 90, message: 'Linking returns...' });
    const ordersWithReturns = linkReturnsToOrders(categorizedOrders, returns);

    // Step 9: Sort by date (most recent first)
    const sortedOrders = ordersWithReturns.sort((a, b) => {
      if (!a.orderDate) return 1;
      if (!b.orderDate) return -1;
      return b.orderDate - a.orderDate;
    });

    onProgress({ step: 'complete', progress: 100, message: 'Processing complete!' });

    return {
      success: true,
      orders: sortedOrders,
      returns,
      photos: categorizedFiles.photos,
      summary: {
        totalOrders: sortedOrders.length,
        retailOrders: sortedOrders.filter(o => !o.isDigital).length,
        digitalOrders: sortedOrders.filter(o => o.isDigital).length,
        totalReturns: returns.length,
        totalPhotos: categorizedFiles.photos.length
      }
    };
  } catch (error) {
    console.error('Error processing Amazon data:', error);
    return {
      success: false,
      error: error.message,
      orders: [],
      returns: [],
      photos: []
    };
  }
}

/**
 * Normalizes order data to a consistent format
 * @param {Array} orders - Raw orders
 * @returns {Array} - Normalized orders
 */
function normalizeOrders(orders) {
  return orders.map(order => {
    const yearMonth = getYearMonth(order.orderDate);

    return {
      ...order,
      // Ensure numeric fields are numbers
      unitPrice: parseFloat(order.unitPrice) || 0,
      quantity: parseInt(order.quantity) || 1,
      totalOwed: parseFloat(order.totalOwed) || 0,
      shippingCharge: parseFloat(order.shippingCharge) || 0,
      totalDiscounts: Math.abs(parseFloat(order.totalDiscounts) || 0),
      unitPriceTax: parseFloat(order.unitPriceTax) || 0,

      // Add derived fields
      year: yearMonth.year,
      month: yearMonth.month,
      monthName: yearMonth.monthName,

      // Payment method simplified
      paymentMethod: simplifyPaymentMethod(order.paymentInstrumentType || order.paymentMethod),

      // Status normalized
      orderStatus: order.orderStatus || 'Unknown',
      shipmentStatus: order.shipmentStatus || 'Unknown',

      // Initialize return flag
      hasReturn: false,
      returnInfo: null
    };
  });
}

/**
 * Simplifies payment method names
 * @param {string} paymentMethod - Raw payment method
 * @returns {string} - Simplified payment method
 */
function simplifyPaymentMethod(paymentMethod) {
  if (!paymentMethod) return 'Unknown';

  const lower = paymentMethod.toLowerCase();

  if (lower.includes('visa')) return 'Visa';
  if (lower.includes('mastercard')) return 'Mastercard';
  if (lower.includes('amex') || lower.includes('american express')) return 'American Express';
  if (lower.includes('discover')) return 'Discover';
  if (lower.includes('gift')) return 'Gift Card';
  if (lower.includes('digital')) return 'Digital Payment';

  return 'Other';
}

/**
 * Links returns to their original orders
 * @param {Array} orders - Orders
 * @param {Array} returns - Returns
 * @returns {Array} - Orders with return information
 */
function linkReturnsToOrders(orders, returns) {
  // Create a map of order IDs to returns
  const returnsMap = {};
  returns.forEach(ret => {
    if (ret.orderId) {
      if (!returnsMap[ret.orderId]) {
        returnsMap[ret.orderId] = [];
      }
      returnsMap[ret.orderId].push(ret);
    }
  });

  // Link returns to orders
  return orders.map(order => {
    const orderReturns = returnsMap[order.orderId];
    if (orderReturns && orderReturns.length > 0) {
      return {
        ...order,
        hasReturn: true,
        returnInfo: orderReturns
      };
    }
    return order;
  });
}

/**
 * Filters orders by various criteria
 * @param {Array} orders - Orders to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered orders
 */
export function filterOrders(orders, filters = {}) {
  let filtered = [...orders];

  // Filter by date range
  if (filters.startDate) {
    filtered = filtered.filter(order =>
      order.orderDate && order.orderDate >= filters.startDate
    );
  }

  if (filters.endDate) {
    filtered = filtered.filter(order =>
      order.orderDate && order.orderDate <= filters.endDate
    );
  }

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(order => order.category === filters.category);
  }

  // Filter by order status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(order => order.orderStatus === filters.status);
  }

  // Filter by digital/retail
  if (filters.type === 'digital') {
    filtered = filtered.filter(order => order.isDigital);
  } else if (filters.type === 'retail') {
    filtered = filtered.filter(order => !order.isDigital);
  }

  // Search by product name
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(order =>
      order.productName && order.productName.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}
