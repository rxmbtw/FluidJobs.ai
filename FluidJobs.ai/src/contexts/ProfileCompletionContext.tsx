import React, { createContext, useContext, useState } from 'react';

interface ProfileCompletionContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export const ProfileCompletionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProfileCompletionContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ProfileCompletionContext.Provider>
  );
};

export const useProfileCompletionContext = () => {
  const context = useContext(ProfileCompletionContext);
  if (!context) {
    throw new Error('useProfileCompletionContext must be used within ProfileCompletionProvider');
  }
  return context;
};