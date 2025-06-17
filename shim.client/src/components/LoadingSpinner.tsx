// ClientApp/src/components/LoadingSpinner.tsx
import {type FC } from 'react';
import { Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
    tip?: string; // Text to display below the spinner
    size?: 'small' | 'default' | 'large'; // Size of the spinner
    fullscreen?: boolean; // If true, covers the entire screen
}

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ tip = "Loading...", size = "default", fullscreen = false }) => {
    if (fullscreen) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white overlay
                zIndex: 9999, // Ensure it's on top of everything
            }}>
                <Spin indicator={antIcon} tip={tip} size={size} />
            </div>
        );
    }

    return (
        <Space size="middle" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Spin indicator={antIcon} tip={tip} size={size} />
        </Space>
    );
};

export default LoadingSpinner;
