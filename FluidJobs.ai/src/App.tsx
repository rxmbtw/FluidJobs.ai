import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewLandingApp from './new-landing/App';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/*" element={<NewLandingApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
