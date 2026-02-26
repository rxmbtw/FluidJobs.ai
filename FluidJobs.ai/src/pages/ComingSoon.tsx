import React from 'react';

interface ComingSoonProps {
    onNavigateToLogin: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ onNavigateToLogin }) => {
    return (
        <div className="antialiased relative" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)', minHeight: '100vh' }}>
            <div id="background-visuals" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}>
                <div className="background-grid"></div>
                <div className="hero-launch-glow"></div>
                <div className="footer-glow"></div>
            </div>
            
            <div className="flex min-h-screen w-full relative justify-center items-center" style={{ zIndex: 10 }}>
                <div className="text-center px-6 max-w-2xl">
                    <div className="mb-8 flex justify-center">
                        <img src="/images/FLuid Live Icon light theme.png" alt="FluidJobs.ai Logo" className="h-20 w-20 object-contain animate-bounce" />
                    </div>
                    
                    <h1 className="text-7xl font-bold mb-6" style={{ color: 'rgba(66, 133, 244, 1)', textShadow: '0 4px 20px rgba(66, 133, 244, 0.3)' }}>
                        Coming Soon
                    </h1>
                    
                    <p className="text-2xl mb-4" style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                        Company Registration Portal
                    </p>
                    
                    <p className="text-lg mb-8" style={{ color: 'rgba(96, 96, 96, 1)' }}>
                        We're building something amazing for companies to find the perfect talent. Stay tuned! 🚀
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={onNavigateToLogin}
                            className="px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl"
                            style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.9)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 1)'}
                        >
                            Back to Login
                        </button>
                    </div>
                    
                    <div className="mt-12 flex justify-center gap-6">
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}></div>
                        <div className="w-3 h-3 rounded-full animate-pulse delay-75" style={{ backgroundColor: 'rgba(66, 133, 244, 1)', animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 rounded-full animate-pulse delay-150" style={{ backgroundColor: 'rgba(66, 133, 244, 1)', animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;