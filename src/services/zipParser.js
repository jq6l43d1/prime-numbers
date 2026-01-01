import JSZip from 'jszip';

/**
 * Extracts files from a ZIP archive
 * @param {File} file - The ZIP file to extract
 * @returns {Promise<Object>} - Object containing extracted files
 */
export async function extractZipFile(file) {
  try {
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(file);

    const files = {};
    const filePromises = [];

    // Iterate through all files in the zip
    zipContents.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        // Check if it's a CSV file
        if (relativePath.toLowerCase().endsWith('.csv')) {
          const promise = zipEntry.async('string').then(content => {
            files[relativePath] = {
              name: relativePath,
              content,
              type: 'csv',
            };
          });
          filePromises.push(promise);
        }
        // Check if it's an image file (for Photo on Delivery)
        else if (relativePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
          const promise = zipEntry.async('base64').then(content => {
            files[relativePath] = {
              name: relativePath,
              content,
              type: 'image',
            };
          });
          filePromises.push(promise);
        }
      }
    });

    // Wait for all files to be extracted
    await Promise.all(filePromises);

    return {
      success: true,
      files,
      fileCount: Object.keys(files).length,
    };
  } catch (error) {
    console.error('Error extracting ZIP file:', error);
    return {
      success: false,
      error: error.message,
      files: {},
    };
  }
}

/**
 * Identifies and categorizes CSV files from the extracted files
 * @param {Object} files - Extracted files object
 * @returns {Object} - Categorized files
 */
export function categorizeFiles(files) {
  const categorized = {
    retailOrders: null,
    digitalItems: null,
    digitalOrders: null,
    digitalOrdersMonetary: null,
    digitalReturns: [],
    customerReturns: [],
    ordersReturned: [],
    cartItems: [],
    rentalContracts: [],
    rentalEvents: [],
    rentalItems: [],
    concessions: [],
    photos: [],
    other: [],
  };

  Object.keys(files).forEach(filePath => {
    const fileName = filePath.toLowerCase();
    const file = files[filePath];

    if (file.type === 'image') {
      categorized.photos.push(file);
    } else if (fileName.includes('retail.orderhistory')) {
      categorized.retailOrders = file;
    } else if (fileName.includes('digital items')) {
      categorized.digitalItems = file;
    } else if (fileName.includes('digital orders monetary')) {
      categorized.digitalOrdersMonetary = file;
    } else if (fileName.includes('digital orders') && !fileName.includes('monetary')) {
      categorized.digitalOrders = file;
    } else if (fileName.includes('digital.orders.returns')) {
      categorized.digitalReturns.push(file);
    } else if (fileName.includes('retail.customerreturns')) {
      categorized.customerReturns.push(file);
    } else if (fileName.includes('retail.ordersreturned')) {
      categorized.ordersReturned.push(file);
    } else if (fileName.includes('retail.cartitems')) {
      categorized.cartItems.push(file);
    } else if (fileName.includes('rental_contracts')) {
      categorized.rentalContracts.push(file);
    } else if (fileName.includes('rental_events')) {
      categorized.rentalEvents.push(file);
    } else if (fileName.includes('rental_items')) {
      categorized.rentalItems.push(file);
    } else if (fileName.includes('concessions')) {
      categorized.concessions.push(file);
    } else {
      categorized.other.push(file);
    }
  });

  return categorized;
}

/**
 * Validates that the ZIP file contains expected Amazon order data
 * @param {Object} categorizedFiles - Categorized files object
 * @returns {Object} - Validation result
 */
export function validateAmazonData(categorizedFiles) {
  const hasRetailOrders = categorizedFiles.retailOrders !== null;
  const hasDigitalItems = categorizedFiles.digitalItems !== null;

  if (!hasRetailOrders && !hasDigitalItems) {
    return {
      valid: false,
      message: 'No Amazon order data found. Please upload the "Your Orders.zip" file from Amazon.',
    };
  }

  return {
    valid: true,
    message: 'Valid Amazon order data detected.',
    hasRetailOrders,
    hasDigitalItems,
  };
}
