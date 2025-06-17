// ClientApp/src/pages/Admin/AdminManageInventoryPage.tsx
import {type FC, useState, useEffect } from 'react';
import { Card, Typography, Table, Space, Button, notification, Modal, Form, Input, DatePicker, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateInventoryItemStatus } from '../../api/inventory';
import { getAllGrants } from '../../api/grants'; // To fetch grants for dropdown
import type{ BarangDto, CreateBarangDto, UpdateBarangDto, UpdateBarangStatusDto, PaginationParams, PaginatedResponse, HibahDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusTag from '../../components/StatusTag';
import moment from 'moment'; // For DatePicker values

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminManageInventoryPage: FC = () => {
    const [inventory, setInventory] = useState<BarangDto[]>([]);
    const [grants, setGrants] = useState<HibahDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState<BarangDto | null>(null);
    const [form] = Form.useForm();

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<BarangDto> = await getAllInventory(pagination);
            setInventory(response.items);
            setTotalRecords(response.totalRecords);
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to fetch inventory data.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchGrants = async () => {
        try {
            const response: PaginatedResponse<HibahDto> = await getAllGrants({ pageNumber: 1, pageSize: 1000 }); // Fetch all grants
            setGrants(response.items);
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to fetch grants data.',
                placement: 'topRight',
            });
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchGrants();
    }, [pagination]);

    const handleTableChange = (antdPagination: any) => {
        setPagination({
            pageNumber: antdPagination.current,
            pageSize: antdPagination.pageSize,
        });
    };

    const showAddItemModal = () => {
        setCurrentEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditItemModal = (item: BarangDto) => {
        setCurrentEditingItem(item);
        form.setFieldsValue({
            ...item,
            tanggal_Perolehan: item.tanggal_Perolehan ? moment(item.tanggal_Perolehan) : null,
        });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const itemData: CreateBarangDto = {
                nama_Barang: values.nama_Barang,
                deskripsi_Barang: values.deskripsi_Barang,
                status_Kondisi: values.status_Kondisi,
                tanggal_Perolehan: values.tanggal_Perolehan.toISOString(),
                status_Barang: values.status_Barang,
                harga_Barang: values.harga_Barang,
                id_Hibah: values.id_Hibah,
            };

            if (currentEditingItem) {
                await updateInventoryItem(currentEditingItem.id_Barang, itemData);
                notification.success({
                    message: 'Item Updated',
                    description: `Inventory item ${itemData.nama_Barang} has been updated.`,
                    placement: 'topRight',
                });
            } else {
                await createInventoryItem(itemData);
                notification.success({
                    message: 'Item Added',
                    description: `New inventory item ${itemData.nama_Barang} has been added.`,
                    placement: 'topRight',
                });
            }
            setIsModalVisible(false);
            fetchInventory(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Operation Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id: number) => {
        setLoading(true);
        try {
            await deleteInventoryItem(id);
            notification.success({
                message: 'Item Deleted',
                description: `Inventory item ID ${id} has been deleted.`,
                placement: 'topRight',
            });
            fetchInventory(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Deletion Failed',
                description: error.message || `Failed to delete inventory item ID ${id}.`,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        setLoading(true);
        try {
            const statusData: UpdateBarangStatusDto = { status_Barang: newStatus };
            await updateInventoryItemStatus(id, statusData);
            notification.success({
                message: 'Status Updated',
                description: `Item ID ${id} status changed to ${newStatus}.`,
                placement: 'topRight',
            });
            fetchInventory(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Status Update Failed',
                description: error.message || `Failed to update status for item ID ${id}.`,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id_Barang',
            key: 'id_Barang',
        },
        {
            title: 'Item Name',
            dataIndex: 'nama_Barang',
            key: 'nama_Barang',
        },
        {
            title: 'Description',
            dataIndex: 'deskripsi_Barang',
            key: 'deskripsi_Barang',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Condition',
            dataIndex: 'status_Kondisi',
            key: 'status_Kondisi',
            render: (status: string) => <StatusTag status={status} />,
        },
        {
            title: 'Status',
            dataIndex: 'status_Barang',
            key: 'status_Barang',
            render: (status: string, record: BarangDto) => (
                <Space>
                    <StatusTag status={status} />
                    <Select
                        value={status}
                        onChange={(value) => handleStatusChange(record.id_Barang, value)}
                        style={{ width: 120 }}
                        size="small"
                    >
                        <Option value="Available">Available</Option>
                        <Option value="Tersedia">Tersedia</Option>
                        <Option value="Booked">Booked</Option>
                        <Option value="Maintenance">Maintenance</Option>
                        <Option value="Unavailable">Unavailable</Option>
                    </Select>
                </Space>
            ),
        },
        {
            title: 'Acquisition Date',
            dataIndex: 'tanggal_Perolehan',
            key: 'tanggal_Perolehan',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Price',
            dataIndex: 'harga_Barang',
            key: 'harga_Barang',
            render: (price: number) => price ? `Rp ${price.toLocaleString('id-ID')}` : 'N/A',
        },
        {
            title: 'Grant Name',
            dataIndex: 'nama_Hibah',
            key: 'nama_Hibah',
            render: (name: string) => name || 'N/A',
        },
        {
            title: 'Latest Booking',
            dataIndex: 'latest_Booking_Date',
            key: 'latest_Booking_Date',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: BarangDto) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} size="small" onClick={() => showEditItemModal(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure to delete this item?"
                        onConfirm={() => handleDeleteItem(record.id_Barang)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger size="small">Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PrivateLayout>
            <Title level={3}>Manage Inventory</Title>
            <Card
                title="Inventory List"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddItemModal}>
                        Add New Item
                    </Button>
                }
            >
                {loading && <LoadingSpinner />}
                <Table
                    columns={columns}
                    dataSource={inventory}
                    rowKey="id_Barang"
                    pagination={{
                        current: pagination.pageNumber,
                        pageSize: pagination.pageSize,
                        total: totalRecords,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onChange={handleTableChange}
                    locale={{ emptyText: 'No inventory items found.' }}
                    scroll={{ x: 'max-content' }} // Enable horizontal scroll for many columns
                />
            </Card>

            {/* Add/Edit Item Modal */}
            <Modal
                title={currentEditingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                destroyOnClose={true} // Reset form on close
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="item_form"
                >
                    <Form.Item
                        label="Item Name"
                        name="nama_Barang"
                        rules={[{ required: true, message: 'Please input the item name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="deskripsi_Barang"
                    >
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        label="Condition Status"
                        name="status_Kondisi"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Acquisition Date"
                        name="tanggal_Perolehan"
                        rules={[{ required: true, message: 'Please select the acquisition date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        label="Item Status"
                        name="status_Barang"
                        rules={[{ required: true, message: 'Please select the item status!' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="Available">Available</Option>
                            <Option value="Tersedia">Tersedia</Option>
                            <Option value="Booked">Booked</Option>
                            <Option value="Maintenance">Maintenance</Option>
                            <Option value="Unavailable">Unavailable</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Price (Rp)"
                        name="harga_Barang"
                        rules={[{ type: 'number', min: 0, transform: (value) => value ? Number(value) : null, message: 'Please enter a valid price (number).' }]}
                    >
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item
                        label="Grant"
                        name="id_Hibah"
                    >
                        <Select placeholder="Select a grant (optional)" allowClear showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.children as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }>
                            {grants.map(grant => (
                                <Option key={grant.id_Hibah} value={grant.id_Hibah}>
                                    {grant.nama_Hibah}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </PrivateLayout>
    );
};

export default AdminManageInventoryPage;
