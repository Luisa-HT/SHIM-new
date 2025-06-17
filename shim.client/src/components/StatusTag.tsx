// ClientApp/src/components/StatusTag.tsx
import  {type FC } from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
    status: string; // The status string (e.g., "Pending", "Approved", "Available", "Damaged")
}

const StatusTag: FC<StatusTagProps> = ({ status }) => {
    let color: string;
    const text: string = status; // Default text is the status itself

    switch (status.toLowerCase()) {
        case 'available':
        case 'tersedia':
        case 'good':
        case 'approved':
        case 'completed':
        case 'returned': // Assuming 'Returned' is a final positive status
            color = 'green';
            break;
        case 'booked':
        case 'pending':
            color = 'processing'; // Ant Design's processing blue/geekblue
            break;
        case 'declined':
        case 'unavailable':
        case 'damaged':
        case 'maintenance':
            color = 'red';
            break;
        default:
            color = 'default'; // Grey for unknown status
            break;
    }

    // You can further customize text for specific statuses if needed
    // e.g., if status is "Pending" but you want to display "Awaiting Approval"
    // switch (status.toLowerCase()) {
    //   case 'pending': text = 'Awaiting Approval'; break;
    //   // ...
    // }

    return <Tag color={color}>{text}</Tag>;
};

export default StatusTag;
