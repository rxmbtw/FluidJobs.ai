import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { profileService } from '../services/profileService';

export type UserRole = 'Admin' | 'HR' | 'Candidate' | 'Client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  googleLogin: (token: string) => Promise<{ user: User; token: string; isNewUser: boolean }>;
  updateUserRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserProfile();
    }
    setLoading(false);
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      if (profile) {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const profileData = {
          fullName: profile.full_name || '',
          phone: profile.phone || profile.phone_number || '',
          email: profile.email || '',
          gender: profile.gender || '',
          maritalStatus: profile.marital_status || '',
          workStatus: profile.work_status || '',
          currentCompany: profile.current_company || '',
          noticePeriod: profile.notice_period || '',
          currentCTC: profile.current_ctc || '',
          lastCompany: profile.last_company || '',
          previousCTC: profile.previous_ctc || '',
          city: profile.city || profile.location || '',
          workMode: profile.work_mode || '',
          candidateId: profile.candidate_id || 'FLUID-ERP-12345',
          coverImage: profile.cover_image_url ? `${backendUrl}${profile.cover_image_url}` : null,
          profileImage: profile.profile_image_url ? `${backendUrl}${profile.profile_image_url}` : null,
          profileImageLarge: profile.profile_image_url ? `${backendUrl}${profile.profile_image_url}` : null,
          profileImageMedium: profile.profile_image_url ? `${backendUrl}${profile.profile_image_url}` : null,
          profileImageThumb: profile.profile_image_url ? `${backendUrl}${profile.profile_image_url}` : null,
          cvUrl: null,
          cvName: null,
          resumes: (profile.resume_files || []).map((resume: any) => ({
            id: resume.id || Date.now().toString(),
            fileName: resume.name || resume.fileName || 'Resume',
            fileUrl: resume.url ? `${backendUrl}${resume.url}` : resume.fileUrl,
            uploadDate: resume.uploadedAt || resume.uploadDate || new Date().toISOString()
          }))
        };
        sessionStorage.setItem('fluidjobs_profile', JSON.stringify(profileData));
      }
    } catch (error) {
      console.log('Could not load profile:', error);
    }
  };

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const { user } = await authService.login(email, password, role);
      console.log('AuthProvider - login returned user:', user);
      let finalUser = user;
      // If caller requested a role and backend didn't honor it, enforce it client-side
      if (role && finalUser.role !== role) {
        console.warn('AuthProvider - backend role mismatch, enforcing requested role', { requested: role, returned: finalUser.role });
        try {
          const updated = await authService.updateUserRole(finalUser.id, role);
          console.log('AuthProvider - updated user role via authService:', updated);
          finalUser = updated;
        } catch (err) {
          console.error('AuthProvider - failed to update user role:', err);
        }
      }
      setUser(finalUser);
      await loadUserProfile();
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'Candidate') => {
    try {
      const { user } = await authService.signup(name, email, password, role);
      setUser(user);
      await loadUserProfile();
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const result = await authService.googleLogin(token);
      setUser(result.user);
      await loadUserProfile();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) throw new Error('No user logged in');
    try {
      const updatedUser = await authService.updateUserRole(user.id, role);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, updateUserRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
