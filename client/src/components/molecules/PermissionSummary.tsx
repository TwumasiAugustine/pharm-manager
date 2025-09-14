import React from 'react';
import { Card, CardHeader, CardContent } from './Card';
import Badge from '../atoms/Badge';
import { useUserPermissions } from '../../hooks/usePermissions';
import { FaUser, FaShieldAlt, FaPlus, FaEye } from 'react-icons/fa';

interface PermissionSummaryProps {
    userId: string;
    showDetails?: boolean;
    className?: string;
}

export const PermissionSummary: React.FC<PermissionSummaryProps> = ({
    userId,
    showDetails = false,
    className = '',
}) => {
    const { data: userPermissions, isLoading } = useUserPermissions(userId);

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!userPermissions) {
        return (
            <div className={`text-center py-4 ${className}`}>
                <p className="text-red-500 text-sm">
                    Failed to load permissions
                </p>
            </div>
        );
    }

    const { user, permissions } = userPermissions;
    const totalPermissions = permissions.all.length;
    const rolePermissions = permissions.roleDefaults.length;
    const customPermissions = permissions.custom.length;

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <FaUser className="h-5 w-5 text-gray-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <Badge
                        variant={
                            user.role === 'SUPER_ADMIN'
                                ? 'primary'
                                : 'secondary'
                        }
                        className="ml-auto"
                    >
                        {user.role}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* Permission Counts */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2">
                                <FaShieldAlt className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalPermissions}
                            </p>
                            <p className="text-xs text-gray-600">
                                Total Permissions
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mx-auto mb-2">
                                <FaUser className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {rolePermissions}
                            </p>
                            <p className="text-xs text-gray-600">Role-based</p>
                        </div>

                        <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mx-auto mb-2">
                                <FaPlus className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {customPermissions}
                            </p>
                            <p className="text-xs text-gray-600">Custom</p>
                        </div>
                    </div>

                    {/* Permission Details */}
                    {showDetails && (
                        <div className="space-y-3">
                            <div className="border-t pt-3">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Role-based Permissions ({rolePermissions})
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {permissions.roleDefaults
                                        .slice(0, 5)
                                        .map((permission) => (
                                            <Badge
                                                key={permission}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                {permission.replace(/_/g, ' ')}
                                            </Badge>
                                        ))}
                                    {permissions.roleDefaults.length > 5 && (
                                        <Badge variant="outline" size="sm">
                                            +
                                            {permissions.roleDefaults.length -
                                                5}{' '}
                                            more
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {customPermissions > 0 && (
                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                                        Custom Permissions ({customPermissions})
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {permissions.custom
                                            .slice(0, 5)
                                            .map((permission) => (
                                                <Badge
                                                    key={permission}
                                                    variant="primary"
                                                    size="sm"
                                                >
                                                    {permission.replace(
                                                        /_/g,
                                                        ' ',
                                                    )}
                                                </Badge>
                                            ))}
                                        {permissions.custom.length > 5 && (
                                            <Badge variant="outline" size="sm">
                                                +{permissions.custom.length - 5}{' '}
                                                more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

interface PermissionQuickViewProps {
    userId: string;
    onManage?: () => void;
    className?: string;
}

export const PermissionQuickView: React.FC<PermissionQuickViewProps> = ({
    userId,
    onManage,
    className = '',
}) => {
    const { data: userPermissions, isLoading } = useUserPermissions(userId);

    if (isLoading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-12 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!userPermissions) {
        return (
            <div className={`text-center py-2 ${className}`}>
                <p className="text-red-500 text-xs">Failed to load</p>
            </div>
        );
    }

    const { permissions } = userPermissions;

    return (
        <div
            className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <FaShieldAlt className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                        {permissions.all.length} permissions
                    </span>
                </div>

                <div className="flex gap-1">
                    <Badge variant="secondary" size="sm">
                        {permissions.roleDefaults.length} role
                    </Badge>
                    {permissions.custom.length > 0 && (
                        <Badge variant="primary" size="sm">
                            {permissions.custom.length} custom
                        </Badge>
                    )}
                </div>
            </div>

            {onManage && (
                <button
                    onClick={onManage}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                >
                    <FaEye className="h-3 w-3" />
                    Manage
                </button>
            )}
        </div>
    );
};

export default PermissionSummary;
