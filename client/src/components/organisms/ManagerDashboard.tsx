import React from 'react';
import { PermissionGuard } from '../atoms/PermissionGuard';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSION_KEYS } from '../../types/permission.types';
import { Button } from '../atoms/Button';
import {
    FaUsers,
    FaChartBar,
    FaPercentage,
    FaDollarSign,
    FaUndo,
    FaBoxes,
    FaCalendarAlt,
    FaTrophy,
} from 'react-icons/fa';

/**
 * Manager Dashboard Component
 * Demonstrates how to use manager permissions with existing PermissionGuard
 */
export const ManagerDashboard: React.FC = () => {
    const {
        isManager,
        canActAsManager,
        canManageBranchStaff,
        canViewBranchAnalytics,
        canApproveDiscounts,
        canOverridePrices,
        canApproveRefunds,
        canManageBranchInventory,
        canManageShiftSchedules,
        canViewStaffPerformance,
    } = usePermissions();

    if (!isManager()) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600">Manager access required.</p>
            </div>
        );
    }

    if (!canActAsManager()) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600">
                    You must be assigned to a branch to access manager features.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <FaTrophy className="mr-3 text-yellow-500" />
                    Manager Dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                    Welcome to your manager dashboard. Here are your available
                    privileges:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Staff Management */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.MANAGE_BRANCH_STAFF}
                    >
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-3">
                                <FaUsers className="text-blue-600 mr-2" />
                                <h3 className="font-semibold text-blue-800">
                                    Staff Management
                                </h3>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">
                                Manage your branch staff and assignments
                            </p>
                            <Button
                                color="primary"
                                disabled={!canManageBranchStaff()}
                            >
                                Manage Staff
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Branch Analytics */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.VIEW_BRANCH_ANALYTICS}
                    >
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center mb-3">
                                <FaChartBar className="text-green-600 mr-2" />
                                <h3 className="font-semibold text-green-800">
                                    Branch Analytics
                                </h3>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                                View detailed performance metrics
                            </p>
                            <Button
                                color="success"
                                disabled={!canViewBranchAnalytics()}
                            >
                                View Analytics
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Discount Approval */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.APPROVE_DISCOUNTS}
                    >
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center mb-3">
                                <FaPercentage className="text-purple-600 mr-2" />
                                <h3 className="font-semibold text-purple-800">
                                    Discount Approval
                                </h3>
                            </div>
                            <p className="text-sm text-purple-700 mb-3">
                                Approve special discounts and promotions
                            </p>
                            <Button
                                color="warning"
                                disabled={!canApproveDiscounts()}
                            >
                                Approve Discounts
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Price Override */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.OVERRIDE_PRICES}
                    >
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="flex items-center mb-3">
                                <FaDollarSign className="text-yellow-600 mr-2" />
                                <h3 className="font-semibold text-yellow-800">
                                    Price Override
                                </h3>
                            </div>
                            <p className="text-sm text-yellow-700 mb-3">
                                Override system prices when necessary
                            </p>
                            <Button
                                color="warning"
                                disabled={!canOverridePrices()}
                            >
                                Override Prices
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Refund Approval */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.APPROVE_REFUNDS}
                    >
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center mb-3">
                                <FaUndo className="text-red-600 mr-2" />
                                <h3 className="font-semibold text-red-800">
                                    Refund Approval
                                </h3>
                            </div>
                            <p className="text-sm text-red-700 mb-3">
                                Approve refund requests and returns
                            </p>
                            <Button
                                color="danger"
                                disabled={!canApproveRefunds()}
                            >
                                Approve Refunds
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Inventory Management */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.MANAGE_BRANCH_INVENTORY}
                    >
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <div className="flex items-center mb-3">
                                <FaBoxes className="text-indigo-600 mr-2" />
                                <h3 className="font-semibold text-indigo-800">
                                    Inventory Control
                                </h3>
                            </div>
                            <p className="text-sm text-indigo-700 mb-3">
                                Full inventory control for your branch
                            </p>
                            <Button
                                color="primary"
                                disabled={!canManageBranchInventory()}
                            >
                                Manage Inventory
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Schedule Management */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.MANAGE_SHIFT_SCHEDULES}
                    >
                        <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                            <div className="flex items-center mb-3">
                                <FaCalendarAlt className="text-teal-600 mr-2" />
                                <h3 className="font-semibold text-teal-800">
                                    Schedule Management
                                </h3>
                            </div>
                            <p className="text-sm text-teal-700 mb-3">
                                Create and manage staff schedules
                            </p>
                            <Button
                                color="info"
                                disabled={!canManageShiftSchedules()}
                            >
                                Manage Schedules
                            </Button>
                        </div>
                    </PermissionGuard>

                    {/* Staff Performance */}
                    <PermissionGuard
                        permission={PERMISSION_KEYS.VIEW_STAFF_PERFORMANCE}
                    >
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center mb-3">
                                <FaTrophy className="text-orange-600 mr-2" />
                                <h3 className="font-semibold text-orange-800">
                                    Staff Performance
                                </h3>
                            </div>
                            <p className="text-sm text-orange-700 mb-3">
                                View staff performance metrics
                            </p>
                            <Button
                                color="warning"
                                disabled={!canViewStaffPerformance()}
                            >
                                View Performance
                            </Button>
                        </div>
                    </PermissionGuard>
                </div>
            </div>

            {/* Manager-only content example */}
            <PermissionGuard
                permissions={[
                    PERMISSION_KEYS.MANAGE_BRANCH_STAFF,
                    PERMISSION_KEYS.VIEW_BRANCH_ANALYTICS,
                ]}
                requireAll={false}
                fallback={
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">
                            Additional manager features will appear here when
                            you have the required permissions.
                        </p>
                    </div>
                }
            >
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                        Manager Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <Button color="primary">View Today's Sales</Button>
                        <Button color="secondary">Staff Check-in</Button>
                        <Button color="info">Inventory Alerts</Button>
                        <Button color="success">Performance Report</Button>
                    </div>
                </div>
            </PermissionGuard>
        </div>
    );
};

export default ManagerDashboard;
