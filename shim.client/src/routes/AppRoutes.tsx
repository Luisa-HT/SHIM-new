// ClientApp/src/routes/AppRoutes.tsx
import {type FC } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // To check authentication status and role
import LoadingSpinner from '../components/LoadingSpinner'; // For loading state

// Public Pages
import LandingPage from '../pages/Public/LandingPage';
import LoginPage from '../pages/Public/LoginPage';
import SignUpPage from '../pages/Public/SignUpPage';

// User Pages
import UserDashboardPage from '../pages/User/UserDashboardPage';
import UserAccountPage from '../pages/User/UserAccountPage';
import UserBookingFormPage from '../pages/User/UserBookingFormPage';
import UserBookingHistoryPage from '../pages/User/UserBookingHistoryPage';

// Admin Pages
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import AdminAccountPage from '../pages/Admin/AdminAccountPage';
import AdminBookingRequestsPage from '../pages/Admin/AdminBookingRequestsPage';
import AdminBookingHistoryPage from '../pages/Admin/AdminBookingHistoryPage';
import AdminManageInventoryPage from '../pages/Admin/AdminManageInventoryPage';
import AdminManageGrantsPage from '../pages/Admin/AdminManageGrantsPage';

// Other common pages (placeholders for now)
const AboutPage = () => <div>About Us Page</div>;
const ContactPage = () => <div>Contact Us Page</div>;
const NotificationsPage = () => <div>Notifications Page</div>;
const GettingStartedPage = () => <div>Getting Started Page</div>;
const SettingsPage = () => <div>Settings Page</div>; // General settings, not profile specific
const NotFoundPage = () => <div>404 - Page Not Found</div>;

// ProtectedRoute component (defined in ProtectedRoute.tsx)
import ProtectedRoute from './ProtectedRoute';

const AppRoutes: FC = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return <LoadingSpinner fullscreen tip="Checking authentication..." />;
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Authenticated User Routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['User', 'Admin']} />}>
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/getting-started" element={<GettingStartedPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Specific User Role Routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['User']} />}>
                <Route path="/user/dashboard" element={<UserDashboardPage />} />
                <Route path="/user/account" element={<UserAccountPage />} />
                <Route path="/user/bookings/make" element={<UserBookingFormPage />} />
                <Route path="/user/bookings/history" element={<UserBookingHistoryPage />} />
            </Route>

            {/* Specific Admin Role Routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['Admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/account" element={<AdminAccountPage />} />
                <Route path="/admin/booking-requests" element={<AdminBookingRequestsPage />} />
                <Route path="/admin/booking-requests/:id" element={<AdminBookingRequestsPage />} /> {/* For viewing specific request details */}
                <Route path="/admin/booking-history" element={<AdminBookingHistoryPage />} />
                <Route path="/admin/inventory" element={<AdminManageInventoryPage />} />
                <Route path="/admin/grants" element={<AdminManageGrantsPage />} />
            </Route>

            {/* Catch-all for 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRoutes;
