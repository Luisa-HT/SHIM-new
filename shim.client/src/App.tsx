// ClientApp/src/App.tsx
import React, { type FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd'; // For Ant Design configuration
import AppRoutes from './routes/AppRoutes'; // Your main routing component
import { AuthProvider } from './contexts/AuthContext'; // Your AuthContext provider

// Removed: import 'antd/dist/antd.less'; // Or 'antd/dist/antd.css' if not using less
// Ant Design styles are typically imported automatically by build tools or babel-plugin-import.

import './assets/styles/index.less'; // Your custom global styles (still needed for your own Less)

const App: FC = () => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff', // Ant Design primary blue
                    colorLink: '#1890ff',
                    borderRadius: 4, // Default border radius for Ant Design components
                },
                // You can add more theme customizations here
                // components: {
                //   Button: {
                //     colorPrimary: '#52c41a',
                //   },
                // },
            }}
        >
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </ConfigProvider>
    );
};

export default App;
