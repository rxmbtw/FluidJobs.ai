import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

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
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    try {
      const { user } = await authService.login(email, password, role);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'Candidate') => {
    try {
      const { user } = await authService.signup(name, email, password, role);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const result = await authService.googleLogin(token);
      setUser(result.user);
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
