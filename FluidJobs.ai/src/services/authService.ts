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

  // Mock user database
  private users: User[] = [
    { id: '1', email: 'admin@fluidjobs.ai', name: 'Admin User', role: 'Admin' },
    { id: '2', email: 'hr@fluidjobs.ai', name: 'HR Manager', role: 'HR' },
    { id: '3', email: 'candidate@fluidjobs.ai', name: 'Job Seeker', role: 'Candidate' },
    { id: '4', email: 'client@fluidjobs.ai', name: 'Client User', role: 'Client' }
  ];

  async login(email: string, password: string, role?: User['role']): Promise<AuthResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate password
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    let user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('That email doesn\'t look right. Please check and try again.');
    }

    console.log('AuthService - Original user:', user);
    console.log('AuthService - Provided role:', role);

    // If role is provided, update user role
    if (role && user) {
      user = { ...user, role };
      const userIndex = this.users.findIndex(u => u.id === user!.id);
      this.users[userIndex] = user;
      console.log('AuthService - Updated user:', user);
    }

    const token = this.generateToken(user);
    this.setSession(user, token);
    
    return { user, token };
  }

  async signup(name: string, email: string, password: string, role: User['role'] = 'Candidate'): Promise<AuthResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      name,
      role
    };

    this.users.push(user);
    const token = this.generateToken(user);
    this.setSession(user, token);
    
    return { user, token };
  }

  async googleLogin(googleToken: string): Promise<AuthResponse & { isNewUser: boolean }> {
    // Simulate Google OAuth with prompt=select_account
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock Google user data (in real implementation, decode googleToken)
    const googleUser = {
      email: `user${Date.now()}@gmail.com`,
      name: 'Google User'
    };

    let user = this.users.find(u => u.email === googleUser.email);
    const isNewUser = !user;
    
    if (!user) {
      // Create new user without role (to be selected later)
      user = {
        id: crypto.randomUUID(),
        email: googleUser.email,
        name: googleUser.name,
        role: 'Candidate' // Temporary, will be updated in role selection
      };
      this.users.push(user);
    }

    const token = this.generateToken(user);
    this.setSession(user, token);
    
    return { user, token, isNewUser };
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
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = { ...this.users[userIndex], role };
    const updatedUser = this.users[userIndex];
    
    // Update session
    const token = this.getToken() || this.generateToken(updatedUser);
    this.setSession(updatedUser, token);
    
    return updatedUser;
  }

  private setSession(user: User, token: string): void {
    // Use sessionStorage instead of localStorage for better security
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
export type { User, AuthResponse };