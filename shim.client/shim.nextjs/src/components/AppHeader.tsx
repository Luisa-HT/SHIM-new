// src/components/AppHeader.tsx
'use client'; // This component needs client-side interactivity

import React, { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For navigation after logout
import { useAuth } from '../hooks/useAuth';

interface AppHeaderProps {
    collapsed: boolean; // Prop to indicate if the sidebar is collapsed
    onCollapseToggle: () => void; // Function to toggle sidebar collapse
}

const AppHeader: FC<AppHeaderProps> = ({ collapsed, onCollapseToggle }) => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login'); // Redirect to login page after logout
    };

    // Simplified profile menu (no Ant Design Dropdown)
    const profileMenu = (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <Link href={user?.role === 'User' ? "/user/account" : "/admin/account"} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                My Profile
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
            </Link>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Logout
            </button>
        </div>
    );

    const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);

    return (
        <header className="bg-white p-4 md:px-6 shadow-sm fixed top-0 right-0 z-40 flex items-center justify-end h-16 transition-all duration-200"
                style={{ left: collapsed ? '80px' : '250px' }}> {/* Dynamic left margin based on sidebar */}

            {/* Search Icon - Placeholder */}
            <div className="text-xl text-gray-600 cursor-pointer mr-5">
                🔍 {/* Magnifying Glass Icon */}
            </div>

            {/* Notifications */}
            <div className="relative text-xl text-gray-600 cursor-pointer mr-5">
                🔔 {/* Bell Icon */}
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">11</span>
            </div>

            {/* User Profile / Admin Profile */}
            <div className="relative">
                <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 cursor-pointer focus:outline-none"
                >
                    <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-gray-800 font-medium hidden md:block">{user?.name || 'Guest'}</span>
                </button>
                {isProfileMenuOpen && profileMenu}
            </div>

            {/* Settings Icon - Could be part of dropdown or separate */}
            <div className="text-xl text-gray-600 cursor-pointer ml-5">
                ⚙️ {/* Gear Icon */}
            </div>
        </header>
    );
};

export default AppHeader;