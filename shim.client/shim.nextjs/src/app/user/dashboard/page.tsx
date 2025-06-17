// src/app/user/dashboard/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import PrivateLayout from '@/components/PrivateLayout'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import { useAuth } from '@/hooks/useAuth'; // Adjusted path
import { getMyBookingHistory } from '@/api/bookings'; // Adjusted path
import { BookingHistoryDto, PaginatedResponse, PaginationParams } from '@/types'; // Adjusted path
import { formatDateTime, formatRupiah } from '@/utils/helpers'; // Adjusted path

const UserDashboardPage: FC = () => {
    const { user } = useAuth();
    const [bookingHistory, setBookingHistory] = useState<BookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 5 }); // Show 5 recent bookings

    useEffect(() => {
        const fetchBookingHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: PaginatedResponse<BookingHistoryDto> = await getMyBookingHistory(pagination);
                setBookingHistory(response.items);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch booking history.');
                alert(`Error: ${err.message || 'Failed to fetch booking history.'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [pagination]);

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Welcome, {user?.name || 'User'}!</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Bookings</h2>
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : bookingHistory.length === 0 ? (
                    <p className="text-gray-600">No recent bookings found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time of Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {bookingHistory.map((record) => (
                                <tr key={record.id_Peminjaman} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Barang}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {`${formatDateTime(record.start_Date)} - ${formatDateTime(record.end_Date)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <StatusTag status={record.status_Peminjaman} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => alert(`Viewing details for booking ID: ${record.id_Peminjaman}\nReason: ${record.deskripsi || 'N/A'}\nFine: ${formatRupiah(record.denda)}`)}
                                            className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="text-right mt-4">
                    <Link href="/user/bookings/history" className="text-blue-600 hover:underline">
                        View All Booking History
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;