// ClientApp/src/hooks/useAuth.ts
import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Assuming AuthContext exists
import type {LoginResponseDto} from '../types'; // Import LoginResponseDto from types index
// Import LoginResponseDto from types index

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
        // This error indicates that useAuth is called outside of an AuthProvider.
        // It's a critical setup issue.
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { user, setUser, isLoading, setIsLoading } = context;

    // Function to set user data and token upon successful login
    const login = useCallback((token: string, userId: string, name: string, email: string, role: 'User' | 'Admin') => {
        const userData: LoginResponseDto = { token, userId, name, email, role };
        setUser(userData);
        // Store token and user data in localStorage for persistence across sessions
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoading(false); // Auth state is now loaded
    }, [setUser, setIsLoading]);

    // Function to clear user data and token upon logout
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user'); // Remove from localStorage
        setIsLoading(false); // Auth state is now loaded
    }, [setUser, setIsLoading]);

    // Effect to initialize auth state from localStorage on component mount
    useEffect(() => {
        setIsLoading(true); // Start loading state
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser: LoginResponseDto = JSON.parse(storedUser);
                // Basic validation of stored data (optional, but good practice)
                if (parsedUser.token && parsedUser.userId && parsedUser.name && parsedUser.email && parsedUser.role) {
                    setUser(parsedUser);
                } else {
                    // If stored data is invalid, clear it
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false); // Finished loading state
    }, [setUser, setIsLoading]); // Dependencies ensure effect runs only once on mount

    return {
        user,
        isAuthenticated: !!user?.token, // Check if token exists to determine authentication status
        isLoading,
        login,
        logout,
    };
};
