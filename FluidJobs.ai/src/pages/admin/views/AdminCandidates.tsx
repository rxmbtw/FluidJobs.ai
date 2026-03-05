import React from 'react';
import CandidatesWrapper from '../../../components/admin/CandidatesWrapper';

const AdminCandidates: React.FC = () => {
    return (
        <div className="flex flex-col flex-1 overflow-hidden h-full">
            <div className="flex-1 overflow-hidden">
                <CandidatesWrapper />
            </div>
        </div>
    );
};

export default AdminCandidates;
