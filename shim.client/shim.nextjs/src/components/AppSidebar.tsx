// src/components/AppSidebar.tsx
'use client'; // This component needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // For active link styling
import { useAuth } from '../hooks/useAuth';

interface AppSidebarProps {
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

const AppSidebar: FC<AppSidebarProps> = ({ collapsed, onCollapse }) => {
    const pathname = usePathname();
    const { user } = useAuth();

    // Helper to determine active link classes
    const linkClasses = (path: string) =>
        `flex items-center p-3 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
            pathname.startsWith(path) ? 'bg-blue-100 text-blue-700 font-semibold' : ''
        }`;

    const subLinkClasses = (path: string) =>
        `flex items-center pl-8 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
            pathname === path ? 'bg-blue-100 text-blue-700 font-semibold' : ''
        }`;

    const [isAccountSubMenuOpen, setIsAccountSubMenuOpen] = useState(false);
    const [isBookingsSubMenuOpen, setIsBookingsSubMenuOpen] = useState(false);

    useEffect(() => {
        // Open submenus based on current path
        if (pathname.startsWith('/user/account') || pathname.startsWith('/admin/account')) {
            setIsAccountSubMenuOpen(true);
        } else {
            setIsAccountSubMenuOpen(false);
        }
        if (pathname.startsWith('/user/bookings')) {
            setIsBookingsSubMenuOpen(true);
        } else {
            setIsBookingsSubMenuOpen(false);
        }
    }, [pathname]);

    return (
        <aside
            className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-50 transition-all duration-200 overflow-y-auto ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <Link href={user?.role === 'Admin' ? "/admin/dashboard" : "/user/dashboard"} className="flex items-center">
                    <span className="text-2xl text-blue-600 mr-2">🏠</span> {/* House Icon */}
                    {!collapsed && <span className="text-lg font-bold text-blue-600 whitespace-nowrap">Smart House Inventory</span>}
                </Link>
            </div>
            <nav className="p-4">
                <ul className="space-y-2">
                    <li>
                        <Link href={user?.role === 'Admin' ? "/admin/dashboard" : "/user/dashboard"} className={linkClasses(user?.role === 'Admin' ? "/admin/dashboard" : "/user/dashboard")}>
                            <span className="text-xl mr-3">📊</span> {/* Dashboard Icon */}
                            {!collapsed && <span>Dashboard</span>}
                        </Link>
                    </li>

                    {/* Account Info Submenu */}
                    <li>
                        <button
                            onClick={() => setIsAccountSubMenuOpen(!isAccountSubMenuOpen)}
                            className={`flex items-center justify-between w-full p-3 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none ${
                                isAccountSubMenuOpen ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                            }`}
                        >
              <span className="flex items-center">
                <span className="text-xl mr-3">👤</span> {/* User Icon */}
                  {!collapsed && <span>Account Info</span>}
              </span>
                            {!collapsed && (
                                <span className="text-sm">
                  {isAccountSubMenuOpen ? '▲' : '▼'}
                </span>
                            )}
                        </button>
                        {isAccountSubMenuOpen && !collapsed && (
                            <ul className="mt-1 space-y-1">
                                <li>
                                    <Link href={user?.role === 'User' ? "/user/account" : "/admin/account"} className={subLinkClasses(user?.role === 'User' ? "/user/account" : "/admin/account")}>
                                        Manage Profile
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {user?.role === 'User' && (
                        <li>
                            <button
                                onClick={() => setIsBookingsSubMenuOpen(!isBookingsSubMenuOpen)}
                                className={`flex items-center justify-between w-full p-3 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors focus:outline-none ${
                                    isBookingsSubMenuOpen ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                                }`}
                            >
                <span className="flex items-center">
                  <span className="text-xl mr-3">📅</span> {/* Calendar/Bookings Icon */}
                    {!collapsed && <span>Bookings</span>}
                </span>
                                {!collapsed && (
                                    <span className="text-sm">
                    {isBookingsSubMenuOpen ? '▲' : '▼'}
                  </span>
                                )}
                            </button>
                            {isBookingsSubMenuOpen && !collapsed && (
                                <ul className="mt-1 space-y-1">
                                    <li>
                                        <Link href="/user/bookings/make" className={subLinkClasses("/user/bookings/make")}>
                                            Make a booking
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/user/bookings/history" className={subLinkClasses("/user/bookings/history")}>
                                            Booking history
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    )}

                    {user?.role === 'Admin' && (
                        <>
                            <li>
                                <Link href="/admin/booking-requests" className={linkClasses("/admin/booking-requests")}>
                                    <span className="text-xl mr-3">📥</span> {/* Inbox Icon */}
                                    {!collapsed && <span>Booking Requests</span>}
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/booking-history" className={linkClasses("/admin/booking-history")}>
                                    <span className="text-xl mr-3">📜</span> {/* Scroll Icon */}
                                    {!collapsed && <span>Booking History</span>}
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/inventory" className={linkClasses("/admin/inventory")}>
                                    <span className="text-xl mr-3">📦</span> {/* Box Icon */}
                                    {!collapsed && <span>Manage Inventory</span>}
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/grants" className={linkClasses("/admin/grants")}>
                                    <span className="text-xl mr-3">🎁</span> {/* Gift Icon */}
                                    {!collapsed && <span>Manage Grants</span>}
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <Link href="/notifications" className={linkClasses("/notifications")}>
                            <span className="text-xl mr-3">🔔</span> {/* Bell Icon */}
                            {!collapsed && <span>Notifications</span>}
                        </Link>
                    </li>

                    <li>
                        <Link href="/getting-started" className={linkClasses("/getting-started")}>
                            <span className="text-xl mr-3">🚀</span> {/* Rocket Icon */}
                            {!collapsed && <span>Getting Started</span>}
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Collapse button at the bottom */}
            <button
                onClick={() => onCollapse(!collapsed)}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-600 p-2 rounded-full shadow-md hover:bg-gray-200 transition-colors focus:outline-none"
                aria-label="Toggle sidebar"
            >
                {collapsed ? '▶' : '◀'}
            </button>
        </aside>
    );
};

export default AppSidebar;