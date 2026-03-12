import React, { useEffect, useState } from 'react';
import CandidateTracker from '../new-dashboard/CandidateTracker';
import CandidateProfile from '../new-dashboard/CandidateProfile';
import { useNavigate, useParams } from 'react-router-dom';
import { Candidate } from '../new-dashboard/types';
import { CandidateService } from '../../services/candidateService';

const CandidatesWrapper: React.FC<{ isSuperAdmin?: boolean }> = ({ isSuperAdmin = false }) => {
    const navigate = useNavigate();
    const { candidateId } = useParams<{ candidateId: string }>();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCandidate = async () => {
            if (candidateId) {
                setLoading(true);
                try {
                    const candidate = await CandidateService.getCandidateById(candidateId);
                    setSelectedCandidate(candidate);
                } catch (err) {
                    console.error('Error fetching candidate:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setSelectedCandidate(null);
            }
        };
        fetchCandidate();
    }, [candidateId]);

    useEffect(() => {
        const handleOpenCandidateProfile = (event: CustomEvent) => {
            const { candidateId, candidateName } = event.detail;
            console.log('CandidatesWrapper received event:', { candidateId, candidateName });

            // Navigate to the profile URL using relative path
            if (candidateId) {
                navigate(`candidates/${candidateId}`);
            }
        };

        window.addEventListener('openCandidateProfile', handleOpenCandidateProfile as EventListener);
        return () => {
            window.removeEventListener('openCandidateProfile', handleOpenCandidateProfile as EventListener);
        };
    }, [navigate, isSuperAdmin]);

    const handleAddCandidate = () => {
        navigate('create-candidate');
    };

    const handleViewProfile = (id: string) => {
        navigate(`candidates/${id}`);
    };

    const handleBack = () => {
        navigate(`candidates`);
    };

    if (candidateId) {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!selectedCandidate) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>Candidate not found.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Candidates
                    </button>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col bg-gray-50">
                <CandidateProfile
                    candidate={selectedCandidate}
                    onBack={handleBack}
                    onStageUpdate={async () => { /* Implement if needed */ }}
                    onCandidateUpdate={(updated) => setSelectedCandidate(updated)}
                    onDirtyChange={() => { }}
                />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto p-6">
                <CandidateTracker
                    onAddCandidate={handleAddCandidate}
                    onViewProfile={handleViewProfile}
                />
            </div>
        </div>
    );
};

export default CandidatesWrapper;
