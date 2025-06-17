// src/components/PrivateLayout.tsx
'use client'; // This component needs client-side interactivity

import React, { FC, ReactNode, useState } from 'react';
import AppHeader from './AppHeader'; // Assuming AppHeader component
import AppSidebar from './AppSidebar'; // Assuming AppSidebar component
import { useAuth } from '../hooks/useAuth'; // To check if user is authenticated at all

interface PrivateLayoutProps {
    children: ReactNode;
}

const PrivateLayout: FC<PrivateLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { isAuthenticated, isLoading } = useAuth(); // Check authentication state

    const handleCollapse = (isCollapsed: boolean) => {
        setCollapsed(isCollapsed);
    };

    // If not authenticated or still loading, don't render the private layout.
    // The parent layout (e.g., admin/layout.tsx or a future user/layout.tsx)
    // or a ProtectedRoute component should handle redirection.
    if (isLoading || !isAuthenticated) {
        return null; // Or a simple loading state if this is the top-most protected layout
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AppSidebar collapsed={collapsed} onCollapse={handleCollapse} />
            <div
                className={`flex-grow transition-all duration-200 ${
                    collapsed ? 'ml-20' : 'ml-64'
                } pt-16`} // Adjust ml- and pt- for fixed header/sidebar
            >
                <AppHeader collapsed={collapsed} onCollapseToggle={() => setCollapsed(!collapsed)} />
                <main className="p-6 bg-white rounded-lg shadow-md m-6 min-h-[calc(100vh-120px)]"> {/* Adjusted min-h for header/margins */}
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PrivateLayout;