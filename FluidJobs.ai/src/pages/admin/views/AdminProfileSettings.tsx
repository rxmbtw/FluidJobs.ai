import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Camera } from 'lucide-react';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

interface AdminDashboardContextType {
    admin: any;
}

const AdminProfileSettings: React.FC = () => {
    const { admin } = useOutletContext<AdminDashboardContextType>();

    const [profileData, setProfileData] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

    useEffect(() => {
        setProfileData({
            name: admin.name || '',
            email: admin.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    }, [admin]);

    const handleSaveProfile = async () => {
        try {
            if (!profileData.name || !profileData.email) {
                setErrorMessage({
                    title: 'Validation Error',
                    message: 'Name and email are required'
                });
                setShowErrorModal(true);
                return;
            }

            if (profileData.newPassword) {
                if (!profileData.currentPassword) {
                    setErrorMessage({
                        title: 'Validation Error',
                        message: 'Current password is required to set new password'
                    });
                    setShowErrorModal(true);
                    return;
                }
                if (profileData.newPassword !== profileData.confirmPassword) {
                    setErrorMessage({
                        title: 'Validation Error',
                        message: 'New passwords do not match'
                    });
                    setShowErrorModal(true);
                    return;
                }
                if (profileData.newPassword.length < 8) {
                    setErrorMessage({
                        title: 'Validation Error',
                        message: 'Password must be at least 8 characters'
                    });
                    setShowErrorModal(true);
                    return;
                }
            }

            const response = await axios.put<{
                success: boolean;
                message: string;
                user: {
                    id: number;
                    name: string;
                    email: string;
                    profile_picture: string | null;
                };
            }>('http://localhost:8000/api/auth/profile', {
                id: admin.id,
                name: profileData.name,
                email: profileData.email,
                currentPassword: profileData.currentPassword || undefined,
                newPassword: profileData.newPassword || undefined,
                profilePicture: profilePicture || undefined
            });

            const updatedAdmin = {
                ...admin,
                name: response.data.user.name,
                email: response.data.user.email,
                profile_picture: response.data.user.profile_picture
            };
            sessionStorage.setItem('fluidjobs_user', JSON.stringify(updatedAdmin));

            setProfileData({
                ...profileData,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setSuccessMessage({
                title: 'Success!',
                message: 'Profile updated successfully'
            });
            setShowSuccessModal(true);

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setErrorMessage({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to update profile'
            });
            setShowErrorModal(true);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Update your personal information</p>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                                ) : (
                                    <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                                        {admin.name?.charAt(0) || 'A'}
                                    </div>
                                )}
                                <button
                                    onClick={() => document.getElementById('profile-picture-input')?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    id="profile-picture-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setProfilePicture(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
                                <p className="text-xs text-gray-600">JPG, PNG or GIF. Max size 2MB</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Change Password Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-base font-semibold text-gray-900 mb-4">Change Password</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={profileData.currentPassword}
                                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.newPassword}
                                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={profileData.confirmPassword}
                                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => {
                                    setProfileData({ name: admin.name || '', email: admin.email || '', currentPassword: '', newPassword: '', confirmPassword: '' });
                                    setProfilePicture(null);
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showSuccessModal && (
                <SuccessModal
                    isOpen={showSuccessModal}
                    title={successMessage.title}
                    message={successMessage.message}
                    onClose={() => setShowSuccessModal(false)}
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

export default AdminProfileSettings;
