/**
 * Common test utilities and helper functions
 */

/**
 * Creates a promise that resolves after specified delay
 * Useful for testing async behavior
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Waits for a condition to be true
 * @param {Function} condition - Function that returns boolean
 * @param {number} timeout - Max time to wait in ms
 * @param {number} interval - Check interval in ms
 */
export const waitForCondition = async (condition, timeout = 5000, interval = 100) => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Condition timeout exceeded');
    }
    await delay(interval);
  }
};

/**
 * Suppresses console errors during test execution
 * Useful for testing error scenarios without polluting console
 */
export const suppressConsoleError = () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = () => {};
  });
  afterEach(() => {
    console.error = originalError;
  });
};

/**
 * Helper to test async errors
 * @param {Function} fn - Async function that should throw
 * @param {string|RegExp} errorMatch - Expected error message or pattern
 */
export const expectAsyncError = async (fn, errorMatch) => {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (typeof errorMatch === 'string') {
      expect(error.message).toContain(errorMatch);
    } else if (errorMatch instanceof RegExp) {
      expect(error.message).toMatch(errorMatch);
    }
  }
};

/**
 * Rounds a number to 2 decimal places for comparison
 * Useful for floating-point comparisons in tests
 */
export const roundToTwo = num => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Creates a mock File object for file upload tests
 */
export const createMockFile = (name = 'test.zip', size = 1024, type = 'application/zip') => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

/**
 * Creates a mock Blob object
 */
export const createMockBlob = (content = 'test', type = 'text/plain') => {
  return new Blob([content], { type });
};

/**
 * Flushes all pending promises
 * Useful after triggering async operations
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Helper to assert that arrays contain the same elements (ignoring order)
 */
export const expectArraysEqual = (actual, expected) => {
  expect(actual.sort()).toEqual(expected.sort());
};

/**
 * Helper to assert object properties match (partial comparison)
 */
export const expectObjectContains = (actual, expected) => {
  Object.keys(expected).forEach(key => {
    expect(actual).toHaveProperty(key, expected[key]);
  });
};
