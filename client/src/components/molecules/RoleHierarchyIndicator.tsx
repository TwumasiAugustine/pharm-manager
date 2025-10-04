import React from 'react';
import { FaCrown, FaUserTie, FaUserMd, FaCashRegister } from 'react-icons/fa';
import { UserRole } from '../../types/user.types';

interface RoleHierarchyIndicatorProps {
    currentUserRole: UserRole;
    targetUserRole?: UserRole;
    showDescription?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const RoleHierarchyIndicator: React.FC<RoleHierarchyIndicatorProps> = ({
    currentUserRole,
    targetUserRole,
    showDescription = false,
    size = 'md',
}) => {
    const roles = [
        {
            role: UserRole.SUPER_ADMIN,
            label: 'Super Admin',
            icon: FaCrown,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            level: 4,
            scope: 'System',
            description:
                'Manages pharmacies and assigns admins. System-level access only.',
        },
        {
            role: UserRole.ADMIN,
            label: 'Admin',
            icon: FaUserTie,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            level: 3,
            scope: 'Pharmacy',
            description:
                'Creates staff and manages all operational features within pharmacy.',
        },
        {
            role: UserRole.PHARMACIST,
            label: 'Pharmacist',
            icon: FaUserMd,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            level: 2,
            scope: 'Branch',
            description:
                'Handles inventory, sales, and customer management. Can be branch manager.',
        },
        {
            role: UserRole.CASHIER,
            label: 'Cashier',
            icon: FaCashRegister,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            level: 1,
            scope: 'Branch',
            description: 'Processes sales and manages customer interactions.',
        },
    ];

    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const currentRole = roles.find((r) => r.role === currentUserRole);
    const targetRole = targetUserRole
        ? roles.find((r) => r.role === targetUserRole)
        : null;

    const canManage = (managerLevel: number, targetLevel: number) => {
        return managerLevel > targetLevel;
    };

    if (!currentRole) {
        return <div>Invalid role</div>;
    }

    return (
        <div className="space-y-4">
            {/* Current User Role */}
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${currentRole?.bgColor}`}>
                    {currentRole?.icon && (
                        <currentRole.icon
                            className={`${iconSizes[size]} ${currentRole.color}`}
                        />
                    )}
                </div>
                <div>
                    <div
                        className={`font-semibold ${currentRole?.color} ${sizeClasses[size]}`}
                    >
                        {currentRole?.label} (You)
                    </div>
                    <div className="text-xs text-gray-500">
                        {currentRole?.scope} Level
                    </div>
                </div>
            </div>

            {/* Role Hierarchy */}
            {showDescription && (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                        Role Hierarchy & Permissions
                    </h4>
                    <div className="space-y-2">
                        {roles.map((role) => (
                            <div
                                key={role.role}
                                className={`flex items-start space-x-3 p-3 rounded-lg border ${
                                    role.role === currentUserRole
                                        ? 'border-blue-300 bg-blue-50'
                                        : 'border-gray-200'
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-full ${role.bgColor} flex-shrink-0`}
                                >
                                    <role.icon
                                        className={`${iconSizes[size]} ${role.color}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`font-medium ${role.color}`}
                                        >
                                            {role.label}
                                        </span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            Level {role.level}
                                        </span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {role.scope}
                                        </span>
                                        {role.role === currentUserRole && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Your Role
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {role.description}
                                    </p>

                                    {/* Show management relationships */}
                                    {currentRole &&
                                        role.role !== currentUserRole && (
                                            <div className="mt-2 text-xs">
                                                {canManage(
                                                    currentRole.level,
                                                    role.level,
                                                ) ? (
                                                    <span className="text-green-600 font-medium">
                                                        ✓ You can create and
                                                        manage this role
                                                    </span>
                                                ) : canManage(
                                                      role.level,
                                                      currentRole.level,
                                                  ) ? (
                                                    <span className="text-orange-600 font-medium">
                                                        ⚠ This role can manage
                                                        you
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        → Same level access
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Target User Comparison */}
            {targetRole && (
                <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                        Management Relationship
                    </h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <currentRole.icon
                                className={`h-5 w-5 ${currentRole.color}`}
                            />
                            <span className="font-medium">
                                {currentRole.label}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {canManage(currentRole.level, targetRole.level) ? (
                                <span className="text-green-600 font-medium">
                                    Can Manage
                                </span>
                            ) : (
                                <span className="text-red-600 font-medium">
                                    Cannot Manage
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <targetRole.icon
                                className={`h-5 w-5 ${targetRole.color}`}
                            />
                            <span className="font-medium">
                                {targetRole.label}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleHierarchyIndicator;
