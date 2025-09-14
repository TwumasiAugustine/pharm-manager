import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loading?: React.ReactNode;
}

/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user permissions and roles
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    permissions,
    requireAll = false,
    role,
    roles,
    children,
    fallback = null,
    loading = null,
}) => {
    const {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        role: userRole,
        isLoading,
    } = usePermissions();

    // Show loading state
    if (isLoading) {
        return <>{loading}</>;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    // Check multiple permissions
    if (permissions && permissions.length > 0) {
        const hasRequiredPermissions = requireAll
            ? hasAllPermissions(permissions)
            : hasAnyPermission(permissions);

        if (!hasRequiredPermissions) {
            return <>{fallback}</>;
        }
    }

    // Check single role
    if (role && userRole !== role) {
        return <>{fallback}</>;
    }

    // Check multiple roles
    if (roles && roles.length > 0 && !roles.includes(userRole || '')) {
        return <>{fallback}</>;
    }

    // All checks passed, render children
    return <>{children}</>;
};

interface PermissionTextProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    children: React.ReactNode;
    fallbackText?: string;
}

/**
 * PermissionText Component
 *
 * Conditionally renders text content based on permissions
 */
export const PermissionText: React.FC<PermissionTextProps> = ({
    permission,
    permissions,
    requireAll = false,
    role,
    roles,
    children,
    fallbackText = '',
}) => {
    return (
        <PermissionGuard
            permission={permission}
            permissions={permissions}
            requireAll={requireAll}
            role={role}
            roles={roles}
            fallback={<span>{fallbackText}</span>}
        >
            {children}
        </PermissionGuard>
    );
};

interface ConditionalRenderProps {
    condition: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * ConditionalRender Component
 *
 * Simple conditional rendering component
 */
export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
    condition,
    children,
    fallback = null,
}) => {
    return condition ? <>{children}</> : <>{fallback}</>;
};

interface RoleBasedContentProps {
    roleContent: Record<string, React.ReactNode>;
    defaultContent?: React.ReactNode;
}

/**
 * RoleBasedContent Component
 *
 * Renders different content based on user role
 */
export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
    roleContent,
    defaultContent = null,
}) => {
    const { role } = usePermissions();

    if (role && roleContent[role]) {
        return <>{roleContent[role]}</>;
    }

    return <>{defaultContent}</>;
};

export default PermissionGuard;
