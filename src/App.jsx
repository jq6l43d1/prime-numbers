import { Layout } from './components/layout/Layout';
import { FileUploader } from './components/upload/FileUploader';
import { UploadProgress } from './components/upload/UploadProgress';
import { Dashboard } from './components/dashboard/Dashboard';
import { ComparisonDashboard } from './components/comparison/ComparisonDashboard';
import { FileManager } from './components/fileManager/FileManager';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardSkeleton } from './components/common/LoadingSkeleton';
import { DataProvider, useData } from './context/DataContext';
import { useFileUpload } from './hooks/useFileUpload';
import { useDataProcessing } from './hooks/useDataProcessing';

function AppContent() {
  const { file, error: uploadError, validateFile } = useFileUpload();
  const { isProcessing, progress, processFile, error: processingError } = useDataProcessing();
  const { isDataLoaded, datasets, viewMode, addDataset, clearAllDatasets } = useData();

  const handleFileSelect = async selectedFile => {
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
        addDataset(result, { fileName: selectedFile.name });
      }
    } catch (err) {
      console.error('Failed to process file:', err);
    }
  };

  const handleReset = () => {
    if (window.confirm('Remove all files and start over?')) {
      clearAllDatasets();
    }
  };

  const showUploader = !isProcessing;
  const hasData = datasets.length > 0;

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hasData && !isProcessing && (
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Your Amazon Order Insights
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your Amazon "Your Orders.zip" file to get detailed insights into your
                spending habits, order history, and purchasing patterns. All processing happens
                securely in your browser.
              </p>
            </div>
          )}

          {isProcessing && (
            <>
              <UploadProgress progress={progress} />
              <div className="mt-8">
                <DashboardSkeleton />
              </div>
            </>
          )}

          {hasData && !isProcessing && (
            <>
              <FileManager />
              {viewMode === 'compare' ? <ComparisonDashboard /> : <Dashboard />}
            </>
          )}

          {showUploader && (
            <div className={hasData ? 'mt-8' : ''}>
              <FileUploader
                onFileSelect={handleFileSelect}
                error={uploadError || processingError}
                showAddAnother={hasData}
              />
            </div>
          )}

          {hasData && !isProcessing && (
            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                Remove All Files
              </button>
            </div>
          )}
        </div>
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
