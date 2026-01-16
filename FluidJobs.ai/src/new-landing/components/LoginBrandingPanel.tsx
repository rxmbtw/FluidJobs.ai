import React from 'react';
import ServerLoader from './ServerLoader';

interface LoginBrandingPanelProps {
    onNavigateHome: () => void;
}

const LoginBrandingPanel: React.FC<LoginBrandingPanelProps> = ({ onNavigateHome }) => {
    return (
        <div className="hidden md:flex flex-col w-1/2 relative items-center justify-center p-12" style={{ background: 'linear-gradient(135deg, rgba(66, 133, 244, 1) 0%, rgba(0, 96, 255, 1) 100%)' }}>
            <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
                <div style={{ marginBottom: '3rem' }}>
                    <ServerLoader />
                </div>
                <div className="max-w-lg text-center">
                    <h1 className="text-5xl font-bold mb-6 leading-tight" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                        Find Your Next Role.
                        <br />
                        Discover Your Next Hire.
                    </h1>
                    <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 1)' }}>FluidJobs.ai moves beyond keywords to match exceptional talent with innovative companies. Stop searching. Start matching.</p>
                </div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <a href="https://fluid.live/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-medium hover:underline">
                    Visit Fluid.live →
                </a>
            </div>
        </div>
    );
};

export default LoginBrandingPanel;