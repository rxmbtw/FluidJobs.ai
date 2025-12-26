import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, X } from 'lucide-react';
import SuccessModal from './SuccessModal';

const BulkImportSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importSummary, setImportSummary] = useState({ success: 0, duplicates: 0, errors: 0 });

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
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportStatus('error');
        setStatusMessage('CSV file must contain headers and at least one data row.');
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['full_name', 'email'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setImportStatus('error');
        setStatusMessage(`Missing required headers: ${missingHeaders.join(', ')}`);
        setIsImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;
      const errors = [];

      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const candidate: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            candidate[header] = values[index];
          }
        });

        if (!candidate.full_name || !candidate.email) {
          errorCount++;
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        try {
          const response = await fetch(`${backendUrl}/api/candidates`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(candidate),
          });

          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            if (error.message && error.message.includes('duplicate')) {
              duplicateCount++;
            } else {
              errorCount++;
              errors.push(`Row ${i + 1}: ${error.message || 'Failed to create candidate'}`);
            }
          }
        } catch (err) {
          errorCount++;
          errors.push(`Row ${i + 1}: Network error`);
        }
      }

      setImportStatus('success');
      let message = `Import completed! ${successCount} added`;
      if (duplicateCount > 0) message += `, ${duplicateCount} duplicates skipped`;
      if (errorCount > 0) message += `, ${errorCount} errors`;
      
      setStatusMessage(message);
      setImportSummary({ success: successCount, duplicates: duplicateCount, errors: errorCount });
      setShowSuccessModal(true);
      
      if (errors.length > 0 && errors.length <= 5) {
        setStatusMessage(message + '\n\nErrors:\n' + errors.slice(0, 5).join('\n'));
      }
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage('Failed to process CSV file. Please check the format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Bulk Import Candidates</h1>
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
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  setImportStatus('idle');
                  setStatusMessage('');
                }}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            </div>
          ) : (
            <div>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Select CSV File</p>
              <p className="text-gray-500 mb-4">Choose a CSV file with candidate data</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Download Template Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => {
              const csvContent = `full_name,email,phone_number,gender,marital_status,current_company,notice_period,current_ctc,location,currently_employed,previous_company,expected_ctc,experience_years
John Doe,john.doe@email.com,+91 9876543210,Male,Single,Tech Corp,30 Days,800000,Mumbai,Yes,Previous Corp,1200000,3.5
Jane Smith,jane.smith@email.com,+91 9876543211,Female,Married,Software Inc,60 Days,1200000,Delhi,Yes,Old Company,1500000,5.2`;
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'candidates_template.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
          >
            <Download className="w-5 h-5" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* CSV Format Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Required:</strong> full_name, email</li>
            <li>• <strong>Optional:</strong> phone_number, gender, marital_status, current_company, notice_period, current_ctc, location, currently_employed, previous_company, expected_ctc, experience_years</li>
            <li>• Email addresses must be unique</li>
            <li>• Download template above for correct format</li>
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
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isImporting ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        title="Import Completed!"
        message={`Successfully imported ${importSummary.success} candidate${importSummary.success !== 1 ? 's' : ''}${importSummary.duplicates > 0 ? `, ${importSummary.duplicates} duplicate${importSummary.duplicates !== 1 ? 's' : ''} skipped` : ''}${importSummary.errors > 0 ? `, ${importSummary.errors} error${importSummary.errors !== 1 ? 's' : ''}` : ''}`}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default BulkImportSection;