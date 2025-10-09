import React from 'react';
import EnhancedSidebar from './EnhancedSidebar';
import TopNavBar from './TopNavBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA]">
      <TopNavBar />
      <div className="flex flex-1 overflow-hidden">
        <EnhancedSidebar />
        <main className="flex-1 bg-[#F8F9FA] p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;