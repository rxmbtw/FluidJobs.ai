import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check for user in sessionStorage (Google auth) or localStorage
  const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('fluidjobs_user') || 'null');
  const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
  
  if (!user || !token) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;
