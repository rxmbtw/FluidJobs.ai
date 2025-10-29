interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'HR' | 'Candidate' | 'Client';
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'fluidjobs_token';
  private readonly USER_KEY = 'fluidjobs_user';
  private readonly API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  async login(email: string, password: string, role?: User['role']): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      const user = data.user;
      const token = data.token;
      
      this.setSession(user, token);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async signup(name: string, email: string, password: string, role: User['role'] = 'Candidate'): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      const user = data.user;
      const token = data.token;
      
      this.setSession(user, token);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  }

  async googleLogin(googleToken: string): Promise<AuthResponse & { isNewUser: boolean }> {
    // This is handled by the Google OAuth flow, not directly called
    throw new Error('Use Google OAuth flow instead');
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(this.USER_KEY) || localStorage.getItem(this.USER_KEY);
    const token = sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
    
    if (!userStr || !token) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!this.getToken();
  }

  private generateToken(user: User): string {
    // Simple JWT-like token (in production, use proper JWT)
    return btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  }

  async updateUserRole(userId: string, role: User['role']): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE}/api/auth/update-role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify({ userId, role })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }
      
      const updatedUser = data.user;
      const token = data.token;
      
      this.setSession(updatedUser, token);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Update failed');
    }
  }

  private setSession(user: User, token: string): void {
    // Use sessionStorage instead of localStorage for better security
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
export type { User, AuthResponse };