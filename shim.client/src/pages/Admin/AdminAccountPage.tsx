// ClientApp/src/pages/Admin/AdminAccountPage.tsx
import {type FC, useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Space, notification, Avatar, Modal } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import PrivateLayout from '../../components/PrivateLayout/PrivateLayout';
import { useAuth } from '../../hooks/useAuth';
import { getAdminProfile, updateAdminProfile, updateAdminEmail, updateAdminPassword } from '../../api/admin';
import type { AdminProfileDto, UpdateAdminProfileDto, UpdateEmailDto, UpdatePasswordDto } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Title, Text } = Typography;

const AdminAccountPage: FC = () => {
    const { user, login: authLogin } = useAuth(); // Get user info and login function to update context
    const [profile, setProfile] = useState<AdminProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false); // State to toggle edit mode for profile fields
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    const [profileForm] = Form.useForm();
    const [emailForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const fetchedProfile = await getAdminProfile();
                setProfile(fetchedProfile);
                profileForm.setFieldsValue(fetchedProfile); // Set form fields with fetched data
            } catch (error: any) {
                notification.error({
                    message: 'Error',
                    description: error.message || 'Failed to fetch admin profile.',
                    placement: 'topRight',
                });
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'Admin') { // Only fetch if admin is authenticated
            fetchProfile();
        }
    }, [user]); // Re-fetch if user context changes

    const handleProfileUpdate = async (values: any) => {
        setLoading(true);
        try {
            const updateData: UpdateAdminProfileDto = {
                nama_Admin: values.nama_Admin,
                no_Telp: values.no_Telp,
            };
            await updateAdminProfile(updateData);
            notification.success({
                message: 'Profile Updated',
                description: 'Your admin profile information has been successfully updated.',
                placement: 'topRight',
            });
            setEditMode(false); // Exit edit mode
            // Update local state and auth context if name changed
            if (profile) {
                setProfile({ ...profile, ...updateData });
                // If name changed, update auth context to reflect in header/sidebar
                if (user && user.name !== values.nama_Admin) {
                    authLogin(user.token, user.userId, values.nama_Admin, user.email, user.role);
                }
            }
        } catch (error: any) {
            notification.error({
                message: 'Update Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEmailUpdate = async (values: any) => {
        setLoading(true);
        try {
            const updateData: UpdateEmailDto = { newEmail: values.newEmail };
            await updateAdminEmail(updateData);
            notification.success({
                message: 'Email Updated',
                description: 'Your email address has been successfully updated. You may need to re-login.',
                placement: 'topRight',
            });
            setEmailModalVisible(false);
            // For simplicity, we just update local state and prompt re-login.
            if (profile && user) {
                setProfile({ ...profile, email: values.newEmail });
                authLogin(user.token, user.userId, user.name, values.newEmail, user.role);
            }
        } catch (error: any) {
            notification.error({
                message: 'Email Update Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (values: any) => {
        setLoading(true);
        try {
            const updateData: UpdatePasswordDto = {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            };
            await updateAdminPassword(updateData);
            notification.success({
                message: 'Password Updated',
                description: 'Your password has been successfully updated. Please remember your new password.',
                placement: 'topRight',
            });
            setPasswordModalVisible(false);
            passwordForm.resetFields(); // Clear password fields
        } catch (error: any) {
            notification.error({
                message: 'Password Update Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !profile) {
        return <LoadingSpinner fullscreen />;
    }

    return (
        <PrivateLayout>
            <Title level={3}>Admin Account Info</Title>

            <Card title="Personal Info" style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text strong>Profile Picture</Text>
                        <Space>
                            <Text type="secondary">A profile picture helps personalize your account</Text>
                            <Avatar size={64} icon={<UserOutlined />} src="https://i.pravatar.cc/150?img=69" /> {/* Placeholder image */}
                            <Button type="text" icon={<EditOutlined />} onClick={() => notification.info({ message: 'Feature Coming Soon', description: 'Profile picture upload is not yet implemented.' })} />
                        </Space>
                    </div>

                    <Form
                        form={profileForm}
                        layout="horizontal"
                        onFinish={handleProfileUpdate}
                        initialValues={profile}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Form.Item label="Name" name="nama_Admin" rules={[{ required: true, message: 'Name is required!' }]}>
                            {editMode ? <Input /> : <Text>{profile.nama_Admin}</Text>}
                        </Form.Item>

                        {/* Status, Institute, Studies are not in backend DTO based on schema, so they are not editable/displayable here */}
                        {/* These fields were part of the design but not the DB schema. */}
                        {/* If you want to display these, they need to be added to the backend AdminProfileDto and DB schema. */}
                        {/* For now, commenting out as per strict schema adherence. */}
                        {/*
            <Form.Item label="Status">
              <Text>Professor</Text> <Button type="text" icon={<EditOutlined />} />
            </Form.Item>
            <Form.Item label="Institute">
              <Text>Pradita University</Text> <Button type="text" icon={<EditOutlined />} />
            </Form.Item>
            <Form.Item label="Studies">
              <Text>Informatics /</Text> <Button type="text" icon={<EditOutlined />} />
            </Form.Item>
            */}

                        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                            {editMode ? (
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
                                    <Button onClick={() => { setEditMode(false); profileForm.resetFields(); }}>Cancel</Button>
                                </Space>
                            ) : (
                                <Button type="primary" onClick={() => setEditMode(true)}>Edit Personal Info</Button>
                            )}
                        </Form.Item>
                    </Form>
                </Space>
            </Card>

            <Card title="Contact Info">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Form
                        layout="horizontal"
                        initialValues={profile}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Form.Item label="Email">
                            <Space>
                                <Text>{profile.email}</Text>
                                <Button type="text" icon={<EditOutlined />} onClick={() => setEmailModalVisible(true)} />
                            </Space>
                        </Form.Item>

                        <Form.Item label="Phone" name="no_Telp">
                            {editMode ? <Input /> : <Text>{profile.no_Telp || 'N/A'}</Text>}
                            {editMode ? null : <Button type="text" icon={<EditOutlined />} onClick={() => setEditMode(true)} />}
                        </Form.Item>

                        {/* Address is not in Admin schema, so it's not displayed/editable here */}
                        {/*
            <Form.Item label="Address">
              <Text>Jl . Merdeka No . 123 Kecamatan Menteng , Kota Jakarta Pusat DKI Jakarta 10310 Indonesia</Text> <Button type="text" icon={<EditOutlined />} />
            </Form.Item>
            */}

                        {/* Password Update Button */}
                        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                            <Button onClick={() => setPasswordModalVisible(true)}>Change Password</Button>
                        </Form.Item>
                    </Form>
                </Space>
            </Card>

            {/* Email Update Modal */}
            <Modal
                title="Update Email"
                visible={emailModalVisible}
                onCancel={() => setEmailModalVisible(false)}
                footer={null}
                destroyOnClose={true} // Reset form on close
            >
                <Form form={emailForm} name="email_update" onFinish={handleEmailUpdate} layout="vertical">
                    <Form.Item
                        label="New Email"
                        name="newEmail"
                        rules={[
                            { required: true, message: 'Please input your new email!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Update Email
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Password Update Modal */}
            <Modal
                title="Change Password"
                visible={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
                destroyOnClose={true} // Reset form on close
            >
                <Form form={passwordForm} name="password_update" onFinish={handlePasswordUpdate} layout="vertical">
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Please input your current password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters long!' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm New Password"
                        name="confirmNewPassword"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </PrivateLayout>
    );
};

export default AdminAccountPage;
