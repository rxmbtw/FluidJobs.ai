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
            const response = await axios.post<{ token?: string; user: { role: string } }>('http://localhost:8000/api/auth/accept-invite', {
                token,
                password
            });

            if (response.data.token) {
                const userRole = response.data.user.role;
                if (userRole === 'SuperAdmin') {
                    localStorage.setItem('superadmin_token', response.data.token);
                    localStorage.setItem('superadmin', JSON.stringify(response.data.user));
                } else {
                    localStorage.setItem('admin_token', response.data.token);
                    localStorage.setItem('admin', JSON.stringify(response.data.user));
                }
            }

            setSuccess(true);

            setTimeout(() => {
                if (inviteData?.role === 'SuperAdmin') {
                    navigate('/superadmin-dashboard');
                } else {
                    navigate('/admin-dashboard');
                }
            }, 3000);

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
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    FluidJobs.ai
                </h2>
                <h2 className="mt-2 text-center text-xl font-medium text-gray-600">
                    Welcome to the team
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {success ? (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Account Setup Complete!</h3>
                            <p className="text-gray-500 mb-6">Your password has been set successfully.</p>
                            <p className="text-sm text-gray-400">Redirecting to your dashboard...</p>
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
