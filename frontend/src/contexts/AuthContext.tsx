import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'STARTUP';
    balance?: number;
    portfolio?: number;
    returns?: number;
    verified?: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// L'intercepteur axios (services/api.ts) lit le token dans le cookie 'auth_token'.
const TOKEN_COOKIE = 'auth_token';
const REFRESH_COOKIE = 'refresh_token';
const USER_KEY = 'afristocks_user';

interface SessionPayload {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Réhydratation au chargement : un token valide + un utilisateur en cache => session active.
    useEffect(() => {
        const token = Cookies.get(TOKEN_COOKIE);
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem(USER_KEY);
            }
        }
        setLoading(false);
    }, []);

    const persistSession = (payload: SessionPayload) => {
        // sameSite 'lax' + expiration ; httpOnly impossible côté JS (migration prévue, cf. DEC-G).
        Cookies.set(TOKEN_COOKIE, payload.accessToken, { sameSite: 'lax', expires: 1 });
        if (payload.refreshToken) {
            Cookies.set(REFRESH_COOKIE, payload.refreshToken, { sameSite: 'lax', expires: 7 });
        }
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
        setUser(payload.user);
        setIsAuthenticated(true);
    };

    const login = async (email: string, password: string) => {
        const res = await authService.login({ email, password });
        persistSession(res.data.data as SessionPayload);
    };

    const register = async (userData: any) => {
        const res = await authService.register(userData);
        persistSession(res.data.data as SessionPayload);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch {
            // best-effort : on déconnecte localement même si l'appel réseau échoue
        }
        Cookies.remove(TOKEN_COOKIE);
        Cookies.remove(REFRESH_COOKIE);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                register,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
