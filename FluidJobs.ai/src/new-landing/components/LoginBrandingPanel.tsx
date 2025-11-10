import React from 'react';

interface LoginBrandingPanelProps {
    onNavigateHome: () => void;
}

const LoginBrandingPanel: React.FC<LoginBrandingPanelProps> = ({ onNavigateHome }) => {
    const logoUrl = '/images/Fluid Live Icon.png';

    return (
        <div className="hidden md:flex flex-col p-12 w-1/2 relative" style={{ backgroundColor: 'transparent' }}>
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative z-10">
                <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onNavigateHome(); }} 
                    className="flex flex-col items-center gap-0 cursor-pointer"
                    aria-label="Back to Home"
                >
                    <img src={logoUrl} alt="FluidJobs.ai Logo" className="h-36 w-36 object-cover" />
                    <h2 className="text-5xl font-bold -mt-6">
                        <span className="brand-gradient-text">FluidJobs.ai</span>
                    </h2>
                </a>
            </div>

            <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
                <div className="spinner">
                    <div className="spinner1"></div>
                </div>
                <div className="mt-16 max-w-lg text-center">
                    <h1 className="text-5xl font-light text-white mb-4 leading-tight">
                        Find Your Next
                        <br />
                        <span className="brand-gradient-text font-medium">Opportunity, Faster</span>
                    </h1>
                    <p className="text-xl text-white/80">Join thousands of professionals who trust FluidJobs.ai to accelerate their career growth and hiring success.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginBrandingPanel;
