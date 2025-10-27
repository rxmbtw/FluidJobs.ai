import React from 'react';

const ClearSession: React.FC = () => {
  const clearAll = () => {
    sessionStorage.clear();
    localStorage.clear();
    console.log('All storage cleared');
    window.location.href = '/login';
  };

  const switchToAdmin = async () => {
    try {
      const token = sessionStorage.getItem('fluidjobs_token');
      const response = await fetch('http://localhost:8000/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'Admin' })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        sessionStorage.setItem('fluidjobs_user', JSON.stringify(updatedUser));
  console.log('Role updated to Admin via API');
  window.location.href = '/main-unified-dashboard';
      }
    } catch (error) {
      console.error('Role update failed:', error);
      // Fallback to local update
      const user = JSON.parse(sessionStorage.getItem('fluidjobs_user') || '{}');
  user.role = 'Admin';
  sessionStorage.setItem('fluidjobs_user', JSON.stringify(user));
  window.location.href = '/main-unified-dashboard';
    }
  };

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, display: 'flex', gap: '10px' }}>
      <button 
        onClick={switchToAdmin}
        style={{ 
          background: 'green', 
          color: 'white', 
          padding: '10px', 
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Switch to Admin
      </button>
      <button 
        onClick={clearAll}
        style={{ 
          background: 'red', 
          color: 'white', 
          padding: '10px', 
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Clear Session
      </button>
    </div>
  );
};

export default ClearSession;