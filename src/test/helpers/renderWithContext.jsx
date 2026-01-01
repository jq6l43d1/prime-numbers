import { render } from '@testing-library/react';
import { DataProvider } from '../../context/DataContext';

/**
 * Renders a React component wrapped in DataContext provider
 * Useful for testing components that use useData hook
 */
export const renderWithContext = (ui, options = {}) => {
  const Wrapper = ({ children }) => <DataProvider>{children}</DataProvider>;

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Creates a custom render with initial data
 */
export const renderWithData = (ui, initialData = {}, options = {}) => {
  const Wrapper = ({ children }) => {
    // Note: We'd need to extend DataProvider to accept initial state
    // For now, this is a placeholder for future enhancement
    return <DataProvider>{children}</DataProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};
