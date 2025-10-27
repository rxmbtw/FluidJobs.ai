import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
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