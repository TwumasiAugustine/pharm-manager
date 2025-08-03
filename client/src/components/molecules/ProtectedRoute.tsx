import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/auth.types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading, isPharmacyConfigured } =
        useAuthStore();
    const location = useLocation();

    // If auth is still loading, show a minimalist loading screen
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm">
                        Verifying authentication...
                    </p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If we have allowedRoles and user role is not included, redirect to unauthorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If user is admin and pharmacy is not configured, redirect to setup page
    // Unless they are already on the setup page
    if (
        user.role === UserRole.ADMIN &&
        !isPharmacyConfigured &&
        location.pathname !== '/pharmacy-setup'
    ) {
        return <Navigate to="/pharmacy-setup" replace />;
    }

    // Render the protected component
    return <Outlet />;
};
