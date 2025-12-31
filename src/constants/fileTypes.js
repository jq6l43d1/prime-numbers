export const EXPECTED_FILES = {
  RETAIL_ORDERS: 'Retail.OrderHistory',
  DIGITAL_ITEMS: 'Digital Items',
  DIGITAL_ORDERS: 'Digital Orders',
  CUSTOMER_RETURNS: 'Retail.CustomerReturns',
  ORDERS_RETURNED: 'Retail.OrdersReturned'
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const ALLOWED_FILE_TYPES = [
  'application/zip',
  'application/x-zip-compressed'
];
