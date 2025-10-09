import React from 'react';
import { User, Briefcase, Clock } from 'lucide-react';

interface ActivityItem {
  id: number;
  type: 'application' | 'interview' | 'hire';
  primaryText: string;
  secondaryText: string;
  time: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'interview':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'hire':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.primaryText}</p>
                <p className="text-sm text-gray-500">{activity.secondaryText}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;