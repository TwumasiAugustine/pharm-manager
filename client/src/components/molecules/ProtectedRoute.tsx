import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/user.types';
import { AuthLoadingScreen } from '../atoms/LoadingScreen';
import { useBranches } from '../../hooks/useBranches';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading, isPharmacyConfigured } =
        useAuthStore();
    const location = useLocation();
    // Always call useBranches hook at the top-level to satisfy the Rules of
    // Hooks. Fetching is enabled only for ADMIN users via the `enabled`
    // option so the query is inactive for other roles.
    const { data: branches, isLoading: branchesLoading } = useBranches({
        enabled: !!user && user.role === UserRole.ADMIN,
    });

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

    // If a route is admin-only (allowedRoles includes only ADMIN) and the
    // current user is SUPER_ADMIN, send them to the super-admin dashboard.
    // This prevents super-admins from landing on the regular admin pages.
    if (
        allowedRoles &&
        allowedRoles.length === 1 &&
        allowedRoles.includes(UserRole.ADMIN) &&
        user?.role === UserRole.SUPER_ADMIN
    ) {
        // If they're already trying to access the super-admin page, allow it
        if (location.pathname !== '/super-admin') {
            return <Navigate to="/super-admin" replace />;
        }
    }

    // Always route super-admins to the super-admin dashboard when they try to
    // access the regular dashboard directly (handles manual URL entry).
    if (
        user?.role === UserRole.SUPER_ADMIN &&
        location.pathname === '/dashboard'
    ) {
        return <Navigate to="/super-admin" replace />;
    }

    // If pharmacy is not configured
    if (!isPharmacyConfigured) {
        // Only ADMINs should be forced into the local pharmacy setup flow.
        // SUPER_ADMIN manages multiple pharmacies and should be allowed
        // to continue to their super-admin dashboard instead.
        if (
            user.role === UserRole.ADMIN &&
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

    // Additional guard: ADMINs must create at least one branch before
    // they can perform branch-scoped actions (adding drugs, sales, users).
    if (user?.role === UserRole.ADMIN) {
        // If branches are still loading, show loading screen to avoid
        // flicker/incorrect redirects.
        if (branchesLoading) return <AuthLoadingScreen />;

        // If no branches exist, redirect Admins to branch management to
        // create the first branch. Prefer '/branches' which has the New
        // Branch button; an app-level route may show a direct new form.
        if (!branches || branches.length === 0) {
            if (location.pathname !== '/branches') {
                return <Navigate to="/branches" replace />;
            }
        }
    }

    // Render the protected component
    return <Outlet />;
};
