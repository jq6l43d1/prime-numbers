import { useState } from 'react';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../constants/fileTypes';

export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = (file) => {
    console.log('validateFile called with:', file);
    setError(null);
    setIsValidating(true);

    try {
      // Check if file exists
      if (!file) {
        throw new Error('No file selected');
      }

      console.log('File name:', file.name, 'type:', file.type, 'size:', file.size);

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.zip')) {
        throw new Error('Please upload a ZIP file');
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        throw new Error(`File size exceeds ${sizeMB}MB limit`);
      }

      // Check file name
      if (!file.name.toLowerCase().includes('order')) {
        console.warn('File name does not contain "order" - this might not be the correct file');
      }

      console.log('File validation passed');
      setFile(file);
      return true;
    } catch (err) {
      console.error('File validation failed:', err.message);
      setError(err.message);
      setFile(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return {
    file,
    error,
    isValidating,
    validateFile,
    clearFile
  };
}
