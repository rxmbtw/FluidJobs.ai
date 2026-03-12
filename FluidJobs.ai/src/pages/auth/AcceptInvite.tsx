import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const AcceptInvite: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState('');
    const [inviteData, setInviteData] = useState<{ email: string; role: string } | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('No invitation token provided.');
                setIsValidating(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get<{ valid: boolean; email: string; role: string }>(`http://localhost:8000/api/auth/validate-invite/${token}`);
                if (response.data.valid) {
                    setInviteData({ email: response.data.email, role: response.data.role });
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Invalid or expired invitation link.');
            } finally {
                setIsValidating(false);
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post('http://localhost:8000/api/auth/accept-invite', {
                token,
                password
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to set password. Please try again.');
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Validating your invitation...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex items-center justify-center gap-3 mt-6">
                    <img
                        src="/images/FLuid Live Icon light theme.png"
                        alt="FluidJobs.ai Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <h2 className="text-3xl font-semibold" style={{ color: '#2563EB' }}>
                        FluidJobs.ai
                    </h2>
                </div>
                <h2 className="mt-2 text-center text-xl font-medium text-gray-600">
                    Welcome to the team
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {success ? (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Password Set Successfully!</h3>
                            <p className="text-gray-500 mb-6">Your account is now ready. Please log in with your credentials.</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                                {error}
                            </div>
                            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Go to Login Page
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Setting up account for: <br />
                                    <span className="font-semibold text-gray-900">{inviteData?.email}</span>
                                </p>
                                <p className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded mt-2 uppercase tracking-wide font-semibold">
                                    Role: {inviteData?.role}
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Set a Password
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="At least 8 characters"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                                ) : (
                                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Confirm Password
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Set Password & Login'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;
