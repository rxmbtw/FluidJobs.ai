import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Mail, Check, X } from 'lucide-react';
import SuccessModal from '../../../components/SuccessModal';
import ErrorModal from '../../../components/ErrorModal';

interface AdminDashboardContextType {
    jobs: any[];
}

const AdminSendInvite: React.FC = () => {
    const { jobs } = useOutletContext<AdminDashboardContextType>();

    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [invitePhone, setInvitePhone] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);
    const [showJobDropdown, setShowJobDropdown] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState({ title: '', message: '' });

    const handleSendInvite = async () => {
        if (!inviteEmail || !inviteName || !selectedJobId) {
            setErrorMessage({
                title: 'Validation Error',
                message: 'Please fill in all required fields'
            });
            setShowErrorModal(true);
            return;
        }

        try {
            setSendingInvite(true);
            const token = sessionStorage.getItem('fluidjobs_token');

            // Get the current URL to build the invite link
            // Assuming the invite link format is standard
            const inviteLink = `${window.location.origin}/apply/${selectedJobId}?invite=${btoa(inviteEmail)}`;

            await axios.post('http://localhost:8000/api/candidates/invite', {
                email: inviteEmail,
                name: inviteName,
                phone: invitePhone,
                job_id: selectedJobId,
                invite_link: inviteLink
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage({
                title: 'Invitation Sent',
                message: `Successfully sent invitation to ${inviteEmail}`
            });
            setShowSuccessModal(true);

            // Reset form
            setInviteEmail('');
            setInviteName('');
            setInvitePhone('');
            setSelectedJobId('');

        } catch (error: any) {
            console.error('Error sending invite:', error);
            setErrorMessage({
                title: 'Error',
                message: error.response?.data?.error || 'Failed to send invitation'
            });
            setShowErrorModal(true);
        } finally {
            setSendingInvite(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Send Invitation</h1>
                <p className="text-gray-600">Invite candidates to apply for job openings</p>
            </div>
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Send Invitation</h2>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="Enter candidate name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={invitePhone}
                                    onChange={(e) => setInvitePhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Opening *</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowJobDropdown(!showJobDropdown)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 flex items-center justify-between transition"
                                    >
                                        <span>{selectedJobId ? jobs.find(job => job.job_id.toString() === selectedJobId)?.job_title || 'Select a job opening' : 'Select a job opening'}</span>
                                        <svg className={`w-5 h-5 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {showJobDropdown && (
                                        <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                            <div className="p-2">
                                                {jobs.map(job => (
                                                    <div
                                                        key={job.job_id}
                                                        onClick={() => {
                                                            setSelectedJobId(job.job_id.toString());
                                                            setShowJobDropdown(false);
                                                        }}
                                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm rounded-lg text-gray-900 mb-1 transition-colors"
                                                    >
                                                        <div className="font-medium">{job.job_title}</div>
                                                        <div className="text-xs text-gray-500">{job.department} • {job.location}</div>
                                                    </div>
                                                ))}
                                                {jobs.length === 0 && (
                                                    <div className="px-3 py-2 text-sm text-gray-500 text-center">No active jobs found</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleSendInvite}
                                disabled={sendingInvite || !inviteEmail || !inviteName || !selectedJobId}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {sendingInvite ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail size={20} />
                                        <span>Send Invitation</span>
                                    </>
                                )}
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

export default AdminSendInvite;
