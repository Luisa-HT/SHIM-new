// ClientApp/src/pages/User/UserBookingFormPage.tsx
import {type FC, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, notification, DatePicker, Select, Space } from 'antd';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { createBooking } from '../../api/bookings';
import { getAvailableInventory } from '../../api/inventory'; // To fetch available items
import type{ CreateBookingRequestDto, BarangDto, PaginationParams, PaginatedResponse } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const UserBookingFormPage: FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<BarangDto[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAvailableItems = async () => {
            setItemsLoading(true);
            try {
                // Fetch all available items (or a large enough list for selection)
                // For a very large inventory, you might implement search/lazy loading in the Select component
                const response: PaginatedResponse<BarangDto> = await getAvailableInventory({ pageNumber: 1, pageSize: 1000 }); // Fetch up to 1000 items
                setItems(response.items);
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch available items.',
                    placement: 'topRight',
                });
            } finally {
                setItemsLoading(false);
            }
        };

        fetchAvailableItems();
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const bookingData: CreateBookingRequestDto = {
                id_Barang: values.item, // Select component returns id_Barang
                start_Date: values.time[0].toISOString(), // Convert moment/dayjs object to ISO string
                end_Date: values.time[1].toISOString(),   // Convert moment/dayjs object to ISO string
                deskripsi: values.reason,
            };
            await createBooking(bookingData);
            notification.success({
                message: 'Booking Request Submitted',
                description: 'Your booking request has been successfully submitted for review.',
                placement: 'topRight',
            });
            form.resetFields(); // Clear the form
            navigate('/user/bookings/history'); // Redirect to booking history
        } catch (error: any) {
            notification.error({
                message: 'Booking Failed',
                description: error.message || 'An unexpected error occurred during booking.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <PrivateLayout>
            <Title level={3}>Booking Form</Title>
            <Card>
                <Form
                    form={form}
                    name="booking_form"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Item :"
                        name="item"
                        rules={[{ required: true, message: 'Please select an item!' }]}
                    >
                        <Select
                            placeholder="Select an item"
                            loading={itemsLoading}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {items.map(item => (
                                <Option key={item.id_Barang} value={item.id_Barang}>
                                    {item.nama_Barang} ({item.status_Kondisi})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Time :"
                        name="time"
                        rules={[{ required: true, message: 'Please select a booking time range!' }]}
                    >
                        <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Reason :"
                        name="reason"
                        rules={[{ required: true, message: 'Please provide a reason for booking!' }]}
                    >
                        <TextArea rows={4} placeholder="Reason for booking" autoSize={{ minRows: 3, maxRows: 6 }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" loading={loading}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            {loading && <LoadingSpinner fullscreen />}
            {itemsLoading && <LoadingSpinner fullscreen tip="Loading available items..." />}
        </PrivateLayout>
    );
};

export default UserBookingFormPage;
