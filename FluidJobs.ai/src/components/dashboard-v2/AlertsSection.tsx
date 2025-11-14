import React from 'react';
import { BellOff } from 'lucide-react';

const AlertsSection: React.FC = () => {
  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-[25px] shadow-lg flex flex-col items-center justify-center min-h-[500px]">
      <h2 className="text-3xl font-extrabold mb-4 self-start text-black">
        Alerts
      </h2>

      <div className="flex flex-col items-center justify-center text-center p-10">
        <BellOff className="w-20 h-20 text-gray-300 mb-6" />
        <p className="text-lg font-semibold text-gray-600 max-w-sm">
          Complete your profile to start getting announcements of the latest job openings!
        </p>
      </div>
    </div>
  );
};

export default AlertsSection;
