// src/app/user/bookings/make/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateLayout from '@/components/PrivateLayout'; // Adjusted path
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import { createBooking } from '@/api/bookings'; // Adjusted path
import { getAvailableInventory } from '@/api/inventory'; // Adjusted path
import { CreateBookingRequestDto, BarangDto, PaginationParams, PaginatedResponse } from '@/types';

const MakeBookingPage: FC = () => {
    const [selectedItem, setSelectedItem] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [items, setItems] = useState<BarangDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchAvailableItems = async () => {
            setItemsLoading(true);
            setError(null);
            try {
                const response: PaginatedResponse<BarangDto> = await getAvailableInventory({ pageNumber: 1, pageSize: 1000 });
                setItems(response.items);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch available items.');
                alert(`Error: ${err.message || 'Failed to fetch available items.'}`);
            } finally {
                setItemsLoading(false);
            }
        };

        fetchAvailableItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!selectedItem || !startDate || !endDate || !reason) {
            setError('Please fill all required fields.');
            setLoading(false);
            return;
        }

        const bookingData: CreateBookingRequestDto = {
            id_Barang: parseInt(selectedItem),
            start_Date: new Date(startDate).toISOString(),
            end_Date: new Date(endDate).toISOString(),
            deskripsi: reason,
        };

        try {
            await createBooking(bookingData);
            alert('Booking Request Submitted: Your request has been successfully submitted for review.');
            router.push('/user/bookings/history');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during booking.');
            alert(`Booking Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Make a Booking</h1>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Form</h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                    <div className="text-left">
                        <label htmlFor="item-select" className="block text-gray-700 text-sm font-bold mb-2">
                            Item :
                        </label>
                        <select
                            id="item-select"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            required
                            disabled={itemsLoading}
                        >
                            <option value="">Select an item</option>
                            {items.map((item) => (
                                <option key={item.id_Barang} value={item.id_Barang}>
                                    {item.nama_Barang} ({item.status_Kondisi})
                                </option>
                            ))}
                        </select>
                        {itemsLoading && <p className="text-gray-500 text-sm mt-1">Loading items...</p>}
                    </div>

                    <div className="text-left">
                        <label htmlFor="start-date-input" className="block text-gray-700 text-sm font-bold mb-2">
                            Start Date and Time :
                        </label>
                        <input
                            type="datetime-local"
                            id="start-date-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="end-date-input" className="block text-gray-700 text-sm font-bold mb-2">
                            End Date and Time :
                        </label>
                        <input
                            type="datetime-local"
                            id="end-date-input"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="text-left">
                        <label htmlFor="reason-textarea" className="block text-gray-700 text-sm font-bold mb-2">
                            Reason :
                        </label>
                        <textarea
                            id="reason-textarea"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="Reason for booking (e.g., project work, personal use)"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors w-full disabled:bg-blue-400"
                        disabled={loading || itemsLoading}
                    >
                        {loading ? 'Submitting...' : 'Submit Booking Request'}
                    </button>
                </form>
            </div>
            {(loading || itemsLoading) && <LoadingSpinner fullscreen />}
        </div>
    );
};

export default MakeBookingPage;