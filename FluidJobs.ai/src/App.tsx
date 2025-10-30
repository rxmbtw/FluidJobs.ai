import React from 'react';
import AppRoutes from './routes';
import { JobsProvider } from './contexts/JobsProvider';
import { ProfileProvider } from './contexts/ProfileContext';
import { AuthProvider } from './contexts/AuthProvider';


function App() {
  return (
    <AuthProvider>
      <JobsProvider>
        <ProfileProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </ProfileProvider>
      </JobsProvider>
    </AuthProvider>
  );
}

export default App;
