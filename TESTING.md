# Testing Guide

This document describes the testing infrastructure and practices for the Amazon Order Analyzer project.

## Overview

The project uses **Vitest** as the test framework with **React Testing Library** for component testing. The testing infrastructure includes:

- **Test Framework**: Vitest 2.1.8 (native Vite integration)
- **React Testing**: @testing-library/react 16.1.0
- **Test Environment**: jsdom (browser simulation)
- **Coverage**: V8 coverage provider
- **Code Formatting**: Prettier 3.4.2
- **Git Hooks**: Husky 9.1.7 + lint-staged
- **Linting**: ESLint with Prettier integration

## Running Tests

### Development

```bash
# Interactive watch mode (default)
npm test

# Visual UI test runner
npm run test:ui

# Run tests once
npm run test:run
```

### CI/CD

```bash
# Run tests with coverage
npm run test:ci

# Run tests without coverage
npm run test:run
```

### Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html
```

### Related Tests

```bash
# Run tests related to changed files
npm run test:related
```

## Test Structure

### Directory Organization

```
src/
├── test/
│   ├── setup.js                      # Global test setup and mocks
│   ├── fixtures/
│   │   ├── mockOrders.js             # Reusable order test data
│   │   ├── mockReturns.js            # Reusable return test data
│   │   └── mockCSVData.js            # CSV parsing test data
│   └── helpers/
│       ├── renderWithContext.jsx     # React Testing Library wrapper
│       └── testUtils.js              # Common test utilities
├── utils/
│   ├── currencyHelpers.js
│   ├── currencyHelpers.test.js       # Co-located tests
│   ├── dateHelpers.js
│   └── dateHelpers.test.js
└── services/
    ├── dataProcessor.js
    └── dataProcessor.test.js
```

### Naming Conventions

- **Test files**: Co-located with source files using `.test.js` or `.test.jsx` extension
- **Test naming**: Descriptive, following pattern: `describe('functionName', () => { it('should do X when Y', ...) })`
- **Fixtures**: Centralized in `src/test/fixtures/` for reusability

## Writing Tests

### Test Structure (AAA Pattern)

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return expected result when given valid input', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Using Fixtures

```javascript
import { mockOrder, generateMockOrders } from '../test/fixtures/mockOrders';

describe('processOrders', () => {
  it('should process multiple orders', () => {
    const orders = generateMockOrders(5);
    const result = processOrders(orders);
    expect(result).toHaveLength(5);
  });
});
```

### Testing React Components

```javascript
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithContext } from '../test/helpers/renderWithContext';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render with data context', () => {
    renderWithContext(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const { user } = renderWithContext(<MyComponent />);
    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});
```

### Testing Async Code

```javascript
import { waitFor } from '@testing-library/react';

it('should load data asynchronously', async () => {
  const promise = loadData();

  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
  });
});
```

### Mocking

Vitest provides built-in mocking capabilities:

```javascript
import { vi } from 'vitest';

// Mock a module
vi.mock('./myModule', () => ({
  myFunction: vi.fn(() => 'mocked result'),
}));

// Spy on a function
const spy = vi.spyOn(object, 'method');
expect(spy).toHaveBeenCalledWith('expected arg');
```

## Git Hooks

### Pre-commit Hook

Runs automatically on `git commit`:
- **ESLint**: Lints and auto-fixes staged JS/JSX files
- **Prettier**: Formats staged files
- **Tests**: Runs tests related to changed files

### Pre-push Hook

Runs automatically on `git push`:
- **Full Test Suite**: Runs all tests with coverage
- **Build Verification**: Ensures the project builds successfully

### Skipping Hooks

⚠️ **Not recommended** - Only skip hooks for emergency fixes:

```bash
git commit --no-verify
git push --no-verify
```

## Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory.

## Best Practices

### 1. Test What Matters

- Focus on business logic and critical paths
- Test edge cases and error conditions
- Don't chase 100% coverage - aim for meaningful coverage

### 2. One Assertion Per Test (when practical)

```javascript
// Good
it('should return positive number', () => {
  expect(abs(-5)).toBe(5);
});

it('should return zero for zero', () => {
  expect(abs(0)).toBe(0);
});

// Avoid (unless related assertions)
it('should work correctly', () => {
  expect(abs(-5)).toBe(5);
  expect(abs(0)).toBe(0);
  expect(abs(10)).toBe(10);
});
```

### 3. Test Edge Cases First

- Empty arrays
- Null/undefined values
- Division by zero
- Floating-point precision
- Invalid input
- Boundary conditions

### 4. Use Descriptive Test Names

```javascript
// Good
it('should return 0 when calculating average of empty array', () => { ... });

// Bad
it('test average', () => { ... });
```

### 5. Keep Tests Independent

Each test should be able to run in isolation and in any order.

### 6. Use Test Helpers

Leverage the test helpers in `src/test/helpers/` for common operations:

```javascript
import { roundToTwo, expectArraysEqual } from '../test/helpers/testUtils';

it('should calculate correctly', () => {
  const result = 0.1 + 0.2;
  expect(roundToTwo(result)).toBe(0.3);
});
```

## Troubleshooting

### Tests Fail in Watch Mode But Pass Individually

- Check for shared state between tests
- Ensure proper cleanup in `afterEach` hooks
- Use `--no-threads` flag if needed: `npm test -- --no-threads`

### Chart.js Errors in Tests

Chart.js requires canvas mocking, which is set up in `src/test/setup.js`. If you see canvas-related errors:

1. Verify `src/test/setup.js` is being loaded (check `vitest.config.js`)
2. Ensure the component is being tested in jsdom environment

### Floating-Point Precision Issues

Use `toBeCloseTo` or `roundToTwo` helper for floating-point comparisons:

```javascript
// Good
expect(0.1 + 0.2).toBeCloseTo(0.3, 10);
expect(roundToTwo(0.1 + 0.2)).toBe(0.3);

// Bad
expect(0.1 + 0.2).toBe(0.3); // May fail due to floating-point precision
```

### Memory Issues with Large Test Suites

If tests run out of memory:

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm test
```

## Example Test Files

### Complete Example: Currency Helpers

See `src/utils/currencyHelpers.test.js` for a comprehensive example with 75+ tests covering:

- Standard use cases
- Edge cases (null, undefined, NaN)
- Floating-point precision
- Different currency codes
- Boundary conditions

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new code:

1. **Write tests first** (Test-Driven Development) or alongside implementation
2. **Ensure tests pass**: Run `npm test` before committing
3. **Check coverage**: Run `npm run test:coverage` to verify coverage
4. **Format code**: Run `npm run format` (or let pre-commit hook handle it)
5. **Fix lint errors**: Run `npm run lint:fix`

The git hooks will enforce these standards automatically, but it's faster to check manually first.
