import Papa from 'papaparse';

/**
 * Parses a CSV string into an array of objects
 * @param {string} csvContent - The CSV content to parse
 * @param {Object} options - Parse options
 * @returns {Promise<Object>} - Parsed data
 */
export function parseCSV(csvContent, options = {}) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      dynamicTyping: false, // We'll handle type conversion manually for better control
      skipEmptyLines: true,
      chunk: options.chunk, // Allow chunked processing for large files
      chunkSize: 1024 * 1024, // 1MB chunks
      transformHeader: (header) => {
        // Clean up header names (remove BOM, trim spaces)
        return header.replace(/^\uFEFF/, '').trim();
      },
      complete: (results) => {
        resolve({
          success: true,
          data: results.data,
          errors: results.errors,
          meta: results.meta
        });
      },
      error: (error) => {
        reject({
          success: false,
          error: error.message,
          data: []
        });
      },
      ...options
    });
  });
}

/**
 * Parses retail order history CSV
 * @param {string} csvContent - CSV content
 * @returns {Promise<Array>} - Array of order objects
 */
export async function parseRetailOrders(csvContent) {
  try {
    const result = await parseCSV(csvContent);

    if (!result.success) {
      throw new Error('Failed to parse retail orders CSV');
    }

    // Helper function to clean and parse numeric values
    const parseNumeric = (value) => {
      if (!value) return 0;
      // Remove quotes and other non-numeric characters except . and -
      const cleaned = value.toString().replace(/['"]/g, '').trim();
      return parseFloat(cleaned) || 0;
    };

    const orders = result.data.map(row => ({
      website: row['Website'] || '',
      orderId: row['Order ID'] || '',
      orderDate: row['Order Date'] ? new Date(row['Order Date']) : null,
      purchaseOrderNumber: row['Purchase Order Number'] || '',
      currency: row['Currency'] || 'USD',
      unitPrice: parseNumeric(row['Unit Price']),
      unitPriceTax: parseNumeric(row['Unit Price Tax']),
      shippingCharge: parseNumeric(row['Shipping Charge']),
      totalDiscounts: parseNumeric(row['Total Discounts']),
      totalOwed: parseNumeric(row['Total Owed']),
      shipmentItemSubtotal: parseNumeric(row['Shipment Item Subtotal']),
      shipmentItemSubtotalTax: parseNumeric(row['Shipment Item Subtotal Tax']),
      asin: row['ASIN'] || '',
      productCondition: row['Product Condition'] || '',
      quantity: parseInt(row['Quantity']) || 1,
      paymentInstrumentType: row['Payment Instrument Type'] || '',
      orderStatus: row['Order Status'] || '',
      shipmentStatus: row['Shipment Status'] || '',
      shipDate: row['Ship Date'] ? new Date(row['Ship Date']) : null,
      shippingOption: row['Shipping Option'] || '',
      shippingAddress: row['Shipping Address'] || '',
      billingAddress: row['Billing Address'] || '',
      carrierNameAndTrackingNumber: row['Carrier Name & Tracking Number'] || '',
      productName: row['Product Name'] || '',
      giftMessage: row['Gift Message'] || '',
      giftSenderName: row['Gift Sender Name'] || '',
      giftRecipientContactDetails: row['Gift Recipient Contact Details'] || '',
      isDigital: false
    }));

    return orders.filter(order => order.orderId); // Filter out empty rows
  } catch (error) {
    console.error('Error parsing retail orders:', error);
    throw error;
  }
}

/**
 * Parses digital items CSV
 * @param {string} csvContent - CSV content
 * @returns {Promise<Array>} - Array of digital item objects
 */
export async function parseDigitalItems(csvContent) {
  try {
    const result = await parseCSV(csvContent);

    if (!result.success) {
      throw new Error('Failed to parse digital items CSV');
    }

    // Helper function to clean and parse numeric values
    const parseNumeric = (value) => {
      if (!value) return 0;
      const cleaned = value.toString().replace(/['"]/g, '').trim();
      return parseFloat(cleaned) || 0;
    };

    const items = result.data.map(row => ({
      asin: row['ASIN'] || '',
      productName: row['ProductName'] || '',
      orderId: row['OrderId'] || '',
      orderDate: row['OrderDate'] ? new Date(row['OrderDate']) : null,
      quantity: parseInt(row['OriginalQuantity']) || 1,
      unitPrice: parseNumeric(row['OurPrice']),
      currency: row['OurPriceCurrencyCode'] || 'USD',
      unitPriceTax: parseNumeric(row['OurPriceTax']),
      marketplace: row['Marketplace'] || '',
      fulfilledDate: row['FulfilledDate'] ? new Date(row['FulfilledDate']) : null,
      isFulfilled: row['IsFulfilled'] === 'Yes',
      sellerOfRecord: row['SellerOfRecord'] || '',
      isGift: row['GiftItem'] === 'Yes',
      isEligibleForPrime: row['IsOrderEligibleForPrimeBenefit'] === 'Yes',
      isDigital: true,
      orderStatus: 'Closed', // Digital items are typically closed
      shipmentStatus: 'Delivered',
      shippingCharge: 0,
      totalDiscounts: 0,
      totalOwed: parseNumeric(row['OurPrice']),
      paymentInstrumentType: 'Digital Payment'
    }));

    return items.filter(item => item.orderId); // Filter out empty rows
  } catch (error) {
    console.error('Error parsing digital items:', error);
    throw error;
  }
}

/**
 * Parses return data CSV
 * @param {string} csvContent - CSV content
 * @returns {Promise<Array>} - Array of return objects
 */
export async function parseReturns(csvContent) {
  try {
    const result = await parseCSV(csvContent);

    if (!result.success) {
      throw new Error('Failed to parse returns CSV');
    }

    // Helper function to clean and parse numeric values
    const parseNumeric = (value) => {
      if (!value) return 0;
      const cleaned = value.toString().replace(/['"]/g, '').trim();
      return parseFloat(cleaned) || 0;
    };

    const returns = result.data.map(row => ({
      orderId: row['Order ID'] || row['order identifier'] || '',
      returnOrderId: row['Return Order ID'] || row['return order identifier'] || '',
      returnDate: row['Return Creation Date'] || row['return date'] || '',
      returnAmount: parseNumeric(row['Return Amount'] || row['refund amount']),
      returnReason: row['Return Reason'] || row['return reason'] || '',
      returnStatus: row['Return Status'] || row['return status'] || '',
      quantityReturned: parseInt(row['Quantity Returned']) || 1
    }));

    return returns.filter(ret => ret.orderId); // Filter out empty rows
  } catch (error) {
    console.error('Error parsing returns:', error);
    throw error;
  }
}
