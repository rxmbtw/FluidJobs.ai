import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobCreationForm from '../../../components/admin/JobCreationForm';

const AdminCreateJob: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-shrink-0 bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-900">Create New Job</h1>
                <p className="text-gray-600">Create a new job opening for approval</p>
            </div>
            <div className="flex-1 overflow-auto px-8 py-6">
                <JobCreationForm
                    onBack={() => {
                        navigate('/admin-dashboard/jobs');
                    }}
                    isSuperAdmin={false}
                />
            </div>
        </div>
    );
};

export default AdminCreateJob;
