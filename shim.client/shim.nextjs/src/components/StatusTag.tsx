// src/components/StatusTag.tsx
'use client'; // This component is a simple presentational component, but often part of client-side trees

import React, { FC } from 'react';

interface StatusTagProps {
    status: string; // The status string (e.g., "Pending", "Approved", "Available", "Damaged")
}

const StatusTag: FC<StatusTagProps> = ({ status }) => {
    let colorClasses: string;
    let text: string = status; // Default text is the status itself

    switch (status.toLowerCase()) {
        case 'available':
        case 'tersedia':
        case 'good':
        case 'approved':
        case 'completed':
        case 'returned':
            colorClasses = 'bg-green-100 text-green-800'; // Light green background, dark green text
            break;
        case 'booked':
        case 'pending':
            colorClasses = 'bg-blue-100 text-blue-800'; // Light blue background, dark blue text
            break;
        case 'declined':
        case 'unavailable':
        case 'damaged':
        case 'maintenance':
            colorClasses = 'bg-red-100 text-red-800'; // Light red background, dark red text
            break;
        default:
            colorClasses = 'bg-gray-100 text-gray-800'; // Default grey
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
      {text}
    </span>
    );
};

export default StatusTag;