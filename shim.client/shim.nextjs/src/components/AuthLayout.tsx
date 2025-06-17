// src/components/AuthLayout.tsx
'use client'; // This component needs client-side interactivity for navigation

import React, { FC, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // For active link styling

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    const navLinkClasses = (path: string) =>
        `text-gray-700 hover:text-blue-600 text-base font-medium transition-colors ${
            pathname === path ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
        }`;

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
            style={{ backgroundImage: 'url(/landing-background.jpg)' }} // Image from public folder
        >
            <header className="bg-white bg-opacity-80 p-4 md:px-12 shadow-md fixed top-0 w-full z-50 flex items-center justify-between box-border">
                <div className="text-xl font-bold text-blue-600">
                    <Link href="/">Smart House Inventory</Link>
                </div>
                <nav className="hidden md:flex space-x-8">
                    <Link href="/" className={navLinkClasses('/')}>Home</Link>
                    <Link href="/about" className={navLinkClasses('/about')}>About</Link>
                    <Link href="/contact" className={navLinkClasses('/contact')}>Contact</Link>
                </nav>
                <div className="flex space-x-4">
                    <Link href="/login">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-base hover:bg-blue-700 transition-colors">Log In</button>
                    </Link>
                    <Link href="/signup">
                        <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-base border border-gray-300 hover:bg-gray-200 transition-colors">Register</button>
                    </Link>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center pt-20 pb-4"> {/* pt-20 for fixed header */}
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;