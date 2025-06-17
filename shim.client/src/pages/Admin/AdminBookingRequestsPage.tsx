// ClientApp/src/pages/Admin/AdminBookingRequestsPage.tsx
import React, {type FC, useState, useEffect } from 'react';
import { Card, Typography, Table, Space, Button, notification, Modal, Form, Input, List, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { getPendingBookingRequests, approveBooking, declineBooking } from '../../api/bookings';
import type{ AdminBookingRequestDto, PaginatedResponse, PaginationParams, DeclineBookingDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusTag from '../../components/StatusTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminBookingRequestsPage: FC = () => {
    const [pendingRequests, setPendingRequests] = useState<AdminBookingRequestDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState<AdminBookingRequestDto | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isDeclineModalVisible, setIsDeclineModalVisible] = useState(false);
    const [declineForm] = Form.useForm();

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<AdminBookingRequestDto> = await getPendingBookingRequests(pagination);
            setPendingRequests(response.items);
            setTotalRecords(response.totalRecords);
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to fetch pending booking requests.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, [pagination]); // Re-fetch when pagination changes

    const handleTableChange = (antdPagination: any) => {
        setPagination({
            pageNumber: antdPagination.current,
            pageSize: antdPagination.pageSize,
        });
    };

    const handleViewDetails = (record: AdminBookingRequestDto) => {
        setSelectedRequest(record);
        setIsDetailModalVisible(true);
    };

    const handleApprove = async (id: number) => {
        setLoading(true);
        try {
            await approveBooking(id);
            notification.success({
                message: 'Booking Approved',
                description: `Booking request ID ${id} has been approved.`,
                placement: 'topRight',
            });
            setIsDetailModalVisible(false); // Close modal if open
            fetchPendingRequests(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Approval Failed',
                description: error.message || `Failed to approve booking request ID ${id}.`,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = (record: AdminBookingRequestDto) => {
        setSelectedRequest(record);
        setIsDeclineModalVisible(true);
    };

    const onDeclineSubmit = async (values: any) => {
        if (!selectedRequest) return;
        setLoading(true);
        try {
            const declineData: DeclineBookingDto = { alasan_Penolakan: values.reason };
            await declineBooking(selectedRequest.id_Peminjaman, declineData);
            notification.success({
                message: 'Booking Declined',
                description: `Booking request ID ${selectedRequest.id_Peminjaman} has been declined.`,
                placement: 'topRight',
            });
            setIsDeclineModalVisible(false);
            declineForm.resetFields(); // Clear the form
            setIsDetailModalVisible(false); // Close detail modal if open
            fetchPendingRequests(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Decline Failed',
                description: error.message || `Failed to decline booking request ID ${selectedRequest.id_Peminjaman}.`,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Booking ID',
            dataIndex: 'id_Peminjaman',
            key: 'id_Peminjaman',
        },
        {
            title: 'Item Name',
            dataIndex: 'nama_Barang',
            key: 'nama_Barang',
        },
        {
            title: 'Requested By',
            dataIndex: 'nama_Peminjam',
            key: 'nama_Peminjam',
        },
        {
            title: 'Time of Booking',
            dataIndex: 'dates',
            key: 'dates',
            render: (text: any, record: AdminBookingRequestDto) => (
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
            render: (text: any, record: AdminBookingRequestDto) => (
                <Space size="middle">
                    <Button type="primary" size="small" onClick={() => handleApprove(record.id_Peminjaman)} loading={loading}>Approve</Button>
                    <Button danger size="small" onClick={() => handleDecline(record)} loading={loading}>Decline</Button>
                    <Button size="small" onClick={() => handleViewDetails(record)}>View</Button>
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>Booking Requests</Title>
            <Card>
                {loading && <LoadingSpinner />}
                <Table
                    columns={columns}
                    dataSource={pendingRequests}
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
                    locale={{ emptyText: 'No pending booking requests found.' }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Booking Request Details"
                visible={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
                        Close
                    </Button>,
                    <Button key="decline" danger onClick={() => { setIsDetailModalVisible(false); handleDecline(selectedRequest!); }}>
                        Decline
                    </Button>,
                    <Button key="approve" type="primary" onClick={() => handleApprove(selectedRequest!.id_Peminjaman)} loading={loading}>
                        Approve
                    </Button>,
                ]}
            >
                {selectedRequest && (
                    <List itemLayout="horizontal">
                        <List.Item><List.Item.Meta title="Item Name" description={selectedRequest.nama_Barang} /></List.Item>
                        <List.Item><List.Item.Meta title="Requested By" description={selectedRequest.nama_Peminjam} /></List.Item>
                        <List.Item><List.Item.Meta title="Requester Email" description={selectedRequest.peminjam_Email} /></List.Item>
                        <List.Item><List.Item.Meta title="Requester Phone" description={selectedRequest.peminjam_No_Telp || 'N/A'} /></List.Item>
                        <List.Item><List.Item.Meta title="Booking Period" description={`${new Date(selectedRequest.start_Date).toLocaleString()} - ${new Date(selectedRequest.end_Date).toLocaleString()}`} /></List.Item>
                        <List.Item><List.Item.Meta title="Reason" description={selectedRequest.deskripsi || 'No reason provided.'} /></List.Item>
                        <List.Item><List.Item.Meta title="Request Date" description={selectedRequest.tanggal_Pengajuan ? new Date(selectedRequest.tanggal_Pengajuan).toLocaleString() : 'N/A'} /></List.Item>
                    </List>
                )}
            </Modal>

            {/* Decline Modal */}
            <Modal
                title="Decline Booking Request"
                visible={isDeclineModalVisible}
                onCancel={() => setIsDeclineModalVisible(false)}
                footer={null}
                destroyOnClose={true}
            >
                <Form form={declineForm} name="decline_reason_form" onFinish={onDeclineSubmit} layout="vertical">
                    <Form.Item
                        label="Reason for Decline"
                        name="reason"
                        rules={[{ required: true, message: 'Please provide a reason for declining this request.' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" danger loading={loading}>
                            Confirm Decline
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </PrivateLayout>
    );
};

export default AdminBookingRequestsPage;
