import { Layout } from './components/layout/Layout';
import { FileUploader } from './components/upload/FileUploader';
import { UploadProgress } from './components/upload/UploadProgress';
import { Dashboard } from './components/dashboard/Dashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DataProvider, useData } from './context/DataContext';
import { useFileUpload } from './hooks/useFileUpload';
import { useDataProcessing } from './hooks/useDataProcessing';

function AppContent() {
  const { file, error: uploadError, validateFile } = useFileUpload();
  const { isProcessing, progress, processFile, error: processingError } = useDataProcessing();
  const { isDataLoaded, setData } = useData();

  const handleFileSelect = async (selectedFile) => {
    console.log('File selected:', selectedFile.name, selectedFile.size, 'bytes');

    const isValid = validateFile(selectedFile);
    if (!isValid) {
      console.error('File validation failed');
      return;
    }

    console.log('File validated, starting processing...');
    try {
      const result = await processFile(selectedFile);
      console.log('Processing complete:', result.summary);
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error('Failed to process file:', err);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <Layout>
      <div className="py-12">
        {!isDataLoaded && !isProcessing && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Analyze Your Amazon Order History
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your Amazon "Your Orders.zip" file to get detailed insights into your spending habits,
                order history, and purchasing patterns. All processing happens securely in your browser.
              </p>
            </div>
            <FileUploader
              onFileSelect={handleFileSelect}
              error={uploadError || processingError}
            />
          </div>
        )}

        {isProcessing && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <UploadProgress progress={progress} />
          </div>
        )}

        {isDataLoaded && !isProcessing && (
          <>
            <Dashboard />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
              <button
                onClick={handleReset}
                className="btn-secondary"
              >
                Analyze Different File
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  );
}

export default App;
