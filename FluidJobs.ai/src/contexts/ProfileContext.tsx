import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('profileData');
    return saved ? JSON.parse(saved) : {
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
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
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
