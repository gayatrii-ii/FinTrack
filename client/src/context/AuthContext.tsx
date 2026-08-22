import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, LoginCredentials, RegisterCredentials } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fintrack_token');
      const storedUser = localStorage.getItem('fintrack_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('fintrack_user', JSON.stringify(freshUser));
        } catch {
          localStorage.removeItem('fintrack_token');
          localStorage.removeItem('fintrack_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('fintrack_token', data.token);
    localStorage.setItem('fintrack_user', JSON.stringify(data.user));
  };

  const register = async (credentials: RegisterCredentials) => {
    const data = await authService.register(credentials);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('fintrack_token', data.token);
    localStorage.setItem('fintrack_user', JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('fintrack_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
