import React from 'react';
import {
    FiSettings,
    FiCalendar,
    FiUser,
    FiHome,
    FiMapPin,
    FiChevronDown,
} from 'react-icons/fi';
import type { AuditLogFilters } from '../../../types/audit-log.types';

interface AuditLogAdvancedFiltersProps {
    filters: AuditLogFilters;
    branches: Array<{ _id: string; name: string }>;
    onFilterChange: (
        key: keyof AuditLogFilters,
        value: string | number | undefined,
    ) => void;
}

export const AuditLogAdvancedFilters: React.FC<
    AuditLogAdvancedFiltersProps
> = ({ filters, branches, onFilterChange }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FiSettings className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                    Main Filters
                </h4>
                <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Action Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="action-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiSettings className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
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
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="VIEW">View</option>
                        </select>
                        <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Resource Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="resource-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiSettings className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
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
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Resources</option>
                            <option value="USER">User</option>
                            <option value="DRUG">Drug</option>
                            <option value="SALE">Sale</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="REPORT">Report</option>
                            <option value="PHARMACY">Pharmacy</option>
                            <option value="SYSTEM">System</option>
                        </select>
                        <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* User Role Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="userRole-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiUser className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        User Role
                    </label>
                    <div className="relative">
                        <select
                            id="userRole-filter"
                            value={filters.userRole || ''}
                            onChange={(e) =>
                                onFilterChange(
                                    'userRole',
                                    e.target.value || undefined,
                                )
                            }
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="cashier">Cashier</option>
                        </select>
                        <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Branch Filter */}
                <div className="space-y-2">
                    <label
                        htmlFor="branch-filter"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiMapPin className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
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
                            className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                        >
                            <option value="">All Branches</option>
                            {branches?.map((branch) => (
                                <option key={branch._id} value={branch._id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                        <FiChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <label
                        htmlFor="startDate"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiCalendar className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        Start Date
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        value={
                            filters.startDate
                                ? filters.startDate.split('T')[0]
                                : ''
                        }
                        onChange={(e) =>
                            onFilterChange('startDate', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                    />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label
                        htmlFor="endDate"
                        className="flex items-center text-xs sm:text-sm font-semibold text-gray-700"
                    >
                        <FiCalendar className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        End Date
                    </label>
                    <input
                        type="date"
                        id="endDate"
                        value={
                            filters.endDate
                                ? filters.endDate.split('T')[0]
                                : ''
                        }
                        onChange={(e) =>
                            onFilterChange('endDate', e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};
