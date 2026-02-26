import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users } from 'lucide-react';

interface AdminDashboardContextType {
    accounts: any[];
}

const AdminAccounts: React.FC = () => {
    const { accounts } = useOutletContext<AdminDashboardContextType>();

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">My Accounts</h1>
                <p className="text-gray-600">Accounts assigned to you for job management.</p>
            </div>

            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    {accounts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {accounts.map((account) => (
                                <div key={account.account_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {account.status || 'Active'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Active Jobs:</span> {account.active_jobs || 0}
                                        </div>
                                        <div>
                                            <span className="font-medium">Location:</span> {account.locations || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Completed Jobs:</span> {account.completed_jobs || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Accounts Assigned</h3>
                            <p className="text-gray-600">You don't have any accounts assigned to you yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAccounts;
