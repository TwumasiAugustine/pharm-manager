import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/user.types';
import RoleHierarchyIndicator from '../molecules/RoleHierarchyIndicator';
import {
    FaCrown,
    FaUserTie,
    FaUserMd,
    FaCashRegister,
    FaUsers,
    FaStore,
    FaCogs,
    FaShoppingCart,
} from 'react-icons/fa';

const RoleSystemDemo: React.FC = () => {
    const {
        role,
        canCreateUser,
        canManageUser,
        getUserScope,
        canAccessOperationalFeatures,
    } = usePermissions();

    const [selectedRole, setSelectedRole] = useState<UserRole>(
        UserRole.PHARMACIST,
    );

    const roleFeatures = {
        [UserRole.SUPER_ADMIN]: {
            icon: FaCrown,
            color: 'purple',
            features: [
                { name: 'Manage Pharmacies', icon: FaStore, available: true },
                { name: 'Create Admins', icon: FaUsers, available: true },
                { name: 'System Settings', icon: FaCogs, available: true },
                {
                    name: 'Sales Operations',
                    icon: FaShoppingCart,
                    available: false,
                },
                {
                    name: 'Inventory Management',
                    icon: FaStore,
                    available: false,
                },
            ],
        },
        [UserRole.ADMIN]: {
            icon: FaUserTie,
            color: 'blue',
            features: [
                { name: 'Create Staff', icon: FaUsers, available: true },
                { name: 'Manage Permissions', icon: FaCogs, available: true },
                {
                    name: 'Sales Operations',
                    icon: FaShoppingCart,
                    available: true,
                },
                {
                    name: 'Inventory Management',
                    icon: FaStore,
                    available: true,
                },
                { name: 'System Settings', icon: FaCogs, available: false },
            ],
        },
        [UserRole.PHARMACIST]: {
            icon: FaUserMd,
            color: 'green',
            features: [
                {
                    name: 'Sales Processing',
                    icon: FaShoppingCart,
                    available: true,
                },
                {
                    name: 'Inventory Management',
                    icon: FaStore,
                    available: true,
                },
                { name: 'Customer Management', icon: FaUsers, available: true },
                { name: 'Create Users', icon: FaUsers, available: false },
                { name: 'System Settings', icon: FaCogs, available: false },
            ],
        },
        [UserRole.CASHIER]: {
            icon: FaCashRegister,
            color: 'orange',
            features: [
                {
                    name: 'Sales Processing',
                    icon: FaShoppingCart,
                    available: true,
                },
                { name: 'Customer Service', icon: FaUsers, available: true },
                { name: 'View Inventory', icon: FaStore, available: true },
                { name: 'Manage Inventory', icon: FaStore, available: false },
                { name: 'Create Users', icon: FaUsers, available: false },
            ],
        },
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Role Hierarchy & Permission System
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    This system enforces clear boundaries between system
                    administration and operational features, ensuring proper
                    separation of concerns and security.
                </p>
            </div>

            {/* Current User Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Your Current Access
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {role}
                        </div>
                        <div className="text-sm text-gray-500">Your Role</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {getUserScope()}
                        </div>
                        <div className="text-sm text-gray-500">
                            Access Scope
                        </div>
                    </div>
                    <div className="text-center">
                        <div
                            className={`text-2xl font-bold ${
                                canAccessOperationalFeatures()
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {canAccessOperationalFeatures() ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-gray-500">
                            Operational Access
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Capabilities */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">What You Can Do</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.values(UserRole).map((targetRole) => (
                        <div
                            key={targetRole}
                            className={`p-4 rounded-lg border-2 ${
                                canCreateUser(targetRole)
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                            <div className="text-center">
                                <div
                                    className={`text-lg font-medium ${
                                        canCreateUser(targetRole)
                                            ? 'text-green-700'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {targetRole.replace('_', ' ')}
                                </div>
                                <div className="text-sm mt-2">
                                    {canCreateUser(targetRole) ? (
                                        <span className="text-green-600 font-medium">
                                            ✓ Can Create
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">
                                            ✗ Cannot Create
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Feature Access by Role
                </h2>
                <div className="space-y-4">
                    {Object.entries(roleFeatures).map(([roleType, config]) => (
                        <div key={roleType} className="border rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <config.icon
                                    className={`h-6 w-6 text-${config.color}-600 mr-3`}
                                />
                                <h3 className="text-lg font-medium">
                                    {roleType.replace('_', ' ')}
                                </h3>
                                {role === roleType && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        Your Role
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {config.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-2 p-2 rounded ${
                                            feature.available
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                        }`}
                                    >
                                        <feature.icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {feature.available ? '✓' : '✗'}
                                        </span>
                                        <span className="text-xs">
                                            {feature.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Role Hierarchy Visualization */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Role Hierarchy</h2>
                <RoleHierarchyIndicator
                    currentUserRole={role as UserRole}
                    showDescription={true}
                    size="md"
                />
            </div>

            {/* Interactive Demo */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Test User Management
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select a role to test management permissions:
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) =>
                                setSelectedRole(e.target.value as UserRole)
                            }
                            className="border rounded px-3 py-2"
                        >
                            {Object.values(UserRole).map((roleOption) => (
                                <option key={roleOption} value={roleOption}>
                                    {roleOption.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <strong>Can you create this user?</strong>
                                <div
                                    className={`mt-1 ${
                                        canCreateUser(selectedRole)
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {canCreateUser(selectedRole)
                                        ? '✓ Yes'
                                        : '✗ No'}
                                </div>
                            </div>
                            <div>
                                <strong>Can you manage this user?</strong>
                                <div
                                    className={`mt-1 ${
                                        canManageUser(selectedRole)
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    {canManageUser(selectedRole)
                                        ? '✓ Yes'
                                        : '✗ No'}
                                </div>
                            </div>
                        </div>

                        {(canCreateUser(selectedRole) ||
                            canManageUser(selectedRole)) && (
                            <div className="mt-3 p-3 bg-green-100 rounded text-green-800 text-sm">
                                <strong>Available Actions:</strong>
                                <ul className="mt-1 list-disc list-inside">
                                    {canCreateUser(selectedRole) && (
                                        <li>Create new {selectedRole} users</li>
                                    )}
                                    {canManageUser(selectedRole) && (
                                        <li>
                                            Edit {selectedRole} user details
                                        </li>
                                    )}
                                    {canManageUser(selectedRole) && (
                                        <li>
                                            Assign permissions to {selectedRole}{' '}
                                            users
                                        </li>
                                    )}
                                    {canManageUser(selectedRole) && (
                                        <li>Deactivate {selectedRole} users</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {!canCreateUser(selectedRole) &&
                            !canManageUser(selectedRole) && (
                                <div className="mt-3 p-3 bg-red-100 rounded text-red-800 text-sm">
                                    You don't have permission to create or
                                    manage {selectedRole} users.
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSystemDemo;
