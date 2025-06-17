// src/app/admin/booking-requests/[id]/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import { getAdminBookingRequestById, approveBooking, declineBooking } from '@/api/bookings'; // Adjusted path
import { AdminBookingRequestDto, DeclineBookingDto } from '@/types'; // Adjusted path
import { formatDateTime } from '@/utils/helpers'; // Adjusted path

interface BookingDetailPageProps {
    // Next.js App Router dynamic segments are passed via params
    params: { id: string };
}

const AdminBookingRequestDetailPage: FC<BookingDetailPageProps> = () => {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id ? parseInt(params.id as string) : null;

    const [request, setRequest] = useState<AdminBookingRequestDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false); // For approve/decline actions

    useEffect(() => {
        const fetchRequest = async () => {
            if (!bookingId) {
                setError('Booking ID is missing.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const fetchedRequest = await getAdminBookingRequestById(bookingId);
                setRequest(fetchedRequest);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch booking request details.');
                alert(`Error: ${err.message || 'Failed to fetch booking request details.'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [bookingId]);

    const handleApprove = async () => {
        if (!bookingId) return;
        setActionLoading(true);
        setError(null);
        try {
            await approveBooking(bookingId);
            alert(`Booking Approved: Request ID ${bookingId} has been approved.`);
            router.push('/admin/booking-requests'); // Redirect back to list
        } catch (err: any) {
            setError(err.message || `Failed to approve booking request ID ${bookingId}.`);
            alert(`Approval Failed: ${err.message || `Failed to approve booking request ID ${bookingId}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeclineClick = () => {
        setIsDeclineModalVisible(true);
    };

    const handleDeclineSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingId) return;
        setActionLoading(true);
        setError(null);

        if (!declineReason.trim()) {
            setError('Reason for decline is required.');
            setActionLoading(false);
            return;
        }

        try {
            const declineData: DeclineBookingDto = { alasan_Penolakan: declineReason };
            await declineBooking(bookingId, declineData);
            alert(`Booking Declined: Request ID ${bookingId} has been declined.`);
            setIsDeclineModalVisible(false);
            router.push('/admin/booking-requests'); // Redirect back to list
        } catch (err: any) {
            setError(err.message || `Failed to decline booking request ID ${bookingId}.`);
            alert(`Decline Failed: ${err.message || `Failed to decline booking request ID ${bookingId}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullscreen tip="Loading booking details..." />;
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center m-6">
                <h1 className="text-xl font-semibold text-red-600 mb-4">Error Loading Request</h1>
                <p className="text-gray-700">{error}</p>
                <button onClick={() => router.back()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Go Back
                </button>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md text-center m-6">
                <h1 className="text-xl font-semibold text-gray-600 mb-4">Booking Request Not Found</h1>
                <p className="text-gray-700">The requested booking ID could not be found.</p>
                <button onClick={() => router.push('/admin/booking-requests')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    View All Requests
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Booking Request Details (ID: {request.id_Peminjaman})</h1>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div><strong>Item Name:</strong> {request.nama_Barang}</div>
                <div><strong>Requested By:</strong> {request.nama_Peminjam} (ID: {request.id_Peminjam})</div>
                <div><strong>Requester Email:</strong> {request.peminjam_Email}</div>
                <div><strong>Requester Phone:</strong> {request.peminjam_No_Telp || 'N/A'}</div>
                <div><strong>Booking Period:</strong> {`${formatDateTime(request.start_Date)} - ${formatDateTime(request.end_Date)}`}</div>
                <div><strong>Reason:</strong> {request.deskripsi || 'No reason provided.'}</div>
                <div><strong>Status:</strong> <StatusTag status={request.status_Peminjaman} /></div>
                <div><strong>Request Date:</strong> {request.tanggal_Pengajuan ? formatDateTime(request.tanggal_Pengajuan) : 'N/A'}</div>
            </div>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-end space-x-3 mt-6">
                <button
                    onClick={() => router.push('/admin/booking-requests')}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                    Back to List
                </button>
                {request.status_Peminjaman === 'Pending' && (
                    <>
                        <button
                            onClick={handleDeclineClick}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-400"
                            disabled={actionLoading}
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleApprove}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400"
                            disabled={actionLoading}
                        >
                            Approve
                        </button>
                    </>
                )}
            </div>

            {/* Decline Modal */}
            {isDeclineModalVisible && (
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
            {actionLoading && <LoadingSpinner fullscreen />}
        </div>
    );
};

export default AdminBookingRequestDetailPage;