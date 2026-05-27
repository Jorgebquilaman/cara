import api from './api';
import { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('cara_token', data.token);
    localStorage.setItem('cara_user', JSON.stringify(data.user));
    return data;
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    institutionalEmail: string;
    role: string;
    password: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  logout(): void {
    localStorage.removeItem('cara_token');
    localStorage.removeItem('cara_user');
    window.location.href = '/login';
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('cara_user');
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('cara_token');
  },
};
