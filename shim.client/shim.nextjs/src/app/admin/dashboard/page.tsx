// src/app/admin/dashboard/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { getAdminDashboardStats, getPendingBookingRequests, getAllBookingHistory, approveBooking, declineBooking } from '@/api/bookings'; // Added approve/decline APIs
import { AdminDashboardStatsDto, AdminBookingRequestDto, AdminBookingHistoryDto, PaginationParams, PaginatedResponse, DeclineBookingDto } from '@/types'; // Added DeclineBookingDto
import { formatDateTime } from '@/utils/helpers'; // Adjusted path

const AdminDashboardPage: FC = () => {
    const { user } = useAuth();
    const router = useRouter(); // Initialize useRouter
    const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
    const [pendingRequests, setPendingRequests] = useState<AdminBookingRequestDto[]>([]);
    const [recentBookings, setRecentBookings] = useState<AdminBookingHistoryDto[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false); // For approve/decline actions
    const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [selectedRequestForDecline, setSelectedRequestForDecline] = useState<AdminBookingRequestDto | null>(null);


    const fetchDashboardData = async () => {
        setError(null);
        setLoadingStats(true);
        setLoadingPending(true);
        setLoadingRecent(true);

        try {
            const [fetchedStats, pendingResponse, recentResponse] = await Promise.all([
                getAdminDashboardStats(),
                getPendingBookingRequests({ pageNumber: 1, pageSize: 3 }),
                getAllBookingHistory({ pageNumber: 1, pageSize: 5 })
            ]);
            setStats(fetchedStats);
            setPendingRequests(pendingResponse.items);
            setRecentBookings(recentResponse.items);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch dashboard data.');
            alert(`Error: ${err.message || 'Failed to fetch dashboard data.'}`);
        } finally {
            setLoadingStats(false);
            setLoadingPending(false);
            setLoadingRecent(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleApprove = async (id: number) => {
        setActionLoading(true);
        setError(null);
        try {
            await approveBooking(id);
            alert(`Booking Approved: Request ID ${id} has been approved.`);
            fetchDashboardData(); // Refresh all dashboard data
        } catch (err: any) {
            setError(err.message || `Failed to approve booking request ID ${id}.`);
            alert(`Approval Failed: ${err.message || `Failed to approve booking request ID ${id}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeclineClick = (request: AdminBookingRequestDto) => {
        setSelectedRequestForDecline(request);
        setDeclineReason(''); // Clear previous reason
        setIsDeclineModalVisible(true);
    };

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequestForDecline) return;
        setActionLoading(true);
        setError(null);

        if (!declineReason.trim()) {
            setError('Reason for decline is required.');
            setActionLoading(false);
            return;
        }

        try {
            const declineData: DeclineBookingDto = { alasan_Penolakan: declineReason };
            await declineBooking(selectedRequestForDecline.id_Peminjaman, declineData);
            alert(`Booking Declined: Request ID ${selectedRequestForDecline.id_Peminjaman} has been declined.`);
            setIsDeclineModalVisible(false);
            fetchDashboardData(); // Refresh all dashboard data
        } catch (err: any) {
            setError(err.message || `Failed to decline booking request ID ${selectedRequestForDecline.id_Peminjaman}.`);
            alert(`Decline Failed: ${err.message || `Failed to decline booking request ID ${selectedRequestForDecline.id_Peminjaman}.`}`);
        } finally {
            setActionLoading(false);
        }
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                    <h2 className="text-lg font-medium text-gray-600">Pending Requests</h2>
                    {loadingStats ? (
                        <LoadingSpinner size="small" />
                    ) : (
                        <p className="text-4xl font-bold text-yellow-600 mt-2">{stats?.pendingCount || 0}</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                    <h2 className="text-lg font-medium text-gray-600">Today's Bookings</h2>
                    {loadingStats ? (
                        <LoadingSpinner size="small" />
                    ) : (
                        <p className="text-4xl font-bold text-blue-600 mt-2">{stats?.todaysBookingsCount || 0}</p>
                    )}
                </div>
                {/* Add more stats cards here if needed */}
            </div>

            {/* Pending Requests Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Requests</h2>
                {loadingPending ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : pendingRequests.length === 0 ? (
                    <p className="text-gray-600">No pending booking requests.</p>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {pendingRequests.map((request) => (
                            <li key={request.id_Peminjaman} className="py-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 text-blue-800 rounded-full h-10 w-10 flex items-center justify-center text-lg">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-semibold">{request.nama_Barang} request by {request.nama_Peminjam}</p>
                                        <p className="text-gray-600 text-sm">{request.deskripsi}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/admin/booking-requests/${request.id_Peminjaman}`}>
                                        <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300">View</button>
                                    </Link>
                                    <button
                                        onClick={() => handleApprove(request.id_Peminjaman)}
                                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 disabled:bg-green-400"
                                        disabled={actionLoading}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDeclineClick(request)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 disabled:bg-red-400"
                                        disabled={actionLoading}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="text-right mt-4">
                    <Link href="/admin/booking-requests" className="text-blue-600 hover:underline">
                        View All Pending Requests
                    </Link>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h2>
                {(loadingRecent || actionLoading) ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : recentBookings.length === 0 ? (
                    <p className="text-gray-600">No recent system-wide bookings found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time of Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {recentBookings.map((record) => (
                                <tr key={record.id_Peminjaman} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Barang}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Peminjam}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {`${formatDateTime(record.start_Date)} - ${formatDateTime(record.end_Date)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <StatusTag status={record.status_Peminjaman} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => router.push(`/admin/booking-requests/${record.id_Peminjaman}`)} // Redirect to detail page
                                            className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="text-right mt-4">
                    <Link href="/admin/booking-history" className="text-blue-600 hover:underline">
                        View All Booking History
                    </Link>
                </div>
            </div>

            {/* Decline Modal */}
            {isDeclineModalVisible && selectedRequestForDecline && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Decline Booking Request</h3>
                        <form onSubmit={handleDeclineSubmit} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="decline-reason" className="block text-gray-700 text-sm font-bold mb-2">
                                    Reason for Decline
                                </label>
                                <textarea
                                    id="decline-reason"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    rows={4}
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsDeclineModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-400" disabled={actionLoading}>
                                    Confirm Decline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {(loadingStats || loadingPending || loadingRecent || actionLoading) && <LoadingSpinner fullscreen />}
        </div>
    );
};

export default AdminDashboardPage;