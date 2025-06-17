// ClientApp/src/components/PrivateLayout.tsx/PrivateLayout.tsx.tsx
import {type FC, type ReactNode, useState } from 'react';
import { Layout } from 'antd';
import AppHeader from '../AppHeader/AppHeader'; // Assuming AppHeader component
import AppSidebar from '../AppSidebar/AppSidebar'; // Assuming AppSidebar component
import styles from './PrivateLayout.module.less';

const { Content } = Layout;

interface PrivateLayoutProps {
    children: ReactNode;
}

const PrivateLayout: FC<PrivateLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    const handleCollapse = (isCollapsed: boolean) => {
        setCollapsed(isCollapsed);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AppSidebar collapsed={collapsed} onCollapse={handleCollapse} />
            <Layout className={styles.mainLayout} style={{ marginLeft: collapsed ? 80 : 250 }}> {/* Adjust margin based on sidebar width */}
                <AppHeader collapsed={collapsed} onCollapseToggle={() => setCollapsed(!collapsed)} />
                <Content className={styles.content}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default PrivateLayout;
