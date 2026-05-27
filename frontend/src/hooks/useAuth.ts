import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { authService } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    const stored = authService.getStoredUser();
    setUser(stored);
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, isAuthenticated, login, logout };
}
