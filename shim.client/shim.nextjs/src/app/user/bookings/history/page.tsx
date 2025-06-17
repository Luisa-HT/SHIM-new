// src/app/user/bookings/history/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import PrivateLayout from '@/components/PrivateLayout'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import Pagination from '@/components/Pagination'; // Adjusted path
import { getMyBookingHistory } from '@/api/bookings'; // Adjusted path
import { BookingHistoryDto, PaginatedResponse, PaginationParams } from '@/types'; // Adjusted path
import { formatDateTime, formatRupiah } from '@/utils/helpers'; // Adjusted path

const UserBookingHistoryPage: FC = () => {
    const [bookingHistory, setBookingHistory] = useState<BookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response: PaginatedResponse<BookingHistoryDto> = await getMyBookingHistory(pagination);
                setBookingHistory(response.items);
                setTotalRecords(response.totalRecords);
                setTotalPages(response.totalPages);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch booking history.');
                alert(`Error: ${err.message || 'Failed to fetch booking history.'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [pagination]);

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ pageNumber: page, pageSize: pageSize });
    };

    const paginatedResponseForComponent: PaginatedResponse<BookingHistoryDto> = {
        items: bookingHistory,
        pageNumber: pagination.pageNumber || 1,
        pageSize: pagination.pageSize || 10,
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasPreviousPage: (pagination.pageNumber || 1) > 1,
        hasNextPage: (pagination.pageNumber || 1) < totalPages,
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">My Booking History</h1>

            <div className="overflow-x-auto"> {/* This div enables horizontal scrolling */}
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Booking Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Request Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Approval Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Actual Return</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Fine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Decline Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={10} className="text-center py-4"><LoadingSpinner /></td></tr>
                    ) : error ? (
                        <tr><td colSpan={10} className="text-center py-4 text-red-500">{error}</td></tr>
                    ) : bookingHistory.length === 0 ? (
                        <tr><td colSpan={10} className="text-center py-4 text-gray-600">No booking history found.</td></tr>
                    ) : (
                        bookingHistory.map((record) => (
                            <tr key={record.id_Peminjaman} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">{record.nama_Barang}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {`${formatDateTime(record.start_Date)} - ${formatDateTime(record.end_Date)}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <StatusTag status={record.status_Peminjaman} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{record.deskripsi || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{record.tanggal_Pengajuan ? formatDateTime(record.tanggal_Pengajuan) : 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{record.tanggal_Approval ? formatDateTime(record.tanggal_Approval) : 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{record.tanggal_Pengembalian_Aktual ? formatDateTime(record.tanggal_Pengembalian_Aktual) : 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{formatRupiah(record.denda)}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{record.alasan_Penolakan || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    <button
                                        onClick={() => alert(`View details for booking ID: ${record.id_Peminjaman}`)}
                                        className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {totalRecords > 0 && (
                <Pagination
                    paginationData={paginatedResponseForComponent}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default UserBookingHistoryPage;
