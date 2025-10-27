import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService } from '../services/profileService';

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

interface ProfileData {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  maritalStatus: string;
  workStatus: string;
  currentCompany: string;
  noticePeriod: string;
  currentCTC: string;
  lastCompany: string;
  previousCTC: string;
  city: string;
  workMode: string;
  candidateId: string;
  profileImage: string | null;
  profileImageLarge: string | null;
  profileImageMedium: string | null;
  profileImageThumb: string | null;
  coverImage: string | null;
  cvUrl: string | null;
  cvName: string | null;
  resumes: Resume[];
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: ProfileData) => void;
  refreshProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    // Check sessionStorage first (for Google auth), then localStorage
    const saved = sessionStorage.getItem('fluidjobs_profile') || localStorage.getItem('profileData');
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Merge with defaults to ensure all fields exist
      return {
        fullName: parsedData.fullName || '',
        phone: parsedData.phone || '',
        email: parsedData.email || '',
        gender: parsedData.gender || '',
        maritalStatus: parsedData.maritalStatus || '',
        workStatus: parsedData.workStatus || '',
        currentCompany: parsedData.currentCompany || '',
        noticePeriod: parsedData.noticePeriod || '',
        currentCTC: parsedData.currentCTC || '',
        lastCompany: parsedData.lastCompany || '',
        previousCTC: parsedData.previousCTC || '',
        city: parsedData.city || '',
        workMode: parsedData.workMode || '',
        candidateId: parsedData.candidateId || 'FLUID-ERP-12345',
        profileImage: parsedData.profileImage || null,
        profileImageLarge: parsedData.profileImageLarge || null,
        profileImageMedium: parsedData.profileImageMedium || null,
        profileImageThumb: parsedData.profileImageThumb || null,
        coverImage: parsedData.coverImage || null,
        cvUrl: parsedData.cvUrl || null,
        cvName: parsedData.cvName || null,
        resumes: parsedData.resumes || [],
      };
    }
    return {
      fullName: '',
      phone: '',
      email: '',
      gender: '',
      maritalStatus: '',
      workStatus: '',
      currentCompany: '',
      noticePeriod: '',
      currentCTC: '',
      lastCompany: '',
      previousCTC: '',
      city: '',
      workMode: '',
      candidateId: 'FLUID-ERP-12345',
      profileImage: null,
      profileImageLarge: null,
      profileImageMedium: null,
      profileImageThumb: null,
      coverImage: null,
      cvUrl: null,
      cvName: null,
      resumes: [],
    };
  });

  const updateProfile = (data: ProfileData) => {
    setProfileData(data);
    localStorage.setItem('profileData', JSON.stringify(data));
    sessionStorage.setItem('fluidjobs_profile', JSON.stringify(data));
  };

  // Listen for profile updates from sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = sessionStorage.getItem('fluidjobs_profile');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setProfileData(prev => ({
          ...prev,
          ...parsedData
        }));
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check immediately
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const refreshProfile = () => {
    const saved = sessionStorage.getItem('fluidjobs_profile') || localStorage.getItem('profileData');
    if (saved) {
      const parsedData = JSON.parse(saved);
      setProfileData({
        fullName: parsedData.fullName || '',
        phone: parsedData.phone || '',
        email: parsedData.email || '',
        gender: parsedData.gender || '',
        maritalStatus: parsedData.maritalStatus || '',
        workStatus: parsedData.workStatus || '',
        currentCompany: parsedData.currentCompany || '',
        noticePeriod: parsedData.noticePeriod || '',
        currentCTC: parsedData.currentCTC || '',
        lastCompany: parsedData.lastCompany || '',
        previousCTC: parsedData.previousCTC || '',
        city: parsedData.city || '',
        workMode: parsedData.workMode || '',
        candidateId: parsedData.candidateId || 'FLUID-ERP-12345',
        profileImage: parsedData.profileImage || null,
        profileImageLarge: parsedData.profileImageLarge || null,
        profileImageMedium: parsedData.profileImageMedium || null,
        profileImageThumb: parsedData.profileImageThumb || null,
        coverImage: parsedData.coverImage || null,
        cvUrl: parsedData.cvUrl || null,
        cvName: parsedData.cvName || null,
        resumes: parsedData.resumes || [],
      });
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};

export type { Resume, ProfileData };
export type { ProfileContextType };
