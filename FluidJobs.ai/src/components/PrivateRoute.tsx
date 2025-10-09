import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
