// ClientApp/src/components/AppSidebar/AppSidebar.tsx
import  {type FC, useState, useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    BookOutlined,
    ContainerOutlined,
    BellOutlined,
    QuestionCircleOutlined, // For Getting Started
    DownOutlined, // For submenu arrow
    UpOutlined,   // For submenu arrow when open
    RightOutlined, // For collapsed menu arrow
    LeftOutlined // For collapse toggle button
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import styles from './AppSidebar.module.less';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook exists

const { Sider } = Layout;
const { Text } = Typography;

interface AppSidebarProps {
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

const AppSidebar: FC<AppSidebarProps> = ({ collapsed, onCollapse }) => {
    const location = useLocation();
    const { user } = useAuth(); // Get user role from AuthContext
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    // Determine selected keys based on current route
    useEffect(() => {
        const path = location.pathname;
        // Find the longest matching path segment for selection
        let currentSelectedKey = 'dashboard'; // Default to dashboard
        if (path.startsWith('/user/account')) currentSelectedKey = 'account-info';
        else if (path.startsWith('/user/bookings/make')) currentSelectedKey = 'make-booking';
        else if (path.startsWith('/user/bookings/history')) currentSelectedKey = 'booking-history';
        else if (path.startsWith('/admin/account')) currentSelectedKey = 'account-info';
        else if (path.startsWith('/admin/booking-requests')) currentSelectedKey = 'booking-requests';
        else if (path.startsWith('/admin/booking-history')) currentSelectedKey = 'admin-booking-history';
        else if (path.startsWith('/admin/inventory')) currentSelectedKey = 'manage-inventory';
        else if (path.startsWith('/admin/grants')) currentSelectedKey = 'manage-grants';
        else if (path.startsWith('/notifications')) currentSelectedKey = 'notifications';
        else if (path.startsWith('/getting-started')) currentSelectedKey = 'getting-started';
        else if (path === '/user/dashboard' || path === '/admin/dashboard') currentSelectedKey = 'dashboard';


        setSelectedKeys([currentSelectedKey]);

        // Automatically open parent submenus
        if (currentSelectedKey === 'make-booking' || currentSelectedKey === 'booking-history') {
            setOpenKeys(['bookings']);
        } else if (currentSelectedKey === 'account-info') {
            setOpenKeys(['account']);
        }
    }, [location.pathname]);

    const onOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            className={styles.sidebar}
            width={250} // Fixed width when expanded
            collapsedWidth={80} // Fixed width when collapsed
        >
            <div className={styles.logo}>
                <Link to={user?.role === 'Admin' ? "/admin/dashboard" : "/user/dashboard"}>
                    <HomeOutlined className={styles.logoIcon} />
                    {!collapsed && <Text className={styles.logoText}>Smart House Inventory</Text>}
                </Link>
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={onOpenChange}
                className={styles.menu}
            >
                <Menu.Item key="dashboard" icon={<HomeOutlined />}>
                    <Link to={user?.role === 'Admin' ? "/admin/dashboard" : "/user/dashboard"}>
                        Dashboard
                    </Link>
                </Menu.Item>

                <Menu.SubMenu key="account" icon={<UserOutlined />} title="Account Info">
                    <Menu.Item key="account-info">
                        {user?.role === 'User' ? (
                            <Link to="/user/account">Manage</Link>
                        ) : (
                            <Link to="/admin/account">Manage</Link>
                        )}
                    </Menu.Item>
                </Menu.SubMenu>

                {user?.role === 'User' && (
                    <Menu.SubMenu key="bookings" icon={<BookOutlined />} title="Bookings">
                        <Menu.Item key="make-booking">
                            <Link to="/user/bookings/make">Make a booking</Link>
                        </Menu.Item>
                        <Menu.Item key="booking-history">
                            <Link to="/user/bookings/history">Booking history</Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                )}

                {user?.role === 'Admin' && (
                    <>
                        <Menu.Item key="booking-requests" icon={<BookOutlined />}>
                            <Link to="/admin/booking-requests">Booking Requests</Link>
                        </Menu.Item>
                        <Menu.Item key="admin-booking-history" icon={<BookOutlined />}>
                            <Link to="/admin/booking-history">Booking History</Link>
                        </Menu.Item>
                        <Menu.Item key="manage-inventory" icon={<ContainerOutlined />}>
                            <Link to="/admin/inventory">Manage Inventory</Link>
                        </Menu.Item>
                        <Menu.Item key="manage-grants" icon={<ContainerOutlined />}> {/* Using ContainerOutlined for grants, can change */}
                            <Link to="/admin/grants">Manage Grants</Link>
                        </Menu.Item>
                    </>
                )}

                <Menu.Item key="notifications" icon={<BellOutlined />}>
                    <Link to="/notifications">Notifications</Link>
                </Menu.Item>

                <Menu.Item key="getting-started" icon={<QuestionCircleOutlined />}>
                    <Link to="/getting-started">Getting Started</Link>
                </Menu.Item>
            </Menu>

            {/* Collapse button at the bottom */}
            <div className={styles.collapseButton} onClick={() => onCollapse(!collapsed)}>
                {collapsed ? <RightOutlined /> : <LeftOutlined />}
            </div>
        </Sider>
    );
};

export default AppSidebar;
