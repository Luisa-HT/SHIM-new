// src/app/user/layout.tsx
'use client'; // This layout needs client-side interactivity for auth check and redirection

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import PrivateLayout from '@/components/PrivateLayout'; // Adjusted path

export default function UserLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            // Still loading auth state, do nothing yet
            return;
        }

        if (!isAuthenticated) {
            // Not authenticated, redirect to login
            router.push('/login');
            return;
        }

        if (user?.role !== 'User') {
            // Authenticated but not a User, redirect to admin dashboard or an unauthorized page
            alert('Access Denied: You do not have user privileges.');
            router.push('/admin/dashboard'); // Or '/unauthorized'
            return;
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || user?.role !== 'User') {
        // Show a loading spinner while checking auth or if redirecting
        // We render children only when authorized to prevent flickering of unauthorized content
        return <LoadingSpinner fullscreen tip="Verifying user access..." />;
    }

    // If authenticated as User, render the PrivateLayout and children
    return (
        <PrivateLayout>
            {children}
        </PrivateLayout>
    );
}
