// ClientApp/src/components/AuthLayout/AuthLayout.tsx
import  {type FC, type ReactNode } from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import { HomeOutlined, QuestionCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import styles from './AuthLayout.module.less'; // For module-scoped CSS

const { Header, Content } = Layout;
const { Text } = Typography;

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    return (
        <Layout className={styles.authLayout}>
            <Header className={styles.header}>
                <div className={styles.logo}>
                    {/* You can replace this with your actual logo/title if desired */}
                    <Link to="/">
                        <Text className={styles.logoText}>Smart House Inventory</Text>
                    </Link>
                </div>
                <Menu theme="light" mode="horizontal" className={styles.menu}>
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        <Link to="/">Home</Link>
                    </Menu.Item>
                    <Menu.Item key="about" icon={<QuestionCircleOutlined />}>
                        <Link to="/about">About</Link>
                    </Menu.Item>
                    <Menu.Item key="contact" icon={<PhoneOutlined />}>
                        <Link to="/contact">Contact</Link>
                    </Menu.Item>
                </Menu>
                <Space className={styles.authButtons}>
                    <Link to="/login">
                        <Button type="primary">Log In</Button>
                    </Link>
                    <Link to="/signup">
                        <Button>Register</Button>
                    </Link>
                </Space>
            </Header>
            <Content className={styles.content}>
                {children}
            </Content>
        </Layout>
    );
};

export default AuthLayout;
