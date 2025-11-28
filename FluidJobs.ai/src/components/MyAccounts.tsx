import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const MyAccounts: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState('');

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50 pt-20">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Account</h1>
          <p className="text-sm text-gray-500">Step 1 of 6</p>
        </div>

        {/* Form */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select your account
          </label>
          <div className="relative">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
            >
              <option value="">e.g., BGIC</option>
              <option value="bgic">BGIC</option>
              <option value="account2">Account 2</option>
              <option value="account3">Account 3</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccounts;
