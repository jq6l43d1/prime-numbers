import { createContext, useContext, useState } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const setData = (processedData) => {
    setOrders(processedData.orders || []);
    setReturns(processedData.returns || []);
    setPhotos(processedData.photos || []);
    setSummary(processedData.summary || null);
    setIsDataLoaded(true);
  };

  const clearData = () => {
    setOrders([]);
    setReturns([]);
    setPhotos([]);
    setSummary(null);
    setIsDataLoaded(false);
  };

  const value = {
    orders,
    returns,
    photos,
    summary,
    isDataLoaded,
    setData,
    clearData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
