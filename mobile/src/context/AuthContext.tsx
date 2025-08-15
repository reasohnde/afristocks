// src/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  login: (token: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);