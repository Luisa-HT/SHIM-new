// ClientApp/src/pages/Admin/AdminBookingHistoryPage.tsx
import React, {type FC, useState, useEffect } from 'react';
import {Card, Typography, Table, Space, Button, notification, Modal, Form, Input, List, Avatar, Select} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { getAllBookingHistory, completeBooking } from '../../api/bookings'; // Added completeBooking API
import type{ AdminBookingHistoryDto, PaginatedResponse, PaginationParams, CompleteBookingDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusTag from '../../components/StatusTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminBookingHistoryPage: FC = () => {
    const [bookingHistory, setBookingHistory] = useState<AdminBookingHistoryDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<AdminBookingHistoryDto | null>(null);
    const [completeForm] = Form.useForm();

    const fetchBookingHistory = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<AdminBookingHistoryDto> = await getAllBookingHistory(pagination);
            setBookingHistory(response.items);
            setTotalRecords(response.totalRecords);
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to fetch all booking history.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, [pagination]); // Re-fetch when pagination changes

    const handleTableChange = (antdPagination: any) => {
        setPagination({
            pageNumber: antdPagination.current,
            pageSize: antdPagination.pageSize,
        });
    };

    const handleViewDetails = (record: AdminBookingHistoryDto) => {
        setSelectedBooking(record);
        setIsDetailModalVisible(true);
    };

    const handleCompleteBooking = (record: AdminBookingHistoryDto) => {
        setSelectedBooking(record);
        setIsCompleteModalVisible(true);
    };

    const onCompleteSubmit = async (values: any) => {
        if (!selectedBooking) return;
        setLoading(true);
        try {
            const completeData: CompleteBookingDto = {
                denda: values.denda ? parseInt(values.denda) : null,
                status_Kondisi_Pengembalian: values.statusKondisiPengembalian,
            };
            await completeBooking(selectedBooking.id_Peminjaman, completeData);
            notification.success({
                message: 'Booking Completed',
                description: `Booking ID ${selectedBooking.id_Peminjaman} has been marked as completed.`,
                placement: 'topRight',
            });
            setIsCompleteModalVisible(false);
            completeForm.resetFields();
            setIsDetailModalVisible(false); // Close detail modal if open
            fetchBookingHistory(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Completion Failed',
                description: error.message || `Failed to complete booking ID ${selectedBooking.id_Peminjaman}.`,
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
            title: 'Booked By',
            dataIndex: 'nama_Peminjam',
            key: 'nama_Peminjam',
        },
        {
            title: 'Booking Period',
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
            title: 'Request Date',
            dataIndex: 'tanggal_Pengajuan',
            key: 'tanggal_Pengajuan',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Approved By',
            dataIndex: 'nama_Admin',
            key: 'nama_Admin',
            render: (name: string) => name || 'N/A',
        },
        {
            title: 'Actual Return',
            dataIndex: 'tanggal_Pengembalian_Aktual',
            key: 'tanggal_Pengembalian_Aktual',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Fine',
            dataIndex: 'denda',
            key: 'denda',
            render: (denda: number) => denda ? `Rp ${denda.toLocaleString('id-ID')}` : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: AdminBookingHistoryDto) => (
                <Space size="middle">
                    <Button size="small" onClick={() => handleViewDetails(record)}>View</Button>
                    {record.status_Peminjaman === 'Approved' && !record.tanggal_Pengembalian_Aktual && (
                        <Button type="primary" size="small" onClick={() => handleCompleteBooking(record)} loading={loading}>Complete</Button>
                    )}
                    {/* Delete action would require backend endpoint and confirmation */}
                    {/* <Button type="link" danger size="small">Delete</Button> */}
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>All Booking History</Title>
            <Card>
                {loading && <LoadingSpinner />}
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
                    scroll={{ x: 'max-content' }} // Enable horizontal scroll for many columns
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Booking Details"
                visible={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Close
                    </Button>,
                    selectedBooking?.status_Peminjaman === 'Approved' && !selectedBooking?.tanggal_Pengembalian_Aktual && (
                        <Button key="complete" type="primary" onClick={() => { setIsDetailModalVisible(false); handleCompleteBooking(selectedBooking!); }} loading={loading}>
                            Complete Booking
                        </Button>
                    ),
                ]}
            >
                {selectedBooking && (
                    <List itemLayout="horizontal">
                        <List.Item><List.Item.Meta title="Booking ID" description={selectedBooking.id_Peminjaman} /></List.Item>
                        <List.Item><List.Item.Meta title="Item Name" description={selectedBooking.nama_Barang} /></List.Item>
                        <List.Item><List.Item.Meta title="Item ID" description={selectedBooking.id_Barang} /></List.Item>
                        <List.Item><List.Item.Meta title="Requested By" description={`${selectedBooking.nama_Peminjam} (ID: ${selectedBooking.id_Peminjam})`} /></List.Item>
                        <List.Item><List.Item.Meta title="Booking Period" description={`${new Date(selectedBooking.start_Date).toLocaleString()} - ${new Date(selectedBooking.end_Date).toLocaleString()}`} /></List.Item>
                        <List.Item><List.Item.Meta title="Reason" description={selectedBooking.deskripsi || 'No reason provided.'} /></List.Item>
                        <List.Item><List.Item.Meta title="Status" description={<StatusTag status={selectedBooking.status_Peminjaman} />} /></List.Item>
                        <List.Item><List.Item.Meta title="Request Date" description={selectedBooking.tanggal_Pengajuan ? new Date(selectedBooking.tanggal_Pengajuan).toLocaleString() : 'N/A'} /></List.Item>
                        <List.Item><List.Item.Meta title="Approval Date" description={selectedBooking.tanggal_Approval ? new Date(selectedBooking.tanggal_Approval).toLocaleString() : 'N/A'} /></List.Item>
                        <List.Item><List.Item.Meta title="Approved/Declined By" description={selectedBooking.nama_Admin ? `${selectedBooking.nama_Admin} (ID: ${selectedBooking.id_Admin})` : 'N/A'} /></List.Item>
                        {selectedBooking.alasan_Penolakan && <List.Item><List.Item.Meta title="Decline Reason" description={selectedBooking.alasan_Penolakan} /></List.Item>}
                        <List.Item><List.Item.Meta title="Actual Return Date" description={selectedBooking.tanggal_Pengembalian_Aktual ? new Date(selectedBooking.tanggal_Pengembalian_Aktual).toLocaleString() : 'N/A'} /></List.Item>
                        <List.Item><List.Item.Meta title="Processed Return By" description={selectedBooking.nama_Admin_Pengembalian ? `${selectedBooking.nama_Admin_Pengembalian} (ID: ${selectedBooking.id_Admin_Pengembalian})` : 'N/A'} /></List.Item>
                        {selectedBooking.denda && selectedBooking.denda > 0 && <List.Item><List.Item.Meta title="Fine" description={`Rp ${selectedBooking.denda.toLocaleString('id-ID')}`} /></List.Item>}
                    </List>
                )}
            </Modal>

            {/* Complete Booking Modal */}
            <Modal
                title="Complete Booking"
                visible={isCompleteModalVisible}
                onCancel={() => setIsCompleteModalVisible(false)}
                footer={null}
                destroyOnClose={true}
            >
                <Form form={completeForm} name="complete_booking_form" onFinish={onCompleteSubmit} layout="vertical">
                    <Form.Item
                        label="Fine (Rp)"
                        name="denda"
                        rules={[{ type: 'number', min: 0, transform: (value) => value ? Number(value) : null, message: 'Please enter a valid fine amount (number).' }]}
                    >
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item
                        label="Return Condition Status"
                        name="statusKondisiPengembalian"
                        rules={[{ required: true, message: 'Please select the return condition!' }]}
                    >
                        <Select placeholder="Select condition">
                            <Option value="Good">Good</Option>
                            <Option value="Damaged">Damaged</Option>
                            <Option value="Minor Damage">Minor Damage</Option>
                            {/* Add other relevant conditions */}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Mark as Completed
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </PrivateLayout>
    );
};

export default AdminBookingHistoryPage;
