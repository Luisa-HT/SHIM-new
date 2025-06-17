// ClientApp/src/pages/User/UserDashboardPage.tsx
import {type FC, useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Table, Space, Button, notification } from 'antd';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { useAuth } from '../../hooks/useAuth';
import { getMyBookingHistory } from '../../api/bookings'; // API call for user's booking history
import type { BookingHistoryDto, PaginatedResponse, PaginationParams } from '../../types';
import StatusTag from '../../components/StatusTag'; // Reusable status tag component
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const UserDashboardPage: FC = () => {
    const { user } = useAuth();
    const [bookingHistory, setBookingHistory] = useState<BookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 5 }); // Show 5 recent bookings

    useEffect(() => {
        const fetchBookingHistory = async () => {
            setLoading(true);
            try {
                const response: PaginatedResponse<BookingHistoryDto> = await getMyBookingHistory(pagination);
                setBookingHistory(response.items);
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
    }, [pagination]); // Refetch when pagination changes

    // Table columns for recent bookings
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
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: BookingHistoryDto) => (
                <Space size="middle">
                    {/* "Invite" and "Jim Green" from design are ambiguous. Implementing "View Details" */}
                    <Button type="link" size="small">View Details</Button>
                    {/* "Delete" action would require backend endpoint and confirmation */}
                    {/* <Button type="link" danger size="small">Delete</Button> */}
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>Welcome, {user?.name || 'User'}!</Title>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="Recent Bookings">
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={bookingHistory}
                                rowKey="id_Peminjaman"
                                pagination={false} // No pagination for recent bookings on dashboard
                                locale={{ emptyText: 'No recent bookings found.' }}
                            />
                        )}
                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                            <Link to="/user/bookings/history">
                                <Button type="link">View All Booking History</Button>
                            </Link>
                        </div>
                    </Card>
                </Col>
                {/* You can add more cards/widgets here for a richer dashboard experience */}
            </Row>
        </PrivateLayout>
    );
};

export default UserDashboardPage;
