import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import savedJobsService from '../services/savedJobsService';

interface SaveJobButtonProps {
  jobId: string | number;
  className?: string;
  showText?: boolean;
}

const SaveJobButton: React.FC<SaveJobButtonProps> = ({ 
  jobId, 
  className = '', 
  showText = false 
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [jobId]);

  const checkIfSaved = async () => {
    try {
      // Only check if user is authenticated
      const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
      if (!token) {
        setIsSaved(false);
        return;
      }
      
      const numericJobId = typeof jobId === 'string' ? parseInt(jobId) : jobId;
      const saved = await savedJobsService.isJobSaved(numericJobId);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking saved status:', error);
      setIsSaved(false);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('fluidjobs_token');
    if (!token) {
      alert('Please log in to save jobs.');
      return;
    }
    
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId) : jobId;
    console.log('Toggling save for job ID:', numericJobId);
    setLoading(true);
    try {
      if (isSaved) {
        console.log('Unsaving job...');
        await savedJobsService.unsaveJob(numericJobId);
        setIsSaved(false);
        console.log('Job unsaved successfully');
      } else {
        console.log('Saving job...');
        await savedJobsService.saveJob(numericJobId);
        setIsSaved(true);
        console.log('Job saved successfully');
      }
    } catch (error: any) {
      console.error('Error toggling save status:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Your session has expired. Please log in again to save jobs.');
      } else if (error.response?.status === 400 && error.response?.data?.error === 'Job already saved') {
        alert('This job is already saved.');
        setIsSaved(true);
      } else {
        alert('Failed to save job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`
        flex items-center justify-center transition-all duration-200
        ${isSaved 
          ? 'text-blue-600 hover:text-blue-700' 
          : 'text-gray-400 hover:text-blue-600'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      title={isSaved ? 'Remove from saved jobs' : 'Save job'}
    >
      <Bookmark 
        className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} 
      />
      {showText && (
        <span className="ml-2 text-sm font-medium">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default SaveJobButton;