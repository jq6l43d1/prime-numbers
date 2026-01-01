import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (needed for Chart.js)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (needed for Chart.js)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.getContext for Chart.js
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}));

// Set up any global test utilities
global.testHelpers = {
  // Helper to create mock order data
  createMockOrder: (overrides = {}) => ({
    orderId: 'ORDER-123',
    orderDate: new Date('2024-01-15'),
    productName: 'Test Product',
    asin: 'B00TEST123',
    unitPrice: 29.99,
    quantity: 1,
    totalOwed: 29.99,
    shippingCharge: 0,
    totalDiscounts: 0,
    unitPriceTax: 2.5,
    orderStatus: 'Closed',
    shipmentStatus: 'Delivered',
    isDigital: false,
    currency: 'USD',
    category: 'Electronics',
    paymentMethod: 'Visa',
    hasReturn: false,
    year: 2024,
    month: 1,
    monthName: 'Jan 2024',
    ...overrides,
  }),

  // Helper to create mock return data
  createMockReturn: (overrides = {}) => ({
    orderId: 'ORDER-123',
    returnOrderId: 'RETURN-456',
    returnDate: '2024-01-20',
    returnAmount: 29.99,
    returnReason: 'Changed mind',
    returnStatus: 'Completed',
    quantityReturned: 1,
    ...overrides,
  }),
};
