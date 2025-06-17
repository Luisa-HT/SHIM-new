// ClientApp/src/pages/Public/LoginPage.tsx
import {type FC, useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { login as apiLogin } from '../../api/auth'; // Renamed to avoid conflict with local 'login' state
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook
import LoadingSpinner from '../../components/LoadingSpinner'; // Import LoadingSpinner
import styles from './LoginPage.module.less'; // For module-scoped CSS

const { Title, Text } = Typography;

const LoginPage: FC = () => {
    const [form] = Form.useForm();
    const { login: authLogin } = useAuth(); // Get the login function from AuthContext
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await apiLogin({ email: values.email, password: values.password });
            // Upon successful login, update global auth state
            authLogin(response.token, response.userId, response.name, response.email, response.role);
            notification.success({
                message: 'Login Successful',
                description: `Welcome, ${response.name}!`,
                placement: 'topRight',
            });
            // Redirect based on role
            if (response.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (error: any) {
            notification.error({
                message: 'Login Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className={styles.loginCard}>
                <Title level={3} className={styles.cardTitle}>Login</Title>
                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    className={styles.loginForm}
                >
                    <Form.Item
                        label="Email :"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input placeholder="example" />
                    </Form.Item>

                    <Form.Item
                        label="Password :"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password placeholder="example" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Login
                        </Button>
                    </Form.Item>
                    <Space direction="vertical" className={styles.signupLinkContainer}>
                        <Text>Don't have an account?</Text>
                        <Link to="/signup">
                            <Button type="link" size="large" block>
                                Sign Up
                            </Button>
                        </Link>
                    </Space>
                </Form>
            </Card>
            {loading && <LoadingSpinner fullscreen />}
        </AuthLayout>
    );
};

export default LoginPage;
