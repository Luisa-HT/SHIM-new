// src/components/Pagination.tsx
'use client'; // This component needs client-side interactivity

import React, { FC } from 'react';
import { PaginatedResponse } from '../types/common.d';

interface CustomPaginationProps {
    paginationData: PaginatedResponse<any>;
    onPageChange: (page: number, pageSize: number) => void;
    showTotal?: boolean;
}

const Pagination: FC<CustomPaginationProps> = ({ paginationData, onPageChange, showTotal = true }) => {
    const { pageNumber, pageSize, totalRecords, totalPages } = paginationData;

    if (totalRecords === 0) {
        return null;
    }

    const handlePrev = () => {
        if (pageNumber > 1) {
            onPageChange(pageNumber - 1, pageSize);
        }
    };

    const handleNext = () => {
        if (pageNumber < totalPages) {
            onPageChange(pageNumber + 1, pageSize);
        }
    };

    const handlePageClick = (page: number) => {
        if (page !== pageNumber) {
            onPageChange(page, pageSize);
        }
    };

    // Generate a limited set of page numbers around the current page
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5; // e.g., current, +2 before, +2 after
        let startPage = Math.max(1, pageNumber - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) pages.push('...');
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col items-end mt-5 space-y-3">
            {showTotal && (
                <span className="text-gray-600 text-sm">
          Total {totalRecords} items
        </span>
            )}
            <div className="flex items-center space-x-2">
                <button
                    onClick={handlePrev}
                    disabled={pageNumber === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                <div className="flex space-x-1">
                    {getPageNumbers().map((p, index) => (
                        <React.Fragment key={index}>
                            {p === '...' ? (
                                <span className="px-3 py-1 text-gray-700">...</span>
                            ) : (
                                <button
                                    onClick={() => handlePageClick(p as number)}
                                    className={`px-3 py-1 border rounded-md ${
                                        p === pageNumber
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={pageNumber === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>

                {/* Basic page size changer (could be a select dropdown for more options) */}
                <select
                    value={pageSize}
                    onChange={(e) => onPageChange(1, Number(e.target.value))}
                    className="ml-4 px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
                >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </select>
            </div>
        </div>
    );
};

export default Pagination;