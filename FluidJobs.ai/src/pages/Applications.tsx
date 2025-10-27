import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Applications: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">0</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No applications found.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
