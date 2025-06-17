// ClientApp/src/pages/User/UserBookingHistoryPage.tsx
import {type FC, useState, useEffect } from 'react';
import { Card, Typography, Table, Space, Button, notification } from 'antd';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { getMyBookingHistory } from '../../api/bookings';
import type{ BookingHistoryDto, PaginatedResponse, PaginationParams } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusTag from '../../components/StatusTag'; // Reusable status tag component

const { Title, Text } = Typography;

const UserBookingHistoryPage: FC = () => {
    const [bookingHistory, setBookingHistory] = useState<BookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            setLoading(true);
            try {
                const response: PaginatedResponse<BookingHistoryDto> = await getMyBookingHistory(pagination);
                setBookingHistory(response.items);
                setTotalRecords(response.totalRecords);
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch booking history.',
                    placement: 'topRight',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [pagination]); // Re-fetch when pagination changes

    const handleTableChange = (antdPagination: any) => {
        setPagination({
            pageNumber: antdPagination.current,
            pageSize: antdPagination.pageSize,
        });
    };

    // Table columns for booking history
    const columns = [
        {
            title: 'Item Name',
            dataIndex: 'nama_Barang',
            key: 'nama_Barang',
        },
        {
            title: 'Time of Booking',
            dataIndex: 'dates',
            key: 'dates',
            render: (_text: any, record: BookingHistoryDto) => (
                <Text>{`${new Date(record.start_Date).toLocaleDateString()} - ${new Date(record.end_Date).toLocaleDateString()}`}</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status_Peminjaman',
            key: 'status_Peminjaman',
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            title: 'Reason',
            dataIndex: 'deskripsi',
            key: 'deskripsi',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_text: any, record: BookingHistoryDto) => (
                <Space size="middle">
                    {/* "Invite" and "Jim Green" from design are ambiguous, implementing a generic "View" button */}
                    <Button type="link" size="small" onClick={() => notification.info({ message: 'View Details', description: `Viewing details for booking ID: ${record.id_Peminjaman}` })}>
                        View
                    </Button>
                    {/* "Delete" action would require a backend endpoint and confirmation modal */}
                    {/* <Button type="link" danger size="small">Delete</Button> */}
                    {/* Display decline reason if applicable */}
                    {record.alasan_Penolakan && (
                        <Button type="link" danger size="small" onClick={() => notification.info({ message: 'Decline Reason', description: record.alasan_Penolakan })}>
                            Reason
                        </Button>
                    )}
                    {/* Display fine if applicable */}
                    {record.denda && record.denda > 0 && (
                        <Text type="danger">Fine: {record.denda}</Text>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>Booking History</Title>
            <Card>
                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={bookingHistory}
                        rowKey="id_Peminjaman"
                        pagination={{
                            current: pagination.pageNumber,
                            pageSize: pagination.pageSize,
                            total: totalRecords,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                        locale={{ emptyText: 'No booking history found.' }}
                    />
                )}
            </Card>
            {loading && <LoadingSpinner fullscreen />}
        </PrivateLayout>
    );
};

export default UserBookingHistoryPage;
