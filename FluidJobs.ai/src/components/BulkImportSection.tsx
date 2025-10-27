import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const BulkImportSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setImportStatus('idle');
        setStatusMessage('');
      } else {
        setImportStatus('error');
        setStatusMessage('Please select a CSV file only.');
        setSelectedFile(null);
      }
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) {
      setImportStatus('error');
      setStatusMessage('Please select a CSV file first.');
      return;
    }

    setIsImporting(true);
    setImportStatus('idle');
    setStatusMessage('Processing candidates...');

    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/bulk-import/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('fluidjobs_token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setImportStatus('success');
        setStatusMessage(`Successfully imported ${result.processed} of ${result.total} candidates!`);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const error = await response.json();
        setImportStatus('error');
        setStatusMessage(error.message || 'Import failed. Please try again.');
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Upload className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Import Candidates</h1>
          <p className="text-gray-600">Upload a CSV file to create multiple candidate profiles at once</p>
        </div>

        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <div>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Select CSV File</p>
              <p className="text-gray-500 mb-4">Choose a CSV file with candidate data</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* CSV Format Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Headers: <code>CandidateName, EmailAddress</code></li>
            <li>• Each row represents one candidate</li>
            <li>• Email addresses must be unique</li>
            <li>• Maximum file size: 10MB</li>
          </ul>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className={`flex items-center space-x-2 p-4 rounded-lg mb-6 ${
            importStatus === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            importStatus === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {importStatus === 'success' && <CheckCircle className="w-5 h-5" />}
            {importStatus === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Import Button */}
        <div className="text-center">
          <button
            onClick={handleStartImport}
            disabled={!selectedFile || isImporting}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              !selectedFile || isImporting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isImporting ? 'Importing...' : 'Start Import'}
          </button>
        </div>

        {/* Security Warning */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Security Notice:</p>
              <p>Temporary passwords will be generated for each candidate. Consider implementing a secure password reset flow instead of storing plain text passwords.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportSection;