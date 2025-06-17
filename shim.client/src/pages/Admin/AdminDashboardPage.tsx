// ClientApp/src/pages/Admin/AdminDashboardPage.tsx
import {type FC, useEffect, useState } from 'react';
import {Typography, Card, Row, Col, Table, Space, Button, notification, Tag, Statistic, List, Avatar} from 'antd';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { useAuth } from '../../hooks/useAuth';
import { getAdminDashboardStats, getPendingBookingRequests, getAllBookingHistory } from '../../api/bookings';
import type{ AdminDashboardStatsDto, AdminBookingRequestDto, AdminBookingHistoryDto, PaginationParams, PaginatedResponse } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusTag from '../../components/StatusTag'; // Reusable status tag component
import { Link } from 'react-router-dom';
import {UserOutlined} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminDashboardPage: FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
    const [pendingRequests, setPendingRequests] = useState<AdminBookingRequestDto[]>([]);
    const [recentBookings, setRecentBookings] = useState<AdminBookingHistoryDto[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);
    const [loadingRecent, setLoadingRecent] = useState(true);

    // Fetch Dashboard Stats
    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const fetchedStats = await getAdminDashboardStats();
                setStats(fetchedStats);
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch dashboard statistics.',
                    placement: 'topRight',
                });
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    // Fetch Pending Booking Requests (for the list on dashboard)
    useEffect(() => {
        const fetchPendingRequests = async () => {
            setLoadingPending(true);
            try {
                // Fetch a small number of pending requests for dashboard display
                const response: PaginatedResponse<AdminBookingRequestDto> = await getPendingBookingRequests({ pageNumber: 1, pageSize: 3 });
                setPendingRequests(response.items);
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch pending booking requests.',
                    placement: 'topRight',
                });
            } finally {
                setLoadingPending(false);
            }
        };
        fetchPendingRequests();
    }, []);

    // Fetch Recent System-Wide Bookings (for the table on dashboard)
    useEffect(() => {
        const fetchRecentBookings = async () => {
            setLoadingRecent(true);
            try {
                // Fetch a small number of recent bookings for dashboard display
                const response: PaginatedResponse<AdminBookingHistoryDto> = await getAllBookingHistory({ pageNumber: 1, pageSize: 5 });
                setRecentBookings(response.items);
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch recent bookings.',
                    placement: 'topRight',
                });
            } finally {
                setLoadingRecent(false);
            }
        };
        fetchRecentBookings();
    }, []);

    // Table columns for Recent Bookings
    const recentBookingsColumns = [
        {
            title: 'Item Name',
            dataIndex: 'nama_Barang',
            key: 'nama_Barang',
        },
        {
            title: 'Booked By',
            dataIndex: 'nama_Peminjam',
            key: 'nama_Peminjam',
        },
        {
            title: 'Time of Booking',
            dataIndex: 'dates',
            key: 'dates',
            render: (text: any, record: AdminBookingHistoryDto) => (
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
            render: (text: any, record: AdminBookingHistoryDto) => (
                <Space size="middle">
                    {/* "Invite" and "Jim Green" from design are ambiguous, implementing a generic "View" button */}
                    <Button type="link" size="small" onClick={() => notification.info({ message: 'View Details', description: `Viewing details for booking ID: ${record.id_Peminjaman}` })}>
                        View
                    </Button>
                    {/* "Delete" action would require backend endpoint and confirmation modal */}
                    {/* <Button type="link" danger size="small">Delete</Button> */}
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>Admin Dashboard</Title>

            {/* Stats Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Requests"
                            value={stats?.pendingCount || 0}
                            loading={loadingStats}
                            valueStyle={{ color: '#faad14' }} // Ant Design warning color
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Today's Bookings"
                            value={stats?.todaysBookingsCount || 0}
                            loading={loadingStats}
                            valueStyle={{ color: '#1890ff' }} // Ant Design primary color
                        />
                    </Card>
                </Col>
                {/* Add more stats cards here if needed */}
            </Row>

            {/* Pending Requests Section */}
            <Card title="Pending Requests" style={{ marginBottom: 24 }}>
                {loadingPending ? (
                    <LoadingSpinner />
                ) : pendingRequests.length === 0 ? (
                    <Text type="secondary">No pending booking requests.</Text>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={pendingRequests}
                        renderItem={request => (
                            <List.Item
                                actions={[
                                    <Link to={`/admin/booking-requests/${request.id_Peminjaman}`}><Button type="link" size="small">View</Button></Link>,
                                    <Button type="primary" size="small" onClick={() => notification.info({ message: 'Approve', description: `Approve booking ID: ${request.id_Peminjaman}` })}>Approve</Button>,
                                    <Button danger size="small" onClick={() => notification.info({ message: 'Decline', description: `Decline booking ID: ${request.id_Peminjaman}` })}>Decline</Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar icon={<UserOutlined />} />}
                                    title={<Text strong>{request.nama_Barang} request by {request.nama_Peminjam}</Text>}
                                    description={request.deskripsi}
                                />
                            </List.Item>
                        )}
                    />
                )}
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Link to="/admin/booking-requests">
                        <Button type="link">View All Pending Requests</Button>
                    </Link>
                </div>
            </Card>

            {/* Recent Bookings Table */}
            <Card title="Recent Bookings">
                {loadingRecent ? (
                    <LoadingSpinner />
                ) : (
                    <Table
                        columns={recentBookingsColumns}
                        dataSource={recentBookings}
                        rowKey="id_Peminjaman"
                        pagination={false} // No pagination for recent bookings on dashboard
                        locale={{ emptyText: 'No recent system-wide bookings found.' }}
                    />
                )}
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Link to="/admin/booking-history">
                        <Button type="link">View All Booking History</Button>
                    </Link>
                </div>
            </Card>
        </PrivateLayout>
    );
};

export default AdminDashboardPage;
