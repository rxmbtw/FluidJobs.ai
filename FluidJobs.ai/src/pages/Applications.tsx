import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Applications: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">3 New</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Senior React Developer</h3>
                  <p className="text-sm text-gray-600">John Doe • Applied 2 hours ago</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Pending Review
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">UX Designer</h3>
                  <p className="text-sm text-gray-600">Jane Smith • Applied 5 hours ago</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Approved
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Product Manager</h3>
                  <p className="text-sm text-gray-600">Mike Johnson • Applied 1 day ago</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  In Review
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
