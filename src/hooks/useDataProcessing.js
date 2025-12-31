import { useState } from 'react';
import { processAmazonData } from '../services/dataProcessor';

export function useDataProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ step: '', progress: 0, message: '' });
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState(null);

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);
    setProgress({ step: 'starting', progress: 0, message: 'Starting...' });

    // Add a small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const result = await processAmazonData(file, (progressInfo) => {
        setProgress(progressInfo);
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to process file');
      }

      setProcessedData(result);
      return result;
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearData = () => {
    setProcessedData(null);
    setError(null);
    setProgress({ step: '', progress: 0, message: '' });
  };

  return {
    isProcessing,
    progress,
    processedData,
    error,
    processFile,
    clearData
  };
}
