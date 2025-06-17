// ClientApp/src/pages/Public/SignUpPage.tsx
import {type FC, useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { signup as apiSignup } from '../../api/auth'; // Renamed to avoid conflict
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook
import LoadingSpinner from '../../components/LoadingSpinner'; // Import LoadingSpinner
import styles from './SignUpPage.module.less'; // For module-scoped CSS

const { Title, Text } = Typography;

const SignUpPage: FC = () => {
    const [form] = Form.useForm();
    const { login: authLogin } = useAuth(); // Get the login function from AuthContext
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Backend DTO for SignUpRequestDto only includes:
            // nama_Peminjam, email, no_Telp, alamat, password
            const signupData = {
                nama_Peminjam: values.name,
                email: values.email,
                password: values.password,
                no_Telp: values.fieldE || null, // Map Field E to No_Telp (nullable)
                alamat: values.fieldF || null,  // Map Field F to Alamat (nullable)
                // Field G is not in the backend DTO based on schema, so it's not sent.
                // If 'Studies' is intended to be stored, the backend DB schema and DTO must be updated.
            };

            const response = await apiSignup(signupData);
            // Upon successful signup, backend auto-logs in and returns LoginResponseDto
            authLogin(response.token, response.userId, response.name, response.email, response.role);
            notification.success({
                message: 'Sign Up Successful',
                description: `Welcome, ${response.name}! Your account has been created.`,
                placement: 'topRight',
            });
            // Redirect based on role (should be 'User' for signup)
            navigate('/user/dashboard');
        } catch (error: any) {
            notification.error({
                message: 'Sign Up Failed',
                description: error.message || 'An unexpected error occurred.',
                placement: 'topRight',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Card className={styles.signupCard}>
                <Title level={3} className={styles.cardTitle}>Sign up</Title>
                <Form
                    form={form}
                    name="signup"
                    onFinish={onFinish}
                    layout="vertical"
                    className={styles.signupForm}
                >
                    <Form.Item
                        label="Name :"
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input placeholder="example" />
                    </Form.Item>

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
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters long!' }
                        ]}
                    >
                        <Input.Password placeholder="example" />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password :"
                        name="confirmPassword"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="example" />
                    </Form.Item>

                    {/* Mapping 'Field E' to No_Telp */}
                    <Form.Item
                        label="Field E (Phone Number) :"
                        name="fieldE"
                        rules={[{ pattern: /^[0-9]{10,13}$/, message: 'Please enter a valid phone number (10-13 digits).' }]}
                    >
                        <Input placeholder="example" />
                    </Form.Item>

                    {/* Mapping 'Field F' to Alamat */}
                    <Form.Item
                        label="Field F (Address) :"
                        name="fieldF"
                    >
                        <Input.TextArea placeholder="example" autoSize={{ minRows: 2, maxRows: 4 }} />
                    </Form.Item>

                    {/* Field G is not included as it's not in the backend DTO based on the provided schema.
              If 'Studies' is intended to be stored, the backend DB schema and DTO must be updated.
          <Form.Item
            label="Field G (Studies) :"
            name="fieldG"
          >
            <Input placeholder="example" />
          </Form.Item>
          */}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                            Confirm
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            {loading && <LoadingSpinner fullscreen />}
        </AuthLayout>
    );
};

export default SignUpPage;
