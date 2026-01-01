import { PRODUCT_CATEGORIES, DEFAULT_CATEGORY } from '../constants/categories';

/**
 * Categorizes a product based on its name
 * @param {string} productName - The product name
 * @returns {string} - The category name
 */
export function categorizeProduct(productName) {
  if (!productName) {
    return DEFAULT_CATEGORY;
  }

  const lowerName = productName.toLowerCase();

  // Check each category's keywords
  for (const category of PRODUCT_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return category.name;
      }
    }
  }

  return DEFAULT_CATEGORY;
}

/**
 * Categorizes multiple products
 * @param {Array} products - Array of products with productName property
 * @returns {Array} - Products with category added
 */
export function categorizeProducts(products) {
  return products.map(product => ({
    ...product,
    category: categorizeProduct(product.productName),
  }));
}

/**
 * Gets category distribution from orders
 * @param {Array} orders - Array of orders with category
 * @returns {Object} - Category distribution { categoryName: count }
 */
export function getCategoryDistribution(orders) {
  const distribution = {};

  orders.forEach(order => {
    const category = order.category || DEFAULT_CATEGORY;
    distribution[category] = (distribution[category] || 0) + 1;
  });

  return distribution;
}

/**
 * Gets spending by category
 * @param {Array} orders - Array of orders with category and totalOwed
 * @returns {Object} - Spending by category { categoryName: amount }
 */
export function getSpendingByCategory(orders) {
  const spending = {};

  orders.forEach(order => {
    const category = order.category || DEFAULT_CATEGORY;
    const amount = order.totalOwed || 0;
    spending[category] = (spending[category] || 0) + amount;
  });

  return spending;
}

/**
 * Gets all category names
 * @returns {Array} - Array of category names
 */
export function getAllCategoryNames() {
  return [...PRODUCT_CATEGORIES.map(c => c.name), DEFAULT_CATEGORY];
}
