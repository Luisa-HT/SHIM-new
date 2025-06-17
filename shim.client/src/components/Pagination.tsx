// ClientApp/src/components/Pagination.tsx
import {type FC } from 'react';
import { Pagination as AntdPagination, Space, Typography } from 'antd';
import type {PaginatedResponse} from '../types/common.d'; // Import PaginatedResponse type
// Import PaginatedResponse type

const { Text } = Typography;

interface CustomPaginationProps {
    // Data from the API's paginated response
    paginationData: PaginatedResponse<any>; // 'any' because it's generic, actual type will be passed
    // Function to call when page or page size changes
    onPageChange: (page: number, pageSize: number) => void;
    // Optional: Show total text
    showTotal?: boolean;
}

const Pagination: FC<CustomPaginationProps> = ({ paginationData, onPageChange, showTotal = true }) => {
    const { pageNumber, pageSize, totalRecords, totalPages } = paginationData;

    if (totalRecords === 0) {
        return null; // Don't render pagination if there are no records
    }

    return (
        <Space direction="vertical" style={{ width: '100%', textAlign: 'right', marginTop: '20px' }}>
            {showTotal && (
                <Text type="secondary">
                    Total {totalRecords} items
                </Text>
            )}
            <AntdPagination
                current={pageNumber}
                pageSize={pageSize}
                total={totalRecords}
                onChange={onPageChange}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={['10', '20', '50']} // Common page size options
                // You can customize the 'showTotal' render function if needed
                // showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
        </Space>
    );
};

export default Pagination;
