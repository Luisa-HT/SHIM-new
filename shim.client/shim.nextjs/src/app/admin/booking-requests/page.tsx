// src/app/admin/booking-history/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import Pagination from '@/components/Pagination'; // Adjusted path
import { getAllBookingHistory, completeBooking } from '@/api/bookings'; // Adjusted path
import { AdminBookingHistoryDto, PaginatedResponse, PaginationParams, CompleteBookingDto } from '@/types'; // Adjusted path
import { formatDateTime, formatRupiah } from '@/utils/helpers';
import {useRouter} from "next/navigation"; // Adjusted path

const AdminBookingHistoryPage: FC = () => {
    const { push } = useRouter();
    const [bookingHistory, setBookingHistory] = useState<AdminBookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<AdminBookingHistoryDto | null>(null);
    const [completeFine, setCompleteFine] = useState<number | null>(null);
    const [completeCondition, setCompleteCondition] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchBookingHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: PaginatedResponse<AdminBookingHistoryDto> = await getAllBookingHistory(pagination);
            setBookingHistory(response.items);
            setTotalRecords(response.totalRecords);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch all booking history.');
            alert(`Error: ${err.message || 'Failed to fetch all booking history.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, [pagination]);

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ pageNumber: page, pageSize: pageSize });
    };

    const handleViewDetails = (record: AdminBookingHistoryDto) => {
        setSelectedBooking(record);
        setIsDetailModalVisible(true);
    };

    const handleCompleteBookingClick = (record: AdminBookingHistoryDto) => {
        setSelectedBooking(record);
        setCompleteFine(record.denda || null); // Pre-fill if fine already exists
        setCompleteCondition(''); // Clear previous condition
        setIsCompleteModalVisible(true);
    };

    const handleCompleteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking) return;
        setActionLoading(true);
        setError(null);

        if (!completeCondition.trim()) {
            setError('Return condition is required.');
            setActionLoading(false);
            return;
        }

        try {
            const completeData: CompleteBookingDto = {
                denda: completeFine?? undefined,
                status_Kondisi_Pengembalian: completeCondition,
            };
            await completeBooking(selectedBooking.id_Peminjaman, completeData);
            alert(`Booking Completed: Booking ID ${selectedBooking.id_Peminjaman} has been marked as completed.`);
            setIsCompleteModalVisible(false);
            // No need to reset form fields, as modal is destroyed on close
            setIsDetailModalVisible(false); // Close detail modal if open
            fetchBookingHistory(); // Refresh the list
        } catch (err: any) {
            setError(err.message || `Failed to complete booking ID ${selectedBooking.id_Peminjaman}.`);
            alert(`Completion Failed: ${err.message || `Failed to complete booking ID ${selectedBooking.id_Peminjaman}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const paginatedResponseForComponent: PaginatedResponse<AdminBookingHistoryDto> = {
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
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">All Booking History</h1>

            {/* Added overflow-x-auto to the container div */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Return</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decline Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={11} className="text-center py-4"><LoadingSpinner /></td></tr>
                    ) : error ? (
                        <tr><td colSpan={11} className="text-center py-4 text-red-500">{error}</td></tr>
                    ) : bookingHistory.length === 0 ? (
                        <tr><td colSpan={11} className="text-center py-4 text-gray-600">No booking history found.</td></tr>
                    ) : (
                        bookingHistory.map((record) => (
                            <tr key={record.id_Peminjaman} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id_Peminjaman}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Barang}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Peminjam}</td>
                                {/* Removed whitespace-nowrap from Booking Period for better wrapping */}
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {`${formatDateTime(record.start_Date)} - ${formatDateTime(record.end_Date)}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <StatusTag status={record.status_Peminjaman} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.tanggal_Pengajuan ? formatDateTime(record.tanggal_Pengajuan) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Admin || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.tanggal_Pengembalian_Aktual ? formatDateTime(record.tanggal_Pengembalian_Aktual) : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(record.denda)}</td>
                                {/* Removed whitespace-nowrap from Decline Reason for better wrapping */}
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{record.alasan_Penolakan || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => {push(`/admin/booking-requests/${record.id_Peminjaman}`)}}
                                        className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        View
                                    </button>
                                    {record.status_Peminjaman === 'Approved' && !record.tanggal_Pengembalian_Aktual && (
                                        <button
                                            onClick={() => handleCompleteBookingClick(record)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400"
                                            disabled={actionLoading}
                                        >
                                            Complete
                                        </button>
                                    )}
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

            {/* Detail Modal */}
            {isDetailModalVisible && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Booking Details</h3>
                        <div className="space-y-3 text-left text-gray-800">
                            <p><strong>Booking ID:</strong> {selectedBooking.id_Peminjaman}</p>
                            <p><strong>Item Name:</strong> {selectedBooking.nama_Barang}</p>
                            <p><strong>Item ID:</strong> {selectedBooking.id_Barang}</p>
                            <p><strong>Requested By:</strong> {selectedBooking.nama_Peminjam} (ID: {selectedBooking.id_Peminjam})</p>
                            <p><strong>Booking Period:</strong> {`${formatDateTime(selectedBooking.start_Date)} - ${formatDateTime(selectedBooking.end_Date)}`}</p>
                            <p><strong>Reason:</strong> {selectedBooking.deskripsi || 'No reason provided.'}</p>
                            <p><strong>Status:</strong> <StatusTag status={selectedBooking.status_Peminjaman} /></p>
                            <p><strong>Request Date:</strong> {selectedBooking.tanggal_Pengajuan ? formatDateTime(selectedBooking.tanggal_Pengajuan) : 'N/A'}</p>
                            <p><strong>Approval Date:</strong> {selectedBooking.tanggal_Approval ? formatDateTime(selectedBooking.tanggal_Approval) : 'N/A'}</p>
                            <p><strong>Approved/Declined By:</strong> {selectedBooking.nama_Admin ? `${selectedBooking.nama_Admin} (ID: ${selectedBooking.id_Admin})` : 'N/A'}</p>
                            {selectedBooking.alasan_Penolakan && <p><strong>Decline Reason:</strong> {selectedBooking.alasan_Penolakan}</p>}
                            <p><strong>Actual Return Date:</strong> {selectedBooking.tanggal_Pengembalian_Aktual ? formatDateTime(selectedBooking.tanggal_Pengembalian_Aktual) : 'N/A'}</p>
                            <p><strong>Processed Return By:</strong> {selectedBooking.nama_Admin_Pengembalian ? `${selectedBooking.nama_Admin_Pengembalian} (ID: ${selectedBooking.id_Admin_Pengembalian})` : 'N/A'}</p>
                            {selectedBooking.denda && selectedBooking.denda > 0 && <p><strong>Fine:</strong> {formatRupiah(selectedBooking.denda)}</p>}
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setIsDetailModalVisible(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                            {selectedBooking.status_Peminjaman === 'Approved' && !selectedBooking.tanggal_Pengembalian_Aktual && (
                                <button
                                    onClick={() => { setIsDetailModalVisible(false); handleCompleteBookingClick(selectedBooking); }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                                    disabled={actionLoading}
                                >
                                    Complete Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Booking Modal */}
            {isCompleteModalVisible && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Complete Booking</h3>
                        <form onSubmit={handleCompleteSubmit} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="complete-fine" className="block text-gray-700 text-sm font-bold mb-2">
                                    Fine (Rp)
                                </label>
                                <input
                                    type="number"
                                    id="complete-fine"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    min={0}
                                    value={completeFine === null ? '' : completeFine}
                                    onChange={(e) => setCompleteFine(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="complete-condition" className="block text-gray-700 text-sm font-bold mb-2">
                                    Return Condition Status
                                </label>
                                <select
                                    id="complete-condition"
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={completeCondition}
                                    onChange={(e) => setCompleteCondition(e.target.value)}
                                    required
                                >
                                    <option value="">Select condition</option>
                                    <option value="Good">Good</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Minor Damage">Minor Damage</option>
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsCompleteModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={actionLoading}>
                                    Mark as Completed
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {(loading || actionLoading) && <LoadingSpinner fullscreen />}
        </div>
    );
};

export default AdminBookingHistoryPage;
