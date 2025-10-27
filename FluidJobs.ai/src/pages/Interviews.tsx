import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Interviews: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Interviews</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Your scheduled interviews will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Interviews;