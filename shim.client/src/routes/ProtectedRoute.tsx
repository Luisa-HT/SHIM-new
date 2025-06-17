// ClientApp/src/routes/ProtectedRoute.tsx
import {type FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner'; // For loading state

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    allowedRoles: ('User' | 'Admin')[]; // Array of roles allowed to access this route
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ isAuthenticated, allowedRoles }) => {
    const { user, isLoading } = useAuth(); // Get user and loading state from AuthContext

    if (isLoading) {
        // Show a fullscreen spinner while authentication state is being loaded
        return <LoadingSpinner fullscreen tip="Verifying access..." />;
    }

    if (!isAuthenticated) {
        // If not authenticated, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If authenticated, check if the user's role is allowed
    if (user && allowedRoles.includes(user.role)) {
        // If role is allowed, render the child routes
        return <Outlet />;
    } else {
        // If authenticated but role is not allowed, redirect to a suitable page (e.g., dashboard or unauthorized page)
        // For simplicity, redirect to dashboard. You might want a dedicated Unauthorized page.
        if (user?.role === 'User') {
            return <Navigate to="/user/dashboard" replace />;
        } else if (user?.role === 'Admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // Fallback if role is somehow undefined or unexpected
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
