import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'HR' | 'Candidate' | 'Client';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const storedToken = sessionStorage.getItem('fluidjobs_token');
    const storedUser = sessionStorage.getItem('fluidjobs_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    setUser(data.user);
    setToken(data.token);
    sessionStorage.setItem('fluidjobs_token', data.token);
    sessionStorage.setItem('fluidjobs_user', JSON.stringify(data.user));
  };

  const signup = async (signupData: any) => {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Signup failed');
    
    setUser(data.user);
    setToken(data.token);
    sessionStorage.setItem('fluidjobs_token', data.token);
    sessionStorage.setItem('fluidjobs_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('fluidjobs_token');
    sessionStorage.removeItem('fluidjobs_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
