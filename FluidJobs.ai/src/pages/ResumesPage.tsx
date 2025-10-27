import React, { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { useProfile, Resume } from '../contexts/ProfileContext';
import DashboardLayout from '../components/DashboardLayout';

const ResumesPage: React.FC = () => {
  const { profileData, updateProfile } = useProfile();
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);



  const handleDeleteResume = (id: string) => {
    updateProfile({
      ...profileData,
      resumes: profileData.resumes.filter(r => r.id !== id),
    });
    if (selectedResumeUrl === profileData.resumes.find(r => r.id === id)?.fileUrl) {
      setSelectedResumeUrl(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_3fr] gap-8">
        {/* Resume List Panel */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Resumes</h2>
          </div>

          {profileData.resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">No resumes uploaded yet</p>
              <p className="text-xs text-gray-400">Upload resumes through Edit Profile</p>
            </div>
          ) : (
            <div className="space-y-2">
              {profileData.resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResumeUrl(resume.fileUrl)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedResumeUrl === resume.fileUrl
                      ? 'bg-[#EDE7F6] border-[#673AB7]'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resume.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(resume.uploadDate)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(resume.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Viewer Panel */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {selectedResumeUrl ? (
            <iframe
              src={selectedResumeUrl}
              className="w-full h-[calc(100vh-200px)] min-h-[600px]"
              title="Resume Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] min-h-[600px]">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                Select a resume from the list on the left to view it.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumesPage;
