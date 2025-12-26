import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import BasicDetailsPage from './BasicDetailsPage';
import ContactDetailsPage from './ContactDetailsPage';

interface ResumeProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResumeProfileForm: React.FC<ResumeProfileFormProps> = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showBasicDetails, setShowBasicDetails] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  if (!isOpen) return null;

  const sections = [
    { id: 'basic', label: 'Basic Details', color: '#FF6B6B' },
    { id: 'contact', label: 'Contact Details', color: '#4ECDC4' },
    { id: 'education', label: 'Education', color: '#45B7D1' },
    { id: 'attachments', label: 'Attachments', color: '#96CEB4' },
    { id: 'family', label: 'Family Details', color: '#FFEAA7' },
    { id: 'experience', label: 'Professional Experience', color: '#DFE6E9' },
    { id: 'internship', label: 'Internship', color: '#74B9FF' },
    { id: 'projects', label: 'Projects', color: '#A29BFE' },
    { id: 'publications', label: 'Publications / Research / White Papers', color: '#FD79A8' },
    { id: 'seminars', label: 'Seminars / Trainings / Workshops', color: '#FDCB6E' },
    { id: 'certification', label: 'Certification / Assessments', color: '#6C5CE7' },
    { id: 'responsibility', label: 'Positions of Responsibility', color: '#00B894' },
    { id: 'other', label: 'Other Details', color: '#00CEC9' },
    { id: 'references', label: 'References', color: '#0984E3' },
    { id: 'placement', label: 'Placement Policy', color: '#B2BEC3' }
  ];

  const toggleSection = (sectionId: string) => {
    if (sectionId === 'basic') {
      setShowBasicDetails(true);
    } else if (sectionId === 'contact') {
      setShowContactDetails(true);
    } else {
      setExpandedSection(expandedSection === sectionId ? null : sectionId);
    }
  };

  const handleGenerateResume = () => {
    console.log('Generate Resume clicked');
    // Handle resume generation
  };

  const handleUploadResume = () => {
    console.log('Upload Resume clicked');
    // Handle resume upload
  };

  return (
    <>
      <BasicDetailsPage isOpen={showBasicDetails} onClose={() => setShowBasicDetails(false)} />
      <ContactDetailsPage isOpen={showContactDetails} onClose={() => setShowContactDetails(false)} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#FFFFFF',
        zIndex: 10000,
        overflow: 'hidden'
      }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        background: '#FFFFFF'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft style={{ width: '24px', height: '24px', color: '#000000' }} />
        </button>
        <h2 style={{
          fontFamily: 'Poppins',
          fontSize: '18px',
          fontWeight: 600,
          color: '#000000',
          marginLeft: '12px'
        }}>
          Resume Profile
        </h2>
      </div>

      {/* Scrollable Content */}
      <div style={{
        height: 'calc(100vh - 72px - 76px)',
        overflowY: 'auto',
        padding: '16px'
      }}>
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              marginBottom: '12px',
              overflow: 'hidden'
            }}
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{
                fontFamily: 'Poppins',
                fontSize: '15px',
                fontWeight: 500,
                color: '#000000'
              }}>
                {section.label}
              </span>
              <ChevronRight
                style={{
                  width: '20px',
                  height: '20px',
                  color: '#9CA3AF',
                  transform: expandedSection === section.id ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            </button>

            {/* Section Content - Placeholder for now */}
            {expandedSection === section.id && (
              <div style={{
                padding: '16px',
                borderTop: '1px solid #E5E7EB',
                background: '#F9FAFB'
              }}>
                <p style={{
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  color: '#6E6E6E',
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  Form fields for {section.label} will be added here
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '16px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={handleUploadResume}
          style={{
            flex: 1,
            padding: '14px',
            background: '#FFFFFF',
            border: '2px solid #4285F4',
            borderRadius: '12px',
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: 600,
            color: '#4285F4',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Upload style={{ width: '18px', height: '18px' }} />
          Upload Resume
        </button>
        <button
          onClick={handleGenerateResume}
          style={{
            flex: 1,
            padding: '14px',
            background: '#4285F4',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'Poppins',
            fontSize: '15px',
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          Generate Resume
        </button>
      </div>
    </div>
    </>
  );
};

export default ResumeProfileForm;
