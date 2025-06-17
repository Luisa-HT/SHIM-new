// src/hooks/useAuth.ts
'use client'; // This directive marks the hook as part of a Client Component bundle

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Assuming AuthContext exists
import { LoginResponseDto } from '../types'; // Import LoginResponseDto from types index

// Define the shape of the authentication hook's return value
interface AuthHook {
    user: LoginResponseDto | null; // The authenticated user's data (including token)
    isAuthenticated: boolean;
    isLoading: boolean; // To indicate if auth state is being loaded/checked
    login: (token: string, userId: string, name: string, email: string, role: 'User' | 'Admin') => void;
    logout: () => void;
}

/**
 * Custom hook for managing authentication state and actions.
 * It interacts with AuthContext to provide global access to auth state.
 */
export const useAuth = (): AuthHook => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { user, setUser, isLoading, setIsLoading } = context;

    const login = useCallback((token: string, userId: string, name: string, email: string, role: 'User' | 'Admin') => {
        const userData: LoginResponseDto = { token, userId, name, email, role };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false);
    }, [setUser, setIsLoading]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        setIsLoading(false);
    }, [setUser, setIsLoading]);

    useEffect(() => {
        setIsLoading(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: LoginResponseDto = JSON.parse(storedUser);
                if (parsedUser.token && parsedUser.userId && parsedUser.name && parsedUser.email && parsedUser.role) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, [setUser, setIsLoading]);

    return {
        user,
        isAuthenticated: !!user?.token,
        isLoading,
        login,
        logout,
    };
};