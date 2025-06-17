// ClientApp/src/pages/Public/LandingPage.tsx
// ClientApp/src/pages/Public/LandingPage.tsx
import type {FC} from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons'; // Using SearchOutlined as per design, though a more appropriate icon could be used
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout'; // Import the AuthLayout component
import styles from './LandingPage.module.less'; // For module-scoped CSS

const { Title, Text } = Typography;

const LandingPage: FC = () => {
    return (
        <AuthLayout>
            <Card className={styles.landingCard}>
                <Title level={3} className={styles.cardTitle}>Smart House Inventory Manager</Title>
                <Text className={styles.cardSubtitle}>Let's get you back in!</Text>
                <Space direction="vertical" size="large" className={styles.buttonGroup}>
                    <Link to="/login">
                        <Button type="primary" size="large" icon={<SearchOutlined />} block>
                            Login
                        </Button>
                    </Link>
                    <div className={styles.signupPrompt}>
                        <Text>Don't have an account?</Text>
                        <Link to="/signup">
                            <Button size="large" icon={<SearchOutlined />} block>
                                Register
                            </Button>
                        </Link>
                    </div>
                </Space>
            </Card>
            {/* The "View Bookings" table from the design is not implemented here as it's a separate component.
          It might be a separate section on the landing page or a link to a public inventory view.
          For now, focusing on the login/signup prompt. */}
        </AuthLayout>
    );
};

export default LandingPage;
