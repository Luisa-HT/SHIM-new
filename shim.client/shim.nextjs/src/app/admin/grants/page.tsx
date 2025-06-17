// src/app/admin/grants/page.tsx
'use client'; // This page needs client-side interactivity

import React, { FC, useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner'; // Adjusted path
import Pagination from '@/components/Pagination'; // Adjusted path
import { getAllGrants, createGrant, updateGrant, deleteGrant } from '@/api/grants'; // Adjusted path
import { HibahDto, CreateHibahDto, UpdateHibahDto, PaginationParams, PaginatedResponse } from '@/types'; // Adjusted path

const AdminManageGrantsPage: FC = () => {
    const [grants, setGrants] = useState<HibahDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEditingGrant, setCurrentEditingGrant] = useState<HibahDto | null>(null);

    // Form states for Add/Edit Modal
    const [grantName, setGrantName] = useState('');
    const [grantDescription, setGrantDescription] = useState('');
    const [grantYear, setGrantYear] = useState<number | null>(null);
    const [responsiblePerson, setResponsiblePerson] = useState('');
    const [actionLoading, setActionLoading] = useState(false);


    const fetchGrants = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: PaginatedResponse<HibahDto> = await getAllGrants(pagination);
            setGrants(response.items);
            setTotalRecords(response.totalRecords);
            setTotalPages(response.totalPages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch grants data.');
            alert(`Error: ${err.message || 'Failed to fetch grants data.'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrants();
    }, [pagination]);

    const handlePageChange = (page: number, pageSize: number) => {
        setPagination({ pageNumber: page, pageSize: pageSize });
    };

    const resetForm = () => {
        setGrantName('');
        setGrantDescription('');
        setGrantYear(null);
        setResponsiblePerson('');
        setError(null);
    };

    const showAddGrantModal = () => {
        setCurrentEditingGrant(null);
        resetForm();
        setIsModalVisible(true);
    };

    const showEditGrantModal = (grant: HibahDto) => {
        setCurrentEditingGrant(grant);
        setGrantName(grant.nama_Hibah);
        setGrantDescription(grant.keterangan || '');
        setGrantYear(grant.tahun || null);
        setResponsiblePerson(grant.penanggung_Jawab || '');
        setIsModalVisible(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        setError(null);

        // Basic form validation
        if (!grantName) {
            setError('Grant Name is required.');
            setActionLoading(false);
            return;
        }
        if (grantYear !== null && (grantYear < 1900 || grantYear > 3000)) {
            setError('Year must be between 1900 and 3000.');
            setActionLoading(false);
            return;
        }


        const grantData: CreateHibahDto = {
            nama_Hibah: grantName,
            keterangan: grantDescription || undefined,
            tahun: grantYear?? undefined,
            penanggung_Jawab: responsiblePerson || undefined,
        };

        try {
            if (currentEditingGrant) {
                await updateGrant(currentEditingGrant.id_Hibah, grantData);
                alert(`Grant Updated: Grant ${grantData.nama_Hibah} has been updated.`);
            } else {
                await createGrant(grantData);
                alert(`Grant Added: New grant ${grantData.nama_Hibah} has been added.`);
            }
            setIsModalVisible(false);
            fetchGrants(); // Refresh the list
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            alert(`Operation Failed: ${err.message || 'An unexpected error occurred.'}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteGrant = async (id: number) => {
        setActionLoading(true);
        setError(null);
        if (!window.confirm('Are you sure you want to delete this grant? This action cannot be undone.')) {
            setActionLoading(false);
            return;
        }
        try {
            await deleteGrant(id);
            alert(`Grant Deleted: Grant ID ${id} has been deleted.`);
            fetchGrants(); // Refresh the list
        } catch (err: any) {
            setError(err.message || `Failed to delete grant ID ${id}.`);
            alert(`Deletion Failed: ${err.message || `Failed to delete grant ID ${id}.`}`);
        } finally {
            setActionLoading(false);
        }
    };

    const paginatedResponseForComponent: PaginatedResponse<HibahDto> = {
        items: grants,
        pageNumber: pagination.pageNumber || 1,
        pageSize: pagination.pageSize || 10,
        totalRecords: totalRecords,
        totalPages: totalPages,
        hasPreviousPage: (pagination.pageNumber || 1) > 1,
        hasNextPage: (pagination.pageNumber || 1) < totalPages,
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Manage Grants</h1>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Grant List</h2>
                <button
                    onClick={showAddGrantModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    ➕ Add New Grant
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : grants.length === 0 ? (
                <p className="text-gray-600">No grants found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsible Person</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {grants.map((record) => (
                            <tr key={record.id_Hibah} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id_Hibah}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.nama_Hibah}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{record.keterangan || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.tahun || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.penanggung_Jawab || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => showEditGrantModal(record)}
                                        className="text-blue-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteGrant(record.id_Hibah)}
                                        className="text-red-600 hover:underline text-sm bg-transparent border-none p-0 cursor-pointer"
                                        disabled={actionLoading}
                                    >
                                        Delete
                                    </button>
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

            {/* Add/Edit Grant Modal */}
            {isModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{currentEditingGrant ? 'Edit Grant' : 'Add New Grant'}</h3>
                        <form onSubmit={handleModalSubmit} className="flex flex-col space-y-4">
                            <div className="text-left">
                                <label htmlFor="grant-name" className="block text-gray-700 text-sm font-bold mb-2">Grant Name</label>
                                <input
                                    type="text"
                                    id="grant-name"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={grantName}
                                    onChange={(e) => setGrantName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="grant-description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                                <textarea
                                    id="grant-description"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    rows={2}
                                    value={grantDescription}
                                    onChange={(e) => setGrantDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="text-left">
                                <label htmlFor="grant-year" className="block text-gray-700 text-sm font-bold mb-2">Year</label>
                                <input
                                    type="number"
                                    id="grant-year"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    min={1900}
                                    max={3000}
                                    value={grantYear === null ? '' : grantYear}
                                    onChange={(e) => setGrantYear(e.target.value === '' ? null : Number(e.target.value))}
                                />
                            </div>
                            <div className="text-left">
                                <label htmlFor="responsible-person" className="block text-gray-700 text-sm font-bold mb-2">Responsible Person</label>
                                <input
                                    type="text"
                                    id="responsible-person"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    value={responsiblePerson}
                                    onChange={(e) => setResponsiblePerson(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setIsModalVisible(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={actionLoading}>
                                    {currentEditingGrant ? 'Update Grant' : 'Add Grant'}
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

export default AdminManageGrantsPage;