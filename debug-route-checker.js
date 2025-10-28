// Route Debugging Helper
const routeDebugger = {
  checkRoutes: () => {
    console.log('🔍 Route Debug Check:');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search params:', window.location.search);
    
    // Check if user is authenticated
    const token = localStorage.getItem('fluidjobs_token');
    console.log('Auth token exists:', !!token);
    
    // Check user role
    const user = JSON.parse(localStorage.getItem('fluidjobs_user') || '{}');
    console.log('User role:', user.role);
    
    return {
      isAuthenticated: !!token,
      userRole: user.role,
      currentPath: window.location.pathname
    };
  }
};

// Add to window for debugging
if (typeof window !== 'undefined') {
  window.routeDebugger = routeDebugger;
}