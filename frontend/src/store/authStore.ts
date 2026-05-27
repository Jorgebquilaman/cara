import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('cara_user') || 'null'),
  token: localStorage.getItem('cara_token'),
  setAuth: (user, token) => {
    localStorage.setItem('cara_user', JSON.stringify(user));
    localStorage.setItem('cara_token', token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('cara_user');
    localStorage.removeItem('cara_token');
    set({ user: null, token: null });
  },
}));
