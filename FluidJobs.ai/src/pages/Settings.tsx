import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Settings: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
          
          <div className="space-y-6">
            {/* Notifications */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Email notifications for new applications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">SMS notifications for urgent updates</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Make profile visible to other departments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-gray-700">Allow data export</span>
                </label>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;