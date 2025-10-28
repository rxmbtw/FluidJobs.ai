// API Security Test Script
const testAPISecurity = async () => {
  const backendUrl = 'http://localhost:8000';
  
  console.log('🔒 Testing API Security...');
  
  try {
    // Test public endpoints
    console.log('\n📖 Testing public endpoints:');
    
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    console.log('Health endpoint:', healthResponse.ok ? '✅' : '❌');
    
    // Test protected endpoints without auth
    console.log('\n🚫 Testing protected endpoints without auth:');
    
    const candidatesResponse = await fetch(`${backendUrl}/api/candidates`);
    console.log('Candidates without auth:', candidatesResponse.status === 401 ? '✅ Properly protected' : '❌ Not protected');
    
    const profileResponse = await fetch(`${backendUrl}/api/profile`);
    console.log('Profile without auth:', profileResponse.status === 401 ? '✅ Properly protected' : '❌ Not protected');
    
    // Test CORS
    console.log('\n🌐 Testing CORS:');
    const corsResponse = await fetch(`${backendUrl}/api/health`, {
      method: 'OPTIONS'
    });
    console.log('CORS preflight:', corsResponse.ok ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
};

// Test with authentication
const testWithAuth = async (token) => {
  const backendUrl = 'http://localhost:8000';
  
  console.log('\n🔑 Testing with authentication...');
  
  try {
    const response = await fetch(`${backendUrl}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authenticated request successful');
      console.log('User data:', data);
    } else {
      console.log('❌ Authenticated request failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
};

if (typeof window !== 'undefined') {
  window.testAPISecurity = testAPISecurity;
  window.testWithAuth = testWithAuth;
} else {
  testAPISecurity();
}