// src/app/admin/inventory/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import StatusTag from '@/components/StatusTag'; // Adjusted path
import Pagination from '@/components/Pagination'; // Adjusted path
import { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateInventoryItemStatus } from '@/api/inventory'; // Adjusted path
import { getAllGrants } from '@/api/grants'; // To fetch grants for dropdown
import { BarangDto, CreateBarangDto, UpdateBarangDto, UpdateBarangStatusDto, PaginationParams, PaginatedResponse, HibahDto } from '@/types'; // Adjusted path
import { formatDateTime, formatRupiah } from '@/utils/helpers'; // Adjusted path

const AdminManageInventoryPage: FC = () => {
    const [inventory, setInventory] = useState<BarangDto[]>([]);
    const [grants, setGrants] = useState<HibahDto[]>([]); // State to store grants for the dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState<BarangDto | null>(null);

    // Form states for Add/Edit Modal
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemCondition, setItemCondition] = useState('');
    const [acquisitionDate, setAcquisitionDate] = useState('');
    const [itemStatus, setItemStatus] = useState('');
    const [itemPrice, setItemPrice] = useState<number | null>(null);
    const [selectedGrantId, setSelectedGrantId] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState(false);


    const fetchInventory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: PaginatedResponse<BarangDto> = await getAllInventory(pagination);
            setInventory(response.items);
            setTotalRecords(response.totalRecords);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch inventory data.');
            alert(`Error: ${err.message || 'Failed to fetch inventory data.'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchGrants = async () => {
        try {
            const response: PaginatedResponse<HibahDto> = await getAllGrants({ pageNumber: 1, pageSize: 1000 }); // Fetch all grants
            setGrants(response.items);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch grants data.');
            alert(`Error: ${err.message || 'Failed to fetch grants data.'}`);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchGrants(); // Fetch grants when component mounts
    }, [pagination]); // Refetch inventory when pagination changes, grants are fetched once

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ pageNumber: page, pageSize: pageSize });
    };

    const resetForm = () => {
        setItemName('');
        setItemDescription('');
        setItemCondition('');
        setAcquisitionDate('');
        setItemStatus('');
        setItemPrice(null);
        setSelectedGrantId(null);
        setError(null);
    };

    const showAddItemModal = () => {
        setCurrentEditingItem(null);
        resetForm();
        setIsModalVisible(true);
    };

    const showEditItemModal = (item: BarangDto) => {
        setCurrentEditingItem(item);
        setItemName(item.nama_Barang);
        setItemDescription(item.deskripsi_Barang || '');
        setItemCondition(item.status_Kondisi || '');
        setAcquisitionDate(item.tanggal_Perolehan.split('T')[0]); // Format date for input type="date"
        setItemStatus(item.status_Barang);
        setItemPrice(item.harga_Barang || null);
        setSelectedGrantId(item.id_Hibah || null);
        setIsModalVisible(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setError(null);

        // Basic form validation
        if (!itemName || !acquisitionDate || !itemStatus) {
            setError('Item Name, Acquisition Date, and Item Status are required.');
            setActionLoading(false);
            return;
        }

        const itemData: CreateBarangDto = {
            nama_Barang: itemName,
            deskripsi_Barang: itemDescription || undefined,
            status_Kondisi: itemCondition || undefined,
            tanggal_Perolehan: new Date(acquisitionDate).toISOString(),
            status_Barang: itemStatus,
            harga_Barang: itemPrice?? undefined,
            id_Hibah: selectedGrantId?? undefined,
        };

        try {
            if (currentEditingItem) {
                await updateInventoryItem(currentEditingItem.id_Barang, itemData);
                alert(`Item Updated: Inventory item ${itemData.nama_Barang} has been updated.`);
            } else {
                await createInventoryItem(itemData);
                alert(`Item Added: New inventory item ${itemData.nama_Barang} has been added.`);
            }
            setIsModalVisible(false);
            fetchInventory(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Operation Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        setActionLoading(true);
        setError(null);
        if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            setActionLoading(false);
            return;
        }
        try {
            await deleteInventoryItem(id);
            alert(`Item Deleted: Inventory item ID ${id} has been deleted.`);
            fetchInventory(); // Refresh the list
        } catch (err: any) {
            setError(err.message || `Failed to delete inventory item ID ${id}.`);
            alert(`Deletion Failed: ${err.message || `Failed to delete inventory item ID ${id}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        setActionLoading(true);
        setError(null);
        try {
            const statusData: UpdateBarangStatusDto = { status_Barang: newStatus };
            await updateInventoryItemStatus(id, statusData);
            alert(`Status Updated: Item ID ${id} status changed to ${newStatus}.`);
            fetchInventory(); // Refresh the list
        } catch (err: any) {
            setError(err.message || `Failed to update status for item ID ${id}.`);
            alert(`Status Update Failed: ${err.message || `Failed to update status for item ID ${id}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const paginatedResponseForComponent: PaginatedResponse<BarangDto> = {
        items: inventory, // Pass the actual items
        pageNumber: pagination.pageNumber || 1, // Ensure pageNumber is not undefined
        pageSize: pagination.pageSize || 10,   // Ensure pageSize is not undefined
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasPreviousPage: (pagination.pageNumber || 1) > 1, // Calculate based on current page
        hasNextPage: (pagination.pageNumber || 1) < totalPages, // Calculate based on current page
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Manage Inventory</h1>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Inventory List</h2>
                <button
                    onClick={showAddItemModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    ➕ Add New Item
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : inventory.length === 0 ? (
                <p className="text-gray-600">No inventory items found.</p>
            ) : (
                <div className="overflow-x-auto"> {/* This div enables horizontal scrolling */}
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acquisition Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Booking</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {inventory.map((record) => (
                            <tr key={record.id_Barang} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here, let content dictate width or use table-fixed */}
                                    {record.id_Barang}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    {record.nama_Barang}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                                    {/* Removed min-w, relying on max-w-xs and text-ellipsis */}
                                    {record.deskripsi_Barang || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    <StatusTag status={record.status_Kondisi || 'N/A'} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="flex flex-col items-start space-y-1"> {/* Removed min-w */}
                                        <StatusTag status={record.status_Barang} />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    {formatDateTime(record.tanggal_Perolehan)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    {formatRupiah(record.harga_Barang)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    {record.nama_Hibah || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {/* Removed min-w from here */}
                                    {record.latest_Booking_Date ? formatDateTime(record.latest_Booking_Date) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium space-x-2">
                                    <div className="flex space-x-2"> {/* Removed min-w */}
                                        <button
                                            onClick={() => showEditItemModal(record)}
                                            className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(record.id_Barang)}
                                            className="text-red-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                            disabled={actionLoading}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {totalRecords > 0 && (
                <Pagination
                    paginationData={paginatedResponseForComponent}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Add/Edit Item Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{currentEditingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
                        <form onSubmit={handleModalSubmit} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="item-name" className="block text-gray-700 text-sm font-bold mb-2">Item Name</label>
                                <input
                                    type="text"
                                    id="item-name"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="item-description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    id="item-description"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    rows={2}
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="text-left">
                                <label htmlFor="item-condition" className="block text-gray-700 text-sm font-bold mb-2">Condition Status</label>
                                <input
                                    type="text"
                                    id="item-condition"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={itemCondition}
                                    onChange={(e) => setItemCondition(e.target.value)}
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="acquisition-date" className="block text-gray-700 text-sm font-bold mb-2">Acquisition Date</label>
                                <input
                                    type="date"
                                    id="acquisition-date"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={acquisitionDate}
                                    onChange={(e) => setAcquisitionDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="item-status" className="block text-gray-700 text-sm font-bold mb-2">Item Status</label>
                                <select
                                    id="item-status"
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={itemStatus}
                                    onChange={(e) => setItemStatus(e.target.value)}
                                    required
                                >
                                    <option value="">Select status</option>
                                    <option value="Available">Available</option>
                                    <option value="Booked">Booked</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                            </div>
                            <div className="text-left">
                                <label htmlFor="item-price" className="block text-gray-700 text-sm font-bold mb-2">Price (Rp)</label>
                                <input
                                    type="number"
                                    id="item-price"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    min={0}
                                    value={itemPrice === null ? '' : itemPrice}
                                    onChange={(e) => setItemPrice(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="item-grant" className="block text-gray-700 text-sm font-bold mb-2">Grant (Optional)</label>
                                <select
                                    id="item-grant"
                                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={selectedGrantId === null ? '' : selectedGrantId}
                                    onChange={(e) => setSelectedGrantId(e.target.value === '' ? null : Number(e.target.value))}
                                >
                                    <option value="">Select a grant</option>
                                    {grants.map(grant => (
                                        <option key={grant.id_Hibah} value={grant.id_Hibah}>
                                            {grant.nama_Hibah}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={actionLoading}>
                                    {currentEditingItem ? 'Update Item' : 'Add Item'}
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
export default AdminManageInventoryPage;
