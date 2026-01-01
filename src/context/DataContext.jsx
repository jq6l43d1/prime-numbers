import { createContext, useContext, useState, useMemo } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Legacy single dataset (for backwards compatibility)
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Multi-file support
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single', 'compare', 'combined'

  // Date filtering
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    label: 'All Time',
  });

  const setData = processedData => {
    setOrders(processedData.orders || []);
    setReturns(processedData.returns || []);
    setPhotos(processedData.photos || []);
    setSummary(processedData.summary || null);
    setIsDataLoaded(true);
  };

  // Add a new dataset
  const addDataset = (processedData, metadata) => {
    const newDataset = {
      id: Date.now().toString(),
      name: metadata.fileName || 'Unnamed File',
      uploadDate: new Date().toISOString(),
      orders: processedData.orders || [],
      returns: processedData.returns || [],
      photos: processedData.photos || [],
      summary: processedData.summary || null,
      ...metadata,
    };

    setDatasets(prev => {
      // If this is the first dataset, set it as active and update legacy state
      if (prev.length === 0) {
        setActiveDatasetId(newDataset.id);
        setData(processedData);
      }
      return [...prev, newDataset];
    });

    return newDataset.id;
  };

  // Remove a dataset
  const removeDataset = datasetId => {
    setDatasets(prev => prev.filter(ds => ds.id !== datasetId));

    // If we removed the active dataset, switch to the first remaining one
    if (activeDatasetId === datasetId) {
      const remaining = datasets.filter(ds => ds.id !== datasetId);
      if (remaining.length > 0) {
        setActiveDatasetId(remaining[0].id);
        setData(remaining[0]);
      } else {
        clearData();
      }
    }
  };

  // Switch active dataset
  const switchDataset = datasetId => {
    const dataset = datasets.find(ds => ds.id === datasetId);
    if (dataset) {
      setActiveDatasetId(datasetId);
      setData(dataset);
    }
  };

  // Get combined data from all datasets
  const getCombinedData = () => {
    if (datasets.length === 0) return null;

    const combined = {
      orders: [],
      returns: [],
      photos: [],
      summary: {
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0,
      },
    };

    datasets.forEach(dataset => {
      combined.orders.push(...(dataset.orders || []));
      combined.returns.push(...(dataset.returns || []));
      combined.photos.push(...(dataset.photos || []));

      if (dataset.summary) {
        combined.summary.totalSpent += dataset.summary.totalSpent || 0;
        combined.summary.totalOrders += dataset.summary.totalOrders || 0;
        combined.summary.totalItems += dataset.summary.totalItems || 0;
      }
    });

    combined.summary.averageOrderValue =
      combined.summary.totalOrders > 0
        ? combined.summary.totalSpent / combined.summary.totalOrders
        : 0;

    return combined;
  };

  const clearData = () => {
    setOrders([]);
    setReturns([]);
    setPhotos([]);
    setSummary(null);
    setIsDataLoaded(false);
  };

  const clearAllDatasets = () => {
    setDatasets([]);
    setActiveDatasetId(null);
    setViewMode('single');
    clearData();
  };

  // Filter orders by date range - memoized for performance
  const getFilteredOrders = useMemo(() => {
    return ordersToFilter => {
      if (!dateFilter.startDate && !dateFilter.endDate) {
        return ordersToFilter;
      }

      return ordersToFilter.filter(order => {
        if (!order.orderDate) return false;
        const orderTime = new Date(order.orderDate).getTime();

        if (dateFilter.startDate && orderTime < dateFilter.startDate) return false;
        if (dateFilter.endDate && orderTime > dateFilter.endDate) return false;

        return true;
      });
    };
  }, [dateFilter.startDate, dateFilter.endDate]);

  const value = {
    // Legacy single dataset
    orders,
    returns,
    photos,
    summary,
    isDataLoaded,
    setData,
    clearData,
    // Multi-file support
    datasets,
    activeDatasetId,
    viewMode,
    setViewMode,
    addDataset,
    removeDataset,
    switchDataset,
    getCombinedData,
    clearAllDatasets,
    // Date filtering
    dateFilter,
    setDateFilter,
    getFilteredOrders,
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
