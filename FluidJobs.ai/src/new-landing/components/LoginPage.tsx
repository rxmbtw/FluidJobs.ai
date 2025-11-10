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
        <div className="login-page-body antialiased relative">
            <div id="background-visuals">
                <div className="background-grid"></div>
                <div className="hero-launch-glow"></div>
                <div className="footer-glow"></div>
            </div>
            <div className="flex min-h-screen w-full relative" style={{ zIndex: 10 }}>
                <LoginBrandingPanel onNavigateHome={onNavigateHome} />
                <LoginSignUpForm onNavigateToDashboard={onNavigateToDashboard} />
                {onNavigateToCompanyDashboard && (
                    <button 
                        onClick={onNavigateToCompanyDashboard}
                        className="fixed bottom-4 right-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition z-50"
                    >
                        Company Dashboard (Temp)
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
