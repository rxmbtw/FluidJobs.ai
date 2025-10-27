import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-neutral">
    <div className="flex-1 flex flex-col">
      <main className="flex-1 p-4">{children}</main>
    </div>
  </div>
);

export default MainLayout;
