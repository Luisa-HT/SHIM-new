// ClientApp/src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, type FC, type ReactNode } from 'react';
import type {LoginResponseDto} from '../types'; // Import LoginResponseDto
// Import LoginResponseDto

// Define the shape of the AuthContext value
interface AuthContextType {
    user: LoginResponseDto | null;
    setUser: React.Dispatch<React.SetStateAction<LoginResponseDto | null>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the AuthContext with a default undefined value
// It will be provided by AuthProvider
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * AuthProvider component that wraps the application to provide authentication context.
 * It manages the user's login state and loading status.
 */
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<LoginResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start as true to indicate initial loading

    // Effect to load user from localStorage on initial render
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser: LoginResponseDto = JSON.parse(storedUser);
                // Basic validation to ensure stored data is valid
                if (parsedUser.token && parsedUser.userId && parsedUser.name && parsedUser.email && parsedUser.role) {
                    setUser(parsedUser);
                } else {
                    // If stored data is invalid, clear it
                    localStorage.removeItem('user');
                }
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage on AuthProvider init:", error);
            localStorage.removeItem('user'); // Clear corrupted data
        } finally {
            setIsLoading(false); // Authentication state is now loaded
        }
    }, []); // Empty dependency array means this effect runs only once on mount

    // The value provided to consumers of this context
    const contextValue: AuthContextType = {
        user,
        setUser,
        isLoading,
        setIsLoading,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
