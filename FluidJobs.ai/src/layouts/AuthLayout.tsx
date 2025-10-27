import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-neutral">
    <div className="w-full max-w-md p-8 bg-white rounded shadow">
      {children}
    </div>
  </div>
);

export default AuthLayout;
