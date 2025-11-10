import React from 'react';
import NewLandingApp from './new-landing/App';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NewLandingApp />
    </AuthProvider>
  );
}

export default App;
