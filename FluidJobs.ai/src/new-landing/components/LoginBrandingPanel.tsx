import React from 'react';

interface LoginBrandingPanelProps {
    onNavigateHome: () => void;
}

const LoginBrandingPanel: React.FC<LoginBrandingPanelProps> = ({ onNavigateHome }) => {
    const logoUrl = '/images/FLuid Live Icon light theme.png';

    return (
        <div className="hidden md:flex flex-col w-1/2 relative items-center justify-center p-12" style={{ background: 'linear-gradient(135deg, rgba(66, 133, 244, 1) 0%, rgba(0, 96, 255, 1) 100%)' }}>
            <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '3rem' }}>
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 200, 100, 1) 50%, rgba(255, 100, 200, 1) 100%)',
                        width: '120px',
                        height: '120px',
                        animation: 'spinning82341 1.7s linear infinite',
                        borderRadius: '60px',
                        filter: 'blur(2px)',
                        boxShadow: '0px 0px 40px 5px rgba(255, 255, 255, 0.6), 0px 0px 80px 10px rgba(255, 150, 150, 0.4)',
                        position: 'absolute',
                        top: 0,
                        left: 0
                    }}></div>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(0, 96, 255, 1) 0%, rgba(66, 133, 244, 1) 100%)',
                        width: '90px',
                        height: '90px',
                        borderRadius: '45px',
                        position: 'absolute',
                        top: '15px',
                        left: '15px'
                    }}></div>
                </div>
                <div className="max-w-lg text-center">
                    <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                        Find Your Next
                        <br />
                        Opportunity, Faster
                    </h1>
                    <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 1)' }}>Join 1000+ professionals who trust FluidJobs.ai to accelerate their career growth and hiring success.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginBrandingPanel;
