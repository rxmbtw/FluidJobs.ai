import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

const AdminCreateUser: React.FC = () => {
    const navigate = useNavigate();

    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: '' });
    const [creatingUser, setCreatingUser] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<{ [key: string]: boolean }>({});

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

    const checkEmailExists = async (email: string) => {
        if (!email || !email.includes('@')) {
            setEmailError('');
            return;
        }

        setCheckingEmail(true);
        try {
            const token = sessionStorage.getItem('fluidjobs_token');
            const response = await fetch('/api/admin/users/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.exists) {
                setEmailError('This email is already registered.');
            } else {
                setEmailError('');
            }
        } catch (error) {
            console.error('Error checking email:', error);
        } finally {
            setCheckingEmail(false);
        }
    };

    const fetchRolePermissions = async (role: string) => {
        if (!role) {
            setAvailablePermissions([]);
            setSelectedPermissions({});
            return;
        }

        try {
            const token = sessionStorage.getItem('fluidjobs_token');
            const response = await fetch(`/api/auth/roles/${role}/permissions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvailablePermissions(data.permissions);
                const defaultPermissions: { [key: string]: boolean } = {};
                data.permissions.forEach((perm: any) => {
                    defaultPermissions[perm.name] = perm.has_permission;
                });
                setSelectedPermissions(defaultPermissions);
            } else {
                const basicPermissions = [
                    { name: 'view_jobs', description: 'View Jobs', category: 'jobs', has_permission: true, source: 'role' },
                    { name: 'create_jobs', description: 'Create Jobs', category: 'jobs', has_permission: role === 'Admin' || role === 'Recruiter', source: 'role' },
                    { name: 'view_candidates', description: 'View Candidates', category: 'candidates', has_permission: true, source: 'role' },
                    { name: 'manage_candidates', description: 'Manage Candidates', category: 'candidates', has_permission: role === 'Admin' || role === 'HR', source: 'role' }
                ];
                setAvailablePermissions(basicPermissions);
                const defaultPermissions: { [key: string]: boolean } = {};
                basicPermissions.forEach((perm: any) => {
                    defaultPermissions[perm.name] = perm.has_permission;
                });
                setSelectedPermissions(defaultPermissions);
            }
        } catch (error) {
            console.error('Error fetching role permissions:', error);
        }
    };

    const handlePermissionToggle = (permissionName: string, granted: boolean) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [permissionName]: granted
        }));
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.role) {
            setErrorMessage({
                title: 'Missing Fields',
                message: 'Please fill in all required fields'
            });
            setShowErrorModal(true);
            return;
        }

        if (emailError) {
            setErrorMessage({
                title: 'Email Error',
                message: 'Please use a different email address'
            });
            setShowErrorModal(true);
            return;
        }

        setCreatingUser(true);
        try {
            const token = sessionStorage.getItem('fluidjobs_token');
            const response = await fetch('/api/auth/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    phone: newUser.phone,
                    customPermissions: Object.entries(selectedPermissions).map(([name, granted]) => ({ name, granted }))
                })
            });

            if (response.ok) {
                const data = await response.json();
                setNewUser({ name: '', email: '', phone: '', role: '' });
                setEmailError('');
                setAvailablePermissions([]);
                setSelectedPermissions({});
                setSuccessMessage({
                    title: 'User Created & Invited!',
                    message: `User created successfully! An email invitation has been sent to ${newUser.email}.`
                });
                setShowSuccessModal(true);
                // Navigate back to settings after success modal close (handled by user action usually, but here we can wait)
            } else {
                const error = await response.json();
                setErrorMessage({
                    title: 'Error',
                    message: error.error || 'Failed to create user'
                });
                setShowErrorModal(true);
            }
        } catch (error) {
            console.error('Error creating user:', error);
            setErrorMessage({
                title: 'Error',
                message: 'Failed to create user'
            });
            setShowErrorModal(true);
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Create New User</h1>
                <p className="text-gray-600">Add a new user to the system</p>
            </div>
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-6xl mx-auto">
                    <div className="flex gap-6">
                        {/* Left Container - Form Fields */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">User Details</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        onBlur={(e) => checkEmailExists(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailError ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter email address"
                                    />
                                    {checkingEmail && <p className="text-xs text-blue-500 mt-1">Checking email...</p>}
                                    {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <div className="flex">
                                        <select className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 bg-white text-center">
                                            <option value="+1">Code</option>
                                        </select>
                                        <input
                                            type="tel"
                                            placeholder="9284xxxxxx"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 border-l-0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                                    <div className="relative role-dropdown-container">
                                        <button
                                            type="button"
                                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between"
                                        >
                                            <span>{newUser.role || 'Select role'}</span>
                                            <svg className={`w-5 h-5 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {showRoleDropdown && (
                                            <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                                <div className="p-2">
                                                    {['Recruiter', 'HR', 'Interviewer'].map(role => (
                                                        <div
                                                            key={role}
                                                            onClick={() => {
                                                                setNewUser({ ...newUser, role });
                                                                setShowRoleDropdown(false);
                                                                fetchRolePermissions(role);
                                                            }}
                                                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                                                        >
                                                            {role}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Container - Permissions */}
                        {newUser.role && availablePermissions.length > 0 && (
                            <div className="flex-1 bg-blue-50 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-medium text-blue-900">{newUser.role} Permissions</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                const defaults: { [key: string]: boolean } = {};
                                                availablePermissions.forEach(p => defaults[p.name] = p.has_permission);
                                                setSelectedPermissions(defaults);
                                            }}
                                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium"
                                        >
                                            Standard
                                        </button>
                                        <button
                                            onClick={() => {
                                                const readOnly: { [key: string]: boolean } = {};
                                                availablePermissions.forEach(p => readOnly[p.name] = p.name.startsWith('view_'));
                                                setSelectedPermissions(readOnly);
                                            }}
                                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 hover:bg-gray-300 rounded font-medium"
                                        >
                                            Read-Only
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-4">
                                    {Object.entries(availablePermissions.reduce((acc: Record<string, any[]>, perm: any) => {
                                        if (!acc[perm.category]) acc[perm.category] = [];
                                        acc[perm.category].push(perm);
                                        return acc;
                                    }, {})).map(([category, permissions]) => (
                                        <div key={category} className="bg-white rounded-lg p-4">
                                            <h5 className="text-sm font-semibold text-gray-800 mb-3 capitalize">
                                                {category.replace('_', ' ')}
                                            </h5>
                                            <div className="space-y-2">
                                                {(permissions as any[]).map((perm: any) => (
                                                    <div key={perm.name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-700">{perm.description}</span>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {perm.source === 'custom' ? 'Custom' : 'Role Default'}
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions[perm.name] || false}
                                                            onChange={(e) => handlePermissionToggle(perm.name, e.target.checked)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-gray-200 my-6" />

                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                navigate('/admin-dashboard/settings');
                            }}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateUser}
                            disabled={creatingUser || !newUser.name || !newUser.email || !newUser.role || !!emailError || checkingEmail}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            <span>{creatingUser ? 'Creating...' : 'Create & Send Invite'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <SuccessModal
                    isOpen={showSuccessModal}
                    title={successMessage.title}
                    message={successMessage.message}
                    onClose={() => {
                        setShowSuccessModal(false);
                        navigate('/admin-dashboard/settings');
                    }}
                />
            )}

            {showErrorModal && (
                <ErrorModal
                    isOpen={showErrorModal}
                    title={errorMessage.title}
                    message={errorMessage.message}
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
};

export default AdminCreateUser;
