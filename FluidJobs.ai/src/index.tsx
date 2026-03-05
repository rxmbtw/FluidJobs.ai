import React from 'react'; // Recompile trigger
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import './styles/animated-gradient.css';
import './styles/mobile.css';
import App from './App';
import { AuthProvider } from './contexts/AuthProvider';
import { ProfileCompletionProvider } from './contexts/ProfileCompletionContext';
import { ProfileProvider } from './contexts/ProfileContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <ProfileCompletionProvider>
          <App />
        </ProfileCompletionProvider>
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>
);
