import React from 'react';
import ThemedBulkImport from '../../../components/admin/ThemedBulkImport';
import { ThemeProvider } from '../../../components/ThemeContext';

const AdminBulkImport: React.FC = () => {
    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Bulk Import Candidates</h1>
                <p className="text-gray-600">Import multiple candidates at once using CSV or Excel files</p>
            </div>
            <div className="flex-1 overflow-auto px-8 py-6">
                <ThemeProvider>
                    <ThemedBulkImport />
                </ThemeProvider>
            </div>
        </div>
    );
};

export default AdminBulkImport;
