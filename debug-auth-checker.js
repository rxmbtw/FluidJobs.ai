// Google Auth Debug Helper
const authDebugger = {
  checkGoogleAuth: async () => {
    console.log('🔐 Google Auth Debug Check:');
    
    // Check environment variables
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    console.log('Backend URL:', backendUrl);
    
    try {
      // Test backend health
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Backend health:', healthData);
      
      // Test Google auth endpoint
      const authUrl = `${backendUrl}/api/auth/google?role=Candidate`;
      console.log('🔗 Google auth URL:', authUrl);
      
      return {
        backendHealthy: healthResponse.ok,
        authUrl: authUrl
      };
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return {
        backendHealthy: false,
        error: error.message
      };
    }
  },
  
  testAuthFlow: () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    const authUrl = `${backendUrl}/api/auth/google?role=Candidate`;
    console.log('🚀 Opening Google auth flow...');
    window.open(authUrl, '_blank');
  }
};

if (typeof window !== 'undefined') {
  window.authDebugger = authDebugger;
}