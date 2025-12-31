import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function FileUploader({ onFileSelect, error }) {
  const onDrop = useCallback((acceptedFiles) => {
    console.log('onDrop called with files:', acceptedFiles);
    if (acceptedFiles && acceptedFiles.length > 0) {
      console.log('Calling onFileSelect with file:', acceptedFiles[0].name);
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    maxFiles: 1,
    multiple: false,
    noClick: false,
    noKeyboard: false
  });

  console.log('FileUploader rendering, isDragActive:', isDragActive);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-primary bg-primary-50'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-6xl mb-4">
          {isDragActive ? '📂' : '📦'}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive
            ? 'Drop your file here'
            : 'Click or drag file to upload'
          }
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your Amazon "Your Orders.zip" file here, or click anywhere in this area to browse
        </p>
        <div className="inline-flex items-center text-primary font-semibold">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Choose File
        </div>
        {error && (
          <div className="mt-4 text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to get your Amazon data:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Go to Amazon.com and sign in</li>
          <li>Navigate to Account & Lists → Privacy & Settings → Request My Data</li>
          <li>Request "Your Orders" data</li>
          <li>Wait for email (usually within 24-48 hours)</li>
          <li>Download the "Your Orders.zip" file</li>
          <li>Upload it here to analyze your purchase history</li>
        </ol>
      </div>
    </div>
  );
}
