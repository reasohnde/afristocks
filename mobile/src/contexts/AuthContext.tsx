import React, { createContext, useContext } from 'react';

interface User {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 