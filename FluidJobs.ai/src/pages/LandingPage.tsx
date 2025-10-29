import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <div style={{ marginBottom: '30px' }}>
        <img 
          src="/images/FuildJobs.ai logo.png" 
          alt="FluidJobs.ai Logo" 
          style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
        />
      </div>
      <h1>Welcome to FluidJobs.ai</h1>
      <p>Your all-in-one solution for hiring and talent management.</p>
      <div>
        <Link to="/dashboard">
          <button>Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;