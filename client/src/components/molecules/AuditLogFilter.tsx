import React, { useState } from 'react';
import { FiCalendar, FiFilter, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import type { AuditLogFilters } from '../../types/audit-log.types';

interface AuditLogFilterProps {
    filters: AuditLogFilters;
    onFiltersChange: (filters: AuditLogFilters) => void;
    onRefresh: () => void;
    onCleanup?: () => void;
    isLoading?: boolean;
}

export const AuditLogFilter: React.FC<AuditLogFilterProps> = ({
    filters,
    onFiltersChange,
    onRefresh,
    onCleanup,
    isLoading = false,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value,
            page: 1, // Reset to first page when filters change
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            page: 1,
            limit: filters.limit || 20,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiFilter className="h-5 w-5 mr-2" />
                    Audit Log Filters
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        <FiRefreshCw
                            className={`h-4 w-4 mr-2 ${
                                isLoading ? 'animate-spin' : ''
                            }`}
                        />
                        Refresh
                    </button>
                    {onCleanup && (
                        <button
                            onClick={onCleanup}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                            <FiTrash2 className="h-4 w-4 mr-2" />
                            Cleanup
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Action Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action
                    </label>
                    <select
                        value={filters.action || ''}
                        onChange={(e) =>
                            handleFilterChange(
                                'action',
                                e.target.value || undefined,
                            )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="VIEW">View</option>
                    </select>
                </div>

                {/* Resource Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource
                    </label>
                    <select
                        value={filters.resource || ''}
                        onChange={(e) =>
                            handleFilterChange(
                                'resource',
                                e.target.value || undefined,
                            )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Resources</option>
                        <option value="USER">User</option>
                        <option value="DRUG">Drug</option>
                        <option value="SALE">Sale</option>
                        <option value="CUSTOMER">Customer</option>
                        <option value="REPORT">Report</option>
                        <option value="SYSTEM">System</option>
                    </select>
                </div>

                {/* User Role Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Role
                    </label>
                    <select
                        value={filters.userRole || ''}
                        onChange={(e) =>
                            handleFilterChange(
                                'userRole',
                                e.target.value || undefined,
                            )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="PHARMACIST">Pharmacist</option>
                        <option value="CASHIER">Cashier</option>
                    </select>
                </div>

                {/* Limit Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items per page
                    </label>
                    <select
                        value={filters.limit || 20}
                        onChange={(e) =>
                            handleFilterChange('limit', Number(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Date Range Filters */}
            <div className="border-t pt-4">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
                >
                    <FiCalendar className="h-4 w-4 mr-2" />
                    Date Range Filters
                    <span className="ml-2">
                        {showAdvanced ? '−' : '+'}
                    </span>
                </button>

                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'startDate',
                                        e.target.value || undefined,
                                    )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'endDate',
                                        e.target.value || undefined,
                                    )
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Clear Filters */}
            <div className="border-t pt-4">
                <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

export default AuditLogFilter;
