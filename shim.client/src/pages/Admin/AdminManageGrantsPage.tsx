// ClientApp/src/pages/Admin/AdminManageGrantsPage.tsx
import {type FC, useState, useEffect } from 'react';
import { Card, Typography, Table, Space, Button, notification, Modal, Form, Input, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { getAllGrants, createGrant, updateGrant, deleteGrant } from '../../api/grants';
import type{ HibahDto, CreateHibahDto, UpdateHibahDto, PaginationParams, PaginatedResponse } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminManageGrantsPage: FC = () => {
    const [grants, setGrants] = useState<HibahDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationParams>({ pageNumber: 1, pageSize: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEditingGrant, setCurrentEditingGrant] = useState<HibahDto | null>(null);
    const [form] = Form.useForm();

    const fetchGrants = async () => {
        setLoading(true);
        try {
            const response: PaginatedResponse<HibahDto> = await getAllGrants(pagination);
            setGrants(response.items);
            setTotalRecords(response.totalRecords);
        } catch (error: any) {
            notification.error({
                message: 'Error',
                description: error.message || 'Failed to fetch grants data.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrants();
    }, [pagination]);

    const handleTableChange = (antdPagination: any) => {
        setPagination({
            pageNumber: antdPagination.current,
            pageSize: antdPagination.pageSize,
        });
    };

    const showAddGrantModal = () => {
        setCurrentEditingGrant(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditGrantModal = (grant: HibahDto) => {
        setCurrentEditingGrant(grant);
        form.setFieldsValue(grant);
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const grantData: CreateHibahDto = {
                nama_Hibah: values.nama_Hibah,
                keterangan: values.keterangan,
                tahun: values.tahun,
                penanggung_Jawab: values.penanggung_Jawab,
            };

            if (currentEditingGrant) {
                await updateGrant(currentEditingGrant.id_Hibah, grantData);
                notification.success({
                    message: 'Grant Updated',
                    description: `Grant ${grantData.nama_Hibah} has been updated.`,
                    placement: 'topRight',
                });
            } else {
                await createGrant(grantData);
                notification.success({
                    message: 'Grant Added',
                    description: `New grant ${grantData.nama_Hibah} has been added.`,
                    placement: 'topRight',
                });
            }
            setIsModalVisible(false);
            fetchGrants(); // Refresh the list
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

    const handleDeleteGrant = async (id: number) => {
        setLoading(true);
        try {
            await deleteGrant(id);
            notification.success({
                message: 'Grant Deleted',
                description: `Grant ID ${id} has been deleted.`,
                placement: 'topRight',
            });
            fetchGrants(); // Refresh the list
        } catch (error: any) {
            notification.error({
                message: 'Deletion Failed',
                description: error.message || `Failed to delete grant ID ${id}.`,
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id_Hibah',
            key: 'id_Hibah',
        },
        {
            title: 'Grant Name',
            dataIndex: 'nama_Hibah',
            key: 'nama_Hibah',
        },
        {
            title: 'Description',
            dataIndex: 'keterangan',
            key: 'keterangan',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Year',
            dataIndex: 'tahun',
            key: 'tahun',
            render: (year: number) => year || 'N/A',
        },
        {
            title: 'Responsible Person',
            dataIndex: 'penanggung_Jawab',
            key: 'penanggung_Jawab',
            render: (text: string) => text || 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: HibahDto) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} size="small" onClick={() => showEditGrantModal(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure to delete this grant?"
                        onConfirm={() => handleDeleteGrant(record.id_Hibah)}
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
            <Title level={3}>Manage Grants</Title>
            <Card
                title="Grant List"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddGrantModal}>
                        Add New Grant
                    </Button>
                }
            >
                {loading && <LoadingSpinner />}
                <Table
                    columns={columns}
                    dataSource={grants}
                    rowKey="id_Hibah"
                    pagination={{
                        current: pagination.pageNumber,
                        pageSize: pagination.pageSize,
                        total: totalRecords,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    onChange={handleTableChange}
                    locale={{ emptyText: 'No grants found.' }}
                    scroll={{ x: 'max-content' }} // Enable horizontal scroll for many columns
                />
            </Card>

            {/* Add/Edit Grant Modal */}
            <Modal
                title={currentEditingGrant ? 'Edit Grant' : 'Add New Grant'}
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                destroyOnClose={true} // Reset form on close
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="grant_form"
                >
                    <Form.Item
                        label="Grant Name"
                        name="nama_Hibah"
                        rules={[{ required: true, message: 'Please input the grant name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="keterangan"
                    >
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item
                        label="Year"
                        name="tahun"
                        rules={[{ type: 'number', min: 1900, max: 3000, transform: (value) => value ? Number(value) : null, message: 'Please enter a valid year (e.g., 2023).' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1900} max={3000} />
                    </Form.Item>
                    <Form.Item
                        label="Responsible Person"
                        name="penanggung_Jawab"
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </PrivateLayout>
    );
};

export default AdminManageGrantsPage;
