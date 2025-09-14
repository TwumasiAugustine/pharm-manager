import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGuard from '../components/atoms/PermissionGuard';

// Higher-order component for permission-based access
export const withPermissions = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    requiredPermissions: {
        permission?: string;
        permissions?: string[];
        requireAll?: boolean;
        role?: string;
        roles?: string[];
    },
) => {
    const WithPermissionsComponent = (props: P) => {
        return React.createElement(PermissionGuard, {
            ...requiredPermissions,
            fallback: React.createElement(
                'div',
                { className: 'text-center py-8' },
                React.createElement(
                    'p',
                    { className: 'text-gray-500' },
                    "You don't have permission to access this content.",
                ),
            ),
            children: React.createElement(WrappedComponent, props),
        });
    };

    WithPermissionsComponent.displayName = `withPermissions(${
        WrappedComponent.displayName || WrappedComponent.name
    })`;

    return WithPermissionsComponent;
};

// Hook for checking permissions in components
export const usePermissionCheck = (
    permission?: string,
    permissions?: string[],
    requireAll = false,
) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } =
        usePermissions();

    const hasAccess = React.useMemo(() => {
        if (isLoading) return false;

        if (permission) {
            return hasPermission(permission);
        }

        if (permissions && permissions.length > 0) {
            return requireAll
                ? hasAllPermissions(permissions)
                : hasAnyPermission(permissions);
        }

        return false;
    }, [
        permission,
        permissions,
        requireAll,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading,
    ]);

    return { hasAccess, isLoading };
};

export default {
    withPermissions,
    usePermissionCheck,
};
