import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Mail, Upload } from 'lucide-react';

interface AdminDashboardContextType {
    admin: any;
}

const AdminCreateCandidate: React.FC = () => {
    const navigate = useNavigate();
    const { admin } = useOutletContext<AdminDashboardContextType>();

    const userRole = admin.role || 'User';
    const canSendInvites = ['Admin', 'HR', 'Recruiter'].includes(userRole);
    const canBulkImport = ['Admin', 'HR'].includes(userRole);

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Create Candidate</h1>
                <p className="text-gray-600">Choose how you want to add candidates to the system</p>
            </div>
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Send Invite Container */}
                    {canSendInvites && (
                        <div
                            onClick={() => navigate('/admin-dashboard/create-candidate/send-invitation')}
                            className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Send Invite</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Send personalized invitations to candidates via email. Include job details and application links.
                                </p>
                                <div className="mt-6">
                                    <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium group-hover:bg-blue-700 transition-colors">
                                        Invite
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Import Container */}
                    {canBulkImport && (
                        <div
                            onClick={() => navigate('/admin-dashboard/create-candidate/bulk-import')}
                            className="bg-white rounded-xl border-2 border-gray-200 p-8 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                                    <Upload className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Bulk Import</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Import multiple candidates at once using CSV or Excel files. Perfect for large-scale recruitment.
                                </p>
                                <div className="mt-6">
                                    <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium group-hover:bg-green-700 transition-colors">
                                        Import
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCreateCandidate;
