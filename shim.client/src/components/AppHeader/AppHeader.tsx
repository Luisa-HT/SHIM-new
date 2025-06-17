// ClientApp/src/components/AppHeader/AppHeader.tsx
import  {type FC } from 'react';
import { Layout, Menu, Button, Space, Badge, Avatar, Dropdown, Typography } from 'antd';
import {
    SearchOutlined,
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    HomeOutlined,
    UserOutlined as UserIcon, // Alias to avoid conflict with Avatar icon
    BookOutlined,
    ContainerOutlined,
    QuestionCircleOutlined // For Getting Started
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AppHeader.module.less';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook exists

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
    collapsed: boolean; // Prop to indicate if the sidebar is collapsed
    onCollapseToggle: () => void; // Function to toggle sidebar collapse
}

const AppHeader: FC<AppHeaderProps> = ({ collapsed, onCollapseToggle }) => {
    const { user, logout } = useAuth(); // Get user info and logout function from AuthContext
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login page after logout
    };

    // Dropdown menu for user profile actions
    const profileMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserIcon />}>
                {user?.role === 'User' ? (
                    <Link to="/user/account">My Profile</Link>
                ) : (
                    <Link to="/admin/account">My Profile</Link>
                )}
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                <Link to="/settings">Settings</Link> {/* Placeholder for general settings */}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header className={styles.header}>
            {/* Search Icon - Placeholder for search functionality */}
            <SearchOutlined className={styles.icon} />

            <Space size="middle" className={styles.rightSection}>
                {/* Notifications */}
                <Badge count={11} offset={[0, 0]}> {/* Badge count is hardcoded as 11 from design */}
                    <BellOutlined className={styles.icon} />
                </Badge>

                {/* User Profile / Admin Profile */}
                <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
                    <a onClick={e => e.preventDefault()} className={styles.profileLink}>
                        <Avatar icon={<UserOutlined />} className={styles.avatar} />
                        <Text className={styles.userName}>{user?.name || 'Guest'}</Text>
                    </a>
                </Dropdown>

                {/* Settings Icon - Could be part of dropdown or separate */}
                <SettingOutlined className={styles.icon} />
            </Space>
        </Header>
    );
};

export default AppHeader;
