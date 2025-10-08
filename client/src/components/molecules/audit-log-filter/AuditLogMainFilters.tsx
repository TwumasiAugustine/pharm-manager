import React from 'react';
import {
    FiSettings,
    FiUser,
    FiMapPin,
    FiChevronDown,
    FiFilter,
} from 'react-icons/fi';
import type { AuditLogFilters } from '../../../types/audit-log.types';
import type { Branch } from '../../../types/branch.types';

interface AuditLogMainFiltersProps {
    filters: AuditLogFilters;
    branches?: Branch[];
    onFilterChange: (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => void;
}

export const AuditLogMainFilters: React.FC<AuditLogMainFiltersProps> = ({
    filters,
    branches,
    onFilterChange,
}) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FiFilter className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                    Main Filters
                </h4>
                <div className="flex-1 border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Action Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="action-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiSettings className="mr-2 h-4 w-4 text-blue-500" />
                        Action Type
                    </label>
                    <div className="relative">
                        <select
                            id="action-filter"
                            value={filters.action || ''}
                            onChange={(e) =>
                                onFilterChange(
                                    'action',
                                    e.target.value || undefined,
                                )
                            }
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="VIEW">View</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Resource Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="resource-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiSettings className="mr-2 h-4 w-4 text-purple-500" />
                        Resource Type
                    </label>
                    <div className="relative">
                        <select
                            id="resource-filter"
                            value={filters.resource || ''}
                            onChange={(e) =>
                                onFilterChange(
                                    'resource',
                                    e.target.value || undefined,
                                )
                            }
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Resources</option>
                            <option value="USER">User</option>
                            <option value="DRUG">Drug</option>
                            <option value="SALE">Sale</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="REPORT">Report</option>
                            <option value="SYSTEM">System</option>
                            <option value="BRANCH">Branch</option>
                            <option value="PHARMACY">Pharmacy</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Branch Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="branch-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiMapPin className="mr-2 h-4 w-4 text-green-500" />
                        Branch
                    </label>
                    <div className="relative">
                        <select
                            id="branch-filter"
                            value={filters.branchId || ''}
                            onChange={(e) =>
                                onFilterChange(
                                    'branchId',
                                    e.target.value || undefined,
                                )
                            }
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Branches</option>
                            {branches?.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* User Role Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="user-role-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiUser className="mr-2 h-4 w-4 text-indigo-500" />
                        User Role
                    </label>
                    <div className="relative">
                        <select
                            id="user-role-filter"
                            value={filters.userRole || ''}
                            onChange={(e) =>
                                onFilterChange(
                                    'userRole',
                                    e.target.value || undefined,
                                )
                            }
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="cashier">Cashier</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};
