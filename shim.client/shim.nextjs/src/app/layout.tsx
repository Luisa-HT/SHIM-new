// src/app/layout.tsx
import React from 'react';
import { Inter } from 'next/font/google'; // Assuming you want to use Inter font
import { AuthProvider } from '@/contexts/AuthContext'; // Your AuthContext provider

// Import your global Tailwind CSS file
import './globals.css';

const inter = Inter({ subsets: ['latin'] }); // Initialize Inter font

export const metadata = {
    title: 'Smart House Inventory Manager',
    description: 'Manage and book tech items from inventory.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {/* AuthProvider is a client component that provides authentication context */}
        {/* It needs to be a client component because it uses useState/useEffect */}
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}