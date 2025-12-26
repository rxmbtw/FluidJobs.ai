import React, { useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useProfile } from '../../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';

const DesktopMyResume: React.FC = () => {
  const { profileData, updateProfile } = useProfile();
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDeleteResume = (id: string) => {
    updateProfile({
      ...profileData,
      resumes: profileData.resumes.filter(r => r.id !== id),
    });
    if (selectedResumeUrl === profileData.resumes.find(r => r.id === id)?.fileUrl) {
      setSelectedResumeUrl(null);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Resume</h1>
          <button
            onClick={() => navigate('/edit-profile')}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,1fr)_3fr] gap-6">
          {/* Resume List Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Resumes</h2>

            {profileData.resumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No resumes uploaded yet</p>
                <p className="text-xs text-gray-400">Upload resumes through Edit Profile</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profileData.resumes.map((resume, index) => {
                  const resumeUrl = (resume as any).url || resume.fileUrl;
                  const resumeName = (resume as any).name || resume.fileName || `Resume ${index + 1}`;
                  const uploadDate = (resume as any).uploadedAt || resume.uploadDate;
                  
                  return (
                    <div
                      key={resume.id || index}
                      onClick={() => setSelectedResumeUrl(resumeUrl)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedResumeUrl === resumeUrl
                          ? 'bg-purple-50 border-purple-600'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {resumeName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(uploadDate)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResume(resume.id || index.toString());
                          }}
                          className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PDF Viewer Panel */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {selectedResumeUrl ? (
              <div className="h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Resume Viewer</h3>
                </div>
                <div className="flex-1 bg-gray-100">
                  <iframe
                    src={selectedResumeUrl}
                    className="w-full h-full border-0"
                    title="Resume PDF Viewer"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] min-h-[600px]">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center">
                  Select a resume from the list to view it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopMyResume;
