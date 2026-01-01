// Mock return data generators for tests

export const mockReturn = (overrides = {}) => ({
  orderId: 'ORDER-123',
  returnOrderId: 'RETURN-456',
  returnDate: '2024-01-20',
  returnAmount: 29.99,
  returnReason: 'Changed mind',
  returnStatus: 'Completed',
  quantityReturned: 1,
  ...overrides,
});

export const generateMockReturns = (count, overridesFn = () => ({})) => {
  return Array.from({ length: count }, (_, i) =>
    mockReturn({ returnOrderId: `RETURN-${i + 1}`, ...overridesFn(i) })
  );
};

export const mockReturns = [
  mockReturn({
    orderId: 'ORDER-001',
    returnOrderId: 'RETURN-001',
    returnAmount: 999,
    returnReason: 'Defective',
    returnDate: '2024-01-20',
  }),
  mockReturn({
    orderId: 'ORDER-002',
    returnOrderId: 'RETURN-002',
    returnAmount: 9.99,
    returnReason: 'Not as described',
    returnDate: '2024-02-01',
  }),
];

// Returns with various reasons
export const mockReturnsByReason = [
  mockReturn({
    orderId: 'ORDER-1',
    returnOrderId: 'RETURN-1',
    returnReason: 'Defective',
    returnAmount: 100,
  }),
  mockReturn({
    orderId: 'ORDER-2',
    returnOrderId: 'RETURN-2',
    returnReason: 'Defective',
    returnAmount: 50,
  }),
  mockReturn({
    orderId: 'ORDER-3',
    returnOrderId: 'RETURN-3',
    returnReason: 'Changed mind',
    returnAmount: 75,
  }),
  mockReturn({
    orderId: 'ORDER-4',
    returnOrderId: 'RETURN-4',
    returnReason: 'Not as described',
    returnAmount: 25,
  }),
];
