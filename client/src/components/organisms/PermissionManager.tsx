import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../molecules/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import {
    useAllPermissions,
    useUserPermissions,
    useUserPermissionManagement,
    usePermissionState,
} from '../../hooks/usePermissions';
import type { Permission } from '../../api/permission.api';
import {
    FaSearch,
    FaUsers,
    FaHospital,
    FaBuilding,
    FaPills,
    FaCashRegister,
    FaUserFriends,
    FaChartBar,
    FaCogs,
    FaExclamationTriangle,
    FaCheck,
    FaTimes,
    FaUndo,
    FaSync,
} from 'react-icons/fa';

interface PermissionManagerProps {
    userId: string;
    onClose?: () => void;
}

const categoryIcons: Record<string, React.ComponentType> = {
    FaUsers,
    FaHospital,
    FaBuilding,
    FaPills,
    FaCashRegister,
    FaUserFriends,
    FaChartBar,
    FaCogs,
    FaExclamationTriangle,
};

export const PermissionManager: React.FC<PermissionManagerProps> = ({
    userId,
    onClose,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data: allPermissions, isLoading: isLoadingAll } =
        useAllPermissions();
    const { data: userPermissions, isLoading: isLoadingUser } =
        useUserPermissions(userId);
    const { updatePermissions, isUpdating } = useUserPermissionManagement();

    const {
        selectedPermissions,
        hasChanges,
        initializePermissions,
        togglePermission,
        resetToOriginal,
        resetToDefaults,
    } = usePermissionState();

    // Initialize permissions when user data loads
    useEffect(() => {
        if (userPermissions) {
            initializePermissions(
                userPermissions.permissions.all.map((p) => p.key),
            );
        }
    }, [userPermissions, initializePermissions]);

    const handleSave = () => {
        updatePermissions({
            userId,
            permissions: selectedPermissions,
        });
    };

    const handleResetToRoleDefaults = () => {
        if (userPermissions) {
            resetToDefaults(userPermissions.permissions.roleDefaults);
        }
    };

    const filteredCategories = allPermissions?.filter((category) => {
        if (selectedCategory && category.categoryKey !== selectedCategory) {
            return false;
        }

        if (searchTerm) {
            return (
                category.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                category.permissions.some(
                    (p) =>
                        p.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                        p.description
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                )
            );
        }

        return true;
    });

    const getFilteredPermissions = (permissions: Permission[]) => {
        if (!searchTerm) return permissions;

        return permissions.filter(
            (permission) =>
                permission.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                permission.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        );
    };

    if (isLoadingAll || isLoadingUser) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!userPermissions) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">Failed to load user permissions</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Manage Permissions
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Managing permissions for{' '}
                                {userPermissions.user.username} (
                                {userPermissions.user.role})
                            </p>
                        </div>
                        {onClose && (
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                className="flex items-center gap-2"
                            >
                                <FaTimes className="h-4 w-4" />
                                Close
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Search and Filter Controls */}
                    <div className="mb-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-64">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {allPermissions?.map((category) => (
                                        <option
                                            key={category.categoryKey}
                                            value={category.categoryKey}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleResetToRoleDefaults}
                                    variant="secondary"
                                    className="flex items-center gap-2"
                                >
                                    <FaSync className="h-4 w-4" />
                                    Reset to Role Defaults
                                </Button>
                                <Button
                                    onClick={resetToOriginal}
                                    variant="secondary"
                                    disabled={!hasChanges}
                                    className="flex items-center gap-2"
                                >
                                    <FaUndo className="h-4 w-4" />
                                    Reset Changes
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500 self-center">
                                    {selectedPermissions.length} permissions
                                    selected
                                    {hasChanges && ' (unsaved changes)'}
                                </span>
                                <Button
                                    onClick={handleSave}
                                    disabled={!hasChanges || isUpdating}
                                    className="flex items-center gap-2"
                                >
                                    <FaCheck className="h-4 w-4" />
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Permission Categories */}
                    <div className="space-y-6">
                        {filteredCategories?.map((category) => {
                            const IconComponent = (categoryIcons[
                                category.icon
                            ] || FaCogs) as React.ComponentType<{
                                className?: string;
                            }>;
                            const filteredPermissions = getFilteredPermissions(
                                category.permissions,
                            );

                            if (filteredPermissions.length === 0) return null;

                            return (
                                <div
                                    key={category.categoryKey}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <IconComponent className="h-6 w-6 text-blue-600" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {filteredPermissions.map(
                                            (permission) => {
                                                const isSelected =
                                                    selectedPermissions.includes(
                                                        permission.key,
                                                    );
                                                const isRoleDefault =
                                                    userPermissions.permissions.roleDefaults.includes(
                                                        permission.key,
                                                    );
                                                const isCustom =
                                                    userPermissions.permissions.custom.includes(
                                                        permission.key,
                                                    );

                                                return (
                                                    <div
                                                        key={permission.key}
                                                        className={`
                                                        border rounded-lg p-3 cursor-pointer transition-all
                                                        ${
                                                            isSelected
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }
                                                    `}
                                                        onClick={() =>
                                                            togglePermission(
                                                                permission.key,
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 mt-1">
                                                                <div
                                                                    className={`
                                                                w-4 h-4 rounded border-2 flex items-center justify-center
                                                                ${
                                                                    isSelected
                                                                        ? 'bg-blue-600 border-blue-600'
                                                                        : 'border-gray-300'
                                                                }
                                                            `}
                                                                >
                                                                    {isSelected && (
                                                                        <FaCheck className="h-2 w-2 text-white" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium text-gray-900">
                                                                        {
                                                                            permission.name
                                                                        }
                                                                    </h4>
                                                                    {isRoleDefault && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            Role
                                                                        </span>
                                                                    )}
                                                                    {isCustom && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                            Custom
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {
                                                                        permission.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredCategories?.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                No permissions found matching your search
                                criteria.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PermissionManager;
