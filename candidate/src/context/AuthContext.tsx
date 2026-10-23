import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from '@/types';
import { api } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => api.getStoredUser());

  const login = async (email: string, password: string) => setUser((await api.login({ email, password })).user);
  const signup = async (name: string, email: string, password: string) =>
    setUser((await api.signup({ name, email, password })).user);
  const logout = () => { api.logout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
