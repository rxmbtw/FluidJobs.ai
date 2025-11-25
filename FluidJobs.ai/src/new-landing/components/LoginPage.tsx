import React from 'react';
import LoginBrandingPanel from './LoginBrandingPanel';
import LoginSignUpForm from './LoginSignUpForm';

interface LoginPageProps {
    onNavigateHome: () => void;
    onNavigateToDashboard?: () => void;
    onNavigateToCompanyDashboard?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onNavigateToDashboard, onNavigateToCompanyDashboard }) => {
    return (
        <div className="login-page-body antialiased relative" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)', minHeight: '100vh' }}>
            <div id="background-visuals" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(199, 220, 255, 1) 100%)' }}>
                <div className="background-grid"></div>
                <div className="hero-launch-glow"></div>
                <div className="footer-glow"></div>
            </div>
            <div className="flex min-h-screen w-full relative justify-center items-center" style={{ zIndex: 10 }}>
                <div className="flex w-full max-w-7xl rounded-3xl shadow-2xl overflow-hidden" style={{ height: '700px' }}>
                    <LoginSignUpForm onNavigateToDashboard={onNavigateToDashboard} />
                    <LoginBrandingPanel onNavigateHome={onNavigateHome} />
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
