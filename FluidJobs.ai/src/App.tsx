import React from 'react';
import AppRoutes from './routes';
import { JobsProvider } from './contexts/JobsProvider';
import { ProfileProvider } from './contexts/ProfileContext';
import './App.css';

function App() {
  return (
    <JobsProvider>
      <ProfileProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </ProfileProvider>
    </JobsProvider>
  );
}

export default App;
