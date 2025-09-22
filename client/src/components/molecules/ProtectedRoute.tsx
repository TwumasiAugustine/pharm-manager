import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/user.types';
import { AuthLoadingScreen } from '../atoms/LoadingScreen';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading, isPharmacyConfigured } =
        useAuthStore();
    const location = useLocation();

    // If auth is still loading, show a minimalist loading screen
    if (isLoading) {
        return <AuthLoadingScreen />;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If we have allowedRoles and user role is not included, redirect to unauthorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If pharmacy is not configured
    if (!isPharmacyConfigured) {
        if (
            (user.role === UserRole.ADMIN ||
                user.role === UserRole.SUPER_ADMIN) &&
            location.pathname !== '/pharmacy-setup'
        ) {
            return <Navigate to="/pharmacy-setup" replace />;
        }
        // Non-admin level users: show unauthorized page if pharmacy not configured
        if (
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.SUPER_ADMIN &&
            location.pathname !== '/unauthorized'
        ) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Render the protected component
    return <Outlet />;
};
