import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordModal from '../ForgotPasswordModal';
import { useAuth } from '../../contexts/AuthProvider';
import Loader from '../Loader';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574 c0,0,0,0,0,0l6.19,5.238c-0.438-0.382,6.355-5.938,6.355-15.812C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const LinkedInIcon: React.FC = () => (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(66, 133, 244, 1)">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
    </svg>
);

const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);

const handleGoogleSignIn = (role: string = 'Candidate') => {
    window.location.href = `${API_BASE}/api/auth/google?role=${role}`;
};

const handleLinkedInSignIn = (role: string = 'Candidate') => {
    window.location.href = `${API_BASE}/api/auth/linkedin?role=${role}`;
};

interface LoginSignUpFormProps {
    onNavigateToDashboard?: () => void;
    onNavigateToComingSoon?: () => void;
    onNavigateToRegistrationSuccess?: () => void;
}

const LoginSignUpForm: React.FC<LoginSignUpFormProps> = ({ onNavigateToDashboard, onNavigateToComingSoon, onNavigateToRegistrationSuccess }) => {
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        setError('');
        setLoading(true);
        try {
            // Try superadmin login first
            try {
                const superadminResponse = await fetch(`${API_BASE}/api/superadmin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (superadminResponse.ok) {
                    const data = await superadminResponse.json();
                    localStorage.setItem('superadmin_token', data.token);
                    localStorage.setItem('superadmin', JSON.stringify(data.admin));
                    navigate('/superadmin/dashboard');
                    return;
                }
            } catch (superadminError) {
                console.log('Not a superadmin, trying other logins...');
            }

            // Force admin login for specific emails
            if (email === 'meetpandya@fluid.live') {
                try {
                    const adminResponse = await fetch(`${API_BASE}/api/auth/admin/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    if (adminResponse.ok) {
                        const data = await adminResponse.json();
                        sessionStorage.clear();
                        localStorage.setItem('token', data.token);
                        sessionStorage.setItem('fluidjobs_token', data.token);
                        sessionStorage.setItem('fluidjobs_user', JSON.stringify(data.user));

                        // Trigger user updated event to update AuthProvider
                        window.dispatchEvent(new Event('userUpdated'));

                        // Small delay to ensure AuthProvider updates
                        setTimeout(() => {
                            navigate('/company-dashboard');
                        }, 100);
                        return;
                    } else {
                        const errorData = await adminResponse.json().catch(() => ({ error: 'Invalid credentials' }));
                        throw new Error(errorData.error);
                    }
                } catch (error: any) {
                    throw new Error(error.message || 'Admin login failed');
                }
            }

            // Try admin login first for other emails
            try {
                const adminResponse = await fetch(`${API_BASE}/api/auth/admin/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (adminResponse.ok) {
                    const data = await adminResponse.json();
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('fluidjobs_token', data.token);
                    sessionStorage.setItem('fluidjobs_user', JSON.stringify(data.user));

                    // Trigger user updated event to update AuthProvider
                    window.dispatchEvent(new Event('userUpdated'));

                    // Small delay to ensure AuthProvider updates
                    setTimeout(() => {
                        navigate('/company-dashboard');
                    }, 100);
                    return;
                }
            } catch (adminError) {
                console.log('❌ Admin login network error:', adminError);
            }

            // If not admin, try candidate login
            await login(email, password);
            // Force navigation to candidate dashboard after successful login
            navigate('/candidate-dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full md:w-1/2 flex items-center justify-center relative p-12" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(199, 220, 255, 0.6) 100%)' }}>
            {/* Logo Header - Top Center */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                <img src="/images/FLuid Live Icon light theme.png" alt="FluidJobs.ai Logo" className="h-8 w-8 object-contain" />
                <span className="text-xl font-bold" style={{ color: 'rgba(66, 133, 244, 1)' }}>FluidJobs.ai</span>
            </div>

            <div className="w-full max-w-xl flex flex-col">
                <div className="text-center mb-8 flex-grow flex flex-col justify-center">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'rgba(0, 0, 0, 1)' }}>Welcome Back</h1>
                    <p className="text-sm" style={{ color: 'rgba(96, 96, 96, 1)' }}>Sign in to access your dashboard</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 1)' }}>Username</label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(96, 96, 96, 0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 pl-10 rounded-lg"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(99, 99, 99, 0.2)', color: 'rgba(0, 0, 0, 1)' }}
                                placeholder="enter email address or phone no."
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 1)' }}>Password</label>
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(96, 96, 96, 0.6)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 pl-10 pr-10 rounded-lg"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(99, 99, 99, 0.2)', color: 'rgba(0, 0, 0, 1)' }}
                                placeholder="enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                                style={{ color: 'rgba(96, 96, 96, 0.6)' }}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className="text-sm hover:underline"
                                style={{ color: 'rgba(66, 133, 244, 1)' }}
                            >
                                Forgot Your Password?
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                        style={{ backgroundColor: 'rgba(66, 133, 244, 1)' }}
                        disabled={loading}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.9)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 1)'}
                    >
                        {loading ? <Loader themeState="light" /> : 'Log In'}
                    </button>
                </form>

                <div className="flex items-center space-x-3 my-6">
                    <hr className="flex-1" style={{ borderColor: 'rgba(99, 99, 99, 0.2)' }} />
                    <span className="text-sm" style={{ color: 'rgba(96, 96, 96, 1)' }}>Or Login With</span>
                    <hr className="flex-1" style={{ borderColor: 'rgba(99, 99, 99, 0.2)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => handleGoogleSignIn('Candidate')} className="py-3 rounded-lg font-medium flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(99, 99, 99, 0.2)' }}>
                        <GoogleIcon />
                    </button>
                    <button onClick={() => handleLinkedInSignIn('Candidate')} className="py-3 rounded-lg font-medium flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(99, 99, 99, 0.2)' }}>
                        <LinkedInIcon />
                    </button>
                </div>

                <div className="text-center text-sm">
                    <span style={{ color: 'rgba(96, 96, 96, 1)' }}>Don't Have An Account? </span>
                    <button onClick={() => navigate('/candidate-registration')} className="hover:underline font-medium" style={{ color: 'rgba(66, 133, 244, 1)' }}>Register as a Candidate</button>
                    <br />
                    <span style={{ color: 'rgba(96, 96, 96, 1)' }}>Or, </span>
                    <button onClick={onNavigateToComingSoon} className="hover:underline font-medium" style={{ color: 'rgba(66, 133, 244, 1)' }}>Register as a Company.</button>
                </div>
            </div>
            <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
        </div>
    );
};

export default LoginSignUpForm;