import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './new-landing/components/LoginPage';
import ComingSoon from './new-landing/components/ComingSoon';
import AuthCallback from './pages/AuthCallback';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import './App.css';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleNavigateHome = () => {
    setShowComingSoon(false);
    navigate('/');
  };

  const handleNavigateToDashboard = () => {
    navigate('/candidate-dashboard');
  };

  const handleNavigateToCompanyDashboard = () => {
    navigate('/company-dashboard');
  };

  const handleNavigateToComingSoon = () => {
    setShowComingSoon(true);
  };

  const handleNavigateToLogin = () => {
    setShowComingSoon(false);
  };

  if (showComingSoon) {
    return <ComingSoon onNavigateToLogin={handleNavigateToLogin} />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <LoginPage 
          onNavigateHome={handleNavigateHome}
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToCompanyDashboard={handleNavigateToCompanyDashboard}
          onNavigateToComingSoon={handleNavigateToComingSoon}
        />
      } />
      <Route path="/login" element={
        <LoginPage 
          onNavigateHome={handleNavigateHome}
          onNavigateToDashboard={handleNavigateToDashboard}
          onNavigateToCompanyDashboard={handleNavigateToCompanyDashboard}
          onNavigateToComingSoon={handleNavigateToComingSoon}
        />
      } />
      
      {/* OAuth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Public Dashboard Routes (temporarily) */}
      <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
      
      {/* Admin Routes */}
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/company-dashboard" element={<CompanyDashboard />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={["Admin", "HR", "Sales"]} />}>
          {/* Additional protected routes can go here */}
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
